"""Machine-readable scene/beat manifest for the Telugu edition with animated demonstrations.

Writes publish/telugu/beat_manifest.json and beat_manifest.csv. One source of truth for timing:
narration/telugu/inserts.json (absolute full.mp3 seconds) -> process_telugu.py -> src/data/inserts_te.json
(module-relative seconds, pause remap applied). Video time = module start in the stitched video + LEAD +
module-relative second, exactly as src/demos/kit.tsx `fr()` places frames inside each scene.
"""
import csv
import json
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from make_publish_kit_te import CHAPTERS, FPS, LEAD, TAIL, TITLE_FRAMES, VO_AT, transcript  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# objects, actions, required labels and the narration's qualifications per demonstration (brief section)
META = {
    'roadmap': ('A', ['phone', 'six roadmap lines with object icons: statement, bank, shield, phone, letter, report'], ['calls/messages accumulate', 'screen calms', 'roadmap lines appear on each question'], ['fictional masked numbers'], ['“40 calls” is an illustrative scenario']),
    'rotation': ('B', ['Card A', 'Card B', 'loan app', 'balance tag', 'salary pills'], ['arrows move money card→card→app and back', 'balance remains'], [], ['no new loan advice; questions about the cycle']),
    'budget': ('B', ['income tray', 'expense blocks: food, medicines, rent, school fees, basics'], ['income enters, essentials allocated, remainder = available'], ['Illustration — not real figures'], ['₹40,000 − 33,000 = ₹7,000 reconciles; not personal advice']),
    'legal': ('C', ['three lanes: missed payment / fraud facts / lawful recovery'], ['lanes separate'], [], ['no automatic arrest; no immunity from legal process']),
    'legalproc': ('C', ['notice', 'court', 'court order'], ['process steps reveal; do-not-ignore pills'], [], ['court orders must be respected']),
    'verifynotice': ('C', ['VERIFY tray', 'sample notice LN/2026/0412', 'folder'], ['threat enters tray, details checked, filed'], ['Sample'], ['message ≠ criminal-case verdict; do not ignore genuine notices']),
    'register': ('D', ['scattered cards/bills', 'register table'], ['objects transform into rows; columns added in spoken order'], ['fictional Bank A/B/C, masked numbers'], ['each account stays separate']),
    'statement': ('E', ['Bank A statement', 'breakdown legend'], ['lines highlighted as spoken; total expands'], ['Illustrative statement — check your own'], ['100000+3000+1200+756−2000 = ₹1,02,956']),
    'interest': ('E', ['₹1,00,000 balance', '3% example'], ['₹1,00,000 × 3% ≈ ₹3,000'], ['Illustration — check your card’s actual terms'], ['rough teaching example, not APR']),
    'mindue': ('F', ['two tracks: minimum on time / full payment'], ['payment marker; remaining balance persists'], [], ['minimum is not useless; not interest-free']),
    'dispute': ('F', ['over-limit fee line ₹600', 'dispute steps', 'ref DSP-55120'], ['ask in writing → dispute → under review → waiver only if approved'], ['Sample'], ['no guaranteed waiver']),
    'setoff': ('G', ['card account', 'salary account', 'same-bank frame', 'sample Clause 14'], ['clause zoom; conditional dashed adjustment arrow'], ['Illustration — read your own agreement'], ['“may adjust · applicable terms”; panel after demo: Understand your bank’s set-off terms. Plan essential expenses.']),
    'email': ('H', ['email draft to grievance@bank-a.example', 'promise comparison'], ['fields fill on beats; sent; preference note'], ['Sample email — fictional address'], ['written preference ≠ no lawful calls; harassment protections separate']),
    'clock': ('I.1', ['24-hour bar', '8 am–7 pm window', 'threat bubbles'], ['window highlights; threats flagged'], [], ['harassment unacceptable even within hours']),
    'caller': ('I.2', ['phone', 'verification rows'], ['rows stay unverified until checked via official channel'], [], ['a logo alone proves nothing']),
    'location': ('I.4', ['location request dialog'], ['request paused and checked'], [], ['OTP/PIN never entered; a request alone doesn’t prove fake']),
    'linkcheck': ('I.3', ['threatening message with link'], ['pause before tap; sender details; verification path'], [], ['do not ignore every electronic notice']),
    'doorstep': ('I.5', ['visitor', 'doorway', 'ID card', 'authorisation letter', '112 box'], ['ID requested; read first; decline to sign under pressure'], [], ['no caricature; 112 only for immediate danger']),
    'evidence': ('I.6', ['date, number, screenshot, notes', 'complaint folder'], ['evidence filed'], [], []),
    'complaint': ('I.7', ['bank', 'ref CMP-20931', 'RBI Ombudsman'], ['rejected / unsatisfactory / no reply within 30 days → Ombudsman'], [], ['eligibility not simplified to “wait 30 days”']),
    'phone': ('J', ['phone settings toggles', 'silenced unknown', 'verified Bank A', 'email'], ['unknown silenced; verified channel open; fixed time'], ['Example interface — settings vary by phone'], ['job/hospital/delivery calls can be hidden too']),
    'calendar': ('K', ['due-date choices', 'calendar strip', 'RBI >3 days card', 'NPA marker', 'asset-classification ledger'], ['overdue cursor sweeps from the original due date'], ['illustration'], ['NPA = minimum due not fully paid within 90 days from the due date; >3 days rule counted from original due date; not “no problem until 90 days”']),
    'emi': ('L', ['EMI offer sheet', 'available-amount bar', 'two example EMIs'], ['fields highlight; EMI compared with ₹7,000 available'], ['Illustration — example amounts'], ['no invented rate; affordability decides']),
    'ledger': ('K', ['bank books ledger', 'borrower obligation card'], ['card moves to written-off column; obligation stays'], ['illustration'], ['write-off doesn’t cancel the debt; no universal 180 days; no guaranteed discount']),
    'offers': ('L', ['friend bubble', 'factor comparison', 'forum post', 'two fictional written proposals', 'caller tone cards'], ['factors differ; online % stamped; proposals vs budget'], ['Illustration — fictional proposals'], ['no bank-specific percentages; friend’s outcome no prediction']),
    'offeraff': ('M', ['your proposal card', 'high-interest loan arrow', 'example ₹1,00,000', 'caller ₹30,000 offer'], ['loan route struck; pay-now disabled until verified'], ['Example — not a real offer'], ['verify before paying']),
    'letter': ('M', ['fictional Bank A settlement letter', 'official-app verification', 'WhatsApp screenshot', '“pay ₹5,000 now” warning'], ['camera zooms per field; verification card; confirm in writing'], ['Sample / Illustration — fictional bank and figures'], ['small payment not converted into a settlement; no guaranteed reporting']),
    'receipts': ('M', ['payment receipt', 'instalment schedule', 'written confirmation', 'No Dues / completion certificate'], ['receipt saved; missed-instalment question; certificate filed'], ['Sample documents — fictional'], ['credit report checked separately; phone assurance not enough']),
    'lokadalat': ('N', ['table: You, Lok Adalat, Bank A', 'proposal', 'accept / don’t accept', 'award'], ['proposal enlarged; choice visible; award only after agreement'], ['sample'], ['consent matters; final and binding; no ordinary appeal']),
    'reports': ('O', ['sample credit report (Settled / Closed rows)', 'No Dues Certificate'], ['status field highlighted; NDC does not flip status'], ['sample — fictional'], ['settlement completion ≠ reporting status']),
    'stabilise': ('O', ['income line', 'budget bar', 'emergency-fund bar'], ['income steadies; fund fills'], [], ['no instant reset; no rush into new credit']),
    'securedcard': ('O', ['fixed deposit', 'secured card', 'issuer-policy pills', 'emergency savings'], ['FD links to card; approval “?”'], ['sample'], ['FD doesn’t guarantee approval; keep emergency savings separate']),
    'usage': ('O', ['limit bar ₹20,000 (example)', '10–20% zone'], ['usage zone highlighted'], ['Illustration — example limit'], ['no exact % guarantees a score rise']),
    'reportdispute': ('O', ['habit checklist', 'sample credit report rows', 'dispute targets', 'ref BUR-48213'], ['errors flagged; dispute raised; accurate row stays'], ['Sample report — fictional'], ['accurate negative history stays']),
    'silence': ('H', ['phone (switched off)', 'Bank A account file', 'hardship email'], ['phone goes dark; file shows “no response”; email sent and file updates'], ['illustration'], ['silence explains nothing; one clear written communication']),
    'record': ('H', ['email copy, attachments, acknowledgement, complaint ID', 'records folder', 'crossed shield'], ['items filed into the folder'], [], ['a record, not an automatic stop to a court case']),
    'visit': ('I', ['SMS “our agent visited, door was locked”', 'question checklist'], ['who / what time / which agency; confirm officially'], ['Example message — fictional'], ['do not assume every message is genuine']),
    'paychannel': ('M', ['Bank A official-app payment screen (instalment 1 of 3, ₹10,000)', 'agent UPI and cash cards'], ['authorised channels tick in; UPI and cash crossed'], ['Example interface — fictional'], ['only channels the bank authorises']),
    'profile': ('O', ['sample credit profile row (Settled)'], ['status row appears with its effect'], ['sample'], ['settlement can affect the profile — no score number, no promise']),
    'sixty': ('J', ['60-day countdown', 'agency badge swap', 'call-volume line', 'plan blocks'], ['countdown struck; agency changes; calls dip and rise; plan replaces silence'], [], ['no guarantee the file closes; the debt does not disappear']),
    'plan': ('P', ['8-step rail', 'register', 'budget bars', 'clause', 'email', 'phone toggle', 'loop', 'evidence folder', 'ledger', 'verified letter', 'receipt', 'credit report', 'secured card'], ['each object activates on its spoken step'], [], ['all eight steps preserved']),
}


def main():
    te = json.load(open(os.path.join(ROOT, 'src/data/timing_te.json')))
    ins_abs = json.load(open(os.path.join(ROOT, 'narration/telugu/inserts.json')))
    ins_rel = json.load(open(os.path.join(ROOT, 'src/data/inserts_te.json')))
    mp = json.load(open(os.path.join(ROOT, 'narration/telugu/map.json')))
    cold = (VO_AT + round(te['hook']['duration'] * FPS) + 14 + TITLE_FRAMES) / FPS
    rows = transcript()

    def cue(a, b):
        return ' '.join(r[2] for r in rows if r[1] > a + 0.2 and r[0] < b - 0.2)

    scenes, flat = [], []
    t = cold
    m0, *_ = META['roadmap'], None
    scenes.append({'scene_id': 'ColdOpen', 'chapter': 'Introduction', 'video_start': 0.0, 'video_end': round(cold, 3),
                   'audio_start': mp['hook']['start'], 'audio_end': mp['hook']['end'],
                   'beats': [{'beat_id': 'roadmap', 'brief_section': m0[0], 'objects': m0[1], 'actions': m0[2], 'labels': m0[3], 'qualifications': m0[4],
                              'cue_text': cue(mp['hook']['start'], mp['hook']['end'])[-400:], 'transition_owner': 'ColdOpen composition'}]})
    for i, m in enumerate(te['modules']):
        mid = m['id']
        frames = math.ceil((LEAD + m['duration'] + TAIL) * FPS)
        start, end = t, t + frames / FPS
        sc = {'scene_id': f'Scene{i + 1:02d}', 'module': mid, 'chapter': CHAPTERS[mid], 'video_start': round(start, 3), 'video_end': round(end, 3),
              'frames': frames, 'audio_start': mp[mid]['start'], 'audio_end': mp[mid]['end'], 'beats': []}
        for a, r in zip(sorted(ins_abs[mid], key=lambda x: x['from']), sorted(ins_rel[mid], key=lambda x: x['from'])):
            vs, ve = start + LEAD + r['from'], min(end, start + LEAD + r['to'])
            meta = META.get(a.get('demo', ''), None)
            rec = {'beat_id': a.get('demo') or f"panel:{a.get('title')}", 'kind': a.get('kind'), 'title': a.get('title'), 'kicker': a.get('kicker'), 'te': a.get('te'),
                   'audio_start': a['from'], 'audio_end': a['to'], 'video_start': round(vs, 3), 'video_end': round(ve, 3),
                   'cue_text': cue(a['from'], a['to']),
                   'transition_owner': 'TeluguInserts layer (12-frame fade in/out over the dimmed stage)'}
            if meta:
                rec.update({'brief_section': meta[0], 'objects': meta[1], 'actions': meta[2], 'labels': meta[3], 'qualifications': meta[4]})
                rec['sub_beats'] = [{'key': k, 'audio_sec': v, 'video_sec': round(start + LEAD + r['beats'][k], 3)} for k, v in sorted(a.get('beats', {}).items(), key=lambda kv: kv[1]) if v != 9999]
            sc['beats'].append(rec)
            flat.append([sc['scene_id'], CHAPTERS[mid], rec['beat_id'], rec['kind'], rec['video_start'], rec['video_end'], rec['audio_start'], rec['audio_end'], rec.get('brief_section', ''), ' | '.join(rec.get('labels', [])), ' | '.join(rec.get('qualifications', []))])
        scenes.append(sc)
        t = end
    # validation: ordered, positive, no unintended overlap
    problems = []
    for sc in scenes:
        bs = sc['beats']
        for b in bs:
            if b.get('video_end', 1) <= b.get('video_start', 0):
                problems.append(f"non-positive {sc['scene_id']} {b['beat_id']}")
        for x, y in zip(bs, bs[1:]):
            if 'video_start' in x and y['video_start'] < x['video_start']:
                problems.append(f"unordered {sc['scene_id']}")
            if 'video_end' in x and y['video_start'] < x['video_end'] - 0.45:
                problems.append(f"overlap {sc['scene_id']} {x['beat_id']} / {y['beat_id']}")
    out = os.path.join(ROOT, 'publish/telugu')
    os.makedirs(out, exist_ok=True)
    json.dump({'video': {'fps': FPS, 'width': 1920, 'height': 1080, 'duration_sec': round(t, 3), 'audio_source': 'narration/telugu/full.mp3 (locked)'},
               'timing_source': 'narration/telugu/inserts.json → narration/process_telugu.py → src/data/inserts_te.json',
               'validation': problems or 'ok', 'scenes': scenes}, open(os.path.join(out, 'beat_manifest.json'), 'w'), ensure_ascii=False, indent=1)
    with open(os.path.join(out, 'beat_manifest.csv'), 'w', newline='') as f:
        w = csv.writer(f)
        w.writerow(['scene_id', 'chapter', 'beat_id', 'kind', 'video_start', 'video_end', 'audio_start', 'audio_end', 'brief_section', 'labels', 'qualifications'])
        w.writerows(flat)
    print(f'{len(scenes)} scenes, {len(flat)} beats, {sum(1 for r in flat if r[3] == "demo")} demos, duration {t:.2f}s, validation: {problems or "ok"}')


if __name__ == '__main__':
    main()
