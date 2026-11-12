/* Bộ dựng video dọc 3D (đặc tả specs/004-video-ngan-3d, câu chuyện 1, 12/11/2026).
 * scripts/video/3d/dung-video-3d.mjs đọc một kế hoạch cảnh quay, dựng cảnh three.js với nhân vật đất sét GLB có sẵn trong
 * Chromium, vẽ đúng từng khung theo thời gian n/30 giây (tất định, không theo đồng hồ máy), chụp và ghép mp4 bằng ffmpeg.
 * Kiểm (khổ nhỏ 270 × 480 cho nhanh): đúng khổ, đúng số khung; dựng hai lần ra cùng khung; không cảnh nào đứng hình;
 * GLB không có thì dừng với thông báo tiếng Việt; không dùng bizon-characters.js (hồ sơ quyền tác giả) hay tệp của kho tham khảo. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), os = require('node:os'), crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const goc = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(goc, f), 'utf8');
const BO = path.join(goc, 'scripts/video/3d');

// ---- Kiểm tĩnh
const tep = ['dung-video-3d.mjs', 'canh-3d.html', 'canh-3d.js', 'dao-cu.js', 'ke-hoach-thu.mjs'];
for (const t of tep) check(fs.existsSync(path.join(BO, t)), 'có scripts/video/3d/' + t);
if (tep.some(t => !fs.existsSync(path.join(BO, t)))) { console.log('\n' + fails + ' kiểm tra hỏng'); process.exit(1); }
const ma = tep.map(t => read('scripts/video/3d/' + t)).join('\n');
check(!/bizon-characters/.test(ma.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')), 'không import bizon-characters.js (tệp thuộc hồ sơ quyền tác giả)');
check(!/stickrig|kaykit|kenney|xbot/i.test(ma.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')), 'không dùng mã, mô hình hay đồ nội thất của kho tham khảo');
check(/claude-3d-animated-shorts/.test(read('THIRD-PARTY-NOTICES.md')), 'THIRD-PARTY-NOTICES.md ghi nguồn kỹ thuật học từ kho tham khảo (MIT)');
check(+(/CACHE = 'bizon-v(\d+)'/.exec(read('sw.js')) || [])[1] >= 838, 'sw.js ≥ bizon-v838');

const NODE_ENV = Object.assign({}, process.env);
const chay = (args) => spawnSync(process.execPath, [path.join(BO, 'dung-video-3d.mjs'), ...args], { cwd: goc, encoding: 'utf8', env: NODE_ENV, timeout: 600000 });
const tam = fs.mkdtempSync(path.join(os.tmpdir(), 'video3d-'));
const md5 = f => crypto.createHash('md5').update(fs.readFileSync(f)).digest('hex');
const probe = f => JSON.parse(spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v', '-count_frames', '-show_entries', 'stream=width,height,r_frame_rate,nb_read_frames', '-of', 'json', f], { encoding: 'utf8' }).stdout).streams[0];

// ---- 1. Dựng 2 giây đầu của cảnh thử, hai lần
const A = path.join(tam, 'a'), B = path.join(tam, 'b');
const ra = chay(['scripts/video/3d/ke-hoach-thu.mjs', '--out', A, '--rong', '270', '--cao', '480', '--tu', '0', '--den', '60', '--giu-khung']);
check(ra.status === 0, 'dựng lần 1 xong (mã thoát ' + ra.status + ')' + (ra.status ? ': ' + (ra.stderr || '').slice(-300) : ''));
const rb = chay(['scripts/video/3d/ke-hoach-thu.mjs', '--out', B, '--rong', '270', '--cao', '480', '--tu', '0', '--den', '60', '--giu-khung']);
check(rb.status === 0, 'dựng lần 2 xong');
const mpA = path.join(A, 'ke-hoach-thu.mp4');
if (fs.existsSync(mpA)) {
  const s = probe(mpA);
  check(s.width === 270 && s.height === 480, 'mp4 đúng khổ dọc 270 × 480 (' + s.width + ' × ' + s.height + ')');
  check(s.r_frame_rate === '30/1', '30 khung/giây (' + s.r_frame_rate + ')');
  check(Math.abs(+s.nb_read_frames - 60) <= 1, 'đúng 60 khung (' + s.nb_read_frames + ')');
} else check(false, 'có tệp ke-hoach-thu.mp4');
const kA = n => path.join(A, 'khung', String(n).padStart(6, '0') + '.png'), kB = n => path.join(B, 'khung', String(n).padStart(6, '0') + '.png');
const cung = [0, 29, 59].filter(n => fs.existsSync(kA(n)) && fs.existsSync(kB(n)));
check(cung.length === 3 && cung.every(n => md5(kA(n)) === md5(kB(n))), 'dựng hai lần: khung 0, 29, 59 giống hệt từng điểm ảnh (tất định)');
check(fs.existsSync(kA(0)) && fs.existsSync(kA(15)) && md5(kA(0)) !== md5(kA(15)) && md5(kA(30)) !== md5(kA(45)), 'không đứng hình: khung cách nhau 15 khung đều khác nhau');

// ---- 2. Kế hoạch đủ dài, mỗi cảnh có máy quay chuyển động
const kh = read('scripts/video/3d/ke-hoach-thu.mjs');
check(/ceo-v3\.glb/.test(kh) && /lumina\.glb/.test(kh) && !/cfo\.glb/.test(kh.replace(/\/\*[\s\S]*?\*\//g, '')), 'cảnh thử dùng CEO bản v3 và Lumina (không cầm đồ vật bị méo)');

// ---- 3. Kế hoạch gọi GLB không có: dừng, báo tiếng Việt
const sai = path.join(tam, 'ke-hoach-sai.mjs');
fs.writeFileSync(sai, kh.replace(/assets\/models\/nhan-vat\/lumina\.glb/, 'assets/models/nhan-vat/khong-co.glb'));
const rs = chay([sai, '--out', path.join(tam, 's'), '--rong', '270', '--cao', '480', '--tu', '0', '--den', '2']);
check(rs.status !== 0 && /không thấy/i.test(rs.stderr + rs.stdout) && /khong-co\.glb/.test(rs.stderr + rs.stdout), 'GLB không có: dừng, thông báo tiếng Việt nêu tên tệp');
check(!fs.existsSync(path.join(tam, 's', 'ke-hoach-sai.mp4')), 'GLB không có: không ra video hỏng');

// ---- 4. Nhân vật cầm đồ vật với động tác làm méo đồ vật: dừng, báo tiếng Việt (lỗi chị thấy trong video thử 12/11/2026)
const meo = path.join(tam, 'ke-hoach-meo.mjs');
fs.writeFileSync(meo, kh.replace(/assets\/models\/nhan-vat\/lumina\.glb/, 'assets/models/nhan-vat/cfo.glb'));
const rm = chay([meo, '--out', path.join(tam, 'm'), '--thu']);
check(rm.status !== 0 && /túi tiền/.test(rm.stderr + rm.stdout) && !fs.existsSync(path.join(tam, 'm')), 'nhân vật cfo.glb (túi tiền bị kéo méo): dừng trước khi dựng, báo rõ');
const sec = path.join(tam, 'ke-hoach-sec.mjs');
fs.writeFileSync(sec, kh.replace(/assets\/models\/nhan-vat\/lumina\.glb/, 'assets/models/nhan-vat/sec.glb'));
const rsec = chay([sec, '--out', path.join(tam, 'x'), '--thu']);
check(rsec.status !== 0 && /bìa kẹp/.test(rsec.stderr + rsec.stdout) && /Wave/.test(rsec.stderr + rsec.stdout), 'Thư ký vẫy tay (bìa kẹp bị méo): dừng, báo động tác nào không dùng được');

fs.rmSync(tam, { recursive: true, force: true });
console.log(fails ? '\n' + fails + ' kiểm tra hỏng' : '\nvideo-3d-bo-dung: ok');
process.exit(fails ? 1 : 0);
