"""Build narration/hinglish/map.json + inserts.json (Hinglish-audio seconds) from the English edition.

The creator's Hinglish narration (narration/hinglish/full.mp3) is a translation of the same script the creator
read for the English edition, sentence by sentence. We have both as English text with times:
  - publish/english/captions_en.srt  the English edition's captions (the creator's transcript, timed from the
                            English audio's word timestamps), mapped back from video seconds to English full.mp3
                            seconds through narration/english/{map,remap}.json — the inverse of the render's cut
  - out/hi/translate.json   faster-whisper's English translation of the Hinglish audio (task=translate),
                            segment + word times in Hinglish seconds
Sentences are aligned monotonically (the same DP as narration/english/build_from_te.py), giving a
piecewise-linear map English-second -> Hinglish-second. Every module boundary, anchor, insert window, item and
demo beat of the English edition (narration/english/{map,inserts}.json, its phrase overrides already applied)
is carried through that map; module boundaries snap to Hinglish sentence edges.

Fixes go in narration/hinglish/overrides.json — same shape as the English one; values are Hinglish full.mp3
seconds (numbers), an English phrase of the translation (resolved in out/hi/translate.json near the mapped
time), or 9999 (beat not shown).

Usage: python3 narration/hinglish/build_from_enh.py   (then: python3 narration/process_telugu.py --lang hi)
"""
import json
import math
import os
import re
import sys

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'narration/english'))
import build_from_te as B  # noqa: E402

HI = os.path.join(ROOT, 'narration/hinglish')
EN = os.path.join(ROOT, 'narration/english')


def sentences(path):
    segs = json.load(open(path))
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


def english_captions():
    """English-edition caption lines in English full.mp3 seconds (inverse of make_publish_kit_enh.to_video)."""
    sys.path.insert(0, os.path.join(ROOT, 'scripts'))
    from make_publish_kit_te import FPS, LEAD, TAIL, TITLE_FRAMES, VO_AT
    te = json.load(open(os.path.join(ROOT, 'src/data/timing_enh.json')))
    mp = json.load(open(os.path.join(EN, 'map.json')))
    rm = json.load(open(os.path.join(EN, 'remap.json')))
    cold = (VO_AT + round(te['hook']['duration'] * FPS) + 14 + TITLE_FRAMES) / FPS
    starts, t = [('hook', VO_AT / FPS)], cold
    for m in te['modules']:
        starts.append((m['id'], t + LEAD))
        t += math.ceil((LEAD + m['duration'] + TAIL) * FPS) / FPS

    def to_full(v):
        mid, s0 = [x for x in starts if x[1] <= v + 0.3][-1] if v + 0.3 >= starts[0][1] else starts[0]
        r = rm[mid]
        grid = np.arange(0, mp[mid]['end'] - mp[mid]['start'] + 2, 0.01)
        new = grid - np.interp(grid, r['xs'], r['removed'])
        return float(np.interp(v - s0, new, grid)) + r['cut_start']

    def sec(x):
        h, m_, rest = x.split(':')
        return int(h) * 3600 + int(m_) * 60 + float(rest.replace(',', '.'))
    out = []
    for blk in open(os.path.join(ROOT, 'publish/english/captions_en.srt')).read().strip().split('\n\n'):
        ln = blk.split('\n')
        a, b = ln[1].split(' --> ')
        out.append({'s': round(to_full(sec(a)), 2), 'e': round(to_full(sec(b)), 2), 'text': ' '.join(ln[2:])})
    return out


def main():
    E = english_captions()
    H = sentences(os.path.join(ROOT, 'out/hi/translate.json'))
    A = [[s['s'], s['e'], s['text']] for s in E]
    path, ta, tb = B.align(A, H)
    pairs, report = [], []
    for (i, j), (ii, jj) in path:
        if ii > i and jj > j:
            sc = B.sim(set().union(*ta[i:ii]), set().union(*tb[j:jj]))
            report.append((round(A[i][0], 1), round(H[j]['s'], 1), round(sc, 2), A[i][2][:70], H[j]['text'][:70]))
            if sc >= 0.2:
                pairs.append((A[i][0], H[j]['s']))
                pairs.append((A[ii - 1][1], H[jj - 1]['e']))
    pairs.sort()
    xs, ys = [0.0], [0.0]
    for x, y in pairs:
        if x > xs[-1] + 0.05 and y > ys[-1] + 0.05:
            xs.append(x)
            ys.append(y)
    en_end = A[-1][1] + 2
    xs.append(en_end + 60)
    ys.append(H[-1]['e'] + 2 + 60 * (H[-1]['e'] / A[-1][1]))
    f = lambda t: round(float(np.interp(t, xs, ys)), 2)  # noqa: E731
    json.dump({'xs': xs, 'ys': ys}, open(os.path.join(HI, 'en_to_hi.json'), 'w'))
    os.makedirs(os.path.join(ROOT, 'out/hi'), exist_ok=True)
    with open(os.path.join(ROOT, 'out/hi/align_report.tsv'), 'w') as fh:
        for r in report:
            fh.write('\t'.join(map(str, r)) + '\n')

    # phrase overrides resolve in the translation's words
    B.LANG = 'hi'
    res = B.resolver()
    starts = [s['s'] for s in H]
    ends = [s['e'] for s in H]
    snap_start = lambda t: min(starts, key=lambda s: abs(s - t))  # noqa: E731
    mp_en = json.load(open(os.path.join(EN, 'map.json')))
    ov = json.load(open(os.path.join(HI, 'overrides.json')))
    order = ['hook'] + [f'm{k:02d}' for k in range(1, 14)]
    st = {}
    for k in order:
        o = ov.get('modules', {}).get(k, {})
        st[k] = 0.0 if k == 'hook' else (res(o['start'], f(mp_en[k]['start'])) if 'start' in o else snap_start(f(mp_en[k]['start'])))
    mp = {}
    for n_, k in enumerate(order):
        nxt = st[order[n_ + 1]] if n_ + 1 < len(order) else H[-1]['e'] + 0.5
        end = max(e for e in ends if e <= nxt + 0.05) if n_ + 1 < len(order) else H[-1]['e']
        if 'end' in ov.get('modules', {}).get(k, {}):
            end = res(ov['modules'][k]['end'], end)
        mp[k] = {'start': round(st[k], 2), 'end': round(end, 2),
                 'anchors': [[a[0], f(a[1])] + list(a[2:]) for a in mp_en[k].get('anchors', [])]}
        for a in mp[k]['anchors']:
            if a[0] in ov.get('map', {}).get(k, {}):
                a[1] = res(ov['map'][k][a[0]], a[1])
        mp[k]['anchors'] = [a for a in mp[k]['anchors'] if mp[k]['start'] < a[1] < mp[k]['end']]
    json.dump(mp, open(os.path.join(HI, 'map.json'), 'w'), indent=1)

    ins_en = json.load(open(os.path.join(EN, 'inserts.json')))
    out = {}
    for k, items in ins_en.items():
        lst = []
        for ins in items:
            ins = json.loads(json.dumps(ins))
            ins['from'], ins['to'] = f(ins['from']), f(ins['to'])
            for it in ins.get('items', []):
                it['at'] = f(it['at'])
            if 'beats' in ins:
                ins['beats'] = {b: (9999 if v == 9999 else f(v)) for b, v in ins['beats'].items()}
            o = ov.get('inserts', {}).get(k, {}).get(ins.get('demo') or ins.get('title'), {})
            for b, v in o.get('beats', {}).items():
                assert b in ins['beats'], (k, b)
                ins['beats'][b] = 9999 if v == 9999 else res(v, ins['beats'][b] if ins['beats'][b] != 9999 else ins['from'])
            for it, v in zip(ins.get('items', []), o.get('items', [])):
                if v is not None:
                    it['at'] = res(v, it['at'])
            if o.get('from') is not None:
                ins['from'] = res(o['from'], ins['from'])
            if o.get('to') is not None:
                ins['to'] = res(o['to'], ins['to'])
            lst.append(ins)
        out[k] = lst
    json.dump(out, open(os.path.join(HI, 'inserts.json'), 'w'), ensure_ascii=False, indent=1)
    good = sum(1 for r in report if r[2] >= 0.2)
    print(f'english sentences {len(A)}, hinglish sentences {len(H)}, matched pairs {len(report)} (good {good}), map points {len(xs)}')
    for k in order:
        print(k, mp[k]['start'], mp[k]['end'], len(mp[k]['anchors']))


if __name__ == '__main__':
    main()
