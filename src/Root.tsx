import React, {useEffect, useState} from 'react';
import {Composition, continueRender, delayRender, Series, staticFile} from 'remotion';
import {FPS, HEIGHT, WIDTH, sceneFrames} from './lib/timing';
import {Intro, INTRO_FRAMES} from './Intro';
import {ColdOpen, COLD_OPEN_FRAMES} from './ColdOpen';
import {SCENES} from './scenes';
import {Test3D} from './three/Test3D';
import {Thumbnail} from './Thumbnail';
import {DoorstepShort, DS_FPS, DS_FRAMES, DS_H, DS_W} from './short/DoorstepShort';
import {Reel, REEL_FPS, REEL_FRAMES, REEL_H, REEL_W} from './reel/Reel';
import {CharacterPerformance, PERFORMANCE_FRAMES} from './character/Performance';
import {CharacterHero, CharacterReel, CharacterSheet, REEL_SEG, SITUATIONS} from './character/CharacterShowcase';

const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts'));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const faces = [
      new FontFace('Inter', `url(${staticFile('fonts/Inter.woff2')}) format('woff2')`, {weight: '100 900'}),
      new FontFace('Noto Sans Telugu', `url(${staticFile('fonts/NotoSansTelugu-500.woff2')}) format('woff2')`, {weight: '400 600'}),
      new FontFace('Noto Sans Telugu', `url(${staticFile('fonts/NotoSansTelugu-700.woff2')}) format('woff2')`, {weight: '650 900'}),
      new FontFace('JetBrains Mono', `url(${staticFile('fonts/JetBrainsMono.woff2')}) format('woff2')`, {weight: '100 800'}),
    ];
    Promise.all(faces.map((f) => f.load()))
      .then((loaded) => loaded.forEach((f) => (document.fonts as unknown as Set<FontFace>).add(f)))
      .catch((e) => console.error('font load failed', e))
      .finally(() => {
        setReady(true);
        continueRender(handle);
      });
  }, [handle]);
  return ready;
};

// Children mount only after fonts load, so canvas-drawn 3D textures never use fallback fonts.
const WithFonts: React.FC<{children: React.ReactNode}> = ({children}) => {
  const ready = useFonts();
  return ready ? <>{children}</> : null;
};

export const VideoMaster: React.FC = () => (
  <WithFonts>
    <Series>
      <Series.Sequence durationInFrames={COLD_OPEN_FRAMES}>
        <ColdOpen />
      </Series.Sequence>
      {SCENES.map((Scene, i) => (
        <Series.Sequence key={i} durationInFrames={sceneFrames(i)}>
          <Scene />
        </Series.Sequence>
      ))}
    </Series>
  </WithFonts>
);

const total = COLD_OPEN_FRAMES + SCENES.reduce((acc, _, i) => acc + sceneFrames(i), 0);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="VideoMaster" component={VideoMaster} durationInFrames={total} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition id="Test3D" component={() => <WithFonts><Test3D /></WithFonts>} durationInFrames={1200} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition id="CharacterPerformance" component={() => <WithFonts><CharacterPerformance /></WithFonts>} durationInFrames={PERFORMANCE_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition id="CharacterHero" component={() => <WithFonts><CharacterHero /></WithFonts>} durationInFrames={90} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition id="CharacterSheet" component={() => <WithFonts><CharacterSheet /></WithFonts>} durationInFrames={90} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition id="CharacterReel" component={() => <WithFonts><CharacterReel /></WithFonts>} durationInFrames={SITUATIONS.length * REEL_SEG + 10} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition id="Thumbnail" component={() => <WithFonts><Thumbnail /></WithFonts>} durationInFrames={90} fps={FPS} width={1280} height={720} />
    <Composition id="DoorstepShort" component={() => <WithFonts><DoorstepShort /></WithFonts>} durationInFrames={DS_FRAMES} fps={DS_FPS} width={DS_W} height={DS_H} />
    <Composition id="Reel" component={() => <WithFonts><Reel /></WithFonts>} durationInFrames={REEL_FRAMES} fps={REEL_FPS} width={REEL_W} height={REEL_H} />
    <Composition id="ColdOpen" component={() => <WithFonts><ColdOpen /></WithFonts>} durationInFrames={COLD_OPEN_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition id="Intro" component={() => <WithFonts><Intro /></WithFonts>} durationInFrames={INTRO_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    {SCENES.map((Scene, i) => (
      <Composition
        key={i}
        id={`Scene${String(i + 1).padStart(2, '0')}`}
        component={() => (
          <WithFonts>
            <Scene />
          </WithFonts>
        )}
        durationInFrames={sceneFrames(i)}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    ))}
  </>
);
