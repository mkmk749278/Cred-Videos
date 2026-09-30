import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, MONO, alpha} from '../theme';
import {vis} from '../lib/anim';
import {contentStart, cueFrame, sceneFrames} from '../lib/timing';
import {SceneShell} from '../components/SceneShell';
import {Glass, KLine, Label, Sfx} from '../components/primitives';
import {DossierCards3D} from '../three/DossierCards3D';

const I = 9;
const GRID_W = 4 * 400 + 3 * 30;
const GRID_H = 2 * 330 + 26;

type Dossier = {bank: string; tactic: string; range: [number, number] | null; color: string; c1: string; cue: string; offset?: number};

const DOSSIERS: Dossier[] = [
  {bank: 'SBI Card', c1: '#1e3a8a', tactic: 'Automated legal notices · recovery desks · Lok Adalat', range: [30, 40], color: '#0ea5e9', cue: 'SBI Card reportedly'},
  {bank: 'HDFC Bank', c1: '#0f172a', tactic: 'Set-off enforced · keep savings at ₹0 · PNO settlements ~month 6', range: [25, 35], color: '#2563eb', cue: 'HDFC Bank is known'},
  {bank: 'ICICI Bank', c1: '#7c2d12', tactic: 'Strict governance · prefers formal judicial conciliation', range: null, color: '#f97316', cue: 'ICICI Bank reportedly'},
  {bank: 'Axis Bank', c1: '#831843', tactic: 'Fast move to agencies → stressed-asset desk', range: [25, 35], color: '#db2777', cue: 'Axis, YES, and Kotak'},
  {bank: 'YES Bank', c1: '#1e3a8a', tactic: 'Agent messaging → stressed-asset desk', range: [25, 35], color: '#3b82f6', cue: 'Axis, YES, and Kotak', offset: 14},
  {bank: 'Kotak Mahindra', c1: '#7f1d1d', tactic: 'Early predictive calling → stressed-asset desk', range: [25, 35], color: '#ef4444', cue: 'Axis, YES, and Kotak', offset: 28},
  {bank: 'RBL Bank', c1: '#312e81', tactic: 'Persistent calling · larger haircuts after PNO complaint', range: [20, 30], color: '#8b5cf6', cue: 'RBL Bank has'},
  {bank: 'IDFC FIRST', c1: '#7f1d1d', tactic: 'Digitized recovery · structured post write-off', range: null, color: '#b91c1c', cue: 'And IDFC FIRST'},
];

const CELL_W = 400;
const CELL_H = 330;
const GAP_X = 30;
const GAP_Y = 26;
const CARD_TOP = 102; // card centre, px from the cell top

const Cell: React.FC<{d: Dossier; at: number; until: number; done: boolean}> = ({d, at, until, done}) => {
  const frame = useCurrentFrame();
  const o = vis(frame, at + 6);
  return (
    <div style={{width: CELL_W, height: CELL_H, position: 'relative'}}>
      <Glass
        accent={frame >= at ? d.color : undefined}
        pad={0}
        style={{
          position: 'absolute',
          inset: 0,
          opacity: frame >= at ? 1 : 0.25,
          // the bank being talked about right now glows
          boxShadow: frame >= at && frame < until ? `0 0 ${34 + 10 * Math.sin(frame / 7)}px ${alpha(d.color, 0.55)}, 0 30px 80px rgba(0,0,0,0.45)` : undefined,
          border: frame >= at && frame < until ? `2.5px solid ${d.color}` : undefined,
        }}
      />
      <div style={{position: 'absolute', right: 16, top: 14, width: 14, height: 14, borderRadius: 7, background: done ? C.green : alpha(C.muted, 0.4), boxShadow: done ? `0 0 12px ${C.green}` : undefined}} />
      <div style={{position: 'absolute', left: 22, right: 22, top: 200, opacity: o}}>
        <div style={{fontSize: 21, color: C.muted, lineHeight: 1.35}}>{d.tactic}</div>
      </div>
    </div>
  );
};

export const Scene10: React.FC = () => {
  const frame = useCurrentFrame();
  const D = sceneFrames(I);
  const c0 = contentStart(I);
  const cRough = cueFrame(I, 'rough patterns');
  const ats = DOSSIERS.map((d) => cueFrame(I, d.cue) + (d.offset ?? 0));
  const cEnd = ats[7] + 90;
  return (
    <SceneShell index={I} duration={D} music="analytic" tint={C.royal}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', opacity: vis(frame, c0)}}>
        <Label color={C.gold} style={{fontSize: 22}}>Reported borrower experiences · rough patterns, not guarantees · may vary</Label>
      </div>
      <div style={{position: 'absolute', left: 115, top: 50, display: 'grid', gridTemplateColumns: `repeat(4, ${CELL_W}px)`, columnGap: GAP_X, rowGap: GAP_Y}}>
        {DOSSIERS.map((d, i) => (
          <Cell key={d.bank} d={d} at={ats[i]} until={ats[i + 1] ?? cEnd} done={frame >= cEnd + i * 4} />
        ))}
      </div>
      <div style={{position: 'absolute', left: 115, top: 50, width: GRID_W, height: GRID_H}}>
        <DossierCards3D
          width={GRID_W}
          height={GRID_H}
          cardPx={268}
          cards={DOSSIERS.map((d, i) => ({
            bank: d.bank.replace(' Mahindra', ''),
            c1: d.c1,
            c2: d.color,
            amount: d.range ? `~${d.range[0]}–${d.range[1]}%` : undefined,
            badge: d.range ? {text: 'SETTLEMENT', color: '#e2e8f0'} : {text: 'FORMAL PROCESS', color: '#fde68a'},
            at: ats[i],
            x: (i % 4) * (CELL_W + GAP_X) + CELL_W / 2,
            y: Math.floor(i / 4) * (CELL_H + GAP_Y) + CARD_TOP,
          }))}
        />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', opacity: vis(frame, cRough, ats[0])}}>
        <KLine at={cRough} size={56} color={C.gold}>Rough patterns, not promises.</KLine>
      </div>
      {ats.map((a, i) => (
        <Sfx key={i} at={a} name="card_slide" volume={0.4} />
      ))}
      <Sfx at={cEnd} name="grid_lock" volume={0.45} />
    </SceneShell>
  );
};
