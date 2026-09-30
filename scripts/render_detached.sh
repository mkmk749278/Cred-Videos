#!/bin/bash
# Full render that survives the launching shell. Log: $1
cd "$(dirname "$0")/.."
REMOTION_BROWSER=${REMOTION_BROWSER:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell} \
  npx remotion render VideoMaster out/credit_card_debt_know_your_rights.mp4 --concurrency=4 > "$1" 2>&1
echo "EXIT $?" >> "$1"
