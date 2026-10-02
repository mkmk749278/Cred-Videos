import React from 'react';
import {tx} from '../lib/lang';
import {interpolate} from '../lib/safeInterpolate';
import {C, FONT, MONO, alpha} from '../theme';
import {CLAMP} from '../lib/anim';
import {Arrow, BeatSfx, Caption, DemoHeader, DemoProps, DemoRoot, Folder, IllusTag, Paper, PhoneBody, Pill, SUPPORT, Toggle, useBeats} from './kit';

/* ------------------------------------------------------------------ §I-1 calling hours */

export const ClockDemo: React.FC<DemoProps> = ({ins}) => {
  const {p, on, at, frame, fps} = useBeats(ins);
  const X0 = 160;
  const W = 1600;
  const hx = (h: number) => X0 + (W * h) / 24;
  const threats = [{k: 'neighbours', t: '“We’ll tell your neighbours”'}, {k: 'office', t: '“We’ll talk in front of your office”'}, {k: 'family', t: '“We’ll trouble your family”'}];
  return (
    <DemoRoot ins={ins}>
      <DemoHeader ins={ins} color={C.crimson} />
      {/* prohibited conduct chips */}
      <div style={{position: 'absolute', left: 160, top: 320, display: 'flex', gap: 14, flexWrap: 'wrap', width: 1600}}>
        {[['rules', '✕ insults · threats'], ['rules', '✕ public humiliation'], ['rules', '✕ intruding on family privacy'], ['prohibited', '✕ anonymous or threatening calls'], ['prohibited', '✕ persistent harassment']].map(([k, t], i) => (
          <Pill key={i} text={t} color={C.crimson} size={30} style={{opacity: on(k) ? p(k, i * 4) : 0}} />
        ))}
      </div>
      {/* 24-hour day bar */}
      <div style={{position: 'absolute', left: X0, top: 520, width: W, height: 90, borderRadius: 16, background: alpha(C.crimson, 0.22), border: `2px solid ${alpha(C.crimson, 0.6)}`, opacity: p('hours')}} />
      <div style={{position: 'absolute', left: hx(8), top: 520, width: hx(19) - hx(8), height: 90, background: alpha(C.emerald, 0.35), borderLeft: `4px solid ${C.emerald}`, borderRight: `4px solid ${C.emerald}`, opacity: p('hours', 10)}} />
      {[0, 6, 8, 12, 19, 24].map((h) => (
        <div key={h} style={{position: 'absolute', left: hx(h) - 60, top: 620, width: 120, textAlign: 'center', fontFamily: MONO, fontSize: 26, color: h === 8 || h === 19 ? '#86EFAC' : SUPPORT, opacity: p('hours')}}>{h === 8 ? '8 am' : h === 19 ? '7 pm' : h === 24 ? '12 am' : h === 12 ? 'noon' : `${h} am`}</div>
      ))}
      <div style={{position: 'absolute', left: hx(8), width: hx(19) - hx(8), top: 540, textAlign: 'center', fontFamily: FONT, fontSize: 34, fontWeight: 850, color: '#fff', opacity: p('hours', 14)}}>recovery calls allowed only in this window</div>
      {/* a call sweeps through the allowed window while the rule is explained */}
      {on('hours') && !on('neighbours') && (() => {
        const t = ((frame - at('hours')) / (fps * 5)) % 1;
        return <div style={{position: 'absolute', left: hx(8) + (hx(19) - hx(8)) * t - 30, top: 668, width: 60, height: 60, borderRadius: 30, background: C.emerald, boxShadow: `0 0 24px ${alpha(C.emerald, 0.7)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, opacity: Math.min(1, (frame - at('hours')) / 15)}}>📞</div>;
      })()}
      {on('no') && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 444, textAlign: 'center', opacity: p('no'), transform: `scale(${1.15 - 0.15 * p('no')})`}}>
          <Pill text="✕ Harassment is never OK — even inside these hours" color={C.crimson} size={32} />
        </div>
      )}
      {/* harassment is not OK even inside the window */}
      {threats.map((t, i) => on(t.k) && (
        <div key={t.k} style={{position: 'absolute', left: 160 + i * 560, top: 700, width: 520, opacity: p(t.k)}}>
          <div style={{padding: '16px 20px', borderRadius: '22px 22px 22px 6px', background: '#2A1416', border: `3px solid ${C.crimson}`, fontFamily: FONT, fontSize: 30, fontWeight: 750, color: '#fff'}}>{t.t}</div>
        </div>
      ))}
      {on('notnormal') && <div style={{position: 'absolute', left: 0, right: 0, top: 850, textAlign: 'center', opacity: p('notnormal')}}><Pill text="Not a normal recovery process — even within calling hours" color={C.amber} size={34} /></div>}
      <Caption ins={ins} bottom={44} lines={[
        {k: 'rules', text: 'They may contact you about payment — within limits', te: 'Payment గురించి contact చేయొచ్చు — కానీ limits లో'},
        {k: 'hours', text: 'No recovery calls before 8 am or after 7 pm', te: 'ఉదయం 8 కి ముందు, సాయంత్రం 7 తర్వాత calls చేయకూడదు'},
        {k: 'inside', text: 'Between 8 and 7, is anything acceptable?', te: '8 నుంచి 7 మధ్య ఏదైనా OK నా?', color: '#FDE68A'},
        {k: 'no', text: 'No. Keeping to the hours doesn’t make harassment acceptable', te: 'కాదు. Time limit పాటించినా harassment OK కాదు', color: '#FCA5A5'},
      ]} />
    </DemoRoot>
  );
};

/* ------------------------------------------------------------------ §I-2 verify the caller */

export const CallerDemo: React.FC<DemoProps> = ({ins}) => {
  const {p, on} = useBeats(ins);
  const checking = on('channel');
  const rows = [
    {k: 'name', label: 'Name', v: '“Ravi”'},
    {k: 'agency', label: 'Agency', v: '“Swift Recoveries”'},
    {k: 'bank', label: 'For which bank', v: '“Bank A”'},
    {k: 'auth', label: 'Authorisation', v: 'send by official email'},
  ];
  return (
    <DemoRoot ins={ins}>
      <DemoHeader ins={ins} color={C.cyan} />
      <PhoneBody x={150} y={300} w={400} h={640}>
        <div style={{position: 'absolute', top: 80, left: 0, right: 0, textAlign: 'center'}}>
          <div style={{fontSize: 24, color: SUPPORT}}>incoming call</div>
          <div style={{width: 110, height: 110, borderRadius: 55, background: '#1E3A8A', margin: '20px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52, fontWeight: 900}}>A</div>
          <div style={{fontSize: 30, fontWeight: 850}}>“Bank A Recovery”</div>
          <div style={{fontSize: 22, color: SUPPORT, marginTop: 6}}>+91 98XXX XXX21</div>
          <div style={{marginTop: 26, padding: '0 24px'}}><Pill text="a logo alone proves nothing" color={C.amber} size={22} /></div>
        </div>
      </PhoneBody>
      <div style={{position: 'absolute', left: 640, top: 320, width: 1160}}>
        {rows.map((r) => (
          <div key={r.k} style={{display: 'flex', alignItems: 'center', gap: 24, padding: '20px 26px', marginBottom: 14, borderRadius: 18, background: '#0E1628', border: '2px solid rgba(148,163,184,0.3)', opacity: on(r.k) ? p(r.k) : 0.12}}>
            <div style={{width: 260, fontFamily: FONT, fontSize: 32, fontWeight: 850, color: '#fff'}}>{r.label}</div>
            <div style={{flex: 1, fontFamily: FONT, fontSize: 32, color: SUPPORT}}>{r.v}</div>
            <Pill text={checking ? 'checking via official channel…' : 'unverified'} color={checking ? C.cyan : C.amber} size={26} />
          </div>
        ))}
      </div>
      {on('voice') && !on('say') && (
        <div style={{position: 'absolute', left: 640, top: 760, display: 'flex', gap: 16, opacity: p('voice')}}>
          <Pill text="Stay calm — no need to raise your voice" color={C.cyan} size={30} />
          {on('goal') && <Pill text="Goal: document, not win" color={C.emerald} size={30} style={{opacity: p('goal')}} />}
        </div>
      )}
      {on('say') && (
        <div style={{position: 'absolute', left: 640, top: 750, width: 1160, padding: '18px 26px', borderRadius: 18, background: '#0F2A1D', border: `3px solid ${C.emerald}`, fontFamily: FONT, fontSize: 30, color: '#fff', opacity: p('say')}}>
          {tx('“I’ve explained my hardship to the bank in writing. I’ll discuss payment options through the official channel. Please don’t use threatening language.”', '“I have already explained my problem to the bank in writing. I’ll discuss payment through the official channel. Please don’t threaten me.”')}
        </div>
      )}
      <Caption ins={ins} bottom={30} lines={[
        {k: 'name', text: 'Calmly ask: name, agency, bank, authorisation', te: 'Calm గా అడగండి: పేరు, agency, ఏ bank, authorisation'},
        {k: 'channel', text: 'Short. Clear. Through the correct channel.', te: 'Short గా, clear గా — correct channel లో', color: '#86EFAC'},
      ]} />
    </DemoRoot>
  );
};

/* ------------------------------------------------------------------ §I-3 location request (and OTP never) */

export const LocationDemo: React.FC<DemoProps> = ({ins}) => {
  const {p, on, lin} = useBeats(ins);
  const finger = on('pause') ? interpolate(lin('pause', 20), [0, 1], [0, 1], CLAMP) : 0;
  return (
    <DemoRoot ins={ins}>
      <DemoHeader ins={ins} color={C.amber} />
      <PhoneBody x={150} y={300} w={460} h={660}>
        <div style={{position: 'absolute', top: 64, left: 0, right: 0, height: 70, background: '#075E54', display: 'flex', alignItems: 'center', padding: '0 24px', fontSize: 26, fontWeight: 800}}>Unknown · +91 77XXX XXX09</div>
        <div style={{position: 'absolute', top: 170, left: 24, right: 60, padding: 18, borderRadius: '6px 22px 22px 22px', background: '#1F2C34', fontSize: 28, opacity: p('ask')}}>Share your live location now. Our team is nearby.</div>
        <div style={{position: 'absolute', top: 330, left: 24, right: 24, padding: 18, borderRadius: 18, background: '#12233A', border: `2px solid ${C.cyan}`, fontSize: 28, fontWeight: 800, textAlign: 'center', opacity: p('ask', 10)}}>📍 Share live location</div>
        {/* paused finger */}
        {on('pause') && (
          <div style={{position: 'absolute', top: 420 - finger * 20, left: 200, fontSize: 70, opacity: finger}}>✋</div>
        )}
      </PhoneBody>
      {on('pause') && <div style={{position: 'absolute', left: 680, top: 330, opacity: p('pause')}}><Pill text="⏸ Pause — don’t share just because someone asks" color={C.amber} size={34} /></div>}
      {on('verify') && <div style={{position: 'absolute', left: 680, top: 420, opacity: p('verify')}}><Pill text="Verify identity + bank authorisation officially" color={C.cyan} size={34} /></div>}
      {on('otp') && (
        <div style={{position: 'absolute', left: 680, top: 520, width: 1100, opacity: p('otp')}}>
          <div style={{display: 'flex', gap: 18}}>
            {['OTP', 'PIN', 'Password', 'Card details'].map((t) => (
              <div key={t} style={{flex: 1, padding: '22px 10px', borderRadius: 18, background: '#1A0F12', border: `3px solid ${C.crimson}`, textAlign: 'center', fontFamily: FONT}}>
                <div style={{fontSize: 30, fontWeight: 850, color: '#fff'}}>{t}</div>
                <div style={{fontSize: 34, color: '#FCA5A5', marginTop: 6, letterSpacing: 6}}>🔒 ••••</div>
              </div>
            ))}
          </div>
          <div style={{marginTop: 14, fontFamily: FONT, fontSize: 32, fontWeight: 850, color: '#FCA5A5'}}>Never share these — with anyone</div>
        </div>
      )}
      {on('notfake') && <div style={{position: 'absolute', left: 680, top: 760, opacity: p('notfake')}}><Pill text="A location request alone doesn’t prove someone is fake…" color={C.cyan} size={30} /></div>}
      {on('noinfo') && <div style={{position: 'absolute', left: 680, top: 830, opacity: p('noinfo')}}><Pill text="…but no personal details without verification" color={C.emerald} size={30} /></div>}
      <Caption ins={ins} bottom={30} lines={[
        {k: 'ask', text: 'A WhatsApp message asks for your live location?', te: 'Live location share చేయమని message వచ్చిందా?'},
        {k: 'pause', text: 'First, pause', te: 'ముందు ఆగండి'},
      ]} />
    </DemoRoot>
  );
};

/* ------------------------------------------------------------------ §I-3 a notice link: verify, don't panic-click */

export const LinkCheckDemo: React.FC<DemoProps> = ({ins}) => {
  const {p, on, lin} = useBeats(ins);
  const checks = [{k: 'who', t: 'Who sent it?'}, {k: 'case', t: 'Are there case details?'}, {k: 'court', t: 'Can you verify the court or the lawyer?'}];
  return (
    <DemoRoot ins={ins}>
      <DemoHeader ins={ins} color={C.cyan} />
      <PhoneBody x={150} y={300} w={460} h={660}>
        <div style={{position: 'absolute', top: 90, left: 24, right: 24, padding: 20, borderRadius: 18, background: '#1F2C34', fontSize: 28, opacity: p('msg')}}>
          <div style={{fontSize: 22, color: SUPPORT}}>SMS · VM-NOTICE</div>
          Click to see your legal notice:
          <div style={{color: '#7DD3FC', textDecoration: 'underline', marginTop: 8, fontFamily: MONO, fontSize: 24}}>notice-portal.example/8f3k</div>
        </div>
        {on('pause') && <div style={{position: 'absolute', top: 300, left: 190, fontSize: 70, opacity: lin('pause', 16)}}>✋</div>}
        {on('pause') && <div style={{position: 'absolute', top: 400, left: 24, right: 24, textAlign: 'center', fontSize: 30, fontWeight: 850, color: '#FDE68A', opacity: p('pause')}}>Don’t tap right away</div>}
      </PhoneBody>
      {on('confirm') && (
        <div style={{position: 'absolute', left: 680, top: 320, display: 'flex', gap: 14, alignItems: 'center', opacity: p('confirm')}}>
          <span style={{fontFamily: FONT, fontSize: 32, fontWeight: 800, color: '#fff'}}>Confirm via:</span>
          <Pill text="bank app" color={C.emerald} size={30} />
          <Pill text="official website" color={C.emerald} size={30} />
          <Pill text="verified customer care" color={C.emerald} size={30} />
        </div>
      )}
      {on('electronic') && (
        <div style={{position: 'absolute', left: 680, top: 420, width: 1100, padding: '22px 28px', borderRadius: 20, background: '#0E1628', border: `3px solid ${C.amber}`, opacity: p('electronic')}}>
          <div style={{fontFamily: FONT, fontSize: 34, fontWeight: 850, color: '#fff'}}>Legal notices can also arrive electronically</div>
          <div style={{fontFamily: FONT, fontSize: 30, color: SUPPORT, marginTop: 6}}>WhatsApp or email doesn’t automatically mean fake</div>
        </div>
      )}
      <div style={{position: 'absolute', left: 680, top: 600, width: 1100}}>
        {checks.map((c) => on(c.k) && (
          <div key={c.k} style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14, opacity: p(c.k)}}>
            <div style={{width: 46, height: 46, borderRadius: 12, border: `3px solid ${C.cyan}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.cyan, fontSize: 30, fontWeight: 900}}>?</div>
            <div style={{fontFamily: FONT, fontSize: 34, fontWeight: 800, color: '#fff'}}>{c.t}</div>
          </div>
        ))}
      </div>
      <Caption ins={ins} bottom={30} lines={[
        {k: 'msg', text: '“Click this link to see your legal notice”?', te: '“Legal notice కోసం ఈ link click చేయండి” అంటే?'},
        {k: 'minutes', text: 'Two minutes of checking beats clicking in fear', te: 'భయంతో click చేయడం కంటే 2 నిమిషాలు verify చేయడం better', color: '#86EFAC'},
      ]} />
    </DemoRoot>
  );
};

/* ------------------------------------------------------------------ §I-5 someone at the door */

const Figure: React.FC<{x: number; color: string; o?: number; s?: number}> = ({x, color, o = 1, s = 1}) => (
  <div style={{position: 'absolute', left: x, top: 470, opacity: o, transform: `scale(${s})`, transformOrigin: 'bottom center'}}>
    <div style={{width: 90, height: 90, borderRadius: 45, background: color, margin: '0 auto'}} />
    <div style={{width: 170, height: 230, borderRadius: '80px 80px 20px 20px', background: color, marginTop: 10}} />
  </div>
);

export const DoorstepDemo: React.FC<DemoProps> = ({ins}) => {
  const {p, on} = useBeats(ins);
  const pressure = on('pressure') && !on('danger');
  return (
    <DemoRoot ins={ins}>
      <DemoHeader ins={ins} color={C.cyan} />
      {/* doorway */}
      <div style={{position: 'absolute', left: 520, top: 330, width: 300, height: 480, border: '10px solid #7C5A3A', borderBottom: 'none', borderRadius: '10px 10px 0 0', background: 'linear-gradient(180deg,#1B2433,#111827)'}} />
      <Figure x={300} color="#64748B" o={p('calm')} />
      <Figure x={600} color="#38BDF8" o={p('calm')} />
      {on('trusted') && <Figure x={780} color="#22C55E" o={p('trusted')} s={0.92} />}
      {on('inside') && <div style={{position: 'absolute', left: 470, top: 830, opacity: p('inside')}}><Pill text="No need to invite them in" color={C.cyan} size={28} /></div>}
      {/* requested documents */}
      {on('id') && (
        <div style={{position: 'absolute', left: 1000, top: 330, width: 380, height: 230, borderRadius: 18, background: '#F4F1EA', color: '#1B2433', padding: 22, boxSizing: 'border-box', fontFamily: FONT, opacity: p('id'), boxShadow: '0 30px 60px rgba(0,0,0,0.5)'}}>
          <div style={{fontSize: 28, fontWeight: 900}}>ID card</div>
          <div style={{fontSize: 24, marginTop: 8}}>Name · Agency</div>
          <div style={{position: 'absolute', right: 22, top: 22, width: 90, height: 110, borderRadius: 10, background: '#CBD5E1'}} />
        </div>
      )}
      {on('letter') && (
        <div style={{position: 'absolute', left: 1420, top: 330, width: 380, height: 230, borderRadius: 18, background: '#F4F1EA', color: '#1B2433', padding: 22, boxSizing: 'border-box', fontFamily: FONT, opacity: p('letter'), boxShadow: '0 30px 60px rgba(0,0,0,0.5)'}}>
          <div style={{fontSize: 28, fontWeight: 900}}>Bank authorisation letter</div>
          <div style={{fontSize: 24, marginTop: 8}}>for account •••• 4821?</div>
        </div>
      )}
      {on('safe') && !on('danger') && <div style={{position: 'absolute', left: 1000, top: 600, opacity: p('safe')}}><Pill text="Talk only where you feel safe" color={C.emerald} size={30} /></div>}
      {pressure && (
        <div style={{position: 'absolute', left: 1000, top: 660, display: 'flex', flexDirection: 'column', gap: 12, opacity: p('pressure')}}>
          {['“Sign right now.”', '“Give me cash.”', '“Give me your phone.”'].map((t, i) => (
            <div key={t} style={{padding: '12px 20px', borderRadius: '20px 20px 20px 6px', background: '#2A1416', border: `3px solid ${C.crimson}`, fontFamily: FONT, fontSize: 30, fontWeight: 800, color: '#fff', opacity: p('pressure', i * 8)}}>{t}</div>
          ))}
        </div>
      )}
      {on('read') && !on('danger') && <div style={{position: 'absolute', left: 1440, top: 660, width: 360, opacity: p('read')}}><Pill text="Read it first" color={C.cyan} size={30} />{on('advice') && <div style={{marginTop: 12, opacity: p('advice')}}><Pill text="Sign only after advice" color={C.emerald} size={30} /></div>}</div>}
      {on('danger') && (
        <div style={{position: 'absolute', left: 1000, top: 640, width: 800, padding: '24px 28px', borderRadius: 20, background: '#2A1416', border: `4px solid ${C.crimson}`, opacity: p('danger')}}>
          <div style={{fontFamily: FONT, fontSize: 32, color: '#FCA5A5', fontWeight: 800}}>Force · physical threat · immediate danger</div>
          <div style={{fontFamily: FONT, fontSize: 64, fontWeight: 900, color: '#fff', marginTop: 6}}>Call 112</div>
          <div style={{fontFamily: FONT, fontSize: 28, color: SUPPORT}}>emergency branch only — your safety first</div>
        </div>
      )}
      <Caption ins={ins} bottom={30} lines={[
        {k: 'calm', text: 'Someone at your door? First, stay calm', te: 'ఎవరైనా ఇంటికి వస్తే ముందు calm గా ఉండండి'},
        {k: 'id', text: 'Ask for ID and the bank’s authorisation letter', te: 'ID card, bank authorisation letter అడగండి'},
        {k: 'pressure', text: 'Don’t react to instant pressure', te: 'ఇలాంటి pressure కి వెంటనే react అవ్వకండి', color: '#FCA5A5'},
      ]} />
    </DemoRoot>
  );
};

/* ------------------------------------------------------------------ §I-6 evidence into a complaint record */

export const EvidenceDemo: React.FC<DemoProps> = ({ins}) => {
  const {p, on, lin} = useBeats(ins);
  const items = [
    {k: 'dates', t: '📅 Date & time', x: 160},
    {k: 'numbers', t: '📞 Phone number', x: 560},
    {k: 'screens', t: '🖼 Screenshot', x: 960},
    {k: 'preserve', t: '📝 What was said', x: 1360},
  ];
  const filed = on('specific') ? lin('specific', 30, 30) : 0;
  const count = items.filter((it) => on(it.k)).length;
  return (
    <DemoRoot ins={ins}>
      <DemoHeader ins={ins} color={C.violet} />
      {items.map((it, i) => on(it.k) && (
        <div key={it.k} style={{position: 'absolute', left: it.x + (1460 - it.x) * filed, top: 340 + 420 * filed, width: 360, padding: '26px 24px', borderRadius: 20, background: '#0E1628', border: `3px solid ${alpha(C.violet, 0.8)}`, fontFamily: FONT, fontSize: 34, fontWeight: 850, color: '#fff', opacity: p(it.k) * (1 - filed * 0.9), transform: `scale(${1 - 0.5 * filed})`}}>{it.t}</div>
      ))}
      {on('rather') && (
        <div style={{position: 'absolute', left: 160, top: 560, width: 1180, opacity: p('rather')}}>
          <div style={{padding: '18px 26px', borderRadius: 18, background: '#1A1220', border: `3px solid ${C.crimson}`, fontFamily: FONT, fontSize: 32, color: '#fff'}}>✕ “They called many times.”</div>
          {on('specific') && <div style={{marginTop: 18, padding: '18px 26px', borderRadius: 18, background: '#0F2A1D', border: `3px solid ${C.emerald}`, fontFamily: FONT, fontSize: 32, color: '#fff', opacity: p('specific')}}>✓ “On 12 Oct, 9:40 pm, +91 98XXX XXX21 called and said …”</div>}
        </div>
      )}
      <Folder x={1460} y={720} label="Complaint record" count={count} color={C.violet} o={p('dates', 10)} />
      <Caption ins={ins} bottom={30} lines={[
        {k: 'dates', text: 'Harassed? Keep the evidence', te: 'Dates, numbers, screenshots save చేయండి'},
        {k: 'rather', text: 'Specific details make your complaint clearer', te: 'ఈ date, ఈ time, ఈ number నుంచి ఇలా మాట్లాడారు', color: '#86EFAC'},
      ]} />
    </DemoRoot>
  );
};

/* ------------------------------------------------------------------ §I-7 the complaint path */

export const ComplaintDemo: React.FC<DemoProps> = ({ins}) => {
  const {p, on, lin} = useBeats(ins);
  const box = (k: string, x: number, y: number, title: string, sub: string, color: string, w = 440) => (
    <div style={{position: 'absolute', left: x, top: y, width: w, opacity: on(k) ? p(k) : 0.12}}>
      <div style={{borderRadius: 22, background: '#0E1628', border: `3px solid ${color}`, padding: '22px 26px'}}>
        <div style={{fontFamily: FONT, fontSize: 38, fontWeight: 900, color: '#fff'}}>{title}</div>
        <div style={{fontFamily: FONT, fontSize: 28, color: SUPPORT, marginTop: 6}}>{sub}</div>
      </div>
    </div>
  );
  return (
    <DemoRoot ins={ins}>
      <DemoHeader ins={ins} color={C.violet} />
      {box('bank', 140, 340, 'Bank grievance team', 'written complaint about the agency’s conduct', C.violet)}
      <Arrow x1={600} y1={420} x2={700} y2={420} t={on('ref') ? lin('ref', 12) : 0} color={C.violet} />
      {box('ref', 720, 340, 'Reference number', 'save it — CMP-20931 (example)', C.violet)}
      {/* conditions */}
      {on('rejected') && (
        <div style={{position: 'absolute', left: 140, top: 560, display: 'flex', gap: 14, flexWrap: 'wrap', width: 1040, opacity: p('rejected')}}>
          <Pill text="rejected" color={C.amber} size={30} />
          <Pill text="unsatisfactory reply" color={C.amber} size={30} />
          {on('noreply') && <Pill text="no reply within 30 days" color={C.amber} size={30} style={{opacity: p('noreply')}} />}
        </div>
      )}
      <Arrow x1={1180} y1={420} x2={1290} y2={420} t={on('ombudsman') ? lin('ombudsman', 12) : 0} color={C.violet} dashed />
      {box('ombudsman', 1300, 340, 'RBI Ombudsman', 'applicable process — if eligible', C.emerald, 480)}
      {on('cms') && (
        <div style={{position: 'absolute', left: 1300, top: 560, opacity: p('cms')}}>
          <div style={{fontFamily: MONO, fontSize: 44, fontWeight: 800, color: '#86EFAC'}}>cms.rbi.org.in</div>
          <div style={{fontFamily: FONT, fontSize: 28, color: SUPPORT}}>RBI Complaint Management System</div>
        </div>
      )}
      <Caption ins={ins} bottom={30} lines={[
        {k: 'bank', text: 'Write to the bank’s grievance team first', te: 'ముందు bank grievance team కి written complaint'},
        {k: 'rejected', text: 'Rejected, unsatisfactory, or no reply in 30 days?', te: 'Reject చేసినా, reply బాలేకపోయినా, 30 రోజుల్లో reply రాకపోయినా'},
        {k: 'ombudsman', text: 'You may escalate through the RBI Ombudsman process', te: 'RBI Ombudsman process ద్వారా escalate చేయొచ్చు', color: '#86EFAC'},
      ]} />
      <BeatSfx ins={ins} k="ref" name="stamp_heavy" volume={0.18} />
    </DemoRoot>
  );
};

/* ------------------------------------------------------------------ §J phone settings, one verified channel open */

export const PhoneSettingsDemo: React.FC<DemoProps> = ({ins}) => {
  const {p, on, lin} = useBeats(ins);
  const row = (k: string, label: string, y: number) => (
    <div style={{position: 'absolute', left: 24, right: 24, top: y, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderRadius: 16, background: '#111A2E', opacity: on(k) ? 1 : 0.35}}>
      <div style={{fontSize: 26, fontWeight: 800, width: 270}}>{label}</div>
      <Toggle on={on(k) ? Math.min(1, lin(k, 10)) : 0} />
    </div>
  );
  return (
    <DemoRoot ins={ins}>
      <DemoHeader ins={ins} color={C.emerald} />
      <PhoneBody x={150} y={290} w={460} h={680}>
        <div style={{position: 'absolute', top: 60, left: 24, fontSize: 30, fontWeight: 900}}>Call & message settings</div>
        {row('block', 'Block known abusive numbers', 120)}
        {row('spam', 'Spam filter', 210)}
        {row('silence', 'WhatsApp: silence unknown callers', 300)}
        {/* an unknown call is silenced, the verified bank stays */}
        {on('silence') && <div style={{position: 'absolute', left: 24, right: 24, top: 410, padding: 16, borderRadius: 16, background: '#1A1220', fontSize: 24, opacity: p('silence', 10)}}>🔕 Unknown caller — muted</div>}
        {on('keep') && <div style={{position: 'absolute', left: 24, right: 24, top: 490, padding: 16, borderRadius: 16, background: '#0F2A1D', border: `2px solid ${C.emerald}`, fontSize: 24, opacity: p('keep')}}>📞 Bank A (verified) — rings</div>}
        {on('email') && <div style={{position: 'absolute', left: 24, right: 24, top: 570, padding: 16, borderRadius: 16, background: '#0F2A1D', border: `2px solid ${C.emerald}`, fontSize: 24, opacity: p('email')}}>✉ Bank A email — open</div>}
      </PhoneBody>
      <IllusTag text="Example interface — settings vary by phone" style={{top: 250}} />
      {on('letters') && <div style={{position: 'absolute', left: 700, top: 320, opacity: p('letters')}}><Pill text="📬 Collect official letters too" color={C.emerald} size={32} /></div>}
      {on('miss') && (
        <div style={{position: 'absolute', left: 700, top: 420, width: 1100, opacity: p('miss')}}>
          <div style={{fontFamily: FONT, fontSize: 34, fontWeight: 850, color: '#FDE68A'}}>Silencing unknowns can also hide:</div>
          <div style={{display: 'flex', gap: 14, marginTop: 14}}>
            <Pill text="job calls" color={C.amber} size={30} />
            <Pill text="hospital calls" color={C.amber} size={30} />
            <Pill text="delivery calls" color={C.amber} size={30} />
          </div>
        </div>
      )}
      {on('fixed') && (
        <div style={{position: 'absolute', left: 700, top: 600, width: 1100, padding: '24px 28px', borderRadius: 20, background: '#0E1628', border: `3px solid ${C.cyan}`, opacity: p('fixed')}}>
          <div style={{fontFamily: FONT, fontSize: 36, fontWeight: 850, color: '#fff'}}>⏰ One fixed time a day — e.g. 7:00 pm</div>
          <div style={{fontFamily: FONT, fontSize: 30, color: SUPPORT, marginTop: 6}}>check genuine bank messages, reply to those that need it</div>
        </div>
      )}
      <Caption ins={ins} bottom={30} lines={[
        {k: 'settings', text: 'Calls disrupting your day? Use your phone’s settings', te: 'Phone settings వాడండి'},
        {k: 'keep', text: 'But keep one verified channel open', te: 'కానీ ఒక verified channel open గా ఉంచండి', color: '#86EFAC'},
        {k: 'routine', text: 'A routine stops calls draining you all day', te: 'రోజంతా calls తో emotionally drain అవ్వకుండా'},
      ]} />
    </DemoRoot>
  );
};
