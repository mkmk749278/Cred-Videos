import React from 'react';
import {C, FONT, MONO, alpha} from '../theme';
import {BeatSfx, Caption, DemoHeader, DemoProps, DemoRoot, IllusTag, inr, Paper, PhoneBody, Pill, SUPPORT, useBeats} from './kit';

const Card: React.FC<{x: number; y: number; w: number; h?: number; color: string; o: number; children: React.ReactNode; bg?: string}> = ({x, y, w, h, color, o, children, bg = '#0E1628'}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, padding: '22px 26px', borderRadius: 20, background: bg, border: `3px solid ${color}`, boxSizing: 'border-box', opacity: o, boxShadow: '0 30px 60px rgba(0,0,0,0.45)'}}>{children}</div>
);
const T: React.FC<{s?: number; c?: string; w?: number; children: React.ReactNode; mt?: number}> = ({s = 32, c = '#fff', w = 800, children, mt = 0}) => (
  <div style={{fontFamily: FONT, fontSize: s, fontWeight: w, color: c, marginTop: mt, lineHeight: 1.3}}>{children}</div>
);
const Bubble: React.FC<{x: number; y: number; text: string; o: number; color?: string; size?: number; w?: number}> = ({x, y, text, o, color = 'rgba(148,163,184,0.6)', size = 36, w}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, padding: '18px 28px', borderRadius: '28px 28px 28px 8px', background: '#1E293B', border: `3px solid ${color}`, fontFamily: FONT, fontSize: size, fontWeight: 800, color: '#fff', opacity: o, boxSizing: 'border-box'}}>{text}</div>
);

/* ------------------------------------------------------------------ §J every account is different — decide on the written offer */

const FACTORS = [
  {k: 'age', label: 'Account age', a: 'older account', b: 'newer account'},
  {k: 'breakdown', label: 'Balance breakdown', a: 'mostly charges', b: 'mostly principal'},
  {k: 'situation', label: 'Financial situation', a: 'different income', b: 'your income'},
  {k: 'policy', label: 'Approval policy', a: 'another bank', b: 'your bank'},
];

export const OffersDemo: React.FC<DemoProps> = ({ins}) => {
  const {p, on, stage} = useBeats(ins);
  const st = stage(['friend', 'age', 'online', 'written', 'friendly']);
  return (
    <DemoRoot ins={ins}>
      <DemoHeader ins={ins} color={C.amber} />
      {st === 0 && (
        <>
          <Bubble x={160} y={360} text="“My friend settled at 25% — so will I.”" o={p('friend')} size={44} />
          <div style={{position: 'absolute', left: 160, top: 520, opacity: p('friend', 30)}}><Pill text="✕ Don’t get fixed on someone else’s number" color={C.crimson} size={34} /></div>
        </>
      )}
      {st === 1 && (
        <div style={{position: 'absolute', left: 160, top: 320, width: 1600, opacity: p('age')}}>
          <div style={{display: 'flex', fontFamily: MONO, fontSize: 26, letterSpacing: 3, color: SUPPORT, fontWeight: 800, paddingBottom: 12}}>
            <div style={{width: 520}} /><div style={{width: 500}}>FRIEND’S ACCOUNT</div><div style={{width: 500}}>YOUR ACCOUNT</div>
          </div>
          {FACTORS.map((f, i) => (
            <div key={f.k} style={{display: 'flex', alignItems: 'center', height: 92, borderTop: '2px solid rgba(148,163,184,0.25)', opacity: on(f.k) ? p(f.k) : 0.12}}>
              <div style={{width: 520, fontFamily: FONT, fontSize: 38, fontWeight: 850, color: '#fff'}}>{f.label}</div>
              <div style={{width: 500, fontFamily: FONT, fontSize: 32, color: SUPPORT}}>{f.a}</div>
              <div style={{width: 400, fontFamily: FONT, fontSize: 32, color: '#fff'}}>{f.b}</div>
              <div style={{fontFamily: FONT, fontSize: 44, fontWeight: 900, color: C.amber}}>≠</div>
            </div>
          ))}
        </div>
      )}
      {st === 2 && (
        <>
          <PhoneBody x={200} y={300} w={440} h={600}>
            <div style={{position: 'absolute', top: 70, left: 24, right: 24, fontSize: 26, color: SUPPORT}}>forum.example · post</div>
            <div style={{position: 'absolute', top: 120, left: 24, right: 24, padding: 20, borderRadius: 18, background: '#1E293B', fontSize: 32, fontWeight: 800}}>“Settled at 25%!! Everyone can do it”</div>
          </PhoneBody>
          <div style={{position: 'absolute', left: 740, top: 420, padding: '16px 30px', borderRadius: 14, border: `5px solid ${C.crimson}`, color: '#FCA5A5', fontFamily: FONT, fontSize: 52, fontWeight: 900, transform: `rotate(-4deg) scale(${1.25 - 0.25 * p('online', 8)})`, opacity: p('online', 8)}}>NOT A PROMISE FOR YOUR CASE</div>
        </>
      )}
      {st === 3 && (
        <>
          <div style={{position: 'absolute', left: 120, top: 310, opacity: p('written')}}>
            <Paper w={800} h={300}>
              <div style={{position: 'absolute', left: 28, top: 20, fontSize: 30, fontWeight: 900}}>BANK A · written proposal 1</div>
              <div style={{position: 'absolute', left: 28, top: 64, fontFamily: MONO, fontSize: 22, color: '#475569'}}>verified via official channel · card •••• 4821</div>
              <div style={{position: 'absolute', left: 28, top: 120, fontSize: 34, fontWeight: 900}}>{inr(45000)} lump sum</div>
              <div style={{position: 'absolute', left: 28, top: 172, fontSize: 28}}>pay in one go by 15 Dec 2026</div>
            </Paper>
          </div>
          <div style={{position: 'absolute', left: 1000, top: 310, opacity: p('written', 12)}}>
            <Paper w={800} h={300}>
              <div style={{position: 'absolute', left: 28, top: 20, fontSize: 30, fontWeight: 900}}>BANK A · written proposal 2</div>
              <div style={{position: 'absolute', left: 28, top: 64, fontFamily: MONO, fontSize: 22, color: '#475569'}}>verified via official channel · card •••• 4821</div>
              <div style={{position: 'absolute', left: 28, top: 120, fontSize: 34, fontWeight: 900}}>{inr(6500)} a month × 8</div>
              <div style={{position: 'absolute', left: 28, top: 172, fontSize: 28}}>total {inr(52000)} · instalment dates in writing</div>
            </Paper>
          </div>
          {on('afford') && (
            <>
              <div style={{position: 'absolute', left: 120, top: 650, opacity: p('afford')}}><Pill text="✕ no ₹45,000 available right now" color={C.crimson} size={32} /></div>
              <div style={{position: 'absolute', left: 1000, top: 650, opacity: p('afford', 10)}}><Pill text="✓ fits the ₹7,000 a month you can afford" color={C.emerald} size={32} /></div>
              <div style={{position: 'absolute', left: 0, right: 0, top: 740, textAlign: 'center', fontFamily: FONT, fontSize: 32, color: SUPPORT, opacity: p('afford', 30)}}>Discuss with the bank on that basis</div>
            </>
          )}
          <IllusTag text="Illustration — fictional proposals" style={{top: 262}} />
        </>
      )}
      {st === 4 && (
        <>
          <Card x={160} y={330} w={760} color={C.emerald} o={p('friendly')}>
            <T s={44}>😊 Friendly caller</T>
            <T s={32} c="#FCA5A5" mt={10}>≠ the offer is genuine</T>
          </Card>
          {on('rude') && (
            <Card x={1000} y={330} w={760} color={C.crimson} o={p('rude')}>
              <T s={44}>😠 Rude caller</T>
              <T s={32} c="#FDE68A" mt={10}>≠ a reason to ignore the account details</T>
            </Card>
          )}
          {on('verify') && <div style={{position: 'absolute', left: 0, right: 0, top: 600, textAlign: 'center', opacity: p('verify')}}><Pill text="Verify the process — decide on facts, not tone" color={C.cyan} size={40} /></div>}
        </>
      )}
      <Caption ins={ins} bottom={44} lines={[
        {k: 'friend', text: 'A friend’s settlement is not your settlement', te: 'Friend కి వచ్చిన offer మీకు వస్తుందని కాదు'},
        {k: 'age', text: 'Every account is different', te: 'ప్రతి account వేరు — age, breakdown, situation, policy'},
        {k: 'online', text: 'An online percentage is not a promise', te: 'Online లో చూసిన percentage promise కాదు', color: '#FCA5A5'},
        {k: 'written', text: 'Look at your bank’s verified written offer', te: 'మీ bank verified written offer చూడండి'},
        {k: 'afford', text: 'Consider what you can afford', te: 'మీరు ఎంత afford చేయగలరో చూసి మాట్లాడండి', color: '#86EFAC'},
        {k: 'friendly', text: 'A caller’s tone proves nothing', te: 'Caller tone మీద decision తీసుకోకండి'},
        {k: 'verify', text: 'Verify the process', te: 'Process verify చేయండి', color: '#7DD3FC'},
      ]} />
      <BeatSfx ins={ins} k="online" name="stamp_heavy" volume={0.22} />
    </DemoRoot>
  );
};

/* ------------------------------------------------------------------ §K settlement proposal: affordable amount, realistic deadline, verify before paying */

export const OfferAffDemo: React.FC<DemoProps> = ({ins}) => {
  const {p, on, stage} = useBeats(ins);
  const st = stage(['start', 'example']);
  return (
    <DemoRoot ins={ins}>
      <DemoHeader ins={ins} color={C.amber} />
      {st === 0 && (
        <>
          <Card x={120} y={320} w={860} color={C.emerald} o={p('start')} bg="#0F2A1D">
            <T s={26} c="#86EFAC" w={800}>YOUR PROPOSAL — BASED ON INCOME AND FUNDS</T>
            <T s={36} mt={10}>“This is the amount I can arrange at present. I can’t commit to more. Please consider a full and final settlement.”</T>
          </Card>
          {on('borrow') && (
            <div style={{position: 'absolute', left: 1040, top: 320, width: 760, opacity: p('borrow')}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
                <Pill text="High-interest loan" color={C.crimson} size={32} />
                <span style={{fontFamily: FONT, fontSize: 44, color: '#FCA5A5'}}>→</span>
                <Pill text="settlement" color={C.amber} size={32} />
              </div>
              <T s={30} c="#FCA5A5" mt={16}>one problem moves into another</T>
              <div style={{position: 'absolute', left: -10, top: 22, width: 640, height: 6, background: C.crimson, transform: 'rotate(-3deg)', opacity: p('borrow', 25)}} />
            </div>
          )}
          {on('affordable') && <div style={{position: 'absolute', left: 1040, top: 520, opacity: p('affordable')}}><Pill text="✓ Amount: affordable" color={C.emerald} size={36} /></div>}
          {on('deadline') && <div style={{position: 'absolute', left: 1040, top: 600, opacity: p('deadline')}}><Pill text="✓ Deadline: realistic" color={C.emerald} size={36} /></div>}
        </>
      )}
      {st === 1 && (
        <>
          <Card x={120} y={330} w={640} color="rgba(148,163,184,0.5)" o={p('example')}>
            <T s={26} c={SUPPORT}>EXAMPLE</T>
            {on('outstanding') && <T s={40} mt={8}>Outstanding <span style={{fontFamily: MONO}}>{inr(100000)}</span></T>}
          </Card>
          {on('caller') && (
            <PhoneBody x={860} y={300} w={420} h={560}>
              <div style={{position: 'absolute', top: 70, left: 0, right: 0, textAlign: 'center', fontSize: 24, color: SUPPORT}}>incoming call · unknown</div>
              <div style={{position: 'absolute', top: 130, left: 22, right: 22, padding: 20, borderRadius: 18, background: '#1E293B', fontSize: 32, fontWeight: 800, opacity: p('caller', 8)}}>“Pay {inr(30000)} and we will close it.”</div>
              {on('notimmediately') && (
                <div style={{position: 'absolute', bottom: 40, left: 40, right: 40, padding: '18px 0', borderRadius: 18, background: '#334155', textAlign: 'center', fontSize: 30, fontWeight: 800, color: '#94A3B8', textDecoration: 'line-through'}}>Pay now</div>
              )}
            </PhoneBody>
          )}
          {on('relief') && <div style={{position: 'absolute', left: 1360, top: 360, opacity: p('relief')}}><Bubble x={0} y={0} text="Sounds like relief…" o={1} size={36} w={420} /></div>}
          {on('notimmediately') && (
            <Card x={1360} y={500} w={440} color={C.amber} o={p('notimmediately')}>
              <T s={36}>✋ Not yet</T>
              <T s={28} c="#FDE68A" mt={8}>Ask for the official letter. Verify with customer care.</T>
            </Card>
          )}
          <IllusTag text="Example — not a real offer" style={{top: 262}} />
        </>
      )}
      <Caption ins={ins} bottom={44} lines={[
        {k: 'start', text: 'Propose what you can really arrange', te: 'మీరు నిజంగా arrange చేయగల amount ని propose చేయండి'},
        {k: 'borrow', text: 'Borrowing at very high interest to settle is risky', te: 'Settlement కోసం high interest లో అప్పు తీసుకోవడం risk', color: '#FCA5A5'},
        {k: 'affordable', text: 'The amount must be affordable, the deadline realistic', te: 'Amount afford చేయగలిగేది, deadline realistic గా ఉండాలి', color: '#86EFAC'},
        {k: 'example', text: 'Here is an example', te: 'ఒక example చూద్దాం'},
        {k: 'caller', text: 'A caller offers to close it for ₹30,000', te: '₹30,000 కడితే close చేస్తామని caller చెప్తారు'},
        {k: 'notimmediately', text: 'Don’t pay right away out of excitement', te: 'Excitement లో వెంటనే pay చేయకండి', color: '#FDE68A'},
      ]} />
    </DemoRoot>
  );
};

/* ------------------------------------------------------------------ §N after paying: receipts, instalments, written closure */

const ROWS = [
  {d: '30 Nov 2026', a: 10000},
  {d: '30 Dec 2026', a: 10000},
  {d: '30 Jan 2027', a: 10000},
];

export const ReceiptsDemo: React.FC<DemoProps> = ({ins}) => {
  const {p, on, stage} = useBeats(ins);
  const st = stage(['receipt', 'confirm', 'court']);
  return (
    <DemoRoot ins={ins}>
      <DemoHeader ins={ins} color={C.emerald} />
      {st === 0 && (
        <>
          <div style={{position: 'absolute', left: 120, top: 320, opacity: p('receipt'), transform: `rotate(-2deg) translateY(${(1 - p('receipt')) * 40}px)`}}>
            <Paper w={620} h={420}>
              <div style={{position: 'absolute', left: 28, top: 22, fontSize: 32, fontWeight: 900}}>Payment receipt</div>
              <div style={{position: 'absolute', left: 28, top: 74, fontFamily: MONO, fontSize: 24, color: '#475569', lineHeight: 1.7}}>
                BANK A official app<br />Ref PAY-20261130-0042<br />Card •••• 4821<br />Amount {inr(10000)}<br />30 Nov 2026 · Instalment 1 of 3
              </div>
              <div style={{position: 'absolute', left: 28, bottom: 24, padding: '6px 14px', borderRadius: 8, background: '#DCFCE7', color: '#166534', fontSize: 24, fontWeight: 800}}>✓ saved</div>
            </Paper>
          </div>
          {on('instal') && (
            <div style={{position: 'absolute', left: 860, top: 330, width: 940, opacity: p('instal')}}>
              <T s={34} w={850}>Instalment schedule (from the letter)</T>
              {ROWS.map((r, i) => {
                const missing = i === 2 && on('miss');
                return (
                  <div key={r.d} style={{display: 'flex', alignItems: 'center', gap: 24, marginTop: 16, padding: '16px 22px', borderRadius: 16, background: '#0E1628', border: `3px solid ${missing ? C.amber : i === 0 ? C.emerald : 'rgba(148,163,184,0.35)'}`}}>
                    <span style={{fontFamily: MONO, fontSize: 30, color: '#fff', width: 260}}>{r.d}</span>
                    <span style={{fontFamily: MONO, fontSize: 30, color: '#fff', flex: 1}}>{inr(r.a)}</span>
                    <span style={{fontFamily: FONT, fontSize: 28, fontWeight: 800, color: i === 0 ? '#86EFAC' : missing ? '#FDE68A' : SUPPORT}}>{i === 0 ? '✓ paid' : missing ? 'if missed?' : 'upcoming'}</span>
                  </div>
                );
              })}
              {on('miss') && <div style={{marginTop: 20, opacity: p('miss')}}><Pill text="Know beforehand how a missed instalment affects the offer" color={C.amber} size={28} /></div>}
            </div>
          )}
        </>
      )}
      {st === 1 && (
        <>
          <div style={{position: 'absolute', left: 160, top: 320, opacity: p('confirm')}}>
            <Paper w={720} h={320}>
              <div style={{position: 'absolute', left: 28, top: 22, fontSize: 32, fontWeight: 900}}>Written confirmation</div>
              <div style={{position: 'absolute', left: 28, top: 80, fontSize: 28, lineHeight: 1.5}}>Settlement amount received in full as agreed. Card •••• 4821.</div>
              <div style={{position: 'absolute', left: 28, bottom: 24, fontFamily: MONO, fontSize: 22, color: '#475569'}}>BANK A · official email / letter</div>
            </Paper>
          </div>
          <div style={{position: 'absolute', left: 960, top: 340, opacity: p('confirm', 15)}}>
            <Paper w={760} h={320} style={{border: `4px double ${C.emerald}`}}>
              <div style={{position: 'absolute', left: 28, top: 22, fontSize: 32, fontWeight: 900}}>No Dues / settlement completion certificate</div>
              <div style={{position: 'absolute', left: 28, top: 130, fontSize: 28}}>whichever applies to your account</div>
              <div style={{position: 'absolute', left: 28, bottom: 24, fontFamily: MONO, fontSize: 22, color: '#475569'}}>keep with your records</div>
            </Paper>
          </div>
          <div style={{position: 'absolute', left: 160, top: 700, opacity: p('confirm', 30)}}><Pill text="Credit report status — check it separately later" color={C.cyan} size={28} /></div>
        </>
      )}
      {st === 2 && (
        <>
          <Card x={160} y={330} w={800} color={C.amber} o={p('court')}>
            <T s={26} c="#FDE68A">COURT RECOVERY CASE ALREADY PENDING?</T>
            <T s={36} mt={10}>Confirm how those proceedings will be closed after the settlement</T>
          </Card>
          {on('phone') && (
            <>
              <Bubble x={1040} y={340} text="📞 “We will handle everything.”" o={p('phone')} size={36} />
              <div style={{position: 'absolute', left: 1040, top: 470, opacity: p('phone', 15)}}><Pill text="✕ A phone assurance is not enough" color={C.crimson} size={32} /></div>
            </>
          )}
        </>
      )}
      <IllusTag text="Sample documents — fictional" style={{top: 262}} />
      <Caption ins={ins} bottom={44} lines={[
        {k: 'receipt', text: 'Save every payment receipt', te: 'ప్రతి payment receipt save చేయండి'},
        {k: 'instal', text: 'Instalments? Follow each due date carefully', te: 'Instalments ఉంటే due dates జాగ్రత్తగా follow చేయండి'},
        {k: 'miss', text: 'Ask beforehand: what if one is missed?', te: 'ఒక instalment miss అయితే ఏమవుతుందో ముందే తెలుసుకోండి', color: '#FDE68A'},
        {k: 'confirm', text: 'After paying: written confirmation and the certificate', te: 'Payment తర్వాత written confirmation, No Dues / completion certificate', color: '#86EFAC'},
        {k: 'court', text: 'Case pending? Confirm how it will be closed', te: 'Court case ఉంటే అది ఎలా close అవుతుందో confirm చేయండి'},
        {k: 'phone', text: 'Get it in writing — not just on the phone', te: 'Phone లో చెప్పింది సరిపోదు — written గా తీసుకోండి', color: '#FCA5A5'},
      ]} />
    </DemoRoot>
  );
};

/* ------------------------------------------------------------------ §O Lok Adalat: a consent-based settlement table */

const Seat: React.FC<{x: number; label: string; color: string; o: number}> = ({x, label, color, o}) => (
  <div style={{position: 'absolute', left: x, top: 470, width: 260, textAlign: 'center', opacity: o}}>
    <div style={{width: 90, height: 90, borderRadius: 45, background: color, margin: '0 auto'}} />
    <div style={{width: 170, height: 120, borderRadius: '70px 70px 20px 20px', background: color, margin: '10px auto 0'}} />
    <div style={{fontFamily: FONT, fontSize: 32, fontWeight: 850, color: '#fff', marginTop: 12}}>{label}</div>
  </div>
);

export const LokAdalatDemo: React.FC<DemoProps> = ({ins}) => {
  const {p, on, stage} = useBeats(ins);
  const st = stage(['nervous', 'explain', 'award']);
  return (
    <DemoRoot ins={ins}>
      <DemoHeader ins={ins} color={C.cyan} />
      {st <= 1 && (
        <>
          <Seat x={140} label="You" color="#38BDF8" o={p('nervous')} />
          <Seat x={560} label="Lok Adalat" color="#A78BFA" o={p('opportunity')} />
          <Seat x={980} label="Bank A" color="#94A3B8" o={p('opportunity', 8)} />
          <div style={{position: 'absolute', left: 140, top: 760, width: 1100, height: 20, borderRadius: 10, background: '#334155', opacity: p('opportunity')}} />
        </>
      )}
      {st === 0 && (
        <>
          {!on('opportunity') && (
            <>
              <Bubble x={120} y={320} text="“Do I have to go to court?”" o={p('nervous')} size={34} />
              <Bubble x={640} y={320} text="“What will they ask me?”" o={p('nervous', 20)} size={34} />
            </>
          )}
          {on('opportunity') && <div style={{position: 'absolute', left: 140, top: 330, opacity: p('opportunity')}}><Pill text="🤝 a chance to reach a mutually agreed settlement" color={C.cyan} size={34} /></div>}
          {on('eligible') && (
            <div style={{position: 'absolute', left: 1320, top: 360, width: 480, display: 'flex', flexDirection: 'column', gap: 16, opacity: p('eligible')}}>
              <T s={30} c={SUPPORT}>may also come here:</T>
              <Pill text="Eligible pending cases" color={C.cyan} size={32} />
              <Pill text="Pre-litigation disputes" color={C.cyan} size={32} />
            </div>
          )}
        </>
      )}
      {st === 1 && (
        <>
          <div style={{position: 'absolute', left: 1320, top: 320, opacity: p('explain')}}>
            <Paper w={480} h={300}>
              <div style={{position: 'absolute', left: 24, top: 20, fontSize: 30, fontWeight: 900}}>Proposal (sample)</div>
              <div style={{position: 'absolute', left: 24, top: 76, fontSize: 28, lineHeight: 1.6}}>Amount<br />Payment dates<br />Consequences</div>
              {on('afford') && <div style={{position: 'absolute', right: 24, top: 80, padding: '6px 12px', borderRadius: 10, background: '#FEF3C7', color: '#92400E', fontSize: 24, fontWeight: 800, opacity: p('afford')}}>affordable?</div>}
            </Paper>
          </div>
          {on('notaccept') && (
            <div style={{position: 'absolute', left: 1320, top: 660, display: 'flex', gap: 16, opacity: p('notaccept')}}>
              <Pill text="Accept" color={C.emerald} size={32} />
              <Pill text="Don’t accept" color={C.amber} size={32} />
            </div>
          )}
          {on('consent') && <div style={{position: 'absolute', left: 140, top: 330, opacity: p('consent')}}><Pill text="Your consent matters" color={C.emerald} size={36} /></div>}
        </>
      )}
      {st === 2 && (
        <>
          <div style={{position: 'absolute', left: 160, top: 310, opacity: p('award')}}>
            <Paper w={760} h={420}>
              <div style={{position: 'absolute', left: 28, top: 22, fontSize: 32, fontWeight: 900}}>Lok Adalat award (sample)</div>
              <div style={{position: 'absolute', left: 28, top: 80, fontSize: 28, lineHeight: 1.6}}>Based on the agreed settlement:<br />amount · dates · consequences</div>
              <div style={{position: 'absolute', left: 300, top: 220, padding: '12px 22px', border: '5px solid #7C3AED', color: '#6D28D9', borderRadius: 12, fontSize: 34, fontWeight: 900, transform: `rotate(-5deg) scale(${1.3 - 0.3 * p('award', 12)})`, opacity: p('award', 12)}}>FINAL &amp; BINDING</div>
            </Paper>
          </div>
          <Card x={1000} y={330} w={800} color="#A78BFA" o={p('award', 20)}>
            <T s={34}>Like a civil court decree</T>
            {on('appeal') && <T s={34} c="#FCA5A5" mt={14}>No ordinary appeal</T>}
          </Card>
          {on('appeal') && <div style={{position: 'absolute', left: 1000, top: 560, opacity: p('appeal', 15)}}><Pill text="Understand amount, dates, consequences before signing" color={C.amber} size={28} /></div>}
        </>
      )}
      <Caption ins={ins} bottom={44} lines={[
        {k: 'nervous', text: 'Lok Adalat — the name makes some people nervous', te: 'Lok Adalat పేరు వినగానే కొంతమందికి భయం'},
        {k: 'opportunity', text: 'It is a chance to reach a mutually agreed settlement', te: 'ఇద్దరూ ఒప్పుకునే settlement కి ఒక అవకాశం'},
        {k: 'explain', text: 'They explain the proposal — understand the terms', te: 'Proposal explain చేస్తారు — terms అర్థం చేసుకోండి'},
        {k: 'notaccept', text: 'You don’t have to accept any offer you receive', te: 'వచ్చిన ఏ offer అయినా accept చేయాల్సిన అవసరం లేదు', color: '#86EFAC'},
        {k: 'award', text: 'An agreed award is final and binding', te: 'Agreed award final, binding', color: '#C4B5FD'},
        {k: 'appeal', text: 'No ordinary appeal — be sure before you sign', te: 'Ordinary appeal ఉండదు — sign చేసే ముందు అర్థం చేసుకోండి', color: '#FDE68A'},
      ]} />
      <BeatSfx ins={ins} k="award" name="stamp_heavy" volume={0.22} />
    </DemoRoot>
  );
};
