import {StageHidden} from '../lib/stage';
import React, {useMemo} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {Environment, Lightformer} from '@react-three/drei';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {useCurrentFrame} from 'remotion';

/** Internal resolution of 3D layers relative to the video (1 = full). */
export const DPR = 0.6;

/** A transparent 3D viewport laid over the 2D backdrop. Frame-driven only (no useFrame). */
export const Scene3D: React.FC<{
  width?: number;
  height?: number;
  camera: {position: [number, number, number]; fov?: number; lookAt?: [number, number, number]};
  children: React.ReactNode;
  style?: React.CSSProperties;
  env?: 'studio' | 'warm' | 'cool';
  exposure?: number;
  /** override the internal resolution (1 = full) */
  dpr?: number;
}> = ({width = 1920, height = 770, camera, children, style, env = 'studio', exposure = 1.1, dpr = DPR}) =>
  React.useContext(StageHidden) ? null : (
  <div
    style={{
      position: 'absolute',
      left: 0,
      top: 0,
      width,
      height,
      // soft edges so reflections never end in a hard rectangle
      maskImage: 'linear-gradient(90deg, transparent 0%, #000 7%, #000 93%, transparent 100%)',
      WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, #000 7%, #000 93%, transparent 100%)',
      ...style,
    }}
  >
    <ThreeCanvas
      width={width}
      height={height}
      // Reduced internal resolution, upscaled by the browser: software WebGL cost scales with pixel count.
      dpr={dpr}
      gl={{alpha: true, antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: exposure}}
      camera={{position: camera.position, fov: camera.fov ?? 38, near: 0.1, far: 200}}
      style={{background: 'transparent'}}
    >
      <CameraRig {...camera} />
      <StudioEnv tone={env} />
      {children}
    </ThreeCanvas>
  </div>
);

/** Positions the camera from props on every render, so camera moves are frame-accurate. */
const CameraRig: React.FC<{position: [number, number, number]; lookAt?: [number, number, number]; fov?: number}> = ({position, lookAt = [0, 0, 0], fov}) => {
  const cam = useThree((st) => st.camera) as THREE.PerspectiveCamera;
  cam.position.set(...position);
  if (fov) cam.fov = fov;
  cam.lookAt(...lookAt);
  cam.updateProjectionMatrix();
  return null;
};

/** Procedural studio lighting + reflections (no HDR downloads). */
export const StudioEnv: React.FC<{tone?: 'studio' | 'warm' | 'cool'}> = ({tone = 'studio'}) => {
  const rim = tone === 'warm' ? '#f59e0b' : tone === 'cool' ? '#38bdf8' : '#60a5fa';
  const fill = tone === 'warm' ? '#fde68a' : '#e0f2fe';
  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[6, 10, 6]} intensity={2.2} color="#ffffff" />
      <directionalLight position={[-8, 4, -4]} intensity={1.2} color={rim} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} color="#ffffff" position={[0, 6, 4]} scale={[10, 3, 1]} />
        <Lightformer form="rect" intensity={2} color={fill} position={[-6, 2, 2]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} />
        <Lightformer form="rect" intensity={2.5} color={rim} position={[6, 1, -2]} rotation-y={-Math.PI / 2} scale={[6, 1.5, 1]} />
        <Lightformer form="ring" intensity={1.5} color="#ffffff" position={[0, 2, -8]} scale={4} />
      </Environment>
    </>
  );
};

/** Dark glossy floor that fades out at the edges. */
export const Floor: React.FC<{y?: number; size?: number; color?: string}> = ({y = -1.5, size = 14, color = '#050912'}) => {
  const alphaMap = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d')!;
    const grd = g.createRadialGradient(128, 128, 10, 128, 128, 128);
    grd.addColorStop(0, '#ffffff');
    grd.addColorStop(1, '#000000');
    g.fillStyle = grd;
    g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, []);
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={y}>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial color={color} metalness={0.7} roughness={0.42} envMapIntensity={0.35} transparent alphaMap={alphaMap} />
    </mesh>
  );
};

/** Canvas-backed texture; `draw` runs whenever `key` changes (pass frame for animated textures). */
export const useCanvasTexture = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, key: unknown) => {
  const {canvas, tex} = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return {canvas, tex};
  }, [w, h]);
  useMemo(() => {
    const g = canvas.getContext('2d')!;
    g.clearRect(0, 0, w, h);
    draw(g);
    tex.needsUpdate = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, canvas, tex]);
  return tex;
};

/** Glowing soft sprite (fake bloom) */
export const Glow: React.FC<{position?: [number, number, number]; color?: string; scale?: number; opacity?: number}> = ({
  position = [0, 0, 0],
  color = '#38bdf8',
  scale = 2,
  opacity = 1,
}) => {
  const map = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d')!;
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.25, 'rgba(255,255,255,0.5)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);
  return (
    <sprite position={position} scale={[scale, scale, 1]}>
      <spriteMaterial map={map} color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} />
    </sprite>
  );
};

/** Frame helpers usable inside the canvas */
export const useFrame3D = () => useCurrentFrame();

export const roundRect = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
};
