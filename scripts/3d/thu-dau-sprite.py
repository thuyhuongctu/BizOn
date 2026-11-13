#!/usr/bin/env python3
"""Thu nhỏ phần đầu của mọi khung trong một tờ sprite «tranh động» (khi đầu to so với thân), giữ thân và chân nguyên chỗ.

    python3 scripts/3d/thu-dau-sprite.py <tờ gốc không đuôi> <tờ mới không đuôi> <tỷ lệ, ví dụ 0.8>

Cổ là hàng hẹp nhất trong khoảng 30–65 px dưới đỉnh đầu; phần trên cổ được thu nhỏ quanh tâm đầu rồi đặt lại sát cổ.
Ghi tờ mới (.webp + .json), không ghi đè tờ gốc. Cần Pillow và numpy. Không gọi mạng.
"""
import sys, json, numpy as np
from PIL import Image
src, dst, s = sys.argv[1], sys.argv[2], float(sys.argv[3])
a = Image.open(src + '.webp').convert('RGBA'); j = json.load(open(src + '.json'))
W, H = a.width // j['cot'], a.height // j['hang']; out = Image.new('RGBA', a.size, (0, 0, 0, 0))
for k in range(j['khung']):
    c, r = k % j['cot'], k // j['cot']; f = a.crop((c * W, r * H, (c + 1) * W, (r + 1) * H)); al = np.array(f)[..., 3] > 128
    w = al.sum(1); top = int(np.argmax(w > 0))
    yn = top + 30 + int(np.argmin(w[top + 30: top + 65]))            # cổ: hàng hẹp nhất dưới cằm
    cut = yn + 2
    head = f.crop((0, 0, W, cut)); xs = np.where(al[:cut].any(0))[0]; cx = (xs.min() + xs.max()) / 2
    hw, hh = max(1, round(W * s)), max(1, round(cut * s)); hs = head.resize((hw, hh), Image.LANCZOS)
    body = np.array(f); body[:cut] = 0; g = Image.fromarray(body)
    g.alpha_composite(hs, (int(round(cx - cx * s)), cut - hh))
    out.paste(g, (c * W, r * H))
out.save(dst + '.webp', quality=88, method=6); json.dump(j, open(dst + '.json', 'w'))
print('ok', dst)
