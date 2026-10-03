#!/usr/bin/env python3
"""Validate Telugu demo inserts: ordered windows, beats inside windows, and every beat key a demo reads is defined."""
import json, re, glob, sys
ins = json.load(open('narration/english/inserts.json' if 'enh' in sys.argv else 'narration/hinglish/inserts.json' if 'hi' in sys.argv else 'narration/telugu/inserts.json'))
idx = open('src/demos/index.tsx').read()
name2comp = dict(re.findall(r"^\s+(\w+): (\w+),$", idx, re.M))
src = {}
for f in glob.glob('src/demos/*.tsx'):
    s = open(f).read()
    for m in re.finditer(r"export const (\w+): React\.FC<DemoProps> = .*?\n};\n", s, re.S):
        src[m.group(1)] = m.group(0)
bad = 0
for mod, items in ins.items():
    items = sorted(items, key=lambda i: i['from'])
    for a, b in zip(items, items[1:]):
        if a['to'] > b['from'] + 0.05:
            print(f'OVERLAP {mod}: {a.get("title")} ({a["to"]}) > {b.get("title")} ({b["from"]})'); bad += 1
    for i in items:
        if i['to'] <= i['from']:
            print('NEGATIVE', mod, i.get('title')); bad += 1
        if i.get('kind') != 'demo':
            continue
        comp = name2comp.get(i['demo'])
        if not comp or comp not in src:
            print('NO COMPONENT', i['demo']); bad += 1; continue
        code = src[comp]
        used = set(re.findall(r"\b(?:p|on|lin|at)\('(\w+)'", code)) | set(re.findall(r"\bk: '(\w+)'", code)) | set(re.findall(r'k="(\w+)"', code))
        beats = i.get('beats', {})
        missing = sorted(k for k in used - set(beats) if not k.startswith('_'))
        # keys used only as data (e.g. table rows) are fine if they are beats of another kind; report anyway
        if missing:
            print(f'MISSING {mod}/{i["demo"]}: {missing}'); bad += 1
        for k, t in beats.items():
            if t != 9999 and not (i['from'] - 0.5 <= t <= i['to']):
                print(f'BEAT OUTSIDE {mod}/{i["demo"]}: {k}={t} not in [{i["from"]},{i["to"]}]'); bad += 1
print('demos:', sum(1 for m in ins.values() for i in m if i.get('kind') == 'demo'), 'problems:', bad)
sys.exit(1 if bad else 0)
