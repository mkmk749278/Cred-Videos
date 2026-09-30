import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT, MONO, alpha} from '../theme';
import {CLAMP, inr, spr, vis} from '../lib/anim';
import {cueFrame, FPS, LEAD, sceneFrames} from '../lib/timing';
import {SceneShell} from '../components/SceneShell';
import {Banner, Glass, Label, Layer, Reveal, Sfx, shake} from '../components/primitives';
import {LockIcon} from '../components/icons';

const I = 4;

const Vault: React.FC<{x: number; at: number; title: string; sub: string; amount: number; color: string; locked?: boolean; cash?: boolean}> = ({x, at, title, sub, amount, color, locked, cash = true}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rise = spr(frame, fps, at);
  return (
    <div style={{position: 'absolute', left: x, top: 230 + (1 - rise) * 300, width: 460, opacity: rise}}>
      <div style={{textAlign: 'center', marginBottom: 14}}>
        <div style={{fontSize: 34, fontWeight: 900}}>{title}</div>
        <div style={{fontSize: 22, color: C.muted}}>{sub}</div>
      </div>
      <div
        style={{
          height: 360,
          borderRadius: 30,
          background: 'linear-gradient(145deg, #334155, #0f172a)',
          border: `4px solid ${alpha(color, 0.7)}`,
          boxShadow: `0 30px 60px rgba(0,0,0,0.6), 0 0 40px ${alpha(color, 0.25)}, inset 0 2px 0 rgba(255,255,255,0.1)`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{position: 'absolute', left: 40, top: 30, right: 40, height: 80, borderRadius: 12, background: '#020617', border: `2px solid ${alpha(color, 0.6)}`, display: 'grid', placeItems: 'center', fontFamily: MONO, fontSize: 50, fontWeight: 800, color: amount > 0 ? C.green : C.crimson, textShadow: `0 0 16px ${amount > 0 ? C.green : C.crimson}`}}>
          ₹{inr(amount)}.00
        </div>
        <div style={{position: 'absolute', left: 150, top: 140, width: 160, height: 160, borderRadius: '50%', border: `10px solid ${alpha(color, 0.6)}`, background: 'radial-gradient(circle, #475569, #1e293b)'}}>
          {[0, 60, 120].map((r) => (
            <div key={r} style={{position: 'absolute', left: 70, top: 10, width: 6, height: 120, background: '#94a3b8', transform: `rotate(${r + frame * 0.2}deg)`, transformOrigin: '3px 60px', borderRadius: 3}} />
          ))}
        </div>
        {cash && amount > 0 && (
          <div style={{position: 'absolute', left: 40, top: 250, display: 'flex', gap: 4}}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{width: 70, height: 36 - i * 4, borderRadius: 4, background: 'linear-gradient(135deg,#166534,#22c55e)', marginTop: i * 4}} />
            ))}
          </div>
        )}
        {locked && (
          <div style={{position: 'absolute', inset: 0, background: alpha(C.crimson, 0.18), display: 'grid', placeItems: 'center'}}>
            <LockIcon size={120} color={C.crimson} />
          </div>
        )}
      </div>
    </div>
  );
};

export const Scene05: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const D = sceneFrames(I);
  const c0 = LEAD * FPS;
  const c171 = cueFrame(I, 'Under Section 171');
  const cVaults = cueFrame(I, 'If you maintain');
  const cSweep = cueFrame(I, 'may sweep');
  const cMove = cueFrame(I, 'Your first counter-measure');
  const cKeep = cueFrame(I, 'Keep every bank');
  const cFamily = cueFrame(I, "Your family's groceries");

  // claw: descend -> grab -> lift
  const down = interpolate(frame, [cSweep - 20, cSweep + 10], [0, 1], CLAMP);
  const up = interpolate(frame, [cSweep + 24, cSweep + 54], [0, 1], CLAMP);
  const clawY = -260 + down * 480 - up * 520;
  const clamp = frame > cSweep + 10;
  const amountA = Math.round(interpolate(frame, [cSweep + 22, cSweep + 60], [45000, 0], CLAMP));
  const route = interpolate(frame, [cMove + 20, cMove + 70], [0, 1], CLAMP);
  const shield = spr(frame, fps, cMove + 70);
  const sh = shake(frame, cSweep + 10, 12);
  const pipeA = 'M 960 30 C 960 140, 560 80, 560 230';
  const pipeB = 'M 960 30 C 960 140, 1360 80, 1360 230';

  return (
    <SceneShell index={I} duration={D} music="analytic" tint={C.cyan} stageStyle={{translate: `${sh.x}px ${sh.y}px`}}>
      <Layer opacity={vis(frame, c0 - 10, cVaults - 4)}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 110, display: 'flex', justifyContent: 'center'}}>
          <Reveal at={c0} from="scale">
            <Glass accent={C.cyan} style={{width: 1100, textAlign: 'center'}} pad={40}>
              <Label color={C.cyan}>Step zero · before any call</Label>
              <div style={{fontSize: 64, fontWeight: 900, marginTop: 12}}>Secure household survival cash</div>
              <div style={{fontSize: 30, color: C.muted, marginTop: 18, opacity: vis(frame, c171)}}>
                Section 171, Indian Contract Act + account terms → <span style={{color: C.gold, fontWeight: 800}}>Banker's Right of Set-Off</span>
              </div>
            </Glass>
          </Reveal>
        </div>
      </Layer>
      <Layer opacity={vis(frame, cVaults - 4, D)}>
        <svg width={1920} height={770} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <path d={pipeA} stroke="#B45309" strokeWidth={22} fill="none" opacity={1 - route} strokeLinecap="round" />
          <path d={pipeA} stroke={C.gold} strokeWidth={8} fill="none" strokeDasharray="20 20" strokeDashoffset={-frame * 3} opacity={1 - route} />
          <path d={pipeB} stroke="#B45309" strokeWidth={22} fill="none" opacity={route} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - route} />
          <path d={pipeB} stroke={C.gold} strokeWidth={8} fill="none" strokeDasharray="20 20" strokeDashoffset={-frame * 3} opacity={route > 0.98 ? 1 : 0} />
        </svg>
        <div style={{position: 'absolute', left: 860, top: 0, width: 200, textAlign: 'center'}}>
          <div style={{display: 'inline-block', padding: '8px 18px', borderRadius: 12, background: alpha(C.gold, 0.2), border: `2px solid ${C.gold}`, fontFamily: MONO, fontWeight: 800, color: C.gold, fontSize: 22}}>SALARY ₹45,000</div>
        </div>
        <Vault x={330} at={cVaults} title="Bank A · Creditor" sub="Unpaid card + savings account" amount={amountA} color={C.crimson} locked={frame > cKeep + 10} />
        <Vault x={1130} at={cVaults + 12} title="Clean Anchor Bank" sub="e.g. Bank of Baroda · zero loans/cards" amount={route > 0.98 ? 45000 : 0} color={C.cyan} cash />
        {/* hex shield */}
        {shield > 0.01 && (
          <svg width={600} height={560} style={{position: 'absolute', left: 1060, top: 190, opacity: shield, transform: `scale(${0.8 + 0.2 * shield})`}}>
            <defs>
              <pattern id="hex" width="40" height="46" patternUnits="userSpaceOnUse">
                <path d="M20 0 L40 11.5 V34.5 L20 46 L0 34.5 V11.5 Z" fill="none" stroke={C.cyan} strokeWidth="1.5" opacity={0.6 + 0.3 * Math.sin(frame / 8)} />
              </pattern>
            </defs>
            <ellipse cx="300" cy="280" rx="290" ry="270" fill="url(#hex)" stroke={C.cyan} strokeWidth="4" style={{filter: `drop-shadow(0 0 20px ${C.cyan})`}} />
            <ellipse cx="300" cy="280" rx="290" ry="270" fill={alpha(C.cyan, 0.06)} />
          </svg>
        )}
        {/* claw */}
        {frame > cSweep - 22 && frame < cSweep + 60 && (
          <div style={{position: 'absolute', left: 470, top: clawY, width: 180}}>
            <div style={{margin: '0 auto', width: 14, height: 300, background: 'linear-gradient(90deg,#475569,#cbd5e1,#475569)'}} />
            <div style={{margin: '0 auto', width: 180, height: 50, borderRadius: 12, background: '#64748b', border: '3px solid #cbd5e1', display: 'grid', placeItems: 'center', fontFamily: MONO, fontSize: 13, fontWeight: 800, color: '#0f172a'}}>SEC 171 · SET-OFF</div>
            <svg width={180} height={90}>
              <path d={clamp ? 'M40 0 L60 60 L90 80' : 'M40 0 L20 60 L40 85'} stroke="#cbd5e1" strokeWidth={10} fill="none" strokeLinecap="round" />
              <path d={clamp ? 'M140 0 L120 60 L90 80' : 'M140 0 L160 60 L140 85'} stroke="#cbd5e1" strokeWidth={10} fill="none" strokeLinecap="round" />
            </svg>
            {up > 0 && <div style={{margin: '-50px auto 0', width: 90, height: 40, borderRadius: 4, background: 'linear-gradient(135deg,#166534,#22c55e)'}} />}
          </div>
        )}
        <div style={{position: 'absolute', left: 300, top: 150, opacity: vis(frame, cSweep + 40, cMove + 20)}}>
          <div style={{padding: '12px 22px', borderRadius: 12, background: alpha(C.crimson, 0.25 + 0.15 * Math.sin(frame / 3)), border: `2px solid ${C.crimson}`, fontWeight: 900, fontSize: 30, color: '#FECACA', fontFamily: FONT}}>
            ⚠ SALARY SWEPT TO ZERO · NO COURT ORDER
          </div>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 680}}>
          <Banner at={cKeep + 10} color={C.gold} size={38}>
            Creditor-bank accounts: keep at ₹0
          </Banner>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 735, opacity: vis(frame, cFamily)}}>
          <div style={{textAlign: 'center', fontSize: 26, color: C.muted}}>Groceries · healthcare · secured EMIs come before unsecured card debt</div>
        </div>
        <Sfx at={cVaults} name="block_slam" volume={0.35} />
        <Sfx at={cVaults + 12} name="block_slam" volume={0.35} />
        <Sfx at={cSweep - 5} name="piston_clamp" volume={0.55} />
        <Sfx at={cSweep + 40} name="warning_pulse" volume={0.35} />
        <Sfx at={cMove + 20} name="air_whoosh" volume={0.4} />
        <Sfx at={cMove + 68} name="shield_activate" volume={0.5} />
        <Sfx at={cKeep + 10} name="tactile_click" volume={0.5} />
      </Layer>
    </SceneShell>
  );
};
