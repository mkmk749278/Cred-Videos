import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {interpolate} from '../lib/safeInterpolate';
import insertsData from '../data/inserts_te.json';
import {C, MONO, alpha} from '../theme';
import {CLAMP, SNAPPY, spr} from '../lib/anim';
import {FPS, LEAD, timing} from '../lib/timing';
import {Glass, Reveal, Sfx} from './primitives';

/**
 * Telugu edition only: explainer panels for what the Telugu narration says beyond the English visuals.
 * Data: src/data/inserts_te.json, keyed by module id; times are seconds of that module's Telugu narration.
 * While a panel is up the module's own stage is dimmed (see insertLevel / SceneShell).
 */

type Item = {at: number; text: string; te?: string; tone?: 'good' | 'bad' | 'warn' | 'info'};
export type Insert = {
  from: number;
  to: number;
  kind: 'points' | 'big' | 'compare' | 'steps';
  kicker?: string;
  title: string;
  te?: string;
  sub?: string;
  color?: 'cyan' | 'emerald' | 'crimson' | 'amber' | 'gold' | 'violet';
  items?: Item[];
  /** compare: left column header / right column header */
  left?: string;
  right?: string;
};

const DATA = insertsData as unknown as Record<string, Insert[]>;
const TE_FONT = "'Noto Sans Telugu', 'Inter', sans-serif";
const FADE = 12;
const f = (sec: number) => Math.round((LEAD + sec) * FPS);
const toneColor = (t?: Item['tone']) => (t === 'good' ? C.emerald : t === 'bad' ? C.crimson : t === 'warn' ? C.amber : C.cyan);

export const insertsFor = (index: number): Insert[] => DATA[timing.modules[index].id] ?? [];

/** 0..1 how much an insert covers the stage at `frame` */
export const insertLevel = (index: number, frame: number) => {
  let v = 0;
  for (const ins of insertsFor(index)) {
    const a = f(ins.from);
    const b = f(ins.to);
    v = Math.max(v, interpolate(frame, [a - FADE, a, b, b + FADE], [0, 1, 1, 0], CLAMP));
  }
  return v;
};

const Kicker: React.FC<{text: string; color: string}> = ({text, color}) => (
  <div style={{fontFamily: MONO, fontSize: 22, letterSpacing: 6, color, fontWeight: 700, textTransform: 'uppercase'}}>{text}</div>
);

const TeLine: React.FC<{text?: string; size?: number; color?: string}> = ({text, size = 34, color = C.muted}) =>
  text ? <div style={{fontFamily: TE_FONT, fontSize: size, fontWeight: 600, color, marginTop: 10, lineHeight: 1.4}}>{text}</div> : null;

const Panel: React.FC<{ins: Insert}> = ({ins}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = f(ins.from);
  const b = f(ins.to);
  const color = C[ins.color ?? 'cyan'];
  const pin = spr(frame, fps, a - FADE, SNAPPY);
  const out = interpolate(frame, [b, b + FADE], [0, 1], CLAMP);
  const items = ins.items ?? [];

  const header = (
    <div style={{textAlign: ins.kind === 'big' ? 'center' : 'left'}}>
      {ins.kicker && <Kicker text={ins.kicker} color={color} />}
      <div style={{fontSize: ins.kind === 'big' ? 72 : 54, fontWeight: 850, lineHeight: 1.1, marginTop: 12, letterSpacing: -1}}>{ins.title}</div>
      <TeLine text={ins.te} size={ins.kind === 'big' ? 40 : 32} />
      {ins.sub && <div style={{fontSize: 30, color: C.muted, marginTop: 14, lineHeight: 1.35}}>{ins.sub}</div>}
    </div>
  );

  let body: React.ReactNode = null;
  if (ins.kind === 'points') {
    body = (
      <div style={{display: 'flex', flexDirection: 'column', gap: 18, marginTop: 34}}>
        {items.map((it, i) => (
          <Reveal key={i} at={f(it.at)} from="left" distance={90}>
            <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
              <div style={{width: 54, height: 54, borderRadius: 16, background: alpha(toneColor(it.tone), 0.16), border: `2px solid ${toneColor(it.tone)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 24, color: toneColor(it.tone), flexShrink: 0}}>
                {it.tone === 'good' ? '✓' : it.tone === 'bad' ? '✕' : it.tone === 'warn' ? '!' : items.every((x) => !x.tone || x.tone === 'info') ? String(i + 1).padStart(2, '0') : '›'}
              </div>
              <div>
                <div style={{fontSize: 36, fontWeight: 750, lineHeight: 1.2}}>{it.text}</div>
                {it.te && <div style={{fontFamily: TE_FONT, fontSize: 26, color: C.muted, marginTop: 4}}>{it.te}</div>}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    );
  } else if (ins.kind === 'steps') {
    body = (
      <div style={{display: 'flex', alignItems: 'stretch', gap: 0, marginTop: 50, justifyContent: 'center'}}>
        {items.map((it, i) => {
          const on = spr(frame, fps, f(it.at), SNAPPY);
          return (
            <React.Fragment key={i}>
              {i > 0 && (
                <div style={{width: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: on}}>
                  <svg width={50} height={30}><path d="M2 15 H40 M30 5 L44 15 L30 25" stroke={color} strokeWidth={4} fill="none" strokeLinecap="round" /></svg>
                </div>
              )}
              <div style={{opacity: on, transform: `translateY(${(1 - on) * 40}px) scale(${0.9 + 0.1 * on})`, width: Math.min(330, 1500 / items.length - 60)}}>
                <Glass accent={toneColor(it.tone)} pad={24} style={{height: '100%', boxSizing: 'border-box'}}>
                  <div style={{fontFamily: MONO, fontSize: 20, color: toneColor(it.tone), fontWeight: 800, letterSpacing: 3}}>STEP {i + 1}</div>
                  <div style={{fontSize: 32, fontWeight: 800, marginTop: 10, lineHeight: 1.2}}>{it.text}</div>
                  {it.te && <div style={{fontFamily: TE_FONT, fontSize: 24, color: C.muted, marginTop: 8, lineHeight: 1.35}}>{it.te}</div>}
                </Glass>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    );
  } else if (ins.kind === 'compare') {
    const col = (side: 'bad' | 'good', head?: string) => (
      <Glass accent={side === 'good' ? C.emerald : C.crimson} pad={30} style={{flex: 1}}>
        <div style={{fontFamily: MONO, fontSize: 22, letterSpacing: 4, fontWeight: 800, color: side === 'good' ? C.emerald : C.crimson}}>{head}</div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 16, marginTop: 18}}>
          {items
            .filter((it) => (side === 'good' ? it.tone === 'good' : it.tone !== 'good'))
            .map((it, i) => (
              <Reveal key={i} at={f(it.at)} from={side === 'good' ? 'right' : 'left'} distance={60}>
                <div style={{display: 'flex', gap: 16, alignItems: 'flex-start'}}>
                  <div style={{fontSize: 32, fontWeight: 900, color: side === 'good' ? C.emerald : C.crimson, width: 30}}>{side === 'good' ? '✓' : '✕'}</div>
                  <div>
                    <div style={{fontSize: 32, fontWeight: 700, lineHeight: 1.22}}>{it.text}</div>
                    {it.te && <div style={{fontFamily: TE_FONT, fontSize: 24, color: C.muted, marginTop: 4}}>{it.te}</div>}
                  </div>
                </div>
              </Reveal>
            ))}
        </div>
      </Glass>
    );
    body = (
      <div style={{display: 'flex', gap: 40, marginTop: 36}}>
        {col('bad', ins.left ?? 'AVOID')}
        {col('good', ins.right ?? 'DO THIS')}
      </div>
    );
  } else {
    // big: one statement, items become chips underneath
    body = items.length ? (
      <div style={{display: 'flex', gap: 22, justifyContent: 'center', flexWrap: 'wrap', marginTop: 44}}>
        {items.map((it, i) => (
          <Reveal key={i} at={f(it.at)} from="scale">
            <div style={{padding: '14px 28px', borderRadius: 999, border: `2px solid ${toneColor(it.tone)}`, background: alpha(toneColor(it.tone), 0.12), fontSize: 32, fontWeight: 750, whiteSpace: 'nowrap'}}>
              {it.text}
              {it.te && <span style={{fontFamily: TE_FONT, fontSize: 26, color: C.muted, marginLeft: 14}}>{it.te}</span>}
            </div>
          </Reveal>
        ))}
      </div>
    ) : null;
  }

  const wide = ins.kind === 'compare' || ins.kind === 'steps';
  const life = interpolate(frame, [a, b], [0, 1], CLAMP);
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 130,
        bottom: 210,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: Math.min(1, pin) * (1 - out),
        transform: `translateY(${(1 - pin) * 50 + out * -30}px) scale(${0.97 + 0.03 * pin})`,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: wide ? 1640 : 1360,
          padding: '44px 56px 48px',
          borderRadius: 32,
          background: 'linear-gradient(150deg, rgba(15, 23, 42, 0.78), rgba(8, 12, 24, 0.66))',
          border: `1.5px solid ${alpha(color, 0.35)}`,
          boxShadow: `0 40px 120px rgba(0,0,0,0.55), 0 0 60px ${alpha(color, 0.12)}, inset 0 1px 0 rgba(255,255,255,0.07)`,
          overflow: 'hidden',
        }}
      >
        {/* accent spine + soft glow in the corner */}
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, background: `linear-gradient(180deg, ${color}, ${alpha(color, 0.1)})`}} />
        <div style={{position: 'absolute', right: -160, top: -160, width: 420, height: 420, borderRadius: '50%', background: `radial-gradient(circle, ${alpha(color, 0.16)}, transparent 70%)`}} />
        {/* time-left bar */}
        <div style={{position: 'absolute', left: 6, bottom: 0, height: 4, width: `${(1 - life) * 100}%`, background: alpha(color, 0.55)}} />
        {header}
        {body}
      </div>
      <Sfx at={a - FADE} name="air_whoosh" volume={0.16} />
      {items.map((it, i) => (
        <Sfx key={i} at={f(it.at)} name="node_pop" volume={0.18} />
      ))}
    </div>
  );
};

export const TeluguInserts: React.FC<{index: number}> = ({index}) => {
  const frame = useCurrentFrame();
  return (
    <>
      {insertsFor(index).map((ins, i) => {
        if (frame < f(ins.from) - FADE - 2 || frame > f(ins.to) + FADE + 2) return null;
        return <Panel key={i} ins={ins} />;
      })}
    </>
  );
};
