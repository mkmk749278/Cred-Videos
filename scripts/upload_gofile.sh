#!/bin/bash
# Upload a file to Gofile and print the download page + md5 check.
# Usage: scripts/upload_gofile.sh <file> [folderId [token]]
#   Account uploads: set GOFILE_TOKEN (never commit it) and pass the target folderId
#   (or set GOFILE_FOLDER). Without a token the upload is anonymous (guest folder).
#   Set GOFILE_MANIFEST=<file> to append folder/id/name/md5 per upload (needed to delete/replace later;
#   listing folder contents through the API requires a premium account).
set -eu
f=$1
folder=${2:-${GOFILE_FOLDER:-}}
token=${3:-${GOFILE_TOKEN:-}}
args=(-F "file=@$f")
if [ -n "$folder" ]; then args+=(-F "folderId=$folder"); fi
if [ -n "$token" ]; then args+=(-H "Authorization: Bearer $token"); fi
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
print("id   :", d["id"], " folder:", d.get("parentFolder"))
import os, time
man = os.environ.get("GOFILE_MANIFEST")
if man:
    with open(man, "a") as fh:
        fh.write("\t".join([time.strftime("%Y-%m-%d %H:%M"), d["parentFolder"], d["id"], d["name"], d["md5"]]) + "\n")
' "$f"
