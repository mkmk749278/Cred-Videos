#!/usr/bin/env python3
"""Deterministic print/screen textures for Short 01 (statements, receipts, calendar, card, phone).

Every amount and date on screen is typeset here (never generated imagery), and the key row
positions are written to layout.json (millimetres from each sheet's top-left) so the Blender
scene can aim focus, highlights and props at them.

    python3 short01/make_textures.py      -> short01/build/tex/*.png + short01/build/layout.json
"""
import json, os, math, random
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops

HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(HERE, 'assets', 'fonts')
OUT = os.path.join(HERE, 'build', 'tex')
os.makedirs(OUT, exist_ok=True)

# ---- the example (handoff: fictional amounts/dates; no APR, no grand total) ----
CARD = '•••• 4821'
BANK = 'EXAMPLE BANK'
NAVY, YELLOW, WHITE = (11, 21, 48), (255, 211, 77), (250, 250, 250)
INK = (28, 30, 36)
GREY = (104, 108, 118)
GREEN = (22, 128, 61)
RED = (178, 34, 34)

_fcache = {}


def font(name, px, wght=None):
    key = (name, px, wght)
    if key not in _fcache:
        f = ImageFont.truetype(os.path.join(FONTS, name), px, layout_engine=ImageFont.Layout.RAQM)
        if wght is not None:
            try:
                axes = f.get_variation_axes()
                vals = []
                for a in axes:
                    n = a.get('name', b'')
                    n = n.decode() if isinstance(n, bytes) else n
                    vals.append(wght if 'eight' in n or n == 'wght' else a['default'])
                f.set_variation_by_axes(vals)
            except Exception:
                pass
        _fcache[key] = f
    return _fcache[key]


def SANS(px, w=450):
    return font('InterFull.ttf', px, w)


def MONO(px, w=500):
    return font('NotoSansMono.ttf', px, w)


def HAND(px, w=600):
    return font('Caveat.ttf', px, w)


def TEL(px, w=700):
    return font('NotoSansTeluguVF.ttf', px, w)


class Sheet:
    """A printed sheet: w×h millimetres at `dpmm` pixels per millimetre."""

    def __init__(self, name, w_mm, h_mm, dpmm=10, base=(247, 245, 239), grain=3, seed=1):
        self.name, self.w, self.h, self.k = name, w_mm, h_mm, dpmm
        W, H = int(w_mm * dpmm), int(h_mm * dpmm)
        rnd = random.Random(seed)
        img = Image.new('RGB', (W, H), base)
        if grain:
            # fibre noise: low-res noise upscaled + fine noise
            n = Image.effect_noise((max(8, W // 6), max(8, H // 6)), 40).resize((W, H), Image.BICUBIC)
            n2 = Image.effect_noise((W, H), 18)
            n = ImageChops.add(n.point(lambda v: (v - 128) * grain / 40 + 128), n2.point(lambda v: (v - 128) * grain / 60 + 128), 1, -128)
            img = ImageChops.add(img, Image.merge('RGB', [n] * 3), 1, -128)
        self.img = img
        self.d = ImageDraw.Draw(img)
        self.marks = {}

    def px(self, mm):
        return int(round(mm * self.k))

    def text(self, x, y, s, f, fill=INK, anchor='la', key=None):
        self.d.text((self.px(x), self.px(y)), s, font=f, fill=fill, anchor=anchor)
        if key:
            bb = self.d.textbbox((self.px(x), self.px(y)), s, font=f, anchor=anchor)
            self.marks[key] = [round(v / self.k, 2) for v in bb]
        return self

    def rect(self, x0, y0, x1, y1, fill=None, outline=None, width=0.3, r=0, key=None):
        box = [self.px(x0), self.px(y0), self.px(x1), self.px(y1)]
        if r:
            self.d.rounded_rectangle(box, radius=self.px(r), fill=fill, outline=outline, width=max(1, self.px(width)) if outline else 0)
        else:
            self.d.rectangle(box, fill=fill, outline=outline, width=max(1, self.px(width)) if outline else 0)
        if key:
            self.marks[key] = [x0, y0, x1, y1]
        return self

    def line(self, x0, y0, x1, y1, fill=INK, width=0.25, dash=None):
        if dash:
            L = math.hypot(x1 - x0, y1 - y0)
            n = int(L / dash)
            for i in range(0, n, 2):
                a, b = i / n, min(1, (i + 1) / n)
                self.d.line([self.px(x0 + (x1 - x0) * a), self.px(y0 + (y1 - y0) * a), self.px(x0 + (x1 - x0) * b), self.px(y0 + (y1 - y0) * b)], fill=fill, width=max(1, self.px(width)))
        else:
            self.d.line([self.px(x0), self.px(y0), self.px(x1), self.px(y1)], fill=fill, width=max(1, self.px(width)))
        return self

    def mark(self, key, x0, y0, x1, y1):
        self.marks[key] = [x0, y0, x1, y1]

    def save(self, ink_soften=0.6):
        img = self.img
        if ink_soften:
            img = img.filter(ImageFilter.GaussianBlur(ink_soften))
        img.save(os.path.join(OUT, self.name + '.png'), optimize=True)
        return {'w_mm': self.w, 'h_mm': self.h, 'marks': self.marks}


def example_tag(s, x, y, size=4.2, anchor='ra'):
    """small boxed 'EXAMPLE' label printed on the document"""
    f = SANS(s.px(size), 700)
    bb = s.d.textbbox((s.px(x), s.px(y)), 'EXAMPLE', font=f, anchor=anchor)
    pad = s.px(1.6)
    s.d.rounded_rectangle([bb[0] - pad, bb[1] - pad, bb[2] + pad, bb[3] + pad], radius=s.px(1), outline=(196, 120, 0), width=s.px(0.45))
    s.d.text((s.px(x), s.px(y)), 'EXAMPLE', font=f, fill=(196, 120, 0), anchor=anchor)


def bank_header(s, title, date):
    # small navy logo square with a yellow mark
    s.rect(14, 14, 26, 26, fill=NAVY, r=1.6)
    s.rect(17, 22.2, 23, 23.6, fill=YELLOW)
    s.text(30, 15.2, BANK, SANS(s.px(6.2), 800), NAVY)
    s.text(30, 22.6, 'Credit Card', SANS(s.px(3.6), 500), GREY)
    s.text(196, 15.5, title, SANS(s.px(5.4), 700), INK, 'ra')
    s.text(196, 23.0, date, SANS(s.px(3.8), 500), GREY, 'ra')
    s.line(14, 31, 196, 31, (190, 190, 190), 0.3)


def statement_may():
    s = Sheet('stmt_may', 210, 297, 10, seed=3)
    bank_header(s, 'Card Statement', 'Statement date: 12 May 2026')
    s.text(14, 37, 'Card ' + CARD, SANS(s.px(4.2), 500), INK)
    example_tag(s, 196, 37)
    # summary boxes
    s.rect(14, 48, 196, 118, fill=(240, 238, 230), r=2)
    s.text(22, 56, 'Total amount due', SANS(s.px(5.2), 500), GREY, key='may_total_label')
    s.text(22, 64, '₹50,000.00', SANS(s.px(13), 750), INK, key='may_total')
    s.line(108, 54, 108, 112, (205, 202, 192), 0.35)
    s.text(116, 56, 'Minimum amount due', SANS(s.px(5.2), 500), GREY, key='may_min_label')
    s.text(116, 64, '₹1,000.00', SANS(s.px(13), 750), INK, key='may_min')
    s.text(22, 92, 'Payment due date', SANS(s.px(4.4), 500), GREY)
    s.text(22, 99, '1 June 2026', SANS(s.px(6.6), 700), INK, key='may_due')
    s.text(116, 92, 'Statement date', SANS(s.px(4.4), 500), GREY)
    s.text(116, 99, '12 May 2026', SANS(s.px(6.6), 700), INK)
    s.mark('may_total_box', 14, 48, 108, 88)
    s.mark('may_min_box', 108, 48, 196, 88)
    # transactions
    s.text(14, 130, 'Transactions', SANS(s.px(5.2), 700), INK)
    s.line(14, 139, 196, 139, (190, 190, 190), 0.3)
    s.text(14, 142, 'Date', SANS(s.px(3.6), 600), GREY)
    s.text(44, 142, 'Description', SANS(s.px(3.6), 600), GREY)
    s.text(196, 142, 'Amount (₹)', SANS(s.px(3.6), 600), GREY, 'ra')
    s.line(14, 148, 196, 148, (215, 215, 215), 0.25)
    s.text(14, 152, '07 May', SANS(s.px(4.6), 600), INK, key='may_tx_date')
    s.text(44, 152, 'Retail purchase · Example Electronics', SANS(s.px(4.6), 500), INK)
    s.text(196, 152, '50,000.00', SANS(s.px(4.6), 600), INK, 'ra')
    s.line(14, 161, 196, 161, (215, 215, 215), 0.25)
    s.mark('may_tx_row', 12, 149, 198, 160)
    s.text(14, 175, 'Pay the total amount due by the due date to stay interest-free.', SANS(s.px(3.5), 450), GREY)
    s.text(14, 181, 'Paying only the minimum avoids the late payment charge; interest applies as per card terms.', SANS(s.px(3.5), 450), GREY)
    s.text(14, 280, 'Amounts and dates are fictional, for illustration only.', SANS(s.px(3.2), 450), GREY)
    return s.save()


def statement_june():
    s = Sheet('stmt_june', 210, 297, 10, seed=5)
    bank_header(s, 'Card Statement', 'Statement date: 12 June 2026')
    s.text(14, 37, 'Card ' + CARD, SANS(s.px(4.2), 500), INK)
    example_tag(s, 196, 37)
    s.text(14, 50, 'Account summary', SANS(s.px(5.2), 700), INK)
    s.line(14, 59, 196, 59, (190, 190, 190), 0.3)
    rows = [
        ('Previous balance (statement 12 May)', '50,000.00', None),
        ('Payment received · 1 June', '− 1,000.00', 'jun_sum_pay'),
        ('Balance before interest & other additions', '49,000.00', 'jun_sum_bal'),
    ]
    y = 63
    for lab, amt, key in rows:
        s.text(14, y, lab, SANS(s.px(4.4), 500), INK)
        s.text(196, y, amt, SANS(s.px(4.4), 650), INK, 'ra')
        if key:
            s.mark(key, 12, y - 2, 198, y + 7)
        y += 10
        s.line(14, y - 2.5, 196, y - 2.5, (222, 222, 222), 0.2)
    # transactions this cycle (narrow table + side panel, like many card statements)
    R = 146
    s.text(14, 103, 'Transactions (13 May – 12 June)', SANS(s.px(5.2), 700), INK)
    s.line(14, 112, R, 112, (190, 190, 190), 0.3)
    s.text(14, 115, 'Date', SANS(s.px(3.6), 600), GREY)
    s.text(38, 115, 'Description', SANS(s.px(3.6), 600), GREY)
    s.text(R, 115, 'Amount (₹)', SANS(s.px(3.6), 600), GREY, 'ra')
    s.line(14, 121, R, 121, (215, 215, 215), 0.25)
    tx = [
        ('01 Jun', 'Payment received', '1,000.00 CR', 'jun_pay', GREEN),
        ('04 Jun', 'Sri Lakshmi Stores', '2,400.00', 'jun_new', INK),
        ('12 Jun', 'Late payment charge', '0.00', 'jun_late', INK),
        ('12 Jun', 'Interest charged', 'CHARGED', 'jun_int', RED),
    ]
    y = 126
    for d, desc, amt, key, col in tx:
        s.text(14, y, d, SANS(s.px(5.0), 600), INK)
        s.text(38, y, desc, SANS(s.px(5.4), 560 if key != 'jun_int' else 700), INK)
        s.text(R, y, amt, SANS(s.px(5.4), 750), col, 'ra', key=key + '_amt')
        s.mark(key, 12, y - 3, R + 2, y + 9)
        y += 14
        s.line(14, y - 4, R, y - 4, (215, 215, 215), 0.25)
    s.rect(154, 103, 196, 178, fill=(238, 236, 228), r=2)
    s.text(158, 108, 'Finance charges', SANS(s.px(3.4), 700), INK)
    s.text(158, 114, 'Interest runs from', SANS(s.px(3.0), 450), GREY)
    s.text(158, 118.5, 'each purchase date', SANS(s.px(3.0), 450), GREY)
    s.text(158, 123, 'when the full bill', SANS(s.px(3.0), 450), GREY)
    s.text(158, 127.5, 'is not paid.', SANS(s.px(3.0), 450), GREY)
    s.text(158, 138, 'Late payment charge', SANS(s.px(3.4), 700), INK)
    s.text(158, 144, 'Avoided when the', SANS(s.px(3.0), 450), GREY)
    s.text(158, 148.5, 'minimum due is paid', SANS(s.px(3.0), 450), GREY)
    s.text(158, 153, 'by the due date.', SANS(s.px(3.0), 450), GREY)
    s.text(14, 190, 'Interest is calculated from each transaction date while a balance is carried,', SANS(s.px(3.5), 450), GREY)
    s.text(14, 196, 'and adjusted when a payment is credited. Rates and allocation as per card terms.', SANS(s.px(3.5), 450), GREY)
    s.text(14, 280, 'Amounts and dates are fictional, for illustration only.', SANS(s.px(3.2), 450), GREY)
    return s.save()


def thermal(name, w_mm, h_mm, lines, seed):
    """thermal-paper slip; lines = (y_mm, text, size_mm, weight, align, colour, key)"""
    s = Sheet(name, w_mm, h_mm, 12, base=(244, 243, 240), grain=5, seed=seed)
    for y, t, sz, w, al, col, key in lines:
        x = {'l': 5, 'c': w_mm / 2, 'r': w_mm - 5}[al]
        anchor = {'l': 'la', 'c': 'ma', 'r': 'ra'}[al]
        if t == '---':
            s.line(5, y, w_mm - 5, y, (120, 120, 120), 0.25, dash=1.2)
        else:
            s.text(x, y, t, MONO(s.px(sz), w), col, anchor, key=key)
    return s


def receipts():
    out = {}
    T = (52, 52, 56)
    # original purchase, 7 May
    L = [
        (6, 'EXAMPLE ELECTRONICS', 4.6, 800, 'c', T, None),
        (12.5, 'Ameerpet, Hyderabad', 3.2, 500, 'c', T, None),
        (18, '---', 0, 0, 'c', T, None),
        (22, 'CARD SALE', 4.2, 700, 'c', T, None),
        (30, 'DATE', 3.4, 500, 'l', T, None), (30, '07 MAY 2026', 4.6, 800, 'r', T, 'pos_may_date'),
        (37, 'TIME', 3.4, 500, 'l', T, None), (37, '18:42', 3.4, 600, 'r', T, None),
        (43, 'CARD', 3.4, 500, 'l', T, None), (43, CARD, 3.4, 600, 'r', T, None),
        (49, '---', 0, 0, 'c', T, None),
        (53, 'AMOUNT', 3.6, 600, 'l', T, None), (52, '₹50,000.00', 5.4, 800, 'r', T, 'pos_may_amt'),
        (62, '---', 0, 0, 'c', T, None),
        (66, 'APPROVED', 4.6, 800, 'c', T, None),
        (74, 'EXAMPLE · not a real receipt', 2.8, 500, 'c', (110, 110, 110), None),
    ]
    out['pos_may'] = thermal('pos_may', 58, 84, L, 11).save(0.7)
    L = [
        (6, 'SRI LAKSHMI', 4.6, 800, 'c', T, None),
        (12, 'GENERAL STORES', 4.0, 700, 'c', T, None),
        (18, '---', 0, 0, 'c', T, None),
        (22, 'CARD SALE', 4.2, 700, 'c', T, None),
        (30, 'DATE', 3.4, 500, 'l', T, None), (30, '04 JUN 2026', 4.6, 800, 'r', T, 'pos_jun_date'),
        (37, 'TIME', 3.4, 500, 'l', T, None), (37, '11:05', 3.4, 600, 'r', T, None),
        (43, 'CARD', 3.4, 500, 'l', T, None), (43, CARD, 3.4, 600, 'r', T, None),
        (49, '---', 0, 0, 'c', T, None),
        (53, 'AMOUNT', 3.6, 600, 'l', T, None), (52, '₹2,400.00', 5.4, 800, 'r', T, 'pos_jun_amt'),
        (62, '---', 0, 0, 'c', T, None),
        (66, 'APPROVED', 4.6, 800, 'c', T, None),
        (74, 'EXAMPLE · not a real receipt', 2.8, 500, 'c', (110, 110, 110), None),
    ]
    out['pos_jun'] = thermal('pos_jun', 58, 84, L, 12).save(0.7)

    # payment acknowledgement slip, 1 June (green, successful)
    s = Sheet('pay_slip', 74, 104, 12, base=(250, 250, 247), grain=4, seed=13)
    s.rect(0, 0, 74, 9, fill=NAVY)
    s.rect(5, 3.6, 9, 5.2, fill=YELLOW)
    s.text(11, 2.6, BANK, SANS(s.px(3.6), 800), WHITE)
    cx, cy, r = 37, 24, 8.5
    s.d.ellipse([s.px(cx - r), s.px(cy - r), s.px(cx + r), s.px(cy + r)], fill=(30, 150, 75))
    s.d.line([s.px(cx - 4.2), s.px(cy + 0.2), s.px(cx - 1.2), s.px(cy + 3.4), s.px(cx + 4.6), s.px(cy - 3.6)], fill=WHITE, width=s.px(1.5), joint='curve')
    s.text(37, 36, 'Payment received', SANS(s.px(5.4), 750), (20, 120, 58), 'ma', key='slip_title')
    s.text(37, 44, 'Successful', SANS(s.px(3.6), 600), (20, 120, 58), 'ma')
    s.line(6, 52, 68, 52, (215, 215, 215), 0.25)
    s.text(6, 56, 'Amount', SANS(s.px(3.4), 500), GREY)
    s.text(68, 55, '₹1,000.00', SANS(s.px(6.0), 800), INK, 'ra', key='slip_amt')
    s.text(6, 66, 'Credited on', SANS(s.px(3.4), 500), GREY)
    s.text(68, 65.5, '1 June 2026', SANS(s.px(4.4), 700), INK, 'ra', key='slip_date')
    s.text(6, 74, 'Card', SANS(s.px(3.4), 500), GREY)
    s.text(68, 74, CARD, SANS(s.px(3.6), 600), INK, 'ra')
    s.text(6, 81, 'Paid', SANS(s.px(3.4), 500), GREY)
    s.text(68, 81, 'Minimum amount due', SANS(s.px(3.4), 600), INK, 'ra')
    s.line(6, 88, 68, 88, (215, 215, 215), 0.25)
    example_tag(s, 37, 92, 3.0, 'ma')
    out['pay_slip'] = s.save(0.5)
    return out


def calendar():
    """Two-month desk planner sheet: May | June 2026, Monday-first."""
    W, H = 420, 230
    s = Sheet('calendar', W, H, 8, base=(248, 247, 243), grain=5, seed=21)
    months = [('MAY 2026', 4, 31, 15), ('JUNE 2026', 0, 30, 218)]  # (title, weekday of the 1st (Mon=0), days, x0)
    cw, ch, top = 26.5, 30, 42
    days = 'MON TUE WED THU FRI SAT SUN'.split()
    cells = {}
    for title, wd1, nd, x0 in months:
        s.text(x0, 12, title, SANS(s.px(11), 800), NAVY)
        s.rect(x0 + 120, 15, x0 + 185.5, 17.2, fill=YELLOW)
        for i, dn in enumerate(days):
            s.text(x0 + i * cw + 2, top - 9, dn, SANS(s.px(3.6), 700), GREY if i < 6 else (170, 60, 60))
        rows = math.ceil((wd1 + nd) / 7)
        for r in range(rows + 1):
            s.line(x0, top + r * ch, x0 + 7 * cw, top + r * ch, (178, 182, 190), 0.3)
        for c in range(8):
            s.line(x0 + c * cw, top, x0 + c * cw, top + rows * ch, (178, 182, 190), 0.3)
        for d in range(1, nd + 1):
            k = wd1 + d - 1
            r, c = divmod(k, 7)
            cx0, cy0 = x0 + c * cw, top + r * ch
            s.text(cx0 + 2.2, cy0 + 1.8, str(d), SANS(s.px(7.2), 650), INK if c < 6 else (170, 60, 60))
            cells[f"{title[:3]}{d}"] = [round(cx0, 2), round(cy0, 2), round(cx0 + cw, 2), round(cy0 + ch, 2)]
    s.text(15, 222, 'Desk planner', SANS(s.px(3.4), 500), GREY)
    s.text(405, 222, 'EXAMPLE dates', SANS(s.px(3.4), 600), (196, 120, 0), 'ra')
    res = s.save(0.5)
    res['cells'] = cells
    return res


def stickies():
    out = {}
    s = Sheet('sticky_50k', 76, 76, 12, base=(255, 222, 102), grain=7, seed=31)
    s.text(38, 8, 'Balance', HAND(s.px(11), 650), (30, 34, 70), 'ma')
    s.text(38, 24, '₹50,000', HAND(s.px(19), 700), (30, 34, 70), 'ma', key='s50_amt')
    s.line(14, 50, 62, 50, (30, 34, 70), 0.6)
    s.text(38, 56, 'from 7 May', HAND(s.px(9), 600), (30, 34, 70), 'ma')
    out['sticky_50k'] = s.save(0.5)

    s = Sheet('card_49k', 102, 76, 12, base=(246, 248, 252), grain=5, seed=32)
    for i in range(1, 7):
        s.line(4, 10 + i * 10.6, 98, 10 + i * 10.6, (170, 196, 230), 0.25)
    s.line(4, 9, 98, 9, (220, 120, 120), 0.35)
    s.text(8, 11, '₹50,000 − ₹1,000', HAND(s.px(11), 650), (30, 34, 70), key='c49_sum')
    s.text(8, 27, '= ₹49,000', HAND(s.px(19), 700), (20, 110, 55), key='c49_amt')
    s.text(8, 51, 'before interest &', HAND(s.px(8.6), 600), (30, 34, 70))
    s.text(8, 61.6, 'other additions', HAND(s.px(8.6), 600), (30, 34, 70))
    out['card_49k'] = s.save(0.5)
    return out


def credit_card():
    # ISO card 85.6 × 53.98 mm, navy matte
    s = Sheet('card_front', 85.6, 54, 16, base=NAVY, grain=3, seed=41)
    img = s.img
    # gentle diagonal sheen baked lightly
    g = Image.linear_gradient('L').rotate(35, expand=False).resize(img.size)
    img = Image.composite(Image.new('RGB', img.size, (22, 36, 74)), img, g.point(lambda v: int(v * 0.35)))
    s.img = img
    s.d = ImageDraw.Draw(img)
    s.text(6, 5.5, BANK, SANS(s.px(3.6), 800), (232, 234, 240))
    s.rect(6, 11.2, 11, 11.9, fill=YELLOW)
    # contactless arcs
    for i, rr in enumerate([2.2, 3.4, 4.6]):
        s.d.arc([s.px(74 - rr), s.px(23 - rr), s.px(74 + rr), s.px(23 + rr)], -50, 50, fill=(220, 224, 232), width=s.px(0.45))
    s.text(6, 35, CARD, MONO(s.px(4.6), 600), (236, 238, 244))
    s.text(6, 44, 'CARDHOLDER', SANS(s.px(2.8), 600), (190, 196, 210))
    s.text(79.6, 44.5, 'EXAMPLE', SANS(s.px(2.6), 700), YELLOW, 'ra')
    out = s.save(0.4)
    # back
    b = Sheet('card_back', 85.6, 54, 12, base=NAVY, grain=3, seed=42)
    b.rect(0, 6, 85.6, 15, fill=(18, 18, 22))
    b.rect(6, 20, 60, 28, fill=(236, 236, 230))
    b.text(6, 44, 'Illustrative card · not a real account', SANS(b.px(2.6), 500), (170, 176, 192))
    b.save(0.4)
    return out


def terminal_screens():
    out = {}
    for name, amt, date in [('term_may', '₹50,000.00', '07 MAY 2026'), ('term_jun', '₹2,400.00', '04 JUN 2026')]:
        s = Sheet(name, 56, 40, 14, base=(232, 240, 236), grain=0, seed=51)
        s.text(28, 4, 'SALE', SANS(s.px(4.4), 700), (40, 50, 50), 'ma')
        s.text(28, 11, amt, SANS(s.px(8.4), 800), (20, 30, 30), 'ma')
        s.d.ellipse([s.px(23.5), s.px(22), s.px(32.5), s.px(31)], fill=(30, 150, 75))
        s.d.line([s.px(25.6), s.px(26.6), s.px(27.6), s.px(28.8), s.px(30.6), s.px(24.4)], fill=WHITE, width=s.px(1.1))
        s.text(28, 32.5, 'APPROVED  ·  ' + date, SANS(s.px(3.0), 700), (20, 110, 55), 'ma')
        out[name] = s.save(0.3)
    s = Sheet('term_idle', 56, 40, 14, base=(222, 232, 228), grain=0, seed=52)
    s.text(28, 9, 'TAP · INSERT', SANS(s.px(4.6), 700), (40, 50, 50), 'ma')
    s.text(28, 16, 'CARD', SANS(s.px(4.6), 700), (40, 50, 50), 'ma')
    for i, rr in enumerate([3, 4.8, 6.6]):
        s.d.arc([s.px(28 - rr), s.px(31 - rr), s.px(28 + rr), s.px(31 + rr)], -55, 55, fill=(60, 80, 80), width=s.px(0.6))
    out['term_idle'] = s.save(0.3)
    # keypad face
    k = Sheet('term_keys', 64, 58, 12, base=(40, 42, 46), grain=4, seed=53)
    labels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#']
    for i, l in enumerate(labels):
        r, c = divmod(i, 3)
        x0, y0 = 6 + c * 18, 3 + r * 11.2
        k.rect(x0, y0, x0 + 15, y0 + 8.6, fill=(62, 64, 70), r=1.6)
        k.text(x0 + 7.5, y0 + 1.4, l, SANS(k.px(4.6), 600), (225, 226, 230), 'ma')
    k.save(0.3)
    return out


def phone_screens():
    """Phone UI: a full-Telugu-video page with a newly made cover. Generic player UI (no platform branding)."""
    out = {}
    W, H = 70, 150  # mm ≈ 19.5:9 portrait screen
    s = Sheet('phone_video', W, H, 16, base=(16, 18, 24), grain=0, seed=61)
    s.text(5, 3, '9:41', SANS(s.px(3.4), 600), (235, 235, 240))
    # cover (16:9) — made for this Short: navy/yellow/white
    cy0, cy1 = 14, 14 + W * 9 / 16
    cover = Image.new('RGB', (s.px(W), s.px(cy1 - cy0)), NAVY)
    cd = ImageDraw.Draw(cover)
    k = s.k
    # soft vignette glow
    glow = Image.new('L', cover.size, 0)
    gd = ImageDraw.Draw(glow)
    gd.ellipse([int(-10 * k), int(-12 * k), int(52 * k), int(44 * k)], fill=90)
    glow = glow.filter(ImageFilter.GaussianBlur(10 * k))
    cover = Image.composite(Image.new('RGB', cover.size, (28, 48, 100)), cover, glow)
    cd = ImageDraw.Draw(cover)
    cd.text((int(4.5 * k), int(4.5 * k)), 'క్రెడిట్ కార్డ్ అప్పు', font=TEL(int(5.4 * k), 800), fill=WHITE)
    cd.text((int(4.5 * k), int(12.5 * k)), 'పూర్తి వివరణ', font=TEL(int(6.6 * k), 800), fill=YELLOW)
    cd.rectangle([int(4.5 * k), int(26.4 * k), int(30 * k), int(27.4 * k)], fill=YELLOW)
    cd.text((int(4.5 * k), int(29.5 * k)), 'Minimum due · interest · your rights', font=SANS(int(2.7 * k), 600), fill=(205, 212, 230))
    # card graphic on the cover
    cx, cyc = 56 * k, 15 * k
    card = Image.new('RGBA', (int(19 * k), int(12 * k)), (0, 0, 0, 0))
    ImageDraw.Draw(card).rounded_rectangle([0, 0, card.size[0] - 1, card.size[1] - 1], radius=int(1.8 * k), fill=(250, 250, 250, 255))
    ImageDraw.Draw(card).rounded_rectangle([int(2.2 * k), int(3.4 * k), int(5.6 * k), int(6 * k)], radius=int(0.6 * k), fill=(214, 172, 64, 255))
    ImageDraw.Draw(card).rectangle([int(2.2 * k), int(8.6 * k), int(14 * k), int(9.4 * k)], fill=NAVY + (255,))
    card = card.rotate(-12, expand=True, resample=Image.BICUBIC)
    sh = Image.new('RGBA', card.size, (0, 0, 0, 0))
    sh.putalpha(card.split()[3].point(lambda v: int(v * 0.45)))
    sh = sh.filter(ImageFilter.GaussianBlur(1.2 * k))
    cover.paste((0, 0, 0), (int(cx - card.size[0] / 2 + 0.8 * k), int(cyc - card.size[1] / 2 + 1.2 * k)), sh)
    cover.paste(card, (int(cx - card.size[0] / 2), int(cyc - card.size[1] / 2)), card)
    s.img.paste(cover, (0, s.px(cy0)))
    # play button + progress
    pc = (W - 8, cy1 - 7)
    s.d.ellipse([s.px(pc[0] - 3.6), s.px(pc[1] - 3.6), s.px(pc[0] + 3.6), s.px(pc[1] + 3.6)], fill=YELLOW)
    s.d.polygon([(s.px(pc[0] - 1.1), s.px(pc[1] - 2)), (s.px(pc[0] - 1.1), s.px(pc[1] + 2)), (s.px(pc[0] + 2.2), s.px(pc[1]))], fill=NAVY)
    s.rect(0, cy1 - 0.6, W, cy1, fill=(80, 80, 90))
    s.rect(0, cy1 - 0.6, W * 0.04, cy1, fill=YELLOW)
    y = cy1 + 4
    s.text(4.5, y, 'క్రెడిట్ కార్డ్ అప్పు — పూర్తి వివరణ', TEL(s.px(4.0), 700), (240, 240, 244))
    s.text(4.5, y + 7.5, 'Full Telugu video', SANS(s.px(3.4), 600), YELLOW)
    # channel row
    y += 15
    s.d.ellipse([s.px(4.5), s.px(y), s.px(12.5), s.px(y + 8)], fill=NAVY, outline=YELLOW, width=s.px(0.4))
    s.text(8.5, y + 1.6, 'BP', SANS(s.px(3.2), 800), YELLOW, 'ma')
    s.text(15, y + 0.6, 'BE PRACTICAL', SANS(s.px(3.4), 800), (240, 240, 244))
    s.text(15, y + 4.8, 'with Kishore', SANS(s.px(2.8), 500), (170, 174, 186))
    # related list placeholders (blurred-ish blocks)
    y += 14
    for i in range(3):
        s.rect(4.5, y, 30, y + 14, fill=(36, 40, 52), r=1)
        s.rect(33, y + 1.5, 64, y + 3.5, fill=(48, 52, 64), r=0.8)
        s.rect(33, y + 6, 54, y + 7.6, fill=(40, 44, 56), r=0.8)
        y += 18
    s.mark('cover', 0, cy0, W, cy1)
    out['phone_video'] = s.save(0.3)
    s = Sheet('phone_lock', W, H, 8, base=(10, 12, 18), grain=0, seed=62)
    s.text(W / 2, 22, '9:41', SANS(s.px(15), 300), (230, 232, 240), 'ma')
    s.text(W / 2, 40, 'Friday, 12 June', SANS(s.px(3.6), 500), (200, 204, 214), 'ma')
    s.rect(6, 54, 64, 74, fill=(40, 44, 58), r=3)
    s.text(10, 57.5, BANK, SANS(s.px(2.8), 700), (200, 204, 214))
    s.text(10, 62.5, 'Your card statement is ready', SANS(s.px(3.2), 600), (240, 242, 248))
    s.text(10, 67.5, 'Statement date 12 June · EXAMPLE', SANS(s.px(2.8), 500), (180, 184, 196))
    out['phone_lock'] = s.save(0.3)
    return out


def notebook_page():
    s = Sheet('notebook', 148, 210, 8, base=(250, 249, 244), grain=5, seed=71)
    for i in range(1, 27):
        s.line(0, 14 + i * 7.4, 148, 14 + i * 7.4, (186, 206, 232), 0.25)
    s.line(18, 0, 18, 210, (226, 140, 140), 0.35)
    s.text(22, 22, 'Card plan', HAND(s.px(9), 700), (30, 34, 70))
    s.text(22, 36.2, '• Pay full bill —', HAND(s.px(7), 600), (30, 34, 70))
    s.text(22, 43.6, '   not just minimum?', HAND(s.px(7), 600), (30, 34, 70))
    s.text(22, 51, '• Stop new spends', HAND(s.px(7), 600), (30, 34, 70))
    s.text(22, 58.4, '   till it is cleared?', HAND(s.px(7), 600), (30, 34, 70))
    return s.save(0.5)


if __name__ == '__main__':
    layout = {
        'stmt_may': statement_may(),
        'stmt_june': statement_june(),
        **receipts(),
        'calendar': calendar(),
        **stickies(),
        'card_front': credit_card(),
        **terminal_screens(),
        **phone_screens(),
        'notebook': notebook_page(),
    }
    json.dump(layout, open(os.path.join(HERE, 'build', 'layout.json'), 'w'), indent=1)
    print('textures:', sorted(os.listdir(OUT)))
