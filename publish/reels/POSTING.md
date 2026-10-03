# Reel: "Will police arrest you?" (30 s, 9:16)

Two versions, each cut from your own narration with no new words:

| Version | Video | Cover |
|---|---|---|
| English | `Reel - Will police arrest you (English) 30s.mp4` | `cover_english.png` |
| Telugu | `Reel - Will police arrest you (Telugu) 30s.mp4` | `cover_telugu.png` |

Specs: 1080×1920, 30 fps, H.264 + AAC, −14 LUFS, exactly 30.0 s. The captions are burned in, because most people watch muted. The hook is on screen from the first frame. Everything that matters stays out of the area Instagram and YouTube cover with their buttons: the bottom ~22% and the right-hand column.

**The story, about 5 s per point:**
1. Hook: "Can't pay your card bill? Will police arrest you?"
2. A missed payment is not automatically cheating.
3. A caller's threat is not the law.
4. But "civil" doesn't mean nothing can happen: notice → recovery case → court order.
5. Got a real notice? Check it and respond.
6. Call to action, about 3 s: watch the full video on YouTube, with a "tap the link below ↓" arrow.

## Instagram (organic post + boost)

- **Cover:** choose `cover_*.png`, or frame 0, in the reel editor. The grid preview crops to 3:4, and the headline sits inside that crop.
- **Caption (English):**
  > Can the police arrest you for an unpaid credit card bill? 😟 Missing a payment by itself doesn't automatically mean cheating — but a real legal notice must never be ignored.
  > 👉 Full 27-min guide (free) on YouTube: link in bio / tap "Watch more".
  > Awareness only, not legal advice.
  > #creditcarddebt #knowyourrights #loanrecovery #cibil #personalfinanceindia #debtfree
- **Caption (Telugu):**
  > Credit card bill కట్టలేకపోతే police arrest చేస్తారా? 😟 Payment miss అయితే cheating అని automatic గా అవ్వదు — కానీ నిజమైన legal notice ని ignore చేయొద్దు.
  > 👉 Full video (31 నిమిషాలు) YouTube లో — link bio లో / "Watch more" నొక్కండి.
  > Awareness కోసం మాత్రమే — legal advice కాదు.
  > #creditcarddebt #telugu #knowyourrights #cibil #loanrecovery #teluguFinance
- **Boost settings:**
  - Goal: **More website visits**.
  - Button: **Watch more** (or Learn more).
  - Website URL: the full YouTube video link. Use the Telugu video for the Telugu reel and the English video for the English reel.
- **Audience:**
  - Location: India. For the Telugu reel, Andhra Pradesh + Telangana, plus Telugu speakers in Bengaluru, Chennai, Mumbai and abroad if you want reach.
  - Age: 23–55.
  - Interests: credit cards, personal loans, personal finance, EMI, banking.
- **Budget (suggestion only):** start small for 3–5 days, then keep whichever version gets the cheaper cost per landing-page view.
- **Ad review:** Meta may review debt or finance topics more strictly. The reel is educational (no product, no promise, disclaimer on screen). If an ad is rejected, appeal, or check whether Meta asks for financial-services advertiser verification in your region.

## YouTube Shorts

- Upload the same file. Shorts accepts up to 3 min; this one is 30 s.
- **Title (English):** `Can police arrest you for an unpaid credit card bill? #Shorts`
- **Title (Telugu):** `Credit card bill కట్టలేకపోతే Police arrest చేస్తారా? #Shorts`
- **Related video:** in YouTube Studio, link the full video under the Short's "Related video" setting. It shows as a tappable link above the title, which is where the "↓" arrow points.
- **Description:** the first line repeats the hook, then "Full video: <link>", then the disclaimer.
- **Pinned comment:** "Full step-by-step guide 👉 <link>".

## Making more reels

The reel is a reusable composition (`src/reel/Reel.tsx`). To make a new one, see `docs/PLAYBOOK.md` → "Reels / Shorts": pick 4–5 short passages from the narration, list them in `scripts/make_reel_audio.py`, adjust the beat visuals, check stills, then render.
