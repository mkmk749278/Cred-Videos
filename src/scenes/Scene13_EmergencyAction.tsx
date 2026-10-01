import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT, MONO, alpha} from '../theme';
import {CLAMP, spr, vis} from '../lib/anim';
import {contentStart, cueFrame, paragraphEnd, sceneFrames} from '../lib/timing';
import {SceneShell} from '../components/SceneShell';
import {Check, Glass, KLine, Layer, Reveal, Sfx} from '../components/primitives';
import {Person} from '../components/icons';

const I = 12;

const STEPS = [
  {cue: 'Step One', t: 'Move salary to a clean anchor bank', s: 'Creditor bank balances at ₹0'},
  {cue: 'Step Two', t: 'Written hardship notice to the PNO', s: 'Keep your Case IDs'},
  {cue: 'Step Three', t: 'Silence unknown callers + dialer blocks', s: 'Mechanical silence'},
  {cue: 'Step Four', t: 'Stop token / Minimum Due payments', s: 'They only service fees'},
  {cue: 'Step Five', t: 'No phone arguments — all in writing', s: 'Direct to the bank'},
  {cue: 'Step Six', t: 'Settlement talks usually open post write-off', s: 'Day ~180+'},
  {cue: 'Step Seven', t: 'OTS: often ~25–35% · official letter · NDC', s: 'Pay the bank directly'},
  {cue: 'And Step Eight', t: 'Rebuild with an FD-backed secured card', s: 'Toward 750+'},
];

export const Scene13: React.FC = () => {
  const frame = useCurrentFrame();
  const D = sceneFrames(I);
  const c0 = contentStart(I);
  const cAlone = cueFrame(I, 'Remember, you are not alone');
  const ats = STEPS.map((s) => cueFrame(I, s.cue));
  const dones = STEPS.map((s) => paragraphEnd(I, s.cue));
  const cFinal = cueFrame(I, 'Take control today');
  const part = interpolate(frame, [cFinal - 10, cFinal + 30], [0, 1], CLAMP);
  const sun = interpolate(frame, [cFinal, cFinal + 120], [0, 1], CLAMP);
  // teaser + call to action
  const cTold = cueFrame(I, "here's something I haven't told you");
  const cMyself = cueFrame(I, "I'm going through this myself");
  const cNext = cueFrame(I, 'In the next video');
  const cSub = cueFrame(I, 'So subscribe');
  const cBell = cueFrame(I, 'tap the bell');
  const cShare = cueFrame(I, 'share it with someone');
  const teaser = interpolate(frame, [cTold - 6, cTold + 12], [0, 1], CLAMP);

  return (
    <SceneShell index={I} duration={D} music="hope" tint={C.gold}>
      <Layer opacity={vis(frame, c0 - 10, cFinal + 40, 20)}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', fontSize: 40, fontWeight: 900, opacity: vis(frame, c0)}}>
          Your <span style={{color: C.gold}}>8-step</span> emergency protocol
        </div>
        {[0, 1].map((col) => (
          <div
            key={col}
            style={{
              position: 'absolute',
              top: 80,
              left: col === 0 ? 110 : 990,
              width: 820,
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              transform: `translateX(${(col === 0 ? -1 : 1) * part * 1000}px)`,
            }}
          >
            {STEPS.slice(col * 4, col * 4 + 4).map((s, j) => {
              const i = col * 4 + j;
              return (
                <Reveal key={i} at={ats[i]} from={col === 0 ? 'left' : 'right'}>
                  <Glass accent={C.gold} pad={18} style={{display: 'flex', alignItems: 'center', gap: 20, height: 130, boxSizing: 'border-box'}}>
                    <div style={{fontFamily: MONO, fontSize: 44, fontWeight: 800, color: C.gold, width: 60}}>{i + 1}</div>
                    <div style={{flex: 1}}>
                      <div style={{fontSize: 30, fontWeight: 800, lineHeight: 1.2}}>{s.t}</div>
                      <div style={{fontSize: 21, color: C.muted, marginTop: 4}}>{s.s}</div>
                    </div>
                    <Check at={dones[i] - 12} size={56} />
                  </Glass>
                </Reveal>
              );
            })}
          </div>
        ))}
        {ats.map((a, i) => (
          <React.Fragment key={i}>
            <Sfx at={a} name="air_whoosh" volume={0.25} />
            <Sfx at={dones[i] + 10} name="tactile_click" volume={0.5} />
          </React.Fragment>
        ))}
      </Layer>

      <div style={{position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', opacity: vis(frame, cAlone, cFinal)}}>
        <KLine at={cAlone} size={40} color={C.gold}>You are not alone. You are not a criminal.</KLine>
      </div>
      {/* finale */}
      <Layer opacity={part}>
        <div
          style={{
            position: 'absolute',
            left: -40,
            right: -40,
            top: -120,
            bottom: -220,
            background: `radial-gradient(ellipse 60% 50% at 50% ${90 - sun * 25}%, ${alpha('#fbbf24', 0.55)}, ${alpha('#f97316', 0.25)} 40%, transparent 70%), linear-gradient(180deg, #0c1a33, #3b2410 80%)`,
          }}
        />
        <div style={{position: 'absolute', left: 0, right: 0, top: 420, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 10, opacity: sun * (1 - teaser)}}>
          <Person size={260} color="#0b1220" />
          <Person size={230} color="#0b1220" />
          <Person size={150} color="#0b1220" />
          <Person size={120} color="#0b1220" />
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', opacity: 1 - teaser, transform: `translateY(${-teaser * 40}px)`}}>
          <Reveal at={cFinal + 30} from="top" distance={60}>
            <div style={{fontSize: 96, fontWeight: 900, letterSpacing: -1, lineHeight: 1.05, color: '#fff', textShadow: `0 0 40px ${alpha(C.gold, 0.6)}`}}>
              DEBT IS A CHAPTER,
              <br />
              <span style={{color: C.gold}}>NOT YOUR LIFE.</span>
            </div>
          </Reveal>
          <Reveal at={cFinal + 70} from="bottom" distance={30}>
            <div style={{fontFamily: MONO, fontSize: 34, letterSpacing: 10, marginTop: 24, color: '#FDE68A', fontWeight: 700}}>TAKE CONTROL TODAY</div>
          </Reveal>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 730, textAlign: 'center', fontSize: 20, color: alpha('#FFFFFF', 0.7), textShadow: '0 1px 6px rgba(0,0,0,0.8)', opacity: vis(frame, cFinal + 90)}}>
          Awareness only · not legal or financial advice · verify with a qualified advocate
        </div>
        <Sfx at={cFinal + 30} name="title_hit" volume={0.45} />
        <Sfx at={cFinal + 60} name="triumph_rise" volume={0.4} />
        {teaser > 0 && <Teaser told={cTold} myself={cMyself} next={cNext} sub={cSub} bell={cBell} share={cShare} />}
      </Layer>
    </SceneShell>
  );
};

/* ---------------- next-video teaser + subscribe CTA ---------------- */

const Teaser: React.FC<{told: number; myself: number; next: number; sub: number; bell: number; share: number}> = ({told, myself, next, sub, bell, share}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = (at: number) => spr(frame, fps, at, {damping: 15, stiffness: 210, mass: 0.6});
  const card = pop(next);
  // cursor glides to the subscribe button and clicks
  const click = sub + 22;
  const cx = interpolate(frame, [sub - 4, click], [1680, 1430], CLAMP);
  const cy = interpolate(frame, [sub - 4, click], [760, 470], CLAMP);
  const pressed = frame >= click;
  const press = interpolate(frame, [click, click + 4, click + 10], [1, 0.9, 1], CLAMP);
  const ring = frame >= bell ? Math.sin((frame - bell) / 1.6) * 18 * Math.exp(-(frame - bell) / 18) : 0;
  return (
    <div style={{position: 'absolute', inset: 0, fontFamily: FONT}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 30, textAlign: 'center', opacity: vis(frame, told)}}>
        <div style={{fontFamily: MONO, fontSize: 26, letterSpacing: 10, color: C.gold}}>ONE MORE THING…</div>
        <div style={{fontSize: 76, fontWeight: 900, marginTop: 12, opacity: pop(myself), transform: `scale(${0.9 + 0.1 * pop(myself)})`, textShadow: '0 4px 30px rgba(0,0,0,0.6)'}}>
          I'm going through this <span style={{color: C.gold}}>myself.</span>
        </div>
      </div>
      {/* next video card */}
      <div style={{position: 'absolute', left: 140, top: 250, width: 980, opacity: card, transform: `translateY(${(1 - card) * 60}px)`}}>
        <div style={{borderRadius: 26, overflow: 'hidden', background: 'rgba(8,12,24,0.9)', border: `2px solid ${alpha(C.gold, 0.7)}`, boxShadow: `0 30px 70px rgba(0,0,0,0.6), 0 0 40px ${alpha(C.gold, 0.25)}`, display: 'flex'}}>
          <div style={{position: 'relative', width: 400, height: 300, background: 'linear-gradient(135deg, #1e293b, #0f172a)'}}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{position: 'absolute', left: 50 + i * 60, top: 40 + i * 18, width: 190, height: 230, borderRadius: 8, background: '#FDFCF7', transform: `rotate(${(i - 1) * 7}deg)`, boxShadow: '0 10px 24px rgba(0,0,0,0.5)', filter: i < 2 ? 'blur(2px)' : undefined}}>
                <div style={{margin: '18px 16px 10px', height: 12, width: 90, borderRadius: 6, background: '#1E3A8A'}} />
                {[0, 1, 2, 3, 4].map((l) => (
                  <div key={l} style={{margin: '10px 16px', height: 7, width: `${80 - l * 9}%`, borderRadius: 4, background: '#D6D3D1'}} />
                ))}
                {i === 2 && (
                  <div style={{position: 'absolute', left: 18, top: 150, padding: '4px 10px', border: '3px solid #B91C1C', color: '#B91C1C', fontWeight: 900, fontSize: 16, letterSpacing: 2, transform: 'rotate(-12deg)'}}>REAL CASE</div>
                )}
              </div>
            ))}
            <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center'}}>
              <div style={{width: 92, height: 92, borderRadius: 46, background: 'rgba(0,0,0,0.55)', display: 'grid', placeItems: 'center', border: '3px solid #fff'}}>
                <svg width={40} height={44} viewBox="0 0 40 44"><path d="M8 4 L36 22 L8 40 Z" fill="#fff" /></svg>
              </div>
            </div>
          </div>
          <div style={{flex: 1, padding: '30px 34px'}}>
            <div style={{display: 'inline-block', padding: '6px 14px', borderRadius: 8, background: C.crimson, fontFamily: MONO, fontWeight: 800, fontSize: 18, letterSpacing: 3}}>NEXT VIDEO</div>
            <div style={{fontSize: 52, fontWeight: 900, marginTop: 16, lineHeight: 1.05}}>My own case</div>
            <div style={{fontSize: 26, color: C.muted, marginTop: 14, lineHeight: 1.35}}>How I'm handling my banks — step by step, with real letters and real replies.</div>
          </div>
        </div>
      </div>
      {/* subscribe + bell */}
      <div style={{position: 'absolute', left: 1180, top: 300, opacity: pop(sub - 8), transform: `scale(${(0.9 + 0.1 * pop(sub - 8)) * press})`, transformOrigin: 'left center', display: 'flex', alignItems: 'center', gap: 22}}>
        <div style={{padding: '22px 40px', borderRadius: 999, background: pressed ? '#3F3F46' : '#E11D2E', fontSize: 40, fontWeight: 900, letterSpacing: 1.5, color: '#fff', boxShadow: pressed ? undefined : `0 0 30px ${alpha('#E11D2E', 0.6)}`}}>
          {pressed ? 'SUBSCRIBED' : 'SUBSCRIBE'}
        </div>
        <div style={{width: 84, height: 84, borderRadius: 42, background: 'rgba(255,255,255,0.12)', display: 'grid', placeItems: 'center', opacity: interpolate(frame, [click, click + 8], [0, 1], CLAMP), transform: `rotate(${ring}deg)`}}>
          <svg width={46} height={50} viewBox="0 0 46 50"><path d="M23 4 C14 4 9 11 9 19 V30 L4 37 H42 L37 30 V19 C37 11 32 4 23 4 Z" fill={frame >= bell ? C.gold : '#fff'} /><circle cx={23} cy={43} r={5} fill={frame >= bell ? C.gold : '#fff'} /></svg>
        </div>
      </div>
      {/* share */}
      <div style={{position: 'absolute', left: 1180, top: 440, opacity: pop(share), transform: `translateY(${(1 - pop(share)) * 30}px)`, display: 'flex', alignItems: 'center', gap: 16, padding: '16px 28px', borderRadius: 999, background: 'rgba(255,255,255,0.1)', border: `1.5px solid ${alpha('#ffffff', 0.3)}`, fontSize: 27, fontWeight: 800, whiteSpace: 'nowrap'}}>
        <svg width={34} height={30} viewBox="0 0 34 30"><path d="M20 2 L32 13 L20 24 V17 C11 17 6 20 2 28 C3 18 8 10 20 9 Z" fill="#fff" /></svg>
        Share with someone who needs it
      </div>
      {/* cursor */}
      {frame >= sub - 4 && frame < click + 24 && (
        <svg width={40} height={48} viewBox="0 0 40 48" style={{position: 'absolute', left: cx, top: cy, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))'}}>
          <path d="M4 2 L4 38 L14 29 L21 45 L28 42 L21 26 L34 26 Z" fill="#fff" stroke="#111" strokeWidth={2} />
        </svg>
      )}
      <Sfx at={myself} name="sub_thud" volume={0.35} />
      <Sfx at={next} name="card_slide" volume={0.35} />
      <Sfx at={click} name="key_click" volume={0.5} />
      <Sfx at={bell} name="notification" volume={0.4} />
      <Sfx at={share} name="node_pop" volume={0.35} />
    </div>
  );
};
