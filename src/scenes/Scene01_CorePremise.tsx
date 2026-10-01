import React, {useMemo} from 'react';
import {Sequence, useCurrentFrame} from 'remotion';
import {interpolate} from '../lib/safeInterpolate';
import {C, FONT, MONO, alpha} from '../theme';
import {CLAMP, rnd, vis} from '../lib/anim';
import {contentStart, cueFrame, sceneFrames, sentenceEnd} from '../lib/timing';
import {SceneShell} from '../components/SceneShell';
import {Check, Counter, Glass, KLine, Label, Layer, NextChip, PointCard, Pulse, Reveal, Sfx, shake, SpokenTile, Tag} from '../components/primitives';
import {FamilyIcon} from '../components/icons';
import {Phone3D} from '../three/Phone3D';
import {HeroCard3D} from '../three/HeroCard3D';

const I = 0;

const calls = [
  {n: '+91 140XXXXX11', t: 'Spam likely · Collections', c: C.crimson},
  {n: '+91 77298 XXXXX', t: 'Unknown · Recovery Dept', c: C.crimson},
  {n: '+91 124X XXX XXX', t: 'Telemarketing · NCR', c: C.amber},
  {n: '+91 96765 XXXXX', t: 'Unknown caller', c: C.crimson},
  {n: '+91 120X XXX XXX', t: 'Legal Cell (unverified)', c: C.amber},
];

type PhoneCues = {start: number; intense: number; threats: number; family: number; breath: number; starts: number; sick: number; job: number; biz: number; miss: number};

const PhoneBeat: React.FC<PhoneCues & {fortyFifty: number}> = ({start, intense, threats, family, breath, starts, sick, job, biz, miss, fortyFifty}) => {
  const frame = useCurrentFrame();
  return (
    <>
      <Phone3D start={start} intense={intense} />
      {calls.map((_, i) => (
        <Sfx key={i} at={start + 24 + i * 16} name="notification" volume={0.18} />
      ))}
      <Sfx at={intense} name="haptic_buzz" volume={0.45} />
      <div style={{position: 'absolute', left: 150, top: 110, width: 780}}>
        <Reveal at={start} from="left">
          <Label color={C.crimson}>Missed calls · today</Label>
          <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 220, lineHeight: 1, color: C.text, textShadow: `0 0 50px ${alpha(C.crimson, 0.5)}`}}>
            <Pulse at={[fortyFifty, fortyFifty + 14]} color={C.crimson} amount={0.1} style={{display: 'inline-block', transformOrigin: 'left center'}}>
              <Counter from={0} to={48} start={start + 10} end={intense + 60} />
            </Pulse>
          </div>
          <div style={{fontSize: 34, color: C.muted, fontWeight: 600}}>calls a day, every day</div>
        </Reveal>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 40, opacity: 1 - interpolate(frame, [breath, breath + 12], [0, 1], CLAMP)}}>
          {['“Police arrest today”', '“Home seizure team”', '“Family will be informed”', 'Relatives getting calls too'].map((t, i) => (
            <Reveal key={i} at={i < 3 ? threats + i * 10 : family} from="bottom" distance={40}>
              <Tag color={C.crimson} style={{fontSize: 22, textTransform: 'none', fontFamily: FONT}}>
                SMS ⚠ {t}
              </Tag>
            </Reveal>
          ))}
        </div>
      </div>
      <div style={{position: 'absolute', left: 150, top: 470, width: 800, opacity: vis(frame, breath, starts)}}>
        <Glass accent={C.cyan} pad={22}>
          <KLine at={breath} size={40} color={C.cyan}>Take a deep breath.</KLine>
          <div style={{fontSize: 26, color: C.muted, marginTop: 8, opacity: vis(frame, breath + 30)}}>You're not alone. Lakhs of people in India face this.</div>
        </Glass>
      </div>
      <div style={{position: 'absolute', left: 150, top: 440, display: 'flex', gap: 14, opacity: vis(frame, starts)}}>
        <SpokenTile at={sick} icon="+" label="Medical emergency" color={C.crimson} width={190} />
        <SpokenTile at={job} icon="✕" label="Job loss" color={C.amber} width={190} />
        <SpokenTile at={biz} icon="↘" label="Business slowdown" color={C.orange} width={190} />
        <SpokenTile at={miss} icon="1" label="Missed payment" color={C.red} width={190} />
      </div>
      <Sfx at={threats} name="warning_pulse" volume={0.3} />
      <Sfx at={breath} name="air_whoosh" volume={0.25} />
      {[sick, job, biz, miss].map((a, i) => (
        <Sfx key={i} at={a} name="node_pop" volume={0.35} />
      ))}
    </>
  );
};

/** Minimum-due funnel: Rs 5,000 enters, 85% vaporizes into interest + GST, Rs 870 reaches principal */
const FunnelBeat: React.FC<{start: number; vapor: number}> = ({start, vapor}) => {
  const frame = useCurrentFrame();
  const f = frame - start;
  const parts = useMemo(() => new Array(170).fill(0).map((_, i) => ({seed: i, burn: rnd(i * 3.1) < 0.85, delay: rnd(i + 0.5) * 150, x: rnd(i + 9) - 0.5})), []);
  const cx = 960;
  const noteY = interpolate(f, [0, 30], [-160, 20], CLAMP);
  const noteO = interpolate(f, [30, 70], [1, 0.25], CLAMP);
  return (
    <>
      <svg width={1920} height={770} style={{position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id="acrylic" x1="0" x2="1">
            <stop offset="0" stopColor="rgba(148,163,184,0.10)" />
            <stop offset="0.5" stopColor="rgba(186,230,253,0.22)" />
            <stop offset="1" stopColor="rgba(148,163,184,0.10)" />
          </linearGradient>
        </defs>
        <path d={`M ${cx - 280} 170 L ${cx + 280} 170 L ${cx + 50} 470 L ${cx + 50} 560 L ${cx - 50} 560 L ${cx - 50} 470 Z`} fill="url(#acrylic)" stroke={alpha(C.cyan, 0.55)} strokeWidth={3} />
        <ellipse cx={cx} cy={170} rx={280} ry={26} fill="none" stroke={alpha(C.cyan, 0.6)} strokeWidth={3} />
        {parts.map((p) => {
          const lt = (f - 30 - p.delay) / 70;
          if (lt < 0 || lt > 2.4) return null;
          let x: number;
          let y: number;
          let col = C.green;
          let op = 1;
          if (lt < 1) {
            const k = lt;
            const w = 260 * (1 - k) + 36 * k;
            x = cx + p.x * 2 * w * (1 - k * 0.3);
            y = 180 + k * 300;
          } else if (p.burn) {
            const k = lt - 1;
            x = cx + p.x * 60 + k * 420 + Math.sin(k * 6 + p.seed) * 30;
            y = 480 - k * 330 - Math.cos(p.seed) * 20;
            col = k < 0.2 ? C.orange : C.crimson;
            op = Math.max(0, 1 - k / 1.3);
          } else {
            const k = lt - 1;
            x = cx + p.x * 30;
            y = 480 + k * 170;
            op = k > 1 ? 0 : 1;
          }
          const r = p.burn && lt > 1 ? 5 + (lt - 1) * 14 : 5;
          return <circle key={p.seed} cx={x} cy={y} r={r} fill={col} opacity={op * (p.burn && lt > 1 ? 0.35 : 0.95)} style={{filter: `blur(${p.burn && lt > 1 ? 4 : 0}px)`}} />;
        })}
        <rect x={cx - 170} y={650} width={340} height={10} rx={5} fill={alpha(C.green, 0.4)} />
      </svg>
      <div style={{position: 'absolute', left: cx - 160, top: noteY, width: 320, opacity: noteO}}>
        <div style={{height: 110, borderRadius: 16, background: 'linear-gradient(135deg, #14532d, #22c55e)', display: 'grid', placeItems: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 48, boxShadow: `0 0 40px ${alpha(C.green, 0.6)}`}}>
          ₹ 5,000
        </div>
        <div style={{textAlign: 'center', fontFamily: MONO, fontSize: 20, marginTop: 8, color: C.green}}>MINIMUM DUE PAID</div>
      </div>
      <div style={{position: 'absolute', left: 1390, top: 90, width: 440, opacity: vis(frame, vapor)}}>
        <Glass accent={C.crimson}>
          <Label color={C.crimson}>Vaporized · 85%</Label>
          <div style={{fontSize: 30, fontWeight: 800, marginTop: 8}}>Revolving APR + 18% GST</div>
          <div style={{fontSize: 64, fontWeight: 900, color: C.crimson}}>
            −₹<Counter from={0} to={4130} start={vapor} end={vapor + 90} format={(n) => Math.round(n).toLocaleString('en-IN')} />
          </div>
        </Glass>
      </div>
      <div style={{position: 'absolute', left: 180, top: 520, width: 480, opacity: vis(frame, start + 150)}}>
        <Glass accent={C.green}>
          <Label color={C.green}>Reaches your principal</Label>
          <div style={{fontSize: 64, fontWeight: 900, color: C.green}}>₹870</div>
          <div style={{fontSize: 22, color: C.muted}}>The debt barely moves.</div>
        </Glass>
      </div>
      <Sfx at={start + 4} name="air_whoosh" volume={0.4} />
      <Sfx at={vapor - 6} name="vaporize" volume={0.5} />
    </>
  );
};

export const Scene01: React.FC = () => {
  const frame = useCurrentFrame();
  const D = sceneFrames(I);
  const c0 = contentStart(I);
  const cIntense = cueFrame(I, 'Within days');
  const cThreat = cueFrame(I, 'Messages that say');
  const cFunnel = cueFrame(I, 'And when we panic');
  const cFamilyCalls = cueFrame(I, 'Maybe your family');
  const cBreath = cueFrame(I, 'take a deep breath');
  const cStarts = cueFrame(I, 'It usually starts');
  const cSick = cueFrame(I, 'someone got sick');
  const cJob = cueFrame(I, 'lost your job');
  const cBiz = cueFrame(I, 'business slowed down');
  const cMiss = cueFrame(I, 'You miss one payment');
  const cApps = cueFrame(I, 'take loans from apps');
  const cGold = cueFrame(I, 'sell family gold');
  const cPay = cueFrame(I, 'Just to pay');
  const cMost = cueFrame(I, 'Most of that money');
  const cSteal = cueFrame(I, "You didn't steal");
  const cCheat = cueFrame(I, "You didn't cheat");
  const cHit = cueFrame(I, 'You just hit');
  const cBad = cueFrame(I, 'That does not make');
  const cHouse = cueFrame(I, 'No house');
  const cNoGold = cueFrame(I, 'No gold');
  const cLand = cueFrame(I, 'No land');
  const cPlanned = cueFrame(I, 'They planned for');
  const cFood = cueFrame(I, 'Food');
  const cMed = cueFrame(I, 'medicine');
  const cRent = cueFrame(I, 'rent');
  const cSchool = cueFrame(I, 'school fees');
  const cStarve = cueFrame(I, 'Never starve');
  const cNext = cueFrame(I, 'And step one');
  const cPivot = cueFrame(I, 'So listen to me');
  const cNode1 = cueFrame(I, 'Debt is a financial event');
  const cNode2 = cueFrame(I, 'Look at the business');
  const cRate = cueFrame(I, '42%');
  const cGolden = cueFrame(I, 'And remember the Golden');
  const cFamily = cueFrame(I, 'takes absolute priority');
  const sh = shake(frame, cFamily + 22, 12);

  return (
    <SceneShell index={I} duration={D} music="tension" tint={C.crimson} stageStyle={{translate: `${sh.x}px ${sh.y}px`}}>
      <Layer opacity={vis(frame, c0 - 10, cFunnel + 8)}>
        <PhoneBeat fortyFifty={cueFrame(I, 'Forty, maybe fifty')} start={c0} intense={cIntense} threats={cThreat} family={cFamilyCalls} breath={cBreath} starts={cStarts} sick={cSick} job={cJob} biz={cBiz} miss={cMiss} />
      </Layer>
      <Layer opacity={vis(frame, cFunnel, cPivot + 6)}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', opacity: vis(frame, cFunnel, cPay + 10)}}>
          <KLine at={cFunnel} size={64}>When we panic,</KLine>
          <KLine at={cFunnel + 22} size={64} color={C.crimson}>we make mistakes.</KLine>
        </div>
        <div style={{position: 'absolute', left: 120, top: 40, display: 'flex', flexDirection: 'column', gap: 14}}>
          <SpokenTile at={cApps} icon="₹" label="Loans from apps" color={C.crimson} width={250} />
          <SpokenTile at={cGold} icon="Au" label="Family gold sold" color={C.gold} width={250} />
        </div>
        <Sfx at={cApps} name="node_pop" volume={0.35} />
        <Sfx at={cGold} name="node_pop" volume={0.35} />
        <Sequence from={cPay} layout="none">
          <FunnelBeat start={0} vapor={cMost - cPay} />
        </Sequence>
      </Layer>
      <Layer opacity={vis(frame, cPivot, cGolden + 4)}>
        <div style={{position: 'absolute', left: 140, top: 60}}>
          <Reveal at={cPivot} from="top" distance={30}>
            <Label color={C.cyan}>Mental pivot #1</Label>
          </Reveal>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 290, textAlign: 'center', opacity: vis(frame, cPivot, cNode1 + 2)}}>
          <KLine at={cPivot + 2} size={86} mark={C.cyan}>Listen carefully.</KLine>
        </div>
        <Sfx at={cPivot + 2} name="air_whoosh" volume={0.25} />
        <svg width={1920} height={770} style={{position: 'absolute', inset: 0}}>
          <path d="M 151 180 L 151 400" stroke={alpha(C.cyan, 0.7)} strokeWidth={3} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - interpolate(frame, [cNode2 - 10, cNode2 + 8], [0, 1], CLAMP)} />
        </svg>
        <div style={{position: 'absolute', left: 140, top: 130}}>
          <PointCard
            at={cNode1}
            color={C.cyan}
            width={900}
            title={<>Debt is a financial event, <span style={{color: C.cyan}}>not a moral crime.</span></>}
            body="Default = economic breakdown from distress. Not a character flaw. Not a criminal act."
          />
        </div>
        <div style={{position: 'absolute', left: 140, top: 370}}>
          <PointCard
            at={cNode2}
            color={C.gold}
            width={900}
            title={<>Unsecured lending premium = <span style={{color: C.gold}}>42%–48% APR</span></>}
            body="No house, gold or land pledged. The high rate is the bank's built-in risk margin for defaults."
          />
        </div>
        <div style={{position: 'absolute', left: 1150, top: 90, display: 'flex', flexDirection: 'column', gap: 18}}>
          <KLine at={cSteal} size={58} out={cRate - 14}>You didn't steal.</KLine>
          <KLine at={cCheat} size={58} out={cRate - 14}>You didn't cheat.</KLine>
          <KLine at={cHit} size={46} color={C.cyan} out={cRate - 14} mark={C.cyan}>You hit a money problem.</KLine>
          <KLine at={cBad} size={40} color={C.muted} out={cRate - 14}>That's not a crime.</KLine>
        </div>
        <div style={{position: 'absolute', left: 1130, top: 40, width: 720, height: 470}}>
          <HeroCard3D
            at={cRate - 6}
            width={720}
            height={470}
            bank="UNSECURED"
            product="Credit Card"
            c1="#1c1917"
            c2="#78350f"
            amount="42–48%"
            amountLabel="INTEREST / YEAR"
            badge={{text: 'NO COLLATERAL', color: '#f5b942'}}
            size={2.7}
          />
        </div>
        <div style={{position: 'absolute', left: 1130, top: 490, width: 720, display: 'flex', justifyContent: 'center', gap: 14}}>
          {[
            {at: cHouse, t: 'No house'},
            {at: cNoGold, t: 'No gold'},
            {at: cLand, t: 'No land'},
          ].map((x) => (
            <Reveal key={x.t} at={x.at} from="bottom" distance={30}>
              <Tag color={C.gold} style={{fontSize: 22}}>✕ {x.t}</Tag>
            </Reveal>
          ))}
        </div>
        <div style={{position: 'absolute', left: 1130, top: 560, width: 720, textAlign: 'center'}}>
          <KLine at={cPlanned} size={30} color={C.gold}>Risk priced in from day one</KLine>
        </div>
        {[cSteal, cCheat, cHit, cBad].map((a, i) => (
          <Sfx key={i} at={a} name="air_whoosh" volume={0.22} />
        ))}
        {[cHouse, cNoGold, cLand].map((a, i) => (
          <Sfx key={i} at={a} name="tactile_click" volume={0.3} />
        ))}
        <Sfx at={cNode1} name="node_pop" volume={0.5} />
        <Sfx at={cNode1 + 6} name="air_whoosh" volume={0.35} />
        <Sfx at={cNode2} name="node_pop" volume={0.5} />
        <Sfx at={cNode2 + 6} name="air_whoosh" volume={0.35} />
        <Sfx at={cRate} name="counter_spin" volume={0.25} />
      </Layer>
      <Layer opacity={vis(frame, cGolden, D)}>
        <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 20, gap: 26}}>
          <Reveal at={cGolden} from="top" distance={200}>
            <div
              style={{
                padding: '40px 70px',
                borderRadius: 32,
                background: 'linear-gradient(135deg, rgba(120,83,15,0.55), rgba(30,24,10,0.8))',
                border: `3px solid ${C.gold}`,
                boxShadow: `0 0 80px ${alpha(C.gold, 0.35)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 50,
              }}
            >
              <FamilyIcon size={200} color={C.gold} />
              <div>
                <Label color={C.gold}>The Golden Rule</Label>
                <div style={{fontSize: 76, fontWeight: 900, lineHeight: 1.05, marginTop: 10}}>
                  FAMILY SURVIVAL
                  <span style={{color: C.gold}}> &gt; </span>
                  <br />
                  DEBT SERVICING
                </div>
              </div>
              <Check at={cFamily + 8} size={130} />
            </div>
          </Reveal>
          <div style={{display: 'flex', gap: 18}}>
            <SpokenTile at={cFood} doneAt={cMed} icon="F" label="Food" color={C.emerald} width={200} />
            <SpokenTile at={cMed} doneAt={cRent} icon="+" label="Medicine" color={C.emerald} width={200} />
            <SpokenTile at={cRent} doneAt={cSchool} icon="⌂" label="Rent" color={C.emerald} width={200} />
            <SpokenTile at={cSchool} doneAt={sentenceEnd(I, 'school fees')} icon="A" label="School fees" color={C.emerald} width={200} />
          </div>
          <KLine at={cStarve} size={34} color="#FCA5A5" mark={C.crimson}>Never starve your family to pay a card bill.</KLine>
        </div>
        <div style={{position: 'absolute', right: 70, bottom: 14}}>
          <NextChip at={cNext} text="What the law really says" />
        </div>
        {[cFood, cMed, cRent, cSchool].map((a, i) => (
          <Sfx key={i} at={a} name="node_pop" volume={0.35} />
        ))}
        <Sfx at={cGolden} name="air_whoosh" volume={0.4} />
        <Sfx at={cFamily + 22} name="sub_thud" volume={0.6} />
        <Sfx at={cFamily + 22} name="tactile_click" volume={0.55} />
      </Layer>
    </SceneShell>
  );
};

