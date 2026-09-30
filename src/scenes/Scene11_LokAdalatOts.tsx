import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT, MONO, alpha} from '../theme';
import {CLAMP, spr, vis} from '../lib/anim';
import {contentStart, cueFrame, sceneFrames, sentenceEnd} from '../lib/timing';
import {SceneShell} from '../components/SceneShell';
import {Check, Glass, KLine, Label, Layer, Phone, Reveal, Sfx, shake, SpokenTile, Stamp, Tag} from '../components/primitives';
import {GavelIcon} from '../components/icons';

const I = 10;

const CHECKS = [
  {cue: 'First: The settlement', t: "Official letter on the bank's letterhead, signed by an authorized officer (not an agency)"},
  {cue: 'Second: The letter', t: 'Exact card number + settlement sum'},
  {cue: 'Third: It must', t: 'Full & final: account closed with zero remaining balance'},
  {cue: 'Fourth: It should', t: 'No Dues Certificate, typically within 30–45 days'},
];

export const Scene11: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const D = sceneFrames(I);
  const c0 = contentStart(I);
  const cWay1 = cueFrame(I, 'A National Lok Adalat');
  const cWay2 = cueFrame(I, 'direct One-Time Settlement');
  const cWait = cueFrame(I, 'But wait');
  const cNalsa = cueFrame(I, 'National Lok Adalat is organized');
  const cAward = cueFrame(I, 'An award passed');
  const cFinal = cueFrame(I, 'It is final');
  const cRange = cueFrame(I, 'In compromise settlements');
  const cRules = cueFrame(I, 'check four things');
  const cChecks = CHECKS.map((c) => cueFrame(I, c.cue));
  const cChecksDone = CHECKS.map((c) => sentenceEnd(I, c.cue));
  const cFinalDone = [sentenceEnd(I, 'It is final'), sentenceEnd(I, 'It binds both'), sentenceEnd(I, 'nobody can appeal')];
  const cRemit = cueFrame(I, 'And when you pay');
  const cCash = cueFrame(I, 'Never make cash');
  const gavelHit = cAward + 20;
  const g = frame - gavelHit;
  const gavelRot = g < -12 ? -40 : g < 0 ? interpolate(g, [-12, 0], [-40, 12], CLAMP) : interpolate(g, [0, 10], [12, 0], CLAMP);
  const sh = shake(frame, gavelHit, 14);
  const pay = spr(frame, fps, cRemit + 40);

  return (
    <SceneShell index={I} duration={D} music="hope" tint={C.gold} stageStyle={{translate: `${sh.x}px ${sh.y}px`}}>
      <div style={{position: 'absolute', left: 1120, top: 610, width: 680, opacity: vis(frame, cWait, cRules + 6)}}>
        <KLine at={cWait} size={60} color={C.crimson}>But wait.</KLine>
      </div>
      <Layer opacity={vis(frame, c0 - 10, cRules + 4)}>
        {/* bench */}
        <div style={{position: 'absolute', left: 140, top: 60, width: 900, height: 600}}>
          <Reveal at={c0} from="bottom">
            <svg width={900} height={600}>
              <defs>
                <linearGradient id="col" x1="0" x2="1">
                  <stop offset="0" stopColor="#78350f" />
                  <stop offset="0.45" stopColor="#fde68a" />
                  <stop offset="1" stopColor="#92400e" />
                </linearGradient>
                <linearGradient id="stone" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#3b2410" />
                  <stop offset="1" stopColor="#1c1107" />
                </linearGradient>
              </defs>
              {/* pediment with scales of justice */}
              <polygon points="60,160 450,36 840,160" fill="url(#stone)" stroke="#f5b942" strokeWidth={5} strokeLinejoin="round" />
              <g transform="translate(450 112)" stroke="#fde68a" strokeWidth={4} fill="none" strokeLinecap="round">
                <line x1={0} y1={-34} x2={0} y2={30} />
                <line x1={-52} y1={-22} x2={52} y2={-22} />
                <path d="M -52 -22 L -70 10 L -34 10 Z M 52 -22 L 34 10 L 70 10 Z" />
                <line x1={-22} y1={32} x2={22} y2={32} />
              </g>
              {/* entablature */}
              <rect x={50} y={164} width={800} height={62} rx={6} fill="#451a03" stroke="#f5b942" strokeWidth={4} />
              <text x={450} y={206} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={30} fill="#fde68a" letterSpacing={5}>
                NATIONAL LOK ADALAT
              </text>
              {/* columns */}
              {[0, 1, 2, 3, 4, 5].map((i) => {
                const x = 108 + i * 136;
                return (
                  <g key={i}>
                    <rect x={x - 6} y={232} width={60} height={16} rx={3} fill="#b45309" />
                    <rect x={x} y={248} width={48} height={236} fill="url(#col)" opacity={0.9} />
                    {[12, 24, 36].map((dx) => (
                      <line key={dx} x1={x + dx} y1={252} x2={x + dx} y2={480} stroke="#78350f" strokeWidth={2} opacity={0.6} />
                    ))}
                    <rect x={x - 6} y={484} width={60} height={14} rx={3} fill="#b45309" />
                  </g>
                );
              })}
              {/* steps */}
              {[0, 1, 2].map((k) => (
                <rect key={k} x={40 - k * 18} y={500 + k * 28} width={820 + k * 36} height={24} rx={4} fill={['#78350f', '#5c2a0c', '#451a03'][k]} stroke="#92400e" strokeWidth={2} />
              ))}
            </svg>
          </Reveal>
          <div style={{position: 'absolute', left: 170, top: 180, width: 440, opacity: vis(frame, cAward - 10), transform: `rotate(-3deg)`}}>
            <div style={{background: '#fefce8', color: '#1c1917', borderRadius: 8, padding: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.5)', fontFamily: FONT}}>
              <div style={{fontWeight: 900, fontSize: 24, textAlign: 'center', letterSpacing: 1}}>LOK ADALAT AWARD</div>
              {[1, 2, 3, 4].map((l) => (
                <div key={l} style={{height: 8, background: '#d6d3d1', borderRadius: 4, marginTop: 12, width: `${100 - l * 9}%`}} />
              ))}
            </div>
            <div style={{position: 'absolute', left: 140, top: 60}}>
              <Stamp at={gavelHit} text="DEEMED CIVIL DECREE" color="#b91c1c" size={24} rotate={-14} />
            </div>
          </div>
          <div style={{position: 'absolute', left: 640, top: 120, transform: `rotate(${gavelRot}deg)`, transformOrigin: '20% 80%', opacity: vis(frame, cAward - 20)}}>
            <GavelIcon size={220} />
          </div>
        </div>
        <div style={{position: 'absolute', left: 1120, top: 60, width: 680, display: 'flex', flexDirection: 'column', gap: 20}}>
          <div style={{display: 'flex', gap: 16, opacity: vis(frame, cWay1, cNalsa)}}>
            <SpokenTile at={cWay1} icon="1" label="National Lok Adalat" color={C.gold} width={320} />
            <SpokenTile at={cWay2} icon="2" label="Direct OTS with the bank" color={C.cyan} width={320} />
          </div>
          <Reveal at={cNalsa} from="right">
            <Glass accent={C.gold} pad={22}>
              <Label color={C.gold}>Organized by NALSA</Label>
              <div style={{fontSize: 28, fontWeight: 700, marginTop: 6}}>Statutory conciliation forum · Legal Services Authorities Act</div>
            </Glass>
          </Reveal>
          <Reveal at={cFinal} from="right">
            <Glass accent={C.emerald} pad={22}>
              <div style={{display: 'flex', gap: 12, flexWrap: 'wrap'}}>
                {['Final', 'Binding on both', 'No appeal'].map((t, i) => (
                  <div key={t} style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 28, fontWeight: 800}}>
                    <Check at={cFinalDone[i] - 12} size={38} />
                    {t}
                  </div>
                ))}
              </div>
            </Glass>
          </Reveal>
          <Reveal at={cRange} from="right">
            <Glass accent={C.cyan} pad={22}>
              <Label color={C.cyan}>Often reported settlement</Label>
              <div style={{fontSize: 70, fontWeight: 900, color: C.cyan}}>25–35%</div>
              <div style={{fontSize: 24, color: C.muted}}>of core principal · outcomes vary</div>
            </Glass>
          </Reveal>
        </div>
        <Sfx at={gavelHit} name="gavel_strike" volume={0.6} />
        {[0, 1, 2].map((i) => (
          <Sfx key={i} at={cFinalDone[i] + 10} name="tactile_click" volume={0.35} />
        ))}
      </Layer>

      <Layer opacity={vis(frame, cRules, cRemit + 4)}>
        <div style={{position: 'absolute', left: 170, top: 0}}>
          <Reveal at={cRules} from="bottom">
            <div style={{width: 760, height: 740, background: '#fafaf9', borderRadius: 10, boxShadow: '0 40px 80px rgba(0,0,0,0.6)', padding: 40, boxSizing: 'border-box', color: '#1c1917', fontFamily: FONT, position: 'relative'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #1e3a8a', paddingBottom: 14}}>
                <div style={{fontWeight: 900, fontSize: 30, color: '#1e3a8a'}}>🏦 YOUR BANK LTD.</div>
                <div style={{fontFamily: MONO, fontSize: 14}}>Ref: OTS/2026/0917</div>
              </div>
              <div style={{fontWeight: 900, fontSize: 26, marginTop: 20}}>ONE-TIME SETTLEMENT SANCTION LETTER</div>
              <div style={{fontSize: 18, marginTop: 14, lineHeight: 1.6}}>
                Card No. <b>XXXX XXXX XXXX 4821</b>
                <br />
                Settlement amount: <b>₹ 35,000</b> (in full and final settlement)
                <br />
                Upon receipt, the account stands <b>closed with zero balance</b>.
                <br />
                No Dues Certificate will be issued within <b>30–45 days</b>.
              </div>
              {[1, 2, 3, 4, 5].map((l) => (
                <div key={l} style={{height: 7, background: '#e7e5e4', borderRadius: 4, marginTop: 14, width: `${95 - l * 7}%`}} />
              ))}
              <div style={{position: 'absolute', bottom: 40, right: 40, textAlign: 'right', fontSize: 16}}>
                <div style={{fontFamily: 'cursive', fontSize: 34, color: '#1e3a8a'}}>A. Sharma</div>
                Authorized Officer
              </div>
              {/* inspection lens */}
              <div
                style={{
                  position: 'absolute',
                  width: 170,
                  height: 170,
                  borderRadius: '50%',
                  border: `8px solid ${C.slate}`,
                  background: alpha(C.cyan, 0.08),
                  left: interpolate(frame, cChecks.map((c) => c + 10), [20, 60, 380, 440], CLAMP),
                  top: interpolate(frame, cChecks.map((c) => c + 10), [10, 120, 190, 500], CLAMP),
                  boxShadow: `0 0 30px ${alpha(C.cyan, 0.4)}`,
                }}
              />
            </div>
          </Reveal>
        </div>
        <div style={{position: 'absolute', left: 1000, top: 20, width: 800, display: 'flex', flexDirection: 'column', gap: 22}}>
          <Label color={C.gold} style={{opacity: vis(frame, cRules)}}>4 non-negotiable checks</Label>
          {CHECKS.map((c, i) => (
            <Reveal key={i} at={cChecks[i]} from="right">
              <Glass accent={C.emerald} pad={20} style={{display: 'flex', alignItems: 'center', gap: 18}}>
                <div style={{fontFamily: MONO, fontSize: 28, fontWeight: 800, color: C.emerald}}>0{i + 1}</div>
                <div style={{flex: 1, fontSize: 27, fontWeight: 700, lineHeight: 1.3}}>{c.t}</div>
                <Check at={cChecksDone[i] - 12} size={50} />
              </Glass>
            </Reveal>
          ))}
        </div>
        {cChecks.map((c, i) => (
          <Sfx key={i} at={cChecksDone[i] + 10} name="tactile_click" volume={0.5} />
        ))}
      </Layer>

      <Layer opacity={vis(frame, cRemit, D)}>
        <div style={{position: 'absolute', left: 300, top: 0}}>
          <Reveal at={cRemit} from="bottom">
            <Phone width={380} height={760}>
              <div style={{position: 'absolute', top: 80, left: 26, right: 26, fontFamily: FONT}}>
                <div style={{fontSize: 28, fontWeight: 900}}>NEFT transfer</div>
                {[
                  ['To', 'Card account ****4821'],
                  ['Bank', 'Issuing bank (official)'],
                  ['Ref', 'OTS/2026/0917'],
                  ['Amount', '₹35,000.00'],
                ].map(([k, v]) => (
                  <div key={k} style={{marginTop: 18, borderBottom: '1px solid #334155', paddingBottom: 10}}>
                    <div style={{fontSize: 15, color: C.muted}}>{k}</div>
                    <div style={{fontSize: 22, fontWeight: 700}}>{v}</div>
                  </div>
                ))}
                <div style={{marginTop: 40, textAlign: 'center', transform: `scale(${pay})`, opacity: pay}}>
                  <div style={{width: 110, height: 110, borderRadius: 55, background: C.green, margin: '0 auto', display: 'grid', placeItems: 'center', fontSize: 60, boxShadow: `0 0 40px ${C.green}`}}>✓</div>
                  <div style={{fontSize: 26, fontWeight: 800, marginTop: 14}}>Payment successful</div>
                </div>
              </div>
            </Phone>
          </Reveal>
        </div>
        <div style={{position: 'absolute', left: 860, top: 80, width: 900, display: 'flex', flexDirection: 'column', gap: 24}}>
          <Reveal at={cRemit + 10} from="right">
            <Glass accent={C.emerald}>
              <Label color={C.emerald}>Only official channels</Label>
              <div style={{display: 'flex', gap: 12, marginTop: 14}}>
                {['NEFT', 'RTGS', "Bank's portal"].map((t) => (
                  <Tag key={t} color={C.emerald} style={{fontSize: 22}}>{t}</Tag>
                ))}
              </div>
            </Glass>
          </Reveal>
          <div style={{marginTop: 20}}>
            <Stamp at={cCash} text={'NEVER PAY CASH\nNO AGENT UPI'} color={C.crimson} size={50} rotate={-5} />
          </div>
        </div>
        <Sfx at={cRemit + 40} name="payment_success" volume={0.5} />
        <Sfx at={cCash} name="stamp_heavy" volume={0.55} />
      </Layer>
    </SceneShell>
  );
};
