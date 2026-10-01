import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT, MONO, alpha} from '../theme';
import {CLAMP, rnd, spr} from '../lib/anim';
import {contentStart, FPS, LEAD, script, timing, toFrame, Word} from '../lib/timing';
import {Sfx} from './primitives';
import {HostConfig, RaviHost} from '../character/RaviHost';
import {HOSTS} from '../character/hosts';
import {speechAt, W} from '../character/lipsync';
import {sceneFrames} from '../lib/timing';
import {STRESS} from '../lib/emphasis';

export type Music = 'tension' | 'analytic' | 'hope';

/* ------------------------------------------------------------------ backdrop */

export const Backdrop: React.FC<{tint?: string; beat?: number; phase?: number}> = ({tint = C.cyan, beat, phase = 0}) => {
  const frame = useCurrentFrame();
  // subtle pulse on the floor grid, in time with the music bed
  const pulse = beat && frame >= phase ? Math.exp(-((frame - phase) % beat) / 5) : 0;
  const gridA = 0.16 + 0.12 * pulse;
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
          backgroundImage: `linear-gradient(${alpha(tint, gridA)} 2px, transparent 2px), linear-gradient(90deg, ${alpha(tint, gridA)} 2px, transparent 2px)`,
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

/** 13-step journey: finished modules checked, current one pulsing */
const Journey: React.FC<{index: number; at: number}> = ({index, at}) => {
  const frame = useCurrentFrame();
  const n = script.modules.length;
  const w = 1000;
  const fill = interpolate(frame, [at, at + 24], [Math.max(0, index - 1), index], CLAMP) / (n - 1);
  return (
    <div style={{position: 'relative', width: w, height: 40, margin: '0 auto', opacity: interpolate(frame, [at - 6, at + 6], [0, 1], CLAMP)}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 19, height: 3, background: 'rgba(148,163,184,0.2)'}} />
      <div style={{position: 'absolute', left: 0, width: w * fill, top: 19, height: 3, background: C.emerald, boxShadow: `0 0 10px ${C.emerald}`}} />
      {script.modules.map((m, i) => {
        const done = i < index;
        const cur = i === index;
        const size = cur ? 26 : 16;
        return (
          <div
            key={m.id}
            style={{
              position: 'absolute',
              left: (i / (n - 1)) * w - size / 2,
              top: 20 - size / 2,
              width: size,
              height: size,
              borderRadius: '50%',
              background: done ? C.emerald : cur ? C.cyan : C.bg2,
              border: `2px solid ${done ? C.emerald : cur ? C.cyan : 'rgba(148,163,184,0.35)'}`,
              boxShadow: cur ? `0 0 ${14 + 6 * Math.sin(frame / 6)}px ${C.cyan}` : undefined,
              display: 'grid',
              placeItems: 'center',
              fontSize: 10,
              fontWeight: 900,
              color: C.bg,
            }}
          >
            {done ? '✓' : ''}
          </div>
        );
      })}
    </div>
  );
};

const TitleCard: React.FC<{index: number}> = ({index}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const m = script.modules[index];
  const end = Math.max(contentStart(index), 42);
  if (frame > end + 4) return null;
  const slam = spr(frame, fps, 0, {damping: 14, stiffness: 220, mass: 0.6});
  const out = interpolate(frame, [end - 10, end], [0, 1], CLAMP);
  const line = interpolate(frame, [4, 20], [0, 1], CLAMP);
  // bridge modules: after the slam the title docks to the right while Ravi delivers the bridge line on the left
  const dock = m.bridge && HOSTS[index] ? interpolate(frame, [24, 40], [0, 1], CLAMP) : 0;
  // without a host the recap sits centred under the title once the bridge line starts
  const recapIn = m.bridge ? interpolate(frame, [24, 40], [0, 1], CLAMP) : 0;
  const de = dock * dock * (3 - 2 * dock);
  const num = String(m.number).padStart(2, '0');
  return (
    <AbsoluteFill style={{opacity: 1 - out, filter: out > 0 ? `blur(${out * 10}px)` : undefined}}>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `translate(${de * 330}px, ${-de * 70}px) scale(${(1 - de * 0.24) * (1 + 0.05 * interpolate(frame, [20, end], [0, 1], CLAMP))})`}}>
        <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, fontSize: 520, color: 'transparent', WebkitTextStroke: `3px ${alpha(C.cyan, 0.16)}`, letterSpacing: -10, transform: `scale(${1.5 - 0.5 * slam})`, opacity: slam}}>{num}</div>
        <div style={{textAlign: 'center', transform: `scale(${1.25 - 0.25 * slam})`, opacity: Math.min(1, slam * 1.4), filter: slam < 0.9 ? `blur(${(1 - slam) * 10}px)` : undefined}}>
          <div style={{fontFamily: MONO, color: C.cyan, fontSize: 28, letterSpacing: 10, fontWeight: 700}}>CHAPTER {num} / 13</div>
          <div style={{fontFamily: FONT, color: C.text, fontSize: 116, fontWeight: 900, letterSpacing: -2, marginTop: 14, textShadow: `0 0 40px ${alpha(C.cyan, 0.3)}`, whiteSpace: 'nowrap'}}>{m.title}</div>
          <div style={{height: 4, width: 520 * line, margin: '18px auto', background: `linear-gradient(90deg, transparent, ${C.cyan}, transparent)`}} />
          <div style={{fontFamily: FONT, color: C.muted, fontSize: 38, fontWeight: 500, letterSpacing: 1}}>{m.kicker}</div>
        </div>
      </AbsoluteFill>
      {m.recap && (
        <div style={{position: 'absolute', left: de > 0 ? 820 : 0, right: de > 0 ? 60 : 0, top: de > 0 ? 640 : 700, display: 'flex', justifyContent: 'center', opacity: recapIn, transform: `translateY(${(1 - recapIn) * 30}px)`}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '14px 26px', borderRadius: 999, background: alpha(C.emerald, 0.12), border: `1.5px solid ${alpha(C.emerald, 0.6)}`, maxWidth: 1000}}>
            <span style={{fontFamily: MONO, fontSize: 20, letterSpacing: 3, color: C.emerald, fontWeight: 800}}>SO FAR</span>
            <span style={{fontFamily: FONT, fontSize: 28, fontWeight: 700, color: C.text}}>{m.recap}</span>
          </div>
        </div>
      )}
      <div style={{position: 'absolute', left: de > 0 ? 760 : 460, top: de > 0 ? 760 : 820}}>
        <Journey index={index} at={8} />
      </div>
    </AbsoluteFill>
  );
};

const Hud: React.FC<{index: number; duration: number}> = ({index, duration}) => {
  const frame = useCurrentFrame();
  const m = script.modules[index];
  const start = contentStart(index) - 6;
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

/**
 * Music bed level with ducking: sits under the voice while a sentence is spoken and rises a little in
 * pauses and on the title card. Ramps over ~0.3 s so the dips are not audible as pumping.
 */
export const MUSIC_BY_MODULE: Music[] = ['tension', 'tension', 'analytic', 'analytic', 'analytic', 'analytic', 'tension', 'tension', 'analytic', 'analytic', 'hope', 'hope', 'hope'];
const TRACK_FRAMES: Record<Music, number> = {tension: 11300, analytic: 11300, hope: 8600};
/** where in its music track a module starts, so consecutive modules continue the track instead of restarting */
const musicOffset = (index: number) => {
  const bed = MUSIC_BY_MODULE[index];
  let f = 0;
  for (let k = 0; k < index; k++) if (MUSIC_BY_MODULE[k] === bed) f += sceneFrames(k);
  return f % (TRACK_FRAMES[bed] - 600);
};
const MUSIC_UNDER_VOICE = 0.075;
const MUSIC_OPEN = 0.16;
const duckCache = new Map<number, [number, number][]>();
const musicLevel = (index: number, f: number) => {
  let spans = duckCache.get(index);
  if (!spans) {
    spans = timing.modules[index].sentences.map((s) => [toFrame(s.start) - 6, toFrame(s.end) + 8] as [number, number]);
    duckCache.set(index, spans);
  }
  // distance (frames) to the nearest spoken span; 0 inside one
  let d = Infinity;
  for (const [a, b] of spans) {
    if (f >= a && f <= b) {
      d = 0;
      break;
    }
    d = Math.min(d, f < a ? a - f : f - b);
  }
  const open = interpolate(d, [0, 9], [0, 1], CLAMP);
  return MUSIC_UNDER_VOICE + (MUSIC_OPEN - MUSIC_UNDER_VOICE) * open;
};

export const SceneShell: React.FC<{
  index: number;
  duration: number;
  music: Music;
  tint?: string;
  children: React.ReactNode;
  /** extra transform applied to the stage (e.g. impact shake) */
  stageStyle?: React.CSSProperties;
  /** Ravi as on-screen narrator for this module */
  host?: HostConfig;
}> = ({index, duration, music, tint = C.cyan, children, stageStyle, host: hostProp}) => {
  const host = hostProp ?? HOSTS[index];
  const frame = useCurrentFrame();
  const m = timing.modules[index];
  const fadeIn = interpolate(frame, [0, 10], [1, 0], CLAMP);
  const fadeOut = interpolate(frame, [duration - 14, duration], [0, 1], CLAMP);
  const words = useMemo(() => timing.modules[index].sentences.flatMap((x) => x.words as W[]), [index]);
  const stressWords = host?.stress ?? STRESS[index] ?? [];
  const punch = stressWords.length ? speechAt(words, frame / FPS - LEAD, stressWords).stress : 0;
  const cam = {
    x: Math.sin(frame / 97) * 7 + Math.sin(frame / 31) * 1.2,
    y: Math.cos(frame / 131) * 5 + Math.cos(frame / 43) * 1,
    s: 1 + 0.03 * interpolate(frame, [0, duration], [0, 1], CLAMP) + 0.035 * punch,
  };
  const hostCfg: HostConfig | undefined = host
    ? {...host, windows: script.modules[index].bridge ? [{from: 26, to: contentStart(index) - 2, dock: 'stage'}, ...host.windows] : host.windows}
    : undefined;
  const cs = contentStart(index);
  const stageIn = interpolate(frame, [cs - 10, cs + 8], [0, 1], CLAMP);
  return (
    <AbsoluteFill style={{fontFamily: FONT, color: C.text, overflow: 'hidden'}}>
      <Backdrop tint={tint} />
      <Audio
        src={staticFile(`audio/music/${music}.mp3`)}
        startFrom={musicOffset(index)}
        loop
        volume={(f) => musicLevel(index, f) * interpolate(f, [0, 20, duration - 24, duration], [0, 1, 1, 0], CLAMP)}
      />
      <Sequence from={Math.round(LEAD * FPS)} layout="none" name="voiceover">
        <Audio src={staticFile(`audio/vo/${m.id}.mp3`)} volume={1} />
      </Sequence>
      <Sfx at={0} name="title_hit" volume={0.32} />
      {script.modules[index].bridge && <Sfx at={Math.round(LEAD * FPS) - 6} name="air_whoosh" volume={0.22} />}
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
      {hostCfg && <RaviHost index={index} config={hostCfg} />}
      <Subtitles index={index} />
      <AbsoluteFill style={{background: '#000', opacity: Math.max(fadeIn, fadeOut), pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
