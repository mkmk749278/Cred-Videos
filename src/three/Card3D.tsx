import React from 'react';
import {RoundedBox} from '@react-three/drei';
import {roundRect, useCanvasTexture} from './kit';

type CardProps = {
  bank: string;
  product?: string;
  c1: string;
  c2: string;
  amount?: string;
  glow?: string;
} & JSX.IntrinsicElements['group'];

/** Glossy 3D credit card with a printed face (no real logos). 1.7 x 1.07 world units. */
export const Card3D: React.FC<CardProps> = ({bank, product, c1, c2, amount, glow, ...group}) => {
  const face = useCanvasTexture(
    1024,
    644,
    (g) => {
      const grd = g.createLinearGradient(0, 0, 1024, 644);
      grd.addColorStop(0, c1);
      grd.addColorStop(1, c2);
      roundRect(g, 0, 0, 1024, 644, 56);
      g.fillStyle = grd;
      g.fill();
      // sheen
      const sh = g.createLinearGradient(0, 0, 1024, 644);
      sh.addColorStop(0.35, 'rgba(255,255,255,0)');
      sh.addColorStop(0.5, 'rgba(255,255,255,0.16)');
      sh.addColorStop(0.65, 'rgba(255,255,255,0)');
      g.fillStyle = sh;
      g.fill();
      g.fillStyle = '#fff';
      g.font = '900 86px Inter';
      g.fillText(bank, 70, 130);
      if (product) {
        g.globalAlpha = 0.85;
        g.font = '600 46px Inter';
        g.fillText(product, 72, 196);
        g.globalAlpha = 1;
      }
      const chip = g.createLinearGradient(70, 270, 210, 370);
      chip.addColorStop(0, '#fde68a');
      chip.addColorStop(1, '#b45309');
      roundRect(g, 70, 270, 140, 104, 16);
      g.fillStyle = chip;
      g.fill();
      g.strokeStyle = 'rgba(0,0,0,0.25)';
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(70, 322);
      g.lineTo(210, 322);
      g.moveTo(140, 270);
      g.lineTo(140, 374);
      g.stroke();
      g.font = '500 54px JetBrains Mono';
      g.globalAlpha = 0.9;
      g.fillText('•••• •••• •••• 4821', 70, 570);
      g.globalAlpha = 1;
      if (amount) {
        g.font = '900 70px Inter';
        g.textAlign = 'right';
        g.fillText(amount, 960, 340);
        g.textAlign = 'left';
      }
    },
    `${bank}|${product}|${amount}`,
  );
  const back = useCanvasTexture(
    512,
    322,
    (g) => {
      const grd = g.createLinearGradient(0, 0, 512, 322);
      grd.addColorStop(0, c2);
      grd.addColorStop(1, c1);
      roundRect(g, 0, 0, 512, 322, 28);
      g.fillStyle = grd;
      g.fill();
      g.fillStyle = '#0b0b0f';
      g.fillRect(0, 36, 512, 62);
      g.fillStyle = 'rgba(255,255,255,0.85)';
      g.fillRect(34, 130, 300, 40);
    },
    `${c1}|${c2}`,
  );
  return (
    <group {...group}>
      <RoundedBox args={[1.7, 1.07, 0.035]} radius={0.06} smoothness={4}>
        <meshPhysicalMaterial color={c1} metalness={0.5} roughness={0.35} clearcoat={1} clearcoatRoughness={0.15} emissive={glow ?? '#000000'} emissiveIntensity={glow ? 0.35 : 0} />
      </RoundedBox>
      <mesh position-z={0.019}>
        <planeGeometry args={[1.66, 1.04]} />
        <meshPhysicalMaterial map={face} transparent metalness={0.25} roughness={0.3} clearcoat={1} clearcoatRoughness={0.08} />
      </mesh>
      <mesh position-z={-0.019} rotation-y={Math.PI}>
        <planeGeometry args={[1.66, 1.04]} />
        <meshPhysicalMaterial map={back} transparent metalness={0.25} roughness={0.35} clearcoat={1} />
      </mesh>
    </group>
  );
};
