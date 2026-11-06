# Gộp các clip chuyển động của Meshy vào một GLB cho web: lấy mesh + xương + clip của tệp A (animate: idle, talk),
# thêm clip của tệp B (rig: walking) theo tên nút xương; giữ base color thu về SIZE px JPEG, bỏ lớp khác.
# Dùng: python glbmerge.py A.glb B.glb out.glb SIZE "Idle,Talk" "Walk"
import struct, json, sys, io
from PIL import Image
A, B, OUT, SIZE = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4])
NAMES_A, NAMES_B = sys.argv[5].split(','), sys.argv[6].split(',')

def load(p):
    f = open(p, 'rb').read(); ln = struct.unpack('<I', f[12:16])[0]; js = json.loads(f[20:20+ln])
    off = 20 + ln; bl = struct.unpack('<I', f[off:off+4])[0]; return js, f[off+8:off+8+bl]
def view(js, b, i): v = js['bufferViews'][i]; o = v.get('byteOffset', 0); return b[o:o+v['byteLength']], v
ja, ba = load(A); jb, bb = load(B)
newbin = bytearray(); newbv = []
def add(data, extra):
    while len(newbin) % 4: newbin.append(0)
    bv = {'buffer': 0, 'byteOffset': len(newbin), 'byteLength': len(data)}; bv.update(extra); newbin.extend(data); newbv.append(bv); return len(newbv) - 1
# accessors của A (mesh, skin, clip A)
remap = {}
def copy_bv(js, b, i, key):
    if (key, i) not in remap:
        data, v = view(js, b, i); remap[(key, i)] = add(data, {k: v[k] for k in ('byteStride', 'target') if k in v})
    return remap[(key, i)]
for a in ja['accessors']: a['bufferView'] = copy_bv(ja, ba, a['bufferView'], 'a')
# ảnh: chỉ base color
mat = ja['materials'][0]; tex_i = mat['pbrMetallicRoughness']['baseColorTexture']['index']; img_i = ja['textures'][tex_i]['source']
data, _ = view(ja, ba, ja['images'][img_i]['bufferView'])
im = Image.open(io.BytesIO(data)).convert('RGB'); print('base color', im.size); im.thumbnail((SIZE, SIZE), Image.LANCZOS)
bio = io.BytesIO(); im.save(bio, 'JPEG', quality=88, optimize=True)
ja['images'] = [{'mimeType': 'image/jpeg', 'bufferView': add(bio.getvalue(), {})}]
samp = ja['textures'][tex_i].get('sampler')
ja['textures'] = [{'source': 0, **({'sampler': samp} if samp is not None else {})}]
ja['materials'] = [{'name': mat.get('name', 'm'), 'doubleSided': mat.get('doubleSided', False), 'pbrMetallicRoughness': {'baseColorTexture': {'index': 0}, 'metallicFactor': 0, 'roughnessFactor': 0.85}}]
for i, a in enumerate(ja['animations']): a['name'] = NAMES_A[i] if i < len(NAMES_A) else a.get('name')
# clip của B: chép accessor của sampler, ánh xạ nút theo tên
name2node = {n.get('name'): i for i, n in enumerate(ja['nodes'])}
for k, anim in enumerate(jb['animations']):
    acc_map = {}
    def acc(i):
        if i not in acc_map:
            src = dict(jb['accessors'][i]); src['bufferView'] = copy_bv(jb, bb, src['bufferView'], 'b'); ja['accessors'].append(src); acc_map[i] = len(ja['accessors']) - 1
        return acc_map[i]
    samplers = [{'input': acc(s['input']), 'output': acc(s['output']), 'interpolation': s.get('interpolation', 'LINEAR')} for s in anim['samplers']]
    channels = []
    for c in anim['channels']:
        nm = jb['nodes'][c['target']['node']].get('name')
        if nm not in name2node: print('bỏ kênh không có nút', nm); continue
        channels.append({'sampler': c['sampler'], 'target': {'node': name2node[nm], 'path': c['target']['path']}})
    ja['animations'].append({'name': NAMES_B[k] if k < len(NAMES_B) else anim.get('name'), 'samplers': samplers, 'channels': channels})
ja['bufferViews'] = newbv; ja['buffers'] = [{'byteLength': len(newbin)}]
jbytes = json.dumps(ja, separators=(',', ':')).encode()
while len(jbytes) % 4: jbytes += b' '
while len(newbin) % 4: newbin.append(0)
out = b'glTF' + struct.pack('<II', 2, 12 + 8 + len(jbytes) + 8 + len(newbin)) + struct.pack('<I', len(jbytes)) + b'JSON' + jbytes + struct.pack('<I', len(newbin)) + b'BIN\x00' + bytes(newbin)
open(OUT, 'wb').write(out); print('ok', len(out), [a['name'] for a in ja['animations']])
