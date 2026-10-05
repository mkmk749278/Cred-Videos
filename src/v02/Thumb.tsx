import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {DISPLAY, K, NUM, rgba} from './core';
import {CreditCard, SKINS} from './objects';

/** 1280×720 thumbnail: Amazon navy | Flipkart blue split, invoice badges, focal question. */
export const EmiThumb: React.FC = () => (
  <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 700, height: 720, background: `linear-gradient(160deg, #131A22, ${K.amzNavy} 60%, #37475A)`, clipPath: 'polygon(0 0, 100% 0, 84% 100%, 0 100%)'}} />
    <div style={{position: 'absolute', right: 0, top: 0, width: 700, height: 720, background: `linear-gradient(160deg, ${K.fk}, #0B3FB0)`, clipPath: 'polygon(16% 0, 100% 0, 100% 100%, 0 100%)'}} />
    <Img src={staticFile('v02/bokeh_warm.jpg')} style={{position: 'absolute', left: -200, top: -100, width: 1700, opacity: 0.35, mixBlendMode: 'screen'}} />
    {/* cards */}
    <CreditCard skin={SKINS.sbi} w={380} rx={10} ry={-20} rz={-10} style={{left: 40, top: 300}} glow={0.6} />
    <CreditCard skin={SKINS.axis} w={360} rx={10} ry={20} rz={9} style={{left: 880, top: 320}} glow={0.4} />
    {/* focal text */}
    <div style={{position: 'absolute', left: 0, right: 0, top: 26, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 950, fontSize: 118, lineHeight: 0.95, color: '#fff', letterSpacing: -4, textShadow: '0 8px 30px rgba(0,0,0,0.8), 0 0 2px #000'}}>
      No Cost EMI
      <div style={{color: K.fkY, fontSize: 150}}>TRAP?</div>
    </div>
    {/* invoice badges */}
    <div style={{position: 'absolute', left: 405, top: 345, width: 470, display: 'flex', flexDirection: 'column', gap: 18}}>
      <div style={{padding: '16px 22px', borderRadius: 20, background: `linear-gradient(135deg, ${K.win}, #0FB57A)`, boxShadow: `0 20px 50px rgba(0,0,0,0.6), 0 0 40px ${rgba(K.win, 0.5)}`, transform: 'rotate(-3deg)'}}>
        <div style={{fontFamily: NUM, fontWeight: 800, fontSize: 22, color: '#04150E'}}>AMAZON SBI EMI</div>
        <div style={{fontFamily: DISPLAY, fontWeight: 950, fontSize: 60, color: '#04150E', lineHeight: 1, whiteSpace: 'nowrap'}}>+₹449 SAVE</div>
      </div>
      <div style={{padding: '16px 22px', borderRadius: 20, background: `linear-gradient(135deg, ${K.loss}, #C81E3A)`, boxShadow: `0 20px 50px rgba(0,0,0,0.6), 0 0 40px ${rgba(K.loss, 0.5)}`, transform: 'rotate(2deg)'}}>
        <div style={{fontFamily: NUM, fontWeight: 800, fontSize: 22, color: '#fff'}}>FLIPKART AXIS EMI</div>
        <div style={{fontFamily: DISPLAY, fontWeight: 950, fontSize: 60, color: '#fff', lineHeight: 1, whiteSpace: 'nowrap'}}>−₹336 LOSS</div>
      </div>
    </div>
    <div style={{position: 'absolute', left: 30, bottom: 22, fontFamily: DISPLAY, fontWeight: 900, fontSize: 26, color: '#fff', padding: '6px 14px', borderRadius: 12, background: 'rgba(0,0,0,0.55)'}}>₹30,000 phone · live math</div>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 60%, rgba(0,0,0,0.5))'}} />
  </AbsoluteFill>
);
