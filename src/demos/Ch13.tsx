import React from 'react';
import {C, FONT, MONO, alpha} from '../theme';
import {Caption, DemoHeader, DemoProps, DemoRoot, inr, PAPER, INK, SUPPORT, Toggle, useBeats} from './kit';

/* ------------------------------------------------------------------ §Q the 8-step plan, re-using the objects from earlier chapters */

type Tile = {k: string; text: string; sub?: string; color: string; obj: React.ReactNode};

const MiniPaper: React.FC<{title: string; lines?: number; stamp?: string; stampColor?: string}> = ({title, lines = 3, stamp, stampColor = '#15803D'}) => (
  <div style={{position: 'relative', width: 150, height: 104, borderRadius: 8, background: PAPER, color: INK, padding: '10px 12px', boxSizing: 'border-box', fontFamily: FONT, boxShadow: '0 10px 24px rgba(0,0,0,0.4)'}}>
    <div style={{fontSize: 16, fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden'}}>{title}</div>
    {Array.from({length: lines}).map((_, i) => <div key={i} style={{height: 7, borderRadius: 3, background: '#CBD5E1', marginTop: 9, width: `${90 - i * 18}%`}} />)}
    {stamp && <div style={{position: 'absolute', right: 6, bottom: 8, padding: '2px 6px', border: `3px solid ${stampColor}`, color: stampColor, borderRadius: 6, fontSize: 14, fontWeight: 900, transform: 'rotate(-8deg)'}}>{stamp}</div>}
  </div>
);
const MiniBars: React.FC<{bars: [number, string][]}> = ({bars}) => (
  <div style={{width: 150, height: 104, display: 'flex', alignItems: 'flex-end', gap: 10, padding: '0 8px', boxSizing: 'border-box'}}>
    {bars.map(([h, c], i) => <div key={i} style={{flex: 1, height: h, borderRadius: 6, background: c}} />)}
  </div>
);
const Glyph: React.FC<{g: string; color: string; big?: boolean}> = ({g, color, big}) => (
  <div style={{width: 150, height: 104, borderRadius: 18, background: alpha(color, 0.16), border: `2px solid ${alpha(color, 0.6)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontSize: big ? 46 : 56, fontWeight: 900, color: '#fff'}}>{g}</div>
);
const MiniPhone: React.FC = () => (
  <div style={{width: 150, height: 104, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12}}>
    <div style={{width: 54, height: 96, borderRadius: 12, background: '#0B1020', border: '3px solid #334155'}} />
    <Toggle on={1} />
  </div>
);
const MiniTable: React.FC = () => (
  <div style={{width: 150, height: 104, borderRadius: 8, background: PAPER, padding: 10, boxSizing: 'border-box', boxShadow: '0 10px 24px rgba(0,0,0,0.4)'}}>
    {['Bank A', 'Bank B', 'Bank C'].map((b) => (
      <div key={b} style={{display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 14, color: INK, borderBottom: '1px solid #CBD5E1', padding: '5px 0'}}><span>{b}</span><span>₹ ·····</span></div>
    ))}
  </div>
);

const STEPS: {k: string; title: string; te: string; tiles: Tile[]}[] = [
  {k: 's1', title: 'List every account', te: 'అన్ని accounts list చేయండి', tiles: [
    {k: 's1', text: 'List all your accounts', color: C.cyan, obj: <MiniTable />},
    {k: 's1b', text: 'Income, essentials, money available', sub: `e.g. ${inr(40000)} in → ${inr(7000)} available`, color: C.emerald, obj: <MiniBars bars={[[96, '#38BDF8'], [80, '#F59E0B'], [26, '#22C55E']]} />},
    {k: 's1c', text: 'Agreement terms and set-off risk', sub: 'salary account at the same bank', color: C.amber, obj: <MiniPaper title="Clause 14 (sample)" />},
  ]},
  {k: 's2', title: 'Write to each bank', te: 'ప్రతి bank కి hardship written గా చెప్పండి', tiles: [
    {k: 's2', text: 'Explain hardship via the official grievance channel', color: C.cyan, obj: <Glyph g="✉" color={C.cyan} />},
    {k: 's2b', text: 'Ask for affordable options in writing', color: C.emerald, obj: <MiniPaper title="Options?" />},
    {k: 's2c', text: 'Save complaint IDs and replies', sub: 'e.g. CMP-20931', color: C.cyan, obj: <Glyph g="🗂" color={C.cyan} />},
  ]},
  {k: 's3', title: 'Organise the calls', te: 'Recovery communication organise చేయండి', tiles: [
    {k: 's3', text: 'Organise recovery communication', color: C.cyan, obj: <MiniPhone />},
    {k: 's3b', text: 'Use spam controls', color: C.cyan, obj: <Glyph g="🔕" color={C.cyan} />},
    {k: 's3c', text: 'Never miss verified emails, letters, genuine legal notices', color: C.emerald, obj: <MiniPaper title="Verified ✓" stamp="KEEP" />},
  ]},
  {k: 's4', title: 'Stop the debt cycle', te: 'కొత్త అప్పుతో పాత అప్పు cover చేయడం review చేయండి', tiles: [
    {k: 's4', text: 'Review covering old debt with new borrowing', color: C.crimson, obj: <Glyph g="↻" color={C.crimson} />},
    {k: 's4b', text: 'Minimum due: know the benefits and the costs', color: C.amber, obj: <MiniBars bars={[[40, '#22C55E'], [90, '#F59E0B']]} />},
    {k: 's4c', text: 'No promises your budget can’t support', color: C.crimson, obj: <Glyph g="✕" color={C.crimson} />},
  ]},
  {k: 's5', title: 'Record harassment', te: 'Evidence save చేసి complaint చేయండి', tiles: [
    {k: 's5', text: 'Threats or abuse? Save evidence and complain', color: C.amber, obj: <Glyph g="📁" color={C.amber} />},
    {k: 's5b', text: 'If needed, escalate via the RBI complaint process', sub: 'cms.rbi.org.in', color: C.cyan, obj: <MiniPaper title="RBI complaint" />},
    {k: 's5c', text: 'Immediate danger: call 112', color: C.crimson, obj: <Glyph g="112" color={C.crimson} big />},
  ]},
  {k: 's6', title: 'Know NPA vs write-off', te: 'NPA, write-off, settlement తేడా గుర్తుంచుకోండి', tiles: [
    {k: 's6', text: 'NPA · write-off · settlement are different', color: C.cyan, obj: <MiniPaper title="Bank’s books" />},
    {k: 's6b', text: 'Write-off doesn’t cancel the debt', color: C.crimson, obj: <Glyph g="≠" color={C.crimson} />},
    {k: 's6c', text: 'Discuss options — don’t just wait for a discount', color: C.emerald, obj: <Glyph g="💬" color={C.emerald} />},
  ]},
  {k: 's7', title: 'Verify any settlement', te: 'Settlement అయితే official offer verify చేయండి', tiles: [
    {k: 's7', text: 'Verify the official offer', color: C.emerald, obj: <MiniPaper title="BANK A letter" stamp="VERIFIED" />},
    {k: 's7b', text: 'Amount, dates, waiver terms, reporting status', color: C.amber, obj: <MiniPaper title="Terms" lines={4} />},
    {k: 's7c', text: 'Authorised channel · receipts · completion proof', color: C.emerald, obj: <MiniPaper title="Receipt" stamp="SAVED" />},
  ]},
  {k: 's8', title: 'Rebuild steadily', te: 'Income stabilize చేసి, నెమ్మదిగా rebuild చేయండి', tiles: [
    {k: 's8', text: 'Stabilise your income', color: C.emerald, obj: <MiniBars bars={[[50, '#22C55E'], [62, '#22C55E'], [74, '#22C55E']]} />},
    {k: 's8b', text: 'Build emergency savings', color: C.emerald, obj: <Glyph g="🏺" color={C.emerald} />},
    {k: 's8c', text: 'Check your credit report', color: C.cyan, obj: <MiniPaper title="Credit report" lines={4} />},
    {k: 's8d', text: 'If needed: suitable secured credit, paid in full', color: C.amber, obj: <Glyph g="💳" color={C.amber} />},
  ]},
];

export const PlanDemo: React.FC<DemoProps> = ({ins}) => {
  const {p, on, stage} = useBeats(ins);
  const cur = stage(STEPS.map((s) => s.k));
  const step = STEPS[Math.max(0, cur)];
  return (
    <DemoRoot ins={ins}>
      <DemoHeader ins={ins} color={C.cyan} />
      {/* rail */}
      <div style={{position: 'absolute', left: 120, top: 300, width: 560}}>
        {STEPS.map((s, i) => {
          const done = i < cur;
          const now = i === cur;
          const c = now ? C.cyan : done ? C.emerald : '#475569';
          return (
            <div key={s.k} style={{display: 'flex', alignItems: 'center', gap: 18, height: 68, opacity: on(s.k) || i <= cur ? 1 : 0.45}}>
              <div style={{width: 50, height: 50, borderRadius: 25, background: now ? C.cyan : done ? alpha(C.emerald, 0.25) : 'transparent', border: `3px solid ${c}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontSize: 24, fontWeight: 900, color: now ? '#04111C' : '#fff', flexShrink: 0}}>{done ? '✓' : i + 1}</div>
              <div style={{fontFamily: FONT, fontSize: now ? 36 : 30, fontWeight: now ? 900 : 700, color: now ? '#fff' : done ? '#BBF7D0' : SUPPORT, whiteSpace: 'nowrap'}}>{s.title}</div>
            </div>
          );
        })}
      </div>
      {/* objects for the current step */}
      {cur >= 0 && (
        <div key={step.k} style={{position: 'absolute', left: 760, top: 300, width: 1040, opacity: p(step.k)}}>
          <div style={{fontFamily: MONO, fontSize: 26, letterSpacing: 5, color: '#7DD3FC', fontWeight: 800}}>STEP {cur + 1}</div>
          {step.tiles.map((t) => (
            <div key={t.k} style={{display: 'flex', alignItems: 'center', gap: 26, marginTop: step.tiles.length > 3 ? 10 : 22, padding: step.tiles.length > 3 ? '6px 18px' : '12px 18px', borderRadius: 20, background: '#0E1628', border: `3px solid ${on(t.k) ? t.color : 'transparent'}`, opacity: on(t.k) ? p(t.k) : 0, transform: `translateX(${(1 - (on(t.k) ? p(t.k) : 0)) * 40}px)`}}>
              {t.obj}
              <div>
                <div style={{fontFamily: FONT, fontSize: 34, fontWeight: 850, color: '#fff', lineHeight: 1.25}}>{t.text}</div>
                {t.sub && <div style={{fontFamily: FONT, fontSize: 28, color: SUPPORT, marginTop: 4}}>{t.sub}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
      <Caption ins={ins} bottom={44} lines={STEPS.map((s, i) => ({k: s.k, text: `Step ${i + 1} — ${s.title}`, te: s.te}))} />
    </DemoRoot>
  );
};
