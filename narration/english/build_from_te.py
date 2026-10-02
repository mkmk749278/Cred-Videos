"""Build narration/english/map.json + inserts.json (English-audio seconds) from the Telugu edition.

The creator's English narration (full.mp3) and the Telugu narration cover the same content, sentence by
sentence. We have both as English text with times:
  - narration/telugu/english_transcript.md  — the Telugu audio's translation, timed in Telugu seconds
  - out/en/whisper.json                     — word timestamps of the English audio (faster-whisper)
Sentences are aligned monotonically (DP over word-overlap similarity), giving a piecewise-linear map
Telugu-second -> English-second. Every module boundary, anchor, insert window, item and demo beat of the
Telugu edition is carried through that map; module boundaries snap to English sentence edges.

Usage: python3 narration/english/build_from_te.py   (then: python3 narration/process_telugu.py --lang enh)
"""
import json
import os
import re
import sys

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'scripts'))
from make_publish_kit_te import transcript  # noqa: E402

STOP = set('the a an and or of to in is it you your i we that this for on be are with as at by do not no if so can will may but have has was what how'.split())
NUM = {'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5', 'eight': '8', 'seven': '7', 'ten': '10', 'twenty': '20', 'thirty': '30', 'ninety': '90', 'sixty': '60', 'lakh': '100000', 'hundred': '100', 'fifty': '50', 'forty': '40'}


def toks(s):
    out = []
    for w in re.findall(r"[a-z0-9]+", s.lower().replace('’', "'")):
        w = NUM.get(w, w)
        if w in STOP or len(w) < 3 and not w.isdigit():
            continue
        out.append(w[:6])  # crude stem
    return set(out)


def sim(a, b):
    if not a or not b:
        return 0.0
    return len(a & b) / (len(a | b) ** 0.5 * min(len(a), len(b)) ** 0.5)


def english_sentences():
    segs = json.load(open(os.path.join(ROOT, 'out/en/whisper.json')))
    words = [w for s in segs for w in s['words']]
    sents, cur = [], []
    for w in words:
        cur.append(w)
        if re.search(r'[.?!]["”]?$', w['w'].strip()):
            sents.append(cur)
            cur = []
    if cur:
        sents.append(cur)
    return [{'s': c[0]['s'], 'e': c[-1]['e'], 'text': ''.join(x['w'] for x in c).strip()} for c in sents]


def align(A, B):
    """monotonic DP: each step pairs 1-2 Telugu sentences with 1-2 English sentences, or skips one."""
    n, m = len(A), len(B)
    ta = [toks(x[2]) for x in A]
    tb = [toks(x['text']) for x in B]
    NEG = -1e9
    D = np.full((n + 1, m + 1), NEG)
    P = {}
    D[0, 0] = 0
    for i in range(n + 1):
        for j in range(m + 1):
            if D[i, j] == NEG:
                continue
            for di, dj in ((1, 1), (2, 1), (1, 2), (1, 0), (0, 1), (2, 2), (3, 1), (1, 3)):
                ii, jj = i + di, j + dj
                if ii > n or jj > m:
                    continue
                if di and dj:
                    sa = set().union(*ta[i:ii])
                    sb = set().union(*tb[j:jj])
                    sc = sim(sa, sb) - 0.05 * (di + dj - 2)
                else:
                    sc = -0.12
                if D[i, j] + sc > D[ii, jj]:
                    D[ii, jj] = D[i, j] + sc
                    P[(ii, jj)] = (i, j)
    path, cur = [], (n, m)
    while cur != (0, 0):
        prev = P[cur]
        path.append((prev, cur))
        cur = prev
    return path[::-1], ta, tb


def main():
    A = transcript()  # [start, end, text] in Telugu seconds
    B = english_sentences()
    path, ta, tb = align(A, B)
    pairs = []  # (telugu_sec, english_sec)
    report = []
    for (i, j), (ii, jj) in path:
        if ii > i and jj > j:
            sc = sim(set().union(*ta[i:ii]), set().union(*tb[j:jj]))
            report.append((round(A[i][0], 1), round(B[j]['s'], 1), round(sc, 2), A[i][2][:60], B[j]['text'][:60]))
            if sc >= 0.25:
                pairs.append((A[i][0], B[j]['s']))
                pairs.append((A[ii - 1][1], B[jj - 1]['e']))
    pairs.sort()
    xs, ys = [0.0], [0.0]
    for x, y in pairs:
        if x > xs[-1] + 0.05 and y > ys[-1] + 0.05:
            xs.append(x)
            ys.append(y)
    tel_end = A[-1][1] + 2
    xs.append(tel_end + 60)
    ys.append(B[-1]['e'] + 2 + 60 * (B[-1]['e'] / A[-1][1]))
    f = lambda t: round(float(np.interp(t, xs, ys)), 2)  # noqa: E731
    json.dump({'xs': xs, 'ys': ys}, open(os.path.join(ROOT, 'narration/english/te_to_en.json'), 'w'))
    with open(os.path.join(ROOT, 'out/en/align_report.tsv'), 'w') as fh:
        for r in report:
            fh.write('\t'.join(map(str, r)) + '\n')

    starts = [s['s'] for s in B]
    ends = [s['e'] for s in B]
    snap_start = lambda t: min(starts, key=lambda s: abs(s - t))  # noqa: E731
    mp_te = json.load(open(os.path.join(ROOT, 'narration/telugu/map.json')))
    order = ['hook'] + [f'm{k:02d}' for k in range(1, 14)]
    mp = {}
    st = {k: (0.0 if k == 'hook' else snap_start(f(mp_te[k]['start']))) for k in order}
    for n_, k in enumerate(order):
        nxt = st[order[n_ + 1]] if n_ + 1 < len(order) else B[-1]['e'] + 0.5
        end = max(e for e in ends if e <= nxt + 0.05) if n_ + 1 < len(order) else B[-1]['e']
        mp[k] = {'start': round(st[k], 2), 'end': round(end, 2),
                 'anchors': [[a[0], f(a[1])] + list(a[2:]) for a in mp_te[k].get('anchors', [])]}
        # anchors must stay inside the module and in order
        mp[k]['anchors'] = [a for a in mp[k]['anchors'] if mp[k]['start'] < a[1] < mp[k]['end']]
    json.dump(mp, open(os.path.join(ROOT, 'narration/english/map.json'), 'w'), indent=1)

    ins_te = json.load(open(os.path.join(ROOT, 'narration/telugu/inserts.json')))
    out = {}
    for k, items in ins_te.items():
        lst = []
        for ins in items:
            ins = json.loads(json.dumps(ins))
            ins['from'], ins['to'] = f(ins['from']), f(ins['to'])
            for it in ins.get('items', []):
                it['at'] = f(it['at'])
            if 'beats' in ins:
                ins['beats'] = {b: (9999 if v == 9999 else f(v)) for b, v in ins['beats'].items()}
            lst.append(ins)
        out[k] = lst
    json.dump(out, open(os.path.join(ROOT, 'narration/english/inserts.json'), 'w'), ensure_ascii=False, indent=1)
    good = sum(1 for r in report if r[2] >= 0.25)
    print(f'telugu sentences {len(A)}, english sentences {len(B)}, matched pairs {len(report)} (good {good}), map points {len(xs)}')
    for k in order:
        print(k, mp[k]['start'], mp[k]['end'], len(mp[k]['anchors']))


if __name__ == '__main__':
    main()
