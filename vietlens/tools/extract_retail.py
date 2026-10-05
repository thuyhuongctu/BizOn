"""VietLens — trích tổng mức bán lẻ hàng hóa và doanh thu dịch vụ tiêu dùng (lũy kế từ đầu năm)
từ báo cáo tình hình kinh tế – xã hội quý của Tổng cục Thống kê.

© 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.

Nguồn: cùng 58 báo cáo quý của chuỗi FDI (data/raw/fdi_vn_quarterly.csv). Thứ tự tìm:
  1. Câu lũy kế ("Tính chung 6 tháng…, tổng mức bán lẻ … đạt X nghìn tỷ đồng, tăng Y% …, nếu loại trừ yếu tố giá tăng Z%").
  2. Nếu báo cáo chỉ nêu số lũy kế trong bảng tóm tắt (một số quý 2022–2024), lấy dòng "Tổng số" của bảng:
     cột 3 = lũy kế từ đầu năm, cột 6 = tốc độ tăng của số lũy kế. Trích nguyên văn dòng bảng.
  3. Nếu văn bản trên trang bị cắt, đọc tệp lời văn .docx đính kèm trên chính trang đó.

Chạy từ thư mục gốc repo:  python3 vietlens/tools/extract_retail.py [--cache DIR]
Đầu ra: vietlens/data/raw/retail_sales_quarterly.csv
"""
import argparse
import csv
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from extract_fdi_trade import MONTHLY, RAW, docx_text, fetch, page_text, sentences  # noqa: E402

N = r'(\d+(?:\.\d{3})*(?:,\d+)?)'
SUBJ = re.compile(r'(?i)tổng mức (?:bán lẻ hàng hóa|hàng hóa bán lẻ)(?: và doanh thu dịch vụ tiêu dùng)?(?: theo giá hiện hành)?')
REAL = re.compile(r'(?i)loại trừ yếu tố giá(?: thì)?(?: còn)? (tăng|giảm) ([\d,]+)%')


def v(x):
    return float(x.replace('.', '').replace(',', '.'))


def sgn(word, n):
    return (1 if word == 'tăng' else -1) * float(n.replace(',', '.'))


def from_sentence(x, q):
    m = SUBJ.search(x)
    if not m:
        return None
    before, after = x[:m.start()], x[m.end():]
    if MONTHLY.search(before + after[:80]) or re.search(
            r'(?i)tháng (?:Mười Hai|Mười|Chín|Sáu|Ba|\d+)(?:/\d{4}| năm \d{4})? (?:ước|đạt)', after[:60]):
        return None                                   # câu của riêng tháng cuối quý
    near = before + after[:40]
    ytd = re.search(r'(?i)tính chung|đầu năm|cả năm|năm \d{4}|\d tháng|(?:sáu|chín|ba) tháng', near)
    if q.endswith('Q1') and re.search(r'(?i)quý I\b|quý I/|ba tháng|3 tháng', near):
        ytd = True
    if not ytd or (re.search(r'(?i)quý (?:II|III|IV)\b', before + after[:20]) and not q.endswith('Q1')):
        return None                                   # câu của riêng một quý
    val = re.match(r'[^.;]*?(?:đạt|ước tính đạt|ước đạt) (?:gần |hơn |khoảng )?' + N + r' nghìn tỷ đồng(?:,? (tăng|giảm) ([\d,]+)%)?', after)
    if not val or 'Doanh thu bán lẻ hàng hóa' in after[:val.start(1)]:
        return None                                   # chú thích biểu đồ dính vào câu sau
    r = REAL.search(after)
    return dict(value=v(val.group(1)), yoy=sgn(val.group(2), val.group(3)) if val.group(2) else None,
                real=sgn(*r.groups()) if r else None, kind='câu')


def from_table(x):
    if not SUBJ.search(x) or 'Nghìn tỷ đồng' not in x:
        return None
    m = re.search(r'Tổng số ' + r'\s+'.join([N] * 6), x)
    if not m:
        return None
    return dict(value=v(m.group(3)), yoy=float(m.group(6).replace(',', '.')), real=None, kind='bảng tóm tắt')


def pick(text, q):
    ss = sentences(text)
    for x in ss:
        g = from_sentence(x, q)
        if g:
            return g, x.strip()
    for x in ss:
        g = from_table(x)
        if g:
            # chỉ giữ phần bảng tới hết dòng "Tổng số"
            cut = re.search(r'Tổng số (?:\S+\s+){5}\S+', x)
            return g, x[:cut.end()].strip() if cut else x.strip()
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
    rows = []
    for q in sorted(src, key=lambda q: (q[:4], q[-1])):
        name, url = src[q]
        raw = fetch(url, a.cache)
        g, quote = pick(page_text(raw), q)
        used = url
        if not g:
            for link in sorted(set(re.findall(r'href="(https://www\.nso\.gov\.vn/wp-content/uploads/[^"]+\.docx)"',
                                              raw.decode('utf-8', errors='replace')))):
                g, quote = pick(docx_text(fetch(link, a.cache)), q)
                used, name = link, f'{name} (tệp lời văn .docx đính kèm)'
                break
        if not g:
            raise SystemExit(f'{q}: không tìm thấy tổng mức bán lẻ lũy kế')
        rows.append(dict(quarter=q, retail_ytd_vnd_trn=g['value'], yoy_printed='' if g['yoy'] is None else g['yoy'],
                         real_yoy_printed='' if g['real'] is None else g['real'], found_in=g['kind'],
                         source_name=name, source_url=used, quote=quote))
    for p, r in zip(rows, rows[1:]):
        if r['quarter'][:4] == p['quarter'][:4] and r['retail_ytd_vnd_trn'] <= p['retail_ytd_vnd_trn']:
            raise SystemExit(f'{r["quarter"]}: lũy kế không tăng')
    out = os.path.join(RAW, 'retail_sales_quarterly.csv')
    with open(out, 'w', newline='', encoding='utf-8') as fh:
        w = csv.DictWriter(fh, fieldnames=list(rows[0]))
        w.writeheader()
        w.writerows(rows)
    print(f'{len(rows)} quý → {out}; {sum(r["found_in"] != "câu" for r in rows)} quý lấy từ bảng tóm tắt')


if __name__ == '__main__':
    main()
