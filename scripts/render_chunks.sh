#!/bin/bash
# Resumable full render: each composition becomes out/chunks/<Id>.mp4 (finished chunks are skipped),
# then everything is joined into out/credit_card_debt_know_your_rights.mp4.
# Usage: scripts/render_chunks.sh [log-file]   (Scene01 renders first so a sample is ready early)
set -u
cd "$(dirname "$0")/.."
LOG=${1:-out/render_chunks.log}
export REMOTION_BROWSER=${REMOTION_BROWSER:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}
FFMPEG=node_modules/@remotion/compositor-linux-x64-gnu/ffmpeg
export LD_LIBRARY_PATH="$(dirname "$FFMPEG"):${LD_LIBRARY_PATH:-}"
mkdir -p out/chunks
ORDER=(Intro Scene01 Scene02 Scene03 Scene04 Scene05 Scene06 Scene07 Scene08 Scene09 Scene10 Scene11 Scene12 Scene13)
RENDER_FIRST=(Scene01)

render() {
  local id=$1
  [ -f "out/chunks/$id.mp4" ] && return 0
  echo "START $id $(date -u +%H:%M:%S)" >> "$LOG"
  if npx remotion render "$id" "out/chunks/.$id.partial.mp4" --concurrency=4 >> "$LOG" 2>&1; then
    mv "out/chunks/.$id.partial.mp4" "out/chunks/$id.mp4"
    echo "DONE $id $(date -u +%H:%M:%S)" >> "$LOG"
  else
    echo "FAILED $id" >> "$LOG"
    return 1
  fi
}

for id in "${RENDER_FIRST[@]}" "${ORDER[@]}"; do
  render "$id" || { echo "EXIT 1" >> "$LOG"; exit 1; }
done

LIST=out/chunks/list.txt
: > "$LIST"
for id in "${ORDER[@]}"; do echo "file '$id.mp4'" >> "$LIST"; done
"$FFMPEG" -y -loglevel error -f concat -safe 0 -i "$LIST" -c copy out/.joined.mp4 >> "$LOG" 2>&1 || { echo "EXIT 2" >> "$LOG"; exit 2; }
# loudness master (-14 LUFS, -1.5 dBTP) for YouTube
python3 scripts/master_audio.py out/.joined.mp4 out/credit_card_debt_know_your_rights.mp4 >> "$LOG" 2>&1
echo "EXIT $?" >> "$LOG"
