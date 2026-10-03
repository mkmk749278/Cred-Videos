"""Loudness master for a finished video (video stream copied untouched).

Integrated loudness to the target (default -14 LUFS for YouTube) with a true-peak ceiling of -1.5 dBTP,
measured with 4x oversampling. The bundled ffmpeg has no limiter (and loudnorm's linear mode does not
limit), so the audio is processed in Python: normalise -> peak limit -> re-normalise, iterated until both
targets hold, then muxed back as AAC.

Usage: python3 scripts/master_audio.py <in.mp4> <out.mp4> [target LUFS]
"""
import os
import subprocess
import sys
import tempfile
import warnings

import numpy as np
import pyloudnorm as pyln
import soundfile as sf
from pedalboard import Limiter
from scipy.signal import resample_poly

warnings.filterwarnings('ignore')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FF_DIR = os.path.join(ROOT, 'node_modules/@remotion/compositor-linux-x64-gnu')
FFMPEG = os.path.join(FF_DIR, 'ffmpeg')
ENV = dict(os.environ, LD_LIBRARY_PATH=FF_DIR)
TP_CEIL = -1.5


def true_peak_db(x, block=48000 * 30, pad=256):
    """4x-oversampled peak, in blocks (a whole 33 min film upsampled at once needs > 14 GB)."""
    peak = 0.0
    for a in range(0, len(x), block):
        lo = max(0, a - pad)
        seg = resample_poly(x[lo: a + block + pad], 4, 1, axis=0)
        k = (a - lo) * 4
        peak = max(peak, float(np.max(np.abs(seg[k: k + block * 4]))))
    return 20 * np.log10(peak + 1e-12)


def main():
    src, dst = sys.argv[1], sys.argv[2]
    target = float(sys.argv[3]) if len(sys.argv) > 3 else -14.0
    with tempfile.TemporaryDirectory() as tmp:
        wav = os.path.join(tmp, 'a.wav')
        subprocess.run([FFMPEG, '-v', 'error', '-y', '-i', src, '-vn', '-ar', '48000', '-ac', '2', wav], check=True, env=ENV)
        x, sr = sf.read(wav, dtype='float32')
        meter = pyln.Meter(sr)
        in_lufs = meter.integrated_loudness(x)
        in_tp = true_peak_db(x)
        y = pyln.normalize.loudness(x, in_lufs, target)
        thresh = TP_CEIL - 1.0
        for _ in range(6):
            if true_peak_db(y) <= TP_CEIL:
                break
            y = Limiter(threshold_db=thresh, release_ms=120)(y, sr)
            y = pyln.normalize.loudness(y, meter.integrated_loudness(y), target)
            thresh -= 0.7
        tp = true_peak_db(y)
        if tp > TP_CEIL:  # last resort: trade a little loudness for the ceiling
            y *= 10 ** ((TP_CEIL - tp) / 20)
        out_wav = os.path.join(tmp, 'm.wav')
        sf.write(out_wav, y, sr, subtype='FLOAT')
        subprocess.run(
            [FFMPEG, '-y', '-hide_banner', '-loglevel', 'error', '-i', src, '-i', out_wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', dst],
            check=True, env=ENV,
        )
    print(f'mastered: input {in_lufs:.2f} LUFS / {in_tp:.2f} dBTP -> {meter.integrated_loudness(y):.2f} LUFS / {true_peak_db(y):.2f} dBTP')


if __name__ == '__main__':
    main()
