#!/usr/bin/env python3
"""Concatenate chunk audio trimmed to each chunk's exact video length (frames / fps).

Remotion's AAC tracks run ~40-60 ms longer than the video (encoder padding). Concatenating them with
`concat -c copy` stacks that padding, so the narration slides later at every chunk boundary
(~0.6 s by the end of a 14-chunk film). This writes one gap-free 48 kHz WAV aligned to the video.
Usage: python3 scripts/join_audio.py out.wav chunk1.mp4 chunk2.mp4 ...
"""
import sys

import av
import numpy as np
import soundfile as sf

SR = 48000
parts = []
for path in sys.argv[2:]:
    with av.open(path) as c:
        v = c.streams.video[0]
        nfr = v.frames or sum(1 for _ in c.demux(v))
    with av.open(path) as c:
        fps = float(c.streams.video[0].average_rate)
        rs = av.AudioResampler(format='flt', layout='stereo', rate=SR)
        chunks = []
        for fr in c.decode(c.streams.audio[0]):
            for r in rs.resample(fr):
                chunks.append(r.to_ndarray().reshape(-1, 2) if r.to_ndarray().shape[0] != 2 else r.to_ndarray().T)
        for r in rs.resample(None):
            chunks.append(r.to_ndarray().reshape(-1, 2) if r.to_ndarray().shape[0] != 2 else r.to_ndarray().T)
    a = np.concatenate(chunks)
    need = int(round(nfr / fps * SR))
    a = a[:need] if len(a) >= need else np.pad(a, ((0, need - len(a)), (0, 0)))
    print(f'{path}: {nfr} frames, audio trimmed/padded to {need / SR:.3f}s')
    parts.append(a)
sf.write(sys.argv[1], np.concatenate(parts), SR, subtype='FLOAT')
