import React from 'react';
import {tx} from '../lib/lang';
import {C, FONT, MONO, alpha} from '../theme';
import {Arrow, BeatSfx, Caption, DemoHeader, DemoProps, DemoRoot, Hi, HI, Lens, Paper, Pill, SUPPORT, useBeats} from './kit';

/* ------------------------------------------------------------------ §G salary account and set-off */

const Acct: React.FC<{x: number; y: number; title: string; sub: string; color: string; o: number}> = ({x, y, title, sub, color, o}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 420, height: 190, borderRadius: 24, background: '#0E1628', border: `3px solid ${color}`, padding: 26, boxSizing: 'border-box', opacity: o, boxShadow: '0 30px 60px rgba(0,0,0,0.45)'}}>
    <div style={{fontFamily: FONT, fontSize: 40, fontWeight: 900, color: '#fff'}}>{title}</div>
    <div style={{fontFamily: FONT, fontSize: 30, color: SUPPORT, marginTop: 8}}>{sub}</div>
  </div>
);

export const SetOffDemo: React.FC<DemoProps> = ({ins}) => {
  const {p, on, lin} = useBeats(ins);
  return (
    <DemoRoot ins={ins}>
      <DemoHeader ins={ins} color={C.amber} />
      {/* same bank frame */}
      <div style={{position: 'absolute', left: 110, top: 320, width: 980, height: 560, borderRadius: 30, border: `3px solid ${alpha('#94A3B8', 0.5)}`, background: alpha('#1E293B', 0.35), opacity: p('clause')}}>
        <div style={{position: 'absolute', left: 30, top: 16, fontFamily: MONO, fontSize: 26, letterSpacing: 5, color: SUPPORT, fontWeight: 800}}>BANK A (same bank)</div>
      </div>
      <Acct x={150} y={400} title="Credit card" sub="overdue · •••• 4821" color={C.crimson} o={p('clause', 6)} />
      <Acct x={150} y={640} title="Salary account" sub="savings at the same bank" color={C.cyan} o={p('clause', 12)} />
      {/* conditional adjustment */}
      <Arrow x1={360} y1={640} x2={360} y2={600} t={on('adjust') ? lin('adjust', 14) : 0} color={C.amber} width={8} dashed />
      {on('adjust') && <div style={{position: 'absolute', left: 600, top: 588, opacity: p('adjust')}}><Pill text="may adjust · applicable terms" color={C.amber} size={28} /></div>}
      {/* agreement clause, zoomed */}
      <div style={{position: 'absolute', left: 1140, top: 330, opacity: p('meaning'), transform: `scale(${0.9 + 0.1 * p('meaning')})`, transformOrigin: 'left top'}}>
        <Paper w={660} h={380}>
          <div style={{position: 'absolute', left: 30, top: 24, fontSize: 28, fontWeight: 900}}>Card agreement (sample)</div>
          <div style={{position: 'absolute', left: 30, right: 30, top: 80, fontSize: 25, lineHeight: 1.5}}>
            <b>Clause 14 — Set-off / lien.</b> Under applicable terms and law, the Bank may adjust money held by you with the Bank against overdue amounts on this card.
          </div>
          <Hi x={22} y={74} w={616} h={156} t={on('explicit') ? p('explicit') : 0} color={C.amber} />
          <div style={{position: 'absolute', left: 30, bottom: 24, fontSize: 20, color: '#64748B'}}>Illustration — read your own agreement</div>
        </Paper>
      </div>
      {on('notassume') && <div style={{position: 'absolute', left: 1140, top: 740, opacity: p('notassume')}}><Pill text="✕ “Savings and card are separate — no problem”" color={C.crimson} size={28} /></div>}
      {on('plan') && (
        <div style={{position: 'absolute', left: 1140, top: 810, display: 'flex', gap: 12, opacity: p('plan')}}>
          <Pill text="Plan essentials" color={C.emerald} size={30} />
          <Pill text="food" color={C.emerald} size={28} />
          <Pill text="medicine" color={C.emerald} size={28} />
          <Pill text="rent" color={C.emerald} size={28} />
        </div>
      )}
      <Caption ins={ins} bottom={56} lines={[
        {k: 'clause', text: 'Salary at the same bank? Check your agreement', te: 'Agreement లో lien / set-off clause చెక్ చేయండి'},
        {k: 'meaning', text: 'Set-off: the bank may adjust your money against dues', te: 'మీ account లో డబ్బుని dues కి adjust చేయొచ్చు'},
        {k: 'notassume', text: 'Don’t blindly assume they are separate', te: 'Separate కదా, ఏ problem లేదు అనుకోవద్దు', color: '#FCA5A5'},
        {k: 'plan', text: 'Plan the money you rely on for essentials', te: 'Essential ఖర్చుల డబ్బుని ముందే plan చేసుకోండి', color: '#86EFAC'},
        {k: 'advice', text: 'If needed, take advice on your salary banking', te: 'అవసరమైతే salary banking మార్చడం గురించి advice తీసుకోండి'},
      ]} />
    </DemoRoot>
  );
};

/* ------------------------------------------------------------------ §H hardship email and manageable promises */

const Field: React.FC<{label: string; value: string; o: number; good?: number}> = ({label, value, o, good = 0}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: '1px solid rgba(148,163,184,0.25)', opacity: o}}>
    <div style={{width: 120, fontFamily: FONT, fontSize: 26, color: SUPPORT}}>{label}</div>
    <div style={{fontFamily: MONO, fontSize: 28, color: '#fff', flex: 1}}>{value}</div>
    {good > 0.01 && <div style={{opacity: good}}><Pill text="✓ verified on official website" color={C.emerald} size={22} /></div>}
  </div>
);

const BODY = [
  {k: 'l1', text: tx('“My income has fallen.”', '“My income has come down.”')},
  {k: 'l2', text: tx('“Medical expenses make the current payment hard to manage.”', '“I have medical expenses at home.”')},
  {k: 'l3', text: tx('“I am available to discuss repayment options.”', '“I want to discuss a payment plan.”')},
  {k: 'l4', text: tx('“After essential expenses, I can afford ₹7,000 a month.”', '“After my basic expenses, I can afford ₹7,000 each month.”')},
  {k: 'ask', text: 'Which options apply: reduced EMI, repayment plan, restructuring or settlement?'},
  {k: 'sent', text: 'I prefer written communication by email.'},
];

export const EmailDemo: React.FC<DemoProps> = ({ins}) => {
  const {p, on, lin} = useBeats(ins);
  const typed = (k: string, text: string) => (on(k) ? text.slice(0, Math.ceil(text.length * lin(k, 40))) : '');
  const promise = on('promise') && !on('options') ? p('promise') : on('options') ? 1 - p('options') : 0;
  return (
    <DemoRoot ins={ins}>
      <DemoHeader ins={ins} color={C.cyan} />
      {/* mail window */}
      <div style={{position: 'absolute', left: 120, top: 310, width: 1100, height: HI ? 590 : 640, borderRadius: 22, background: '#0F172A', border: '2px solid rgba(148,163,184,0.35)', boxShadow: '0 40px 90px rgba(0,0,0,0.55)', overflow: 'hidden', opacity: p('verify')}}>
        <div style={{height: 56, background: '#1E293B', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 10}}>
          {['#EF4444', '#F59E0B', '#22C55E'].map((c) => <div key={c} style={{width: 16, height: 16, borderRadius: 8, background: c}} />)}
          <div style={{marginLeft: 16, fontFamily: FONT, fontSize: 26, fontWeight: 800, color: '#fff'}}>New message — hardship</div>
        </div>
        <div style={{padding: '8px 30px'}}>
          <Field label="To" value="grievance@bank-a.example" o={p('verify', 6)} good={p('verify', 30)} />
          <Field label="Subject" value="Hardship — card •••• 4821" o={p('send')} />
          <div style={{paddingTop: 16}}>
            {BODY.map((b) => (
              <div key={b.k} style={{fontFamily: FONT, fontSize: 30, color: '#fff', lineHeight: 1.45, minHeight: on(b.k) ? 46 : 0, background: HI && on(b.k) && !on('promise') && b.k === BODY.filter((q) => on(q.k)).slice(-1)[0]?.k ? alpha(C.cyan, 0.16) : undefined, borderRadius: 8}}>{typed(b.k, b.text)}</div>
            ))}
          </div>
        </div>
        {on('sent') && (
          <div style={{position: 'absolute', right: 30, bottom: 24, opacity: p('sent', 30)}}>
            <Pill text="✓ Sent · copy saved" color={C.emerald} size={30} />
          </div>
        )}
      </div>
      {on('nofancy') && !on('promise') && <div style={{position: 'absolute', left: 1270, top: 330, width: 540, opacity: p('nofancy')}}><Pill text="No fancy English needed" color={C.cyan} size={34} /></div>}
      {/* promise comparison */}
      {promise > 0.01 && (
        <div style={{position: 'absolute', left: 1270, top: 330, width: 540, opacity: promise}}>
          <div style={{padding: 24, borderRadius: 20, background: '#2A1416', border: `3px solid ${C.crimson}`}}>
            <div style={{fontFamily: FONT, fontSize: 34, fontWeight: 850, color: '#fff'}}>{tx('“I’ll pay ₹20,000 tomorrow”', '“I’ll pay tomorrow”')}</div>
            <div style={{fontFamily: FONT, fontSize: 28, color: '#FCA5A5', marginTop: 8}}>just to end the call — not in the budget</div>
          </div>
          {on('honest') && (
            <div style={{marginTop: 22, padding: 24, borderRadius: 20, background: '#0F2A1D', border: `3px solid ${C.emerald}`, opacity: p('honest')}}>
              <div style={{fontFamily: FONT, fontSize: 34, fontWeight: 850, color: '#fff'}}>{tx('“I need a workable option”', '“I can’t promise that amount. What other options are there?”')}</div>
              <div style={{fontFamily: FONT, fontSize: 28, color: '#86EFAC', marginTop: 8}}>₹7,000 a month — from the budget</div>
            </div>
          )}
        </div>
      )}
      {on('options') && !on('sent') && (
        <div style={{position: 'absolute', left: 1270, top: 330, width: 540, display: 'flex', flexDirection: 'column', gap: 16, opacity: p('options')}}>
          <Pill text="Reduced EMI" color={C.cyan} size={32} />
          <Pill text="Repayment plan" color={C.cyan} size={32} />
          <Pill text="Restructuring" color={C.cyan} size={32} />
          <Pill text="Settlement" color={C.cyan} size={32} />
        </div>
      )}
      {on('lawful') && (
        <div style={{position: 'absolute', left: 1270, top: 330, width: 560, opacity: p('lawful')}}>
          <div style={{padding: 26, borderRadius: 20, background: '#0E1628', border: `3px solid ${C.amber}`}}>
            <div style={{fontFamily: FONT, fontSize: 32, fontWeight: 850, color: '#fff'}}>Email preference ≠ “no calls”</div>
            <div style={{fontFamily: FONT, fontSize: 28, color: SUPPORT, marginTop: 8}}>The bank may still make lawful calls.</div>
          </div>
          {on('separate') && <div style={{marginTop: 18, opacity: p('separate')}}><Pill text="Harassment protections are separate" color={C.cyan} size={28} /></div>}
        </div>
      )}
      <div style={{position: 'absolute', right: 110, top: 128, padding: '10px 18px', borderRadius: 12, border: `2px solid ${alpha(C.amber, 0.7)}`, background: alpha(C.amber, 0.14), color: '#FDE68A', fontFamily: FONT, fontSize: 28, fontWeight: 750}}>Sample email — fictional address</div>
      <Lens ins={ins} x={1270} y={430} w={560} size={46} lines={BODY.slice(0, 4).map((b) => ({k: b.k, until: 'promise', label: 'Your email says', text: b.text}))} />
      <Caption ins={ins} bottom={44} lines={[
        {k: 'verify', hi: 'Email ID bank ki official website se check karo', text: 'Verify the grievance / nodal officer contact on the official website', te: 'Official website లో contact verify చేయండి'},
        {k: 'nofancy', hi: 'Fancy English nahi — apni asli situation likho', text: 'No fancy English — just your actual situation', te: 'Fancy English అవసరం లేదు'},
        {k: 'promise', hi: 'Jo afford nahi kar sakte, woh promise mat karo', text: 'Don’t promise what you can’t afford', te: 'Afford చేయలేని amount promise చేయొద్దు', color: '#FCA5A5'},
        {k: 'options', hi: 'Likh ke poocho — aapke liye kaun se options hain?', text: 'Ask in writing which options apply to you', te: 'ఏ options apply అవుతాయో written గా అడగండి'},
        {k: 'sent', hi: 'Bol sakte ho: mujhe likhit mein baat karni hai', text: 'You can say you prefer written communication', te: 'Written communication prefer చేస్తున్నానని చెప్పొచ్చు'},
      ]} />
      <BeatSfx ins={ins} k="sent" name="email_sent" volume={0.25} />
    </DemoRoot>
  );
};
