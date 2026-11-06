# Thu gọn GLB của Meshy cho web: giữ base color (thu về 2048, JPEG), bỏ normal và metallicRoughness, dựng lại BIN chỉ với bufferView còn dùng.
import struct, json, sys, io
from PIL import Image
src, dst, size = sys.argv[1], sys.argv[2], int(sys.argv[3])
f = open(src, 'rb').read()
ln = struct.unpack('<I', f[12:16])[0]; js = json.loads(f[20:20+ln])
off = 20 + ln; bl = struct.unpack('<I', f[off:off+4])[0]; bin0 = f[off+8:off+8+bl]
def view(i): v = js['bufferViews'][i]; o = v.get('byteOffset', 0); return bin0[o:o+v['byteLength']]
mat = js['materials'][0]; keep_tex = mat['pbrMetallicRoughness']['baseColorTexture']['index']
img_i = js['textures'][keep_tex]['source']
im = Image.open(io.BytesIO(view(js['images'][img_i]['bufferView']))).convert('RGB')
print('base color', im.size)
im.thumbnail((size, size), Image.LANCZOS); b = io.BytesIO(); im.save(b, 'JPEG', quality=88, optimize=True); jpg = b.getvalue()
# BIN mới: bufferView của accessor, rồi ảnh
newbv = []; newbin = bytearray(); remap = {}
def add(data, extra):
    while len(newbin) % 4: newbin.append(0)
    bv = {'buffer': 0, 'byteOffset': len(newbin), 'byteLength': len(data)}; bv.update(extra); newbin.extend(data); newbv.append(bv); return len(newbv) - 1
for a in js['accessors']:
    bvi = a['bufferView']
    if bvi not in remap:
        v = js['bufferViews'][bvi]; extra = {k: v[k] for k in ('byteStride', 'target') if k in v}
        remap[bvi] = add(view(bvi), extra)
    a['bufferView'] = remap[bvi]
img_bv = add(jpg, {})
js['bufferViews'] = newbv
js['images'] = [{'mimeType': 'image/jpeg', 'bufferView': img_bv}]
js['textures'] = [{'source': 0, **({'sampler': js['textures'][keep_tex]['sampler']} if 'sampler' in js['textures'][keep_tex] else {})}]
js['materials'] = [{'name': 'BakedMaterial', 'doubleSided': False, 'pbrMetallicRoughness': {'baseColorTexture': {'index': 0}, 'metallicFactor': 0, 'roughnessFactor': 0.85}}]
js['buffers'] = [{'byteLength': len(newbin)}]
jb = json.dumps(js, separators=(',', ':')).encode()
while len(jb) % 4: jb += b' '
while len(newbin) % 4: newbin.append(0)
out = b'glTF' + struct.pack('<II', 2, 12 + 8 + len(jb) + 8 + len(newbin)) + struct.pack('<I', len(jb)) + b'JSON' + jb + struct.pack('<I', len(newbin)) + b'BIN\x00' + bytes(newbin)
open(dst, 'wb').write(out); print('ok', len(out))
