import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Backdrop} from '../components/SceneShell';
import {PORTFOLIO} from '../scenes/Scene03_Portfolio';
import {CardOrbit3D} from './CardOrbit3D';
import {FeeStack3D} from './FeeStack3D';
import {Phone3D} from './Phone3D';
import {Handcuffs3D} from './Handcuffs3D';
import {VaultDoor3D} from './VaultDoor3D';
import {Gauge3D} from './Gauge3D';
import {Vaults3D} from './Vaults3D';
import {interpolate, useCurrentFrame} from 'remotion';

const GaugeTest: React.FC = () => {
  const f = useCurrentFrame();
  return <Gauge3D score={interpolate(f, [0, 30, 60, 90], [780, 580, 580, 774], {extrapolateRight: 'clamp'})} width={620} height={384} />;
};

const Stage: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{position: 'absolute', top: 110, left: 0, width: 1920, height: 770}}>{children}</div>
);

/** Dev-only composition for iterating on 3D pieces without narration timing. */
export const Test3D: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />
    <Sequence durationInFrames={150}>
      <Stage>
        <CardOrbit3D cards={PORTFOLIO} start={0} cut={90} />
      </Stage>
    </Sequence>
    <Sequence from={150} durationInFrames={300}>
      <Stage>
        <FeeStack3D
          start={0}
          waive={220}
          bricks={[
            {label: 'Late fees', amount: '+₹7,200', color: '#F87171', at: 40, h: 0.6},
            {label: 'Finance charges', amount: '+₹22,400', color: '#EF4444', at: 70, h: 1.1},
            {label: 'Over-limit', amount: '+₹3,600', color: '#DC2626', at: 100, h: 0.47},
            {label: '18% GST', amount: '+₹5,976', color: '#B91C1C', at: 130, h: 0.55},
          ]}
        />
      </Stage>
    </Sequence>
    <Sequence from={450} durationInFrames={150}>
      <Stage>
        <Phone3D start={0} intense={60} />
      </Stage>
    </Sequence>
    <Sequence from={600} durationInFrames={120}>
      <Stage>
        <div style={{position: 'absolute', left: 100, top: 200}}>
          <Handcuffs3D smash={60} width={800} height={460} />
        </div>
      </Stage>
    </Sequence>
    <Sequence from={720} durationInFrames={150}>
      <Stage>
        <VaultDoor3D start={0} open={60} />
      </Stage>
    </Sequence>
    <Sequence from={870} durationInFrames={90}>
      <Stage>
        <div style={{position: 'absolute', left: 100, top: 60}}>
          <GaugeTest />
        </div>
      </Stage>
    </Sequence>
    <Sequence from={960} durationInFrames={240}>
      <Stage>
        <Vaults3D start={0} sweep={60} move={130} keep={190} />
      </Stage>
    </Sequence>
  </AbsoluteFill>
);
