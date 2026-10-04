#!/usr/bin/env python3
"""Master the Short 01 soundtrack from the float mix and mux it onto the rendered picture.

Gain to the loudness target, then a transparent lookahead peak limiter (gain computed on the 4x-oversampled
signal, 5 ms lookahead, smooth release) so only the few speech peaks are touched. True peak is verified
<= -1.5 dBTP after AAC-independent oversampled measurement.

    python3 short01/master.py <video_in.mp4> <out.mp4> [target LUFS, default -14]
"""
import os, subprocess, sys, tempfile
import numpy as np
import soundfile as sf
import pyloudnorm as pyln
from scipy.signal import resample_poly
from scipy.ndimage import minimum_filter1d, uniform_filter1d

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
FF_DIR = os.path.join(ROOT, 'node_modules/@remotion/compositor-linux-x64-gnu')
FF = os.path.join(FF_DIR, 'ffmpeg')
ENV = dict(os.environ, LD_LIBRARY_PATH=FF_DIR)
SR = 48000
CEIL = -2.0  # limiter ceiling (dBTP) — leaves margin for the AAC encode under the -1.5 dBTP spec


def tp_db(x):
    return 20 * np.log10(np.max(np.abs(resample_poly(x, 4, 1, axis=0))) + 1e-12)


def limit(x, ceil_db, look_ms=5, rel_ms=60):
    up = np.max(np.abs(resample_poly(x, 4, 1, axis=0)), axis=1)
    peak = up.reshape(-1, 4).max(axis=1)[: len(x)]
    c = 10 ** (ceil_db / 20)
    g = np.minimum(1.0, c / np.maximum(peak, 1e-9))
    la = int(SR * look_ms / 1000)
    g = minimum_filter1d(g, size=2 * la + 1)          # gain reaches its floor before the peak arrives
    g = uniform_filter1d(g, size=la)                  # smooth attack
    # release: one-pole recovery toward 1
    a = np.exp(-1.0 / (SR * rel_ms / 1000))
    out = np.empty_like(g)
    s = 1.0
    for i, v in enumerate(g):
        s = v if v < s else a * s + (1 - a) * v
        out[i] = s
    return x * out[:, None], out


def main():
    src, dst = sys.argv[1], sys.argv[2]
    target = float(sys.argv[3]) if len(sys.argv) > 3 else -14.0
    x, sr = sf.read(os.path.join(ROOT, 'public', 'short01', 'mix.wav'), dtype='float64')
    assert sr == SR
    m = pyln.Meter(SR)
    lin = m.integrated_loudness(x)
    y = x * 10 ** ((target - lin) / 20)
    for _ in range(4):
        y, g = limit(y, CEIL)
        y *= 10 ** ((target - m.integrated_loudness(y)) / 20)
        if tp_db(y) <= CEIL + 0.3:
            break
    peak = tp_db(y)
    if peak > -1.5:
        y *= 10 ** ((-1.6 - peak) / 20)
    gr = 20 * np.log10(np.min(g))
    with tempfile.TemporaryDirectory() as tmp:
        wav = os.path.join(tmp, 'm.wav')
        sf.write(wav, y.astype(np.float32), SR, subtype='FLOAT')
        subprocess.run([FF, '-v', 'error', '-y', '-i', src, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
                        '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-movflags', '+faststart', dst], check=True, env=ENV)
        # verify the encoded result
        chk = os.path.join(tmp, 'c.wav')
        subprocess.run([FF, '-v', 'error', '-y', '-i', dst, '-vn', '-ac', '2', '-ar', '48000', chk], check=True, env=ENV)
        z, _ = sf.read(chk)
    print(f'master: mix {lin:.2f} LUFS -> {m.integrated_loudness(y):.2f} LUFS, max gain reduction {gr:.1f} dB, '
          f'TP pre-encode {tp_db(y):.2f} dBTP, encoded {m.integrated_loudness(z):.2f} LUFS / {tp_db(z):.2f} dBTP')


if __name__ == '__main__':
    main()
