import React from 'react';
import {RoundedBox} from '@react-three/drei';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {interpolate} from '../lib/safeInterpolate';
import {CLAMP} from '../lib/anim';
import {Glow, Scene3D} from './kit';

const Steel: React.FC<{color?: string}> = ({color = '#94a3b8'}) => <meshPhysicalMaterial color={color} metalness={1} roughness={0.3} clearcoat={0.6} />;
const Gold: React.FC = () => <meshPhysicalMaterial color="#f5b942" metalness={1} roughness={0.22} emissive="#7c4a03" emissiveIntensity={0.35} />;

/** Module 9: a round bank-vault door unlocks (wheel spins) and swings open onto glowing gold. */
export const VaultDoor3D: React.FC<{start: number; open: number}> = ({start, open}) => {
  const frame = useCurrentFrame();
  const f = frame - start;
  const push = interpolate(f, [0, 200], [9.5, 7.8], CLAMP);
  return (
    <Scene3D camera={{position: [1.2, 0.5, push], lookAt: [0, -0.3, 0], fov: 38}} env="warm">
      <Vault frame={frame} open={open} />
    </Scene3D>
  );
};

const Vault: React.FC<{frame: number; open: number}> = ({frame, open}) => {
  const {fps} = useVideoConfig();
  const unlock = interpolate(frame, [open - 40, open], [0, Math.PI * 1.5], CLAMP);
  const swing = spring({frame: frame - open, fps, config: {mass: 2.2, stiffness: 50, damping: 16}});
  const light = interpolate(frame, [open, open + 40], [0, 1], CLAMP);
  const R = 1.55;
  return (
    <group position-y={-0.8} scale={0.62}>
      {/* wall */}
      <RoundedBox args={[6.5, 4.6, 0.6]} radius={0.08} position-z={-0.35}>
        <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.38} />
      </RoundedBox>
      {/* brushed steel trim + rivets so the wall reads as a vault, not a flat panel */}
      {[[0, 2.2, 6.3, 0.14], [0, -2.2, 6.3, 0.14], [3.1, 0, 0.14, 4.3], [-3.1, 0, 0.14, 4.3]].map(([x, y, w, h], i) => (
        <mesh key={`t${i}`} position={[x, y, 0]}>
          <boxGeometry args={[w, h, 0.08]} />
          <Steel color="#94a3b8" />
        </mesh>
      ))}
      {[-2.8, -1.4, 1.4, 2.8].flatMap((x) => [1.95, -1.95].map((y) => [x, y])).concat([[-2.8, 0], [2.8, 0]]).map(([x, y], i) => (
        <mesh key={`r${i}`} position={[x, y, 0.02]}>
          <sphereGeometry args={[0.09, 16, 12]} />
          <Steel color="#e2e8f0" />
        </mesh>
      ))}
      {/* frame ring */}
      <mesh position-z={0.02}>
        <torusGeometry args={[R + 0.12, 0.14, 24, 96]} />
        <Steel color="#cbd5e1" />
      </mesh>
      {/* inside: glowing gold */}
      <mesh position-z={-0.03}>
        <circleGeometry args={[R, 64]} />
        <meshBasicMaterial color="#fbbf24" toneMapped={false} transparent opacity={0.15 + light * 0.85} />
      </mesh>
      {light > 0 &&
        [
          [-0.6, -0.9], [0, -0.9], [0.6, -0.9], [-0.3, -0.62], [0.3, -0.62], [0, -0.34],
        ].map(([x, y], i) => (
          <RoundedBox key={i} args={[0.56, 0.26, 0.5]} radius={0.03} position={[x, y, 0.1]}>
            <Gold />
          </RoundedBox>
        ))}
      <Glow position={[0, 0, 0.5]} color="#fbbf24" scale={2 + light * 7} opacity={light * 0.9} />
      {/* the door, hinged on its left edge */}
      <group position={[-R, 0, 0.14]} rotation-y={-swing * 1.95}>
        <group position-x={R}>
          <mesh rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[R, R, 0.32, 96]} />
            <Steel />
          </mesh>
          <mesh position-z={0.165}>
            <ringGeometry args={[R * 0.72, R * 0.78, 96]} />
            <meshStandardMaterial color="#475569" metalness={1} roughness={0.4} />
          </mesh>
          {/* locking bolts */}
          {new Array(12).fill(0).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(a) * R * 0.88, Math.sin(a) * R * 0.88, 0.17]} rotation-x={Math.PI / 2}>
                <cylinderGeometry args={[0.07, 0.07, 0.06, 20]} />
                <Steel color="#e2e8f0" />
              </mesh>
            );
          })}
          {/* wheel */}
          <group position-z={0.3} rotation-z={unlock}>
            <mesh>
              <torusGeometry args={[0.55, 0.05, 16, 64]} />
              <Gold />
            </mesh>
            {[0, 1, 2].map((k) => (
              <mesh key={k} rotation-z={(k * Math.PI) / 3}>
                <boxGeometry args={[1.1, 0.07, 0.07]} />
                <Gold />
              </mesh>
            ))}
            <mesh rotation-x={Math.PI / 2}>
              <cylinderGeometry args={[0.14, 0.14, 0.12, 32]} />
              <Gold />
            </mesh>
          </group>
          {/* hinge */}
          <mesh position={[-R, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 1.4, 24]} />
            <Steel color="#cbd5e1" />
          </mesh>
        </group>
      </group>
    </group>
  );
};
