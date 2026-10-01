import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {C, MONO, alpha} from '../theme';
import {cueFrame, FPS, LEAD, timing} from '../lib/timing';
import {blendArms, POSES, PoseName} from './Arms';
import {AngerMark, blendMood, Borrower, Checkmark, Lightbulb, Mood, MOODS, QuestionMarks, RingWaves, ShockLines, Sparkles, SweatDrop} from './Borrower';
import {speechAt, W} from './lipsync';

/**
 * Ravi as the on-screen narrator of a module.
 * - `beats`: cue phrase (or scene frame) -> pose + mood (+ optional prop); poses/moods blend smoothly.
 * - `windows`: when he is visible and where (dock). Outside every window he is hidden.
 * He lip-syncs to the module narration whenever visible, nods on `stress` words.
 */

export type Prop = 'question' | 'sweat' | 'bulb' | 'sparkle' | 'check' | 'anger' | 'ring' | 'shock';
export type Dock = 'stage' | 'right' | 'left';
export type Cue = string | number | {phrase: string; nth?: number; offset?: number};
export type HostBeat = {at: Cue; pose: PoseName; mood: Mood; tilt?: number; turn?: number; prop?: Prop};
export type HostWindow = {from: Cue; to: Cue; dock: Dock};
export type HostConfig = {beats: HostBeat[]; windows: HostWindow[]; stress?: string[]};

const BLEND = 12;
const ease = Easing.bezier(0.45, 0, 0.25, 1);

export const resolveCue = (index: number, c: Cue): number => {
  if (typeof c === 'number') return c;
  if (typeof c === 'string') return cueFrame(index, c);
  return cueFrame(index, c.phrase, c.nth ?? 0) + (c.offset ?? 0);
};

/** where each dock puts the character (1920x1080 frame) */
const DOCKS: Record<Dock, {x: number; y: number; w: number; card: boolean}> = {
  stage: {x: 150, y: 170, w: 600, card: false},
  right: {x: 1546, y: 500, w: 316, card: true},
  left: {x: 44, y: 500, w: 316, card: true},
};
const CARD = {w: 330, h: 370};

export const RaviHost: React.FC<{index: number; config: HostConfig}> = ({index, config}) => {
  const frame = useCurrentFrame();
  const words = React.useMemo(() => timing.modules[index].sentences.flatMap((s) => s.words as W[]), [index]);
  const beats = React.useMemo(() => config.beats.map((b) => ({...b, f: resolveCue(index, b.at)})).sort((a, b) => a.f - b.f), [index, config.beats]);
  const windows = React.useMemo(() => config.windows.map((w) => ({...w, a: resolveCue(index, w.from), b: resolveCue(index, w.to)})), [index, config.windows]);

  // visibility + dock (with slide in / out)
  const win = windows.find((w) => frame >= w.a - 10 && frame <= w.b + 10);
  if (!win || !beats.length) return null;
  const vin = interpolate(frame, [win.a - 10, win.a + 4], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const vout = interpolate(frame, [win.b - 4, win.b + 10], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const vis = ease(Math.min(vin, vout));
  if (vis <= 0.001) return null;
  const d = DOCKS[win.dock];

  // current beat, blended from the previous one
  let i = 0;
  while (i + 1 < beats.length && beats[i + 1].f <= frame) i++;
  const k = beats[i];
  const prev = beats[Math.max(0, i - 1)];
  const t = frame < k.f ? 1 : ease(Math.min(1, (frame - k.f) / BLEND));
  const kk = frame < k.f ? beats[0] : k;
  const pp = frame < k.f ? beats[0] : prev;
  const arms = blendArms(POSES[pp.pose], POSES[kk.pose], t);
  const spec = blendMood(MOODS[pp.mood], MOODS[kk.mood], t);

  // life + speech
  const sec = frame / FPS - LEAD;
  const sp = speechAt(words, sec, config.stress ?? []);
  const breathe = Math.sin(frame / 22);
  const cyc = (frame + index * 17) % 89;
  const blink = cyc < 3 ? cyc / 3 : cyc < 6 ? (6 - cyc) / 3 : 0;
  const sacc = Math.floor(frame / 41);
  const look: [number, number] = sp.talking ? [Math.sin(sacc * 2.1) * 0.12, 0] : [spec.look[0] + Math.sin(sacc * 2.3) * 0.25, spec.look[1] + Math.cos(sacc * 1.7) * 0.15];
  const tilt = interpolate(t, [0, 1], [pp.tilt ?? 0, kk.tilt ?? 0]) + Math.sin(frame / 31) * 1.2;
  const turn = interpolate(t, [0, 1], [pp.turn ?? 0, kk.turn ?? 0]);
  const since = frame - kk.f;
  const p = (frame % 45) / 45;
  const prop = since >= 6 ? kk.prop : undefined;

  const body = (
    <Borrower
      arms={arms}
      spec={spec}
      mouth={sp.mouth}
      blink={blink}
      look={look}
      tilt={tilt}
      turn={turn}
      nod={sp.stress * 6}
      browLift={sp.stress * 6}
      breathe={breathe}
      shrug={kk.mood === 'confused' ? 8 * t : kk.mood === 'shocked' ? 6 * t : 0}
      width={d.w}
    >
      {prop === 'question' && <QuestionMarks t={p} />}
      {prop === 'sweat' && <SweatDrop t={p} />}
      {prop === 'bulb' && <Lightbulb t={p} />}
      {prop === 'sparkle' && <Sparkles t={p} />}
      {prop === 'check' && <Checkmark t={Math.min(1, since / 20)} />}
      {prop === 'anger' && <AngerMark t={p} />}
      {prop === 'ring' && <RingWaves t={p} x={452} y={330} />}
      {prop === 'shock' && <ShockLines t={p} />}
    </Borrower>
  );

  if (!d.card) {
    return (
      <div style={{position: 'absolute', left: d.x, top: d.y, opacity: vis, transform: `translateX(${(1 - vis) * -80}px)`, pointerEvents: 'none'}}>
        {body}
      </div>
    );
  }
  // picture-in-picture "facecam" card
  const fromRight = win.dock === 'right';
  return (
    <div
      style={{
        position: 'absolute',
        left: d.x,
        top: d.y,
        width: CARD.w,
        height: CARD.h,
        borderRadius: 28,
        overflow: 'hidden',
        opacity: vis,
        transform: `translateX(${(1 - vis) * (fromRight ? 120 : -120)}px) scale(${0.92 + 0.08 * vis})`,
        background: 'radial-gradient(ellipse at 50% 35%, #C3CCD4 0%, #8E9BA8 70%, #6E7B88 100%)',
        border: `2px solid ${alpha(C.cyan, 0.55)}`,
        boxShadow: `0 24px 60px rgba(0,0,0,0.55), 0 0 30px ${alpha(C.cyan, 0.18)}`,
      }}
    >
      <div style={{position: 'absolute', left: (CARD.w - d.w) / 2, top: 24}}>{body}</div>
      {/* live dot while he is talking */}
      <div style={{position: 'absolute', left: 14, top: 12, display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px', borderRadius: 999, background: 'rgba(4,6,12,0.65)'}}>
        <div style={{width: 9, height: 9, borderRadius: 5, background: sp.talking ? C.crimson : C.dim, boxShadow: sp.talking ? `0 0 8px ${C.crimson}` : undefined}} />
        <span style={{fontFamily: MONO, fontSize: 13, letterSpacing: 2, color: '#fff'}}>RAVI</span>
      </div>
    </div>
  );
};
