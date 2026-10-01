#!/bin/bash
# Upload a file to Gofile and print the download page + md5 check.
# Usage: scripts/upload_gofile.sh <file> [folderId token]   (pass folderId/token to add to an existing folder)
set -eu
f=$1
args=(-F "file=@$f")
if [ $# -ge 3 ]; then args+=(-F "folderId=$2" -H "Authorization: Bearer $3"); fi
resp=$(curl -sS -m 3600 "${args[@]}" https://upload.gofile.io/uploadfile)
echo "$resp" | python3 -c '
import json, sys, hashlib
r = json.load(sys.stdin)
if r.get("status") != "ok":
    sys.exit("upload failed: " + json.dumps(r))
d = r["data"]
local = hashlib.md5(open(sys.argv[1], "rb").read()).hexdigest()
print("link :", d["downloadPage"])
print("md5  :", d["md5"], "(match)" if d["md5"] == local else "(MISMATCH, local " + local + ")")
print("folder:", d.get("parentFolder"), " guestToken:", d.get("guestToken", "-"))
' "$f"
