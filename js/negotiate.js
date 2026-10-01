/* BizOn – "Phòng đàm phán" dùng chung cho cả 3 game: một màn hội thoại 2
 * chiều (bạn ↔ đối tác) tuỳ chọn, không chặn luồng chơi chính và không ảnh
 * hưởng doanh thu/điểm số – thuần luyện tập đàm phán + phản tư. Người chơi
 * trả lời bằng cách gõ chữ HOẶC bấm micro tự ghi âm giọng nói (chỉ để nghe
 * lại trong phiên hiện tại, không chuyển thành chữ, không gửi đi đâu); đối
 * tác trả lời bằng lời thoại đã viết sẵn theo kịch bản của từng game. Sau
 * vài lượt, người chơi bấm "Chốt thỏa thuận" để tự điền tay một phiếu các
 * yếu tố đã thống nhất (giá, số lượng, thời hạn...) – lưu lại cục bộ
 * (localStorage) để xem lại/tải về, không đồng bộ lên server.
 *
 * API: window.Negotiate.open(config)
 * config = {
 *   id (khoá lưu localStorage riêng cho game/kịch bản này),
 *   title, subtitle, scenario (đoạn mô tả bối cảnh),
 *   partner: {name, icon, accent},
 *   openingLines: [chuỗi] – đối tác chọn ngẫu nhiên 1 câu mở đầu,
 *   replyLines: [chuỗi] – đối tác lần lượt nói sau mỗi lượt của bạn (hết thì lặp dòng cuối),
 *   fields: [{id,label,placeholder}] – các ô phiếu "Chốt thỏa thuận",
 *   exitLabel,
 * }
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. */
(function () {
  var isEN = function () { try { return (localStorage.getItem('bizon-lang') || 'vi') === 'en'; } catch (e) { return false; } };
  function T(vi, en) { return isEN() ? en : vi; }
  var $ = function (id) { return document.getElementById(id); };

  var CSS = `
#negot{position:fixed;inset:0;z-index:92;background:rgba(2,25,28,.78);display:flex;align-items:center;justify-content:center;padding:14px}
#negot .card{background:#fff;border-radius:28px;box-shadow:0 20px 50px rgba(0,60,80,.3);width:100%;max-width:540px;max-height:92vh;display:flex;flex-direction:column;overflow:hidden;font-family:inherit;color:#033337}
#negot .hd{display:flex;align-items:center;gap:10px;padding:16px 18px;border-bottom:2px solid #eef4f8}
#negot .hd .ic{width:44px;height:44px;border-radius:50%;background:#f4faff;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0}
#negot .hd h3{margin:0;font-size:16px;font-weight:900;color:#006687}
#negot .hd p{margin:1px 0 0;font-size:11px;opacity:.6}
#negot .hd .x{margin-left:auto;width:32px;height:32px;border-radius:50%;border:0;background:#f4faff;font-size:16px;font-weight:900;cursor:pointer;flex-shrink:0}
#negot .scn{padding:10px 18px;font-size:12px;opacity:.75;background:#fff8ec;border-bottom:1px solid #f0e5cf}
#negot .tr{flex:1;overflow:auto;padding:14px 18px;display:flex;flex-direction:column;gap:10px}
#negot .msg{max-width:84%;padding:9px 13px;border-radius:16px;font-size:13.5px;line-height:1.45}
#negot .msg.them{align-self:flex-start;background:#f4faff;border-bottom-left-radius:4px}
#negot .msg.me{align-self:flex-end;background:#006687;color:#fff;border-bottom-right-radius:4px}
#negot .msg audio{height:32px;max-width:100%}
#negot .ft{padding:12px 16px;border-top:2px solid #eef4f8;display:flex;gap:8px;align-items:center}
#negot .ft input[type=text]{flex:1;border:2px solid #dbe9f0;border-radius:999px;padding:9px 14px;font:inherit;font-size:13.5px;min-width:0}
#negot .ft button{border:0;border-radius:999px;font:inherit;font-weight:800;cursor:pointer;flex-shrink:0}
#negot .ft .mic{width:40px;height:40px;background:#f4faff;color:#006687;font-size:17px}
#negot .ft .mic.rec{background:#c0392b;color:#fff;animation:negot-pulse 1s infinite}
#negot .ft .send{padding:9px 16px;background:#006687;color:#fff;font-size:13px}
#negot .bar{padding:10px 16px;border-top:1px solid #eef4f8;display:flex;gap:8px}
#negot .bar button{flex:1;border:0;border-radius:14px;padding:10px;font:inherit;font-weight:800;font-size:13px;cursor:pointer}
#negot .bar .fin{background:#fda127;color:#033337}
#negot .bar .hist{background:#f4faff;color:#006687}
#negot .form{padding:16px 18px;overflow:auto}
#negot .form .fld{margin-bottom:10px}
#negot .form .fld label{display:block;font-size:11px;font-weight:800;opacity:.6;margin-bottom:3px}
#negot .form .fld input{width:100%;border:2px solid #dbe9f0;border-radius:12px;padding:8px 11px;font:inherit;font-size:13.5px;box-sizing:border-box}
#negot .form .save{width:100%;border:0;border-radius:14px;padding:11px;background:#1f9a63;color:#fff;font-weight:900;font-size:14px;cursor:pointer;margin-top:6px}
#negot .form .back{width:100%;border:0;border-radius:14px;padding:9px;background:#f4faff;color:#006687;font-weight:800;font-size:12.5px;cursor:pointer;margin-top:8px}
#negot .hint{font-size:10.5px;opacity:.45;padding:0 18px 10px}
@keyframes negot-pulse{0%,100%{opacity:1}50%{opacity:.55}}`;

  function histKey(id) { return 'bizon-negot-' + id; }
  function loadHist(id) { try { return JSON.parse(localStorage.getItem(histKey(id)) || '[]'); } catch (e) { return []; } }
  function saveHist(id, list) { try { localStorage.setItem(histKey(id), JSON.stringify(list.slice(-10))); } catch (e) {} }

  function open(cfg) {
    if ($('negot')) return;
    if (!$('negot-css')) { var st = document.createElement('style'); st.id = 'negot-css'; st.textContent = CSS; document.head.appendChild(st); }
    var root = document.createElement('div'); root.id = 'negot';
    root.innerHTML =
      '<div class="card">' +
      '<div class="hd"><span class="ic">' + (cfg.partner.icon || '🤝') + '</span>' +
      '<div><h3>' + cfg.partner.name + '</h3><p>' + (cfg.subtitle || '') + '</p></div>' +
      '<button type="button" class="x">✕</button></div>' +
      '<div class="scn">' + cfg.scenario + '</div>' +
      '<div class="tr"></div>' +
      '<div class="ft"><button type="button" class="mic">🎙️</button><input type="text" placeholder="' + T('Gõ phản hồi của bạn…', 'Type your response…') + '"><button type="button" class="send">' + T('Gửi', 'Send') + '</button></div>' +
      '<div class="bar"><button type="button" class="hist">' + T('📜 Lịch sử', '📜 History') + '</button><button type="button" class="fin">📝 ' + T('Chốt thỏa thuận', 'Finalize deal') + '</button></div>' +
      '<p class="hint">' + T('Ghi âm chỉ để bạn tự nghe lại trong phiên này, không lưu lại, không gửi đi đâu.', 'Recordings are just for you to replay this session – not saved or sent anywhere.') + '</p>' +
      '</div>';
    document.body.appendChild(root);
    // Dùng chung cờ với js/clay-hub.js để tạm dừng vòng vẽ three.js chính
    // (nếu có) trong lúc modal này mở toàn màn hình, tránh tranh CPU/GPU.
    // Nhớ lại giá trị trước đó phòng khi modal này được mở từ trong hub.
    var hadHubOpen = window.__clayHubOpen;
    window.__clayHubOpen = true;
    var tr = root.querySelector('.tr'), input = root.querySelector('.ft input'), micBtn = root.querySelector('.mic');
    var replyI = 0;

    function addMsg(who, html, isAudio) {
      var m = document.createElement('div'); m.className = 'msg ' + who;
      if (isAudio) m.innerHTML = html; else m.textContent = html;
      tr.appendChild(m); tr.scrollTop = tr.scrollHeight;
    }
    function partnerReply() {
      var line = cfg.replyLines[Math.min(replyI, cfg.replyLines.length - 1)]; replyI++;
      setTimeout(function () { addMsg('them', line); }, 450);
    }
    function sendText() {
      var v = input.value.trim(); if (!v) return;
      addMsg('me', v); input.value = ''; partnerReply();
    }
    root.querySelector('.send').onclick = sendText;
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') sendText(); });

    var mediaRecorder = null, chunks = [], recording = false;
    micBtn.onclick = function () {
      if (recording) { mediaRecorder && mediaRecorder.stop(); return; }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return addMsg('them', T('(Trình duyệt này không hỗ trợ ghi âm – hãy gõ chữ thay thế.)', '(This browser can\'t record audio – please type instead.)'));
      }
      navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
        chunks = []; mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = function (e) { if (e.data.size > 0) chunks.push(e.data); };
        mediaRecorder.onstop = function () {
          stream.getTracks().forEach(function (t) { t.stop(); });
          recording = false; micBtn.classList.remove('rec');
          var blob = new Blob(chunks, { type: 'audio/webm' });
          var url = URL.createObjectURL(blob);
          addMsg('me', '<audio controls src="' + url + '"></audio>', true);
          partnerReply();
        };
        mediaRecorder.start(); recording = true; micBtn.classList.add('rec');
      }).catch(function () {
        addMsg('them', T('(Không mở được micro – hãy kiểm tra quyền truy cập hoặc gõ chữ thay thế.)', '(Could not access the microphone – check permissions or type instead.)'));
      });
    };

    function closeAll() { root.remove(); window.__clayHubOpen = hadHubOpen; }
    root.querySelector('.x').onclick = closeAll;
    root.addEventListener('click', function (e) { if (e.target === root) closeAll(); });

    function showForm() {
      var card = root.querySelector('.card');
      var old = card.innerHTML;
      var fieldsHtml = cfg.fields.map(function (f) {
        return '<div class="fld"><label>' + f.label + '</label><input type="text" data-id="' + f.id + '" placeholder="' + (f.placeholder || '') + '"></div>';
      }).join('');
      card.innerHTML = '<div class="hd"><span class="ic">📝</span><div><h3>' + T('Chốt thỏa thuận', 'Finalize the deal') + '</h3><p>' + T('Tự điền các yếu tố đã thống nhất', 'Fill in the terms you agreed on') + '</p></div><button type="button" class="x">✕</button></div>' +
        '<div class="form">' + fieldsHtml +
        '<button type="button" class="save">' + T('💾 Lưu lại', '💾 Save') + '</button>' +
        '<button type="button" class="back">' + T('‹ Quay lại hội thoại', '‹ Back to the conversation') + '</button></div>';
      card.querySelector('.x').onclick = closeAll;
      card.querySelector('.back').onclick = function () { card.innerHTML = old; wireAfterRestore(); };
      card.querySelector('.save').onclick = function () {
        var values = {}; card.querySelectorAll('.form input').forEach(function (inp) { values[inp.dataset.id] = inp.value.trim(); });
        var record = { at: new Date().toISOString(), scenario: cfg.scenario, values: values,
          transcript: Array.prototype.map.call(tr.querySelectorAll('.msg'), function (m) { return (m.classList.contains('me') ? T('Bạn: ', 'You: ') : cfg.partner.name + ': ') + (m.querySelector('audio') ? T('(đoạn ghi âm)', '(voice note)') : m.textContent); }) };
        var hist = loadHist(cfg.id); hist.push(record); saveHist(cfg.id, hist);
        card.querySelector('.form').innerHTML = '<p style="text-align:center;font-weight:800;color:#1f9a63;padding:20px 0">✅ ' + T('Đã lưu! Xem lại trong mục "📜 Lịch sử".', 'Saved! Review it under "📜 History".') + '</p>' +
          '<button type="button" class="back" style="width:100%;border:0;border-radius:14px;padding:11px;background:#006687;color:#fff;font-weight:800;cursor:pointer">' + T('Đóng', 'Close') + '</button>';
        card.querySelector('.back').onclick = closeAll;
      };
    }
    function wireAfterRestore() {
      root.querySelector('.x').onclick = closeAll;
      root.querySelector('.send').onclick = sendText;
      root.querySelector('.ft input').addEventListener('keydown', function (e) { if (e.key === 'Enter') sendText(); });
      root.querySelector('.fin').onclick = showForm;
      root.querySelector('.hist').onclick = showHist;
    }
    function showHist() {
      var card = root.querySelector('.card');
      var old = card.innerHTML;
      var hist = loadHist(cfg.id);
      var body = hist.length ? hist.slice().reverse().map(function (r) {
        var vals = Object.keys(r.values || {}).map(function (k) { return '<li><b>' + k + ':</b> ' + (r.values[k] || '–') + '</li>'; }).join('');
        return '<div style="border:2px solid #eef4f8;border-radius:16px;padding:12px;margin-bottom:10px"><p style="font-size:11px;opacity:.5;margin:0 0 6px">' + new Date(r.at).toLocaleString(isEN() ? 'en-US' : 'vi-VN') + '</p><ul style="margin:0;padding-left:18px;font-size:13px">' + vals + '</ul></div>';
      }).join('') : '<p style="opacity:.5;text-align:center;padding:20px 0">' + T('Chưa có thỏa thuận nào được lưu.', 'No saved deals yet.') + '</p>';
      card.innerHTML = '<div class="hd"><span class="ic">📜</span><div><h3>' + T('Lịch sử đàm phán', 'Negotiation history') + '</h3></div><button type="button" class="x">✕</button></div>' +
        '<div class="form">' + body + '<button type="button" class="back">' + T('‹ Quay lại hội thoại', '‹ Back to the conversation') + '</button></div>';
      card.querySelector('.x').onclick = closeAll;
      card.querySelector('.back').onclick = function () { card.innerHTML = old; wireAfterRestore(); };
    }
    root.querySelector('.fin').onclick = showForm;
    root.querySelector('.hist').onclick = showHist;

    addMsg('them', cfg.openingLines[Math.floor(Math.random() * cfg.openingLines.length)]);
  }

  window.Negotiate = { open: open };
})();
