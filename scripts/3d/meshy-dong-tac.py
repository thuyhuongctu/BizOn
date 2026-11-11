# Thêm động tác cho một nhân vật đã có trong kho bằng API của Meshy (tài khoản của tác giả), không cần thao tác tay trên web.
# Khóa API đọc từ biến môi trường MESHY_API_KEY: KHÔNG ghi khóa vào tệp, commit hay PR.
# Bước: (1) gắn xương lại mô hình GLB công khai (5 credit, kèm sẵn clip đi và chạy) → (2) gắn các động tác trong thư viện theo mã số
# (3 credit mỗi động tác) → (3) tải rig.glb, walk.glb, run.glb, anim.glb về thư mục ra. Sau đó gộp bằng glb-gop-clip.py và buộc cứng
# đạo cụ bằng glb-do-vat-cung.py (xem assets/models/SOURCES.md).
# Dùng:  MESHY_API_KEY=… python meshy-dong-tac.py <URL mô hình .glb> <chiều cao m> <mã động tác, cách nhau dấu phẩy> <thư mục ra>
#        MESHY_API_KEY=… python meshy-dong-tac.py thu-vien <tệp.json>      (tải danh sách động tác, miễn phí)
#        MESHY_API_KEY=… python meshy-dong-tac.py so-du                    (xem số credit còn lại, miễn phí)
import os, sys, json, time, urllib.request, urllib.error
K = os.environ['MESHY_API_KEY']; B = 'https://api.meshy.ai/openapi/v1'
def goi(method, path, body=None):
    req = urllib.request.Request(B + path, method=method, data=json.dumps(body).encode() if body is not None else None,
                                 headers={'Authorization': 'Bearer ' + K, 'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=60) as r: return r.status, json.loads(r.read() or b'{}')
    except urllib.error.HTTPError as e: return e.code, {'error': e.read().decode()[:600]}
def cho(path, moi=8, toi_da=900):
    t0 = time.time()
    while True:
        st, j = goi('GET', path); s = j.get('status'); print(f"  {int(time.time() - t0):4d}s {s} {j.get('progress')}%", flush=True)
        if s in ('SUCCEEDED', 'FAILED', 'CANCELED') or st != 200 or time.time() - t0 > toi_da: return j
        time.sleep(moi)
def tai(url, duong):
    with urllib.request.urlopen(url, timeout=120) as r: d = r.read()
    open(duong, 'wb').write(d); print('  tải', os.path.basename(duong), len(d), 'B', flush=True)
if sys.argv[1] == 'so-du': print(goi('GET', '/balance')[1]); sys.exit()
if sys.argv[1] == 'thu-vien':
    j = goi('GET', '/animations/library')[1]; json.dump(j, open(sys.argv[2], 'w'), ensure_ascii=False); print(len(j), 'động tác →', sys.argv[2]); sys.exit()
url, cao, ma, ra = sys.argv[1], float(sys.argv[2]), [int(x) for x in sys.argv[3].split(',')], sys.argv[4]; os.makedirs(ra, exist_ok=True)
st, j = goi('POST', '/rigging', {'model_url': url, 'height_meters': cao}); print('gắn xương', st, j.get('result') or j)
if st not in (200, 202): sys.exit(1)
rig = cho('/rigging/' + j['result'])
if rig.get('status') != 'SUCCEEDED': print('gắn xương hỏng:', rig.get('task_error')); sys.exit(1)
res = rig['result']; tai(res['rigged_character_glb_url'], os.path.join(ra, 'rig.glb'))
tai(res['basic_animations']['walking_glb_url'], os.path.join(ra, 'walk.glb')); tai(res['basic_animations']['running_glb_url'], os.path.join(ra, 'run.glb'))
st, j = goi('POST', '/animations', {'rig_task_id': rig['id'], 'action_ids': ma}); print('động tác', st, j.get('result') or j)
if st not in (200, 202): sys.exit(1)
a = cho('/animations/' + j['result'])
if a.get('status') != 'SUCCEEDED': print('động tác hỏng:', a.get('task_error')); sys.exit(1)
tai(a['result']['animation_glb_url'], os.path.join(ra, 'anim.glb'))
print('credit đã dùng:', (rig.get('consumed_credits') or 0) + (a.get('consumed_credits') or 0), '· còn', goi('GET', '/balance')[1].get('balance'))
