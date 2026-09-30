import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT, MONO, alpha} from '../theme';
import {CLAMP, rnd, spr, vis} from '../lib/anim';
import {contentStart, cueFrame, sceneFrames, sentenceEnd} from '../lib/timing';
import {SceneShell} from '../components/SceneShell';
import {Check, Glass, KLine, Label, Layer, PointCard, Reveal, Sfx, shake, Stamp, Tag} from '../components/primitives';
import {Person, Scales} from '../components/icons';
import {Handcuffs3D} from '../three/Handcuffs3D';

const I = 1;

const PoliceBlueprint: React.FC<{start: number}> = ({start}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const draw = interpolate(frame, [start, start + 40], [1, 0], CLAMP);
  const walk = interpolate(frame, [start + 30, start + 90], [0, 1], CLAMP);
  const back = interpolate(frame, [start + 120, start + 170], [0, 1], CLAMP);
  const gate = spr(frame, fps, start + 80);
  const x = 780 - walk * 230 + back * 320;
  return (
    <svg width={1000} height={620} viewBox="0 0 1000 620">
      <defs>
        <pattern id="bp" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0 H0 V40" fill="none" stroke={alpha(C.royal, 0.25)} strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="1000" height="620" rx="24" fill={alpha(C.navy, 0.35)} />
      <rect width="1000" height="620" rx="24" fill="url(#bp)" stroke={alpha(C.royal, 0.6)} strokeWidth="2" />
      <g stroke="#93C5FD" strokeWidth="4" fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={draw}>
        <path d="M80 480 V240 L250 150 L420 240 V480 Z" pathLength={1} />
        <path d="M150 480 V360 H220 V480 M290 300 H370 V360 H290 Z M120 250 L250 180 L380 250" pathLength={1} />
      </g>
      <rect x="170" y="200" width="160" height="40" rx="6" fill={C.royal} opacity={1 - draw} />
      <text x="250" y="228" textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize="24" fill="#fff" opacity={1 - draw}>
        POLICE
      </text>
      {/* jurisdiction boundary */}
      <line x1="520" y1="120" x2="520" y2="560" stroke={C.crimson} strokeWidth="5" strokeDasharray="16 12" opacity={1 - draw} />
      <text x="530" y="110" fontFamily={MONO} fontSize="18" fill={C.crimson} opacity={1 - draw}>
        CIVIL DEBT BOUNDARY
      </text>
      {/* barrier gate */}
      <g transform={`translate(520 470) rotate(${-90 + 90 * gate})`}>
        <rect x="0" y="-8" width="200" height="16" rx="6" fill="#FCA5A5" stroke={C.crimson} strokeWidth="3" />
        {[30, 90, 150].map((bx) => (
          <rect key={bx} x={bx} y="-8" width="24" height="16" fill={C.crimson} />
        ))}
      </g>
      <circle cx="520" cy="470" r="12" fill={C.crimson} />
      <g transform={`translate(${x} 330) scale(${back > 0 ? -1 : 1} 1)`}>
        <foreignObject x="-50" y="0" width="100" height="160">
          <Person size={150} color={back > 0.9 ? alpha('#94A3B8', 0.4) : '#94A3B8'} />
        </foreignObject>
        <rect x="10" y="70" width="40" height="50" rx="4" fill="#FDE68A" opacity={0.9} />
        <text x="30" y="100" textAnchor="middle" fontSize="12" fontFamily={MONO} fill="#78350F">
          FILE
        </text>
      </g>
      <text x="820" y="540" textAnchor="middle" fontFamily={MONO} fontSize="18" fill={C.muted}>
        recovery agent
      </text>
    </svg>
  );
};

export const Scene02: React.FC = () => {
  const frame = useCurrentFrame();
  const D = sceneFrames(I);
  const c0 = contentStart(I);
  const cThreat = cueFrame(I, "They'll shout");
  const cContract = cueFrame(I, 'A credit card or a personal loan');
  const cRemedies = cueFrame(I, 'So what can the bank');
  const cAgreement = cueFrame(I, 'an agreement between');
  const cActLit = cueFrame(I, 'It comes under');
  const cCivil = cueFrame(I, 'usually a civil matter');
  const cNotCrim = cueFrame(I, 'Not a criminal one');
  const cOnlyCivil = cueFrame(I, 'Their options are civil');
  const cSuit = cueFrame(I, 'called a summary suit');
  const cLok = cueFrame(I, 'National Lok Adalat');
  const cNormal = cueFrame(I, 'normal recovery case');
  const cNotAgents = cueFrame(I, 'Police are not');
  const cNotMatter = cueFrame(I, 'not a police matter');
  const cHear = cueFrame(I, 'You may hear about');
  const cArrest = cueFrame(I, 'Indian criminal law');
  const cSC = cueFrame(I, 'The Supreme Court has said');
  const cHistory = cueFrame(I, 'If you maintained');
  const cPolice = cueFrame(I, 'And the police');
  const cDayOne = cueFrame(I, 'from the very first day');
  const cProblems = cueFrame(I, 'your problems started');
  const tlGrow = interpolate(frame, [cDayOne, cHistory + 40, cProblems, cProblems + 24], [0, 0.6, 0.62, 1], CLAMP);
  const cSec = cueFrame(I, 'Pure credit card defaults');
  const smash = cArrest + 20;
  const sh = shake(frame, smash + 7, 16);
  const split = interpolate(frame, [c0 - 10, c0 + 20], [0, 1], CLAMP);
  const rightLit = interpolate(frame, [cActLit, cActLit + 20], [0.45, 1], CLAMP);

  return (
    <SceneShell index={I} duration={D} music="tension" tint={C.royal} stageStyle={{translate: `${sh.x}px ${sh.y}px`}}>
      <Layer opacity={vis(frame, c0 - 10, cSC + 6)}>
        {/* left: criminal (myth) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            clipPath: `polygon(0 0, ${58 * split}% 0, ${42 * split}% 100%, 0 100%)`,
            background: `linear-gradient(135deg, ${alpha(C.red, 0.45)}, ${alpha('#450a0a', 0.7)})`,
          }}
        >
          <div style={{position: 'absolute', left: 90, top: 60, width: 640}}>
            <Label color="#FCA5A5">The myth · what callers say</Label>
            <div style={{fontSize: 46, fontWeight: 900, lineHeight: 1.1, marginTop: 14}}>
              SECTION 420 IPC /<br />318(4) BNS:
              <br />
              <span style={{color: '#FCA5A5'}}>CRIMINAL CHEATING</span>
            </div>
          </div>
          <div style={{position: 'absolute', left: -60, top: 250}}>
            <Handcuffs3D smash={smash + 7} width={640} height={480} />
          </div>
          {['“Section 420!”', '“Criminal breach of trust”', '“Police action today”'].map((t, i) => (
            <div key={i} style={{position: 'absolute', left: 520 - i * 60, top: 330 + i * 90, opacity: vis(frame, cThreat + i * 14, smash)}}>
              <Tag color={C.crimson} style={{fontFamily: FONT, textTransform: 'none', fontSize: 22, transform: `translateX(${Math.sin(frame * 0.9 + i) * 2}px)`}}>
                {t}
              </Tag>
            </div>
          ))}
          <div style={{position: 'absolute', left: 90, top: 272, opacity: vis(frame, cNotCrim, smash)}}>
            <KLine at={cNotCrim} size={44} color="#FCA5A5">✕ Not a criminal matter</KLine>
          </div>
          <div style={{position: 'absolute', left: 250, top: 400}}>
            <Stamp at={smash} text="DOES NOT APPLY" sub="to genuine inability to repay" size={50} />
          </div>
        </div>
        {/* right: civil (reality) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            clipPath: `polygon(${58 + 42 * (1 - split)}% 0, 100% 0, 100% 100%, ${42 + 58 * (1 - split)}% 100%)`,
            background: `linear-gradient(135deg, ${alpha(C.navy, 0.55 * rightLit)}, ${alpha('#020617', 0.8)})`,
            opacity: 0.4 + 0.6 * rightLit,
          }}
        >
          <div style={{position: 'absolute', right: 90, top: 60, width: 700, textAlign: 'right'}}>
            <Label color="#93C5FD">The reality</Label>
            <div style={{fontSize: 46, fontWeight: 900, lineHeight: 1.1, marginTop: 14}}>
              INDIAN CONTRACT ACT, 1872:
              <br />
              <span style={{color: '#93C5FD'}}>CIVIL BREACH</span>
            </div>
          </div>
          <div style={{position: 'absolute', right: 520, top: 300, opacity: rightLit}}>
            <Scales size={230} color="#93C5FD" />
          </div>
          {/* the contract, while it is being explained */}
          <div style={{position: 'absolute', right: 90, top: 280, width: 460, opacity: vis(frame, cContract, cRemedies + 6)}}>
            <Reveal at={cContract} from="right" distance={60}>
              <div style={{background: '#f8fafc', color: '#0f172a', borderRadius: 10, padding: '22px 26px', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', fontFamily: FONT, transform: 'rotate(2deg)'}}>
                <div style={{fontWeight: 900, fontSize: 26, letterSpacing: 2}}>CARDHOLDER AGREEMENT</div>
                <div style={{fontSize: 30, fontWeight: 800, color: C.royal, marginTop: 10, opacity: vis(frame, cAgreement)}}>You ⇄ Bank</div>
                {[1, 2, 3].map((l) => (
                  <div key={l} style={{height: 8, background: '#cbd5e1', borderRadius: 4, marginTop: 12, width: `${96 - l * 12}%`}} />
                ))}
                <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 14}}>
                  <Stamp at={cCivil} text="CIVIL" color={C.royal} size={34} rotate={-8} />
                </div>
              </div>
            </Reveal>
          </div>
          <div style={{position: 'absolute', right: 90, top: 290, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-end'}}>
            {[
              {t: 'Summary suit · Order 37 CPC', at: cSuit, done: cLok},
              {t: 'National Lok Adalat', at: cLok, done: cNormal},
              {t: 'Civil recovery case', at: cNormal, done: sentenceEnd(I, 'normal recovery case')},
            ].map(({t, at, done}) => (
              <Reveal key={t} at={at} from="right" distance={60}>
                <Glass accent={C.royal} pad={16} style={{display: 'flex', alignItems: 'center', gap: 16, width: 430}}>
                  <Check at={done - 8} size={40} color="#60A5FA" />
                  <span style={{fontSize: 26, fontWeight: 700}}>{t}</span>
                </Glass>
              </Reveal>
            ))}
            <Reveal at={cOnlyCivil} from="right" distance={40}>
              <div style={{fontFamily: MONO, fontSize: 20, color: '#93C5FD', marginTop: 6}}>CIVIL REMEDIES ONLY</div>
            </Reveal>
          </div>
        </div>
        <svg width={1920} height={770} style={{position: 'absolute', inset: 0}}>
          <line x1={1920 * 0.58} y1={0} x2={1920 * 0.42} y2={770} stroke="#fff" strokeWidth={4} opacity={split * 0.8} style={{filter: 'drop-shadow(0 0 12px #fff)'}} />
        </svg>
        <Sfx at={c0} name="plasma_sweep" volume={0.3} />
        <Sfx at={cThreat} name="warning_pulse" volume={0.25} />
        {[cLok, cNormal, sentenceEnd(I, 'normal recovery case')].map((a, i) => (
          <Sfx key={i} at={a + 12} name="tactile_click" volume={0.35} />
        ))}
        <Sfx at={cContract} name="air_whoosh" volume={0.3} />
        <Sfx at={cCivil} name="stamp_heavy" volume={0.4} />
        <Sfx at={cNotCrim} name="buzzer" volume={0.18} />
        <Sfx at={smash + 6} name="stamp_heavy" volume={0.6} />
        <Sfx at={smash + 7} name="glass_shatter" volume={0.45} />
      </Layer>

      <Layer opacity={vis(frame, cSC, cPolice + 6)}>
        <div style={{position: 'absolute', left: 150, top: 40}}>
          <Reveal at={cSC} from="top" distance={30}>
            <Label color={C.gold}>Supreme Court precedents</Label>
          </Reveal>
        </div>
        <div style={{position: 'absolute', left: 150, top: 100, display: 'flex', flexDirection: 'column', gap: 22}}>
          <PointCard
            at={cSC + 6}
            color={C.gold}
            width={1400}
            index="01"
            title="Indian Oil Corp. v. NEPC India Ltd. (2006)"
            body="A later default is not criminal cheating unless dishonest intent existed at the very start."
            checkAt={sentenceEnd(I, 'The Supreme Court has said') - 10}
          />
          <PointCard
            at={cSC + 60}
            color={C.gold}
            width={1400}
            index="02"
            title="ICICI Bank v. Prakash Kaur (2007)"
            body="Banks cannot use muscle power or coercive methods to recover dues — only lawful process."
            checkAt={sentenceEnd(I, 'The Supreme Court has said') + 6}
          />
          <PointCard
            at={cHistory + 90}
            color={C.gold}
            width={1400}
            index="03"
            title="Normal repayment history before the crisis?"
            body="Past usage and repayments show there was no intent to cheat at inception."
            checkAt={sentenceEnd(I, 'If you maintained') - 10}
          />
        </div>
        {/* intent timeline: cheating needs a plan on day one */}
        <div style={{position: 'absolute', left: 150, top: 610, width: 1400, opacity: vis(frame, cDayOne)}}>
          <div style={{position: 'relative', height: 150}}>
            <div style={{position: 'absolute', left: 0, right: 0, top: 40, height: 6, borderRadius: 3, background: '#1e293b'}} />
            <div style={{position: 'absolute', left: 0, top: 40, height: 6, borderRadius: 3, width: `${tlGrow * 100}%`, background: `linear-gradient(90deg, ${C.emerald} 0%, ${C.emerald} 62%, ${C.amber} 78%, ${C.crimson} 100%)`}} />
            {[
              {x: 0, at: cDayOne, label: 'Day 1: card taken', sub: 'no plan to cheat', color: C.emerald},
              {x: 0.2, at: cHistory + 10, label: '', sub: '', color: C.emerald, pay: true},
              {x: 0.33, at: cHistory + 18, label: '', sub: '', color: C.emerald, pay: true},
              {x: 0.46, at: cHistory + 26, label: 'Normal payments', sub: 'months / years', color: C.emerald, pay: true},
              {x: 0.59, at: cHistory + 34, label: '', sub: '', color: C.emerald, pay: true},
              {x: 0.76, at: cProblems, label: 'Crisis', sub: 'job loss · illness', color: C.amber},
              {x: 1, at: cProblems + 20, label: 'Default', sub: 'civil, not criminal', color: C.crimson},
            ].map((m, i) => {
              const o = vis(frame, m.at);
              return (
                <div key={i} style={{position: 'absolute', left: `${m.x * 100}%`, top: 0, width: 0, opacity: o}}>
                  <div style={{position: 'absolute', left: m.pay ? -13 : -17, top: m.pay ? 30 : 26, width: m.pay ? 26 : 34, height: m.pay ? 26 : 34, borderRadius: 17, background: m.pay ? alpha(m.color, 0.25) : m.color, border: `3px solid ${m.color}`, transform: `scale(${0.6 + 0.4 * o})`, display: 'grid', placeItems: 'center', fontSize: 16, fontWeight: 900, color: C.text}}>{m.pay ? '✓' : ''}</div>
                  {m.label && (
                    <div style={{position: 'absolute', top: 76, left: i === 0 ? -17 : i === 6 ? -300 : -150, width: 300, textAlign: i === 0 ? 'left' : i === 6 ? 'right' : 'center'}}>
                      <div style={{fontSize: 26, fontWeight: 800, color: m.color}}>{m.label}</div>
                      <div style={{fontSize: 20, color: C.muted}}>{m.sub}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {[cHistory + 10, cHistory + 18, cHistory + 26, cHistory + 34].map((a) => (
          <Sfx key={a} at={a} name="tactile_click" volume={0.22} />
        ))}
        <Sfx at={cProblems} name="warning_pulse" volume={0.25} />
        <Sfx at={cSC + 6} name="node_pop" volume={0.45} />
        <Sfx at={cSC + 60} name="node_pop" volume={0.45} />
        <Sfx at={cHistory + 90} name="node_pop" volume={0.45} />
        {[sentenceEnd(I, 'The Supreme Court has said') + 12, sentenceEnd(I, 'The Supreme Court has said') + 28, sentenceEnd(I, 'If you maintained') + 12].map((d) => (
          <Sfx key={d} at={d} name="tactile_click" volume={0.5} />
        ))}
      </Layer>

      <Layer opacity={vis(frame, cPolice, D)}>
        <div style={{position: 'absolute', left: 110, top: 60}}>
          <Reveal at={cPolice} from="left">
            <PoliceBlueprint start={cPolice + 4} />
          </Reveal>
        </div>
        <div style={{position: 'absolute', left: 290, top: 300}}>
          <Stamp at={cNotMatter + 10} text={'CIVIL MATTER\nNOT A POLICE CASE'} color="#60A5FA" rotate={-6} size={46} />
        </div>
        <div style={{position: 'absolute', left: 1170, top: 90, width: 640, display: 'flex', flexDirection: 'column', gap: 24}}>
          <Reveal at={cNotAgents} from="right">
            <Glass accent={C.royal}>
              <Label color="#93C5FD">Police are not recovery agents</Label>
              <div style={{fontSize: 30, fontWeight: 700, marginTop: 10, lineHeight: 1.3}}>A pure civil debt is not a police matter. No summons to the station over an unpaid card bill.</div>
            </Glass>
          </Reveal>
          <Reveal at={cHear} from="right">
            <Glass accent={C.gold}>
              <Label color={C.gold}>Sec 138 NI Act · Sec 25 PSSA</Label>
              <div style={{fontSize: 30, fontWeight: 700, marginTop: 10, lineHeight: 1.3}}>Apply to bounced cheques and failed auto-debit (NACH) mandates.</div>
              <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 14}}>
                <Check at={sentenceEnd(I, 'Pure credit card defaults') - 10} size={44} />
                <span style={{fontSize: 26, color: C.muted}}>Usually not a pure credit card bill</span>
              </div>
            </Glass>
          </Reveal>
        </div>
        <Sfx at={cPolice + 84} name="block_slam" volume={0.4} />
        <Sfx at={cNotMatter + 16} name="stamp_heavy" volume={0.55} />
        <Sfx at={sentenceEnd(I, 'Pure credit card defaults') + 12} name="tactile_click" volume={0.5} />
      </Layer>
    </SceneShell>
  );
};
