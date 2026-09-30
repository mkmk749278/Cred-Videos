"""Build narration/READING_SCRIPT.md (what the narrator reads) from narration/script.json."""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WPM = 145  # a calm, conversational reading pace

# phrases to lean on slightly
EMPHASIS = {
    'm01': ['take a deep breath.', 'Debt is a financial event, not a moral crime.', 'Your family comes first.'],
    'm02': ['Indian criminal law has no rule to arrest you just because you honestly couldn\'t pay.'],
    'm03': ['Relax.'],
    'm04': ['Now, good news.'],
    'm05': ['Protect your family\'s money.'],
    'm06': ['Please don\'t do that.', 'Instead, build a paper trail.'],
    'm07': ['Just block the number.', 'Don\'t let them in.'],
    'm08': ['The answer is mechanical silence.'],
    'm09': ['why patience matters.'],
    'm11': ['Never make cash payments to an agent. Never.'],
    'm12': ['That\'s just a myth.'],
    'm13': ['Take control today.'],
}

GUIDE = """# Narration Script — Read-Aloud Version

**Credit Card Debt in India — Know Your Rights** · 13 modules · about {total} minutes total

Talk to **one person** — imagine a friend who is scared and sitting across from you. You're not reading a news report; you're calmly explaining what you know. Warm, steady, confident. Smile slightly while you talk — people can hear it.

The words below are exactly what appears in the subtitles, so please read them as written. Small natural slips are fine — the processing matches your voice to the script.

## Before you record

**Files:** record **one file per module** and name them `m01.wav`, `m02.wav` … `m13.wav`. WAV at 48 kHz or 44.1 kHz is best; a phone voice memo (m4a) also works.

**Room:** use a small room with soft furnishings, such as a bedroom with curtains, a bed and a wardrobe. Avoid bare walls and tiled rooms. Turn off fans and AC, and silence your phone.

**Mic:** keep a fist's distance (10–15 cm) from the mic, slightly to the side. On a phone, hold it at chin level, pointing at your mouth.

**Room tone:** at the **start of every file, stay silent for 3 seconds** before speaking. I use this to remove background noise.

**Mistakes:** if you stumble, **stop, stay silent for 2 seconds, and say that sentence again from the start.** Don't stop the recording; the bad take is removed automatically.

## How to make it sound like real talking

- **Questions are real questions.** When you ask "And that money?" or "Why?", let your voice go up and pause for a beat, as if waiting for an answer.
- **Short sentences get their own moment.** "Relax." "Please don't." "Never." Say them slowly, with a pause after.
- `⏸` means take a breath and pause a little longer, because a new idea starts.
- **Bold** phrases are the key messages: slow down slightly and lean on them.
- Numbers like "forty-eight percent" or "twenty-five to thirty-five percent": say them clearly, never rushed.
- **Linking lines** (marked ↪) open each module. They connect the last topic to the next one, so say them like a natural "okay, so now…", not like a new announcement.
- Don't read in one flat tone. Go softer for the reassuring parts ("You didn't steal anything.") and firmer for warnings ("Never make cash payments to an agent.").

### Pronunciation guide

| Written | Say |
|---|---|
| CIBIL | "SIBIL" |
| SBI / ICICI / HDFC / IDFC / RBL / RBI | letter by letter: "S-B-I", "I-C-I-C-I" … |
| CPC / PSSA / GST / NEFT / RTGS / IP / SMS | letter by letter |
| SMA-1 / SMA-2 | "S-M-A one" / "S-M-A two" |
| EMI / EMIs | "E-M-I" / "E-M-Is" |
| FD-backed | "F-D backed" |
| 42% to 48% | "forty-two to forty-eight percent" |
| Indian Contract Act of 1872 | "eighteen seventy-two" |
| Section 420 / 138 / 171 | "four-twenty" / "one-three-eight" / "one-seventy-one" |
| Order 37 | "order thirty-seven" |
| dial 112 | "one-one-two" |
| SIM 1 | "SIM one" |
| Lok Adalat | "Loke Ada-lut" |

---
"""


def main():
    s = json.load(open(os.path.join(ROOT, 'narration/script.json')))
    words = {m['id']: len(' '.join(m['vo']).split()) for m in s['modules']}
    out = [GUIDE.format(total=round(sum(words.values()) / WPM))]
    for m in s['modules']:
        secs = words[m['id']] / WPM * 60
        out.append(f"## Module {m['number']:02d} — {m['title']}\n")
        out.append(f"*File: `{m['id']}.wav` · {m['kicker']} · about {int(secs // 60)}:{int(secs % 60):02d}*\n")
        out.append('> *(3 seconds of silence)*\n')
        for i, p in enumerate(m['vo']):
            if i == 0 and m.get('bridge'):
                out.append('*↪ Linking line: look back at what we just covered, then lead into the new topic. Say it warmly, like "okay, now…".*\n')
            for e in EMPHASIS.get(m['id'], []):
                if e in p:
                    p = p.replace(e, f'**{e}**', 1)
            out.append(p + '\n')
            if i < len(m['vo']) - 1:
                out.append('`⏸`\n')
        out.append('---\n')
    open(os.path.join(ROOT, 'narration/READING_SCRIPT.md'), 'w').write('\n'.join(out))
    print(f"wrote narration/READING_SCRIPT.md ({sum(words.values())} words)")


if __name__ == '__main__':
    main()
