import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {interpolate} from '../lib/safeInterpolate';
import {C, MONO, alpha} from '../theme';
import {CLAMP, inr, spr, vis} from '../lib/anim';
import {contentStart, cueFrame, sceneFrames, sentenceEnd} from '../lib/timing';
import {SceneShell} from '../components/SceneShell';
import {Banner, Counter, Glass, KLine, Label, Layer, NextChip, Reveal, Sfx, shake, SpokenTile, Stamp, Tag} from '../components/primitives';
import {CardOrbit3D} from '../three/CardOrbit3D';
import {CardLedger3D} from '../three/CardLedger3D';

const I = 2;

export const PORTFOLIO = [
  {bank: 'SBI Card', product: 'BPCL Octane', amt: 159500, tier: 1, c1: '#1e3a8a', c2: '#0ea5e9'},
  {bank: 'ICICI', product: 'Amazon Pay', amt: 105300, tier: 2, c1: '#7c2d12', c2: '#f97316'},
  {bank: 'Axis', product: 'Rewards', amt: 85000, tier: 3, c1: '#831843', c2: '#db2777'},
  {bank: 'Kotak', product: 'League', amt: 55000, tier: 3, c1: '#7f1d1d', c2: '#ef4444'},
  {bank: 'YES Bank', product: 'Prosperity', amt: 50000, tier: 3, c1: '#1e3a8a', c2: '#3b82f6'},
  {bank: 'RBL', product: 'Duet', amt: 51000, tier: 3, c1: '#312e81', c2: '#8b5cf6'},
  {bank: 'IDFC FIRST', product: 'Power Plus', amt: 19400, tier: 4, c1: '#7f1d1d', c2: '#b91c1c'},
  {bank: 'RBL', product: 'Maxima', amt: 7000, tier: 4, c1: '#1f2937', c2: '#6b7280'},
];

const TIERS: Record<number, {name: string; color: string}> = {
  1: {name: 'Tier 1 · High > ₹1.5L', color: C.crimson},
  2: {name: 'Tier 2 · High > ₹1.0L', color: C.orange},
  3: {name: 'Tier 3 · Medium ₹50k–1L', color: C.gold},
  4: {name: 'Tier 4 · Micro / Low', color: C.slate},
};

/** 2D label floating over the 3D hub */
const HubLabel: React.FC<{start: number; cut: number}> = ({start, cut}) => {
  const frame = useCurrentFrame();
  const o = vis(frame, start + 30) * (frame >= cut ? Math.max(0, 1 - (frame - cut) / 20) : 1);
  return (
    <div style={{position: 'absolute', left: 960 - 170, top: 70, width: 340, textAlign: 'center', opacity: o}}>
      <Glass accent={C.gold} pad={16}>
        <Label color={C.gold}>Joint lawsuit?</Label>
        <div style={{fontSize: 34, fontWeight: 900}}>“COMBINED SUIT”</div>
      </Glass>
    </div>
  );
};

const TOTAL = PORTFOLIO.reduce((acc, p) => acc + p.amt, 0);

const LedgerHeader: React.FC<{start: number}> = ({start}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 6, textAlign: 'center', opacity: vis(frame, start)}}>
      <Label color={C.gold}>Example portfolio · 8 cards · 8 separate contracts</Label>
      <div style={{fontSize: 30, fontWeight: 800, marginTop: 4}}>
        Total ₹<Counter from={0} to={TOTAL} start={start + 40} end={start + 40 + 8 * 22} format={inr} />
      </div>
    </div>
  );
};

const BalanceScale: React.FC<{start: number; tilt: number}> = ({start, tilt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = spr(frame, fps, tilt, {mass: 1.2, stiffness: 120, damping: 11});
  const ang = -14 * t;
  const cx = 700;
  const beam = 380;
  const lx = cx - Math.cos((ang * Math.PI) / 180) * beam;
  const ly = 200 - Math.sin((-ang * Math.PI) / 180) * beam;
  const rx = cx + Math.cos((ang * Math.PI) / 180) * beam;
  const ry = 200 + Math.sin((-ang * Math.PI) / 180) * beam;
  const Pan: React.FC<{x: number; y: number; label: string; amount: string; color: string; h: number}> = ({x, y, label, amount, color, h}) => (
    <div style={{position: 'absolute', left: x - 170, top: y}}>
      <svg width={340} height={120} style={{position: 'absolute', top: 0}}>
        <line x1={170} y1={0} x2={40} y2={110} stroke={C.muted} strokeWidth={3} />
        <line x1={170} y1={0} x2={300} y2={110} stroke={C.muted} strokeWidth={3} />
      </svg>
      <div style={{position: 'absolute', top: 110 - h, left: 70, width: 200, height: h, borderRadius: 12, background: `linear-gradient(180deg, ${color}, ${alpha(color, 0.5)})`, display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 34, boxShadow: `0 0 30px ${alpha(color, 0.5)}`}}>{amount}</div>
      <div style={{position: 'absolute', top: 110, left: 20, width: 300, height: 14, borderRadius: 7, background: C.muted}} />
      <div style={{position: 'absolute', top: 136, left: -30, width: 400, textAlign: 'center', fontSize: 24, color: C.muted, fontWeight: 600}}>{label}</div>
    </div>
  );
  return (
    <div style={{position: 'absolute', left: 60, top: 70, width: 1400, height: 700}}>
      <Reveal at={start} from="bottom">
        <div style={{position: 'relative', width: 1400, height: 700}}>
          <div style={{position: 'absolute', left: cx - 12, top: 200, width: 24, height: 400, background: 'linear-gradient(90deg,#64748b,#cbd5e1,#64748b)', borderRadius: 8}} />
          <div style={{position: 'absolute', left: cx - 130, top: 590, width: 260, height: 26, borderRadius: 10, background: '#94a3b8'}} />
          <svg width={1400} height={700} style={{position: 'absolute', inset: 0}}>
            <line x1={lx} y1={ly} x2={rx} y2={ry} stroke="#e2e8f0" strokeWidth={14} strokeLinecap="round" />
            <circle cx={cx} cy={200} r={20} fill={C.gold} />
          </svg>
          <Pan x={lx} y={ly} label="Bank's cost to sue (advocate + court fees)" amount="₹25,000" color={C.crimson} h={130} />
          <Pan x={rx} y={ry} label="Small card balance" amount="₹15,000" color={C.slate} h={70} />
        </div>
      </Reveal>
    </div>
  );
};

export const Scene03: React.FC = () => {
  const frame = useCurrentFrame();
  const D = sceneFrames(I);
  const c0 = contentStart(I);
  const cCut = cueFrame(I, 'SBI Card cannot join');
  const cLedger = cueFrame(I, 'Look at how recovery');
  const cScale = cueFrame(I, 'Filing a civil suit');
  const cHigh = cueFrame(I, 'Even in High Tiers');
  const cLok = cueFrame(I, 'why compromise settlements');
  const cFear = cueFrame(I, "And here's the fear");
  const cRelax = cueFrame(I, 'Relax');
  const cSeparate = cueFrame(I, 'Every card is a separate');
  const cLawyer = cueFrame(I, 'hire its own lawyer');
  const cFees = cueFrame(I, 'its own court fees');
  const cOwnCase = cueFrame(I, 'fight its own case');
  const cSmall = cueFrame(I, 'For small amounts');
  const cWhy = cueFrame(I, 'Why');
  const cWould = cueFrame(I, 'Would you spend');
  const cNoRight = cueFrame(I, 'No, right');
  const cSlow = cueFrame(I, 'Courts are slow');
  const cYears = cueFrame(I, 'Cases take years');
  const cExit = cueFrame(I, 'easiest way out');
  const sh = shake(frame, cScale + 24, 12);
  return (
    <SceneShell index={I} duration={D} music="analytic" tint={C.gold} stageStyle={{translate: `${sh.x}px ${sh.y}px`}}>
      <Layer opacity={vis(frame, c0 - 10, cLedger + 6)}>
        <CardOrbit3D cards={PORTFOLIO} start={c0} cut={cCut} />
        <HubLabel start={cFear} cut={cCut} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', opacity: vis(frame, cRelax, cSeparate)}}>
          <KLine at={cRelax} size={64} color={C.emerald}>Relax. It doesn't work like that.</KLine>
        </div>
        <div style={{position: 'absolute', left: 50, top: 120, display: 'flex', flexDirection: 'column', gap: 14}}>
          <SpokenTile at={cLawyer} doneAt={cFees} icon="§" label="Own lawyer" color={C.gold} width={220} />
          <SpokenTile at={cFees} doneAt={cOwnCase} icon="₹" label="Own court fees" color={C.gold} width={220} />
          <SpokenTile at={cOwnCase} doneAt={sentenceEnd(I, 'fight its own case')} icon="1" label="Own case" color={C.gold} width={220} />
        </div>
        {[cLawyer, cFees, cOwnCase].map((a, i) => (
          <Sfx key={i} at={a} name="node_pop" volume={0.35} />
        ))}
        <div style={{position: 'absolute', left: 0, right: 0, top: 700}}>
          <Banner at={cSeparate} color={C.crimson} size={44}>8 cards · 8 separate contracts</Banner>
        </div>
        <Sfx at={cCut} name="plasma_sweep" volume={0.3} />
        <Sfx at={cCut + 4} name="chain_break" volume={0.5} />
      </Layer>
      <Layer opacity={vis(frame, cLedger, cScale + 6)}>
        <CardLedger3D
          start={cLedger}
          cards={PORTFOLIO.map((p) => ({bank: p.bank, product: p.product, c1: p.c1, c2: p.c2, amount: `₹${inr(p.amt)}`, tier: `TIER ${p.tier}`, tierColor: TIERS[p.tier].color}))}
        />
        <LedgerHeader start={cLedger} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 705, textAlign: 'center'}}>
          <KLine at={cSmall} size={40} out={cWhy - 4}>Under ₹50,000 → mostly computer calls</KLine>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 680, textAlign: 'center'}}>
          <KLine at={cWhy} size={72} color={C.gold}>Why?</KLine>
        </div>
        {PORTFOLIO.map((_, i) => (
          <Sfx key={i} at={cLedger + 40 + i * 22} name="card_slide" volume={0.35} />
        ))}
        <Sfx at={cLedger + 40} name="counter_spin" volume={0.18} />
      </Layer>
      <Layer opacity={vis(frame, cScale, cHigh + 6)}>
        <BalanceScale start={cScale} tilt={cScale + 24} />
        <div style={{position: 'absolute', left: 1330, top: 220}}>
          <Stamp at={cScale + 60} text={'ECONOMICALLY\nUNVIABLE TO SUE'} sub="automated calls only" size={44} />
        </div>
        <div style={{position: 'absolute', left: 1300, top: 470, width: 600, textAlign: 'center'}}>
          <KLine at={cWould} size={40}>Spend ₹25,000 to get back ₹15,000?</KLine>
          <KLine at={cNoRight} size={64} color={C.emerald} style={{marginTop: 12}}>No, right?</KLine>
        </div>
        <Sfx at={cScale + 22} name="scale_drop" volume={0.55} />
        <Sfx at={cScale + 60} name="stamp_heavy" volume={0.5} />
      </Layer>
      <Layer opacity={vis(frame, cHigh, D)}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 80, display: 'flex', justifyContent: 'center', gap: 60}}>
          <Reveal at={cHigh} from="left">
            <Glass accent={C.crimson} style={{width: 640}}>
              <Label color={C.crimson}>High tier &gt; ₹1 lakh</Label>
              <div style={{fontSize: 40, fontWeight: 800, marginTop: 10}}>Civil suits: rare</div>
              <div style={{fontSize: 26, color: C.muted, marginTop: 10, lineHeight: 1.35}}>Multi-year court backlogs make litigation slow and costly for the lender.</div>
              <div style={{display: 'flex', gap: 10, marginTop: 20}}>
                {['3–5 yr backlog', 'Costly', 'Uncertain recovery'].map((t) => (
                  <Tag key={t} color={C.crimson} style={{fontSize: 16}}>{t}</Tag>
                ))}
              </div>
            </Glass>
          </Reveal>
          <Reveal at={cLok} from="right">
            <Glass accent={C.emerald} style={{width: 640}}>
              <Label color={C.emerald}>Most efficient route</Label>
              <div style={{fontSize: 40, fontWeight: 800, marginTop: 10}}>Compromise via Lok Adalat</div>
              <div style={{fontSize: 26, color: C.muted, marginTop: 10, lineHeight: 1.35}}>Settlement is often the bank's preferred exit.</div>
            </Glass>
          </Reveal>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 420, display: 'flex', justifyContent: 'center', gap: 24}}>
          <SpokenTile at={cSlow} icon="⧗" label="Courts are slow" color={C.crimson} width={260} />
          <SpokenTile at={cYears} icon="3–5" label="Cases take years" color={C.crimson} width={260} />
          <SpokenTile at={cExit} doneAt={sentenceEnd(I, 'easiest way out')} icon="✓" label="Settlement = bank's easy exit" color={C.emerald} width={300} />
        </div>
        <div style={{position: 'absolute', right: 70, bottom: 14}}>
          <NextChip at={cExit + 30} text="The big number on your statement" />
        </div>
        {[cSlow, cYears, cExit].map((a, i) => (
          <Sfx key={i} at={a} name="node_pop" volume={0.35} />
        ))}
        <Sfx at={cHigh} name="air_whoosh" volume={0.35} />
        <Sfx at={cLok} name="air_whoosh" volume={0.35} />
      </Layer>
    </SceneShell>
  );
};

