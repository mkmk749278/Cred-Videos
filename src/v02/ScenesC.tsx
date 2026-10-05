import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Backdrop, Count, DISPLAY, Flare, Glass, Headline, K, Kicker, NUM, S, Sfx, Shot, TOTAL, W, eout, lin, rgba, useSp, POP, SMOOTH} from './core';
import {Badge, Phone} from './objects';

/* ================================================================== SCENE 8 — three hidden traps */

const TrapTitle: React.FC<{n: number; title: string; at: number; color: string}> = ({n, title, at, color}) => {
  const sp = useSp();
  const p = sp(at, POP);
  return (
    <div style={{position: 'absolute', left: 120, top: 90, display: 'flex', alignItems: 'center', gap: 26, transform: `translateX(${(1 - p) * -80}px)`, opacity: p}}>
      <div style={{width: 110, height: 110, borderRadius: 28, background: `linear-gradient(135deg, ${color}, ${rgba(color, 0.5)})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DISPLAY, fontWeight: 950, fontSize: 70, color: '#0B0F17', boxShadow: `0 0 50px ${rgba(color, 0.5)}`}}>{n}</div>
      <div>
        <div style={{fontFamily: NUM, fontSize: 26, letterSpacing: 7, color, fontWeight: 700}}>TRAP {n}</div>
        <div style={{fontFamily: DISPLAY, fontWeight: 950, fontSize: 76, color: '#fff', letterSpacing: -2}}>{title}</div>
      </div>
    </div>
  );
};

export const Scene8: React.FC = () => {
  const f = useCurrentFrame();
  const sp = useSp();
  const intro = S(61);
  const t1 = S(62);
  const t2 = S(66);
  const t3 = S(69);
  // trap 1 bar: example limit 40,000
  const think = lin(f, W('w63_5000'), W('w63_5000') + 14);
  const block = eout(lin(f, W('w64_30000') - 4, W('w64_30000') + 20));
  const used = 5000 * think * (1 - block) + 30000 * block;
  const util = used / 40000;
  const cibil = lin(f, S(65, 0.4), S(65, 0.4) + 30);
  return (
    <>
      {/* intro: three cards */}
      <Shot from={intro - 4} to={t1 - 4} push={0.08} seed={14}>
        <Backdrop plate="red" tint="#2A0F18" />
        <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          <Kicker text="what most creators don't tell you" at={intro} color={K.loss} style={{fontSize: 30}} />
          <Headline at={intro + 4} size={130} text={<>3 HIDDEN <span style={{color: K.loss}}>TRAPS</span></>} style={{marginTop: 16}} />
          <div style={{display: 'flex', gap: 40, marginTop: 50}}>
            {['Credit limit block', 'First bill shock', 'Return trap'].map((t, i) => {
              const p = sp(intro + 18 + i * 8, POP);
              return (
                <div key={i} style={{width: 380, padding: '26px 30px', borderRadius: 26, background: 'rgba(255,255,255,0.06)', border: `2px solid ${rgba(K.loss, 0.6)}`, transform: `translateY(${(1 - p) * 60}px) rotate(${(i - 1) * 2}deg)`, opacity: p, boxShadow: `0 30px 60px rgba(0,0,0,0.5)`}}>
                  <div style={{fontFamily: NUM, fontSize: 24, color: K.loss, letterSpacing: 5}}>TRAP {i + 1}</div>
                  <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 40, color: '#fff', marginTop: 6}}>{t}</div>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
        <Sfx at={intro} name="warning_pulse" volume={0.35} />
      </Shot>

      {/* trap 1: credit limit block */}
      <Shot from={t1 - 4} to={t2 - 4} push={0.04} seed={15}>
        <Backdrop plate="cool" tint="#121B33" />
        <TrapTitle n={1} title="Credit limit block" at={t1} color={K.amz} />
        <div style={{position: 'absolute', left: 120, top: 330, width: 1680}}>
          <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: NUM, fontSize: 26, color: K.soft, letterSpacing: 2}}>
            <span>CARD CREDIT LIMIT (example)</span>
            <span>₹40,000</span>
          </div>
          <div style={{position: 'relative', height: 110, marginTop: 14, borderRadius: 24, background: 'rgba(255,255,255,0.07)', border: '2px solid rgba(255,255,255,0.15)', overflow: 'hidden'}}>
            <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${util * 100}%`, background: block > 0.1 ? `linear-gradient(90deg, ${K.loss}, #FF8A5B)` : `linear-gradient(90deg, ${K.cyan}, #7BE0FF)`, boxShadow: `0 0 40px ${rgba(block > 0.1 ? K.loss : K.cyan, 0.5)}`}} />
            <div style={{position: 'absolute', left: 30, top: 0, bottom: 0, display: 'flex', alignItems: 'center', fontFamily: DISPLAY, fontWeight: 900, fontSize: 44, color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.6)'}}>
              {block > 0.1 ? <>₹30,000 BLOCKED on day 1</> : think > 0 ? <>“Only ₹5,000 a month…”</> : null}
            </div>
            {/* hatch on blocked part */}
            <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${util * 100}%`, backgroundImage: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.18) 0 14px, transparent 14px 28px)', opacity: block}} />
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 16, fontFamily: DISPLAY, fontWeight: 800, fontSize: 36}}>
            <span style={{color: K.soft}}>
              Available: <span style={{color: '#fff'}}>
                <Count a={W('w64_30000') - 4} b={W('w64_30000') + 20} from={40000 - 5000 * think} to={10000} />
              </span>
            </span>
            <span style={{color: block > 0.5 ? K.loss : K.soft}}>Utilisation {Math.round(util * 100)}%</span>
          </div>
        </div>
        {/* CIBIL gauge */}
        <div style={{position: 'absolute', left: 120, top: 640, width: 1680, display: 'flex', alignItems: 'center', gap: 60, opacity: lin(f, S(65), S(65) + 10)}}>
          <svg width={420} height={240} viewBox="0 0 420 240">
            <defs>
              <linearGradient id="cib" x1="0" x2="1">
                <stop offset="0" stopColor="#FF4D5E" />
                <stop offset="0.5" stopColor="#F6C453" />
                <stop offset="1" stopColor="#21E59B" />
              </linearGradient>
            </defs>
            <path d="M 30 220 A 180 180 0 0 1 390 220" stroke="url(#cib)" strokeWidth={34} fill="none" strokeLinecap="round" />
            {(() => {
              const v = 0.82 - 0.22 * eout(cibil) + Math.sin(f * 0.8) * 0.004 * cibil;
              const a = Math.PI * (1 - v);
              return (
                <>
                  <line x1={210} y1={220} x2={210 + 150 * Math.cos(a)} y2={220 - 150 * Math.sin(a)} stroke="#fff" strokeWidth={8} strokeLinecap="round" />
                  <circle cx={210} cy={220} r={16} fill="#fff" />
                </>
              );
            })()}
          </svg>
          <div>
            <div style={{fontFamily: NUM, fontSize: 26, letterSpacing: 5, color: K.soft}}>CIBIL SCORE</div>
            <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 64, color: '#fff', lineHeight: 1.1}}>
              High utilisation → score <span style={{color: K.loss}}>may drop ↓</span>
            </div>
          </div>
        </div>
        <Sfx at={W('w64_30000')} name="block_slam" volume={0.4} />
        <Sfx at={S(65, 0.4)} name="gauge_drop" volume={0.3} />
      </Shot>

      {/* trap 2: first month bill shock */}
      <Shot from={t2 - 4} to={t3 - 4} push={0.04} seed={16}>
        <Backdrop plate="red" tint="#22101A" />
        <TrapTitle n={2} title="First-month bill shock" at={t2} color={K.loss} />
        {/* statement paper */}
        <div style={{position: 'absolute', left: 300, top: 300, width: 1320, height: 600, borderRadius: 18, background: 'linear-gradient(170deg, #FBFAF6, #EDEAE2)', boxShadow: '0 60px 120px rgba(0,0,0,0.65)', transform: `perspective(2200px) rotateX(${10 - 8 * eout(lin(f, t2, t2 + 30))}deg) rotateZ(-1.2deg)`, padding: '36px 50px', fontFamily: DISPLAY, color: '#1B2433'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
            <div style={{fontWeight: 900, fontSize: 40}}>Credit card statement</div>
            <div style={{fontFamily: NUM, fontSize: 24, color: '#6b7280'}}>Month 1 · Card •••• 4821</div>
          </div>
          <div style={{borderTop: '2px solid #d6d3cb', margin: '22px 0'}} />
          <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 34, padding: '10px 0'}}>
            <span>EMI 1 of 6 (what you expect)</span>
            <span style={{position: 'relative', fontFamily: NUM, fontWeight: 700}}>
              ₹5,000
              <span style={{position: 'absolute', left: -8, right: -8, top: '52%', height: 6, background: K.loss, transform: `scaleX(${lin(f, W('w67_5000') + 10, W('w67_5000') + 20)})`, transformOrigin: '0 50%'}} />
            </span>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 34, padding: '10px 0', color: '#B42318', opacity: lin(f, S(68), S(68) + 10)}}>
            <span>+ Processing fee + GST</span>
            <span style={{fontFamily: NUM, fontWeight: 700}}>charged in month 1</span>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 34, padding: '10px 0', color: '#B42318', opacity: lin(f, S(68, 0.25), S(68, 0.25) + 10)}}>
            <span>+ GST on interest</span>
            <span style={{fontFamily: NUM, fontWeight: 700}}>monthly</span>
          </div>
          <div style={{borderTop: '3px dashed #c9c5bb', margin: '18px 0'}} />
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', opacity: lin(f, W('w68_5417'), W('w68_5417') + 6)}}>
            <span style={{fontWeight: 900, fontSize: 44}}>Month-1 debit</span>
            <span style={{fontWeight: 950, fontSize: 96, color: '#B42318', letterSpacing: -2}}>≈ ₹5,417</span>
          </div>
        </div>
        <Flare at={W('w68_5417')} x={1350} y={800} color={K.loss} />
        <Sfx at={t2 + 4} name="pages_flip" volume={0.3} />
        <Sfx at={W('w68_5417')} name="alert.wav" volume={0.4} />
      </Shot>

      {/* trap 3: the return trap */}
      <Shot from={t3 - 4} to={S(75) - 4} push={0.03} seed={17}>
        <Backdrop plate="cool" tint="#131A30" />
        <TrapTitle n={3} title="The return trap" at={t3} color={K.violet} />
        {(() => {
          const pA = sp(S(70), SMOOTH);
          const pB = sp(S(71), SMOOTH);
          return (
            <>
              <Phone w={300} ry={14} style={{left: 150, top: 270, opacity: pA, transform: `perspective(2600px) rotateY(14deg) translateY(${(1 - pA) * 100}px)`}}>
                <div style={{position: 'absolute', inset: 0, background: '#F4F6FA'}} />
                <div style={{position: 'absolute', left: 26, right: 26, top: 90, fontWeight: 800, fontSize: 30, color: '#121826'}}>Your orders</div>
                <div style={{position: 'absolute', left: 18, right: 18, top: 150, padding: 18, borderRadius: 20, background: '#fff', boxShadow: '0 6px 16px rgba(0,0,0,0.08)'}}>
                  <div style={{fontSize: 26, fontWeight: 800, color: '#121826'}}>Smartphone 5G</div>
                  <div style={{fontSize: 22, color: '#5b6577', marginTop: 4}}>Returned</div>
                  <div style={{marginTop: 16, display: 'flex', alignItems: 'center', gap: 10}}>
                    <Badge ok at={S(70, 0.45)} size={40} />
                    <span style={{fontSize: 26, fontWeight: 900, color: '#0A7A44', lineHeight: 1.1}}>Refund completed</span>
                  </div>
                </div>
              </Phone>
              <div style={{position: 'absolute', left: 150, top: 905, width: 300, textAlign: 'center', fontFamily: NUM, fontSize: 22, color: K.soft, opacity: pA}}>SHOPPING APP</div>
              <Phone w={300} ry={-14} dark style={{left: 560, top: 270, opacity: pB, transform: `perspective(2600px) rotateY(-14deg) translateY(${(1 - pB) * 100}px)`}}>
                <div style={{position: 'absolute', left: 26, right: 26, top: 90, fontWeight: 800, fontSize: 30, color: '#fff'}}>Card · EMI</div>
                <div style={{position: 'absolute', left: 18, right: 18, top: 150, padding: 18, borderRadius: 20, background: '#182033', border: `2px solid ${rgba(K.loss, 0.6)}`}}>
                  <div style={{fontSize: 22, color: K.soft}}>EMI loan · 6 months</div>
                  <div style={{fontSize: 40, fontWeight: 900, color: K.loss, marginTop: 6, opacity: 0.6 + 0.4 * Math.abs(Math.sin(f * 0.15))}}>● ACTIVE</div>
                  <div style={{fontSize: 20, color: K.soft, marginTop: 10}}>Interest still running</div>
                </div>
                <div style={{position: 'absolute', left: 18, right: 18, top: 370, padding: 18, borderRadius: 20, background: '#182033', opacity: lin(f, S(71, 0.3), S(71, 0.3) + 10)}}>
                  <div style={{fontSize: 22, color: K.soft}}>Refund arrives as</div>
                  <div style={{fontSize: 30, fontWeight: 900, color: '#fff', marginTop: 4}}>credit balance</div>
                </div>
              </Phone>
              <div style={{position: 'absolute', left: 560, top: 905, width: 300, textAlign: 'center', fontFamily: NUM, fontSize: 22, color: K.soft, opacity: pB}}>BANK APP</div>
              <div style={{position: 'absolute', left: 455, top: 500, width: 100, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 950, fontSize: 80, color: K.loss, opacity: lin(f, S(71, 0.5), S(71, 0.5) + 8)}}>≠</div>
            </>
          );
        })()}
        {/* rules column */}
        <div style={{position: 'absolute', left: 980, top: 290, width: 820}}>
          <Glass accent={K.win} style={{position: 'relative', padding: '22px 30px', opacity: lin(f, S(72), S(72) + 10)}}>
            <div style={{fontFamily: NUM, fontSize: 22, letterSpacing: 4, color: K.win}}>SBI CARD</div>
            <div style={{fontFamily: DISPLAY, fontWeight: 850, fontSize: 36, color: '#fff', marginTop: 4}}>
              Full refund within <span style={{color: K.win}}>45 days</span> → EMI auto-closes
            </div>
          </Glass>
          <Glass accent={K.amz} style={{position: 'relative', marginTop: 22, padding: '22px 30px', opacity: lin(f, S(73), S(73) + 10)}}>
            <div style={{fontFamily: NUM, fontSize: 22, letterSpacing: 4, color: K.amz}}>ICICI / AXIS</div>
            <div style={{fontFamily: DISPLAY, fontWeight: 850, fontSize: 36, color: '#fff', marginTop: 4}}>
              Call customer care within <span style={{color: K.amz}}>15 days</span> to cancel the EMI yourself
            </div>
            {/* ringing phone icon */}
            <svg style={{position: 'absolute', right: 26, top: 22, transform: `rotate(${f >= S(73) && f < S(73) + 60 ? Math.sin(f * 1.6) * 14 : 0}deg)`}} width={56} height={56} viewBox="0 0 24 24">
              <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1z" fill={K.amz} />
            </svg>
          </Glass>
          <Glass accent={K.loss} style={{position: 'relative', marginTop: 22, padding: '22px 30px', opacity: lin(f, S(74), S(74) + 10)}}>
            <div style={{fontFamily: NUM, fontSize: 22, letterSpacing: 4, color: K.loss}}>OTHERWISE</div>
            <div style={{fontFamily: DISPLAY, fontWeight: 850, fontSize: 36, color: '#fff', marginTop: 4}}>Interest keeps getting charged every month</div>
            <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 44, color: K.loss, marginTop: 6, opacity: lin(f, W('w74_3pct'), W('w74_3pct') + 8)}}>+ 3% pre-closure penalty</div>
          </Glass>
          <div style={{fontFamily: NUM, fontSize: 18, color: K.dim, marginTop: 14, opacity: lin(f, S(72), S(72) + 10)}}>Bank rules as narrated · check your card's EMI cancellation terms</div>
        </div>
        <Sfx at={S(70, 0.45)} name="payment_success" volume={0.3} />
        <Sfx at={S(71, 0.5)} name="alert.wav" volume={0.35} />
        <Sfx at={S(73)} name="dialer_ring" volume={0.18} />
        <Sfx at={W('w74_3pct')} name="stamp_heavy" volume={0.3} />
      </Shot>
    </>
  );
};

/* ================================================================== SCENE 9 — three rules + outro */

const Rule: React.FC<{n: number; at: number; tickAt: number; head: React.ReactNode; action: React.ReactNode; tag: string; color: string}> = ({n, at, tickAt, head, action, tag, color}) => {
  const f = useCurrentFrame();
  const sp = useSp();
  const p = sp(at, POP);
  return (
    <div style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 30, padding: '24px 34px', borderRadius: 28, background: 'linear-gradient(160deg, rgba(255,255,255,0.11), rgba(255,255,255,0.03))', border: `2px solid ${f >= tickAt ? rgba(color, 0.7) : 'rgba(255,255,255,0.14)'}`, boxShadow: f >= tickAt ? `0 0 50px ${rgba(color, 0.25)}` : '0 20px 40px rgba(0,0,0,0.4)', transform: `translateX(${(1 - p) * 120}px)`, opacity: p, marginTop: 24}}>
      <div style={{fontFamily: DISPLAY, fontWeight: 950, fontSize: 72, color: rgba('#ffffff', 0.25), width: 60}}>{n}</div>
      <div style={{flex: 1}}>
        <div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 36, color: K.soft}}>{head}</div>
        <div style={{fontFamily: DISPLAY, fontWeight: 950, fontSize: 52, color: '#fff', marginTop: 2}}>{action}</div>
      </div>
      <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 34, color, padding: '10px 18px', borderRadius: 14, background: rgba(color, 0.14), opacity: lin(f, tickAt, tickAt + 8)}}>{tag}</div>
      <Badge ok at={tickAt} size={74} />
    </div>
  );
};

export const Scene9: React.FC = () => {
  const f = useCurrentFrame();
  const sp = useSp();
  const a = S(75);
  const end = S(79);
  return (
    <>
      <Shot from={a - 4} to={end - 4} push={0.03} seed={18}>
        <Backdrop plate="green" tint="#0E2A24" />
        <div style={{position: 'absolute', left: 160, top: 90, width: 1600}}>
          <Kicker text="before you tap buy now" at={a} color={K.win} style={{fontSize: 30}} />
          <Headline at={a + 4} size={84} text={<>Remember these <span style={{color: K.win}}>3 rules</span></>} />
          <div style={{marginTop: 20}}>
            <Rule n={1} at={S(76)} tickAt={S(76, 0.75)} head="Amazon + SBI Card + EMI bonus offer" action="Take 6-month No Cost EMI" tag="save ₹449" color={K.win} />
            <Rule n={2} at={S(77)} tickAt={S(77, 0.75)} head="Flipkart + Axis / ICICI card" action="Skip EMI — pay in full" tag="avoid −₹336" color={K.cyan} />
            <Rule n={3} at={S(78)} tickAt={S(78, 0.7)} head="5% cashback card" action="Always pay in full" tag="save ₹1,500" color={K.gold} />
          </div>
        </div>
        <Sfx at={S(76, 0.75)} name="tactile_click" volume={0.35} />
        <Sfx at={S(77, 0.75)} name="tactile_click" volume={0.35} />
        <Sfx at={S(78, 0.7)} name="tactile_click" volume={0.35} />
      </Shot>
      <Shot from={end - 4} to={TOTAL + 30} fout={0} push={0.05} seed={19}>
        <Backdrop plate="warm" tint="#1C1A30" />
        <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{position: 'relative'}}>
            <Headline at={end} size={100} text={<>Don't fall for the <span style={{color: K.loss}}>small monthly amount</span></>} style={{textAlign: 'center', width: 1500}} />
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 30, marginTop: 40, opacity: lin(f, end + 30, end + 40)}}>
            <div style={{position: 'relative', fontFamily: DISPLAY, fontWeight: 950, fontSize: 70, color: K.soft}}>
              “only ₹5,000/month”
              <div style={{position: 'absolute', left: -10, right: -10, top: '52%', height: 9, background: K.loss, transform: `scaleX(${lin(f, end + 44, end + 54)})`, transformOrigin: '0 50%'}} />
            </div>
            <div style={{fontFamily: DISPLAY, fontWeight: 950, fontSize: 70, color: '#fff', opacity: lin(f, end + 56, end + 64)}}>→ do the full math</div>
          </div>
          {/* share */}
          <div style={{marginTop: 70, display: 'flex', alignItems: 'center', gap: 24, opacity: lin(f, S(80), S(80) + 10), transform: `scale(${0.8 + 0.2 * sp(S(80), POP)})`}}>
            <div style={{width: 96, height: 96, borderRadius: 30, background: `linear-gradient(135deg, ${K.win}, #0FB57A)`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <svg width={54} height={54} viewBox="0 0 24 24" fill="none" stroke="#04150E" strokeWidth={2.4} strokeLinecap="round">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
              </svg>
            </div>
            <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 56, color: '#fff'}}>Share this with your friends</div>
          </div>
          <div style={{position: 'absolute', left: 160, right: 160, bottom: 150, textAlign: 'center', fontFamily: NUM, fontSize: 20, lineHeight: 1.5, color: 'rgba(255,255,255,0.6)', opacity: lin(f, S(80), S(80) + 20)}}>
            Example on a ₹30,000 phone using the offer caps, fees and bank rules as narrated for the festive sales (Oct 2026). Offers and charges change and vary by card — always check the checkout page and your bank's T&amp;C. Not affiliated with Amazon, Flipkart or any bank. Not financial advice.
          </div>
        </AbsoluteFill>
        <Sfx at={end} name="title_hit" volume={0.25} />
        <Sfx at={S(80)} name="sting.wav" volume={0.45} />
      </Shot>
      <Flare at={S(76, 0.75)} x={1650} y={420} color={K.win} size={600} />
    </>
  );
};
