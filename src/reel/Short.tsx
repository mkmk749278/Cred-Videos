import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {interpolate} from '../lib/safeInterpolate';
import {C, FONT, MONO, alpha} from '../theme';
import {CLAMP, spr} from '../lib/anim';
import {Sfx} from '../components/primitives';
import {Card, Chip, Stamp} from './Reel';
import shortsEnh from '../data/shorts_enh.json';

/**
 * Curiosity shorts (YouTube Shorts / Instagram Reels, 1080×1920) cut from the creator's own English narration.
 * Each one raises a real worry, shows a little, and stops on an open question; the end card blurs the answer
 * and points to the exact minute of the full video. Every beat is tied to a spoken word (`cue`).
 * Safe area as in Reel.tsx: nothing important below y≈1480 or in the right 150 px; hook visible on frame 0.
 */

export const SHORT_W = 1080;
export const SHORT_H = 1920;
export const SHORT_FPS = 30;
const END_LEN = 120; // open-loop card, 4 s
const FULL_LEN = 27 * 60 + 41; // full English video on YouTube (27:41)
const SAFE_X = 70;
const STAGE_W = SHORT_W - SAFE_X - 150;

type Word = {w: string; s: number; e: number; seg: number};
type ShortData = {duration: number; answer: string; segments: {t0: number; t1: number}[]; words: Word[]};
const DATA = shortsEnh as unknown as Record<string, ShortData>;

export const SHORT_IDS = ['blocked', 'calls', 'thirtyk', 'writeoff', 'cibil', 'salary'] as const;
export type ShortId = (typeof SHORT_IDS)[number];
const f = (sec: number) => Math.round(sec * SHORT_FPS);
const voiceEnd = (id: ShortId) => f(DATA[id].duration) + 4;
export const shortFrames = (id: ShortId) => voiceEnd(id) + END_LEN;

const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, '');

/** frame at which `phrase` starts being spoken (nth occurrence) */
const makeCue = (id: ShortId) => (phrase: string, nth = 0) => {
  const W = DATA[id].words.map((w) => norm(w.w));
  const p = phrase.split(/\s+/).map(norm).filter(Boolean);
  let seen = 0;
  for (let i = 0; i + p.length <= W.length; i++) {
    if (p.every((x, k) => W[i + k] === x)) {
      if (seen++ === nth) return f(DATA[id].words[i].s);
    }
  }
  throw new Error(`short ${id}: cue not found: ${phrase}`);
};

/* ---------------------------------------------------------------- shared pieces */

const fadeWin = (frame: number, a: number, b: number, fin = 6, fout = 8) =>
  Math.min(interpolate(frame, [a - fin, a], [0, 1], CLAMP), interpolate(frame, [b, b + fout], [1, 0], CLAMP));

const Head: React.FC<{kicker: string; title: React.ReactNode; color: string; inF: number; outF: number}> = ({kicker, title, color, inF, outF}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < inF - 2 || frame > outF + 8) return null;
  const pin = inF <= 0 ? 1 : spr(frame, fps, inF);
  const pout = interpolate(frame, [outF, outF + 8], [1, 0], CLAMP);
  return (
    <div style={{position: 'absolute', left: SAFE_X, width: STAGE_W, top: 236, opacity: Math.min(pin, pout), transform: `translateY(${(1 - pin) * 24}px)`}}>
      <div style={{fontFamily: MONO, fontSize: 26, letterSpacing: 5, color, fontWeight: 800, textTransform: 'uppercase'}}>{kicker}</div>
      <div style={{fontFamily: FONT, fontSize: 72, fontWeight: 900, color: '#fff', lineHeight: 1.06, letterSpacing: -1.5, marginTop: 12}}>{title}</div>
    </div>
  );
};

const Hl: React.FC<{children: React.ReactNode; c?: string}> = ({children, c = '#FDE047'}) => <span style={{color: c}}>{children}</span>;

const Bubble: React.FC<{text: React.ReactNode; p: number; color?: string; size?: number; style?: React.CSSProperties; right?: boolean}> = ({text, p, color = C.crimson, size = 40, style, right}) => (
  <div style={{padding: '20px 28px', borderRadius: right ? '30px 30px 8px 30px' : '30px 30px 30px 8px', background: alpha(color, 0.16), backgroundColor: '#1A1220', border: `4px solid ${color}`, fontFamily: FONT, fontSize: size, fontWeight: 800, color: '#fff', lineHeight: 1.2, boxShadow: '0 24px 50px rgba(0,0,0,0.5)', opacity: p, transform: `scale(${0.85 + 0.15 * p})`, transformOrigin: right ? 'right bottom' : 'left bottom', ...style}}>
    {text}
  </div>
);

const Illus: React.FC<{style?: React.CSSProperties}> = ({style}) => (
  <div style={{display: 'inline-block', padding: '6px 14px', borderRadius: 8, border: `2px solid ${C.amber}`, color: '#FDE68A', fontFamily: MONO, fontSize: 20, fontWeight: 800, letterSpacing: 3, ...style}}>ILLUSTRATION</div>
);

const Paper: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div style={{borderRadius: 16, background: 'linear-gradient(170deg, #FBF9F4, #F1EDE4)', boxShadow: '0 40px 90px rgba(0,0,0,0.55)', padding: 34, boxSizing: 'border-box', color: '#1B2433', fontFamily: FONT, ...style}}>{children}</div>
);

const Lines: React.FC<{n: number; w?: number[]; mt?: number}> = ({n, w = [92, 78, 86, 64, 80], mt = 18}) => (
  <>{Array.from({length: n}, (_, i) => <div key={i} style={{height: 12, borderRadius: 6, background: '#CBD5E1', width: `${w[i % w.length]}%`, marginTop: mt}} />)}</>
);

const Cross: React.FC<{p: number; size?: number; color?: string}> = ({p, size = 120, color = C.crimson}) => p < 0.03 ? null : (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{position: 'absolute', overflow: 'visible'}}>
    <line x1={10} y1={10} x2={10 + 80 * Math.min(1, p * 2)} y2={10 + 80 * Math.min(1, p * 2)} stroke={color} strokeWidth={12} strokeLinecap="round" />
    {p > 0.5 && <line x1={90} y1={10} x2={90 - 80 * Math.min(1, (p - 0.5) * 2)} y2={10 + 80 * Math.min(1, (p - 0.5) * 2)} stroke={color} strokeWidth={12} strokeLinecap="round" />}
  </svg>
);

const rupee = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

/** word-by-word captions: short pages, the spoken word in yellow */
const Captions: React.FC<{id: ShortId}> = ({id}) => {
  const frame = useCurrentFrame();
  const words = DATA[id].words;
  const pages: Word[][] = [];
  let cur: Word[] = [];
  words.forEach((w, i) => {
    cur.push(w);
    const len = cur.map((x) => x.w).join(' ').length;
    const next = words[i + 1];
    if (!next || next.seg !== w.seg || (/[.?!,"”]$/.test(w.w) && len > 14) || len > 28) {
      pages.push(cur);
      cur = [];
    }
  });
  const tt = frame / SHORT_FPS;
  const page = pages.find((pg, i) => tt >= pg[0].s - 0.08 && tt < (pages[i + 1] ? Math.min(pages[i + 1][0].s - 0.08, pg[pg.length - 1].e + 0.6) : pg[pg.length - 1].e + 0.6));
  if (!page || frame >= voiceEnd(id)) return null;
  const pin = interpolate(tt, [page[0].s - 0.08, page[0].s + 0.06], [0, 1], CLAMP);
  return (
    <div style={{position: 'absolute', left: SAFE_X - 10, width: STAGE_W + 20, top: 1200, height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: pin}}>
      <div style={{textAlign: 'center', fontFamily: FONT, fontSize: 60, fontWeight: 900, lineHeight: 1.18, letterSpacing: -0.5}}>
        {page.map((w, i) => {
          const said = tt >= w.s - 0.03;
          const active = said && tt < w.e + 0.04;
          return (
            <span key={i} style={{color: active ? '#FDE047' : said ? '#FFFFFF' : 'rgba(255,255,255,0.55)', textShadow: '0 4px 18px rgba(0,0,0,0.95), 0 0 2px #000', margin: '0 8px', display: 'inline-block'}}>
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** The open loop: the question stays open, the answer is blurred, the full video's timeline points to it */
const OpenLoop: React.FC<{id: ShortId; question: React.ReactNode; locked: string[]}> = ({id, question, locked}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const at = voiceEnd(id);
  if (frame < at - 4) return null;
  const p = spr(frame, fps, at);
  const ans = DATA[id].answer;
  const [mm, ss] = ans.split(':').map(Number);
  const pos = (mm * 60 + ss) / FULL_LEN;
  const play = interpolate(frame, [at + 30, at + 62], [0, pos], {...CLAMP, easing: (x) => 1 - (1 - x) ** 3});
  const bounce = Math.abs(Math.sin((frame - at) / 7)) * 14;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: p}}>
      <div style={{position: 'absolute', left: SAFE_X, width: STAGE_W, top: 236, transform: `translateY(${(1 - p) * 30}px)`}}>
        <div style={{fontFamily: MONO, fontSize: 26, letterSpacing: 5, color: C.gold, fontWeight: 800}}>THE ANSWER IS IN THE FULL VIDEO</div>
        <div style={{fontFamily: FONT, fontSize: 70, fontWeight: 900, color: '#fff', lineHeight: 1.06, letterSpacing: -1.5, marginTop: 12}}>{question}</div>
      </div>
      <div style={{position: 'absolute', left: SAFE_X, width: STAGE_W, top: 620, display: 'flex', flexDirection: 'column', gap: 16}}>
        {locked.map((x, i) => {
          const q = spr(frame, fps, at + 8 + i * 5);
          return (
            <div key={x} style={{display: 'flex', alignItems: 'center', gap: 20, padding: '18px 24px', borderRadius: 20, background: '#0E1628', border: `3px solid ${alpha(C.gold, 0.45)}`, opacity: q, transform: `translateX(${(1 - q) * 40}px)`}}>
              <div style={{fontSize: 36, width: 44, textAlign: 'center'}}>🔒</div>
              <div style={{fontFamily: FONT, fontSize: 40, fontWeight: 800, color: '#E2E8F0', filter: 'blur(9px)', whiteSpace: 'nowrap'}}>{x}</div>
            </div>
          );
        })}
      </div>
      {/* the full video's progress bar, playing up to the answer */}
      <div style={{position: 'absolute', left: SAFE_X, width: STAGE_W, top: Math.max(1000, 620 + locked.length * 98 + 40), opacity: spr(frame, fps, at + 24)}}>
        <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 24, color: '#94A3B8', fontWeight: 700}}>
          <span>FULL VIDEO · 27:41</span>
          <span style={{color: '#fff'}}>▶ {ans}</span>
        </div>
        <div style={{position: 'relative', marginTop: 14, height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.18)'}}>
          <div style={{width: `${play * 100}%`, height: '100%', borderRadius: 6, background: '#FF0033'}} />
          <div style={{position: 'absolute', left: `${play * 100}%`, top: -10, width: 32, height: 32, marginLeft: -16, borderRadius: 16, background: '#FF0033', boxShadow: '0 0 0 6px rgba(255,0,51,0.25)'}} />
        </div>
        <div style={{marginTop: 26, textAlign: 'center', fontFamily: FONT, fontSize: 44, fontWeight: 900, color: '#fff', opacity: interpolate(frame, [at + 58, at + 66], [0, 1], CLAMP)}}>
          Jump to <span style={{color: '#FDE047'}}>{ans}</span> for the answer
        </div>
      </div>
      <div style={{position: 'absolute', left: SAFE_X, width: STAGE_W, top: Math.max(1290, 620 + locked.length * 98 + 220), textAlign: 'center', fontFamily: FONT, fontSize: 48, fontWeight: 900, color: '#FDE047', transform: `translateY(${bounce}px)`}}>
        Full video: tap the link ↓
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- 1 · blocked card, balance still growing */

const StageBlocked: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cue = makeCue('blocked');
  const S = DATA.blocked.segments.map((s) => ({a: f(s.t0), b: f(s.t1)}));
  const blocked = spr(frame, fps, cue('blocked'));
  const grow = interpolate(frame, [cue('increasing'), S[1].b], [0, 1], CLAMP);
  const o0 = fadeWin(frame, 0, S[1].b);
  const purch = spr(frame, fps, cue('purchases'));
  const inter = spr(frame, fps, cue('interest'));
  const o2 = fadeWin(frame, S[2].a, S[3].b);
  const lakh = spr(frame, fps, cue('one lakh'));
  const three = spr(frame, fps, cue('three thousand'));
  const ex = spr(frame, fps, cue('example'));
  const o4 = fadeWin(frame, S[4].a, voiceEnd('blocked') - 6);
  const rbi = spr(frame, fps, cue('RBI'));
  return (
    <>
      {o0 > 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: o0}}>
          <div style={{position: 'absolute', left: SAFE_X + 40, top: 600, width: 560, height: 340, borderRadius: 30, background: 'linear-gradient(135deg, #1E3A8A, #0F172A 70%)', border: '2px solid rgba(255,255,255,0.15)', boxShadow: '0 40px 80px rgba(0,0,0,0.6)', transform: 'rotate(-4deg)', padding: 34, boxSizing: 'border-box'}}>
            <div style={{width: 80, height: 60, borderRadius: 10, background: 'linear-gradient(135deg,#FDE68A,#B45309)'}} />
            <div style={{fontFamily: MONO, fontSize: 34, color: '#E2E8F0', marginTop: 70, letterSpacing: 3, whiteSpace: 'nowrap'}}>•••• •••• •••• 4821</div>
            <div style={{position: 'absolute', left: 90, top: 120, opacity: blocked}}><Stamp text="BLOCKED" color={C.crimson} p={blocked} rot={-12} size={64} /></div>
          </div>
          <div style={{position: 'absolute', left: SAFE_X, width: STAGE_W, top: 990, textAlign: 'right', opacity: spr(frame, fps, cue('increasing')) * interpolate(frame, [S[1].a - 6, S[1].a + 4], [1, 0], CLAMP)}}>
            <div style={{fontFamily: MONO, fontSize: 26, color: '#94A3B8', letterSpacing: 3}}>BALANCE</div>
            <div style={{fontFamily: FONT, fontSize: 84, fontWeight: 900, color: '#FCA5A5'}}>{rupee(100000 + 3000 * grow)} ↑</div>
          </div>
          {frame >= S[1].a - 4 && (
            <div style={{position: 'absolute', left: SAFE_X, width: STAGE_W, top: 990, display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'flex-end'}}>
              <div style={{display: 'flex', gap: 14, alignItems: 'center', opacity: purch, transform: `translateX(${(1 - purch) * 40}px)`}}>
                <Chip text="New purchases" color={C.slate} size={36} />
                <Chip text="✓ stopped" color={C.emerald} size={36} />
              </div>
              <div style={{display: 'flex', gap: 14, alignItems: 'center', opacity: inter, transform: `translateX(${(1 - inter) * 40}px)`}}>
                <Chip text="Interest & charges" color={C.slate} size={36} />
                <Chip text="may continue" color={C.crimson} size={36} />
              </div>
            </div>
          )}
        </div>
      )}
      {o2 > 0 && (
        <div style={{position: 'absolute', left: SAFE_X, width: STAGE_W, top: 610, opacity: o2}}>
          <Paper style={{width: '100%'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div style={{fontSize: 34, fontWeight: 900}}>CARD STATEMENT</div>
              <Illus style={{color: '#B45309', borderColor: '#B45309', transform: `scale(${1 + 0.25 * Math.max(0, Math.sin(Math.min(1, ex) * Math.PI))})`}} />
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 30, fontSize: 40, fontWeight: 800, opacity: lakh}}>
              <span>Balance</span><span>{rupee(100000)}</span>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 18, fontSize: 40, fontWeight: 800, color: '#B91C1C', opacity: three, transform: `translateX(${(1 - three) * 30}px)`}}>
              <span>Interest @ 3% / month</span><span>+ ≈{rupee(3000 * three)}</span>
            </div>
            <div style={{fontSize: 26, color: '#64748B', marginTop: 20, opacity: ex}}>Example only. Your card’s rate and calculation can differ.</div>
          </Paper>
        </div>
      )}
      {o4 > 0 && (
        <div style={{position: 'absolute', left: SAFE_X, width: STAGE_W, top: 640, opacity: o4, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div style={{position: 'relative', width: 300, height: 340, transform: `scale(${0.6 + 0.4 * rbi})`}}>
            <svg width={300} height={340} viewBox="0 0 300 340">
              <path d="M150 10 L280 60 V170 C280 250 220 305 150 330 C80 305 20 250 20 170 V60 Z" fill={alpha(C.cyan, 0.15)} stroke={C.cyan} strokeWidth={8} />
            </svg>
            <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, color: '#fff'}}>
              <div style={{fontSize: 64, fontWeight: 900}}>RBI</div>
              <div style={{fontSize: 90, fontWeight: 900, color: '#FDE047', lineHeight: 1}}>?</div>
            </div>
          </div>
        </div>
      )}
      <Sfx at={cue('blocked')} name="stamp_heavy" volume={0.25} />
      <Sfx at={cue('increasing')} name="counter_spin" volume={0.14} />
      <Sfx at={cue('three thousand')} name="node_pop" volume={0.18} />
      <Sfx at={cue('RBI')} name="shield_activate" volume={0.18} />
    </>
  );
};

/* ---------------------------------------------------------------- 2 · recovery calls at night */

const StageCalls: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cue = makeCue('calls');
  const S = DATA.calls.segments.map((s) => ({a: f(s.t0), b: f(s.t1)}));
  const o01 = fadeWin(frame, 0, S[1].b);
  const eight = spr(frame, fps, cue('eight'));
  const seven = spr(frame, fps, cue('seven'));
  const ring = 1;
  const anything = spr(frame, fps, cue('anything'));
  const notOk = spr(frame, fps, cue('between'));
  const o23 = fadeWin(frame, S[2].a, voiceEnd('calls') - 6);
  const threats = [cue('neighbours'), cue('office'), cue('family')];
  const notNormal = spr(frame, fps, cue('normal recovery'));
  // 24 h day bar, 6 AM .. 11 PM
  const X0 = 6, X1 = 23;
  const xh = (h: number) => ((h - X0) / (X1 - X0)) * STAGE_W;
  const shake = frame < cue('eight') ? Math.sin(frame * 2.3) * 6 * interpolate(frame, [0, cue('eight')], [1, 0.3], CLAMP) : 0;
  return (
    <>
      {o01 > 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: o01}}>
          <div style={{position: 'absolute', left: SAFE_X, width: STAGE_W, top: 640}}>
            <div style={{position: 'relative', height: 90, borderRadius: 18, background: alpha(C.crimson, 0.25), border: `3px solid ${alpha(C.crimson, 0.6)}`, overflow: 'hidden'}}>
              <div style={{position: 'absolute', left: xh(8), width: (xh(19) - xh(8)) * Math.min(eight, 1) * (0.55 + 0.45 * seven), top: 0, bottom: 0, background: alpha(C.emerald, 0.45), borderLeft: `4px solid ${C.emerald}`}} />
              <div style={{position: 'absolute', left: xh(8) + 18, top: 22, fontFamily: FONT, fontSize: 36, fontWeight: 900, color: '#fff', opacity: seven}}>Recovery calls allowed</div>
            </div>
            <div style={{position: 'relative', height: 60, fontFamily: MONO, fontSize: 30, fontWeight: 800, color: '#E2E8F0'}}>
              <div style={{position: 'absolute', left: xh(8) - 40, top: 12, opacity: eight}}>8 AM</div>
              <div style={{position: 'absolute', left: xh(19) - 40, top: 12, opacity: seven}}>7 PM</div>
            </div>
          </div>
          {/* a late call */}
          <div style={{position: 'absolute', left: SAFE_X + 40, top: 820, opacity: ring * (1 - anything), transform: `translateX(${shake}px) scale(${0.8 + 0.2 * ring})`}}>
            <Card color={C.crimson} style={{width: 640, display: 'flex', alignItems: 'center', gap: 24}}>
              <div style={{fontSize: 64}}>📞</div>
              <div>
                <div style={{fontFamily: MONO, fontSize: 28, color: '#FCA5A5', fontWeight: 800, letterSpacing: 2}}>9:42 PM · RECOVERY CALL</div>
                <div style={{fontFamily: FONT, fontSize: 40, fontWeight: 900, color: '#fff', marginTop: 4}}>Outside allowed hours</div>
              </div>
            </Card>
          </div>
          <div style={{position: 'absolute', left: SAFE_X + 40, top: 820, opacity: anything}}>
            <div style={{fontFamily: MONO, fontSize: 26, color: '#86EFAC', fontWeight: 800, letterSpacing: 2, marginBottom: 12}}>2:15 PM · INSIDE THE HOURS</div>
            <Bubble p={anything} text="“Pay now or we’ll shame you!”" size={42} style={{width: 640}} />
            <div style={{marginTop: 22, textAlign: 'center'}}><Stamp text="Still NOT allowed" color={C.crimson} p={notOk} rot={-5} size={48} /></div>
          </div>
        </div>
      )}
      {o23 > 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: o23}}>
          {['“We’ll tell your neighbours.”', '“We’ll come to your office…”', '“We’ll trouble your family.”'].map((m, i) => {
            const p = spr(frame, fps, threats[i]);
            return (
              <div key={m} style={{position: 'absolute', left: SAFE_X + (i % 2) * 60, top: 620 + i * 140}}>
                <Bubble p={p} text={m} size={42} />
              </div>
            );
          })}
          <div style={{position: 'absolute', left: SAFE_X, width: STAGE_W, top: 1060, textAlign: 'center'}}>
            <Stamp text="NOT normal recovery" color={C.amber} p={notNormal} rot={-4} size={50} />
          </div>
        </div>
      )}
      <Sfx at={2} name="haptic_buzz" volume={0.2} />
      <Sfx at={cue('between')} name="stamp_heavy" volume={0.2} />
      {threats.map((t, i) => <Sfx key={i} at={t} name="notification" volume={0.14} />)}
      <Sfx at={cue('normal recovery')} name="stamp_heavy" volume={0.22} />
    </>
  );
};

/* ---------------------------------------------------------------- 3 · "pay ₹30,000 and we close everything" */

const StageThirtyK: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cue = makeCue('thirtyk');
  const S = DATA.thirtyk.segments.map((s) => ({a: f(s.t0), b: f(s.t1)}));
  const o0 = fadeWin(frame, 0, S[0].b);
  const lakh = 1;
  const call = 1;
  const relief = spr(frame, fps, cue('relieved'));
  const o1 = fadeWin(frame, S[1].a, S[1].b);
  const letter = spr(frame, fps, cue('settlement letter'));
  const o23 = fadeWin(frame, S[2].a, voiceEnd('thirtyk') - 6);
  const little = spr(frame, fps, cue('Pay a little'));
  const count = spr(frame, fps, cue('count as'));
  const later = spr(frame, fps, cue('discover'));
  return (
    <>
      {o0 > 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: o0}}>
          <div style={{position: 'absolute', left: SAFE_X, width: STAGE_W, top: 610, display: 'flex', alignItems: 'baseline', gap: 26, opacity: lakh}}>
            <span style={{fontFamily: MONO, fontSize: 28, color: '#94A3B8', letterSpacing: 3}}>YOU OWE</span>
            <span style={{position: 'relative', fontFamily: FONT, fontSize: 92, fontWeight: 900, color: relief > 0.05 ? '#64748B' : '#FCA5A5'}}>
              {rupee(100000)}
              <span style={{position: 'absolute', left: -6, right: -6, top: '52%', height: 9, borderRadius: 5, background: C.crimson, transform: `scaleX(${relief})`, transformOrigin: 'left'}} />
            </span>
          </div>
          <div style={{position: 'absolute', left: SAFE_X, top: 780}}>
            <Bubble p={call} color={C.amber} size={46} text={<>📞 “Pay <Hl>₹30,000</Hl> and we’ll close everything.”</>} style={{width: 760}} />
          </div>
          <div style={{position: 'absolute', left: SAFE_X, width: STAGE_W, top: 1010, textAlign: 'center', opacity: relief, transform: `scale(${0.8 + 0.2 * relief})`}}>
            <span style={{fontFamily: FONT, fontSize: 96, fontWeight: 900, color: C.green, textShadow: `0 0 40px ${alpha(C.green, 0.5)}`}}>{rupee(30000)}?</span>
            <Illus style={{marginLeft: 20, verticalAlign: 'middle'}} />
          </div>
        </div>
      )}
      {o1 > 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: o1}}>
          <div style={{position: 'absolute', left: SAFE_X + 70, top: 620, width: 560, transform: `rotate(-3deg) translateY(${(1 - letter) * 60}px)`, opacity: letter}}>
            <Paper>
              <div style={{fontSize: 34, fontWeight: 900}}>SETTLEMENT LETTER</div>
              <div style={{fontSize: 22, fontWeight: 800, color: '#B45309', marginTop: 6, letterSpacing: 2}}>OFFICIAL · FROM THE BANK</div>
              <Lines n={5} />
            </Paper>
          </div>
          <div style={{position: 'absolute', left: SAFE_X + 660, top: 590, fontSize: 150, fontWeight: 900, fontFamily: FONT, color: '#FDE047', opacity: letter, transform: `scale(${0.5 + 0.5 * letter}) rotate(8deg)`}}>!</div>
        </div>
      )}
      {o23 > 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: o23}}>
          <div style={{position: 'absolute', left: SAFE_X, top: 610}}>
            <Bubble p={little} color={C.amber} size={44} text="“Pay a little first. We’ll send the letter later.”" style={{width: 760}} />
          </div>
          <div style={{position: 'absolute', left: SAFE_X, width: STAGE_W, top: 840, display: 'flex', alignItems: 'center', gap: 24, opacity: count}}>
            <Chip text="₹ paid" color={C.cyan} size={44} />
            <div style={{fontSize: 60, color: '#94A3B8'}}>→</div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
              <Chip text="Part of the settlement?" color={C.emerald} size={36} />
              <Chip text="Just a normal payment?" color={later > 0.1 ? C.crimson : C.slate} size={36} style={{transform: `scale(${1 + 0.08 * later})`, transformOrigin: 'left'}} />
            </div>
          </div>
          <div style={{position: 'absolute', left: SAFE_X, width: STAGE_W, top: 1070, textAlign: 'center'}}>
            <Stamp text="Ask BEFORE you pay" color={C.amber} p={later} rot={-4} size={48} />
          </div>
        </div>
      )}
      <Sfx at={2} name="dialer_ring" volume={0.12} />
      <Sfx at={cue('relieved')} name="payment_success" volume={0.14} />
      <Sfx at={cue('settlement letter')} name="pages_flip" volume={0.2} />
      <Sfx at={cue('count as')} name="node_pop" volume={0.18} />
      <Sfx at={cue('discover')} name="stamp_heavy" volume={0.2} />
    </>
  );
};

/* ---------------------------------------------------------------- 4 · write-off ≠ debt gone */

const StageWriteOff: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cue = makeCue('writeoff');
  const S = DATA.writeoff.segments.map((s) => ({a: f(s.t0), b: f(s.t1)}));
  const o0 = fadeWin(frame, 0, S[0].b);
  const word = 1;
  const yay = spr(frame, fps, cue('Finally'));
  const check = spr(frame, fps, cue('Please check'));
  const o1 = fadeWin(frame, S[1].a, S[1].b);
  const days = Math.round(interpolate(frame, [S[1].a + 6, cue('one hundred')], [0, 180], CLAMP));
  const rule = spr(frame, fps, cue('eighty days'));
  const o2 = fadeWin(frame, S[2].a, voiceEnd('writeoff') - 6);
  const disc = spr(frame, fps, cue('big discount'));
  const glitch = check > 0.05 && check < 0.95 ? Math.sin(frame * 3.1) * 10 : 0;
  return (
    <>
      {o0 > 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: o0}}>
          <div style={{position: 'absolute', left: SAFE_X + 60, top: 620, width: 560, transform: 'rotate(-2deg)'}}>
            <Paper>
              <div style={{fontSize: 26, fontWeight: 800, color: '#64748B', letterSpacing: 2}}>CARD ACCOUNT STATUS</div>
              <div style={{fontSize: 70, fontWeight: 900, color: '#B91C1C', marginTop: 10, opacity: word, transform: `scale(${1.3 - 0.3 * word})`, transformOrigin: 'left'}}>WRITE-OFF</div>
              <Lines n={3} />
            </Paper>
          </div>
          <div style={{position: 'absolute', right: 150, top: 930, transform: `translateX(${glitch}px)`}}>
            <Bubble right p={yay} color={C.emerald} size={46} text={<>🎉 “Debt removed!”</>} style={{opacity: yay * (1 - 0.55 * check)}} />
          </div>
          <div style={{position: 'absolute', left: SAFE_X, width: STAGE_W, top: 1070, textAlign: 'center'}}>
            <Stamp text="Check what it means" color={C.amber} p={check} rot={-5} size={48} />
          </div>
        </div>
      )}
      {o1 > 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: o1}}>
          <div style={{position: 'absolute', left: SAFE_X, width: STAGE_W, top: 640, display: 'flex', alignItems: 'center', gap: 40}}>
            <div style={{width: 300, height: 300, borderRadius: 30, background: '#0E1628', border: `4px solid ${C.cyan}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{fontFamily: MONO, fontSize: 26, color: C.cyan, letterSpacing: 3, fontWeight: 800}}>OVERDUE</div>
              <div style={{fontFamily: FONT, fontSize: 120, fontWeight: 900, color: '#fff', lineHeight: 1}}>{days}</div>
              <div style={{fontFamily: MONO, fontSize: 26, color: '#94A3B8', letterSpacing: 3}}>DAYS</div>
            </div>
            <div style={{position: 'relative', fontFamily: FONT, fontSize: 52, fontWeight: 900, color: '#fff', lineHeight: 1.15}}>
              “Day 180 =<br />automatic<br />write-off”
              <div style={{position: 'absolute', left: 60, top: 20, width: 200, height: 200}}><Cross p={rule} size={200} /></div>
            </div>
          </div>
          <div style={{position: 'absolute', left: SAFE_X, width: STAGE_W, top: 1010, textAlign: 'center', opacity: rule}}>
            <Chip text="No single rule for every card" color={C.crimson} size={42} />
          </div>
        </div>
      )}
      {o2 > 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: o2}}>
          <div style={{position: 'absolute', left: SAFE_X, width: STAGE_W, top: 640, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30}}>
            <div style={{fontSize: 170, transform: `rotate(${interpolate(frame, [S[2].a, S[2].a + 20], [0, 180], CLAMP)}deg)`}}>⏳</div>
            <div style={{position: 'relative'}}>
              <Chip text="Wait → big discount?" color={C.slate} size={52} />
            </div>
            <Stamp text="NOT guaranteed" color={C.crimson} p={disc} rot={-5} size={52} />
          </div>
        </div>
      )}
      <Sfx at={cue('write-off')} name="stamp_heavy" volume={0.2} />
      <Sfx at={cue('Finally')} name="triumph_rise" volume={0.12} />
      <Sfx at={cue('Please check')} name="glass_shatter" volume={0.12} />
      <Sfx at={cue('eighty days')} name="buzzer" volume={0.12} />
      <Sfx at={cue('big discount')} name="stamp_heavy" volume={0.22} />
    </>
  );
};

/* ---------------------------------------------------------------- 5 · Settled vs Closed */

const StageCibil: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cue = makeCue('cibil');
  const S = DATA.cibil.segments.map((s) => ({a: f(s.t0), b: f(s.t1)}));
  const o0 = fadeWin(frame, 0, S[0].b);
  const score = spr(frame, fps, cue('CIBIL'));
  const loan = spr(frame, fps, cue('loan'));
  const o12 = fadeWin(frame, S[1].a, S[2].b);
  const settled = spr(frame, fps, cue('Settled'));
  const closed = spr(frame, fps, cue('Closed'));
  const ndc = spr(frame, fps, cue('No Dues'));
  const neq = spr(frame, fps, cue('say Closed'));
  const o3 = fadeWin(frame, S[3].a, voiceEnd('cibil') - 6);
  const yes = spr(frame, fps, cue('Yes'));
  const reset = spr(frame, fps, cue('instant reset'));
  const needle = interpolate(frame, [S[3].a, voiceEnd('cibil')], [-60, -35], CLAMP);
  const inPart2 = frame >= cue('No Dues') - 4;
  return (
    <>
      {o0 > 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: o0}}>
          <div style={{position: 'absolute', left: SAFE_X, width: STAGE_W, top: 620}}>
            <Paper style={{width: '100%'}}>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <div style={{fontSize: 30, fontWeight: 900}}>CREDIT REPORT</div>
                <div style={{fontSize: 30, fontWeight: 900, color: '#B91C1C', opacity: score}}>Score ↓ ?</div>
              </div>
              <div style={{marginTop: 20, padding: '16px 20px', borderRadius: 12, background: '#EEF2F7', display: 'flex', justifyContent: 'space-between', fontSize: 32, fontWeight: 800}}>
                <span>Card •••• 4821</span><span style={{color: '#B45309'}}>Status: ???</span>
              </div>
              <Lines n={2} />
            </Paper>
          </div>
          <div style={{position: 'absolute', right: 150, top: 960}}>
            <Bubble right p={loan} color={C.cyan} size={44} text="“Will I ever get a loan again?”" />
          </div>
        </div>
      )}
      {o12 > 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: o12}}>
          <div style={{position: 'absolute', left: SAFE_X, width: STAGE_W, top: inPart2 ? 600 : 660, display: 'flex', gap: 30, justifyContent: 'center', transform: `scale(${inPart2 ? 0.8 : 1})`, transformOrigin: 'top center'}}>
            {[['SETTLED', C.amber, settled, 'paid less than full'], ['CLOSED', C.emerald, closed, 'usually full repayment']].map(([w, c, p, sub]) => (
              <div key={w as string} style={{width: 380, padding: '30px 10px', borderRadius: 26, background: alpha(c as string, 0.14), border: `5px solid ${c}`, textAlign: 'center', opacity: p as number, transform: `translateY(${(1 - (p as number)) * 50}px)`}}>
                <div style={{fontFamily: FONT, fontSize: 68, fontWeight: 900, color: '#fff'}}>{w as string}</div>
                <div style={{fontFamily: FONT, fontSize: 28, color: '#D3DCE8', marginTop: 6}}>{sub as string}</div>
              </div>
            ))}
          </div>
          {inPart2 && (
            <div style={{position: 'absolute', left: SAFE_X, width: STAGE_W, top: 860, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 26}}>
              <div style={{opacity: ndc, transform: `rotate(-3deg) scale(${0.8 + 0.2 * ndc})`}}>
                <Paper style={{width: 330, padding: 24}}>
                  <div style={{fontSize: 30, fontWeight: 900}}>NO DUES</div>
                  <div style={{fontSize: 22, fontWeight: 800, color: '#047857'}}>CERTIFICATE ✓</div>
                  <Lines n={2} mt={12} />
                </Paper>
              </div>
              <div style={{fontFamily: FONT, fontSize: 110, fontWeight: 900, color: C.crimson, opacity: neq, transform: `scale(${1.4 - 0.4 * neq})`}}>≠</div>
              <div style={{opacity: neq}}><Chip text="Report: “Closed”" color={C.emerald} size={38} /></div>
            </div>
          )}
        </div>
      )}
      {o3 > 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: o3}}>
          <div style={{position: 'absolute', left: SAFE_X, width: STAGE_W, top: 620, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <svg width={520} height={300} viewBox="0 0 520 300">
              <path d="M40 270 A220 220 0 0 1 480 270" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={36} strokeLinecap="round" />
              <path d="M40 270 A220 220 0 0 1 480 270" fill="none" stroke="url(#g)" strokeWidth={36} strokeLinecap="round" strokeDasharray="700" strokeDashoffset={700 - 700 * yes} />
              <defs><linearGradient id="g"><stop offset="0" stopColor={C.crimson} /><stop offset="0.5" stopColor={C.amber} /><stop offset="1" stopColor={C.green} /></linearGradient></defs>
              <line x1={260} y1={270} x2={260 + 190 * Math.cos(((needle - 90) * Math.PI) / 180)} y2={270 + 190 * Math.sin(((needle - 90) * Math.PI) / 180)} stroke="#fff" strokeWidth={10} strokeLinecap="round" />
              <circle cx={260} cy={270} r={18} fill="#fff" />
            </svg>
            <div style={{display: 'flex', gap: 18, marginTop: 20}}>
              <Chip text="✓ Can improve" color={C.emerald} size={40} style={{opacity: yes}} />
              <Chip text="✕ No instant reset" color={C.crimson} size={40} style={{opacity: reset}} />
            </div>
          </div>
        </div>
      )}
      <Sfx at={cue('CIBIL')} name="gauge_drop" volume={0.14} />
      <Sfx at={cue('Settled')} name="node_pop" volume={0.18} />
      <Sfx at={cue('Closed')} name="node_pop" volume={0.18} />
      <Sfx at={cue('say Closed')} name="buzzer" volume={0.1} />
      <Sfx at={cue('instant reset')} name="tactile_click" volume={0.2} />
    </>
  );
};

/* ---------------------------------------------------------------- 6 · salary in the same bank */

const StageSalary: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cue = makeCue('salary');
  const S = DATA.salary.segments.map((s) => ({a: f(s.t0), b: f(s.t1)}));
  const o0 = fadeWin(frame, 0, S[0].b);
    const same = spr(frame, fps, cue('same bank'));
  const o1 = fadeWin(frame, S[1].a, S[1].b);
  const lien = spr(frame, fps, cue('lien'));
  const setoff = spr(frame, fps, cue('set-off'));
  const o2 = fadeWin(frame, S[2].a, voiceEnd('salary') - 6);
  const think = spr(frame, fps, cue('The card is'));
  const rights = spr(frame, fps, cue('Some agreements'));
  const Acc: React.FC<{title: string; sub: string; color: string; p: number; tag?: string}> = ({title, sub, color, p, tag}) => (
    <Card color={color} style={{width: 380, opacity: p, transform: `translateY(${(1 - p) * 40}px)`}}>
      <div style={{fontFamily: MONO, fontSize: 24, color, letterSpacing: 3, fontWeight: 800}}>BANK X</div>
      <div style={{fontFamily: FONT, fontSize: 44, fontWeight: 900, color: '#fff', marginTop: 6}}>{title}</div>
      <div style={{fontFamily: FONT, fontSize: 30, color: '#D3DCE8', marginTop: 4}}>{sub}</div>
      {tag && <div style={{marginTop: 12}}><Chip text={tag} color={C.crimson} size={26} /></div>}
    </Card>
  );
  return (
    <>
      {o0 > 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: o0}}>
          <div style={{position: 'absolute', left: SAFE_X, width: STAGE_W, top: 640, display: 'flex', justifyContent: 'space-between'}}>
            <Acc title="Salary a/c" sub="₹ salary comes here" color={C.cyan} p={1} />
            <Acc title="Credit card" sub="payment overdue" color={C.crimson} p={1} tag="OVERDUE" />
          </div>
          <div style={{position: 'absolute', left: SAFE_X, width: STAGE_W, top: 1010, textAlign: 'center'}}>
            <Stamp text="SAME BANK?" color={C.amber} p={same} rot={-4} size={56} />
          </div>
        </div>
      )}
      {o1 > 0 && (
        <div style={{position: 'absolute', left: SAFE_X + 40, top: 620, width: 700, opacity: o1}}>
          <Paper>
            <div style={{fontSize: 30, fontWeight: 900}}>ACCOUNT & CARD TERMS</div>
            <Lines n={2} />
            <div style={{fontSize: 34, lineHeight: 1.6, marginTop: 16, color: '#334155'}}>
              … the bank may have a{' '}
              <span style={{padding: '2px 10px', borderRadius: 8, background: `rgba(250,204,21,${0.85 * lien})`, fontWeight: 900, color: '#0F172A'}}>lien</span>{' '}or right of{' '}
              <span style={{padding: '2px 10px', borderRadius: 8, background: `rgba(250,204,21,${0.85 * setoff})`, fontWeight: 900, color: '#0F172A'}}>set-off</span>{' '}over …
            </div>
            <Lines n={2} />
          </Paper>
          <div style={{marginTop: 18}}><Illus /></div>
        </div>
      )}
      {o2 > 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: o2}}>
          <div style={{position: 'absolute', left: SAFE_X, top: 630}}>
            <Bubble p={think} color={C.cyan} size={44} text={<span style={{position: 'relative'}}>“My salary cannot be touched.”<span style={{position: 'absolute', left: -6, right: -6, top: '50%', height: 7, borderRadius: 4, background: C.crimson, transform: `scaleX(${rights})`, transformOrigin: 'left'}} /></span>} style={{width: 760}} />
          </div>
          <div style={{position: 'absolute', left: SAFE_X, width: STAGE_W, top: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, opacity: rights}}>
            <Chip text="Salary a/c" color={C.cyan} size={40} />
            <div style={{fontFamily: FONT, fontSize: 60, color: C.amber, transform: `translateX(${Math.sin(frame / 5) * 8}px)`}}>→</div>
            <Chip text="Card dues" color={C.crimson} size={40} />
          </div>
          <div style={{position: 'absolute', left: SAFE_X, width: STAGE_W, top: 1020, textAlign: 'center', fontFamily: FONT, fontSize: 36, color: '#D3DCE8', opacity: rights}}>Some agreements give the bank these rights</div>
        </div>
      )}
      <Sfx at={cue('same bank')} name="stamp_heavy" volume={0.22} />
      <Sfx at={cue('lien')} name="tactile_click" volume={0.2} />
      <Sfx at={cue('set-off')} name="tactile_click" volume={0.2} />
      <Sfx at={cue('Some agreements')} name="chain_break" volume={0.14} />
    </>
  );
};

/* ---------------------------------------------------------------- per-short config */

type Beat = {seg: number; kicker: string; color: string; title: React.ReactNode};
const CFG: Record<ShortId, {stage: React.FC; heads: Beat[]; question: React.ReactNode; locked: string[]}> = {
  blocked: {
    stage: StageBlocked,
    heads: [
      {seg: 0, kicker: 'Card blocked', color: C.crimson, title: <>Card blocked.<br /><Hl c="#FCA5A5">Bill still growing?</Hl></>},
      {seg: 1, kicker: 'Why it keeps growing', color: C.amber, title: <>Blocked ≠<br />interest stopped</>},
      {seg: 2, kicker: 'Example', color: C.amber, title: <>₹1 lakh can add<br /><Hl c="#FCA5A5">≈₹3,000 a month</Hl></>},
      {seg: 4, kicker: 'But wait', color: C.cyan, title: <>RBI has a rule<br /><Hl>that protects you</Hl></>},
    ],
    question: <>Which RBI rule<br /><Hl>protects you here?</Hl></>,
    locked: ['Unpaid taxes and charges …', 'The over-limit fee check …'],
  },
  calls: {
    stage: StageCalls,
    heads: [
      {seg: 0, kicker: 'Recovery calls', color: C.crimson, title: <>Recovery agent<br /><Hl c="#FCA5A5">calling at 9 PM?</Hl></>},
      {seg: 1, kicker: 'Read this twice', color: C.amber, title: <>8 AM–7 PM ≠<br />anything goes</>},
      {seg: 2, kicker: 'Threats', color: C.crimson, title: <>“We’ll tell your<br />neighbours…”</>},
      {seg: 3, kicker: 'So what do you say?', color: C.cyan, title: <>Don’t shout back.<br /><Hl>Ask this instead</Hl></>},
    ],
    question: <>4 calm questions<br /><Hl>to ask the caller</Hl></>,
    locked: ['What is your name?', 'Which agency are you from?', 'Which bank are you calling for?', 'Send your authorisation …'],
  },
  thirtyk: {
    stage: StageThirtyK,
    heads: [
      {seg: 0, kicker: 'Settlement call', color: C.amber, title: <>“Pay ₹30,000,<br /><Hl>we close everything”</Hl></>},
      {seg: 1, kicker: 'Before you pay', color: C.cyan, title: <>Wait. Ask<br /><Hl>for this first</Hl></>},
      {seg: 2, kicker: 'The trap', color: C.crimson, title: <>“Pay a little first,<br />letter later…”</>},
      {seg: 3, kicker: 'The trap', color: C.crimson, title: <>What will that<br /><Hl c="#FCA5A5">payment count as?</Hl></>},
    ],
    question: <>What the letter<br /><Hl>must clearly show</Hl></>,
    locked: ['Your name and account', 'The settlement amount', 'Payment dates and instalments', 'The remaining dues …', 'Your credit report …'],
  },
  writeoff: {
    stage: StageWriteOff,
    heads: [
      {seg: 0, kicker: 'Write-off', color: C.crimson, title: <>Bank wrote off<br /><Hl c="#FCA5A5">your card. Debt gone?</Hl></>},
      {seg: 1, kicker: 'Myth', color: C.amber, title: <>“After 180 days<br />it’s written off”?</>},
      {seg: 2, kicker: 'Myth', color: C.amber, title: <>Just wait for<br /><Hl>a big discount?</Hl></>},
    ],
    question: <>What write-off<br /><Hl>really means</Hl></>,
    locked: ['A technical write-off is …', 'Can recovery continue?', 'What to do instead …'],
  },
  cibil: {
    stage: StageCibil,
    heads: [
      {seg: 0, kicker: 'After settlement', color: C.amber, title: <>Settled your card?<br /><Hl>Check your CIBIL</Hl></>},
      {seg: 1, kicker: 'Two words', color: C.cyan, title: <>Settled<br />vs Closed</>},
      {seg: 2, kicker: 'Surprise', color: C.crimson, title: <>No Dues ≠<br /><Hl c="#FCA5A5">“Closed”</Hl></>},
      {seg: 3, kicker: 'Can you rebuild?', color: C.emerald, title: <>Yes. But<br /><Hl>not overnight</Hl></>},
    ],
    question: <>How to rebuild<br /><Hl>your credit, step by step</Hl></>,
    locked: ['Settled vs Closed on your report', 'An FD-backed secured card …', 'What matters most …'],
  },
  salary: {
    stage: StageSalary,
    heads: [
      {seg: 0, kicker: 'Salary account', color: C.cyan, title: <>Salary & card<br /><Hl>in the same bank?</Hl></>},
      {seg: 1, kicker: 'Find these 2 words', color: C.amber, title: <>“Lien” and<br />“set-off”</>},
      {seg: 2, kicker: 'Common mistake', color: C.crimson, title: <>“My salary<br /><Hl c="#FCA5A5">can’t be touched”?</Hl></>},
    ],
    question: <>What it means<br /><Hl>for your salary</Hl></>,
    locked: ['Plan for rent, food, medicines', 'Does moving your salary help?', 'When to get advice …'],
  },
};

/* ---------------------------------------------------------------- the short */

export const Short: React.FC<{id: ShortId}> = ({id}) => {
  const frame = useCurrentFrame();
  const total = shortFrames(id);
  const end = voiceEnd(id);
  const S = DATA[id].segments.map((s) => ({a: f(s.t0), b: f(s.t1)}));
  const cfg = CFG[id];
  const Stage = cfg.stage;
  const prog = Math.min(1, frame / total);
  const musicVol = (fr: number) => interpolate(fr, [0, end, end + 15, total - 20, total], [0.07, 0.07, 0.2, 0.2, 0], CLAMP);
  return (
    <AbsoluteFill style={{background: `radial-gradient(1200px 900px at 50% 30%, #13203A 0%, ${C.bg} 70%)`}}>
      <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(56,189,248,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.06) 1px, transparent 1px)', backgroundSize: '90px 90px', opacity: 0.7}} />
      <div style={{position: 'absolute', left: SAFE_X, width: SHORT_W - SAFE_X * 2, top: 120, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.12)'}}>
        <div style={{width: `${prog * 100}%`, height: '100%', borderRadius: 4, background: C.gold}} />
      </div>
      <div style={{position: 'absolute', left: SAFE_X, top: 156, display: 'flex', alignItems: 'center', gap: 16}}>
        <div style={{padding: '6px 14px', borderRadius: 8, background: C.gold, color: '#04060C', fontFamily: MONO, fontSize: 22, fontWeight: 900, letterSpacing: 3}}>KNOW YOUR RIGHTS</div>
        <div style={{fontFamily: FONT, fontSize: 26, fontWeight: 700, color: '#D3DCE8'}}>Credit card debt · India</div>
      </div>

      {cfg.heads.map((h, i) => {
        const next = cfg.heads[i + 1];
        return <Head key={i} kicker={h.kicker} title={h.title} color={h.color} inF={h.seg === 0 ? 0 : S[h.seg].a} outF={next ? S[next.seg].a - 8 : end - 8} />;
      })}
      <Stage />
      <OpenLoop id={id} question={cfg.question} locked={cfg.locked} />
      <Captions id={id} />

      <div style={{position: 'absolute', left: SAFE_X, width: STAGE_W, top: 1452, textAlign: 'center', fontFamily: FONT, fontSize: 22, color: 'rgba(211,220,232,0.7)'}}>
        Awareness only — not legal advice. Facts of each case differ.
      </div>

      <Audio src={staticFile(`audio/shorts/${id}_enh.wav`)} />
      <Audio src={staticFile('audio/music/tension.mp3')} volume={musicVol} />
      {S.slice(1).map((s, i) => <Sfx key={i} at={s.a} name="air_whoosh" volume={0.08} />)}
      <Sfx at={end} name="title_hit" volume={0.2} />
      <Sfx at={end + 30} name="plasma_sweep" volume={0.1} />
    </AbsoluteFill>
  );
};

