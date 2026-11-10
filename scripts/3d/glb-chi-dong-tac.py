#!/usr/bin/env python3
"""Rút riêng bộ xương và các clip động tác ra khỏi một GLB (bỏ lưới, vật liệu, ảnh) để làm «kho động tác» dùng chung.

    python3 scripts/3d/glb-chi-dong-tac.py <vào.glb> <ra.glb> [Tên1,Tên2,...]

Tệp ra chỉ còn các nút (giữ tên khớp và tư thế nghỉ) và animation đã chọn; trang web nạp tệp này rồi ghép clip sang mô hình
khác có cùng tên khớp (js/ben-bizon-dang-di.js). Không cần thư viện ngoài.
"""
import json, struct, sys

def main(vao, ra, ten=None):
    b = open(vao, 'rb').read()
    assert b[:4] == b'glTF', 'không phải GLB'
    n = struct.unpack('<I', b[12:16])[0]
    js = json.loads(b[20:20 + n]); bin_ = b[20 + n + 8:]
    giu = [a for a in js.get('animations', []) if not ten or a.get('name') in ten]
    assert giu, 'không có clip nào khớp tên'
    acc_cu = sorted({s[k] for a in giu for s in a['samplers'] for k in ('input', 'output')})
    moi_acc, moi_bv, buf, anh_xa = [], [], bytearray(), {}
    cs = {5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4}; sl = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}
    for i in acc_cu:
        a = dict(js['accessors'][i]); v = js['bufferViews'][a['bufferView']]
        dau = v.get('byteOffset', 0) + a.get('byteOffset', 0); dai = a['count'] * cs[a['componentType']] * sl[a['type']]
        assert not v.get('byteStride'), 'accessor của animation không được xen kẽ'
        while len(buf) % 4: buf.append(0)
        moi_bv.append({'buffer': 0, 'byteOffset': len(buf), 'byteLength': dai}); buf += bin_[dau:dau + dai]
        a['bufferView'] = len(moi_bv) - 1; a.pop('byteOffset', None); anh_xa[i] = len(moi_acc); moi_acc.append(a)
    for a in giu:
        for s in a['samplers']: s['input'] = anh_xa[s['input']]; s['output'] = anh_xa[s['output']]
    nut = []
    for x in js['nodes']:
        x = dict(x); x.pop('mesh', None); x.pop('skin', None); nut.append(x)
    while len(buf) % 4: buf.append(0)
    out = {'asset': {'version': '2.0', 'generator': 'BizOn glb-chi-dong-tac'}, 'scene': js.get('scene', 0), 'scenes': js['scenes'], 'nodes': nut,
           'animations': giu, 'accessors': moi_acc, 'bufferViews': moi_bv, 'buffers': [{'byteLength': len(buf)}]}
    j = json.dumps(out, separators=(',', ':')).encode()
    while len(j) % 4: j += b' '
    with open(ra, 'wb') as f:
        f.write(b'glTF' + struct.pack('<II', 2, 12 + 8 + len(j) + 8 + len(buf)) + struct.pack('<I', len(j)) + b'JSON' + j + struct.pack('<I', len(buf)) + b'BIN\x00' + bytes(buf))
    print('ok', ra, 12 + 8 + len(j) + 8 + len(buf), 'B;', [a['name'] for a in giu])

if __name__ == '__main__':
    if len(sys.argv) < 3: sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2], set(sys.argv[3].split(',')) if len(sys.argv) > 3 else None)
