"""Procedural photographic plates for video 02 (deterministic). Writes public/v02/*.png|jpg."""
import numpy as np
from PIL import Image, ImageFilter
rng = np.random.default_rng(7)
OUT = 'public/v02/'

def save(a, name, q=None):
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    im.save(OUT + name, quality=q) if q else im.save(OUT + name)

# film grain: mid-grey luminance noise, used with mix-blend overlay
g = rng.normal(128, 38, (512, 512))
g = np.array(Image.fromarray(np.clip(g, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6)))
save(np.stack([g] * 3, -1), 'grain.png')

def bokeh(w, h, palette, n, seed, rmin, rmax, blur):
    r = np.random.default_rng(seed)
    img = Image.new('RGB', (w, h), (0, 0, 0))
    acc = np.zeros((h, w, 3), np.float32)
    yy, xx = np.mgrid[0:h, 0:w]
    for i in range(n):
        cx, cy = r.uniform(-50, w + 50), r.uniform(h * 0.05, h * 0.95)
        rad = r.uniform(rmin, rmax)
        col = np.array(palette[r.integers(len(palette))], np.float32)
        x0, x1 = int(max(0, cx - rad - 4)), int(min(w, cx + rad + 4))
        y0, y1 = int(max(0, cy - rad - 4)), int(min(h, cy + rad + 4))
        if x1 <= x0 or y1 <= y0: continue
        d = np.sqrt((xx[y0:y1, x0:x1] - cx) ** 2 + (yy[y0:y1, x0:x1] - cy) ** 2) / rad
        # disc with brighter rim (real lens bokeh)
        m = np.clip((1 - d) * 6, 0, 1) * (0.55 + 0.45 * np.clip((d - 0.7) / 0.3, 0, 1))
        acc[y0:y1, x0:x1] += m[..., None] * col * r.uniform(0.25, 0.8)
    a = np.array(Image.fromarray(np.clip(acc, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(blur)), np.float32)
    return a

W, H = 2304, 1296  # 1.2x for camera moves
warm = [(255, 170, 60), (255, 120, 40), (255, 210, 120), (230, 80, 120), (120, 160, 255)]
cool = [(60, 140, 255), (90, 200, 255), (160, 120, 255), (40, 90, 220), (255, 200, 90)]
amz = [(255, 153, 0), (255, 190, 80), (35, 47, 62), (80, 120, 200), (255, 120, 30)]
fk = [(40, 116, 240), (255, 225, 27), (90, 160, 255), (255, 200, 60), (30, 80, 200)]
red = [(255, 60, 60), (255, 120, 60), (200, 30, 60), (255, 170, 90)]
green = [(40, 220, 140), (80, 255, 190), (30, 160, 120), (150, 255, 210), (60, 140, 255)]
for name, pal, seed in [('bokeh_warm', warm, 1), ('bokeh_cool', cool, 2), ('bokeh_amz', amz, 3), ('bokeh_fk', fk, 4), ('bokeh_red', red, 5), ('bokeh_green', green, 6)]:
    a = bokeh(W, H, pal, 140, seed, 18, 90, 2.2) * 0.9
    # depth haze gradient
    yy = np.linspace(0, 1, H)[:, None, None]
    a = a * (0.55 + 0.45 * np.sin(yy * np.pi))
    save(a, name + '.jpg', 90)

# brushed metal (horizontal streaks)
m = rng.normal(0, 1, (400, 1400)).astype(np.float32)
m = np.array(Image.fromarray(((m - m.min()) / (m.max() - m.min()) * 255).astype(np.uint8)).resize((1400, 400)).filter(ImageFilter.BoxBlur(0)), np.float32)
streak = np.cumsum(rng.normal(0, 1, (400, 1400)), axis=1)
streak = np.array(Image.fromarray(((streak - streak.min()) / (np.ptp(streak)) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur((0.4))), np.float32)
k = np.ones(61) / 61
br = np.apply_along_axis(lambda r: np.convolve(r, k, 'same'), 1, rng.normal(128, 60, (400, 1400)))
br = 128 + (br - 128) * 3
save(np.stack([br] * 3, -1), 'brushed.png')

# thermal paper texture (subtle fibres)
p = rng.normal(0, 1, (900, 700))
p = np.array(Image.fromarray(np.clip(128 + p * 40, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2)), np.float32)
p = 244 + (p - 128) * 0.18
pap = np.stack([p, p - 2, p - 7], -1)
save(pap, 'paper.png')
print('ok')
