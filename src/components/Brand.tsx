import React from 'react';
import {FONT} from '../theme';
import {LANG} from '../lib/lang';

/** channel identity (BE PRACTICAL with Kishore) — shown in the creator's Hinglish edition */
export const BRAND = LANG === 'hi';

export const BRAND_GOLD = '#FFD54F';
export const BRAND_NAVY = '#0B1530';
export const BRAND_BLUE = '#5B7BC0';

/** the channel wordmark: "BE PRACTICAL" over "with Kishore", as on the channel art. `size` = cap height of BE PRACTICAL */
export const Wordmark: React.FC<{size?: number; tagline?: boolean; align?: 'center' | 'left' | 'right'; style?: React.CSSProperties}> = ({size = 64, tagline = false, align = 'center', style}) => (
  <div style={{fontFamily: FONT, textAlign: align, lineHeight: 1, ...style}}>
    <div style={{fontSize: size, fontWeight: 900, letterSpacing: -size * 0.02, whiteSpace: 'nowrap', textShadow: '0 2px 14px rgba(0,0,0,0.55)'}}>
      <span style={{color: '#FAFAFA'}}>BE </span>
      <span style={{color: BRAND_GOLD}}>PRACTICAL</span>
    </div>
    <div style={{fontSize: size * 0.44, fontWeight: 800, color: '#FAFAFA', marginTop: size * 0.1, whiteSpace: 'nowrap', textShadow: '0 2px 10px rgba(0,0,0,0.55)'}}>with Kishore</div>
    {tagline && (
      <div style={{fontSize: size * 0.3, fontWeight: 500, color: '#E2E8F0', marginTop: size * 0.28, whiteSpace: 'nowrap'}}>Real questions. Simple explanations.</div>
    )}
  </div>
);

/** the circuit lines of the channel art, drawn from one side towards the wordmark (progress 0..1) */
export const BrandLines: React.FC<{side: 'left' | 'right'; progress?: number; width?: number; top?: number; opacity?: number}> = ({side, progress = 1, width = 380, top = 0, opacity = 1}) => {
  const paths = [
    {d: 'M0 10 H150', end: [150, 10], c: BRAND_GOLD},
    {d: 'M0 70 H230', end: [230, 70], c: BRAND_BLUE},
    {d: 'M0 130 H240 C270 130 280 185 310 185 H370', end: [370, 185], c: BRAND_GOLD},
    {d: 'M0 190 H190 C220 190 230 240 260 240 H320', end: [320, 240], c: BRAND_BLUE},
  ];
  return (
    <svg width={width} height={260} viewBox="0 0 380 260" style={{position: 'absolute', top, [side]: 0, transform: side === 'right' ? 'scaleX(-1)' : undefined, opacity}}>
      {paths.map((p, i) => (
        <g key={i}>
          <path d={p.d} fill="none" stroke={p.c} strokeWidth={4} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progress} />
          <circle cx={p.end[0]} cy={p.end[1]} r={10} fill={p.c} opacity={progress >= 0.98 ? 1 : 0} />
        </g>
      ))}
    </svg>
  );
};
