(() => {
  'use strict';

  const priorities = { control: 70, speed: 60, learning: 75, capital: 55, risk: 45 };
  const market = [
    ['Market attractiveness', 74], ['Institution quality', 82], ['Logistics', 88], ['Digital readiness', 91]
  ];
  const capabilities = [
    ['Financial', 64], ['International', 48], ['Digital', 72], ['Product scale', 70], ['Network', 55], ['Management', 66]
  ];
  const modes = [
    { id:'export', name:'Export', desc:'Nhanh, ít vốn, kiểm soát và học hỏi hạn chế.', control:25, speed:88, learning:35, capital:82, risk:78 },
    { id:'licensing', name:'Licensing', desc:'Mở rộng nhanh nhưng tăng rủi ro tri thức và chất lượng.', control:20, speed:82, learning:38, capital:86, risk:65 },
    { id:'joint-venture', name:'Joint Venture', desc:'Tăng embeddedness, học hỏi địa phương và chia sẻ rủi ro.', control:58, speed:55, learning:82, capital:52, risk:52 },
    { id:'alliance', name:'Strategic Alliance', desc:'Linh hoạt, học hỏi cao, cam kết vốn trung bình.', control:45, speed:68, learning:80, capital:66, risk:60 },
    { id:'fdi', name:'Wholly Owned FDI', desc:'Kiểm soát và bảo vệ tri thức cao, vốn và rủi ro lớn.', control:95, speed:25, learning:72, capital:18, risk:25 },
    { id:'digital', name:'Digital Entry', desc:'Tốc độ và khả năng mở rộng số cao, phụ thuộc hệ sinh thái.', control:62, speed:92, learning:58, capital:78, risk:62 }
  ];

  const $ = (id) => document.getElementById(id);
  let selectedId = 'joint-venture';

  function fit(mode) {
    const terms = [
      100 - Math.abs(mode.control - priorities.control),
      100 - Math.abs(mode.speed - priorities.speed),
      100 - Math.abs(mode.learning - priorities.learning),
      100 - Math.abs(mode.capital - priorities.capital),
      100 - Math.abs(mode.risk - (100 - priorities.risk))
    ];
    const strategic = terms.reduce((a,b)=>a+b,0) / terms.length;
    const japanFit = mode.id === 'joint-venture' ? 86 : mode.id === 'digital' ? 82 : mode.id === 'export' ? 76 : mode.id === 'fdi' ? 69 : 72;
    const readinessFit = mode.id === 'fdi' ? 48 : mode.id === 'digital' ? 76 : mode.id === 'joint-venture' ? 71 : 68;
    return Math.round((strategic * .55 + readinessFit * .25 + japanFit * .20) * 10) / 10;
  }

  function renderMarket() {
    $('marketMetrics').innerHTML = market.map(([label,value]) => `<div class="metric"><span>${label}</span><strong>${value}</strong></div>`).join('');
    $('capabilityBars').innerHTML = capabilities.map(([label,value]) => `<div class="cap-row"><span>${label}</span><div class="bar"><i style="width:${value}%"></i></div><b>${value}</b></div>`).join('');
  }

  function renderPriorities() {
    const labels = {control:'Control',speed:'Speed',learning:'Learning',capital:'Capital flexibility',risk:'Risk tolerance'};
    $('priorityControls').innerHTML = Object.entries(priorities).map(([key,value]) => `<label>${labels[key]} <b id="${key}Value">${value}</b><input data-priority="${key}" type="range" min="0" max="100" value="${value}"></label>`).join('');
    document.querySelectorAll('[data-priority]').forEach(input => input.addEventListener('input', (event) => {
      const key = event.target.dataset.priority;
      priorities[key] = Number(event.target.value);
      $(`${key}Value`).textContent = event.target.value;
      renderModes();
    }));
  }

  function renderModes() {
    const ranked = modes.map(mode => ({...mode, score:fit(mode)})).sort((a,b)=>b.score-a.score);
    $('modeGrid').innerHTML = ranked.map(mode => `<article class="mode-card ${mode.id===selectedId?'selected':''}" data-mode="${mode.id}" tabindex="0" role="button" aria-pressed="${mode.id===selectedId}"><header><h3>${mode.name}</h3><b class="score">${mode.score}</b></header><p>${mode.desc}</p><div class="mini-stats"><span>C ${mode.control}</span><span>S ${mode.speed}</span><span>L ${mode.learning}</span></div></article>`).join('');
    document.querySelectorAll('[data-mode]').forEach(card => {
      const select = () => { selectedId = card.dataset.mode; renderModes(); };
      card.addEventListener('click', select);
      card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(); } });
    });
    renderRecommendation(ranked);
  }

  function renderRecommendation(ranked) {
    const selected = ranked.find(m => m.id === selectedId) || ranked[0];
    const top = ranked[0];
    $('luminaRecommendation').innerHTML = `<h3>${top.name} currently ranks first</h3><p>Fit score <b>${top.score}</b>. ${top.desc}</p><ul><li>Ưu tiên học hỏi và kiểm soát được phản ánh trong điểm số.</li><li>Năng lực doanh nghiệp hiện chưa phù hợp với cam kết vốn rất cao.</li><li>Điểm là kết quả mô phỏng, không phải dự báo thành công thực tế.</li></ul><p><b>Your selection:</b> ${selected.name} · ${selected.score}</p>`;
    $('compareMode').innerHTML = ranked.filter(m => m.id !== selected.id).map(m => `<option value="${m.id}">${m.name}</option>`).join('');
    renderCounterfactual(ranked);
  }

  function renderCounterfactual(ranked) {
    const selected = ranked.find(m => m.id === selectedId);
    const other = ranked.find(m => m.id === $('compareMode').value) || ranked.find(m => m.id !== selectedId);
    if (!selected || !other) return;
    const diff = Math.round((selected.score - other.score) * 10) / 10;
    $('counterfactualResult').innerHTML = `<b>${selected.name} ${diff >= 0 ? 'cao hơn' : 'thấp hơn'} ${Math.abs(diff)} điểm</b><br>${selected.name} nhấn mạnh control ${selected.control} và learning ${selected.learning}; ${other.name} nhấn mạnh speed ${other.speed} và capital flexibility ${other.capital}.`;
  }

  $('compareMode')?.addEventListener('change', () => renderModes());
  $('resetPriorities')?.addEventListener('click', () => {
    Object.assign(priorities, { control:70, speed:60, learning:75, capital:55, risk:45 });
    renderPriorities(); renderModes();
  });

  renderMarket(); renderPriorities(); renderModes();
})();
