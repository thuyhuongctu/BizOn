/* BizOn Hộ Chiếu Sầu Riêng – lồng tiếng cố vấn qua Web Speech API (speechSynthesis), không cần file mp3.
 * Trình duyệt không hỗ trợ thì nút tự câm lặng, không lỗi. Gọi window.DurianVoice.say(text, speakerCode, lang).
 * speakerCode: 'NAR' (người dẫn/SEC đọc biến cố), 'LUM' (Lumina), 'cmo'|'coo'|'cfo'|'sec' (4 vai họp đội).
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. */
(function () {
  var canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
  var muted = false; try { muted = localStorage.getItem('bizon-hcsr-voice') === 'off'; } catch (e) {}
  var speaking = false, queue = [];

  // Web Speech API không chọn được giọng cụ thể theo tên trên mọi trình duyệt,
  // nên dùng pitch/rate làm tín hiệu phân biệt nhẹ giữa các nhân vật.
  var TONE = {
    NAR: { pitch: 1,    rate: 1 },
    LUM: { pitch: 1.3,  rate: 1.04 },
    cmo: { pitch: 1.15, rate: 1.06 },
    coo: { pitch: 0.85, rate: 0.95 },
    cfo: { pitch: 1.08, rate: 1 },
    sec: { pitch: 1,    rate: 0.98 }
  };

  function next() {
    var item = queue.shift();
    if (!item) { speaking = false; paintBtn(); return; }
    speaking = true; paintBtn();
    var tone = TONE[item.speaker] || TONE.NAR;
    var u = new SpeechSynthesisUtterance(item.text);
    u.lang = item.lang === 'en' ? 'en-US' : 'vi-VN';
    u.pitch = tone.pitch; u.rate = tone.rate;
    u.onend = u.onerror = next;
    try { window.speechSynthesis.speak(u); } catch (e) { next(); }
  }
  function say(text, speaker, lang) {
    if (muted || !canSpeak || !text) return;
    var clean = String(text).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!clean) return;
    queue.push({ text: clean, speaker: speaker || 'NAR', lang: lang });
    if (!speaking) next();
  }
  function stop() {
    queue = []; speaking = false;
    if (canSpeak) { try { window.speechSynthesis.cancel(); } catch (e) {} }
    paintBtn();
  }

  var btn;
  function paintBtn() {
    if (!btn) return;
    btn.innerHTML = '🎙️' + (muted ? '<i style="position:absolute;left:11px;right:11px;top:23px;height:2.5px;background:#ff8a7a;transform:rotate(-40deg)"></i>' : (speaking ? '<i class="durian-voice-pulse"></i>' : ''));
    var label = muted ? 'Bật lồng tiếng cố vấn · Turn character voices on' : 'Tắt lồng tiếng cố vấn · Turn character voices off';
    btn.title = label; btn.setAttribute('aria-label', label);
    btn.classList.toggle('on', speaking && !muted);
  }
  function injectBtn() {
    if (!canSpeak || document.getElementById('durian-voice-btn')) return;
    var css = document.createElement('style');
    css.textContent = '#durian-voice-btn{position:fixed;right:14px;bottom:14px;z-index:800;width:46px;height:46px;border-radius:50%;border:0;background:#033337;color:#fff;font-size:20px;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.25)}' +
      '#durian-voice-btn.on{background:#0f8f6b}' +
      '@keyframes durianVoicePulse{0%,100%{opacity:.4}50%{opacity:1}}' +
      '.durian-voice-pulse{position:absolute;inset:-4px;border-radius:50%;border:2px solid #fda127;animation:durianVoicePulse 1s ease-in-out infinite}';
    document.head.appendChild(css);
    btn = document.createElement('button'); btn.id = 'durian-voice-btn'; btn.type = 'button';
    btn.onclick = function () {
      muted = !muted;
      try { localStorage.setItem('bizon-hcsr-voice', muted ? 'off' : 'on'); } catch (e) {}
      if (muted) stop(); paintBtn();
    };
    paintBtn();
    document.body.appendChild(btn);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectBtn); else injectBtn();

  window.DurianVoice = { say: say, stop: stop, canSpeak: canSpeak };
}());
