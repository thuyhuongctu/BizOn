"""VietLens — trích chỉ số giá tiêu dùng CPI (tháng cuối quý so với cùng kỳ năm trước) từ báo cáo tình hình kinh tế – xã hội
quý của Tổng cục Thống kê.

© 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.

Chỉ tiêu: CPI tháng cuối quý (3, 6, 9, 12) so với cùng tháng năm trước. Ba cách viết được nhận:
  "CPI tháng M … tăng X% so với cùng kỳ năm trước"; "CPI tháng M tăng a% và so với cùng kỳ năm trước tăng X%";
  "So với cùng kỳ năm trước, CPI tháng M tăng X%". Ở quý IV, "so với tháng 12 năm trước" cùng nghĩa.
Quý nào báo cáo chỉ so với tháng 12 năm trước (không nêu so cùng kỳ) thì để trống, không suy.
Nguồn: cùng 58 báo cáo quý của chuỗi FDI (data/raw/fdi_vn_quarterly.csv).

Chạy từ thư mục gốc repo:  python3 vietlens/tools/extract_cpi.py [--cache DIR]
Đầu ra: vietlens/data/raw/cpi_quarterly.csv
"""
import argparse
import csv
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from extract_fdi_trade import RAW, docx_text, fetch, page_text, sentences  # noqa: E402

MONTH = {'1': ('3', 'Ba'), '2': ('6', 'Sáu'), '3': ('9', 'Chín'), '4': ('12', 'Mười Hai', 'Mười hai')}


V = r'(?P<s>tăng|giảm) (?P<v>[\d,]+)%'


def patterns(q):
    y = int(q[:4])
    subj = (r'(?:[Cc]hỉ số giá tiêu dùng(?: ?\(CPI ?\))?|CPI) (?:bình quân )?tháng (?:' + '|'.join(MONTH[q[-1]])
            + rf')(?:/{y}| năm {y})?\b')
    same = rf'so với cùng kỳ(?: năm (?:trước|{y - 1}))?'
    if q.endswith('Q4'):
        same = rf'(?:{same}|so với tháng 12/{y - 1}|so với tháng 12 năm {y - 1})'
    return [re.compile(subj + r'[^.]*?' + V + ' ' + same),
            re.compile(subj + r'[^.]*?' + same + r',? ' + V),
            re.compile(r'(?i)' + same + r', ' + subj + ' ' + V)]


def pick(text, q):
    for x in sentences(text):
        for pat in patterns(q):
            m = pat.search(x)
            if m and 'lạm phát cơ bản' not in x[max(0, m.start() - 30):m.start()]:
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
        rows.append(dict(quarter=q, cpi_yoy_pct=val, source_name=name, source_url=used, quote=quote))
    out = os.path.join(RAW, 'cpi_quarterly.csv')
    with open(out, 'w', newline='', encoding='utf-8') as fh:
        w = csv.DictWriter(fh, fieldnames=list(rows[0]))
        w.writeheader()
        w.writerows(rows)
    print(f'{len(rows)} quý → {out}; thiếu: {missing or "không"}')


if __name__ == '__main__':
    main()
