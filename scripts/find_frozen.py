#!/usr/bin/env python3
"""Detect frozen foreground runs in a rendered video (pixel level).

Decodes the whole file once at 96x54 grayscale (PyAV), crops away the
top HUD and the bottom caption band, and reports runs where the foreground barely changes for at least
MIN seconds. Usage: python3 scripts/find_frozen.py video.mp4 [min_seconds=8] [threshold=1.2]
"""
import os
import sys

import av
import numpy as np

W, H, FPS = 96, 54, 30
path = sys.argv[1]
MIN = float(sys.argv[2]) if len(sys.argv) > 2 else 8.0
TH = float(sys.argv[3]) if len(sys.argv) > 3 else 1.2
with av.open(path) as c:
    st = c.streams.video[0]
    st.thread_type = 'AUTO'
    fr = np.stack([f.reformat(width=W, height=H, format='gray').to_ndarray() for f in c.decode(st)])
fg = fr[:, int(H * 0.09):int(H * 0.80), :]  # drop HUD (top) and caption band (bottom)
n = len(fg)
# change over a 1-second window, so slow moves still count
step = FPS
d = np.array([np.abs(fg[i].astype(np.int16) - fg[max(0, i - step)]).mean() for i in range(n)])
still = d < TH
runs, i = [], 0
while i < n:
    if still[i]:
        j = i
        while j < n and still[j]:
            j += 1
        a = max(0, i - step)
        if (j - a) / FPS >= MIN:
            runs.append((a / FPS, j / FPS))
        i = j
    else:
        i += 1
print(f'{os.path.basename(path)}: {n} frames ({n / FPS:.1f}s), frozen-foreground runs ≥{MIN:.0f}s: {len(runs)}')
for a, b in runs:
    m, s = divmod(a, 60)
    print(f'  {int(m)}:{s:05.2f} → {b - a:.1f}s')
