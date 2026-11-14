"""Khử viền sáng quanh ảnh nhân vật đã tách nền: bỏ hơi mờ, bỏ mảnh rời, lấp lỗ nền trắng (hạt giống chỉ định),
gọt mép 1 px rồi nhuộm lại mép bằng màu bên trong. Dùng: khu-vien.py vào.webp ra.webp [x,y ...] (hạt giống lỗ nền)."""
import sys, os
from collections import deque
import numpy as np
from PIL import Image

SRC, OUT, seeds = sys.argv[1], sys.argv[2], [tuple(map(int, s.split(','))) for s in sys.argv[3:]]
a = np.asarray(Image.open(SRC).convert('RGBA')).astype(np.float32)
rgb, al = a[..., :3].copy(), a[..., 3].copy()
H, W = al.shape


def shift(m, dy, dx, fill):
    o = np.full_like(m, fill)
    ys, yd = (slice(dy, None), slice(0, H - dy)) if dy >= 0 else (slice(0, H + dy), slice(-dy, None))
    xs, xd = (slice(dx, None), slice(0, W - dx)) if dx >= 0 else (slice(0, W + dx), slice(-dx, None))
    o[ys, xs] = m[yd, xd]
    return o


N8 = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]

# 1. Lỗ nền trắng: loang từ hạt giống trong vùng sáng, ít màu (nền trắng sót giữa tay và thân)
lum = rgb.min(2); sat = rgb.max(2) - rgb.min(2)
trang = (lum >= 196) & (sat <= 40) & (al > 0)
for sx, sy in seeds:
    assert trang[sy, sx], ('hạt giống không nằm trên nền trắng', sx, sy)
    q = deque([(sy, sx)]); trang_seen = np.zeros_like(trang); trang_seen[sy, sx] = True
    while q:
        y, x = q.popleft(); al[y, x] = 0
        for dy, dx in N8:
            ny, nx = y + dy, x + dx
            if 0 <= ny < H and 0 <= nx < W and trang[ny, nx] and not trang_seen[ny, nx]:
                trang_seen[ny, nx] = True; q.append((ny, nx))
    # nới thêm 1 px quanh lỗ để không còn chỉ trắng
    lo = trang_seen.copy()
    for dy, dx in N8: lo |= shift(trang_seen, dy, dx, False)
    al[lo & (lum >= 170)] = 0

# 2. Hơi mờ: alpha thấp thì bỏ hẳn
al[al < 24] = 0

# 3. Chỉ giữ khối hình lớn nhất (mảnh rời, đốm sót)
op = al > 40; lab = np.zeros((H, W), np.int32); sizes = [0]; k = 0
for y0, x0 in zip(*np.nonzero(op)):
    if lab[y0, x0]: continue
    k += 1; n = 0; q = deque([(y0, x0)]); lab[y0, x0] = k
    while q:
        y, x = q.popleft(); n += 1
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < H and 0 <= nx < W and op[ny, nx] and not lab[ny, nx]:
                lab[ny, nx] = k; q.append((ny, nx))
    sizes.append(n)
giu = int(np.argmax(sizes))
than = lab == giu
for _ in range(2):  # giữ cả mép mờ sát khối chính
    t = than.copy()
    for dy, dx in N8: t |= shift(than, dy, dx, False)
    than = t
al[~than] = 0

# 4. Gọt mép 1 px (min 3×3) rồi làm mềm (trung bình 3×3)
er = al.copy()
for dy, dx in N8: er = np.minimum(er, shift(al, dy, dx, 0))
mm = er.copy(); c = np.ones_like(er)
for dy, dx in N8: mm += shift(er, dy, dx, 0); c += 1
al2 = np.minimum(al, mm / c)   # mép mềm, không rộng hơn ảnh gốc
al2[al2 < 12] = 0

# 5. Nhuộm lại mép: màu của dải 3 px ngoài cùng lấy từ điểm bên trong (đục hẳn, cách mép ≥ 3 px)
dac = al >= 250
for _ in range(3):
    d = dac.copy()
    for dy, dx in N8: d &= shift(dac, dy, dx, False)
    dac = d
biet = dac.copy(); out = rgb.copy()
for _ in range(8):
    tong = np.zeros_like(rgb); dem = np.zeros((H, W), np.float32)
    for dy, dx in N8:
        m = shift(biet, dy, dx, False); tong += shift(out, dy, dx, 0) * m[..., None]; dem += m
    moi = (~biet) & (dem > 0) & (al2 > 0)
    out[moi] = tong[moi] / dem[moi][:, None]
    biet |= moi
canh = (al2 > 0) & ~dac
# trộn: sát bên trong giữ màu gốc nhiều hơn để không mất chi tiết
rgb2 = np.where(canh[..., None], out * 0.85 + rgb * 0.15, rgb)

res = np.dstack([rgb2, al2]).clip(0, 255).astype(np.uint8)
assert not os.path.exists(OUT), OUT
Image.fromarray(res, 'RGBA').save(OUT, 'WEBP', quality=92, method=6, exact=False)
print(OUT, W, H, 'khoi', k, 'lo', len(seeds))
