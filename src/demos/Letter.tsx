import React from 'react';
import {C, FONT, MONO, alpha} from '../theme';
import {BeatSfx, Caption, DemoProps, DemoRoot, Hi, HI, IllusTag, Lens, Paper, Pill, SUPPORT, useBeats, useCamera} from './kit';

/**
 * §M Settlement-letter demonstration (m11). A fictional Bank A letter, labelled Sample / Illustration.
 * Beats: enter, verify, account, amount, dates, terms, reporting, channel, screenshot, smallfirst, writing.
 */

const W = 820;
const ROW = {issuer: 40, account: 200, amount: 318, dates: 392, terms: 470, reporting: 590, channel: 650, sign: 770};

const LetterBody: React.FC = () => (
  <Paper w={W} h={1000}>
    {/* letterhead */}
    <div style={{position: 'absolute', left: 48, top: ROW.issuer, display: 'flex', alignItems: 'center', gap: 16}}>
      <div style={{width: 64, height: 64, borderRadius: 14, background: '#1E3A8A', color: '#fff', fontWeight: 900, fontSize: 30, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>A</div>
      <div>
        <div style={{fontSize: 34, fontWeight: 900, letterSpacing: 1}}>BANK A</div>
        <div style={{fontSize: 18, color: '#475569'}}>Card Services · Recoveries (fictional)</div>
      </div>
    </div>
    <div style={{position: 'absolute', right: 40, top: ROW.issuer + 4, padding: '8px 14px', border: '3px solid #B45309', color: '#B45309', fontSize: 22, fontWeight: 900, borderRadius: 8, transform: 'rotate(-4deg)'}}>SAMPLE / ILLUSTRATION</div>
    <div style={{position: 'absolute', left: 48, right: 48, top: 128, borderTop: '3px solid #1E3A8A'}} />
    <div style={{position: 'absolute', left: 48, top: 146, fontFamily: MONO, fontSize: 18, color: '#475569'}}>Ref BA/SET/2026/0917 · 02 Nov 2026</div>
    {/* account */}
    <div style={{position: 'absolute', left: 48, top: ROW.account, fontSize: 24}}>
      To: <b>R. Kumar</b> (fictional) &nbsp;·&nbsp; Card ending <b style={{fontFamily: MONO}}>•••• 4821</b>
    </div>
    <div style={{position: 'absolute', left: 48, top: ROW.account + 44, fontSize: 24, fontWeight: 800}}>Subject: One-time settlement — full and final</div>
    {/* amount + dates */}
    <div style={{position: 'absolute', left: 48, top: ROW.amount, fontSize: 26}}>
      Agreed settlement amount: <b style={{fontSize: 32}}>₹30,000</b>
    </div>
    <div style={{position: 'absolute', left: 48, top: ROW.dates, fontSize: 24}}>
      Instalments: <b>₹10,000 × 3</b> · 30 Nov · 30 Dec 2026 · 30 Jan 2027
    </div>
    {/* terms */}
    <div style={{position: 'absolute', left: 48, right: 48, top: ROW.terms, fontSize: 22, lineHeight: 1.45}}>
      On receipt of all instalments by the dates above, the <b>remaining dues on this card will be waived</b> and the account closed. Bank A will make <b>no further claim</b> on this card.
    </div>
    <div style={{position: 'absolute', left: 48, right: 48, top: ROW.reporting, fontSize: 22}}>
      Credit bureau reporting after completion: <b>“Settled”</b>
    </div>
    <div style={{position: 'absolute', left: 48, right: 48, top: ROW.channel, fontSize: 22, lineHeight: 1.45}}>
      Pay only via <b>Bank A’s official website</b> or NEFT to the account named in this letter.
    </div>
    {/* signature */}
    <div style={{position: 'absolute', left: 48, top: ROW.sign, fontFamily: "'Brush Script MT', cursive", fontSize: 44, color: '#1E3A8A'}}>A. Sharma</div>
    <div style={{position: 'absolute', left: 48, top: ROW.sign + 60, fontSize: 20, color: '#334155'}}>A. Sharma (fictional) · Authorised Officer, Bank A</div>
    <div style={{position: 'absolute', left: 48, right: 48, top: 900, fontSize: 18, color: '#64748B'}}>Verify this letter through Bank A’s official customer care before paying.</div>
  </Paper>
);

export const LetterDemo: React.FC<DemoProps> = ({ins}) => {
  const {p, on, lin} = useBeats(ins);
  const VW = 1920;
  const VH = 600;
  const cam = useCamera(
    ins,
    [
      {k: 'enter', x: 410, y: 500, s: 0.58},
      {k: 'verify', x: 410, y: 500, s: 0.58},
      // Hinglish edition: the letter sits on the left at full size, the spoken line is enlarged on the right (Lens)
      ...(HI
        ? [
            {k: 'account', x: 860, y: 260, s: 1},
            {k: 'amount', x: 860, y: 352, s: 1},
            {k: 'terms', x: 860, y: 540, s: 1},
          ]
        : [
            {k: 'account', x: 400, y: 232, s: 1.3},
            {k: 'amount', x: 400, y: 352, s: 1.3},
            {k: 'terms', x: 410, y: 548, s: 1.1},
          ]),
      {k: 'channel', x: 1120, y: 500, s: 0.58},
    ],
    VW,
    VH,
  );
  const enter = p('enter', 0);
  const between = (a: string, b?: string, d = 4) => (on(a) && (!b || !on(b)) ? p(a, d) : 0);
  const verifyCard = between('channel', 'screenshot', 8);
  const check = p('channel', 50);
  const shot = between('screenshot', 'smallfirst');
  const small = on('smallfirst') ? p('smallfirst') : 0;
  const writing = on('writing') ? p('writing') : 0;
  const card: React.CSSProperties = {position: 'absolute', left: 900, width: 860, padding: '28px 32px', borderRadius: 24, boxShadow: '0 30px 70px rgba(0,0,0,0.55)', fontFamily: FONT, color: '#fff'};
  return (
    <DemoRoot ins={ins}>
      <div style={{position: 'absolute', left: 120, top: 112}}>
        <div style={{fontFamily: MONO, fontSize: 26, letterSpacing: 6, color: C.emerald, fontWeight: 700}}>CHECK THE LETTER — BEFORE ONE RUPEE</div>
        <div style={{fontFamily: FONT, fontSize: 60, fontWeight: 850, color: C.text, marginTop: 6}}>What a settlement letter must show</div>
      </div>
      {/* camera viewport over the letter */}
      <div style={{position: 'absolute', left: 0, top: 262, width: VW, height: VH, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, top: 0, ...cam, opacity: enter}}>
          <div style={{position: 'absolute', left: 0, top: (1 - enter) * 220, transform: `rotate(${(1 - enter) * -6}deg)`}}>
            <LetterBody />
            <Hi x={36} y={ROW.issuer - 4} w={420} h={80} t={between('verify', 'account', 6)} color={C.cyan} label="Issuer" />
            <Hi x={36} y={ROW.sign - 6} w={560} h={96} t={between('verify', 'account', 16)} color={C.cyan} label="Authorised signatory" />
            <Hi x={36} y={ROW.account - 4} w={720} h={40} t={between('account', 'amount')} color={C.cyan} />
            <Hi x={36} y={ROW.amount - 6} w={490} h={48} t={between('amount', 'terms')} color={C.emerald} />
            <Hi x={36} y={ROW.dates - 4} w={735} h={40} t={between('dates', 'terms')} color={C.amber} />
            <Hi x={36} y={ROW.terms - 4} w={740} h={104} t={between('terms', 'reporting', 6)} color={C.emerald} />
            <Hi x={36} y={ROW.reporting - 4} w={740} h={38} t={between('reporting', 'channel')} color={C.amber} />
            <Hi x={36} y={ROW.channel - 4} w={740} h={72} t={between('channel', 'screenshot', 20)} color={C.emerald} label="Payment channel" labelSide="top" />
          </div>
        </div>
        {/* right column, screen space (full-size text) */}
        {verifyCard > 0.01 && (
          <div style={{...card, top: 60, background: '#0E1A30', border: `3px solid ${alpha(C.cyan, 0.6)}`, opacity: verifyCard, transform: `translateX(${(1 - verifyCard) * 60}px)`}}>
            <div style={{fontSize: 40, fontWeight: 850}}>Bank A — official app / customer care</div>
            <div style={{fontSize: 30, color: SUPPORT, marginTop: 6}}>Opened yourself — not from a link in a message</div>
            <div style={{marginTop: 22, fontFamily: MONO, fontSize: 30, color: SUPPORT}}>Ref BA/SET/2026/0917 · Card •••• 4821 · ₹30,000</div>
            <div style={{marginTop: 22, display: 'flex', alignItems: 'center', gap: 16, opacity: check}}>
              <div style={{width: 64, height: 64, borderRadius: 32, background: C.emerald, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 900, color: '#04111C'}}>✓</div>
              <div style={{fontSize: 40, fontWeight: 850, color: '#86EFAC'}}>Matches the letter</div>
            </div>
          </div>
        )}
        {shot > 0.01 && (
          <div style={{...card, top: 90, background: '#0F2A1D', border: `3px solid ${C.crimson}`, opacity: shot, transform: `translateY(${(1 - shot) * 40}px)`}}>
            <div style={{fontSize: 32, color: '#86EFAC', fontWeight: 800}}>WhatsApp · forwarded image</div>
            <div style={{fontSize: 44, fontWeight: 800, marginTop: 10}}>“Offer approved — pay now”</div>
            <div style={{marginTop: 20}}><Pill text="✕ A screenshot alone is not proof" color={C.crimson} size={34} /></div>
          </div>
        )}
        {small > 0.01 && (
          <div style={{position: 'absolute', left: 900, top: 30, width: 860, opacity: small, transform: `translateY(${(1 - small) * 40}px)`, fontFamily: FONT, color: '#fff'}}>
            <div style={{padding: '24px 30px', borderRadius: '28px 28px 28px 6px', background: '#2A1416', border: `3px solid ${C.crimson}`, fontSize: 42, fontWeight: 750}}>“Pay ₹5,000 now — the letter will follow.”</div>
            <div style={{marginTop: 26, padding: '22px 28px', borderRadius: 20, background: '#111A2E', border: `3px dashed ${C.amber}`}}>
              <div style={{fontSize: 32, color: SUPPORT}}>That payment may be recorded as…</div>
              <div style={{position: 'relative', display: 'flex', gap: 16, marginTop: 14}}>
                <Pill text="settlement?" color={C.amber} size={32} style={{opacity: on('misrecord') ? 0.4 : 1}} />
                <Pill text="ordinary part-payment?" color={on('misrecord') ? C.crimson : C.amber} size={32} />
                {/* the ₹5,000 slides into the wrong bucket */}
                {on('misrecord') && !on('clarity') && (
                  <div style={{position: 'absolute', left: 120 + 330 * lin('misrecord', 24), top: -70 + 70 * lin('misrecord', 24), padding: '6px 14px', borderRadius: 999, background: C.amber, color: '#04111C', fontFamily: MONO, fontSize: 26, fontWeight: 900}}>₹5,000</div>
                )}
              </div>
              {on('misrecord') && !on('clarity') && <div style={{marginTop: 14, fontSize: 30, fontWeight: 800, color: '#FCA5A5', opacity: p('misrecord', 24)}}>Paid as a “settlement”, recorded as a part-payment → misunderstanding</div>}
              {on('clarity') && <div style={{marginTop: 14, opacity: p('clarity')}}><Pill text="Get clarity first — then pay" color={C.cyan} size={34} /></div>}
            </div>
            {writing > 0.01 && (
              <div style={{marginTop: 26, opacity: writing, transform: `scale(${0.92 + 0.08 * writing})`, transformOrigin: 'left center'}}>
                <Pill text="✓ Confirm in writing before you pay" color={C.emerald} size={40} />
              </div>
            )}
          </div>
        )}
      </div>
      <Lens ins={ins} x={990} y={352} w={800} size={56} lines={[
        {k: 'account', until: 'channel', label: 'Name & account', text: 'R. Kumar · card •••• 4821', color: C.cyan},
        {k: 'amount', until: 'channel', label: 'Agreed amount', text: '₹30,000', note: 'Settlement amount — in writing', color: C.emerald},
        {k: 'dates', until: 'channel', label: 'Payment dates', text: '₹10,000 × 3', note: '30 Nov · 30 Dec 2026 · 30 Jan 2027', color: C.amber},
        {k: 'terms', until: 'channel', label: 'Remaining dues', text: 'Waived · no further claim', note: 'Baaki dues ka kya hoga — likha hai', color: C.emerald},
        {k: 'reporting', until: 'channel', label: 'Credit bureau reporting', text: '“Settled”', note: 'Report mein yahi status dikhega', color: C.amber},
      ]} />
      <Caption
        ins={ins}
        bottom={48}
        lines={[
          {k: 'enter', hi: 'Pehle official settlement letter maango', text: 'Ask for the official settlement letter first', te: 'ముందు official settlement letter అడగండి'},
          {k: 'verify', hi: 'Kisne bheja? Kisne sign kiya?', text: 'Who issued it? Who signed it?', te: 'ఎవరు ఇచ్చారు? ఎవరు sign చేశారు?'},
          {k: 'account', hi: 'Aapka naam aur sahi account', text: 'Your name and the exact account', te: 'మీ పేరు, ఏ account అనేది clear గా'},
          {k: 'amount', hi: 'Kitna dena hai — aur kab tak', text: 'The agreed amount — and the payment date', te: 'Agreed amount, payment dates'},
          {k: 'terms', hi: 'Baaki dues ka kya hoga? Letter mein likha ho', text: 'What happens to the remaining dues?', te: 'మిగతా dues ఏమవుతాయి? ఇంకేమైనా claim ఉందా?'},
          {k: 'reporting', hi: 'Credit report mein kya dikhega?', text: 'How will the account be reported?', te: 'Credit report లో ఎలా చూపిస్తారు?', color: '#FDE68A'},
          {k: 'channel', hi: 'Official channel se khud verify karo', text: 'Verify it yourself, through the official channel', te: 'Official channel లో మీరే verify చేయండి', color: '#86EFAC'},
          {k: 'screenshot', hi: 'Sirf WhatsApp screenshot kaafi nahi', text: 'A WhatsApp screenshot alone is not enough', te: 'WhatsApp screenshot ఒక్కటే చాలదు', color: '#FCA5A5'},
          {k: 'smallfirst', hi: '“Abhi thoda do, letter baad mein”? Ruko.', text: '“Pay a little now, letter later”? Stop.', te: 'ఆ payment settlement లో part అవుతుందా?', color: '#FCA5A5'},
          {k: 'writing', hi: 'Paisa dene se pehle likhit mein clarity lo', text: 'Get clarity in writing before paying', te: 'Payment కి ముందే written గా clarity', color: '#86EFAC'},
          {k: 'misrecord', hi: 'Part-payment maana gaya toh confusion hoga', text: 'Recorded as an ordinary part-payment? That’s a misunderstanding', te: 'Ordinary part payment గా record అయితే misunderstanding', color: '#FCA5A5'},
          {k: 'clarity', hi: 'Pehle clarity, phir payment', text: 'Get clarity before making the payment', te: 'Payment చేసే ముందే clarity తీసుకోండి', color: '#7DD3FC'},
        ]}
      />
      <BeatSfx ins={ins} k="enter" name="pages_flip" volume={0.25} />
      <BeatSfx ins={ins} k="channel" name="radar_ping" volume={0.18} />
      <BeatSfx ins={ins} k="screenshot" name="warning_pulse" volume={0.14} />
      <IllusTag text="Sample / Illustration — fictional bank and figures" style={{top: 272, bottom: 'auto', zIndex: 10, background: '#2A2410'}} />
    </DemoRoot>
  );
};
