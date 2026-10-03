import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {interpolate} from '../lib/safeInterpolate';
import {C, FONT as LATIN, MONO, alpha} from '../theme';
import {CLAMP, spr} from '../lib/anim';
import {LANG} from '../lib/lang';
import {Phone, Sfx} from '../components/primitives';
import reelEnh from '../data/reel_enh.json';
import reelTe from '../data/reel_te.json';

/**
 * 30-second 9:16 reel (Instagram Reels / YouTube Shorts) cut from the creator's own narration.
 * REMOTION_LANG=enh → English narration, word-by-word captions; REMOTION_LANG=te → Telugu narration,
 * the creator's English translation as captions and Telugu headlines.
 * Platform safe area: nothing important below y≈1480 (caption/CTA buttons) or in the right 150 px
 * (like/comment/share column); the hook is fully visible on frame 0 (cover + first impression).
 */

export const REEL_W = 1080;
export const REEL_H = 1920;
export const REEL_FPS = 30;
export const REEL_FRAMES = 900; // 30.0 s

type Word = {w: string; s: number; e: number; seg: number};
type Data = {duration: number; segments: {t0: number; t1: number}[]; words?: Word[]; lines?: {text: string; s: number; e: number}[]};
const TE = LANG === 'te';
const D = (TE ? reelTe : reelEnh) as unknown as Data;
const TE_FONT = "'Noto Sans Telugu', 'Inter', sans-serif";
// every text block may carry Telugu in the Telugu reel
const FONT = TE ? TE_FONT : LATIN;
const f = (sec: number) => Math.round(sec * REEL_FPS);
const SEG = D.segments.map((s) => ({a: f(s.t0), b: f(s.t1)}));
const CTA_AT = f(D.duration) + 4;
const SAFE_X = 70; // left margin; right margin 150 (platform buttons)
const STAGE_W = REEL_W - SAFE_X - 150;

const t = <T,>(en: T, te: T): T => (TE ? te : en);

/* ---------------------------------------------------------------- pieces */

const Chip: React.FC<{text: string; color: string; size?: number; style?: React.CSSProperties}> = ({text, color, size = 30, style}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', padding: '10px 22px', borderRadius: 999, border: `3px solid ${color}`, background: alpha(color, 0.16), color: '#fff', fontFamily: FONT, fontSize: size, fontWeight: 800, whiteSpace: 'nowrap', ...style}}>
    {text}
  </div>
);

const Stamp: React.FC<{text: string; color: string; p: number; rot?: number; size?: number}> = ({text, color, p, rot = -6, size = 44}) => (
  <div style={{display: 'inline-block', padding: '12px 26px', borderRadius: 16, border: `6px solid ${color}`, color, fontFamily: FONT, fontSize: size, fontWeight: 900, letterSpacing: 1, background: alpha('#04060C', 0.75), transform: `rotate(${rot}deg) scale(${1.35 - 0.35 * p})`, opacity: p, textAlign: 'center', lineHeight: 1.15}}>
    {text}
  </div>
);

const Card: React.FC<{children: React.ReactNode; color?: string; style?: React.CSSProperties}> = ({children, color = 'rgba(148,163,184,0.45)', style}) => (
  <div style={{padding: '24px 28px', borderRadius: 26, background: '#0E1628', border: `3px solid ${color}`, boxShadow: '0 30px 70px rgba(0,0,0,0.55)', boxSizing: 'border-box', ...style}}>{children}</div>
);

/** Headline at the top of the stage: changes per beat, with the Telugu line in the Telugu reel */
const Headline: React.FC<{kicker: string; title: React.ReactNode; te?: string; color: string; inF: number; outF: number}> = ({kicker, title, te, color, inF, outF}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < inF - 2 || frame > outF + 8) return null;
  const pin = inF <= 0 ? 1 : spr(frame, fps, inF);
  const pout = interpolate(frame, [outF, outF + 8], [1, 0], CLAMP);
  return (
    <div style={{position: 'absolute', left: SAFE_X, width: STAGE_W, top: 250, opacity: Math.min(pin, pout), transform: `translateY(${(1 - pin) * 24}px)`}}>
      <div style={{fontFamily: TE ? TE_FONT : MONO, fontSize: TE ? 30 : 26, letterSpacing: TE ? 1 : 5, color, fontWeight: 800, textTransform: 'uppercase'}}>{kicker}</div>
      <div style={{fontFamily: FONT, fontSize: 74, fontWeight: 900, color: '#fff', lineHeight: 1.05, letterSpacing: -1.5, marginTop: 12}}>{title}</div>
      {te && <div style={{fontFamily: TE_FONT, fontSize: 40, fontWeight: 700, color: '#D3DCE8', marginTop: 14, lineHeight: 1.35}}>{te}</div>}
    </div>
  );
};

/** Word-by-word captions (English) — pages of a few words, the spoken word highlighted */
const WordCaptions: React.FC = () => {
  const frame = useCurrentFrame();
  const words = D.words ?? [];
  const pages: Word[][] = [];
  let cur: Word[] = [];
  words.forEach((w, i) => {
    cur.push(w);
    const len = cur.map((x) => x.w).join(' ').length;
    const next = words[i + 1];
    if (!next || next.seg !== w.seg || /[.?!,]$/.test(w.w) && len > 14 || len > 30) {
      pages.push(cur);
      cur = [];
    }
  });
  const tt = frame / REEL_FPS;
  const page = pages.find((pg, i) => tt >= pg[0].s - 0.08 && tt < (pages[i + 1] ? Math.min(pages[i + 1][0].s - 0.08, pg[pg.length - 1].e + 0.6) : pg[pg.length - 1].e + 0.6));
  if (!page || frame >= CTA_AT) return null;
  const pin = interpolate(tt, [page[0].s - 0.08, page[0].s + 0.06], [0, 1], CLAMP);
  return (
    <div style={{position: 'absolute', left: SAFE_X - 10, width: STAGE_W + 20, top: 1190, height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: pin}}>
      <div style={{textAlign: 'center', fontFamily: FONT, fontSize: 62, fontWeight: 900, lineHeight: 1.18, letterSpacing: -0.5}}>
        {page.map((w, i) => {
          const said = tt >= w.s - 0.03;
          const active = said && tt < w.e + 0.04;
          return (
            <span key={i} style={{color: active ? '#FDE047' : said ? '#FFFFFF' : 'rgba(255,255,255,0.55)', textShadow: '0 4px 18px rgba(0,0,0,0.9), 0 0 2px #000', margin: '0 9px', display: 'inline-block'}}>
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** Line captions (Telugu reel): the creator's English translation, one line per passage */
const LineCaptions: React.FC = () => {
  const frame = useCurrentFrame();
  const tt = frame / REEL_FPS;
  const line = (D.lines ?? []).find((l) => tt >= l.s - 0.05 && tt < l.e + 0.2);
  if (!line || frame >= CTA_AT) return null;
  const pin = interpolate(tt, [line.s - 0.05, line.s + 0.15], [0, 1], CLAMP);
  return (
    <div style={{position: 'absolute', left: SAFE_X, width: STAGE_W, top: 1190, height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: pin}}>
      <div style={{textAlign: 'center', fontFamily: FONT, fontSize: 46, fontWeight: 800, lineHeight: 1.28, color: '#fff', textShadow: '0 4px 18px rgba(0,0,0,0.9)'}}>{line.text}</div>
    </div>
  );
};

/* ---------------------------------------------------------------- beats */

const BeatHook: React.FC = () => {
  const frame = useCurrentFrame();
  const {a, b} = SEG[0];
  if (frame > b + 10) return null;
  const out = interpolate(frame, [b, b + 10], [1, 0], CLAMP);
  const shake = Math.sin(frame * 2.4) * 4 * interpolate(frame, [0, b], [1, 0.4], CLAMP);
  const calls = Math.min(47, 38 + Math.floor(frame / 9));
  return (
    <div style={{position: 'absolute', inset: 0, opacity: out}}>
      <div style={{position: 'absolute', left: 560, top: 560, transform: `rotate(${shake * 0.6}deg) translateX(${shake}px) scale(0.78)`, transformOrigin: 'top center'}}>
        <Phone width={420} height={760} screen="#1A0B10">
          <div style={{position: 'absolute', top: 110, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, color: '#fff'}}>
            <div style={{fontSize: 22, letterSpacing: 4, color: '#FCA5A5', fontWeight: 800}}>INCOMING CALL</div>
            <div style={{fontSize: 40, fontWeight: 900, marginTop: 12}}>{t('Recovery Agent', 'Recovery Agent')}</div>
            <div style={{fontFamily: MONO, fontSize: 24, color: '#CBD5E1', marginTop: 6}}>+91 98XXX XXX21</div>
            <div style={{margin: '60px auto 0', width: 190, height: 190, borderRadius: 95, border: `6px solid ${C.crimson}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 ${30 + 20 * Math.sin(frame / 4)}px ${alpha(C.crimson, 0.7)}`}}>
              <div style={{fontSize: 80, fontWeight: 900, lineHeight: 1}}>{calls}</div>
              <div style={{fontSize: 18, letterSpacing: 3, color: '#FCA5A5', fontWeight: 800}}>MISSED TODAY</div>
            </div>
          </div>
          <div style={{position: 'absolute', bottom: 70, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 90}}>
            <div style={{width: 92, height: 92, borderRadius: 46, background: C.crimson}} />
            <div style={{width: 92, height: 92, borderRadius: 46, background: C.green}} />
          </div>
        </Phone>
      </div>
      {['“Pay today.”', t('“Police case will be filed.”', '“Police case పెడతాం.”'), '“Our team is coming home.”'].map((m, i) => {
        const at = 8 + i * 22;
        const p = interpolate(frame, [at, at + 8], [0, 1], CLAMP);
        return (
          <div key={m} style={{position: 'absolute', left: SAFE_X, top: 660 + i * 150, padding: '16px 24px', borderRadius: '24px 24px 24px 6px', background: '#2A1416', border: `3px solid ${C.crimson}`, fontFamily: TE && i === 1 ? TE_FONT : FONT, fontSize: 34, fontWeight: 800, color: '#fff', opacity: p, transform: `scale(${0.85 + 0.15 * p})`, boxShadow: '0 20px 40px rgba(0,0,0,0.5)'}}>
            {m}
          </div>
        );
      })}
    </div>
  );
};

const BeatCivil: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {a, b} = SEG[1];
  if (frame < a - 4 || frame > b + 10) return null;
  const o = Math.min(spr(frame, fps, a), interpolate(frame, [b, b + 10], [1, 0], CLAMP));
  const stamp = spr(frame, fps, a + Math.round((b - a) * 0.55));
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <div style={{position: 'absolute', left: SAFE_X, width: STAGE_W, top: 640, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
        <Card color={C.cyan} style={{width: '100%'}}>
          <div style={{fontFamily: FONT, fontSize: 50, fontWeight: 900, color: '#fff'}}>{t('Missed payment', 'Payment miss')}</div>
          <div style={{fontFamily: FONT, fontSize: 36, color: '#D3DCE8', marginTop: 6}}>{t('because of genuine money problems', 'నిజమైన ఆర్థిక ఇబ్బంది వల్ల')}</div>
        </Card>
        <div style={{fontSize: 60, color: C.cyan, lineHeight: 1}}>↓</div>
        <Card color={C.emerald} style={{width: '100%'}}>
          <div style={{fontFamily: FONT, fontSize: 48, fontWeight: 900, color: '#fff'}}>{t('Usually a civil recovery matter', 'సాధారణంగా civil recovery matter')}</div>
        </Card>
      </div>
      <div style={{position: 'absolute', left: 0, width: SAFE_X + STAGE_W + SAFE_X, top: 1030, textAlign: 'center'}}>
        <Stamp text={t('NOT automatic cheating', 'Automatic cheating కాదు')} color={C.crimson} p={stamp} size={TE ? 40 : 46} />
      </div>
    </div>
  );
};

const BeatCaller: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {a, b} = SEG[2];
  if (frame < a - 4 || frame > b + 10) return null;
  const o = Math.min(spr(frame, fps, a), interpolate(frame, [b, b + 10], [1, 0], CLAMP));
  const shout = frame < a + (b - a) * 0.45 ? Math.sin(frame * 2.2) * 5 : 0;
  const stamp = spr(frame, fps, a + Math.round((b - a) * 0.55));
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <div style={{position: 'absolute', left: SAFE_X, width: STAGE_W, top: 660, transform: `translateX(${shout}px)`}}>
        <div style={{padding: '30px 34px', borderRadius: '34px 34px 34px 8px', background: '#2A1416', border: `4px solid ${C.crimson}`, fontFamily: FONT, fontSize: 52, fontWeight: 900, color: '#fff', lineHeight: 1.15, boxShadow: '0 30px 60px rgba(0,0,0,0.5)'}}>
          📞 {t('“We’ll put a criminal case on you!”', '“Criminal case పెడతాం!”')}
        </div>
      </div>
      <div style={{position: 'absolute', left: SAFE_X, width: STAGE_W, top: 960, textAlign: 'center'}}>
        <Stamp text={t('A caller’s threat ≠ the law', 'Caller threat ≠ law')} color={C.amber} p={stamp} rot={-4} size={46} />
      </div>
    </div>
  );
};

const BeatDontIgnore: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {a, b} = SEG[3];
  if (frame < a - 4 || frame > b + 10) return null;
  const o = Math.min(spr(frame, fps, a), interpolate(frame, [b, b + 10], [1, 0], CLAMP));
  const steps = [t('Legal notice', 'Legal notice'), t('Recovery case', 'Recovery case'), t('Court order', 'Court order')];
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <div style={{position: 'absolute', left: SAFE_X, width: STAGE_W, top: 640}}>
        <div style={{display: 'inline-block', fontFamily: FONT, fontSize: 46, fontWeight: 800, color: '#FCA5A5', textDecoration: 'line-through', textDecorationThickness: 4}}>
          {t('“Nothing can happen, so I can ignore everything.”', '“Civil matter కదా, ఏమీ జరగదు.”')}
        </div>
        <div style={{marginTop: 34, display: 'flex', flexDirection: 'column', gap: 18}}>
          {steps.map((s, i) => {
            const p = spr(frame, fps, a + 12 + i * 14);
            return (
              <div key={s} style={{display: 'flex', alignItems: 'center', gap: 20, opacity: p, transform: `translateX(${(1 - p) * 40}px)`}}>
                <div style={{width: 64, height: 64, borderRadius: 32, background: alpha(C.amber, 0.2), border: `3px solid ${C.amber}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontSize: 30, fontWeight: 900, color: '#FDE68A'}}>{i + 1}</div>
                <div style={{fontFamily: FONT, fontSize: 54, fontWeight: 900, color: '#fff'}}>{s}</div>
              </div>
            );
          })}
        </div>
        <div style={{marginTop: 26, fontFamily: FONT, fontSize: 32, color: '#D3DCE8', opacity: spr(frame, fps, a + 56)}}>{t('The bank can use the legal process', 'Bank legal recovery process చేయొచ్చు')}</div>
      </div>
    </div>
  );
};

const BeatNotice: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {a, b} = SEG[4];
  if (frame < a - 4 || frame > CTA_AT + 8) return null;
  const o = Math.min(spr(frame, fps, a), interpolate(frame, [CTA_AT - 6, CTA_AT + 4], [1, 0], CLAMP));
  const check = spr(frame, fps, a + Math.round((b - a) * 0.62));
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <div style={{position: 'absolute', left: SAFE_X, top: 650, width: 480, height: 400, borderRadius: 14, background: 'linear-gradient(170deg, #FBF9F4, #F4F1EA)', boxShadow: '0 40px 90px rgba(0,0,0,0.55)', transform: 'rotate(-3deg)', padding: 30, boxSizing: 'border-box', color: '#1B2433', fontFamily: FONT}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div style={{fontSize: 34, fontWeight: 900}}>LEGAL NOTICE</div>
          <div style={{fontSize: 18, fontWeight: 800, color: '#B45309', border: '2px solid #B45309', borderRadius: 6, padding: '2px 8px'}}>SAMPLE</div>
        </div>
        <div style={{fontFamily: MONO, fontSize: 20, color: '#475569', marginTop: 16}}>Ref LN/2026/0412 · Card •••• 4821</div>
        {[90, 74, 82, 60].map((w, i) => <div key={i} style={{height: 12, borderRadius: 6, background: '#CBD5E1', width: `${w}%`, marginTop: 22}} />)}
      </div>
      <div style={{position: 'absolute', left: 590, top: 690, display: 'flex', flexDirection: 'column', gap: 18}}>
        <Chip text={t('Court summons', 'Court summons')} color={C.cyan} size={30} style={{opacity: spr(frame, fps, a + 30)}} />
        <Chip text={t('Arbitration notice', 'Arbitration notice')} color={C.cyan} size={30} style={{opacity: spr(frame, fps, a + 44)}} />
      </div>
      <div style={{position: 'absolute', left: SAFE_X, width: STAGE_W, top: 1080, display: 'flex', gap: 18, justifyContent: 'center', opacity: check, transform: `scale(${0.9 + 0.1 * check})`}}>
        <Chip text={t('✓ Check it', '✓ Verify చేయండి')} color={C.emerald} size={40} />
        <Chip text={t('✓ Respond properly', '✓ Ignore చేయొద్దు')} color={C.emerald} size={40} />
      </div>
    </div>
  );
};

const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < CTA_AT - 4) return null;
  const p = spr(frame, fps, CTA_AT);
  const bounce = Math.abs(Math.sin((frame - CTA_AT) / 7)) * 16;
  const topics = TE
    ? ['Recovery calls — మీ హక్కులు', 'Settlement letter చెక్', 'NPA & write-off', 'CIBIL rebuild']
    : ['Your rights on recovery calls', 'Checking a settlement letter', 'NPA & write-off', 'Rebuilding your CIBIL'];
  return (
    <div style={{position: 'absolute', inset: 0, opacity: p}}>
      <div style={{position: 'absolute', left: SAFE_X, width: STAGE_W, top: 560, transform: `translateY(${(1 - p) * 40}px)`}}>
        <div style={{fontFamily: MONO, fontSize: 28, letterSpacing: 6, color: C.gold, fontWeight: 800}}>FULL GUIDE · FREE</div>
        <div style={{fontFamily: FONT, fontSize: 80, fontWeight: 900, color: '#fff', lineHeight: 1.04, marginTop: 10, letterSpacing: -1.5}}>
          {t('Watch the full video on YouTube', 'Full video YouTube లో చూడండి')}
        </div>
        <div style={{fontFamily: FONT, fontSize: 34, color: '#D3DCE8', marginTop: 14}}>{t('27 minutes · step by step · simple English', '31 నిమిషాలు · step by step · simple Telugu')}</div>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 30}}>
          {topics.map((x, i) => (
            <Chip key={x} text={x} color={C.cyan} size={TE ? 28 : 30} style={{opacity: spr(frame, fps, CTA_AT + 6 + i * 5), fontFamily: TE ? TE_FONT : FONT}} />
          ))}
        </div>
      </div>
      <div style={{position: 'absolute', left: SAFE_X, width: STAGE_W, top: 1200, textAlign: 'center', fontFamily: FONT, fontSize: 50, fontWeight: 900, color: '#FDE047', transform: `translateY(${bounce}px)`}}>
        {t('Tap the link below', 'కింద link నొక్కండి')} ↓
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- reel */

export const Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const prog = Math.min(1, frame / REEL_FRAMES);
  const musicVol = (fr: number) => (fr < CTA_AT ? 0.07 : interpolate(fr, [CTA_AT, CTA_AT + 15, REEL_FRAMES - 20, REEL_FRAMES], [0.07, 0.2, 0.2, 0], CLAMP));
  return (
    <AbsoluteFill style={{background: `radial-gradient(1200px 900px at 50% 30%, #13203A 0%, ${C.bg} 70%)`}}>
      {/* subtle grid */}
      <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(56,189,248,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.06) 1px, transparent 1px)', backgroundSize: '90px 90px', opacity: 0.7}} />
      {/* top: progress + brand */}
      <div style={{position: 'absolute', left: SAFE_X, width: REEL_W - SAFE_X * 2, top: 120, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.12)'}}>
        <div style={{width: `${prog * 100}%`, height: '100%', borderRadius: 4, background: C.gold}} />
      </div>
      <div style={{position: 'absolute', left: SAFE_X, top: 156, display: 'flex', alignItems: 'center', gap: 16}}>
        <div style={{padding: '6px 14px', borderRadius: 8, background: C.gold, color: '#04060C', fontFamily: MONO, fontSize: 22, fontWeight: 900, letterSpacing: 3}}>KNOW YOUR RIGHTS</div>
        <div style={{fontFamily: TE ? TE_FONT : FONT, fontSize: 26, fontWeight: 700, color: '#D3DCE8'}}>{t('Credit card debt · India', 'Credit card అప్పు · మీ హక్కులు')}</div>
      </div>

      <Headline kicker={t('The biggest fear', 'అందరి పెద్ద భయం')} color={C.crimson} inF={0} outF={SEG[0].b}
        title={t(<>Can’t pay your card bill?<br /><span style={{color: '#FCA5A5'}}>Will police arrest you?</span></>, <>Credit card bill కట్టలేకపోతే<br /><span style={{color: '#FCA5A5'}}>Police arrest చేస్తారా?</span></>)} />
      <Headline kicker={t('What the law says', 'Law ఏం చెప్తుంది')} color={C.cyan} inF={SEG[1].a} outF={SEG[1].b}
        title={t('Missed payment ≠ cheating', 'Payment miss ≠ cheating')} te={TE ? 'Payment miss అయితే cheating అని automatic గా prove అవ్వదు' : undefined} />
      <Headline kicker={t('Threat calls', 'Threat calls')} color={C.amber} inF={SEG[2].a} outF={SEG[2].b}
        title={t('A shout is not the law', 'గట్టిగా అరిస్తే అది law కాదు')} />
      <Headline kicker={t('But don’t ignore it', 'కానీ ignore చేయొద్దు')} color={C.amber} inF={SEG[3].a} outF={SEG[3].b}
        title={t(<>Civil ≠<br />“nothing happens”</>, <>Civil ≠<br />“ఏమీ జరగదు”</>)} />
      <Headline kicker={t('What to do', 'ఏం చేయాలి')} color={C.emerald} inF={SEG[4].a} outF={CTA_AT - 6}
        title={t(<>Got a real notice?<br />Don’t ignore it</>, <>నిజమైన notice వస్తే?</>)} te={TE ? 'నిజమైన notice ని ignore చేయొద్దు' : undefined} />

      <BeatHook />
      <BeatCivil />
      <BeatCaller />
      <BeatDontIgnore />
      <BeatNotice />
      <Cta />
      {TE ? <LineCaptions /> : <WordCaptions />}

      <div style={{position: 'absolute', left: SAFE_X, width: STAGE_W, top: 1452, textAlign: 'center', fontFamily: FONT, fontSize: 22, color: 'rgba(211,220,232,0.7)'}}>
        {t('Awareness only — not legal advice. Facts of each case differ.', 'Awareness కోసం మాత్రమే — legal advice కాదు.')}
      </div>

      <Audio src={staticFile(`audio/reel/${TE ? 'te' : 'enh'}.wav`)} />
      <Audio src={staticFile('audio/music/tension.mp3')} volume={musicVol} />
      <Sfx at={4} name="haptic_buzz" volume={0.18} />
      {SEG.slice(1).map((s, i) => <Sfx key={i} at={s.a} name="node_pop" volume={0.16} />)}
      <Sfx at={SEG[1].a + Math.round((SEG[1].b - SEG[1].a) * 0.55)} name="stamp_heavy" volume={0.22} />
      <Sfx at={SEG[2].a + Math.round((SEG[2].b - SEG[2].a) * 0.55)} name="stamp_heavy" volume={0.18} />
      <Sfx at={CTA_AT} name="air_whoosh" volume={0.2} />
    </AbsoluteFill>
  );
};
