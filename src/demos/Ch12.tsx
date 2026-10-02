import React from 'react';
import {C, FONT, MONO, alpha} from '../theme';
import {Arrow, BeatSfx, Caption, DemoHeader, DemoProps, DemoRoot, IllusTag, inr, Paper, Pill, SUPPORT, useBeats} from './kit';

const Box: React.FC<{x: number; y: number; w: number; h?: number; color: string; o: number; children: React.ReactNode; bg?: string}> = ({x, y, w, h, color, o, children, bg = '#0E1628'}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, padding: '22px 26px', borderRadius: 20, background: bg, border: `3px solid ${color}`, boxSizing: 'border-box', opacity: o, boxShadow: '0 30px 60px rgba(0,0,0,0.45)'}}>{children}</div>
);
const T: React.FC<{s?: number; c?: string; w?: number; mt?: number; children: React.ReactNode}> = ({s = 32, c = '#fff', w = 800, mt = 0, children}) => (
  <div style={{fontFamily: FONT, fontSize: s, fontWeight: w, color: c, marginTop: mt, lineHeight: 1.3}}>{children}</div>
);
const Status: React.FC<{text: string; color: string; strike?: boolean}> = ({text, color, strike}) => (
  <span style={{display: 'inline-block', padding: '6px 16px', borderRadius: 10, background: alpha(color, 0.18), border: `2px solid ${color}`, color, fontFamily: FONT, fontSize: 28, fontWeight: 900, textDecoration: strike ? 'line-through' : 'none'}}>{text}</span>
);

/* ------------------------------------------------------------------ §P Settled vs Closed — the certificate doesn't change the status */

export const ReportsDemo: React.FC<DemoProps> = ({ins}) => {
  const {p, on, stage} = useBeats(ins);
  const st = stage(['settled', 'negative', 'ndc']);
  const row = (name: string, status: React.ReactNode, paid: number, total: number, color: string, o: number, y: number, note: string) => (
    <div style={{position: 'absolute', left: 28, right: 28, top: y, opacity: o}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <span style={{fontSize: 30, fontWeight: 900}}>{name}</span>{status}
      </div>
      <div style={{position: 'relative', height: 26, marginTop: 12, borderRadius: 8, background: '#E2E8F0', overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(paid / total) * 100}%`, background: color}} />
      </div>
      <div style={{fontFamily: MONO, fontSize: 22, color: '#475569', marginTop: 8}}>{note}</div>
    </div>
  );
  return (
    <DemoRoot ins={ins}>
      <DemoHeader ins={ins} color={C.amber} />
      <div style={{position: 'absolute', left: 120, top: 310, opacity: p('settled')}}>
        <Paper w={960} h={440}>
          <div style={{position: 'absolute', left: 28, top: 20, fontFamily: MONO, fontSize: 22, letterSpacing: 3, color: '#475569'}}>CREDIT REPORT (sample) · R. Kumar</div>
          {row('Bank A card •••• 4821', <Status text={st === 2 && on('ndc') && !on('different') ? 'Closed?' : 'Settled'} color={st === 2 && !on('different') ? '#94A3B8' : '#B45309'} strike={st === 2 && !on('different')} />, 30000, 100000, '#F59E0B', 1, 80, `paid ${inr(30000)} of ${inr(100000)} contractual dues · lender consented`)}
          {row('Bank C card •••• 2265', <Status text="Closed" color="#15803D" />, 1, 1, '#22C55E', on('closed') ? p('closed') : 0, 250, 'fully repaid')}
          {st === 2 && on('different') && <div style={{position: 'absolute', left: 28, bottom: 20, fontSize: 26, color: '#B45309', fontWeight: 800}}>Status stays as reported — the certificate doesn’t rewrite it</div>}
        </Paper>
      </div>
      {st === 1 && (
        <>
          <Box x={1140} y={320} w={660} color={C.amber} o={p('negative')}>
            <T s={26} c="#FDE68A">FUTURE LENDER</T>
            <T s={34} mt={8}>🔍 May view “Settled” negatively</T>
          </Box>
          {on('approvals') && (
            <Box x={1140} y={520} w={660} color={C.crimson} o={p('approvals')}>
              <T s={34}>Loan / card application</T>
              <T s={28} c="#FCA5A5" mt={8}>approval can be affected</T>
            </Box>
          )}
        </>
      )}
      {st === 2 && (
        <>
          <div style={{position: 'absolute', left: 1160, top: 320, opacity: p('ndc'), transform: `rotate(2deg)`}}>
            <Paper w={620} h={260} style={{border: `4px double ${C.emerald}`}}>
              <div style={{position: 'absolute', left: 24, top: 20, fontSize: 30, fontWeight: 900}}>No Dues Certificate</div>
              <div style={{position: 'absolute', left: 24, top: 74, fontSize: 26, lineHeight: 1.5}}>BANK A · card •••• 4821<br />settlement amount received</div>
              <div style={{position: 'absolute', left: 24, bottom: 20, fontFamily: MONO, fontSize: 20, color: '#475569'}}>sample — fictional</div>
            </Paper>
          </div>
          <Arrow x1={1160} y1={470} x2={1000} y2={420} t={on('ndc') && !on('different') ? p('ndc', 10) : 0} color="#94A3B8" width={6} dashed />
          {on('different') && (
            <div style={{position: 'absolute', left: 120, top: 790, display: 'flex', alignItems: 'center', gap: 22, opacity: p('different')}}>
              <Pill text="Settlement completion" color={C.emerald} size={34} />
              <span style={{fontFamily: FONT, fontSize: 52, fontWeight: 900, color: C.amber}}>≠</span>
              <Pill text="Credit reporting status" color={C.amber} size={34} />
            </div>
          )}
        </>
      )}
      <Caption ins={ins} bottom={44} lines={[
        {k: 'settled', text: '“Settled”: paid below the full dues, with the lender’s consent', te: 'Settled — full dues కంటే తక్కువ, lender ఒప్పుకోలుతో'},
        {k: 'closed', text: '“Closed”: an account fully repaid', te: 'Closed — పూర్తిగా కట్టేసిన account'},
        {k: 'negative', text: 'Lenders may view “Settled” negatively', te: 'Settled status ని lenders negative గా చూడొచ్చు', color: '#FDE68A'},
        {k: 'ndc', text: 'A No Dues Certificate doesn’t mean the report must show “Closed”', te: 'No Dues Certificate వచ్చినా report లో Closed అని రావాలని లేదు'},
        {k: 'different', text: 'Settlement completion and reporting status are different things', te: 'Settlement completion, credit reporting — రెండూ వేరు', color: '#FDE68A'},
      ]} />
    </DemoRoot>
  );
};

/* ------------------------------------------------------------------ rebuilding: FD-backed secured card */

export const SecuredCardDemo: React.FC<DemoProps> = ({ins}) => {
  const {p, on, lin, stage} = useBeats(ins);
  const st = stage(['fd', 'reserve', 'small']);
  return (
    <DemoRoot ins={ins}>
      <DemoHeader ins={ins} color={C.amber} />
      {st === 0 && (
        <>
          <div style={{position: 'absolute', left: 160, top: 340, opacity: p('fd')}}>
            <Paper w={520} h={300}>
              <div style={{position: 'absolute', left: 26, top: 22, fontSize: 32, fontWeight: 900}}>Fixed deposit</div>
              <div style={{position: 'absolute', left: 26, top: 80, fontFamily: MONO, fontSize: 24, color: '#475569'}}>sample · amount set by you</div>
              <div style={{position: 'absolute', left: 26, bottom: 24, fontSize: 28}}>held as security</div>
            </Paper>
          </div>
          <Arrow x1={700} y1={490} x2={940} y2={490} t={on('card') ? lin('card', 16) : 0} color={C.amber} width={8} />
          {on('card') && (
            <div style={{position: 'absolute', left: 970, top: 360, width: 440, height: 270, borderRadius: 26, background: 'linear-gradient(135deg, #334155, #0F172A)', border: '2px solid rgba(255,255,255,0.2)', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', opacity: p('card')}}>
              <div style={{position: 'absolute', left: 30, top: 28, fontFamily: FONT, fontSize: 30, fontWeight: 900, color: '#fff'}}>Secured card</div>
              <div style={{position: 'absolute', left: 30, top: 80, width: 64, height: 48, borderRadius: 8, background: '#D4AF37'}} />
              <div style={{position: 'absolute', left: 30, bottom: 30, fontFamily: MONO, fontSize: 28, color: '#E2E8F0'}}>•••• •••• •••• 0000</div>
              {on('noguarantee') && <div style={{position: 'absolute', inset: 0, borderRadius: 26, background: 'rgba(15,23,42,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontSize: 96, fontWeight: 900, color: '#FDE68A', opacity: p('noguarantee')}}>?</div>}
            </div>
          )}
          {on('approval') && (
            <div style={{position: 'absolute', left: 1460, top: 360, display: 'flex', flexDirection: 'column', gap: 14, opacity: p('approval')}}>
              <Pill text="Approval" color={C.cyan} size={30} />
              <Pill text="Deposit requirement" color={C.cyan} size={30} />
              <Pill text="Limit" color={C.cyan} size={30} />
              <T s={26} c={SUPPORT}>depend on issuer policy</T>
            </div>
          )}
          {on('noguarantee') && <div style={{position: 'absolute', left: 160, top: 700, opacity: p('noguarantee')}}><Pill text="Opening an FD doesn’t guarantee card approval" color={C.amber} size={34} /></div>}
        </>
      )}
      {st === 1 && (
        <>
          <Box x={160} y={330} w={720} color={C.emerald} o={p('reserve')} bg="#0F2A1D">
            <T s={26} c="#86EFAC">EMERGENCY SAVINGS</T>
            <T s={36} mt={8}>Keep this aside — don’t lock it all up</T>
          </Box>
          <Box x={1000} y={330} w={760} color={C.crimson} o={p('reserve', 12)} bg="#2A1416">
            <T s={34}>✕ Every rupee into the FD</T>
            <T s={28} c="#FCA5A5" mt={8}>just to get a card</T>
          </Box>
        </>
      )}
      {st === 2 && (
        <div style={{position: 'absolute', left: 160, top: 340, opacity: p('small')}}>
          <T s={36}>Small, planned expenses only</T>
          <div style={{display: 'flex', gap: 16, marginTop: 22}}>
            <Pill text="🧾 phone bill" color={C.emerald} size={32} />
            <Pill text="⛽ fuel" color={C.emerald} size={32} />
            <Pill text="🛒 groceries" color={C.emerald} size={32} />
          </div>
        </div>
      )}
      <Caption ins={ins} bottom={44} lines={[
        {k: 'fd', text: 'Later, if suitable: an FD-backed secured card', te: 'తర్వాత suitable అయితే FD-backed secured card'},
        {k: 'approval', text: 'Approval, deposit and limits depend on the issuer', te: 'Approval, deposit, limit — issuer policy మీద ఆధారపడతాయి'},
        {k: 'noguarantee', text: 'An FD doesn’t guarantee approval', te: 'FD చేసినంత మాత్రాన card వస్తుందని guarantee లేదు', color: '#FDE68A'},
        {k: 'reserve', text: 'Don’t lock up your emergency savings for a card', te: 'Card కోసం emergency savings అన్నీ lock చేయకండి'},
        {k: 'small', text: 'Use it only for small, planned expenses', te: 'చిన్న, plan చేసిన ఖర్చులకి మాత్రమే వాడండి', color: '#86EFAC'},
      ]} />
    </DemoRoot>
  );
};

/* ------------------------------------------------------------------ rebuilding: pay in full, keep usage low — no guaranteed score */

export const UsageDemo: React.FC<DemoProps> = ({ins}) => {
  const {p, on} = useBeats(ins);
  const LIMIT = 20000;
  const X = 160;
  const W = 1600;
  return (
    <DemoRoot ins={ins}>
      <DemoHeader ins={ins} color={C.emerald} />
      <Box x={160} y={320} w={900} color={C.emerald} o={p('full')} bg="#0F2A1D">
        <T s={34}>✓ Pay the full statement balance by the due date</T>
      </Box>
      {on('low') && (
        <>
          <div style={{position: 'absolute', left: X, top: 520, fontFamily: FONT, fontSize: 30, fontWeight: 800, color: '#fff', opacity: p('low')}}>Card limit (example): {inr(LIMIT)}</div>
          <div style={{position: 'absolute', left: X, top: 580, width: W, height: 64, borderRadius: 14, background: '#1E293B', border: '2px solid rgba(148,163,184,0.4)', opacity: p('low')}} />
          <div style={{position: 'absolute', left: X, top: 582, width: W * 0.1 * p('low', 10), height: 60, borderRadius: 12, background: C.emerald}} />
        </>
      )}
      {on('example') && (
        <>
          <div style={{position: 'absolute', left: X + W * 0.1, top: 572, width: W * 0.1, height: 80, border: `4px dashed ${C.cyan}`, borderRadius: 12, opacity: p('example')}} />
          <div style={{position: 'absolute', right: 1920 - (X + W * 0.1) + 10, top: 664, whiteSpace: 'nowrap', fontFamily: MONO, fontSize: 26, color: '#7DD3FC', opacity: p('example')}}>10% · {inr(LIMIT * 0.1)}</div>
          <div style={{position: 'absolute', left: X + W * 0.2 + 10, top: 664, whiteSpace: 'nowrap', fontFamily: MONO, fontSize: 26, color: '#7DD3FC', opacity: p('example')}}>20% · {inr(LIMIT * 0.2)}</div>
          <div style={{position: 'absolute', left: X + W * 0.25, top: 590, fontFamily: FONT, fontSize: 30, color: SUPPORT, opacity: p('example', 10)}}>← one manageable approach (example)</div>
        </>
      )}
      {on('nopct') && <div style={{position: 'absolute', left: X, top: 740, opacity: p('nopct')}}><Pill text="No exact percentage guarantees your score will rise" color={C.amber} size={36} /></div>}
      <IllusTag text="Illustration — example limit" style={{top: 262}} />
      <Caption ins={ins} bottom={44} lines={[
        {k: 'full', text: 'Pay the full statement balance by the due date', te: 'Full statement balance due date కి కట్టండి', color: '#86EFAC'},
        {k: 'low', text: 'Keeping usage low may help', te: 'Usage తక్కువగా ఉంచడం help అవ్వొచ్చు'},
        {k: 'example', text: 'For example, 10 or 20% of the limit', te: 'ఉదాహరణకి limit లో 10 లేదా 20%'},
        {k: 'nopct', text: 'But no exact percentage guarantees a higher score', te: 'కానీ exact percentage తో score పెరుగుతుందని guarantee లేదు', color: '#FDE68A'},
      ]} />
    </DemoRoot>
  );
};

/* ------------------------------------------------------------------ habits + report check and dispute */

export const ReportDisputeDemo: React.FC<DemoProps> = ({ins}) => {
  const {p, on, stage} = useBeats(ins);
  const st = stage(['ontime', 'updated']);
  const habits: [string, string][] = [['ontime', 'Pay on time'], ['ontime', 'Keep usage affordable'], ['apps', 'Avoid repeated, unnecessary applications'], ['check', 'Check your credit report regularly']];
  const rows = [
    {name: 'Bank A card •••• 4821', val: 'Settled', flag: 'updated', note: '✓ updated after settlement', c: C.emerald},
    {name: 'Bank B card •••• 7310', val: '₹1,18,950 overdue', flag: 'error', note: '✕ incorrect balance / status', c: C.crimson},
    {name: 'Bank B card •••• 7310', val: 'duplicate entry', flag: 'error', note: '✕ duplicate account', c: C.crimson},
    {name: 'Bank C card •••• 2265', val: '1 late payment (2025)', flag: 'accurate', note: 'accurate — stays', c: C.amber},
  ];
  return (
    <DemoRoot ins={ins}>
      <DemoHeader ins={ins} color={C.cyan} />
      {st === 0 && (
        <div style={{position: 'absolute', left: 160, top: 330, display: 'flex', flexDirection: 'column', gap: 20}}>
          {habits.map(([k, t], i) => (
            <div key={t} style={{display: 'flex', alignItems: 'center', gap: 22, opacity: on(k) ? p(k, i === 1 ? 50 : 0) : 0}}>
              <div style={{width: 54, height: 54, borderRadius: 14, background: alpha(C.emerald, 0.25), border: `3px solid ${C.emerald}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, color: '#86EFAC', fontWeight: 900}}>✓</div>
              <T s={44} w={850}>{t}</T>
            </div>
          ))}
        </div>
      )}
      {st === 1 && (
        <div style={{position: 'absolute', left: 120, top: 310, opacity: p('updated')}}>
          <Paper w={1100} h={500}>
            <div style={{position: 'absolute', left: 28, top: 20, fontFamily: MONO, fontSize: 22, letterSpacing: 3, color: '#475569'}}>CREDIT REPORT (sample) · R. Kumar</div>
            {rows.map((r, i) => (
              <div key={i} style={{position: 'absolute', left: 28, right: 28, top: 76 + i * 100, display: 'flex', alignItems: 'center', gap: 20, padding: '14px 16px', borderRadius: 12, border: `3px solid ${on(r.flag) ? r.c : 'transparent'}`, background: on(r.flag) ? alpha(r.c, 0.08) : 'transparent'}}>
                <span style={{width: 340, fontSize: 28, fontWeight: 900, whiteSpace: 'nowrap'}}>{r.name}</span>
                <span style={{flex: 1, fontFamily: MONO, fontSize: 24, whiteSpace: 'nowrap'}}>{r.val}</span>
                <span style={{fontSize: 24, fontWeight: 800, color: r.c, opacity: on(r.flag) ? p(r.flag) : 0}}>{r.note}</span>
              </div>
            ))}
          </Paper>
        </div>
      )}
      {st === 1 && on('dispute') && (
        <div style={{position: 'absolute', left: 1280, top: 330, width: 520, display: 'flex', flexDirection: 'column', gap: 16, opacity: p('dispute')}}>
          <T s={32}>Raise a dispute with:</T>
          <Pill text="the lender (Bank B)" color={C.cyan} size={32} />
          <Pill text="the credit bureau" color={C.cyan} size={32} />
          {on('accurate') ? null : <T s={26} c={SUPPORT}>save the reference · BUR-48213 (sample)</T>}
        </div>
      )}
      {st === 1 && on('accurate') && (
        <div style={{position: 'absolute', left: 1280, top: 640, width: 520, opacity: p('accurate')}}>
          <Box x={0} y={0} w={520} color={C.amber} o={1}>
            <T s={30}>🔒 Accurate negative history can’t be removed just because you dislike it</T>
          </Box>
        </div>
      )}
      <IllusTag text="Sample report — fictional" style={{top: 262}} />
      <Caption ins={ins} bottom={44} lines={[
        {k: 'ontime', text: 'The habits that matter most', te: 'ముఖ్యమైన habits'},
        {k: 'check', text: 'Check your credit report regularly', te: 'Credit report regular గా check చేయండి'},
        {k: 'updated', text: 'After settlement, check the report was updated', te: 'Settlement తర్వాత report update అయిందో చూడండి'},
        {k: 'error', text: 'Wrong balance, wrong status, a duplicate account?', te: 'Balance, status తప్పుగా ఉందా? Duplicate account?', color: '#FCA5A5'},
        {k: 'dispute', text: 'Raise a dispute with the lender and the bureau', te: 'Lender, credit bureau దగ్గర dispute raise చేయండి', color: '#7DD3FC'},
        {k: 'accurate', text: 'Accurate history stays', te: 'నిజమైన negative history ని తీసేయలేం', color: '#FDE68A'},
      ]} />
      <BeatSfx ins={ins} k="error" name="haptic_buzz" volume={0.16} />
    </DemoRoot>
  );
};

/* ------------------------------------------------------------------ rebuilding: stabilise first (income, budget, reserve) */

export const StabiliseDemo: React.FC<DemoProps> = ({ins}) => {
  const {p, on, lin} = useBeats(ins);
  // income line settles from jagged to steady
  const calm = on('income') ? lin('income', 100, 40) : 0;
  const pts = Array.from({length: 13}, (_, i) => {
    const jag = [40, -60, 70, -30, 55, -70, 35, -45, 60, -20, 30, -35, 10][i];
    return `${i * 60},${110 + jag * (1 - calm) - calm * 20}`;
  }).join(' ');
  const fill = on('fund') ? lin('fund', 60) : 0;
  return (
    <DemoRoot ins={ins}>
      <DemoHeader ins={ins} color={C.emerald} />
      <Box x={120} y={320} w={820} h={300} color={C.emerald} o={p('income')}>
        <T s={30}>1 · Stabilise your income</T>
        <svg width={760} height={200} style={{position: 'absolute', left: 30, top: 80}}>
          <polyline points={pts} fill="none" stroke={C.emerald} strokeWidth={6} strokeLinejoin="round" />
        </svg>
      </Box>
      {on('budget') && (
        <Box x={1000} y={320} w={800} h={140} color={C.cyan} o={p('budget')}>
          <T s={30}>2 · A manageable monthly budget</T>
          <div style={{display: 'flex', gap: 8, marginTop: 14}}>
            {[['#F59E0B', 3], ['#38BDF8', 4], ['#A78BFA', 2], ['#22C55E', 2]].map(([c, f], i) => <div key={i} style={{flex: f as number, height: 26, borderRadius: 6, background: c as string, opacity: p('budget', i * 5)}} />)}
          </div>
        </Box>
      )}
      {on('fund') && (
        <Box x={1000} y={480} w={800} h={140} color={C.emerald} o={p('fund')}>
          <T s={30}>3 · A small emergency fund</T>
          <div style={{position: 'relative', height: 26, marginTop: 14, borderRadius: 13, background: '#1E293B', overflow: 'hidden'}}>
            <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${fill * 45}%`, background: C.emerald}} />
          </div>
        </Box>
      )}
      {on('nonew') && <div style={{position: 'absolute', left: 120, top: 680, opacity: p('nonew')}}><Pill text="Debt cleared? No need to take new credit immediately" color={C.amber} size={34} /></div>}
      <Caption ins={ins} bottom={44} lines={[
        {k: 'income', text: 'Rebuilding is possible — but there’s no instant reset', te: 'Rebuild చేయొచ్చు — కానీ instant reset ఉండదు'},
        {k: 'budget', text: 'Make your monthly budget manageable', te: 'Monthly budget manageable గా చేసుకోండి'},
        {k: 'fund', text: 'Build a small emergency fund', te: 'చిన్న emergency fund పెట్టుకోండి', color: '#86EFAC'},
        {k: 'nonew', text: 'Don’t rush into new credit', te: 'వెంటనే కొత్త credit తీసుకోవాల్సిన అవసరం లేదు', color: '#FDE68A'},
      ]} />
    </DemoRoot>
  );
};
