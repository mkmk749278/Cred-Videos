"""Sentence cues for video 02: whisper (English-mode) segment times, snapped to the pauses in the voice track.
Writes src/v02/cues.json  {duration, sentences:[{s,e}], words:{key: sec}}."""
import json, numpy as np
x = np.load('out/v02/vo16k.npy')
dur = len(x) / 16000
hop = 160
e = np.array([np.sqrt(np.mean(x[i:i + hop] ** 2) + 1e-12) for i in range(0, len(x) - hop, hop)])
db = 20 * np.log10(e)
sil = db < db.max() - 45
pauses = []
i = 0
while i < len(sil):
    if sil[i]:
        j = i
        while j < len(sil) and sil[j]: j += 1
        if (j - i) * 0.01 >= 0.25: pauses.append((i * 0.01, j * 0.01))
        i = j
    else: i += 1
# sentence n (1-based) -> whisper start, end (seconds)
W = [(0.0,7.86),(9.08,11.36),(12.34,16.28),(17.32,21.74),(23.40,28.24),(29.24,33.02),(33.56,39.50),(40.76,48.60),(49.38,53.88),
(54.88,61.38),(62.72,65.12),(66.28,70.02),(71.24,80.62),(81.42,83.46),(85.28,89.18),(90.16,94.70),(94.75,99.86),(100.60,104.36),
(105.10,106.52),(107.74,109.92),(110.62,121.96),(122.08,124.10),(124.32,126.32),(127.16,130.14),(131.10,134.84),(135.68,138.32),
(139.10,140.60),(140.62,148.82),(150.08,153.08),(153.40,159.24),(160.18,166.04),(166.90,168.58),(169.28,173.96),(174.32,182.30),
(183.10,188.14),(188.54,193.50),(194.28,195.28),(195.28,204.88),(205.08,209.16),(210.14,216.84),(217.50,221.06),(223.10,230.44),
(231.78,233.36),(233.90,237.52),(238.48,241.88),(242.08,247.12),(247.82,251.04),(253.00,256.08),(257.42,259.12),(260.12,268.10),
(268.58,271.98),(271.98,277.04),(277.78,289.10),(289.80,292.50),(293.22,296.92),(299.00,306.00),(306.12,314.00),(315.14,317.90),
(319.14,327.26),(328.18,332.66),(333.60,336.52),(337.38,339.86),(340.42,343.76),(344.96,348.04),(348.64,352.44),(353.54,356.36),
(356.82,359.06),(359.90,366.28),(367.66,369.84),(370.40,375.96),(376.60,382.42),(382.92,386.80),(387.36,393.46),(394.26,401.44),
(402.08,405.56),(406.36,414.87),(415.66,421.38),(422.22,426.70),(427.24,431.06),(432.00,433.64)]
assert len(W) == 80
out = []
for s, en in W:
    ps = [b for a, b in pauses if s - 1.0 <= b <= s + 0.25]
    s2 = max(ps) if ps else max(0, s - 0.08)
    pe = [a for a, b in pauses if en - 0.25 <= a <= en + 1.0]
    e2 = min(pe) if pe else en + 0.08
    out.append({'s': round(s2, 2), 'e': round(e2, 2)})
out[36] = {'s': 194.34, 'e': 195.2}
out[37]['s'] = 195.2
for k in range(1, len(out)):
    if out[k]['s'] < out[k - 1]['e']: out[k - 1]['e'] = out[k]['s']
# word anchors (whisper word starts of the spoken numbers), for beats inside long sentences
A = {'w1_10pct': 6.1, 'w2_30000': 10.0, 'w3_3000': 14.3, 'w5_1000': 27.6, 'w6_3pct': 31.9, 'w7_1250': 38.3, 'w8_29990': 43.1, 'w8_500': 47.6,
     'w9_750': 52.4, 'w12_449': 69.0, 'w13_336': 78.9, 'w21_1270': 115.7, 'w28_1000': 142.6, 'w28_29000': 148.3, 'w30_1250': 155.3,
     'w30_500': 157.6, 'w31_1750': 160.8, 'w31_28250': 164.3, 'w33_date': 171.4, 'w34_45': 176.9, 'w34_53': 181.2, 'w35_248': 186.8,
     'w36_301': 192.0, 'w38_28551': 202.3, 'w39_1448': 208.0, 'w40_29000': 211.3, 'w40_449': 214.9, 'w44_29000': 236.7, 'w46_1250': 243.9,
     'w47_28750': 249.5, 'w48_250': 255.1, 'w50_299': 263.7, 'w50_353': 267.1, 'w51_233': 271.0, 'w52_586': 275.9, 'w53_586': 282.7,
     'w53_29336': 286.5, 'w54_29000': 291.5, 'w55_336': 295.8, 'w57_5pct': 310.4, 'w57_1500': 313.7, 'w58_28500': 316.6, 'w59_5pct': 321.9,
     'w59_30580': 325.6, 'w63_5000': 341.0, 'w64_30000': 346.1, 'w67_5000': 358.2, 'w68_5417': 364.5, 'w72_45': 383.8, 'w73_15': 393.3,
     'w74_3pct': 399.3}
json.dump({'duration': round(dur, 3), 'sentences': out, 'words': A}, open('src/v02/cues.json', 'w'), indent=1)
for i, c in enumerate(out, 1): print(i, c['s'], c['e'], end='; ')
print(); print(A)

# ---- captions: each sentence split into chunks of <= 56 chars at natural breaks, timed by length
import re
lines = [l.strip() for l in open('narration/v02/sentences.txt', encoding='utf-8') if l.strip()]
assert len(lines) == 80
caps = []
for c, txt in zip(out, lines):
    parts = [p for p in re.split(r'(?<=\.\.\.)\s+|(?<=[,:!?])\s+', txt) if p]
    chunks = []
    for p in parts:
        if chunks and len(chunks[-1]) + 1 + len(p) <= 56: chunks[-1] += ' ' + p
        else: chunks.append(p)
    # split any still-too-long chunk at the space nearest its middle
    fin = []
    for ch in chunks:
        while len(ch) > 70:
            mid = len(ch) // 2
            sp = min((i for i, x in enumerate(ch) if x == ' '), key=lambda i: abs(i - mid))
            fin.append(ch[:sp]); ch = ch[sp + 1:]
        fin.append(ch)
    tot = sum(len(x) for x in fin)
    t = c['s']
    for ch in fin:
        d = (c['e'] - c['s']) * len(ch) / tot
        caps.append({'s': round(t, 2), 'e': round(t + d, 2), 't': ch})
        t += d
data = json.load(open('src/v02/cues.json'))
data['captions'] = caps
json.dump(data, open('src/v02/cues.json', 'w'), ensure_ascii=False, indent=0)
print(len(caps), 'caption chunks; longest', max(len(c['t']) for c in caps))
