#!/usr/bin/env python3
"""Làm sạch ảnh nhân vật đã tách nền của Văn phòng đội (28/11/2026, chị báo «tách nền chưa kỹ»).

Ảnh tách nền cũ có viền mờ tối (màu nền cũ dính ở mép, thấy rõ trên nền kem của trang) và quầng mờ còn sót.
Script KHÔNG ghi đè ảnh gốc: đọc assets/character/van-phong/<tên>.webp, ghi <tên>-v2.webp cạnh đó.

Các bước, chỉ dùng Pillow + numpy:
  0. Bóng nền cũ: điểm mờ (alpha < 200) màu rất tối (độ sáng < TOI) nằm cách thân đặc quá 2 px là nền tối còn sót
     (ví dụ mảng mờ cạnh tấm vải và quanh đồ vật dưới chân Lam Việt): bỏ hẳn.
  1. Kênh alpha: bỏ quầng rất mờ (alpha < THAP), kéo phần gần đặc thành đặc (alpha > CAO), giữ dải chuyển giữa.
  2. Bỏ đốm rời: vùng nhìn thấy nhỏ hơn DOM_NHO điểm, không dính vào thân nhân vật.
  3. Co mép 1 px rồi làm mịn: bỏ vòng điểm ngoài cùng (thường là màu nền cũ), giữ khử răng cưa.
  4. Khử màu viền: điểm ở mép (alpha < 250) lấy màu của phần thân đặc gần nhất (trung bình có trọng số trong bán kính BAN_KINH),
     nên viền không còn xám/tối.
Chạy: python3 scripts/van-phong/lam-sach-anh.py hcth-an-nhien hcth-lam-viet ...
"""
import os
import sys
from collections import deque

import numpy as np
from PIL import Image, ImageFilter

GOC = os.path.join(os.path.dirname(__file__), '..', '..', 'assets', 'character', 'van-phong')
THAP, CAO, DOM_NHO, BAN_KINH, TOI = 28, 228, 120, 4, 60


def bo_dom_roi(A):
    """Giữ các vùng nhìn thấy đủ lớn (alpha > 0); xóa đốm rời nhỏ hơn DOM_NHO điểm."""
    h, w = A.shape
    thay = A > 0
    da = np.zeros_like(thay)
    for y0 in range(h):
        for x0 in np.flatnonzero(thay[y0] & ~da[y0]):
            q, vung = deque([(y0, x0)]), [(y0, x0)]
            da[y0, x0] = True
            while q:
                y, x = q.popleft()
                for yy, xx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
                    if 0 <= yy < h and 0 <= xx < w and thay[yy, xx] and not da[yy, xx]:
                        da[yy, xx] = True
                        q.append((yy, xx))
                        vung.append((yy, xx))
            if len(vung) < DOM_NHO:
                ys, xs = zip(*vung)
                A[list(ys), list(xs)] = 0
    return A


def lam_sach(ten):
    im = Image.open(os.path.join(GOC, ten + '.webp')).convert('RGBA')
    a = np.array(im).astype(np.float32)
    rgb, A = a[..., :3], a[..., 3]
    # 0. bóng nền cũ: mờ, rất tối, xa thân đặc
    gan_than = np.array(Image.fromarray(((A >= 250) * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5))) > 0
    A[(A < 200) & (rgb.mean(-1) < TOI) & ~gan_than] = 0
    # 1. alpha: bỏ quầng mờ, đặc hóa phần gần đặc
    A = np.clip((A - THAP) / (CAO - THAP), 0, 1) * 255
    # 2. đốm rời
    A = bo_dom_roi(A)
    # 3. co mép 1 px rồi làm mịn lại (giữ khử răng cưa)
    Ai = Image.fromarray(A.astype(np.uint8))
    co = Ai.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.7))
    A = np.minimum(A, np.array(co).astype(np.float32))
    # 4. khử màu viền: màu thân đặc gần nhất
    dac = (A >= 250).astype(np.float32)
    trong = Image.fromarray((dac * 255).astype(np.uint8))
    tong_w = np.array(trong.filter(ImageFilter.BoxBlur(BAN_KINH))).astype(np.float32) / 255
    mau = np.zeros_like(rgb)
    for k in range(3):
        kenh = Image.fromarray(np.clip(rgb[..., k] * dac, 0, 255).astype(np.uint8))
        mau[..., k] = np.array(kenh.filter(ImageFilter.BoxBlur(BAN_KINH))).astype(np.float32)
    co_mau = tong_w > 0.02
    vien = (A < 250) & co_mau
    rgb[vien] = mau[vien] / tong_w[vien, None]
    out = np.dstack([np.clip(rgb, 0, 255), np.clip(A, 0, 255)]).astype(np.uint8)
    dich = os.path.join(GOC, ten + '-v2.webp')
    Image.fromarray(out, 'RGBA').save(dich, 'WEBP', quality=90, method=6)
    return dich


if __name__ == '__main__':
    for t in sys.argv[1:] or []:
        print(lam_sach(t))
