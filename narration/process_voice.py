"""Turn your own voice recordings into clean, broadcast-style narration + subtitle timing.

Usage:
  python3 narration/process_voice.py                 # all modules found in narration/raw/
  python3 narration/process_voice.py --only m01,m07  # selected modules
  python3 narration/process_voice.py --no-cut        # keep every take (skip mistake removal)
  python3 narration/process_voice.py --preview       # write to narration/processed/ only

Input:  narration/raw/m01.wav ... m13.wav   (wav/flac/mp3/m4a/aac/ogg all accepted)
        Leave ~3 s of silence at the start of each file (used as the noise profile).
Output: public/audio/vo/mNN.mp3             processed narration
        src/data/timing.json                word timings, so subtitles + animations follow your pacing
        narration/processed/mNN_report.txt  what was cut / aligned, for review

Chain: decode -> mono 48 kHz -> spectral noise reduction (from room tone) -> transcribe + align
to the script (faster-whisper) -> remove false starts / retakes and over-long pauses ->
high-pass -> de-mud -> warmth (low shelf) -> presence -> air -> de-esser -> 2-stage compression
-> loudness normalize (-16 LUFS) -> downward expander -> limiter.
"""
import argparse
import difflib
import json
import os
import subprocess
import sys
import tempfile

import numpy as np
import noisereduce as nr
import pyloudnorm as pyln
import soundfile as sf
from pedalboard import (Compressor, HighpassFilter, HighShelfFilter, Limiter, LowpassFilter, LowShelfFilter,
                        PeakFilter, Pedalboard)

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from textutil import norm_word, split_sentences  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
FFMPEG = os.path.join(ROOT, "node_modules/@remotion/compositor-linux-x64-gnu/ffmpeg")
TARGET_LUFS = -16.0
KEEP_PAUSE = 0.32      # pause left where a mistake is cut out
MAX_PAUSE = 1.1        # longer silences between words are shortened to this
FILLERS = {"um", "uh", "erm", "hmm", "ah", "er"}


# ------------------------------------------------------------------ io
def load(path):
    try:
        audio, sr = sf.read(path, dtype="float32", always_2d=True)
    except Exception:
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            out = tmp.name
        env = dict(os.environ, LD_LIBRARY_PATH=os.path.dirname(FFMPEG))
        subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-i", path, "-ac", "2", "-ar", str(SR), out], check=True, env=env)
        audio, sr = sf.read(out, dtype="float32", always_2d=True)
        os.unlink(out)
    mono = audio.mean(axis=1)
    if sr != SR:
        n = int(len(mono) * SR / sr)
        mono = np.interp(np.linspace(0, len(mono) - 1, n), np.arange(len(mono)), mono).astype(np.float32)
    return mono


def find_raw(mid):
    for ext in ("wav", "flac", "mp3", "m4a", "aac", "ogg", "opus", "webm"):
        p = os.path.join(ROOT, "narration/raw", f"{mid}.{ext}")
        if os.path.exists(p):
            return p
    return None


# ------------------------------------------------------------------ cleanup
def denoise(x):
    head = x[: int(2.5 * SR)]
    # use the quietest 60% of the head as the noise profile (robust if speech starts early)
    frames = head[: len(head) // 1024 * 1024].reshape(-1, 1024)
    quiet = frames[np.argsort((frames ** 2).mean(axis=1))[: max(4, int(len(frames) * 0.6))]].ravel()
    y = nr.reduce_noise(y=x, sr=SR, y_noise=quiet, stationary=True, prop_decrease=0.88, n_fft=2048)
    # gentle second, non-stationary pass for residual hiss / fan drift
    y = nr.reduce_noise(y=y, sr=SR, stationary=False, prop_decrease=0.35, n_fft=2048)
    return y.astype(np.float32)


def de_ess(x, lo=5500, hi=9500, thresh_db=-30, max_red_db=7):
    band = Pedalboard([HighpassFilter(lo), HighpassFilter(lo), LowpassFilter(hi)])(x[None, :], SR)[0]
    env = np.sqrt(np.convolve(band ** 2, np.ones(240) / 240, mode="same") + 1e-12)
    env_db = 20 * np.log10(env)
    red_db = np.clip(env_db - thresh_db, 0, max_red_db)
    gain = 10 ** (-red_db / 20)
    return (x - band + band * gain).astype(np.float32)


def expander(x, threshold_db=-40.0, ratio=3.0, floor_db=-24.0, attack=0.004, release=0.16):
    """RMS downward expander on 5 ms blocks: below threshold, level drops by (ratio-1) dB per dB,
    at most floor_db. Fast attack keeps word onsets; slow release keeps natural tails."""
    blk = int(0.005 * SR)
    n = len(x) // blk
    rms = np.sqrt((x[: n * blk].reshape(n, blk) ** 2).mean(axis=1) + 1e-12)
    rms = np.convolve(rms, np.ones(3) / 3, mode="same")
    lvl = 20 * np.log10(rms)
    target = np.clip((lvl - threshold_db) * (ratio - 1), floor_db, 0)
    g = np.empty(n)
    cur = 0.0
    a_up = 1 - np.exp(-0.005 / attack)
    a_dn = 1 - np.exp(-0.005 / release)
    for i in range(n):
        cur += (target[i] - cur) * (a_up if target[i] > cur else a_dn)
        g[i] = cur
    gain = 10 ** (np.interp(np.arange(len(x)), np.arange(n) * blk + blk / 2, g) / 20)
    return (x * gain).astype(np.float32)


def master(x):
    chain = Pedalboard([
        HighpassFilter(cutoff_frequency_hz=75),
        PeakFilter(cutoff_frequency_hz=320, gain_db=-2.5, q=1.0),     # remove boxiness / mud
        LowShelfFilter(cutoff_frequency_hz=140, gain_db=3.0, q=0.7),   # warmth and body ("bass")
        PeakFilter(cutoff_frequency_hz=3200, gain_db=2.5, q=0.9),      # presence / clarity
        HighShelfFilter(cutoff_frequency_hz=10000, gain_db=2.5, q=0.7), # air
    ])
    y = chain(x[None, :], SR)[0]
    y = de_ess(y)
    y = Pedalboard([
        Compressor(threshold_db=-24, ratio=2.5, attack_ms=12, release_ms=120),  # levelling
        Compressor(threshold_db=-14, ratio=4.0, attack_ms=3, release_ms=60),    # peak control
    ])(y[None, :], SR)[0]
    meter = pyln.Meter(SR)
    y = y * (10 ** ((TARGET_LUFS - meter.integrated_loudness(y)) / 20))
    # downward expander: pushes the residual room noise in pauses toward silence
    y = expander(y)
    # JUCE limiter adds make-up gain (threshold -> 0 dBFS); re-normalize afterwards, which also
    # leaves the peaks at about -3 dBFS.
    y = Pedalboard([Limiter(threshold_db=-3.0, release_ms=80)])(y[None, :], SR)[0]
    y = y * (10 ** ((TARGET_LUFS - meter.integrated_loudness(y)) / 20))
    return y.astype(np.float32)


# ------------------------------------------------------------------ alignment
_model = None


def speech_chunks(x, min_pause=1.2, pad=0.2):
    """Split at pauses >= min_pause (energy VAD). Retakes are separated by such pauses,
    and transcribing chunks separately stops Whisper from silently merging repeated phrases."""
    hop = int(0.02 * SR)
    frames = x[: len(x) // hop * hop].reshape(-1, hop)
    db = 20 * np.log10(np.sqrt((frames ** 2).mean(axis=1)) + 1e-9)
    floor = np.percentile(db, 10)
    speech = db > max(floor + 12, db.max() - 45)
    chunks, start, silent = [], None, 0
    for i, sp in enumerate(speech):
        if sp:
            if start is None:
                start = i
            silent = 0
        elif start is not None:
            silent += 1
            if silent * 0.02 >= min_pause:
                chunks.append((start, i - silent + 1))
                start, silent = None, 0
    if start is not None:
        chunks.append((start, len(speech)))
    return [(max(0.0, a * 0.02 - pad), min(len(x) / SR, b * 0.02 + pad)) for a, b in chunks if (b - a) * 0.02 > 0.15]


def transcribe(x, model_name):
    global _model
    from faster_whisper import WhisperModel
    if _model is None:
        _model = WhisperModel(model_name, device="cpu", compute_type="int8")
    words = []
    for cs, ce in speech_chunks(x):
        seg = x[int(cs * SR): int(ce * SR)]
        x16 = np.interp(np.arange(0, len(seg), SR / 16000), np.arange(len(seg)), seg).astype(np.float32)
        segs, _ = _model.transcribe(x16, language="en", word_timestamps=True, vad_filter=False, beam_size=5,
                                    condition_on_previous_text=False)
        for s in segs:
            for w in s.words or []:
                text = w.word.strip()
                if not text:
                    continue
                item = {"w": text, "s": cs + float(w.start), "e": cs + float(w.end)}
                # Whisper splits hyphenated words ("over", "-limit"): merge them back
                if words and (text.startswith("-") or words[-1]["w"].endswith("-")):
                    words[-1] = {"w": words[-1]["w"] + text, "s": words[-1]["s"], "e": item["e"]}
                else:
                    words.append(item)
    return words


def align(script_words, heard):
    """Map each script word to heard-word times. Returns (times, keep_ranges_of_heard, notes)."""
    a = [norm_word(w) for w in script_words]
    b = [norm_word(w["w"]) for w in heard]
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    mapping = [None] * len(a)
    matched_heard = set()
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "equal":
            for k in range(i2 - i1):
                mapping[i1 + k] = j1 + k
                matched_heard.add(j1 + k)
        elif tag == "replace":
            # mis-heard words (names, acronyms, numbers): spoken, just transcribed differently.
            # Never cut these; map script words proportionally onto the heard span.
            for k in range(i2 - i1):
                mapping[i1 + k] = j1 + min(j2 - j1 - 1, int(k * (j2 - j1) / (i2 - i1)))
            matched_heard.update(range(j1, j2))
    # A retake that repeats the start of a sentence exactly looks like "matched copy + inserted copy".
    # Speakers restart *after* a flawed attempt, so move the match onto the later copy and drop the earlier one.
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag != "insert":
            continue
        # longest k such that the k matched words before the insertion equal its last k words
        k = next((k for k in range(min(j2 - j1, j1), 1, -1)
                  if b[j1 - k:j1] == b[j2 - k:j2] and all(j in matched_heard for j in range(j1 - k, j1))), 0)
        if k:
            for i, j in enumerate(mapping):
                if j is not None and j1 - k <= j < j1:
                    mapping[i] = j + (j2 - j1)
            matched_heard.difference_update(range(j1 - k, j1))
            matched_heard.update(range(j2 - k, j2))
    return mapping, matched_heard, sm.ratio()


def plan_cuts(heard, matched, allow_cut):
    """Spans of audio (seconds) to remove: heard words with no script counterpart
    (pure insertions = retakes / false starts / fillers)."""
    cuts = []
    if not allow_cut:
        return cuts
    j = 0
    n = len(heard)
    while j < n:
        if j in matched:
            j += 1
            continue
        k = j
        while k < n and k not in matched:
            k += 1
        span = heard[j:k]
        is_filler = all(norm_word(w["w"]) in FILLERS for w in span)
        if len(span) >= 2 or is_filler:
            start = heard[j - 1]["e"] if j > 0 else 0.0
            end = heard[k]["s"] if k < n else heard[-1]["e"]
            cuts.append((start + 0.05, end - 0.05, " ".join(w["w"] for w in span)))
        j = k
    return cuts


def apply_edits(x, cuts, words_time_edges, lead_keep=0.35):
    """Remove cut spans (leaving KEEP_PAUSE), shorten long pauses, trim head/tail. Returns audio + time-map fn."""
    segments = []  # (src_start, src_end) seconds to keep
    first, last = words_time_edges
    t = max(0.0, first - lead_keep)
    edits = sorted(cuts)
    for (cs, ce, _) in edits:
        if ce <= cs or cs < t:
            continue
        segments.append((t, cs))
        t = max(cs, ce - KEEP_PAUSE)
    segments.append((t, min(len(x) / SR, last + 0.5)))
    out = []
    src_to_dst = []
    dst = 0.0
    for s, e in segments:
        seg = x[int(s * SR): int(e * SR)].copy()
        fade = min(len(seg) // 2, int(0.012 * SR))
        if fade > 0:
            seg[:fade] *= np.linspace(0, 1, fade)
            seg[-fade:] *= np.linspace(1, 0, fade)
        out.append(seg)
        src_to_dst.append((s, e, dst))
        dst += len(seg) / SR

    def remap(ts):
        for s, e, d in src_to_dst:
            if s - 1e-3 <= ts <= e + 1e-3:
                return d + (ts - s)
        best = min(src_to_dst, key=lambda r: min(abs(ts - r[0]), abs(ts - r[1])))
        return best[2] + (0 if ts < best[0] else best[1] - best[0])

    return np.concatenate(out) if out else x, remap


# ------------------------------------------------------------------ main
def process(mid, module, model_name, allow_cut, report, out_dir):
    raw = find_raw(mid)
    if not raw:
        return None
    report.append(f"source: {os.path.relpath(raw, ROOT)}")
    x = load(raw)
    x = denoise(x)
    sentences = [s for p in module["vo"] for s in split_sentences(p)]
    para_of = []
    for pi, p in enumerate(module["vo"]):
        para_of += [pi] * len(split_sentences(p))
    script_words = [w for s in sentences for w in s.split()]

    heard = transcribe(x, model_name)
    if not heard:
        raise RuntimeError(f"{mid}: no speech detected")
    mapping, matched, ratio = align(script_words, heard)
    report.append(f"script/recording word match: {ratio * 100:.1f}%  ({sum(m is not None for m in mapping)}/{len(script_words)} words aligned)")
    cuts = plan_cuts(heard, matched, allow_cut)
    for cs, ce, txt in cuts:
        report.append(f"cut {cs:7.2f}-{ce:7.2f}s  «{txt}»")

    # source-time for each script word (interpolate the unmatched ones)
    src = [None] * len(script_words)
    for i, j in enumerate(mapping):
        if j is not None:
            src[i] = (heard[j]["s"], heard[j]["e"])
    known = [i for i, v in enumerate(src) if v]
    for i in range(len(src)):
        if src[i] is None:
            prev = max([k for k in known if k < i], default=None)
            nxt = min([k for k in known if k > i], default=None)
            if prev is not None and nxt is not None:
                a, b = src[prev][1], src[nxt][0]
                span = (b - a) / (nxt - prev)
                src[i] = (a + span * (i - prev - 1) + 0.02, a + span * (i - prev))
            elif prev is not None:
                src[i] = (src[prev][1] + 0.05 * (i - prev), src[prev][1] + 0.05 * (i - prev) + 0.2)
            else:
                src[i] = (max(0, src[nxt][0] - 0.3 * (nxt - i)), max(0.1, src[nxt][0] - 0.3 * (nxt - i) + 0.25))
            report.append(f"interpolated timing for «{script_words[i]}»")

    # edits: mistake cuts + long-pause compression, all as one keep-list
    long_pause_cuts = []
    for (s1, e1), (s2, e2) in zip(src, src[1:]):
        if s2 - e1 > MAX_PAUSE + 0.15:
            long_pause_cuts.append((e1 + MAX_PAUSE / 2, s2 - MAX_PAUSE / 2 + KEEP_PAUSE, "(long pause)"))
    all_cuts = sorted(cuts + long_pause_cuts)
    merged = []
    for c in all_cuts:
        if merged and c[0] <= merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], c[1]), merged[-1][2])
        else:
            merged.append(c)
    edited, remap = apply_edits(x, merged, (src[0][0], src[-1][1]))
    y = master(edited)

    out_path = os.path.join(out_dir, f"{mid}.mp3")
    sf.write(out_path, y, SR, format="MP3", subtype="MPEG_LAYER_III", compression_level=0.0, bitrate_mode="CONSTANT")

    words_dst = [(remap(s), remap(e)) for s, e in src]
    out_sentences = []
    wi = 0
    for si, sent in enumerate(sentences):
        n = len(sent.split())
        ws = [{"w": w, "s": round(words_dst[wi + k][0], 3), "e": round(max(words_dst[wi + k][1], words_dst[wi + k][0] + 0.05), 3)}
              for k, w in enumerate(sent.split())]
        out_sentences.append({"text": sent, "para": para_of[si], "start": ws[0]["s"], "end": ws[-1]["e"], "words": ws})
        wi += n
    duration = round(len(y) / SR, 3)
    loud = pyln.Meter(SR).integrated_loudness(y)
    report.append(f"output: {duration:.1f}s, {loud:.1f} LUFS, peak {20 * np.log10(np.max(np.abs(y)) + 1e-9):.1f} dBFS")
    return {"id": mid, "duration": duration, "sentences": out_sentences}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", default=None)
    ap.add_argument("--model", default="small.en", help="faster-whisper model (tiny.en/base.en/small.en/medium.en)")
    ap.add_argument("--no-cut", action="store_true")
    ap.add_argument("--preview", action="store_true", help="write to narration/processed/ only; leave the video untouched")
    args = ap.parse_args()

    script = json.load(open(os.path.join(ROOT, "narration/script.json")))
    timing_path = os.path.join(ROOT, "src/data/timing.json")
    timing = json.load(open(timing_path))
    by_id = {m["id"]: m for m in timing["modules"]}
    only = set(args.only.split(",")) if args.only else None
    os.makedirs(os.path.join(ROOT, "narration/processed"), exist_ok=True)
    done = []
    for module in script["modules"]:
        mid = module["id"]
        if only and mid not in only:
            continue
        report = []
        out_dir = os.path.join(ROOT, "narration/processed" if args.preview else "public/audio/vo")
        result = process(mid, module, args.model, not args.no_cut, report, out_dir)
        if result is None:
            continue
        by_id[mid] = result
        done.append(mid)
        open(os.path.join(ROOT, f"narration/processed/{mid}_report.txt"), "w").write("\n".join(report) + "\n")
        print(f"{mid}: " + " | ".join(r for r in report if r.startswith(("script/", "output"))), flush=True)
    if not done:
        print("No recordings found in narration/raw/ (expected m01.wav ... m13.wav)")
        return
    timing["voice"] = "human"
    timing["modules"] = [by_id[m["id"]] for m in script["modules"]]
    if args.preview:
        timing_path = os.path.join(ROOT, "narration/processed/timing_preview.json")
    json.dump(timing, open(timing_path, "w"), indent=1)
    print(f"updated timing for: {', '.join(done)}")


if __name__ == "__main__":
    main()
