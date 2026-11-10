#!/usr/bin/env python3
"""Biến một đoạn phim nhân vật trên nền xanh thành «tranh động» cho game: tách nền (chỉ coi là nền những điểm vừa xanh lá vừa
sáng, nên vải tối bị ánh nền hắt lên vẫn được giữ), co mỗi khung về cùng chiều cao nhân vật (khi nhân vật tiến lại gần hay đi
ra xa máy quay), tìm một vòng lặp bước đi không thấy mối nối, xuất khung hình trong suốt và tờ sprite WebP kèm JSON.

    ffmpeg -i doan-phim.mp4 khung/%03d.png
    python3 scripts/3d/tach-nen-sprite.py khung/ ra/ ten-sprite KHUNG_DAU KHUNG_CUOI [nguong-dung-yen] [T0] [T1] [di|dung] [buoc] [dai-nhat] [xanh-la|xanh-duong]

Chế độ «di» (mặc định) dành cho đoạn đi bộ. Chế độ «dung» dành cho đoạn đứng thở hoặc đứng nói: mọi khung dùng chung một khung
cắt (giữ nguyên nhịp thở, không rung), lấy mỗi «buoc» khung một (mặc định 2), không tìm vòng lặp mà ghi "quaLai": true để game
phát xuôi rồi phát ngược. «dai-nhat»: số khung tối đa của vòng lặp đi bộ (để tờ sprite không quá nặng; mặc định không giới hạn).

Cần Pillow và numpy. Không gọi mạng. Nhân vật không được có màu trùng màu nền: mặc định nền xanh lá; nhân vật mặc đồ xanh lá
thì quay trên nền xanh dương và truyền «xanh-duong».
"""
import sys, glob, json, numpy as np
from PIL import Image
src, out, ten, a0, a1 = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4]), int(sys.argv[5]); NGUONG = float(sys.argv[6]) if len(sys.argv) > 6 else 1.2; T0 = float(sys.argv[7]) if len(sys.argv) > 7 else 18; T1 = float(sys.argv[8]) if len(sys.argv) > 8 else 42
CHE = sys.argv[9] if len(sys.argv) > 9 else 'di'; BUOC = int(sys.argv[10]) if len(sys.argv) > 10 else 2; DAI = int(sys.argv[11]) if len(sys.argv) > 11 else 999; NEN = 2 if len(sys.argv) > 12 and sys.argv[12] == 'xanh-duong' else 1
fs = sorted(glob.glob(src + '/*.png'))[a0:a1]; CAO = 640; K = []; hs = []; RG = int(CAO * 0.62 / 1.05 / 2) * 2
def tach(f):
    a = np.asarray(Image.open(f).convert('RGB')).astype(np.float32); k = a[..., NEN]; khac = np.maximum(*[a[..., i] for i in range(3) if i != NEN])
    d = k - khac; al = 1 - np.clip((d - T0) / T1, 0, 1) * np.clip((k - 90) / 40, 0, 1); a[..., NEN] = np.where(d > 0, np.minimum(k, khac + 6), k)   # nền = đúng màu nền VÀ sáng; vải tối bị hắt màu nền thì giữ
    ys, xs = np.where(al > 0.5); y0, y1 = ys.min(), ys.max(); tren = ys < y0 + (y1 - y0) * 0.55
    return np.dstack([np.clip(a, 0, 255), al * 255]).astype(np.uint8), y0, y1, xs[tren].mean()
def cat(rgba, y0, y1, cx):
    h = y1 - y0; w2 = int(h * 0.62); x0 = int(round(cx - w2 / 2))
    return np.asarray(Image.fromarray(rgba).crop((x0, y0 - int(h * 0.03), x0 + w2, y1 + int(h * 0.02))).resize((RG, CAO), Image.LANCZOS))
T = [tach(f) for f in fs]; hs = [int(t[2] - t[1]) for t in T]
if CHE == 'dung':   # một khung cắt chung: đỉnh đầu cao nhất, gót thấp nhất, tâm trung vị
    y0 = min(t[1] for t in T); y1 = max(t[2] for t in T); cx = float(np.median([t[3] for t in T])); K = [cat(t[0], y0, y1, cx) for t in T[::BUOC]]
else: K = [cat(*t) for t in T]
print(ten, 'khung', len(K), 'chieu cao nhan vat tu', min(hs), 'den', max(hs), 'px')
nho = [np.asarray(Image.fromarray(k).resize((k.shape[1] // 4, k.shape[0] // 4), Image.BILINEAR)).astype(np.float32) for k in K]
dong = [np.abs(nho[i] - nho[i + 1]).mean() for i in range(len(K) - 1)]
if CHE == 'dung': loop = K; print(ten, 'dung:', len(K), 'khung, chuyen dong tb', round(float(np.mean(dong)), 2), 'lech dau-cuoi', round(float(np.abs(nho[0] - nho[-1]).mean()), 2))
else:
    best = None; ng = NGUONG
    while best is None:   # không có đoạn nào đủ «động» thì hạ dần ngưỡng đứng yên
        for i in range(0, len(K) - 14):
            for j in range(i + 12, min(len(K), i + DAI + 1)):
                d = np.abs(nho[i] - nho[j]).mean()
                if j + 1 < len(K): d = (d + np.abs(nho[i + 1] - nho[j + 1]).mean()) / 2
                if min(dong[i:j]) < ng: continue          # bỏ đoạn có lúc đứng yên
                if best is None or d < best[0] * (1 - 0.002 * (j - i)): best = (d, i, j)
        if best is None: ng /= 2; print(ten, 'ha nguong dung yen xuong', round(ng, 3))
    d, i, j = best; loop = K[i:j]; print(ten, 'vong lap', a0 + i, '->', a0 + j, '(', j - i, 'khung )', 'do lech', round(float(d), 2), 'chuyen dong tb', round(float(np.mean(dong)), 2))
for n, k in enumerate(loop): Image.fromarray(k).save(f'{out}/{ten}-{n:03d}.png')
h2 = 256; w2 = int(round(loop[0].shape[1] * h2 / CAO / 2)) * 2; cot = 8; hang = -(-len(loop) // cot); to = Image.new('RGBA', (w2 * cot, h2 * hang))
for n, k in enumerate(loop): to.paste(Image.fromarray(k).resize((w2, h2), Image.LANCZOS), ((n % cot) * w2, (n // cot) * h2))
to.save(f'{out}/{ten}.webp', quality=90, method=6); meta = {'khung': len(loop), 'cot': cot, 'hang': hang, 'rong': w2, 'cao': h2, 'fps': 24}
if CHE == 'dung': meta['fps'] = round(24 / BUOC); meta['quaLai'] = True
json.dump(meta, open(f'{out}/{ten}.json', 'w')); print(ten, 'sprite', to.size)
