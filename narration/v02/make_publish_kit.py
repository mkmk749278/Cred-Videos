"""Publish kit for video 02: Telugu captions (.srt), chapters, YouTube description. Times = video timeline."""
import json
LEAD = 0.6
d = json.load(open('src/v02/cues.json'))
S = lambda n: LEAD + d['sentences'][n - 1]['s']
def ts(t, srt=True):
    h, m, s = int(t // 3600), int(t % 3600 // 60), t % 60
    return f'{h:02d}:{m:02d}:{int(s):02d},{int(round((s - int(s)) * 1000)) % 1000:03d}' if srt else f'{m}:{int(s):02d}'
out = 'publish/02_no_cost_emi/'
caps = d['captions']
with open(out + 'captions_te.srt', 'w', encoding='utf-8') as f:
    for i, c in enumerate(caps, 1):
        a = LEAD + c['s']
        b = LEAD + min(c['e'] + 0.2, caps[i]['s'] - 0.02 if i < len(caps) else c['e'] + 0.6)
        f.write(f"{i}\n{ts(a)} --> {ts(b)}\n{c['t']}\n\n")
CH = [(1, 'Festive banner reality: is it really 10%?', 'The 10% festive banner reality'),
      (5, 'Full payment cap vs extra EMI bonus', 'Full Payment Cap vs Extra EMI Bonus'),
      (10, 'The paradox: Amazon లో లాభం, Flipkart లో నష్టమా?', ''),
      (16, 'No Cost EMI వడ్డీ ఎవరు భరిస్తారు? (Brand vs Bank)', ''),
      (25, 'Amazon SBI Card: EMI wins by ₹449', ''),
      (42, 'Flipkart Axis/ICICI: EMI loses ₹336', ''),
      (56, '5% cashback cards (Amazon Pay ICICI reality)', ''),
      (61, '3 hidden traps: limit block, bill shock, return trap', ''),
      (75, '3 golden rules before clicking "Buy Now"', '')]
chap = '\n'.join(f"{'0:00' if i == 0 else ts(S(n), False)} - {t}" for i, (n, t, _) in enumerate(CH))
open(out + 'chapters.txt', 'w', encoding='utf-8').write(chap + '\n')
desc = f"""# YouTube upload kit — No Cost EMI vs Full Payment (Telugu)

## Title options
1. Amazon, Flipkart Sale lo No Cost EMI Trap? Full Payment vs EMI Reality!
2. No Cost EMI నిజంగా Free నా? ₹30,000 Phone తో Live Calculation!
3. Festive Sale 10% Discount Reality: No Cost EMI vs Full Swipe (Telugu)

## Description
Amazon Great Indian Festival మరియు Flipkart Big Billion Days sales లో "10% Instant Discount" banners చూసి No Cost EMI పెడుతున్నారా? ₹30,000 base reference price తో SBI, Axis, ICICI మరియు Cashback cards పై complete real calculations ఈ వీడియోలో ఉన్నాయి.

Timestamps:
{chap}

⚠️ ఈ వీడియోలోని offer caps, processing fees, bank rules ఈ sale కోసం reported terms ఆధారంగా ఉన్నాయి. Offers card నుంచి card కి, రోజు నుంచి రోజుకి మారవచ్చు — Buy Now నొక్కే ముందు checkout page మరియు మీ bank T&C ఒకసారి check చేయండి. This is an illustration on a ₹30,000 example, not financial advice. Not affiliated with Amazon, Flipkart or any bank.

#AmazonGreatIndianFestival #FlipkartBigBillionDays #NoCostEMI #CreditCardOffers #TeluguTech

## Files
- `captions_te.srt` — the same Telugu subtitles that are burned into the video, as a file (optional: upload to YouTube as Telugu CC for search/indexing)
- `chapters.txt` — chapter list (already in the description above)
- `thumbnail.png` — 1280×720
"""
open(out + 'youtube_description.md', 'w', encoding='utf-8').write(desc)
print(chap)
