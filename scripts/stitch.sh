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
if [ "${REMOTION_LANG:-en}" = enh ]; then CH=out/chunks_enh; OUT=out/credit_card_debt_know_your_rights_english.mp4; fi
CH=${CHUNKS_DIR:-$CH}; OUT=${STITCH_OUT:-$OUT}
# a module rendered in two halves (Scene07_a/_b) joins like two chunks
for i in "${!ORDER[@]}"; do id=${ORDER[$i]}; if [ ! -f "$CH/$id.mp4" ] && [ -f "$CH/${id}_a.mp4" ] && [ -f "$CH/${id}_b.mp4" ]; then ORDER[$i]="${id}_a ${id}_b"; fi; done
ORDER=(${ORDER[@]})
LIST=$CH/list.txt
: > "$LIST"
for id in "${ORDER[@]}"; do
  [ -f "$CH/$id.mp4" ] || { echo "missing $id"; exit 1; }
  # chunks re-encoded outside Remotion get a different video timebase; concat -c copy would then
  # mis-scale their timestamps (frozen/out-of-sync picture). Normalise every chunk to 1/90000 first.
  # video only: the file duration then equals frames/fps, so concat adds no hold at the boundary
  "$FFMPEG" -y -loglevel error -i "$CH/$id.mp4" -map 0:v -c copy -video_track_timescale 90000 "$CH/.norm_$id.mp4"
  echo "file '.norm_$id.mp4'" >> "$LIST"
done
# video: concat copy; audio: each chunk trimmed to its exact video length, then joined (no padding drift)
"$FFMPEG" -y -loglevel error -f concat -safe 0 -i "$LIST" -map 0:v -c copy out/.joined_v.mp4
FILES=(); for id in "${ORDER[@]}"; do FILES+=("$CH/$id.mp4"); done
python3 scripts/join_audio.py out/.joined_a.wav "${FILES[@]}" | tail -1
"$FFMPEG" -y -loglevel error -i out/.joined_v.mp4 -i out/.joined_a.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k out/.joined.mp4
python3 scripts/check_av.py out/.joined.mp4 "${ORDER[@]/#/$CH/}"
python3 scripts/master_audio.py out/.joined.mp4 "$OUT"
rm -f "$CH"/.norm_*.mp4 out/.joined_v.mp4 out/.joined_a.wav
