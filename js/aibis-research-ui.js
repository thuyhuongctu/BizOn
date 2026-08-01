/* AIBIS private research controls. Visible only with ?researchAIBIS=1. */
(function () {
  'use strict';
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  if (params.get('researchAIBIS') !== '1') return;

  function download(name, type, content) {
    const blob = new Blob([content], { type: type + ';charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    setTimeout(function () { URL.revokeObjectURL(url); }, 0);
  }

  function mount() {
    if (!window.BizOnAIBISShadow) return false;
    const box = document.createElement('section');
    box.id = 'aibis-research-controls';
    box.style.cssText = 'max-width:1024px;margin:20px auto;padding:16px;border:1px solid #b7d4dc;border-radius:18px;background:#f7fcfe;color:#033337';
    box.innerHTML = [
      '<h2 style="font-weight:800;margin:0 0 8px">🔬 AIBIS Research Mode — Private</h2>',
      '<p style="font-size:13px;margin:0 0 10px">Chỉ dùng cho pilot nội bộ. Telemetry mặc định tắt; dữ liệu chỉ được gửi khi người tham gia đồng thuận rõ ràng và cấu hình upload được bật.</p>',
      '<label style="display:flex;gap:8px;align-items:flex-start;font-size:13px"><input id="aibis-consent" type="checkbox"> <span>Tôi đã đọc thông tin nghiên cứu và đồng ý cho lưu dữ liệu quyết định ẩn danh. Không bao gồm tên, email, nội dung chat hoặc lời giải trình tự do.</span></label>',
      '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">',
      '<button id="aibis-export-json" type="button">Xuất JSON</button>',
      '<button id="aibis-export-csv" type="button">Xuất parity CSV</button>',
      '<button id="aibis-upload" type="button">Gửi dữ liệu đã đồng thuận</button>',
      '</div>',
      '<p id="aibis-research-status" aria-live="polite" style="font-size:12px;margin-top:10px"></p>'
    ].join('');
    document.querySelector('main').prepend(box);

    const consent = document.getElementById('aibis-consent');
    const status = document.getElementById('aibis-research-status');
    document.getElementById('aibis-export-json').addEventListener('click', function () {
      const record = window.BizOnAIBISShadow.exportResearchRecord();
      record.consent = Boolean(consent.checked);
      download('aibis-research.json', 'application/json', JSON.stringify(record, null, 2));
      status.textContent = 'Đã xuất JSON cục bộ.';
    });
    document.getElementById('aibis-export-csv').addEventListener('click', function () {
      const log = window.BizOnAIBISShadow.getParityLog();
      const csv = window.BizOnAIBISParity ? window.BizOnAIBISParity.toCsv(log) : '';
      download('aibis-parity.csv', 'text/csv', csv);
      status.textContent = 'Đã xuất parity CSV cục bộ.';
    });
    document.getElementById('aibis-upload').addEventListener('click', async function () {
      const record = window.BizOnAIBISShadow.exportResearchRecord();
      record.consent = Boolean(consent.checked);
      if (!window.BizOnAIBISTelemetry) { status.textContent = 'Telemetry module chưa sẵn sàng.'; return; }
      const result = await window.BizOnAIBISTelemetry.upload(record);
      status.textContent = result.ok ? 'Đã gửi dữ liệu.' : 'Không gửi: ' + (result.reason || result.status || 'unknown');
    });
    return true;
  }

  window.addEventListener('load', function () {
    let count = 0;
    const timer = setInterval(function () {
      count += 1;
      if (mount() || count > 40) clearInterval(timer);
    }, 250);
  }, { once: true });
})();
