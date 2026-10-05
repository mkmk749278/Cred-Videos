import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame, useVideoConfig, spring, SpringConfig} from 'remotion';
import {interpolate} from '../lib/safeInterpolate';
import cues from './cues.json';

/**
 * Video 02 — "No Cost EMI vs Full Payment" (Telugu, ElevenLabs narration).
 * Every beat is tied to a narration sentence (cues.json, from the aligned transcript): S(n) = start frame of
 * sentence n (1-based, narration/v02/sentences.txt line n), with an optional fraction into the sentence.
 */

export const FPS = 30;
/** narration starts this many seconds into the video */
export const LEAD = 0.6;
export const TAIL = 3.4;
export const TOTAL = Math.ceil((LEAD + cues.duration + TAIL) * FPS);

type Cue = {s: number; e: number};
const SEN = cues.sentences as Cue[];
export const sec = (t: number) => Math.round((LEAD + t) * FPS);
/** start frame of sentence n (+ fraction of its length) */
export const S = (n: number, frac = 0) => {
  const c = SEN[n - 1];
  return sec(c.s + (c.e - c.s) * frac);
};
/** end frame of sentence n */
export const E = (n: number) => sec(SEN[n - 1].e);
/** a word-level anchor (seconds) when one was picked from the transcript */
export const W = (key: string) => sec((cues.words as Record<string, number>)[key]);

export const CL = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const lin = (f: number, a: number, b: number, from = 0, to = 1) => interpolate(f, [a, b], [from, to], CL);
export const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const eout = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
export const POP: Partial<SpringConfig> = {mass: 0.7, stiffness: 210, damping: 15};
export const SMOOTH: Partial<SpringConfig> = {mass: 1, stiffness: 80, damping: 20};
export const useSp = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (at: number, cfg: Partial<SpringConfig> = POP) => spring({frame: frame - at, fps, config: cfg});
};
/** visible window with fades */
export const win = (f: number, a: number, b: number, fin = 10, fout = 10) => Math.min(lin(f, a - fin, a), 1 - lin(f, b - fout, b));
export const rnd = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/* ------------------------------------------------------------------ palette */

export const K = {
  ink: '#05070D',
  text: '#F7F8FB',
  soft: '#C9D2E3',
  dim: '#7D8AA3',
  amz: '#FF9900',
  amzNavy: '#232F3E',
  fk: '#2874F0',
  fkY: '#FFE11B',
  win: '#21E59B',
  loss: '#FF4D5E',
  gold: '#F6C453',
  cyan: '#4CC9FF',
  violet: '#9B7BFF',
};
export const DISPLAY = "'Inter', system-ui, sans-serif";
export const NUM = "'JetBrains Mono', ui-monospace, monospace";
export const TE = "'Noto Sans Telugu', 'Inter', sans-serif";
export const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};
/** ₹ with Indian grouping; dp decimals */
export const rs = (n: number, dp = 0) => {
  const neg = n < 0;
  const v = Math.abs(n);
  const whole = Math.floor(v + 1e-9);
  const s = whole.toString();
  const g = s.length <= 3 ? s : s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + s.slice(-3);
  const dec = dp > 0 ? '.' + Math.round((v - whole) * Math.pow(10, dp)).toString().padStart(dp, '0') : '';
  return (neg ? '−' : '') + '₹' + g + dec;
};

/* ------------------------------------------------------------------ audio */

export const Sfx: React.FC<{at: number; name: string; volume?: number}> = ({at, name, volume = 0.4}) => (
  <Sequence from={Math.round(at)} layout="none" name={`sfx:${name}`}>
    <Audio src={staticFile(name.includes('.') ? `v02/sfx/${name}` : `audio/sfx/${name}.mp3`)} volume={volume} />
  </Sequence>
);

/* ------------------------------------------------------------------ the look */

/** slow handheld camera: tiny translation/rotation drift + push-in over the shot */
export const Handheld: React.FC<{children: React.ReactNode; from: number; to: number; push?: number; amp?: number; seed?: number}> = ({children, from, to, push = 0.05, amp = 1, seed = 1}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const x = (Math.sin(t * 0.61 + seed) * 6 + Math.sin(t * 1.37 + seed * 2) * 2.5) * amp;
  const y = (Math.cos(t * 0.53 + seed * 3) * 4 + Math.sin(t * 1.11 + seed) * 2) * amp;
  const r = Math.sin(t * 0.4 + seed) * 0.25 * amp;
  const s = 1 + push * ease(lin(f, from, to));
  return <AbsoluteFill style={{transform: `translate(${x}px, ${y}px) rotate(${r}deg) scale(${s})`}}>{children}</AbsoluteFill>;
};

export type Plate = 'warm' | 'cool' | 'amz' | 'fk' | 'red' | 'green';

/** photographic backdrop: graded gradient, out-of-focus bokeh plate, volumetric beams, floor, vignette */
export const Backdrop: React.FC<{plate: Plate; tint?: string; tint2?: string; bokeh?: number; beams?: boolean; floor?: boolean}> = ({plate, tint = '#1A2C5C', tint2 = '#0B0F1C', bokeh = 0.42, beams = true, floor = true}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const bx = Math.sin(t * 0.05) * 60 - 192;
  const by = Math.cos(t * 0.04) * 30 - 108;
  return (
    <AbsoluteFill style={{background: `radial-gradient(120% 90% at 50% 35%, ${tint} 0%, ${tint2} 55%, ${K.ink} 100%)`, overflow: 'hidden'}}>
      <Img src={staticFile(`v02/bokeh_${plate}.jpg`)} style={{position: 'absolute', left: bx, top: by, width: 2304, height: 1296, opacity: bokeh, mixBlendMode: 'screen', transform: `scale(${1.04 + Math.sin(t * 0.07) * 0.03})`}} />
      {beams && (
        <div
          style={{
            position: 'absolute',
            left: -400,
            top: -500,
            width: 2700,
            height: 1700,
            background: `conic-gradient(from ${200 + Math.sin(t * 0.15) * 6}deg at 30% 0%, transparent 0deg, rgba(255,255,255,0.07) 8deg, transparent 18deg, rgba(255,255,255,0.05) 30deg, transparent 44deg, rgba(255,255,255,0.06) 58deg, transparent 70deg)`,
            mixBlendMode: 'screen',
          }}
        />
      )}
      {floor && <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 420, background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.55))'}} />}
    </AbsoluteFill>
  );
};

/** film grain + vignette + subtle lens bloom; always the top layer */
export const Lens: React.FC = () => {
  const f = useCurrentFrame();
  const ox = Math.floor(rnd(f) * 512);
  const oy = Math.floor(rnd(f + 999) * 512);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{backgroundImage: `url(${staticFile('v02/grain.png')})`, backgroundPosition: `${ox}px ${oy}px`, opacity: 0.075, mixBlendMode: 'overlay'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 70% at 50% 48%, transparent 55%, rgba(0,0,0,0.62) 100%)'}} />
    </AbsoluteFill>
  );
};

/** a shot: cross-fades in/out with a slight zoom-through, plus handheld drift */
export const Shot: React.FC<{from: number; to: number; children: React.ReactNode; fin?: number; fout?: number; push?: number; seed?: number}> = ({from, to, children, fin = 14, fout = 14, push = 0.04, seed = 1}) => {
  const f = useCurrentFrame();
  if (f < from - fin || f > to + fout) return null;
  const a = lin(f, from - fin, from);
  const b = lin(f, to, to + fout);
  const o = Math.min(a, 1 - b);
  const z = 1 + (1 - eout(a)) * 0.06 + eout(b) * 0.08;
  return (
    <AbsoluteFill style={{opacity: o, transform: `scale(${z})`}}>
      <Handheld from={from} to={to} push={push} seed={seed}>
        {children}
      </Handheld>
      {from > 0 && <LightLeak at={from - fin / 2} />}
    </AbsoluteFill>
  );
};

/** headline with a moving light sweep across the letters */
export const Headline: React.FC<{text: React.ReactNode; size?: number; color?: string; at: number; style?: React.CSSProperties; weight?: number; sweep?: boolean}> = ({text, size = 96, color = K.text, at, style, weight = 900, sweep = true}) => {
  const f = useCurrentFrame();
  const sp = useSp();
  const p = sp(at, SMOOTH);
  const sx = lin(f, at + 6, at + 40, -60, 160);
  return (
    <div
      style={{
        fontFamily: DISPLAY,
        fontWeight: weight,
        fontSize: size,
        letterSpacing: -size * 0.03,
        lineHeight: 1.02,
        color,
        opacity: lin(f, at, at + 8),
        transform: `translateY(${(1 - p) * 40}px)`,
        filter: `drop-shadow(0 10px 30px rgba(0,0,0,0.6))`,
        ...(sweep
          ? {
              backgroundImage: `linear-gradient(100deg, ${color} ${sx - 12}%, #ffffff ${sx}%, ${color} ${sx + 12}%)`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }
          : {}),
        ...style,
      }}
    >
      {text}
    </div>
  );
};

/** small uppercase label */
export const Kicker: React.FC<{text: string; color?: string; at: number; style?: React.CSSProperties}> = ({text, color = K.cyan, at, style}) => {
  const f = useCurrentFrame();
  const o = lin(f, at, at + 10);
  return (
    <div style={{fontFamily: NUM, fontSize: 26, letterSpacing: 7, fontWeight: 700, color, textTransform: 'uppercase', opacity: o, transform: `translateX(${(1 - o) * -20}px)`, ...style}}>
      {text}
    </div>
  );
};

/** number that counts from `from` to `to` between frames a..b */
export const Count: React.FC<{a: number; b: number; from: number; to: number; dp?: number; style?: React.CSSProperties; prefix?: string}> = ({a, b, from, to, dp = 0, style, prefix = ''}) => {
  const f = useCurrentFrame();
  const v = from + (to - from) * eout(lin(f, a, b));
  return <span style={{fontVariantNumeric: 'tabular-nums', ...style}}>{prefix + rs(v, dp)}</span>;
};

/** frosted glass panel with specular top edge */
export const Glass: React.FC<{children?: React.ReactNode; style?: React.CSSProperties; accent?: string; r?: number}> = ({children, style, accent, r = 34}) => (
  <div
    style={{
      position: 'absolute',
      borderRadius: r,
      background: 'linear-gradient(160deg, rgba(255,255,255,0.13), rgba(255,255,255,0.04) 40%, rgba(255,255,255,0.02))',
      border: `1.5px solid ${accent ? rgba(accent, 0.55) : 'rgba(255,255,255,0.16)'}`,
      boxShadow: `0 40px 100px rgba(0,0,0,0.55), inset 0 1.5px 0 rgba(255,255,255,0.22)${accent ? `, 0 0 60px ${rgba(accent, 0.22)}` : ''}`,
      backdropFilter: 'blur(14px)',
      ...style,
    }}
  >
    {children}
  </div>
);

/** soft contact shadow under a floating object */
export const ContactShadow: React.FC<{x: number; y: number; w: number; o?: number}> = ({x, y, w, o = 0.6}) => (
  <div style={{position: 'absolute', left: x - w / 2, top: y - w * 0.06, width: w, height: w * 0.12, borderRadius: '50%', background: `radial-gradient(closest-side, rgba(0,0,0,${o}), transparent)`}} />
);

/** light flare that blooms at a frame (for reveals) */
export const Flare: React.FC<{at: number; x: number; y: number; color?: string; size?: number}> = ({at, x, y, color = '#ffffff', size = 900}) => {
  const f = useCurrentFrame();
  const o = Math.min(lin(f, at - 2, at + 3), 1 - lin(f, at + 3, at + 26));
  if (o <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: '50%', background: `radial-gradient(closest-side, ${rgba(color, 0.55)}, ${rgba(color, 0.12)} 40%, transparent)`, opacity: o, mixBlendMode: 'screen', pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: -size * 0.4, right: -size * 0.4, top: size / 2 - 3, height: 6, background: `linear-gradient(90deg, transparent, ${rgba(color, 0.8)}, transparent)`}} />
    </div>
  );
};

/** camera keyframes {f, x, y, s}: the point (x, y) is brought to the frame centre at scale s; eased moves of `dur` frames */
export const camTransform = (f: number, keys: {f: number; x: number; y: number; s: number}[], dur = 26) => {
  let cur = keys[0];
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f < k.f) break;
    const t = ease(lin(f, k.f, k.f + dur));
    cur = {f: k.f, x: cur.x + (k.x - cur.x) * t, y: cur.y + (k.y - cur.y) * t, s: cur.s + (k.s - cur.s) * t};
  }
  return `translate(${960 - cur.x * cur.s}px, ${540 - cur.y * cur.s}px) scale(${cur.s})`;
};

/** warm light leak sweeping across the frame around a cut */
export const LightLeak: React.FC<{at: number; dur?: number; color?: string}> = ({at, dur = 26, color = '#FFB070'}) => {
  const f = useCurrentFrame();
  const t = lin(f, at - dur / 2, at + dur / 2);
  if (t <= 0 || t >= 1) return null;
  const o = Math.sin(t * Math.PI) * 0.55;
  const x = -40 + t * 140;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen', opacity: o, background: `radial-gradient(ellipse 45% 90% at ${x}% 40%, ${rgba(color, 0.9)}, ${rgba(color, 0.25)} 45%, transparent 75%)`}} />
  );
};
