import React from 'react';

/**
 * Two-bone IK arms for the borrower. A pose is just a wrist target per arm plus a hand shape;
 * the elbow is solved every frame, so interpolating wrist targets gives smooth, natural motion.
 * Hands are drawn in a local frame (wrist at origin, fingers along +y) and follow the forearm.
 */

export type Pt = [number, number];
export type HandShape = 'relaxed' | 'fist' | 'open' | 'point' | 'thumb' | 'grip' | 'flat';
export type Held = 'phone' | 'card' | 'letter' | null;
export type Bend = 'out' | 'in' | 'down' | 'up';
export type ArmPose = {wr: Pt; hand: HandShape; rot?: number; held?: Held; bend?: Bend};
export type ArmsPose = {L: ArmPose; R: ArmPose; front?: 'L' | 'R'; bill?: boolean};

export const SHOULDER: Record<'L' | 'R', Pt> = {L: [172, 596], R: [428, 596]};
const UPPER = 150;
const FORE = 145;

const SHIRT = '#2E4F96';
const SHIRT_HI = '#4A6DB8';
const SHIRT_SH = '#1F3A73';
const SHIRT_DEEP = '#172C5A';
const NAIL = '#F2CDB8';
const KNUCKLE = '#9A6A4E';

const DOWN_L: ArmPose = {wr: [150, 872], hand: 'relaxed', bend: 'out'};
const DOWN_R: ArmPose = {wr: [450, 872], hand: 'relaxed', bend: 'out'};

export const POSES = {
  down: {L: DOWN_L, R: DOWN_R},
  crossed: {L: {wr: [374, 652], hand: 'flat', rot: -8, bend: 'down'}, R: {wr: [238, 690], hand: 'flat', rot: 10, bend: 'down'}, front: 'L'},
  chin: {L: DOWN_L, R: {wr: [336, 508], hand: 'fist', rot: 8, bend: 'out'}},
  palm: {L: DOWN_L, R: {wr: [516, 566], hand: 'open', rot: -6, bend: 'down'}},
  thumbsUp: {L: DOWN_L, R: {wr: [490, 604], hand: 'thumb', bend: 'down'}},
  phone: {L: DOWN_L, R: {wr: [458, 432], hand: 'grip', held: 'phone', rot: 22, bend: 'out'}},
  scratch: {L: DOWN_L, R: {wr: [446, 296], hand: 'fist', rot: 140, bend: 'out'}},
  cheeks: {L: {wr: [216, 436], hand: 'open', rot: 8, bend: 'down'}, R: {wr: [384, 436], hand: 'open', rot: -8, bend: 'down'}},
  paper: {L: {wr: [242, 652], hand: 'grip', bend: 'down'}, R: {wr: [358, 652], hand: 'grip', bend: 'down'}, bill: true},
  point: {L: DOWN_L, R: {wr: [570, 566], hand: 'point', bend: 'down'}},
  wave: {L: DOWN_L, R: {wr: [506, 420], hand: 'open', rot: -10, bend: 'down'}},
  card: {L: DOWN_L, R: {wr: [474, 566], hand: 'grip', held: 'card', rot: -20, bend: 'down'}},
  letter: {L: DOWN_L, R: {wr: [470, 570], hand: 'grip', held: 'letter', rot: -16, bend: 'down'}},
  letterThumb: {L: {wr: [124, 612], hand: 'thumb', bend: 'down'}, R: {wr: [470, 570], hand: 'grip', held: 'letter', rot: -16, bend: 'down'}},
} satisfies Record<string, ArmsPose>;

export type PoseName = keyof typeof POSES;

/** solve the elbow for a shoulder S, wrist target T */
export const solveElbow = (S: Pt, T: Pt, bend: Bend = 'out'): {E: Pt; W: Pt} => {
  const dx = T[0] - S[0];
  const dy = T[1] - S[1];
  const dist = Math.hypot(dx, dy);
  const d = Math.min(Math.max(dist, Math.abs(UPPER - FORE) + 1), UPPER + FORE - 0.5);
  const th = Math.atan2(dy, dx);
  const a = Math.acos((UPPER * UPPER + d * d - FORE * FORE) / (2 * UPPER * d));
  const c1: Pt = [S[0] + UPPER * Math.cos(th + a), S[1] + UPPER * Math.sin(th + a)];
  const c2: Pt = [S[0] + UPPER * Math.cos(th - a), S[1] + UPPER * Math.sin(th - a)];
  const pick = (score: (p: Pt) => number) => (score(c1) >= score(c2) ? c1 : c2);
  const E =
    bend === 'down' ? pick((p) => p[1]) : bend === 'up' ? pick((p) => -p[1]) : bend === 'in' ? pick((p) => -Math.abs(p[0] - 300)) : pick((p) => Math.abs(p[0] - 300));
  const W: Pt = [S[0] + (dx / dist) * d, S[1] + (dy / dist) * d];
  return {E, W};
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpPt = (a: Pt, b: Pt, t: number): Pt => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

/** blend two arm poses; discrete parts (hand shape, held prop) switch at the midpoint */
export const blendArms = (a: ArmsPose, b: ArmsPose, t: number): ArmsPose => {
  const arm = (x: ArmPose, y: ArmPose): ArmPose => {
    // lift the hand slightly through the middle of the move so it travels in an arc
    const wr = lerpPt(x.wr, y.wr, t);
    wr[1] -= Math.sin(t * Math.PI) * Math.min(40, Math.hypot(x.wr[0] - y.wr[0], x.wr[1] - y.wr[1]) * 0.15);
    return {wr, hand: t < 0.5 ? x.hand : y.hand, rot: lerp(x.rot ?? 0, y.rot ?? 0, t), held: t < 0.5 ? x.held : y.held, bend: t < 0.5 ? x.bend : y.bend};
  };
  return {L: arm(a.L, b.L), R: arm(a.R, b.R), front: t < 0.5 ? a.front : b.front, bill: t < 0.5 ? a.bill : b.bill};
};

/* ---------------- drawing ---------------- */

const deg = (r: number) => (r * 180) / Math.PI;

export const ArmsLayer: React.FC<{arms: ArmsPose; id: string; lift?: number; handScale?: number}> = ({arms, id, lift = 0}) => {
  const order: Array<'L' | 'R'> = arms.front === 'R' ? ['L', 'R'] : arms.front === 'L' ? ['R', 'L'] : ['L', 'R'];
  return (
    <g>
      {order.map((side) => (
        <OneArm key={side} side={side} pose={arms[side]} id={id} lift={lift} />
      ))}
      {arms.bill && <Bill L={solveElbow(SHOULDER.L, arms.L.wr, arms.L.bend).W} R={solveElbow(SHOULDER.R, arms.R.wr, arms.R.bend).W} id={id} />}
    </g>
  );
};

const OneArm: React.FC<{side: 'L' | 'R'; pose: ArmPose; id: string; lift: number}> = ({side, pose, id, lift}) => {
  const S: Pt = [SHOULDER[side][0], SHOULDER[side][1] - lift];
  const {E, W} = solveElbow(S, pose.wr, pose.bend);
  const up = `M${S[0]} ${S[1]} L${E[0]} ${E[1]}`;
  const fore = `M${E[0]} ${E[1]} L${W[0]} ${W[1]}`;
  const both = `M${S[0]} ${S[1]} L${E[0]} ${E[1]} L${W[0]} ${W[1]}`;
  const fx = W[0] - E[0];
  const fy = W[1] - E[1];
  const fl = Math.hypot(fx, fy) || 1;
  const angle = deg(Math.atan2(fy, fx)) - 90 + (pose.rot ?? 0) * (side === 'L' ? -1 : 1);
  // how sharply the elbow is bent (0 straight .. 1 folded) drives the crease folds
  const ux = E[0] - S[0];
  const uy = E[1] - S[1];
  const bendAmt = 1 - (ux * fx + uy * fy) / (Math.hypot(ux, uy) * fl + 1e-6) / 2 - 0.5;
  const cuffA: Pt = [W[0] - (fx / fl) * 20, W[1] - (fy / fl) * 20];
  const mid = `${id}arm${side}`;
  return (
    <g>
      <mask id={mid}>
        <path d={up} stroke="#fff" strokeWidth={64} strokeLinecap="round" fill="none" />
        <path d={fore} stroke="#fff" strokeWidth={56} strokeLinecap="round" fill="none" />
      </mask>
      {/* outline */}
      <path d={up} stroke={SHIRT_DEEP} strokeWidth={70} strokeLinecap="round" fill="none" />
      <path d={fore} stroke={SHIRT_DEEP} strokeWidth={62} strokeLinecap="round" fill="none" />
      {/* cloth */}
      <path d={up} stroke={`url(#${id}sleeve)`} strokeWidth={64} strokeLinecap="round" fill="none" />
      <path d={fore} stroke={`url(#${id}sleeve)`} strokeWidth={56} strokeLinecap="round" fill="none" />
      {/* volume: shadow on the far side, highlight on the near side */}
      <g mask={`url(#${mid})`}>
        <path d={both} transform="translate(12 10)" stroke={SHIRT_DEEP} strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.55} filter={`url(#${id}soft)`} />
        <path d={both} transform="translate(-11 -9)" stroke={SHIRT_HI} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.55} filter={`url(#${id}soft2)`} />
        {/* elbow folds appear as the arm bends */}
        {bendAmt > 0.15 && (
          <g stroke={SHIRT_DEEP} strokeWidth={3} fill="none" opacity={Math.min(0.8, bendAmt)} strokeLinecap="round">
            <path d={`M${E[0] - 18} ${E[1] - 6} q18 12 36 -2`} />
            <path d={`M${E[0] - 12} ${E[1] + 8} q12 8 24 0`} />
          </g>
        )}
      </g>
      {/* cuff */}
      <path d={`M${cuffA[0]} ${cuffA[1]} L${W[0]} ${W[1]}`} stroke={SHIRT_DEEP} strokeWidth={62} strokeLinecap="butt" fill="none" />
      <path d={`M${cuffA[0]} ${cuffA[1]} L${W[0]} ${W[1]}`} stroke={SHIRT_SH} strokeWidth={56} strokeLinecap="butt" fill="none" />
      <circle cx={(cuffA[0] + W[0]) / 2} cy={(cuffA[1] + W[1]) / 2} r={3.5} fill={SHIRT_HI} />
      <g transform={`translate(${W[0]} ${W[1]}) rotate(${angle}) scale(${side === 'L' ? -1 : 1} 1)`}>
        <Hand shape={pose.hand} held={pose.held ?? null} id={id} />
      </g>
    </g>
  );
};

/** local frame: wrist at (0,0), fingers grow along +y, thumb on the -x side */
export const Hand: React.FC<{shape: HandShape; held: Held; id: string}> = ({shape, held, id}) => {
  const skin = {fill: `url(#${id}skinBall)`, stroke: KNUCKLE, strokeWidth: 2.4, strokeLinejoin: 'round' as const};
  const palm = <path d="M-24 2 C-28 20 -26 40 -18 50 L18 50 C26 40 28 20 24 2 Z" {...skin} />;
  const finger = (x: number, len: number, ang = 0, w = 12.5) => (
    <g transform={`translate(${x} 44) rotate(${ang})`}>
      <rect x={-w / 2} y={0} width={w} height={len} rx={w / 2} {...skin} />
      <path d={`M${-w / 2 + 2} ${len * 0.5} q${w / 2 - 2} 3 ${w - 4} 0`} stroke={KNUCKLE} strokeWidth={1.4} fill="none" opacity={0.6} />
      <rect x={-w / 2 + 2.5} y={len - 9} width={w - 5} height={6} rx={3} fill={NAIL} opacity={0.85} />
    </g>
  );
  const knuckles = (
    <g>
      {[-16, -5.5, 5.5, 16].map((x, i) => (
        <rect key={x} x={x - 6.5} y={36 + (i === 0 || i === 3 ? 2 : 0)} width={13} height={24} rx={6.5} {...skin} />
      ))}
    </g>
  );
  const fistBody = (
    <g>
      <rect x={-26} y={2} width={52} height={50} rx={19} {...skin} />
      {knuckles}
    </g>
  );
  const thumbAcross = <rect x={-28} y={22} width={36} height={15} rx={7.5} transform="rotate(-12 -10 30)" {...skin} />;
  const heldBack = held === 'phone' ? <Phone /> : held === 'card' ? <Card /> : held === 'letter' ? <Letter /> : null;
  switch (shape) {
    case 'fist':
      return (
        <g>
          {fistBody}
          {thumbAcross}
        </g>
      );
    case 'thumb':
      return (
        <g>
          <rect x={-26} y={2} width={52} height={48} rx={19} {...skin} />
          {[12, 24, 36].map((y) => (
            <path key={y} d={`M-24 ${y} L18 ${y}`} stroke={KNUCKLE} strokeWidth={1.8} opacity={0.6} />
          ))}
          <g transform="translate(-4 46)">
            <rect x={-9} y={0} width={20} height={44} rx={10} {...skin} />
            <rect x={-5} y={32} width={12} height={8} rx={4} fill={NAIL} />
          </g>
        </g>
      );
    case 'point':
      return (
        <g>
          {fistBody}
          {finger(10, 56, -4, 13)}
          {thumbAcross}
        </g>
      );
    case 'open':
      return (
        <g>
          {palm}
          {finger(-17, 40, 9)}
          {finger(-6, 47, 3)}
          {finger(6, 48, -2)}
          {finger(17, 41, -8)}
          <g transform="translate(-22 18) rotate(48)">
            <rect x={-7} y={0} width={15} height={36} rx={7.5} {...skin} />
          </g>
          <path d="M-12 28 Q0 34 12 28" stroke={KNUCKLE} strokeWidth={1.6} fill="none" opacity={0.6} />
        </g>
      );
    case 'flat':
      return (
        <g>
          <rect x={-24} y={2} width={48} height={44} rx={17} {...skin} />
          {[-12, 0, 12].map((x) => (
            <rect key={x} x={x - 6.5} y={34} width={13} height={30} rx={6.5} {...skin} />
          ))}
        </g>
      );
    case 'grip':
      return (
        <g>
          {heldBack}
          <rect x={-26} y={2} width={52} height={44} rx={18} {...skin} />
          {[-16, -5.5, 5.5, 16].map((x) => (
            <rect key={x} x={x - 6.5} y={30} width={13} height={22} rx={6.5} {...skin} />
          ))}
          <rect x={-30} y={18} width={16} height={34} rx={8} transform="rotate(-20 -22 30)" {...skin} />
        </g>
      );
    case 'relaxed':
    default:
      return (
        <g>
          {palm}
          {finger(-16, 30, 14)}
          {finger(-5, 36, 6)}
          {finger(6, 36, -1)}
          {finger(16, 30, -8)}
          <g transform="translate(-22 14) rotate(28)">
            <rect x={-7} y={0} width={15} height={32} rx={7.5} {...skin} />
          </g>
        </g>
      );
  }
};

/* held props, in the hand's local frame (they extend beyond the fingers, along +y) */
const Phone: React.FC = () => (
  <g transform="translate(4 20) rotate(-6)">
    <rect x={-26} y={0} width={52} height={104} rx={11} fill="#0F172A" stroke="#05080F" strokeWidth={3} />
    <rect x={-21} y={8} width={42} height={88} rx={7} fill="#1E3A8A" />
    <rect x={-21} y={8} width={42} height={30} rx={7} fill="#fff" opacity={0.12} />
    <circle cx={0} cy={96} r={2.5} fill="#334155" />
  </g>
);

const Card: React.FC = () => (
  <g transform="translate(0 46) rotate(90)">
    <rect x={-6} y={-46} width={92} height={58} rx={7} fill="#1D4ED8" stroke="#0B1F5C" strokeWidth={2} />
    <rect x={6} y={-34} width={16} height={12} rx={2} fill="#F5B942" />
    <rect x={6} y={-6} width={60} height={5} rx={2.5} fill="#BFDBFE" opacity={0.8} />
    <rect x={-6} y={-46} width={92} height={20} rx={7} fill="#fff" opacity={0.12} />
  </g>
);

const Letter: React.FC = () => (
  <g transform="translate(-10 30) rotate(4)">
    <rect x={-30} y={0} width={124} height={160} rx={5} fill="#FDFCF7" stroke="#CBD5E1" strokeWidth={2} />
    <rect x={-20} y={12} width={60} height={8} rx={4} fill="#1E3A8A" />
    {[30, 44, 58, 72].map((y, i) => (
      <rect key={y} x={-20} y={y} width={96 - i * 10} height={6} rx={3} fill="#D6D3D1" />
    ))}
    <g transform="translate(62 118) rotate(-12)">
      <rect x={-40} y={-16} width={80} height={32} rx={5} fill="none" stroke="#059669" strokeWidth={4} />
      <text x={0} y={7} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={900} fontSize={17} fill="#059669">SETTLED</text>
    </g>
  </g>
);

/** the overdue bill held in both hands (world coords between the wrists) */
const Bill: React.FC<{L: Pt; R: Pt; id: string}> = ({L, R, id}) => {
  const cx = (L[0] + R[0]) / 2;
  const top = Math.min(L[1], R[1]) - 120;
  const tilt = deg(Math.atan2(R[1] - L[1], R[0] - L[0]));
  return (
    <g transform={`rotate(${tilt - 4} ${cx} ${top + 110})`}>
      <rect x={cx - 92} y={top} width={184} height={216} rx={6} fill="#FDFCF7" stroke="#CBD5E1" strokeWidth={2} />
      <text x={cx} y={top + 38} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={900} fontSize={22} fill="#B91C1C">OVERDUE</text>
      {[62, 82, 102, 122].map((y, i) => (
        <rect key={y} x={cx - 72} y={top + y} width={140 - i * 18} height={8} rx={4} fill="#D6D3D1" />
      ))}
      <text x={cx} y={top + 184} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={900} fontSize={30} fill="#111827">₹1,39,176</text>
      {/* thumbs over the front */}
      <rect x={L[0] - 14} y={L[1] - 64} width={30} height={42} rx={14} fill={`url(#${id}skinBall)`} stroke={KNUCKLE} strokeWidth={2.4} />
      <rect x={R[0] - 16} y={R[1] - 64} width={30} height={42} rx={14} fill={`url(#${id}skinBall)`} stroke={KNUCKLE} strokeWidth={2.4} />
    </g>
  );
};
