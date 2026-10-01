import React from 'react';

/**
 * "The borrower" — a rigged, painterly 2D character (bearded, round glasses, blue shirt).
 * Soft shading, fuzzy hair/beard edges and fabric folds give a near-3D feel while staying
 * fully driven by props, so scenes can animate expressions frame by frame.
 * Drawn in a 600 x 800 box; the head centre is at roughly (300, 320).
 */

export type Mood = 'neutral' | 'worried' | 'confused' | 'shocked' | 'sad' | 'thinking' | 'explaining' | 'relieved' | 'happy' | 'angry';
export type Pose = 'down' | 'crossed' | 'chin' | 'palm' | 'thumbsUp' | 'phone' | 'scratch' | 'cheeks' | 'paper' | 'point';
export type Mouth = 'smile' | 'grin' | 'frown' | 'worried' | 'o' | 'flat' | 'grimace' | 'A' | 'E' | 'O' | 'M';

type Brow = {inner: number; outer: number};
type MoodSpec = {left: Brow; right: Brow; lid: number; lidTilt: number; squint: number; eye: number; mouth: Mouth; look: [number, number]};

export const MOODS: Record<Mood, MoodSpec> = {
  neutral: {left: {inner: 0, outer: 0}, right: {inner: 0, outer: 0}, lid: 0.16, lidTilt: 0, squint: 0.05, eye: 1, mouth: 'flat', look: [0, 0]},
  worried: {left: {inner: -16, outer: 6}, right: {inner: -16, outer: 6}, lid: 0.14, lidTilt: 10, squint: 0, eye: 1.04, mouth: 'worried', look: [0, 0.1]},
  confused: {left: {inner: 2, outer: 4}, right: {inner: -14, outer: -20}, lid: 0.14, lidTilt: 0, squint: 0, eye: 1, mouth: 'worried', look: [0.5, -0.4]},
  shocked: {left: {inner: -22, outer: -18}, right: {inner: -22, outer: -18}, lid: 0, lidTilt: 0, squint: 0, eye: 1.18, mouth: 'o', look: [0, 0]},
  sad: {left: {inner: -12, outer: 9}, right: {inner: -12, outer: 9}, lid: 0.4, lidTilt: 14, squint: 0, eye: 1, mouth: 'frown', look: [0, 0.5]},
  thinking: {left: {inner: 3, outer: 2}, right: {inner: -8, outer: -12}, lid: 0.24, lidTilt: 0, squint: 0, eye: 1, mouth: 'flat', look: [0.6, -0.7]},
  explaining: {left: {inner: -6, outer: -4}, right: {inner: -6, outer: -4}, lid: 0.12, lidTilt: 0, squint: 0.15, eye: 1, mouth: 'A', look: [0, 0]},
  relieved: {left: {inner: -8, outer: -2}, right: {inner: -8, outer: -2}, lid: 0.5, lidTilt: -4, squint: 0.3, eye: 1, mouth: 'smile', look: [0, 0]},
  happy: {left: {inner: -8, outer: -6}, right: {inner: -8, outer: -6}, lid: 0.12, lidTilt: 0, squint: 0.45, eye: 1, mouth: 'grin', look: [0, 0]},
  angry: {left: {inner: 14, outer: -6}, right: {inner: 14, outer: -6}, lid: 0.3, lidTilt: -12, squint: 0.2, eye: 1, mouth: 'grimace', look: [0, 0]},
};

const SKIN = '#E0AC88';
const SKIN_HI = '#F5CDAD';
const SKIN_SH = '#B07656';
const SKIN_DEEP = '#8E5A40';
const HAIR = '#15161E';
const HAIR_MID = '#24262F';
const HAIR_HI = '#4A4F60';
const SHIRT = '#2E4F96';
const SHIRT_HI = '#4A6DB8';
const SHIRT_SH = '#1F3A73';
const SHIRT_DEEP = '#172C5A';
const LIP = '#C27765';
const LIP_DARK = '#7E3B31';
const MOUTH_IN = '#3E1614';
const EX = [255, 345] as const; // eye centres x
const EY = 324;

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
  /** breathing phase, -1..1 */
  breathe?: number;
  /** extra brow raise (for emphasis while talking) */
  browLift?: number;
  width?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

export const Borrower: React.FC<BorrowerProps> = ({mood = 'neutral', pose = 'down', mouth, blink = 0, look, tilt = 0, breathe = 0, browLift = 0, width = 600, style, children}) => {
  const m = MOODS[mood];
  const gaze = look ?? m.look;
  const id = React.useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 600 800" width={width} height={(width * 800) / 600} style={{overflow: 'visible', ...style}}>
      <Defs id={id} m={m} />
      <ellipse cx={300} cy={796} rx={210} ry={14} fill="rgba(0,0,0,0.28)" filter={`url(#${id}soft)`} />
      <g transform={`translate(0 ${breathe * 3})`}>
        <Body id={id} />
        <g transform={`translate(0 ${-breathe * 1.5}) rotate(${tilt} 300 480)`}>
          <Head id={id} m={m} gaze={gaze} blink={blink} mouth={mouth ?? m.mouth} browLift={browLift} />
        </g>
        {pose === 'crossed' ? (
          <CrossedArms id={id} />
        ) : (
          (['L', 'R'] as const).map((s) => <Arm key={s} pose={pose} side={s} id={id} />)
        )}
        {pose === 'paper' && <PaperHands id={id} />}
      </g>
      {children}
    </svg>
  );
};

/* ---------------- shared defs ---------------- */

const Defs: React.FC<{id: string; m: MoodSpec}> = ({id, m}) => (
  <defs>
    <radialGradient id={`${id}face`} cx="0.4" cy="0.32" r="0.75">
      <stop offset="0" stopColor={SKIN_HI} />
      <stop offset="0.5" stopColor={SKIN} />
      <stop offset="1" stopColor={SKIN_SH} />
    </radialGradient>
    <radialGradient id={`${id}skinBall`} cx="0.35" cy="0.3" r="0.8">
      <stop offset="0" stopColor={SKIN_HI} />
      <stop offset="0.6" stopColor={SKIN} />
      <stop offset="1" stopColor={SKIN_SH} />
    </radialGradient>
    <linearGradient id={`${id}neck`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={SKIN_DEEP} />
      <stop offset="1" stopColor={SKIN_SH} />
    </linearGradient>
    <radialGradient id={`${id}shirt`} cx="0.35" cy="0.15" r="0.95">
      <stop offset="0" stopColor={SHIRT_HI} />
      <stop offset="0.45" stopColor={SHIRT} />
      <stop offset="1" stopColor={SHIRT_DEEP} />
    </radialGradient>
    <linearGradient id={`${id}sleeve`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor={SHIRT_HI} />
      <stop offset="0.55" stopColor={SHIRT} />
      <stop offset="1" stopColor={SHIRT_SH} />
    </linearGradient>
    <linearGradient id={`${id}hair`} x1="0.2" y1="0" x2="0.6" y2="1">
      <stop offset="0" stopColor={HAIR_HI} />
      <stop offset="0.35" stopColor={HAIR_MID} />
      <stop offset="1" stopColor={HAIR} />
    </linearGradient>
    <linearGradient id={`${id}beard`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={HAIR_MID} />
      <stop offset="1" stopColor={HAIR} />
    </linearGradient>
    <radialGradient id={`${id}iris`} cx="0.45" cy="0.4" r="0.6">
      <stop offset="0" stopColor="#8A5530" />
      <stop offset="0.6" stopColor="#5A3418" />
      <stop offset="1" stopColor="#2A160B" />
    </radialGradient>
    <linearGradient id={`${id}white`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#D9D2CB" />
      <stop offset="0.35" stopColor="#FAF8F4" />
      <stop offset="1" stopColor="#EDE7E1" />
    </linearGradient>
    <linearGradient id={`${id}lens`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="rgba(255,255,255,0.18)" />
      <stop offset="0.5" stopColor="rgba(255,255,255,0.02)" />
      <stop offset="1" stopColor="rgba(160,200,255,0.10)" />
    </linearGradient>
    <filter id={`${id}soft`} x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="7" />
    </filter>
    <filter id={`${id}soft2`} x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" />
    </filter>
    {/* fuzzy hair edges + strand grain */}
    <filter id={`${id}fuzz`} x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="3" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="3.5" xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <clipPath id={`${id}faceClip`}>
      <path d={FACE} />
    </clipPath>
    <clipPath id={`${id}beardClip`}>
      <path d={BEARD} />
    </clipPath>
    <clipPath id={`${id}eyeL`}>
      <ellipse cx={EX[0]} cy={EY} rx={19 * m.eye} ry={21 * m.eye} />
    </clipPath>
    <clipPath id={`${id}eyeR`}>
      <ellipse cx={EX[1]} cy={EY} rx={19 * m.eye} ry={21 * m.eye} />
    </clipPath>
    <clipPath id={`${id}torso`}>
      <path d={TORSO} />
    </clipPath>
  </defs>
);

/* ---------------- body ---------------- */

const TORSO = 'M108 800 L122 642 C128 566 186 524 252 504 L300 526 L348 504 C414 524 472 566 478 642 L492 800 Z';

const Body: React.FC<{id: string}> = ({id}) => (
  <g>
    {/* neck */}
    <path d="M264 420 L264 508 Q300 534 336 508 L336 420 Z" fill={`url(#${id}neck)`} />
    <path d="M266 470 Q300 492 334 470" fill="none" stroke={SKIN_DEEP} strokeWidth={10} opacity={0.5} filter={`url(#${id}soft2)`} />
    {/* torso */}
    <path d={TORSO} fill={`url(#${id}shirt)`} />
    <g clipPath={`url(#${id}torso)`}>
      {/* fabric folds + ambient occlusion under the head */}
      <g filter={`url(#${id}soft)`} opacity={0.55}>
        <ellipse cx={300} cy={540} rx={90} ry={34} fill={SHIRT_DEEP} />
        <path d="M150 640 C190 660 210 720 200 800" stroke={SHIRT_DEEP} strokeWidth={22} fill="none" />
        <path d="M450 640 C410 660 390 720 400 800" stroke={SHIRT_DEEP} strokeWidth={22} fill="none" />
        <path d="M230 600 C250 640 250 690 236 740" stroke={SHIRT_DEEP} strokeWidth={10} fill="none" />
        <path d="M372 600 C352 640 352 690 366 740" stroke={SHIRT_DEEP} strokeWidth={10} fill="none" />
        <path d="M180 580 C220 600 240 640 250 680" stroke={SHIRT_HI} strokeWidth={14} fill="none" />
      </g>
      {/* rim light on the left shoulder */}
      <path d="M122 642 C128 566 186 524 252 504" stroke={SHIRT_HI} strokeWidth={6} fill="none" opacity={0.6} filter={`url(#${id}soft2)`} />
      {/* shoulder seams */}
      <path d="M160 560 C176 600 182 640 180 690" stroke={SHIRT_DEEP} strokeWidth={2.5} strokeDasharray="5 5" fill="none" opacity={0.7} />
      <path d="M440 560 C424 600 418 640 420 690" stroke={SHIRT_DEEP} strokeWidth={2.5} strokeDasharray="5 5" fill="none" opacity={0.7} />
    </g>
    <path d={TORSO} fill="none" stroke={SHIRT_DEEP} strokeWidth={3} strokeLinejoin="round" />
    {/* placket + stitching + buttons */}
    <path d="M300 530 L300 800" stroke={SHIRT_SH} strokeWidth={14} opacity={0.5} />
    <path d="M292 534 L292 800 M308 534 L308 800" stroke={SHIRT_DEEP} strokeWidth={1.5} strokeDasharray="4 4" opacity={0.8} />
    {[590, 654, 718].map((y) => (
      <g key={y}>
        <circle cx={300} cy={y} r={6.5} fill={SHIRT_SH} stroke={SHIRT_DEEP} strokeWidth={1.5} />
        <circle cx={298} cy={y - 2} r={2} fill={SHIRT_HI} />
      </g>
    ))}
    {/* collar with inner shadow */}
    <path d="M252 498 L300 532 L270 562 L234 516 Z" fill={SHIRT} stroke={SHIRT_DEEP} strokeWidth={3} strokeLinejoin="round" />
    <path d="M348 498 L300 532 L330 562 L366 516 Z" fill={SHIRT_SH} stroke={SHIRT_DEEP} strokeWidth={3} strokeLinejoin="round" />
    <path d="M246 512 L272 548 M354 512 L328 548" stroke={SHIRT_DEEP} strokeWidth={1.5} strokeDasharray="4 4" />
    <path d="M252 498 L300 532 L348 498" fill="none" stroke={SHIRT_DEEP} strokeWidth={6} opacity={0.5} filter={`url(#${id}soft2)`} />
  </g>
);

/* ---------------- head ---------------- */

const BEARD = 'M203 312 L206 372 C212 436 250 488 300 494 C350 488 388 436 394 372 L397 312 L388 312 C386 352 380 388 364 414 C350 436 334 450 300 452 C266 450 250 436 236 414 C220 388 214 352 212 312 Z';
const HAIR_PATH = 'M206 300 C200 262 200 228 214 204 C220 168 246 140 284 128 C318 118 362 124 388 150 C408 172 410 204 402 236 C400 262 398 284 396 300 L388 300 C388 270 386 246 378 230 C360 214 330 214 300 214 C272 214 244 214 222 232 C216 252 214 276 214 300 Z';
const BEARD_STRANDS = ["M206 300 q3 26 1 52", "M212 312 q-3 26 -1 52", "M219 324 q3 26 1 52", "M226 440 q-3 26 -1 52", "M232 452 q3 26 1 52", "M238 464 q-3 26 -1 52", "M245 440 q3 26 1 52", "M252 452 q-3 26 -1 52", "M258 464 q3 26 1 52", "M264 440 q-3 26 -1 52", "M271 452 q3 26 1 52", "M278 464 q-3 26 -1 52", "M284 440 q3 26 1 52", "M290 452 q-3 26 -1 52", "M297 464 q3 26 1 52", "M304 440 q-3 26 -1 52", "M310 452 q3 26 1 52", "M316 464 q-3 26 -1 52", "M323 440 q3 26 1 52", "M330 452 q-3 26 -1 52", "M336 464 q3 26 1 52", "M342 440 q-3 26 -1 52", "M349 452 q3 26 1 52", "M356 464 q-3 26 -1 52", "M362 440 q3 26 1 52", "M368 452 q-3 26 -1 52", "M375 464 q3 26 1 52", "M382 300 q-3 26 -1 52", "M388 312 q3 26 1 52", "M394 324 q-3 26 -1 52", "M232 456 q2 14 0 28", "M242 464 q-2 14 0 28", "M252 456 q2 14 0 28", "M262 464 q-2 14 0 28", "M272 456 q2 14 0 28", "M282 464 q-2 14 0 28", "M292 456 q2 14 0 28", "M302 464 q-2 14 0 28", "M312 456 q2 14 0 28", "M322 464 q-2 14 0 28", "M332 456 q2 14 0 28", "M342 464 q-2 14 0 28", "M352 456 q2 14 0 28", "M362 464 q-2 14 0 28"];
const FACE = 'M300 166 C356 166 397 200 399 262 C401 302 401 342 397 374 C391 422 357 468 300 472 C243 468 209 422 203 374 C199 342 199 302 201 262 C203 200 244 166 300 166 Z';

const Head: React.FC<{id: string; m: MoodSpec; gaze: [number, number]; blink: number; mouth: Mouth; browLift: number}> = ({id, m, gaze, blink, mouth, browLift}) => (
  <g>
    {/* ears */}
    {[192, 408].map((x, i) => (
      <g key={x}>
        <ellipse cx={x} cy={330} rx={22} ry={32} fill={`url(#${id}skinBall)`} />
        <path d={i === 0 ? 'M200 312 C186 314 184 344 198 352' : 'M400 312 C414 314 416 344 402 352'} fill="none" stroke={SKIN_DEEP} strokeWidth={5} strokeLinecap="round" opacity={0.7} />
      </g>
    ))}
    {/* face */}
    <path d={FACE} fill={`url(#${id}face)`} />
    {/* painted shading, clipped to the face */}
    <g clipPath={`url(#${id}faceClip)`}>
      <g filter={`url(#${id}soft)`}>
        <path d="M205 230 C215 290 214 340 222 380 L200 380 L200 230 Z" fill={SKIN_SH} opacity={0.55} />
        <path d="M395 230 C385 290 386 340 378 380 L400 380 L400 230 Z" fill={SKIN_SH} opacity={0.75} />
        <ellipse cx={300} cy={286} rx={110} ry={16} fill={SKIN_SH} opacity={0.45} />
        <ellipse cx={240} cy={366} rx={26} ry={12} fill="#E39A86" opacity={0.45} />
        <ellipse cx={360} cy={366} rx={26} ry={12} fill="#E39A86" opacity={0.4} />
        <ellipse cx={268} cy={220} rx={50} ry={26} fill={SKIN_HI} opacity={0.7} />
        <path d="M312 300 C318 330 322 350 318 368" stroke={SKIN_SH} strokeWidth={12} fill="none" opacity={0.6} />
      </g>
    </g>
    {/* beard */}
    <g filter={`url(#${id}fuzz)`}>
      <path d={BEARD} fill={`url(#${id}beard)`} />
      <path d="M266 404 C274 390 290 388 300 393 C310 388 326 390 334 404 C322 401 312 402 300 400 C288 402 278 401 266 404 Z" fill={HAIR_MID} />
    </g>
    {/* beard strands */}
    <g clipPath={`url(#${id}beardClip)`} fill="none" stroke={HAIR_HI} strokeLinecap="round" opacity={0.35}>
      {BEARD_STRANDS.map((d, i) => (
        <path key={i} d={d} strokeWidth={2.2} />
      ))}
    </g>
    {/* beard sheen */}
    <path d="M240 440 C262 476 290 488 300 490" stroke={HAIR_HI} strokeWidth={6} fill="none" opacity={0.35} filter={`url(#${id}soft2)`} />
    <MouthShape kind={mouth} />
    {/* nose */}
    <g>
      <path d="M296 312 C294 336 288 350 282 360" stroke={SKIN_SH} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.7} filter={`url(#${id}soft2)`} />
      <path d="M304 300 C306 326 308 344 306 352" stroke={SKIN_HI} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.6} filter={`url(#${id}soft2)`} />
      <ellipse cx={300} cy={372} rx={34} ry={10} fill={SKIN_DEEP} opacity={0.35} filter={`url(#${id}soft2)`} />
      <ellipse cx={282} cy={366} rx={12} ry={10} fill={SKIN} />
      <ellipse cx={318} cy={366} rx={12} ry={10} fill={SKIN_SH} />
      <ellipse cx={300} cy={358} rx={21} ry={17} fill={`url(#${id}skinBall)`} />
      <ellipse cx={289} cy={372} rx={5} ry={3} fill={SKIN_DEEP} />
      <ellipse cx={311} cy={372} rx={5} ry={3} fill={SKIN_DEEP} />
      <circle cx={293} cy={350} r={5} fill={SKIN_HI} opacity={0.9} />
      <path d="M272 362 C268 374 280 382 290 378 M328 362 C332 374 320 382 310 378" fill="none" stroke={SKIN_DEEP} strokeWidth={3.5} strokeLinecap="round" />
      <path d="M318 344 C324 356 322 368 316 374" fill="none" stroke={SKIN_SH} strokeWidth={4} strokeLinecap="round" opacity={0.8} />
    </g>
    {/* eyes */}
    <Eye cx={EX[0]} side="L" id={id} m={m} gaze={gaze} blink={blink} />
    <Eye cx={EX[1]} side="R" id={id} m={m} gaze={gaze} blink={blink} />
    {/* brows */}
    <g filter={`url(#${id}fuzz)`}>
      <BrowShape side="L" b={{inner: m.left.inner - browLift, outer: m.left.outer - browLift}} />
      <BrowShape side="R" b={{inner: m.right.inner - browLift, outer: m.right.outer - browLift}} />
    </g>
    {/* glasses: thin round metal frames */}
    <g>
      {EX.map((x) => (
        <g key={x}>
          <circle cx={x} cy={EY} r={40} fill={`url(#${id}lens)`} />
          <circle cx={x + 2} cy={EY + 3} r={40} fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth={5} filter={`url(#${id}soft2)`} />
          <circle cx={x} cy={EY} r={40} fill="none" stroke="#14141A" strokeWidth={4.5} />
          <path d={`M${x - 28} ${EY - 18} A34 34 0 0 1 ${x - 4} ${EY - 32}`} fill="none" stroke="#fff" strokeOpacity={0.55} strokeWidth={3} strokeLinecap="round" />
        </g>
      ))}
      <path d={`M${EX[0] + 38} ${EY - 6} Q300 ${EY - 16} ${EX[1] - 38} ${EY - 6}`} fill="none" stroke="#14141A" strokeWidth={4.5} />
      <path d={`M${EX[0] - 40} ${EY - 6} L198 ${EY - 10} M${EX[1] + 40} ${EY - 6} L402 ${EY - 10}`} stroke="#14141A" strokeWidth={4.5} strokeLinecap="round" />
    </g>
    {/* hair: high swept-back quiff with short sides */}
    <g filter={`url(#${id}fuzz)`}>
      <path d={HAIR_PATH} fill={`url(#${id}hair)`} />
    </g>
    <g fill="none" stroke={HAIR_HI} strokeLinecap="round" opacity={0.6}>
      <path d="M232 196 C246 160 280 138 322 134" strokeWidth={4} />
      <path d="M250 206 C266 176 300 158 346 156" strokeWidth={3.5} />
      <path d="M272 212 C290 190 326 178 368 182" strokeWidth={3} />
      <path d="M300 136 C340 134 372 146 390 168" strokeWidth={3} />
      <path d="M216 250 C214 270 214 284 215 296 M386 250 C388 270 388 284 387 296" strokeWidth={2.5} />
    </g>
  </g>
);

const BrowShape: React.FC<{side: 'L' | 'R'; b: Brow}> = ({side, b}) => {
  const s = side === 'L' ? 1 : -1;
  const x = (dx: number) => 300 - s * dx;
  const oy = 272 + b.outer;
  const iy = 270 + b.inner;
  const my = 258 + (b.inner + b.outer) / 2;
  // tapered: thick at the inner end, thin at the outer end
  return <path d={`M${x(84)} ${oy} Q${x(54)} ${my - 6} ${x(16)} ${iy - 7} L${x(16)} ${iy + 9} Q${x(54)} ${my + 8} ${x(84)} ${oy + 5} Z`} fill={HAIR} />;
};

const Eye: React.FC<{cx: number; side: 'L' | 'R'; id: string; m: MoodSpec; gaze: [number, number]; blink: number}> = ({cx, side, id, m, gaze, blink}) => {
  const cy = EY;
  const rx = 19 * m.eye;
  const ry = 21 * m.eye;
  const lid = Math.min(1, m.lid + blink * (1 - m.lid));
  const tilt = (side === 'L' ? -1 : 1) * m.lidTilt;
  const lidBottom = cy - ry + lid * ry * 2;
  const squintTop = cy + ry - m.squint * ry * 1.2;
  const gx = cx + gaze[0] * 6;
  const gy = cy + 2 + gaze[1] * 6;
  return (
    <g>
      {/* socket shadow */}
      <ellipse cx={cx} cy={cy - 4} rx={rx + 8} ry={ry + 6} fill={SKIN_SH} opacity={0.35} filter={`url(#${id}soft2)`} />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${id}white)`} />
      <g clipPath={`url(#${id}eye${side})`}>
        <circle cx={gx} cy={gy} r={12.5} fill={`url(#${id}iris)`} />
        <circle cx={gx} cy={gy} r={12.5} fill="none" stroke="#1C0E06" strokeWidth={1.5} />
        <circle cx={gx} cy={gy} r={6} fill="#0A0604" />
        <circle cx={gx + 4} cy={gy - 4} r={3.2} fill="#fff" />
        <circle cx={gx - 4} cy={gy + 4} r={1.4} fill="#fff" opacity={0.7} />
        {m.squint > 0 && <path d={`M${cx - 32} ${squintTop + 8} Q${cx} ${squintTop - 6} ${cx + 32} ${squintTop + 8} L${cx + 32} ${cy + 40} L${cx - 32} ${cy + 40} Z`} fill={SKIN} />}
        <g transform={`rotate(${tilt} ${cx} ${lidBottom})`}>
          <rect x={cx - 34} y={cy - 64} width={68} height={lidBottom - (cy - 64)} fill={SKIN} />
          <rect x={cx - 34} y={lidBottom - 8} width={68} height={8} fill={SKIN_SH} opacity={0.6} />
          <line x1={cx - 34} y1={lidBottom} x2={cx + 34} y2={lidBottom} stroke="#1E120C" strokeWidth={4} />
        </g>
      </g>
      {/* upper crease */}
      <path d={`M${cx - rx} ${cy - ry + 2} Q${cx} ${cy - ry - 10 + lid * 4} ${cx + rx} ${cy - ry + 2}`} fill="none" stroke={SKIN_DEEP} strokeWidth={2.5} opacity={lid > 0.95 ? 0.3 : 0.55} />
    </g>
  );
};

const MouthShape: React.FC<{kind: Mouth}> = ({kind}) => {
  const cx = 300;
  const cy = 420;
  const lowerLip = (w = 14, y = 6) => <ellipse cx={cx} cy={cy + y} rx={w} ry={5} fill={LIP} opacity={0.9} />;
  switch (kind) {
    case 'smile':
      return (
        <g>
          {lowerLip(15, 7)}
          <path d={`M${cx - 22} ${cy - 2} Q${cx} ${cy + 12} ${cx + 22} ${cy - 2}`} fill="none" stroke={LIP_DARK} strokeWidth={4} strokeLinecap="round" />
        </g>
      );
    case 'grin':
      return (
        <g>
          <path d={`M${cx - 26} ${cy - 6} Q${cx} ${cy + 30} ${cx + 26} ${cy - 6} Z`} fill={MOUTH_IN} stroke={LIP} strokeWidth={3.5} strokeLinejoin="round" />
          <path d={`M${cx - 22} ${cy - 4} L${cx + 22} ${cy - 4} L${cx + 18} ${cy + 4} L${cx - 18} ${cy + 4} Z`} fill="#F7F3EE" />
          <ellipse cx={cx} cy={cy + 14} rx={10} ry={5} fill="#C8574D" />
        </g>
      );
    case 'frown':
      return (
        <g>
          {lowerLip(13, 9)}
          <path d={`M${cx - 20} ${cy + 8} Q${cx} ${cy - 6} ${cx + 20} ${cy + 8}`} fill="none" stroke={LIP_DARK} strokeWidth={4} strokeLinecap="round" />
        </g>
      );
    case 'worried':
      return (
        <g>
          {lowerLip(13, 8)}
          <path d={`M${cx - 20} ${cy + 3} Q${cx - 10} ${cy - 4} ${cx} ${cy + 2} Q${cx + 10} ${cy + 8} ${cx + 20} ${cy}`} fill="none" stroke={LIP_DARK} strokeWidth={4} strokeLinecap="round" />
        </g>
      );
    case 'o':
      return <ellipse cx={cx} cy={cy + 4} rx={11} ry={15} fill={MOUTH_IN} stroke={LIP} strokeWidth={4} />;
    case 'grimace':
      return (
        <g>
          <rect x={cx - 22} y={cy - 6} width={44} height={18} rx={7} fill="#F7F3EE" stroke={LIP} strokeWidth={3.5} />
          <path d={`M${cx - 22} ${cy + 3} L${cx + 22} ${cy + 3} M${cx - 8} ${cy - 6} L${cx - 8} ${cy + 12} M${cx + 8} ${cy - 6} L${cx + 8} ${cy + 12}`} stroke="#c9b9b0" strokeWidth={1.5} />
        </g>
      );
    case 'A':
      return (
        <g>
          <ellipse cx={cx} cy={cy + 4} rx={15} ry={13} fill={MOUTH_IN} stroke={LIP} strokeWidth={3.5} />
          <ellipse cx={cx} cy={cy + 11} rx={8} ry={4} fill="#C8574D" />
        </g>
      );
    case 'E':
      return (
        <g>
          <ellipse cx={cx} cy={cy + 2} rx={19} ry={6.5} fill={MOUTH_IN} stroke={LIP} strokeWidth={3.5} />
          <rect x={cx - 13} y={cy - 3} width={26} height={4} fill="#F7F3EE" />
        </g>
      );
    case 'O':
      return <ellipse cx={cx} cy={cy + 3} rx={9} ry={11} fill={MOUTH_IN} stroke={LIP} strokeWidth={3.5} />;
    case 'M':
      return (
        <g>
          {lowerLip(14, 5)}
          <path d={`M${cx - 18} ${cy + 1} L${cx + 18} ${cy + 1}`} stroke={LIP_DARK} strokeWidth={5} strokeLinecap="round" />
        </g>
      );
    case 'flat':
    default:
      return (
        <g>
          {lowerLip(14, 7)}
          <path d={`M${cx - 18} ${cy + 1} Q${cx} ${cy + 4} ${cx + 18} ${cy + 1}`} fill="none" stroke={LIP_DARK} strokeWidth={4} strokeLinecap="round" />
        </g>
      );
  }
};

/* ---------------- arms + hands ---------------- */

type Pt = [number, number];
type HandKind = 'fist' | 'palm' | 'thumb' | 'point' | 'phone';
type ArmSpec = {sh: Pt; el: Pt; wr: Pt; hand: HandKind; angle: number; flip?: boolean};

const DOWN_L: ArmSpec = {sh: [170, 592], el: [140, 704], wr: [146, 830], hand: 'fist', angle: 0};
const DOWN_R: ArmSpec = {sh: [430, 592], el: [460, 704], wr: [454, 830], hand: 'fist', angle: 0};

const ARMS: Record<Exclude<Pose, 'crossed'>, {L: ArmSpec; R: ArmSpec}> = {
  down: {L: DOWN_L, R: DOWN_R},
  chin: {L: DOWN_L, R: {sh: [430, 592], el: [456, 716], wr: [334, 526], hand: 'fist', angle: -30}},
  palm: {L: DOWN_L, R: {sh: [430, 592], el: [504, 676], wr: [532, 560], hand: 'palm', angle: 15}},
  thumbsUp: {L: DOWN_L, R: {sh: [430, 592], el: [496, 690], wr: [486, 588], hand: 'thumb', angle: 0}},
  phone: {L: DOWN_L, R: {sh: [430, 592], el: [478, 676], wr: [430, 442], hand: 'phone', angle: -15}},
  scratch: {L: DOWN_L, R: {sh: [430, 592], el: [514, 520], wr: [432, 262], hand: 'fist', angle: -150}},
  cheeks: {
    L: {sh: [172, 592], el: [176, 612], wr: [214, 436], hand: 'palm', angle: -15, flip: true},
    R: {sh: [428, 592], el: [424, 612], wr: [386, 436], hand: 'palm', angle: 15},
  },
  paper: {
    L: {sh: [170, 592], el: [172, 702], wr: [238, 648], hand: 'fist', angle: 0},
    R: {sh: [430, 592], el: [428, 702], wr: [362, 648], hand: 'fist', angle: 0},
  },
  point: {L: DOWN_L, R: {sh: [430, 592], el: [510, 640], wr: [570, 560], hand: 'point', angle: -40}},
};

/** a sleeve with round volume: base tone, shadow on the far side, highlight on the near side */
const Sleeve: React.FC<{d: string; id: string; mid: string}> = ({d, id, mid}) => (
  <g>
    <mask id={mid}>
      <path d={d} fill="none" stroke="#fff" strokeWidth={62} strokeLinecap="round" strokeLinejoin="round" />
    </mask>
    <path d={d} fill="none" stroke={SHIRT_DEEP} strokeWidth={68} strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} fill="none" stroke={`url(#${id}sleeve)`} strokeWidth={62} strokeLinecap="round" strokeLinejoin="round" />
    <g mask={`url(#${mid})`}>
      <path d={d} transform="translate(12 10)" fill="none" stroke={SHIRT_DEEP} strokeWidth={34} strokeLinecap="round" strokeLinejoin="round" opacity={0.55} filter={`url(#${id}soft)`} />
      <path d={d} transform="translate(-12 -10)" fill="none" stroke={SHIRT_HI} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" opacity={0.5} filter={`url(#${id}soft2)`} />
    </g>
  </g>
);

const Arm: React.FC<{pose: Exclude<Pose, 'crossed'>; side: 'L' | 'R'; id: string}> = ({pose, side, id}) => {
  const a = ARMS[pose][side];
  const d = `M${a.sh[0]} ${a.sh[1]} L${a.el[0]} ${a.el[1]} L${a.wr[0]} ${a.wr[1]}`;
  return (
    <g>
      <Sleeve d={d} id={id} mid={`${id}m${side}`} />
      {/* elbow crease */}
      <path d={`M${a.el[0] - 14} ${a.el[1] - 8} q14 10 28 0`} fill="none" stroke={SHIRT_DEEP} strokeWidth={3} opacity={0.6} />
      <Hand at={a.wr} kind={a.hand} angle={a.angle} flip={a.flip} id={id} />
    </g>
  );
};

/** the reference pose: forearms folded across the chest, one hand tucked, one resting on the arm */
const CrossedArms: React.FC<{id: string}> = ({id}) => (
  <g>
    {/* upper arms */}
    <Sleeve d="M168 592 L150 690" id={id} mid={`${id}cu1`} />
    <Sleeve d="M432 592 L450 690" id={id} mid={`${id}cu2`} />
    {/* lower forearm (character's left) runs under, hand tucked */}
    <Sleeve d="M450 690 L300 712 L218 694" id={id} mid={`${id}cf1`} />
    {/* upper forearm (character's right) on top, hand resting on the far upper arm */}
    <Sleeve d="M150 690 L300 668 L398 642" id={id} mid={`${id}cf2`} />
    <g transform="translate(414 636) rotate(-14)">
      {[-16, -2, 12, 26].map((y, i) => (
        <rect key={y} x={-12} y={y - 20} width={44 - i * 3} height={15} rx={7.5} fill={`url(#${id}skinBall)`} stroke="#9A6A4E" strokeWidth={2} />
      ))}
    </g>
    <path d="M150 690 L300 668" fill="none" stroke={SHIRT_DEEP} strokeWidth={3} opacity={0.5} transform="translate(0 30)" />
  </g>
);

const Hand: React.FC<{at: Pt; kind: HandKind; angle: number; flip?: boolean; id: string}> = ({at, kind, angle, flip, id}) => {
  const sx = flip ? -1 : 1;
  const skin = {fill: `url(#${id}skinBall)`, stroke: '#9A6A4E', strokeWidth: 2.5, strokeLinejoin: 'round' as const};
  const knuckles = (
    <g>
      {[-18, -6, 6, 18].map((x) => (
        <rect key={x} x={x - 6.5} y={-30} width={13} height={22} rx={6.5} {...skin} />
      ))}
    </g>
  );
  return (
    <g transform={`translate(${at[0]} ${at[1]}) rotate(${angle}) scale(${sx} 1)`}>
      {/* cuff */}
      <rect x={-32} y={14} width={64} height={18} rx={6} fill={SHIRT_SH} stroke={SHIRT_DEEP} strokeWidth={2.5} />
      {kind === 'fist' && (
        <g>
          <rect x={-27} y={-24} width={54} height={44} rx={18} {...skin} />
          {knuckles}
          <rect x={-34} y={-14} width={20} height={14} rx={7} transform="rotate(20 -24 -7)" {...skin} />
        </g>
      )}
      {kind === 'thumb' && (
        <g>
          <rect x={-8} y={-76} width={22} height={52} rx={11} {...skin} />
          <rect x={-27} y={-28} width={54} height={50} rx={18} {...skin} />
          {[-16, -2, 12].map((y) => (
            <path key={y} d={`M-27 ${y} L14 ${y}`} stroke="#9A6A4E" strokeWidth={2} strokeLinecap="round" opacity={0.7} />
          ))}
        </g>
      )}
      {kind === 'point' && (
        <g>
          <rect x={14} y={-14} width={60} height={19} rx={9.5} {...skin} />
          <rect x={-27} y={-24} width={54} height={46} rx={18} {...skin} />
          <path d="M-27 -4 L14 -4 M-27 8 L14 8" stroke="#9A6A4E" strokeWidth={2} strokeLinecap="round" opacity={0.7} />
        </g>
      )}
      {kind === 'palm' && (
        <g>
          {[-20, -7, 6, 19].map((x, i) => (
            <rect key={x} x={x - 6.5} y={-80 + Math.abs(i - 1.5) * 6} width={13} height={52} rx={6.5} {...skin} />
          ))}
          <rect x={-36} y={-22} width={20} height={40} rx={10} transform="rotate(-35 -26 0)" {...skin} />
          <rect x={-27} y={-38} width={54} height={60} rx={20} {...skin} />
          <path d="M-14 -10 Q0 -2 14 -10" stroke="#9A6A4E" strokeWidth={2} fill="none" opacity={0.6} />
        </g>
      )}
      {kind === 'phone' && (
        <g>
          <g transform="rotate(-10)">
            <rect x={-26} y={-112} width={52} height={98} rx={10} fill="#0F172A" stroke="#05080F" strokeWidth={3} />
            <rect x={-21} y={-104} width={42} height={82} rx={6} fill="#1E3A8A" />
            <rect x={-21} y={-104} width={42} height={30} rx={6} fill="#ffffff" opacity={0.12} />
          </g>
          <rect x={-27} y={-30} width={54} height={50} rx={18} {...skin} />
          {knuckles}
        </g>
      )}
    </g>
  );
};

/** for the 'paper' pose: a bill held at chest height, with thumbs over it */
const PaperHands: React.FC<{id: string}> = ({id}) => (
  <g>
    <g transform="rotate(-4 300 600)">
      <rect x={210} y={518} width={180} height={214} rx={6} fill="#FDFCF7" />
      <rect x={210} y={518} width={180} height={214} rx={6} fill="none" stroke="#cbd5e1" strokeWidth={2} />
      <rect x={210} y={700} width={180} height={32} fill="#000" opacity={0.05} />
      <text x={300} y={556} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={900} fontSize={22} fill="#B91C1C">OVERDUE</text>
      {[580, 600, 620, 640].map((y, i) => (
        <rect key={y} x={230} y={y} width={140 - i * 18} height={8} rx={4} fill="#d6d3d1" />
      ))}
      <text x={300} y={702} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={900} fontSize={30} fill="#111827">₹1,39,176</text>
    </g>
    <rect x={208} y={618} width={40} height={46} rx={16} fill={`url(#${id}skinBall)`} stroke="#9A6A4E" strokeWidth={2.5} />
    <rect x={352} y={618} width={40} height={46} rx={16} fill={`url(#${id}skinBall)`} stroke="#9A6A4E" strokeWidth={2.5} />
  </g>
);

/* ---------------- props (drawn in the same 600x800 space) ---------------- */

export const QuestionMarks: React.FC<{t: number}> = ({t}) => (
  <g fontFamily="Inter, sans-serif" fontWeight={900}>
    <text x={434} y={190 - (t % 1) * 10} fontSize={116} fill="#E2C48C" stroke="#B8955A" strokeWidth={3}>?</text>
    <text x={500} y={260 - ((t + 0.4) % 1) * 12} fontSize={52} fill="#E2C48C" opacity={0.8}>?</text>
  </g>
);

export const SweatDrop: React.FC<{t: number}> = ({t}) => {
  const y = 250 + (t % 1) * 60;
  return (
    <g opacity={1 - (t % 1) * 0.6}>
      <path d={`M414 ${y} C406 ${y + 16} 402 ${y + 26} 414 ${y + 32} C426 ${y + 26} 422 ${y + 16} 414 ${y} Z`} fill="#BFDBFE" stroke="#60A5FA" strokeWidth={2} />
      <circle cx={410} cy={y + 22} r={3} fill="#fff" />
    </g>
  );
};

export const ShockLines: React.FC<{t: number}> = ({t}) => (
  <g stroke="#FBBF24" strokeWidth={8} strokeLinecap="round" opacity={0.6 + 0.4 * Math.sin(t * Math.PI * 4)}>
    <path d="M170 160 L140 120 M300 110 L300 60 M430 160 L460 120 M150 250 L100 235 M450 250 L500 235" />
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
  <g transform={`translate(474 150) scale(${0.9 + 0.1 * Math.sin(t * Math.PI * 2)})`}>
    <circle r={60} fill="#FDE68A" opacity={0.25} />
    <path d="M0 -40 C-26 -40 -36 -18 -32 -2 C-28 14 -16 20 -14 34 L14 34 C16 20 28 14 32 -2 C36 -18 26 -40 0 -40 Z" fill="#FCD34D" stroke="#B45309" strokeWidth={4} />
    <rect x={-14} y={34} width={28} height={14} rx={4} fill="#94A3B8" />
  </g>
);

export const Checkmark: React.FC<{t: number}> = ({t}) => (
  <g transform={`translate(484 200) scale(${Math.min(1, t * 3)})`}>
    <circle r={50} fill="#10B981" />
    <path d="M-22 0 L-6 16 L24 -16" fill="none" stroke="#fff" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

export const AngerMark: React.FC<{t: number}> = ({t}) => (
  <g transform={`translate(424 190) scale(${0.85 + 0.15 * Math.abs(Math.sin(t * Math.PI * 3))})`} stroke="#EF4444" strokeWidth={7} strokeLinecap="round" fill="none">
    <path d="M-20 -6 Q-8 -8 -6 -20 M6 -20 Q8 -8 20 -6 M20 6 Q8 8 6 20 M-6 20 Q-8 8 -20 6" />
  </g>
);
