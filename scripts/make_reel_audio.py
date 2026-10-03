"""Build the 9:16 reel's narration from the creator's own recording (no new words, no TTS).

Each reel is a list of spoken passages (seconds in the full narration). Boundaries snap to the quietest
10 ms inside a small window so no word is clipped; passages are joined with a short pause and 12 ms
fades. Writes public/audio/reel/<lang>.wav and src/data/reel_<lang>.json:
  {"duration": s, "segments": [{"t0","t1"}], "words": [{"w","s","e"}] (en) | "lines": [{"text","s","e"}] (te)}
Usage: python3 scripts/make_reel_audio.py enh|te
"""
import json
import os
import sys

import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
GAP = 0.28        # pause between passages
LEAD = 0.15       # silence before the first word (the hook text is already on screen at frame 0)

# passage = (start, end) in full.mp3 seconds; captions for te are the creator's English translation
REELS = {
    'enh': {
        'src': 'out/en/full_mastered.npy',
        'segs': [
            (197.38, 201.12),   # "If I can't pay my credit card bill, will the police arrest me?"
            (208.62, 212.50),   # "Missing a payment by itself doesn't automatically mean cheating."
            (230.96, 236.02),   # "So a caller shouting, 'We'll put a criminal case on you,' does not decide what the law says."
            (236.36, 240.62),   # "But please don't take this to mean, 'Nothing can happen, so I can ignore everything.'"
            (252.22, 259.08),   # "If you receive a real legal notice, court summons or arbitration notice, check it and respond properly."
        ],
    },
    'te': {
        'src': 'out/te/full_mastered.npy',
        'segs': [
            (197.33, 200.25, '“Will the police arrest me if I cannot pay my credit card bill?”'),
            (206.75, 210.75, 'Missing a payment alone does not automatically prove cheating.'),
            (228.55, 234.05, 'A caller saying “We will file a criminal case” does not establish the legal position.'),
            (234.55, 239.55, 'At the same time, do not say, “It is a civil matter, so nothing can happen.”'),
            (249.05, 255.80, 'So, do not ignore a genuine legal notice, court summons, or arbitration communication.'),
        ],
    },
}


def rms_track(y):
    hop = SR // 100
    n = len(y) // hop
    return np.sqrt((y[: n * hop].reshape(n, hop) ** 2).mean(1) + 1e-12)


def snap(r, t, lo, hi):
    a, b = max(0, int((t + lo) * 100)), min(len(r) - 1, int((t + hi) * 100))
    return (a + int(np.argmin(r[a:b + 1]))) / 100


def main():
    lang = sys.argv[1]
    cfg = REELS[lang]
    full = np.load(os.path.join(ROOT, cfg['src']), mmap_mode='r')
    r = rms_track(np.asarray(full[: int(270 * SR)]))
    out, segs, cur = [np.zeros(int(LEAD * SR), np.float32)], [], LEAD
    fade = int(0.012 * SR)
    for k, s in enumerate(cfg['segs']):
        a = snap(r, s[0], -0.30, 0.12)
        b = snap(r, s[1], -0.10, 0.35)
        clip = np.array(full[int(a * SR): int(b * SR)], dtype=np.float32)
        clip[:fade] *= np.linspace(0, 1, fade)
        clip[-fade:] *= np.linspace(1, 0, fade)
        segs.append({'src0': round(a, 3), 'src1': round(b, 3), 't0': round(cur, 3), 't1': round(cur + len(clip) / SR, 3), 'text': s[2] if len(s) > 2 else None})
        out.append(clip)
        cur += len(clip) / SR
        if k < len(cfg['segs']) - 1:
            out.append(np.zeros(int(GAP * SR), np.float32))
            cur += GAP
    y = np.concatenate(out)
    os.makedirs(os.path.join(ROOT, 'public/audio/reel'), exist_ok=True)
    sf.write(os.path.join(ROOT, f'public/audio/reel/{lang}.wav'), y, SR, subtype='PCM_16')
    data = {'duration': round(len(y) / SR, 3), 'segments': [{'t0': g['t0'], 't1': g['t1']} for g in segs]}
    if lang == 'enh':
        W = [w for s in json.load(open(os.path.join(ROOT, 'out/en/whisper.json'))) for w in s['words']]
        words = []
        for g in segs:
            for w in W:
                if g['src0'] - 0.05 <= w['s'] < g['src1'] - 0.05:
                    off = g['t0'] - g['src0']
                    words.append({'w': w['w'].strip(), 's': round(w['s'] + off, 3), 'e': round(min(w['e'], g['src1']) + off, 3), 'seg': segs.index(g)})
        data['words'] = words
    else:
        data['lines'] = [{'text': g['text'], 's': g['t0'], 'e': g['t1']} for g in segs]
    json.dump(data, open(os.path.join(ROOT, f'src/data/reel_{lang}.json'), 'w'), ensure_ascii=False, indent=1)
    print(lang, 'duration', data['duration'], [(g['src0'], g['src1']) for g in segs])


if __name__ == '__main__':
    main()
