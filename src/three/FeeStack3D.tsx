import React, {useMemo} from 'react';
import {RoundedBox} from '@react-three/drei';
import {useCurrentFrame} from 'remotion';
import {interpolate} from '../lib/safeInterpolate';
import * as THREE from 'three';
import {CLAMP, rnd} from '../lib/anim';
import {Floor, Glow, Scene3D, useCanvasTexture} from './kit';
import {Card3D} from './Card3D';

type Brick = {label: string; amount: string; color: string; at: number; h: number};

const W = 2.6;
const D = 1.8;

const LabelPlane: React.FC<{text: string; sub?: string; w: number; h: number; color?: string; y?: number}> = ({text, sub, w, h, color = '#ffffff'}) => {
  const tex = useCanvasTexture(
    1024,
    Math.round((1024 * h) / w),
    (g) => {
      const H = Math.round((1024 * h) / w);
      g.fillStyle = color;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      const size = Math.min(H * 0.42, 110);
      g.font = `900 ${size}px Inter`;
      g.fillText(text, 512, sub ? H * 0.4 : H / 2);
      if (sub) {
        g.globalAlpha = 0.85;
        g.font = `700 ${size * 0.55}px JetBrains Mono`;
        g.fillText(sub, 512, H * 0.74);
      }
    },
    text + (sub ?? ''),
  );
  return (
    <mesh position-z={D / 2 + 0.005}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={tex} transparent toneMapped={false} />
    </mesh>
  );
};

/** Module 4: principal block + penalty bricks that crash down, then a golden laser dissolves them. */
export const FeeStack3D: React.FC<{start: number; bricks: Brick[]; waive: number; width?: number}> = ({start, bricks, waive, width = 1150}) => {
  const frame = useCurrentFrame();
  const f = frame - start;
  const ang = interpolate(f, [0, 1800], [-0.55, 0.35], CLAMP) + Math.sin(f / 120) * 0.04;
  const r = interpolate(f, [0, 90], [10.5, 8.6], CLAMP);
  return (
    <Scene3D width={width} camera={{position: [Math.sin(ang) * r, 3.4, Math.cos(ang) * r], lookAt: [0, 1.5, 0], fov: 40}}>
      <Stack frame={frame} start={start} bricks={bricks} waive={waive} />
    </Scene3D>
  );
};

const Stack: React.FC<{frame: number; start: number; bricks: Brick[]; waive: number}> = ({frame, start, bricks, waive}) => {
  const baseH = 1.3;
  const grow = interpolate(frame, [start + 10, start + 30], [0.02, 1], CLAMP);
  const sweepY = interpolate(frame, [waive - 30, waive + 30], [6.5, -0.2], CLAMP);
  const sweeping = frame > waive - 32 && frame < waive + 34;
  const sparks = useMemo(() => new Array(140).fill(0).map((_, i) => ({x: (rnd(i) - 0.5) * W, z: (rnd(i + 5) - 0.5) * D, y: rnd(i + 9), v: 0.6 + rnd(i + 2)})), []);
  let z = baseH;
  const topAll = baseH + bricks.reduce((a, b) => a + b.h + 0.04, 0);
  return (
    <>
      <Floor y={-0.12} size={12} />
      {/* the credit card the debt sits on */}
      <group rotation-x={-Math.PI / 2} position-y={-0.04} scale={2.15}>
        <Card3D bank="MY CARD" product="Blocked · no new spends" c1="#1e3a8a" c2="#0ea5e9" />
      </group>
      {/* principal block */}
      <group position-y={(baseH * grow) / 2} scale-y={grow}>
        <RoundedBox args={[W, baseH, D]} radius={0.04}>
          <meshPhysicalMaterial color="#16a34a" emissive="#14532d" emissiveIntensity={0.4} metalness={0.1} roughness={0.25} transmission={0} clearcoat={1} transparent opacity={0.92} />
        </RoundedBox>
        <LabelPlane text="₹1,00,000" sub="WHAT YOU SPENT" w={W * 0.9} h={baseH * 0.6} />
      </group>
      {bricks.map((b, i) => {
        const y0 = z + b.h / 2;
        z += b.h + 0.04;
        const t = frame - b.at;
        if (t < 0) return null;
        const drop = interpolate(t, [0, 10, 14, 18], [6, 0, 0.18, 0], CLAMP);
        // the laser moves linearly 6.5 -> -0.2 over waive-30..waive+30; dissolve as it passes the brick's top
        const hitFrame = waive - 30 + ((6.5 - (y0 + b.h / 2)) / 6.7) * 60;
        const hit = frame >= hitFrame;
        const k = interpolate(frame, [hitFrame, hitFrame + 14], [0, 1], CLAMP);
        if (k >= 1) return null;
        return (
          <group key={i} position-y={y0 + drop} scale={[1 - k * 0.3, 1 - k, 1 - k * 0.3]}>
            <RoundedBox args={[W, b.h, D]} radius={0.04}>
              <meshPhysicalMaterial color={b.color} emissive={hit ? '#f59e0b' : b.color} emissiveIntensity={hit ? 1.2 : 0.35} roughness={0.2} clearcoat={1} transparent opacity={0.82 * (1 - k)} />
            </RoundedBox>
            <LabelPlane text={b.amount} sub={b.label.toUpperCase()} w={W * 0.92} h={Math.min(b.h * 0.8, 0.8)} />
          </group>
        );
      })}
      {/* golden laser plane */}
      {sweeping && (
        <group position-y={sweepY}>
          <mesh>
            <boxGeometry args={[W + 1.2, 0.025, D + 1.2]} />
            <meshBasicMaterial color="#fde68a" toneMapped={false} />
          </mesh>
          <mesh>
            <boxGeometry args={[W + 1.6, 0.25, D + 1.6]} />
            <meshBasicMaterial color="#f59e0b" transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
          {[-1.6, 0, 1.6].map((x) => (
            <Glow key={x} position={[x, 0, D / 2 + 0.4]} color="#f5b942" scale={1.8} opacity={0.9} />
          ))}
        </group>
      )}
      {/* rising gold dust after the sweep */}
      {frame > waive - 10 &&
        frame < waive + 70 &&
        sparks.map((s, i) => {
          const tt = (frame - (waive - 10)) / 80;
          const y = baseH + s.y * (topAll - baseH) + tt * 3 * s.v;
          return (
            <mesh key={i} position={[s.x * (1 + tt), y, s.z * (1 + tt)]} scale={0.03 * (1 - tt)}>
              <sphereGeometry args={[1, 6, 6]} />
              <meshBasicMaterial color="#fde68a" toneMapped={false} transparent opacity={1 - tt} />
            </mesh>
          );
        })}
    </>
  );
};
