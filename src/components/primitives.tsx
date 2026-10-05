import React from 'react';
import {Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {interpolate} from '../lib/safeInterpolate';
import {C, FONT, MONO, alpha} from '../theme';
import {CLAMP, KINETIC, ramp, SNAPPY, spr} from '../lib/anim';

/* ------------------------------------------------------------------ audio */

export type SfxName =
  | 'node_pop' | 'tactile_click' | 'haptic_tap' | 'haptic_buzz' | 'sub_thud' | 'plasma_sweep' | 'air_whoosh'
  | 'call_disconnect' | 'glass_shatter' | 'stamp_heavy' | 'chain_break' | 'counter_spin' | 'scale_drop'
  | 'vaporize' | 'block_slam' | 'piston_clamp' | 'shield_activate' | 'typing' | 'key_click' | 'email_sent'
  | 'buzzer' | 'printer_blast' | 'radar_ping' | 'dial_112' | 'dialer_ring' | 'pages_flip' | 'gear_shift'
  | 'vault_open' | 'card_slide' | 'grid_lock' | 'gavel_strike' | 'payment_success' | 'gauge_drop' | 'slice'
  | 'card_insert' | 'triumph_rise' | 'warning_pulse' | 'notification' | 'title_hit' | 'door_knock';

/** Lets a scene silence its own SFX in frame ranges (Telugu edition: while an insert panel covers the stage). */
export const SfxMute = React.createContext<((frame: number) => boolean) | null>(null);

/** One-shot sound effect, hard-locked to a frame. */
export const Sfx: React.FC<{at: number; name: SfxName; volume?: number}> = ({at, name, volume = 0.5}) => {
  const muted = React.useContext(SfxMute);
  if (muted && muted(Math.round(at))) return null;
  return (
    <Sequence from={Math.round(at)} layout="none" name={`sfx:${name}`}>
      <Audio src={staticFile(`audio/sfx/${name}.mp3`)} volume={volume} />
    </Sequence>
  );
};

/* ------------------------------------------------------------------ layout */

export const Glass: React.FC<{
  children?: React.ReactNode;
  style?: React.CSSProperties;
  accent?: string;
  pad?: number;
}> = ({children, style, accent, pad = 28}) => (
  <div
    style={{
      background: `linear-gradient(145deg, rgba(30, 41, 59, 0.72), rgba(15, 23, 42, 0.58))`,
      border: `1.5px solid ${accent ? alpha(accent, 0.55) : C.border}`,
      borderRadius: 24,
      padding: pad,
      boxShadow: `0 30px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)${
        accent ? `, 0 0 40px ${alpha(accent, 0.18)}` : ''
      }`,
      color: C.text,
      fontFamily: FONT,
      ...style,
    }}
  >
    {children}
  </div>
);

/** Kinetic entry: slide + blur + spring overshoot */
export const Reveal: React.FC<{
  at: number;
  from?: 'left' | 'right' | 'bottom' | 'top' | 'scale';
  distance?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  out?: number;
}> = ({at, from = 'bottom', distance = 80, children, style, out}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spr(frame, fps, at, KINETIC);
  const o = interpolate(frame, [at, at + 8], [0, 1], CLAMP) * (out ? 1 - ramp(frame, out, out + 10) : 1);
  const d = (1 - p) * distance;
  const t =
    from === 'left'
      ? `translateX(${-d}px)`
      : from === 'right'
        ? `translateX(${d}px)`
        : from === 'top'
          ? `translateY(${-d}px)`
          : from === 'scale'
            ? `scale(${0.6 + 0.4 * p})`
            : `translateY(${d}px)`;
  const blur = interpolate(frame, [at, at + 8], [10, 0], CLAMP);
  if (frame < at) return null;
  return <div style={{opacity: o, transform: t, filter: blur > 0.2 ? `blur(${blur}px)` : undefined, ...style}}>{children}</div>;
};

/* ------------------------------------------------------------------ micro-interactions */

/** Glowing node: ignites at scale 0, overshoots to 1.4 with bloom, settles at 1.0 in 18 frames */
export const NodeDot: React.FC<{at: number; color?: string; size?: number; style?: React.CSSProperties}> = ({
  at,
  color = C.cyan,
  size = 22,
  style,
}) => {
  const frame = useCurrentFrame();
  const f = frame - at;
  if (f < 0) return <div style={{width: size, height: size, ...style}} />;
  const s = interpolate(f, [0, 9, 18], [0, 1.4, 1], CLAMP);
  const bloom = interpolate(f, [0, 9, 18, 40], [0, 26, 14, 10], CLAMP);
  const pulse = f > 18 ? 1 + 0.08 * Math.sin((f - 18) / 9) : 1;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle at 35% 35%, #fff, ${color} 55%)`,
        transform: `scale(${s * pulse})`,
        boxShadow: `0 0 ${bloom}px ${bloom / 2}px ${alpha(color, 0.75)}`,
        flexShrink: 0,
        ...style,
      }}
    />
  );
};

/** Tactile checkmark: ring traces (12f), stems draw, shockwave ring + press bounce */
export const Check: React.FC<{at: number; size?: number; color?: string}> = ({at, size = 48, color = C.emerald}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const f = frame - at;
  if (f < 0) return <div style={{width: size, height: size, flexShrink: 0}} />;
  const ring = interpolate(f, [0, 12], [1, 0], CLAMP);
  const short = interpolate(f, [10, 14], [1, 0], CLAMP);
  const long = interpolate(f, [14, 22], [1, 0], CLAMP);
  const press = f < 22 ? 1 : 1 - 0.06 * Math.sin(Math.min(1, (f - 22) / 6) * Math.PI);
  const pop = spr(frame, fps, at, SNAPPY);
  const sw = interpolate(f, [22, 36], [1, 2.3], CLAMP);
  const swo = interpolate(f, [22, 36], [0.8, 0], CLAMP);
  return (
    <div style={{position: 'relative', width: size, height: size, flexShrink: 0}}>
      {f >= 22 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: `3px solid ${color}`,
            transform: `scale(${sw})`,
            opacity: swo,
          }}
        />
      )}
      {f >= 20 &&
        f < 40 &&
        [0, 1, 2, 3, 4, 5, 6, 7].map((k) => {
          const a = (k / 8) * Math.PI * 2 + 0.3;
          const d = interpolate(f, [20, 38], [size * 0.45, size * 1.05], CLAMP);
          return (
            <div
              key={k}
              style={{
                position: 'absolute',
                left: size / 2 + Math.cos(a) * d - 3,
                top: size / 2 + Math.sin(a) * d - 3,
                width: 6,
                height: 6,
                borderRadius: 3,
                background: color,
                opacity: interpolate(f, [20, 38], [1, 0], CLAMP),
                boxShadow: `0 0 8px ${color}`,
              }}
            />
          );
        })}
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        style={{transform: `scale(${Math.max(0, pop) * press})`, filter: `drop-shadow(0 0 8px ${alpha(color, 0.7)})`}}
      >
        <circle cx="24" cy="24" r="21" fill={alpha(color, 0.12)} stroke={color} strokeWidth="3.2" pathLength={1} strokeDasharray={1} strokeDashoffset={ring} transform="rotate(-90 24 24)" strokeLinecap="round" />
        <path d="M14 25 L21 32" stroke={color} strokeWidth="4.2" fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={short} />
        <path d="M21 32 L35 17" stroke={color} strokeWidth="4.2" fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={long} />
      </svg>
    </div>
  );
};

/** Red cross that draws itself */
export const Cross: React.FC<{at: number; size?: number; color?: string}> = ({at, size = 48, color = C.crimson}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const f = frame - at;
  if (f < 0) return <div style={{width: size, height: size, flexShrink: 0}} />;
  const a = interpolate(f, [0, 6], [1, 0], CLAMP);
  const b = interpolate(f, [5, 11], [1, 0], CLAMP);
  const pop = spr(frame, fps, at, SNAPPY);
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" style={{transform: `scale(${pop})`, flexShrink: 0, filter: `drop-shadow(0 0 8px ${alpha(color, 0.7)})`}}>
      <circle cx="24" cy="24" r="21" fill={alpha(color, 0.14)} stroke={color} strokeWidth="3" />
      <path d="M16 16 L32 32" stroke={color} strokeWidth="4.5" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={a} />
      <path d="M32 16 L16 32" stroke={color} strokeWidth="4.5" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={b} />
    </svg>
  );
};

/** Rubber stamp that slams down from above with a shock ring */
export const Stamp: React.FC<{
  at: number;
  text: string;
  sub?: string;
  color?: string;
  rotate?: number;
  size?: number;
  style?: React.CSSProperties;
}> = ({at, text, sub, color = C.crimson, rotate = -8, size = 56, style}) => {
  const frame = useCurrentFrame();
  const f = frame - at;
  if (f < 0) return null;
  const s = interpolate(f, [0, 7, 10, 14], [2.8, 0.94, 1.03, 1], CLAMP);
  const o = interpolate(f, [0, 5], [0, 1], CLAMP);
  const ring = interpolate(f, [7, 22], [0.9, 1.5], CLAMP);
  const ringO = interpolate(f, [7, 22], [0.6, 0], CLAMP);
  return (
    <div style={{position: 'relative', display: 'inline-block', transform: `rotate(${rotate}deg) scale(${s})`, opacity: o, ...style}}>
      {f >= 7 && (
        <div style={{position: 'absolute', inset: -10, border: `4px solid ${color}`, borderRadius: 18, transform: `scale(${ring})`, opacity: ringO}} />
      )}
      <div
        style={{
          border: `6px solid ${color}`,
          outline: `2px solid ${alpha(color, 0.6)}`,
          outlineOffset: 5,
          borderRadius: 14,
          padding: `${size * 0.22}px ${size * 0.5}px`,
          color,
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: size,
          letterSpacing: size * 0.06,
          textTransform: 'uppercase',
          textAlign: 'center',
          lineHeight: 1.05,
          background: alpha(color, 0.1),
          textShadow: `0 0 18px ${alpha(color, 0.55)}`,
          boxShadow: `0 0 50px ${alpha(color, 0.3)}`,
          whiteSpace: 'pre-line',
        }}
      >
        {text}
        {sub && <div style={{fontSize: size * 0.34, letterSpacing: 2, marginTop: 8, fontWeight: 700, opacity: 0.9}}>{sub}</div>}
      </div>
    </div>
  );
};

/** Screen shake offset after an impact */
export const shake = (frame: number, at: number, amp = 14, dur = 16) => {
  const f = frame - at;
  if (f < 0 || f > dur) return {x: 0, y: 0};
  const k = (1 - f / dur) * amp;
  return {x: Math.sin(f * 2.7) * k, y: Math.cos(f * 3.3) * k * 0.7};
};

/** Animated number */
export const Counter: React.FC<{
  from: number;
  to: number;
  start: number;
  end: number;
  format?: (n: number) => string;
  style?: React.CSSProperties;
}> = ({from, to, start, end, format = (n) => Math.round(n).toString(), style}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [start, end], [0, 1], CLAMP);
  const e = 1 - Math.pow(1 - p, 3);
  return <span style={{fontVariantNumeric: 'tabular-nums', ...style}}>{format(from + (to - from) * e)}</span>;
};

/** Typewriter reveal */
export const Type: React.FC<{text: string; start: number; cps?: number; style?: React.CSSProperties; cursor?: boolean}> = ({
  text,
  start,
  cps = 40,
  style,
  cursor = true,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const n = Math.max(0, Math.floor(((frame - start) / fps) * cps));
  const done = n >= text.length;
  if (frame < start) return null;
  return (
    <span style={style}>
      {text.slice(0, n)}
      {cursor && !done && <span style={{opacity: Math.floor(frame / 8) % 2 ? 1 : 0.2, color: C.cyan}}>▌</span>}
    </span>
  );
};

export const Tag: React.FC<{children: React.ReactNode; color?: string; style?: React.CSSProperties}> = ({children, color = C.cyan, style}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '6px 14px',
      borderRadius: 999,
      border: `1.5px solid ${alpha(color, 0.6)}`,
      background: alpha(color, 0.12),
      color,
      fontFamily: MONO,
      fontSize: 20,
      fontWeight: 700,
      letterSpacing: 1,
      textTransform: 'uppercase',
      ...style,
    }}
  >
    {children}
  </span>
);

/** Point card: ignition dot + frosted card sliding in from left */
export const PointCard: React.FC<{
  at: number;
  title: React.ReactNode;
  body?: React.ReactNode;
  color?: string;
  checkAt?: number;
  crossAt?: number;
  index?: string;
  width?: number;
  titleSize?: number;
}> = ({at, title, body, color = C.cyan, checkAt, crossAt, index, width = 820, titleSize = 34}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
    <NodeDot at={at} color={color} />
    <Reveal at={at + 6} from="left" distance={120}>
      <Glass accent={color} style={{width, display: 'flex', alignItems: 'center', gap: 22}} pad={24}>
        {index && (
          <div style={{fontFamily: MONO, fontSize: 26, fontWeight: 800, color, minWidth: 44}}>{index}</div>
        )}
        <div style={{flex: 1}}>
          <div style={{fontSize: titleSize, fontWeight: 800, lineHeight: 1.18}}>{title}</div>
          {body && <div style={{fontSize: 24, color: C.muted, marginTop: 8, lineHeight: 1.35}}>{body}</div>}
        </div>
        {checkAt !== undefined && <Check at={checkAt} size={54} />}
        {crossAt !== undefined && <Cross at={crossAt} size={54} />}
      </Glass>
    </Reveal>
  </div>
);

/** Section banner text */
export const Banner: React.FC<{at: number; children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties}> = ({
  at,
  children,
  color = C.gold,
  size = 54,
  style,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at) return null;
  const p = spr(frame, fps, at, KINETIC);
  const wipe = interpolate(frame, [at, at + 14], [0, 100], CLAMP);
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: size,
        letterSpacing: 2,
        color,
        textAlign: 'center',
        textTransform: 'uppercase',
        textShadow: `0 0 30px ${alpha(color, 0.5)}`,
        transform: `scale(${0.85 + 0.15 * p})`,
        clipPath: `inset(0 ${100 - wipe}% 0 0)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** SVG path that draws itself between two frames (uses pathLength so no measuring needed) */
export const DrawPath: React.FC<
  {d: string; start: number; end: number; color?: string; width?: number; dash?: boolean} & React.SVGProps<SVGPathElement>
> = ({d, start, end, color = C.cyan, width = 3, dash, ...rest}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [start, end], [0, 1], CLAMP);
  const eased = 1 - Math.pow(1 - p, 2);
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - eased}
      style={{filter: `drop-shadow(0 0 6px ${alpha(color, 0.8)})`}}
      {...rest}
    />
  );
};

/** Smartphone frame */
export const Phone: React.FC<{children?: React.ReactNode; width?: number; height?: number; style?: React.CSSProperties; screen?: string}> = ({
  children,
  width = 420,
  height = 860,
  style,
  screen = '#0B1020',
}) => (
  <div
    style={{
      width,
      height,
      borderRadius: 64,
      padding: 14,
      background: 'linear-gradient(145deg, #2a3242, #0d1119 60%, #1c2230)',
      boxShadow: '0 60px 120px rgba(0,0,0,0.65), inset 0 0 0 2px rgba(255,255,255,0.08), 0 0 0 1px #000',
      position: 'relative',
      ...style,
    }}
  >
    <div style={{width: '100%', height: '100%', borderRadius: 52, background: screen, overflow: 'hidden', position: 'relative'}}>
      <div style={{position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)', width: 120, height: 32, borderRadius: 20, background: '#000', zIndex: 10}} />
      <div style={{position: 'absolute', top: 18, left: 34, right: 34, display: 'flex', justifyContent: 'space-between', fontFamily: FONT, fontSize: 18, fontWeight: 700, color: '#fff', zIndex: 9}}>
        <span>9:41</span>
        <span style={{letterSpacing: 2}}>▮▮▮ ◔</span>
      </div>
      {children}
    </div>
  </div>
);

/** Small uppercase label */
export const Label: React.FC<{children: React.ReactNode; color?: string; style?: React.CSSProperties}> = ({children, color = C.muted, style}) => (
  <div style={{fontFamily: MONO, fontSize: 20, letterSpacing: 3, textTransform: 'uppercase', color, fontWeight: 700, ...style}}>{children}</div>
);

/** Full-stage absolute layer */
export const Layer: React.FC<{children?: React.ReactNode; style?: React.CSSProperties; opacity?: number}> = ({children, style, opacity = 1}) =>
  opacity <= 0 ? null : (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity,
        // beats change with depth: slight scale + blur while crossing
        transform: opacity < 1 ? `scale(${0.965 + 0.035 * opacity})` : undefined,
        filter: opacity < 0.98 ? `blur(${(1 - opacity) * 7}px)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );

/* ------------------------------------------------------------------ narration-synced beats */

/** Icon tile that pops in when its word is spoken; optional ✓/✕ badge lands when the point is finished */
export const SpokenTile: React.FC<{
  at: number;
  icon: string;
  label: string;
  color?: string;
  width?: number;
  sub?: string;
  /** frame the badge lands (usually the end of the sentence) */
  doneAt?: number;
  mark?: 'check' | 'cross';
}> = ({at, icon, label, color = C.cyan, width = 230, sub, doneAt, mark = 'check'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at) return <div style={{width}} />;
  const p = spr(frame, fps, at, SNAPPY);
  const done = doneAt !== undefined && frame >= doneAt;
  const flash = doneAt !== undefined ? interpolate(frame - doneAt, [0, 6, 24], [0, 1, 0], CLAMP) : 0;
  const badgeColor = mark === 'check' ? C.emerald : C.crimson;
  return (
    <div
      style={{
        position: 'relative',
        width,
        transform: `translateY(${(1 - p) * 40}px) scale(${(0.8 + 0.2 * p) * (1 + flash * 0.04)})`,
        opacity: Math.min(1, p * 1.4),
        background: `linear-gradient(160deg, ${alpha(color, 0.2 + flash * 0.15)}, rgba(15,23,42,0.75))`,
        border: `1.5px solid ${alpha(done ? badgeColor : color, 0.6 + flash * 0.4)}`,
        borderRadius: 20,
        padding: '18px 16px',
        textAlign: 'center',
        boxShadow: `0 16px 40px rgba(0,0,0,0.4), 0 0 ${24 + flash * 30}px ${alpha(done ? badgeColor : color, 0.18 + flash * 0.4)}`,
        fontFamily: FONT,
      }}
    >
      <div
        style={{
          width: 60,
          height: 60,
          margin: '0 auto 10px',
          borderRadius: 18,
          background: alpha(color, 0.18),
          border: `2px solid ${color}`,
          display: 'grid',
          placeItems: 'center',
          color,
          fontWeight: 900,
          fontSize: 28,
        }}
      >
        {icon}
      </div>
      <div style={{fontSize: 26, fontWeight: 800, color: C.text, lineHeight: 1.15}}>{label}</div>
      {sub && <div style={{fontSize: 18, color: C.muted, marginTop: 6}}>{sub}</div>}
      {doneAt !== undefined && (
        <div style={{position: 'absolute', right: -14, top: -14}}>
          {mark === 'check' ? <Check at={doneAt} size={40} /> : <Cross at={doneAt} size={40} />}
        </div>
      )}
      {doneAt !== undefined && <Sfx at={mark === 'check' ? doneAt + 20 : doneAt + 4} name={mark === 'check' ? 'tactile_click' : 'buzzer'} volume={mark === 'check' ? 0.3 : 0.12} />}
    </div>
  );
};

/** Large kinetic line that sweeps in (clip + blur) when spoken; optional highlighter stroke underneath */
export const KLine: React.FC<{
  at: number;
  children: React.ReactNode;
  size?: number;
  color?: string;
  out?: number;
  style?: React.CSSProperties;
  /** highlighter color drawn under the line after it lands */
  mark?: string;
}> = ({at, children, size = 60, color = C.text, out, style, mark}) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const wipe = interpolate(frame, [at, at + 12], [0, 100], CLAMP);
  const blur = interpolate(frame, [at, at + 10], [8, 0], CLAMP);
  const o = out ? 1 - ramp(frame, out, out + 10) : 1;
  const hl = mark ? interpolate(frame, [at + 12, at + 26], [0, 100], CLAMP) : 0;
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1.1,
        color,
        letterSpacing: -0.5,
        clipPath: `inset(-20% ${100 - wipe}% -20% 0)`,
        filter: blur > 0.2 ? `blur(${blur}px)` : undefined,
        opacity: o,
        textShadow: '0 4px 24px rgba(0,0,0,0.5)',
        ...style,
      }}
    >
      <span
        style={{
          backgroundImage: mark ? `linear-gradient(${alpha(mark, 0.45)}, ${alpha(mark, 0.45)})` : undefined,
          backgroundRepeat: 'no-repeat',
          backgroundSize: `${hl}% 32%`,
          backgroundPosition: '0 88%',
          padding: '0 4px',
        }}
      >
        {children}
      </span>
    </div>
  );
};

/** Beat pulse: children pop (scale + glow flash) at each given frame, e.g. when a number is spoken */
export const Pulse: React.FC<{at: number[]; color?: string; amount?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
  at,
  color = C.gold,
  amount = 0.08,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  let k = 0;
  for (const a of at) k = Math.max(k, interpolate(frame - a, [0, 5, 16], [0, 1, 0], CLAMP));
  return (
    <div style={{transform: `scale(${1 + amount * k})`, filter: k > 0.02 ? `drop-shadow(0 0 ${18 * k}px ${alpha(color, 0.8)})` : undefined, ...style}}>
      {children}
    </div>
  );
};

/** "Up next" chip that closes a module and points at the next one */
export const NextChip: React.FC<{at: number; text: string}> = ({at, text}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at) return null;
  const p = spr(frame, fps, at, KINETIC);
  return (
    <div style={{display: 'inline-flex', alignItems: 'center', gap: 14, padding: '12px 24px', borderRadius: 999, background: alpha(C.cyan, 0.12), border: `1.5px solid ${alpha(C.cyan, 0.6)}`, transform: `translateX(${(1 - p) * 60}px)`, opacity: p, fontFamily: FONT}}>
      <span style={{fontFamily: MONO, fontSize: 18, letterSpacing: 3, color: C.cyan, fontWeight: 800}}>UP NEXT</span>
      <span style={{fontSize: 26, fontWeight: 700, color: C.text}}>{text} →</span>
    </div>
  );
};
