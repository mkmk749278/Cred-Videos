import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, MONO, alpha} from '../theme';
import {CLAMP, inr, rnd, spr, vis} from '../lib/anim';
import {cueFrame, FPS, LEAD, sceneFrames} from '../lib/timing';
import {SceneShell} from '../components/SceneShell';
import {Banner, Glass, Label, Layer, Reveal, Sfx, shake} from '../components/primitives';

const I = 3;

/** Isometric prism drawn in SVG. (x, y) = front-bottom corner on screen. */
const Iso: React.FC<{x: number; y: number; w: number; d: number; h: number; color: string; opacity?: number; label?: string}> = ({
  x,
  y,
  w,
  d,
  h,
  color,
  opacity = 1,
  label,
}) => {
  const cx = 0.866;
  const p = (dx: number, dy: number, dz: number) => `${x + (dx - dy) * cx},${y + (dx + dy) * 0.5 - dz}`;
  const top = [p(0, 0, h), p(w, 0, h), p(w, d, h), p(0, d, h)].join(' ');
  const left = [p(0, d, 0), p(w, d, 0), p(w, d, h), p(0, d, h)].join(' ');
  const right = [p(w, 0, 0), p(w, d, 0), p(w, d, h), p(w, 0, h)].join(' ');
  const [lx, ly] = p(w * 0.5, d, h * 0.5).split(',').map(Number);
  return (
    <g opacity={opacity}>
      <polygon points={left} fill={alpha(color, 0.55)} stroke={color} strokeWidth={2} />
      <polygon points={right} fill={alpha(color, 0.35)} stroke={color} strokeWidth={2} />
      <polygon points={top} fill={alpha(color, 0.75)} stroke="#fff" strokeOpacity={0.35} strokeWidth={2} />
      {label && (
        <text x={lx} y={ly + 12} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={36} fill="#fff">
          {label}
        </text>
      )}
    </g>
  );
};

const BRICKS = [
  {label: 'Late payment fees', amt: 7200, color: '#F87171', cue: 'late payment charges'},
  {label: '42% APR finance charges', amt: 22400, color: '#EF4444', cue: 'revolving finance charges'},
  {label: 'Over-limit charges', amt: 3600, color: '#DC2626', cue: 'over-limit charges'},
  {label: '18% GST on all charges', amt: 5976, color: '#B91C1C', cue: 'eighteen percent GST'},
];

export const Scene04: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const D = sceneFrames(I);
  const c0 = LEAD * FPS;
  const brickAt = BRICKS.map((b) => cueFrame(I, b.cue) + 6);
  const cSix = cueFrame(I, 'In six months');
  const cRbi = cueFrame(I, 'Under the RBI Framework');
  const cWaive = cueFrame(I, 'may be waived');
  const cSettle = cueFrame(I, 'Try to settle');
  const laser = interpolate(frame, [cWaive - 30, cWaive + 30], [0, 1], CLAMP);
  const dissolve = interpolate(frame, [cWaive, cWaive + 40], [0, 1], CLAMP);

  const baseX = 600;
  const baseY = 500;
  const W = 300;
  const Dd = 260;
  const baseH = 150;
  const hs = BRICKS.map((b) => 30 + (b.amt / 22400) * 70);

  let total = 100000;
  BRICKS.forEach((b, i) => {
    if (frame >= brickAt[i] + 10) total += b.amt * (dissolve > 0.5 ? 0 : 1);
  });
  const alarm = total > 100000 && dissolve < 0.5;
  const sh = shake(frame, brickAt.find((b) => frame >= b + 10 && frame < b + 26) ?? -100, 10);
  let bricksH = 0;

  return (
    <SceneShell index={I} duration={D} music="analytic" tint={C.crimson} stageStyle={{translate: `${sh.x}px ${sh.y}px`}}>
      <svg width={1920} height={770} style={{position: 'absolute', inset: 0}}>
        {/* card plate */}
        <Iso x={baseX} y={baseY + 20} w={W + 60} d={Dd + 60} h={16} color="#334155" opacity={vis(frame, c0 - 10)} />
        <Iso x={baseX} y={baseY} w={W} d={Dd} h={baseH * spr(frame, fps, c0 + 10)} color={C.green} opacity={vis(frame, c0)} label="₹1,00,000" />
        {BRICKS.map((b, i) => {
          const f = frame - brickAt[i];
          const h = hs[i];
          const z = baseH + bricksH;
          bricksH += h + 6;
          if (f < 0) return null;
          const drop = interpolate(f, [0, 10, 14, 18], [-500, 0, -14, 0], CLAMP);
          const k = dissolve;
          return (
            <g key={i} transform={`translate(0 ${-z + drop})`} opacity={1 - k}>
              <Iso x={baseX + (rnd(i) - 0.5) * k * 200} y={baseY - k * 80 * (i + 1)} w={W} d={Dd} h={h} color={b.color} opacity={0.85} />
            </g>
          );
        })}
        {/* dust when dissolving */}
        {dissolve > 0 &&
          dissolve < 1 &&
          new Array(80).fill(0).map((_, i) => (
            <circle key={i} cx={baseX + (rnd(i) - 0.5) * 600 + dissolve * (rnd(i + 3) - 0.5) * 300} cy={baseY - 200 - rnd(i + 1) * 300 - dissolve * 200} r={2 + rnd(i + 2) * 4} fill={C.gold} opacity={1 - dissolve} />
          ))}
        {/* golden laser */}
        {laser > 0 && laser < 1 && (
          <g>
            <rect x={200} y={60 + laser * 560} width={900} height={8} fill={C.gold} style={{filter: `drop-shadow(0 0 20px ${C.gold})`}} />
            <rect x={200} y={60 + laser * 560 - 40} width={900} height={40} fill={alpha(C.gold, 0.12)} />
          </g>
        )}
      </svg>
      {laser > 0 && laser < 1 && (
        <div style={{position: 'absolute', left: 200, top: 20 + laser * 560, width: 900, textAlign: 'center', fontFamily: MONO, fontSize: 22, fontWeight: 800, color: C.gold, letterSpacing: 3}}>
          RBI COMPROMISE SETTLEMENT FRAMEWORK
        </div>
      )}
      {/* ledger panel */}
      <div style={{position: 'absolute', left: 1180, top: 40, width: 600}}>
        <Reveal at={c0 + 20} from="right">
          <Glass accent={alarm ? C.crimson : C.green}>
            <Label color={alarm ? C.crimson : C.green}>Statement balance</Label>
            <div style={{fontFamily: MONO, fontSize: 76, fontWeight: 800, color: alarm ? C.crimson : C.green, textShadow: alarm ? `0 0 ${20 + 10 * Math.sin(frame / 4)}px ${alpha(C.crimson, 0.8)}` : undefined}}>
              ₹{inr(total)}
            </div>
            <div style={{fontSize: 22, color: C.muted, marginBottom: 14}}>Spends base: ₹1,00,000 · card blocked</div>
            {BRICKS.map((b, i) => (
              <div key={i} style={{display: 'flex', justifyContent: 'space-between', fontSize: 26, padding: '8px 0', borderTop: `1px solid ${C.border}`, opacity: frame >= brickAt[i] ? 1 : 0.15, textDecoration: dissolve > 0.5 ? 'line-through' : undefined, color: dissolve > 0.5 ? C.dim : C.text}}>
                <span>{b.label}</span>
                <span style={{fontFamily: MONO, color: dissolve > 0.5 ? C.dim : b.color}}>+₹{inr(b.amt)}</span>
              </div>
            ))}
          </Glass>
        </Reveal>
        <div style={{marginTop: 24, opacity: vis(frame, cSix, cRbi)}}>
          <Glass accent={C.crimson} pad={20}>
            <div style={{fontSize: 28, fontWeight: 700}}>
              6 months: ₹1,00,000 can show as <span style={{color: C.crimson}}>₹1,65,000</span>
            </div>
            <div style={{fontSize: 22, color: C.muted, marginTop: 6}}>Largely uncollectible — and banks know it.</div>
          </Glass>
        </div>
      </div>
      <div style={{position: 'absolute', left: 120, top: 40, opacity: vis(frame, c0, cRbi)}}>
        <Label color={C.crimson}>Billing cycle</Label>
        <div style={{fontFamily: MONO, fontSize: 60, fontWeight: 800}}>{Math.min(6, Math.max(1, Math.floor(interpolate(frame, [brickAt[0], brickAt[3] + 20], [1, 6.99], CLAMP))))} / 6</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 690}}>
        <Banner at={cWaive + 40} color={C.gold} size={42}>
          Phantom charges may be waived in OTS
        </Banner>
      </div>
      <div style={{position: 'absolute', left: 1180, top: 450, width: 600, opacity: vis(frame, cSettle)}}>
        <Glass accent={C.green} pad={20}>
          <div style={{fontSize: 28, fontWeight: 800}}>Settle against core principal — <span style={{color: C.green}}>not the phantom ledger.</span></div>
        </Glass>
      </div>
      {brickAt.map((b, i) => (
        <Sfx key={i} at={b + 10} name="block_slam" volume={0.5} />
      ))}
      <Sfx at={cSix} name="warning_pulse" volume={0.3} />
      <Sfx at={cWaive - 30} name="plasma_sweep" volume={0.5} />
      <Sfx at={cWaive} name="vaporize" volume={0.35} />
      <Sfx at={cSettle} name="tactile_click" volume={0.4} />
    </SceneShell>
  );
};
