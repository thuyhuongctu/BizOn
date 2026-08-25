(() => {
  'use strict';

  const Engine = window.BizOnEntryModeEngine;
  const Models = window.BizOnEntryModeModels;
  const Profiles = window.BizOnCountryProfiles;
  if (!Engine || !Models || !Profiles) {
    document.getElementById('luminaRecommendation').innerHTML = '<h3>Model unavailable</h3><p>AIBIS vẫn mở được, nhưng scoring engine chưa tải thành công.</p>';
    return;
  }

  const priorities = { control:70, speed:60, learning:75, capitalEfficiency:55, riskCompatibility:55, knowledgeProtection:60, localEmbeddedness:70, digitalScalability:65 };
  const firm = { financialCapacity:64, internationalExperience:48, digitalCapability:72 };
  const capabilities = [['Financial',64],['International',48],['Digital',72],['Product scale',70],['Network',55],['Management',66]];
  const indicator = (value, sourceId, year, confidence, notes='Illustrative teaching value') => ({ value, rawValue:null, rawUnit:null, sourceId, sourceUrl:'', referenceYear:year, retrievedAt:'2026-08-02', freshness:'demo', confidence, license:'teaching-demo-only', notes });
  const japanProfile = Profiles.createProfile({
    profileVersion:'0.1.0-demo', iso2:'JP', name:'Japan', region:'East Asia', scenarioUse:'teaching-demo',
    indicators:{
      marketSize:indicator(86,'demo-market',2026,35), marketGrowth:indicator(42,'demo-market',2026,35), institutionQuality:indicator(82,'demo-institution',2026,35), politicalRisk:indicator(18,'demo-risk',2026,35), culturalDistance:indicator(62,'demo-bilateral-placeholder',2026,20,'Pairwise value; replace with bilateral module'), logisticsQuality:indicator(88,'demo-logistics',2026,35), tariffPressure:indicator(25,'demo-trade',2026,30), digitalReadiness:indicator(91,'demo-digital',2026,35), ipProtection:indicator(86,'demo-ip',2026,35), partnerEcosystem:indicator(78,'demo-partner',2026,30), dataRegulationRisk:indicator(52,'demo-data',2026,30), networkEffects:indicator(72,'demo-network',2026,30)
    },
    provenance:{ compiledAt:'2026-08-02', compiledBy:'BizOn demo', reviewStatus:'illustrative', limitations:['Not production data','Not investment advice','Cultural distance requires home-host calculation'] }
  });

  const country = {
    marketSize:japanProfile.indicators.marketSize.value,
    politicalRisk:japanProfile.indicators.politicalRisk.value,
    culturalDistance:japanProfile.indicators.culturalDistance.value,
    institutionalDistance:45,
    logisticsQuality:japanProfile.indicators.logisticsQuality.value,
    tariffPressure:japanProfile.indicators.tariffPressure.value,
    digitalReadiness:japanProfile.indicators.digitalReadiness.value,
    ipProtection:japanProfile.indicators.ipProtection.value,
    dataRegulationRisk:japanProfile.indicators.dataRegulationRisk.value,
    crossBorderNetworkEffects:japanProfile.indicators.networkEffects.value,
    localPartnerValue:japanProfile.indicators.partnerEcosystem.value,
    networkImportance:japanProfile.indicators.networkEffects.value,
    opportunismRisk:35
  };

  const $ = id => document.getElementById(id);
  let selectedId = 'joint_venture';
  let latestRanking = [];

  function context(){ return { priorities, firm, country }; }
  function marketRows(){ return [['Market attractiveness',74],['Institution quality',japanProfile.indicators.institutionQuality.value],['Logistics',country.logisticsQuality],['Digital readiness',country.digitalReadiness]]; }

  function renderMarket(){
    $('marketMetrics').innerHTML = marketRows().map(([label,value]) => `<div class="metric"><span>${label}</span><strong>${value}</strong></div>`).join('');
    $('capabilityBars').innerHTML = capabilities.map(([label,value]) => `<div class="cap-row"><span>${label}</span><div class="bar"><i style="width:${value}%"></i></div><b>${value}</b></div>`).join('');
    $('readinessScore').textContent = Math.round(capabilities.reduce((sum,row)=>sum+row[1],0)/capabilities.length);
  }

  function renderPriorities(){
    const visible = {control:'Control',speed:'Speed',learning:'Learning',capitalEfficiency:'Capital flexibility',riskCompatibility:'Risk tolerance'};
    $('priorityControls').innerHTML = Object.entries(visible).map(([key,label]) => `<label>${label} <b id="${key}Value">${priorities[key]}</b><input data-priority="${key}" type="range" min="0" max="100" value="${priorities[key]}"></label>`).join('');
    document.querySelectorAll('[data-priority]').forEach(input => input.addEventListener('input', event => { priorities[event.target.dataset.priority] = Number(event.target.value); $(`${event.target.dataset.priority}Value`).textContent = event.target.value; renderModes(); }));
  }

  function renderModes(){
    latestRanking = Engine.rankModes(Models.modes, context());
    $('modeGrid').innerHTML = latestRanking.map(result => {
      const mode = Models.modes.find(item => item.id === result.modeId);
      return `<article class="mode-card ${mode.id===selectedId?'selected':''}" data-mode="${mode.id}" tabindex="0" role="button" aria-pressed="${mode.id===selectedId}"><header><h3>${mode.label}</h3><b class="score">${result.score}</b></header><p>${mode.theories.join(' · ')}</p><div class="mini-stats"><span>C ${mode.control}</span><span>S ${mode.speed}</span><span>L ${mode.learning}</span><span>Conf ${result.confidence}</span></div></article>`;
    }).join('');
    document.querySelectorAll('[data-mode]').forEach(card => { const select=()=>{selectedId=card.dataset.mode;renderModes();}; card.addEventListener('click',select); card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select();}}); });
    renderRecommendation();
  }

  function renderRecommendation(){
    const selected = latestRanking.find(item=>item.modeId===selectedId) || latestRanking[0];
    const top = latestRanking[0];
    const topMode = Models.modes.find(item=>item.id===top.modeId);
    const selectedMode = Models.modes.find(item=>item.id===selected.modeId);
    const strengths = top.explanation.strengths.length ? top.explanation.strengths : ['Không có lợi thế nổi trội theo ngưỡng hiện tại'];
    const cautions = top.explanation.cautions.length ? top.explanation.cautions : ['Cần kiểm định bằng dữ liệu và chuyên gia'];
    $('luminaRecommendation').innerHTML = `<h3>${topMode.label} currently ranks first</h3><p>Fit <b>${top.score}</b> · evidence confidence <b>${top.confidence}</b> · engine v${Engine.VERSION}</p><ul>${strengths.map(x=>`<li>✓ ${x}</li>`).join('')}${cautions.map(x=>`<li>! ${x}</li>`).join('')}</ul><p><b>Your selection:</b> ${selectedMode.label} · ${selected.score}</p><small>Profile confidence ${Profiles.profileConfidence(japanProfile)}/100 · status ${japanProfile.provenance.reviewStatus}</small>`;
    $('compareMode').innerHTML = latestRanking.filter(item=>item.modeId!==selectedId).map(item=>{const mode=Models.modes.find(m=>m.id===item.modeId);return `<option value="${mode.id}">${mode.label}</option>`;}).join('');
    renderCounterfactual();
  }

  function renderCounterfactual(){
    const a = Models.modes.find(mode=>mode.id===selectedId);
    const b = Models.modes.find(mode=>mode.id===$('compareMode').value) || Models.modes.find(mode=>mode.id!==selectedId);
    if(!a||!b)return;
    const comparison = Engine.compareModes(a,b,context());
    const winner = comparison.winner ? Models.modes.find(mode=>mode.id===comparison.winner).label : 'Tie';
    $('counterfactualResult').innerHTML = `<b>${winner} leads by ${comparison.difference} points</b><br>So sánh dùng cùng firm profile, country context, priorities và engine version.`;
  }

  $('compareMode')?.addEventListener('change', renderCounterfactual);
  $('resetPriorities')?.addEventListener('click',()=>{Object.assign(priorities,{control:70,speed:60,learning:75,capitalEfficiency:55,riskCompatibility:55,knowledgeProtection:60,localEmbeddedness:70,digitalScalability:65});renderPriorities();renderModes();});
  renderMarket(); renderPriorities(); renderModes();
})();