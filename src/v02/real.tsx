import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {DISPLAY, NUM, K, ease, lin, rgba} from './core';

/**
 * Real pages captured from amazon.in / flipkart.com on 6 Oct 2026 (desktop, 1440 px wide, 2x),
 * shown in a browser window with a frame-driven camera (scroll + zoom), highlights and a cursor.
 * All coordinates are CSS px of the 1440-wide page.
 */
export const PAGES = {
  amzSale: {src: 'v02/real/amz_sale.jpg', h: 2200, url: 'amazon.in/mobile-phones', tab: 'Mobiles · Great Indian Festival'},
  amzSearch: {src: 'v02/real/amz_search.jpg', h: 1800, url: 'amazon.in/s?k=5g+smartphone', tab: 'Amazon.in : 5g smartphone'},
  amzPdp: {src: 'v02/real/amz_pdp.jpg', h: 900, url: 'amazon.in/Samsung-Galaxy-A36-5G/dp/B0HJ2G5LD5', tab: 'Samsung A36 5G — Amazon.in'},
  fkHome: {src: 'v02/real/fk_home.jpg', h: 900, url: 'flipkart.com', tab: 'Flipkart — Big Billion Days'},
  fkSearch: {src: 'v02/real/fk_search.jpg', h: 900, url: 'flipkart.com/search?q=samsung+a36+5g', tab: 'Samsung A36 5G — Flipkart'},
  fkPdp: {src: 'v02/real/fk_pdp.jpg', h: 1800, url: 'flipkart.com/samsung-galaxy-a36-5g/p/itma5b5834a73d65', tab: 'Galaxy A36 5G — Flipkart'},
} as const;
export type PageKey = keyof typeof PAGES;
export const PAGE_W = 1440;

export type CamKey = {f: number; x: number; y: number; s: number};
/** page point (x, y) at the viewport centre, zoom s (1 = page fills the viewport width) */
export const camAt = (f: number, keys: CamKey[], dur = 24) => {
  let cur = {x: keys[0].x, y: keys[0].y, s: keys[0].s};
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f < k.f) break;
    const t = ease(lin(f, k.f, k.f + dur));
    cur = {x: cur.x + (k.x - cur.x) * t, y: cur.y + (k.y - cur.y) * t, s: cur.s + (k.s - cur.s) * t};
  }
  return cur;
};

export type Mark = {at: number; until?: number; x: number; y: number; w: number; h: number; color?: string; label?: string; side?: 'top' | 'bottom' | 'left' | 'right'};

const MarkBox: React.FC<{m: Mark; inv: number}> = ({m, inv}) => {
  const f = useCurrentFrame();
  const t = Math.min(lin(f, m.at, m.at + 8), m.until ? 1 - lin(f, m.until, m.until + 8) : 1);
  if (t <= 0) return null;
  const c = m.color ?? K.amz;
  const bw = 5 * inv;
  const lab = m.label;
  const side = m.side ?? 'bottom';
  return (
    <>
      <div style={{position: 'absolute', left: m.x - 6 * inv, top: m.y - 6 * inv, width: m.w + 12 * inv, height: m.h + 12 * inv, borderRadius: 12 * inv, border: `${bw}px solid ${c}`, boxShadow: `0 0 ${30 * inv}px ${rgba(c, 0.7)}, inset 0 0 ${20 * inv}px ${rgba(c, 0.25)}`, opacity: t, transform: `scale(${1.08 - 0.08 * t})`}} />
      {lab && (
        <div
          style={{
            position: 'absolute',
            ...(side === 'bottom' ? {left: m.x, top: m.y + m.h + 16 * inv} : side === 'top' ? {left: m.x, top: m.y - 70 * inv} : side === 'right' ? {left: m.x + m.w + 20 * inv, top: m.y + m.h / 2 - 28 * inv} : {left: m.x - 20 * inv, top: m.y + m.h / 2 - 28 * inv, transform: 'translateX(-100%)'}),
            padding: `${8 * inv}px ${16 * inv}px`,
            borderRadius: 10 * inv,
            background: c,
            color: '#0A0D14',
            fontFamily: DISPLAY,
            fontWeight: 900,
            fontSize: 28 * inv,
            whiteSpace: 'nowrap',
            opacity: t,
            boxShadow: `0 ${8 * inv}px ${24 * inv}px rgba(0,0,0,0.45)`,
          }}
        >
          {lab}
        </div>
      )}
    </>
  );
};

/** one page shown between frames [from, to) inside a RealWindow */
export type Leg = {page: PageKey; from: number; to?: number; cam: CamKey[]; marks?: Mark[]; cursor?: {f: number; x: number; y: number}[]; taps?: number[]};

const Pointer: React.FC<{path: {f: number; x: number; y: number}[]; taps: number[]; inv: number}> = ({path, taps, inv}) => {
  const f = useCurrentFrame();
  if (!path.length || f < path[0].f - 6) return null;
  let i = 0;
  while (i + 1 < path.length && f >= path[i + 1].f) i++;
  const a = path[i];
  const b = path[Math.min(i + 1, path.length - 1)];
  const t = b.f > a.f ? ease(lin(f, a.f, b.f)) : 0;
  const x = a.x + (b.x - a.x) * t;
  const y = a.y + (b.y - a.y) * t;
  const tap = taps.filter((tf) => f >= tf && f < tf + 20).pop();
  return (
    <>
      {tap !== undefined && <div style={{position: 'absolute', left: x - 50 * inv, top: y - 50 * inv, width: 100 * inv, height: 100 * inv, borderRadius: '50%', border: `${5 * inv}px solid ${K.amz}`, background: rgba(K.amz, 0.18), transform: `scale(${0.3 + lin(f, tap, tap + 20) * 1.3})`, opacity: 1 - lin(f, tap, tap + 20)}} />}
      <svg style={{position: 'absolute', left: x - 4 * inv, top: y - 3 * inv, width: 34 * inv, height: 44 * inv, filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.45))', transform: `scale(${tap !== undefined && f < tap + 6 ? 0.85 : 1})`, transformOrigin: '0 0'}} viewBox="0 0 28 35">
        <path d="M2 2 L2 27 L8.5 21 L13 31 L17 29.2 L12.6 19.4 L21 19.4 Z" fill="#fff" stroke="#111" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    </>
  );
};

/** Browser window showing real pages; legs switch pages with a short cross-fade (a click / navigation). */
export const RealWindow: React.FC<{x: number; y: number; w: number; h: number; legs: Leg[]; ry?: number; rx?: number; style?: React.CSSProperties; dark?: boolean; tag?: boolean}> = ({x, y, w, h, legs, ry = 0, rx = 0, style, tag = true}) => {
  const f = useCurrentFrame();
  let li = 0;
  legs.forEach((l, i) => {
    if (f >= l.from) li = i;
  });
  const bar = 54;
  const vw = w;
  const vh = h - bar;
  const base = vw / PAGE_W;
  const leg = legs[li];
  const page = PAGES[leg.page];
  const navT = lin(f, leg.from, leg.from + 10);
  const renderLeg = (l: Leg, o: number) => {
    const p = PAGES[l.page];
    const c = camAt(f, l.cam);
    const s = base * c.s;
    // marks and cursor are sized in screen pixels: divide by the total page scale
    const inv = 1 / s;
    return (
      <div key={l.page + l.from} style={{position: 'absolute', left: 0, top: 0, width: PAGE_W, height: p.h, transformOrigin: '0 0', transform: `translate(${vw / 2 - c.x * s}px, ${vh / 2 - c.y * s}px) scale(${s})`, opacity: o}}>
        <Img src={staticFile(p.src)} style={{position: 'absolute', left: 0, top: 0, width: PAGE_W, height: p.h}} />
        {(l.marks ?? []).map((m, i) => (
          <MarkBox key={i} m={m} inv={inv} />
        ))}
        {l.cursor && <Pointer path={l.cursor} taps={l.taps ?? []} inv={inv * 1.3} />}
      </div>
    );
  };
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, transform: `perspective(2600px) rotateX(${rx}deg) rotateY(${ry}deg)`, ...style}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 18, overflow: 'hidden', background: '#fff', boxShadow: '0 60px 140px rgba(0,0,0,0.7), 0 0 0 1.5px rgba(255,255,255,0.18)'}}>
        {/* browser chrome */}
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: bar, background: 'linear-gradient(180deg, #2B2F36, #22262C)', display: 'flex', alignItems: 'center', gap: 10, padding: '0 18px'}}>
          {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
            <div key={c} style={{width: 14, height: 14, borderRadius: 7, background: c}} />
          ))}
          <div style={{marginLeft: 16, flex: 1, height: 34, borderRadius: 17, background: '#16191E', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10, fontFamily: DISPLAY, fontSize: 19, color: '#C9CED6', overflow: 'hidden', whiteSpace: 'nowrap'}}>
            <svg width={14} height={16} viewBox="0 0 14 16">
              <rect x="1.5" y="7" width="11" height="8" rx="2" fill="#9AA3B2" />
              <path d="M4 7 V5 a3 3 0 0 1 6 0 V7" stroke="#9AA3B2" strokeWidth="1.8" fill="none" />
            </svg>
            <span style={{color: '#fff'}}>{page.url.split('/')[0]}</span>
            <span style={{color: '#8A93A3'}}>{page.url.slice(page.url.indexOf('/') < 0 ? page.url.length : page.url.indexOf('/'))}</span>
          </div>
        </div>
        {/* page viewport */}
        <div style={{position: 'absolute', left: 0, top: bar, width: vw, height: vh, overflow: 'hidden', background: '#fff'}}>
          {li > 0 && navT < 1 && renderLeg(legs[li - 1], 1)}
          {renderLeg(leg, navT)}
          {/* loading bar on navigation */}
          {li > 0 && f < leg.from + 14 && <div style={{position: 'absolute', left: 0, top: 0, height: 4, width: `${lin(f, leg.from - 4, leg.from + 12) * 100}%`, background: K.cyan}} />}
          {/* screen glare */}
          <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(120deg, transparent 35%, rgba(255,255,255,0.08) 45%, transparent 56%)', pointerEvents: 'none'}} />
        </div>
      </div>
      {tag && (
        <div style={{position: 'absolute', left: 16, bottom: -46, display: 'flex', alignItems: 'center', gap: 10, fontFamily: NUM, fontSize: 17, letterSpacing: 2, color: 'rgba(255,255,255,0.75)'}}>
          <span style={{width: 10, height: 10, borderRadius: 5, background: K.loss, boxShadow: `0 0 10px ${K.loss}`}} />
          REAL PAGE · {page.url.split('/')[0].toUpperCase()} · CAPTURED 6 OCT 2026
        </div>
      )}
    </div>
  );
};

/** A crop of a real page as a floating card (page coords box x,y,w,h), scaled to width `w` on screen */
export const RealCrop: React.FC<{page: PageKey; box: {x: number; y: number; w: number; h: number}; w: number; style?: React.CSSProperties; radius?: number}> = ({page, box, w, style, radius = 16}) => {
  const p = PAGES[page];
  const s = w / box.w;
  return (
    <div style={{position: 'absolute', width: w, height: box.h * s, borderRadius: radius, overflow: 'hidden', background: '#fff', boxShadow: '0 40px 90px rgba(0,0,0,0.6), 0 0 0 1.5px rgba(255,255,255,0.2)', ...style}}>
      <Img src={staticFile(p.src)} style={{position: 'absolute', left: -box.x * s, top: -box.y * s, width: PAGE_W * s, height: p.h * s}} />
    </div>
  );
};
