import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {C, MONO, alpha} from '../theme';
import {CLAMP, vis} from '../lib/anim';
import {cueFrame, FPS, LEAD, sceneFrames} from '../lib/timing';
import {SceneShell} from '../components/SceneShell';
import {Banner, Check, Glass, Label, Layer, Reveal, Sfx} from '../components/primitives';
import {CreditCard} from '../components/icons';

const I = 11;

const Gauge: React.FC<{score: number; size?: number}> = ({score, size = 560}) => {
  const frame = useCurrentFrame();
  const t = (score - 300) / 600;
  const ang = Math.PI * (1 - t);
  const r = 220;
  const cx = 280;
  const cy = 280;
  const color = score < 650 ? C.crimson : score < 730 ? C.gold : C.emerald;
  const arc = (a0: number, a1: number) => {
    const p = (a: number) => `${cx + r * Math.cos(Math.PI * (1 - a))} ${cy - r * Math.sin(Math.PI * (1 - a))}`;
    return `M ${p(a0)} A ${r} ${r} 0 0 1 ${p(a1)}`;
  };
  return (
    <svg width={size} height={size * 0.62} viewBox="0 0 560 340">
      <path d={arc(0, 1)} stroke="#1e293b" strokeWidth={40} fill="none" />
      <path d={arc(0, 0.5)} stroke={alpha(C.crimson, 0.5)} strokeWidth={40} fill="none" />
      <path d={arc(0.5, 0.72)} stroke={alpha(C.gold, 0.5)} strokeWidth={40} fill="none" />
      <path d={arc(0.72, 1)} stroke={alpha(C.emerald, 0.5)} strokeWidth={40} fill="none" />
      <path d={arc(0, Math.max(0.001, t))} stroke={color} strokeWidth={14} fill="none" style={{filter: `drop-shadow(0 0 ${12 + 4 * Math.sin(frame / 6)}px ${color})`}} />
      <line x1={cx} y1={cy} x2={cx + (r - 30) * Math.cos(ang)} y2={cy - (r - 30) * Math.sin(ang)} stroke="#fff" strokeWidth={8} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={18} fill="#fff" />
      <text x={cx} y={cy - 70} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={84} fill={color}>
        {Math.round(score)}
      </text>
      <text x={40} y={325} fontFamily="JetBrains Mono" fontSize={20} fill={C.muted}>300</text>
      <text x={480} y={325} fontFamily="JetBrains Mono" fontSize={20} fill={C.muted}>900</text>
    </svg>
  );
};

export const Scene12: React.FC = () => {
  const frame = useCurrentFrame();
  const D = sceneFrames(I);
  const c0 = LEAD * FPS;
  const cMyth = cueFrame(I, 'But the belief');
  const cWeight = cueFrame(I, 'Credit scoring models');
  const cSteps = cueFrame(I, 'Once your settlements');
  const cFd = cueFrame(I, 'Open a small fixed');
  const cCard = cueFrame(I, 'obtain an FD-backed');
  const cUtil = cueFrame(I, 'Keep your monthly');
  const cMonths = cueFrame(I, 'Month after month');
  const cWithin = cueFrame(I, 'Within eighteen');
  const cClose = cueFrame(I, 'Debt is a difficult');

  const score = interpolate(frame, [c0 + 10, c0 + 50, cMonths, cWithin + 90], [780, 580, 580, 774], CLAMP);
  const slash = interpolate(frame, [cMyth + 40, cMyth + 50], [0, 1], CLAMP);
  const blocks = Math.floor(interpolate(frame, [cMonths, cWithin + 80], [0, 24], CLAMP));

  return (
    <SceneShell index={I} duration={D} music="hope" tint={C.emerald}>
      <div style={{position: 'absolute', left: 90, top: 30, opacity: vis(frame, c0 - 10, cClose)}}>
        <Glass pad={24} accent={score > 730 ? C.emerald : C.crimson}>
          <Label>CIBIL score</Label>
          <Gauge score={score} size={620} />
          <div style={{textAlign: 'center', fontFamily: MONO, fontSize: 22, color: C.muted}}>STATUS: {frame < cMonths ? 'SETTLED · POST WRITE-OFF' : 'REBUILDING'}</div>
        </Glass>
      </div>

      <Layer opacity={vis(frame, cMyth - 10, cSteps + 4)}>
        <div style={{position: 'absolute', left: 820, top: 60, width: 960}}>
          <Reveal at={cMyth} from="right">
            <div style={{position: 'relative', fontSize: 44, fontWeight: 900, color: C.muted, padding: '20px 0'}}>
              “Your financial life is ruined for 7 years.”
              <div style={{position: 'absolute', left: 0, top: '50%', height: 8, width: `${slash * 100}%`, background: C.crimson, boxShadow: `0 0 20px ${C.crimson}`, transform: 'rotate(-3deg)'}} />
              <div style={{fontSize: 30, color: C.crimson, opacity: slash, marginTop: 10}}>MYTH</div>
            </div>
          </Reveal>
          <Reveal at={cWeight} from="right">
            <Glass accent={C.cyan} style={{marginTop: 20}}>
              <Label color={C.cyan}>What scoring models weigh most</Label>
              <div style={{display: 'flex', alignItems: 'flex-end', gap: 10, height: 190, marginTop: 20}}>
                {new Array(12).fill(0).map((_, i) => {
                  const recent = i >= 8;
                  return (
                    <div key={i} style={{flex: 1, textAlign: 'center'}}>
                      <div style={{height: (recent ? 150 : 30 + i * 4) * vis(frame, cWeight + i * 3), background: recent ? C.cyan : '#334155', borderRadius: 4}} />
                    </div>
                  );
                })}
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 18, color: C.muted, marginTop: 8}}>
                <span>older history</span>
                <span style={{color: C.cyan}}>last 24–36 months</span>
              </div>
            </Glass>
          </Reveal>
        </div>
        <Sfx at={c0 + 20} name="gauge_drop" volume={0.45} />
        <Sfx at={cMyth + 40} name="slice" volume={0.5} />
      </Layer>

      <Layer opacity={vis(frame, cSteps, cMonths + 4)}>
        <div style={{position: 'absolute', left: 820, top: 30, width: 960, display: 'flex', flexDirection: 'column', gap: 18}}>
          {[
            {at: cSteps, t: 'Settlements done · No Dues Certificates secured', v: '₹0.00 dues'},
            {at: cFd, t: 'Fixed deposit in a clean bank', v: '₹25k–50k FD'},
            {at: cCard, t: 'FD-backed secured credit card', v: 'no income proof usually'},
            {at: cUtil, t: 'Utilization under 15–20% · pay total bill on time', v: 'auto-debit: total due'},
          ].map((s, i) => (
            <Reveal key={i} at={s.at} from="right">
              <Glass accent={C.emerald} pad={20} style={{display: 'flex', alignItems: 'center', gap: 20}}>
                <div style={{fontFamily: MONO, fontSize: 30, fontWeight: 800, color: C.emerald}}>{i + 1}</div>
                <div style={{flex: 1}}>
                  <div style={{fontSize: 28, fontWeight: 800}}>{s.t}</div>
                  <div style={{fontSize: 20, color: C.muted, fontFamily: MONO}}>{s.v}</div>
                </div>
                <Check at={s.at + 30} size={46} />
              </Glass>
            </Reveal>
          ))}
        </div>
        <div style={{position: 'absolute', left: 260, top: 520, opacity: vis(frame, cCard)}}>
          <Reveal at={cCard} from="bottom">
            <CreditCard bank="SECURED" product="FD-backed card" color1="#064e3b" color2="#10b981" width={340} glow={C.emerald} />
          </Reveal>
        </div>
        {[cSteps, cFd, cCard, cUtil].map((a, i) => (
          <Sfx key={i} at={a + 52} name="tactile_click" volume={0.45} />
        ))}
        <Sfx at={cCard} name="card_insert" volume={0.5} />
      </Layer>

      <Layer opacity={vis(frame, cMonths, cClose + 4)}>
        <div style={{position: 'absolute', left: 820, top: 40, width: 960}}>
          <Label color={C.emerald}>Credit bureau · payment history</Label>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginTop: 16}}>
            {new Array(24).fill(0).map((_, i) => (
              <div
                key={i}
                style={{
                  height: 76,
                  borderRadius: 10,
                  background: i < blocks ? alpha(C.emerald, 0.25) : '#111827',
                  border: `2px solid ${i < blocks ? C.emerald : '#1f2937'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: MONO,
                  transform: i === blocks - 1 ? 'scale(1.08)' : undefined,
                }}
              >
                <div style={{fontSize: 26, fontWeight: 800, color: i < blocks ? C.emerald : '#334155'}}>000</div>
                <div style={{fontSize: 13, color: C.muted}}>M{i + 1}</div>
              </div>
            ))}
          </div>
          <div style={{marginTop: 20}}>
            <Banner at={cWithin + 90} color={C.emerald} size={40}>
              Toward 750+ in 18–24 months
            </Banner>
          </div>
        </div>
        <Sfx at={cMonths} name="counter_spin" volume={0.25} />
        <Sfx at={cWithin + 50} name="triumph_rise" volume={0.5} />
      </Layer>

      <Layer opacity={vis(frame, cClose, D)}>
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Reveal at={cClose} from="scale">
            <div style={{textAlign: 'center'}}>
              <div style={{fontSize: 80, fontWeight: 900, lineHeight: 1.1}}>
                A difficult chapter —<br />
                <span style={{color: C.emerald}}>not your whole story.</span>
              </div>
              <div style={{fontSize: 34, color: C.muted, marginTop: 30}}>Family first · Law over fear · Resolve with dignity</div>
            </div>
          </Reveal>
        </div>
        <Sfx at={cClose} name="air_whoosh" volume={0.35} />
      </Layer>
    </SceneShell>
  );
};
