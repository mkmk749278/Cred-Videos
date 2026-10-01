import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {C, MONO, alpha} from '../theme';
import {CLAMP, vis} from '../lib/anim';
import {contentStart, cueFrame, paragraphEnd, sceneFrames} from '../lib/timing';
import {SceneShell} from '../components/SceneShell';
import {Check, Glass, KLine, Layer, Reveal, Sfx} from '../components/primitives';
import {Person} from '../components/icons';

const I = 12;

const STEPS = [
  {cue: 'Step One', t: 'Move salary to a clean anchor bank', s: 'Creditor bank balances at ₹0'},
  {cue: 'Step Two', t: 'Written hardship notice to the PNO', s: 'Keep your Case IDs'},
  {cue: 'Step Three', t: 'Silence unknown callers + dialer blocks', s: 'Mechanical silence'},
  {cue: 'Step Four', t: 'Stop token / Minimum Due payments', s: 'They only service fees'},
  {cue: 'Step Five', t: 'No phone arguments — all in writing', s: 'Direct to the bank'},
  {cue: 'Step Six', t: 'Settlement talks usually open post write-off', s: 'Day ~180+'},
  {cue: 'Step Seven', t: 'OTS: often ~25–35% · official letter · NDC', s: 'Pay the bank directly'},
  {cue: 'And Step Eight', t: 'Rebuild with an FD-backed secured card', s: 'Toward 750+'},
];

export const Scene13: React.FC = () => {
  const frame = useCurrentFrame();
  const D = sceneFrames(I);
  const c0 = contentStart(I);
  const cAlone = cueFrame(I, 'Remember, you are not alone');
  const ats = STEPS.map((s) => cueFrame(I, s.cue));
  const dones = STEPS.map((s) => paragraphEnd(I, s.cue));
  const cFinal = cueFrame(I, 'Take control today');
  const part = interpolate(frame, [cFinal - 10, cFinal + 30], [0, 1], CLAMP);
  const sun = interpolate(frame, [cFinal, cFinal + 120], [0, 1], CLAMP);

  return (
    <SceneShell index={I} duration={D} music="hope" tint={C.gold}>
      <Layer opacity={vis(frame, c0 - 10, cFinal + 40, 20)}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', fontSize: 40, fontWeight: 900, opacity: vis(frame, c0)}}>
          Your <span style={{color: C.gold}}>8-step</span> emergency protocol
        </div>
        {[0, 1].map((col) => (
          <div
            key={col}
            style={{
              position: 'absolute',
              top: 80,
              left: col === 0 ? 110 : 990,
              width: 820,
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              transform: `translateX(${(col === 0 ? -1 : 1) * part * 1000}px)`,
            }}
          >
            {STEPS.slice(col * 4, col * 4 + 4).map((s, j) => {
              const i = col * 4 + j;
              return (
                <Reveal key={i} at={ats[i]} from={col === 0 ? 'left' : 'right'}>
                  <Glass accent={C.gold} pad={18} style={{display: 'flex', alignItems: 'center', gap: 20, height: 130, boxSizing: 'border-box'}}>
                    <div style={{fontFamily: MONO, fontSize: 44, fontWeight: 800, color: C.gold, width: 60}}>{i + 1}</div>
                    <div style={{flex: 1}}>
                      <div style={{fontSize: 30, fontWeight: 800, lineHeight: 1.2}}>{s.t}</div>
                      <div style={{fontSize: 21, color: C.muted, marginTop: 4}}>{s.s}</div>
                    </div>
                    <Check at={dones[i] - 12} size={56} />
                  </Glass>
                </Reveal>
              );
            })}
          </div>
        ))}
        {ats.map((a, i) => (
          <React.Fragment key={i}>
            <Sfx at={a} name="air_whoosh" volume={0.25} />
            <Sfx at={dones[i] + 10} name="tactile_click" volume={0.5} />
          </React.Fragment>
        ))}
      </Layer>

      <div style={{position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', opacity: vis(frame, cAlone, cFinal)}}>
        <KLine at={cAlone} size={40} color={C.gold}>You are not alone. You are not a criminal.</KLine>
      </div>
      {/* finale */}
      <Layer opacity={part}>
        <div
          style={{
            position: 'absolute',
            left: -40,
            right: -40,
            top: -120,
            bottom: -220,
            background: `radial-gradient(ellipse 60% 50% at 50% ${90 - sun * 25}%, ${alpha('#fbbf24', 0.55)}, ${alpha('#f97316', 0.25)} 40%, transparent 70%), linear-gradient(180deg, #0c1a33, #3b2410 80%)`,
          }}
        />
        <div style={{position: 'absolute', left: 0, right: 0, top: 420, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 10, opacity: sun}}>
          <Person size={260} color="#0b1220" />
          <Person size={230} color="#0b1220" />
          <Person size={150} color="#0b1220" />
          <Person size={120} color="#0b1220" />
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center'}}>
          <Reveal at={cFinal + 30} from="top" distance={60}>
            <div style={{fontSize: 96, fontWeight: 900, letterSpacing: -1, lineHeight: 1.05, color: '#fff', textShadow: `0 0 40px ${alpha(C.gold, 0.6)}`}}>
              DEBT IS A CHAPTER,
              <br />
              <span style={{color: C.gold}}>NOT YOUR LIFE.</span>
            </div>
          </Reveal>
          <Reveal at={cFinal + 70} from="bottom" distance={30}>
            <div style={{fontFamily: MONO, fontSize: 34, letterSpacing: 10, marginTop: 24, color: '#FDE68A', fontWeight: 700}}>TAKE CONTROL TODAY</div>
          </Reveal>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 730, textAlign: 'center', fontSize: 20, color: alpha('#FFFFFF', 0.7), textShadow: '0 1px 6px rgba(0,0,0,0.8)', opacity: vis(frame, cFinal + 90)}}>
          Awareness only · not legal or financial advice · verify with a qualified advocate
        </div>
        <Sfx at={cFinal + 30} name="title_hit" volume={0.45} />
        <Sfx at={cFinal + 60} name="triumph_rise" volume={0.4} />
      </Layer>
    </SceneShell>
  );
};
