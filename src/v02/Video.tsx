import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import cues from './cues.json';
import {DISPLAY, FPS, K, LEAD, Lens, NUM, S, TE, TOTAL, lin, sec} from './core';
import {Scene1, Scene2, Scene3, Scene4} from './ScenesA';
import {Scene5, Scene6, Scene7} from './ScenesB';
import {Scene8, Scene9} from './ScenesC';

const CHAPTERS: {n: number; t: string}[] = [
  {n: 1, t: 'The 10% banner'},
  {n: 5, t: 'Full pay vs EMI bonus'},
  {n: 10, t: 'The platform paradox'},
  {n: 16, t: 'Who pays for No Cost EMI?'},
  {n: 25, t: 'Amazon × SBI: the math'},
  {n: 42, t: 'Flipkart × Axis/ICICI: the math'},
  {n: 56, t: '5% cashback cards'},
  {n: 61, t: '3 hidden traps'},
  {n: 75, t: '3 rules before Buy Now'},
];

/** chapter label + thin progress line */
const Hud: React.FC = () => {
  const f = useCurrentFrame();
  let i = 0;
  CHAPTERS.forEach((c, k) => {
    if (f >= S(c.n) - 6) i = k;
  });
  const c = CHAPTERS[i];
  const o = lin(f, S(c.n) - 6, S(c.n) + 8) * (1 - lin(f, TOTAL - 120, TOTAL - 100));
  return (
    <>
      <div style={{position: 'absolute', left: 0, top: 0, height: 5, width: `${(f / TOTAL) * 100}%`, background: `linear-gradient(90deg, ${K.amz}, ${K.fkY})`, opacity: 0.8}} />
      <div style={{position: 'absolute', right: 56, top: 30, display: 'flex', alignItems: 'center', gap: 12, padding: '8px 18px', borderRadius: 999, background: 'rgba(5,8,14,0.55)', border: '1.5px solid rgba(255,255,255,0.16)', opacity: f < 30 ? 0 : o}}>
        <span style={{fontFamily: NUM, fontSize: 18, fontWeight: 700, color: K.amz, letterSpacing: 2}}>{String(i + 1).padStart(2, '0')}/09</span>
        <span style={{fontFamily: DISPLAY, fontSize: 20, fontWeight: 700, color: K.soft}}>{c.t}</span>
      </div>
    </>
  );
};

/** Telugu captions, timed per chunk */
const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS - LEAD;
  const caps = cues.captions as {s: number; e: number; t: string}[];
  const c = caps.find((x) => t >= x.s - 0.05 && t < x.e + 0.25);
  if (!c) return null;
  const o = Math.min(lin(t, c.s - 0.05, c.s + 0.1), 1 - lin(t, c.e + 0.1, c.e + 0.25));
  return (
    <div style={{position: 'absolute', left: 160, right: 160, bottom: 34, display: 'flex', justifyContent: 'center', opacity: o}}>
      <div style={{maxWidth: 1600, padding: '8px 26px 10px', borderRadius: 16, background: 'rgba(3,5,10,0.66)', fontFamily: TE, fontWeight: 600, fontSize: 38, lineHeight: 1.45, color: '#fff', textAlign: 'center', textShadow: '0 2px 6px rgba(0,0,0,0.6)'}}>{c.t}</div>
    </div>
  );
};

/** music: analytical bed, tension for the traps, hope for the rules; crossfaded, low under the voice */
const Music: React.FC = () => {
  const tA = S(61) - 30; // tension starts
  const tB = S(75) - 30; // hope starts
  const XF = 60;
  const fadeIn = (f: number, a: number) => lin(f, a, a + XF);
  const fadeOut = (f: number, b: number) => 1 - lin(f, b, b + XF);
  return (
    <>
      <Sequence from={0} durationInFrames={tA + XF} layout="none">
        <Audio src={staticFile('audio/music/analytic.mp3')} volume={(f) => 0.13 * lin(f, 0, 20) * fadeOut(f, tA)} />
      </Sequence>
      <Sequence from={tA} durationInFrames={tB - tA + XF} layout="none">
        <Audio src={staticFile('audio/music/tension.mp3')} volume={(f) => 0.12 * fadeIn(f, 0) * fadeOut(f, tB - tA)} />
      </Sequence>
      <Sequence from={tB} layout="none">
        <Audio src={staticFile('audio/music/hope.mp3')} volume={(f) => 0.14 * fadeIn(f, 0) * (1 - lin(f, TOTAL - tB - 70, TOTAL - tB))} />
      </Sequence>
    </>
  );
};

export const EmiVideo: React.FC<{captions?: boolean}> = ({captions = true}) => (
  <AbsoluteFill style={{background: K.ink}}>
    <Scene1 />
    <Scene2 />
    <Scene3 />
    <Scene4 />
    <Scene5 />
    <Scene6 />
    <Scene7 />
    <Scene8 />
    <Scene9 />
    <Lens />
    <Hud />
    {captions && <Captions />}
    <Sequence from={sec(0)} layout="none">
      <Audio src={staticFile('v02/vo.mp3')} volume={1} />
    </Sequence>
    <Music />
  </AbsoluteFill>
);

export const EMI_TOTAL = TOTAL;
