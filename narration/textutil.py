"""Text helpers shared by the TTS generator and the voice processor (keeps sentence splits identical)."""
import re


def split_sentences(paragraph: str):
    parts = re.split(r"(?<=[.!?])\s+(?=[A-Z'‘\"])", paragraph.strip())
    out = []
    for p in parts:
        if len(p) > 260:  # keep chunks comfortably short
            out.extend(s for s in re.split(r"(?<=[;:])\s+", p) if s)
        else:
            out.append(p)
    return out


def norm_word(w: str) -> str:
    return re.sub(r"[^a-z0-9%]", "", w.lower())
