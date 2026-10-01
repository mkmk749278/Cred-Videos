import React, {useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import {interpolate} from '../lib/safeInterpolate';
import {CLAMP, rnd} from '../lib/anim';
import {Floor, Glow, Scene3D} from './kit';
import {Card3D} from './Card3D';

export type OrbitCard = {bank: string; product: string; c1: string; c2: string};

const LINKS = 9;

/** Module 3: eight cards orbit a "combined suit" hub; gold chains snap when the laser cuts them. */
export const CardOrbit3D: React.FC<{cards: OrbitCard[]; start: number; cut: number}> = ({cards, start, cut}) => {
  const frame = useCurrentFrame();
  const f = frame - start;
  const camA = f * 0.0025;
  const dolly = interpolate(f, [0, 120], [9.5, 7.6], CLAMP);
  const cam: [number, number, number] = [Math.sin(camA) * dolly, 1.9 + Math.sin(f / 90) * 0.2, Math.cos(camA) * dolly];
  return (
    <Scene3D camera={{position: cam, lookAt: [0, 0.05, 0], fov: 42}}>
      <OrbitContent cards={cards} start={start} cut={cut} frame={frame} />
    </Scene3D>
  );
};

const OrbitContent: React.FC<{cards: OrbitCard[]; start: number; cut: number; frame: number}> = ({cards, start, cut, frame}) => {
  const rot = (frame - start) * 0.006;
  const broken = frame - cut;
  const seeds = useMemo(() => cards.map((_, i) => new Array(LINKS).fill(0).map((__, k) => ({vx: rnd(i * 31 + k) - 0.5, vz: rnd(i * 17 + k + 3) - 0.5, spin: rnd(i + k * 7) * 6}))), [cards]);
  const hubPulse = 1 + 0.06 * Math.sin(frame / 8);
  const hubFade = broken > 0 ? Math.max(0.15, 1 - broken / 25) : 1;
  const laserX = interpolate(broken, [-6, 10], [-9, 9], CLAMP);
  return (
    <>
      <Floor y={-1.7} />
      {/* hub */}
      <mesh scale={0.55 * hubPulse}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#f5b942" emissive="#f59e0b" emissiveIntensity={0.9 * hubFade} wireframe transparent opacity={hubFade} />
      </mesh>
      <Glow color="#f5b942" scale={3 * hubPulse} opacity={0.55 * hubFade} />
      {cards.map((c, i) => {
        const a = (i / cards.length) * Math.PI * 2 + rot;
        const x = Math.cos(a) * 3.7;
        const z = Math.sin(a) * 2.6;
        const y = 0.15 + Math.sin(frame / 40 + i) * 0.12;
        const appear = interpolate(frame, [start + i * 5, start + i * 5 + 20], [0, 1], CLAMP);
        const chainDraw = interpolate(frame, [start + 20 + i * 5, start + 50 + i * 5], [0, 1], CLAMP);
        return (
          <React.Fragment key={i}>
            <group position={[x, y, z]} scale={appear} rotation={[0.08, -a + Math.PI / 2 + Math.sin(frame / 60 + i) * 0.2, 0]}>
              <Card3D bank={c.bank} product={c.product} c1={c.c1} c2={c.c2} />
            </group>
            {/* chain links from hub to card */}
            {new Array(LINKS).fill(0).map((_, k) => {
              const t = (k + 1) / (LINKS + 1);
              if (t > chainDraw) return null;
              const s = seeds[i][k];
              let px = x * t;
              let py = y * t;
              let pz = z * t;
              let rx = 0;
              let op = 1;
              if (broken > 0) {
                const tt = broken / 30;
                px += s.vx * tt * 2;
                pz += s.vz * tt * 2;
                py -= 4.9 * tt * tt * 1.2;
                rx = s.spin * tt;
                op = Math.max(0, 1 - broken / 40);
              }
              if (op <= 0) return null;
              return (
                <mesh key={k} position={[px, py, pz]} rotation={[rx + (k % 2) * Math.PI / 2, -a, rx]} scale={0.12}>
                  <torusGeometry args={[1, 0.28, 10, 20]} />
                  <meshStandardMaterial color="#f5b942" metalness={1} roughness={0.25} emissive="#7c4a03" emissiveIntensity={0.3} transparent opacity={op} />
                </mesh>
              );
            })}
          </React.Fragment>
        );
      })}
      {/* laser sweep */}
      {broken > -6 && broken < 16 && (
        <group position={[laserX, 0.2, 1.2]} rotation-z={0.3}>
          <mesh>
            <cylinderGeometry args={[0.03, 0.03, 7, 12]} />
            <meshBasicMaterial color="#fff1f1" />
          </mesh>
          {new Array(11).fill(0).map((_, k) => (
            <Glow key={k} position={[0, -3 + k * 0.6, 0]} color="#ef4444" scale={0.9} opacity={0.8} />
          ))}
        </group>
      )}
    </>
  );
};
