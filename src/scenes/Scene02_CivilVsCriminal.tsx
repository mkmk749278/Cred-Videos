import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT, MONO, alpha} from '../theme';
import {CLAMP, rnd, spr, vis} from '../lib/anim';
import {cueFrame, FPS, LEAD, sceneFrames} from '../lib/timing';
import {SceneShell} from '../components/SceneShell';
import {Check, Glass, Label, Layer, PointCard, Reveal, Sfx, shake, Stamp, Tag} from '../components/primitives';
import {Handcuffs, Person, Scales} from '../components/icons';

const I = 1;

const SHARDS = [
  [50, 50, 0, 0, 50, 0],
  [50, 50, 50, 0, 100, 0],
  [50, 50, 100, 0, 100, 40],
  [50, 50, 100, 40, 100, 100],
  [50, 50, 100, 100, 55, 100],
  [50, 50, 55, 100, 0, 100],
  [50, 50, 0, 100, 0, 55],
  [50, 50, 0, 55, 0, 0],
];

const ShatterCuffs: React.FC<{at: number}> = ({at}) => {
  const frame = useCurrentFrame();
  const f = frame - at;
  return (
    <div style={{position: 'relative', width: 300, height: 180}}>
      {SHARDS.map((s, i) => {
        const cx = (s[0] + s[2] + s[4]) / 3 - 50;
        const cy = (s[1] + s[3] + s[5]) / 3 - 50;
        const k = f > 0 ? f : 0;
        const dx = cx * k * 0.9 + (rnd(i) - 0.5) * k * 2;
        const dy = cy * k * 0.9 + 0.35 * k * k * 0.2;
        const rot = (rnd(i + 4) - 0.5) * k * 8;
        const o = f > 0 ? Math.max(0, 1 - f / 28) : 1;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              inset: 0,
              clipPath: `polygon(${s[0]}% ${s[1]}%, ${s[2]}% ${s[3]}%, ${s[4]}% ${s[5]}%)`,
              transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)`,
              opacity: o,
            }}
          >
            <Handcuffs size={300} />
          </div>
        );
      })}
    </div>
  );
};

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
  const c0 = LEAD * FPS;
  const cThreat = cueFrame(I, 'They invoke');
  const cContract = cueFrame(I, 'An unsecured credit card facility');
  const cRemedies = cueFrame(I, 'legal recourse');
  const cArrest = cueFrame(I, 'Indian criminal law');
  const cSC = cueFrame(I, 'Under established Supreme Court');
  const cHistory = cueFrame(I, 'If you maintained');
  const cPolice = cueFrame(I, 'Furthermore, police stations');
  const cSec = cueFrame(I, 'Pure credit card defaults');
  const smash = cArrest + 20;
  const sh = shake(frame, smash + 7, 16);
  const split = interpolate(frame, [c0 - 10, c0 + 20], [0, 1], CLAMP);
  const rightLit = interpolate(frame, [cContract, cContract + 20], [0.45, 1], CLAMP);

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
          <div style={{position: 'absolute', left: 150, top: 380}}>
            <ShatterCuffs at={smash + 7} />
          </div>
          {['“Section 420!”', '“Criminal breach of trust”', '“Police action today”'].map((t, i) => (
            <div key={i} style={{position: 'absolute', left: 520 - i * 60, top: 330 + i * 90, opacity: vis(frame, cThreat + i * 14, smash)}}>
              <Tag color={C.crimson} style={{fontFamily: FONT, textTransform: 'none', fontSize: 22, transform: `translateX(${Math.sin(frame * 0.9 + i) * 2}px)`}}>
                {t}
              </Tag>
            </div>
          ))}
          <div style={{position: 'absolute', left: 170, top: 400}}>
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
          <div style={{position: 'absolute', right: 90, top: 290, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-end'}}>
            {['Summary suit · Order 37 CPC', 'National Lok Adalat', 'Civil recovery litigation'].map((t, i) => (
              <Reveal key={t} at={cRemedies + 20 + i * 16} from="right" distance={60}>
                <Glass accent={C.royal} pad={16} style={{display: 'flex', alignItems: 'center', gap: 16, width: 430}}>
                  <Check at={cRemedies + 30 + i * 16} size={40} color="#60A5FA" />
                  <span style={{fontSize: 26, fontWeight: 700}}>{t}</span>
                </Glass>
              </Reveal>
            ))}
            <Reveal at={cRemedies + 90} from="right" distance={40}>
              <div style={{fontFamily: MONO, fontSize: 20, color: '#93C5FD', marginTop: 6}}>CIVIL REMEDIES ONLY</div>
            </Reveal>
          </div>
        </div>
        <svg width={1920} height={770} style={{position: 'absolute', inset: 0}}>
          <line x1={1920 * 0.58} y1={0} x2={1920 * 0.42} y2={770} stroke="#fff" strokeWidth={4} opacity={split * 0.8} style={{filter: 'drop-shadow(0 0 12px #fff)'}} />
        </svg>
        <Sfx at={c0} name="plasma_sweep" volume={0.3} />
        <Sfx at={cThreat} name="warning_pulse" volume={0.25} />
        {[0, 1, 2].map((i) => (
          <Sfx key={i} at={cRemedies + 30 + i * 16 + 20} name="tactile_click" volume={0.35} />
        ))}
        <Sfx at={smash + 6} name="stamp_heavy" volume={0.6} />
        <Sfx at={smash + 7} name="glass_shatter" volume={0.45} />
      </Layer>

      <Layer opacity={vis(frame, cSC, cPolice + 6)}>
        <div style={{position: 'absolute', left: 150, top: 40}}>
          <Reveal at={cSC} from="top" distance={30}>
            <Label color={C.gold}>Supreme Court precedents</Label>
          </Reveal>
        </div>
        <div style={{position: 'absolute', left: 150, top: 110, display: 'flex', flexDirection: 'column', gap: 34}}>
          <PointCard
            at={cSC + 6}
            color={C.gold}
            width={1400}
            index="01"
            title="Indian Oil Corp. v. NEPC India Ltd. (2006)"
            body="A later default is not criminal cheating unless dishonest intent existed at the very start."
            checkAt={cHistory + 20}
          />
          <PointCard
            at={cSC + 60}
            color={C.gold}
            width={1400}
            index="02"
            title="ICICI Bank v. Prakash Kaur (2007)"
            body="Banks cannot use muscle power or coercive methods to recover dues — only lawful process."
            checkAt={cHistory + 60}
          />
          <PointCard
            at={cHistory + 90}
            color={C.gold}
            width={1400}
            index="03"
            title="Normal repayment history before the crisis?"
            body="Past usage and repayments show there was no intent to cheat at inception."
            checkAt={cHistory + 120}
          />
        </div>
        <Sfx at={cSC + 6} name="node_pop" volume={0.45} />
        <Sfx at={cSC + 60} name="node_pop" volume={0.45} />
        <Sfx at={cHistory + 90} name="node_pop" volume={0.45} />
        {[20, 60, 120].map((d) => (
          <Sfx key={d} at={cHistory + d + 20} name="tactile_click" volume={0.5} />
        ))}
      </Layer>

      <Layer opacity={vis(frame, cPolice, D)}>
        <div style={{position: 'absolute', left: 110, top: 60}}>
          <Reveal at={cPolice} from="left">
            <PoliceBlueprint start={cPolice + 4} />
          </Reveal>
        </div>
        <div style={{position: 'absolute', left: 290, top: 300}}>
          <Stamp at={cPolice + 110} text={'CIVIL MATTER\nNOT A POLICE CASE'} color="#60A5FA" rotate={-6} size={46} />
        </div>
        <div style={{position: 'absolute', left: 1170, top: 90, width: 640, display: 'flex', flexDirection: 'column', gap: 24}}>
          <Reveal at={cPolice + 30} from="right">
            <Glass accent={C.royal}>
              <Label color="#93C5FD">Police are not recovery agents</Label>
              <div style={{fontSize: 30, fontWeight: 700, marginTop: 10, lineHeight: 1.3}}>A pure civil debt is not a police matter. No summons to the station over an unpaid card bill.</div>
            </Glass>
          </Reveal>
          <Reveal at={cSec} from="right">
            <Glass accent={C.gold}>
              <Label color={C.gold}>Sec 138 NI Act · Sec 25 PSSA</Label>
              <div style={{fontSize: 30, fontWeight: 700, marginTop: 10, lineHeight: 1.3}}>Apply to bounced cheques and failed auto-debit (NACH) mandates.</div>
              <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 14}}>
                <Check at={cSec + 40} size={44} />
                <span style={{fontSize: 26, color: C.muted}}>Usually not a pure credit card bill</span>
              </div>
            </Glass>
          </Reveal>
        </div>
        <Sfx at={cPolice + 84} name="block_slam" volume={0.4} />
        <Sfx at={cPolice + 116} name="stamp_heavy" volume={0.55} />
        <Sfx at={cSec + 60} name="tactile_click" volume={0.5} />
      </Layer>
    </SceneShell>
  );
};
