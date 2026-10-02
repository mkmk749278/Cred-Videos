import React from 'react';
import {tx} from '../lib/lang';
import {C, FONT, MONO, alpha} from '../theme';
import {Arrow, BeatSfx, Caption, DemoHeader, DemoProps, DemoRoot, Folder, IllusTag, inr, Paper, PhoneBody, Pill, SUPPORT, useBeats} from './kit';

/* Demonstrations that replace English stage beats the Telugu narration does not support. */

const Card: React.FC<{x: number; y: number; w: number; color: string; o: number; bg?: string; children: React.ReactNode}> = ({x, y, w, color, o, bg = '#0E1628', children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, padding: '20px 24px', borderRadius: 20, background: bg, border: `3px solid ${color}`, boxSizing: 'border-box', opacity: o, boxShadow: '0 30px 60px rgba(0,0,0,0.45)'}}>{children}</div>
);
const T: React.FC<{s?: number; c?: string; w?: number; mt?: number; children: React.ReactNode}> = ({s = 32, c = '#fff', w = 800, mt = 0, children}) => (
  <div style={{fontFamily: FONT, fontSize: s, fontWeight: w, color: c, marginTop: mt, lineHeight: 1.3}}>{children}</div>
);

/* ------------------------------------------------------------------ m06: switching off vs one clear written message */

export const SilenceDemo: React.FC<DemoProps> = ({ins}) => {
  const {p, on} = useBeats(ins);
  const off = on('off') && !on('written');
  return (
    <DemoRoot ins={ins}>
      <DemoHeader ins={ins} color={C.cyan} />
      <PhoneBody x={180} y={300} w={400} h={600}>
        <div style={{position: 'absolute', inset: 0, background: off ? '#000' : '#0B1020', opacity: 1}} />
        {off && <div style={{position: 'absolute', top: 230, left: 0, right: 0, textAlign: 'center', fontSize: 90, color: '#334155', opacity: p('off')}}>⏻</div>}
        {on('written') && (
          <div style={{position: 'absolute', top: 120, left: 22, right: 22, padding: 20, borderRadius: 18, background: '#0F2A1D', border: `2px solid ${C.emerald}`, opacity: p('written')}}>
            <div style={{fontSize: 28, fontWeight: 900}}>✉ Hardship email</div>
            <div style={{fontSize: 22, color: SUPPORT, marginTop: 6}}>to Bank A’s verified grievance contact</div>
            <div style={{fontSize: 22, color: '#86EFAC', marginTop: 10, fontWeight: 800}}>✓ sent</div>
          </div>
        )}
      </PhoneBody>
      {on('peace') && !on('silence') && <div style={{position: 'absolute', left: 660, top: 360, padding: '18px 28px', borderRadius: '28px 28px 28px 8px', background: '#1E293B', border: '3px solid rgba(148,163,184,0.5)', fontFamily: FONT, fontSize: 38, fontWeight: 800, color: '#fff', opacity: p('peace')}}>{tx('“I won’t answer anyone for a few days.”', '“I just want some peace.”')}</div>}
      {on('understandable') && !on('silence') && <div style={{position: 'absolute', left: 660, top: 480, opacity: p('understandable')}}><Pill text="That feeling is understandable" color={C.cyan} size={34} /></div>}
      {/* the bank's side of the silence */}
      {on('silence') && (
        <Card x={700} y={330} w={1080} color={on('written') ? C.emerald : C.amber} o={p('silence')}>
          <T s={26} c={on('written') ? '#86EFAC' : '#FDE68A'}>BANK A · ACCOUNT FILE (illustration)</T>
          <T s={36} mt={10}>{on('written') ? 'Hardship explained in writing ✓' : 'No response · situation unknown'}</T>
          <T s={28} c={SUPPORT} mt={8}>{on('written') ? 'your situation is on record' : 'silence explains nothing about your situation'}</T>
        </Card>
      )}
      {on('resolve') && !on('written') && <div style={{position: 'absolute', left: 700, top: 560, opacity: p('resolve')}}><Pill text="…and the problem stays unresolved" color={C.crimson} size={32} /></div>}
      <Arrow x1={600} y1={460} x2={690} y2={420} t={on('written') ? p('written', 10) : 0} color={C.emerald} width={6} />
      <Caption ins={ins} bottom={44} lines={[
        {k: 'off', text: 'Feel like switching off and disappearing?', te: 'Phone switch off చేసి కనిపించకుండా పోవాలనిపిస్తుందా?'},
        {k: 'understandable', text: 'That feeling is understandable', te: 'ఆ feeling అర్థం చేసుకోదగినదే'},
        {k: 'silence', text: 'But silence doesn’t explain your situation', te: 'కానీ silence మీ పరిస్థితిని bank కి చెప్పదు', color: '#FDE68A'},
        {k: 'written', text: 'Send one clear written communication instead', te: 'బదులుగా ఒక clear written communication పంపండి', color: '#86EFAC'},
      ]} />
    </DemoRoot>
  );
};

/* ------------------------------------------------------------------ m06: keep the records — a record, not a shield */

export const RecordDemo: React.FC<DemoProps> = ({ins}) => {
  const {p, on, lin} = useBeats(ins);
  const items = ['Email copy', 'Attachments', 'Acknowledgement', 'Complaint ID'];
  const filed = on('folder') ? lin('folder', 30) : 0;
  return (
    <DemoRoot ins={ins}>
      <DemoHeader ins={ins} color={C.emerald} />
      {items.map((t, i) => {
        const x0 = 160 + i * 300;
        const y0 = 340 + (i % 2) * 70;
        return (
          <div key={t} style={{position: 'absolute', left: x0 + (1460 - x0) * filed, top: y0 + (420 - y0) * filed, opacity: p('items', i * 6) * (1 - filed * 0.9), transform: `scale(${1 - 0.5 * filed})`}}>
            <Paper w={270} h={130}>
              <div style={{position: 'absolute', left: 18, top: 18, fontSize: 24, fontWeight: 900}}>{t}</div>
              <div style={{position: 'absolute', left: 18, top: 62, width: 180, height: 8, borderRadius: 4, background: '#CBD5E1'}} />
              <div style={{position: 'absolute', left: 18, top: 82, width: 130, height: 8, borderRadius: 4, background: '#CBD5E1'}} />
            </Paper>
          </div>
        );
      })}
      <Folder x={1460} y={360} label="Bank A — records" count={on('folder') ? 4 : 0} color={C.emerald} o={p('folder')} />
      {on('record') && <div style={{position: 'absolute', left: 160, top: 640, opacity: p('record')}}><Pill text="✓ The email you sent is a useful record" color={C.emerald} size={34} /></div>}
      {on('shield') && (
        <Card x={160} y={720} w={820} color={C.crimson} o={p('shield')} bg="#2A1416">
          <T s={32}>🛡 ✕ Not a shield that automatically stops a court case</T>
        </Card>
      )}
      {on('documents') && (
        <div style={{position: 'absolute', left: 1040, top: 730, display: 'flex', flexDirection: 'column', gap: 12, opacity: p('documents')}}>
          <T s={28} c={SUPPORT}>It documents your:</T>
          <div style={{display: 'flex', gap: 12}}>
            {['communication', 'hardship', 'cooperation'].map((t, i) => <Pill key={t} text={t} color={C.cyan} size={30} style={{opacity: p('documents', 6 + i * 6)}} />)}
          </div>
        </div>
      )}
      <Caption ins={ins} bottom={44} lines={[
        {k: 'items', text: 'Email copies, attachments, acknowledgements, complaint IDs', te: 'Email copies, attachments, acknowledgements, complaint IDs'},
        {k: 'folder', text: 'Save them all in one folder', te: 'అన్నీ ఒక folder లో save చేయండి', color: '#86EFAC'},
        {k: 'shield', text: 'A record — not an automatic stop to legal action', te: 'ఇది record మాత్రమే — court case ని automatic గా ఆపదు', color: '#FCA5A5'},
        {k: 'documents', text: 'It shows your communication, hardship and cooperation', te: 'మీ communication, hardship, cooperation ని document చేస్తుంది'},
      ]} />
      <BeatSfx ins={ins} k="folder" name="pages_flip" volume={0.2} />
    </DemoRoot>
  );
};

/* ------------------------------------------------------------------ m07: "our agent visited, your door was locked" */

export const VisitDemo: React.FC<DemoProps> = ({ins}) => {
  const {p, on} = useBeats(ins);
  const checks: [string, string][] = [['facts', 'What do you know? Were you home?'], ['who', 'Who actually visited?'], ['who', 'At what time?'], ['agency', 'Which agency?']];
  return (
    <DemoRoot ins={ins}>
      <DemoHeader ins={ins} color={C.amber} />
      <Card x={160} y={330} w={720} color="rgba(148,163,184,0.6)" o={p('msg')} bg="#1E293B">
        <div style={{fontFamily: MONO, fontSize: 24, color: SUPPORT, letterSpacing: 2}}>SMS · VM-RCVRY · unknown sender</div>
        <T s={38} mt={12}>“Our agent visited, but your door was locked.”</T>
      </Card>
      <div style={{position: 'absolute', left: 980, top: 330, display: 'flex', flexDirection: 'column', gap: 16}}>
        {checks.map(([k, t], i) => (
          <div key={t} style={{display: 'flex', alignItems: 'center', gap: 18, opacity: on(k) ? p(k, (i % 2) * 18) : 0}}>
            <div style={{width: 48, height: 48, borderRadius: 12, border: `3px solid ${C.amber}`, color: '#FDE68A', fontFamily: FONT, fontSize: 30, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>?</div>
            <T s={38}>{t}</T>
          </div>
        ))}
      </div>
      {on('confirm') && <div style={{position: 'absolute', left: 160, top: 680, opacity: p('confirm')}}><Pill text="✓ Confirm through Bank A’s official channel" color={C.emerald} size={36} /></div>}
      <IllusTag text="Example message — fictional" style={{top: 262}} />
      <Caption ins={ins} bottom={44} lines={[
        {k: 'msg', text: 'A message says the agent visited and the door was locked?', te: 'Agent వచ్చారు, door lock అయింది అని message వస్తే?'},
        {k: 'facts', text: 'Check the facts you know', te: 'మీకు తెలిసిన facts చెక్ చేయండి'},
        {k: 'who', text: 'Who visited? At what time?', te: 'ఎవరు వచ్చారు? ఏ time కి?'},
        {k: 'agency', text: 'Which agency? Confirm through the official channel', te: 'ఏ agency? Official channel ద్వారా confirm చేయండి', color: '#86EFAC'},
      ]} />
    </DemoRoot>
  );
};

/* ------------------------------------------------------------------ m11: pay only through channels the bank authorises */

export const PayChannelDemo: React.FC<DemoProps> = ({ins}) => {
  const {p, on} = useBeats(ins);
  return (
    <DemoRoot ins={ins}>
      <DemoHeader ins={ins} color={C.emerald} />
      <PhoneBody x={160} y={290} w={420} h={620}>
        <div style={{position: 'absolute', top: 64, left: 24, right: 24, fontSize: 26, fontWeight: 900}}>🔒 BANK A official app</div>
        <div style={{position: 'absolute', top: 120, left: 24, right: 24, fontSize: 22, color: SUPPORT, lineHeight: 1.6}}>Pay to: Card •••• 4821<br />Settlement ref BA/SET/2026/0917<br />Instalment 1 of 3</div>
        <div style={{position: 'absolute', top: 250, left: 24, right: 24, fontFamily: MONO, fontSize: 40, fontWeight: 800}}>{inr(10000)}</div>
        <div style={{position: 'absolute', top: 330, left: 24, right: 24, padding: '16px 0', borderRadius: 16, background: C.emerald, color: '#04111C', textAlign: 'center', fontSize: 28, fontWeight: 900, opacity: p('app')}}>Pay</div>
      </PhoneBody>
      <div style={{position: 'absolute', left: 680, top: 330, display: 'flex', flexDirection: 'column', gap: 16, opacity: p('only')}}>
        <T s={34}>Only channels the bank authorises:</T>
        {['Official app', 'Official website', 'A method the bank confirmed'].map((t, i) => <Pill key={t} text={`✓ ${t}`} color={C.emerald} size={32} style={{opacity: on('app') ? p('app', i * 6) : 0}} />)}
      </div>
      {on('upi') && (
        <Card x={1340} y={330} w={460} color={C.crimson} o={p('upi')} bg="#2A1416">
          <T s={32}>✕ Agent’s personal UPI</T>
          <T s={24} c="#FCA5A5" mt={6}>e.g. agent.name@upi — never</T>
        </Card>
      )}
      {on('cash') && (
        <Card x={1340} y={490} w={460} color={C.crimson} o={p('cash')} bg="#2A1416">
          <T s={32}>✕ Cash in hand</T>
        </Card>
      )}
      <IllusTag text="Example interface — fictional" style={{top: 262}} />
      <Caption ins={ins} bottom={44} lines={[
        {k: 'only', text: 'Use only payment channels the bank authorises', te: 'Bank authorise చేసిన payment channels మాత్రమే వాడండి'},
        {k: 'app', text: 'Official app, website, or a method the bank confirmed', te: 'Official app, website, లేదా bank confirm చేసిన method', color: '#86EFAC'},
        {k: 'upi', text: 'Never to an agent’s personal UPI — and never cash', te: 'Agent personal UPI కి కాదు, cash ఇవ్వొద్దు', color: '#FCA5A5'},
      ]} />
    </DemoRoot>
  );
};

/* ------------------------------------------------------------------ m12: "is my CIBIL ruined?" — affected, not ruined */

export const ProfileDemo: React.FC<DemoProps> = ({ins}) => {
  const {p, on} = useBeats(ins);
  return (
    <DemoRoot ins={ins}>
      <DemoHeader ins={ins} color={C.cyan} />
      {!on('affect') && (
        <>
          <div style={{position: 'absolute', left: 160, top: 360, padding: '18px 28px', borderRadius: '28px 28px 28px 8px', background: '#1E293B', border: '3px solid rgba(148,163,184,0.5)', fontFamily: FONT, fontSize: 40, fontWeight: 800, color: '#fff', opacity: p('q1'), textDecoration: on('assume') ? 'line-through' : 'none'}}>“Is my CIBIL score ruined?”</div>
          <div style={{position: 'absolute', left: 820, top: 470, padding: '18px 28px', borderRadius: '28px 28px 28px 8px', background: '#1E293B', border: '3px solid rgba(148,163,184,0.5)', fontFamily: FONT, fontSize: 40, fontWeight: 800, color: '#fff', opacity: p('q2'), textDecoration: on('assume') ? 'line-through' : 'none'}}>“Will I ever get a loan again?”</div>
          {on('assume') && <div style={{position: 'absolute', left: 160, top: 620, opacity: p('assume')}}><Pill text="You don’t have to assume the worst" color={C.emerald} size={36} /></div>}
        </>
      )}
      {on('affect') && (
        <div style={{position: 'absolute', left: 160, top: 320, opacity: p('affect')}}>
          <Paper w={1100} h={260}>
            <div style={{position: 'absolute', left: 28, top: 20, fontFamily: MONO, fontSize: 22, letterSpacing: 3, color: '#475569'}}>CREDIT PROFILE (sample)</div>
            <div style={{position: 'absolute', left: 28, right: 28, top: 80, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <span style={{fontSize: 34, fontWeight: 900}}>Bank A card •••• 4821</span>
              <span style={{padding: '6px 16px', borderRadius: 10, border: '2px solid #B45309', color: '#B45309', fontSize: 30, fontWeight: 900}}>Settled</span>
            </div>
            <div style={{position: 'absolute', left: 28, top: 160, fontSize: 30, color: '#B45309', fontWeight: 800}}>can affect your credit profile and future approvals</div>
          </Paper>
          {on('honest') && <div style={{marginTop: 40, opacity: p('honest')}}><Pill text="Affected — not “ruined forever”. Understand it honestly." color={C.cyan} size={34} /></div>}
        </div>
      )}
      <Caption ins={ins} bottom={44} lines={[
        {k: 'q1', text: '“Is my CIBIL ruined? Will I get a loan again?”', te: 'CIBIL పాడైపోయిందా? మళ్ళీ loan వస్తుందా?'},
        {k: 'assume', text: 'You don’t have to assume that', te: 'అలా assume చేయాల్సిన అవసరం లేదు', color: '#86EFAC'},
        {k: 'affect', text: 'But settlement can affect your credit profile', te: 'కానీ settlement మీ credit profile ని affect చేయొచ్చు', color: '#FDE68A'},
        {k: 'honest', text: 'Understand that honestly', te: 'దాన్ని నిజాయితీగా అర్థం చేసుకోండి'},
      ]} />
    </DemoRoot>
  );
};

/* ------------------------------------------------------------------ m08: "ignore calls and the file closes in 60 days?" */

export const SixtyDaysDemo: React.FC<DemoProps> = ({ins}) => {
  const {p, on, lin} = useBeats(ins);
  // call volume: drops, then rises again
  const pts = Array.from({length: 25}, (_, i) => {
    const x = i / 24;
    const calls = x < 0.55 ? 1 - 0.7 * Math.sin((x / 0.55) * Math.PI * 0.5) : 0.3 + (x - 0.55) * 1.4;
    return `${i * 19},${20 + (1 - calls) * 150}`;
  });
  const shown = on('calls') ? Math.max(2, Math.round(25 * lin('calls', 60))) : 0;
  return (
    <DemoRoot ins={ins}>
      <DemoHeader ins={ins} color={C.amber} />
      {/* day-60 countdown */}
      <Card x={160} y={330} w={460} color={on('noguarantee') ? C.crimson : 'rgba(148,163,184,0.6)'} o={p('q')}>
        <T s={26} c={SUPPORT}>IGNORE ALL CALLS FOR…</T>
        <div style={{fontFamily: MONO, fontSize: 96, fontWeight: 900, color: '#fff', lineHeight: 1.1}}>60 days</div>
        <T s={30} c={on('noguarantee') ? '#FCA5A5' : '#fff'} mt={4}><span style={{textDecoration: on('noguarantee') ? 'line-through' : 'none'}}>…and the file closes?</span></T>
        {on('noguarantee') && <div style={{marginTop: 12, opacity: p('noguarantee')}}><Pill text="No such guarantee" color={C.crimson} size={30} /></div>}
      </Card>
      {/* assignment changes */}
      {on('agency') && (
        <Card x={680} y={330} w={520} color="rgba(148,163,184,0.6)" o={p('agency')}>
          <T s={26} c={SUPPORT}>RECOVERY ASSIGNMENT</T>
          <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 10}}>
            <Pill text="Agency X" color="#94A3B8" size={28} style={{opacity: 1 - 0.6 * p('agency', 30)}} />
            <span style={{fontFamily: FONT, fontSize: 36, color: SUPPORT}}>→</span>
            <Pill text="Agency Y" color={C.amber} size={28} style={{opacity: p('agency', 30)}} />
          </div>
          <T s={24} c={SUPPORT} mt={10}>the agency or bank team may change</T>
        </Card>
      )}
      {on('calls') && (
        <Card x={1260} y={330} w={540} color="rgba(148,163,184,0.6)" o={p('calls')}>
          <T s={26} c={SUPPORT}>CALLS</T>
          <svg width={480} height={200} style={{display: 'block', marginTop: 6}}>
            <polyline points={pts.slice(0, shown).join(' ')} fill="none" stroke={C.amber} strokeWidth={6} strokeLinejoin="round" />
          </svg>
          <T s={24} c={SUPPORT}>may drop, then rise again</T>
        </Card>
      )}
      {on('debt') && !on('notsilence') && (
        <div style={{position: 'absolute', left: 160, top: 720, display: 'flex', alignItems: 'center', gap: 20, opacity: p('debt')}}>
          <Pill text="Still owed — the debt doesn’t disappear" color={C.crimson} size={34} />
        </div>
      )}
      {on('notsilence') && (
        <div style={{position: 'absolute', left: 160, top: 700, opacity: p('notsilence')}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
            <span style={{fontFamily: FONT, fontSize: 34, fontWeight: 800, color: '#FCA5A5', textDecoration: 'line-through'}}>a plan built on silence</span>
            <span style={{fontFamily: FONT, fontSize: 34, color: SUPPORT}}>→</span>
            {['budget', 'written communication', 'evidence', 'verified repayment options'].map((t, i) => (
              <Pill key={t} text={t} color={C.emerald} size={30} style={{opacity: on('plan') ? p('plan', i * 12) : 0}} />
            ))}
          </div>
        </div>
      )}
      <Caption ins={ins} bottom={44} lines={[
        {k: 'q', text: '“If I don’t answer, will the file close after 60 days?”', te: 'Calls ఎత్తకపోతే 60 రోజుల తర్వాత file close అవుతుందా?'},
        {k: 'noguarantee', text: 'There is no such guarantee', te: 'అలాంటి guarantee ఏమీ లేదు', color: '#FCA5A5'},
        {k: 'agency', text: 'The agency or team may change', te: 'Agency, bank team మారొచ్చు'},
        {k: 'debt', text: 'A new assignment doesn’t make the debt disappear', te: 'Agency మారినా debt మాయం అవ్వదు', color: '#FCA5A5'},
        {k: 'notsilence', text: 'Your plan shouldn’t depend on silence', te: 'మీ plan silence మీద ఆధారపడకూడదు'},
        {k: 'plan', text: 'Budget, written communication, evidence, verified options', te: 'Budget, written communication, evidence, verified options', color: '#86EFAC'},
      ]} />
    </DemoRoot>
  );
};
