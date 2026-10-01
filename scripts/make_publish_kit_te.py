"""Telugu edition publishing kit, timed to the Telugu render.

Writes publish/telugu/captions_en.srt (English subtitles from the user's translation,
narration/telugu/english_transcript.md), chapters.txt and youtube_description.md.
Timing mirrors src/lib/timing.ts with src/data/timing_te.json; full.mp3 seconds are mapped to the
video through narration/telugu/map.json + remap.json (cut start and shortened pauses per module).
"""
import json
import math
import os
import re

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FPS, LEAD, TAIL, VO_AT, TITLE_FRAMES = 30, 1.0, 1.4, 10, 84
MAX_CHARS = 84

CHAPTERS = {
    'm01': 'అప్పు crime కాదు · Debt is not a crime',
    'm02': 'Arrest చేస్తారా? Law ఏం చెప్తుంది · What the law says',
    'm03': 'చాలా cards, చాలా banks · Many accounts, one list',
    'm04': 'Balance ఎందుకు పెరుగుతుంది · Statement, interest & minimum due',
    'm05': 'Salary account & set-off · Protect essential money',
    'm06': 'Bank తో written గా · Hardship communication',
    'm07': 'Recovery agents — rules & tricks · Your rights',
    'm08': 'Non-stop calls control · Phone settings',
    'm09': 'Due date నుంచి NPA, write-off వరకు · The timeline',
    'm10': 'ప్రతి bank వేరు · Issuer differences',
    'm11': 'Settlement & Lok Adalat — safe గా · Settle safely',
    'm12': 'Settled vs Closed, CIBIL rebuild · Rebuilding credit',
    'm13': 'మీ 8-step plan · Your next step',
}


def ts(sec, srt=True):
    ms = int(round(sec * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f'{h:02d}:{m:02d}:{s:02d},{ms:03d}' if srt else (f'{h}:{m:02d}:{s:02d}' if h else f'{m}:{s:02d}')


def parse_tc(x):
    h, m, s = x.split(':')
    return int(h) * 3600 + int(m) * 60 + float(s)


def transcript():
    rows = []
    for line in open(os.path.join(ROOT, 'narration/telugu/english_transcript.md')):
        m = re.match(r'\*\*\[(\d+:\d+:[\d.]+)[–-](\d+:\d+:[\d.]+)\]\*\*\s*(.+)', line.strip())
        if m:
            rows.append([parse_tc(m.group(1)), parse_tc(m.group(2)), m.group(3).strip()])
    merged = []
    for r in rows:  # glue fragments that were split mid-sentence ("...left in our" + "hands.")
        if merged and (r[2][:1].islower() or r[1] - r[0] < 0.6):
            merged[-1][1] = r[1]
            merged[-1][2] += ' ' + r[2]
        else:
            merged.append(r)
    return merged


def split_caption(a, b, text):
    if len(text) <= MAX_CHARS:
        return [(a, b, text)]
    parts = re.split(r'(?<=[,;.?!])\s+', text)
    if len(parts) == 1:
        words = text.split()
        parts = [' '.join(words[: len(words) // 2]), ' '.join(words[len(words) // 2:])]
    out, cur = [], ''
    for p in parts:
        if cur and len(cur) + 1 + len(p) > MAX_CHARS:
            out.append(cur)
            cur = p
        else:
            cur = f'{cur} {p}'.strip()
    out.append(cur)
    total = sum(len(x) for x in out)
    res, t = [], a
    for x in out:
        d = (b - a) * len(x) / total
        res.append((t, t + d, x))
        t += d
    return res


def main():
    te = json.load(open(os.path.join(ROOT, 'src/data/timing_te.json')))
    mp = json.load(open(os.path.join(ROOT, 'narration/telugu/map.json')))
    rm = json.load(open(os.path.join(ROOT, 'narration/telugu/remap.json')))
    cold = VO_AT + round(te['hook']['duration'] * FPS) + 14 + TITLE_FRAMES
    starts, t = {'hook': VO_AT / FPS}, cold / FPS
    for m in te['modules']:
        starts[m['id']] = t + LEAD
        t += math.ceil((LEAD + m['duration'] + TAIL) * FPS) / FPS
    total = t
    order = ['hook'] + [m['id'] for m in te['modules']]

    def to_video(sec):
        mid = next((k for k in order if mp[k]['start'] - 0.6 <= sec <= mp[k]['end'] + 0.6), None)
        if mid is None:  # in a gap between modules: snap to the nearest boundary
            mid = min(order, key=lambda k: min(abs(sec - mp[k]['start']), abs(sec - mp[k]['end'])))
        r = rm[mid]
        rel = sec - r['cut_start']
        rel -= float(np.interp(rel, r['xs'], r['removed']))
        return starts[mid] + rel

    out = os.path.join(ROOT, 'publish/telugu')
    os.makedirs(out, exist_ok=True)
    lines, n = [], 1
    for a, b, text in transcript():
        va, vb = to_video(a), to_video(b)
        for ca, cb, ct in split_caption(va, max(vb, va + 0.8), text):
            lines += [str(n), f'{ts(ca)} --> {ts(cb)}', ct, '']
            n += 1
    open(os.path.join(out, 'captions_en.srt'), 'w').write('\n'.join(lines))

    chap = ['0:00 పరిచయం · Introduction']
    for m in te['modules']:
        chap.append(f"{ts(starts[m['id']] - LEAD, srt=False)} {CHAPTERS[m['id']]}")
    open(os.path.join(out, 'chapters.txt'), 'w').write('\n'.join(chap) + '\n')

    desc = f"""Credit card bill కట్టలేకపోతున్నారా? రోజుకి 40–50 recovery calls, “police case” threats? భయపడకండి. ఈ video లో law actually ఏం చెప్తుంది, మీ rights ఏంటి, step by step మీరు ఏం చేయొచ్చో simple Telugu లో చెప్తున్నా.

Can't pay your credit card bill? Recovery calls, threats, confusion? This Telugu video explains, calmly and step by step, what the law says and what you can do.

ఈ video లో:
✓ Payment miss అయితే cheating అవుతుందా? Civil vs criminal
✓ చాలా accounts ఉంటే — ఒక list, ప్రతి account separate గా
✓ Statement breakup, interest, minimum due trap, RBI rules on charges
✓ Salary account & set-off risk
✓ Bank కి hardship email — written communication
✓ Recovery agents rules: calling hours, privacy, harassment complaints (RBI Ombudsman)
✓ Due date → NPA → write-off: ఏది నిజం, ఏది myth
✓ Settlement safe గా: official letter, authorised payment, Lok Adalat
✓ Settled vs Closed, CIBIL rebuild — magic numbers నమ్మొద్దు
✓ మీ 8-step plan

CHAPTERS
{chr(10).join(chap)}

IMPORTANT: ఈ video awareness కోసం మాత్రమే — legal / financial advice కాదు. Bank policies, rules మారొచ్చు. మీ case కి qualified advocate లేదా financial counsellor తో verify చేసుకోండి.
This video is for awareness only and is not legal or financial advice. Rules and bank practices vary and may change; please verify your own situation with a qualified advocate or financial counsellor.

Next video: నా own case — banks తో నేను ఎలా handle చేస్తున్నానో step by step. Subscribe చేసి bell 🔔 → All notifications select చేయండి.
ఈ video useful అనిపిస్తే, అవసరమైన వాళ్ళకి share చేయండి.

MUSIC
"Lightless Dawn", "Sincerely", "Inspired" Kevin MacLeod (incompetech.com)
Licensed under Creative Commons: By Attribution 4.0 License
http://creativecommons.org/licenses/by/4.0/

#CreditCardDebt #TeluguFinance #KnowYourRights #CIBIL #LokAdalat #DebtFreeIndia
"""
    open(os.path.join(out, 'youtube_description.md'), 'w').write(desc)
    print(f'total {ts(total, srt=False)} · {n - 1} captions · {len(chap)} chapters')


if __name__ == '__main__':
    main()
