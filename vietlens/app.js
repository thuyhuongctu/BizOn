(function () {
  'use strict';

  const data = window.VIETLENS_SAMPLE;
  if (!data) {
    document.body.innerHTML = '<main class="fatal-state"><h1>Không tải được dữ liệu VietLens.</h1><p>Hãy kiểm tra tệp sample-data.js.</p></main>';
    return;
  }

  const $ = (id) => document.getElementById(id);
  const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));
  const pct = (value) => `${value >= 0 ? '+' : ''}${Number(value).toFixed(0)}%`;
  const state = {
    alertOnly: false,
    metric: 'risk',
    scenario: null,
    refreshedAt: new Date()
  };

  function weightedPulse() {
    const weights = {
      trade: 0.22,
      finance: 0.18,
      energy: 0.14,
      weather: 0.16,
      logistics: 0.16,
      economy: 0.14
    };
    let total = 0;
    let weight = 0;

    data.indicators.forEach((indicator) => {
      const domainWeight = weights[indicator.domain] || 0.1;
      const normalized = ['weather', 'energy', 'logistics', 'finance'].includes(indicator.domain)
        ? 100 - indicator.value
        : indicator.value;
      total += normalized * domainWeight * indicator.confidence;
      weight += domainWeight * indicator.confidence;
    });

    return Math.round(total / weight);
  }

  function renderSummary() {
    const pulse = weightedPulse();
    const riskSignals = data.indicators.filter((indicator) =>
      ['weather', 'energy', 'logistics', 'finance'].includes(indicator.domain)
    );
    const averageConfidence = data.indicators.reduce((sum, indicator) => sum + indicator.confidence, 0) / data.indicators.length;
    const uncertainty = Math.round(100 - averageConfidence * 100);
    const stability = Math.round(
      riskSignals.reduce((sum, indicator) => sum + (100 - indicator.value), 0) / riskSignals.length
    );
    const trade = data.indicators.find((indicator) => indicator.id === 'trade');
    const consumer = data.indicators.find((indicator) => indicator.id === 'consumer');
    const momentum = Math.round((trade.value + consumer.value) / 2);

    $('pulseScore').textContent = pulse;
    $('stabilityScore').textContent = stability;
    $('momentumScore').textContent = momentum;
    $('uncertaintyScore').textContent = uncertainty;
    $('freshnessLabel').textContent = `Kết xuất lúc ${state.refreshedAt.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    })} · dữ liệu mẫu ${new Date(data.generatedAt).toLocaleDateString('vi-VN')}`;
  }

  function renderKpis() {
    $('kpiGrid').innerHTML = data.indicators.map((indicator) => `
      <article>
        <small>${indicator.label}</small>
        <b>${indicator.display}</b>
        <span class="delta ${indicator.direction}">${indicator.delta >= 0 ? '+' : ''}${indicator.delta}% · tin cậy ${Math.round(indicator.confidence * 100)}%</span>
        <em>${indicator.official ? 'Nguồn chính thức/định kỳ' : 'Proxy công khai'} · ${formatFreshness(indicator.freshnessMinutes)}</em>
      </article>
    `).join('');
  }

  function riskClass(value) {
    return value >= 65 ? 'high' : value >= 50 ? 'mid' : 'low';
  }

  function renderMap() {
    $('vnMap').innerHTML = data.regions.map((region) => `
      <button class="region ${riskClass(region[state.metric])}" style="left:${region.x}%;top:${region.y}%" title="${region.name}: ${region[state.metric]}/100" type="button">
        <span>${region.name}</span><b>${region[state.metric]}</b>
      </button>
    `).join('');
  }

  function renderSignals() {
    const items = state.alertOnly
      ? data.signals.filter((signal) => signal.severity === 'high')
      : data.signals;

    $('signalList').innerHTML = items.map((signal) => `
      <article class="signal">
        <header><h3>${signal.title}</h3><span class="severity ${signal.severity}">${signal.severity.toUpperCase()}</span></header>
        <p>${signal.summary}</p>
        <div class="meta">
          <span>${signal.domain}</span>
          <span>${signal.sourceCount} nguồn</span>
          <span>${Math.round(signal.confidence * 100)}% confidence</span>
          <span>${formatFreshness(signal.freshnessMinutes)}</span>
        </div>
      </article>
    `).join('');
  }

  function formatFreshness(minutes) {
    if (minutes < 60) return `${minutes} phút`;
    if (minutes < 1440) return `${Math.round(minutes / 60)} giờ`;
    return `${Math.round(minutes / 1440)} ngày`;
  }

  function baselineForecast() {
    const trade = data.indicators.find((indicator) => indicator.id === 'trade').value;
    const weather = data.indicators.find((indicator) => indicator.id === 'weather').value;
    const logistics = data.indicators.find((indicator) => indicator.id === 'logistics').value;
    const fx = data.indicators.find((indicator) => indicator.id === 'fx').value;

    return [
      {
        name: 'Kịch bản cơ sở',
        likelihood: 'Trung bình–cao',
        growth: clamp((trade * 0.10) - (weather * 0.025) - (logistics * 0.02) - (fx * 0.015), -10, 12),
        confidence: 74
      },
      {
        name: 'Phục hồi thuận lợi',
        likelihood: 'Trung bình',
        growth: clamp((trade * 0.13) - (weather * 0.012) - (logistics * 0.008), -8, 15),
        confidence: 61
      },
      {
        name: 'Áp lực kéo dài',
        likelihood: 'Trung bình',
        growth: clamp((trade * 0.05) - (weather * 0.04) - (logistics * 0.035) - (fx * 0.025), -15, 8),
        confidence: 68
      }
    ];
  }

  function renderForecast() {
    $('forecastCards').innerHTML = baselineForecast().map((forecast) => `
      <article class="forecast-card">
        <header><b>${forecast.name}</b><span>${forecast.likelihood}</span></header>
        <strong>${pct(forecast.growth)} động lực tăng trưởng</strong>
        <p>Độ tin cậy mô hình MVP: ${forecast.confidence}%. Khoảng dự báo chưa được hiệu chỉnh bằng backtest thực tế.</p>
      </article>
    `).join('');
  }

  function runScenario() {
    const energy = Number($('energyShock').value);
    const fx = Number($('fxShock').value);
    const logistics = Number($('logisticsShock').value);
    const demand = Number($('demandShock').value);

    const exportImpact = clamp(demand * 0.55 - fx * 0.18 - logistics * 0.12 - energy * 0.07, -40, 40);
    const inflationImpact = clamp(energy * 0.18 + fx * 0.22 + logistics * 0.08, -10, 25);
    const manufacturingImpact = clamp(demand * 0.25 - fx * 0.12 - logistics * 0.18 - energy * 0.1, -30, 25);
    const agriImpact = clamp(demand * 0.30 - logistics * 0.16 - energy * 0.08, -30, 30);

    state.scenario = {
      inputs: { energy, fx, logistics, demand },
      outputs: { exportImpact, inflationImpact, manufacturingImpact, agriImpact },
      generatedAt: new Date().toISOString(),
      model: 'vietlens-scenario-0.1.0'
    };

    $('scenarioResults').innerHTML = [
      ['Xuất khẩu', exportImpact],
      ['Áp lực lạm phát', inflationImpact],
      ['Sản xuất', manufacturingImpact],
      ['Nông nghiệp', agriImpact]
    ].map(([name, value]) => `
      <div class="scenario-row"><span>${name}</span><b class="delta ${value > 1 ? 'up' : value < -1 ? 'down' : 'flat'}">${pct(value)}</b></div>
    `).join('');
  }

  function renderAudit() {
    $('generatedAt').textContent = new Date(data.generatedAt).toLocaleString('vi-VN');
    const available = data.provenance.filter((item) => item.status === 'available').length;
    $('sourceHealth').textContent = `${available}/${data.provenance.length} tốt`;
    $('dataGaps').textContent = `${data.provenance.filter((item) => item.status !== 'available').length} nhóm`;
    $('provenanceTable').innerHTML = `
      <table>
        <thead><tr><th>Nguồn</th><th>Lĩnh vực</th><th>Loại</th><th>Trạng thái</th><th>Độ trễ</th></tr></thead>
        <tbody>${data.provenance.map((item) => `
          <tr><td>${item.source}</td><td>${item.domain}</td><td>${item.type}</td><td>${item.status}</td><td>${item.lag}</td></tr>
        `).join('')}</tbody>
      </table>
    `;
  }

  function exportReport() {
    const payload = {
      product: 'VietLens AI MVP',
      version: '0.1.0',
      exportedAt: new Date().toISOString(),
      sourceGeneratedAt: data.generatedAt,
      pulse: weightedPulse(),
      indicators: data.indicators,
      signals: data.signals,
      forecast: baselineForecast(),
      scenario: state.scenario,
      provenance: data.provenance,
      limitations: [
        'Sample/proxy data',
        'No calibrated probabilistic forecast',
        'Not financial, legal, medical, emergency or public-policy advice'
      ]
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = 'vietlens-report.json';
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(anchor.href), 0);
  }

  function bind() {
    $('mapMetric').addEventListener('change', (event) => {
      state.metric = event.target.value;
      renderMap();
    });

    $('filterBtn').addEventListener('click', () => {
      state.alertOnly = !state.alertOnly;
      $('filterBtn').textContent = state.alertOnly ? 'Hiện tất cả' : 'Chỉ cảnh báo';
      renderSignals();
    });

    [
      ['energyShock', 'energyOut'],
      ['fxShock', 'fxOut'],
      ['logisticsShock', 'logisticsOut'],
      ['demandShock', 'demandOut']
    ].forEach(([id, output]) => {
      $(id).addEventListener('input', (event) => {
        $(output).textContent = pct(Number(event.target.value));
      });
    });

    $('runScenarioBtn').addEventListener('click', runScenario);
    $('exportBtn').addEventListener('click', exportReport);
    $('refreshBtn').addEventListener('click', () => {
      state.refreshedAt = new Date();
      renderSummary();
      $('refreshBtn').textContent = 'Đã làm mới';
      setTimeout(() => {
        $('refreshBtn').textContent = 'Làm mới tín hiệu';
      }, 1200);
    });
  }

  function init() {
    renderSummary();
    renderKpis();
    renderMap();
    renderSignals();
    renderForecast();
    renderAudit();
    runScenario();
    bind();
  }

  init();
})();
