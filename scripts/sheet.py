"""Contact sheet: python3 scripts/sheet.py <glob> <out.jpg>"""
import glob
import sys

from PIL import Image

fs = sorted(glob.glob(sys.argv[1]))
ims = [Image.open(f).convert('RGB') for f in fs]
w, h = ims[0].size
sheet = Image.new('RGB', (w * 2, h * ((len(ims) + 1) // 2)))
for i, im in enumerate(ims):
    sheet.paste(im, ((i % 2) * w, (i // 2) * h))
sheet.save(sys.argv[2], quality=80)
