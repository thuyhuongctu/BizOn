#!/usr/bin/env python3
"""Biến một đoạn phim nhân vật trên nền xanh thành «tranh động» cho game: tách nền (chỉ coi là nền những điểm vừa xanh lá vừa
sáng, nên vải tối bị ánh nền hắt lên vẫn được giữ), co mỗi khung về cùng chiều cao nhân vật (khi nhân vật tiến lại gần hay đi
ra xa máy quay), tìm một vòng lặp bước đi không thấy mối nối, xuất khung hình trong suốt và tờ sprite WebP kèm JSON.

    ffmpeg -i doan-phim.mp4 khung/%03d.png
    python3 scripts/3d/tach-nen-sprite.py khung/ ra/ ten-sprite KHUNG_DAU KHUNG_CUOI [nguong-dung-yen] [T0] [T1]

Cần Pillow và numpy. Không gọi mạng. Nhân vật không được có màu xanh lá sáng (nền là xanh lá).
"""
import sys, glob, json, numpy as np
from PIL import Image
src, out, ten, a0, a1 = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4]), int(sys.argv[5]); NGUONG = float(sys.argv[6]) if len(sys.argv) > 6 else 1.2; T0 = float(sys.argv[7]) if len(sys.argv) > 7 else 18; T1 = float(sys.argv[8]) if len(sys.argv) > 8 else 42
fs = sorted(glob.glob(src + '/*.png'))[a0:a1]; CAO = 640; K = []; hs = []
for f in fs:
    a = np.asarray(Image.open(f).convert('RGB')).astype(np.float32); r, g, b = a[..., 0], a[..., 1], a[..., 2]
    d = g - np.maximum(r, b); al = 1 - np.clip((d - T0) / T1, 0, 1) * np.clip((g - 90) / 40, 0, 1); g2 = np.where(d > 0, np.minimum(g, np.maximum(r, b) + 6), g)   # nền = xanh lá VÀ sáng; vải tối bị hắt xanh thì giữ
    ys, xs = np.where(al > 0.5); y0, y1 = ys.min(), ys.max(); tren = ys < y0 + (y1 - y0) * 0.55; cx = xs[tren].mean(); h = y1 - y0; hs.append(h)
    rgba = np.dstack([np.clip(np.dstack([r, g2, b]), 0, 255), al * 255]).astype(np.uint8)
    w2 = int(h * 0.62); x0 = int(round(cx - w2 / 2)); box = (x0, y0 - int(h * 0.03), x0 + w2, y1 + int(h * 0.02))
    im = Image.fromarray(rgba).crop(box).resize((int(CAO * 0.62 / 1.05 / 2) * 2, CAO), Image.LANCZOS); K.append(np.asarray(im))
print(ten, 'khung', len(K), 'chieu cao nhan vat tu', min(hs), 'den', max(hs), 'px')
nho = [np.asarray(Image.fromarray(k).resize((k.shape[1] // 4, k.shape[0] // 4), Image.BILINEAR)).astype(np.float32) for k in K]
dong = [np.abs(nho[i] - nho[i + 1]).mean() for i in range(len(K) - 1)]
best = None
for i in range(0, len(K) - 14):
    for j in range(i + 12, len(K)):
        d = np.abs(nho[i] - nho[j]).mean()
        if j + 1 < len(K): d = (d + np.abs(nho[i + 1] - nho[j + 1]).mean()) / 2
        if min(dong[i:j]) < NGUONG: continue          # bỏ đoạn có lúc đứng yên
        if best is None or d < best[0] * (1 - 0.002 * (j - i)): best = (d, i, j)
d, i, j = best; loop = K[i:j]; print(ten, 'vong lap', a0 + i, '->', a0 + j, '(', j - i, 'khung )', 'do lech', round(float(d), 2), 'chuyen dong tb', round(float(np.mean(dong)), 2))
for n, k in enumerate(loop): Image.fromarray(k).save(f'{out}/{ten}-{n:03d}.png')
h2 = 256; w2 = int(round(loop[0].shape[1] * h2 / CAO / 2)) * 2; cot = 8; hang = -(-len(loop) // cot); to = Image.new('RGBA', (w2 * cot, h2 * hang))
for n, k in enumerate(loop): to.paste(Image.fromarray(k).resize((w2, h2), Image.LANCZOS), ((n % cot) * w2, (n // cot) * h2))
to.save(f'{out}/{ten}.webp', quality=90, method=6); json.dump({'khung': len(loop), 'cot': cot, 'hang': hang, 'rong': w2, 'cao': h2, 'fps': 24}, open(f'{out}/{ten}.json', 'w')); print(ten, 'sprite', to.size)
