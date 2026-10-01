import React from 'react';

/**
 * "The borrower" — a rigged 2D character (bearded, round glasses, blue shirt).
 * Everything is driven by props so scenes can animate expressions frame by frame.
 * Drawn in a 600 x 800 box; the head centre is at (300, 310).
 */

export type Mood = 'neutral' | 'worried' | 'confused' | 'shocked' | 'sad' | 'thinking' | 'explaining' | 'relieved' | 'happy' | 'angry';
export type Pose = 'down' | 'crossed' | 'chin' | 'palm' | 'thumbsUp' | 'phone' | 'scratch' | 'cheeks' | 'paper' | 'point';
export type Mouth = 'smile' | 'grin' | 'frown' | 'worried' | 'o' | 'flat' | 'grimace' | 'A' | 'E' | 'O' | 'M';

type Brow = {inner: number; outer: number};
type MoodSpec = {left: Brow; right: Brow; lid: number; lidTilt: number; squint: number; eye: number; mouth: Mouth; look: [number, number]};

export const MOODS: Record<Mood, MoodSpec> = {
  neutral: {left: {inner: 0, outer: 0}, right: {inner: 0, outer: 0}, lid: 0.12, lidTilt: 0, squint: 0, eye: 1, mouth: 'flat', look: [0, 0]},
  worried: {left: {inner: -16, outer: 5}, right: {inner: -16, outer: 5}, lid: 0.12, lidTilt: 10, squint: 0, eye: 1.04, mouth: 'worried', look: [0, 0.1]},
  confused: {left: {inner: 2, outer: 4}, right: {inner: -14, outer: -20}, lid: 0.1, lidTilt: 0, squint: 0, eye: 1, mouth: 'worried', look: [0.5, -0.4]},
  shocked: {left: {inner: -22, outer: -18}, right: {inner: -22, outer: -18}, lid: 0, lidTilt: 0, squint: 0, eye: 1.22, mouth: 'o', look: [0, 0]},
  sad: {left: {inner: -12, outer: 9}, right: {inner: -12, outer: 9}, lid: 0.38, lidTilt: 14, squint: 0, eye: 1, mouth: 'frown', look: [0, 0.5]},
  thinking: {left: {inner: 3, outer: 2}, right: {inner: -8, outer: -12}, lid: 0.22, lidTilt: 0, squint: 0, eye: 1, mouth: 'flat', look: [0.6, -0.7]},
  explaining: {left: {inner: -6, outer: -4}, right: {inner: -6, outer: -4}, lid: 0.1, lidTilt: 0, squint: 0.15, eye: 1, mouth: 'A', look: [0, 0]},
  relieved: {left: {inner: -8, outer: -2}, right: {inner: -8, outer: -2}, lid: 0.5, lidTilt: -4, squint: 0.3, eye: 1, mouth: 'smile', look: [0, 0]},
  happy: {left: {inner: -8, outer: -6}, right: {inner: -8, outer: -6}, lid: 0.1, lidTilt: 0, squint: 0.45, eye: 1, mouth: 'grin', look: [0, 0]},
  angry: {left: {inner: 14, outer: -6}, right: {inner: 14, outer: -6}, lid: 0.28, lidTilt: -12, squint: 0.2, eye: 1, mouth: 'grimace', look: [0, 0]},
};

const SKIN = '#D7A07A';
const SKIN_SH = '#B98060';
const SKIN_HI = '#E8B793';
const HAIR = '#1A1C27';
const HAIR_HI = '#343949';
const SHIRT = '#2F4E93';
const SHIRT_SH = '#24407C';
const SHIRT_HI = '#3B60AE';
const OUTLINE = '#16203A';
const LIP = '#D98B78';
const MOUTH_IN = '#4A1A17';

export type BorrowerProps = {
  mood?: Mood;
  pose?: Pose;
  /** override the mood's mouth (use for lip-sync visemes) */
  mouth?: Mouth;
  /** 0 = open, 1 = closed */
  blink?: number;
  /** override gaze, -1..1 */
  look?: [number, number];
  /** head tilt in degrees */
  tilt?: number;
  /** 0..1 breathing phase offset (pass sin of frame) */
  breathe?: number;
  /** optional per-brow offsets added on top of the mood (for brow raises while talking) */
  browLift?: number;
  width?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

export const Borrower: React.FC<BorrowerProps> = ({mood = 'neutral', pose = 'down', mouth, blink = 0, look, tilt = 0, breathe = 0, browLift = 0, width = 600, style, children}) => {
  const m = MOODS[mood];
  const gaze = look ?? m.look;
  const id = React.useId().replace(/:/g, '');
  const back = ARMS_BEHIND[pose];
  return (
    <svg viewBox="0 0 600 800" width={width} height={(width * 800) / 600} style={{overflow: 'visible', ...style}}>
      <defs>
        <linearGradient id={`${id}skin`} x1="0" x2="1">
          <stop offset="0" stopColor={SKIN_HI} />
          <stop offset="0.55" stopColor={SKIN} />
          <stop offset="1" stopColor={SKIN_SH} />
        </linearGradient>
        <linearGradient id={`${id}shirt`} x1="0" x2="1">
          <stop offset="0" stopColor={SHIRT_HI} />
          <stop offset="0.5" stopColor={SHIRT} />
          <stop offset="1" stopColor={SHIRT_SH} />
        </linearGradient>
        <linearGradient id={`${id}hair`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor={HAIR_HI} />
          <stop offset="0.45" stopColor={HAIR} />
        </linearGradient>
        <clipPath id={`${id}eyeL`}>
          <ellipse cx={258} cy={322} rx={17 * m.eye} ry={19 * m.eye} />
        </clipPath>
        <clipPath id={`${id}eyeR`}>
          <ellipse cx={342} cy={322} rx={17 * m.eye} ry={19 * m.eye} />
        </clipPath>
      </defs>

      {/* soft ground shadow */}
      <ellipse cx={300} cy={796} rx={200} ry={14} fill="rgba(0,0,0,0.25)" />

      <g transform={`translate(0 ${breathe * 3})`}>
        {back && <Arm pose={pose} side={back} id={id} />}
        <Body id={id} breathe={breathe} />
        {/* head */}
        <g transform={`translate(0 ${-breathe * 1.5}) rotate(${tilt} 300 470)`}>
          <Head id={id} m={m} gaze={gaze} blink={blink} mouth={mouth ?? m.mouth} browLift={browLift} />
        </g>
        {(['L', 'R'] as const).filter((s) => s !== back).map((s) => (
          <Arm key={s} pose={pose} side={s} id={id} />
        ))}
        {pose === 'paper' && <PaperHands />}
      </g>
      {children}
    </svg>
  );
};

/* ---------------- body ---------------- */

const Body: React.FC<{id: string; breathe: number}> = ({id}) => (
  <g>
    {/* neck */}
    <path d="M266 430 L266 505 Q300 528 334 505 L334 430 Z" fill={SKIN_SH} />
    {/* torso */}
    <path
      d="M128 800 L138 640 C142 568 190 528 254 506 L300 526 L346 506 C410 528 458 568 462 640 L472 800 Z"
      fill={`url(#${id}shirt)`}
      stroke={OUTLINE}
      strokeWidth={4}
      strokeLinejoin="round"
    />
    {/* side shading */}
    <path d="M410 540 C445 565 458 600 462 640 L472 800 L420 800 C428 700 425 610 410 540 Z" fill={SHIRT_SH} opacity={0.7} />
    {/* placket + buttons */}
    <path d="M300 528 L300 800" stroke={SHIRT_SH} strokeWidth={4} />
    {[588, 650, 712].map((y) => (
      <circle key={y} cx={300} cy={y} r={5} fill={SHIRT_SH} stroke={OUTLINE} strokeWidth={1.5} />
    ))}
    {/* collar */}
    <path d="M256 494 L300 530 L274 556 L240 516 Z" fill={SHIRT_HI} stroke={OUTLINE} strokeWidth={3.5} strokeLinejoin="round" />
    <path d="M344 494 L300 530 L326 556 L360 516 Z" fill={SHIRT} stroke={OUTLINE} strokeWidth={3.5} strokeLinejoin="round" />
  </g>
);

/* ---------------- head ---------------- */

const Head: React.FC<{id: string; m: MoodSpec; gaze: [number, number]; blink: number; mouth: Mouth; browLift: number}> = ({id, m, gaze, blink, mouth, browLift}) => (
  <g>
    {/* ears */}
    <ellipse cx={194} cy={326} rx={22} ry={30} fill={SKIN_SH} />
    <ellipse cx={406} cy={326} rx={22} ry={30} fill={SKIN_SH} />
    <ellipse cx={197} cy={326} rx={11} ry={17} fill={SKIN} />
    <ellipse cx={403} cy={326} rx={11} ry={17} fill={SKIN} />
    {/* face */}
    <path d="M202 290 C202 210 245 178 300 178 C355 178 398 210 398 290 L398 360 C398 420 360 462 300 462 C240 462 202 420 202 360 Z" fill={`url(#${id}skin)`} />
    {/* beard */}
    <path
      d="M200 292 L203 360 C206 432 248 486 300 490 C352 486 394 432 397 360 L400 292 L390 292 C388 336 380 360 362 372 C345 382 330 378 300 378 C270 378 255 382 238 372 C220 360 212 336 210 292 Z"
      fill={HAIR}
    />
    <path d="M300 490 C352 486 394 432 397 360 L400 300 C398 360 388 420 352 452 C334 468 318 474 300 476 Z" fill={HAIR_HI} opacity={0.45} />
    {/* cheeks blush (subtle) */}
    <ellipse cx={240} cy={362} rx={18} ry={8} fill="#E9A089" opacity={0.25} />
    <ellipse cx={360} cy={362} rx={18} ry={8} fill="#E9A089" opacity={0.25} />
    <MouthShape kind={mouth} />
    {/* moustache */}
    <path d="M254 398 C266 376 288 374 300 382 C312 374 334 376 346 398 C328 392 314 394 300 391 C286 394 272 392 254 398 Z" fill={HAIR} />
    {/* nose */}
    <path d="M300 318 C298 342 292 356 286 366 C294 374 306 374 314 366" fill="none" stroke={SKIN_SH} strokeWidth={5} strokeLinecap="round" />
    <ellipse cx={300} cy={360} rx={12} ry={7} fill={SKIN_SH} opacity={0.35} />
    {/* eyes */}
    <Eye cx={258} side="L" id={id} m={m} gaze={gaze} blink={blink} />
    <Eye cx={342} side="R" id={id} m={m} gaze={gaze} blink={blink} />
    {/* brows */}
    <BrowPath side="L" b={{inner: m.left.inner - browLift, outer: m.left.outer - browLift}} />
    <BrowPath side="R" b={{inner: m.right.inner - browLift, outer: m.right.outer - browLift}} />
    {/* glasses */}
    <g fill="rgba(200,230,255,0.07)" stroke="#121218" strokeWidth={6}>
      <circle cx={258} cy={322} r={38} />
      <circle cx={342} cy={322} r={38} />
    </g>
    <path d="M292 318 Q300 310 308 318" fill="none" stroke="#121218" strokeWidth={6} />
    <path d="M220 316 L200 312 M380 316 L400 312" stroke="#121218" strokeWidth={6} strokeLinecap="round" />
    <path d="M236 300 A30 30 0 0 1 262 292" fill="none" stroke="#fff" strokeOpacity={0.35} strokeWidth={4} strokeLinecap="round" />
    <path d="M320 300 A30 30 0 0 1 346 292" fill="none" stroke="#fff" strokeOpacity={0.35} strokeWidth={4} strokeLinecap="round" />
    {/* hair: swept-up quiff */}
    <path
      d="M200 300 C192 240 204 196 236 172 C252 146 290 132 326 138 C368 144 398 168 404 210 C410 240 404 272 400 300 L392 300 C390 262 382 236 366 222 C340 204 300 214 270 206 C246 214 222 234 212 300 Z"
      fill={`url(#${id}hair)`}
    />
    <path d="M240 170 C262 150 300 146 330 152 C300 156 276 166 258 184 Z" fill={HAIR_HI} opacity={0.8} />
  </g>
);

const BrowPath: React.FC<{side: 'L' | 'R'; b: Brow}> = ({side, b}) => {
  const s = side === 'L' ? 1 : -1;
  const x = (dx: number) => 300 - s * dx;
  const outer = [x(80), 270 + b.outer];
  const mid = [x(52), 260 + (b.inner + b.outer) / 2 - 4];
  const inner = [x(17), 268 + b.inner];
  return <path d={`M${outer[0]} ${outer[1]} Q${mid[0]} ${mid[1]} ${inner[0]} ${inner[1]}`} fill="none" stroke={HAIR} strokeWidth={15} strokeLinecap="round" />;
};

const Eye: React.FC<{cx: number; side: 'L' | 'R'; id: string; m: MoodSpec; gaze: [number, number]; blink: number}> = ({cx, side, id, m, gaze, blink}) => {
  const cy = 322;
  const rx = 17 * m.eye;
  const ry = 19 * m.eye;
  const lid = Math.min(1, m.lid + blink * (1 - m.lid));
  const tilt = (side === 'L' ? -1 : 1) * m.lidTilt;
  const lidBottom = cy - ry + lid * ry * 2;
  const squintTop = cy + ry - m.squint * ry * 1.2;
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#FBFBF8" />
      <g clipPath={`url(#${id}eye${side})`}>
        <circle cx={cx + gaze[0] * 6} cy={cy + 2 + gaze[1] * 6} r={10.5} fill="#3B2414" />
        <circle cx={cx + gaze[0] * 6} cy={cy + 2 + gaze[1] * 6} r={5.5} fill="#0B0705" />
        <circle cx={cx + gaze[0] * 6 + 3.5} cy={cy - 2 + gaze[1] * 6} r={2.6} fill="#fff" />
        {/* lower lid (smile squint) */}
        {m.squint > 0 && <rect x={cx - 30} y={squintTop} width={60} height={40} fill={SKIN} />}
        {/* upper lid */}
        <g transform={`rotate(${tilt} ${cx} ${lidBottom})`}>
          <rect x={cx - 34} y={cy - 60} width={68} height={lidBottom - (cy - 60)} fill={SKIN} />
          <line x1={cx - 34} y1={lidBottom} x2={cx + 34} y2={lidBottom} stroke="#2a1a14" strokeWidth={3.5} />
        </g>
      </g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="#2a1a14" strokeWidth={2} opacity={lid > 0.95 ? 0 : 0.6} />
    </g>
  );
};

const MouthShape: React.FC<{kind: Mouth}> = ({kind}) => {
  const cx = 300;
  const cy = 412;
  switch (kind) {
    case 'smile':
      return <path d={`M${cx - 22} ${cy - 4} Q${cx} ${cy + 14} ${cx + 22} ${cy - 4}`} fill="none" stroke={LIP} strokeWidth={5.5} strokeLinecap="round" />;
    case 'grin':
      return (
        <g>
          <path d={`M${cx - 26} ${cy - 6} Q${cx} ${cy + 30} ${cx + 26} ${cy - 6} Z`} fill={MOUTH_IN} stroke={LIP} strokeWidth={3} strokeLinejoin="round" />
          <path d={`M${cx - 22} ${cy - 4} L${cx + 22} ${cy - 4} L${cx + 18} ${cy + 4} L${cx - 18} ${cy + 4} Z`} fill="#fff" />
          <ellipse cx={cx} cy={cy + 14} rx={10} ry={5} fill="#C8574D" />
        </g>
      );
    case 'frown':
      return <path d={`M${cx - 20} ${cy + 8} Q${cx} ${cy - 8} ${cx + 20} ${cy + 8}`} fill="none" stroke={LIP} strokeWidth={5.5} strokeLinecap="round" />;
    case 'worried':
      return <path d={`M${cx - 20} ${cy + 3} Q${cx - 10} ${cy - 4} ${cx} ${cy + 2} Q${cx + 10} ${cy + 8} ${cx + 20} ${cy}`} fill="none" stroke={LIP} strokeWidth={5} strokeLinecap="round" />;
    case 'o':
      return <ellipse cx={cx} cy={cy + 4} rx={11} ry={15} fill={MOUTH_IN} stroke={LIP} strokeWidth={3.5} />;
    case 'grimace':
      return (
        <g>
          <rect x={cx - 22} y={cy - 6} width={44} height={18} rx={7} fill="#fff" stroke={LIP} strokeWidth={3.5} />
          <path d={`M${cx - 22} ${cy + 3} L${cx + 22} ${cy + 3} M${cx - 8} ${cy - 6} L${cx - 8} ${cy + 12} M${cx + 8} ${cy - 6} L${cx + 8} ${cy + 12}`} stroke="#c9b9b0" strokeWidth={1.5} />
        </g>
      );
    case 'A':
      return (
        <g>
          <ellipse cx={cx} cy={cy + 4} rx={15} ry={13} fill={MOUTH_IN} stroke={LIP} strokeWidth={3} />
          <ellipse cx={cx} cy={cy + 11} rx={8} ry={4} fill="#C8574D" />
        </g>
      );
    case 'E':
      return (
        <g>
          <ellipse cx={cx} cy={cy + 2} rx={19} ry={6.5} fill={MOUTH_IN} stroke={LIP} strokeWidth={3} />
          <rect x={cx - 13} y={cy - 3} width={26} height={4} fill="#fff" />
        </g>
      );
    case 'O':
      return <ellipse cx={cx} cy={cy + 3} rx={9} ry={11} fill={MOUTH_IN} stroke={LIP} strokeWidth={3} />;
    case 'M':
      return <path d={`M${cx - 18} ${cy + 1} L${cx + 18} ${cy + 1}`} stroke={LIP} strokeWidth={7} strokeLinecap="round" />;
    case 'flat':
    default:
      return <path d={`M${cx - 17} ${cy + 1} Q${cx} ${cy + 4} ${cx + 17} ${cy + 1}`} fill="none" stroke={LIP} strokeWidth={5} strokeLinecap="round" />;
  }
};

/* ---------------- arms + hands ---------------- */

type Pt = [number, number];
type HandKind = 'fist' | 'palm' | 'thumb' | 'point' | 'phone' | 'flat';
type ArmSpec = {sh: Pt; el: Pt; wr: Pt; hand: HandKind; angle: number; flip?: boolean} | null;

const DOWN_L: ArmSpec = {sh: [178, 590], el: [150, 700], wr: [152, 820], hand: 'fist', angle: 0};
const DOWN_R: ArmSpec = {sh: [422, 590], el: [450, 700], wr: [448, 820], hand: 'fist', angle: 0};

const ARMS: Record<Pose, {L: ArmSpec; R: ArmSpec}> = {
  down: {L: DOWN_L, R: DOWN_R},
  crossed: {
    L: {sh: [178, 590], el: [168, 704], wr: [372, 652], hand: 'flat', angle: -100, flip: true},
    R: {sh: [422, 590], el: [432, 704], wr: [232, 690], hand: 'flat', angle: 100},
  },
  chin: {L: DOWN_L, R: {sh: [422, 590], el: [452, 716], wr: [334, 520], hand: 'fist', angle: -30}},
  palm: {L: DOWN_L, R: {sh: [422, 590], el: [500, 676], wr: [530, 560], hand: 'palm', angle: 15}},
  thumbsUp: {L: DOWN_L, R: {sh: [422, 590], el: [492, 690], wr: [482, 588], hand: 'thumb', angle: 0}},
  phone: {L: DOWN_L, R: {sh: [422, 590], el: [474, 676], wr: [428, 440], hand: 'phone', angle: -15}},
  scratch: {L: DOWN_L, R: {sh: [422, 590], el: [510, 520], wr: [430, 260], hand: 'fist', angle: -150}},
  cheeks: {
    L: {sh: [178, 590], el: [178, 610], wr: [214, 430], hand: 'palm', angle: -15, flip: true},
    R: {sh: [422, 590], el: [422, 610], wr: [386, 430], hand: 'palm', angle: 15},
  },
  paper: {
    L: {sh: [178, 590], el: [176, 700], wr: [238, 646], hand: 'fist', angle: 0},
    R: {sh: [422, 590], el: [424, 700], wr: [362, 646], hand: 'fist', angle: 0},
  },
  point: {L: DOWN_L, R: {sh: [422, 590], el: [506, 640], wr: [566, 560], hand: 'point', angle: -40}},
};

/** which arm is drawn behind the body for a pose */
const ARMS_BEHIND: Record<Pose, 'L' | 'R' | null> = {
  down: null, crossed: null, chin: null, palm: null, thumbsUp: null, phone: null, scratch: null, cheeks: null, paper: null, point: null,
};

const Arm: React.FC<{pose: Pose; side: 'L' | 'R'; id: string}> = ({pose, side, id}) => {
  const a = ARMS[pose][side];
  if (!a) return null;
  // crossed: the right arm sits under the left one
  const d = `M${a.sh[0]} ${a.sh[1]} L${a.el[0]} ${a.el[1]} L${a.wr[0]} ${a.wr[1]}`;
  return (
    <g>
      <path d={d} fill="none" stroke={OUTLINE} strokeWidth={70} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={`url(#${id}shirt)`} strokeWidth={62} strokeLinecap="round" strokeLinejoin="round" />
      {/* cuff */}
      <Hand at={a.wr} kind={a.hand} angle={a.angle} flip={a.flip} />
    </g>
  );
};

const Hand: React.FC<{at: Pt; kind: HandKind; angle: number; flip?: boolean}> = ({at, kind, angle, flip}) => {
  const sx = flip ? -1 : 1;
  const common = {fill: SKIN, stroke: '#9A6A4E', strokeWidth: 3, strokeLinejoin: 'round' as const};
  return (
    <g transform={`translate(${at[0]} ${at[1]}) rotate(${angle}) scale(${sx} 1)`}>
      {kind === 'fist' && (
        <g>
          <rect x={-28} y={-26} width={56} height={50} rx={20} {...common} />
          <path d="M-14 -8 L-14 6 M0 -10 L0 6 M14 -8 L14 6" stroke="#9A6A4E" strokeWidth={2.5} strokeLinecap="round" />
        </g>
      )}
      {kind === 'flat' && (
        <g>
          <rect x={-30} y={-22} width={60} height={42} rx={18} {...common} />
          <path d="M-30 -6 L16 -6 M-30 6 L18 6" stroke="#9A6A4E" strokeWidth={2.5} strokeLinecap="round" />
        </g>
      )}
      {kind === 'thumb' && (
        <g>
          <rect x={-10} y={-74} width={22} height={50} rx={11} {...common} />
          <rect x={-28} y={-30} width={56} height={52} rx={20} {...common} />
          <path d="M-28 -12 L18 -12 M-28 2 L18 2" stroke="#9A6A4E" strokeWidth={2.5} strokeLinecap="round" />
        </g>
      )}
      {kind === 'point' && (
        <g>
          <rect x={14} y={-14} width={58} height={20} rx={10} {...common} />
          <rect x={-28} y={-26} width={56} height={48} rx={20} {...common} />
        </g>
      )}
      {kind === 'palm' && (
        <g>
          {[-21, -7, 7, 21].map((x, i) => (
            <rect key={x} x={x - 7} y={-78 + Math.abs(i - 1.5) * 6} width={14} height={50} rx={7} {...common} />
          ))}
          <rect x={-34} y={-22} width={22} height={40} rx={11} transform="rotate(-35 -24 0)" {...common} />
          <rect x={-28} y={-36} width={56} height={58} rx={20} {...common} />
        </g>
      )}
      {kind === 'phone' && (
        <g>
          <g transform="rotate(-10)">
            <rect x={-26} y={-110} width={52} height={96} rx={10} fill="#111827" stroke="#0b0f19" strokeWidth={3} />
            <rect x={-21} y={-102} width={42} height={80} rx={6} fill="#1E3A8A" />
          </g>
          <rect x={-28} y={-30} width={56} height={52} rx={20} {...common} />
        </g>
      )}
    </g>
  );
};

/** for the 'paper' pose: a bill held at chest height, with thumbs over it */
const PaperHands: React.FC = () => (
  <g>
    <g transform="rotate(-4 300 600)">
      <rect x={214} y={520} width={172} height={210} rx={6} fill="#FDFCF7" stroke="#cbd5e1" strokeWidth={2} />
      <text x={300} y={556} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={900} fontSize={22} fill="#B91C1C">OVERDUE</text>
      {[580, 600, 620, 640].map((y, i) => (
        <rect key={y} x={232} y={y} width={136 - i * 18} height={8} rx={4} fill="#d6d3d1" />
      ))}
      <text x={300} y={700} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={900} fontSize={30} fill="#111827">₹1,39,176</text>
    </g>
    <rect x={212} y={620} width={40} height={44} rx={16} fill={SKIN} stroke="#9A6A4E" strokeWidth={3} />
    <rect x={348} y={620} width={40} height={44} rx={16} fill={SKIN} stroke="#9A6A4E" strokeWidth={3} />
  </g>
);

/* ---------------- props (drawn in the same 600x800 space) ---------------- */

export const QuestionMarks: React.FC<{t: number}> = ({t}) => (
  <g fontFamily="Inter, sans-serif" fontWeight={900} fill="#E9C46A">
    <text x={430} y={190 - (t % 1) * 10} fontSize={110} opacity={0.95}>?</text>
    <text x={492} y={250 - ((t + 0.4) % 1) * 12} fontSize={56} opacity={0.75}>?</text>
  </g>
);

export const SweatDrop: React.FC<{t: number}> = ({t}) => {
  const y = 250 + (t % 1) * 60;
  return <path d={`M412 ${y} C404 ${y + 16} 400 ${y + 26} 412 ${y + 32} C424 ${y + 26} 420 ${y + 16} 412 ${y} Z`} fill="#93C5FD" stroke="#3B82F6" strokeWidth={2} opacity={1 - (t % 1) * 0.6} />;
};

export const ShockLines: React.FC<{t: number}> = ({t}) => (
  <g stroke="#FBBF24" strokeWidth={8} strokeLinecap="round" opacity={0.6 + 0.4 * Math.sin(t * Math.PI * 4)}>
    <path d="M170 170 L140 130 M300 120 L300 70 M430 170 L460 130 M150 260 L100 245 M450 260 L500 245" />
  </g>
);

export const RingWaves: React.FC<{t: number; x?: number; y?: number}> = ({t, x = 470, y = 330}) => (
  <g fill="none" stroke="#EF4444" strokeWidth={6} strokeLinecap="round">
    {[0, 1, 2].map((i) => {
      const p = (t + i / 3) % 1;
      return <path key={i} d={`M${x + 20 + p * 40} ${y - 40 - p * 20} A${50 + p * 40} ${50 + p * 40} 0 0 1 ${x + 20 + p * 40} ${y + 40 + p * 20}`} opacity={1 - p} />;
    })}
  </g>
);

export const Sparkles: React.FC<{t: number}> = ({t}) => (
  <g fill="#FDE68A">
    {[
      [140, 200, 0],
      [470, 170, 0.3],
      [500, 330, 0.6],
      [110, 360, 0.8],
    ].map(([x, y, o], i) => {
      const s = 0.6 + 0.4 * Math.sin((t + o) * Math.PI * 2);
      return <path key={i} transform={`translate(${x} ${y}) scale(${s})`} d="M0 -22 L6 -6 L22 0 L6 6 L0 22 L-6 6 L-22 0 L-6 -6 Z" />;
    })}
  </g>
);

export const Lightbulb: React.FC<{t: number}> = ({t}) => (
  <g transform={`translate(470 150) scale(${0.9 + 0.1 * Math.sin(t * Math.PI * 2)})`}>
    <circle r={58} fill="#FDE68A" opacity={0.25} />
    <path d="M0 -40 C-26 -40 -36 -18 -32 -2 C-28 14 -16 20 -14 34 L14 34 C16 20 28 14 32 -2 C36 -18 26 -40 0 -40 Z" fill="#FCD34D" stroke="#B45309" strokeWidth={4} />
    <rect x={-14} y={34} width={28} height={14} rx={4} fill="#94A3B8" />
  </g>
);

export const Checkmark: React.FC<{t: number}> = ({t}) => (
  <g transform={`translate(480 200) scale(${Math.min(1, t * 3)})`}>
    <circle r={50} fill="#10B981" />
    <path d="M-22 0 L-6 16 L24 -16" fill="none" stroke="#fff" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

export const AngerMark: React.FC<{t: number}> = ({t}) => (
  <g transform={`translate(420 190) scale(${0.85 + 0.15 * Math.abs(Math.sin(t * Math.PI * 3))})`} stroke="#EF4444" strokeWidth={7} strokeLinecap="round" fill="none">
    <path d="M-20 -6 Q-8 -8 -6 -20 M6 -20 Q8 -8 20 -6 M20 6 Q8 8 6 20 M-6 20 Q-8 8 -20 6" />
  </g>
);
