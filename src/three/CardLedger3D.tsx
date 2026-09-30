import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {CLAMP} from '../lib/anim';
import {Glow, Scene3D} from './kit';
import {Card3D} from './Card3D';

export type LedgerCard = {bank: string; product: string; c1: string; c2: string; amount: string; tier: string; tierColor: string};

/** Module 3: the eight cards flip in as a 4x2 wall, each printed with its balance and tier; a scanner light sweeps across. */
export const CardLedger3D: React.FC<{cards: LedgerCard[]; start: number}> = ({cards, start}) => {
  const frame = useCurrentFrame();
  const f = frame - start;
  return (
    <Scene3D camera={{position: [Math.sin(f / 150) * 0.8, 0.3, 11.2 - Math.min(f, 200) / 200], lookAt: [0, -0.1, 0], fov: 38}}>
      <Wall cards={cards} start={start} frame={frame} />
    </Scene3D>
  );
};

const Wall: React.FC<{cards: LedgerCard[]; start: number; frame: number}> = ({cards, start, frame}) => {
  const {fps} = useVideoConfig();
  const scanX = interpolate(frame, [start + 36, start + 36 + cards.length * 22 + 10], [-8, 8], CLAMP);
  const scanning = scanX > -7.9 && scanX < 7.9;
  return (
    <>
      {cards.map((c, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const x = (col - 1.5) * 3.45;
        const y = row === 0 ? 1.3 : -1.25;
        const at = start + 40 + i * 22;
        const p = spring({frame: frame - at, fps, config: {mass: 0.9, stiffness: 120, damping: 14}});
        const lit = frame >= at;
        const pulse = c.tier === 'TIER 1' ? 0.25 * Math.abs(Math.sin(frame / 10)) : 0;
        return (
          <group key={i} position={[x, y + (1 - p) * -1.2, (1 - p) * -2]} rotation={[0.05, (1 - p) * Math.PI + Math.sin(frame / 55 + i) * 0.06, 0]} scale={1.8}>
            {lit && <Glow position={[0, 0, -0.3]} color={c.tierColor} scale={2.6} opacity={0.35 + pulse} />}
            <Card3D bank={c.bank} product={c.product} c1={c.c1} c2={c.c2} amount={c.amount} amountLabel="BALANCE" badge={{text: c.tier, color: c.tierColor}} />
          </group>
        );
      })}
      {scanning && (
        <group position={[scanX, 0, 1.2]}>
          <mesh>
            <boxGeometry args={[0.04, 6.4, 0.04]} />
            <meshBasicMaterial color="#e0f2fe" toneMapped={false} />
          </mesh>
          {new Array(9).fill(0).map((_, k) => (
            <Glow key={k} position={[0, -3 + k * 0.75, 0]} color="#38bdf8" scale={1.1} opacity={0.7} />
          ))}
        </group>
      )}
    </>
  );
};
