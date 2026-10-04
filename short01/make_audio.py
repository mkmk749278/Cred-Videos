#!/usr/bin/env python3
"""Short 01 soundtrack: the supplied ElevenLabs voice at frame 0 (untouched timing), plus quiet room tone,
procedural foley on the visual cues (paper slides, printer, terminal beep, highlighter swipes, phone tick)
and a faint warm pad. Writes an unmastered 48 kHz stereo mix; loudness is mastered on the final MP4
with scripts/master_audio.py (-16 LUFS, true peak <= -1.5 dBTP).

    python3 short01/make_audio.py   -> public/short01/mix.wav
"""
import os, json
import numpy as np
import av
import soundfile as sf
from scipy.signal import butter, sosfilt

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SR, FPS, N = 48000, 30, 1281
L = int(N / FPS * SR)
rng = np.random.default_rng(7)


def voice():
    c = av.open(os.path.join(HERE, 'audio', 'SHORT_01_ELEVENLABS_VOICE.mp3'))
    r = av.AudioResampler(format='flt', layout='mono', rate=SR)
    x = np.concatenate([f.to_ndarray().ravel() for p in c.decode(audio=0) for f in r.resample(p)])
    out = np.zeros(L, np.float32)
    out[:min(L, len(x))] = x[:L]
    return out


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], 'bandpass', fs=SR, output='sos'), x)


def env(n, a, d, shape=2.0):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / max(d, 1e-4))
    return e ** (shape / 2)


def at(f):
    return int(f / FPS * SR)


def add(bus, sig, frame, gain):
    i = at(frame)
    j = min(L, i + len(sig))
    bus[i:j] += sig[:j - i] * gain


def paper_slide(dur=0.45):
    n = int(dur * SR)
    x = bp(rng.standard_normal(n), 900, 7000)
    t = np.linspace(0, 1, n)
    e = np.sin(np.pi * t) ** 1.5 * (0.6 + 0.4 * np.abs(np.sin(t * 37)))
    return x * e


def printer(dur=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    motor = np.sin(2 * np.pi * 180 * t + 0.4 * np.sin(2 * np.pi * 22 * t)) * 0.4 + bp(rng.standard_normal(n), 1500, 5000) * 0.6
    steps = (np.sin(2 * np.pi * 44 * t) > 0.6).astype(float) * 0.5 + 0.5
    e = np.minimum(1, t / 0.04) * np.minimum(1, (dur - t) / 0.06)
    return motor * steps * e


def beep(f=2350, dur=0.12):
    n = int(dur * SR)
    t = np.arange(n) / SR
    return np.sin(2 * np.pi * f * t) * env(n, 0.004, 0.05) * 0.8


def swipe(dur):
    n = int(dur * SR)
    x = bp(rng.standard_normal(n), 2500, 9000)
    t = np.linspace(0, 1, n)
    return x * (np.sin(np.pi * t) ** 0.7)


def tick():
    n = int(0.03 * SR)
    return bp(rng.standard_normal(n), 2000, 8000) * env(n, 0.001, 0.006)


def room():
    x = rng.standard_normal(L)
    x = sosfilt(butter(1, 400, 'lowpass', fs=SR, output='sos'), x)
    return x / np.max(np.abs(x))


def pad():
    t = np.arange(L) / SR
    # slow warm chord changes (Dmaj9-ish → Bm7 → Gmaj7 → A), soft triangle-ish tones
    chords = [(0, [146.83, 220.0, 277.18, 329.63]), (11.0, [123.47, 185.0, 220.0, 293.66]),
              (21.5, [98.0, 196.0, 246.94, 293.66]), (32.0, [110.0, 164.81, 220.0, 277.18])]
    y = np.zeros(L)
    for k, (t0, fr) in enumerate(chords):
        t1 = chords[k + 1][0] if k + 1 < len(chords) else L / SR
        m = (t >= t0 - 1.5) & (t < t1 + 1.5)
        e = np.clip((t - (t0 - 1.5)) / 1.5, 0, 1) * np.clip(((t1 + 1.5) - t) / 1.5, 0, 1)
        for f in fr:
            y[m] += (np.sin(2 * np.pi * f * t[m]) + 0.12 * np.sin(2 * np.pi * 2 * f * t[m])) * e[m]
    y = sosfilt(butter(2, 1200, 'lowpass', fs=SR, output='sos'), y)
    fade = np.clip(t / 2.0, 0, 1) * np.clip((L / SR - t) / 2.5, 0, 1)
    return y / np.max(np.abs(y)) * fade


def main():
    v = voice()
    fx = np.zeros(L)
    db = lambda d: 10 ** (d / 20)
    # cues mirror short01/scene.py CUE/CUT
    add(fx, paper_slide(0.35), 108, db(-30))           # pen settles by the interest line
    add(fx, paper_slide(0.5), 204, db(-24))            # payment slip slides in under the May statement
    add(fx, beep(), 283, db(-22))                      # terminal approves ₹50,000
    add(fx, printer(1.0), 292, db(-30))                # 7 May receipt prints
    for a, b in [(335, 383), (410, 434), (442, 466), (474, 500), (533, 571), (581, 615)]:
        add(fx, swipe((b - a) / FPS), a, db(-36))      # highlighter strokes on the planner
    add(fx, paper_slide(0.55), 511, db(-24))           # slip lands at 1 June
    add(fx, paper_slide(0.45), 545, db(-25))           # ₹49,000 card
    add(fx, swipe(26 / FPS), 770, db(-34))             # amber mark on the interest line
    add(fx, beep(2500), 912, db(-22))                  # small-shop terminal approves
    add(fx, printer(0.9), 918, db(-30))                # 4 June receipt
    for a, b in [(993, 1023), (1031, 1055)]:
        add(fx, swipe((b - a) / FPS), a, db(-36))
    add(fx, tick(), 1112, db(-26))                     # phone wakes
    # place foley under the voice: duck effects 6 dB where the voice is loud
    ve = np.convolve(np.abs(v), np.ones(2400) / 2400, mode='same')
    duck = 1.0 - 0.5 * np.clip(ve / (np.percentile(ve, 95) + 1e-9), 0, 1)
    fx *= duck
    bed = room() * db(-46) + pad() * db(-33)
    bed *= 1.0 - 0.35 * np.clip(ve / (np.percentile(ve, 95) + 1e-9), 0, 1)
    mono = v + fx + bed
    # gentle stereo: voice centre, bed/foley slightly widened
    side = sosfilt(butter(1, 300, 'highpass', fs=SR, output='sos'), np.roll(bed + fx, 240)) * 0.25
    st = np.stack([mono + side, mono - side], 1).astype(np.float32)
    os.makedirs(os.path.join(ROOT, 'public', 'short01'), exist_ok=True)
    sf.write(os.path.join(ROOT, 'public', 'short01', 'mix.wav'), st, SR, subtype='FLOAT')
    print('mix', st.shape[0] / SR, 's  peak', float(np.max(np.abs(st))))


if __name__ == '__main__':
    main()
