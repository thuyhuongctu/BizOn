# Dựng một nhân vật từ MỘT ảnh mẫu bằng API Meshy: Image to 3D (meshy-7.1, 20.000 tam giác, màu 2K, dáng chữ A) → gắn xương 1,7 m → động tác trong thư viện → tải mesh.glb, rig.glb, walk.glb, run.glb, anim.glb. Khóa đọc từ biến môi trường MESHY_API_KEY, không ghi vào tệp. Chạy lại cùng thư mục ra thì tiếp tục việc dang dở (task.json), không tốn credit lần hai.
# Dùng: MESHY_API_KEY=… python meshy-dung-nhan-vat.py <ảnh.png> <thư mục ra> <mã động tác, cách nhau dấu phẩy>
import os, sys, json, time, base64, urllib.request, urllib.error
K = os.environ['MESHY_API_KEY']; B = 'https://api.meshy.ai/openapi/v1'
def goi(method, path, body=None):
    req = urllib.request.Request(B + path, method=method, data=json.dumps(body).encode() if body is not None else None, headers={'Authorization': 'Bearer ' + K, 'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=120) as r: return r.status, json.loads(r.read() or b'{}')
    except urllib.error.HTTPError as e: return e.code, {'error': e.read().decode()[:600]}
def cho(path, moi=10, toi_da=1500):
    t0 = time.time(); cu = None
    while True:
        st, j = goi('GET', path); s = (j.get('status'), j.get('progress'))
        if s != cu: print(f"  {int(time.time() - t0):4d}s {s[0]} {s[1]}%", flush=True); cu = s
        if j.get('status') in ('SUCCEEDED', 'FAILED', 'CANCELED') or st != 200 or time.time() - t0 > toi_da: return j
        time.sleep(moi)
def tai(url, duong):
    with urllib.request.urlopen(url, timeout=180) as r: d = r.read()
    open(duong, 'wb').write(d); print('  tải', os.path.basename(duong), len(d), 'B', flush=True)
anh, ra, ma = sys.argv[1], sys.argv[2], [int(x) for x in sys.argv[3].split(',')]; os.makedirs(ra, exist_ok=True)
tk = os.path.join(ra, 'task.json'); T = json.load(open(tk)) if os.path.exists(tk) else {}
def luu(): json.dump(T, open(tk, 'w'))
if 'i3d' not in T:
    uri = 'data:image/png;base64,' + base64.b64encode(open(anh, 'rb').read()).decode()
    st, j = goi('POST', '/image-to-3d', {'image_url': uri, 'ai_model': 'meshy-7.1', 'topology': 'triangle', 'should_remesh': True, 'target_polycount': 20000,
                                           'pose_mode': 'a-pose', 'should_texture': True, 'texture_resolution': '2k', 'texture_image_url': uri, 'enable_pbr': False})
    print('dựng 3D', st, j.get('result') or j, flush=True)
    if st not in (200, 202): sys.exit(1)
    T['i3d'] = j['result']; luu()
m = cho('/image-to-3d/' + T['i3d'])
if m.get('status') != 'SUCCEEDED': print('dựng 3D hỏng:', m.get('task_error')); sys.exit(1)
print('  credit dựng 3D:', m.get('consumed_credits')); tai(m['model_urls']['glb'], os.path.join(ra, 'mesh.glb'))
if m.get('thumbnail_url'): tai(m['thumbnail_url'], os.path.join(ra, 'thumb.png'))
if 'rig' not in T:
    st, j = goi('POST', '/rigging', {'input_task_id': T['i3d'], 'height_meters': 1.7}); print('gắn xương', st, j.get('result') or j, flush=True)
    if st not in (200, 202): sys.exit(1)
    T['rig'] = j['result']; luu()
r = cho('/rigging/' + T['rig'])
if r.get('status') != 'SUCCEEDED': print('gắn xương hỏng:', r.get('task_error')); sys.exit(1)
res = r['result']; tai(res['rigged_character_glb_url'], os.path.join(ra, 'rig.glb')); tai(res['basic_animations']['walking_glb_url'], os.path.join(ra, 'walk.glb')); tai(res['basic_animations']['running_glb_url'], os.path.join(ra, 'run.glb'))
if 'anim' not in T:
    st, j = goi('POST', '/animations', {'rig_task_id': T['rig'], 'action_ids': ma}); print('động tác', st, j.get('result') or j, flush=True)
    if st not in (200, 202): sys.exit(1)
    T['anim'] = j['result']; luu()
a = cho('/animations/' + T['anim'])
if a.get('status') != 'SUCCEEDED': print('động tác hỏng:', a.get('task_error')); sys.exit(1)
tai(a['result']['animation_glb_url'], os.path.join(ra, 'anim.glb'))
print('credit: dựng', m.get('consumed_credits'), '· xương', r.get('consumed_credits'), '· động tác', a.get('consumed_credits'), '· còn', goi('GET', '/balance')[1].get('balance'))
