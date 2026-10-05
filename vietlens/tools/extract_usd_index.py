"""VietLens — trích chỉ số giá đô la Mỹ (tháng cuối quý so với cùng kỳ năm trước) từ báo cáo tình hình kinh tế – xã hội
quý của Tổng cục Thống kê.

© 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.

Chỉ tiêu: "Chỉ số giá đô la Mỹ tháng M … tăng/giảm X% so với cùng kỳ năm trước", M là tháng cuối quý (3, 6, 9, 12).
Ở báo cáo quý IV, Tổng cục Thống kê có khi viết "so với tháng 12/năm trước" — cùng nghĩa với so cùng kỳ của tháng 12.
Đây là chỉ số giá USD trên thị trường trong nước (tỷ giá bình quân), không phải chỉ số DXY quốc tế; câu nói về
"thị trường quốc tế" bị loại. Nguồn: cùng 58 báo cáo quý của chuỗi FDI (data/raw/fdi_vn_quarterly.csv).

Chạy từ thư mục gốc repo:  python3 vietlens/tools/extract_usd_index.py [--cache DIR]
Đầu ra: vietlens/data/raw/usd_index_quarterly.csv
"""
import argparse
import csv
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from extract_fdi_trade import RAW, docx_text, fetch, page_text, sentences  # noqa: E402

MONTH = {'1': ('3', 'Ba'), '2': ('6', 'Sáu'), '3': ('9', 'Chín'), '4': ('12', 'Mười Hai', 'Mười hai')}


def pattern(q):
    y = int(q[:4])
    same = rf'so với cùng kỳ(?: năm (?:trước|{y - 1}))?'
    if q.endswith('Q4'):
        same = rf'(?:{same}|so với tháng 12/{y - 1})'
    return re.compile(r'Chỉ số giá đô la Mỹ tháng (?:' + '|'.join(MONTH[q[-1]]) + rf')(?:/{y}| năm {y})?\b'
                      r'[^.]*?(?P<s>tăng|giảm) (?P<v>[\d,]+)% ' + same)


def pick(text, q):
    pat = pattern(q)
    for x in sentences(text):
        m = pat.search(x)
        if m and 'thị trường quốc tế' not in x[:m.end()]:
            end = x.find('. ', m.end())
            return (1 if m['s'] == 'tăng' else -1) * float(m['v'].replace(',', '.')), x[m.start():end + 1 if end > 0 else None].strip()
    return None, None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--cache', default=os.path.join(os.path.expanduser('~'), '.cache', 'vietlens-gso'))
    a = ap.parse_args()
    os.makedirs(a.cache, exist_ok=True)
    src = {}
    with open(os.path.join(RAW, 'fdi_vn_quarterly.csv'), encoding='utf-8') as fh:
        for x in csv.DictReader(fh):
            if x['vintage'] == 'first' and x['variable'] == 'disbursed_ytd' and not x['source_name'].startswith('ALTERNATIVE'):
                src.setdefault(x['quarter'], (x['source_name'], x['source_url']))
    rows, missing = [], []
    for q in sorted(src, key=lambda q: (q[:4], q[-1])):
        name, url = src[q]
        raw = fetch(url, a.cache)
        val, quote = pick(page_text(raw), q)
        used = url
        if val is None:
            for link in sorted(set(re.findall(r'href="(https://www\.nso\.gov\.vn/wp-content/uploads/[^"]+\.docx)"',
                                              raw.decode('utf-8', errors='replace')))):
                val, quote = pick(docx_text(fetch(link, a.cache)), q)
                used, name = link, f'{name} (tệp lời văn .docx đính kèm)'
                break
        if val is None:
            missing.append(q)
            continue
        rows.append(dict(quarter=q, usd_index_yoy_pct=val, source_name=name, source_url=used, quote=quote))
    out = os.path.join(RAW, 'usd_index_quarterly.csv')
    with open(out, 'w', newline='', encoding='utf-8') as fh:
        w = csv.DictWriter(fh, fieldnames=list(rows[0]))
        w.writeheader()
        w.writerows(rows)
    print(f'{len(rows)} quý → {out}; thiếu: {missing or "không"}')


if __name__ == '__main__':
    main()
