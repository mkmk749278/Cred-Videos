import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, FONT, MONO, alpha} from './theme';
import {Backdrop} from './components/SceneShell';
import {HeroCard3D} from './three/HeroCard3D';

/** 1280x720 YouTube thumbnail (render one still, e.g. frame 80). Big, few words, high contrast. */
export const Thumbnail: React.FC = () => (
  <AbsoluteFill style={{fontFamily: FONT, color: C.text}}>
    <Backdrop tint={C.crimson} />
    <div style={{position: 'absolute', right: -40, top: 90, width: 700, height: 520}}>
      <HeroCard3D at={0} width={700} height={520} bank="UNPAID" product="Credit card" c1="#450a0a" c2="#dc2626" amount="₹1,39,176" amountLabel="BALANCE" badge={{text: 'NOT A CRIME', color: '#fde047'}} glow="#ef4444" size={2.6} dpr={1} />
    </div>
    <div style={{position: 'absolute', left: 56, top: 70, width: 700}}>
      <div style={{fontFamily: MONO, fontSize: 30, letterSpacing: 8, color: C.gold, fontWeight: 800}}>INDIA · 2026</div>
      <div style={{fontSize: 112, fontWeight: 900, lineHeight: 0.95, letterSpacing: -3, marginTop: 14, textShadow: '0 6px 30px rgba(0,0,0,0.7)'}}>
        CAN'T PAY
        <br />
        YOUR <span style={{color: '#fde047'}}>CREDIT</span>
        <br />
        <span style={{color: '#fde047'}}>CARD?</span>
      </div>
      <div style={{display: 'inline-block', marginTop: 26, padding: '12px 26px', borderRadius: 16, background: C.emerald, color: '#022c22', fontSize: 44, fontWeight: 900, boxShadow: `0 0 40px ${alpha(C.emerald, 0.6)}`}}>
        Know your rights
      </div>
    </div>
  </AbsoluteFill>
);
