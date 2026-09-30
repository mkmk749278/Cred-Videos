import React from 'react';
import {C, FONT, MONO, alpha} from '../theme';

type P = {size?: number; color?: string; style?: React.CSSProperties};

export const FamilyIcon: React.FC<P> = ({size = 120, color = C.gold, style}) => (
  <svg width={size} height={size} viewBox="0 0 120 120" style={style}>
    <path d="M60 6 L108 24 V58 C108 86 88 104 60 114 C32 104 12 86 12 58 V24 Z" fill={alpha(color, 0.12)} stroke={color} strokeWidth={4} />
    <circle cx="42" cy="46" r="9" fill={color} />
    <circle cx="78" cy="46" r="9" fill={color} />
    <circle cx="60" cy="62" r="6.5" fill={color} />
    <path d="M28 88 C28 70 56 70 56 88 Z" fill={color} />
    <path d="M64 88 C64 70 92 70 92 88 Z" fill={color} />
    <path d="M50 92 C50 78 70 78 70 92 Z" fill={color} opacity={0.85} />
  </svg>
);

export const Handcuffs: React.FC<P> = ({size = 260, color = '#CBD5E1', style}) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 260 156" style={style}>
    <defs>
      <linearGradient id="steel" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#F1F5F9" />
        <stop offset="0.5" stopColor={color} />
        <stop offset="1" stopColor="#475569" />
      </linearGradient>
    </defs>
    <circle cx="62" cy="86" r="48" fill="none" stroke="url(#steel)" strokeWidth="16" />
    <circle cx="198" cy="86" r="48" fill="none" stroke="url(#steel)" strokeWidth="16" />
    <rect x="96" y="30" width="18" height="30" rx="6" fill="url(#steel)" />
    <rect x="146" y="30" width="18" height="30" rx="6" fill="url(#steel)" />
    <path d="M110 30 Q130 6 150 30" stroke="url(#steel)" strokeWidth="9" fill="none" />
  </svg>
);

export const Scales: React.FC<P> = ({size = 220, color = C.cyan, style}) => (
  <svg width={size} height={size} viewBox="0 0 200 200" style={style}>
    <g stroke={color} strokeWidth="6" fill="none" strokeLinecap="round">
      <path d="M100 26 V176 M60 176 H140 M36 56 H164" />
      <path d="M36 56 L14 116 H58 Z" fill={alpha(color, 0.15)} />
      <path d="M164 56 L142 116 H186 Z" fill={alpha(color, 0.15)} />
    </g>
    <circle cx="100" cy="24" r="10" fill={color} />
  </svg>
);

export const BankIcon: React.FC<P & {label?: string}> = ({size = 120, color = C.cyan, style}) => (
  <svg width={size} height={size} viewBox="0 0 120 120" style={style}>
    <path d="M10 44 L60 14 L110 44 Z" fill={alpha(color, 0.2)} stroke={color} strokeWidth="4" strokeLinejoin="round" />
    {[24, 46, 68, 90].map((x) => (
      <rect key={x} x={x} y={52} width={8} height={40} fill={color} />
    ))}
    <rect x="12" y="96" width="96" height="10" fill={color} />
  </svg>
);

export const LockIcon: React.FC<P & {open?: boolean}> = ({size = 60, color = C.cyan, open, style}) => (
  <svg width={size} height={size} viewBox="0 0 60 60" style={style}>
    <path d={open ? 'M18 28 V18 A12 12 0 0 1 41 13' : 'M18 28 V18 A12 12 0 0 1 42 18 V28'} stroke={color} strokeWidth="5" fill="none" />
    <rect x="10" y="27" width="40" height="28" rx="6" fill={color} />
    <circle cx="30" cy="40" r="4" fill={C.bg} />
  </svg>
);

export const MailIcon: React.FC<P> = ({size = 60, color = C.cyan, style}) => (
  <svg width={size} height={size} viewBox="0 0 60 60" style={style}>
    <rect x="6" y="14" width="48" height="34" rx="5" fill={alpha(color, 0.15)} stroke={color} strokeWidth="4" />
    <path d="M8 17 L30 34 L52 17" stroke={color} strokeWidth="4" fill="none" />
  </svg>
);

export const GavelIcon: React.FC<P> = ({size = 160, color = '#B45309', style}) => (
  <svg width={size} height={size} viewBox="0 0 160 160" style={style}>
    <g transform="rotate(-35 80 80)">
      <rect x="40" y="34" width="80" height="36" rx="8" fill={color} stroke="#FCD34D" strokeWidth="3" />
      <rect x="30" y="38" width="12" height="28" rx="4" fill="#FCD34D" />
      <rect x="118" y="38" width="12" height="28" rx="4" fill="#FCD34D" />
      <rect x="74" y="68" width="12" height="80" rx="5" fill={color} />
    </g>
  </svg>
);

/** A stylized credit card (no real logos) */
export const CreditCard: React.FC<{
  bank: string;
  product?: string;
  color1: string;
  color2: string;
  width?: number;
  amount?: string;
  style?: React.CSSProperties;
  glow?: string;
}> = ({bank, product, color1, color2, width = 300, amount, style, glow}) => (
  <div
    style={{
      width,
      height: width * 0.63,
      borderRadius: width * 0.06,
      background: `linear-gradient(135deg, ${color1}, ${color2})`,
      position: 'relative',
      boxShadow: `0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.25)${glow ? `, 0 0 34px ${alpha(glow, 0.7)}` : ''}`,
      overflow: 'hidden',
      fontFamily: FONT,
      color: '#fff',
      flexShrink: 0,
      ...style,
    }}
  >
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)'}} />
    <div style={{position: 'absolute', left: width * 0.07, top: width * 0.06, fontWeight: 900, fontSize: width * 0.085, letterSpacing: 0.5}}>{bank}</div>
    {product && <div style={{position: 'absolute', left: width * 0.07, top: width * 0.17, fontSize: width * 0.048, opacity: 0.85}}>{product}</div>}
    <div style={{position: 'absolute', left: width * 0.07, top: width * 0.3, width: width * 0.14, height: width * 0.1, borderRadius: 6, background: 'linear-gradient(135deg,#fde68a,#b45309)'}} />
    <div style={{position: 'absolute', left: width * 0.07, bottom: width * 0.06, fontFamily: MONO, fontSize: width * 0.05, letterSpacing: 2, opacity: 0.9}}>•••• •••• •••• 4821</div>
    {amount && (
      <div style={{position: 'absolute', right: width * 0.06, top: width * 0.3, fontWeight: 900, fontSize: width * 0.075, textShadow: '0 2px 6px rgba(0,0,0,0.4)'}}>{amount}</div>
    )}
  </div>
);

/** Simple person silhouette */
export const Person: React.FC<P> = ({size = 160, color = '#94A3B8', style}) => (
  <svg width={size * 0.6} height={size} viewBox="0 0 60 100" style={style}>
    <circle cx="30" cy="16" r="12" fill={color} />
    <path d="M8 98 V52 C8 36 52 36 52 52 V98 Z" fill={color} />
  </svg>
);
