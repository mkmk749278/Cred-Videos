"""Verify every animation cue phrase in src/scenes exists in narration/script.json (run after editing the script)."""
import glob
import json
import re
import sys

sys.path.insert(0, 'narration')
from textutil import norm_word  # noqa: E402

mods = json.load(open('narration/script.json'))['modules']
bad = 0
for f in sorted(glob.glob('src/scenes/Scene*.tsx')):
    src = open(f).read()
    idx = int(re.search(r'const I = (\d+);', src).group(1))
    words = [norm_word(w) for w in ' '.join(mods[idx]['vo']).split()]
    text = ' ' + ' '.join(words) + ' '
    cues = re.findall(r'(?:cueFrame|cueEnd|sentenceEnd|paragraphEnd)\(I, ([\'"])(.+?)\1', src) + re.findall(r'cue: ([\'"])(.+?)\1', src)
    for _, c in cues:
        c = c.replace("\\'", "'")
        if ' ' + ' '.join(norm_word(w) for w in c.split()) + ' ' not in text:
            print(f'MISSING {f}: "{c}"')
            bad += 1
print('all cues found' if not bad else f'{bad} missing cue(s)')
sys.exit(1 if bad else 0)
