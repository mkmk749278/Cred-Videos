import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {DISPLAY, K, NUM, lin, rgba, eout, useSp, POP} from './core';

/* ------------------------------------------------------------------ credit card (CSS 3D, physically lit) */

export type CardSkin = {base: string; base2: string; ink?: string; bank: string; tag: string; accent: string; metal?: boolean};
export const SKINS: Record<string, CardSkin> = {
  sbi: {base: '#0B2A6F', base2: '#1D5BD8', bank: 'SBI Card', tag: 'CREDIT', accent: '#7FB2FF'},
  axis: {base: '#5A0F2E', base2: '#A3195B', bank: 'Axis Bank', tag: 'CREDIT', accent: '#FF8FC0'},
  icici: {base: '#5B1A0A', base2: '#C2410C', bank: 'ICICI Bank', tag: 'CREDIT', accent: '#FFB38A'},
  cashback: {base: '#111317', base2: '#3A3F4A', bank: '5% CASHBACK', tag: 'CO-BRANDED', accent: '#F6C453', metal: true},
  fkaxis: {base: '#0E2A66', base2: '#2874F0', bank: 'Axis Bank', tag: 'CO-BRANDED', accent: '#FFE11B'},
};

const Chip: React.FC = () => (
  <svg width={92} height={70} viewBox="0 0 92 70">
    <defs>
      <linearGradient id="chipg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#F9E3A3" />
        <stop offset="0.45" stopColor="#C9A24B" />
        <stop offset="0.7" stopColor="#F1D489" />
        <stop offset="1" stopColor="#9C7A2E" />
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="90" height="68" rx="12" fill="url(#chipg)" stroke="#7A5E22" strokeWidth="1.5" />
    <path d="M1 24 H30 M1 46 H30 M62 24 H91 M62 46 H91 M30 1 V69 M62 1 V69 M30 35 H62" stroke="#8A6A28" strokeWidth="2" fill="none" opacity="0.8" />
  </svg>
);

/** A credit card with thickness, specular sheen that follows rotation, brushed/foil texture. */
export const CreditCard: React.FC<{skin: CardSkin; w?: number; rx?: number; ry?: number; rz?: number; last4?: string; style?: React.CSSProperties; glow?: number}> = ({skin, w = 640, rx = 0, ry = 0, rz = 0, last4 = '4821', style, glow = 0}) => {
  const h = w * 0.63;
  const u = w / 640;
  const sheen = 50 + ry * 1.6 - rx * 0.8;
  const layers = 6;
  return (
    <div style={{position: 'absolute', width: w, height: h, transformStyle: 'preserve-3d', transform: `perspective(2200px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`, ...style}}>
      {/* edge thickness */}
      {Array.from({length: layers}).map((_, i) => (
        <div key={i} style={{position: 'absolute', inset: 0, borderRadius: 30 * u, background: i === layers - 1 ? '#0a0a0a' : `linear-gradient(90deg, #d9dde5, #8d95a3)`, transform: `translateZ(${-(i + 1) * 1.2 * u}px)`}} />
      ))}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 30 * u,
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${skin.base} 0%, ${skin.base2} 60%, ${skin.base} 100%)`,
          boxShadow: `0 ${50 * u}px ${110 * u}px rgba(0,0,0,0.6), inset 0 0 0 ${1.5 * u}px rgba(255,255,255,0.18)${glow ? `, 0 0 ${120 * u}px ${rgba(skin.accent, 0.5 * glow)}` : ''}`,
        }}
      >
        <Img src={staticFile('v02/brushed.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: skin.metal ? 0.5 : 0.18, mixBlendMode: 'soft-light'}} />
        {/* wave guilloche */}
        <svg style={{position: 'absolute', inset: 0}} width={w} height={h} viewBox="0 0 640 403" preserveAspectRatio="none">
          {Array.from({length: 14}).map((_, i) => (
            <path key={i} d={`M -20 ${250 + i * 12} C 160 ${170 + i * 9}, 360 ${360 - i * 6}, 680 ${200 + i * 10}`} stroke={rgba(skin.accent, 0.13)} strokeWidth="1.4" fill="none" />
          ))}
        </svg>
        {/* specular sweep */}
        <div style={{position: 'absolute', inset: -2, background: `linear-gradient(115deg, transparent ${sheen - 28}%, rgba(255,255,255,0.28) ${sheen - 6}%, rgba(255,255,255,0.05) ${sheen + 4}%, transparent ${sheen + 22}%)`, mixBlendMode: 'screen'}} />
        {/* holographic foil strip */}
        <div style={{position: 'absolute', right: 40 * u, bottom: 40 * u, width: 96 * u, height: 62 * u, borderRadius: 10 * u, background: `linear-gradient(${120 + ry * 3}deg, #ff9ad5, #9ad8ff, #c3ffa8, #ffe28a, #ff9ad5)`, opacity: 0.75, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.4)'}} />
        <div style={{position: 'absolute', left: 44 * u, top: 36 * u, fontFamily: DISPLAY, fontWeight: 900, fontSize: 40 * u, color: '#fff', letterSpacing: -0.5, textShadow: '0 2px 6px rgba(0,0,0,0.35)'}}>{skin.bank}</div>
        <div style={{position: 'absolute', right: 44 * u, top: 44 * u, fontFamily: NUM, fontWeight: 700, fontSize: 20 * u, letterSpacing: 4 * u, color: rgba('#ffffff', 0.75)}}>{skin.tag}</div>
        <div style={{position: 'absolute', left: 50 * u, top: 128 * u, transform: `scale(${u})`, transformOrigin: '0 0'}}>
          <Chip />
        </div>
        {/* contactless */}
        <svg style={{position: 'absolute', left: 160 * u, top: 138 * u}} width={44 * u} height={50 * u} viewBox="0 0 44 50">
          {[10, 20, 30].map((r, i) => (
            <path key={i} d={`M ${8 + i * 9} ${25 - r * 0.7} A ${r} ${r} 0 0 1 ${8 + i * 9} ${25 + r * 0.7}`} stroke="rgba(255,255,255,0.8)" strokeWidth="3.4" fill="none" strokeLinecap="round" />
          ))}
        </svg>
        <div style={{position: 'absolute', left: 50 * u, top: 236 * u, fontFamily: NUM, fontWeight: 600, fontSize: 40 * u, letterSpacing: 5 * u, color: '#F2F4F8', textShadow: '0 1.5px 0 rgba(0,0,0,0.45), 0 -1px 0 rgba(255,255,255,0.35)'}}>
          •••• •••• •••• {last4}
        </div>
        <div style={{position: 'absolute', left: 50 * u, bottom: 38 * u, fontFamily: NUM, fontSize: 22 * u, letterSpacing: 3 * u, color: 'rgba(255,255,255,0.85)'}}>CARDHOLDER NAME</div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ phone */

export const Phone: React.FC<{w?: number; children: React.ReactNode; ry?: number; rx?: number; style?: React.CSSProperties; dark?: boolean}> = ({w = 480, children, ry = 0, rx = 0, style, dark = false}) => {
  const h = w * 2.06;
  const u = w / 480;
  return (
    <div style={{position: 'absolute', width: w, height: h, transform: `perspective(2600px) rotateX(${rx}deg) rotateY(${ry}deg)`, ...style}}>
      {/* titanium frame */}
      <div style={{position: 'absolute', inset: 0, borderRadius: 74 * u, background: 'linear-gradient(135deg, #8E939C 0%, #3C4048 22%, #9EA3AC 50%, #2B2E35 78%, #7D828B 100%)', boxShadow: `0 ${70 * u}px ${140 * u}px rgba(0,0,0,0.7), 0 ${10 * u}px ${30 * u}px rgba(0,0,0,0.5)`}} />
      {/* side buttons */}
      <div style={{position: 'absolute', right: -5 * u, top: 250 * u, width: 6 * u, height: 120 * u, borderRadius: 3, background: '#5d626b'}} />
      <div style={{position: 'absolute', left: -5 * u, top: 200 * u, width: 6 * u, height: 70 * u, borderRadius: 3, background: '#5d626b'}} />
      <div style={{position: 'absolute', left: -5 * u, top: 290 * u, width: 6 * u, height: 70 * u, borderRadius: 3, background: '#5d626b'}} />
      <div style={{position: 'absolute', inset: 9 * u, borderRadius: 66 * u, background: '#000'}} />
      <div style={{position: 'absolute', inset: 20 * u, borderRadius: 56 * u, overflow: 'hidden', background: dark ? '#0B0F17' : '#F3F4F7', fontFamily: DISPLAY}}>
        {children}
        {/* dynamic island */}
        <div style={{position: 'absolute', top: 18 * u, left: '50%', width: 150 * u, height: 42 * u, marginLeft: -75 * u, borderRadius: 30 * u, background: '#000'}} />
        {/* glass reflection */}
        <div style={{position: 'absolute', inset: 0, background: `linear-gradient(${118 + ry * 0.8}deg, rgba(255,255,255,0.0) 30%, rgba(255,255,255,0.16) 42%, rgba(255,255,255,0.0) 55%)`, pointerEvents: 'none'}} />
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ receipt (thermal print-out) */

export type RLine = {at: number; l: string; r?: React.ReactNode; color?: string; bold?: boolean; big?: boolean; rule?: boolean; note?: string};

/** Thermal receipt that feeds out of a printer slot; lines print at their frames. */
export const Receipt: React.FC<{x: number; y: number; w: number; title: string; sub?: string; lines: RLine[]; from: number; accent?: string; maxH?: number}> = ({x, y, w, title, sub, lines, from, accent = '#222', maxH = 760}) => {
  const f = useCurrentFrame();
  const shown = lines.filter((ln) => f >= ln.at);
  const lineH = (ln: RLine) => (ln.rule ? 26 : ln.big ? 84 : ln.note ? 66 : 56);
  const headH = 130;
  const target = headH + shown.reduce((a, ln) => a + lineH(ln), 0) + 40;
  // the paper eases out towards its target length (printer feed)
  const lastAt = shown.length ? shown[shown.length - 1].at : from;
  const prevH = headH + shown.slice(0, -1).reduce((a, ln) => a + lineH(ln), 0) + 40;
  const hNow = shown.length ? prevH + (target - prevH) * eout(lin(f, lastAt, lastAt + 9)) : headH * eout(lin(f, from, from + 14)) + 40;
  const h = Math.min(maxH, hNow);
  const scroll = Math.max(0, hNow - maxH);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w}}>
      {/* printer slot */}
      <div style={{position: 'absolute', left: -30, top: -34, width: w + 60, height: 46, borderRadius: 16, background: 'linear-gradient(180deg, #3a3f48, #16191f)', boxShadow: '0 20px 40px rgba(0,0,0,0.6), inset 0 2px 0 rgba(255,255,255,0.15)', zIndex: 2}}>
        <div style={{position: 'absolute', left: 24, right: 24, top: 26, height: 8, borderRadius: 4, background: '#05060a'}} />
        <div style={{position: 'absolute', right: 30, top: 10, width: 10, height: 10, borderRadius: 5, background: f % 20 < 10 && f - lastAt < 30 ? '#21E59B' : '#2a5c45', boxShadow: '0 0 10px #21E59B'}} />
      </div>
      <div
        style={{
          position: 'relative',
          width: w,
          height: h,
          overflow: 'hidden',
          backgroundImage: `url(${staticFile('v02/paper.png')})`,
          backgroundSize: 'cover',
          boxShadow: '0 40px 80px rgba(0,0,0,0.55)',
          clipPath: `polygon(0 0, 100% 0, 100% calc(100% - 12px), ${Array.from({length: 24}, (_, i) => `${100 - (i + 0.5) * (100 / 24)}% ${i % 2 ? 'calc(100% - 12px)' : '100%'}`).join(', ')}, 0 calc(100% - 12px))`,
        }}
      >
        {/* paper curl shading */}
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,0.10), transparent 12%, transparent 88%, rgba(0,0,0,0.12))', zIndex: 1}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: -scroll, padding: '26px 34px', fontFamily: NUM, color: '#1b1d22'}}>
          <div style={{textAlign: 'center', fontFamily: DISPLAY, fontWeight: 900, fontSize: 34, letterSpacing: 1, color: accent}}>{title}</div>
          {sub && <div style={{textAlign: 'center', fontSize: 20, color: '#555', marginTop: 6, letterSpacing: 2}}>{sub}</div>}
          <div style={{borderTop: '3px dashed #9a9a9a', margin: '18px 0 10px'}} />
          {shown.map((ln, i) => {
            const o = lin(f, ln.at, ln.at + 6);
            if (ln.rule) return <div key={i} style={{borderTop: '3px dashed #9a9a9a', margin: '11px 0', opacity: o}} />;
            return (
              <div key={i} style={{height: lineH(ln), display: 'flex', flexDirection: 'column', justifyContent: 'center', opacity: o}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: ln.big ? 40 : 29, fontWeight: ln.bold || ln.big ? 800 : 500, color: ln.color ?? '#1b1d22'}}>
                  <span style={{fontFamily: ln.big ? DISPLAY : NUM, letterSpacing: ln.big ? 0 : -0.5}}>{ln.l}</span>
                  <span style={{fontVariantNumeric: 'tabular-nums'}}>{ln.r}</span>
                </div>
                {ln.note && <div style={{fontSize: 19, color: '#6a6a6a', marginTop: 2}}>{ln.note}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ neon gauge */

export const Gauge: React.FC<{x: number; y: number; r: number; value: number; color: string; label: string; big: React.ReactNode; at: number}> = ({x, y, r, value, color, label, big, at}) => {
  const f = useCurrentFrame();
  const sp = useSp();
  const p = sp(at, {mass: 1.2, stiffness: 60, damping: 11});
  const v = value * p;
  const a0 = Math.PI * 0.8;
  const a1 = Math.PI * 2.2;
  const arc = (t: number) => {
    const a = a0 + (a1 - a0) * t;
    return [x + r * Math.cos(a), y + r * Math.sin(a)];
  };
  const [sx, sy] = arc(0);
  const [ex, ey] = arc(Math.max(0.001, v));
  const large = (a1 - a0) * v > Math.PI ? 1 : 0;
  const [fx, fy] = arc(1);
  const na = a0 + (a1 - a0) * v;
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}>
      <defs>
        <filter id={`gl${label.length}${Math.round(x)}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>
      <path d={`M ${sx} ${sy} A ${r} ${r} 0 1 1 ${fx} ${fy}`} stroke="rgba(255,255,255,0.08)" strokeWidth={26} fill="none" strokeLinecap="round" />
      {Array.from({length: 21}).map((_, i) => {
        const a = a0 + ((a1 - a0) * i) / 20;
        const r1 = r - 34;
        const r2 = r - (i % 5 === 0 ? 58 : 46);
        return <line key={i} x1={x + r1 * Math.cos(a)} y1={y + r1 * Math.sin(a)} x2={x + r2 * Math.cos(a)} y2={y + r2 * Math.sin(a)} stroke="rgba(255,255,255,0.35)" strokeWidth={i % 5 === 0 ? 4 : 2} />;
      })}
      <path d={`M ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey}`} stroke={color} strokeWidth={26} fill="none" strokeLinecap="round" filter={`url(#gl${label.length}${Math.round(x)})`} opacity={0.9} />
      <path d={`M ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey}`} stroke={color} strokeWidth={18} fill="none" strokeLinecap="round" />
      <line x1={x} y1={y} x2={x + (r - 70) * Math.cos(na)} y2={y + (r - 70) * Math.sin(na)} stroke="#fff" strokeWidth={7} strokeLinecap="round" />
      <circle cx={x} cy={y} r={18} fill="#fff" />
      <circle cx={x} cy={y} r={9} fill={color} />
      <text x={x} y={y + r * 0.62} textAnchor="middle" fontFamily={DISPLAY} fontWeight={900} fontSize={r * 0.36} fill={color} opacity={lin(f, at + 10, at + 20)}>
        {big}
      </text>
      <text x={x} y={y + r * 0.62 + 46} textAnchor="middle" fontFamily={NUM} fontWeight={700} fontSize={24} letterSpacing={4} fill="rgba(255,255,255,0.8)">
        {label}
      </text>
    </svg>
  );
};

/* ------------------------------------------------------------------ stamp */

export const Stamp: React.FC<{at: number; text: string; color: string; x: number; y: number; rot?: number; size?: number}> = ({at, text, color, x, y, rot = -8, size = 64}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const t = lin(f, at, at + 7);
  const s = 2.2 - 1.2 * eout(t);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${s})`, opacity: Math.min(1, t * 2), padding: `${size * 0.18}px ${size * 0.4}px`, border: `${size * 0.09}px solid ${color}`, borderRadius: size * 0.2, color, fontFamily: DISPLAY, fontWeight: 900, fontSize: size, letterSpacing: 2, whiteSpace: 'nowrap', background: rgba(color, 0.08), boxShadow: `0 0 40px ${rgba(color, 0.35)}`, maskImage: `url(${staticFile('v02/grain.png')})`, WebkitMaskImage: `url(${staticFile('v02/grain.png')})`, WebkitMaskSize: '300px', maskSize: '300px'}}>
      {text}
    </div>
  );
};

/* ------------------------------------------------------------------ cursor with tap ripple */

export const Cursor: React.FC<{path: {f: number; x: number; y: number}[]; taps?: number[]}> = ({path, taps = []}) => {
  const f = useCurrentFrame();
  if (f < path[0].f - 8) return null;
  let i = 0;
  while (i + 1 < path.length && f >= path[i + 1].f) i++;
  const a = path[i];
  const b = path[Math.min(i + 1, path.length - 1)];
  const t = b.f > a.f ? eout(lin(f, a.f, b.f)) : 0;
  const x = a.x + (b.x - a.x) * t;
  const y = a.y + (b.y - a.y) * t;
  const tap = taps.find((tf) => f >= tf && f < tf + 18);
  const press = tap !== undefined ? 1 - Math.abs(lin(f, tap, tap + 8) * 2 - 1) : 0;
  return (
    <>
      {tap !== undefined && (
        <div style={{position: 'absolute', left: x - 60, top: y - 60, width: 120, height: 120, borderRadius: '50%', border: '4px solid rgba(255,255,255,0.8)', transform: `scale(${0.3 + lin(f, tap, tap + 18) * 1.2})`, opacity: 1 - lin(f, tap, tap + 18)}} />
      )}
      <svg style={{position: 'absolute', left: x - 6, top: y - 4, transform: `scale(${1 - press * 0.15})`, filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.5))', opacity: lin(f, path[0].f - 8, path[0].f)}} width={56} height={70} viewBox="0 0 28 35">
        <path d="M2 2 L2 27 L8.5 21 L13 31 L17 29.2 L12.6 19.4 L21 19.4 Z" fill="#fff" stroke="#111" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    </>
  );
};

/** green/red round badge with tick/cross */
export const Badge: React.FC<{ok: boolean; at: number; size?: number; style?: React.CSSProperties}> = ({ok, at, size = 64, style}) => {
  const sp = useSp();
  const p = sp(at, POP);
  const c = ok ? K.win : K.loss;
  return (
    <div style={{width: size, height: size, borderRadius: '50%', background: c, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${p})`, boxShadow: `0 0 30px ${rgba(c, 0.6)}`, ...style}}>
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24">
        {ok ? <path d="M4 12.5 L10 18 L20 6" stroke="#04150E" strokeWidth="3.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /> : <path d="M6 6 L18 18 M18 6 L6 18" stroke="#2A0508" strokeWidth="3.6" strokeLinecap="round" />}
      </svg>
    </div>
  );
};
