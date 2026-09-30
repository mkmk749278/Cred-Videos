import React, {useEffect, useState} from 'react';
import {Composition, continueRender, delayRender, Series, staticFile} from 'remotion';
import {FPS, HEIGHT, WIDTH, sceneFrames} from './lib/timing';
import {Intro, INTRO_FRAMES} from './Intro';
import {SCENES} from './scenes';

const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    const faces = [
      new FontFace('Inter', `url(${staticFile('fonts/Inter.woff2')}) format('woff2')`, {weight: '100 900'}),
      new FontFace('JetBrains Mono', `url(${staticFile('fonts/JetBrainsMono.woff2')}) format('woff2')`, {weight: '100 800'}),
    ];
    Promise.all(faces.map((f) => f.load()))
      .then((loaded) => loaded.forEach((f) => (document.fonts as unknown as Set<FontFace>).add(f)))
      .catch((e) => console.error('font load failed', e))
      .finally(() => continueRender(handle));
  }, [handle]);
};

const WithFonts: React.FC<{children: React.ReactNode}> = ({children}) => {
  useFonts();
  return <>{children}</>;
};

export const VideoMaster: React.FC = () => (
  <WithFonts>
    <Series>
      <Series.Sequence durationInFrames={INTRO_FRAMES}>
        <Intro />
      </Series.Sequence>
      {SCENES.map((Scene, i) => (
        <Series.Sequence key={i} durationInFrames={sceneFrames(i)}>
          <Scene />
        </Series.Sequence>
      ))}
    </Series>
  </WithFonts>
);

const total = INTRO_FRAMES + SCENES.reduce((acc, _, i) => acc + sceneFrames(i), 0);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="VideoMaster" component={VideoMaster} durationInFrames={total} fps={FPS} width={WIDTH} height={HEIGHT} />
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
