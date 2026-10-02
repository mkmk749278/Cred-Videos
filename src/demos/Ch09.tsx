import React from 'react';
import {interpolate} from '../lib/safeInterpolate';
import {C, FONT, MONO, alpha} from '../theme';
import {CLAMP} from '../lib/anim';
import {Arrow, BeatSfx, Caption, DemoHeader, DemoProps, DemoRoot, IllusTag, inr, Paper, Pill, SUPPORT, useBeats} from './kit';

/* ------------------------------------------------------------------ §I overdue calendar: due date → day 3 → day 90 (NPA) */

// piecewise day → x, so the short early window stays readable
const DX: [number, number][] = [[0, 220], [3, 400], [30, 900], [90, 1560], [100, 1700]];
const dx = (d: number) => {
  for (let i = 0; i + 1 < DX.length; i++) {
    const [d0, x0] = DX[i];
    const [d1, x1] = DX[i + 1];
    if (d <= d1) return x0 + ((d - d0) / (d1 - d0)) * (x1 - x0);
  }
  return DX[DX.length - 1][1];
};

const Choice: React.FC<{title: string; result: string; color: string; o: number; hi: number}> = ({title, result, color, o, hi}) => (
  <div style={{width: 500, padding: '20px 24px', borderRadius: 20, background: '#0E1628', border: `3px solid ${hi > 0.5 ? color : 'rgba(148,163,184,0.35)'}`, opacity: o, boxShadow: hi > 0.5 ? `0 0 34px ${alpha(color, 0.45)}` : 'none', boxSizing: 'border-box'}}>
    <div style={{fontFamily: FONT, fontSize: 34, fontWeight: 850, color: '#fff'}}>{title}</div>
    <div style={{fontFamily: FONT, fontSize: 28, color: hi > 0.5 ? color : SUPPORT, marginTop: 6, fontWeight: 700}}>{result}</div>
  </div>
);

export const CalendarDemo: React.FC<DemoProps> = ({ins}) => {
  const {p, on, at, frame, stage} = useBeats(ins);
  const TOP = 590;
  // the overdue cursor sweeps along the calendar as the narration moves on
  const sweep: [string, number][] = [['overdue', 0], ['three', 3], ['followup', 30], ['report', 60], ['npa', 90]];
  const cursorDay = (() => {
    let d = 0;
    for (let i = 0; i < sweep.length; i++) {
      const [k, day] = sweep[i];
      if (frame >= at(k)) {
        const prev = i === 0 ? 0 : sweep[i - 1][1];
        d = interpolate(frame, [at(k), at(k) + 40], [prev, day], CLAMP);
      }
    }
    return d;
  })();
  const st = stage(['due', 'three', 'followup', 'ninety', 'npa', 'meaning']);
  const top = (s: number) => (st === s ? 1 : 0);
  return (
    <DemoRoot ins={ins}>
      <DemoHeader ins={ins} color={C.amber} />
      {/* calendar strip */}
      <div style={{position: 'absolute', left: 160, top: TOP, width: 1600, height: 28, borderRadius: 14, background: '#1E293B', border: '2px solid rgba(148,163,184,0.4)', opacity: p('due')}} />
      {on('overdue') && <div style={{position: 'absolute', left: dx(0), top: TOP + 2, width: Math.max(0, dx(cursorDay) - dx(0)), height: 24, borderRadius: 12, background: `linear-gradient(90deg, ${C.amber}, ${C.crimson})`}} />}
      {on('overdue') && <div style={{position: 'absolute', left: dx(cursorDay) - 3, top: TOP - 18, width: 6, height: 64, background: '#fff', borderRadius: 3, boxShadow: '0 0 16px #fff'}} />}
      {[[0, 'Due date'], [3, 'Day 3'], [30, 'Day 30'], [90, 'Day 90']].map(([d, t]) => (
        <div key={t as string} style={{position: 'absolute', left: dx(d as number) - 90, top: TOP + 44, width: 180, textAlign: 'center', opacity: d === 0 ? p('due') : p('three'), fontFamily: MONO, fontSize: 26, fontWeight: 800, color: d === 90 && on('npa') ? '#FCA5A5' : '#fff'}}>
          <div style={{width: 4, height: 18, background: SUPPORT, margin: '0 auto 6px'}} />{t}
        </div>
      ))}
      {/* 1 · the due date: full, minimum or less */}
      {st === 0 && (
        <div style={{position: 'absolute', left: 160, top: 320, display: 'flex', gap: 50, opacity: top(0)}}>
          <Choice title="Pay the full bill" result="✓ cleared" color={C.emerald} o={p('full')} hi={on('full') && !on('finance') ? 1 : 0} />
          <Choice title="Pay only the minimum" result="finance charges may apply" color={C.amber} o={p('full', 8)} hi={on('finance') && !on('overdue') ? 1 : 0} />
          <Choice title="Less than the minimum" result="→ account becomes overdue" color={C.crimson} o={p('finance', 8)} hi={on('overdue') ? 1 : 0} />
        </div>
      )}
      {/* 2 · RBI: >3 days past due — but counted from the original due date */}
      {st === 1 && (
        <>
          <div style={{position: 'absolute', left: 160, top: 320, width: 820, padding: '22px 26px', borderRadius: 20, background: '#0E1628', border: `3px solid ${C.amber}`, opacity: p('three'), boxSizing: 'border-box'}}>
            <div style={{fontFamily: MONO, fontSize: 24, letterSpacing: 4, color: '#FDE68A', fontWeight: 800}}>RBI RULES</div>
            <div style={{fontFamily: FONT, fontSize: 32, fontWeight: 800, color: '#fff', marginTop: 8, lineHeight: 1.3}}>Past due for more than 3 days → only then late charges or past-due reporting</div>
          </div>
          {on('original') && (
            <div style={{position: 'absolute', left: 1040, top: 320, width: 720, padding: '22px 26px', borderRadius: 20, background: '#0E1628', border: `3px solid ${C.crimson}`, opacity: p('original'), boxSizing: 'border-box'}}>
              <div style={{fontFamily: FONT, fontSize: 32, fontWeight: 850, color: '#fff', lineHeight: 1.3}}>Days past due are counted from the <span style={{color: '#FCA5A5'}}>original due date</span></div>
            </div>
          )}
          <Arrow x1={dx(0)} y1={TOP - 40} x2={dx(3)} y2={TOP - 40} t={on('original') ? Math.min(1, (frame - at('original')) / 20) : 0} color={C.crimson} width={6} />
          {on('notnew') && (
            <div style={{position: 'absolute', left: dx(3) - 150, top: TOP + 130, width: 300, textAlign: 'center', opacity: p('notnew')}}>
              <div style={{display: 'inline-block', padding: '10px 18px', borderRadius: 14, border: `3px dashed ${C.crimson}`, fontFamily: FONT, fontSize: 30, fontWeight: 800, color: '#FCA5A5', textDecoration: 'line-through'}}>new due date</div>
            </div>
          )}
          {on('nodelay') && <div style={{position: 'absolute', left: 620, top: TOP + 140, opacity: p('nodelay')}}><Pill text="✕ Don’t plan the delay around these 3 days" color={C.crimson} size={32} /></div>}
        </>
      )}
      {/* 3 · as the delay continues */}
      {st >= 2 && st <= 3 && (
        <div style={{position: 'absolute', left: 0, top: TOP + 130, width: 1920}}>
          <div style={{position: 'absolute', left: 0, right: 0, textAlign: 'center', display: 'flex', justifyContent: 'center', gap: 30}}>
            {[['followup', '📞 More follow-up'], ['restrict', '🔒 Account restrictions'], ['report', '📄 Credit report affected']].map(([k, t]) => (
              <Pill key={k} text={t} color={C.amber} size={32} style={{opacity: on(k) ? p(k) : 0}} />
            ))}
          </div>
          {st === 2 && <div style={{position: 'absolute', left: 0, right: 0, top: 76, textAlign: 'center', fontFamily: FONT, fontSize: 30, color: SUPPORT, opacity: p('followup', 10)}}>these may happen as the delay continues</div>}
        </div>
      )}
      {/* 4 · "no problem until 90 days" — incorrect */}
      {st === 3 && (
        <>
          <div style={{position: 'absolute', left: 160, top: 320, padding: '20px 30px', borderRadius: '28px 28px 28px 8px', background: '#1E293B', border: '3px solid rgba(148,163,184,0.5)', fontFamily: FONT, fontSize: 40, fontWeight: 850, color: '#fff', opacity: p('ninety')}}>
            “No problem until 90 days.”
          </div>
          {on('incorrect') && <div style={{position: 'absolute', left: 840, top: 316, padding: '12px 24px', borderRadius: 12, border: `5px solid ${C.crimson}`, color: '#FCA5A5', fontFamily: FONT, fontSize: 48, fontWeight: 900, transform: `rotate(-6deg) scale(${1.3 - 0.3 * p('incorrect')})`, opacity: p('incorrect')}}>INCORRECT</div>}
          {on('before') && (
            <div style={{position: 'absolute', left: dx(0), top: TOP - 92, width: dx(90) - dx(0), height: 60, borderTop: `4px solid ${C.crimson}`, borderLeft: `4px solid ${C.crimson}`, borderRight: `4px solid ${C.crimson}`, borderRadius: '14px 14px 0 0', opacity: p('before')}}>
              <div style={{position: 'absolute', left: 0, right: 0, top: -58, textAlign: 'center'}}><Pill text="Even before NPA: overdue reporting · charges · follow-up" color={C.crimson} size={30} /></div>
            </div>
          )}
        </>
      )}
      {/* 5 · day 90: NPA rule */}
      {st === 4 && (
        <div style={{position: 'absolute', left: 160, top: 320, width: 1300, padding: '24px 30px', borderRadius: 22, background: '#2A1416', border: `4px solid ${C.crimson}`, opacity: p('npa'), boxSizing: 'border-box'}}>
          <div style={{fontFamily: MONO, fontSize: 24, letterSpacing: 4, color: '#FCA5A5', fontWeight: 800}}>RBI RULES · NPA</div>
          <div style={{fontFamily: FONT, fontSize: 36, fontWeight: 850, color: '#fff', marginTop: 8, lineHeight: 1.3}}>Minimum amount due not fully paid within 90 days from the payment due date → the card account is treated as an NPA</div>
        </div>
      )}
      {on('npa') && st >= 4 && <div style={{position: 'absolute', left: dx(90) - 70, top: TOP - 64, padding: '8px 18px', borderRadius: 12, background: C.crimson, color: '#fff', fontFamily: FONT, fontSize: 30, fontWeight: 900, opacity: p('npa', 6)}}>NPA</div>}
      {/* 6 · what NPA means — the bank's books */}
      {st === 5 && (
        <div style={{position: 'absolute', left: 160, top: 300, opacity: p('meaning')}}>
          <Paper w={1100} h={210}>
            <div style={{position: 'absolute', left: 30, top: 20, fontFamily: MONO, fontSize: 22, color: '#475569', letterSpacing: 3}}>BANK A · ASSET CLASSIFICATION (illustration)</div>
            <div style={{position: 'absolute', left: 30, top: 70, display: 'flex', alignItems: 'center', gap: 26, fontSize: 36, fontWeight: 900}}>
              <span>Card •••• 4821</span>
              <span style={{color: '#94A3B8', textDecoration: 'line-through'}}>Performing</span>
              <span>→</span>
              <span style={{color: '#B91C1C'}}>Non-performing (NPA)</span>
            </div>
            {on('provision') && <div style={{position: 'absolute', left: 30, top: 140, fontSize: 28, color: '#334155', opacity: p('provision')}}>Bank accounting and provisioning rules apply</div>}
          </Paper>
        </div>
      )}
      <Caption ins={ins} bottom={44} lines={[
        {k: 'due', text: 'Your statement has a due date', te: 'Statement లో due date ఉంటుంది'},
        {k: 'full', text: 'Pay the full amount or the required minimum by then', te: 'ఆ రోజుకి full amount లేదా minimum కట్టాలి'},
        {k: 'finance', text: 'Full bill not paid → finance charges may apply', te: 'Full bill కట్టకపోతే finance charges రావొచ్చు', color: '#FDE68A'},
        {k: 'overdue', text: 'Minimum not fully paid → the account is overdue', te: 'Minimum కూడా పూర్తిగా కట్టకపోతే account overdue', color: '#FCA5A5'},
        {k: 'three', text: 'Late charges or past-due reporting only after 3 days past due', te: '3 రోజులు past due అయిన తర్వాతే late charges / reporting'},
        {k: 'original', text: 'But the count starts from the original due date', te: 'కానీ count original due date నుంచే మొదలవుతుంది', color: '#FCA5A5'},
        {k: 'notnew', text: 'Those 3 days are not a new due date', te: 'ఆ 3 రోజులు కొత్త due date కాదు'},
        {k: 'followup', text: 'As the delay continues, consequences may build', te: 'Delay పెరిగే కొద్దీ follow-up, restrictions, report impact'},
        {k: 'ninety', text: '“No problem until 90 days”?', te: '90 days వరకు ఏ problem లేదా?'},
        {k: 'incorrect', text: 'Incorrect — things can happen well before NPA', te: 'అది తప్పు — NPA కి ముందే reporting, charges ఉండొచ్చు', color: '#FCA5A5'},
        {k: 'npa', text: 'NPA: minimum due not fully paid within 90 days of the due date', te: '90 రోజుల్లో minimum due పూర్తిగా కట్టకపోతే NPA'},
        {k: 'meaning', text: 'NPA is a classification in the bank’s books', te: 'NPA అంటే bank asset classification లో non-performing'},
      ]} />
      <BeatSfx ins={ins} k="incorrect" name="stamp_heavy" volume={0.25} />
      <BeatSfx ins={ins} k="npa" name="haptic_buzz" volume={0.18} />
    </DemoRoot>
  );
};

/* ------------------------------------------------------------------ §I EMI conversion: understand the offer, test affordability */

const OfferRow: React.FC<{label: string; value: string; o: number; hi: boolean}> = ({label, value, o, hi}) => (
  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', marginBottom: 8, borderRadius: 12, background: hi ? alpha(C.amber, 0.2) : 'transparent', border: `2px solid ${hi ? C.amber : 'transparent'}`, opacity: o}}>
    <span style={{fontSize: 32, fontWeight: 800}}>{label}</span>
    <span style={{fontFamily: MONO, fontSize: 28, color: '#475569'}}>{value}</span>
  </div>
);

export const EmiDemo: React.FC<DemoProps> = ({ins}) => {
  const {p, on, stage, at} = useBeats(ins);
  const st = stage(['emi', 'fee', 'total']);
  // whichever example the narration reaches last is the one on screen (the order differs per narration)
  const showA = on('unaffordable') && !(on('useful') && at('useful') > at('unaffordable'));
  const showB = on('useful') && !(on('unaffordable') && at('unaffordable') > at('useful'));
  const AV = 7000;
  const scale = 0.07; // px per rupee
  const bar = (amt: number, color: string, label: string, o: number, y: number) => (
    <div style={{position: 'absolute', left: 1060, top: y, opacity: o}}>
      <div style={{fontFamily: FONT, fontSize: 30, fontWeight: 800, color: '#fff', marginBottom: 8}}>{label}</div>
      <div style={{width: amt * scale, height: 56, borderRadius: 12, background: color, display: 'flex', alignItems: 'center', paddingLeft: 18, fontFamily: MONO, fontSize: 30, fontWeight: 800, color: '#04111C', boxSizing: 'border-box'}}>{inr(amt)}</div>
    </div>
  );
  const limitX = 1060 + AV * scale;
  return (
    <DemoRoot ins={ins}>
      <DemoHeader ins={ins} color={C.amber} />
      <div style={{position: 'absolute', left: 120, top: 310, opacity: p('details'), transform: `translateY(${(1 - p('details')) * 30}px)`}}>
        <Paper w={820} h={540}>
          <div style={{position: 'absolute', left: 30, top: 24, fontSize: 32, fontWeight: 900}}>EMI conversion offer — read first</div>
          <div style={{position: 'absolute', left: 30, top: 70, fontFamily: MONO, fontSize: 22, color: '#475569'}}>BANK A · card •••• 4821 · sample</div>
          <div style={{position: 'absolute', left: 12, right: 12, top: 120}}>
            <OfferRow label="Monthly EMI" value="₹ ?" o={p('emi')} hi={st === 0} />
            <OfferRow label="Interest rate" value="? % — ask" o={p('emi', 6)} hi={st === 0} />
            <OfferRow label="Tenure" value="? months" o={p('emi', 12)} hi={st === 0} />
            <OfferRow label="Processing fee" value="₹ ?" o={p('fee')} hi={st === 1} />
            <OfferRow label="Total repayment" value="EMI × months + fees" o={p('total')} hi={st === 2} />
          </div>
        </Paper>
      </div>
      {/* affordability test against the budget from chapter 1 */}
      {bar(AV, C.cyan, 'Available after essentials (from your budget)', p('afford'), 330)}
      {on('afford') && <div style={{position: 'absolute', left: limitX - 2, top: 380, width: 4, height: 400, background: alpha(C.cyan, 0.8), opacity: p('afford', 10)}} />}
      {showA && (
        <>
          {bar(9500, C.crimson, 'EMI offer A (example)', p('unaffordable'), 480)}
          <div style={{position: 'absolute', left: limitX + 10, top: 586, opacity: p('unaffordable', 20)}}><Pill text="over budget" color={C.crimson} size={26} /></div>
          <div style={{position: 'absolute', left: 1060, top: 660, width: 740, padding: '18px 22px', borderRadius: 18, background: '#2A1416', border: `3px solid ${C.crimson}`, opacity: p('unaffordable', 30), boxSizing: 'border-box'}}>
            <div style={{fontFamily: FONT, fontSize: 30, fontWeight: 800, color: '#fff'}}>↻ The same problem returns next month — in a new form</div>
          </div>
        </>
      )}
      {showB && (
        <>
          {bar(6500, C.emerald, 'EMI offer B (example)', p('useful'), 480)}
          <div style={{position: 'absolute', left: 1060, top: 660, opacity: p('useful', 20)}}><Pill text="✓ fits — an affordable plan may be useful" color={C.emerald} size={30} /></div>
        </>
      )}
      {on('decide') && <div style={{position: 'absolute', left: 1060, top: 760, opacity: p('decide')}}><Pill text="Understand the offer → then decide" color={C.cyan} size={32} /></div>}
      <IllusTag text="Illustration — example amounts" style={{top: 262}} />
      <Caption ins={ins} bottom={44} lines={[
        {k: 'details', text: 'Offered EMI conversion? Look at the details first', te: 'EMI conversion offer వస్తే వెంటనే yes చెప్పకండి'},
        {k: 'emi', text: 'Monthly EMI, interest rate and tenure?', te: 'Monthly EMI, interest rate, tenure ఎంత?'},
        {k: 'fee', text: 'Is there a processing fee?', te: 'Processing fee ఉందా?'},
        {k: 'total', text: 'What is the total repayment?', te: 'మొత్తం ఎంత కట్టాలి?'},
        {k: 'afford', text: 'The key question: can you afford it every month?', te: 'ప్రతి నెలా ఆ EMI నిజంగా afford చేయగలరా?', color: '#FDE68A'},
        {k: 'unaffordable', text: 'An unaffordable EMI brings the problem back', te: 'Afford చేయలేని EMI తో problem మళ్ళీ వస్తుంది', color: '#FCA5A5'},
        {k: 'useful', text: 'An affordable repayment plan may be useful', te: 'Afford చేయగల plan ఉపయోగపడొచ్చు', color: '#86EFAC'},
        {k: 'decide', text: 'Understand the offer before deciding', te: 'Offer అర్థం చేసుకున్న తర్వాతే decide చేయండి'},
      ]} />
    </DemoRoot>
  );
};

/* ------------------------------------------------------------------ §I write-off: the ledger changes, the claim remains */

export const LedgerDemo: React.FC<DemoProps> = ({ins}) => {
  const {p, on, lin, stage} = useBeats(ins);
  const moved = on('accounting') ? lin('accounting', 30, 20) : 0;
  const st = stage(['n180', 'nodiscount', 'options']);
  return (
    <DemoRoot ins={ins}>
      <DemoHeader ins={ins} color={C.amber} />
      {/* the hope */}
      {!on('accounting') && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 420, textAlign: 'center', opacity: p('relief')}}>
          <div style={{display: 'inline-block', padding: '30px 50px', borderRadius: 60, background: '#1E293B', border: '3px solid rgba(148,163,184,0.5)', fontFamily: FONT, fontSize: 52, fontWeight: 850, color: '#fff'}}>“Written off… so my debt is gone?”</div>
        </div>
      )}
      {/* bank's books */}
      {on('accounting') && (
        <div style={{position: 'absolute', left: 120, top: 310, opacity: p('accounting')}}>
          <Paper w={820} h={330}>
            <div style={{position: 'absolute', left: 30, top: 20, fontFamily: MONO, fontSize: 22, color: '#475569', letterSpacing: 3}}>BANK A · INTERNAL BOOKS (illustration)</div>
            <div style={{position: 'absolute', left: 30, top: 70, width: 360, fontSize: 28, fontWeight: 900}}>Active loan book</div>
            <div style={{position: 'absolute', left: 430, top: 70, width: 360, fontSize: 28, fontWeight: 900}}>Technically written off</div>
            <div style={{position: 'absolute', left: 410, top: 64, width: 2, height: 240, background: '#CBD5E1'}} />
            <div style={{position: 'absolute', left: 30 + 400 * moved, top: 130, width: 360, padding: '16px 18px', borderRadius: 12, background: '#E2E8F0', border: '2px solid #94A3B8', fontSize: 28, fontWeight: 800, boxSizing: 'border-box'}}>
              Card •••• 4821<div style={{fontFamily: MONO, fontSize: 24, color: '#475569', marginTop: 4}}>{inr(62400)}</div>
            </div>
            {on('books') && <div style={{position: 'absolute', left: 30, top: 260, fontSize: 26, color: '#334155', opacity: p('books')}}>An accounting action — the treatment in the books may change</div>}
          </Paper>
        </div>
      )}
      {/* the borrower's side */}
      {on('claim') && (
        <div style={{position: 'absolute', left: 1000, top: 310, width: 800, height: 330, padding: '24px 28px', borderRadius: 22, background: '#0E1628', border: `3px solid ${C.crimson}`, boxSizing: 'border-box', opacity: p('claim')}}>
          <div style={{fontFamily: MONO, fontSize: 22, letterSpacing: 3, color: '#FCA5A5', fontWeight: 800}}>YOUR SIDE</div>
          <div style={{fontFamily: FONT, fontSize: 36, fontWeight: 850, color: '#fff', marginTop: 10}}>Claim against you: not automatically waived</div>
          <div style={{fontFamily: MONO, fontSize: 34, color: '#fff', marginTop: 14}}>Still owed: {inr(62400)}</div>
          {on('recovery') && <div style={{marginTop: 18, opacity: p('recovery')}}><Pill text="Recovery may continue" color={C.crimson} size={30} /></div>}
        </div>
      )}
      {/* myths */}
      {st === 0 && (
        <div style={{position: 'absolute', left: 120, top: 690, width: 1680, display: 'flex', alignItems: 'center', gap: 30, opacity: p('n180')}}>
          <div style={{padding: '16px 26px', borderRadius: 16, border: `3px dashed ${C.crimson}`, fontFamily: FONT, fontSize: 34, fontWeight: 800, color: '#FCA5A5', textDecoration: on('timing') ? 'line-through' : 'none'}}>“Every card is written off at 180 days”</div>
          {on('timing') && <Pill text="No universal rule — depends on issuer policy and the account" color={C.cyan} size={30} style={{opacity: p('timing')}} />}
        </div>
      )}
      {st === 1 && (
        <div style={{position: 'absolute', left: 120, top: 690, width: 1680, display: 'flex', alignItems: 'center', gap: 30, opacity: p('nodiscount')}}>
          <div style={{padding: '16px 26px', borderRadius: 16, border: `3px dashed ${C.crimson}`, fontFamily: FONT, fontSize: 34, fontWeight: 800, color: '#FCA5A5', textDecoration: 'line-through'}}>⏳ Wait for write-off → big discount</div>
          <Pill text="Not guaranteed" color={C.crimson} size={30} />
        </div>
      )}
      {st === 2 && (
        <div style={{position: 'absolute', left: 120, top: 690, display: 'flex', gap: 20, opacity: p('options')}}>
          <Pill text="✓ Discuss workable options with the bank now" color={C.emerald} size={34} />
          {on('nowait') && <Pill text="No need to wait for write-off to ask for settlement" color={C.emerald} size={30} style={{opacity: p('nowait')}} />}
        </div>
      )}
      <Caption ins={ins} bottom={44} lines={[
        {k: 'relief', text: 'Many people feel relieved at the word “write-off”', te: 'Write-off అనగానే relief అనిపిస్తుంది'},
        {k: 'accounting', text: 'A technical write-off is generally an accounting action', te: 'Technical write-off సాధారణంగా accounting action'},
        {k: 'claim', text: 'The claim against you is not automatically waived', te: 'మీ మీద claim automatic గా waive అవ్వదు', color: '#FCA5A5'},
        {k: 'n180', text: 'No universal “180 days” rule', te: '180 రోజులకి ప్రతి card write-off అవుతుందనే universal rule లేదు'},
        {k: 'nodiscount', text: 'Waiting doesn’t guarantee a large discount', te: 'Wait చేస్తే పెద్ద discount వస్తుందని guarantee లేదు', color: '#FDE68A'},
        {k: 'options', text: 'Struggling? Discuss workable options right away', te: 'ఇబ్బందిలో ఉంటే వెంటనే bank తో options మాట్లాడండి', color: '#86EFAC'},
      ]} />
      <BeatSfx ins={ins} k="accounting" name="air_whoosh" volume={0.2} />
    </DemoRoot>
  );
};
