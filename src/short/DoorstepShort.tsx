import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {interpolate} from '../lib/safeInterpolate';
import {C, MONO, alpha} from '../theme';
import {CLAMP, SNAPPY, easeInOut, rnd, spr} from '../lib/anim';
import {Sfx} from '../components/primitives';
import {L, LINES, VO_SECONDS} from './doorstepLines';

/**
 * "Doorstep defense" — 9:16 Telugu short (YouTube Shorts / Instagram Reels), ElevenLabs narration.
 * 1080×1920 @ 60 fps. Every beat keys off a spoken phrase in doorstepLines.ts.
 * Safe area: platform UI covers the top ~200 px, the bottom ~470 px (title, buttons) and the right ~150 px,
 * so the stage lives in y 230–1180, captions in y 1200–1430, nothing important past x 930.
 */

export const DS_W = 1080;
export const DS_H = 1920;
export const DS_FPS = 60;
export const DS_FRAMES = Math.ceil((VO_SECONDS + 0.5) * DS_FPS);

const FONT = "'Inter', 'Noto Sans Telugu', sans-serif";
const TE = "'Noto Sans Telugu', 'Inter', sans-serif";
const f = (sec: number) => Math.round(sec * DS_FPS);
const S = (id: string) => f(L[id].s);
const E = (id: string) => f(L[id].e);
const LEFT = 64;
const STAGE_W = DS_W - LEFT - 150 + 40; // a little into the right column is fine for non-critical art

// beat windows (frames) — each beat holds until the next phrase group starts
const W = {
  door: [0, S('ask2') - 6],
  check: [S('ask2') - 6, S('trust') - 14],
  ninety: [S('trust') - 14, S('most') - 10],
  bans: [S('most') - 10, S('threat') - 12],
  call: [S('threat') - 12, S('rbi') - 14],
  rbi: [S('rbi') - 14, S('full') - 12],
  cta: [S('full') - 12, Infinity],
} as const;

/** fade/slide envelope for a window */
const useWin = (a: number, b: number, fade = 12) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pin = a <= 0 ? 1 : spr(frame, fps, a, SNAPPY);
  const pout = Number.isFinite(b) ? interpolate(frame, [b - fade, b], [1, 0], CLAMP) : 1;
  return {frame, fps, on: frame >= a - 2 && frame <= b + 1, pin, o: Math.min(pin, pout), pout};
};

/* ------------------------------------------------------------------ small pieces */

const Kicker: React.FC<{text: string; color: string; style?: React.CSSProperties}> = ({text, color, style}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 14, padding: '10px 24px', borderRadius: 999, border: `3px solid ${color}`, background: alpha(color, 0.14), color, fontFamily: FONT, fontSize: 30, fontWeight: 900, letterSpacing: 3, textTransform: 'uppercase', whiteSpace: 'nowrap', ...style}}>
    <span style={{width: 14, height: 14, borderRadius: 7, background: color, boxShadow: `0 0 14px ${color}`}} />
    {text}
  </div>
);

const Big: React.FC<{children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties}> = ({children, size = 80, color = '#fff', style}) => (
  <div style={{fontFamily: FONT, fontSize: size, fontWeight: 900, color, lineHeight: 1.18, letterSpacing: -0.5, textShadow: '0 6px 30px rgba(0,0,0,0.75)', ...style}}>{children}</div>
);

const Stamp: React.FC<{text: string; color: string; p: number; rot?: number; size?: number; style?: React.CSSProperties}> = ({text, color, p, rot = -8, size = 64, style}) =>
  p <= 0.001 ? null : (
    <div style={{display: 'inline-block', padding: '14px 34px', borderRadius: 18, border: `8px solid ${color}`, color, fontFamily: FONT, fontSize: size, fontWeight: 900, letterSpacing: 2, background: alpha('#04060C', 0.8), transform: `rotate(${rot}deg) scale(${1.6 - 0.6 * p})`, opacity: Math.min(1, p * 1.4), whiteSpace: 'nowrap', boxShadow: `0 0 50px ${alpha(color, 0.45)}`, ...style}}>
      {text}
    </div>
  );

const SampleTag: React.FC<{style?: React.CSSProperties}> = ({style}) => (
  <div style={{position: 'absolute', padding: '6px 14px', borderRadius: 8, background: alpha(C.amber, 0.92), color: '#111', fontFamily: MONO, fontSize: 20, fontWeight: 800, letterSpacing: 2, ...style}}>SAMPLE · నమూనా</div>
);

const Tick: React.FC<{p: number; size?: number; color?: string}> = ({p, size = 64, color = C.emerald}) => (
  <svg width={size} height={size} viewBox="0 0 64 64" style={{transform: `scale(${0.4 + 0.6 * Math.min(1, p)})`, opacity: Math.min(1, p * 2)}}>
    <circle cx={32} cy={32} r={29} fill={color} />
    <path d="M18 33 L28 43 L47 22" stroke="#04060C" strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={50} strokeDashoffset={50 * (1 - Math.min(1, p))} />
  </svg>
);

const Cross: React.FC<{p: number; size?: number; color?: string}> = ({p, size = 64, color = C.crimson}) => (
  <svg width={size} height={size} viewBox="0 0 64 64" style={{transform: `scale(${0.4 + 0.6 * Math.min(1, p)})`, opacity: Math.min(1, p * 2)}}>
    <circle cx={32} cy={32} r={29} fill={color} />
    <path d="M21 21 L43 43 M43 21 L21 43" stroke="#fff" strokeWidth={7} strokeLinecap="round" strokeDasharray={32} strokeDashoffset={32 * (1 - Math.min(1, p))} />
  </svg>
);

const BanRing: React.FC<{p: number; size: number}> = ({p, size}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{position: 'absolute', inset: 0, margin: 'auto', opacity: Math.min(1, p * 2), transform: `scale(${1.25 - 0.25 * Math.min(1, p)})`}}>
    <circle cx={50} cy={50} r={44} stroke={C.crimson} strokeWidth={8} fill="none" strokeDasharray={277} strokeDashoffset={277 * (1 - Math.min(1, p))} />
    <line x1={19} y1={19} x2={81} y2={81} stroke={C.crimson} strokeWidth={8} strokeLinecap="round" strokeDasharray={88} strokeDashoffset={88 * (1 - Math.min(1, Math.max(0, p * 1.4 - 0.4)))} />
  </svg>
);

/** person silhouette (agent) */
const Person: React.FC<{color: string; size: number; angry?: boolean}> = ({color, size, angry}) => (
  <svg width={size} height={size * 1.3} viewBox="0 0 100 130">
    <circle cx={50} cy={30} r={22} fill={color} />
    <path d="M10 130 C10 80 25 62 50 62 C75 62 90 80 90 130 Z" fill={color} />
    {angry && <path d="M38 26 L46 30 M62 26 L54 30" stroke="#04060C" strokeWidth={4} strokeLinecap="round" />}
  </svg>
);

/* ------------------------------------------------------------------ backdrop + HUD */

const KNOCKS = [0.05, 1.55];
const knockShake = (frame: number) => {
  let s = 0;
  for (const k of KNOCKS)
    for (let i = 0; i < 3; i++) {
      const at = f(k + i * 0.24);
      const d = frame - at;
      if (d >= 0 && d < 14) s += Math.exp(-d / 3.5) * (i === 2 ? 1.3 : 1);
    }
  return s;
};

const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / DS_FPS;
  // section tint: red alarm → cyan control → emerald payoff
  const red = interpolate(t, [0, 9, 13, 30, 31, 36, 41.5, 47.8, 48.2], [1, 1, 0.25, 0.25, 0.8, 0.4, 0.7, 0.7, 0], CLAMP);
  const green = interpolate(t, [47.8, 49, 56, 57], [0, 0.35, 0.35, 0.7], CLAMP);
  const shake = knockShake(frame);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 90% 60% at 50% 32%, ${alpha('#1E293B', 0.9)}, ${C.bg} 70%)`}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 50% at 50% 30%, ${alpha(C.crimson, 0.22 * red + 0.12 * Math.min(1, shake))}, transparent 70%)`}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 50% at 50% 35%, ${alpha(C.emerald, 0.2 * green)}, transparent 70%)`}} />
      {/* perspective floor grid */}
      <AbsoluteFill style={{opacity: 0.22, backgroundImage: `linear-gradient(${alpha(C.cyan, 0.35)} 1px, transparent 1px), linear-gradient(90deg, ${alpha(C.cyan, 0.35)} 1px, transparent 1px)`, backgroundSize: '72px 72px', backgroundPosition: `0 ${(frame * 0.6) % 72}px`, maskImage: 'linear-gradient(180deg, transparent 0%, black 45%, transparent 100%)', WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, black 45%, transparent 100%)'}} />
      {/* drifting dust */}
      {Array.from({length: 26}, (_, i) => {
        const x = rnd(i) * DS_W;
        const y = (rnd(i + 50) * DS_H - frame * (0.3 + rnd(i + 9) * 0.6)) % DS_H;
        return <div key={i} style={{position: 'absolute', left: x, top: y < 0 ? y + DS_H : y, width: 4, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.18)'}} />;
      })}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 120% 90% at 50% 45%, transparent 55%, rgba(0,0,0,0.75))'}} />
      {/* knock flash */}
      <AbsoluteFill style={{boxShadow: `inset 0 0 ${120 + 120 * shake}px ${alpha(C.crimson, Math.min(0.75, 0.55 * shake))}`}} />
    </AbsoluteFill>
  );
};

const Hud: React.FC = () => {
  const frame = useCurrentFrame();
  const p = frame / DS_FRAMES;
  const blink = Math.floor(frame / 30) % 2 === 0;
  return (
    <>
      <div style={{position: 'absolute', left: LEFT, top: 168, right: 150, display: 'flex', alignItems: 'center', gap: 16, fontFamily: MONO, fontSize: 24, fontWeight: 800, letterSpacing: 4, color: C.muted}}>
        <span style={{width: 14, height: 14, borderRadius: 7, background: C.crimson, opacity: blink ? 1 : 0.3, boxShadow: `0 0 12px ${C.crimson}`}} />
        DOORSTEP DEFENSE
        <span style={{flex: 1, height: 4, borderRadius: 2, background: 'rgba(148,163,184,0.2)', overflow: 'hidden'}}>
          <span style={{display: 'block', width: `${p * 100}%`, height: '100%', background: `linear-gradient(90deg, ${C.crimson}, ${C.amber}, ${C.emerald})`}} />
        </span>
      </div>
      <div style={{position: 'absolute', left: LEFT, top: 1446, right: 150, fontFamily: TE, fontSize: 22, fontWeight: 600, color: 'rgba(203,213,225,0.55)'}}>
        సాధారణ అవగాహన కోసం · లీగల్ సలహా కాదు · General awareness, not legal advice
      </div>
    </>
  );
};

/* ------------------------------------------------------------------ captions */

/** spoken-line captions: the line being said, words lit progressively (by character share of the phrase) */
const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / DS_FPS;
  const idx = LINES.findIndex((l, i) => t >= l.s - 0.06 && t < (LINES[i + 1] ? Math.min(LINES[i + 1].s - 0.06, l.e + 0.9) : l.e + 0.9));
  if (idx < 0) return null;
  const line = LINES[idx];
  const words = line.te.split(' ');
  const total = line.te.length;
  let acc = 0;
  const pin = line.s <= 0 ? 1 : interpolate(t, [line.s - 0.06, line.s + 0.1], [0, 1], CLAMP);
  return (
    <div style={{position: 'absolute', left: LEFT - 10, width: DS_W - LEFT - 140, top: 1200, height: 230, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: pin, transform: `translateY(${(1 - pin) * 12}px)`}}>
      <div style={{textAlign: 'center', fontFamily: TE, fontSize: words.length > 7 ? 46 : 54, fontWeight: 800, lineHeight: 1.4, padding: '14px 26px', borderRadius: 22, background: 'rgba(4,6,12,0.55)'}}>
        {words.map((w, i) => {
          const at = line.s + ((line.e - line.s) * acc) / total;
          acc += w.length + 1;
          const said = t >= at - 0.02;
          const end = line.s + ((line.e - line.s) * acc) / total;
          const active = said && t < end;
          return (
            <span key={i} style={{color: active ? '#FDE047' : said ? '#FFFFFF' : 'rgba(255,255,255,0.5)', textShadow: '0 3px 14px rgba(0,0,0,0.9)', margin: '0 7px', display: 'inline-block'}}>
              {w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ beat 1–4: the door */

const Door: React.FC<{open: number; locked: number; tint: string; shake: number; frame: number}> = ({open, locked, tint, shake, frame}) => {
  const dx = shake > 0.02 ? Math.sin(frame * 2.7) * 9 * shake : 0;
  const feet = interpolate(Math.sin(frame / 22), [-1, 1], [-14, 14]);
  return (
    <div style={{position: 'relative', width: 520, height: 700, transform: `translateX(${dx}px)`}}>
      {/* frame */}
      <div style={{position: 'absolute', inset: -26, borderRadius: 14, background: 'linear-gradient(180deg,#3B2A1E,#24170F)', boxShadow: `0 40px 90px rgba(0,0,0,0.7), 0 0 70px ${alpha(tint, 0.35)}`}} />
      {/* doorway behind (seen when open): hallway light + agent */}
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg,#F8E7C0,#C9A86A)', overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 140, bottom: -10, opacity: open > 0.05 ? 1 : 0}}>
          <Person color="#1A1410" size={250} angry />
        </div>
      </div>
      {/* door leaf */}
      <div style={{position: 'absolute', inset: 0, transformOrigin: '0% 50%', transform: `perspective(1400px) rotateY(${74 * open}deg)`, background: 'linear-gradient(90deg,#7A4B2A,#8E5A33 40%,#6E4226)', borderRadius: 4, boxShadow: 'inset 0 0 0 6px rgba(0,0,0,0.18)'}}>
        {[[60, 60, 400, 250], [60, 370, 400, 270]].map(([x, y, w, h], i) => (
          <div key={i} style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 6, boxShadow: 'inset 0 0 0 5px rgba(0,0,0,0.22), inset 0 0 0 9px rgba(255,255,255,0.05)'}} />
        ))}
        {/* peephole */}
        <div style={{position: 'absolute', left: 245, top: 165, width: 30, height: 30, borderRadius: 15, background: '#C9A227', boxShadow: '0 0 0 5px #5A3A20'}} />
        {/* handle */}
        <div style={{position: 'absolute', left: 420, top: 340, width: 26, height: 70, borderRadius: 13, background: 'linear-gradient(90deg,#D4AF37,#8C6D1F)'}} />
        {/* deadbolt */}
        <div style={{position: 'absolute', left: 404, top: 260, width: 58, height: 58, borderRadius: 29, background: '#2A2A2A', boxShadow: `0 0 0 5px #8C6D1F, 0 0 ${30 * locked}px ${alpha(C.cyan, 0.9 * locked)}`}}>
          <div style={{position: 'absolute', left: 24, top: 8, width: 10, height: 42, borderRadius: 5, background: '#D4AF37', transform: `rotate(${90 * locked}deg)`}} />
        </div>
        {/* bolt bar into frame */}
        <div style={{position: 'absolute', left: 462, top: 279, width: 22 + 60 * locked, height: 20, borderRadius: 4, background: 'linear-gradient(180deg,#E5E7EB,#9CA3AF)'}} />
      </div>
      {/* light under the door with shadows of feet */}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: -26, height: 14, background: 'linear-gradient(90deg,transparent,#FCD34D 20%,#FCD34D 80%,transparent)', opacity: 0.85 * (1 - open)}}>
        <div style={{position: 'absolute', left: 170 + feet, width: 70, height: 14, background: '#0B0B0B', borderRadius: 4}} />
        <div style={{position: 'absolute', left: 290 - feet, width: 70, height: 14, background: '#0B0B0B', borderRadius: 4}} />
      </div>
    </div>
  );
};

const KnockRings: React.FC<{frame: number}> = ({frame}) => (
  <>
    {KNOCKS.flatMap((k, j) =>
      [0, 1, 2].map((i) => {
        const at = f(k + i * 0.24);
        const d = frame - at;
        if (d < 0 || d > 30) return null;
        const p = d / 30;
        return (
          <div key={`${j}${i}`} style={{position: 'absolute', left: 540 - 60 - 260 * p, top: 860 - 60 - 260 * p, width: 120 + 520 * p, height: 120 + 520 * p, borderRadius: '50%', border: `${8 - 6 * p}px solid ${alpha(C.crimson, 0.8 * (1 - p))}`}} />
        );
      }),
    )}
    {KNOCKS.map((k, j) => {
      const d = frame - f(k);
      if (d < 0 || d > 50) return null;
      const o = Math.min(1, d / 4) * interpolate(d, [36, 50], [1, 0], CLAMP);
      return (
        <div key={j} style={{position: 'absolute', left: 800, top: 600 - j * 40, fontFamily: FONT, fontSize: 64, fontWeight: 900, color: C.crimson, opacity: o, transform: `rotate(12deg) scale(${1 + 0.15 * Math.exp(-d / 6)})`, textShadow: `0 0 30px ${alpha(C.crimson, 0.8)}`}}>
          ధఢ్!
        </div>
      );
    })}
  </>
);

const DoorBeats: React.FC = () => {
  const {frame, fps, on, o} = useWin(W.door[0], W.door[1], 14);
  if (!on) return null;
  const shake = knockShake(frame);
  // door swings open on "ఇంట్లోకి రానివ్వడం", snaps shut on the "rule"
  const openAt = f(L.letin.s + 1.35);
  const open = Math.min(interpolate(frame, [openAt, openAt + 26], [0, 1], {...CLAMP, easing: easeInOut}), interpolate(frame, [S('rule') - 4, S('rule') + 12], [1, 0], {...CLAMP, easing: easeInOut}));
  const locked = Math.max(interpolate(frame, [S('dont') + 20, S('dont') + 34], [0, 1], CLAMP) * interpolate(frame, [openAt - 14, openAt - 2], [1, 0], CLAMP), interpolate(frame, [S('rule') + 14, S('rule') + 26], [0, 1], CLAMP));
  const tint = frame < S('rule') ? C.crimson : C.cyan;
  const doorScale = interpolate(frame, [0, S('mistake'), S('mistake') + 30, S('rule'), S('rule') + 30], [1, 1, 0.9, 0.9, 0.86], {...CLAMP, easing: easeInOut});

  // headline states
  const hk = frame < S('wait') - 6;
  const hw = frame >= S('wait') - 6 && frame < S('dont') - 4;
  const hd = frame >= S('dont') - 4 && frame < S('mistake') - 6;
  const hm = frame >= S('mistake') - 6 && frame < S('rule') - 6;
  const hr = frame >= S('rule') - 6;
  const pop = (at: number) => spr(frame, fps, at, SNAPPY);
  const mistakeStamp = spr(frame, fps, openAt + 34, SNAPPY);
  const shield = spr(frame, fps, S('rule') + 16, SNAPPY);
  const noEntry = spr(frame, fps, f(L.rule.s + 2.1), SNAPPY);

  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: LEFT, width: STAGE_W, top: 240, height: 250, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
        {hk && (
          <>
            <Kicker text="ALERT · అలర్ట్" color={C.crimson} />
            <Big size={76} style={{marginTop: 22}}>రికవరీ ఏజెంట్ <span style={{color: C.crimson}}>తలుపు</span> తడుతున్నాడా?</Big>
          </>
        )}
        {hw && <Big size={96} style={{transform: `scale(${0.85 + 0.15 * pop(S('wait') - 6)})`}}>ఒక్క నిమిషం…</Big>}
        {hd && (
          <div style={{transform: `scale(${0.7 + 0.3 * pop(S('dont') - 4)})`}}>
            <Big size={70}>డోర్ అస్సలు</Big>
            <Big size={104} color={C.crimson} style={{textShadow: `0 0 40px ${alpha(C.crimson, 0.7)}`}}>ఓపెన్ చేయకండి!</Big>
          </div>
        )}
        {hm && (
          <div style={{transform: `scale(${0.7 + 0.3 * pop(S('mistake') - 6)})`}}>
            <Kicker text="⚠ భయంతో చేసే" color={C.amber} />
            <Big size={110} color={C.amber} style={{marginTop: 14, letterSpacing: 2, textShadow: `0 0 40px ${alpha(C.amber, 0.6)}`}}>BIGGEST MISTAKE</Big>
          </div>
        )}
        {hr && (
          <div style={{transform: `scale(${0.7 + 0.3 * pop(S('rule') - 6)})`}}>
            <Big size={68}>మీ <span style={{color: C.cyan}}>PERMISSION</span> లేకుండా</Big>
            <Big size={60} color="#CBD5E1" style={{marginTop: 8}}>ఎవర్నీ లోపలికి రానివ్వాల్సిన రూల్ లేదు</Big>
          </div>
        )}
      </div>

      <div style={{position: 'absolute', left: 0, right: 0, top: 540, display: 'flex', justifyContent: 'center', transform: `scale(${doorScale})`, transformOrigin: '50% 40%'}}>
        <Door open={open} locked={locked} tint={tint} shake={shake} frame={frame} />
      </div>
      <KnockRings frame={frame} />

      {/* "letting him in" → red stamp */}
      {frame >= openAt + 30 && frame < S('rule') + 4 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 820, display: 'flex', justifyContent: 'center'}}>
          <Stamp text="✕ రానివ్వకండి" color={C.crimson} p={mistakeStamp} size={78} />
        </div>
      )}
      {/* lawful boundary: shield + NO ENTRY */}
      {frame >= S('rule') + 10 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 690, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
          <svg width={230} height={260} viewBox="0 0 100 113" style={{opacity: shield, transform: `scale(${0.5 + 0.5 * shield})`, filter: `drop-shadow(0 0 30px ${alpha(C.cyan, 0.8)})`}}>
            <path d="M50 4 L92 18 V52 C92 80 72 100 50 109 C28 100 8 80 8 52 V18 Z" fill={alpha('#0B2533', 0.92)} stroke={C.cyan} strokeWidth={5} />
            <path d="M30 56 L45 71 L72 40" stroke={C.cyan} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <Stamp text="NO ENTRY" color={C.cyan} p={noEntry} rot={0} size={84} />
        </div>
      )}

      {KNOCKS.map((k) => <Sfx key={k} at={f(k)} name="door_knock" volume={0.55} />)}
      <Sfx at={S('dont') + 20} name="grid_lock" volume={0.45} />
      <Sfx at={S('mistake') - 4} name="warning_pulse" volume={0.35} />
      <Sfx at={openAt} name="air_whoosh" volume={0.4} />
      <Sfx at={openAt + 34} name="stamp_heavy" volume={0.5} />
      <Sfx at={S('rule') + 6} name="block_slam" volume={0.45} />
      <Sfx at={S('rule') + 16} name="shield_activate" volume={0.4} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ beat 5–7: ask two things */

const IdCard: React.FC<{scan: number}> = ({scan}) => (
  <div style={{position: 'relative', width: 700, height: 430, borderRadius: 28, background: 'linear-gradient(145deg,#F8FAFC,#E2E8F0)', boxShadow: `0 40px 90px rgba(0,0,0,0.6), 0 0 60px ${alpha(C.cyan, 0.35)}`, overflow: 'hidden', fontFamily: FONT, color: '#0F172A'}}>
    <div style={{height: 96, background: 'linear-gradient(90deg,#1E3A8A,#2563EB)', display: 'flex', alignItems: 'center', padding: '0 32px', color: '#fff', fontWeight: 900, fontSize: 34, letterSpacing: 1}}>
      BANK A <span style={{marginLeft: 'auto', fontSize: 22, fontWeight: 700, opacity: 0.85, letterSpacing: 3}}>RECOVERY AGENT</span>
    </div>
    <div style={{display: 'flex', gap: 30, padding: 30}}>
      <div style={{width: 170, height: 210, borderRadius: 16, background: '#CBD5E1', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden'}}>
        <Person color="#64748B" size={150} />
      </div>
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 16, fontSize: 30}}>
        {[['Name', 'R•••• K••••'], ['Agent ID', 'RA-••••-21'], ['Agency', 'A•••• Services'], ['Valid till', '••/2027']].map(([k, v]) => (
          <div key={k}>
            <div style={{fontSize: 20, fontWeight: 700, color: '#64748B', letterSpacing: 2, textTransform: 'uppercase'}}>{k}</div>
            <div style={{fontWeight: 800}}>{v}</div>
          </div>
        ))}
      </div>
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: -40 + 520 * scan, height: 40, background: `linear-gradient(180deg,transparent,${alpha(C.cyan, 0.55)},transparent)`, opacity: scan > 0 && scan < 1 ? 1 : 0}} />
    <SampleTag style={{right: 18, bottom: 18}} />
  </div>
);

const AuthLetter: React.FC<{hiAcct: number; seal: number}> = ({hiAcct, seal}) => (
  <div style={{position: 'relative', width: 620, height: 600, borderRadius: 10, background: 'linear-gradient(180deg,#FFFDF7,#F3EEDF)', boxShadow: `0 40px 90px rgba(0,0,0,0.6), 0 0 60px ${alpha(C.amber, 0.3)}`, padding: '38px 44px', boxSizing: 'border-box', fontFamily: FONT, color: '#1F2937'}}>
    <div style={{fontWeight: 900, fontSize: 30, color: '#1E3A8A'}}>BANK A</div>
    <div style={{marginTop: 10, fontWeight: 900, fontSize: 38, letterSpacing: 1}}>AUTHORIZATION LETTER</div>
    <div style={{height: 3, background: '#1E3A8A', margin: '16px 0 22px'}} />
    <div style={{position: 'relative', fontSize: 30, fontWeight: 800, padding: '6px 10px', margin: '0 -10px', borderRadius: 8}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 8, background: alpha(C.amber, 0.45), transformOrigin: '0 50%', transform: `scaleX(${hiAcct})`}} />
      <span style={{position: 'relative'}}>Account: •••• •••• 4821</span>
    </div>
    {[0.92, 0.8, 0.88, 0.6, 0.85, 0.7].map((w, i) => (
      <div key={i} style={{height: 14, borderRadius: 7, background: '#D6D3C4', width: `${w * 100}%`, marginTop: 20}} />
    ))}
    <div style={{position: 'absolute', right: 52, bottom: 52, width: 130, height: 130, borderRadius: 65, border: `6px double ${alpha('#B91C1C', 0.85)}`, color: '#B91C1C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 22, transform: `rotate(-14deg) scale(${1.5 - 0.5 * seal})`, opacity: seal, textAlign: 'center'}}>BANK A<br />SEAL</div>
    <svg width={220} height={70} viewBox="0 0 220 70" style={{position: 'absolute', left: 44, bottom: 62}}>
      <path d="M5 50 C30 10 45 60 70 30 S110 20 120 45 S170 15 210 35" stroke="#1E3A8A" strokeWidth={4} fill="none" strokeDasharray={300} strokeDashoffset={300 * (1 - seal)} />
    </svg>
    <SampleTag style={{left: 44, bottom: 18}} />
  </div>
);

const CheckRow: React.FC<{n: number; title: string; sub: string; color: string; active: number; done: number}> = ({n, title, sub, color, active, done}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 22, padding: '18px 24px', borderRadius: 22, border: `3px solid ${active > 0.5 ? color : 'rgba(148,163,184,0.3)'}`, background: active > 0.5 ? alpha(color, 0.12) : 'rgba(15,23,42,0.6)', transform: `scale(${1 + 0.03 * active})`}}>
    <div style={{width: 64, height: 64, borderRadius: 32, border: `4px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontSize: 34, fontWeight: 900, color, position: 'relative'}}>
      {done > 0.05 ? <div style={{position: 'absolute', inset: -4}}><Tick p={done} size={64} /></div> : n}
    </div>
    <div style={{flex: 1}}>
      <div style={{fontFamily: FONT, fontSize: 40, fontWeight: 900, color: '#fff'}}>{title}</div>
      <div style={{fontFamily: TE, fontSize: 30, fontWeight: 700, color: '#CBD5E1', marginTop: 2}}>{sub}</div>
    </div>
  </div>
);

const CheckBeats: React.FC = () => {
  const {frame, fps, on, o} = useWin(W.check[0], W.check[1]);
  if (!on) return null;
  const row1 = interpolate(frame, [S('n1') - 4, S('n1') + 6, S('n2') - 6, S('n2')], [0, 1, 1, 0], CLAMP);
  const row2 = interpolate(frame, [S('n2') - 4, S('n2') + 6], [0, 1], CLAMP);
  const done1 = spr(frame, fps, E('id') - 4, SNAPPY);
  const done2 = spr(frame, fps, E('letter') - 4, SNAPPY);
  const showId = frame < S('n2') + 4;
  const idIn = spr(frame, fps, S('n1'), SNAPPY);
  const ltIn = spr(frame, fps, S('n2') + 4, SNAPPY);
  const scan = interpolate(frame, [f(L.id.s + 0.9), f(L.id.e)], [0, 1], CLAMP);
  const hiAcct = interpolate(frame, [f(L.letter.s + 0.2), f(L.letter.s + 1.0)], [0, 1], CLAMP);
  const seal = spr(frame, fps, f(L.letter.s + 2.4), SNAPPY);
  const intro = frame < S('n1') - 6;
  const headerIn = spr(frame, fps, W.check[0], SNAPPY);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: LEFT, width: STAGE_W, top: 240, textAlign: 'center', transform: `translateY(${(1 - headerIn) * 30}px)`}}>
        <Kicker text="DOORSTEP RULE" color={C.cyan} />
        <Big size={64} style={{marginTop: 18}}>డోర్ దగ్గరే ఆపి <span style={{color: C.cyan}}>2</span> అడగండి</Big>
      </div>
      <div style={{position: 'absolute', left: LEFT + 20, width: STAGE_W - 40, top: 470, display: 'flex', flexDirection: 'column', gap: 18}}>
        <div style={{opacity: spr(frame, fps, W.check[0] + 30), transform: `translateX(${(1 - spr(frame, fps, W.check[0] + 30)) * -60}px)`}}>
          <CheckRow n={1} title="OFFICIAL BANK ID CARD" sub="ఐడీ కార్డు చూపించండి" color={C.cyan} active={row1} done={done1} />
        </div>
        <div style={{opacity: spr(frame, fps, W.check[0] + 42), transform: `translateX(${(1 - spr(frame, fps, W.check[0] + 42)) * -60}px)`}}>
          <CheckRow n={2} title="AUTHORIZATION LETTER" sub="మీ అకౌంట్ కోసం రిటన్ లెటర్" color={C.amber} active={row2} done={done2} />
        </div>
      </div>
      {intro && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 760, display: 'flex', justifyContent: 'center', opacity: spr(frame, fps, W.check[0] + 50)}}>
          <div style={{position: 'relative', transform: 'scale(0.56)', transformOrigin: '50% 0%'}}>
            <Door open={0} locked={1} tint={C.cyan} shake={0} frame={frame} />
          </div>
        </div>
      )}
      {!intro && showId && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 760, display: 'flex', justifyContent: 'center', transform: `translateY(${(1 - idIn) * 400}px) rotate(${(1 - idIn) * -8}deg)`, opacity: idIn}}>
          <IdCard scan={scan} />
        </div>
      )}
      {!showId && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 740, height: 440, overflow: 'hidden', display: 'flex', justifyContent: 'center'}}>
          <div style={{transform: `translateY(${(1 - ltIn) * 500}px) scale(0.72)`, transformOrigin: '50% 0%', opacity: ltIn}}>
            <AuthLetter hiAcct={hiAcct} seal={seal} />
          </div>
        </div>
      )}
      <Sfx at={W.check[0] + 30} name="node_pop" volume={0.35} />
      <Sfx at={W.check[0] + 42} name="node_pop" volume={0.35} />
      <Sfx at={S('n1')} name="card_slide" volume={0.45} />
      <Sfx at={f(L.id.s + 0.9)} name="radar_ping" volume={0.3} />
      <Sfx at={E('id') - 4} name="tactile_click" volume={0.5} />
      <Sfx at={S('n2') + 4} name="pages_flip" volume={0.45} />
      <Sfx at={f(L.letter.s + 2.4)} name="stamp_heavy" volume={0.4} />
      <Sfx at={E('letter') - 4} name="tactile_click" volume={0.5} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ beat 8: 90% */

const NinetyBeat: React.FC = () => {
  const {frame, fps, on, o} = useWin(W.ninety[0], W.ninety[1]);
  if (!on) return null;
  const count = Math.round(interpolate(frame, [f(L.ninety.s), f(L.ninety.s + 1.6)], [0, 90], {...CLAMP, easing: (x) => 1 - Math.pow(1 - x, 3)}));
  const trustIn = spr(frame, fps, W.ninety[0], SNAPPY);
  const cardIn = spr(frame, fps, W.ninety[0] + 10, SNAPPY);
  const stamp = spr(frame, fps, f(L.ninety.s + 2.9), SNAPPY);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: LEFT, width: STAGE_W, top: 240, textAlign: 'center', opacity: trustIn}}>
        <Kicker text="REALITY CHECK" color={C.crimson} />
        <Big size={70} style={{marginTop: 18}}>ట్రస్ట్ మీ…</Big>
      </div>
      <div style={{position: 'absolute', left: LEFT + 10, width: STAGE_W - 20, top: 430, opacity: cardIn, transform: `scale(${0.9 + 0.1 * cardIn})`}}>
        <div style={{borderRadius: 32, border: `4px solid ${C.crimson}`, background: alpha('#2A0A10', 0.85), padding: '30px 36px', boxShadow: `0 0 70px ${alpha(C.crimson, 0.4)}`, textAlign: 'center'}}>
          <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 20}}>
            <div style={{fontFamily: FONT, fontSize: 190, fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: -6}}>{count}%</div>
          </div>
          <div style={{fontFamily: TE, fontSize: 46, fontWeight: 800, color: '#fff', marginTop: 6}}>లోకల్ ఏజెంట్ల దగ్గర</div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, margin: '26px 10px 8px'}}>
            {Array.from({length: 10}, (_, i) => {
              const red = i < 9 && count >= (i + 1) * 10;
              const x = spr(frame, fps, f(L.ninety.s) + i * 7, SNAPPY);
              return (
                <div key={i} style={{position: 'relative', display: 'flex', justifyContent: 'center'}}>
                  <Person color={red ? '#7F1D1D' : i === 9 ? C.emerald : '#475569'} size={80} />
                  {red && <div style={{position: 'absolute', right: 2, bottom: 0}}><Cross p={x} size={44} /></div>}
                  {i === 9 && count >= 90 && <div style={{position: 'absolute', right: 2, bottom: 0}}><Tick p={spr(frame, fps, f(L.ninety.s + 1.3))} size={44} /></div>}
                </div>
              );
            })}
          </div>
          <div style={{marginTop: 18}}>
            <Stamp text="లెటర్ అస్సలు ఉండదు!" color={C.amber} p={stamp} rot={-4} size={58} />
          </div>
          <div style={{marginTop: 14, fontFamily: TE, fontSize: 24, fontWeight: 600, color: 'rgba(226,232,240,0.75)'}}>క్రియేటర్ అనుభవం ఆధారంగా · అధికారిక గణాంకం కాదు</div>
        </div>
      </div>
      <Sfx at={W.ninety[0]} name="sub_thud" volume={0.4} />
      <Sfx at={f(L.ninety.s)} name="counter_spin" volume={0.35} />
      <Sfx at={f(L.ninety.s + 2.9)} name="stamp_heavy" volume={0.5} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ beat 9: no cash, no signature */

const Notes: React.FC = () => (
  <div style={{position: 'relative', width: 220, height: 150}}>
    {[0, 1, 2].map((i) => (
      <div key={i} style={{position: 'absolute', left: i * 12, top: i * -10, width: 200, height: 110, borderRadius: 10, background: 'linear-gradient(135deg,#A7F3D0,#6EE7B7)', border: '3px solid #065F46', transform: `rotate(${-8 + i * 6}deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontSize: 54, fontWeight: 900, color: '#065F46'}}>₹</div>
    ))}
  </div>
);

const PaperPen: React.FC = () => (
  <svg width={210} height={190} viewBox="0 0 210 190">
    <rect x={30} y={10} width={130} height={170} rx={8} fill="#F8FAFC" />
    {[40, 62, 84, 106].map((y) => <rect key={y} x={48} y={y} width={94} height={9} rx={4} fill="#CBD5E1" />)}
    <path d="M52 150 C70 130 80 160 100 140 S130 150 140 138" stroke="#1E3A8A" strokeWidth={4} fill="none" />
    <g transform="rotate(38 150 120)"><rect x={140} y={40} width={22} height={120} rx={6} fill="#F59E0B" /><path d="M140 160 L151 185 L162 160 Z" fill="#334155" /></g>
  </svg>
);

const BanTile: React.FC<{p: number; ban: number; title: string; sub: string; children: React.ReactNode}> = ({p, ban, title, sub, children}) => (
  <div style={{opacity: p, transform: `translateY(${(1 - p) * 60}px)`, display: 'flex', alignItems: 'center', gap: 26, padding: '40px 28px', borderRadius: 28, border: `3px solid ${alpha(C.crimson, 0.4 + 0.5 * ban)}`, background: 'rgba(15,23,42,0.82)', boxShadow: `0 0 ${50 * ban}px ${alpha(C.crimson, 0.35)}`}}>
    <div style={{position: 'relative', width: 240, height: 210, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      {children}
      <BanRing p={ban} size={230} />
    </div>
    <div style={{flex: 1}}>
      <div style={{fontFamily: FONT, fontSize: 60, fontWeight: 900, color: C.crimson, lineHeight: 1.05}}>{title}</div>
      <div style={{fontFamily: TE, fontSize: 38, fontWeight: 700, color: '#E2E8F0', marginTop: 12, lineHeight: 1.3}}>{sub}</div>
    </div>
  </div>
);

const BanBeats: React.FC = () => {
  const {frame, fps, on, o} = useWin(W.bans[0], W.bans[1]);
  if (!on) return null;
  const head = spr(frame, fps, S('most') - 8, SNAPPY);
  const cashIn = Math.max(0.32 * head, spr(frame, fps, S('cash') - 4, SNAPPY));
  const signIn = Math.max(0.32 * spr(frame, fps, S('most') + 4, SNAPPY), spr(frame, fps, S('sign') - 4, SNAPPY));
  const cashBan = interpolate(frame, [f(L.cash.e - 0.9), f(L.cash.e - 0.3)], [0, 1], CLAMP);
  const signBan = interpolate(frame, [f(L.sign.e - 0.7), f(L.sign.e - 0.15)], [0, 1], CLAMP);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: LEFT, width: STAGE_W, top: 240, textAlign: 'center', transform: `scale(${0.8 + 0.2 * head})`, opacity: head}}>
        <Kicker text="MOST IMPORTANT" color={C.amber} />
        <Big size={64} style={{marginTop: 18}}>ఈ రెండూ <span style={{color: C.crimson}}>అస్సలు చేయొద్దు</span></Big>
      </div>
      <div style={{position: 'absolute', left: LEFT, width: STAGE_W, top: 500, display: 'flex', flexDirection: 'column', gap: 44}}>
        <BanTile p={cashIn} ban={cashBan} title="NO CASH" sub="ఎవరి చేతికీ ఒక్క రూపాయి కూడా ఇవ్వొద్దు">
          <Notes />
        </BanTile>
        <BanTile p={signIn} ban={signBan} title="NO SIGNATURE" sub="ఏ పేపర్ మీదా సైన్ చేయొద్దు">
          <PaperPen />
        </BanTile>
      </div>
      <Sfx at={S('most') - 8} name="title_hit" volume={0.4} />
      <Sfx at={S('cash') - 4} name="card_slide" volume={0.35} />
      <Sfx at={f(L.cash.e - 0.9)} name="buzzer" volume={0.35} />
      <Sfx at={S('sign') - 4} name="card_slide" volume={0.35} />
      <Sfx at={f(L.sign.e - 0.7)} name="buzzer" volume={0.35} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ beat 10: threatened? dial 112 */

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
// "ఒకటి ఒకటి రెండుకి" sits in the middle of the line
const DIGITS = [L.call.s + 1.05, L.call.s + 1.4, L.call.s + 1.78];
const CALL_AT = L.call.s + 2.25;

const CallBeat: React.FC = () => {
  const {frame, fps, on, o} = useWin(W.call[0], W.call[1]);
  if (!on) return null;
  const t = frame / DS_FPS;
  const typed = DIGITS.filter((d) => t >= d).length;
  const calling = t >= CALL_AT;
  const phoneIn = spr(frame, fps, S('argue') - 2, SNAPPY);
  const threat = frame < S('argue') - 6;
  const pressed = (k: string, idx: number) => DIGITS.some((d, i) => '112'[i] === k && t >= d && t < d + 0.18) && idx >= 0;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: LEFT, width: STAGE_W, top: 240, textAlign: 'center'}}>
        {threat ? (
          <div style={{transform: `scale(${0.75 + 0.25 * spr(frame, fps, S('threat') - 10, SNAPPY)})`}}>
            <Kicker text="THREATENED?" color={C.crimson} />
            <Big size={80} style={{marginTop: 18}}>బెదిరిస్తే?</Big>
          </div>
        ) : (
          <div style={{transform: `scale(${0.8 + 0.2 * spr(frame, fps, S('argue') - 6, SNAPPY)})`}}>
            <Kicker text="DON'T ARGUE" color={C.amber} />
            <Big size={70} style={{marginTop: 18}}>వాదించకండి — <span style={{color: C.crimson}}>112</span> కి కాల్</Big>
          </div>
        )}
      </div>
      {threat && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center'}}>
          <div style={{transform: `translateX(${Math.sin(frame * 1.9) * 6}px)`}}>
            <Person color="#7F1D1D" size={330} angry />
          </div>
          {['!!', '!'].map((x, i) => (
            <div key={i} style={{position: 'absolute', left: 640 + i * 90, top: 40 + i * 70, fontFamily: FONT, fontSize: 120, fontWeight: 900, color: C.crimson, opacity: 0.6 + 0.4 * Math.sin(frame / 5 + i)}}>{x}</div>
          ))}
        </div>
      )}
      {!threat && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 440, display: 'flex', justifyContent: 'center', opacity: phoneIn, transform: `translateY(${(1 - phoneIn) * 300}px)`}}>
          <div style={{width: 470, height: 750, borderRadius: 60, background: '#0B0F19', border: '10px solid #1F2937', boxShadow: `0 40px 100px rgba(0,0,0,0.7), 0 0 ${calling ? 80 : 30}px ${alpha(calling ? C.emerald : C.crimson, 0.45)}`, padding: '40px 36px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <div style={{height: 120, fontFamily: FONT, fontSize: 110, fontWeight: 900, color: '#fff', letterSpacing: 10, lineHeight: 1.05}}>{'112'.slice(0, typed) || <span style={{color: '#334155', fontSize: 40, letterSpacing: 2}}>EMERGENCY</span>}</div>
            <div style={{height: 34, fontFamily: MONO, fontSize: 26, fontWeight: 800, letterSpacing: 3, color: C.emerald, opacity: calling ? 0.55 + 0.45 * Math.abs(Math.sin(frame / 10)) : 0}}>CALLING…</div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 108px)', gap: 14, marginTop: 6}}>
              {KEYS.map((k, i) => {
                const pr = pressed(k, i);
                return (
                  <div key={k} style={{width: 108, height: 84, borderRadius: 42, background: pr ? C.cyan : '#1E293B', color: pr ? '#04060C' : '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontSize: 40, fontWeight: 800, transform: `scale(${pr ? 0.92 : 1})`}}>{k}</div>
                );
              })}
            </div>
            <div style={{marginTop: 24, width: 116, height: 116, borderRadius: 58, background: C.emerald, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: calling ? `0 0 0 ${10 + 14 * Math.abs(Math.sin(frame / 8))}px ${alpha(C.emerald, 0.3)}` : 'none'}}>
              <svg width={56} height={56} viewBox="0 0 24 24"><path fill="#04060C" d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z" /></svg>
            </div>
          </div>
        </div>
      )}
      <Sfx at={S('threat') - 10} name="warning_pulse" volume={0.35} />
      <Sfx at={S('argue') - 2} name="air_whoosh" volume={0.35} />
      {DIGITS.map((d) => <Sfx key={d} at={f(d)} name="key_click" volume={0.55} />)}
      <Sfx at={f(CALL_AT)} name="dialer_ring" volume={0.3} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ beat 11: RBI rules teaser */

const Lock: React.FC<{open: number}> = ({open}) => (
  <svg width={56} height={64} viewBox="0 0 56 64">
    <path d={`M14 28 V18 a14 14 0 0 1 28 0 V${28 - open * 10}`} stroke={C.amber} strokeWidth={6} fill="none" />
    <rect x={6} y={28} width={44} height={32} rx={7} fill={C.amber} />
    <circle cx={28} cy={44} r={5} fill="#04060C" />
  </svg>
);

const RbiBeat: React.FC = () => {
  const {frame, fps, on, o} = useWin(W.rbi[0], W.rbi[1]);
  if (!on) return null;
  const sh = spr(frame, fps, S('rbi') - 10, SNAPPY);
  const q1 = spr(frame, fps, S('silent') - 4, SNAPPY);
  const q2 = spr(frame, fps, S('stop') - 4, SNAPPY);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: LEFT, width: STAGE_W, top: 240, textAlign: 'center', opacity: sh}}>
        <Kicker text="RBI రూల్స్ ప్రకారం" color={C.emerald} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 340, display: 'flex', justifyContent: 'center'}}>
        <svg width={300} height={340} viewBox="0 0 100 113" style={{opacity: sh, transform: `scale(${0.6 + 0.4 * sh}) rotate(${(1 - sh) * -10}deg)`, filter: `drop-shadow(0 0 40px ${alpha(C.emerald, 0.7)})`}}>
          <path d="M50 4 L92 18 V52 C92 80 72 100 50 109 C28 100 8 80 8 52 V18 Z" fill={alpha('#052E24', 0.95)} stroke={C.emerald} strokeWidth={4} />
          <path d="M50 14 L82 25 V52 C82 74 67 90 50 98 C33 90 18 74 18 52 V25 Z" fill="none" stroke={alpha(C.emerald, 0.4)} strokeWidth={2} />
          <text x={50} y={58} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={24} fill="#fff">RBI</text>
          <text x={50} y={76} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={9} fill={C.emerald} letterSpacing={1.5}>RULES</text>
        </svg>
      </div>
      <div style={{position: 'absolute', left: LEFT + 10, width: STAGE_W - 20, top: 760, display: 'flex', flexDirection: 'column', gap: 30}}>
        {[
          {p: q1, te: 'లీగల్‌గా ఎలా సైలెంట్ చేయాలి?', en: 'SILENCE THEM — LEGALLY'},
          {p: q2, te: 'రికవరీ కాల్స్‌కి శాశ్వత ఫుల్‌స్టాప్?', en: 'STOP THE CALLS — FOR GOOD'},
        ].map((q, i) => (
          <div key={i} style={{opacity: q.p, transform: `translateX(${(1 - q.p) * (i ? 80 : -80)}px)`, display: 'flex', alignItems: 'center', gap: 24, padding: '22px 28px', borderRadius: 26, border: `3px solid ${alpha(C.emerald, 0.6)}`, background: 'rgba(6,30,24,0.85)'}}>
            <Lock open={0} />
            <div style={{flex: 1}}>
              <div style={{fontFamily: MONO, fontSize: 24, fontWeight: 800, color: C.emerald, letterSpacing: 2}}>{q.en}</div>
              <div style={{fontFamily: TE, fontSize: 42, fontWeight: 800, color: '#fff', marginTop: 4}}>{q.te}</div>
            </div>
            <div style={{fontFamily: FONT, fontSize: 80, fontWeight: 900, color: alpha(C.emerald, 0.8)}}>?</div>
          </div>
        ))}
      </div>
      <Sfx at={S('rbi') - 10} name="shield_activate" volume={0.4} />
      <Sfx at={S('silent') - 4} name="node_pop" volume={0.35} />
      <Sfx at={S('stop') - 4} name="node_pop" volume={0.35} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ beat 12: CTA */

const CtaBeat: React.FC = () => {
  const {frame, fps, on, o} = useWin(W.cta[0], W.cta[1]);
  if (!on) return null;
  const card = spr(frame, fps, S('full') - 10, SNAPPY);
  const step = spr(frame, fps, f(L.full.s + 3.0), SNAPPY);
  const link = spr(frame, fps, S('link') - 4, SNAPPY);
  const save = spr(frame, fps, S('save') - 2, SNAPPY);
  const bounce = Math.abs(Math.sin((frame - S('link')) / 9)) * 26;
  const play = 1 + 0.06 * Math.sin(frame / 8);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div style={{position: 'absolute', left: LEFT, width: STAGE_W, top: 240, textAlign: 'center', opacity: card}}>
        <Kicker text="FULL VIDEO" color={C.amber} />
        <Big size={72} style={{marginTop: 18}}>కంప్లీట్ ప్రాసెస్ <span style={{color: C.amber}}>ఫుల్ వీడియోలో</span></Big>
      </div>
      <div style={{position: 'absolute', left: LEFT + 10, width: STAGE_W - 20, top: 470, opacity: card, transform: `scale(${0.85 + 0.15 * card})`}}>
        <div style={{position: 'relative', aspectRatio: '16 / 9', borderRadius: 28, overflow: 'hidden', border: `4px solid ${alpha(C.amber, 0.8)}`, background: 'linear-gradient(135deg,#0F172A,#1E293B 50%,#3B1D0A)', boxShadow: `0 40px 100px rgba(0,0,0,0.7), 0 0 70px ${alpha(C.amber, 0.3)}`}}>
          <div style={{position: 'absolute', left: 34, top: 30, fontFamily: TE, fontSize: 44, fontWeight: 900, color: '#fff', lineHeight: 1.25, width: 560}}>
            క్రెడిట్ కార్డ్ అప్పు<br /><span style={{color: C.amber}}>మీ హక్కులు</span>
          </div>
          <div style={{position: 'absolute', left: 34, bottom: 30, display: 'flex', gap: 12}}>
            {['RBI RULES', 'STEP BY STEP'].map((x, i) => (
              <div key={x} style={{padding: '8px 18px', borderRadius: 999, background: alpha(C.emerald, 0.2), border: `2px solid ${C.emerald}`, color: '#fff', fontFamily: MONO, fontSize: 20, fontWeight: 800, letterSpacing: 2, opacity: i === 0 ? 1 : step}}>{x}</div>
            ))}
          </div>
          <div style={{position: 'absolute', right: 40, top: '50%', marginTop: -70, width: 140, height: 140, borderRadius: 70, background: C.crimson, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${play})`, boxShadow: `0 0 50px ${alpha(C.crimson, 0.6)}`}}>
            <svg width={60} height={60} viewBox="0 0 24 24"><path d="M7 4 L20 12 L7 20 Z" fill="#fff" /></svg>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 8, background: 'rgba(255,255,255,0.15)'}}>
            <div style={{width: `${interpolate(frame, [S('full'), DS_FRAMES], [5, 100], CLAMP)}%`, height: '100%', background: C.crimson}} />
          </div>
        </div>
      </div>
      {frame >= S('link') - 6 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 26, opacity: link}}>
          <div style={{fontFamily: TE, fontSize: 52, fontWeight: 900, color: '#fff'}}>కింద లింక్ క్లిక్ చేయండి</div>
          <svg width={86} height={86} viewBox="0 0 24 24" style={{transform: `translateY(${bounce}px)`, filter: `drop-shadow(0 0 20px ${alpha(C.amber, 0.8)})`}}>
            <circle cx={12} cy={12} r={11} fill={C.amber} />
            <path d="M12 6 V17 M7 12.5 L12 17.5 L17 12.5" stroke="#04060C" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
      {frame >= S('save') - 6 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 1100, display: 'flex', justifyContent: 'center', opacity: save, transform: `scale(${0.7 + 0.3 * save})`}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '14px 32px', borderRadius: 999, background: alpha(C.cyan, 0.16), border: `3px solid ${C.cyan}`}}>
            <svg width={44} height={52} viewBox="0 0 22 26"><path d="M3 2 H19 V24 L11 18 L3 24 Z" fill={C.cyan} /></svg>
            <div style={{fontFamily: TE, fontSize: 40, fontWeight: 900, color: '#fff'}}>ఈ వీడియో <span style={{color: C.cyan}}>SAVE</span> చేసుకోండి</div>
          </div>
        </div>
      )}
      <Sfx at={S('full') - 10} name="triumph_rise" volume={0.3} />
      <Sfx at={S('link') - 4} name="notification" volume={0.4} />
      <Sfx at={S('save') - 2} name="tactile_click" volume={0.5} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ master */

export const DoorstepShort: React.FC = () => {
  const music = (fr: number) => interpolate(fr, [0, 20, f(47.6), f(48.2), f(56), f(57), DS_FRAMES - 40, DS_FRAMES], [0, 0.075, 0.075, 0, 0, 0, 0, 0], CLAMP);
  const hope = (fr: number) => interpolate(fr, [f(47.6), f(48.6), DS_FRAMES - 40, DS_FRAMES], [0, 0.085, 0.085, 0], CLAMP);
  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      <Backdrop />
      <DoorBeats />
      <CheckBeats />
      <NinetyBeat />
      <BanBeats />
      <CallBeat />
      <RbiBeat />
      <CtaBeat />
      <Captions />
      <Hud />
      <Audio src={staticFile('audio/shorts/doorstep_vo_telugu.mp3')} />
      <Audio src={staticFile('audio/music/tension.mp3')} volume={music} />
      <Audio src={staticFile('audio/music/hope.mp3')} volume={hope} startFrom={f(20)} />
    </AbsoluteFill>
  );
};
