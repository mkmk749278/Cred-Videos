import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT, MONO, alpha} from '../theme';
import {CLAMP, rnd, spr} from '../lib/anim';
import {FPS, LEAD, script, timing, toFrame, Word} from '../lib/timing';
import {Sfx} from './primitives';

export type Music = 'tension' | 'analytic' | 'hope';

/* ------------------------------------------------------------------ backdrop */

export const Backdrop: React.FC<{tint?: string}> = ({tint = C.cyan}) => {
  const frame = useCurrentFrame();
  const dust = useMemo(
    () => new Array(46).fill(0).map((_, i) => ({x: rnd(i) * 1920, y: rnd(i + 99) * 1080, s: 1 + rnd(i + 7) * 2.6, v: 0.2 + rnd(i + 3) * 0.6, o: 0.15 + rnd(i + 11) * 0.35})),
    [],
  );
  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 60% at 30% 18%, ${alpha(tint, 0.16)}, transparent 70%), radial-gradient(ellipse 60% 60% at 85% 90%, ${alpha(C.violet, 0.08)}, transparent 70%), linear-gradient(180deg, ${C.bg2}, ${C.bg})`,
        }}
      />
      {/* perspective floor grid */}
      <div
        style={{
          position: 'absolute',
          left: -960,
          right: -960,
          top: 560,
          height: 1400,
          transform: 'perspective(900px) rotateX(72deg)',
          transformOrigin: 'top center',
          backgroundImage: `linear-gradient(${alpha(tint, 0.16)} 2px, transparent 2px), linear-gradient(90deg, ${alpha(tint, 0.16)} 2px, transparent 2px)`,
          backgroundSize: '90px 90px',
          backgroundPosition: `0px ${(frame * 0.9) % 90}px`,
          maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.9), transparent 70%)',
          WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,0.9), transparent 70%)',
        }}
      />
      {dust.map((d, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: (d.x + Math.sin(frame / 90 + i) * 20) % 1920,
            top: (d.y - frame * d.v + 1080 * 4) % 1080,
            width: d.s,
            height: d.s,
            borderRadius: '50%',
            background: '#fff',
            opacity: d.o,
          }}
        />
      ))}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.65) 100%)'}} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ title card + HUD */

const TitleCard: React.FC<{index: number}> = ({index}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const m = script.modules[index];
  const end = LEAD * FPS;
  if (frame > end + 4) return null;
  const p = spr(frame, fps, 2);
  const out = interpolate(frame, [end - 12, end], [0, 1], CLAMP);
  const line = interpolate(frame, [6, 30], [0, 1], CLAMP);
  const num = String(m.number).padStart(2, '0');
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: 1 - out, transform: `scale(${1 + out * 0.08})`, filter: out > 0 ? `blur(${out * 12}px)` : undefined}}>
      <div
        style={{
          position: 'absolute',
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 520,
          color: 'transparent',
          WebkitTextStroke: `3px ${alpha(C.cyan, 0.16)}`,
          transform: `translateY(${(1 - p) * 60}px)`,
          letterSpacing: -10,
        }}
      >
        {num}
      </div>
      <div style={{textAlign: 'center', transform: `translateY(${(1 - p) * 40}px)`, opacity: p}}>
        <div style={{fontFamily: MONO, color: C.cyan, fontSize: 28, letterSpacing: 10, fontWeight: 700}}>MODULE {num} / 13</div>
        <div style={{fontFamily: FONT, color: C.text, fontSize: 116, fontWeight: 900, letterSpacing: -2, marginTop: 14, textShadow: `0 0 40px ${alpha(C.cyan, 0.3)}`}}>{m.title}</div>
        <div style={{height: 4, width: 520 * line, margin: '18px auto', background: `linear-gradient(90deg, transparent, ${C.cyan}, transparent)`}} />
        <div style={{fontFamily: FONT, color: C.muted, fontSize: 38, fontWeight: 500, letterSpacing: 1}}>{m.kicker}</div>
      </div>
    </AbsoluteFill>
  );
};

const Hud: React.FC<{index: number; duration: number}> = ({index, duration}) => {
  const frame = useCurrentFrame();
  const m = script.modules[index];
  const start = LEAD * FPS - 6;
  const o = interpolate(frame, [start, start + 14], [0, 1], CLAMP);
  const prog = interpolate(frame, [start, duration], [0, 1], CLAMP);
  return (
    <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 110, opacity: o, fontFamily: FONT}}>
      <div style={{position: 'absolute', left: 64, top: 36, display: 'flex', alignItems: 'center', gap: 18}}>
        <div style={{fontFamily: MONO, fontWeight: 800, fontSize: 22, color: C.bg, background: C.cyan, borderRadius: 8, padding: '4px 10px'}}>
          {String(m.number).padStart(2, '0')}
        </div>
        <div style={{fontSize: 26, fontWeight: 800, color: C.text, letterSpacing: 0.5}}>{m.title}</div>
        <div style={{fontSize: 22, color: C.muted}}>· {m.kicker}</div>
      </div>
      <div style={{position: 'absolute', right: 64, top: 30, textAlign: 'right'}}>
        <div style={{fontFamily: MONO, fontSize: 18, letterSpacing: 4, color: C.gold, fontWeight: 700}}>KNOW YOUR RIGHTS</div>
        <div style={{fontSize: 15, color: C.dim, marginTop: 4, letterSpacing: 1}}>Awareness only · Not legal advice</div>
      </div>
      <div style={{position: 'absolute', left: 64, right: 64, top: 92, height: 2, background: 'rgba(148,163,184,0.12)'}}>
        <div style={{width: `${prog * 100}%`, height: '100%', background: C.cyan, boxShadow: `0 0 10px ${C.cyan}`}} />
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ word-by-word subtitles */

type Chunk = {words: Word[]; start: number; end: number};

const buildChunks = (index: number): Chunk[] => {
  const chunks: Chunk[] = [];
  for (const s of timing.modules[index].sentences) {
    let cur: Word[] = [];
    const flush = () => {
      if (cur.length) chunks.push({words: cur, start: cur[0].s, end: cur[cur.length - 1].e});
      cur = [];
    };
    s.words.forEach((w, i) => {
      cur.push(w);
      const remaining = s.words.length - i - 1;
      const punct = /[,;:—]$/.test(w.w);
      if ((cur.length >= 9 && remaining > 2) || (punct && cur.length >= 4 && remaining > 2)) flush();
    });
    flush();
  }
  return chunks;
};

const Subtitles: React.FC<{index: number}> = ({index}) => {
  const frame = useCurrentFrame();
  const chunks = useMemo(() => buildChunks(index), [index]);
  const t = frame / FPS - LEAD;
  let ci = -1;
  for (let i = 0; i < chunks.length; i++) {
    const next = chunks[i + 1];
    const hold = next ? Math.min(next.start - 0.12, chunks[i].end + 0.9) : chunks[i].end + 0.9;
    if (t >= chunks[i].start - 0.12 && t < hold) ci = i;
  }
  if (ci < 0) return null;
  const chunk = chunks[ci];
  const chunkIn = interpolate(t, [chunk.start - 0.12, chunk.start + 0.05], [0, 1], CLAMP);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent, rgba(2,4,10,0.82) 45%)'}} />
      <div style={{position: 'relative', maxWidth: 1560, textAlign: 'center', fontFamily: FONT, fontSize: 44, fontWeight: 750, lineHeight: 1.3, opacity: chunkIn}}>
        {chunk.words.map((w, i) => {
          const wf = toFrame(w.s);
          const blur = interpolate(frame, [wf - 4, wf], [8, 0], CLAMP);
          const o = interpolate(frame, [wf - 4, wf], [0.18, 1], CLAMP);
          const active = t >= w.s - 0.02 && t < w.e + 0.04;
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                margin: '0 11px',
                opacity: o,
                filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
                color: active ? C.cyan : C.text,
                textShadow: active ? '0 0 24px rgba(56, 189, 248, 0.75)' : '0 2px 10px rgba(0,0,0,0.6)',
                transform: active ? 'scale(1.06)' : undefined,
              }}
            >
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ shell */

export const SceneShell: React.FC<{
  index: number;
  duration: number;
  music: Music;
  tint?: string;
  children: React.ReactNode;
  /** extra transform applied to the stage (e.g. impact shake) */
  stageStyle?: React.CSSProperties;
}> = ({index, duration, music, tint = C.cyan, children, stageStyle}) => {
  const frame = useCurrentFrame();
  const m = timing.modules[index];
  const fadeIn = interpolate(frame, [0, 10], [1, 0], CLAMP);
  const fadeOut = interpolate(frame, [duration - 14, duration], [0, 1], CLAMP);
  const cam = {
    x: Math.sin(frame / 97) * 7 + Math.sin(frame / 31) * 1.2,
    y: Math.cos(frame / 131) * 5 + Math.cos(frame / 43) * 1,
    s: 1 + 0.012 * Math.sin(frame / 260),
  };
  const stageIn = interpolate(frame, [LEAD * FPS - 10, LEAD * FPS + 8], [0, 1], CLAMP);
  return (
    <AbsoluteFill style={{fontFamily: FONT, color: C.text, overflow: 'hidden'}}>
      <Backdrop tint={tint} />
      <Audio
        src={staticFile(`audio/music/${music}.mp3`)}
        loop
        volume={(f) => 0.13 * interpolate(f, [0, 20, duration - 24, duration], [0, 1, 1, 0], CLAMP)}
      />
      <Sequence from={Math.round(LEAD * FPS)} layout="none" name="voiceover">
        <Audio src={staticFile(`audio/vo/${m.id}.mp3`)} volume={1} />
      </Sequence>
      <Sfx at={0} name="title_hit" volume={0.32} />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 110,
          height: 770,
          opacity: stageIn,
          transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.s})`,
          ...stageStyle,
        }}
      >
        {children}
      </div>
      <Hud index={index} duration={duration} />
      <TitleCard index={index} />
      <Subtitles index={index} />
      <AbsoluteFill style={{background: '#000', opacity: Math.max(fadeIn, fadeOut), pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
