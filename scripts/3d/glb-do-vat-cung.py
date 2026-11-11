# Mô hình Meshy dựng từ ảnh thường gắn luôn đạo cụ cầm tay (la bàn, túi tiền, loa…) và bảng tên vào lưới nhân vật, rồi chia trọng số
# xương của chúng cho cả bàn tay lẫn đùi, hông. Khi giơ tay, đạo cụ bị kéo dài thành vệt. Script này tìm các MẢNH RỜI nhỏ của lưới
# (không chung đỉnh với thân) và buộc cả mảnh vào đúng MỘT xương chiếm nhiều trọng số nhất của nó → đạo cụ cứng, đi theo bàn tay.
# Dùng: python glb-do-vat-cung.py vao.glb ra.glb [số đỉnh tối đa của một mảnh, mặc định 800]
import struct, json, sys
import numpy as np
SRC, OUT = sys.argv[1], sys.argv[2]; MAXV = int(sys.argv[3]) if len(sys.argv) > 3 else 800
f = bytearray(open(SRC, 'rb').read()); ln = struct.unpack('<I', f[12:16])[0]; js = json.loads(bytes(f[20:20+ln])); B0 = 20 + ln + 8
CT = {5120: 'b', 5121: 'B', 5122: 'h', 5123: 'H', 5125: 'I', 5126: 'f'}; NC = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}
def info(i):
    a = js['accessors'][i]; v = js['bufferViews'][a['bufferView']]; dt = np.dtype('<' + CT[a['componentType']]); n = NC[a['type']]
    return a, B0 + v.get('byteOffset', 0) + a.get('byteOffset', 0), dt, n, v.get('byteStride') or dt.itemsize * n
def read(i):
    a, o, dt, n, st = info(i)
    return np.stack([np.frombuffer(bytes(f[o + k * st:o + k * st + dt.itemsize * n]), dtype=dt) for k in range(a['count'])])
def write(i, arr):
    a, o, dt, n, st = info(i)
    for k in range(a['count']): f[o + k * st:o + k * st + dt.itemsize * n] = arr[k].astype(dt).tobytes()
names = [js['nodes'][i].get('name') for i in js['skins'][0]['joints']]; tong = 0
for mesh in js['meshes']:
    for p in mesh['primitives']:
        at = p['attributes']
        if 'JOINTS_0' not in at: continue
        P = read(at['POSITION']); I = read(p['indices']).reshape(-1, 3); J = read(at['JOINTS_0']); W = read(at['WEIGHTS_0'])
        wa = js['accessors'][at['WEIGHTS_0']]; mot = 1.0 if wa['componentType'] == 5126 else float(np.iinfo(W.dtype).max)
        _, inv = np.unique(np.round(P, 5), axis=0, return_inverse=True); inv = inv.ravel(); par = np.arange(inv.max() + 1)
        def find(x):
            while par[x] != x: par[x] = par[par[x]]; x = par[x]
            return x
        for a, b, c in inv[I]: ra = find(a); par[find(b)] = ra; par[find(c)] = ra
        comp = np.array([find(x) for x in range(len(par))])[inv]; ids, cnt = np.unique(comp, return_counts=True); than = ids[np.argmax(cnt)]
        for cid, k in zip(ids, cnt):
            if cid == than or k > MAXV: continue
            m = comp == cid; dom = np.bincount(J[m].ravel(), weights=W[m].ravel().astype(float), minlength=len(names)); top = int(np.argmax(dom))
            if dom[top] / dom.sum() > 0.995: continue          # đã cứng sẵn (mắt, lông mày)
            J[m] = [top, 0, 0, 0]; W[m] = [mot, 0, 0, 0]; tong += int(k)
            print(f'  mảnh {int(k)} đỉnh, hộp {P[m].min(0).round(2)}..{P[m].max(0).round(2)} → buộc vào {names[top]} (trước: {dom[top] / dom.sum():.0%})')
        write(at['JOINTS_0'], J); write(at['WEIGHTS_0'], W)
open(OUT, 'wb').write(bytes(f)); print('ok', OUT, len(f), 'B;', tong, 'đỉnh đã buộc cứng')
