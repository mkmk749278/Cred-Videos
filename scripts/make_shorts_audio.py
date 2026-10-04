"""Build the curiosity shorts' narration from the creator's own recording (no new words, no TTS).

narration/shorts.json lists, per short, the passages as [first words, last words] of the creator's transcript.
They are located in the transcript, timed with the word timestamps (out/en/whisper.json, aligned to the
transcript so captions use the creator's exact wording), snapped to the quietest 10 ms and joined with a short
pause. Writes public/audio/shorts/<id>_<lang>.wav and src/data/shorts_<lang>.json:
  {id: {"duration", "answer", "segments": [{"t0","t1"}], "words": [{"w","s","e","seg"}]}}
Usage: python3 scripts/make_shorts_audio.py enh
"""
import difflib
import json
import os
import re
import sys

import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
GAP = 0.30
LEAD = 0.12

norm = lambda w: re.sub(r"[^a-z0-9]", "", w.lower())  # noqa: E731


def rms_track(y):
    hop = SR // 100
    n = len(y) // hop
    return np.sqrt((y[: n * hop].reshape(n, hop) ** 2).mean(1) + 1e-12)


def snap(r, t, lo, hi):
    a, b = max(0, int((t + lo) * 100)), min(len(r) - 1, int((t + hi) * 100))
    return (a + int(np.argmin(r[a:b + 1]))) / 100


def timed_transcript():
    """transcript tokens (display form) with times taken from the aligned whisper words"""
    text = open(os.path.join(ROOT, "narration/english/transcript.md")).read()
    toks = [t for t in text.split() if norm(t)]
    W = [w for s in json.load(open(os.path.join(ROOT, "out/en/whisper.json"))) for w in s["words"] if norm(w["w"])]
    sm = difflib.SequenceMatcher(None, [norm(t) for t in toks], [norm(w["w"]) for w in W], autojunk=False)
    s, e = [None] * len(toks), [None] * len(toks)
    for a, b, n in sm.get_matching_blocks():
        for k in range(n):
            s[a + k], e[a + k] = W[b + k]["s"], W[b + k]["e"]
    # unmatched tokens: spread evenly between their timed neighbours
    k = 0
    while k < len(toks):
        if s[k] is not None:
            k += 1
            continue
        j = k
        while j < len(toks) and s[j] is None:
            j += 1
        t0 = e[k - 1] if k else 0.0
        t1 = s[j] if j < len(toks) else t0 + 0.4 * (j - k)
        step = (t1 - t0) / (j - k)
        for m in range(k, j):
            s[m], e[m] = t0 + step * (m - k), t0 + step * (m - k + 1)
        k = j
    matched = sum(n for _, _, n in sm.get_matching_blocks())
    print(f"aligned {matched}/{len(toks)} transcript words")
    return toks, s, e


def find(toks, phrase, start=0):
    p = [norm(t) for t in phrase.split() if norm(t)]
    n = [norm(t) for t in toks]
    for i in range(start, len(n) - len(p) + 1):
        if n[i:i + len(p)] == p:
            return i, i + len(p) - 1
    raise SystemExit(f"phrase not found: {phrase!r}")


def main():
    lang = sys.argv[1] if len(sys.argv) > 1 else "enh"
    cfg = json.load(open(os.path.join(ROOT, "narration/shorts.json")))[lang]
    full = np.load(os.path.join(ROOT, "out/en/full_mastered.npy"), mmap_mode="r")
    r = rms_track(np.asarray(full))
    toks, ts, te = timed_transcript()
    out_dir = os.path.join(ROOT, "public/audio/shorts")
    os.makedirs(out_dir, exist_ok=True)
    data = {}
    fade = int(0.012 * SR)
    for sid, sh in cfg.items():
        if sid.startswith("_"):
            continue
        out, segs, words, cur = [np.zeros(int(LEAD * SR), np.float32)], [], [], LEAD
        for k, (p0, p1) in enumerate(sh["passages"]):
            i0, _ = find(toks, p0)
            _, i1 = find(toks, p1, i0)
            # cut in the pauses around the passage, never inside a neighbouring word
            prev_e = te[i0 - 1] if i0 else 0.0
            next_s = ts[i1 + 1] if i1 + 1 < len(toks) else te[i1] + 1
            lo = max(prev_e + 0.03, ts[i0] - 0.60) - ts[i0]
            hi = min(next_s - 0.03, te[i1] + 0.50) - te[i1]
            a = snap(r, ts[i0], lo, 0.05)
            b = snap(r, te[i1], -0.05, max(hi, 0.0))
            clip = np.array(full[int(a * SR): int(b * SR)], dtype=np.float32)
            clip[:fade] *= np.linspace(0, 1, fade)
            clip[-fade:] *= np.linspace(1, 0, fade)
            off = cur - a
            for m in range(i0, i1 + 1):
                words.append({"w": toks[m], "s": round(max(ts[m], a) + off, 3), "e": round(min(te[m], b) + off, 3), "seg": k})
            segs.append({"t0": round(cur, 3), "t1": round(cur + len(clip) / SR, 3), "src": [a, b]})
            out.append(clip)
            cur += len(clip) / SR
            if k < len(sh["passages"]) - 1:
                out.append(np.zeros(int(GAP * SR), np.float32))
                cur += GAP
        y = np.concatenate(out)
        sf.write(os.path.join(out_dir, f"{sid}_{lang}.wav"), y, SR, subtype="PCM_16")
        data[sid] = {"duration": round(len(y) / SR, 3), "answer": sh["answer"], "segments": segs, "words": words}
        print(f"{sid:9s} {len(y) / SR:5.1f}s  " + "  ".join(f"[{g['src'][0]:.2f}-{g['src'][1]:.2f}]" for g in segs))
    json.dump(data, open(os.path.join(ROOT, f"src/data/shorts_{lang}.json"), "w"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
