import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {C, MONO, alpha} from '../theme';
import {spr, vis} from '../lib/anim';
import {cueFrame, FPS, LEAD, sceneFrames} from '../lib/timing';
import {SceneShell} from '../components/SceneShell';
import {Glass, Label, Sfx, Tag} from '../components/primitives';

const I = 9;

type Dossier = {bank: string; tactic: string; range: [number, number] | null; color: string; cue: string; offset?: number};

const DOSSIERS: Dossier[] = [
  {bank: 'SBI Card', tactic: 'Automated legal notices · recovery desks · Lok Adalat', range: [30, 40], color: '#0ea5e9', cue: 'SBI Card reportedly'},
  {bank: 'HDFC Bank', tactic: 'Set-off enforced · keep savings at ₹0 · PNO settlements ~month 6', range: [25, 35], color: '#2563eb', cue: 'HDFC Bank is known'},
  {bank: 'ICICI Bank', tactic: 'Strict governance · prefers formal judicial conciliation', range: null, color: '#f97316', cue: 'ICICI Bank reportedly'},
  {bank: 'Axis Bank', tactic: 'Fast move to agencies → stressed-asset desk', range: [25, 35], color: '#db2777', cue: 'Axis, YES, and Kotak'},
  {bank: 'YES Bank', tactic: 'Agent messaging → stressed-asset desk', range: [25, 35], color: '#3b82f6', cue: 'Axis, YES, and Kotak', offset: 14},
  {bank: 'Kotak Mahindra', tactic: 'Early predictive calling → stressed-asset desk', range: [25, 35], color: '#ef4444', cue: 'Axis, YES, and Kotak', offset: 28},
  {bank: 'RBL Bank', tactic: 'Persistent calling · larger haircuts after PNO complaint', range: [20, 30], color: '#8b5cf6', cue: 'RBL Bank has'},
  {bank: 'IDFC FIRST', tactic: 'Digitized recovery · structured post write-off', range: null, color: '#b91c1c', cue: 'And IDFC FIRST'},
];

const Card: React.FC<{d: Dossier; at: number; done: boolean}> = ({d, at, done}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spr(frame, fps, at);
  const flip = frame < at ? 90 : (1 - p) * 90;
  return (
    <div style={{width: 400, height: 300, perspective: 1200}}>
      <div style={{transform: `rotateY(${flip}deg)`, opacity: frame < at ? 0.08 : 1, transformOrigin: 'left center'}}>
        <Glass accent={d.color} pad={22} style={{height: 300, display: 'flex', flexDirection: 'column', boxSizing: 'border-box'}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <div style={{fontSize: 32, fontWeight: 900}}>{d.bank}</div>
            <div style={{width: 16, height: 16, borderRadius: 8, background: done ? C.green : alpha(C.muted, 0.4), boxShadow: done ? `0 0 12px ${C.green}` : undefined}} />
          </div>
          <div style={{height: 4, width: 60, background: d.color, borderRadius: 2, margin: '10px 0 14px'}} />
          <div style={{fontSize: 22, color: C.muted, lineHeight: 1.35, flex: 1}}>{d.tactic}</div>
          {d.range ? (
            <div>
              <div style={{fontFamily: MONO, fontSize: 16, color: C.muted, letterSpacing: 1}}>REPORTED SETTLEMENT RANGE</div>
              <div style={{position: 'relative', height: 16, background: '#1e293b', borderRadius: 8, marginTop: 8}}>
                <div style={{position: 'absolute', left: `${d.range[0] * 2}%`, width: `${(d.range[1] - d.range[0]) * 2 * p}%`, top: 0, bottom: 0, background: d.color, borderRadius: 8}} />
              </div>
              <div style={{fontFamily: MONO, fontSize: 26, fontWeight: 800, marginTop: 6}}>
                ~{d.range[0]}–{d.range[1]}%
              </div>
            </div>
          ) : (
            <Tag color={d.color} style={{fontSize: 16, alignSelf: 'flex-start'}}>Formal / structured process</Tag>
          )}
        </Glass>
      </div>
    </div>
  );
};

export const Scene10: React.FC = () => {
  const frame = useCurrentFrame();
  const D = sceneFrames(I);
  const c0 = LEAD * FPS;
  const ats = DOSSIERS.map((d) => cueFrame(I, d.cue) + (d.offset ?? 0));
  const cEnd = ats[7] + 90;
  return (
    <SceneShell index={I} duration={D} music="analytic" tint={C.royal}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: vis(frame, c0)}}>
        <Label color={C.gold} style={{fontSize: 22}}>Reported borrower experiences · rough patterns, not guarantees · may vary</Label>
      </div>
      <div style={{position: 'absolute', left: 115, top: 60, display: 'grid', gridTemplateColumns: 'repeat(4, 400px)', gap: 30, rowGap: 30}}>
        {DOSSIERS.map((d, i) => (
          <Card key={d.bank} d={d} at={ats[i]} done={frame >= cEnd + i * 4} />
        ))}
      </div>
      {ats.map((a, i) => (
        <Sfx key={i} at={a} name="card_slide" volume={0.4} />
      ))}
      <Sfx at={cEnd} name="grid_lock" volume={0.45} />
    </SceneShell>
  );
};
