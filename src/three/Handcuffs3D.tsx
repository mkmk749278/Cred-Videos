import React, {useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import {rnd} from '../lib/anim';
import {Glow, Scene3D} from './kit';

const Chrome: React.FC<{color?: string; opacity?: number}> = ({color = '#e2e8f0', opacity = 1}) => (
  <meshPhysicalMaterial color={color} metalness={0.92} roughness={0.16} clearcoat={1} envMapIntensity={2.6} transparent={opacity < 1} opacity={opacity} />
);

/** Module 2: chrome handcuffs rotating slowly, then shattering into shards when the stamp hits. */
export const Handcuffs3D: React.FC<{smash: number; width: number; height: number}> = ({smash, width, height}) => {
  const frame = useCurrentFrame();
  return (
    <Scene3D width={width} height={height} camera={{position: [0, 0.6, 6], lookAt: [0, 0, 0], fov: 38}} exposure={1.35}>
      <pointLight position={[2, 3, 4]} intensity={30} color="#ffffff" />
      <pointLight position={[-3, -1, 3]} intensity={18} color="#fca5a5" />
      <Cuffs frame={frame} smash={smash} />
    </Scene3D>
  );
};

const Cuffs: React.FC<{frame: number; smash: number}> = ({frame, smash}) => {
  const t = frame - smash;
  const spin = frame * 0.012;
  const shards = useMemo(
    () =>
      new Array(90).fill(0).map((_, i) => {
        const side = i % 2 ? 1 : -1;
        const a = rnd(i) * Math.PI * 2;
        return {
          p: [side * 1.05 + Math.cos(a) * 0.85, Math.sin(a) * 0.85, (rnd(i + 3) - 0.5) * 0.3] as [number, number, number],
          v: [Math.cos(a) * (1 + rnd(i + 5) * 2) + side * 0.6, Math.sin(a) * (1 + rnd(i + 7) * 2) + 1, (rnd(i + 9) - 0.2) * 3] as [number, number, number],
          r: rnd(i + 11) * 10,
          s: 0.08 + rnd(i + 13) * 0.14,
        };
      }),
    [],
  );
  if (t < 0) {
    return (
      <group rotation={[0.35 + Math.sin(frame / 50) * 0.08, spin, 0]}>
        {[-1.05, 1.05].map((x) => (
          <group key={x} position-x={x}>
            <mesh>
              <torusGeometry args={[0.85, 0.13, 24, 64]} />
              <Chrome />
            </mesh>
            <mesh position={[x > 0 ? -0.62 : 0.62, 0.62, 0]} rotation-z={x > 0 ? 0.8 : -0.8}>
              <boxGeometry args={[0.38, 0.22, 0.24]} />
              <Chrome color="#cbd5e1" />
            </mesh>
          </group>
        ))}
        {[-0.24, 0, 0.24].map((x, i) => (
          <mesh key={x} position={[x, 1.02, 0]} rotation-y={i % 2 ? Math.PI / 2 : 0}>
            <torusGeometry args={[0.13, 0.04, 12, 24]} />
            <Chrome />
          </mesh>
        ))}
      </group>
    );
  }
  const tt = t / 30;
  return (
    <group rotation={[0.35, spin, 0]}>
      {t < 10 && <Glow color="#ffffff" scale={4 * (1 - t / 10) + 1} opacity={1 - t / 10} />}
      {shards.map((s, i) => {
        const o = Math.max(0, 1 - t / 34);
        if (o <= 0) return null;
        return (
          <mesh
            key={i}
            position={[s.p[0] + s.v[0] * tt, s.p[1] + s.v[1] * tt - 5 * tt * tt, s.p[2] + s.v[2] * tt]}
            rotation={[s.r * tt, s.r * tt * 0.7, s.r]}
            scale={s.s}
          >
            <tetrahedronGeometry args={[1, 0]} />
            <Chrome opacity={o} />
          </mesh>
        );
      })}
    </group>
  );
};
