"""English edition (the creator's own English narration) publishing kit.

Writes publish/english/captions_en.srt and chapters.txt. Caption TEXT is the creator's transcript
(narration/english/transcript.md) verbatim; caption TIMES come from the word timestamps of the English
audio (out/en/whisper.json), matched word-by-word (difflib), then mapped from full.mp3 seconds to video
seconds through narration/english/map.json + remap.json — the same cut/pause remap the render uses.
"""
import difflib
import json
import math
import os
import re
import sys

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'scripts'))
from make_publish_kit_te import CHAPTERS, FPS, LEAD, TAIL, TITLE_FRAMES, VO_AT, split_caption, ts  # noqa: E402

CH_EN = {k: v.split(' · ')[-1] for k, v in CHAPTERS.items()}


def norm(w):
    w = w.lower().replace('’', "'")
    w = {'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5', 'seven': '7', 'eight': '8', 'ten': '10', 'twenty': '20',
         'thirty': '30', 'forty': '40', 'fifty': '50', 'sixty': '60', 'ninety': '90'}.get(w, w)
    return re.sub(r"[^a-z0-9]", '', w)


def main():
    text = open(os.path.join(ROOT, 'narration/english/transcript.md')).read()
    sents = [s.strip() for s in re.split(r'(?:(?<=[.?!])|(?<=[.?!]["”]))\s+(?=[A-Z“"\'])', ' '.join(text.split())) if s.strip()]
    segs = json.load(open(os.path.join(ROOT, 'out/en/whisper.json')))
    W = [w for s in segs for w in s['words']]
    wn = [norm(w['w']) for w in W]
    toks, owner = [], []
    for si, s in enumerate(sents):
        for t in s.split():
            n = norm(t)
            if n:
                toks.append(n)
                owner.append(si)
    sm = difflib.SequenceMatcher(None, toks, wn, autojunk=False)
    t2w = {}
    for a, b, n in sm.get_matching_blocks():
        for k in range(n):
            t2w[a + k] = b + k
    rows = []
    for si, s in enumerate(sents):
        idx = [i for i, o in enumerate(owner) if o == si]
        hit = [t2w[i] for i in idx if i in t2w]
        if not hit:
            rows.append([None, None, s])
            continue
        rows.append([W[min(hit)]['s'], W[max(hit)]['e'], s])
    # fill unmatched sentences by interpolating between neighbours
    for i, r in enumerate(rows):
        if r[0] is None:
            prev = next((rows[j][1] for j in range(i - 1, -1, -1) if rows[j][1] is not None), 0.0)
            nxt = next((rows[j][0] for j in range(i + 1, len(rows)) if rows[j][0] is not None), prev + 2)
            r[0], r[1] = prev + 0.05, max(prev + 0.8, nxt - 0.05)
    matched = sum(1 for i in range(len(toks)) if i in t2w)
    print(f'transcript sentences {len(sents)}, words matched {matched}/{len(toks)}')

    te = json.load(open(os.path.join(ROOT, 'src/data/timing_enh.json')))
    mp = json.load(open(os.path.join(ROOT, 'narration/english/map.json')))
    rm = json.load(open(os.path.join(ROOT, 'narration/english/remap.json')))
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

    out = os.path.join(ROOT, 'publish/english')
    os.makedirs(out, exist_ok=True)
    lines, n, last = [], 1, 0.0
    for a, b, s in rows:
        va, vb = to_video(a), to_video(b)
        va = max(va, last)
        for ca, cb, ct in split_caption(va, max(vb, va + 0.8), s):
            lines += [str(n), f'{ts(ca)} --> {ts(cb)}', ct, '']
            n += 1
            last = cb
    open(os.path.join(out, 'captions_en.srt'), 'w').write('\n'.join(lines))
    chap = ['0:00 Introduction']
    for m in te['modules']:
        chap.append(f"{ts(starts[m['id']] - LEAD, srt=False)} {CH_EN[m['id']]}")
    open(os.path.join(out, 'chapters.txt'), 'w').write('\n'.join(chap) + '\n')
    print(f'total {ts(total, srt=False)} · {n - 1} captions · {len(chap)} chapters')


if __name__ == '__main__':
    main()
