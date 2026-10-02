import React from 'react';
import {interpolate} from '../lib/safeInterpolate';
import {C, FONT, MONO, alpha} from '../theme';
import {CLAMP} from '../lib/anim';
import {Arrow, BeatSfx, Caption, DemoHeader, DemoProps, DemoRoot, IllusTag, inr, Pill, SUPPORT, useBeats} from './kit';

/* ------------------------------------------------------------------ §B card rotation loop */

const CardObj: React.FC<{x: number; y: number; label: string; sub: string; color: string; glow: number; o?: number}> = ({x, y, label, sub, color, glow, o = 1}) => (
  <div style={{position: 'absolute', left: x - 170, top: y - 105, width: 340, height: 210, borderRadius: 26, opacity: o, background: `linear-gradient(135deg, ${color}, ${alpha(color, 0.55)})`, boxShadow: `0 30px 60px rgba(0,0,0,0.5), 0 0 ${40 * glow}px ${alpha(color, 0.8 * glow)}`, border: '2px solid rgba(255,255,255,0.18)', color: '#fff', fontFamily: FONT, transform: `scale(${1 + 0.06 * glow})`}}>
    <div style={{position: 'absolute', left: 26, top: 22, fontSize: 36, fontWeight: 900}}>{label}</div>
    <div style={{position: 'absolute', left: 26, top: 72, fontSize: 26, opacity: 0.9}}>{sub}</div>
    <div style={{position: 'absolute', left: 26, bottom: 22, width: 56, height: 40, borderRadius: 8, background: 'linear-gradient(135deg,#F5D27A,#B8892B)'}} />
    <div style={{position: 'absolute', right: 24, bottom: 24, fontFamily: MONO, fontSize: 22, opacity: 0.8}}>•••• 48{label.length}1</div>
  </div>
);

export const RotationDemo: React.FC<DemoProps> = ({ins}) => {
  const {p, lin, on, frame, at} = useBeats(ins);
  // positions of the loop
  const A = {x: 560, y: 470};
  const B = {x: 1360, y: 470};
  const L = {x: 960, y: 790};
  const paused = on('question');
  const g = (k: string, next: string) => (on(k) && !on(next) ? p(k) : 0);
  const balance = 1; // the owed balance never goes away in the loop
  const salary = on('salary') ? lin('salary', 40) : 0;
  return (
    <DemoRoot ins={ins}>
      <DemoHeader ins={ins} color={C.crimson} />
      <CardObj x={A.x} y={A.y} label="Card A" sub="bill due" color="#7C3AED" glow={g('card', 'cardtocard') + g('loop', 'question')} />
      <CardObj x={B.x} y={B.y} label="Card B" sub="used to pay Card A" color="#0E7490" glow={g('cardtocard', 'mindue')} o={p('cardtocard')} />
      <CardObj x={L.x} y={L.y} label="Loan app" sub="small loan" color="#B45309" glow={g('loan', 'salary')} o={p('loan')} />
      {/* flows */}
      <Arrow x1={B.x - 190} y1={B.y - 20} x2={A.x + 190} y2={A.y - 20} t={on('cardtocard') ? lin('cardtocard', 20) : 0} color={paused ? '#64748B' : C.cyan} />
      <Arrow x1={L.x + 120} y1={L.y - 110} x2={B.x - 60} y2={B.y + 115} t={on('loan') ? lin('loan', 20) : 0} color={paused ? '#64748B' : C.amber} />
      <Arrow x1={A.x + 60} y1={A.y + 115} x2={L.x - 120} y2={L.y - 110} t={on('app') ? lin('app', 20) : 0} color={paused ? '#64748B' : C.crimson} dashed />
      {/* minimum due chip on card A */}
      {on('mindue') && (
        <div style={{position: 'absolute', left: A.x - 330, top: A.y + 130, opacity: p('mindue')}}>
          <Pill text="only the minimum due" color={C.amber} size={30} />
        </div>
      )}
      {/* the owed balance stays in the middle */}
      <div style={{position: 'absolute', left: 960 - 200, top: 440, width: 400, textAlign: 'center', opacity: p('cardtocard', 10) * balance}}>
        <div style={{fontFamily: MONO, fontSize: 24, letterSpacing: 4, color: '#FCA5A5'}}>STILL OWED</div>
        <div style={{fontFamily: FONT, fontSize: 64, fontWeight: 900, color: '#fff', textShadow: `0 0 30px ${alpha(C.crimson, 0.7)}`}}>Balance</div>
        <div style={{fontFamily: FONT, fontSize: 30, color: SUPPORT}}>moves around — never goes away</div>
      </div>
      {/* salary arrives and drains away */}
      {on('salary') && (
        <div style={{position: 'absolute', left: 1440, top: 640, opacity: interpolate(salary, [0, 0.1, 0.8, 1], [0, 1, 1, 0.35], CLAMP)}}>
          <Pill text="Salary ₹ comes in…" color={C.emerald} size={32} />
        </div>
      )}
      {on('salary') && (
        <div style={{position: 'absolute', left: 1440, top: 720, opacity: p('salary', 40)}}>
          <Pill text="…and goes straight out" color={C.crimson} size={32} />
        </div>
      )}
      {/* pause the loop */}
      {paused && (
        <>
          <div style={{position: 'absolute', right: 1920 - 760, top: 830, padding: '18px 30px', borderRadius: 20, background: alpha('#04060C', 0.85), border: `3px solid ${C.emerald}`, fontFamily: FONT, fontSize: 40, fontWeight: 850, color: '#fff', opacity: p('question', 10), whiteSpace: 'nowrap'}}>Solving the problem?</div>
          <div style={{position: 'absolute', left: 1160, top: 830, padding: '18px 30px', borderRadius: 20, background: alpha('#04060C', 0.85), border: `3px solid ${C.crimson}`, fontFamily: FONT, fontSize: 40, fontWeight: 850, color: '#fff', opacity: p('next', 0), whiteSpace: 'nowrap'}}>…or pushing it to next month?</div>
        </>
      )}
      <Caption
        ins={ins}
        bottom={56}
        lines={[
          {k: 'card', text: '“This month the card, next month I’ll clear it”', te: 'ఈ నెల card వాడేద్దాం, next month clear చేద్దాం'},
          {k: 'cardtocard', text: 'One card pays another card’s bill', te: 'ఒక card bill కోసం ఇంకో card నుంచి డబ్బు'},
          {k: 'mindue', text: 'Then only the minimum due…', te: 'తర్వాత minimum due మాత్రమే'},
          {k: 'loan', text: '…then a small loan, then another app', te: 'చిన్న loan, తర్వాత ఇంకో app'},
          {k: 'salary', text: 'Salary comes in — but nothing stays', te: 'Salary వస్తుంది, కానీ చేతిలో ఏమీ ఉండదు'},
          {k: 'question', text: 'Pause. Old debt paid with new debt…', te: 'కొత్త అప్పుతో పాత అప్పు cover చేస్తే…', color: '#FDE68A'},
          {k: 'clarity', text: 'An uncomfortable question — but clarity starts here', te: 'అక్కడి నుంచే clarity మొదలవుతుంది', color: '#86EFAC'},
        ]}
      />
      <BeatSfx ins={ins} k="cardtocard" name="card_slide" />
      <BeatSfx ins={ins} k="loan" name="card_slide" />
      <BeatSfx ins={ins} k="question" name="sub_thud" volume={0.3} />
    </DemoRoot>
  );
};

/* ------------------------------------------------------------------ §B household budget tray */

const BUDGET = {income: 40000, rows: [
  {k: 'food', label: 'Food', te: 'తిండి', amt: 9000, color: '#22C55E'},
  {k: 'medicine', label: 'Medicines', te: 'మందులు', amt: 3000, color: '#38BDF8'},
  {k: 'rent', label: 'Rent', te: 'Rent', amt: 12000, color: '#A78BFA'},
  {k: 'school', label: 'School fees', te: 'పిల్లల fees', amt: 4000, color: '#F59E0B'},
  {k: 'basics', label: 'Basics', te: 'ఇంట్లో basic needs', amt: 5000, color: '#94A3B8'},
]};

export const BudgetDemo: React.FC<DemoProps> = ({ins}) => {
  const {p, on, lin} = useBeats(ins);
  const barX = 200;
  const barW = 1520;
  const scale = barW / BUDGET.income;
  let acc = 0;
  const spent = BUDGET.rows.reduce((s, r) => s + r.amt, 0);
  const left = BUDGET.income - spent;
  return (
    <DemoRoot ins={ins}>
      <DemoHeader ins={ins} color={C.emerald} />
      {/* income bar */}
      <div style={{position: 'absolute', left: barX, top: 310, fontFamily: FONT, fontSize: 36, fontWeight: 800, color: '#fff', opacity: p('income')}}>
        Monthly income <span style={{color: '#86EFAC'}}>{inr(BUDGET.income)}</span>
      </div>
      <div style={{position: 'absolute', left: barX, top: 370, width: barW * lin('income', 25), height: 110, borderRadius: 18, background: alpha(C.emerald, 0.25), border: `3px solid ${C.emerald}`}} />
      {BUDGET.rows.map((r, i) => {
        const x = barX + acc * scale;
        acc += r.amt;
        const t = on('essentials') ? lin('essentials', 14, i * 12) : 0;
        return (
          <React.Fragment key={r.k}>
            <div style={{position: 'absolute', left: x, top: 370, width: r.amt * scale * t, height: 110, background: r.color, borderRight: '3px solid #0B1020', borderRadius: i === 0 ? '18px 0 0 18px' : 0}} />
            {t > 0.6 && (
              <div style={{position: 'absolute', left: x, top: i % 2 ? 572 : 494, width: Math.max(200, r.amt * scale), fontFamily: FONT, color: '#fff', borderLeft: `4px solid ${r.color}`, paddingLeft: 10, whiteSpace: 'nowrap'}}>
                <div style={{fontSize: 30, fontWeight: 800}}>{r.label}</div>
                <div style={{fontSize: 28, color: SUPPORT}}>{inr(r.amt)}</div>
              </div>
            )}
          </React.Fragment>
        );
      })}
      {/* what is really left */}
      {on('available') && (
        <div style={{position: 'absolute', left: barX + spent * scale, top: 360, width: left * scale, height: 130, borderRadius: '0 18px 18px 0', border: `5px solid #fff`, boxShadow: `0 0 40px ${alpha(C.emerald, 0.8)}`, opacity: p('available')}} />
      )}
      {on('available') && (
        <div style={{position: 'absolute', left: barX + spent * scale - 120, top: 650, width: 520, textAlign: 'center', opacity: p('available', 8), fontFamily: FONT}}>
          <div style={{fontSize: 30, color: SUPPORT}}>really available for repayment</div>
          <div style={{fontSize: 80, fontWeight: 900, color: '#86EFAC'}}>{inr(left)}</div>
        </div>
      )}
      {/* write it down */}
      {on('write') && (
        <div style={{position: 'absolute', left: barX, top: 690, width: 640, padding: '22px 28px', borderRadius: 16, background: '#FBF7EC', color: '#1B2433', fontFamily: FONT, transform: `rotate(-2deg) translateY(${(1 - p('write')) * 40}px)`, opacity: p('write'), boxShadow: '0 30px 60px rgba(0,0,0,0.5)'}}>
          <div style={{fontSize: 30, fontWeight: 900}}>My monthly plan (written down)</div>
          <div style={{fontSize: 26, marginTop: 6}}>Income − essentials = what I can really pay</div>
        </div>
      )}
      {on('realistic') && (
        <div style={{position: 'absolute', left: barX, top: 830, opacity: p('realistic')}}>
          <Pill text="✕ “I’ll manage somehow”" color={C.crimson} size={32} />
          <span style={{display: 'inline-block', width: 20}} />
          <Pill text="✓ A realistic budget" color={C.emerald} size={32} />
        </div>
      )}
      <IllusTag text="Illustration — your own numbers will differ" />
      <Caption
        ins={ins}
        bottom={56}
        lines={[
          {k: 'income', text: 'Start with your real monthly income', te: 'నెల ఆదాయం ఎంత?'},
          {k: 'essentials', text: 'Essentials first: food, medicines, rent, fees', te: 'ముందు ముఖ్యమైన ఖర్చులు'},
          {k: 'available', text: 'What is left is what you can really repay', te: 'మిగిలిందే నిజంగా కట్టగలిగేది', color: '#86EFAC'},
          {k: 'write', text: 'Write it down — paper or phone notes', te: 'Paper మీద లేదా phone notes లో రాయండి'},
          {k: 'realistic', text: 'A realistic budget beats “I’ll manage somehow”', te: 'Realistic budget ఎక్కువ help చేస్తుంది'},
        ]}
      />
      <BeatSfx ins={ins} k="essentials" name="block_slam" volume={0.16} />
      <BeatSfx ins={ins} k="available" name="node_pop" volume={0.25} />
    </DemoRoot>
  );
};
