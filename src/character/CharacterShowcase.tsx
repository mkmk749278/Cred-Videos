import React from 'react';
import {AbsoluteFill, interpolate, Sequence, useCurrentFrame} from 'remotion';
import {C, FONT, MONO, alpha} from '../theme';
import {AngerMark, Borrower, Checkmark, Lightbulb, Mood, Mouth, Pose, QuestionMarks, RingWaves, ShockLines, Sparkles, SweatDrop} from './Borrower';

type Situation = {mood: Mood; pose: Pose; title: string; line: string; tint: string; prop?: (t: number) => React.ReactNode; tilt?: number; talk?: boolean};

export const SITUATIONS: Situation[] = [
  {mood: 'worried', pose: 'crossed', title: 'Worried', line: '“40 calls a day…”', tint: C.amber, prop: (t) => <SweatDrop t={t} />, tilt: -3},
  {mood: 'confused', pose: 'scratch', title: 'Confused', line: '“Section 420? Me?”', tint: '#E9C46A', prop: (t) => <QuestionMarks t={t} />, tilt: 6},
  {mood: 'shocked', pose: 'phone', title: 'Shocked', line: '“Police will come?!”', tint: C.crimson, prop: (t) => (<><ShockLines t={t} /><RingWaves t={t} x={480} y={360} /></>)},
  {mood: 'sad', pose: 'paper', title: 'Stressed', line: '“₹1 lakh became ₹1.39 lakh”', tint: C.slate, tilt: -4},
  {mood: 'worried', pose: 'cheeks', title: 'Overwhelmed', line: '“What do I do now?”', tint: C.violet, prop: (t) => <SweatDrop t={t} />},
  {mood: 'thinking', pose: 'chin', title: 'Thinking', line: '“Wait… what does the law say?”', tint: C.cyan, prop: (t) => <Lightbulb t={t} />, tilt: 3},
  {mood: 'explaining', pose: 'palm', title: 'Explaining', line: '“It’s a civil matter.”', tint: C.royal, talk: true},
  {mood: 'angry', pose: 'point', title: 'Standing firm', line: '“Show me your ID first.”', tint: C.orange, prop: (t) => <AngerMark t={t} />},
  {mood: 'happy', pose: 'thumbsUp', title: 'Relieved', line: '“Settled. No Dues Certificate!”', tint: C.emerald, prop: (t) => (<><Sparkles t={t} /><Checkmark t={Math.min(1, t * 2)} /></>), tilt: 2},
];

const VISEMES: Mouth[] = ['A', 'E', 'M', 'O', 'A', 'flat', 'E', 'A', 'M', 'O'];

/** idle life: breathing, blinks, small sway */
const useLife = (frame: number, seed = 0) => {
  const breathe = Math.sin((frame + seed * 13) / 22);
  const cyc = (frame + seed * 29) % 84;
  const blink = cyc < 3 ? cyc / 3 : cyc < 6 ? (6 - cyc) / 3 : 0;
  return {breathe, blink};
};

const Character: React.FC<{s: Situation; frame: number; width: number; seed?: number}> = ({s, frame, width, seed = 0}) => {
  const {breathe, blink} = useLife(frame, seed);
  const t = (frame % 45) / 45;
  const shake = s.mood === 'shocked' ? Math.sin(frame * 2.2) * 2.5 : 0;
  const bob = s.mood === 'happy' ? Math.abs(Math.sin(frame / 7)) * -6 : 0;
  const mouth = s.talk ? VISEMES[Math.floor(frame / 4) % VISEMES.length] : undefined;
  return (
    <div style={{transform: `translate(${shake}px, ${bob}px)`}}>
      <Borrower mood={s.mood} pose={s.pose} mouth={mouth} blink={blink} breathe={breathe} tilt={(s.tilt ?? 0) + Math.sin(frame / 30) * 1.2} browLift={s.talk ? Math.max(0, Math.sin(frame / 9)) * 4 : 0} width={width}>
        {s.prop?.(t)}
      </Borrower>
    </div>
  );
};

/** One still "model sheet": nine moods in a grid */
export const CharacterSheet: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 0%, #13213D 0%, ${C.bg} 70%)`, fontFamily: FONT, color: C.text}}>
      <div style={{position: 'absolute', top: 26, left: 0, right: 0, textAlign: 'center'}}>
        <div style={{fontFamily: MONO, fontSize: 18, letterSpacing: 6, color: C.gold}}>CHARACTER MODEL SHEET</div>
        <div style={{fontSize: 40, fontWeight: 900, marginTop: 4}}>“Ravi”, our borrower — moods &amp; situations</div>
      </div>
      <div style={{position: 'absolute', top: 120, left: 40, right: 40, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 18}}>
        {SITUATIONS.concat([{mood: 'neutral', pose: 'down', title: 'Neutral', line: 'Default / listening', tint: C.muted}]).map((s, i) => (
          <div key={i} style={{height: 450, borderRadius: 22, background: `linear-gradient(180deg, ${alpha(s.tint, 0.22)}, rgba(15,23,42,0.85))`, border: `1.5px solid ${alpha(s.tint, 0.5)}`, overflow: 'hidden', position: 'relative'}}>
            <div style={{position: 'absolute', left: 0, right: 0, top: 6, display: 'flex', justifyContent: 'center'}}>
              <Character s={s} frame={frame + i * 7} width={270} seed={i} />
            </div>
            <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, padding: '12px 14px', background: 'rgba(4,6,12,0.8)'}}>
              <div style={{fontSize: 24, fontWeight: 900, color: s.tint}}>{s.title}</div>
              <div style={{fontSize: 17, color: C.muted, marginTop: 2}}>{s.line}</div>
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const REEL_SEG = 80;

/** Animated reel: each situation plays for REEL_SEG frames with life + props */
export const CharacterReel: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: FONT, color: C.text}}>
      {SITUATIONS.map((s, i) => (
        <Sequence key={i} from={i * REEL_SEG} durationInFrames={REEL_SEG + 10}>
          <ReelShot s={s} index={i} />
        </Sequence>
      ))}
      <div style={{position: 'absolute', left: 60, bottom: 40, fontFamily: MONO, fontSize: 18, color: C.dim, letterSpacing: 3}}>CHARACTER TEST · {String(Math.min(SITUATIONS.length, Math.floor(frame / REEL_SEG) + 1)).padStart(2, '0')}/{SITUATIONS.length}</div>
    </AbsoluteFill>
  );
};

const ReelShot: React.FC<{s: Situation; index: number}> = ({s, index}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 10, REEL_SEG, REEL_SEG + 10], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const pop = interpolate(f, [0, 12], [0.92, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity: o, background: `radial-gradient(ellipse at 35% 45%, ${alpha(s.tint, 0.28)} 0%, ${C.bg} 65%)`}}>
      <div style={{position: 'absolute', left: 170, top: 40, transform: `scale(${pop})`, transformOrigin: '50% 100%'}}>
        <Character s={s} frame={f} width={720} seed={index} />
      </div>
      <div style={{position: 'absolute', left: 1020, top: 360, width: 820}}>
        <div style={{fontFamily: MONO, fontSize: 22, letterSpacing: 6, color: s.tint, opacity: interpolate(f, [6, 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>MOOD · {s.title.toUpperCase()}</div>
        <div style={{fontSize: 64, fontWeight: 900, lineHeight: 1.1, marginTop: 14, opacity: interpolate(f, [10, 22], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}), transform: `translateY(${interpolate(f, [10, 22], [20, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}px)`}}>{s.line}</div>
      </div>
    </AbsoluteFill>
  );
};

/** Close-up hero frame in the style of the reference: worried, arms crossed, soft studio backdrop */
export const CharacterHero: React.FC = () => {
  const frame = useCurrentFrame();
  const {breathe, blink} = useLife(frame, 2);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #B9C3CC 0%, #96A3AF 60%, #7E8B98 100%)'}}>
      <div style={{position: 'absolute', left: 960 - 450, top: -10}}>
        <Borrower mood="worried" pose="crossed" blink={blink} breathe={breathe} tilt={-2} width={900}>
          <QuestionMarks t={(frame % 45) / 45} />
        </Borrower>
      </div>
    </AbsoluteFill>
  );
};
