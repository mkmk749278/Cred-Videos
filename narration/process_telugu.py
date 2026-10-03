"""Telugu edition: clean the user's full Telugu narration, cut it into hook + m01..m13, and build
src/data/timing_te.json so every English cue (cueFrame etc.) lands on the matching Telugu moment.

Usage: python3 narration/process_telugu.py [--no-audio] [--lang te|enh]   (enh: narration/english/ -> vo_enh, timing_enh, inserts_enh)

Input:  narration/telugu/full.mp3            the user's recording (one take, all modules)
        narration/telugu/map.json            hand-made alignment, per module:
            {"m01": {"start": 50.1, "end": 199.0, "anchors": [["listen carefully", 120.3], ...]}, ...}
            start/end are seconds in full.mp3; each anchor pins the first word of an English phrase
            (as in narration/script.json / timing.json) to the second in full.mp3 where the Telugu
            narration says the same thing. English word times are warped piecewise-linearly between
            anchors, so visuals keep their order and land on the Telugu beats.
Output: public/audio/vo_te/<id>.mp3, src/data/timing_te.json (with "speech" spans for music ducking)
"""
import argparse
import copy
import json
import os
import subprocess
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from process_voice import FFMPEG, SR, load, master  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAD_IN, PAD_OUT = 0.12, 0.25
MAX_PAUSE = 1.0   # longer pauses inside a module are shortened to this (keeps the pace up)


def norm(w):
    return "".join(c for c in w.lower() if c.isalnum() or c == "%")


def find_phrase(words, phrase, nth=0):
    target = [norm(t) for t in phrase.split() if norm(t)]
    seen = 0
    for i in range(len(words) - len(target) + 1):
        if all(norm(words[i + j]["w"]) == t for j, t in enumerate(target)):
            if seen == nth:
                return i
            seen += 1
    raise SystemExit(f"anchor phrase not found: {phrase!r}")


def speech_spans(y, thr_db=-42, min_gap=0.35):
    hop = int(0.01 * SR)
    n = len(y) // hop
    rms = np.sqrt((y[: n * hop].reshape(n, hop) ** 2).mean(axis=1) + 1e-12)
    on = 20 * np.log10(rms) > thr_db
    spans, i = [], 0
    while i < n:
        if on[i]:
            j = i
            while j < n and on[j]:
                j += 1
            spans.append([i / 100, j / 100])
            i = j
        else:
            i += 1
    merged = []
    for s in spans:
        if merged and s[0] - merged[-1][1] < min_gap:
            merged[-1][1] = s[1]
        else:
            merged.append(s)
    return [[round(a, 2), round(b, 2)] for a, b in merged if b - a > 0.08]


def shorten_pauses(y, spans):
    """Cut silence longer than MAX_PAUSE down to MAX_PAUSE; returns new audio + time map (old->new)."""
    keep, t_map, cur, removed = [], [], 0.0, 0.0
    for k in range(len(spans) - 1):
        gap = spans[k + 1][0] - spans[k][1]
        if gap > MAX_PAUSE + 0.05:
            cut_a = spans[k][1] + MAX_PAUSE / 2
            cut_b = spans[k + 1][0] - MAX_PAUSE / 2
            keep.append((cur, cut_a))
            t_map.append((cut_a, removed))
            removed += cut_b - cut_a
            t_map.append((cut_b, removed))
            cur = cut_b
    keep.append((cur, len(y) / SR))
    out = np.concatenate([y[int(a * SR): int(b * SR)] for a, b in keep])
    xs = [0.0] + [p[0] for p in t_map] + [len(y) / SR + 1]
    rs = [0.0] + [p[1] for p in t_map] + [removed]
    f = lambda t: t - float(np.interp(t, xs, rs))  # noqa: E731
    f.table = (xs, rs)
    return out, f


def save_mp3(y, path):
    tmp = path + ".wav"
    import soundfile as sf
    sf.write(tmp, y, SR, subtype="PCM_16")
    env = dict(os.environ, LD_LIBRARY_PATH=os.path.dirname(FFMPEG))
    subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-i", tmp, "-ac", "1", "-ar", "48000", "-b:a", "192k", path], check=True, env=env)
    os.unlink(tmp)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--no-audio", action="store_true", help="only rebuild timing_te.json (audio already cut)")
    ap.add_argument("--lang", default="te", choices=["te", "enh", "hi"], help="te: Telugu edition; enh: the creator's English narration")
    args = ap.parse_args()
    src_dir, suf, cache_dir = {"te": ("narration/telugu", "te", "out/te"), "enh": ("narration/english", "enh", "out/en"), "hi": ("narration/hinglish", "hi", "out/hi")}[args.lang]
    mp = json.load(open(os.path.join(ROOT, src_dir, "map.json")))
    en = json.load(open(os.path.join(ROOT, "src/data/timing.json")))
    out_dir = os.path.join(ROOT, f"public/audio/vo_{suf}")
    os.makedirs(out_dir, exist_ok=True)
    cache = os.path.join(ROOT, cache_dir, "full_mastered.npy")
    if not args.no_audio:
        if os.path.exists(cache):
            full = np.load(cache)
        else:
            full = master(load(os.path.join(ROOT, src_dir, "full.mp3")))
            os.makedirs(os.path.dirname(cache), exist_ok=True)
            np.save(cache, full)
    else:
        full = np.load(cache)

    src_ins = os.path.join(ROOT, src_dir, "inserts.json")
    ins_src = json.load(open(src_ins)) if os.path.exists(src_ins) else {}
    ins_out = {}
    remaps = {}
    te = copy.deepcopy(en)
    te["voice"] = {"te": "user (Telugu)", "enh": "user (English)", "hi": "user (Hinglish)"}[args.lang]
    entries = [("hook", te["hook"])] + [(m["id"], m) for m in te["modules"]]
    for mid, mod in entries:
        if mid not in mp:
            raise SystemExit(f"map.json has no entry for {mid}")
        cfg = mp[mid]
        a, b = max(0.0, cfg["start"] - PAD_IN), cfg["end"] + PAD_OUT
        seg = full[int(a * SR): int(b * SR)]
        spans = speech_spans(seg)
        seg, remap = shorten_pauses(seg, spans)
        spans = speech_spans(seg)
        dur = len(seg) / SR
        words = [w for s in mod["sentences"] for w in s["words"]]
        en_dur = mod["duration"]
        # anchor table: english seconds -> telugu seconds (module-relative, after pause shortening)
        xs, ys = [0.0], [0.0]
        for anc in cfg.get("anchors", []):
            phrase, t = anc[0], anc[1]
            nth = anc[2] if len(anc) > 2 else 0
            i = find_phrase(words, phrase, nth)
            xs.append(words[i]["s"])
            ys.append(remap(t - a))
        xs.append(en_dur)
        ys.append(spans[-1][1] if spans else dur)
        order = np.argsort(xs, kind="stable")
        xs, ys = list(np.array(xs)[order]), list(np.array(ys)[order])
        for k in range(1, len(ys)):
            if ys[k] < ys[k - 1]:
                raise SystemExit(f"{mid}: anchors out of order near {xs[k]:.2f}s (en)")
        warp = lambda t: round(float(np.interp(t, xs, ys)), 3)  # noqa: E731
        for s in mod["sentences"]:
            for w in s["words"]:
                w["s"], w["e"] = warp(w["s"]), warp(w["e"])
            s["start"], s["end"] = warp(s["start"]), warp(s["end"])
        # inserts are authored in full.mp3 seconds -> module-relative (after pause shortening)
        rel = lambda t: round(remap(t - a), 2)  # noqa: E731
        for ins in ins_src.get(mid, []):
            ins = copy.deepcopy(ins)
            ins["from"], ins["to"] = rel(ins["from"]), rel(ins["to"])
            for it in ins.get("items", []):
                it["at"] = rel(it["at"])
            if "beats" in ins:  # demos: named beat times
                ins["beats"] = {k: rel(v) for k, v in ins["beats"].items()}
            ins_out.setdefault(mid, []).append(ins)
        remaps[mid] = {"cut_start": a, "xs": [round(v, 3) for v in remap.table[0]], "removed": [round(v, 3) for v in remap.table[1]]}
        mod["duration"] = round(dur, 3)
        mod["speech"] = spans
        if not args.no_audio:
            save_mp3(seg, os.path.join(out_dir, f"{mid}.mp3"))
        print(f"{mid}: {dur:6.1f}s (en {en_dur:5.1f}s)  anchors {len(xs) - 2}")
    with open(os.path.join(ROOT, f"src/data/timing_{suf}.json"), "w") as f:
        json.dump(te, f, ensure_ascii=False)
    with open(os.path.join(ROOT, src_dir, "remap.json"), "w") as f:
        json.dump(remaps, f, indent=1)
    with open(os.path.join(ROOT, f"src/data/inserts_{suf}.json"), "w") as f:
        json.dump(ins_out, f, ensure_ascii=False, indent=1)
    print(f"wrote src/data/timing_{suf}.json, src/data/inserts_{suf}.json")


if __name__ == "__main__":
    main()
