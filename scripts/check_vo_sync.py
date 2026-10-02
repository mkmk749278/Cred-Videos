#!/usr/bin/env python3
"""Verify the locked Telugu narration inside a final export (PCM level).

For each module, cross-correlates the narration file actually used by the render
(public/audio/vo_te/<id>.mp3, cut from the locked narration/telugu/full.mp3) against the export's
audio at the position the timeline expects, and reports the lag and the normalised correlation.
Optionally compares the whole mix with a reference export (e.g. the approved v2).
Usage: python3 scripts/check_vo_sync.py export.mp4 [reference.mp4]
"""
import json
import math
import sys

import av
import numpy as np

SR = 8000
FPS, LEAD, TAIL, VO_AT, TITLE_FRAMES = 30, 1.0, 1.4, 10, 84


def load(path):
    out = []
    with av.open(path) as c:
        rs = av.AudioResampler(format='s16', layout='mono', rate=SR)
        for fr in c.decode(c.streams.audio[0]):
            for r in rs.resample(fr):
                out.append(r.to_ndarray().reshape(-1))
        for r in rs.resample(None):
            out.append(r.to_ndarray().reshape(-1))
    return np.concatenate(out).astype(np.float32) / 32768


def env(x, hop=80):  # 10 ms RMS envelope: robust to music/SFX beds
    n = len(x) // hop
    return np.sqrt((x[: n * hop].reshape(n, hop) ** 2).mean(1))


import os as _o; _L=_o.environ.get('VO_LANG','te'); te = json.load(open(f'src/data/timing_{_L}.json'))
mix = load(sys.argv[1])
ref = load(sys.argv[2]) if len(sys.argv) > 2 else None
t = (VO_AT + round(te['hook']['duration'] * FPS) + 14 + TITLE_FRAMES) / FPS
starts = {'hook': VO_AT / FPS}
for m in te['modules']:
    starts[m['id']] = t + LEAD
    t += math.ceil((LEAD + m['duration'] + TAIL) * FPS) / FPS
print(f'export {len(mix) / SR:.2f}s, timeline {t:.2f}s' + (f', reference {len(ref) / SR:.2f}s' if ref is not None else ''))
worst = 0
for mid, s0 in starts.items():
    vo = env(load(f'public/audio/vo_{_L}/{mid}.mp3'))
    e = env(mix)
    i0 = int(round(s0 * 100))
    best = (-1, 0)
    for lag in range(-50, 51):  # ±0.5 s in 10 ms steps
        a = i0 + lag
        seg = e[a: a + len(vo)]
        if a < 0 or len(seg) < len(vo):
            continue
        c = np.corrcoef(seg, vo)[0, 1]
        if c > best[0]:
            best = (c, lag)
    line = f'{mid:5s} start {s0:8.2f}s  lag {best[1] * 10:+4d} ms  corr {best[0]:.3f}'
    if ref is not None:
        a, b = int(s0 * SR), int((s0 + len(vo) / 100) * SR)
        cr = np.corrcoef(env(mix[a:b]), env(ref[a:b]))[0, 1]
        line += f'  vs reference {cr:.3f}'
    worst = max(worst, abs(best[1] * 10))
    print(line)
print(f'max |lag| {worst} ms (1 frame = 33 ms)')
