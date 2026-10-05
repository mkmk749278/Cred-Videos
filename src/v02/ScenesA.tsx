import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Backdrop, CL, Count, DISPLAY, E, Flare, Glass, Headline, K, Kicker, NUM, S, Sfx, Shot, W, eout, lin, rgba, rs, rnd, useSp, POP, SMOOTH, ContactShadow} from './core';
import {Badge, CreditCard, Cursor, Gauge, Phone, SKINS, Stamp} from './objects';
import {interpolate} from '../lib/safeInterpolate';

/* ================================================================== SCENE 1 — the 10% banner illusion */

const FestBanner: React.FC<{x: number; y: number; w: number; h: number; ry: number; side: 'amz' | 'fk'; zoom10: number; at: number}> = ({x, y, w, h, ry, side, zoom10, at}) => {
  const f = useCurrentFrame();
  const sp = useSp();
  const p = sp(at, SMOOTH);
  const amz = side === 'amz';
  const bg = amz ? `linear-gradient(150deg, #0F1720 0%, ${K.amzNavy} 45%, #37475A 100%)` : `linear-gradient(150deg, #0B3FB0 0%, ${K.fk} 55%, #5B9BFF 100%)`;
  const acc = amz ? K.amz : K.fkY;
  const flick = 0.85 + 0.15 * Math.sin(f * 0.9 + (amz ? 0 : 2)) * (rnd(Math.floor(f / 3)) > 0.92 ? 1 : 0.1);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, transform: `perspective(2200px) rotateY(${ry}deg) translateY(${(1 - p) * 120}px)`, opacity: p}}>
      <div style={{position: 'absolute', inset: -18, borderRadius: 40, background: 'linear-gradient(145deg, #2b2f37, #0c0e12)', boxShadow: `0 60px 120px rgba(0,0,0,0.7), 0 0 120px ${rgba(acc, 0.25 * flick)}`}} />
      <div style={{position: 'absolute', inset: 0, borderRadius: 26, overflow: 'hidden', background: bg}}>
        {/* LED dot texture */}
        <div style={{position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1.6px)', backgroundSize: '7px 7px', opacity: 0.6}} />
        {/* confetti sparkles */}
        {Array.from({length: 26}).map((_, i) => {
          const sx = rnd(i * 3.1 + (amz ? 1 : 7)) * w;
          const sy = ((rnd(i * 7.7) * h + f * (1.2 + rnd(i) * 2.2)) % (h + 40)) - 20;
          const c = [acc, '#ffffff', amz ? '#FF6A3D' : '#FF5FA2', '#7CF5FF'][i % 4];
          return <div key={i} style={{position: 'absolute', left: sx, top: sy, width: 10, height: 16, background: c, opacity: 0.75, transform: `rotate(${f * 4 + i * 40}deg)`, borderRadius: 2}} />;
        })}
        <div style={{position: 'absolute', left: 52, top: 50, fontFamily: DISPLAY, fontWeight: 900, fontSize: 44, letterSpacing: 6, color: '#fff', opacity: 0.95}}>{amz ? 'AMAZON' : 'FLIPKART'}</div>
        <div style={{position: 'absolute', left: 52, top: 104, fontFamily: DISPLAY, fontWeight: 900, fontSize: 66, lineHeight: 1.0, color: acc, textShadow: `0 0 30px ${rgba(acc, 0.6)}`, width: w - 100}}>
          {amz ? 'GREAT INDIAN FESTIVAL' : 'BIG BILLION DAYS'}
        </div>
        <div style={{position: 'absolute', left: 52, bottom: 70, transformOrigin: '0% 100%', transform: `scale(${1 + zoom10 * 0.18})`}}>
          <div style={{fontFamily: DISPLAY, fontWeight: 950, fontSize: 210, lineHeight: 0.9, color: '#fff', letterSpacing: -8, textShadow: `0 0 50px ${rgba(acc, 0.7 * flick)}, 0 8px 0 rgba(0,0,0,0.25)`}}>10%</div>
          <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 40, color: '#fff', letterSpacing: 3}}>INSTANT DISCOUNT*</div>
          <div style={{fontFamily: NUM, fontSize: 20, color: 'rgba(255,255,255,0.55)', marginTop: 8}}>*on select bank cards. T&C apply</div>
        </div>
        {/* glass reflection */}
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.14) 42%, transparent 54%)'}} />
      </div>
    </div>
  );
};

const FINE_X = 320;
const FINE_Y = 560;
const FinePrint: React.FC<{hi: number}> = ({hi}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: 1280, fontFamily: DISPLAY, fontSize: 24, color: '#7a8190', lineHeight: 1.6}}>
    *Instant discount on select bank cards. <b style={{color: '#141820', background: rgba(K.amz, 0.35 * hi), padding: '2px 8px'}}>Maximum discount capped per category and per payment type.</b> Offer valid once per card. Bank T&amp;C apply.
  </div>
);

export const Scene1: React.FC = () => {
  const f = useCurrentFrame();
  const sp = useSp();
  const zA = eout(lin(f, W('w1_10pct') - 4, W('w1_10pct') + 26));
  // shot A: banners
  const camS = 1 + zA * 0.22;
  // shot B: phone + 30k price
  const pB = sp(S(2), SMOOTH);
  const ten = S(3);
  const p3000 = sp(W('w3_3000'), POP);
  // shot C: checkout fine print
  const c0 = S(4);
  const mag = eout(lin(f, c0 + 6, c0 + 40));
  const strike = lin(f, S(4, 0.55), S(4, 0.55) + 8);
  const glitch = f >= S(4, 0.55) && f < S(4, 0.55) + 10;
  return (
    <>
      <Shot from={0} to={S(2) - 4} fin={0} push={0.02} seed={1}>
        <Backdrop plate="warm" tint="#2A1C3E" />
        <AbsoluteFill style={{transform: `scale(${camS})`, transformOrigin: '50% 72%'}}>
          <FestBanner x={130} y={170} w={790} h={640} ry={14} side="amz" zoom10={zA} at={4} />
          <FestBanner x={1000} y={170} w={790} h={640} ry={-14} side="fk" zoom10={zA} at={14} />
        </AbsoluteFill>
        <div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', opacity: lin(f, W('w1_10pct'), W('w1_10pct') + 10)}}>
          <span style={{fontFamily: NUM, fontWeight: 800, fontSize: 30, letterSpacing: 8, color: '#fff', padding: '12px 26px', borderRadius: 14, background: 'rgba(0,0,0,0.55)', border: '2px solid rgba(255,255,255,0.25)'}}>BANNER CLAIM: 10% OFF</span>
        </div>
        <Flare at={W('w1_10pct')} x={960} y={640} color={K.amz} size={1200} />
        <Sfx at={W('w1_10pct')} name="title_hit" volume={0.28} />
        <Sfx at={4} name="air_whoosh" volume={0.2} />
      </Shot>

      <Shot from={S(2) - 4} to={S(4) - 2} push={0.05} seed={2}>
        <Backdrop plate="cool" tint="#14244A" />
        <ContactShadow x={640} y={900} w={480} o={0.7} />
        <Phone w={360} ry={-16 + 10 * lin(f, S(2), S(4))} rx={4} style={{left: 460, top: 80 + (1 - pB) * 200, opacity: pB}}>
          <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #ffffff, #EEF1F6)'}} />
          <div style={{position: 'absolute', left: 40, right: 40, top: 110, height: 380, borderRadius: 30, background: 'radial-gradient(circle at 50% 40%, #3b4a66, #121826)', overflow: 'hidden'}}>
            {/* product: a phone silhouette with camera bump */}
            <div style={{position: 'absolute', left: 95, top: 40, width: 160, height: 300, borderRadius: 30, background: 'linear-gradient(135deg, #5e6b85, #1c2333 60%, #3d4860)', boxShadow: '0 30px 40px rgba(0,0,0,0.5)'}}>
              <div style={{position: 'absolute', left: 16, top: 16, width: 70, height: 70, borderRadius: 18, background: '#0d1119'}}>
                <div style={{position: 'absolute', left: 8, top: 8, width: 24, height: 24, borderRadius: 12, background: 'radial-gradient(circle at 40% 40%, #5b6b9a, #05070b)'}} />
                <div style={{position: 'absolute', left: 38, top: 36, width: 24, height: 24, borderRadius: 12, background: 'radial-gradient(circle at 40% 40%, #5b6b9a, #05070b)'}} />
              </div>
            </div>
          </div>
          <div style={{position: 'absolute', left: 40, top: 520, fontSize: 30, fontWeight: 800, color: '#121826'}}>Smartphone 5G</div>
          <div style={{position: 'absolute', left: 40, top: 562, fontSize: 22, color: '#5b6577'}}>256 GB · Festival deal</div>
          <div style={{position: 'absolute', left: 40, top: 610, fontSize: 64, fontWeight: 900, color: '#121826', letterSpacing: -2}}>₹30,000</div>
          <div style={{position: 'absolute', left: 40, right: 40, top: 720, height: 76, borderRadius: 38, background: '#FFD814', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#111'}}>Buy Now</div>
        </Phone>
        {/* right side: the price thought */}
        <div style={{position: 'absolute', left: 1040, top: 250, width: 760}}>
          <Kicker text="the price you see" at={W('w2_30000') - 6} color={K.cyan} />
          <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 150, color: '#fff', letterSpacing: -5, marginTop: 10, opacity: lin(f, W('w2_30000') - 4, W('w2_30000') + 6), position: 'relative', display: 'inline-block'}}>
            ₹30,000
            <div style={{position: 'absolute', left: -10, right: -10, top: '52%', height: 12, borderRadius: 6, background: K.loss, transformOrigin: '0 50%', transform: `scaleX(${lin(f, ten + 20, ten + 34)})`, boxShadow: `0 0 20px ${K.loss}`}} />
          </div>
          <div style={{marginTop: 26, opacity: lin(f, ten, ten + 10), display: 'flex', alignItems: 'baseline', gap: 26}}>
            <span style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 74, color: K.amz}}>−10%</span>
            <span style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 74, color: '#fff', transform: `scale(${0.6 + 0.4 * p3000})`, display: 'inline-block'}}>= {rs(3000)} off</span>
          </div>
          <div style={{marginTop: 22, opacity: lin(f, W('w3_3000') + 20, W('w3_3000') + 32), fontFamily: DISPLAY, fontWeight: 900, fontSize: 120, color: K.win, letterSpacing: -4}}>
            ₹27,000<span style={{color: '#fff', fontSize: 130}}>?</span>
          </div>
        </div>
        <Sfx at={W('w2_30000')} name="node_pop" volume={0.3} />
        <Sfx at={W('w3_3000')} name="counter_spin" volume={0.22} />
      </Shot>

      <Shot from={S(4) - 2} to={S(5) - 4} push={0.06} seed={3}>
        <Backdrop plate="red" tint="#2A1220" bokeh={0.3} />
        <div style={{position: 'absolute', left: 260, top: 150, width: 1400, height: 720, borderRadius: 30, background: '#F7F8FA', boxShadow: '0 60px 140px rgba(0,0,0,0.7)', overflow: 'hidden', transform: `perspective(2400px) rotateX(${8 * (1 - mag)}deg)`, transformOrigin: '50% 100%'}}>
          <div style={{height: 90, background: '#131A22', display: 'flex', alignItems: 'center', padding: '0 40px', fontFamily: DISPLAY, fontWeight: 800, fontSize: 32, color: '#fff', gap: 20}}>
            <span style={{width: 18, height: 18, borderRadius: 9, background: K.win}} /> Checkout · Payment
          </div>
          <div style={{padding: '40px 60px', fontFamily: DISPLAY, color: '#141820'}}>
            <div style={{fontSize: 34, fontWeight: 800}}>Order total</div>
            <div style={{fontSize: 80, fontWeight: 900, letterSpacing: -2, marginTop: 6}}>₹30,000</div>
            <div style={{marginTop: 30, display: 'flex', alignItems: 'center', gap: 30}}>
              <div style={{position: 'relative', fontSize: 56, fontWeight: 900, color: '#0A7A44'}}>
                ₹3,000 DISCOUNT
                <div style={{position: 'absolute', left: -12, right: -12, top: '50%', height: 10, background: K.loss, transformOrigin: '0 50%', transform: `scaleX(${strike}) rotate(-3deg)`, boxShadow: `0 0 14px ${K.loss}`}} />
              </div>
            </div>

          </div>
          {glitch && (
            <>
              <div style={{position: 'absolute', inset: 0, background: `repeating-linear-gradient(0deg, rgba(255,0,80,0.18) 0 3px, transparent 3px 9px)`, transform: `translateX(${(rnd(f) - 0.5) * 40}px)`, mixBlendMode: 'multiply'}} />
              <div style={{position: 'absolute', left: 0, right: 0, top: 260 + rnd(f * 3) * 200, height: 50, background: 'rgba(0,200,255,0.35)', transform: `translateX(${(rnd(f + 1) - 0.5) * 120}px)`}} />
            </>
          )}
        </div>
        <div style={{position: 'absolute', left: FINE_X, top: FINE_Y, opacity: lin(f, c0 + 16, c0 + 34)}}>
          <FinePrint hi={mag} />
        </div>
        {/* magnifier: a real lens, the fine print enlarged inside it */}
        {(() => {
          const R = 190;
          const M = 1.75;
          const cx = interpolate(f, [c0 + 6, c0 + 40, S(4, 0.95)], [1700, 830, 1350], CL);
          const cy = FINE_Y + 20;
          return (
            <div style={{position: 'absolute', left: cx - R, top: cy - R, width: 2 * R, height: 2 * R, opacity: mag}}>
              <div style={{position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden', background: '#F7F8FA'}}>
                <div style={{position: 'absolute', left: FINE_X - (cx - R), top: FINE_Y - (cy - R), transform: `scale(${M})`, transformOrigin: `${cx - FINE_X}px ${cy - FINE_Y}px`}}>
                  <FinePrint hi={mag} />
                </div>
                <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.45), rgba(255,255,255,0) 38%), radial-gradient(circle, transparent 70%, rgba(0,0,0,0.25) 100%)'}} />
              </div>
              <div style={{position: 'absolute', inset: -14, borderRadius: '50%', border: '16px solid #1d2128', boxShadow: '0 30px 60px rgba(0,0,0,0.6), inset 0 0 0 2px rgba(255,255,255,0.25)'}} />
              <div style={{position: 'absolute', left: 2 * R - 20, top: 2 * R - 40, width: 50, height: 200, borderRadius: 20, background: 'linear-gradient(90deg, #2a2f38, #0e1014)', transform: 'rotate(-45deg)', transformOrigin: '25px 0'}} />
            </div>
          );
        })()}
        <div style={{position: 'absolute', left: 260, top: 885, width: 1400, textAlign: 'center', opacity: lin(f, S(4, 0.5), S(4, 0.5) + 10)}}>
          <span style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 52, color: '#fff'}}>The real limits show up <span style={{color: K.amz}}>at checkout</span></span>
        </div>
        <Sfx at={S(4, 0.55)} name="glitch.wav" volume={0.45} />
      </Shot>
    </>
  );
};

/* ================================================================== SCENE 2 — full-payment cap vs EMI bonus */

const OptionRow: React.FC<{y: number; title: string; sub: string; sel: number; color: string}> = ({y, title, sub, sel, color}) => (
  <div style={{position: 'absolute', left: 36, right: 36, top: y, height: 150, borderRadius: 24, background: sel > 0.5 ? rgba(color, 0.14) : '#fff', border: `3px solid ${sel > 0.5 ? color : '#D9DEE7'}`, display: 'flex', alignItems: 'center', padding: '0 30px', gap: 26, boxShadow: sel > 0.5 ? `0 0 0 6px ${rgba(color, 0.18)}` : 'none'}}>
    <div style={{width: 46, height: 46, borderRadius: 23, border: `4px solid ${sel > 0.5 ? color : '#9AA3B2'}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{width: 24, height: 24, borderRadius: 12, background: color, transform: `scale(${sel})`}} />
    </div>
    <div>
      <div style={{fontFamily: DISPLAY, fontWeight: 850, fontSize: 38, color: '#121826'}}>{title}</div>
      <div style={{fontFamily: DISPLAY, fontSize: 26, color: '#5b6577', marginTop: 4}}>{sub}</div>
    </div>
  </div>
);

export const Scene2: React.FC = () => {
  const f = useCurrentFrame();
  const sp = useSp();
  const a = S(5) - 4;
  const b = S(10) - 4;
  const selFull = lin(f, S(5, 0.25), S(5, 0.25) + 6) * (1 - lin(f, S(7, 0.35), S(7, 0.35) + 6));
  const selEmi = lin(f, S(7, 0.35), S(7, 0.35) + 6);
  const pct = lin(f, S(6, 0.1), S(6, 0.6));
  const pctVal = 10 - (10 - 3.33) * eout(pct);
  const bonusOn = f >= W('w8_500');
  const tot = sp(W('w9_750'), POP);
  return (
    <Shot from={a} to={b} push={0.04} seed={4}>
      <Backdrop plate="amz" tint="#1E2A3A" />
      {/* checkout panel */}
      <div style={{position: 'absolute', left: 120, top: 150, width: 760, height: 700, borderRadius: 34, background: '#F4F6FA', boxShadow: '0 60px 140px rgba(0,0,0,0.7)', overflow: 'hidden', transform: 'perspective(2400px) rotateY(10deg)', transformOrigin: '0% 50%'}}>
        <div style={{height: 96, background: '#131A22', display: 'flex', alignItems: 'center', padding: '0 36px', fontFamily: DISPLAY, fontWeight: 800, fontSize: 32, color: '#fff'}}>Select a payment method</div>
        <div style={{position: 'absolute', left: 36, top: 122, fontFamily: DISPLAY, fontSize: 26, color: '#5b6577'}}>Mobiles · Cart value</div>
        <div style={{position: 'absolute', left: 36, top: 156, fontFamily: DISPLAY, fontSize: 54, fontWeight: 900, color: '#121826'}}>₹30,000</div>
        <OptionRow y={250} title="Full card payment" sub="Pay ₹30,000 in one swipe" sel={selFull} color={K.cyan} />
        <OptionRow y={420} title="No Cost EMI · 6 months" sub="Credit card EMI" sel={selEmi} color={K.amz} />
        <div style={{position: 'absolute', left: 36, right: 36, top: 600, height: 70, borderRadius: 35, background: '#FFD814', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DISPLAY, fontWeight: 800, fontSize: 28, color: '#111'}}>Continue</div>
        <Cursor path={[{f: S(5) + 2, x: 700, y: 640}, {f: S(5, 0.22), x: 120, y: 325}, {f: S(7, 0.12), x: 140, y: 340}, {f: S(7, 0.33), x: 120, y: 495}]} taps={[S(5, 0.25), S(7, 0.35)]} />
      </div>
      <Sfx at={S(5, 0.25)} name="tactile_click" volume={0.35} />
      <Sfx at={S(7, 0.35)} name="tactile_click" volume={0.35} />

      {/* right: discount readout */}
      <div style={{position: 'absolute', left: 980, top: 110, width: 830}}>
        {/* full payment block */}
        <Glass accent={K.cyan} style={{position: 'relative', padding: '28px 36px', opacity: lin(f, S(5, 0.25), S(5, 0.25) + 10)}}>
          <div style={{fontFamily: NUM, fontSize: 24, letterSpacing: 5, color: K.cyan, fontWeight: 700}}>FULL PAYMENT</div>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 20, marginTop: 6}}>
            <span style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 92, color: '#fff', letterSpacing: -3}}>{f >= W('w5_1000') ? <Count a={W('w5_1000')} b={W('w5_1000') + 18} from={3000} to={1000} /> : '₹3,000?'}</span>
            <span style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 32, color: K.soft}}>max discount</span>
          </div>
          {/* 10% -> 3% bar */}
          <div style={{marginTop: 16, opacity: lin(f, S(6), S(6) + 8)}}>
            <div style={{height: 26, borderRadius: 13, background: 'rgba(255,255,255,0.1)', overflow: 'hidden'}}>
              <div style={{width: `${pctVal * 10}%`, height: '100%', borderRadius: 13, background: `linear-gradient(90deg, ${K.cyan}, ${pct > 0.5 ? K.loss : K.cyan})`}} />
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 10, fontFamily: DISPLAY, fontSize: 34, fontWeight: 800, color: '#fff'}}>
              <span>
                Not 10% → <span style={{color: K.loss}}>≈{pctVal.toFixed(1)}%</span>
              </span>
              <span style={{color: K.dim, fontSize: 26, fontFamily: NUM}}>₹1,000 ÷ ₹30,000</span>
            </div>
          </div>
        </Glass>
        {/* EMI block */}
        <Glass accent={K.amz} style={{position: 'relative', marginTop: 30, padding: '28px 36px', opacity: lin(f, S(7, 0.35), S(7, 0.35) + 10)}}>
          <div style={{fontFamily: NUM, fontSize: 24, letterSpacing: 5, color: K.amz, fontWeight: 700}}>NO COST EMI · 6 MONTHS</div>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 18, marginTop: 6, fontFamily: DISPLAY, fontWeight: 900, color: '#fff', whiteSpace: 'nowrap'}}>
            <span style={{fontSize: 66, opacity: lin(f, W('w7_1250'), W('w7_1250') + 8)}}>₹1,250</span>
            <span style={{fontSize: 50, color: K.amz, opacity: bonusOn ? 1 : 0}}>+&nbsp;₹500</span>
            <span style={{fontSize: 66, color: K.win, opacity: lin(f, W('w9_750') - 30, W('w9_750') - 20)}}>=&nbsp;₹1,750</span>
          </div>
          <div style={{marginTop: 10, display: 'flex', alignItems: 'center', gap: 14, opacity: lin(f, W('w8_29990'), W('w8_29990') + 10)}}>
            <span style={{fontFamily: NUM, fontSize: 26, color: K.soft}}>EMI bonus: cart ≥ ₹29,990</span>
            <Badge ok at={W('w8_29990') + 12} size={38} />
            <span style={{fontFamily: NUM, fontSize: 26, color: K.win, opacity: bonusOn ? 1 : 0}}>+₹500 bonus</span>
          </div>
        </Glass>
        {/* +750 badge */}
        <div style={{marginTop: 26, display: 'flex', justifyContent: 'center', opacity: lin(f, W('w9_750'), W('w9_750') + 4)}}>
          <div style={{transform: `scale(${0.5 + 0.5 * tot}) rotate(-2deg)`, padding: '18px 36px', borderRadius: 22, background: `linear-gradient(135deg, ${K.win}, #0FB57A)`, fontFamily: DISPLAY, fontWeight: 950, fontSize: 46, whiteSpace: 'nowrap', color: '#04150E', boxShadow: `0 0 60px ${rgba(K.win, 0.6)}`}}>+₹750 EXTRA DISCOUNT ON EMI</div>
        </div>
      </div>
      <Flare at={W('w9_750')} x={1400} y={900} color={K.win} />
      <Sfx at={W('w5_1000')} name="gauge_drop" volume={0.3} />
      <Sfx at={W('w8_500')} name="node_pop" volume={0.3} />
      <Sfx at={W('w9_750')} name="cash.wav" volume={0.5} />
    </Shot>
  );
};

/* ================================================================== SCENE 3 — the platform paradox */

const MiniPhone: React.FC<{x: number; y: number; tapAt: number; i: number}> = ({x, y, tapAt, i}) => {
  const f = useCurrentFrame();
  const on = f >= tapAt;
  const press = f >= tapAt && f < tapAt + 8 ? 0.94 : 1;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 200, height: 400, borderRadius: 34, background: 'linear-gradient(135deg, #8e939c, #2b2e35 60%, #7d828b)', padding: 6, boxShadow: '0 30px 60px rgba(0,0,0,0.6)', transform: `rotate(${(rnd(i) - 0.5) * 8}deg)`}}>
      <div style={{width: '100%', height: '100%', borderRadius: 28, background: '#F4F6FA', overflow: 'hidden', position: 'relative'}}>
        <div style={{position: 'absolute', left: 14, right: 14, top: 40, fontFamily: DISPLAY, fontWeight: 800, fontSize: 18, color: '#121826'}}>Pay with</div>
        <div style={{position: 'absolute', left: 14, right: 14, top: 76, height: 60, borderRadius: 12, border: '2px solid #D9DEE7', fontFamily: DISPLAY, fontSize: 15, color: '#5b6577', padding: '8px 10px'}}>Full payment</div>
        <div style={{position: 'absolute', left: 14, right: 14, top: 150, height: 80, borderRadius: 12, border: `3px solid ${on ? K.amz : '#D9DEE7'}`, background: on ? rgba(K.amz, 0.15) : '#fff', fontFamily: DISPLAY, fontSize: 16, fontWeight: 800, color: '#121826', padding: '8px 10px', transform: `scale(${press})`}}>
          No Cost EMI
          <div style={{fontWeight: 600, fontSize: 14, color: '#5b6577'}}>6 months</div>
          {on && <div style={{position: 'absolute', right: 8, top: 8, width: 26, height: 26, borderRadius: 13, background: K.win, color: '#04150E', fontSize: 18, fontWeight: 900, textAlign: 'center', lineHeight: '26px'}}>✓</div>}
        </div>
        <div style={{position: 'absolute', left: 14, right: 14, bottom: 26, height: 44, borderRadius: 22, background: '#FFD814', fontFamily: DISPLAY, fontWeight: 800, fontSize: 16, textAlign: 'center', lineHeight: '44px'}}>Place order</div>
      </div>
    </div>
  );
};

export const Scene3: React.FC = () => {
  const f = useCurrentFrame();
  const sp = useSp();
  const twist = S(11);
  const cmpA = S(12) - 6;
  return (
    <>
      {/* everyone taps EMI */}
      <Shot from={S(10) - 4} to={twist} push={0.08} seed={5}>
        <Backdrop plate="amz" tint="#1E2A3A" bokeh={0.35} />
        {Array.from({length: 7}).map((_, i) => (
          <MiniPhone key={i} i={i} x={110 + i * 245} y={300 + (i % 2) * 60} tapAt={S(10, 0.55) + i * 5} />
        ))}
        <div style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center'}}>
          <Headline at={S(10)} size={64} text={<>“It's No Cost EMI <span style={{color: K.amz}}>+ extra discount!</span>”</>} />
        </div>
        {Array.from({length: 7}).map((_, i) => (
          <Sfx key={i} at={S(10, 0.55) + i * 5} name="haptic_tap" volume={0.18} />
        ))}
      </Shot>

      {/* the twist */}
      <Shot from={twist} to={cmpA} fin={4} push={0.12} seed={6}>
        <Backdrop plate="red" tint="#2A0F1A" />
        <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{transform: `scale(${1.3 - 0.3 * sp(twist, POP)})`, textAlign: 'center'}}>
            <div style={{fontFamily: NUM, fontSize: 34, letterSpacing: 12, color: K.loss, fontWeight: 800}}>BUT HERE'S THE</div>
            <div style={{fontFamily: DISPLAY, fontWeight: 950, fontSize: 260, letterSpacing: -10, color: '#fff', textShadow: `0 0 80px ${rgba(K.loss, 0.7)}`, transform: `skewX(${f < twist + 6 ? (rnd(f) - 0.5) * 20 : 0}deg)`}}>TWIST</div>
          </div>
        </AbsoluteFill>
        <Flare at={twist + 2} x={960} y={540} color={K.loss} size={1500} />
        <Sfx at={twist} name="sub_thud" volume={0.5} />
        <Sfx at={twist} name="glitch.wav" volume={0.3} />
      </Shot>

      {/* split comparison with meters */}
      <Shot from={cmpA} to={S(14) - 4} push={0.04} seed={7}>
        <Backdrop plate="cool" tint="#121C33" />
        {/* left green half glow, right red */}
        <div style={{position: 'absolute', left: 0, top: 0, width: 960, height: 1080, background: `radial-gradient(circle at 50% 55%, ${rgba(K.win, 0.16 * lin(f, W('w12_449'), W('w12_449') + 20))}, transparent 60%)`}} />
        <div style={{position: 'absolute', left: 960, top: 0, width: 960, height: 1080, background: `radial-gradient(circle at 50% 55%, ${rgba(K.loss, 0.18 * lin(f, W('w13_336'), W('w13_336') + 20))}, transparent 60%)`}} />
        <div style={{position: 'absolute', left: 959, top: 140, width: 2, height: 760, background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.3), transparent)'}} />
        <div style={{position: 'absolute', left: 0, width: 960, top: 110, textAlign: 'center'}}>
          <Kicker text="Amazon × SBI Card" at={S(12)} color={K.amz} style={{fontSize: 34}} />
        </div>
        <div style={{position: 'absolute', left: 960, width: 960, top: 110, textAlign: 'center', opacity: lin(f, S(13), S(13) + 10)}}>
          <Kicker text="Flipkart × Axis / ICICI" at={S(13)} color={K.fkY} style={{fontSize: 34}} />
        </div>
        <CreditCard skin={SKINS.sbi} w={250} ry={-18} rx={6} style={{left: 30, top: 170, opacity: sp(S(12), SMOOTH)}} />
        <Gauge x={480} y={560} r={250} value={0.78} color={K.win} label="NET SAVING vs FULL PAY" big="+₹449" at={W('w12_449') - 8} />
        <div style={{opacity: sp(S(13), SMOOTH)}}>
          <CreditCard skin={SKINS.axis} w={270} ry={18} rx={6} rz={-6} style={{left: 1570, top: 180}} />
          <CreditCard skin={SKINS.icici} w={270} ry={18} rx={6} rz={4} style={{left: 1600, top: 250}} />
        </div>
        <Gauge x={1440} y={560} r={250} value={0.22} color={K.loss} label="NET LOSS vs FULL PAY" big="−₹336" at={W('w13_336') - 8} />
        <div style={{position: 'absolute', left: 760, width: 400, top: 830, textAlign: 'center'}}>
          <div style={{display: 'inline-block', padding: '14px 26px', borderRadius: 16, background: 'rgba(0,0,0,0.55)', border: '2px solid rgba(255,255,255,0.25)', fontFamily: NUM, fontSize: 24, letterSpacing: 3, color: K.soft}}>
            BASE REFERENCE
            <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 52, color: '#fff', letterSpacing: 0}}>₹30,000</div>
          </div>
        </div>
        <Sfx at={W('w12_449')} name="triumph_rise" volume={0.25} />
        <Sfx at={W('w13_336')} name="alert.wav" volume={0.4} />
      </Shot>

      {/* who pays? every paisa */}
      <Shot from={S(14) - 4} to={S(16) - 4} push={0.07} seed={8}>
        <Backdrop plate="warm" tint="#241A33" />
        <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20}}>
          <Headline at={S(14)} size={110} text={<>Who pays for <span style={{color: K.amz}}>No Cost EMI</span>?</>} />
          <div style={{opacity: lin(f, S(15), S(15) + 10), marginTop: 30, display: 'flex', gap: 40, alignItems: 'center'}}>
            <div style={{fontFamily: NUM, fontSize: 34, color: K.soft, letterSpacing: 4}}>BASE PRICE</div>
            <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 96, color: '#fff'}}>
              <Count a={S(15)} b={S(15) + 40} from={0} to={30000} dp={2} />
            </div>
          </div>
          <div style={{opacity: lin(f, S(15, 0.55), S(15, 0.55) + 10), fontFamily: DISPLAY, fontWeight: 800, fontSize: 44, color: K.gold}}>Every single paisa, calculated.</div>
        </AbsoluteFill>
        <Sfx at={S(15)} name="counter_spin" volume={0.25} />
      </Shot>
    </>
  );
};

/* ================================================================== SCENE 4 — who funds No Cost EMI */

const Node: React.FC<{x: number; y: number; label: string; sub: string; color: string; at: number; icon: React.ReactNode; hot?: number}> = ({x, y, label, sub, color, at, icon, hot = 0}) => {
  const sp = useSp();
  const p = sp(at, POP);
  return (
    <div style={{position: 'absolute', left: x - 170, top: y - 150, width: 340, textAlign: 'center', transform: `scale(${p})`}}>
      <div style={{margin: '0 auto', width: 210, height: 210, borderRadius: '50%', background: `radial-gradient(circle at 35% 30%, ${rgba(color, 0.55)}, ${rgba(color, 0.12)} 70%)`, border: `3px solid ${rgba(color, 0.8)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 30px 60px rgba(0,0,0,0.5), 0 0 ${40 + 60 * hot}px ${rgba(color, 0.35 + 0.4 * hot)}`}}>{icon}</div>
      <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 46, color: '#fff', marginTop: 16}}>{label}</div>
      <div style={{fontFamily: NUM, fontSize: 22, color: K.soft, letterSpacing: 2}}>{sub}</div>
    </div>
  );
};

const FlowArrow: React.FC<{x1: number; y1: number; x2: number; y2: number; t: number; color: string; label: React.ReactNode; lx: number; ly: number; f: number}> = ({x1, y1, x2, y2, t, color, label, lx, ly, f}) => {
  if (t <= 0) return null;
  const xe = x1 + (x2 - x1) * t;
  const ye = y1 + (y2 - y1) * t;
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const len = Math.hypot(x2 - x1, y2 - y1);
  return (
    <>
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}>
        <line x1={x1} y1={y1} x2={xe} y2={ye} stroke={rgba(color, 0.35)} strokeWidth={16} strokeLinecap="round" />
        <line x1={x1} y1={y1} x2={xe} y2={ye} stroke={color} strokeWidth={6} strokeLinecap="round" strokeDasharray="2 22" strokeDashoffset={-f * 2} />
        {t > 0.97 && <path d={`M ${xe - 30 * Math.cos(ang - 0.5)} ${ye - 30 * Math.sin(ang - 0.5)} L ${xe} ${ye} L ${xe - 30 * Math.cos(ang + 0.5)} ${ye - 30 * Math.sin(ang + 0.5)}`} stroke={color} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
        {/* coins travelling */}
        {t > 0.97 &&
          [0, 0.33, 0.66].map((o, i) => {
            const q = ((f / 45 + o) % 1);
            return <circle key={i} cx={x1 + (x2 - x1) * q} cy={y1 + (y2 - y1) * q} r={12} fill={color} opacity={Math.sin(q * Math.PI)} />;
          })}
      </svg>
      <div style={{position: 'absolute', left: lx, top: ly, transform: 'translate(-50%, -50%)', opacity: lin(t, 0.6, 1), padding: '14px 24px', borderRadius: 18, background: 'rgba(5,8,14,0.82)', border: `2px solid ${rgba(color, 0.7)}`, fontFamily: DISPLAY, fontWeight: 800, fontSize: 32, color: '#fff', whiteSpace: 'nowrap', textAlign: 'center', boxShadow: `0 0 30px ${rgba(color, 0.3)}`}}>{label}</div>
      {len < 0 && null}
    </>
  );
};

const IconUser = () => (
  <svg width={110} height={110} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.6}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
  </svg>
);
const IconBrand = () => (
  <svg width={100} height={110} viewBox="0 0 24 26" fill="none" stroke="#fff" strokeWidth={1.6}>
    <rect x="6" y="1.5" width="12" height="23" rx="2.5" />
    <circle cx="12" cy="21" r="1" fill="#fff" />
  </svg>
);
const IconBank = () => (
  <svg width={120} height={110} viewBox="0 0 26 24" fill="none" stroke="#fff" strokeWidth={1.6}>
    <path d="M2 9 L13 2 L24 9 Z" />
    <path d="M5 10 V19 M10 10 V19 M16 10 V19 M21 10 V19 M2 21.5 H24" />
  </svg>
);

export const Scene4: React.FC = () => {
  const f = useCurrentFrame();
  const sp = useSp();
  const q = S(16);
  return (
    <>
      {/* the doubt + RBI */}
      <Shot from={q - 4} to={S(19) - 4} push={0.06} seed={9}>
        <Backdrop plate="cool" tint="#14213D" />
        <div style={{position: 'absolute', left: 140, top: 170, width: 1000}}>
          <Kicker text="the doubt" at={q} color={K.cyan} />
          <Headline at={q + 4} size={86} text={<>Why would a bank lend you money at <span style={{color: K.cyan}}>0% interest</span>?</>} style={{marginTop: 14}} />
          <div style={{marginTop: 40, opacity: lin(f, S(17, 0.3), S(17, 0.3) + 10), fontFamily: DISPLAY, fontWeight: 900, fontSize: 70, color: K.loss}}>Banks give nothing for free.</div>
        </div>
        {/* vault/bank 3D-ish */}
        <div style={{position: 'absolute', left: 1240, top: 250, width: 520, height: 520, opacity: sp(q, SMOOTH)}}>
          <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #5d6676, #1b1f27 65%)', boxShadow: '0 50px 100px rgba(0,0,0,0.7), inset 0 0 0 18px #2b313c, inset 0 0 0 26px #0e1116'}} />
          <div style={{position: 'absolute', left: 160, top: 160, width: 200, height: 200, borderRadius: '50%', border: '14px solid #9aa3b2', transform: `rotate(${f * 1.5}deg)`}}>
            {[0, 60, 120].map((a) => (
              <div key={a} style={{position: 'absolute', left: 79, top: -40, width: 14, height: 250, background: '#9aa3b2', borderRadius: 7, transform: `rotate(${a}deg)`, transformOrigin: '7px 125px'}} />
            ))}
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 210, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 950, fontSize: 90, color: '#fff', textShadow: '0 4px 20px #000', opacity: 1 - lin(f, S(18), S(18) + 6)}}>0%?</div>
        </div>
        <Stamp at={S(18, 0.15)} text="RBI: NO 0% INTEREST LOANS" color={K.loss} x={1180} y={830} rot={-6} size={58} />
        <Sfx at={S(18, 0.15)} name="stamp_heavy" volume={0.45} />
      </Shot>

      {/* triangle flow */}
      <Shot from={S(19) - 4} to={S(25) - 4} push={0.03} seed={10}>
        <Backdrop plate="warm" tint="#1E1733" />
        {(() => {
          const U = {x: 960, y: 760};
          const B = {x: 420, y: 330};
          const N = {x: 1500, y: 330};
          const tA = eout(lin(f, W('w21_1270') - 20, W('w21_1270') + 10));
          const tB = eout(lin(f, S(24), S(24) + 20));
          const hotBrand = lin(f, S(20), S(20) + 10);
          return (
            <>
              <FlowArrow x1={B.x + 150} y1={B.y} x2={N.x - 150} y2={N.y} t={tA} color={K.gold} label={<>≈ ₹1,270 interest <span style={{color: K.gold}}>paid by brand</span></>} lx={960} ly={250} f={f} />
              <FlowArrow x1={N.x - 60} y1={N.y + 130} x2={U.x + 140} y2={U.y - 70} t={tB} color={K.loss} label={<>Processing fee + <span style={{color: K.loss}}>GST on interest</span></>} lx={1420} ly={600} f={f} />
              <Node x={U.x} y={U.y} label="YOU" sub="BUYER" color={K.cyan} at={S(19) + 4} icon={<IconUser />} hot={lin(f, S(24), S(24) + 10)} />
              <Node x={B.x} y={B.y} label="BRAND / SELLER" sub="PAYS THE INTEREST" color={K.gold} at={S(19) + 10} icon={<IconBrand />} hot={hotBrand} />
              <Node x={N.x} y={N.y} label="BANK" sub="GETS ITS INTEREST" color={K.violet} at={S(19) + 16} icon={<IconBank />} hot={lin(f, S(23), S(23) + 10)} />
              {/* upfront discount tag on brand side */}
              <div style={{position: 'absolute', left: 150, top: 560, width: 560, opacity: lin(f, S(21, 0.62), S(21, 0.62) + 12)}}>
                <Glass accent={K.gold} style={{position: 'relative', padding: '20px 28px'}}>
                  <div style={{fontFamily: NUM, fontSize: 22, letterSpacing: 4, color: K.gold}}>SHOWS UP AS</div>
                  <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 40, color: '#fff'}}>an upfront discount on the phone price</div>
                </Glass>
              </div>
              {/* brand gains volume */}
              <div style={{position: 'absolute', left: 150, top: 790, opacity: lin(f, S(22), S(22) + 10), display: 'flex', alignItems: 'flex-end', gap: 10}}>
                {[30, 46, 62, 88, 120].map((h, i) => (
                  <div key={i} style={{width: 34, height: h * eout(lin(f, S(22) + i * 3, S(22) + i * 3 + 12)), borderRadius: 6, background: `linear-gradient(180deg, ${K.win}, ${rgba(K.win, 0.3)})`}} />
                ))}
                <div style={{fontFamily: DISPLAY, fontWeight: 850, fontSize: 34, color: K.win, marginLeft: 12}}>Brand: more sales ↑</div>
              </div>
              <div style={{position: 'absolute', left: 1690, top: 280, width: 220, opacity: lin(f, S(23), S(23) + 10), fontFamily: DISPLAY, fontWeight: 850, fontSize: 30, lineHeight: 1.15, color: K.violet}}>Interest received from brand ✓</div>
            </>
          );
        })()}
        <Kicker text="who really pays" at={S(19)} color={K.gold} style={{position: 'absolute', left: 0, right: 0, top: 92, textAlign: 'center'}} />
        <Sfx at={W('w21_1270') - 10} name="plasma_sweep" volume={0.25} />
        <Sfx at={S(24)} name="warning_pulse" volume={0.25} />
      </Shot>
    </>
  );
};

export {E, CL};
