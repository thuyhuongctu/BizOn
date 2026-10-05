"""VietLens — trích xuất khẩu và nhập khẩu của khu vực có vốn đầu tư nước ngoài (lũy kế từ đầu năm)
từ báo cáo tình hình kinh tế – xã hội quý của Tổng cục Thống kê.

© 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.

Nguồn: cùng các báo cáo quý đã dùng cho chuỗi FDI (data/raw/fdi_vn_quarterly.csv, một trang mỗi quý).
Khi văn bản trên trang bị cắt (8 quý 2022–2024), đọc tệp lời văn .docx đính kèm trên chính trang đó.
Mỗi điểm số liệu giữ câu trích nguyên văn và đường dẫn. Số liệu công khai, không phải số Hải quan đã mua.

Quy tắc chọn câu: câu nói về kim ngạch hàng hóa xuất (nhập) khẩu lũy kế (tính chung / quý I / 6 tháng /
9 tháng / cả năm), không phải câu của riêng tháng cuối quý, không phải câu cán cân thương mại hay dịch vụ.
Giá trị khu vực FDI xuất khẩu là "kể cả dầu thô". Tổng kim ngạch để trống khi câu không nêu.

Chạy từ thư mục gốc repo:  python3 vietlens/tools/extract_fdi_trade.py [--cache DIR]
Đầu ra: vietlens/data/raw/fdi_sector_trade_quarterly.csv
"""
import argparse
import csv
import html
import io
import os
import re
import unicodedata
import urllib.request
import zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(os.path.dirname(HERE), 'data', 'raw')

NUM = r'(\d+(?:[.,]\d+)?)'
FDI = re.compile(r'khu vực có vốn đầu tư nước ngoài(?: \((?:kể|gồm) cả dầu thô\))?(?: ước(?: tính)?)? (?:đạt|nhập) '
                 r'(?:gần |hơn |khoảng |xấp xỉ )?' + NUM + r' tỷ USD(?:,? (tăng|giảm) ([\d,]+)%)?(?:, chiếm ' + NUM + r'%)?')
TOT = re.compile(r'(?:đạt|ước tính đạt|ước đạt) (?:gần |hơn |khoảng |xấp xỉ )?' + NUM + r' tỷ USD')
MONTHLY = re.compile(r'(?i)(xuất|nhập) khẩu(?: hàng hóa| hàng hoá)? (?:ước tính )?tháng|tháng (?:\d+|Một|Hai|Ba|Tư|Năm|Sáu|Bảy|'
                     r'Tám|Chín|Mười|Mười một|Mười hai|Mười Hai)(?:/\d{4})?(?: năm \d{4})? (?:ước|đạt)')
YTD = re.compile(r'(?i)tính chung|đầu năm|quý I\b|quý I/|ba tháng|3 tháng|sáu tháng|6 tháng|chín tháng|9 tháng|cả năm|năm \d{4}')


def norm(s):
    return re.sub(r'\s+', ' ', unicodedata.normalize('NFC', s))


def fetch(url, cache):
    name = os.path.join(cache, re.sub(r'[^A-Za-z0-9.]+', '_', url)[-150:])
    if not os.path.exists(name):
        with urllib.request.urlopen(url, timeout=120) as r, open(name, 'wb') as f:
            f.write(r.read())
    with open(name, 'rb') as f:
        return f.read()


def page_text(raw):
    t = raw.decode('utf-8', errors='replace')
    t = re.sub(r'(?is)<(script|style).*?</\1>', ' ', t)
    return norm(html.unescape(re.sub(r'<[^>]+>', ' ', t)))


def docx_text(raw):
    x = zipfile.ZipFile(io.BytesIO(raw)).read('word/document.xml').decode('utf-8')
    paras = [html.unescape(re.sub(r'<[^>]+>', '', p)) for p in re.findall(r'<w:p[ >].*?</w:p>', x, re.S)]
    return norm(' '.join(paras))


def sentences(s):
    out = []
    for x in re.split(r'(?<=[.;])\s+(?=[A-ZĐÁÀẢÃẠÂĂÊÔƠƯÍÌÓÒÚÙÝ“"(-])', s):
        if out and re.match(r'(?i)trong đó[,:]? ', x):     # "… đạt X tỷ USD. Trong đó, khu vực …"
            out[-1] = out[-1] + ' ' + x
        else:
            out.append(x)
    return out


def f(x):
    return float(x.replace(',', '.'))


def pick(text, quarter):
    out = {}
    for x in sentences(text):
        if 'vốn đầu tư nước ngoài' not in x or 'tỷ USD' not in x:
            continue
        m = FDI.search(x)
        if not m:
            continue
        pre = x[:m.end()]
        head = re.split(r'khu vực|bao gồm|[Tt]rong đó', x)[0]
        if re.search(r'xuất siêu|nhập siêu|cán cân|(?:xuất|nhập) khẩu dịch vụ|không kể dầu thô', pre) or 'kim ngạch' not in head.lower():
            continue
        d = 'export' if 'xuất khẩu' in head else 'import' if 'nhập khẩu' in head else None
        annual = quarter.endswith('Q4') and 'so với năm trước' in x[:len(pre) + 40]
        if not d or d in out or MONTHLY.search(head) or not (YTD.search(head) or annual):
            continue
        t = TOT.search(head)
        yoy = None if not m.group(2) else (1 if m.group(2) == 'tăng' else -1) * f(m.group(3))
        out[d] = dict(fdi=f(m.group(1)), total=f(t.group(1)) if t else None, yoy=yoy,
                      share=f(m.group(4)) if m.group(4) else None, quote=x.strip())
    return out


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
        got, used = pick(page_text(raw), q), url
        if len(got) < 2:          # văn bản trên trang bị cắt: đọc tệp lời văn .docx đính kèm
            for link in sorted(set(re.findall(r'href="(https://www\.nso\.gov\.vn/wp-content/uploads/[^"]+\.docx)"',
                                              raw.decode('utf-8', errors='replace')))):
                got, used = pick(docx_text(fetch(link, a.cache)), q), link
                name = f'{name} (tệp lời văn .docx đính kèm)'
                break
        for d in ('export', 'import'):
            if d not in got:
                raise SystemExit(f'{q}: không tìm thấy câu {d}')
            o = got[d]
            rows.append(dict(quarter=q, direction=d, fdi_ytd_usd_bn=o['fdi'],
                             total_ytd_usd_bn='' if o['total'] is None else o['total'],
                             share_printed='' if o['share'] is None else o['share'],
                             yoy_printed='' if o['yoy'] is None else o['yoy'],
                             source_name=name, source_url=used, quote=o['quote']))
    # Kiểm tra: lũy kế tăng dần trong năm; FDI < tổng; tỷ trọng in khớp FDI/tổng
    for d in ('export', 'import'):
        rr = [r for r in rows if r['direction'] == d]
        for p, r in zip(rr, rr[1:]):
            if r['quarter'][:4] == p['quarter'][:4] and r['fdi_ytd_usd_bn'] <= p['fdi_ytd_usd_bn']:
                raise SystemExit(f'{d} {r["quarter"]}: lũy kế không tăng')
        for r in rr:
            if r['total_ytd_usd_bn'] != '':
                assert r['fdi_ytd_usd_bn'] < r['total_ytd_usd_bn'], r
                if r['share_printed'] != '':
                    assert abs(100 * r['fdi_ytd_usd_bn'] / r['total_ytd_usd_bn'] - r['share_printed']) < 0.25, r
    out = os.path.join(RAW, 'fdi_sector_trade_quarterly.csv')
    with open(out, 'w', newline='', encoding='utf-8') as fh:
        w = csv.DictWriter(fh, fieldnames=list(rows[0]))
        w.writeheader()
        w.writerows(rows)
    print(f'{len(rows)} dòng ({len(rows) // 2} quý) → {out}')


if __name__ == '__main__':
    main()
