import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {C, MONO, alpha} from '../theme';
import {CLAMP, inr, vis} from '../lib/anim';
import {contentStart, cueFrame, sceneFrames} from '../lib/timing';
import {SceneShell} from '../components/SceneShell';
import {FeeStack3D} from '../three/FeeStack3D';
import {Banner, Glass, KLine, Label, Layer, Reveal, Sfx, shake} from '../components/primitives';

const I = 3;

const BRICKS = [
  {label: 'Late payment fees', amt: 7200, color: '#F87171', cue: 'late payment charges'},
  {label: '42% APR finance charges', amt: 22400, color: '#EF4444', cue: 'revolving finance charges'},
  {label: 'Over-limit charges', amt: 3600, color: '#DC2626', cue: 'over-limit charges'},
  {label: '18% GST on all charges', amt: 5976, color: '#B91C1C', cue: 'eighteen percent GST'},
];

export const Scene04: React.FC = () => {
  const frame = useCurrentFrame();
  const D = sceneFrames(I);
  const c0 = contentStart(I);
  const brickAt = BRICKS.map((b) => cueFrame(I, b.cue) + 6);
  const cSix = cueFrame(I, 'In six months');
  const cRbi = cueFrame(I, 'Under the RBI Framework');
  const cWaive = cueFrame(I, 'may be waived');
  const cSettle = cueFrame(I, 'always try to settle');
  const cBlocked = cueFrame(I, 'Your card is blocked');
  const cNotSpent = cueFrame(I, "You haven't spent");
  const cUp = cueFrame(I, 'keeps going up');
  const cCall = cueFrame(I, 'I call this');
  const cAuto = cueFrame(I, "bank's computer starts");
  const cFunny = cueFrame(I, "And here's the funny part");
  const cOwnFees = cueFrame(I, 'You only crossed');
  const cNever = cueFrame(I, 'will never collect');
  const cGood = cueFrame(I, 'Now, good news');
  const dissolve = interpolate(frame, [cWaive, cWaive + 40], [0, 1], CLAMP);


  let total = 100000;
  BRICKS.forEach((b, i) => {
    if (frame >= brickAt[i] + 10) total += b.amt * (dissolve > 0.5 ? 0 : 1);
  });
  const alarm = total > 100000 && dissolve < 0.5;
  const sh = shake(frame, brickAt.find((b) => frame >= b + 10 && frame < b + 26) ?? -100, 10);

  return (
    <SceneShell index={I} duration={D} music="analytic" tint={C.crimson} stageStyle={{translate: `${sh.x}px ${sh.y}px`}}>
      <FeeStack3D
        start={c0}
        waive={cWaive}
        bricks={BRICKS.map((b, i) => ({label: b.label, amount: `+₹${inr(b.amt)}`, color: b.color, at: brickAt[i], h: 0.35 + (b.amt / 22400) * 0.75}))}
      />
      <div style={{position: 'absolute', left: 120, top: 640, width: 900, textAlign: 'center', fontFamily: MONO, fontSize: 22, fontWeight: 800, color: C.gold, letterSpacing: 3, opacity: vis(frame, cRbi, cWaive + 40)}}>
        RBI COMPROMISE SETTLEMENT FRAMEWORK
      </div>
      {/* ledger panel */}
      <div style={{position: 'absolute', left: 1180, top: 40, width: 600}}>
        <Reveal at={c0 + 20} from="right">
          <Glass accent={alarm ? C.crimson : C.green}>
            <Label color={alarm ? C.crimson : C.green}>Statement balance</Label>
            <div style={{fontFamily: MONO, fontSize: 76, fontWeight: 800, color: alarm ? C.crimson : C.green, textShadow: alarm ? `0 0 ${20 + 10 * Math.sin(frame / 4)}px ${alpha(C.crimson, 0.8)}` : undefined}}>
              ₹{inr(total)}
            </div>
            <div style={{fontSize: 22, color: C.muted, marginBottom: 14}}>Spends base: ₹1,00,000 · card blocked</div>
            {BRICKS.map((b, i) => (
              <div key={i} style={{display: 'flex', justifyContent: 'space-between', fontSize: 26, padding: '8px 0', borderTop: `1px solid ${C.border}`, opacity: frame >= brickAt[i] ? 1 : 0.15, textDecoration: dissolve > 0.5 ? 'line-through' : undefined, color: dissolve > 0.5 ? C.dim : C.text}}>
                <span>{b.label}</span>
                <span style={{fontFamily: MONO, color: dissolve > 0.5 ? C.dim : b.color}}>+₹{inr(b.amt)}</span>
              </div>
            ))}
          </Glass>
        </Reveal>
        <div style={{marginTop: 24, opacity: vis(frame, cSix, cRbi)}}>
          <Glass accent={C.crimson} pad={20}>
            <div style={{fontSize: 28, fontWeight: 700}}>
              6 months: ₹1,00,000 can show as <span style={{color: C.crimson}}>₹1,65,000</span>
            </div>
            <div style={{fontSize: 22, color: C.muted, marginTop: 6}}>Largely uncollectible — and banks know it.</div>
          </Glass>
        </div>
      </div>
      <div style={{position: 'absolute', left: 120, top: 40, opacity: vis(frame, c0, cRbi)}}>
        <Label color={C.crimson}>Billing cycle</Label>
        <div style={{fontFamily: MONO, fontSize: 60, fontWeight: 800}}>{Math.min(6, Math.max(1, Math.floor(interpolate(frame, [brickAt[0], brickAt[3] + 20], [1, 6.99], CLAMP))))} / 6</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 690}}>
        <Banner at={cWaive + 40} color={C.gold} size={42}>
          Phantom charges may be waived in OTS
        </Banner>
      </div>
      <div style={{position: 'absolute', left: 1180, top: 560, width: 620}}>
        <KLine at={cBlocked} size={40} out={cNotSpent + 20} style={{position: 'absolute', left: 0, top: 0, width: 620}}>Card blocked.</KLine>
        <KLine at={cNotSpent} size={40} color={C.muted} out={cUp} style={{position: 'absolute', left: 0, top: 0, width: 620}}>₹0 new spending.</KLine>
        <KLine at={cUp} size={46} color={C.crimson} out={cCall} style={{position: 'absolute', left: 0, top: 0, width: 620}}>Yet the balance keeps rising.</KLine>
        <KLine at={cCall} size={54} color={C.gold} out={cAuto} style={{position: 'absolute', left: 0, top: 0, width: 620}}>Phantom Accounting</KLine>
        <KLine at={cAuto} size={34} color={C.muted} out={brickAt[0] + 20} style={{position: 'absolute', left: 0, top: 0, width: 620}}>Charges added automatically by the bank's software</KLine>
        <KLine at={cOwnFees} size={34} color="#FCA5A5" out={brickAt[3]} style={{position: 'absolute', left: 0, top: 0, width: 620}}>Over the limit… only because of their own fees!</KLine>
        <KLine at={cGood} size={54} color={C.emerald} out={cRbi + 10} style={{position: 'absolute', left: 0, top: 0, width: 620}}>Now, the good news</KLine>
      </div>
      <div style={{position: 'absolute', left: 1180, top: 650, width: 620, opacity: vis(frame, cNever, cRbi)}}>
        <KLine at={cNever} size={30} color={C.muted}>Most of it will never be collected</KLine>
      </div>
      <div style={{position: 'absolute', left: 1180, top: 450, width: 600, opacity: vis(frame, cSettle)}}>
        <Glass accent={C.green} pad={20}>
          <div style={{fontSize: 28, fontWeight: 800}}>Settle against core principal — <span style={{color: C.green}}>not the phantom ledger.</span></div>
        </Glass>
      </div>
      <Sfx at={cCall} name="title_hit" volume={0.25} />
      <Sfx at={cFunny} name="buzzer" volume={0.15} />
      <Sfx at={cGood} name="triumph_rise" volume={0.25} />
      {brickAt.map((b, i) => (
        <Sfx key={i} at={b + 10} name="block_slam" volume={0.5} />
      ))}
      <Sfx at={cSix} name="warning_pulse" volume={0.3} />
      <Sfx at={cWaive - 30} name="plasma_sweep" volume={0.5} />
      <Sfx at={cWaive} name="vaporize" volume={0.35} />
      <Sfx at={cSettle} name="tactile_click" volume={0.4} />
    </SceneShell>
  );
};
