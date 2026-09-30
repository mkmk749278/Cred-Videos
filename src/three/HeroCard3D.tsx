import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Glow, Scene3D} from './kit';
import {Card3D} from './Card3D';

type Props = {
  at: number;
  width: number;
  height: number;
  bank: string;
  product?: string;
  c1: string;
  c2: string;
  amount?: string;
  amountLabel?: string;
  badge?: {text: string; color: string};
  glow?: string;
  /** base scale of the card */
  size?: number;
  /** full flip-in rotation count */
  spins?: number;
  /** 3D internal resolution override (1 = full; use for stills) */
  dpr?: number;
};

/** One large card that flips in and then floats/sways — for spotlighting a key number or idea. */
export const HeroCard3D: React.FC<Props> = ({at, width, height, glow = '#f5b942', size = 2.2, spins = 1, dpr, ...card}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - at, fps, config: {mass: 1, stiffness: 70, damping: 13}});
  const t = frame - at;
  return (
    <Scene3D dpr={dpr} width={width} height={height} camera={{position: [0, 0.2, 7], lookAt: [0, 0, 0], fov: 34}} style={{maskImage: 'none', WebkitMaskImage: 'none'}}>
      <Glow position={[0, 0, -1]} color={glow} scale={6 * p} opacity={0.35 * p} />
      <group
        scale={size * Math.max(0.001, p)}
        rotation={[0.12 + Math.sin(t / 45) * 0.06, (1 - p) * Math.PI * 2 * spins + Math.sin(t / 60) * 0.28, -0.06 + Math.sin(t / 70) * 0.03]}
        position-y={Math.sin(t / 40) * 0.08}
      >
        <Card3D {...card} />
      </group>
    </Scene3D>
  );
};
