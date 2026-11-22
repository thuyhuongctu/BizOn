#!/usr/bin/env python3
"""Cắt một tệp giọng đọc liền mạch thành từng câu theo mốc từng ký tự (BizOn, 21/11/2026).

Dùng cho video «Đường ngắn nhất đi qua Singapore» (docs/video/kich-ban-cang-cai-mep.md): dịch vụ đọc trả về một tệp WAV
cho cả bài cùng mốc thời gian của từng ký tự (original_characters). Script tìm từng câu trong văn bản đã gửi đi đọc,
lấy mốc ký tự đầu và cuối câu, cắt ra 01.mp3…NN.mp3, tùy chọn tăng tốc độ đọc (atempo, giữ cao độ).

  python3 -I scripts/video/cat-giong-theo-cau.py --wav giong.wav --moc data.json --cau loi.json --out <thư mục> [--toc 1.2]

loi.json: {"tts": ["câu 1", "câu 2", …], "text": "câu 1 câu 2 …"} – đúng văn bản đã gửi đi đọc.
"""
import argparse
import json
import subprocess
import sys
from pathlib import Path

ap = argparse.ArgumentParser()
ap.add_argument('--wav', required=True)
ap.add_argument('--moc', required=True)
ap.add_argument('--cau', required=True)
ap.add_argument('--out', required=True)
ap.add_argument('--toc', type=float, default=1.0, help='hệ số tốc độ đọc (1.0 = giữ nguyên)')
ap.add_argument('--dem', type=float, default=0.04, help='giây chừa thêm trước và sau mỗi câu')
a = ap.parse_args()

chars = json.load(open(a.moc, encoding='utf-8'))['original_characters']
loi = json.load(open(a.cau, encoding='utf-8'))
text = ''.join(c['text'] for c in chars)
if text != loi['text']:
    sys.exit('Mốc ký tự không khớp văn bản đã gửi đi đọc')
out = Path(a.out)
out.mkdir(parents=True, exist_ok=True)
pos = 0
for i, cau in enumerate(loi['tts'], 1):
    s = text.index(cau, pos)
    e = s + len(cau) - 1
    pos = e + 1
    t0 = max(0.0, chars[s]['start_time'] - a.dem)
    t1 = chars[e]['end_time'] + a.dem
    loc = f'atrim={t0:.3f}:{t1:.3f},asetpts=PTS-STARTPTS'
    if abs(a.toc - 1.0) > 1e-3:
        loc += f',atempo={a.toc:.3f}'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', a.wav, '-af', loc, '-ar', '44100', '-ac', '1',
                    '-c:a', 'libmp3lame', '-q:a', '2', str(out / f'{i:02d}.mp3')], check=True)
    print(f'{i:02d}: {t0:6.2f}–{t1:6.2f} s  {cau[:60]}')
