import React from 'react';
import {RoundedBox} from '@react-three/drei';
import {useCurrentFrame} from 'remotion';
import {interpolate} from '../lib/safeInterpolate';
import {CLAMP} from '../lib/anim';
import {Floor, Glow, roundRect, Scene3D, useCanvasTexture} from './kit';

const CALLS = [
  {n: '+91 140XXXXX11', t: 'Spam likely · Collections', c: '#ef4444'},
  {n: '+91 77298 XXXXX', t: 'Unknown · Recovery Dept', c: '#ef4444'},
  {n: '+91 124X XXX XXX', t: 'Telemarketing · NCR', c: '#f59e0b'},
  {n: '+91 96765 XXXXX', t: 'Unknown caller', c: '#ef4444'},
  {n: '+91 120X XXX XXX', t: 'Legal Cell (unverified)', c: '#f59e0b'},
];

const easeOutBack = (x: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

/** Module 1: a phone on a glass floor, vibrating, missed-call cards stacking up on its live screen. */
export const Phone3D: React.FC<{start: number; intense: number}> = ({start, intense}) => {
  const frame = useCurrentFrame();
  const f = frame - start;
  const dist = interpolate(f, [-20, 160], [11, 7.2], CLAMP);
  const camX = 1.8 + Math.sin(f / 110) * 0.3;
  return (
    <Scene3D camera={{position: [camX - 1.6, 1.2, dist], lookAt: [0.3, 0.3, 0], fov: 38}} env="cool">
      <PhoneBody frame={frame} start={start} intense={intense} />
    </Scene3D>
  );
};

const PhoneBody: React.FC<{frame: number; start: number; intense: number}> = ({frame, start, intense}) => {
  const W = 512;
  const H = 1064;
  const screen = useCanvasTexture(
    W,
    H,
    (g) => {
      const bg = g.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#2a0d17');
      bg.addColorStop(0.55, '#0b0f1c');
      bg.addColorStop(1, '#070a14');
      g.fillStyle = bg;
      g.fillRect(0, 0, W, H);
      g.fillStyle = '#000';
      roundRect(g, W / 2 - 70, 22, 140, 38, 19);
      g.fill();
      g.fillStyle = '#fff';
      g.font = '700 24px Inter';
      g.fillText('9:41', 40, 50);
      g.textAlign = 'center';
      g.fillStyle = '#94a3b8';
      g.font = '600 22px Inter';
      g.fillText('INCOMING CALL', W / 2, 130);
      g.fillStyle = '#fff';
      g.font = '800 44px Inter';
      g.fillText('+91 140XXXXX11', W / 2, 190);
      const pulse = 0.2 + 0.1 * Math.sin(frame / 5);
      g.fillStyle = `rgba(239,68,68,${pulse + 0.1})`;
      roundRect(g, W / 2 - 170, 215, 340, 44, 12);
      g.fill();
      g.fillStyle = '#fecaca';
      g.font = '700 22px Inter';
      g.fillText('⚠ Spam likely · 48 calls today', W / 2, 245);
      g.textAlign = 'left';
      CALLS.forEach((c, i) => {
        const at = start + 24 + i * 16;
        if (frame < at) return;
        const p = easeOutBack(Math.min(1, (frame - at) / 14));
        const y = 300 + i * 112 + (1 - p) * 220;
        g.globalAlpha = Math.min(1, (frame - at) / 6);
        g.fillStyle = 'rgba(30,41,59,0.92)';
        roundRect(g, 26, y, W - 52, 96, 18);
        g.fill();
        g.fillStyle = c.c;
        g.fillRect(26, y + 10, 6, 76);
        g.fillStyle = '#fff';
        g.font = '800 28px Inter';
        g.fillText(c.n, 50, y + 42);
        g.fillStyle = '#94a3b8';
        g.font = '500 20px Inter';
        g.fillText('Missed · ' + c.t, 50, y + 74);
        g.globalAlpha = 1;
      });
      [['#dc2626', W / 2 - 110], ['#16a34a', W / 2 + 110]].forEach(([col, x]) => {
        g.fillStyle = col as string;
        g.beginPath();
        g.arc(x as number, H - 110, 48, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = '#fff';
        g.font = '700 42px Inter';
        g.textAlign = 'center';
        g.fillText('✆', x as number, H - 95);
        g.textAlign = 'left';
      });
    },
    frame,
  );
  const intenseK = frame > intense ? 0.6 + 0.4 * Math.abs(Math.sin(frame / 14)) : 0.35;
  const vib = Math.sin(frame * 2.1) * 0.035 * intenseK;
  const ring = (frame % 24) / 24;
  return (
    <>
      <Floor y={-2.25} size={12} color="#04070f" />
      <group position={[2.4 + vib, 0.1, 0]} rotation={[-0.08, -0.32 + vib * 0.6, 0.06 + vib]}>
        <RoundedBox args={[2.1, 4.3, 0.24]} radius={0.28} smoothness={6}>
          <meshPhysicalMaterial color="#1f2533" metalness={0.9} roughness={0.28} clearcoat={1} clearcoatRoughness={0.1} />
        </RoundedBox>
        <mesh position-z={0.123}>
          <planeGeometry args={[1.94, 4.04]} />
          <meshBasicMaterial map={screen} toneMapped={false} />
        </mesh>
        {/* glass reflection sheen */}
        <mesh position-z={0.126}>
          <planeGeometry args={[1.94, 4.04]} />
          <meshPhysicalMaterial transparent opacity={0.12} roughness={0} metalness={0} clearcoat={1} color="#ffffff" />
        </mesh>
        {/* camera bump on the back */}
        <RoundedBox args={[0.7, 0.7, 0.08]} radius={0.12} position={[-0.5, 1.5, -0.15]}>
          <meshPhysicalMaterial color="#111827" metalness={0.9} roughness={0.2} />
        </RoundedBox>
      </group>
      <Glow position={[2.4, 0.2, -0.6]} color="#ef4444" scale={6 + ring * 1.5} opacity={0.35 * (1 - ring) * intenseK + 0.1} />
    </>
  );
};
