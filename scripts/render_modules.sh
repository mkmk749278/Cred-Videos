#!/bin/bash
# Render modules one at a time into out/chunks/<Id>.mp4 (finished ones are skipped). No stitching.
# Usage: scripts/render_modules.sh Scene01 Scene07@0-3674:Scene07_a ...   (log: out/render_modules.log)
# Telugu / creator-English editions: REMOTION_LANG=te|enh|hi scripts/render_modules.sh ...  -> out/chunks_te|enh/, log out/render_modules_te|enh.log
set -u
cd "$(dirname "$0")/.."
LANGV=${REMOTION_LANG:-en}
CH=out/chunks; LOG=out/render_modules.log; ENVF=()
if [ "$LANGV" = te ] || [ "$LANGV" = enh ] || [ "$LANGV" = hi ]; then
  CH=out/chunks_$LANGV; LOG=out/render_modules_$LANGV.log
  echo "REMOTION_LANG=$LANGV" > out/lang_$LANGV.env; ENVF=(--env-file=out/lang_$LANGV.env)
fi
export REMOTION_BROWSER=${REMOTION_BROWSER:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}
mkdir -p "$CH"
# a job is a composition id (Scene04) or a frame range of one: Scene07@0-3674:Scene07_a (output Scene07_a.mp4)
for job in "$@"; do
  comp=$job; id=$job; FR=()
  if [[ "$job" == *@* ]]; then comp=${job%@*}; rest=${job#*@}; FR=(--frames="${rest%%:*}"); id=${rest#*:}; fi
  [ -f "$CH/$id.mp4" ] && continue
  echo "START $id $(date -u +%H:%M:%S)" >> "$LOG"
  # each render leaves a ~110 MB webpack bundle in /tmp; keep only the newest few or the disk fills up
  ls -dt /tmp/remotion-webpack-bundle-* 2>/dev/null | tail -n +3 | xargs -r rm -rf
  if npx remotion render "$comp" "$CH/.$id.partial.mp4" "${FR[@]}" --concurrency=4 "${ENVF[@]}" >> "$LOG" 2>&1; then
    mv "$CH/.$id.partial.mp4" "$CH/$id.mp4"
    echo "DONE $id $(date -u +%H:%M:%S)" >> "$LOG"
  else
    echo "FAILED $id" >> "$LOG"; exit 1
  fi
done
echo "ALLDONE" >> "$LOG"
