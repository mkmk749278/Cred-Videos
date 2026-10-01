#!/bin/bash
# Join the reviewed module chunks and loudness-master the result.
# Output: out/credit_card_debt_know_your_rights.mp4  (Telugu: REMOTION_LANG=te -> chunks_te, ..._telugu.mp4)
set -eu
cd "$(dirname "$0")/.."
FFMPEG=node_modules/@remotion/compositor-linux-x64-gnu/ffmpeg
export LD_LIBRARY_PATH="$(dirname "$FFMPEG"):${LD_LIBRARY_PATH:-}"
ORDER=(ColdOpen Scene01 Scene02 Scene03 Scene04 Scene05 Scene06 Scene07 Scene08 Scene09 Scene10 Scene11 Scene12 Scene13)
CH=out/chunks; OUT=out/credit_card_debt_know_your_rights.mp4
if [ "${REMOTION_LANG:-en}" = te ]; then CH=out/chunks_te; OUT=out/credit_card_debt_know_your_rights_telugu.mp4; fi
LIST=$CH/list.txt
: > "$LIST"
for id in "${ORDER[@]}"; do
  [ -f "$CH/$id.mp4" ] || { echo "missing $id"; exit 1; }
  echo "file '$id.mp4'" >> "$LIST"
done
"$FFMPEG" -y -loglevel error -f concat -safe 0 -i "$LIST" -c copy out/.joined.mp4
python3 scripts/master_audio.py out/.joined.mp4 "$OUT"
