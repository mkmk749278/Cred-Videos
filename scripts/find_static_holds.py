"""List narration stretches with no new visual event (static holds) per scene.

A 'visual event' is any cue phrase a scene hooks animation to (cueFrame(I, '...') or `cue: '...'`),
plus the moment the topic starts. Usage: python3 scripts/find_static_holds.py [min_seconds]
"""
import glob
import json
import re
import sys

sys.path.insert(0, 'narration')
from textutil import norm_word  # noqa: E402

LEAD = 2.2
MIN = float(sys.argv[1]) if len(sys.argv) > 1 else 7.0
timing = json.load(open('src/data/timing.json'))['modules']
script = json.load(open('narration/script.json'))['modules']

for f in sorted(glob.glob('src/scenes/Scene*.tsx')):
    src = open(f).read()
    i = int(re.search(r'const I = (\d+);', src).group(1))
    words = [w for s in timing[i]['sentences'] for w in s['words']]
    normw = [norm_word(w['w']) for w in words]
    cues = [c for _, c in re.findall(r'cueFrame\(I, ([\'"])(.+?)\1', src) + re.findall(r'cue: ([\'"])(.+?)\1', src)]
    events = []
    for c in cues:
        t = [norm_word(x) for x in c.split()]
        for k in range(len(normw) - len(t) + 1):
            if normw[k:k + len(t)] == t:
                events.append((words[k]['s'], c))
                break
    start = timing[i]['sentences'][0]['start']
    if script[i].get('bridge'):
        start = next(s['start'] for s in timing[i]['sentences'] if s['para'] == 1)
    events.append((start, '<topic start>'))
    events.append((timing[i]['duration'], '<end>'))
    events.sort()
    print(f"\n== {script[i]['id']} {script[i]['title']} ({timing[i]['duration']:.0f}s, {len(cues)} cues)")
    for (t0, c0), (t1, c1) in zip(events, events[1:]):
        if t1 - t0 >= MIN:
            said = ' '.join(w['w'] for w in words if t0 <= w['s'] < t1)
            print(f"  {t0:5.1f}-{t1:5.1f}s ({t1 - t0:4.1f}s) after «{c0}»: {said[:230]}")
