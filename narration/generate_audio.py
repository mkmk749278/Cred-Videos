"""Procedurally synthesize every SFX and music bed used by the video (no external assets).

Usage: python3 narration/generate_audio.py
Writes public/audio/sfx/*.mp3 and public/audio/music/*.mp3
"""
import os

import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
rng = np.random.default_rng(7)


def t_(dur):
    return np.arange(int(dur * SR)) / SR


def env(dur, a=0.002, d=0.1, curve=6.0):
    t = t_(dur)
    e = np.exp(-curve * np.maximum(0, t - a) / max(d, 1e-4))
    e[t < a] = t[t < a] / a
    return e


def noise(dur):
    return rng.standard_normal(int(dur * SR))


def lowpass(x, cutoff):
    # one-pole low-pass, cutoff may be an array
    cutoff = np.broadcast_to(cutoff, x.shape)
    y = np.zeros_like(x)
    acc = 0.0
    k = 1 - np.exp(-2 * np.pi * cutoff / SR)
    for i in range(len(x)):
        acc += k[i] * (x[i] - acc)
        y[i] = acc
    return y


def highpass(x, cutoff):
    return x - lowpass(x, cutoff)


def bandpass(x, lo, hi):
    return highpass(lowpass(x, hi), lo)


def sine(f, dur, phase=0.0):
    t = t_(dur)
    if np.ndim(f):
        return np.sin(2 * np.pi * np.cumsum(f) / SR + phase)
    return np.sin(2 * np.pi * f * t + phase)


def pad_to(x, dur):
    n = int(dur * SR)
    return np.pad(x, (0, max(0, n - len(x))))[:n]


def mix(*parts, dur=None):
    n = max(len(p) for p in parts) if dur is None else int(dur * SR)
    out = np.zeros(n)
    for p in parts:
        out[: min(n, len(p))] += p[:n]
    return out


def at(x, offset, total):
    out = np.zeros(int(total * SR))
    i = int(offset * SR)
    seg = x[: max(0, len(out) - i)]
    out[i: i + len(seg)] += seg
    return out


def norm(x, peak=0.9):
    m = np.max(np.abs(x)) or 1
    return x / m * peak


def fade(x, fin=0.003, fout=0.02):
    x = x.copy()
    a, b = int(fin * SR), int(fout * SR)
    if a:
        x[:a] *= np.linspace(0, 1, a)
    if b:
        x[-b:] *= np.linspace(1, 0, b)
    return x


def write(name, x, peak=0.9, folder="sfx", stereo=False):
    x = norm(fade(x), peak)
    if stereo and x.ndim == 1:
        x = np.stack([x, x], axis=1)
    sf.write(os.path.join(ROOT, f"public/audio/{folder}/{name}.mp3"), x.astype(np.float32), SR, format="MP3", subtype="MPEG_LAYER_III")


# ---------------------------------------------------------------- SFX
def node_pop():
    d = 0.12
    f = 1200 * np.exp(-t_(d) * 18) + 700
    return sine(f, d) * env(d, 0.001, 0.035) + 0.15 * lowpass(noise(d), 3000) * env(d, 0.001, 0.01)


def tactile_click():
    d = 0.09
    body = sine(850, d) * env(d, 0.0005, 0.02)
    tick = bandpass(noise(d), 2500, 7000) * env(d, 0.0002, 0.004)
    low = sine(140, d) * env(d, 0.001, 0.03) * 0.6
    return body + 1.4 * tick + low


def haptic_tap():
    d = 0.08
    return sine(120, d) * env(d, 0.002, 0.03) + 0.3 * sine(240, d) * env(d, 0.001, 0.015)


def haptic_buzz():
    d = 1.6
    am = (np.sin(2 * np.pi * 2.2 * t_(d)) > -0.2).astype(float)
    am = lowpass(am, 40)
    return (sine(165, d) + 0.5 * sine(330, d) + 0.2 * np.sign(sine(165, d))) * am * 0.6


def sub_thud():
    d = 1.4
    f = 45 + 60 * np.exp(-t_(d) * 20)
    body = sine(f, d) * env(d, 0.003, 0.5, 4)
    hit = lowpass(noise(d), 900) * env(d, 0.001, 0.05)
    return body + 0.5 * hit


def plasma_sweep():
    d = 1.3
    t = t_(d)
    cutoff = 300 * (10 ** (t / d))
    x = bandpass(noise(d), cutoff * 0.7, cutoff * 1.3) * 2.5
    x += 0.25 * sine(200 + 1800 * (t / d) ** 2, d)
    return x * np.sin(np.pi * t / d) ** 0.7


def air_whoosh():
    d = 0.55
    t = t_(d)
    x = highpass(lowpass(noise(d), 1500 + 3000 * np.sin(np.pi * t / d)), 800)
    return x * np.sin(np.pi * t / d) ** 1.5


def call_disconnect():
    d = 0.7
    t = t_(d)
    tone = (sine(480, d) + sine(620, d)) * ((t % 0.25) < 0.12)
    return tone * np.exp(-t * 2)


def glass_shatter():
    d = 1.4
    out = np.zeros(int(d * SR))
    out += 1.2 * highpass(noise(d), 3000) * env(d, 0.001, 0.25, 5)
    for i in range(40):
        o = rng.uniform(0.0, 0.8)
        f = rng.uniform(2500, 9000)
        dd = rng.uniform(0.05, 0.3)
        out += at(sine(f, dd) * env(dd, 0.0005, dd / 3) * rng.uniform(0.1, 0.4), o, d)
    out += 0.8 * sine(90, d) * env(d, 0.002, 0.15)
    return out


def stamp_heavy():
    d = 0.6
    thud = sine(70 + 80 * np.exp(-t_(d) * 30), d) * env(d, 0.001, 0.18)
    slap = lowpass(noise(d), 2500) * env(d, 0.0005, 0.03)
    rattle = bandpass(noise(d), 400, 1500) * env(d, 0.02, 0.1) * 0.3
    return thud + 0.9 * slap + rattle


def chain_break():
    d = 1.2
    out = 0.7 * highpass(noise(d), 2000) * env(d, 0.001, 0.05)
    for f in [2100, 3150, 4730, 5900]:
        out += 0.35 * sine(f, d) * env(d, 0.001, 0.6, 4)
    for i in range(10):
        out += at(tactile_click() * 0.4, rng.uniform(0.05, 0.6), d)
    return out


def counter_tick():
    d = 0.03
    return bandpass(noise(d), 3000, 8000) * env(d, 0.0002, 0.004) + 0.4 * sine(2400, d) * env(d, 0.0005, 0.006)


def counter_spin():
    d = 1.6
    out = np.zeros(int(d * SR))
    t = 0.0
    while t < d - 0.05:
        out += at(counter_tick() * (0.6 + 0.4 * rng.random()), t, d)
        t += 0.045
    return out * np.linspace(1, 0.6, len(out))


def scale_drop():
    d = 1.2
    creak = bandpass(noise(0.4), 300, 900) * np.linspace(0, 1, int(0.4 * SR)) * 0.5
    clang = sum(0.3 * sine(f, d) * env(d, 0.001, 0.7, 4) for f in [320, 507, 811, 1290])
    return mix(creak, at(clang, 0.35, d), at(sub_thud()[: int(0.8 * SR)] * 0.6, 0.35, d), dur=d)


def vaporize():
    d = 1.8
    t = t_(d)
    sizzle = highpass(noise(d), 4000) * (0.5 + 0.5 * np.abs(noise(d)) ** 3 * 0.2)
    sizzle *= np.minimum(1, t * 4) * np.exp(-t * 1.2)
    drops = sum(at(node_pop() * 0.3, o, d) for o in [0.0, 0.08, 0.17, 0.25])
    return 0.6 * sizzle + drops


def block_slam():
    d = 0.8
    body = sine(60 + 90 * np.exp(-t_(d) * 25), d) * env(d, 0.001, 0.25)
    crack = lowpass(noise(d), 1800) * env(d, 0.0005, 0.06)
    return body + 0.8 * crack


def piston_clamp():
    d = 1.3
    hiss = highpass(noise(0.7), 2500) * np.linspace(1, 0, int(0.7 * SR)) * 0.5
    clamp = stamp_heavy() + 0.4 * chain_break()[: int(0.6 * SR)]
    return mix(hiss, at(clamp, 0.6, d), dur=d)


def shield_activate():
    d = 1.8
    t = t_(d)
    hum = (sine(110, d) + 0.5 * sine(220.5, d) + 0.3 * sine(330, d)) * np.minimum(1, t * 2) * np.exp(-t * 0.8)
    rise = sine(300 + 900 * np.minimum(1, t / 0.6), d) * np.exp(-t * 3) * 0.4
    return hum * 0.6 + rise + at(tactile_click(), 0.62, d)


def key_click():
    d = 0.05
    return bandpass(noise(d), 1500, 6000) * env(d, 0.0003, 0.008) + 0.3 * sine(400, d) * env(d, 0.0005, 0.01)


def typing():
    d = 1.4
    out = np.zeros(int(d * SR))
    t = 0.0
    while t < d - 0.06:
        out += at(key_click() * rng.uniform(0.5, 1), t, d)
        t += rng.uniform(0.05, 0.11)
    return out


def email_sent():
    d = 0.8
    return mix(air_whoosh(), at(sine(880, 0.3) * env(0.3, 0.005, 0.12) * 0.5, 0.35, d), at(sine(1320, 0.3) * env(0.3, 0.005, 0.12) * 0.4, 0.45, d), dur=d)


def buzzer():
    d = 0.6
    x = np.sign(sine(140, d)) * 0.5 + np.sign(sine(147, d)) * 0.5
    return lowpass(x, 2500) * env(d, 0.005, 0.5, 2)


def printer_blast():
    d = 1.5
    out = np.zeros(int(d * SR))
    t = 0.0
    while t < d - 0.02:
        out += at(bandpass(noise(0.012), 1000, 5000) * env(0.012, 0.0002, 0.004), t, d)
        t += 0.0085
    return out * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * t_(d)) ** 2)


def radar_ping():
    d = 1.2
    return sine(1750, d) * env(d, 0.003, 0.6, 3) + 0.3 * sine(3500, d) * env(d, 0.003, 0.2)


def dtmf(lo, hi, d=0.16):
    return (sine(lo, d) + sine(hi, d)) * 0.5 * env(d, 0.005, 1.0, 0.3)


def dial_112():
    d = 2.6
    one = dtmf(697, 1209)
    two = dtmf(697, 1336)
    out = mix(at(one, 0.0, d), at(one, 0.3, d), at(two, 0.6, d))
    steps = sum(at(lowpass(noise(0.08), 600) * env(0.08, 0.002, 0.03) * (1 - i / 10), 1.0 + i * 0.16, d) for i in range(9))
    return out + 0.8 * steps


def dialer_ring():
    d = 2.0
    t = t_(d)
    ring = (sine(440, d) + sine(480, d)) * ((t % 1.0) < 0.6)
    return ring * 0.5


def pages_flip():
    d = 1.6
    out = np.zeros(int(d * SR))
    t = 0.0
    while t < 1.1:
        dd = 0.07
        out += at(bandpass(noise(dd), 1500, 7000) * np.sin(np.pi * t_(dd) / dd), t, d)
        t += 0.05
    chime = sum(0.25 * sine(f, 1.0) * env(1.0, 0.01, 0.6, 3) for f in [784, 988, 1175])
    return out + at(chime, 1.15, d)


def gear_shift():
    d = 1.0
    grind = bandpass(noise(0.35), 200, 1200) * 0.6
    clunk = block_slam()[: int(0.5 * SR)]
    ding = sine(1568, 0.6) * env(0.6, 0.002, 0.3, 3) * 0.5
    return mix(grind, at(clunk, 0.3, d), at(ding, 0.55, d), dur=d)


def vault_open():
    d = 2.6
    clicks = sum(at(tactile_click() * 0.7, 0.08 * i, d) for i in range(10))
    creak = bandpass(noise(1.4), 150, 600) * np.sin(np.pi * t_(1.4) / 1.4) * 0.6
    boom = sub_thud()[: int(1.2 * SR)] * 0.7
    shimmer = sum(0.12 * sine(f, 1.2) * env(1.2, 0.2, 0.9, 2) for f in [1047, 1319, 1568, 2093])
    return mix(clicks, at(creak, 0.8, d), at(boom, 0.9, d), at(shimmer, 1.2, d), dur=d)


def card_slide():
    d = 0.35
    t = t_(d)
    return bandpass(noise(d), 1000, 5000) * np.sin(np.pi * t / d) ** 2 * 0.8


def grid_lock():
    d = 1.4
    chord = sum(0.3 * sine(f, d) * env(d, 0.005, 0.9, 3) for f in [523, 659, 784, 1047])
    return mix(chord, tactile_click(), dur=d)


def gavel_strike():
    d = 1.2
    knock = sine(180 + 200 * np.exp(-t_(d) * 40), d) * env(d, 0.0005, 0.08) + lowpass(noise(d), 3000) * env(d, 0.0003, 0.015)
    return knock + 0.5 * sub_thud()[: int(d * SR)]


def payment_success():
    d = 1.0
    return mix(at(sine(1047, 0.5) * env(0.5, 0.005, 0.3, 3), 0, d), at(sine(1568, 0.6) * env(0.6, 0.005, 0.4, 3), 0.12, d)) * 0.6


def gauge_drop():
    d = 1.0
    t = t_(d)
    return sine(900 * np.exp(-t * 2.2) + 80, d) * np.exp(-t * 1.5) * 0.5 + at(block_slam()[: int(0.4 * SR)] * 0.5, 0.7, d)


def slice_():
    d = 0.5
    t = t_(d)
    return highpass(noise(d), 3000) * np.exp(-((t - 0.12) / 0.06) ** 2) + 0.3 * sine(5000 - 6000 * t, d) * np.exp(-t * 8)


def card_insert():
    d = 0.6
    return mix(card_slide(), at(tactile_click(), 0.33, d), dur=d)


def triumph_rise():
    d = 3.0
    t = t_(d)
    rise = sine(220 * 2 ** (t * 1.2), d) * np.minimum(1, t) * (t < 2.0) * 0.25
    chord = sum(0.25 * sine(f, 2.0) * env(2.0, 0.02, 1.6, 2) for f in [523.25, 659.25, 783.99, 1046.5, 1318.5])
    return mix(rise, at(chord, 1.9, d), at(sub_thud()[: int(1.0 * SR)] * 0.5, 1.9, d), dur=d)


def warning_pulse():
    d = 0.9
    t = t_(d)
    return sine(660, d) * ((t % 0.3) < 0.15) * env(d, 0.001, 0.8, 1.5) * 0.6


def notification():
    d = 0.5
    return mix(sine(1318, 0.2) * env(0.2, 0.002, 0.1), at(sine(1760, 0.25) * env(0.25, 0.002, 0.12), 0.1, d), dur=d)


def title_hit():
    d = 2.2
    return mix(sub_thud(), at(sum(0.2 * sine(f, 1.8) * env(1.8, 0.01, 1.4, 2) for f in [196, 293.7, 392, 587.3]), 0.0, d), dur=d) + at(air_whoosh() * 0.4, 0, d)


SFX = {
    "node_pop": node_pop, "tactile_click": tactile_click, "haptic_tap": haptic_tap, "haptic_buzz": haptic_buzz,
    "sub_thud": sub_thud, "plasma_sweep": plasma_sweep, "air_whoosh": air_whoosh, "call_disconnect": call_disconnect,
    "glass_shatter": glass_shatter, "stamp_heavy": stamp_heavy, "chain_break": chain_break, "counter_spin": counter_spin,
    "scale_drop": scale_drop, "vaporize": vaporize, "block_slam": block_slam, "piston_clamp": piston_clamp,
    "shield_activate": shield_activate, "typing": typing, "key_click": key_click, "email_sent": email_sent,
    "buzzer": buzzer, "printer_blast": printer_blast, "radar_ping": radar_ping, "dial_112": dial_112,
    "dialer_ring": dialer_ring, "pages_flip": pages_flip, "gear_shift": gear_shift, "vault_open": vault_open,
    "card_slide": card_slide, "grid_lock": grid_lock, "gavel_strike": gavel_strike, "payment_success": payment_success,
    "gauge_drop": gauge_drop, "slice": slice_, "card_insert": card_insert, "triumph_rise": triumph_rise,
    "warning_pulse": warning_pulse, "notification": notification, "title_hit": title_hit,
}


# ---------------------------------------------------------------- music beds
def note(n):  # midi -> hz
    return 440 * 2 ** ((n - 69) / 12)


def pad_voice(freqs, dur, bright=900):
    t = t_(dur)
    x = np.zeros(len(t))
    for f in freqs:
        for det in (-0.12, 0.0, 0.11):
            ff = f * 2 ** (det / 12)
            x += np.sin(2 * np.pi * ff * t + rng.uniform(0, 6.28)) + 0.3 * np.sin(4 * np.pi * ff * t)
    x = lowpass(x, bright)
    swell = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 0.8
    return x * swell


def bed(chords, bar, bright, pulse=None, sub=True, loops=2):
    """Chord progression pad; length = len(chords)*bar*loops, made seamless by cross-fading."""
    body_len = len(chords) * bar * loops
    total = body_len + bar
    out = np.zeros(int(total * SR))
    seq = chords * (loops + 1)
    for i, ch in enumerate(seq):
        start = i * bar
        if start >= total:
            break
        seg = pad_voice([note(n) for n in ch], bar * 1.5, bright)
        if sub:
            seg += 0.6 * pad_voice([note(ch[0] - 12)], bar * 1.5, 200)
        out += at(seg, start - bar * 0.25 if i else 0, total)
    if pulse:
        rate, freq = pulse
        t = t_(total)
        tick = (np.sin(2 * np.pi * rate * t) > 0.97).astype(float)
        out += 0.25 * lowpass(tick * np.sin(2 * np.pi * freq * t), 3000) * np.max(np.abs(out)) / 3
    n = int(body_len * SR)
    xf = int(bar * SR)
    loop = out[:n].copy()
    ramp = np.linspace(0, 1, xf)
    loop[:xf] = loop[:xf] * ramp + out[n:n + xf] * (1 - ramp)
    return loop


MUSIC = {
    # tense, low minor drone
    "tension": lambda: bed([[45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 58], [40, 47, 52, 55]], 8.0, 700, pulse=(0.5, 55)),
    # neutral analytic, steady pulse
    "analytic": lambda: bed([[48, 55, 60, 64], [45, 52, 57, 60], [41, 48, 55, 60], [43, 50, 55, 59]], 6.0, 1100, pulse=(2.0, 880)),
    # warm, hopeful major
    "hope": lambda: bed([[48, 55, 64, 67], [43, 55, 62, 67], [45, 52, 60, 64], [41, 53, 60, 65]], 6.0, 1600),
}


def main():
    os.makedirs(os.path.join(ROOT, "public/audio/sfx"), exist_ok=True)
    os.makedirs(os.path.join(ROOT, "public/audio/music"), exist_ok=True)
    for name, fn in SFX.items():
        write(name, np.asarray(fn(), dtype=float))
        print("sfx", name, flush=True)
    for name, fn in MUSIC.items():
        x = fn()
        l = x
        r = np.roll(x, int(0.013 * SR))
        st = np.stack([l, r], axis=1)
        st = st / np.max(np.abs(st)) * 0.8
        sf.write(os.path.join(ROOT, f"public/audio/music/{name}.mp3"), st.astype(np.float32), SR, format="MP3", subtype="MPEG_LAYER_III")
        print("music", name, len(x) / SR, flush=True)


if __name__ == "__main__":
    main()
