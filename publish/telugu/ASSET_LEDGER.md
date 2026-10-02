# Asset & source ledger — Telugu edition with animated demonstrations

## Narration and audio

| Asset | Origin | Licence / status | Notes |
|---|---|---|---|
| Telugu narration `narration/telugu/full.mp3` (30:44.532) | The creator's own recording | Owned by the creator | Locked. Only cut-start and pauses were shortened (`remap.json`), as approved in v2. No new TTS. No time-stretching. |
| English subtitles `captions_en.srt` | The creator's English translation (`narration/telugu/english_transcript.md`) | Owned by the creator | Timed to the video through `map.json` and `remap.json`. |
| Music beds `public/audio/music/{tension,analytic,hope}.mp3` | Kevin MacLeod, "Lightless Dawn", "Sincerely", "Inspired" (incompetech.com) | CC BY 4.0, credit in the YouTube description | Processed (HPF, light compression, level match). |
| Sound effects `public/audio/sfx/*.mp3` | Procedurally synthesised by `narration/generate_audio.py` | Original, no third-party samples | SFX inside scenes are muted under panels and demos, so there is no constant alarm. |

## Fonts and code

| Asset | Licence |
|---|---|
| Inter, JetBrains Mono, Noto Sans Telugu (500/700), self-hosted in `public/fonts/` | SIL Open Font License 1.1 |
| Remotion 4 | Remotion licence. Free for individuals and companies of up to 3 people; larger organisations need a company licence. |
| three.js, @remotion/three | MIT |
| All demonstration graphics (`src/demos/*.tsx`), icons (inline SVG) and the character | Original, built in code for this project |

No stock footage, no AI-generated imagery and no paid generation services were used.

## Fictional data used on screen

All of these are fictional:
- banks: "Bank A", "Bank B", "Bank C"
- people: R. Kumar, A. Sharma
- masked cards: •••• 4821 / 7310 / 2265
- references: BA/SET/2026/0917, LN/2026/0412, CMP-20931, DSP-55120, PAY-20261130-0042, BUR-48213
- addresses: `grievance@bank-a.example`, `forum.example`
- phone numbers: masked (+91 98XXX XXX21 style)

The amounts are illustrations, and every total reconciles:
- budget: ₹40,000 − ₹33,000 = ₹7,000
- statement: ₹1,02,956
- interest: ₹1,00,000 × 3% ≈ ₹3,000
- settlement example: ₹30,000; instalments 3 × ₹10,000
- EMI comparison: ₹9,500 / ₹6,500 against ₹7,000
- written proposals: ₹45,000 lump sum / ₹6,500 × 8 = ₹52,000
- usage example: 10–20% of ₹20,000

Each of these carries an on-screen "Illustration", "Sample" or "Example" label.

No real bank logos or seals, no real customer data, and no bank-specific settlement percentages appear on screen. "25%" appears only as the friend's claim from the narration, and it is stamped "not a promise for your case".

## Regulatory statements shown on screen, and their sources

On-screen wording follows the narration's own qualifications ("may", "generally", "applicable terms").

| On-screen statement | Source document (official) |
|---|---|
| Late charges / past-due reporting only after > 3 days past due, counted from the original due date | RBI Master Direction — Credit Card and Debit Card – Issuance and Conduct Directions, 2022 |
| Card account treated as NPA if the minimum amount due is not fully paid within 90 days from the payment due date | Same Master Direction (read with RBI prudential norms on income recognition and asset classification) |
| Recovery calls only between 8 am and 7 pm; no threats, humiliation or intrusion into family privacy | RBI circular on recovery agents employed by regulated entities (12 Aug 2022), and the Fair Practices Code |
| Complaint to the bank first; RBI Ombudsman if rejected, unsatisfactory, or no reply within 30 days | Reserve Bank – Integrated Ombudsman Scheme, 2021 (complaints at cms.rbi.org.in) |
| Technical write-off is an accounting action and does not by itself waive the borrower's liability | RBI Framework for Compromise Settlements and Technical Write-offs (June 2023) |
| Lok Adalat: pending and pre-litigation matters; a settlement-based award is final and binding like a civil-court decree, with no ordinary appeal | Legal Services Authorities Act, 1987 (ss. 19–21) |
| Credit report errors are disputed with the lender and the credit bureau; accurate history is not removed | Credit Information Companies (Regulation) Act, 2005, and RBI directions to credit institutions and CICs |
| 112 for immediate danger | Emergency Response Support System, national emergency number |

Verification note: these statements were checked against the wording of the documents named above, as known at production time. They were not re-downloaded inside this build session. The video is awareness content, not legal advice. Re-check the current versions before any public release.
