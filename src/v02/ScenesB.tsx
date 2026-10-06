import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Backdrop, camTransform, ContactShadow, Count, DISPLAY, Flare, Glass, Headline, K, Kicker, NUM, S, Sfx, Shot, W, eout, lin, rgba, rs, useSp, POP, SMOOTH} from './core';
import {Badge, CreditCard, Receipt, RLine, SKINS, Stamp} from './objects';
import {RealCrop} from './real';

/* ================================================================== SCENE 5 / 6 — the receipts */

type MathCfg = {
  from: number;
  to: number;
  plate: 'amz' | 'fk';
  tint: string;
  platform: string;
  bankName: string;
  accent: string;
  intro: number;
  cards: React.ReactNode;
  full: RLine[];
  emi: RLine[];
  verdict: React.ReactNode;
  side: React.ReactNode;
  sfx: React.ReactNode;
  emiSub: string;
  cam: {f: number; x: number; y: number; s: number}[];
  real?: React.ReactNode;
};

const MathScene: React.FC<MathCfg> = (c) => {
  const f = useCurrentFrame();
  const sp = useSp();
  const introP = sp(c.intro, SMOOTH);
  // cards fly in large, then dock top-right
  const dock = eout(lin(f, c.full[0].at - 30, c.full[0].at));
  return (
    <Shot from={c.from} to={c.to} push={0.025} seed={c.plate === 'amz' ? 11 : 12}>
      <Backdrop plate={c.plate} tint={c.tint} bokeh={0.32} />
      {/* desk surface */}
      <div style={{position: 'absolute', left: -100, right: -100, top: 780, bottom: -200, background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(0,0,0,0.5))', transform: 'perspective(1200px) rotateX(60deg)', transformOrigin: '50% 0%'}} />
      {/* the two receipts + side panels, under a camera that follows the printing */}
      <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transformOrigin: '0 0', transform: camTransform(f, c.cam)}}>
        <div style={{opacity: dock}}>
          <Receipt x={140} y={230} w={560} title="OPTION 1 · FULL PAYMENT" sub="one swipe" lines={c.full} from={c.full[0].at} accent="#1b1d22" maxH={600} />
          <Receipt x={770} y={230} w={640} title="OPTION 2 · NO COST EMI" sub={c.emiSub} lines={c.emi} from={c.emi[0].at} accent={c.plate === 'amz' ? '#B85C00' : '#1747A6'} maxH={730} />
        </div>
        {c.side}
        {c.verdict}
      </div>
      {/* top shade so zoomed receipts slide under the title */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 215, background: 'linear-gradient(180deg, rgba(4,6,12,0.92) 0%, rgba(4,6,12,0.7) 70%, transparent 100%)', opacity: dock}} />
      {/* title */}
      <div style={{position: 'absolute', left: 120, top: 70 - dock * 0, opacity: introP}}>
        <Kicker text={`${c.platform} × ${c.bankName}`} at={c.intro} color={c.accent} style={{fontSize: 30}} />
        <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 52, color: '#fff', marginTop: 6, opacity: dock}}>₹30,000 phone · two ways to pay</div>
      </div>
      <div style={{position: 'absolute', left: 140, top: 178, fontFamily: NUM, fontSize: 18, color: 'rgba(255,255,255,0.5)', opacity: lin(f, c.full[0].at - 30, c.full[0].at)}}>Figures as narrated for a ₹30,000 example · offer caps, fees and rules can change — check your checkout page and card T&amp;C</div>
      {/* real banner for this platform × bank, during the intro */}
      {c.real && <div style={{position: 'absolute', inset: 0, opacity: introP * (1 - dock)}}>{c.real}</div>}
      {/* hero cards: big in the centre during the intro, then docked */}
      <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: `translate(${dock * 700}px, ${dock * -370}px) scale(${1 - dock * 0.62})`, transformOrigin: '960px 540px', opacity: introP * (1 - lin(f, c.to - 400, c.to - 380) * 0)}}>
        {c.cards}
      </div>
      {c.sfx}
    </Shot>
  );
};

const money = (n: number, dp = 0) => rs(n, dp);

export const Scene5: React.FC = () => {
  const f = useCurrentFrame();
  const sp = useSp();
  const full: RLine[] = [
    {at: S(27, 0.2), l: 'Phone price', r: money(30000)},
    {at: W('w28_1000'), l: 'Mobile cap discount', r: '−' + money(1000), color: '#0A7A44'},
    {at: W('w28_29000') - 6, rule: true, l: ''},
    {at: W('w28_29000'), l: 'YOU PAY', r: money(29000), big: true},
  ];
  const emi: RLine[] = [
    {at: S(29, 0.3), l: 'Phone price', r: money(30000)},
    {at: W('w30_1250'), l: 'EMI cap discount', r: '−' + money(1250), color: '#0A7A44'},
    {at: W('w30_500'), l: 'EMI bonus (cart ≥ ₹29,990)', r: '−' + money(500), color: '#0A7A44'},
    {at: W('w31_28250'), l: 'Checkout price', r: money(28250), bold: true, note: `total discount ${money(1750)}`},
    {at: W('w34_45'), l: 'Processing fee', r: '+' + money(45, 2), color: '#B42318'},
    {at: W('w34_53') - 2, l: '  incl. 18% GST', r: '= ' + money(53.1, 2), color: '#B42318', note: '₹45 + ₹8.10 GST'},
    {at: W('w35_248'), l: '18% GST on interest', r: '+' + money(248.1, 2), color: '#B42318'},
    {at: W('w38_28551') - 8, rule: true, l: ''},
    {at: W('w38_28551'), l: 'NET OUTFLOW', r: money(28551.2, 2), big: true},
  ];
  const ruleAt = S(33);
  const sideOut = W('w38_28551') - 20;
  const v = S(39);
  return (
    <MathScene
      from={S(25) - 4}
      to={S(42) - 6}
      plate="amz"
      tint="#1B2636"
      platform="AMAZON"
      bankName="SBI CARD"
      accent={K.amz}
      intro={S(25)}
      emiSub="6 months · SBI Card"
      real={
        <>
          <RealCrop page="amzSale" box={{x: 280, y: 806, w: 1124, h: 128}} w={1180} style={{left: 370, top: 150, transform: `perspective(1800px) rotateX(${(1 - sp(S(25) + 4, SMOOTH)) * 30}deg)`}} />
          <div style={{position: 'absolute', left: 370, top: 290, fontFamily: NUM, fontSize: 17, letterSpacing: 2, color: 'rgba(255,255,255,0.7)'}}>REAL BANNER · AMAZON.IN MOBILES PAGE · 6 OCT 2026</div>
        </>
      }
      cam={[
        {f: 0, x: 960, y: 540, s: 1},
        {f: S(27, 0.2) - 6, x: 440, y: 420, s: 1.38},
        {f: S(29, 0.3) - 6, x: 1090, y: 470, s: 1.3},
        {f: S(32), x: 1260, y: 560, s: 1.12},
        {f: W('w38_28551') - 26, x: 990, y: 570, s: 1.0},
      ]}
      cards={
        <>
          <ContactShadow x={960} y={800} w={700} />
          <CreditCard skin={SKINS.sbi} w={640} rx={10 - 6 * lin(f, S(25), S(26))} ry={-24 + 30 * lin(f, S(25), S(27))} style={{left: 640, top: 320}} glow={0.6} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 790, textAlign: 'center', opacity: lin(f, S(26), S(26) + 10) * (1 - lin(f, S(27, 0.2) - 20, S(27, 0.2)))}}>
            <span style={{fontFamily: NUM, fontSize: 28, letterSpacing: 5, color: K.soft}}>BASE REFERENCE PRICE </span>
            <span style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 64, color: '#fff'}}>₹30,000</span>
          </div>
        </>
      }
      full={full}
      emi={emi}
      side={
        <div style={{position: 'absolute', left: 1460, top: 300, width: 400}}>
          {/* bank charges panel */}
          <Glass accent={K.loss} style={{position: 'relative', padding: '22px 26px', opacity: lin(f, S(32), S(32) + 10) * (1 - lin(f, sideOut, sideOut + 10))}}>
            <div style={{fontFamily: NUM, fontSize: 22, letterSpacing: 4, color: K.loss, fontWeight: 700}}>+ BANK CHARGES</div>
            <div style={{marginTop: 14, opacity: lin(f, ruleAt, ruleAt + 10)}}>
              {/* calendar page */}
              <div style={{width: 150, borderRadius: 14, overflow: 'hidden', background: '#fff', boxShadow: '0 14px 30px rgba(0,0,0,0.5)', transform: `perspective(600px) rotateX(${(1 - eout(lin(f, ruleAt, ruleAt + 14))) * -80}deg)`, transformOrigin: '50% 0%'}}>
                <div style={{background: '#D92D20', color: '#fff', fontFamily: DISPLAY, fontWeight: 800, fontSize: 22, textAlign: 'center', padding: 4}}>SEP 2026</div>
                <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 64, textAlign: 'center', color: '#111'}}>10</div>
              </div>
              <div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 28, color: '#fff', marginTop: 12, lineHeight: 1.2}}>SBI Card revised its EMI processing fee</div>
              <div style={{fontFamily: NUM, fontSize: 18, color: K.dim, marginTop: 6}}>as narrated · confirm on sbicard.com</div>
            </div>
            <div style={{marginTop: 18, borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 14, opacity: lin(f, W('w36_301'), W('w36_301') + 8)}}>
              <div style={{fontFamily: NUM, fontSize: 22, color: K.soft}}>₹53.10 + ₹248.10</div>
              <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 60, color: K.loss}}>+₹301.20</div>
              <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 24, color: K.soft}}>extra bank charges</div>
            </div>
          </Glass>
        </div>
      }
      verdict={
        <div style={{position: 'absolute', left: 1450, top: 290, width: 430, opacity: lin(f, sideOut + 10, sideOut + 20)}}>
          <Glass accent={K.win} style={{position: 'relative', padding: '24px 28px'}}>
            <div style={{fontFamily: NUM, fontSize: 21, letterSpacing: 3, color: K.soft}}>vs BASE ₹30,000</div>
            <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 50, color: '#fff', opacity: lin(f, W('w39_1448'), W('w39_1448') + 8)}}>
              saved <span style={{color: K.win}}>{money(1448.8, 2)}</span>
            </div>
            <div style={{marginTop: 18, fontFamily: NUM, fontSize: 21, letterSpacing: 3, color: K.soft, opacity: lin(f, W('w40_29000'), W('w40_29000') + 8)}}>vs FULL PAYMENT ₹29,000</div>
            <div style={{fontFamily: DISPLAY, fontWeight: 950, fontSize: 92, color: K.win, letterSpacing: -2, textShadow: `0 0 40px ${rgba(K.win, 0.6)}`, opacity: lin(f, W('w40_449'), W('w40_449') + 6), transform: `scale(${0.7 + 0.3 * sp(W('w40_449'), POP)})`, transformOrigin: '0 50%'}}>
              +₹449
            </div>
            <div style={{fontFamily: NUM, fontSize: 20, color: K.soft, opacity: lin(f, W('w40_449'), W('w40_449') + 8)}}>₹29,000 − ₹28,551.20 = ₹448.80</div>
          </Glass>
          <div style={{position: 'relative', height: 160}}>
            <Stamp at={S(41, 0.55)} text="EMI WINS ✓" color={K.win} x={215} y={95} rot={-7} size={62} />
          </div>
        </div>
      }
      sfx={
        <>
          <Sfx at={S(25)} name="card_slide" volume={0.35} />
          {[...full, ...emi].filter((l) => !l.rule).map((l, i) => <Sfx key={i} at={l.at} name="print.wav" volume={0.22} />)}
          <Sfx at={ruleAt} name="pages_flip" volume={0.3} />
          <Sfx at={W('w36_301')} name="node_pop" volume={0.3} />
          <Sfx at={W('w40_449')} name="cash.wav" volume={0.5} />
          <Sfx at={S(41, 0.55)} name="stamp_heavy" volume={0.4} />
          <Flare at={W('w40_449')} x={1640} y={560} color={K.win} />
        </>
      }
    />
  );
};

export const Scene6: React.FC = () => {
  const f = useCurrentFrame();
  const sp = useSp();
  const full: RLine[] = [
    {at: S(43, 0.3), l: 'Phone price', r: money(30000)},
    {at: S(44, 0.25), l: 'Mobile cap discount', r: '−' + money(1000), color: '#0A7A44'},
    {at: W('w44_29000') - 6, rule: true, l: ''},
    {at: W('w44_29000'), l: 'YOU PAY', r: money(29000), big: true},
  ];
  const emi: RLine[] = [
    {at: S(45, 0.3), l: 'Phone price', r: money(30000)},
    {at: W('w46_1250'), l: 'EMI cap discount', r: '−' + money(1250), color: '#0A7A44'},
    {at: S(46, 0.78), l: 'EMI bonus', r: 'none', color: '#8a8f99'},
    {at: W('w47_28750'), l: 'Checkout price', r: money(28750), bold: true, note: `only ${money(250)} more off than full payment`},
    {at: W('w50_299'), l: 'Processing fee', r: '+' + money(299), color: '#B42318'},
    {at: W('w50_353') - 2, l: '  incl. 18% GST', r: '= ' + money(352.82, 2), color: '#B42318', note: '≈ ₹353'},
    {at: W('w51_233'), l: 'GST on interest', r: '+' + money(233.49, 2), color: '#B42318', note: '≈ ₹233'},
    {at: W('w53_29336') - 8, rule: true, l: ''},
    {at: W('w53_29336'), l: 'NET COST', r: money(29336.31, 2), big: true, color: '#B42318'},
  ];
  const lossAt = W('w55_336');
  const charges = S(49);
  return (
    <MathScene
      from={S(42) - 6}
      to={S(56) - 6}
      plate="fk"
      tint="#0F2250"
      platform="FLIPKART"
      bankName="AXIS / ICICI"
      accent={K.fkY}
      intro={S(42)}
      emiSub="6 months · Axis / ICICI"
      real={
        <>
          <RealCrop page="fkHome" box={{x: 136, y: 226, w: 460, h: 222}} w={470} style={{left: 725, top: 56, transform: `perspective(1800px) rotateX(${(1 - sp(S(42) + 4, SMOOTH)) * 30}deg)`}} />
          <div style={{position: 'absolute', left: 725, top: 30, width: 470, textAlign: 'center', fontFamily: NUM, fontSize: 16, letterSpacing: 2, color: 'rgba(255,255,255,0.7)'}}>REAL BANNER · FLIPKART.COM · 6 OCT 2026</div>
        </>
      }
      cam={[
        {f: 0, x: 960, y: 540, s: 1},
        {f: S(43, 0.3) - 6, x: 440, y: 420, s: 1.38},
        {f: S(45, 0.3) - 6, x: 1090, y: 470, s: 1.3},
        {f: S(49), x: 1260, y: 560, s: 1.12},
        {f: W('w53_29336') - 26, x: 990, y: 570, s: 1.0},
      ]}
      cards={
        <>
          <ContactShadow x={960} y={800} w={800} />
          <CreditCard skin={SKINS.axis} w={560} rx={8} ry={-20 + 16 * lin(f, S(42), S(43))} rz={-7} style={{left: 520, top: 330}} />
          <CreditCard skin={SKINS.icici} w={560} rx={8} ry={-12 + 16 * lin(f, S(42), S(43))} rz={5} style={{left: 860, top: 360}} glow={0.4} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 790, textAlign: 'center', opacity: lin(f, S(42, 0.2), S(42, 0.2) + 10) * (1 - lin(f, S(43, 0.3) - 26, S(43, 0.3) - 10))}}>
            <span style={{fontFamily: NUM, fontSize: 28, letterSpacing: 5, color: K.soft}}>SAME BASE PRICE </span>
            <span style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 64, color: '#fff'}}>₹30,000</span>
          </div>
        </>
      }
      full={full}
      emi={emi}
      side={
        <div style={{position: 'absolute', left: 1460, top: 300, width: 400}}>
          <Glass accent={K.loss} style={{position: 'relative', padding: '22px 26px', opacity: lin(f, charges, charges + 10) * (1 - lin(f, W('w53_29336') - 30, W('w53_29336') - 20))}}>
            <div style={{fontFamily: NUM, fontSize: 22, letterSpacing: 4, color: K.loss, fontWeight: 700}}>⚠ BANK CHARGES</div>
            <div style={{fontFamily: NUM, fontSize: 24, color: K.soft, marginTop: 16, opacity: lin(f, W('w50_353'), W('w50_353') + 8)}}>fee + GST ≈ ₹353</div>
            <div style={{fontFamily: NUM, fontSize: 24, color: K.soft, marginTop: 6, opacity: lin(f, W('w51_233'), W('w51_233') + 8)}}>GST on interest ≈ ₹233</div>
            <div style={{marginTop: 14, borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 12, opacity: lin(f, W('w52_586'), W('w52_586') + 8)}}>
              <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 66, color: K.loss}}>+₹586</div>
              <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 24, color: K.soft}}>extra bank charges</div>
              <div style={{fontFamily: NUM, fontSize: 18, color: K.dim, marginTop: 4}}>₹352.82 + ₹233.49 = ₹586.31</div>
            </div>
          </Glass>
        </div>
      }
      verdict={
        <div style={{position: 'absolute', left: 1450, top: 290, width: 430, opacity: lin(f, W('w53_29336') - 18, W('w53_29336') - 8)}}>
          <Glass accent={K.loss} style={{position: 'relative', padding: '24px 28px', boxShadow: `0 0 ${60 + 40 * Math.sin(f * 0.3) * lin(f, lossAt, lossAt + 5)}px ${rgba(K.loss, 0.5)}`}}>
            <div style={{fontFamily: NUM, fontSize: 21, letterSpacing: 3, color: K.soft}}>EMI NET COST</div>
            <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 56, color: '#fff'}}>{money(29336)}</div>
            <div style={{marginTop: 12, fontFamily: NUM, fontSize: 21, letterSpacing: 3, color: K.soft, opacity: lin(f, W('w54_29000'), W('w54_29000') + 8)}}>FULL PAYMENT WOULD BE</div>
            <div style={{fontFamily: DISPLAY, fontWeight: 900, fontSize: 56, color: '#fff', opacity: lin(f, W('w54_29000'), W('w54_29000') + 8)}}>{money(29000)}</div>
            <div style={{fontFamily: DISPLAY, fontWeight: 950, fontSize: 92, color: K.loss, letterSpacing: -2, textShadow: `0 0 40px ${rgba(K.loss, 0.6)}`, opacity: lin(f, lossAt, lossAt + 6), transform: `scale(${0.7 + 0.3 * sp(lossAt, POP)})`, transformOrigin: '0 50%'}}>−₹336</div>
            <div style={{fontFamily: NUM, fontSize: 20, color: K.soft, opacity: lin(f, lossAt, lossAt + 8)}}>you lose ₹336.31 by choosing EMI</div>
          </Glass>
          <div style={{position: 'relative', height: 160}}>
            <Stamp at={lossAt + 14} text="FULL PAY WINS" color={K.loss} x={215} y={95} rot={-7} size={56} />
          </div>
        </div>
      }
      sfx={
        <>
          <Sfx at={S(42)} name="card_slide" volume={0.35} />
          {[...full, ...emi].filter((l) => !l.rule).map((l, i) => <Sfx key={i} at={l.at} name="print.wav" volume={0.22} />)}
          <Sfx at={charges} name="warning_pulse" volume={0.3} />
          <Sfx at={W('w52_586')} name="node_pop" volume={0.3} />
          <Sfx at={lossAt} name="alert.wav" volume={0.5} />
          <Sfx at={lossAt + 14} name="stamp_heavy" volume={0.4} />
          <Flare at={lossAt} x={1640} y={600} color={K.loss} />
        </>
      }
    />
  );
};

/* ================================================================== SCENE 7 — the 5% cashback card */

export const Scene7: React.FC = () => {
  const f = useCurrentFrame();
  const sp = useSp();
  const a = S(56);
  const spin = lin(f, a, a + 70);
  const ry = -70 + 64 * eout(spin) + Math.sin(f / 30) * 6;
  const dock = eout(lin(f, S(57) - 10, S(57) + 14));
  const cbOn = W('w57_1500');
  return (
    <Shot from={a - 6} to={S(61) - 4} push={0.03} seed={13}>
      <Backdrop plate="warm" tint="#2A2010" />
      {/* spotlight */}
      <div style={{position: 'absolute', left: 560, top: -200, width: 800, height: 1300, background: 'radial-gradient(ellipse 40% 60% at 50% 30%, rgba(255,220,140,0.18), transparent)', opacity: 1 - dock * 0.5}} />
      <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: `translate(${dock * -560}px, ${dock * -40}px) scale(${1 - dock * 0.35})`, transformOrigin: '960px 500px'}}>
        <ContactShadow x={960} y={820} w={760} o={0.8} />
        <CreditCard skin={SKINS.cashback} w={720} ry={ry} rx={8 + Math.sin(f / 40) * 3} style={{left: 600, top: 300}} glow={0.7} last4="0505" />
        <div style={{position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center'}}>
          <Kicker text="third category" at={a} color={K.gold} style={{fontSize: 30}} />
          <Headline at={a + 6} size={78} text={<>A <span style={{color: K.gold}}>5% cashback</span> card</>} />
          <div style={{fontFamily: NUM, fontSize: 22, color: K.soft, marginTop: 8, opacity: lin(f, a + 20, a + 30)}}>e.g. co-branded cards like Amazon Pay ICICI</div>
        </div>
        {/* the real listing line: "Up to 5% back with Amazon Pay ICICI card" */}
        <div style={{opacity: lin(f, a + 30, a + 42) * (1 - dock)}}>
          <RealCrop page="amzSearch" box={{x: 585, y: 410, w: 420, h: 62}} w={760} style={{left: 580, top: 838}} />
          <div style={{position: 'absolute', left: 580, top: 899, width: 505, height: 48, borderRadius: 10, border: `4px solid ${K.gold}`, boxShadow: `0 0 24px ${rgba(K.gold, 0.6)}`}} />
        </div>
      </div>
      {/* two outcomes */}
      <div style={{position: 'absolute', left: 900, top: 150, width: 900, opacity: dock}}>
        <Glass accent={K.win} style={{position: 'relative', padding: '26px 34px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div style={{fontFamily: NUM, fontSize: 24, letterSpacing: 5, color: K.win, fontWeight: 700}}>FULL PAYMENT</div>
            <Badge ok at={W('w58_28500') + 6} size={52} />
          </div>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 10, fontFamily: DISPLAY, fontWeight: 900, color: '#fff'}}>
            <span style={{fontSize: 58}}>₹30,000</span>
            <span style={{fontSize: 46, color: K.win, opacity: lin(f, cbOn, cbOn + 8)}}>− ₹1,500</span>
            <span style={{fontSize: 30, color: K.soft, opacity: lin(f, W('w57_5pct'), W('w57_5pct') + 8)}}>5% cashback</span>
          </div>
          <div style={{fontFamily: DISPLAY, fontWeight: 950, fontSize: 96, color: K.win, letterSpacing: -3, opacity: lin(f, W('w58_28500'), W('w58_28500') + 6), textShadow: `0 0 40px ${rgba(K.win, 0.5)}`}}>= ₹28,500</div>
        </Glass>
        <Glass accent={K.loss} style={{position: 'relative', marginTop: 30, padding: '26px 34px', opacity: lin(f, S(59), S(59) + 10)}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div style={{fontFamily: NUM, fontSize: 24, letterSpacing: 5, color: K.loss, fontWeight: 700}}>EMI ON THE SAME CARD</div>
            <Badge ok={false} at={W('w59_30580') + 6} size={52} />
          </div>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 10, fontFamily: DISPLAY, fontWeight: 900, color: '#fff', fontSize: 40}}>
            <span style={{opacity: lin(f, W('w59_5pct'), W('w59_5pct') + 8)}}>
              5% cashback <span style={{color: K.loss}}>₹0</span>
            </span>
            <span style={{color: K.soft, fontSize: 32, opacity: lin(f, S(59, 0.6), S(59, 0.6) + 8)}}>+ fees &amp; GST</span>
          </div>
          <div style={{fontFamily: DISPLAY, fontWeight: 950, fontSize: 80, color: K.loss, letterSpacing: -2, opacity: lin(f, W('w59_30580'), W('w59_30580') + 6)}}>bill &gt; ₹30,580</div>
        </Glass>
        <div style={{marginTop: 34, textAlign: 'center', opacity: lin(f, S(60), S(60) + 10), transform: `scale(${0.8 + 0.2 * sp(S(60), POP)})`}}>
          <span style={{display: 'inline-block', padding: '18px 36px', borderRadius: 22, background: `linear-gradient(135deg, ${K.gold}, #E09A1E)`, fontFamily: DISPLAY, fontWeight: 950, fontSize: 46, color: '#1A1205', boxShadow: `0 0 60px ${rgba(K.gold, 0.5)}`}}>Cashback card → full swipe is king</span>
        </div>
      </div>
      <Sfx at={a} name="air_whoosh" volume={0.3} />
      <Sfx at={a + 50} name="shield_activate" volume={0.2} />
      <Sfx at={cbOn} name="cash.wav" volume={0.45} />
      <Sfx at={W('w59_30580')} name="alert.wav" volume={0.35} />
      <Sfx at={S(60)} name="triumph_rise" volume={0.25} />
      <Flare at={W('w58_28500')} x={1350} y={360} color={K.win} />
    </Shot>
  );
};

export {Count, Headline};
