import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT, MONO, alpha} from '../theme';
import {spr, vis} from '../lib/anim';
import {contentStart, cueFrame, sceneFrames, sentenceEnd} from '../lib/timing';
import {SceneShell} from '../components/SceneShell';
import {Check, Glass, KLine, Label, Layer, Reveal, Sfx, shake, SpokenTile, Stamp, Tag, Type} from '../components/primitives';
import {MailIcon} from '../components/icons';

const I = 5;

const CLAUSES = [
  {cue: 'First, explain', text: 'Genuine, involuntary hardship (medical / income loss)'},
  {cue: 'Second, declare', text: 'I am contactable and have no intention to abscond'},
  {cue: 'Third, request', text: 'All communication in writing to my registered email'},
  {cue: 'Fourth, state', text: 'Intent to resolve via formal One-Time Settlement'},
];

const Crm: React.FC<{start: number; flag: number; stampAt: number}> = ({start, flag, stampAt}) => {
  const frame = useCurrentFrame();
  const lines = [
    '> collections.crm  --account ****4821',
    '  DPD ............ 47',
    '  CALL ATTEMPTS .. 212   ANSWERED: 0',
    '  STATUS ......... UNREACHABLE',
  ];
  return (
    <div style={{width: 820, borderRadius: 18, background: '#020617', border: `2px solid ${alpha(C.crimson, 0.5)}`, boxShadow: `0 0 40px ${alpha(C.crimson, 0.2)}`, overflow: 'hidden', position: 'relative'}}>
      <div style={{height: 40, background: '#111827', display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px'}}>
        {['#ef4444', '#f59e0b', '#22c55e'].map((c) => (
          <div key={c} style={{width: 14, height: 14, borderRadius: 7, background: c}} />
        ))}
        <span style={{fontFamily: MONO, fontSize: 16, color: C.muted, marginLeft: 10}}>bank-internal · collections CRM</span>
      </div>
      <div style={{padding: 26, fontFamily: MONO, fontSize: 26, lineHeight: 1.7, color: '#86efac', minHeight: 300}}>
        {lines.map((l, i) => (
          <div key={i}>
            <Type text={l} start={start + i * 18} cps={70} cursor={false} />
          </div>
        ))}
        {frame >= flag && (
          <div style={{color: C.crimson, fontWeight: 800, textShadow: `0 0 12px ${C.crimson}`, opacity: Math.floor(frame / 6) % 2 && frame < flag + 40 ? 0.4 : 1}}>
            {'  FLAGGED ........ SKIP / ABSCONDING'}
          </div>
        )}
        {frame >= flag + 20 && <div style={{color: C.amber}}>{'  → skip-trace family & alternate numbers'}</div>}
      </div>
      <div style={{position: 'absolute', right: 30, top: 180}}>
        <Stamp at={stampAt} text={'GOOD-FAITH\nRECORD'} sub="willful-default claim countered" color={C.emerald} size={40} rotate={-10} />
      </div>
    </div>
  );
};

export const Scene06: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const D = sceneFrames(I);
  const c0 = contentStart(I);
  const cFlag = cueFrame(I, 'Skip or Absconding');
  const cEmail = cueFrame(I, 'Instead, build');
  const cPoints = CLAUSES.map((c) => cueFrame(I, c.cue));
  const cDone = CLAUSES.map((c) => sentenceEnd(I, c.cue));
  const cCase = cueFrame(I, 'The Case Reference ID');
  const cCounter = cueFrame(I, 'helps counter');
  const cOff = cueFrame(I, 'switch off my phone');
  const cDont = cueFrame(I, "Please don't do that");
  const cRelatives = cueFrame(I, 'your relatives');
  const cFriends = cueFrame(I, 'your friends');
  const cOffice = cueFrame(I, 'even your office');
  const cTop = cueFrame(I, "That's the top person");
  const cReply = cueFrame(I, 'The bank will reply');
  const send = cReply;
  const press = frame >= send && frame < send + 8 ? 0.94 : 1;
  const cert = spr(frame, fps, cCase);
  const sh = shake(frame, cCounter + 7, 10);

  return (
    <SceneShell index={I} duration={D} music="analytic" tint={C.gold} stageStyle={{translate: `${sh.x}px ${sh.y}px`}}>
      <Layer opacity={vis(frame, c0 - 10, cEmail + 4)}>
        <div style={{position: 'absolute', left: 550, top: 90}}>
          <Reveal at={c0} from="bottom">
            <Crm start={c0 + 10} flag={cFlag} stampAt={1e9} />
          </Reveal>
        </div>
        <div style={{position: 'absolute', left: 70, top: 110, display: 'flex', flexDirection: 'column', gap: 16}}>
          <SpokenTile at={cOff} icon="⏻" label="Phone off. Disappear?" color={C.slate} width={400} />
          <KLine at={cDont} size={48} color={C.crimson}>Please don't.</KLine>
        </div>
        <div style={{position: 'absolute', left: 1400, top: 110, display: 'flex', flexDirection: 'column', gap: 14}}>
          <SpokenTile at={cRelatives} doneAt={cFriends} mark="cross" icon="!" label="Relatives called" color={C.crimson} width={420} />
          <SpokenTile at={cFriends} doneAt={cOffice} mark="cross" icon="!" label="Friends called" color={C.crimson} width={420} />
          <SpokenTile at={cOffice} doneAt={sentenceEnd(I, 'even your office')} mark="cross" icon="!" label="Office called" color={C.crimson} width={420} />
        </div>
        {[cOff, cRelatives, cFriends, cOffice].map((a, i) => (
          <Sfx key={i} at={a} name="node_pop" volume={0.32} />
        ))}
        <Sfx at={c0 + 10} name="typing" volume={0.25} />
        <Sfx at={cFlag} name="warning_pulse" volume={0.4} />
      </Layer>
      <Layer opacity={vis(frame, cEmail, cCase + 4)}>
        <div style={{position: 'absolute', left: 260, top: 10}}>
          <Reveal at={cEmail} from="bottom" distance={120}>
            <Glass pad={0} style={{width: 1400, overflow: 'hidden'}}>
              <div style={{padding: '18px 30px', background: 'rgba(15,23,42,0.8)', display: 'flex', alignItems: 'center', gap: 16, borderBottom: `1px solid ${C.border}`}}>
                <MailIcon size={40} color={C.gold} />
                <span style={{fontSize: 26, fontWeight: 800}}>New message · Hardship intimation</span>
              </div>
              <div style={{padding: '14px 30px', fontSize: 24, borderBottom: `1px solid ${C.border}`, fontFamily: MONO}}>
                <span style={{color: C.muted}}>To: </span>
                <Type text="principalnodalofficer@yourbank.example" start={cEmail + 10} cps={45} />
              </div>
              <div style={{padding: '14px 30px', fontSize: 24, borderBottom: `1px solid ${C.border}`}}>
                <span style={{color: C.muted}}>Subject: </span>Financial hardship — card ending 4821 — request for written communication
              </div>
              <div style={{padding: '20px 30px 30px', display: 'flex', flexDirection: 'column', gap: 16}}>
                {CLAUSES.map((c, i) => (
                  <div key={i} style={{display: 'flex', alignItems: 'center', gap: 20, opacity: frame >= cPoints[i] ? 1 : 0.12, minHeight: 60}}>
                    <div style={{fontFamily: MONO, fontSize: 24, fontWeight: 800, color: C.gold, width: 40}}>{i + 1}.</div>
                    <div style={{flex: 1, fontSize: 32, fontWeight: 700}}>
                      <Type text={c.text} start={cPoints[i] + 4} cps={55} />
                    </div>
                    <Check at={cDone[i] - 10} size={50} />
                  </div>
                ))}
              </div>
              <div style={{padding: '0 30px 26px', display: 'flex', justifyContent: 'flex-end'}}>
                <div style={{transform: `scale(${press})`, padding: '14px 36px', borderRadius: 12, background: C.royal, fontWeight: 800, fontSize: 26, boxShadow: `0 0 30px ${alpha(C.royal, 0.6)}`}}>Send ➤</div>
              </div>
            </Glass>
          </Reveal>
        </div>
        {cPoints.map((p, i) => (
          <React.Fragment key={i}>
            <Sfx at={p + 4} name="typing" volume={0.22} />
            <Sfx at={cDone[i] + 12} name="tactile_click" volume={0.5} />
          </React.Fragment>
        ))}
        <div style={{position: 'absolute', left: 1180, top: 40}}>
          <Reveal at={cTop} from="right" distance={40}>
            <Tag color={C.gold} style={{fontSize: 20}}>PNO = top complaints officer</Tag>
          </Reveal>
        </div>
        <div style={{position: 'absolute', left: 1180, top: 660, opacity: vis(frame, send + 10)}}>
          <Tag color={C.emerald} style={{fontSize: 22}}>✓ Sent · written record created</Tag>
        </div>
        <Sfx at={send} name="haptic_tap" volume={0.6} />
        <Sfx at={send + 4} name="email_sent" volume={0.5} />
      </Layer>
      <Layer opacity={vis(frame, cCase, D)}>
        <div style={{position: 'absolute', left: 120, top: 80, opacity: 0.9}}>
          <div style={{transform: 'scale(0.8)', transformOrigin: 'top left'}}>
            <Crm start={-1000} flag={-1000} stampAt={cCounter} />
          </div>
        </div>
        <div style={{position: 'absolute', left: 1000, top: 60 + (1 - cert) * -400, width: 800}}>
          <div style={{borderRadius: 24, padding: 40, background: 'linear-gradient(145deg, #3b2a06, #1c1405)', border: `3px solid ${C.gold}`, boxShadow: `0 0 60px ${alpha(C.gold, 0.35)}`, textAlign: 'center', fontFamily: FONT}}>
            <Label color={C.gold}>Service request registered</Label>
            <div style={{fontFamily: MONO, fontSize: 54, fontWeight: 800, marginTop: 16, color: '#FDE68A'}}>SR-2026-084217</div>
            <div style={{fontSize: 26, color: '#FDE68A', marginTop: 10, opacity: 0.8}}>Case Reference ID · your paper trail</div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 12, marginTop: 26, alignItems: 'flex-start'}}>
              {['Shows good faith', 'Counters “willful default”', 'Audit trail for Lok Adalat'].map((t, i) => (
                <div key={t} style={{display: 'flex', alignItems: 'center', gap: 16, fontSize: 28, fontWeight: 700}}>
                  <Check at={cCase + 30 + i * 18} size={40} color={C.gold} />
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
        <Sfx at={cCase} name="air_whoosh" volume={0.4} />
        <Sfx at={cCounter + 6} name="stamp_heavy" volume={0.55} />
        {[0, 1, 2].map((i) => (
          <Sfx key={i} at={cCase + 52 + i * 18} name="tactile_click" volume={0.4} />
        ))}
      </Layer>
    </SceneShell>
  );
};
