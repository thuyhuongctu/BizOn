"""VietLens — dựng lớp dữ liệu thật (Nấc 1) từ các tệp nguồn công khai trong vietlens/data/raw/.

© 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.

Quy tắc: không có xuất xứ thì không lên bảng. Mỗi chuỗi kèm nguồn, kỳ, phương pháp, giới hạn
và quyền tái phân phối; mỗi điểm số liệu GSO kèm đường dẫn và câu trích nguyên văn.
Không dùng dữ liệu Hải quan đã mua (chưa rõ giấy phép).

Chạy từ thư mục gốc repo:  python3 vietlens/tools/build_official.py
Đầu ra: vietlens/official-data.js (trình duyệt) và vietlens/data/official.json (Nấc 1, máy đọc).
"""
import csv
import json
import os
from collections import defaultdict
from datetime import date

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
RAW = os.path.join(ROOT, 'data', 'raw')


def rows(name):
    with open(os.path.join(RAW, name), encoding='utf-8') as f:
        return list(csv.DictReader(f))


def qkey(q):
    return int(q[:4]) * 10 + int(q[-1])


def fdi_series():
    r = [x for x in rows('fdi_vn_quarterly.csv')
         if x['vintage'] == 'first' and not x['source_name'].startswith('ALTERNATIVE SOURCE')]
    by = defaultdict(dict)
    for x in r:
        by[x['variable']].setdefault(x['quarter'], x)          # giữ dòng đầu tiên mỗi quý
    out = []
    for var, sid, label, extra_lim in (
        ('disbursed_ytd', 'fdi_disbursed', 'FDI giải ngân (thực hiện), cả nước', ''),
        ('registered_new_ytd', 'fdi_registered_new', 'FDI đăng ký cấp mới, cả nước',
         ' Mốc chốt số liệu thay đổi: đến ngày 20 của tháng cuối quý cho tới quý II/2024 (ngày 15 tháng 12 các năm 2012–2015), '
         'cuối tháng từ quý III/2024 — so sánh qua mốc này cần thận trọng.')):
        d = by[var]
        qs = sorted(d, key=qkey)
        obs = []
        for q in qs:
            ytd = float(d[q]['value_usd_bn'])
            prev = f'{q[:4]}Q{int(q[-1]) - 1}'
            flow = ytd if q.endswith('Q1') else (ytd - float(d[prev]['value_usd_bn']) if prev in d else None)
            obs.append({'period': q, 'ytd': round(ytd, 4), 'value': None if flow is None else round(flow, 4),
                        'source': d[q]['source_name'], 'url': d[q]['source_url'], 'quote': d[q]['quote']})
        last = obs[-1]
        same = next((o for o in obs if o['period'] == f'{int(last["period"][:4]) - 1}{last["period"][4:]}'), None)
        out.append({
            'id': sid, 'label': label, 'domain': 'economy', 'unit': 'tỷ USD', 'frequency': 'quý',
            'official': True, 'chart': 'bar',
            'latest': {'period': last['period'], 'ytd': last['ytd'],
                       'ytdYoY': None if not same else round(100 * (last['ytd'] / same['ytd'] - 1), 1)},
            'source': 'Tổng cục Thống kê (nay là Cục Thống kê, Bộ Tài chính) — báo cáo tình hình kinh tế – xã hội quý; một số quý từ thông cáo của Cục Đầu tư nước ngoài qua báo chí',
            'method': 'Số lũy kế từ đầu năm công bố lần đầu tại cuối mỗi quý; dòng vốn quý = lũy kế quý này − lũy kế quý trước cùng năm.',
            'limitation': 'Số ước tính/sơ bộ lần công bố đầu, chưa cập nhật số điều chỉnh của năm sau. Vốn giải ngân ≠ vốn đăng ký.' + extra_lim,
            'rights': 'Số liệu thống kê nhà nước công bố công khai; trích dẫn có ghi nguồn. Rà điều khoản trước khi phát hành qua API.',
            'observations': obs
        })
    return out


def fdi_trade_series():
    """Xuất/nhập khẩu của khu vực có vốn FDI, lũy kế từ đầu năm (tools/extract_fdi_trade.py)."""
    r = rows('fdi_sector_trade_quarterly.csv')
    out = []
    for d, sid, label, extra in (
        ('export', 'fdi_sector_exports', 'Xuất khẩu hàng hóa của khu vực có vốn FDI (kể cả dầu thô)', ' Gồm cả dầu thô.'),
        ('import', 'fdi_sector_imports', 'Nhập khẩu hàng hóa của khu vực có vốn FDI', '')):
        by = {x['quarter']: x for x in r if x['direction'] == d}
        obs = []
        for q in sorted(by, key=qkey):
            x = by[q]
            ytd = float(x['fdi_ytd_usd_bn'])
            prev = f'{q[:4]}Q{int(q[-1]) - 1}'
            flow = ytd if q.endswith('Q1') else (ytd - float(by[prev]['fdi_ytd_usd_bn']) if prev in by else None)
            share = (round(100 * ytd / float(x['total_ytd_usd_bn']), 1) if x['total_ytd_usd_bn']
                     else float(x['share_printed']) if x['share_printed'] else None)
            obs.append({'period': q, 'ytd': ytd, 'value': None if flow is None else round(flow, 2), 'shareYtd': share,
                        'yoyPrinted': float(x['yoy_printed']) if x['yoy_printed'] else None,
                        'source': x['source_name'], 'url': x['source_url'], 'quote': x['quote']})
        last = obs[-1]
        same = next((o for o in obs if o['period'] == f'{int(last["period"][:4]) - 1}{last["period"][4:]}'), None)
        out.append({
            'id': sid, 'label': label, 'domain': 'trade', 'unit': 'tỷ USD', 'frequency': 'quý', 'official': True, 'chart': 'bar',
            # So cùng kỳ: lấy tỷ lệ Tổng cục Thống kê in trong câu (so với số đã điều chỉnh của năm trước),
            # không tự tính từ số công bố lần đầu năm trước (hai cách có thể lệch vài điểm phần trăm).
            'latest': {'period': last['period'], 'ytd': last['ytd'], 'share': last['shareYtd'],
                       'ytdYoY': last['yoyPrinted'] if last['yoyPrinted'] is not None
                       else (None if not same else round(100 * (last['ytd'] / same['ytd'] - 1), 1))},
            'source': 'Tổng cục Thống kê (nay là Cục Thống kê, Bộ Tài chính) — báo cáo tình hình kinh tế – xã hội quý',
            'method': 'Kim ngạch lũy kế từ đầu năm của khu vực có vốn đầu tư nước ngoài, công bố lần đầu tại cuối mỗi quý; '
                      'giá trị quý = lũy kế quý này − lũy kế quý trước cùng năm. Tỷ trọng = khu vực FDI / tổng kim ngạch cùng kỳ. '
                      'Tăng/giảm so cùng kỳ: tỷ lệ in trong báo cáo (so với số đã điều chỉnh của năm trước).',
            'limitation': 'Số ước tính lần công bố đầu, chưa thay bằng số chính thức của Hải quan; không có chiều mặt hàng hay đối tác.'
                          + extra + ' Một số quý báo cáo không nêu tổng kim ngạch trong cùng câu nên để trống tỷ trọng. '
                          '8 quý 2022–2024 lấy từ tệp lời văn .docx đính kèm vì văn bản trên trang bị cắt.',
            'rights': 'Số liệu thống kê nhà nước công bố công khai; trích dẫn có ghi nguồn. Rà điều khoản trước khi phát hành qua API.',
            'observations': obs
        })
    return out


def partner_series():
    r = rows('fdi_stock_by_source.csv')
    out = []
    for as_of in ('2012-12-31', '2008-12-31'):
        rr = [x for x in r if x['as_of'] == as_of]
        total = next(float(x['registered_usd_m']) for x in rr if x['economy'] == 'TOTAL')
        obs = sorted(({'period': x['economy'], 'value': round(float(x['registered_usd_m']) / 1000, 3),
                       'share': round(100 * float(x['registered_usd_m']) / total, 1), 'projects': int(x['projects']),
                       'source': x['source_name'], 'url': x['source_url'], 'quote': x['quote']}
                      for x in rr if x['economy'] != 'TOTAL'), key=lambda o: -o['value'])
        out.append({
            'id': f'fdi_stock_partner_{as_of[:4]}', 'label': f'Vốn FDI đăng ký lũy kế theo đối tác (dự án còn hiệu lực, {as_of[8:]}/{as_of[5:7]}/{as_of[:4]})',
            'domain': 'economy', 'unit': 'tỷ USD', 'frequency': 'mốc', 'official': True, 'chart': 'hbar',
            'latest': {'period': as_of, 'total': round(total / 1000, 2)},
            'source': rr[0]['source_name'].split(',')[0] + ' — Niên giám Thống kê',
            'method': 'Bảng đầu tư trực tiếp nước ngoài được cấp phép phân theo đối tác chủ yếu, lũy kế các dự án còn hiệu lực.',
            'limitation': 'Chỉ các đối tác lớn; vốn đăng ký gồm cả vốn tăng thêm của dự án cấp phép các năm trước. Bản PDF lấy từ kho lưu trữ istmat.org.',
            'rights': 'Số liệu thống kê nhà nước công bố; trích dẫn có ghi nguồn.',
            'observations': obs
        })
    return out


def quarterly_avg(col, sid, label, unit, source, method, limitation, rights, domain):
    r = rows('controls_monthly.csv')
    acc = defaultdict(list)
    for x in r:
        if x[col]:
            y, m = x['month'].split('-')
            acc[f'{y}Q{(int(m) - 1) // 3 + 1}'].append(float(x[col]))
    obs = [{'period': q, 'value': round(sum(v) / len(v), 2)} for q, v in sorted(acc.items(), key=lambda kv: qkey(kv[0])) if len(v) == 3]
    last, prev = obs[-1], next((o for o in obs if o['period'] == f'{int(obs[-1]["period"][:4]) - 1}{obs[-1]["period"][4:]}'), None)
    return {'id': sid, 'label': label, 'domain': domain, 'unit': unit, 'frequency': 'quý (bình quân 3 tháng)',
            'official': True, 'chart': 'line',
            'latest': {'period': last['period'], 'value': last['value'],
                       'yoy': None if not prev else round(100 * (last['value'] / prev['value'] - 1), 1)},
            'source': source, 'method': method, 'limitation': limitation, 'rights': rights, 'observations': obs}


def durian_series():
    r = rows('durian_facts.csv')
    return {'id': 'durian_export', 'label': 'Xuất khẩu sầu riêng của Việt Nam', 'domain': 'agri', 'unit': 'triệu USD',
            'frequency': 'năm / kỳ công bố', 'official': True, 'chart': 'facts',
            'latest': {'period': '2023', 'value': 2241.036},
            'source': 'Bộ Công Thương — báo cáo thị trường rau quả; Trung tâm XTTM Tiền Giang; CESTI tổng hợp tin agro.gov.vn',
            'method': 'Kim ngạch xuất khẩu sầu riêng tươi và đông lạnh theo kỳ công bố; thị phần và giá theo số liệu Hải quan Trung Quốc được trích lại.',
            'limitation': 'Các kỳ không đồng nhất (9 tháng, năm, 2 tháng); chưa có số cả năm 2024 trở đi trong bộ tài liệu.',
            'rights': 'Báo cáo cơ quan nhà nước; trích dẫn có ghi nguồn.',
            'observations': [{'period': x['period'], 'metric': x['metric'], 'value': float(x['value']), 'unit': x['unit'],
                              'source': x['source_name'], 'quote': x['quote']} for x in r]}


def build():
    series = fdi_series() + fdi_trade_series() + partner_series() + [
        quarterly_avg('wtv_import_volume', 'world_import_volume', 'Khối lượng nhập khẩu hàng hóa thế giới', 'chỉ số 2021 = 100',
                      'CPB Netherlands Bureau for Economic Policy Analysis — World Trade Monitor (bản tháng 7/2026, công bố 25/9/2026)',
                      'Chỉ số khối lượng nhập khẩu thế giới, đã điều chỉnh mùa vụ (chuỗi mgz_w1_qnmi_sn), bình quân quý.',
                      'Đo nhu cầu nhập khẩu toàn cầu, không riêng thị trường của Việt Nam; số tháng gần nhất sẽ được CPB điều chỉnh.',
                      'Công bố miễn phí; ghi nguồn CPB. Rà điều khoản trước khi phát hành qua API.', 'trade'),
        quarterly_avg('reer_vn', 'reer_vnd', 'Tỷ giá thực hiệu dụng của đồng Việt Nam (REER)', 'chỉ số',
                      'Bruegel — Real effective exchange rate database (Darvas, 2021), phiên bản 22/9/2026, chuỗi REER_120_VN',
                      'Tỷ giá thực hiệu dụng tính theo CPI so với rổ 120 đối tác thương mại, bình quân quý. Tăng = đồng Việt Nam lên giá thực.',
                      'Phụ thuộc số CPI công bố của các nước; BIS và IMF không tính chỉ số này cho Việt Nam nên không đối chiếu được nguồn thứ hai.',
                      'Dữ liệu tải công khai từ Bruegel; tệp không nêu giấy phép — ghi nguồn và rà điều khoản trước khi tái phân phối.', 'finance'),
        durian_series()]
    for s in series:
        assert s['source'] and s['method'] and s['limitation'] and s['rights'], s['id']
    return {'builtAt': date.today().isoformat(), 'datasetStatus': 'official-public', 'version': '1.0.0',
            'rule': 'Không có xuất xứ thì không lên bảng.',
            'excluded': 'Chuỗi Hải quan khu vực FDI 2013–2026 đã mua chưa được đưa lên vì chưa xác nhận giấy phép tái phân phối.',
            'series': series}


if __name__ == '__main__':
    data = build()
    with open(os.path.join(ROOT, 'data', 'official.json'), 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    with open(os.path.join(ROOT, 'official-data.js'), 'w', encoding='utf-8') as f:
        f.write('/* VietLens — lớp dữ liệu thật (Nấc 1). Tệp sinh tự động bởi tools/build_official.py — không sửa tay.\n'
                ' * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền. */\n')
        f.write('window.VIETLENS_OFFICIAL = Object.freeze(' + json.dumps(data, ensure_ascii=False) + ');\n')
    print(len(data['series']), 'chuỗi;', sum(len(s['observations']) for s in data['series']), 'điểm số liệu')
