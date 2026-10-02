import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {interpolate} from '../lib/safeInterpolate';
import {C, FONT, MONO, alpha} from '../theme';
import {CLAMP, SNAPPY, SOFT, spr} from '../lib/anim';
import {FPS, LEAD} from '../lib/timing';
import {Sfx} from '../components/primitives';
import type {Insert} from '../components/TeluguInserts';

/**
 * Toolkit for the Telugu edition's animated demonstrations.
 * Every property is a pure function of the frame (seekable): beats are module-relative seconds from
 * inserts_te.json, converted with the same LEAD offset as the narration.
 */

export const TE_FONT = "'Noto Sans Telugu', 'Inter', sans-serif";
export const SUPPORT = '#D3DCE8';
export const PAPER = '#F4F1EA';
export const INK = '#1B2433';
export const fr = (sec: number) => Math.round((LEAD + sec) * FPS);
export const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

export type DemoProps = {ins: Insert};

/** beat helpers bound to the current frame */
export const useBeats = (ins: Insert) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const b = ins.beats ?? {};
  const at = (k: string | number) => fr(typeof k === 'number' ? k : (b[k] ?? ins.from));
  /** spring 0..1 starting at beat k */
  const p = (k: string | number, delay = 0, cfg = SNAPPY) => spr(frame, fps, at(k) + delay, cfg);
  /** linear 0..1 over `dur` frames from beat k */
  const lin = (k: string | number, dur = 15, delay = 0) => interpolate(frame, [at(k) + delay, at(k) + delay + dur], [0, 1], CLAMP);
  const on = (k: string | number) => frame >= at(k);
  /** index of the latest beat reached among `keys` (-1 before the first) */
  const stage = (keys: string[]) => keys.reduce((acc, k, i) => (frame >= at(k) ? i : acc), -1);
  return {frame, fps, at, p, lin, on, stage, soft: SOFT};
};

/** Smooth camera between keyframes {k: beat, x, y, s}; x/y are the point brought to the centre. */
export const useCamera = (ins: Insert, keys: {k: string; x: number; y: number; s: number}[], w: number, h: number) => {
  const {frame, at} = useBeats(ins);
  const pts = keys.map((c) => ({...c, f: at(c.k)}));
  let i = 0;
  while (i + 1 < pts.length && frame >= pts[i + 1].f) i++;
  const a = pts[i];
  const b = pts[Math.min(i + 1, pts.length - 1)];
  const t = frame < pts[0].f ? 0 : interpolate(frame, [b.f - 1, b.f + 22], [0, 1], CLAMP);
  const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const cur = i + 1 < pts.length && frame >= b.f - 1 ? {x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e, s: a.s + (b.s - a.s) * e} : a;
  return {transform: `translate(${w / 2 - cur.x * cur.s}px, ${h / 2 - cur.y * cur.s}px) scale(${cur.s})`, transformOrigin: '0 0', s: cur.s};
};

/** Header for a demo: kicker + title (+ Telugu line). Stays readable for the whole demo. */
export const DemoHeader: React.FC<{ins: Insert; color?: string; align?: 'left' | 'center'}> = ({ins, color = C.cyan, align = 'left'}) => {
  const {p} = useBeats(ins);
  const o = p(ins.from, -12);
  return (
    <div style={{position: 'absolute', left: 120, right: 120, top: 112, textAlign: align, opacity: o, transform: `translateY(${(1 - o) * 20}px)`}}>
      {ins.kicker && <div style={{fontFamily: MONO, fontSize: 26, letterSpacing: 6, color, fontWeight: 700, textTransform: 'uppercase'}}>{ins.kicker}</div>}
      <div style={{fontFamily: FONT, fontSize: 64, fontWeight: 850, color: C.text, letterSpacing: -1, lineHeight: 1.08, marginTop: 8}}>{ins.title}</div>
      {ins.te && <div style={{fontFamily: TE_FONT, fontSize: 40, fontWeight: 600, color: SUPPORT, marginTop: 8, lineHeight: 1.35}}>{ins.te}</div>}
    </div>
  );
};

/** "Illustration" / "Sample" tag, bottom-right, always legible */
export const IllusTag: React.FC<{text?: string; style?: React.CSSProperties}> = ({text = 'Illustration — not real figures', style}) => (
  <div style={{position: 'absolute', right: 110, top: 128, padding: '10px 18px', borderRadius: 12, border: `2px solid ${alpha(C.amber, 0.7)}`, background: alpha(C.amber, 0.14), color: '#FDE68A', fontFamily: FONT, fontSize: 28, fontWeight: 750, ...style}}>
    {text}
  </div>
);

/** A bottom caption line that changes with the beat (main conclusion text, readable size) */
export const Caption: React.FC<{lines: {k: string; text: string; te?: string; color?: string}[]; ins: Insert; bottom?: number}> = ({lines, ins, bottom = 150}) => {
  const {frame, at} = useBeats(ins);
  let cur = -1;
  lines.forEach((l, i) => {
    if (frame >= at(l.k)) cur = i;
  });
  if (cur < 0) return null;
  const l = lines[cur];
  const o = interpolate(frame, [at(l.k), at(l.k) + 10], [0, 1], CLAMP);
  return (
    <div style={{position: 'absolute', left: 120, right: 120, bottom, textAlign: 'center', opacity: o, transform: `translateY(${(1 - o) * 14}px)`}}>
      <div style={{fontFamily: FONT, fontSize: 46, fontWeight: 800, color: l.color ?? C.text, textShadow: '0 4px 24px rgba(0,0,0,0.7)'}}>{l.text}</div>
      {l.te && <div style={{fontFamily: TE_FONT, fontSize: 38, fontWeight: 600, color: SUPPORT, marginTop: 6}}>{l.te}</div>}
    </div>
  );
};

/** Paper document */
export const Paper: React.FC<{w: number; h: number; children: React.ReactNode; style?: React.CSSProperties}> = ({w, h, children, style}) => (
  <div style={{position: 'absolute', width: w, height: h, background: `linear-gradient(170deg, #FBF9F4, ${PAPER})`, borderRadius: 10, boxShadow: '0 40px 90px rgba(0,0,0,0.55), 0 2px 0 rgba(255,255,255,0.6) inset', color: INK, fontFamily: FONT, overflow: 'hidden', ...style}}>
    {children}
  </div>
);

/** Highlight box drawn around a region (coordinates in the parent's space) */
export const Hi: React.FC<{x: number; y: number; w: number; h: number; t: number; color?: string; label?: string; labelSide?: 'right' | 'left' | 'top'}> = ({x, y, w, h, t, color = C.cyan, label, labelSide = 'right'}) => {
  if (t <= 0.001) return null;
  return (
    <>
      <div style={{position: 'absolute', left: x - 8, top: y - 6, width: w + 16, height: h + 12, borderRadius: 10, border: `4px solid ${color}`, background: alpha(color, 0.12 * t), opacity: t, boxShadow: `0 0 28px ${alpha(color, 0.5 * t)}`, transform: `scale(${1.04 - 0.04 * t})`}} />
      {label && (
        <div style={{position: 'absolute', ...(labelSide === 'right' ? {left: x + w + 26, top: y + h / 2 - 22} : labelSide === 'left' ? {right: `calc(100% - ${x - 26}px)`, top: y + h / 2 - 22} : {left: x, top: y - 62}), padding: '6px 14px', borderRadius: 10, background: color, color: '#04111C', fontFamily: FONT, fontSize: 26, fontWeight: 850, whiteSpace: 'nowrap', opacity: t}}>
          {label}
        </div>
      )}
    </>
  );
};

/** Labelled status pill */
export const Pill: React.FC<{text: string; color: string; style?: React.CSSProperties; size?: number}> = ({text, color, style, size = 28}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 18px', borderRadius: 999, border: `2px solid ${color}`, background: alpha(color, 0.16), color: '#fff', fontFamily: FONT, fontSize: size, fontWeight: 800, whiteSpace: 'nowrap', ...style}}>
    {text}
  </div>
);

/** Folder that receives filed items */
export const Folder: React.FC<{x: number; y: number; label: string; count: number; color?: string; o?: number}> = ({x, y, label, count, color = C.cyan, o = 1}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 300, height: 220, opacity: o}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 120, height: 40, borderRadius: '14px 14px 0 0', background: alpha(color, 0.55)}} />
    <div style={{position: 'absolute', left: 0, top: 28, width: 300, height: 192, borderRadius: 16, background: `linear-gradient(160deg, ${alpha(color, 0.5)}, ${alpha(color, 0.25)})`, border: `2px solid ${alpha(color, 0.8)}`, boxShadow: '0 30px 60px rgba(0,0,0,0.45)'}} />
    <div style={{position: 'absolute', left: 22, top: 70, fontFamily: FONT, fontSize: 30, fontWeight: 850, color: '#fff'}}>{label}</div>
    <div style={{position: 'absolute', left: 22, top: 120, fontFamily: MONO, fontSize: 24, color: SUPPORT}}>{count} item{count === 1 ? '' : 's'} saved</div>
  </div>
);

/** Straight arrow between two points (SVG, absolute in parent), drawn progressively with t */
export const Arrow: React.FC<{x1: number; y1: number; x2: number; y2: number; t: number; color?: string; width?: number; dashed?: boolean}> = ({x1, y1, x2, y2, t, color = C.cyan, width = 6, dashed}) => {
  if (t <= 0) return null;
  const xe = x1 + (x2 - x1) * t;
  const ye = y1 + (y2 - y1) * t;
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const hx = (a: number) => xe - 22 * Math.cos(ang + a);
  const hy = (a: number) => ye - 22 * Math.sin(ang + a);
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}} width={1} height={1}>
      <line x1={x1} y1={y1} x2={xe} y2={ye} stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={dashed ? '14 12' : undefined} />
      {t > 0.95 && <path d={`M ${hx(0.5)} ${hy(0.5)} L ${xe} ${ye} L ${hx(-0.5)} ${hy(-0.5)}`} stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
};

/** Phone body (simplified, crisp) used across demos */
export const PhoneBody: React.FC<{x: number; y: number; w?: number; h?: number; children: React.ReactNode; label?: string}> = ({x, y, w = 430, h = 800, children, label}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 60, padding: 14, background: 'linear-gradient(145deg, #2a3242, #0d1119 60%, #1c2230)', boxShadow: '0 50px 110px rgba(0,0,0,0.65), inset 0 0 0 2px rgba(255,255,255,0.08)'}}>
    <div style={{width: '100%', height: '100%', borderRadius: 48, background: '#0B1020', overflow: 'hidden', position: 'relative', fontFamily: FONT, color: '#fff'}}>
      <div style={{position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', width: 110, height: 30, borderRadius: 20, background: '#000', zIndex: 10}} />
      {children}
    </div>
    {label && <div style={{position: 'absolute', left: 0, right: 0, top: h + 18, textAlign: 'center', fontFamily: FONT, fontSize: 26, color: SUPPORT, fontWeight: 600}}>{label}</div>}
  </div>
);

/** Toggle switch */
export const Toggle: React.FC<{on: number; color?: string}> = ({on, color = C.emerald}) => (
  <div style={{width: 84, height: 46, borderRadius: 23, background: on > 0.5 ? color : '#334155', position: 'relative', transition: 'none'}}>
    <div style={{position: 'absolute', top: 4, left: 4 + 38 * on, width: 38, height: 38, borderRadius: 19, background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.4)'}} />
  </div>
);

/** SFX on a beat (muted automatically when before the demo) */
export const BeatSfx: React.FC<{ins: Insert; k: string; name: Parameters<typeof Sfx>[0]['name']; volume?: number}> = ({ins, k, name, volume = 0.22}) => {
  const {at} = useBeats(ins);
  return <Sfx at={at(k)} name={name} volume={volume} />;
};

/** container covering the stage area below the header, fading in/out with the insert window */
export const DemoRoot: React.FC<{ins: Insert; children: React.ReactNode}> = ({ins, children}) => {
  const frame = useCurrentFrame();
  const a = fr(ins.from);
  const b = fr(ins.to);
  const o = interpolate(frame, [a - 12, a, b, b + 12], [0, 1, 1, 0], CLAMP);
  return <div style={{position: 'absolute', inset: 0, opacity: o}}>{children}</div>;
};
