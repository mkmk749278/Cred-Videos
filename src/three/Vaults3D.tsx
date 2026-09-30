import React, {useMemo} from 'react';
import {RoundedBox} from '@react-three/drei';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import * as THREE from 'three';
import {CLAMP, inr} from '../lib/anim';
import {Floor, Glow, Scene3D, useCanvasTexture} from './kit';

const AX = -3.6;
const BX = 3.6;
const VY = -0.9;
const SRC: [number, number, number] = [0, 2.7, 0];

const Led: React.FC<{amount: number}> = ({amount}) => {
  const tex = useCanvasTexture(
    512,
    128,
    (g) => {
      g.fillStyle = '#020617';
      g.fillRect(0, 0, 512, 128);
      const c = amount > 0 ? '#22c55e' : '#ef4444';
      g.shadowColor = c;
      g.shadowBlur = 18;
      g.fillStyle = c;
      g.font = '800 72px JetBrains Mono';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText(`₹${inr(amount)}.00`, 256, 66);
    },
    amount,
  );
  return (
    <mesh position={[0, 0.95, 1.01]}>
      <planeGeometry args={[2.4, 0.6]} />
      <meshBasicMaterial map={tex} toneMapped={false} />
    </mesh>
  );
};

const Vault: React.FC<{x: number; accent: string; amount: number; hatch: number; wheel: number}> = ({x, accent, amount, hatch, wheel}) => (
  <group position={[x, VY, 0]}>
    <RoundedBox args={[3, 3, 2]} radius={0.12} smoothness={4}>
      <meshPhysicalMaterial color="#334155" metalness={0.85} roughness={0.35} clearcoat={0.5} />
    </RoundedBox>
    {/* accent trim */}
    <mesh position-z={1.005}>
      <planeGeometry args={[2.86, 2.86]} />
      <meshBasicMaterial color={accent} transparent opacity={0.1} />
    </mesh>
    <Led amount={amount} />
    {/* round door */}
    <group position={[0, -0.35, 1.02]}>
      <mesh rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.85, 0.85, 0.12, 64]} />
        <meshPhysicalMaterial color="#94a3b8" metalness={0.6} roughness={0.35} clearcoat={0.6} />
      </mesh>
      <mesh position-z={0.07}>
        <torusGeometry args={[0.85, 0.05, 12, 64]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.6} />
      </mesh>
      <group position-z={0.12} rotation-z={wheel}>
        {[0, 1, 2].map((k) => (
          <mesh key={k} rotation-z={(k * Math.PI) / 3}>
            <boxGeometry args={[0.9, 0.06, 0.06]} />
            <meshPhysicalMaterial color="#cbd5e1" metalness={1} roughness={0.2} />
          </mesh>
        ))}
      </group>
    </group>
    {/* roof hatch slides back when the claw arrives */}
    <mesh position={[0, 1.52, -hatch * 0.9]}>
      <boxGeometry args={[1.2, 0.06, 0.9]} />
      <meshPhysicalMaterial color="#1e293b" metalness={0.9} roughness={0.3} />
    </mesh>
  </group>
);

const Cash: React.FC<{position: [number, number, number]; scale?: number}> = ({position, scale = 1}) => (
  <group position={position} scale={scale}>
    {[0, 1, 2].map((i) => (
      <RoundedBox key={i} args={[0.8, 0.12, 0.42]} radius={0.02} position-y={i * 0.13}>
        <meshStandardMaterial color="#16a34a" emissive="#14532d" emissiveIntensity={0.5} roughness={0.6} />
      </RoundedBox>
    ))}
  </group>
);

/** A tube from the salary source to a vault, drawn progressively, with glowing packets flowing along it. */
const Pipe: React.FC<{to: number; progress: number; frame: number; opacity?: number}> = ({to, progress, frame, opacity = 1}) => {
  const {curve, geom} = useMemo(() => {
    const c = new THREE.CatmullRomCurve3([
      new THREE.Vector3(...SRC),
      new THREE.Vector3(to * 0.25, 2.5, 0.4),
      new THREE.Vector3(to * 0.8, 1.9, 0.4),
      new THREE.Vector3(to, 0.8, 0),
    ]);
    return {curve: c, geom: new THREE.TubeGeometry(c, 80, 0.11, 12, false)};
  }, [to]);
  const count = geom.index ? geom.index.count : 0;
  geom.setDrawRange(0, Math.floor(count * progress));
  if (progress <= 0 || opacity <= 0) return null;
  return (
    <>
      <mesh geometry={geom}>
        <meshPhysicalMaterial color="#b45309" metalness={0.9} roughness={0.3} emissive="#78350f" emissiveIntensity={0.4} transparent opacity={opacity} />
      </mesh>
      {progress > 0.98 &&
        [0, 0.25, 0.5, 0.75].map((o) => {
          const p = curve.getPoint((o + frame * 0.012) % 1);
          return <Glow key={o} position={[p.x, p.y, p.z + 0.15]} color="#fde68a" scale={0.55} opacity={opacity} />;
        })}
    </>
  );
};

/** Module 5: set-off claw empties the creditor vault; salary pipe re-routes to a shielded clean vault. */
export const Vaults3D: React.FC<{start: number; sweep: number; move: number; keep: number}> = ({start, sweep, move, keep}) => {
  const frame = useCurrentFrame();
  const f = frame - start;
  const cam: [number, number, number] = [Math.sin(f / 200) * 0.8, 2.2, 12.2 - Math.min(f, 300) / 300];
  return (
    <Scene3D camera={{position: cam, lookAt: [0, 0.35, 0], fov: 40}}>
      <Content frame={frame} start={start} sweep={sweep} move={move} keep={keep} />
    </Scene3D>
  );
};

const Content: React.FC<{frame: number; start: number; sweep: number; move: number; keep: number}> = ({frame, start, sweep, move, keep}) => {
  const {fps} = useVideoConfig();
  const riseA = spring({frame: frame - start, fps, config: {mass: 1, stiffness: 120, damping: 16}});
  const riseB = spring({frame: frame - start - 12, fps, config: {mass: 1, stiffness: 120, damping: 16}});
  const down = interpolate(frame, [sweep - 20, sweep + 10], [0, 1], CLAMP);
  const up = interpolate(frame, [sweep + 24, sweep + 70], [0, 1], CLAMP);
  const clawY = 6.5 - down * 5.3 + up * 3.2;
  const clamp = frame > sweep + 10;
  const hatch = interpolate(frame, [sweep - 24, sweep - 8], [0, 1], CLAMP) * (1 - interpolate(frame, [sweep + 50, sweep + 60], [0, 1], CLAMP));
  const amountA = Math.round(interpolate(frame, [sweep + 22, sweep + 60], [45000, 0], CLAMP));
  const route = interpolate(frame, [move + 20, move + 70], [0, 1], CLAMP);
  const shield = spring({frame: frame - move - 70, fps, config: {mass: 1, stiffness: 90, damping: 12}});
  const lockA = frame > keep + 10;
  return (
    <>
      <Floor y={VY - 1.5} size={22} />
      <group position-y={(1 - riseA) * -5} scale={riseA > 0.01 ? 1 : 0.001}>
        <Vault x={AX} accent={lockA ? '#ef4444' : '#f87171'} amount={amountA} hatch={hatch} wheel={frame * 0.01} />
        {lockA && (
          <group position={[AX, VY + 2.05, 0.4]}>
            <mesh>
              <boxGeometry args={[0.7, 0.55, 0.3]} />
              <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.6} />
            </mesh>
            <mesh position-y={0.4}>
              <torusGeometry args={[0.22, 0.06, 12, 24, Math.PI]} />
              <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.6} />
            </mesh>
          </group>
        )}
      </group>
      <group position-y={(1 - riseB) * -5} scale={riseB > 0.01 ? 1 : 0.001}>
        <Vault x={BX} accent="#38bdf8" amount={route > 0.98 ? 45000 : 0} hatch={0} wheel={-frame * 0.01} />
        {route > 0.98 && <Cash position={[BX, VY + 1.56, 0]} scale={0.9} />}
      </group>
      {/* salary pipes */}
      <Pipe to={AX} progress={1} frame={frame} opacity={1 - route} />
      <Pipe to={BX} progress={route} frame={frame} />
      <mesh position={SRC}>
        <sphereGeometry args={[0.28, 32, 16]} />
        <meshStandardMaterial color="#f5b942" emissive="#f59e0b" emissiveIntensity={0.8} metalness={0.6} roughness={0.3} />
      </mesh>
      <Glow position={SRC} color="#f5b942" scale={1.6} opacity={0.7} />
      {/* claw */}
      {frame > sweep - 22 && frame < sweep + 95 && (
        <group position={[AX, clawY, 0]}>
          <mesh position-y={2.6}>
            <cylinderGeometry args={[0.06, 0.06, 5, 12]} />
            <meshPhysicalMaterial color="#cbd5e1" metalness={1} roughness={0.2} />
          </mesh>
          <RoundedBox args={[0.9, 0.3, 0.5]} radius={0.05}>
            <meshPhysicalMaterial color="#64748b" metalness={1} roughness={0.25} />
          </RoundedBox>
          {[-1, 1].map((s) => (
            <group key={s} position={[s * 0.35, -0.15, 0]} rotation-z={s * (clamp ? 0.15 : -0.45)}>
              <mesh position-y={-0.35}>
                <boxGeometry args={[0.08, 0.7, 0.12]} />
                <meshPhysicalMaterial color="#cbd5e1" metalness={1} roughness={0.2} />
              </mesh>
            </group>
          ))}
          {up > 0 && <Cash position={[0, -0.75, 0]} scale={0.7} />}
        </group>
      )}
      {/* hex shield around the clean vault */}
      {shield > 0.01 && (
        <group position={[BX, VY + 0.1, 0]} scale={2.55 * shield}>
          <mesh rotation={[frame * 0.004, frame * 0.006, 0]}>
            <icosahedronGeometry args={[1, 2]} />
            <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.45 + 0.15 * Math.sin(frame / 8)} toneMapped={false} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.98, 48, 24]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.07} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        </group>
      )}
    </>
  );
};
