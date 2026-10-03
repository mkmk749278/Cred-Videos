"""Hinglish edition (the creator's own Hinglish narration) publishing kit.

Writes publish/hinglish/captions_en.srt (English subtitles), chapters.txt and youtube_description.md.
Caption TEXT is the creator's English translation of the Hinglish script (narration/hinglish/english_translation.md,
the 71 cue paragraphs). Caption TIMES come from faster-whisper's English translation of the Hinglish audio
(out/hi/translate.json): the creator's sentences are aligned to the whisper sentences (same DP as the edition
build), each aligned group's span is shared out by word count, then mapped from full.mp3 seconds to video seconds
through narration/hinglish/map.json + remap.json — the same cut/pause remap the render uses.
"""
import json
import math
import os
import re
import sys

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'scripts'))
sys.path.insert(0, os.path.join(ROOT, 'narration/english'))
sys.path.insert(0, os.path.join(ROOT, 'narration/hinglish'))
from make_publish_kit_te import FPS, LEAD, TAIL, TITLE_FRAMES, VO_AT, split_caption, ts  # noqa: E402
import build_from_te as B  # noqa: E402
from build_from_enh import sentences  # noqa: E402

CHAPTERS = {
    'm01': 'Karz koi crime nahi · Debt is not a crime',
    'm02': 'Kya police arrest karegi? · What the law says',
    'm03': 'Kai cards, kai banks · Many accounts, one list',
    'm04': 'Balance kyun badhta hai · Statement, interest & minimum due',
    'm05': 'Salary account & set-off · Protect essential money',
    'm06': 'Bank se likhit mein baat · Hardship communication',
    'm07': 'Recovery agents ke rules · Your rights',
    'm08': 'Calls ko control karein · Phone settings',
    'm09': 'Due date se NPA aur write-off · The timeline',
    'm10': 'Har bank alag hai · Issuer differences',
    'm11': 'Settlement & Lok Adalat · Settle safely',
    'm12': 'Settled vs Closed, CIBIL · Rebuilding credit',
    'm13': 'Aapka 8-step plan · Your next step',
}


def script_sentences():
    text = open(os.path.join(ROOT, 'narration/hinglish/english_translation.md')).read()
    paras = re.findall(r'^\*\*Cue \d+ · [^\n]*\*\*\n\n(.+?)\n', text, re.M)
    assert len(paras) == 71, len(paras)
    out = []
    for p in paras:
        out += [s.strip() for s in re.split(r'(?<=[.?!])\s+(?=[A-Z])', p) if s.strip()]
    return out


def main():
    S = script_sentences()
    H = sentences(os.path.join(ROOT, 'out/hi/translate.json'))
    path, ta, tb = B.align([[0, 0, s] for s in S], H)
    rows = [None] * len(S)
    good = 0
    for (i, j), (ii, jj) in path:
        if ii > i and jj > j:
            a, b = H[j]['s'], H[jj - 1]['e']
            if B.sim(set().union(*ta[i:ii]), set().union(*tb[j:jj])) >= 0.15:
                good += ii - i
            n = [len(S[k].split()) for k in range(i, ii)]
            t = a
            for k, w in zip(range(i, ii), n):
                d = (b - a) * w / sum(n)
                rows[k] = [t, t + d]
                t += d
    for i, r in enumerate(rows):
        if r is None:
            prev = next((rows[j][1] for j in range(i - 1, -1, -1) if rows[j]), 0.0)
            nxt = next((rows[j][0] for j in range(i + 1, len(rows)) if rows[j]), prev + 2)
            rows[i] = [prev + 0.05, max(prev + 0.8, nxt - 0.05)]
    print(f'script sentences {len(S)}, aligned with good overlap {good}')

    te = json.load(open(os.path.join(ROOT, 'src/data/timing_hi.json')))
    mp = json.load(open(os.path.join(ROOT, 'narration/hinglish/map.json')))
    rm = json.load(open(os.path.join(ROOT, 'narration/hinglish/remap.json')))
    cold = (VO_AT + round(te['hook']['duration'] * FPS) + 14 + TITLE_FRAMES) / FPS
    starts, t = {'hook': VO_AT / FPS}, cold
    for m in te['modules']:
        starts[m['id']] = t + LEAD
        t += math.ceil((LEAD + m['duration'] + TAIL) * FPS) / FPS
    total = t
    order = ['hook'] + [m['id'] for m in te['modules']]

    def to_video(sec):
        mid = next((k for k in order if mp[k]['start'] - 0.6 <= sec <= mp[k]['end'] + 0.6), None)
        if mid is None:
            mid = min(order, key=lambda k: min(abs(sec - mp[k]['start']), abs(sec - mp[k]['end'])))
        r = rm[mid]
        rel = sec - r['cut_start']
        rel -= float(np.interp(rel, r['xs'], r['removed']))
        return starts[mid] + rel

    out = os.path.join(ROOT, 'publish/hinglish')
    os.makedirs(out, exist_ok=True)
    lines, n, last = [], 1, 0.0
    for (a, b), s in zip(rows, S):
        va, vb = to_video(a), to_video(b)
        va = max(va, last)
        vb = min(max(vb, va + 0.8), total - 0.1)
        for ca, cb, ct in split_caption(va, vb, s):
            lines += [str(n), f'{ts(ca)} --> {ts(cb)}', ct, '']
            n += 1
            last = cb
    open(os.path.join(out, 'captions_en.srt'), 'w').write('\n'.join(lines))
    chap = ['0:00 Introduction']
    for m in te['modules']:
        chap.append(f"{ts(starts[m['id']] - LEAD, srt=False)} {CHAPTERS[m['id']]}")
    open(os.path.join(out, 'chapters.txt'), 'w').write('\n'.join(chap) + '\n')
    desc = f"""Credit card ka bill nahi bhar pa rahe? Din mein 40–50 recovery calls, "police case" ki dhamkiyan? Ghabraiye mat. Is video mein simple Hinglish mein samjhiye — law actually kya kehta hai, aapke rights kya hain, aur step by step aap kya kar sakte hain.

Can't pay your credit card bill? Recovery calls, threats, confusion? This Hinglish video explains, calmly and step by step, what the law says and what you can do.

Is video mein:
✓ Payment miss hona kya cheating hai? Civil vs criminal
✓ Kai accounts? Ek list, har account alag se
✓ Statement breakup, interest, minimum due trap, charges par RBI rules
✓ Salary account & set-off risk
✓ Bank ko hardship email — likhit mein baat
✓ Recovery agents ke rules: calling hours, privacy, harassment complaint (RBI Ombudsman)
✓ Due date → NPA → write-off: kya sach, kya myth
✓ Settlement safely: official letter, authorised payment, Lok Adalat
✓ Settled vs Closed, CIBIL rebuild — magic numbers par bharosa mat kijiye
✓ Aapka 8-step plan

CHAPTERS
{chr(10).join(chap)}

English subtitles available (CC).

IMPORTANT: Yeh video sirf awareness ke liye hai — legal ya financial advice nahi. Bank policies aur rules badal sakte hain. Apne case ke liye qualified advocate ya financial counsellor se verify kijiye.
This video is for awareness only and is not legal or financial advice. Rules and bank practices vary and may change; please verify your own situation with a qualified advocate or financial counsellor. Settlement figures are reported borrower experiences, not guarantees; examples on screen are illustrations.

RBI complaint portal: https://cms.rbi.org.in · Emergency: 112

Next video: mera apna case — banks ke saath mera actual process, step by step. Subscribe kijiye aur bell 🔔 → All notifications select kijiye.
Video useful lage to jinhe zaroorat hai unke saath share kijiye.

MUSIC
"Lightless Dawn", "Sincerely", "Inspired" Kevin MacLeod (incompetech.com)
Licensed under Creative Commons: By Attribution 4.0 License
http://creativecommons.org/licenses/by/4.0/

#CreditCardDebt #Hinglish #KnowYourRights #CIBIL #LokAdalat #DebtFreeIndia
"""
    open(os.path.join(out, 'youtube_description.md'), 'w').write(desc)
    print(f'total {ts(total, srt=False)} · {n - 1} captions · {len(chap)} chapters')


if __name__ == '__main__':
    main()
