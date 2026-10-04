#!/bin/bash
# Collect frames from the render branches, composite in Remotion, master, verify.
#   short01/assemble.sh            -> out/short01/SHORT_01_TELUGU_FINAL.mp4 (+ cover PNG)
set -e
cd "$(dirname "$0")/.."
export REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
FF_DIR=node_modules/@remotion/compositor-linux-x64-gnu; FF=$FF_DIR/ffmpeg; export LD_LIBRARY_PATH=$FF_DIR
mkdir -p short01/frames out/short01
for ref in $(git ls-remote origin 'refs/heads/render-s01/*' | awk '{print $2}'); do
  git fetch -q origin "$ref"
  for f in $(git ls-tree --name-only FETCH_HEAD short01/frames/); do
    [ -f "$f" ] || git show "FETCH_HEAD:$f" > "$f"
  done
done
n=$(ls short01/frames/f*.jpg | wc -l); echo "frames: $n"; [ "$n" -eq 1281 ]
python3 short01/make_audio.py
ln -sfn ../../short01/frames public/short01/frames
npx tsc --noEmit -p .
npx remotion render Short01 out/short01/raw.mp4 --codec h264 --video-bitrate 16M --audio-codec aac --audio-bitrate 320k --concurrency 4
python3 scripts/master_audio.py out/short01/raw.mp4 out/short01/mastered.mp4 -16
$FF -v error -y -i out/short01/mastered.mp4 -c copy -movflags +faststart out/short01/SHORT_01_TELUGU_FINAL.mp4
npx remotion still Short01Cover out/short01/SHORT_01_COVER.png
ls -la out/short01
