import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {interpolate} from '../lib/safeInterpolate';
import timing from '../data/timing.json';
import {C, FONT, MONO, alpha} from '../theme';
import {blendArms, POSES, PoseName} from './Arms';
import {blendMood, Borrower, Checkmark, Lightbulb, Mood, MOODS, Mouth, QuestionMarks, RingWaves, ShockLines, Sparkles, SweatDrop} from './Borrower';

/* ---------------- keyframed performance ---------------- */

type Key = {f: number; pose: PoseName; mood: Mood; dur?: number; label: string; tilt?: number; turn?: number};

const SPEAK_FROM = 580;
const LINE_START = 46.7; // seconds into m01.mp3
const LINE_END = 53.8;
const SPEAK_LEN = Math.round((LINE_END - LINE_START) * 30);

export const KEYS: Key[] = [
  {f: 0, pose: 'down', mood: 'neutral', label: 'Idle · breathing, blinking, looking around'},
  {f: 96, pose: 'crossed', mood: 'worried', dur: 16, label: 'Worried · arms fold smoothly', tilt: -3},
  {f: 204, pose: 'phone', mood: 'shocked', dur: 14, label: 'Phone rings · hand rises to the ear'},
  {f: 304, pose: 'scratch', mood: 'confused', dur: 16, label: 'Confused · “Section 420?”', tilt: 6, turn: 0.4},
  {f: 394, pose: 'paper', mood: 'sad', dur: 16, label: 'Stressed · holding the bill', tilt: -4},
  {f: 494, pose: 'chin', mood: 'thinking', dur: 16, label: 'Thinking · hand to chin', tilt: 3, turn: -0.3},
  {f: SPEAK_FROM, pose: 'palm', mood: 'explaining', dur: 14, label: 'Explaining · lip-synced to the real narration'},
  {f: SPEAK_FROM + SPEAK_LEN + 6, pose: 'letter', mood: 'happy', dur: 16, label: 'Relieved · the settlement letter'},
  {f: SPEAK_FROM + SPEAK_LEN + 80, pose: 'letterThumb', mood: 'happy', dur: 14, label: 'Thumbs up'},
  {f: SPEAK_FROM + SPEAK_LEN + 170, pose: 'wave', mood: 'happy', dur: 16, label: 'Bye!'},
];
export const PERFORMANCE_FRAMES = SPEAK_FROM + SPEAK_LEN + 260;

const ease = Easing.bezier(0.45, 0, 0.25, 1);

const stateAt = (f: number) => {
  let i = 0;
  while (i + 1 < KEYS.length && KEYS[i + 1].f <= f) i++;
  const k = KEYS[i];
  const prev = KEYS[Math.max(0, i - 1)];
  const t = i === 0 ? 1 : ease(Math.min(1, (f - k.f) / (k.dur ?? 14)));
  return {k, prev, t, i};
};

/* ---------------- lip-sync from word timings ---------------- */

type W = {w: string; s: number; e: number};
const WORDS: W[] = timing.modules[0].sentences.flatMap((s) => s.words as W[]).filter((w) => w.s >= LINE_START - 0.05 && w.e <= LINE_END + 0.05);
const STRESS = ['steal', 'cheat', 'money', 'crime'];

const visemes = (word: string): Mouth[] => {
  const out: Mouth[] = [];
  for (const ch of word.toLowerCase().replace(/[^a-z]/g, '')) {
    const v: Mouth | null = 'a'.includes(ch) ? 'A' : 'eiy'.includes(ch) ? 'E' : 'ouw'.includes(ch) ? 'O' : 'mbp'.includes(ch) ? 'M' : 'fv'.includes(ch) ? 'E' : null;
    if (v && out[out.length - 1] !== v) out.push(v);
  }
  return out.length ? out : ['A'];
};

const speech = (sec: number): {mouth: Mouth; stress: number} => {
  const w = WORDS.find((x) => sec >= x.s && sec < x.e);
  let stress = 0;
  for (const x of WORDS) {
    if (STRESS.some((s) => x.w.toLowerCase().startsWith(s))) {
      stress = Math.max(stress, interpolate(sec, [x.s - 0.05, x.s + 0.1, x.e + 0.2], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
    }
  }
  if (!w) return {mouth: 'M', stress};
  const seq = visemes(w.w);
  const p = (sec - w.s) / Math.max(0.05, w.e - w.s);
  return {mouth: seq[Math.min(seq.length - 1, Math.floor(p * seq.length))], stress};
};

/* ---------------- the composition ---------------- */

export const CharacterPerformance: React.FC = () => {
  const f = useCurrentFrame();
  const {k, prev, t} = stateAt(f);
  let arms = blendArms(POSES[prev.pose], POSES[k.pose], t);
  const spec = blendMood(MOODS[prev.mood], MOODS[k.mood], t);
  const tilt = interpolate(t, [0, 1], [prev.tilt ?? 0, k.tilt ?? 0]) + Math.sin(f / 31) * 1.2;
  let turn = interpolate(t, [0, 1], [prev.turn ?? 0, k.turn ?? 0]);

  // idle life: breathing, blinks, eye saccades
  const breathe = Math.sin(f / 22);
  const cyc = f % 87;
  let blink = cyc < 3 ? cyc / 3 : cyc < 6 ? (6 - cyc) / 3 : 0;
  const sacc = Math.floor(f / 38);
  let look: [number, number] = [spec.look[0] + Math.sin(sacc * 2.3) * 0.25, spec.look[1] + Math.cos(sacc * 1.7) * 0.15];
  if (k.pose === 'down' && f < 96) {
    look = f < 30 ? [0, 0] : f < 58 ? [-0.8, 0.1] : f < 84 ? [0.8, -0.1] : [0, 0];
    turn = f < 30 ? 0 : f < 58 ? -0.35 : f < 84 ? 0.35 : 0;
  }

  // talking
  let mouth: Mouth | undefined;
  let browLift = 0;
  let nod = 0;
  const speaking = f >= SPEAK_FROM + 4 && f < SPEAK_FROM + SPEAK_LEN;
  if (speaking) {
    const sp = speech(LINE_START + (f - SPEAK_FROM) / 30);
    mouth = sp.mouth;
    browLift = sp.stress * 7;
    nod = sp.stress * 6;
    blink = sp.stress > 0.9 ? 0.4 : blink;
    look = [0, 0];
    // the open hand gestures in rhythm with the words
    arms = {...arms, R: {...arms.R, wr: [arms.R.wr[0] + Math.sin(f / 8) * 12 - sp.stress * 18, arms.R.wr[1] + Math.cos(f / 7) * 8 - sp.stress * 26], rot: (arms.R.rot ?? 0) + sp.stress * 12}};
  }
  if (k.pose === 'phone' && t >= 1) arms = {...arms, R: {...arms.R, wr: [arms.R.wr[0] + Math.sin(f * 1.7) * 1.5, arms.R.wr[1] + Math.cos(f * 2.1) * 1.5]}};
  if (k.pose === 'wave') arms = {...arms, R: {...arms.R, rot: (arms.R.rot ?? 0) + Math.sin(f / 4) * 22}};
  if (k.pose === 'letterThumb' && t >= 1) arms = {...arms, L: {...arms.L, wr: [arms.L.wr[0], arms.L.wr[1] - Math.abs(Math.sin(f / 6)) * 10]}};
  const shrug = k.mood === 'confused' ? 8 * t : k.mood === 'shocked' ? 6 * t : 0;
  const shake = k.mood === 'shocked' && t >= 1 ? Math.sin(f * 2.4) * 2 : 0;
  const bob = k.mood === 'happy' ? -Math.abs(Math.sin(f / 7)) * 5 : 0;
  const p = (f % 45) / 45;
  const since = f - k.f;

  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 38%, #C3CCD4 0%, #9AA7B3 58%, #7A8794 100%)', fontFamily: FONT}}>
      {/* soft floor shadow + vignette */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 120%, rgba(0,0,0,0.35), transparent 55%)'}} />
      <div style={{position: 'absolute', left: 960 - 380, top: 40, transform: `translate(${shake}px, ${bob}px)`}}>
        <Borrower arms={arms} spec={spec} mouth={mouth} blink={blink} look={look} tilt={tilt} turn={turn} nod={nod} shrug={shrug} breathe={breathe} browLift={browLift} width={760}>
          {k.mood === 'worried' && since > 20 && <SweatDrop t={p} />}
          {k.pose === 'crossed' && since > 30 && <g opacity={Math.min(1, (since - 30) / 10)}><QuestionMarks t={p} /></g>}
          {k.pose === 'phone' && since > 10 && (
            <>
              <RingWaves t={p} x={452} y={330} />
              {since > 24 && <ShockLines t={p} />}
            </>
          )}
          {k.pose === 'scratch' && since > 10 && <QuestionMarks t={p} />}
          {k.pose === 'chin' && since > 40 && <g opacity={Math.min(1, (since - 40) / 8)}><Lightbulb t={p} /></g>}
          {k.mood === 'happy' && since > 12 && <Sparkles t={p} />}
          {k.pose === 'letterThumb' && since > 6 && <Checkmark t={Math.min(1, (since - 6) / 20)} />}
        </Borrower>
      </div>
      {/* the narration line, word by word */}
      <Sequence from={SPEAK_FROM} durationInFrames={SPEAK_LEN}>
        <Audio src={staticFile('audio/vo/m01.mp3')} startFrom={Math.round(LINE_START * 30)} endAt={Math.round(LINE_END * 30)} />
      </Sequence>
      {f >= SPEAK_FROM && f < SPEAK_FROM + SPEAK_LEN + 10 && (
        <div style={{position: 'absolute', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', bottom: 36, textAlign: 'center', fontSize: 36, fontWeight: 800, color: '#0F172A', padding: '14px 28px', borderRadius: 18, background: 'rgba(255,255,255,0.7)'}}>
          {(() => {
            const sec = LINE_START + (f - SPEAK_FROM) / 30;
            // only the sentence being spoken
            const groups: W[][] = [[]];
            WORDS.forEach((w) => {
              groups[groups.length - 1].push(w);
              if (/[.!?]$/.test(w.w)) groups.push([]);
            });
            const cur = groups.filter((g) => g.length).find((g) => sec < g[g.length - 1].e + 0.15) ?? groups.filter((g) => g.length).slice(-1)[0];
            return cur.map((w, i) => (
              <span key={i} style={{opacity: sec >= w.s ? 1 : 0.3, color: sec >= w.s && sec < w.e ? C.royal : '#0F172A', marginRight: 12}}>
                {w.w}
              </span>
            ));
          })()}
        </div>
      )}
      {/* beat label */}
      <div style={{position: 'absolute', left: 50, top: 40, padding: '12px 22px', borderRadius: 14, background: alpha('#0F172A', 0.8), color: '#fff', opacity: interpolate(since, [0, 10], [0, 1], {extrapolateRight: 'clamp'})}}>
        <div style={{fontFamily: MONO, fontSize: 16, letterSpacing: 4, color: C.gold}}>CHARACTER TEST</div>
        <div style={{fontSize: 28, fontWeight: 800, marginTop: 4}}>{k.label}</div>
      </div>
    </AbsoluteFill>
  );
};
