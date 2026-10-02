import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, FONT, MONO, alpha} from '../theme';
import {vis} from '../lib/anim';
import {contentStart, cueFrame, sceneFrames, sentenceEnd} from '../lib/timing';
import {SceneShell} from '../components/SceneShell';
import {Banner, Glass, KLine, Label, Layer, NextChip, Reveal, Sfx, shake, SpokenTile, Tag} from '../components/primitives';
import {Vaults3D} from '../three/Vaults3D';
import {LANG} from '../lib/lang';

// Telugu narration qualifies set-off ("may adjust ... under applicable terms") and says moving accounts is no legal shield
const TE = LANG === 'te';

const I = 4;

const VaultTitle: React.FC<{x: number; at: number; out: number; title: string; sub: string}> = ({x, at, out, title, sub}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: x - 260, top: 672, width: 520, textAlign: 'center', opacity: vis(frame, at + 10, out)}}>
      <div style={{fontSize: 34, fontWeight: 900, textShadow: '0 2px 12px rgba(0,0,0,0.8)'}}>{title}</div>
      <div style={{fontSize: 22, color: C.muted}}>{sub}</div>
    </div>
  );
};

const Arrow: React.FC<{at: number}> = ({at}) => {
  const frame = useCurrentFrame();
  const p = vis(frame, at);
  return <div style={{fontSize: 54, fontWeight: 900, color: C.gold, opacity: p, transform: `translateX(${(1 - p) * -20}px)`}}>→</div>;
};

export const Scene05: React.FC = () => {
  const frame = useCurrentFrame();
  const D = sceneFrames(I);
  const c0 = contentStart(I);
  const c171 = cueFrame(I, 'Under Section 171');
  const cVaults = cueFrame(I, 'If you have an unpaid');
  const cSweep = cueFrame(I, 'may sweep');
  const cMove = cueFrame(I, 'your first move');
  const cKeep = cueFrame(I, 'Keep every bank');
  const cFamily = cueFrame(I, "Your family's groceries");
  const cSetOff = cueFrame(I, 'the Right of Set-Off');
  const cMean = cueFrame(I, 'What does that mean');
  const cCall = cueFrame(I, 'even one recovery call');
  const cProtect = cueFrame(I, "Protect your family's money");
  const cImportant = sentenceEnd(I, 'This is very important');
  const cRules = cueFrame(I, 'the rules in most bank');
  const cImagine = cueFrame(I, 'Imagine waking up');
  const cNoLoan = cueFrame(I, 'no loan');
  const cNoCard = cueFrame(I, 'no credit card');
  const cNoOd = cueFrame(I, 'no overdraft');
  const cNothing = cueFrame(I, 'nothing it can take');

  const sh = shake(frame, cSweep + 10, 12);

  return (
    <SceneShell index={I} duration={D} music="analytic" tint={C.cyan} stageStyle={{translate: `${sh.x}px ${sh.y}px`}}>
      <Layer opacity={vis(frame, c0 - 10, cVaults - 4)}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 40, display: 'flex', justifyContent: 'center'}}>
          <Reveal at={c0} from="scale">
            <Glass accent={C.cyan} style={{width: 1100, textAlign: 'center'}} pad={34}>
              <Label color={C.cyan}>Step zero · before any call</Label>
              <div style={{fontSize: 60, fontWeight: 900, marginTop: 10}}>Secure household survival cash</div>
            </Glass>
          </Reveal>
        </div>
        {/* before the law: what to protect */}
        <div style={{position: 'absolute', left: 0, right: 0, top: 290, display: 'flex', justifyContent: 'center', gap: 22, opacity: vis(frame, cCall, c171 - 4)}}>
          <SpokenTile at={cCall} icon="☏" label="Recovery call" sub="not yet" color={C.crimson} width={240} doneAt={cCall + 20} mark="cross" />
          <SpokenTile at={cProtect} icon="₹" label="Salary" color={C.emerald} width={200} doneAt={cImportant} />
          <SpokenTile at={cProtect + 6} icon="S" label="Savings" color={C.emerald} width={200} doneAt={cImportant + 5} />
          <SpokenTile at={cProtect + 12} icon="♥" label="Family money" color={C.emerald} width={240} doneAt={cImportant + 10} />
        </div>
        {/* the legal chain */}
        <div style={{position: 'absolute', left: 0, right: 0, top: 290, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, opacity: vis(frame, c171, cMean - 4)}}>
          <SpokenTile at={c171} icon="§" label="Section 171" sub="Indian Contract Act" color={C.gold} width={290} />
          <Arrow at={cRules - 6} />
          <SpokenTile at={cRules} icon="✎" label="Bank agreement" sub="the fine print" color={C.gold} width={290} />
          <Arrow at={cSetOff - 6} />
          <SpokenTile at={cSetOff} icon="⇄" label="Right of Set-Off" sub="bank can take your money" color={C.crimson} width={320} />
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center'}}>
          <KLine at={cSetOff + 8} size={60} color={C.gold} mark={C.gold} out={cMean - 4}>The Right of Set-Off</KLine>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center'}}>
          <KLine at={cMean} size={72}>What does that mean for you?</KLine>
        </div>
        {[cProtect, cProtect + 6, cProtect + 12, c171, cRules].map((a, i) => (
          <Sfx key={i} at={a} name="node_pop" volume={0.32} />
        ))}
        <Sfx at={cSetOff} name="title_hit" volume={0.22} />
      </Layer>
      <Layer opacity={vis(frame, cVaults - 4, D)}>
        <Vaults3D start={cVaults} sweep={cSweep} move={cMove} keep={cKeep} />
        <div style={{position: 'absolute', left: 860, top: 0, width: 200, textAlign: 'center'}}>
          <div style={{display: 'inline-block', padding: '8px 18px', borderRadius: 12, background: alpha(C.gold, 0.2), border: `2px solid ${C.gold}`, fontFamily: MONO, fontWeight: 800, color: C.gold, fontSize: 22}}>SALARY ₹45,000</div>
        </div>
        <VaultTitle x={640} out={cKeep + 10} at={cVaults} title="Bank A · Creditor" sub="Unpaid card + savings account" />
        <VaultTitle x={1290} out={cKeep + 10} at={cVaults + 12} title="Clean Anchor Bank" sub="Zero loans · zero cards · zero overdraft" />
        <div style={{position: 'absolute', left: 1120, top: 190, opacity: vis(frame, cImagine, cMove + 20)}}>
          <KLine at={cImagine} size={36} color="#FCA5A5">Salary day → ₹0.00 in your account</KLine>
        </div>
        <div style={{position: 'absolute', left: 1560, top: 170, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start', opacity: vis(frame, cNoLoan, cKeep)}}>
          {[
            {at: cNoLoan, t: 'No loan'},
            {at: cNoCard, t: 'No credit card'},
            {at: cNoOd, t: 'No overdraft'},
          ].map((x) => (
            <Reveal key={x.t} at={x.at} from="right" distance={40}>
              <Tag color={C.cyan} style={{fontSize: 22}}>✓ {x.t}</Tag>
            </Reveal>
          ))}
          <Reveal at={cNothing} from="right" distance={40}>
            <Tag color={C.gold} style={{fontSize: 22, whiteSpace: 'nowrap'}}>Nothing to take</Tag>
          </Reveal>
        </div>
        {[cNoLoan, cNoCard, cNoOd, cNothing].map((a, i) => (
          <Sfx key={i} at={a} name="tactile_click" volume={0.3} />
        ))}
        <div style={{position: 'absolute', left: 1120, top: 110, opacity: vis(frame, cSweep + 40, cMove + 20)}}>
          <div style={{padding: '12px 22px', borderRadius: 12, background: alpha(C.crimson, 0.25 + 0.15 * Math.sin(frame / 3)), border: `2px solid ${C.crimson}`, fontWeight: 900, fontSize: 30, color: '#FECACA', fontFamily: FONT}}>
            {TE ? '⚠ SAME-BANK MONEY MAY BE ADJUSTED' : '⚠ SALARY SWEPT TO ZERO · NO COURT ORDER'}
          </div>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 680}}>
          <Banner at={cKeep + 10} color={C.gold} size={38}>
            {TE ? 'Plan your essentials so household money isn’t disrupted' : 'Creditor-bank accounts: keep at ₹0'}
          </Banner>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 735, opacity: vis(frame, cFamily)}}>
          <div style={{textAlign: 'center', fontSize: 26, color: C.muted}}>{TE ? 'Moving accounts is not a shield from valid legal recovery or court orders' : 'Groceries · healthcare · secured EMIs come before unsecured card debt'}</div>
        </div>
        <Sfx at={cVaults} name="block_slam" volume={0.35} />
        <Sfx at={cVaults + 12} name="block_slam" volume={0.35} />
        <Sfx at={cSweep - 5} name="piston_clamp" volume={0.55} />
        <Sfx at={cSweep + 40} name="warning_pulse" volume={0.35} />
        <Sfx at={cMove + 20} name="air_whoosh" volume={0.4} />
        <Sfx at={cMove + 68} name="shield_activate" volume={0.5} />
        <Sfx at={cKeep + 10} name="tactile_click" volume={0.5} />
        <div style={{position: 'absolute', right: 60, top: 6}}>
          <NextChip at={cFamily + 90} text="Dealing with the bank itself" />
        </div>
      </Layer>
    </SceneShell>
  );
};
