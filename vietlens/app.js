(function(){
  'use strict';
  const data=window.VIETLENS_SAMPLE;
  if(!data){document.body.innerHTML='<p>Không tải được dữ liệu VietLens.</p>';return;}
  const $=(id)=>document.getElementById(id);
  const clamp=(v,min=0,max=100)=>Math.max(min,Math.min(max,v));
  const pct=(v)=>`${v>=0?'+':''}${Number(v).toFixed(0)}%`;
  const state={alertOnly:false,metric:'risk',scenario:null,refreshedAt:new Date()};

  function weightedPulse(){
    const ws={trade:.22,finance:.18,energy:.14,weather:.16,logistics:.16,economy:.14};
    let total=0,weight=0;
    data.indicators.forEach(i=>{const w=ws[i.domain]||.1;const normalized=['weather','energy','logistics','finance'].includes(i.domain)?100-i.value:i.value;total+=normalized*w*i.confidence;weight+=w*i.confidence;});
    return Math.round(total/weight);
  }
  function renderSummary(){
    const pulse=weightedPulse();
    const riskSignals=data.indicators.filter(i=>['weather','energy','logistics','finance'].includes(i.domain));
    const uncertainty=Math.round(100-(data.indicators.reduce((s,i)=>s+i.confidence,0)/data.indicators.length*100));
    const stability=Math.round(riskSignals.reduce((s,i)=>s+(100-i.value),0)/riskSignals.length);
    const momentum=Math.round((data.indicators.find(i=>i.id==='trade').value+data.indicators.find(i=>i.id==='consumer').value)/2);
    $('pulseScore').textContent=pulse;$('stabilityScore').textContent=stability;$('momentumScore').textContent=momentum;$('uncertaintyScore').textContent=uncertainty;
    $('freshnessLabel').textContent='Cập nhật '+state.refreshedAt.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'});
  }
  function renderKpis(){
    $('kpiGrid').innerHTML=data.indicators.map(i=>`<article><small>${i.label}</small><b>${i.display}</b><span class="delta ${i.direction}">${i.delta>=0?'+':''}${i.delta}% · tin cậy ${Math.round(i.confidence*100)}%</span></article>`).join('');
  }
  function riskClass(v){return v>=65?'high':v>=50?'mid':'low';}
  function renderMap(){
    $('vnMap').innerHTML=data.regions.map(r=>`<button class="region ${riskClass(r[state.metric])}" style="left:${r.x}%;top:${r.y}%" title="${r.name}: ${r[state.metric]}/100"><span>${r.name}</span><b>${r[state.metric]}</b></button>`).join('');
  }
  function renderSignals(){
    const items=state.alertOnly?data.signals.filter(s=>s.severity==='high'):data.signals;
    $('signalList').innerHTML=items.map(s=>`<article class="signal"><header><h3>${s.title}</h3><span class="severity ${s.severity}">${s.severity.toUpperCase()}</span></header><p>${s.summary}</p><div class="meta"><span>${s.domain}</span><span>${s.sourceCount} nguồn</span><span>${Math.round(s.confidence*100)}% confidence</span><span>${formatFreshness(s.freshnessMinutes)}</span></div></article>`).join('');
  }
  function formatFreshness(m){if(m<60)return `${m} phút`;if(m<1440)return `${Math.round(m/60)} giờ`;return `${Math.round(m/1440)} ngày`;}
  function baselineForecast(){
    const trade=data.indicators.find(i=>i.id==='trade').value;
    const weather=data.indicators.find(i=>i.id==='weather').value;
    const logistics=data.indicators.find(i=>i.id==='logistics').value;
    const fx=data.indicators.find(i=>i.id==='fx').value;
    return [
      {name:'Kịch bản cơ sở',likelihood:'Trung bình–cao',growth:clamp((trade*.10)-(weather*.025)-(logistics*.02)-(fx*.015),-10,12),confidence:74},
      {name:'Phục hồi thuận lợi',likelihood:'Trung bình',growth:clamp((trade*.13)-(weather*.012)-(logistics*.008),-8,15),confidence:61},
      {name:'Áp lực kéo dài',likelihood:'Trung bình',growth:clamp((trade*.05)-(weather*.04)-(logistics*.035)-(fx*.025),-15,8),confidence:68}
    ];
  }
  function renderForecast(){
    $('forecastCards').innerHTML=baselineForecast().map(f=>`<article class="forecast-card"><header><b>${f.name}</b><span>${f.likelihood}</span></header><strong>${pct(f.growth)} động lực tăng trưởng</strong><p>Độ tin cậy mô hình MVP: ${f.confidence}%. Khoảng dự báo chưa được hiệu chỉnh bằng backtest thực tế.</p></article>`).join('');
  }
  function runScenario(){
    const e=+$('energyShock').value,fx=+$('fxShock').value,l=+$('logisticsShock').value,d=+$('demandShock').value;
    const exportImpact=clamp(d*.55-fx*.18-l*.12-e*.07,-40,40);
    const inflationImpact=clamp(e*.18+fx*.22+l*.08,-10,25);
    const manufacturingImpact=clamp(d*.25-fx*.12-l*.18-e*.1,-30,25);
    const agriImpact=clamp(d*.30-l*.16-e*.08,-30,30);
    state.scenario={inputs:{energy:e,fx,logistics:l,demand:d},outputs:{exportImpact,inflationImpact,manufacturingImpact,agriImpact},generatedAt:new Date().toISOString(),model:'vietlens-scenario-0.1.0'};
    $('scenarioResults').innerHTML=[['Xuất khẩu',exportImpact],['Áp lực lạm phát',inflationImpact],['Sản xuất',manufacturingImpact],['Nông nghiệp',agriImpact]].map(([n,v])=>`<div class="scenario-row"><span>${n}</span><b class="delta ${v>1?'up':v<-1?'down':'flat'}">${pct(v)}</b></div>`).join('');
  }
  function renderAudit(){
    $('generatedAt').textContent=new Date(data.generatedAt).toLocaleString('vi-VN');
    const available=data.provenance.filter(p=>p.status==='available').length;
    $('sourceHealth').textContent=`${available}/${data.provenance.length} tốt`;
    $('dataGaps').textContent=`${data.provenance.filter(p=>p.status!=='available').length} nhóm`;
    $('provenanceTable').innerHTML=`<table><thead><tr><th>Nguồn</th><th>Lĩnh vực</th><th>Loại</th><th>Trạng thái</th><th>Độ trễ</th></tr></thead><tbody>${data.provenance.map(p=>`<tr><td>${p.source}</td><td>${p.domain}</td><td>${p.type}</td><td>${p.status}</td><td>${p.lag}</td></tr>`).join('')}</tbody></table>`;
  }
  function exportReport(){
    const payload={product:'VietLens AI MVP',version:'0.1.0',exportedAt:new Date().toISOString(),sourceGeneratedAt:data.generatedAt,pulse:weightedPulse(),indicators:data.indicators,signals:data.signals,forecast:baselineForecast(),scenario:state.scenario,provenance:data.provenance,limitations:['Sample/proxy data','No calibrated probabilistic forecast','Not financial, legal or medical advice']};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='vietlens-report.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),0);
  }
  function bind(){
    $('mapMetric').addEventListener('change',e=>{state.metric=e.target.value;renderMap();});
    $('filterBtn').addEventListener('click',()=>{state.alertOnly=!state.alertOnly;$('filterBtn').textContent=state.alertOnly?'Hiện tất cả':'Chỉ cảnh báo';renderSignals();});
    [['energyShock','energyOut'],['fxShock','fxOut'],['logisticsShock','logisticsOut'],['demandShock','demandOut']].forEach(([id,out])=>$(id).addEventListener('input',e=>$(out).textContent=pct(+e.target.value)));
    $('runScenarioBtn').addEventListener('click',runScenario);$('exportBtn').addEventListener('click',exportReport);$('refreshBtn').addEventListener('click',()=>{state.refreshedAt=new Date();renderSummary();$('refreshBtn').textContent='Đã làm mới';setTimeout(()=>$('refreshBtn').textContent='Làm mới tín hiệu',1200);});
  }
  function init(){renderSummary();renderKpis();renderMap();renderSignals();renderForecast();renderAudit();runScenario();bind();}
  init();
})();