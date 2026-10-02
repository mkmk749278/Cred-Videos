import React from 'react';
import {C, FONT, MONO, alpha} from '../theme';
import {BeatSfx, Caption, DemoHeader, DemoProps, DemoRoot, Hi, IllusTag, inr, Paper, Pill, SUPPORT, useBeats} from './kit';

/* ------------------------------------------------------------------ §E statement breakdown */

// illustrative statement: every total reconciles (100000 + 3000 + 1200 + 756 − 2000 = 102956)
const LINES = [
  {k: 'purchase', label: 'Purchase balance', amt: 100000, color: '#38BDF8'},
  {k: 'finance', label: 'Finance charges', amt: 3000, color: '#F59E0B'},
  {k: 'late', label: 'Late payment fee', amt: 1200, color: '#FB923C'},
  {k: 'taxes', label: 'Taxes (GST on charges)', amt: 756, color: '#A78BFA'},
  {k: 'prevpay', label: 'Payments received', amt: -2000, color: '#22C55E'},
];
const TOTAL = LINES.reduce((s, l) => s + l.amt, 0);

export const StatementDemo: React.FC<DemoProps> = ({ins}) => {
  const {p, on} = useBeats(ins);
  const rowY = (i: number) => 150 + i * 62;
  const cur = ['purchase', 'finance', 'late', 'taxes', 'prevpay'].reduce((a, k, i) => (on(k) ? i : a), -1);
  return (
    <DemoRoot ins={ins}>
      <DemoHeader ins={ins} color={C.cyan} />
      <div style={{position: 'absolute', left: 120, top: 330, opacity: p(ins.from)}}>
        <Paper w={860} h={560}>
          <div style={{position: 'absolute', left: 36, top: 28, fontSize: 32, fontWeight: 900}}>BANK A · Card statement</div>
          <div style={{position: 'absolute', left: 36, top: 76, fontFamily: MONO, fontSize: 22, color: '#475569'}}>Card •••• 4821 · card blocked · no new spends</div>
          {LINES.map((l, i) => (
            <div key={l.k} style={{position: 'absolute', left: 36, right: 36, top: rowY(i), display: 'flex', justifyContent: 'space-between', fontSize: 30}}>
              <span>{l.label}</span>
              <b style={{fontFamily: MONO}}>{l.amt < 0 ? '− ' + inr(-l.amt) : inr(l.amt)}</b>
            </div>
          ))}
          <div style={{position: 'absolute', left: 36, right: 36, top: 466, borderTop: '3px solid #1B2433'}} />
          <div style={{position: 'absolute', left: 36, right: 36, top: 482, display: 'flex', justifyContent: 'space-between', fontSize: 36, fontWeight: 900}}>
            <span>Total due</span><span style={{fontFamily: MONO}}>{inr(TOTAL)}</span>
          </div>
          {LINES.map((l, i) => (
            <Hi key={l.k} x={28} y={rowY(i) - 6} w={804} h={48} t={cur === i ? p(l.k) : 0} color={l.color} />
          ))}
          <Hi x={28} y={476} w={804} h={56} t={on('total') ? p('total') : 0} color={C.crimson} />
        </Paper>
      </div>
      {/* breakdown bar: the total expands into its parts */}
      <div style={{position: 'absolute', left: 1080, top: 360, width: 720}}>
        {LINES.map((l, i) => (
          <div key={l.k} style={{display: 'flex', alignItems: 'center', gap: 18, marginBottom: 22, opacity: on(l.k) ? p(l.k, 6) : 0.12}}>
            <div style={{width: 26, height: 26, borderRadius: 6, background: l.color}} />
            <div style={{fontFamily: FONT, fontSize: 34, fontWeight: 800, color: '#fff', flex: 1}}>{l.label}</div>
          </div>
        ))}
        {on('total') && <div style={{marginTop: 20, opacity: p('total')}}><Pill text="Only the total? Fear grows. Read the breakup." color={C.amber} size={30} /></div>}
      </div>
      <IllusTag text="Illustrative statement — check your own" />
      <Caption ins={ins} bottom={56} lines={[
        {k: 'blocked', text: 'Blocking the card stops new spends — not charges on what’s owed', te: 'Card block చేసినా existing balance మీద charges ఆగవు'},
        {k: 'purchase', text: 'Read each line of the statement', te: 'Statement లో ప్రతి line చూడండి'},
        {k: 'prevpay', text: 'How were your previous payments adjusted?', te: 'మీ previous payments ఎలా adjust అయ్యాయి?'},
        {k: 'total', text: 'Look at the breakdown, not only the total', te: 'Breakup చూడకుండా total మాత్రమే చూస్తే భయం పెరుగుతుంది', color: '#FDE68A'},
      ]} />
    </DemoRoot>
  );
};

/* ------------------------------------------------------------------ §E the one-lakh example */

export const InterestDemo: React.FC<DemoProps> = ({ins}) => {
  const {p, on, lin} = useBeats(ins);
  const big: React.CSSProperties = {fontFamily: FONT, fontSize: 88, fontWeight: 900, color: '#fff'};
  const principalLeft = on('small') ? 1 - 0.012 * lin('small', 30) : 1;
  return (
    <DemoRoot ins={ins}>
      <DemoHeader ins={ins} color={C.amber} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 330, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 40}}>
        <div style={{...big, opacity: p('outstanding')}}>₹1,00,000</div>
        <div style={{...big, color: SUPPORT, opacity: p('rate')}}>×</div>
        <div style={{opacity: p('rate'), textAlign: 'center'}}>
          <div style={{...big, color: '#FDE68A'}}>3%</div>
          <div style={{fontFamily: FONT, fontSize: 30, color: SUPPORT, marginTop: -6}}>a month (example)</div>
        </div>
        <div style={{...big, color: SUPPORT, opacity: p('result')}}>≈</div>
        <div style={{...big, color: '#FCA5A5', opacity: p('result')}}>₹3,000</div>
      </div>
      {on('example') && <div style={{position: 'absolute', left: 0, right: 0, top: 500, textAlign: 'center', opacity: p('example')}}><Pill text="Only an example — check your card’s actual rate and calculation" color={C.amber} size={34} /></div>}
      {on('fees') && <div style={{position: 'absolute', left: 0, right: 0, top: 580, textAlign: 'center', opacity: p('fees')}}><Pill text="+ applicable fees and taxes" color={C.amber} size={34} /></div>}
      {/* a small payment barely moves the principal */}
      {on('small') && (
        <div style={{position: 'absolute', left: 200, right: 200, top: 680, opacity: p('small')}}>
          <div style={{fontFamily: FONT, fontSize: 32, color: SUPPORT, marginBottom: 10}}>Principal after a small payment</div>
          <div style={{height: 70, borderRadius: 14, background: '#1E293B', overflow: 'hidden', position: 'relative'}}>
            <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${principalLeft * 100}%`, background: 'linear-gradient(90deg,#0EA5E9,#38BDF8)'}} />
            <div style={{position: 'absolute', right: 0, top: 0, bottom: 0, width: `${(1 - principalLeft) * 100}%`, background: C.emerald}} />
          </div>
          {on('why') && <div style={{marginTop: 18, opacity: p('why')}}><Pill text="“I’m paying — why isn’t it going down?”" color={C.crimson} size={34} /></div>}
        </div>
      )}
      <IllusTag text="Illustration — simplified arithmetic" />
      <Caption ins={ins} bottom={56} lines={[
        {k: 'outstanding', text: 'Suppose the outstanding is one lakh', te: 'Outstanding ఒక లక్ష అనుకుందాం'},
        {k: 'result', text: 'At 3% a month — roughly ₹3,000 interest', te: 'నెలకి 3% అంటే దాదాపు ₹3,000 interest'},
        {k: 'small', text: 'With fees and taxes, a small payment barely reduces the principal', te: 'చిన్న payment చేసినా principal పెద్దగా తగ్గకపోవచ్చు'},
      ]} />
    </DemoRoot>
  );
};

/* ------------------------------------------------------------------ §F minimum due vs full payment */

const Track: React.FC<{y: number; title: string; color: string; children: React.ReactNode; o: number}> = ({y, title, color, children, o}) => (
  <div style={{position: 'absolute', left: 120, right: 120, top: y, height: 230, borderRadius: 26, background: '#0E1628', border: `3px solid ${alpha(color, 0.7)}`, opacity: o}}>
    <div style={{position: 'absolute', left: 30, top: 20, fontFamily: MONO, fontSize: 26, letterSpacing: 4, fontWeight: 800, color}}>{title}</div>
    {children}
  </div>
);

export const MinDueDemo: React.FC<DemoProps> = ({ins}) => {
  const {p, on, lin} = useBeats(ins);
  const months = on('repeated') ? Math.min(3, 1 + Math.floor(lin('repeated', 90) * 3)) : 1;
  const fullClear = on('full') ? lin('full', 24, 10) : 0;
  return (
    <DemoRoot ins={ins}>
      <DemoHeader ins={ins} color={C.amber} />
      <Track y={320} title="MINIMUM PAID ON TIME" color={C.amber} o={p('mindue')}>
        <div style={{position: 'absolute', left: 30, top: 80, width: 980, height: 70, borderRadius: 14, background: alpha(C.cyan, 0.3), border: `2px solid ${C.cyan}`}}>
          <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 50, background: C.emerald, borderRadius: '12px 0 0 12px'}} />
          <div style={{position: 'absolute', left: 70, top: 12, fontFamily: FONT, fontSize: 30, fontWeight: 800, color: '#fff'}}>Remaining balance carries on</div>
        </div>
        {on('finance') && <div style={{position: 'absolute', left: 1040, top: 86, opacity: p('finance')}}><Pill text="+ finance charges" color={C.amber} size={30} /></div>}
        {on('interestfree') && <div style={{position: 'absolute', left: 30, top: 168, opacity: p('interestfree')}}><Pill text="Interest-free period may be affected (card terms)" color={C.amber} size={28} /></div>}
        {on('ontime') && <div style={{position: 'absolute', left: 820, top: 168, opacity: p('ontime')}}><Pill text="✓ helps avoid “overdue”" color={C.emerald} size={28} /></div>}
        {on('repeated') && <div style={{position: 'absolute', right: 30, top: 168, opacity: p('repeated')}}><Pill text={`Month ${months}: still carrying it`} color={C.crimson} size={28} /></div>}
      </Track>
      <Track y={590} title="FULL STATEMENT PAID" color={C.emerald} o={p('full')}>
        <div style={{position: 'absolute', left: 30, top: 80, width: 980 * (1 - fullClear), height: 70, borderRadius: 14, background: alpha(C.cyan, 0.3), border: `2px solid ${C.cyan}`}} />
        <div style={{position: 'absolute', left: 50, top: 92, fontFamily: FONT, fontSize: 32, fontWeight: 900, color: '#86EFAC', opacity: fullClear}}>Statement balance cleared</div>
        {on('option') && <div style={{position: 'absolute', left: 30, top: 168, opacity: p('option')}}><Pill text="Can’t afford full? Ask the bank for a workable repayment option" color={C.cyan} size={28} /></div>}
      </Track>
      <Caption ins={ins} bottom={56} lines={[
        {k: 'mindue', text: 'Minimum due ≠ the full bill cleared', te: 'Minimum due అంటే full bill clear అయినట్టు కాదు'},
        {k: 'notuseless', text: 'But the minimum isn’t useless — paying it on time helps', te: 'కానీ minimum due పూర్తిగా useless కాదు'},
        {k: 'repeated', text: 'Only the minimum, month after month, keeps the debt going', te: 'ప్రతి నెలా minimum మాత్రమే అంటే debt చాలా కాలం కొనసాగుతుంది', color: '#FCA5A5'},
        {k: 'full', text: 'If you can afford it, paying in full is better', te: 'Afford చేయగలిగితే full గా కట్టడం better', color: '#86EFAC'},
      ]} />
    </DemoRoot>
  );
};

/* ------------------------------------------------------------------ §F disputed-charge workflow */

export const DisputeDemo: React.FC<DemoProps> = ({ins}) => {
  const {p, on} = useBeats(ins);
  const step = (k: string, x: number, title: string, sub: string, color: string) => (
    <div style={{position: 'absolute', left: x, top: 600, width: 380, opacity: on(k) ? p(k) : 0.15, transform: `translateY(${on(k) ? (1 - p(k)) * 30 : 0}px)`}}>
      <div style={{height: 200, borderRadius: 22, background: '#0E1628', border: `3px solid ${color}`, padding: 24, boxSizing: 'border-box'}}>
        <div style={{fontFamily: FONT, fontSize: 38, fontWeight: 900, color: '#fff'}}>{title}</div>
        <div style={{fontFamily: FONT, fontSize: 28, color: SUPPORT, marginTop: 8}}>{sub}</div>
      </div>
    </div>
  );
  return (
    <DemoRoot ins={ins}>
      <DemoHeader ins={ins} color={C.amber} />
      {/* questioned line */}
      <div style={{position: 'absolute', left: 120, top: 330, opacity: p('incorrect')}}>
        <Paper w={1000} h={170}>
          <div style={{position: 'absolute', left: 36, top: 30, fontFamily: MONO, fontSize: 22, color: '#475569'}}>Card •••• 4821 · statement line</div>
          <div style={{position: 'absolute', left: 36, right: 36, top: 80, display: 'flex', justifyContent: 'space-between', fontSize: 36}}>
            <span>Over-limit fee</span><b style={{fontFamily: MONO}}>₹600</b>
          </div>
          <Hi x={28} y={72} w={944} h={60} t={on('incorrect') ? p('incorrect', 8) : 0} color={C.crimson} />
        </Paper>
      </div>
      {on('notassume') && <div style={{position: 'absolute', left: 120, top: 515, opacity: p('notassume')}}><Pill text="✕ “The bank charged it, so it must be right”" color={C.crimson} size={28} /></div>}
      {step('breakdown', 120, 'Ask in writing', 'for a written breakdown', C.cyan)}
      {step('dispute', 560, 'Raise a dispute', 'Reference DSP-55120 (example)', C.cyan)}
      {step('review', 1000, 'Under review', 'not automatically waived', C.amber)}
      {on('waive') && (
        <div style={{position: 'absolute', left: 1440, top: 600, width: 360, opacity: p('waive')}}>
          <div style={{height: 200, borderRadius: 22, background: '#0E1628', border: `3px dashed ${C.emerald}`, padding: 24, boxSizing: 'border-box'}}>
            <div style={{fontFamily: FONT, fontSize: 34, fontWeight: 900, color: '#fff'}}>Waiver?</div>
            <div style={{fontFamily: FONT, fontSize: 28, color: SUPPORT, marginTop: 8}}>possible — only if the bank approves</div>
          </div>
        </div>
      )}
      {on('depends') && (
        <div style={{position: 'absolute', left: 120, top: 830, display: 'flex', gap: 14, opacity: p('depends')}}>
          <span style={{fontFamily: FONT, fontSize: 32, fontWeight: 800, color: '#fff', alignSelf: 'center'}}>Depends on:</span>
          <Pill text="hardship" color={C.cyan} size={28} />
          <Pill text="account situation" color={C.cyan} size={28} />
          <Pill text="bank policy" color={C.cyan} size={28} />
          <Pill text="approval" color={C.cyan} size={28} />
        </div>
      )}
      <Caption ins={ins} bottom={56} lines={[
        {k: 'incorrect', text: 'See a charge that looks wrong? Don’t just accept it', te: 'Bank వేసింది కాబట్టి correct అనుకోవద్దు'},
        {k: 'breakdown', text: 'Ask for a written breakdown and raise a dispute', te: 'Written breakdown అడిగి dispute raise చేయండి'},
        {k: 'some', text: 'In some cases the bank may waive part — not an automatic right', te: 'కొన్ని cases లో waive చేయొచ్చు — automatic right కాదు', color: '#FDE68A'},
        {k: 'rbi', text: 'An RBI rule doesn’t guarantee you a discount', te: 'RBI rule ఉంది కాబట్టి discount ఇవ్వాల్సిందే అనుకోవద్దు', color: '#FCA5A5'},
      ]} />
      <BeatSfx ins={ins} k="dispute" name="stamp_heavy" volume={0.2} />
    </DemoRoot>
  );
};
