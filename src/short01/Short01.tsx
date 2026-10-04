import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';

/**
 * Telugu Short 01 — "Minimum due కట్టినా interest ఎందుకు?"
 * The picture is the Blender/Cycles render (short01/scene.py → public/short01/frames/fNNNN.jpg);
 * this layer adds the takeaway captions (one at a time), the EXAMPLE tag, light film treatment and the mix.
 * Frame numbers follow SHORT_01_SCENE_TIMINGS.json (30 fps, 1281 frames).
 */
export const SHORT01_FRAMES = 1281;
export const SHORT01_W = 1080;
export const SHORT01_H = 1920;

const NAVY = '#0B1530';
const YELLOW = '#FFD34D';
const WHITE = '#FAFAFA';
const CAP_FONT = "'Inter', 'Noto Sans Telugu', sans-serif";

// takeaway captions [from, to) — tied to the spoken cues in the handoff
const CAPTIONS: {from: number; to: number; text: string; accent?: string}[] = [
  {from: 0, to: 170, text: 'Minimum due కట్టినా… interest?', accent: 'interest?'},
  {from: 335, to: 400, text: 'Shopping date నుంచే!', accent: 'Shopping date'},
  {from: 410, to: 507, text: 'Payment వరకు', accent: 'వరకు'},
  {from: 517, to: 636, text: 'Payment తర్వాత', accent: 'తర్వాత'},
  {from: 712, to: 762, text: 'Late fee తప్పుతుంది', accent: 'తప్పుతుంది'},
  {from: 766, to: 827, text: 'Interest ఆగదు', accent: 'ఆగదు'},
  {from: 926, to: 1054, text: 'కొత్త purchaseకీ interest', accent: 'interest'},
  {from: 1062, to: 1158, text: 'ఈ cycle నుంచి ఎలా బయటపడాలి?', accent: 'ఎలా'},
];

// the EXAMPLE tag stays on screen whenever amounts/dates are visible
const EXAMPLE_SPANS: [number, number][] = [[0, 1058]];

const Caption: React.FC<{from: number; to: number; text: string; accent?: string}> = ({from, to, text, accent}) => {
  const f = useCurrentFrame();
  if (f < from || f >= to) return null;
  const inP = interpolate(f, [from, from + 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  // frame 0 must already show the hook (cover / first impression)
  const p = from === 0 ? 1 : inP;
  const outP = interpolate(f, [to - 7, to], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const parts = accent && text.includes(accent) ? text.split(accent) : [text];
  return (
    <div style={{position: 'absolute', top: 226, left: 90, right: 200, display: 'flex', justifyContent: 'flex-start', opacity: p * outP, transform: `translateY(${(1 - p) * 18}px)`}}>
      <div style={{background: 'rgba(11,21,48,0.88)', borderRadius: 22, padding: '20px 30px 24px', boxShadow: '0 10px 40px rgba(0,0,0,0.35)', borderLeft: `10px solid ${YELLOW}`}}>
        <div style={{fontFamily: CAP_FONT, fontSize: 64, fontWeight: 800, lineHeight: 1.28, color: WHITE, letterSpacing: -0.3}}>
          {parts.length === 2 ? (
            <>
              {parts[0]}
              <span style={{color: YELLOW}}>{accent}</span>
              {parts[1]}
            </>
          ) : (
            text
          )}
        </div>
      </div>
    </div>
  );
};

const ExampleTag: React.FC = () => {
  const f = useCurrentFrame();
  const on = EXAMPLE_SPANS.some(([a, b]) => f >= a && f < b);
  if (!on) return null;
  return (
    <div style={{position: 'absolute', left: 90, top: 162, padding: '6px 14px', borderRadius: 10, background: 'rgba(11,21,48,0.78)', border: `2px solid ${YELLOW}`, color: YELLOW, fontFamily: CAP_FONT, fontSize: 26, fontWeight: 800, letterSpacing: 2}}>
      EXAMPLE <span style={{color: WHITE, fontWeight: 600, letterSpacing: 0.5}}>· fictional amounts &amp; dates</span>
    </div>
  );
};

const Invite: React.FC = () => {
  const f = useCurrentFrame();
  const from = 1166;
  if (f < from) return null;
  const p = interpolate(f, [from, from + 12], [0, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const bob = Math.sin((f - from) / 9) * 6;
  return (
    <div style={{position: 'absolute', left: 90, right: 200, top: 1290, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', opacity: p, transform: `translateY(${(1 - p) * 24}px)`}}>
      <div style={{background: YELLOW, color: NAVY, borderRadius: 22, padding: '18px 30px 22px', fontFamily: CAP_FONT, fontSize: 66, fontWeight: 900, boxShadow: '0 12px 40px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', gap: 18}}>
        Full Telugu video <span style={{display: 'inline-block', transform: `translateY(${bob}px)`}}>↓</span>
      </div>
      <div style={{marginTop: 16, padding: '8px 16px', borderRadius: 10, background: 'rgba(11,21,48,0.8)', fontFamily: CAP_FONT, fontSize: 28, fontWeight: 800, color: WHITE, letterSpacing: 1.5}}>
        BE PRACTICAL <span style={{color: YELLOW, fontWeight: 600}}>with Kishore</span>
      </div>
    </div>
  );
};

export const Short01: React.FC = () => {
  const f = useCurrentFrame();
  const src = staticFile(`short01/frames/f${String(f).padStart(4, '0')}.jpg`);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Img src={src} style={{width: SHORT01_W, height: SHORT01_H}} />
      {/* light lens vignette */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 70% at 50% 48%, rgba(0,0,0,0) 55%, rgba(10,8,4,0.32) 100%)'}} />
      {CAPTIONS.map((c) => (
        <Caption key={c.from} {...c} />
      ))}
      <ExampleTag />
      <Invite />
      <Audio src={staticFile('short01/mix.wav')} />
    </AbsoluteFill>
  );
};

/** Cover image: "MINIMUM PAID… INTEREST?" over a fresh render of the payment slip + interest line (frame 0 of this Short). */
export const Short01Cover: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <Img src={staticFile('short01/frames/f0002.jpg')} style={{width: SHORT01_W, height: SHORT01_H}} />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(11,21,48,0.0) 0%, rgba(11,21,48,0.0) 55%, rgba(11,21,48,0.55) 100%)'}} />
    <div style={{position: 'absolute', left: 90, right: 150, top: 200, fontFamily: CAP_FONT}}>
      <div style={{display: 'inline-block', background: NAVY, color: WHITE, fontSize: 104, fontWeight: 900, lineHeight: 1.0, padding: '22px 30px 26px', borderRadius: 22, letterSpacing: -2, borderLeft: `14px solid ${YELLOW}`}}>
        MINIMUM
        <br />
        PAID…
      </div>
      <div style={{display: 'inline-block', marginTop: 18, background: YELLOW, color: NAVY, fontSize: 112, fontWeight: 900, padding: '14px 30px 20px', borderRadius: 22, letterSpacing: -2}}>INTEREST?</div>
    </div>
    <div style={{position: 'absolute', left: 90, top: 1380, padding: '10px 18px', borderRadius: 10, background: 'rgba(11,21,48,0.85)', fontFamily: CAP_FONT, fontSize: 32, fontWeight: 800, color: WHITE, letterSpacing: 1.5}}>
      BE PRACTICAL <span style={{color: YELLOW, fontWeight: 600}}>with Kishore</span>
    </div>
  </AbsoluteFill>
);
