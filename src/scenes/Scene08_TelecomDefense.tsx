import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT, MONO, alpha} from '../theme';
import {CLAMP, spr, vis} from '../lib/anim';
import {cueFrame, FPS, LEAD, sceneFrames} from '../lib/timing';
import {SceneShell} from '../components/SceneShell';
import {Glass, Label, Layer, Phone, Reveal, Sfx, Stamp, Type} from '../components/primitives';

const I = 7;

const RULES = [
  {r: '+91 140*', d: 'Commercial telemarketing'},
  {r: '+91 124* · +91 120*', d: 'NCR BPO cluster'},
  {r: '+91 77298* · +91 96765*', d: 'Observed agency numbers'},
];

const Dialer: React.FC<{start: number; answer: number; more: number}> = ({start, answer, more}) => {
  const frame = useCurrentFrame();
  const cx = 420;
  const cy = 360;
  const n = 18;
  return (
    <svg width={1920} height={770} style={{position: 'absolute', inset: 0}}>
      {new Array(n).fill(0).map((_, i) => {
        const x = 1300 + (i % 2) * 60;
        const y = 60 + i * 37;
        const hot = i === 8 && frame >= answer;
        const pulse = (frame - start - i * 3) % 30;
        return (
          <g key={i} opacity={vis(frame, start + i * 2)}>
            <line x1={cx + 110} y1={cy} x2={x} y2={y} stroke={hot ? C.crimson : alpha(C.cyan, 0.35)} strokeWidth={hot ? 4 : 2} />
            <circle cx={cx + 110 + ((x - cx - 110) * pulse) / 30} cy={cy + ((y - cy) * pulse) / 30} r={4} fill={C.cyan} opacity={hot ? 0 : 0.8} />
            <rect x={x} y={y - 14} width={200} height={28} rx={8} fill={hot ? alpha(C.crimson, 0.3) : '#1e293b'} stroke={hot ? C.crimson : '#334155'} />
            <text x={x + 14} y={y + 6} fill={hot ? '#fecaca' : C.muted} fontFamily="JetBrains Mono" fontSize={16}>
              {hot ? 'ANSWERED ✆' : `line ${String(i + 1).padStart(3, '0')} · ringing`}
            </text>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={110} fill={alpha(C.cyan, 0.1)} stroke={C.cyan} strokeWidth={4} />
      <text x={cx} y={cy - 10} textAnchor="middle" fill="#fff" fontFamily="Inter" fontWeight={900} fontSize={30}>
        PREDICTIVE
      </text>
      <text x={cx} y={cy + 28} textAnchor="middle" fill="#fff" fontFamily="Inter" fontWeight={900} fontSize={30}>
        DIALER
      </text>
      {frame >= answer && (
        <g opacity={vis(frame, answer)}>
          <rect x={cx - 190} y={cy + 150} width={380} height={60} rx={12} fill={alpha(C.crimson, 0.25)} stroke={C.crimson} strokeWidth={3} />
          <text x={cx} y={cy + 190} textAnchor="middle" fill="#fecaca" fontFamily="JetBrains Mono" fontWeight={800} fontSize={24}>
            STATUS: ACTIVE · HIGH YIELD
          </text>
        </g>
      )}
      {frame >= more && (
        <g opacity={vis(frame, more)}>
          <text x={cx} y={cy + 270} textAnchor="middle" fill={C.crimson} fontFamily="Inter" fontWeight={900} fontSize={40}>
            +20 calls scheduled tomorrow
          </text>
        </g>
      )}
    </svg>
  );
};

export const Scene08: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const D = sceneFrames(I);
  const c0 = LEAD * FPS;
  const cAnswer = cueFrame(I, 'Every time you answer');
  const cMore = cueFrame(I, 'can get even more');
  const cSilence = cueFrame(I, 'The answer is mechanical');
  const cSim = cueFrame(I, 'Keep work and family');
  const cRules = cueFrame(I, 'On your card number');
  const cToggle = cueFrame(I, 'Turn on Silence');
  const cCycle = cueFrame(I, 'Outside agencies');
  const cExhaust = cueFrame(I, 'When they get total');
  const cDrop = cueFrame(I, 'The calls typically');
  const toggle = spr(frame, fps, cToggle + 20);
  const day = Math.round(interpolate(frame, [cCycle + 10, cExhaust + 40], [1, 90], CLAMP));

  return (
    <SceneShell index={I} duration={D} music="tension" tint={C.cyan}>
      <Layer opacity={vis(frame, c0 - 10, cSilence + 4)}>
        <Dialer start={c0} answer={cAnswer + 20} more={cMore} />
        <Sfx at={c0} name="dialer_ring" volume={0.25} />
        <Sfx at={cAnswer + 20} name="warning_pulse" volume={0.35} />
        <Sfx at={cMore} name="counter_spin" volume={0.3} />
      </Layer>
      <Layer opacity={vis(frame, cSilence, cCycle + 4)}>
        <div style={{position: 'absolute', left: 150, top: 50, display: 'flex', flexDirection: 'column', gap: 24, width: 700}}>
          <Reveal at={cSilence} from="left">
            <div style={{fontSize: 64, fontWeight: 900}}>
              Mechanical <span style={{color: C.cyan}}>silence</span>
            </div>
          </Reveal>
          <Reveal at={cSim} from="left">
            <div style={{display: 'flex', gap: 20}}>
              <Glass accent={C.emerald} style={{flex: 1}} pad={22}>
                <Label color={C.emerald}>SIM 1</Label>
                <div style={{fontSize: 28, fontWeight: 800, marginTop: 6}}>Work &amp; family</div>
              </Glass>
              <Glass accent={C.crimson} style={{flex: 1}} pad={22}>
                <Label color={C.crimson}>SIM 2</Label>
                <div style={{fontSize: 28, fontWeight: 800, marginTop: 6}}>Card line · filtered</div>
              </Glass>
            </div>
          </Reveal>
          <Reveal at={cToggle} from="left">
            <Glass pad={22} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <div>
                <div style={{fontSize: 28, fontWeight: 800}}>Silence Unknown Callers</div>
                <div style={{fontSize: 20, color: C.muted}}>WhatsApp › Privacy › Calls</div>
              </div>
              <div style={{width: 100, height: 56, borderRadius: 28, background: toggle > 0.5 ? C.green : '#334155', position: 'relative'}}>
                <div style={{position: 'absolute', top: 6, left: 6 + toggle * 44, width: 44, height: 44, borderRadius: 22, background: '#fff'}} />
              </div>
            </Glass>
          </Reveal>
        </div>
        <div style={{position: 'absolute', left: 1080, top: 0}}>
          <Reveal at={cRules - 10} from="right">
            <Phone width={400} height={760}>
              <div style={{position: 'absolute', top: 70, left: 24, right: 24, fontFamily: FONT}}>
                <div style={{fontSize: 30, fontWeight: 900}}>Call blocker</div>
                <div style={{fontSize: 17, color: C.muted, marginBottom: 20}}>Wildcard rules</div>
                {RULES.map((r, i) => (
                  <div key={i} style={{background: '#1e293b', borderRadius: 14, padding: '14px 16px', marginBottom: 12, opacity: vis(frame, cRules + i * 40)}}>
                    <div style={{fontFamily: MONO, fontSize: 22, fontWeight: 800, color: C.cyan}}>
                      <Type text={r.r} start={cRules + i * 40} cps={24} />
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 16, color: C.muted, marginTop: 4}}>
                      <span>{r.d}</span>
                      <span style={{color: frame > cRules + i * 40 + 30 ? C.crimson : 'transparent', fontWeight: 800}}>BLOCKED</span>
                    </div>
                  </div>
                ))}
                {[0, 1, 2].map((i) => {
                  const at = cToggle + 50 + i * 22;
                  const o = vis(frame, at, at + 16, 4);
                  return (
                    <div key={i} style={{opacity: o, marginTop: 8, borderRadius: 14, padding: '12px 16px', background: alpha(C.crimson, 0.15), border: `1px solid ${C.crimson}`, fontSize: 18}}>
                      ✆ +91 140XXXXX{i}{i} · <b style={{color: C.crimson}}>dropped · no ring</b>
                    </div>
                  );
                })}
              </div>
            </Phone>
          </Reveal>
        </div>
        {RULES.map((_, i) => (
          <React.Fragment key={i}>
            <Sfx at={cRules + i * 40} name="typing" volume={0.2} />
            <Sfx at={cRules + i * 40 + 30} name="tactile_click" volume={0.35} />
          </React.Fragment>
        ))}
        <Sfx at={cToggle + 20} name="haptic_tap" volume={0.6} />
        {[0, 1, 2].map((i) => (
          <Sfx key={i} at={cToggle + 50 + i * 22} name="call_disconnect" volume={0.25} />
        ))}
      </Layer>
      <Layer opacity={vis(frame, cCycle, D)}>
        <div style={{position: 'absolute', left: 260, top: 60}}>
          <Reveal at={cCycle} from="left">
            <div style={{width: 420, borderRadius: 28, overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.5)'}}>
              <div style={{background: C.crimson, padding: 18, textAlign: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 26}}>AGENCY CONTRACT</div>
              <div style={{background: '#f8fafc', color: '#0f172a', textAlign: 'center', padding: '30px 0'}}>
                <div style={{fontSize: 30, fontWeight: 700, color: C.slate}}>DAY</div>
                <div style={{fontSize: 180, fontWeight: 900, lineHeight: 1, fontVariantNumeric: 'tabular-nums', transform: `rotateX(${(frame % 4) * 8 * (day < 90 ? 1 : 0)}deg)`}}>{day}</div>
                <div style={{fontSize: 26, color: C.slate}}>of 60–90</div>
              </div>
            </div>
          </Reveal>
        </div>
        <div style={{position: 'absolute', left: 820, top: 70, width: 900}}>
          <Reveal at={cExhaust} from="right">
            <Glass accent={C.slate}>
              <Label>Agency CRM · card ****4821</Label>
              {['Phone: total silence', 'Links clicked: 0', 'Token payments: 0'].map((t, i) => (
                <div key={t} style={{fontFamily: MONO, fontSize: 30, marginTop: 14, opacity: vis(frame, cExhaust + 10 + i * 12)}}>
                  {t}
                </div>
              ))}
              <div style={{marginTop: 22, fontFamily: MONO, fontSize: 30, fontWeight: 800, color: C.muted, opacity: vis(frame, cDrop)}}>STATUS → UNRESPONSIVE · FILE RETURNED TO BANK</div>
            </Glass>
          </Reveal>
          <div style={{marginTop: 30, marginLeft: 200}}>
            <Stamp at={cDrop + 30} text="CONTRACT WINDOW EXHAUSTED" color={C.slate} size={36} rotate={-4} />
          </div>
        </div>
        <Sfx at={cCycle + 10} name="pages_flip" volume={0.4} />
        <Sfx at={cDrop + 30} name="stamp_heavy" volume={0.45} />
      </Layer>
    </SceneShell>
  );
};
