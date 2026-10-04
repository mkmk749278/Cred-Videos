#!/usr/bin/env python3
"""Frame ranges (per output chunk) that changed with the clean insert hand-off (fadeWindow), for patch renders.

Reads src/data/inserts_<lang>.json and the fan-out plan (for split chunks); writes out/patch/ranges.json:
[{"comp": "Scene07", "chunk": "Scene07_b", "a": comp_frame, "b": comp_frame, "off": chunk_offset}, ...]
Usage: python3 scripts/handoff_ranges.py <lang> out/fanout/<prefix>/plan.json
"""
import json
import re
import sys

lang, plan = sys.argv[1], json.load(open(sys.argv[2]))
ins = json.load(open(f'src/data/inserts_{lang}.json'))
f = lambda s: round((1 + s) * 30)
FADE, PAD = 12, 3
split = {}  # comp -> [(start, end, chunk)]
for w in plan['workers']:
    for j in w['jobs'].split():
        m = re.match(r'(\w+)@(\d+)-(\d+):(\w+)', j)
        if m:
            split.setdefault(m[1], []).append((int(m[2]), int(m[3]), m[4]))
out = []
for mid, L in sorted(ins.items()):
    comp = f'Scene{mid[1:]}'
    L = sorted(L, key=lambda x: x['from'])
    rs = []
    for x, y in zip(L, L[1:]):
        b, a = f(x['to']), f(y['from'])
        if a - FADE < b + FADE:
            m = min(b, a)
            rs.append([min(a - FADE, m - 8) - PAD, max(b + FADE, m + FADE) + PAD])
    rs.sort()
    merged = []
    for r in rs:
        if merged and r[0] <= merged[-1][1] + 1:
            merged[-1][1] = max(merged[-1][1], r[1])
        else:
            merged.append(r)
    for a, b in merged:
        for s, e, ch in split.get(comp, [(0, 10**9, comp)]):
            lo, hi = max(a, s), min(b, e)
            if lo <= hi:
                out.append({'comp': comp, 'chunk': ch, 'a': lo, 'b': hi, 'off': s})
json.dump(out, open('out/patch/ranges.json', 'w'), indent=1)
print(len(out), 'ranges,', sum(r['b'] - r['a'] + 1 for r in out), 'frames')
