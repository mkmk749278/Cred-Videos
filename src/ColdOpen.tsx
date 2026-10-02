import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {interpolate} from './lib/safeInterpolate';
import {C, FONT, MONO, alpha} from './theme';
import {CLAMP, spr} from './lib/anim';
import {FPS, timing} from './lib/timing';
import {LANG, VO_DIR} from './lib/lang';
import {Phone, Sfx} from './components/primitives';
import type {W} from './character/lipsync';

/**
 * Cold open: a phone drowning in recovery calls for ~3 s, the hook VO calms it down, then a quick title slam.
 * Replaces the old 7 s title intro. Timed from timing.json "hook" (word level).
 */

const hook = timing.hook as unknown as {duration: number; sentences: {words: W[]}[]};
const WORDS: W[] = hook.sentences.flatMap((s) => s.words);
const VO_AT = 10; // frames before the hook VO starts
const vf = (sec: number) => VO_AT + Math.round(sec * FPS);
const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, '');
const at = (phrase: string) => {
  const ps = phrase.split(' ').map(norm);
  for (let i = 0; i <= WORDS.length - ps.length; i++) if (ps.every((p, j) => norm(WORDS[i + j].w) === p)) return vf(WORDS[i].s);
  throw new Error(`hook cue "${phrase}" not found`);
};

const TITLE_FRAMES = 84;
export const COLD_OPEN_FRAMES = vf(hook.duration) + 14 + TITLE_FRAMES;


const NOTES = [
  {t: 'Missed call · +91 140XXXXX21', c: C.crimson},
  {t: 'Missed call · Unknown', c: C.crimson},
  {t: 'SMS · "Final notice. Pay today."', c: C.amber},
  {t: 'Missed call · Recovery desk', c: C.crimson},
  {t: 'WhatsApp · "Share live location"', c: C.amber},
  {t: 'Missed call · +91 77XXXXX09', c: C.crimson},
];
const POLICE = ['SMS · "Police complaint filed"', 'SMS · "Team visiting your house today"', 'SMS · "Family will be informed"'];

export const ColdOpen: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cMsg = at('Messages saying');
  const cStop = at('stop');
  const cBreath = at('Take a breath');
  const cShow = at("I'll show you");
  const cLaw = at('the law really says');
  const cDo = at('exactly what you can do');
  const cStay = at('And stay till');
  const cCase = at('my own case');
  const end = vf(hook.duration) + 14;

  const calm = interpolate(f, [cStop, cBreath + 20], [0, 1], CLAMP);
  const alarm = interpolate(f, [0, 8, cStop, cStop + 10], [0, 1, 1, 0], CLAMP);
  const shake = f < cStop ? Math.sin(f * 2.6) * (f > cMsg ? 3 : 1.5) : 0;
  const callCount = Math.min(40, Math.floor(interpolate(f, [4, cMsg + 10], [1, 40], CLAMP)));
  const titleIn = f - end;

  return (
    <AbsoluteFill style={{fontFamily: FONT, color: C.text, overflow: 'hidden'}}>
      {/* background: red-alert dark room that warms up after "stop" */}
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 40% 40%, ${alpha('#7F1D1D', 0.55 * (1 - calm) + 0.05)} 0%, #07080D 70%)`}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 40% 45%, ${alpha('#F59E0B', 0.32 * calm)} 0%, transparent 65%)`}} />
      <AbsoluteFill style={{background: alpha('#EF4444', 0.08 * alarm * (0.5 + 0.5 * Math.sin(f / 3)))}} />
      <Audio src={staticFile('audio/music/tension.mp3')} volume={(fr) => interpolate(fr, [0, 15, end - 20, end], [0, 0.09, 0.09, 0], CLAMP)} />
      <Sequence from={VO_AT} layout="none">
        <Audio src={staticFile(`${VO_DIR}/hook.mp3`)} />
      </Sequence>
      {[2, 20, 38].map((d) => (
        <Sfx key={d} at={d} name="haptic_buzz" volume={0.1} />
      ))}
      <Sfx at={cMsg} name="warning_pulse" volume={0.22} />
      <Sfx at={cStop} name="sub_thud" volume={0.4} />
      <Sfx at={cCase} name="key_click" volume={0.4} />
      <Sfx at={cShow} name="shield_activate" volume={0.3} />

      {/* the phone */}
      <div style={{position: 'absolute', left: 300, top: 120, transform: `translate(${shake}px, 0) rotate(${f < cStop ? Math.sin(f * 1.9) * 2.2 : 0}deg) scale(0.92)`, transformOrigin: '50% 60%', opacity: titleIn > 0 ? interpolate(titleIn, [0, 12], [1, 0], CLAMP) : 1}}>
        {f < cStop && (
          <svg width={900} height={900} style={{position: 'absolute', left: -240, top: -40, overflow: 'visible'}}>
            {[0, 1, 2].map((r) => {
              const q = ((f / 30) + r / 3) % 1;
              return <circle key={r} cx={450} cy={430} r={260 + q * 220} fill="none" stroke={alpha(C.crimson, 0.6 * (1 - q))} strokeWidth={6} />;
            })}
          </svg>
        )}
        <Phone width={420} height={860} screen={f < cStop ? '#1A0B10' : '#0B1020'}>
          <PhoneScreen f={f} cMsg={cMsg} cStop={cStop} cShow={cShow} calls={callCount} />
        </Phone>
      </div>

      {/* notification storm */}
      {f < cStop + 12 && (
        <div style={{position: 'absolute', right: 120, top: 120, width: 620, display: 'flex', flexDirection: 'column', gap: 12, opacity: interpolate(f, [cStop, cStop + 12], [1, 0], CLAMP), transform: `translateY(${interpolate(f, [cStop, cStop + 12], [0, 60], CLAMP)}px)`}}>
          {[...NOTES, ...POLICE.map((t) => ({t, c: C.crimson}))].map((n, j) => {
            const appear = j < NOTES.length ? 4 + j * 6 : cMsg + (j - NOTES.length) * 12;
            if (f < appear) return null;
            const p = spr(f, fps, appear, {damping: 16, stiffness: 240, mass: 0.5});
            return (
              <div key={j} style={{padding: '14px 20px', borderRadius: 16, background: 'rgba(15,23,42,0.92)', border: `1.5px solid ${alpha(n.c, 0.7)}`, boxShadow: `0 10px 30px rgba(0,0,0,0.5), 0 0 20px ${alpha(n.c, 0.25)}`, fontSize: 26, fontWeight: 700, transform: `translateX(${(1 - p) * 80}px) scale(${0.9 + 0.1 * p})`, opacity: p}}>
                <span style={{color: n.c, marginRight: 10}}>●</span>
                {n.t}
              </div>
            );
          })}
        </div>
      )}
      {/* "Stop." / "Take a breath." */}
      {f >= cStop && f < cShow + 6 && (
        <div style={{position: 'absolute', left: 1020, top: 330, width: 820}}>
          <div style={{fontSize: 150, fontWeight: 900, lineHeight: 1, opacity: interpolate(f, [cStop, cStop + 4, cBreath - 2, cBreath + 6], [0, 1, 1, 0.25], CLAMP), transform: `scale(${1.2 - 0.2 * spr(f, fps, cStop, {damping: 12, stiffness: 260, mass: 0.5})})`, transformOrigin: 'left center'}}>Stop.</div>
          <div style={{fontSize: 74, fontWeight: 800, color: '#FDE68A', marginTop: 20, opacity: interpolate(f, [cBreath, cBreath + 10, cShow - 4, cShow + 6], [0, 1, 1, 0], CLAMP), letterSpacing: interpolate(f, [cBreath, cBreath + 40], [0, 6], CLAMP)}}>Take a breath.</div>
        </div>
      )}
      {/* promises */}
      <div style={{position: 'absolute', left: 1040, top: LANG === 'te' ? 190 : 300, display: 'flex', flexDirection: 'column', gap: LANG === 'te' ? 16 : 22}}>
        {((LANG === 'te'
          ? [
              // the Telugu hook asks six questions; one line per question, on its word
              {a: vf(33.8), t: 'What happens if you can’t pay', c: C.cyan, ic: 'statement' as RoadIconKind},
              {a: vf(37.4), t: 'What the bank can do', c: C.cyan, ic: 'bank'},
              {a: vf(39.3), t: 'The protections you have', c: C.emerald, ic: 'shield'},
              {a: vf(41.3), t: 'How to handle recovery calls', c: C.emerald, ic: 'phone'},
              {a: vf(43.7), t: 'What settlement really means', c: C.amber, ic: 'letter'},
              {a: vf(45.6), t: 'How to rebuild your credit score', c: C.amber, ic: 'report'},
            ]
          : [
              {a: cLaw, t: 'What the law really says', c: C.cyan},
              {a: cDo, t: 'Exactly what you can do', c: C.emerald},
            ]) as {a: number; t: string; c: string; ic?: RoadIconKind}[]
        ).map((x: {a: number; t: string; c: string; ic?: RoadIconKind}) => {
          const p = spr(f, fps, x.a, {damping: 15, stiffness: 200, mass: 0.6});
          return f < x.a || titleIn > 6 ? null : (
            <div key={x.t} style={{fontSize: LANG === 'te' ? 44 : 54, fontWeight: 900, color: x.c, opacity: p, transform: `translateY(${(1 - p) * 30}px)`, textShadow: '0 4px 20px rgba(0,0,0,0.6)'}}>
              {x.ic ? <span style={{display: 'inline-flex', alignItems: 'center', gap: 20}}><RoadIcon kind={x.ic} color={x.c} />{x.t}</span> : <>✓ {x.t}</>}
            </div>
          );
        })}
        {f >= cCase - 4 && titleIn <= 6 && (
          <div style={{marginTop: 18, display: 'flex', alignItems: 'center', gap: 18, padding: '18px 26px', borderRadius: 20, background: alpha(C.gold, 0.14), border: `2px solid ${alpha(C.gold, 0.7)}`, opacity: spr(f, fps, cCase - 4), transform: `scale(${0.9 + 0.1 * spr(f, fps, cCase - 4)})`}}>
            <svg width={44} height={52} viewBox="0 0 44 52"><rect x={4} y={22} width={36} height={28} rx={6} fill={C.gold} /><path d="M12 22 V14 a10 10 0 0 1 20 0 V22" fill="none" stroke={C.gold} strokeWidth={6} /><circle cx={22} cy={36} r={4} fill="#05060B" /></svg>
            <div>
              <div style={{fontFamily: MONO, fontSize: 18, letterSpacing: 4, color: C.gold}}>STAY TILL THE END</div>
              <div style={{fontSize: 36, fontWeight: 900}}>How I'm handling my own case</div>
            </div>
          </div>
        )}
      </div>

      {/* title slam */}
      {titleIn > 0 && <TitleSlam f={titleIn} />}
      <AbsoluteFill style={{background: '#000', opacity: interpolate(f, [0, 6], [1, 0], CLAMP), pointerEvents: 'none'}} />
      <AbsoluteFill style={{background: '#000', opacity: interpolate(f, [COLD_OPEN_FRAMES - 10, COLD_OPEN_FRAMES], [0, 1], CLAMP), pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};

const TitleSlam: React.FC<{f: number}> = ({f}) => {
  const {fps} = useVideoConfig();
  const p = spr(f, fps, 0, {damping: 13, stiffness: 230, mass: 0.6});
  const line = interpolate(f, [8, 26], [0, 1], CLAMP);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', background: `radial-gradient(ellipse at 50% 45%, ${alpha(C.gold, 0.18)} 0%, #05060B 70%)`, opacity: interpolate(f, [0, 6], [0, 1], CLAMP)}}>
      <Sfx at={0} name="title_hit" volume={0.55} />
      <div style={{textAlign: 'center', transform: `scale(${1.3 - 0.3 * p})`, opacity: Math.min(1, p * 1.3), filter: p < 0.9 ? `blur(${(1 - p) * 10}px)` : undefined}}>
        <div style={{fontFamily: MONO, color: C.gold, fontSize: 30, letterSpacing: 14, fontWeight: 700}}>KNOW YOUR RIGHTS</div>
        <div style={{fontSize: 128, fontWeight: 900, lineHeight: 1.02, letterSpacing: -3, marginTop: 10}}>
          Credit Card Debt
          <br />
          <span style={{color: C.gold}}>in India</span>
        </div>
        <div style={{height: 4, width: 620 * line, margin: '24px auto', background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`}} />
        <div style={{fontSize: 34, color: C.muted}}>A borrower's guide to law, dignity and resolution</div>
        <div style={{fontSize: 18, color: C.dim, marginTop: 26, opacity: interpolate(f, [20, 34], [0, 1], CLAMP)}}>Awareness only — not legal or financial advice. Practices and figures vary and may change.</div>
      </div>
    </AbsoluteFill>
  );
};

const PhoneScreen: React.FC<{f: number; cMsg: number; cStop: number; cShow: number; calls: number}> = ({f, cMsg, cStop, cShow, calls}) => {
  const pulse = 0.5 + 0.5 * Math.sin(f / 4);
  if (f < cStop) {
    return (
      <AbsoluteFill style={{alignItems: 'center', fontFamily: FONT, color: '#fff', background: `radial-gradient(ellipse at 50% 30%, ${alpha(C.crimson, 0.35)}, transparent 70%)`}}>
        <div style={{marginTop: 120, fontSize: 22, letterSpacing: 4, color: alpha('#ffffff', 0.7)}}>INCOMING CALL</div>
        <div style={{marginTop: 16, fontSize: 40, fontWeight: 900, whiteSpace: 'nowrap'}}>{f < cMsg ? 'Recovery Agent' : 'Unknown Number'}</div>
        <div style={{marginTop: 8, fontSize: 26, color: alpha('#ffffff', 0.7), fontFamily: MONO}}>{f < cMsg ? '+91 140XXXXX21' : '+91 77XXXXX09'}</div>
        <div style={{marginTop: 70, width: 220, height: 220, borderRadius: 110, background: alpha(C.crimson, 0.18), border: `3px solid ${alpha(C.crimson, 0.7)}`, display: 'grid', placeItems: 'center', boxShadow: `0 0 ${30 + 30 * pulse}px ${alpha(C.crimson, 0.6)}`}}>
          <div style={{textAlign: 'center'}}>
            <div style={{fontSize: 96, fontWeight: 900, lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>{calls}</div>
            <div style={{fontSize: 18, letterSpacing: 3, color: alpha('#ffffff', 0.75)}}>MISSED TODAY</div>
          </div>
        </div>
        <div style={{position: 'absolute', bottom: 90, left: 60, right: 60, display: 'flex', justifyContent: 'space-between'}}>
          <div style={{width: 96, height: 96, borderRadius: 48, background: C.crimson, display: 'grid', placeItems: 'center', fontSize: 40}}>✕</div>
          <div style={{width: 96, height: 96, borderRadius: 48, background: C.green, display: 'grid', placeItems: 'center', fontSize: 40, transform: `scale(${1 + 0.08 * pulse})`}}>✆</div>
        </div>
      </AbsoluteFill>
    );
  }
  const calm = f < cShow;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', fontFamily: FONT, color: '#fff', textAlign: 'center'}}>
      {calm ? (
        <div>
          <svg width={110} height={110} viewBox="0 0 100 100"><path d="M64 14 A38 38 0 1 0 86 64 A30 30 0 1 1 64 14 Z" fill="#A5B4FC" /></svg>
          <div style={{fontSize: 34, fontWeight: 800, marginTop: 18}}>Do Not Disturb</div>
          <div style={{fontSize: 22, color: alpha('#ffffff', 0.6), marginTop: 6}}>Silenced</div>
        </div>
      ) : (
        <div>
          <svg width={130} height={150} viewBox="0 0 100 116"><path d="M50 4 L92 20 V54 C92 82 74 102 50 112 C26 102 8 82 8 54 V20 Z" fill={alpha(C.emerald, 0.25)} stroke={C.emerald} strokeWidth={5} /><path d="M30 58 L45 73 L72 44" fill="none" stroke="#fff" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" /></svg>
          <div style={{fontSize: 36, fontWeight: 900, marginTop: 18}}>Know your rights</div>
          <div style={{fontSize: 22, color: alpha('#ffffff', 0.65), marginTop: 6}}>Debt is not a crime</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

/* Telugu roadmap: one object icon per promise (statement, bank, shield, phone, letter, report) */
type RoadIconKind = 'statement' | 'bank' | 'shield' | 'phone' | 'letter' | 'report';
const RoadIcon: React.FC<{kind: RoadIconKind; color: string}> = ({kind, color}) => {
  const st = {fill: 'none', stroke: color, strokeWidth: 4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  return (
    <span style={{display: 'inline-flex', width: 64, height: 64, borderRadius: 16, background: alpha(color, 0.16), border: `2px solid ${alpha(color, 0.7)}`, alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
      <svg width={40} height={40} viewBox="0 0 40 40">
        {kind === 'statement' && <><rect x={8} y={4} width={24} height={32} rx={3} {...st} /><path d="M13 13h14M13 19h14M13 25h8" {...st} /></>}
        {kind === 'bank' && <><path d="M5 15 L20 6 L35 15 Z" {...st} /><path d="M9 18v12M16 18v12M24 18v12M31 18v12M5 34h30" {...st} /></>}
        {kind === 'shield' && <><path d="M20 4 L33 9 V19 C33 27 27 33 20 36 C13 33 7 27 7 19 V9 Z" {...st} /><path d="M14 20 l4 4 l8 -9" {...st} /></>}
        {kind === 'phone' && <><rect x={11} y={3} width={18} height={34} rx={4} {...st} /><path d="M17 31h6" {...st} /></>}
        {kind === 'letter' && <><rect x={4} y={9} width={32} height={22} rx={3} {...st} /><path d="M5 11 L20 22 L35 11" {...st} /></>}
        {kind === 'report' && <><path d="M6 34h28" {...st} /><path d="M10 28v-6M17 28v-11M24 28v-8M31 28v-16" {...st} /></>}
      </svg>
    </span>
  );
};
