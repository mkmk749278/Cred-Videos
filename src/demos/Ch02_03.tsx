import React from 'react';
import {C, FONT, MONO, alpha} from '../theme';
import {Arrow, BeatSfx, Caption, DemoHeader, DemoProps, DemoRoot, Folder, Hi, HI, Lens, Paper, Pill, SUPPORT, useBeats} from './kit';

/* ------------------------------------------------------------------ §C legal distinctions */

const Lane: React.FC<{y: number; o: number; color: string; left: string; right?: React.ReactNode; dim?: boolean}> = ({y, o, color, left, right, dim}) => (
  <div style={{position: 'absolute', left: 120, right: 120, top: y, height: 150, opacity: o * (dim ? 0.45 : 1), display: 'flex', alignItems: 'center', gap: 30}}>
    <div style={{width: 520, height: 130, borderRadius: 22, background: alpha(color, 0.16), border: `3px solid ${color}`, display: 'flex', alignItems: 'center', padding: '0 30px', fontFamily: FONT, fontSize: 38, fontWeight: 850, color: '#fff', boxSizing: 'border-box'}}>{left}</div>
    <div style={{flex: 1, display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap'}}>{right}</div>
  </div>
);

export const LegalDemo: React.FC<DemoProps> = ({ins}) => {
  const {p, on} = useBeats(ins);
  return (
    <DemoRoot ins={ins}>
      <DemoHeader ins={ins} color={C.amber} />
      <Lane y={320} o={p('missed')} color={C.cyan} left="Missed payment — genuine difficulty" right={<>
        <span style={{fontSize: 60, color: C.cyan}}>→</span>
        <Pill text="usually a civil recovery matter" color={C.cyan} size={34} />
      </>} />
      <div style={{position: 'absolute', left: 300, top: 470, opacity: p('missed', 20)}}>
        <Pill text="✕ not automatic proof of cheating" color={C.crimson} size={32} />
      </div>
      <Lane y={560} o={p('fraud')} color={C.amber} left="A cheating allegation needs facts" right={<>
        {on('q1') && <Pill text="Fraud from the beginning?" color={C.amber} size={32} style={{opacity: p('q1')}} />}
        {on('q2') && <Pill text="False documents?" color={C.amber} size={32} style={{opacity: p('q2')}} />}
        {on('q3') && <Pill text="Deliberately misled?" color={C.amber} size={32} style={{opacity: p('q3')}} />}
      </>} />
      <Lane y={760} o={p('fraud', 20)} color="#64748B" dim left="Lawful recovery procedure" right={<span style={{fontFamily: FONT, fontSize: 30, color: SUPPORT}}>— a separate path (next)</span>} />
      <Caption ins={ins} bottom={56} lines={[
        {k: 'missed', text: 'Missing a payment alone does not prove cheating', te: 'Payment miss అయిందని cheating automatic గా prove అవ్వదు'},
        {k: 'fraud', text: 'Cheating is about dishonest intention and deception', te: 'Dishonest intention, deception లాంటి facts చూడాలి'},
        {k: 'q3', text: 'These are separate questions', te: 'ఇవన్నీ separate questions', color: '#FDE68A'},
      ]} />
    </DemoRoot>
  );
};

/* ------------------------------------------------------------------ §C lawful recovery steps */

const Step: React.FC<{x: number; o: number; title: string; sub: string; color: string}> = ({x, o, title, sub, color}) => (
  <div style={{position: 'absolute', left: x, top: 380, width: 440, opacity: o, transform: `translateY(${(1 - o) * 30}px)`}}>
    <div style={{height: 220, borderRadius: 24, background: '#0E1628', border: `3px solid ${color}`, padding: 28, boxSizing: 'border-box', boxShadow: '0 30px 60px rgba(0,0,0,0.45)'}}>
      <div style={{fontFamily: FONT, fontSize: 44, fontWeight: 900, color: '#fff'}}>{title}</div>
      <div style={{fontFamily: FONT, fontSize: 30, color: SUPPORT, marginTop: 10, lineHeight: 1.3}}>{sub}</div>
    </div>
  </div>
);

export const LegalProcDemo: React.FC<DemoProps> = ({ins}) => {
  const {p, lin, on} = useBeats(ins);
  return (
    <DemoRoot ins={ins}>
      <DemoHeader ins={ins} color={C.amber} />
      {on('civil') && <div style={{position: 'absolute', left: 120, top: 300, opacity: p('civil')}}><Pill text="✕ “It’s civil, so nothing can happen”" color={C.crimson} size={34} /></div>}
      <Step x={120} o={p('notice')} title="Notice" sub="The bank may send a legal notice" color={C.amber} />
      <Arrow x1={580} y1={490} x2={690} y2={490} t={on('court') ? lin('court', 12) : 0} color={C.amber} />
      <Step x={720} o={p('court')} title="Court" sub="Through the applicable procedure" color={C.amber} />
      <Arrow x1={1180} y1={490} x2={1290} y2={490} t={on('order') ? lin('order', 12) : 0} color={C.amber} />
      <Step x={1320} o={p('order')} title="Court order" sub="Can have consequences — follow it" color={C.crimson} />
      {on('ignore') && (
        <div style={{position: 'absolute', left: 120, right: 120, top: 660, display: 'flex', gap: 22, alignItems: 'center', opacity: p('ignore')}}>
          <span style={{fontFamily: FONT, fontSize: 36, fontWeight: 850, color: '#FCA5A5'}}>Don’t ignore a genuine:</span>
          <Pill text="legal notice" color={C.crimson} size={32} />
          <Pill text="court summons" color={C.crimson} size={32} />
          <Pill text="arbitration letter" color={C.crimson} size={32} />
        </div>
      )}
      <Caption ins={ins} bottom={56} lines={[
        {k: 'civil', text: 'Civil does not mean “nothing can happen”', te: '“Civil matter కదా, ఏమీ జరగదు” అనుకోవద్దు'},
        {k: 'notice', text: 'The bank can start a legal recovery process', te: 'Bank legal recovery process మొదలుపెట్టొచ్చు'},
        {k: 'ignore', text: 'Don’t ignore genuine legal communication', te: 'నిజమైన notice ని ignore చేయొద్దు', color: '#FCA5A5'},
      ]} />
    </DemoRoot>
  );
};

/* ------------------------------------------------------------------ §C verify a notice */

export const VerifyNoticeDemo: React.FC<DemoProps> = ({ins}) => {
  const {p, on} = useBeats(ins);
  const docIn = p('verify');
  return (
    <DemoRoot ins={ins}>
      <DemoHeader ins={ins} color={C.emerald} />
      {/* VERIFY tray */}
      <div style={{position: 'absolute', left: 120, top: 320, width: 820, height: 560, borderRadius: 30, border: `4px dashed ${alpha(C.cyan, 0.7)}`, background: alpha(C.cyan, 0.05)}}>
        <div style={{position: 'absolute', left: 30, top: 18, fontFamily: MONO, fontSize: 28, letterSpacing: 6, color: C.cyan, fontWeight: 800}}>VERIFY</div>
      </div>
      <div style={{position: 'absolute', left: 180, top: 390 + (1 - docIn) * -220, opacity: docIn}}>
        <Paper w={700} h={440}>
          <div style={{position: 'absolute', left: 40, top: 34, fontSize: 34, fontWeight: 900}}>LEGAL NOTICE</div>
          <div style={{position: 'absolute', right: 34, top: 40, fontSize: 20, fontWeight: 900, color: '#B45309', border: '3px solid #B45309', padding: '4px 10px', borderRadius: 6}}>SAMPLE</div>
          <div style={{position: 'absolute', left: 40, top: 110, fontSize: 28}}>From: <b>Advocate X (sender)</b></div>
          <div style={{position: 'absolute', left: 40, top: 170, fontSize: 28}}>Ref no: <b style={{fontFamily: MONO}}>LN/2026/0412</b></div>
          <div style={{position: 'absolute', left: 40, top: 230, fontSize: 28}}>Card ending <b style={{fontFamily: MONO}}>•••• 4821</b></div>
          <div style={{position: 'absolute', left: 40, right: 40, top: 300, height: 14, borderRadius: 7, background: '#D8D2C4'}} />
          <div style={{position: 'absolute', left: 40, right: 140, top: 330, height: 14, borderRadius: 7, background: '#D8D2C4'}} />
          <Hi x={34} y={104} w={420} h={40} t={on('sender') ? p('sender') : 0} color={C.cyan} label="who sent it?" />
          <Hi x={34} y={164} w={360} h={40} t={on('ref') ? p('ref') : 0} color={C.cyan} label="can it be checked?" />
        </Paper>
      </div>
      {on('help') && <div style={{position: 'absolute', left: 1020, top: 330, opacity: p('help')}}><Pill text="Lawyer or free legal aid — if needed" color={C.emerald} size={34} /></div>}
      {/* loud caller */}
      {on('loud') && (
        <div style={{position: 'absolute', left: 1020, top: 430, width: 780, opacity: p('loud')}}>
          <div style={{padding: '24px 30px', borderRadius: '28px 28px 28px 6px', background: '#2A1416', border: `3px solid ${C.crimson}`, fontFamily: FONT, fontSize: 46, fontWeight: 900, color: '#fff', transform: `scale(${1 + 0.04 * Math.sin(p('loud') * 9)})`}}>“WE WILL FILE A CRIMINAL CASE!”</div>
          <div style={{marginTop: 18}}><Pill text="A loud voice is not legal proof" color={C.amber} size={34} /></div>
        </div>
      )}
      {on('actual') && (
        <div style={{position: 'absolute', left: 1020, top: 690, display: 'flex', gap: 16, opacity: p('actual')}}>
          <Pill text="✓ documents" color={C.emerald} size={32} />
          <Pill text="✓ facts" color={C.emerald} size={32} />
          <Pill text="✓ procedure" color={C.emerald} size={32} />
        </div>
      )}
      {on('actual') && <Folder x={1500} y={760} label="Notices" count={1} color={C.emerald} o={p('actual', 20)} />}
      <Caption ins={ins} bottom={56} lines={[
        {k: 'verify', text: 'Verify every notice', te: 'ప్రతి notice verify చేయండి'},
        {k: 'help', text: 'If needed, a lawyer or legal aid can help', te: 'అవసరమైతే lawyer / legal aid'},
        {k: 'loud', text: 'How loudly a caller speaks is not proof', te: 'Caller గట్టిగా మాట్లాడటం legal proof కాదు', color: '#FDE68A'},
        {k: 'actual', text: 'Real documents, facts and procedure decide', te: 'Actual documents, facts, procedure ముఖ్యం', color: '#86EFAC'},
      ]} />
      <BeatSfx ins={ins} k="verify" name="pages_flip" />
    </DemoRoot>
  );
};

/* ------------------------------------------------------------------ §D many accounts -> one register */

const COLS = [
  {k: 'issuer', label: 'Card issuer', w: 260},
  {k: 'outstanding', label: 'Outstanding', w: 250},
  {k: 'due', label: 'Due date', w: 210},
  {k: 'lastpay', label: 'Last payment', w: 230},
  {k: 'complaint', label: 'Complaint ref', w: 260},
  {k: 'legal', label: 'Legal communication', w: 400},
];
const ROWS = [
  ['Bank A •• 4821', '₹62,400', '05 Nov', '02 Aug', 'CR-1182', '—'],
  ['Bank B •• 7310', '₹1,18,950', '12 Nov', '15 Jul', '—', 'Notice, 10 Oct'],
  ['Bank C •• 2265', '₹23,700', '20 Nov', '01 Sep', '—', '—'],
];

export const RegisterDemo: React.FC<DemoProps> = ({ins}) => {
  const {p, on, lin} = useBeats(ins);
  const form = on('list') ? lin('list', 24) : 0;
  const scatter = [
    {x: 260, y: 420, r: -14, t: 'Bank A card'}, {x: 760, y: 360, r: 8, t: 'Bank B bill'}, {x: 1260, y: 430, r: -6, t: 'Bank C card'},
    {x: 520, y: 680, r: 10, t: 'Missed-call list'}, {x: 1080, y: 700, r: -10, t: 'Notice (Bank B)'},
  ];
  const tableX = 130;
  return (
    <DemoRoot ins={ins}>
      <DemoHeader ins={ins} color={C.cyan} />
      {/* scattered papers, before the list */}
      {scatter.map((s, i) => (
        <div key={i} style={{position: 'absolute', left: s.x + (tableX - s.x) * form, top: s.y + (380 + i * 30 - s.y) * form, width: 360, height: 200, borderRadius: 18, background: i % 2 ? '#F4F1EA' : '#1F2A44', color: i % 2 ? '#1B2433' : '#fff', fontFamily: FONT, fontSize: 32, fontWeight: 800, padding: 24, boxSizing: 'border-box', transform: `rotate(${s.r * (1 - form)}deg) scale(${1 - 0.6 * form})`, opacity: p('fear', i * 5) * (1 - form), boxShadow: '0 20px 50px rgba(0,0,0,0.5)'}}>{s.t}</div>
      ))}
      {/* the register */}
      {on('list') && (
        <div style={{position: 'absolute', left: tableX, top: 340, opacity: form}}>
          <div style={{display: 'flex', borderBottom: `3px solid ${alpha(C.cyan, 0.7)}`}}>
            {COLS.map((c) => (
              <div key={c.k} style={{width: c.w, padding: '12px 14px', fontFamily: FONT, fontSize: 30, fontWeight: 850, color: C.cyan, opacity: p(c.k), whiteSpace: 'nowrap'}}>{c.label}</div>
            ))}
          </div>
          {ROWS.map((r, ri) => (
            <div key={ri} style={{display: 'flex', borderBottom: '2px solid rgba(148,163,184,0.25)', background: ri === 0 && on('separate') ? alpha(C.emerald, 0.1) : 'transparent'}}>
              {COLS.map((c, ci) => (
                <div key={c.k} style={{width: c.w, padding: '18px 14px', fontFamily: ci === 0 ? FONT : MONO, fontSize: 32, fontWeight: ci === 0 ? 800 : 600, color: r[ci] === '—' ? '#64748B' : r[ci].startsWith('Notice') ? '#FCA5A5' : '#fff', opacity: p(c.k, 6 + ri * 5), whiteSpace: 'nowrap'}}>{r[ci]}</div>
              ))}
            </div>
          ))}
        </div>
      )}
      {on('legal') && !HI && (
        <div style={{position: 'absolute', left: 1240, top: 720, opacity: p('legal', 14)}}>
          <Pill text="📎 Notice attached · reply by 25 Oct" color={C.amber} size={30} />
        </div>
      )}
      {on('separate') && (
        <div style={{position: 'absolute', left: tableX, top: 800, opacity: p('separate')}}>
          <div style={{display: 'flex', gap: 20}}>
            <Pill text="Track every account separately" color={C.emerald} size={HI ? 42 : 34} />
            {on('onebank') && <Pill text="Settling Bank A ≠ settling Bank B or C" color={C.amber} size={HI ? 40 : 32} style={{opacity: p('onebank')}} />}
          </div>
        </div>
      )}
      <div style={{position: 'absolute', right: 110, top: 128, padding: '10px 18px', borderRadius: 12, border: `2px solid ${alpha(C.amber, 0.7)}`, background: alpha(C.amber, 0.14), color: '#FDE68A', fontFamily: FONT, fontSize: 28, fontWeight: 750, opacity: form}}>Example register — fictional banks and figures</div>
      <Lens ins={ins} x={tableX} y={650} w={1400} size={58} lines={[
        {k: 'legal', until: 'separate', label: 'Bank B · legal communication', text: '📎 Notice, 10 Oct → reply by 25 Oct', color: C.amber},
      ]} />
      <Caption ins={ins} bottom={56} lines={[
        {k: 'fear', hi: '“Chaar-paanch banks ka loan hai…”', text: '“I owe four or five banks…”', te: '4–5 banks కి అప్పు ఉంది…'},
        {k: 'overwhelmed', hi: 'Itne accounts — dimaag pe pressure', text: 'Many accounts can feel overwhelming', te: 'చాలా accounts ఉంటే mentally చాలా pressure'},
        {k: 'lose', hi: 'Kahan kitna dena hai, yaad hi nahi', text: 'How much do I owe where?', te: 'ఎక్కడ ఎంత కట్టాలో కూడా మర్చిపోవచ్చు', color: '#FCA5A5'},
        {k: 'list', hi: 'Pehle ek simple list banao', text: 'First, make one simple list', te: 'ముందు ఒక simple list తయారు చేయండి'},
        {k: 'legal', hi: 'Legal notice bhi isi list mein — sab ek jagah', text: 'Record any legal communication too — keep it all in one place', te: 'Legal communication కూడా — అన్నీ ఒకే చోట'},
        {k: 'separate', hi: 'Har account ka hisaab alag rakho', text: 'Track every account separately', te: 'ప్రతి account ని separate గా track చేయండి', color: '#86EFAC'},
        {k: 'onebank', hi: 'Ek bank se settle kiya, toh baaki settle nahi hote', text: 'Settling with one bank doesn’t settle the others', te: 'ఒక bank తో settle చేస్తే మిగతా accounts settle అవ్వవు', color: '#FDE68A'},
      ]} />
      <BeatSfx ins={ins} k="list" name="grid_lock" />
    </DemoRoot>
  );
};
