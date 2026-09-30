import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {C, FONT, MONO, alpha} from '../theme';
import {CLAMP, rnd, vis} from '../lib/anim';
import {cueFrame, FPS, LEAD, sceneFrames} from '../lib/timing';
import {SceneShell} from '../components/SceneShell';
import {Counter, Cross, Glass, Label, Layer, Phone, Reveal, Sfx, shake, Stamp, Tag} from '../components/primitives';
import {Person} from '../components/icons';

const I = 6;

const Bubble: React.FC<{at: number; children: React.ReactNode; from?: string; color?: string}> = ({at, children, from = 'Unknown', color = '#1f2c34'}) => (
  <Reveal at={at} from="bottom" distance={40}>
    <div style={{background: color, borderRadius: '4px 18px 18px 18px', padding: '12px 16px', fontFamily: FONT, fontSize: 21, lineHeight: 1.35, color: '#e9edef', maxWidth: 330}}>
      <div style={{fontSize: 15, color: '#53bdeb', fontWeight: 700, marginBottom: 4}}>{from}</div>
      {children}
    </div>
  </Reveal>
);

export const Scene07: React.FC = () => {
  const frame = useCurrentFrame();
  const D = sceneFrames(I);
  const c0 = LEAD * FPS;
  const cWa = cueFrame(I, 'Number One');
  const cWhy = cueFrame(I, 'why would they');
  const cCall = cueFrame(I, 'sitting in a call center');
  const cGhost = cueFrame(I, 'Number Two');
  const cScript = cueFrame(I, 'automated script');
  const cLink = cueFrame(I, 'Number Three');
  const cToken = cueFrame(I, 'tracking tokens');
  const cGenuine = cueFrame(I, 'Real court summons');
  const cDoor = cueFrame(I, 'And if someone actually');
  const cDocs = cueFrame(I, 'ask for two documents');
  const cCannot = cueFrame(I, 'If they cannot produce');
  const c112 = cueFrame(I, 'dial 112');
  const cLeave = cueFrame(I, 'People without proper');
  const zoom = interpolate(frame, [cCall - 10, cCall + 30], [0, 1], CLAMP);
  const sh = shake(frame, cWhy + 40, 10);

  return (
    <SceneShell index={I} duration={D} music="tension" tint={C.violet} stageStyle={{translate: `${sh.x}px ${sh.y}px`}}>
      <Layer opacity={vis(frame, c0 - 10, cWa + 4)}>
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 30}}>
          {['WhatsApp live location', 'Ghost visit SMS', 'Tracking link notices', 'Doorstep visits'].map((t, i) => (
            <Reveal key={t} at={c0 + 10 + i * 10} from="bottom">
              <Glass accent={C.violet} style={{width: 360, textAlign: 'center'}}>
                <div style={{fontFamily: MONO, color: C.violet, fontSize: 60, fontWeight: 800}}>0{i + 1}</div>
                <div style={{fontSize: 30, fontWeight: 800, marginTop: 8}}>{t}</div>
              </Glass>
            </Reveal>
          ))}
        </div>
        {[0, 1, 2, 3].map((i) => (
          <Sfx key={i} at={c0 + 10 + i * 10} name="card_slide" volume={0.3} />
        ))}
      </Layer>

      {/* 1: WhatsApp live location */}
      <Layer opacity={vis(frame, cWa, cGhost + 4)}>
        <div style={{position: 'absolute', left: 200, top: 0, transform: `scale(${1 - zoom * 0.35}) translate(${-zoom * 200}px, ${zoom * 80}px)`, transformOrigin: 'top left'}}>
          <Phone width={380} height={750} screen="#0b141a">
            <div style={{position: 'absolute', top: 60, left: 0, right: 0, height: 70, background: '#202c33', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12, fontFamily: FONT}}>
              <div style={{width: 44, height: 44, borderRadius: 22, background: '#475569'}} />
              <div>
                <div style={{fontWeight: 700, fontSize: 20}}>+91 77298 XXXXX</div>
                <div style={{fontSize: 14, color: C.muted}}>online</div>
              </div>
            </div>
            <div style={{position: 'absolute', top: 150, left: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 12}}>
              <Bubble at={cWa + 10} from="Collection Agent">Field team (Subhas &amp; team) is visiting your area today for inspection.</Bubble>
              <Bubble at={cWa + 40} from="Collection Agent">
                📍 <b>Share Live Location immediately</b> or legal action will start.
              </Bubble>
            </div>
            <div style={{position: 'absolute', top: 360, left: 40}}>
              <Stamp at={cWhy + 40} text="BLUFF EXPOSED" size={40} rotate={-12} />
            </div>
          </Phone>
        </div>
        <div style={{position: 'absolute', left: 900, top: 60, width: 900, opacity: zoom}}>
          <Glass accent={C.violet} pad={30}>
            <Label color={C.violet}>Where the sender actually is</Label>
            <svg width={840} height={420} style={{marginTop: 10}}>
              {new Array(220).fill(0).map((_, i) => (
                <circle key={i} cx={60 + rnd(i) * 720} cy={20 + rnd(i + 50) * 380} r={2.5} fill={alpha(C.muted, 0.35)} />
              ))}
              <path d="M 230 90 Q 400 150 560 330" stroke={C.violet} strokeWidth={4} fill="none" strokeDasharray="10 8" pathLength={1} strokeDashoffset={1 - zoom} />
              <circle cx={230} cy={90} r={14} fill={C.crimson} />
              <circle cx={230} cy={90} r={14 + (frame % 30)} fill="none" stroke={C.crimson} opacity={1 - (frame % 30) / 30} />
              <text x={255} y={80} fill="#fff" fontFamily="Inter" fontWeight={800} fontSize={24}>Call centre desk (e.g. NCR)</text>
              <circle cx={560} cy={330} r={14} fill={C.cyan} />
              <text x={585} y={338} fill="#fff" fontFamily="Inter" fontWeight={800} fontSize={24}>You (another city)</text>
              <text x={330} y={250} fill={C.violet} fontFamily="JetBrains Mono" fontWeight={800} fontSize={22}>≈ 1,200+ km</text>
            </svg>
            <div style={{fontSize: 28, fontWeight: 700}}>
              A real visitor with your address wouldn't need your location. <span style={{color: C.violet}}>Block.</span>
            </div>
          </Glass>
        </div>
        <Sfx at={cWa + 10} name="notification" volume={0.3} />
        <Sfx at={cWa + 40} name="notification" volume={0.3} />
        <Sfx at={cWhy + 40} name="buzzer" volume={0.35} />
        <Sfx at={cWhy + 41} name="stamp_heavy" volume={0.4} />
        <Sfx at={cCall} name="radar_ping" volume={0.25} />
      </Layer>

      {/* 2: Ghost visit */}
      <Layer opacity={vis(frame, cGhost, cLink + 4)}>
        <div style={{position: 'absolute', left: 170, top: 90}}>
          <Reveal at={cGhost + 6} from="left">
            <Glass accent={C.amber} style={{width: 640}}>
              <Label color={C.amber}>SMS · VM-RCVRY</Label>
              <div style={{fontSize: 32, fontWeight: 700, marginTop: 12, lineHeight: 1.35}}>“Our channel partner visited your residence today. Door was locked. Contact immediately.”</div>
              <div style={{fontFamily: MONO, fontSize: 20, color: C.muted, marginTop: 14}}>11:30:00 AM</div>
            </Glass>
          </Reveal>
        </div>
        <div style={{position: 'absolute', left: 950, top: 40, width: 800, opacity: vis(frame, cScript - 20)}}>
          <div style={{display: 'flex', gap: 30, alignItems: 'flex-start'}}>
            <div style={{width: 220, borderRadius: 14, background: '#0f172a', border: `2px solid ${C.border}`, padding: 14}}>
              {new Array(9).fill(0).map((_, i) => (
                <div key={i} style={{height: 38, marginBottom: 8, borderRadius: 6, background: '#1e293b', display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px'}}>
                  {[0, 1, 2, 3].map((j) => (
                    <div key={j} style={{width: 8, height: 8, borderRadius: 4, background: (frame + i * 3 + j * 5) % 12 < 6 ? C.green : '#14532d'}} />
                  ))}
                  <div style={{flex: 1, height: 4, background: '#334155', marginLeft: 8}} />
                </div>
              ))}
            </div>
            <div style={{flex: 1, position: 'relative', height: 480, overflow: 'hidden'}}>
              {new Array(14).fill(0).map((_, i) => {
                const y = ((frame * 9 + i * 60) % 520) - 40;
                return (
                  <div key={i} style={{position: 'absolute', left: (i % 3) * 20, top: y, fontFamily: MONO, fontSize: 18, color: alpha(C.amber, 0.8), whiteSpace: 'nowrap'}}>
                    SMS → +91 9XXXX XXX{String(i).padStart(2, '0')} · “visited · door locked”
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{fontFamily: MONO, fontSize: 28, fontWeight: 800, color: C.amber, marginTop: 10}}>
            <Counter from={0} to={10000} start={cScript - 10} end={cScript + 60} format={(n) => Math.round(n).toLocaleString('en-IN')} /> identical texts · same second
          </div>
        </div>
        <div style={{position: 'absolute', left: 240, top: 420}}>
          <Stamp at={cScript + 50} text={'AUTOMATED SCRIPT'} sub="often nobody visited" color={C.amber} size={46} />
        </div>
        <Sfx at={cGhost + 6} name="notification" volume={0.3} />
        <Sfx at={cScript - 15} name="printer_blast" volume={0.35} />
        <Sfx at={cScript + 50} name="stamp_heavy" volume={0.5} />
      </Layer>

      {/* 3: tracking link */}
      <Layer opacity={vis(frame, cLink, cDoor + 4)}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 60, display: 'flex', justifyContent: 'center'}}>
          <Reveal at={cLink + 6} from="bottom">
            <Glass accent={C.crimson} style={{width: 1300}}>
              <Label color={C.crimson}>SMS · “Legal notice issued”</Label>
              <div style={{fontSize: 34, fontWeight: 700, marginTop: 10}}>View your legal notice here:</div>
              <div style={{fontFamily: MONO, fontSize: 38, marginTop: 12, color: '#93c5fd', textDecoration: 'underline'}}>
                https://notice-portal.example/n/8f3k2
                <span style={{color: C.crimson, textDecoration: 'none', opacity: vis(frame, cToken)}}>?track_ip=1&amp;device_fp=true&amp;engaged=1</span>
              </div>
            </Glass>
          </Reveal>
        </div>
        <div style={{position: 'absolute', left: interpolate(frame, [cToken - 20, cToken + 20], [300, 1060], CLAMP), top: 150, width: 200, height: 200, borderRadius: '50%', border: `8px solid ${C.muted}`, background: alpha(C.cyan, 0.08), opacity: vis(frame, cToken - 20, cGenuine), boxShadow: `0 0 30px ${alpha(C.cyan, 0.3)}`}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 400, display: 'flex', justifyContent: 'center', gap: 60, alignItems: 'center'}}>
          <Reveal at={cToken + 30} from="left">
            <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
              <Cross at={cToken + 36} size={100} />
              <div style={{fontSize: 44, fontWeight: 900, color: C.crimson}}>NEVER CLICK COLLECTION LINKS</div>
            </div>
          </Reveal>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center', opacity: vis(frame, cGenuine)}}>
          <Tag color={C.emerald} style={{fontSize: 24, fontFamily: FONT, textTransform: 'none'}}>✓ Genuine court summons are served formally — e.g. registered post / court process</Tag>
        </div>
        <Sfx at={cLink + 6} name="notification" volume={0.3} />
        <Sfx at={cToken} name="radar_ping" volume={0.35} />
        <Sfx at={cToken + 36} name="buzzer" volume={0.3} />
      </Layer>

      {/* 4: doorstep */}
      <Layer opacity={vis(frame, cDoor, D)}>
        <svg width={700} height={700} style={{position: 'absolute', left: 120, top: 20}}>
          <rect x={120} y={40} width={460} height={640} fill="#1e293b" stroke="#475569" strokeWidth={8} />
          <rect x={150} y={70} width={400} height={610} fill="#3f2a1d" />
          <rect x={150} y={70} width={400 * (1 - 0.35 * Math.min(1, (frame - cDoor) / 20))} height={610} fill="#5b3a26" stroke="#2b1a10" strokeWidth={4} />
          <circle cx={520 - 140 * Math.min(1, Math.max(0, (frame - cDoor) / 20))} cy={380} r={12} fill={C.gold} />
        </svg>
        <div style={{position: 'absolute', left: 560 + interpolate(frame, [cLeave, cLeave + 60], [0, 500], CLAMP), top: 180, opacity: 1 - interpolate(frame, [cLeave + 20, cLeave + 60], [0, 1], CLAMP), transform: frame > cLeave ? 'scaleX(-1)' : undefined}}>
          <Person size={420} color="#64748b" />
        </div>
        <div style={{position: 'absolute', left: 1000, top: 30, width: 800}}>
          <Reveal at={cDoor + 10} from="right">
            <Glass accent={C.cyan}>
              <Label color={C.cyan}>● REC · doorstep protocol</Label>
              <div style={{fontSize: 26, color: C.muted, marginTop: 6}}>Step outside · never let them in · record video</div>
              {[
                {t: 'Identity card (bank employee / authorised agent)', at: cDocs + 10},
                {t: "Bank's written authorization for YOUR account", at: cDocs + 50},
              ].map((d, i) => (
                <div key={i} style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 20, opacity: vis(frame, d.at)}}>
                  <div style={{fontFamily: MONO, fontSize: 26, color: C.cyan, fontWeight: 800}}>0{i + 1}</div>
                  <div style={{flex: 1, fontSize: 30, fontWeight: 700}}>{d.t}</div>
                  <Cross at={cCannot + 10 + i * 12} size={52} />
                </div>
              ))}
            </Glass>
          </Reveal>
          <div style={{marginTop: 24, display: 'flex', gap: 24, alignItems: 'center', opacity: vis(frame, c112 - 10)}}>
            <div style={{display: 'flex', gap: 14}}>
              {['1', '1', '2'].map((n, i) => (
                <div key={i} style={{width: 96, height: 96, borderRadius: 48, background: frame > c112 + i * 9 ? C.crimson : '#1e293b', display: 'grid', placeItems: 'center', fontSize: 48, fontWeight: 900, boxShadow: frame > c112 + i * 9 ? `0 0 30px ${C.crimson}` : undefined}}>
                  {n}
                </div>
              ))}
            </div>
            <div style={{fontSize: 26, color: C.muted, lineHeight: 1.3}}>
              Remind them of the RBI Fair Practices Code.
              <br />
              Feel threatened? <b style={{color: C.text}}>Dial 112.</b>
            </div>
          </div>
        </div>
        <Sfx at={cDoor} name="block_slam" volume={0.3} />
        <Sfx at={cCannot + 10} name="buzzer" volume={0.25} />
        <Sfx at={c112} name="dial_112" volume={0.5} />
      </Layer>
    </SceneShell>
  );
};
