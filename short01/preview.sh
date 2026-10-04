#!/bin/bash
# quick look: preview.sh <name> <frames,comma> [pct] [samples]  -> scratch sheet
SP=${SP:-/tmp/short01_preview}
cd "$(dirname "$0")" && (python3 scene.py >/dev/null 2>&1; true) && rm -rf $SP/$1 && python3 render.py $SP/$1 $2 --pct ${3:-25} --samples ${4:-12} 2>&1 | grep "^frame" | tr '\n' ' '
python3 - "$SP/$1" <<'P'
import sys,glob
from PIL import Image
fs=sorted(glob.glob(sys.argv[1]+'/*.jpg')); ims=[Image.open(f) for f in fs]; w,h=ims[0].size; n=len(ims); c=min(n,8); r=(n+c-1)//c
s=Image.new('RGB',(w*c,h*r),'white')
for i,im in enumerate(ims): s.paste(im,((i%c)*w,(i//c)*h))
s.save(sys.argv[1]+'_sheet.jpg'); print(sys.argv[1]+'_sheet.jpg')
P
