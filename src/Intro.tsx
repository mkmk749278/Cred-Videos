import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT, MONO, alpha} from './theme';
import {CLAMP, spr} from './lib/anim';
import {Backdrop} from './components/SceneShell';
import {Sfx} from './components/primitives';

export const INTRO_FRAMES = 210;

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spr(frame, fps, 8);
  const line = interpolate(frame, [20, 60], [0, 1], CLAMP);
  const disc = interpolate(frame, [70, 90], [0, 1], CLAMP);
  const out = interpolate(frame, [INTRO_FRAMES - 16, INTRO_FRAMES], [0, 1], CLAMP);
  return (
    <AbsoluteFill style={{fontFamily: FONT, color: C.text}}>
      <Backdrop tint={C.gold} />
      <Sfx at={8} name="title_hit" volume={0.5} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: 1 - out}}>
        <div style={{textAlign: 'center', transform: `translateY(${(1 - p) * 60}px)`, opacity: p}}>
          <div style={{fontFamily: MONO, color: C.gold, fontSize: 30, letterSpacing: 14, fontWeight: 700}}>KNOW YOUR RIGHTS</div>
          <div style={{fontSize: 122, fontWeight: 900, letterSpacing: -2, lineHeight: 1.02, marginTop: 20, textShadow: `0 0 50px ${alpha(C.gold, 0.25)}`}}>
            Credit Card Debt
            <br />
            <span style={{color: C.gold}}>in India</span>
          </div>
          <div style={{height: 4, width: 700 * line, margin: '30px auto', background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`}} />
          <div style={{fontSize: 38, color: C.muted, fontWeight: 500}}>A borrower's guide to law, dignity and resolution · 13 modules</div>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 70,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontSize: 24,
            color: C.muted,
            opacity: disc,
            lineHeight: 1.5,
          }}
        >
          For awareness only — not legal or financial advice. Bank practices and figures vary and may change.
          <br />
          Please verify your situation with a qualified advocate or financial counsellor.
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: '#000', opacity: Math.max(interpolate(frame, [0, 10], [1, 0], CLAMP), out)}} />
    </AbsoluteFill>
  );
};
