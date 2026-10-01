"""Generate the voiceover (offline Kokoro TTS) and word-level timing data.

Usage:  python3 narration/generate_vo.py [--models DIR]

Reads narration/script.json and writes:
  public/audio/vo/<module>.mp3   one narration track per module
  src/data/timing.json           sentence + word timings (seconds) used by Remotion

Model files (Kokoro-82M ONNX, from huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX):
  <models>/model.onnx and <models>/<voice>.bin  (voices are packed into voices.npz here)
"""
import argparse
import glob
import json
import os
import re
import sys

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from textutil import split_sentences  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 24000
SENTENCE_GAP = 0.28
PARAGRAPH_GAP = 0.65

# Display token -> spoken form. Keeps a 1:1 mapping between subtitle words and TTS words.
SPOKEN = {
    "CPC": "C P C", "PSSA": "P S S A", "BPO": "B P O", "GST": "G S T", "RBI": "R B I",
    "SBI": "S B I", "ICICI": "I C I C I", "HDFC": "H D F C", "IDFC": "I D F C", "RBL": "R B L",
    "NEFT": "N E F T", "RTGS": "R T G S", "IP": "I P", "SMA-1": "S M A one", "SMA-2": "S M A two",
    "CIBIL": "sibil", "EMIs": "E M Eyes", "EMI": "E M I", "FD-backed": "F D backed", "SIM": "sim", "YES": "Yes",
    "FIRST": "First", "1872": "eighteen seventy-two", "112": "one one two", "1": "one",
    "OTS": "O T S", "PNO": "P N O", "Lok": "Loke", "Adalat": "Uh-daah-lut",
}


def spoken(token: str) -> str:
    m = re.match(r"^([\"'(‘“]*)(.*?)([\"'),.:;!?’”]*)$", token)
    pre, core, post = m.groups()
    core = SPOKEN.get(core, core)
    post = post.replace("'", "").replace("’", "")
    return core + post


def trim(audio: np.ndarray, thresh=0.012, pad=0.04):
    idx = np.where(np.abs(audio) > thresh)[0]
    if len(idx) == 0:
        return audio
    a = max(0, idx[0] - int(pad * SR))
    b = min(len(audio), idx[-1] + int(pad * SR))
    return audio[a:b]


def word_weights(kokoro: Kokoro, words, lang):
    weights = []
    for w in words:
        sp = spoken(w)
        ph = kokoro.tokenizer.phonemize(re.sub(r"[^\w\s'-]", "", sp) or sp, lang)
        n = max(1, len(ph.replace(" ", "")))
        if re.search(r"[,;:]$", w):
            n += 5  # short pause after clause punctuation
        weights.append(n)
    return np.array(weights, dtype=float)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--models", default=os.environ.get("KOKORO_MODELS", "models"))
    ap.add_argument("--only", default=None, help="comma separated module ids")
    args = ap.parse_args()

    script = json.load(open(os.path.join(ROOT, "narration/script.json")))
    voices_npz = os.path.join(args.models, "voices.npz")
    if not os.path.exists(voices_npz):
        packed = {os.path.basename(f)[:-4]: np.fromfile(f, dtype=np.float32).reshape(-1, 1, 256)
                  for f in glob.glob(os.path.join(args.models, "*.bin"))}
        np.savez(voices_npz, **packed)
    kokoro = Kokoro(os.path.join(args.models, "model.onnx"), voices_npz)
    voice, speed, lang = script["voice"], script.get("speed", 1.0), "en-us"
    if ":" in voice:  # blend, e.g. "am_puck:0.7,am_fenrir:0.3"
        packs = np.load(voices_npz)
        voice = sum(packs[name] * float(w) for name, w in (part.split(":") for part in voice.split(",")))

    timing_path = os.path.join(ROOT, "src/data/timing.json")
    timing = {"modules": []}
    if args.only and os.path.exists(timing_path):
        timing = json.load(open(timing_path))
    only = set(args.only.split(",")) if args.only else None
    existing = {m["id"]: m for m in timing["modules"]}

    out_modules = []
    for mod in script["modules"]:
        if only and mod["id"] not in only:
            out_modules.append(existing[mod["id"]])
            continue
        out_modules.append(synth(kokoro, mod, voice, speed, lang))

    hook = timing.get("hook")
    if script.get("hook") and (not only or "hook" in only):
        hook = synth(kokoro, {"id": "hook", "vo": [script["hook"]]}, voice, speed, lang)
    os.makedirs(os.path.dirname(timing_path), exist_ok=True)
    out = {"voice": script["voice"], "modules": out_modules}
    if hook:
        out["hook"] = hook
    json.dump(out, open(timing_path, "w"), indent=1)
    total = sum(m["duration"] for m in out_modules) + (hook["duration"] if hook else 0)
    print(f"total narration: {total / 60:.2f} min")


def synth(kokoro, mod, voice, speed, lang):
    """TTS one module (or the hook) -> public/audio/vo/<id>.mp3, returns its timing entry."""
    if True:
        chunks, sentences, t = [], [], 0.0
        for pi, para in enumerate(mod["vo"]):
            sents = split_sentences(para)
            for si, sent in enumerate(sents):
                words = sent.split()
                tts_text = " ".join(spoken(w) for w in words)
                audio, sr = kokoro.create(tts_text, voice=voice, speed=speed, lang=lang)
                assert sr == SR
                audio = trim(audio)
                dur = len(audio) / SR
                wts = word_weights(kokoro, words, lang)
                edges = np.concatenate([[0], np.cumsum(wts)]) / wts.sum() * dur
                sentences.append({
                    "text": sent, "para": pi, "start": round(t, 3), "end": round(t + dur, 3),
                    "words": [{"w": w, "s": round(t + edges[i], 3), "e": round(t + edges[i + 1], 3)}
                              for i, w in enumerate(words)],
                })
                chunks.append(audio)
                last = si == len(sents) - 1
                gap = PARAGRAPH_GAP if last else SENTENCE_GAP
                chunks.append(np.zeros(int(gap * SR), dtype=np.float32))
                t += dur + gap
        track = np.concatenate(chunks)
        peak = np.max(np.abs(track)) or 1.0
        track = (track / peak * 0.89).astype(np.float32)
        sf.write(os.path.join(ROOT, f"public/audio/vo/{mod['id']}.mp3"), track, SR, format="MP3", subtype="MPEG_LAYER_III")
        print(f"{mod['id']}: {len(track) / SR:6.1f}s, {len(sentences)} sentences", flush=True)
        return {"id": mod["id"], "duration": round(len(track) / SR, 3), "sentences": sentences}


if __name__ == "__main__":
    main()
