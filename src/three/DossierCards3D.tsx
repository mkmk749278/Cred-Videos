import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Glow, Scene3D} from './kit';
import {Card3D} from './Card3D';

export type DossierCard = {bank: string; c1: string; c2: string; amount?: string; badge: {text: string; color: string}; at: number; x: number; y: number};

/**
 * Module 10: one card per lender, flipping in as it is named. Uses a long, narrow-FOV camera so pixel
 * positions (x, y = card centre inside the viewport) map almost linearly onto the 2D grid below.
 */
export const DossierCards3D: React.FC<{cards: DossierCard[]; width: number; height: number; cardPx: number}> = ({cards, width, height, cardPx}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fov = 13;
  const dist = 30;
  const unit = (2 * dist * Math.tan(((fov / 2) * Math.PI) / 180)) / height;
  const scale = (cardPx * unit) / 1.7;
  return (
    <Scene3D width={width} height={height} dpr={1} camera={{position: [0, 0, dist], lookAt: [0, 0, 0], fov}} style={{maskImage: 'none', WebkitMaskImage: 'none'}}>
      {cards.map((c, i) => {
        const p = spring({frame: frame - c.at, fps, config: {mass: 0.9, stiffness: 110, damping: 13}});
        if (frame < c.at) return null;
        const wx = (c.x - width / 2) * unit;
        const wy = -(c.y - height / 2) * unit;
        return (
          <group key={i} position={[wx, wy, 0]} scale={scale} rotation={[0.04, (1 - p) * Math.PI + Math.sin(frame / 50 + i) * 0.1, 0]}>
            <Glow position={[0, 0, -0.4]} color={c.c2} scale={2.4} opacity={0.3 * p} />
            <Card3D bank={c.bank} c1={c.c1} c2={c.c2} amount={c.amount} amountLabel={c.amount ? 'REPORTED' : undefined} badge={c.badge} />
          </group>
        );
      })}
    </Scene3D>
  );
};
