"""Build the publishing kit from the exact render timing.

Writes publish/captions.srt, publish/chapters.txt and publish/youtube_description.md.
Timing mirrors src/lib/timing.ts + src/Root.tsx (intro, then each module scene).
"""
import json
import math
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FPS = 30
LEAD = 1.0
TAIL = 1.4
VO_AT = 10  # cold open: frames before the hook VO
TITLE_FRAMES = 84
MAX_CHARS = 84  # ~2 caption lines

# Viewer-friendly chapter names (the in-video module titles are shorter labels)
CHAPTERS = {
    'm01': 'Debt is not a crime',
    'm02': 'Can they arrest you? What the law says',
    'm03': 'Many cards, many banks: will they sue together?',
    'm04': 'Why your balance keeps growing',
    'm05': 'Protect your salary first',
    'm06': "Write to the bank (don't disappear)",
    'm07': "Recovery agents' scare tricks",
    'm08': 'Stop the endless calls',
    'm09': 'When banks become ready to settle',
    'm10': 'How different banks behave',
    'm11': 'How to settle safely',
    'm12': 'Rebuild your CIBIL score',
    'm13': 'Your 8-step plan',
}

_t = json.load(open(os.path.join(ROOT, 'src/data/timing.json')))
timing = _t['modules']
hook = _t.get('hook')
INTRO_FRAMES = (VO_AT + round(hook['duration'] * FPS) + 14 + TITLE_FRAMES) if hook else 210
script = json.load(open(os.path.join(ROOT, 'narration/script.json')))


def scene_frames(m):
    return math.ceil((LEAD + m['duration'] + TAIL) * FPS)


def ts(sec, srt=True):
    ms = int(round(sec * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f'{h:02d}:{m:02d}:{s:02d},{ms:03d}' if srt else (f'{h}:{m:02d}:{s:02d}' if h else f'{m}:{s:02d}')


def caption_chunks(words):
    """Split a sentence's words into caption-sized pieces, preferring punctuation breaks."""
    chunk = []
    for w in words:
        chunk.append(w)
        text = ' '.join(x['w'] for x in chunk)
        if len(text) >= MAX_CHARS - 12 and w['w'][-1:] in ',;:' or len(text) >= MAX_CHARS:
            yield chunk
            chunk = []
    if chunk:
        yield chunk


def main():
    out = os.path.join(ROOT, 'publish')
    os.makedirs(out, exist_ok=True)
    starts, t = [], INTRO_FRAMES / FPS
    for m in timing:
        starts.append(t)
        t += scene_frames(m) / FPS
    total = t

    # captions
    lines, n = [], 1
    if hook:
        for sn in hook['sentences']:
            for ch in caption_chunks(sn['words']):
                a = VO_AT / FPS + ch[0]['s']
                b = VO_AT / FPS + ch[-1]['e'] + 0.25
                lines += [str(n), f'{ts(a)} --> {ts(b)}', ' '.join(x['w'] for x in ch), '']
                n += 1
    for m, st in zip(timing, starts):
        for s in m['sentences']:
            for ch in caption_chunks(s['words']):
                a = st + LEAD + ch[0]['s']
                b = st + LEAD + ch[-1]['e'] + 0.25
                lines += [str(n), f'{ts(a)} --> {ts(b)}', ' '.join(x['w'] for x in ch), '']
                n += 1
    open(os.path.join(out, 'captions.srt'), 'w').write('\n'.join(lines))

    # chapters (YouTube needs the first at 0:00)
    chap = ['0:00 Introduction']
    for mod, st in zip(script['modules'], starts):
        chap.append(f"{ts(st, srt=False)} {CHAPTERS[mod['id']]}")
    open(os.path.join(out, 'chapters.txt'), 'w').write('\n'.join(chap) + '\n')

    desc = f"""Credit card debt in India? Calls all day, threats of police and arrest? This guide explains, in simple words, what the law actually says and what you can do, step by step.

In this video:
✓ Why defaulting on a credit card is a civil matter, not a crime
✓ Why banks rarely take small card balances to court
✓ The "phantom" fees that inflate your balance, and how settlements may waive them
✓ How to protect your salary from the bank's right of set-off
✓ How to create a written paper trail with the Principal Nodal Officer
✓ The common scare tricks recovery agents use, and how to respond
✓ When banks usually become ready to settle, and how to settle safely (Lok Adalat / OTS)
✓ How to rebuild your CIBIL score afterwards

CHAPTERS
{chr(10).join(chap)}

IMPORTANT: This video is for awareness only and is not legal or financial advice. Bank practices, settlement ranges and rules vary and may change. Settlement percentages mentioned are commonly reported borrower experiences, not guarantees. Please verify your own situation with a qualified advocate or financial counsellor.

If this helped you, please share it with someone who needs it.

MUSIC
"Lightless Dawn", "Sincerely", "Inspired" Kevin MacLeod (incompetech.com)
Licensed under Creative Commons: By Attribution 4.0 License
http://creativecommons.org/licenses/by/4.0/

#CreditCardDebt #KnowYourRights #DebtFreeIndia #CIBIL #LokAdalat
"""
    open(os.path.join(out, 'youtube_description.md'), 'w').write(desc)
    print(f'total {ts(total, srt=False)} · {n - 1} captions · {len(chap)} chapters')


if __name__ == '__main__':
    main()
