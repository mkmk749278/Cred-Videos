import {spring, SpringConfig} from 'remotion';
import {interpolate} from './safeInterpolate';

export const KINETIC: Partial<SpringConfig> = {mass: 0.8, stiffness: 180, damping: 18};
export const SNAPPY: Partial<SpringConfig> = {mass: 0.7, stiffness: 220, damping: 14};
export const SOFT: Partial<SpringConfig> = {mass: 1, stiffness: 90, damping: 20};

export const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const spr = (frame: number, fps: number, delay = 0, config: Partial<SpringConfig> = KINETIC) =>
  spring({frame: frame - delay, fps, config});

/** 0 -> 1 linear ramp between two frames */
export const ramp = (frame: number, from: number, to: number) => interpolate(frame, [from, to], [0, 1], CLAMP);

export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/** fade in at `start`, optionally fade out at `end` */
export const vis = (frame: number, start: number, end = Infinity, dur = 10) =>
  Math.min(ramp(frame, start, start + dur), Number.isFinite(end) ? 1 - ramp(frame, end - dur, end) : 1);

/** deterministic pseudo random in [0,1) */
export const rnd = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const inr = (n: number) => {
  const s = Math.round(n).toString();
  if (s.length <= 3) return s;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `${rest},${last3}`;
};
