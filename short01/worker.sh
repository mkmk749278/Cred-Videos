#!/bin/bash
# Render a frame range of Short 01 on a fresh cloud session and push the JPGs to a git branch.
#   short01/worker.sh <first> <last> <branch>
# Resumable: re-running skips frames already rendered.
set -e
cd "$(dirname "$0")/.."
A=$1; B=$2; BR=$3
pip install -q bpy==4.2.0 numpy pillow fonttools brotli 2>&1 | grep -v WARN || true
python3 short01/fetch_assets.py >/dev/null
python3 short01/make_textures.py >/dev/null
(python3 short01/scene.py >/dev/null 2>&1; true)
test -f short01/build/short01.blend
OUT=short01/frames
mkdir -p $OUT
python3 short01/render.py $OUT $A-$B --samples 16 2>&1 | grep --line-buffered '^frame'
n=$(ls $OUT/f*.jpg | wc -l)
echo "rendered $n frames"
git checkout -B "$BR"
git add -f $OUT/f*.jpg
git commit -qm "Short 01 frames $A-$B"
for i in 1 2 3 4; do git push -u origin "$BR" && break || sleep $((2**i)); done
echo "PUSHED $BR"
