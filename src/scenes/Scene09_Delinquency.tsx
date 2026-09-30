import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {C, MONO, alpha} from '../theme';
import {CLAMP, vis} from '../lib/anim';
import {cueFrame, FPS, LEAD, sceneFrames} from '../lib/timing';
import {SceneShell} from '../components/SceneShell';
import {VaultDoor3D} from '../three/VaultDoor3D';
import {Banner, Cross, Glass, Label, Layer, Reveal, Sfx, Tag} from '../components/primitives';

const I = 8;

const GATES = [
  {day: 0, label: 'SMA-0', sub: 'Days 1–30', color: C.gold},
  {day: 30, label: 'SMA-1 / SMA-2', sub: 'Days 31–90', color: C.orange},
  {day: 90, label: 'NPA', sub: 'Day 91', color: C.crimson},
  {day: 180, label: 'WRITE-OFF', sub: 'Day ~180+', color: C.emerald},
];

const X0 = 180;
const X1 = 1740;
const DAY_STOPS = [0, 30, 90, 180, 360];
const POS_STOPS = [0, 0.22, 0.47, 0.74, 1];
const dayX = (d: number) => X0 + interpolate(d, DAY_STOPS, POS_STOPS, CLAMP) * (X1 - X0);

export const Scene09: React.FC = () => {
  const frame = useCurrentFrame();
  const D = sceneFrames(I);
  const c0 = LEAD * FPS;
  const cSma0 = cueFrame(I, 'In the first thirty');
  const cSma1 = cueFrame(I, 'Between days thirty');
  const cOffer = cueFrame(I, 'Banks may also offer');
  const cThink = cueFrame(I, 'Think carefully');
  const cNpa = cueFrame(I, 'At ninety days');
  const cProv = cueFrame(I, 'must set aside');
  const cWo = cueFrame(I, 'Typically after about');
  const cProfit = cueFrame(I, 'any recovery effectively');
  const cWindow = cueFrame(I, 'This is often when');

  const day = interpolate(frame, [c0, cSma0, cSma1, cNpa, cWo, cWo + 60], [0, 5, 35, 91, 180, 200], CLAMP);
  const gateAt = [cSma0, cSma1, cNpa, cWo];

  return (
    <SceneShell index={I} duration={D} music="analytic" tint={C.emerald}>
      {/* highway */}
      <svg width={1920} height={260} style={{position: 'absolute', left: 0, top: 0}}>
        <rect x={X0 - 30} y={120} width={X1 - X0 + 60} height={60} rx={30} fill="#111827" stroke="#334155" strokeWidth={3} />
        <line x1={X0} y1={150} x2={X1} y2={150} stroke="#475569" strokeWidth={4} strokeDasharray="30 24" strokeDashoffset={-frame * 4} />
        <rect x={X0 - 30} y={120} width={dayX(day) - X0 + 30} height={60} rx={30} fill={alpha(C.cyan, 0.18)} />
        {GATES.map((g, i) => {
          const x = dayX(g.day);
          const lit = frame >= gateAt[i];
          return (
            <g key={g.label} opacity={lit ? 1 : 0.35}>
              <rect x={x - 6} y={60} width={12} height={130} fill={g.color} />
              <rect x={x - 90} y={20} width={180} height={44} rx={10} fill={alpha(g.color, lit ? 0.3 : 0.1)} stroke={g.color} strokeWidth={2} />
              <text x={x} y={50} textAnchor="middle" fill="#fff" fontFamily="Inter" fontWeight={900} fontSize={22}>
                {g.label}
              </text>
              <text x={x} y={220} textAnchor="middle" fill={C.muted} fontFamily="JetBrains Mono" fontSize={18}>
                {g.sub}
              </text>
            </g>
          );
        })}
        <g transform={`translate(${dayX(day)} 150)`}>
          <circle r={24} fill={C.cyan} style={{filter: `drop-shadow(0 0 14px ${C.cyan})`}} />
          <text y={7} textAnchor="middle" fill={C.bg} fontFamily="JetBrains Mono" fontWeight={800} fontSize={16}>
            {Math.round(day)}
          </text>
        </g>
      </svg>

      {/* phase panels */}
      <Layer opacity={vis(frame, c0, cSma0 + 4)} style={{top: 270}}>
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <Reveal at={c0 + 10} from="bottom">
            <Glass style={{width: 1200, textAlign: 'center'}}>
              <div style={{fontSize: 46, fontWeight: 900}}>Settlement follows bank accounting</div>
              <div style={{fontSize: 28, color: C.muted, marginTop: 10}}>Know the lifecycle → know when patience pays</div>
            </Glass>
          </Reveal>
        </div>
      </Layer>
      <Layer opacity={vis(frame, cSma0, cSma1 + 4)} style={{top: 270}}>
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <Reveal at={cSma0} from="bottom">
            <Glass accent={C.gold} style={{width: 1200}}>
              <Label color={C.gold}>Days 1–30 · Special Mention Account 0</Label>
              <div style={{fontSize: 40, fontWeight: 800, marginTop: 10}}>Bank expects normal repayment</div>
              <div style={{display: 'flex', alignItems: 'center', gap: 20, marginTop: 20}}>
                <Tag color={C.gold}>Customer care</Tag>
                <span style={{fontSize: 30, color: C.muted}}>Settlement authority:</span>
                <span style={{fontFamily: MONO, fontSize: 44, fontWeight: 800, color: C.crimson}}>~0%</span>
              </div>
            </Glass>
          </Reveal>
        </div>
      </Layer>
      <Layer opacity={vis(frame, cSma1, cNpa + 4)} style={{top: 270}}>
        <div style={{display: 'flex', justifyContent: 'center', gap: 40}}>
          <Reveal at={cSma1} from="left">
            <Glass accent={C.orange} style={{width: 700}}>
              <Label color={C.orange}>Days 31–90 · SMA-1 / SMA-2</Label>
              <div style={{fontSize: 38, fontWeight: 800, marginTop: 10}}>Third-party agencies · calls peak</div>
              <div style={{display: 'flex', alignItems: 'flex-end', gap: 8, height: 140, marginTop: 20}}>
                {new Array(14).fill(0).map((_, i) => (
                  <div key={i} style={{flex: 1, height: `${20 + Math.pow(i / 13, 1.6) * 80 * vis(frame, cSma1 + i * 3)}%`, background: C.orange, borderRadius: 4, opacity: 0.8}} />
                ))}
              </div>
            </Glass>
          </Reveal>
          <Reveal at={cOffer} from="right">
            <Glass accent={C.crimson} style={{width: 620}}>
              <Label color={C.crimson}>Offer · convert to loan EMI</Label>
              <div style={{fontSize: 34, fontWeight: 800, marginTop: 10, lineHeight: 1.3}}>“Convert ₹1.39L overdue into 36-month EMI at high interest”</div>
              <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 20}}>
                <Cross at={cThink + 10} size={60} />
                <span style={{fontSize: 26, color: C.muted}}>New contract · fresh default liabilities</span>
              </div>
            </Glass>
          </Reveal>
        </div>
        <Sfx at={cOffer} name="card_slide" volume={0.35} />
        <Sfx at={cThink + 10} name="buzzer" volume={0.25} />
      </Layer>
      <Layer opacity={vis(frame, cNpa, cWo + 4)} style={{top: 270}}>
        <div style={{display: 'flex', justifyContent: 'center', gap: 40, alignItems: 'center'}}>
          <Reveal at={cNpa} from="left">
            <Glass accent={C.crimson} style={{width: 560}}>
              <Label color={C.crimson}>Day 91 · RBI prudential norms</Label>
              <div style={{fontSize: 56, fontWeight: 900, marginTop: 8}}>Non-Performing Asset</div>
              <div style={{fontSize: 26, color: C.muted, marginTop: 8}}>Unpaid interest can no longer be booked as income.</div>
            </Glass>
          </Reveal>
          <Reveal at={cProv - 10} from="right">
            <Glass style={{width: 700}}>
              <Label>Bank balance sheet</Label>
              <div style={{display: 'flex', alignItems: 'center', gap: 30, marginTop: 20}}>
                <div style={{flex: 1, textAlign: 'center'}}>
                  <div style={{height: 180 - 70 * vis(frame, cProv + 10, Infinity, 30), background: C.green, borderRadius: 8, marginTop: 70 * vis(frame, cProv + 10, Infinity, 30)}} />
                  <div style={{fontSize: 22, marginTop: 8}}>Operating profit</div>
                </div>
                <div style={{fontSize: 60, color: C.crimson, fontWeight: 900, opacity: vis(frame, cProv)}}>➜</div>
                <div style={{flex: 1, textAlign: 'center'}}>
                  <div style={{height: 180, display: 'flex', alignItems: 'flex-end'}}>
                    <div style={{width: '100%', height: 70 * vis(frame, cProv + 10, Infinity, 30), background: C.gold, borderRadius: 8}} />
                  </div>
                  <div style={{fontSize: 22, marginTop: 8}}>Provisions</div>
                </div>
              </div>
            </Glass>
          </Reveal>
        </div>
        <Sfx at={cNpa} name="gear_shift" volume={0.5} />
      </Layer>
      <Layer opacity={vis(frame, cWo, D)}>
        <VaultDoor3D start={cWo} open={cWindow} />
      </Layer>
      <Layer opacity={vis(frame, cWo, D)} style={{top: 260}}>
        <div style={{position: 'absolute', left: 120, top: 60, width: 480}}>
          <Reveal at={cWo} from="left">
            <Glass accent={C.emerald}>
              <Label color={C.emerald}>Day ~180+ · technical write-off</Label>
              <div style={{fontSize: 32, fontWeight: 800, marginTop: 10}}>Moved off the primary balance sheet</div>
            </Glass>
          </Reveal>
        </div>
        <div style={{position: 'absolute', right: 120, top: 60, width: 480}}>
          <Reveal at={cProfit} from="right">
            <Glass accent={C.gold}>
              <Label color={C.gold}>Loss already provisioned</Label>
              <div style={{fontSize: 32, fontWeight: 800, marginTop: 10}}>Any recovery now adds to profit</div>
            </Glass>
          </Reveal>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 440}}>
          <Banner at={cWindow + 30} color={C.gold} size={38}>
            Deeper-haircut settlements often become possible
          </Banner>
        </div>
        <Sfx at={cWo} name="air_whoosh" volume={0.35} />
        <Sfx at={cWindow} name="vault_open" volume={0.55} />
      </Layer>
    </SceneShell>
  );
};
