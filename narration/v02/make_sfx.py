"""Procedural SFX for video 02 -> public/v02/sfx/*.wav (44.1 kHz mono 16-bit)."""
import numpy as np, wave
SR = 44100
rng = np.random.default_rng(3)
def env(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
def save(name, x):
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.89
    with wave.open(f'public/v02/sfx/{name}.wav', 'w') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())
def tone(f, dur, a=0.002, d=0.3, partials=((1, 1),)):
    n = int(SR * dur); t = np.arange(n) / SR
    return sum(g * np.sin(2 * np.pi * f * k * t) for k, g in partials) * env(n, a, d)
def pad(x, n): return np.pad(x, (0, max(0, n - len(x))))
# cash register: drawer clunk + two bright bell strikes
n = int(SR * 1.2)
clunk = rng.normal(0, 1, int(SR * 0.08)) * env(int(SR * 0.08), 0.001, 0.02)
clunk = np.convolve(clunk, np.ones(30) / 30, 'same') * 2.5
bell = lambda f: tone(f, 1.1, 0.001, 0.35, ((1, 1), (2.76, 0.5), (5.4, 0.25), (8.9, 0.1)))
x = pad(clunk, n) + 0.6 * pad(np.concatenate([np.zeros(int(SR * 0.09)), bell(2093)]), n)[:n] + 0.5 * pad(np.concatenate([np.zeros(int(SR * 0.19)), bell(2637)]), n)[:n]
save('cash', x)
# glitch: bit-crushed noise + square bursts with stutters
n = int(SR * 0.45); x = np.zeros(n)
for i in range(9):
    s = int(rng.uniform(0, n - 3000)); L = int(rng.uniform(800, 3000))
    t = np.arange(L) / SR
    sq = np.sign(np.sin(2 * np.pi * rng.uniform(80, 900) * t))
    nz = np.round(rng.normal(0, 1, L) * 4) / 4
    x[s:s + L] += (sq * 0.6 + nz * 0.5) * rng.uniform(0.4, 1)
x = np.round(x * 6) / 6
save('glitch', x * env(n, 0.001, 0.25))
# low alert: two low beeps
b = lambda f: tone(f, 0.22, 0.004, 0.12, ((1, 1), (3, 0.3), (5, 0.12)))
x = np.concatenate([b(330), np.zeros(int(SR * 0.06)), b(247), np.zeros(int(SR * 0.2))])
save('alert', x)
# receipt printer tick: short buzzy dot-matrix
L = int(SR * 0.16); t = np.arange(L) / SR
x = np.sign(np.sin(2 * np.pi * 180 * t)) * (np.sin(2 * np.pi * 34 * t) > 0) * 0.5 + rng.normal(0, 0.3, L)
x = np.convolve(x, np.ones(6) / 6, 'same') * env(L, 0.002, 0.07)
save('print', x)
# outro sting: rising major arpeggio + shimmer
parts = []
for i, f in enumerate([523.25, 659.25, 783.99, 1046.5]):
    parts.append(np.concatenate([np.zeros(int(SR * 0.09 * i)), tone(f, 1.6, 0.005, 0.6, ((1, 1), (2, 0.3), (3, 0.12)))]))
n = max(len(p) for p in parts)
x = sum(pad(p, n) for p in parts)
sh = rng.normal(0, 1, n) * env(n, 0.3, 0.5) * 0.08
save('sting', x + np.convolve(sh, [1, -1], 'same'))
print('ok')
