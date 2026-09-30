import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Glow, Scene3D, useCanvasTexture} from './kit';

const colorFor = (s: number) => (s < 650 ? '#ef4444' : s < 730 ? '#f5b942' : '#10b981');

/** Module 12: a 3D CIBIL gauge — colored arc bands, glowing progress ring, metal needle, live score. */
export const Gauge3D: React.FC<{score: number; width: number; height: number}> = ({score, width, height}) => {
  const frame = useCurrentFrame();
  const tilt = 0.18 + Math.sin(frame / 90) * 0.04;
  return (
    <Scene3D width={width} height={height} camera={{position: [Math.sin(frame / 140) * 0.5, -0.6, 4.1], lookAt: [0, 0.35, 0], fov: 40}} style={{maskImage: 'none', WebkitMaskImage: 'none'}}>
      <group rotation-x={-tilt}>
        <GaugeBody score={score} />
      </group>
    </Scene3D>
  );
};

const GaugeBody: React.FC<{score: number}> = ({score}) => {
  const t = Math.max(0.001, Math.min(1, (score - 300) / 600));
  const col = colorFor(score);
  const label = useCanvasTexture(
    512,
    256,
    (g) => {
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillStyle = col;
      g.font = '900 150px Inter';
      g.fillText(String(Math.round(score)), 256, 120);
      g.fillStyle = '#94a3b8';
      g.font = '700 30px JetBrains Mono';
      g.fillText('CIBIL SCORE', 256, 222);
    },
    Math.round(score),
  );
  const R = 1.6;
  // bands: red 300-600, amber 600-732, green 732-900 (as fractions of the half circle)
  const bands: [number, number, string][] = [
    [0, 0.5, '#7f1d1d'],
    [0.5, 0.72, '#78350f'],
    [0.72, 1, '#064e3b'],
  ];
  const needleA = Math.PI * (1 - t);
  return (
    <>
      {bands.map(([a, b, c]) => (
        <mesh key={c} rotation-z={Math.PI * (1 - b)}>
          <torusGeometry args={[R, 0.16, 20, 80, Math.PI * (b - a)]} />
          <meshPhysicalMaterial color={c} metalness={0.4} roughness={0.35} clearcoat={1} />
        </mesh>
      ))}
      {/* progress ring */}
      <mesh rotation-z={Math.PI * (1 - t)} position-z={0.12}>
        <torusGeometry args={[R, 0.07, 16, 80, Math.PI * t]} />
        <meshBasicMaterial color={col} toneMapped={false} />
      </mesh>
      <Glow position={[Math.cos(needleA) * R, Math.sin(needleA) * R, 0.3]} color={col} scale={1.1} opacity={0.9} />
      {/* needle */}
      <group rotation-z={needleA - Math.PI / 2}>
        <mesh position-y={0.62} position-z={0.18}>
          <coneGeometry args={[0.07, 1.25, 20]} />
          <meshPhysicalMaterial color="#f8fafc" metalness={0.9} roughness={0.15} />
        </mesh>
      </group>
      <mesh position-z={0.2} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.16, 0.16, 0.12, 32]} />
        <meshPhysicalMaterial color="#e2e8f0" metalness={1} roughness={0.2} />
      </mesh>
      {/* score label */}
      <mesh position={[0, -0.55, 0.1]}>
        <planeGeometry args={[1.8, 0.9]} />
        <meshBasicMaterial map={label} transparent toneMapped={false} />
      </mesh>
    </>
  );
};
