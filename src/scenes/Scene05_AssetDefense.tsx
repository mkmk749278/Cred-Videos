import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, FONT, MONO, alpha} from '../theme';
import {vis} from '../lib/anim';
import {cueFrame, FPS, LEAD, sceneFrames} from '../lib/timing';
import {SceneShell} from '../components/SceneShell';
import {Banner, Glass, Label, Layer, Reveal, Sfx, shake} from '../components/primitives';
import {Vaults3D} from '../three/Vaults3D';

const I = 4;

const VaultTitle: React.FC<{x: number; at: number; title: string; sub: string}> = ({x, at, title, sub}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: x - 210, top: 320, width: 420, textAlign: 'center', opacity: vis(frame, at + 10)}}>
      <div style={{fontSize: 34, fontWeight: 900, textShadow: '0 2px 12px rgba(0,0,0,0.8)'}}>{title}</div>
      <div style={{fontSize: 22, color: C.muted}}>{sub}</div>
    </div>
  );
};

export const Scene05: React.FC = () => {
  const frame = useCurrentFrame();
  const D = sceneFrames(I);
  const c0 = LEAD * FPS;
  const c171 = cueFrame(I, 'Under Section 171');
  const cVaults = cueFrame(I, 'If you have an unpaid');
  const cSweep = cueFrame(I, 'may sweep');
  const cMove = cueFrame(I, 'your first move');
  const cKeep = cueFrame(I, 'Keep every bank');
  const cFamily = cueFrame(I, "Your family's groceries");

  const sh = shake(frame, cSweep + 10, 12);

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
        <Vaults3D start={cVaults} sweep={cSweep} move={cMove} keep={cKeep} />
        <div style={{position: 'absolute', left: 860, top: 0, width: 200, textAlign: 'center'}}>
          <div style={{display: 'inline-block', padding: '8px 18px', borderRadius: 12, background: alpha(C.gold, 0.2), border: `2px solid ${C.gold}`, fontFamily: MONO, fontWeight: 800, color: C.gold, fontSize: 22}}>SALARY ₹45,000</div>
        </div>
        <VaultTitle x={500} at={cVaults} title="Bank A · Creditor" sub="Unpaid card + savings account" />
        <VaultTitle x={1420} at={cVaults + 12} title="Clean Anchor Bank" sub="e.g. Bank of Baroda · zero loans/cards" />
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
