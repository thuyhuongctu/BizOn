#!/usr/bin/env python3
"""Biến một đoạn phim nhân vật trên nền xanh thành «tranh động» cho game: tách nền, canh nhân vật đứng yên một chỗ, tìm một
vòng lặp bước đi không thấy mối nối, xuất các khung hình trong suốt và một tờ sprite (WebP) kèm tệp mô tả (JSON).

    ffmpeg -i doan-phim.mp4 khung/%03d.png
    python3 scripts/3d/tach-nen-sprite.py khung/ ra/ ten-sprite

Cần Pillow và numpy. Không gọi mạng. Nhân vật không được có màu xanh lá (nền là xanh lá).
"""
import sys, glob, json, numpy as np
from PIL import Image
src, out, ten = sys.argv[1], sys.argv[2], (sys.argv[3] if len(sys.argv) > 3 else 'sprite')
fs = sorted(glob.glob(src + '/*.png')); F = []
for f in fs:
    a = np.asarray(Image.open(f).convert('RGB')).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    d = g - np.maximum(r, b)                      # nền xanh: kênh lục trội hẳn
    al = np.clip(1 - (d - 18) / 42, 0, 1)
    g2 = np.where(d > 0, np.minimum(g, np.maximum(r, b) + 6), g)   # khử ánh xanh hắt lên mép
    F.append((np.dstack([r, g2, b]), al))
H, W = F[0][1].shape; box = []
for rgb, al in F:
    ys, xs = np.where(al > 0.5); y0, y1 = ys.min(), ys.max()
    tren = (ys < y0 + (y1 - y0) * 0.55)            # tâm ngang lấy theo thân trên, không theo chân đang vung
    box.append((xs[tren].mean(), y0, y1, xs.min(), xs.max()))
cx = np.array([b[0] for b in box]); y1 = np.array([b[2] for b in box]); y0 = np.array([b[1] for b in box])
cao = int(np.median(y1 - y0)); rong = int(max(b[4] - b[3] for b in box)) + 24; chan = int(np.median(y1))
print('khung', len(F), 'cao nhan vat', cao, 'troi ngang', round(float(cx.max() - cx.min()), 1), 'px; chan y', chan, '+-', round(float(y1.std()), 1))
SW, SH = (rong + 1) // 2 * 2, cao + 28; K = []
for (rgb, al), b in zip(F, box):
    x0 = int(round(b[0] - SW / 2)); yb = chan + 6; yt = yb - SH
    c = np.zeros((SH, SW, 4), np.uint8)
    xs0, xs1 = max(0, x0), min(W, x0 + SW); ys0, ys1 = max(0, yt), min(H, yb)
    c[ys0 - yt:ys1 - yt, xs0 - x0:xs1 - x0, :3] = np.clip(rgb[ys0:ys1, xs0:xs1], 0, 255)
    c[ys0 - yt:ys1 - yt, xs0 - x0:xs1 - x0, 3] = (al[ys0:ys1, xs0:xs1] * 255)
    K.append(c)
# vòng lặp: cặp khung (i, j) giống nhau nhất, cách nhau đủ một chu kỳ
nho = [np.asarray(Image.fromarray(k).resize((SW // 4, SH // 4), Image.BILINEAR)).astype(np.float32) for k in K]
best = None
for i in range(0, len(K) - 20):
    for j in range(i + 18, len(K)):
        d = np.abs(nho[i] - nho[j]).mean()
        if j + 1 < len(K): d = (d + np.abs(nho[i + 1] - nho[j + 1]).mean()) / 2
        if best is None or d < best[0] * (1 - 0.0005 * (j - i)): best = (d, i, j)
d, i, j = best; print('vong lap: khung', i, '->', j, '(', j - i, 'khung,', round((j - i) / 24, 2), 's ), do lech', round(float(d), 2))
loop = K[i:j]
for n, k in enumerate(loop): Image.fromarray(k).save(f'{out}/{ten}-{n:03d}.png')
# tờ sprite: cao 256 px mỗi khung
h2 = 256; w2 = int(round(SW * h2 / SH / 2)) * 2; cot = 8; hang = -(-len(loop) // cot)
to = Image.new('RGBA', (w2 * cot, h2 * hang))
for n, k in enumerate(loop): to.paste(Image.fromarray(k).resize((w2, h2), Image.LANCZOS), ((n % cot) * w2, (n // cot) * h2))
to.save(out + '/' + ten + '.webp', quality=90, method=6)
json.dump({'khung': len(loop), 'cot': cot, 'hang': hang, 'rong': w2, 'cao': h2, 'fps': 24, 'goc': [SW, SH]}, open(out + '/' + ten + '.json', 'w'))
print('sprite', to.size, 'khung', len(loop), 'o', (w2, h2))
