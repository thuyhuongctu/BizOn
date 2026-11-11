# Vẽ lại ảnh nhân vật từ tranh gốc bằng Meshy Image to Image (để làm ảnh mẫu dựng 3D). Khóa đọc từ biến môi trường MESHY_API_KEY.
# Dùng: MESHY_API_KEY=… python meshy-anh.py <tranh gốc.png> <thư mục ra> <mô hình, vd nano-banana-pro> <tệp.json gồm [{ten, prompt, anh hoặc anhs (tối đa 5 ảnh mẫu)}]>
import os, sys, json, time, base64, urllib.request, urllib.error, concurrent.futures as cf
K = os.environ['MESHY_API_KEY']; B = 'https://api.meshy.ai/openapi/v1'
def goi(method, path, body=None):
    req = urllib.request.Request(B + path, method=method, data=json.dumps(body).encode() if body is not None else None, headers={'Authorization': 'Bearer ' + K, 'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=90) as r: return r.status, json.loads(r.read() or b'{}')
    except urllib.error.HTTPError as e: return e.code, {'error': e.read().decode()[:500]}
ref, out, model, jobs = sys.argv[1], sys.argv[2], sys.argv[3], json.load(open(sys.argv[4]))
def uri_cua(f): return 'data:image/png;base64,' + base64.b64encode(open(f, 'rb').read()).decode()
def lam(job):
    ten, prompt = job['ten'], job['prompt']; uris = [uri_cua(f) for f in (job.get('anhs') or [job.get('anh') or ref])]
    st, j = goi('POST', '/image-to-image', {'ai_model': model, 'prompt': prompt, 'reference_image_urls': uris, 'aspect_ratio': '3:4'})
    if st not in (200, 202): return ten, 'lỗi tạo ' + str(st) + ' ' + json.dumps(j)[:300]
    tid = j['result']; t0 = time.time()
    while time.time() - t0 < 420:
        st, t = goi('GET', '/image-to-image/' + tid); s = t.get('status')
        if s in ('SUCCEEDED', 'FAILED', 'CANCELED'): break
        time.sleep(6)
    if t.get('status') != 'SUCCEEDED': return ten, 'hỏng: ' + json.dumps(t.get('task_error') or t)[:300]
    urls = t.get('image_urls') or (t.get('result') or {}).get('image_urls') or []
    for i, u in enumerate(urls):
        with urllib.request.urlopen(u, timeout=120) as r: d = r.read()
        open(os.path.join(out, f'{ten}{"" if i == 0 else "-" + str(i)}.png'), 'wb').write(d)
    return ten, f'xong {len(urls)} ảnh, {t.get("consumed_credits")} credit, {int(time.time() - t0)} s'
with cf.ThreadPoolExecutor(4) as ex:
    for ten, kq in ex.map(lam, jobs): print(ten, '→', kq, flush=True)
print('số dư', goi('GET', '/balance')[1].get('balance'))
