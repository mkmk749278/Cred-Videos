import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, MONO, alpha} from '../theme';
import {CLAMP, inr, spr, vis} from '../lib/anim';
import {cueFrame, FPS, LEAD, sceneFrames} from '../lib/timing';
import {SceneShell} from '../components/SceneShell';
import {Banner, Counter, Glass, Label, Layer, Reveal, Sfx, shake, Stamp, Tag} from '../components/primitives';
import {CreditCard} from '../components/icons';

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

const Orbit: React.FC<{start: number; cut: number}> = ({start, cut}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rot = frame * 0.35;
  const cx = 960;
  const cy = 360;
  const broken = frame >= cut;
  return (
    <>
      <svg width={1920} height={770} style={{position: 'absolute', inset: 0}}>
        {PORTFOLIO.map((_, i) => {
          const a = ((i / 8) * 360 + rot) * (Math.PI / 180);
          const x = cx + Math.cos(a) * 560;
          const y = cy + Math.sin(a) * 230;
          const draw = interpolate(frame, [start + 20 + i * 5, start + 50 + i * 5], [0, 1], CLAMP);
          const k = broken ? Math.min(1, (frame - cut) / 20) : 0;
          const mx = cx + (x - cx) * 0.5;
          const my = cy + (y - cy) * 0.5;
          return (
            <g key={i} opacity={1 - k}>
              <line x1={cx} y1={cy} x2={cx + (mx - cx) * draw} y2={cy + (my - cy) * draw + k * 80} stroke={C.gold} strokeWidth={5} strokeDasharray="14 8" />
              <line x1={x} y1={y} x2={x + (mx - x) * draw} y2={y + (my - y) * draw + k * 120} stroke={C.gold} strokeWidth={5} strokeDasharray="14 8" />
            </g>
          );
        })}
        {broken && <line x1={0} y1={600} x2={1920 * Math.min(1, (frame - cut + 6) / 10)} y2={120} stroke={C.crimson} strokeWidth={6} style={{filter: `drop-shadow(0 0 16px ${C.crimson})`}} opacity={Math.max(0, 1 - (frame - cut) / 30)} />}
      </svg>
      <div style={{position: 'absolute', left: cx - 170, top: cy - 70, width: 340, textAlign: 'center', opacity: broken ? Math.max(0.15, 1 - (frame - cut) / 20) : 1}}>
        <Glass accent={C.gold} pad={20}>
          <Label color={C.gold}>Joint lawsuit?</Label>
          <div style={{fontSize: 36, fontWeight: 900}}>“COMBINED SUIT”</div>
        </Glass>
      </div>
      {PORTFOLIO.map((p, i) => {
        const a = ((i / 8) * 360 + rot) * (Math.PI / 180);
        const depth = (Math.sin(a) + 1) / 2;
        const pop = spr(frame, fps, start + i * 5);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: cx + Math.cos(a) * 560 - 110,
              top: cy + Math.sin(a) * 230 - 70,
              transform: `scale(${(0.72 + depth * 0.35) * pop}) rotateY(${Math.cos(a) * 25}deg)`,
              zIndex: Math.round(depth * 100),
              opacity: 0.55 + depth * 0.45,
            }}
          >
            <CreditCard bank={p.bank} product={p.product} color1={p.c1} color2={p.c2} width={220} />
          </div>
        );
      })}
    </>
  );
};

const Ledger: React.FC<{start: number}> = ({start}) => {
  const frame = useCurrentFrame();
  const scanY = interpolate(frame, [start + 40, start + 220], [0, 1], CLAMP);
  return (
    <div style={{position: 'absolute', left: 260, top: 20, width: 1400}}>
      <Reveal at={start} from="top" distance={60}>
        <Glass pad={0} style={{overflow: 'hidden', position: 'relative'}}>
          <div style={{display: 'grid', gridTemplateColumns: '80px 1fr 1fr 300px 220px', padding: '18px 30px', fontFamily: MONO, fontSize: 18, color: C.muted, letterSpacing: 2, borderBottom: `1px solid ${C.border}`}}>
            <span>#</span>
            <span>LENDER</span>
            <span>CARD</span>
            <span>TIER</span>
            <span style={{textAlign: 'right'}}>BALANCE</span>
          </div>
          {PORTFOLIO.map((p, i) => {
            const rowAt = start + 40 + (i / 8) * 180;
            const lit = frame >= rowAt;
            const t = TIERS[p.tier];
            return (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr 1fr 300px 220px',
                  padding: '14px 30px',
                  alignItems: 'center',
                  fontSize: 27,
                  fontWeight: 700,
                  borderLeft: `6px solid ${lit ? t.color : 'transparent'}`,
                  background: lit ? alpha(t.color, 0.08 + (p.tier === 1 ? 0.06 * Math.abs(Math.sin(frame / 10)) : 0)) : 'transparent',
                  borderBottom: `1px solid rgba(148,163,184,0.08)`,
                }}
              >
                <span style={{fontFamily: MONO, color: C.muted}}>{String(i + 1).padStart(2, '0')}</span>
                <span>{p.bank}</span>
                <span style={{color: C.muted, fontWeight: 500}}>{p.product}</span>
                <span style={{color: t.color, fontSize: 20, fontFamily: MONO}}>{lit ? t.name : ''}</span>
                <span style={{textAlign: 'right', fontFamily: MONO, color: lit ? C.text : C.dim}}>
                  ₹<Counter from={0} to={p.amt} start={rowAt} end={rowAt + 20} format={inr} />
                </span>
              </div>
            );
          })}
          <div style={{position: 'absolute', left: 0, right: 0, top: 58 + scanY * 520, height: 4, background: C.cyan, boxShadow: `0 0 20px 6px ${alpha(C.cyan, 0.5)}`, opacity: scanY > 0 && scanY < 1 ? 1 : 0}} />
        </Glass>
      </Reveal>
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
          <Pan x={rx} y={ry} label="Micro-card balance" amount="₹7,000" color={C.slate} h={60} />
        </div>
      </Reveal>
    </div>
  );
};

export const Scene03: React.FC = () => {
  const frame = useCurrentFrame();
  const D = sceneFrames(I);
  const c0 = LEAD * FPS;
  const cCut = cueFrame(I, 'SBI Card cannot join');
  const cLedger = cueFrame(I, 'Look at how recovery');
  const cScale = cueFrame(I, 'Filing a civil suit');
  const cHigh = cueFrame(I, 'Even in High Tiers');
  const cLok = cueFrame(I, 'Compromise settlements via');
  const sh = shake(frame, cScale + 24, 12);
  return (
    <SceneShell index={I} duration={D} music="analytic" tint={C.gold} stageStyle={{translate: `${sh.x}px ${sh.y}px`}}>
      <Layer opacity={vis(frame, c0 - 10, cLedger + 6)}>
        <Orbit start={c0} cut={cCut} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 700}}>
          <Banner at={cCut + 16} color={C.crimson} size={44}>Zero aggregation · 8 independent contracts</Banner>
        </div>
        <Sfx at={cCut} name="plasma_sweep" volume={0.3} />
        <Sfx at={cCut + 4} name="chain_break" volume={0.5} />
      </Layer>
      <Layer opacity={vis(frame, cLedger, cScale + 6)}>
        <Ledger start={cLedger} />
        <Sfx at={cLedger + 40} name="counter_spin" volume={0.3} />
        <Sfx at={cLedger + 100} name="counter_spin" volume={0.25} />
      </Layer>
      <Layer opacity={vis(frame, cScale, cHigh + 6)}>
        <BalanceScale start={cScale} tilt={cScale + 24} />
        <div style={{position: 'absolute', left: 1330, top: 220}}>
          <Stamp at={cScale + 60} text={'ECONOMICALLY\nUNVIABLE TO SUE'} sub="automated calls only" size={44} />
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
        <Sfx at={cHigh} name="air_whoosh" volume={0.35} />
        <Sfx at={cLok} name="air_whoosh" volume={0.35} />
      </Layer>
    </SceneShell>
  );
};

