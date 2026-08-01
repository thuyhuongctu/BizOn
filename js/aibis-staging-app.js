/* AIBIS standalone staging app. */
(function () {
  'use strict';
  const A = window.BizOnAIBIS;
  const P = window.BizOnAIBISParameters;
  if (!A || !P) throw new Error('AIBIS modules unavailable');

  const markets = {
    sea:{flag:'🇸🇬',name:'Đông Nam Á',desc:'Hub khu vực, logistics tốt, khoảng cách thấp'},
    eas:{flag:'🇯🇵',name:'Đông Á',desc:'Ổn định, tiêu chuẩn cao, khách hàng khắt khe'},
    eu:{flag:'🇪🇺',name:'Châu Âu',desc:'Nhạy cảm ESG, tuân thủ cao, cạnh tranh mạnh'},
    na:{flag:'🇺🇸',name:'Bắc Mỹ',desc:'Quy mô lớn, cạnh tranh và chi phí thâm nhập cao'},
    me:{flag:'🇦🇪',name:'Trung Đông',desc:'Định hướng quan hệ, tăng trưởng và rủi ro trung bình'},
    kr:{flag:'🇰🇷',name:'Hàn Quốc',desc:'Digital-first, xu hướng thay đổi nhanh'},
    af:{flag:'🇰🇪',name:'Châu Phi',desc:'Tăng trưởng mới nổi, hạ tầng và thể chế biến động'}
  };
  const modes = {
    export:{icon:'📦',name:'Xuất khẩu'}, licensing:{icon:'📜',name:'Cấp phép'}, franchising:{icon:'🏪',name:'Nhượng quyền'},
    joint_venture:{icon:'🤝',name:'Liên doanh'}, strategic_alliance:{icon:'🔗',name:'Liên minh chiến lược'},
    digital_platform:{icon:'🛒',name:'Nền tảng số'}, greenfield_fdi:{icon:'🏭',name:'Đầu tư mới FDI'}
  };
  const events = [
    {name:'Thương mại điện tử tăng tốc',desc:'Nhu cầu số tăng; marketing số hiệu quả hơn.',growth:8,risk:0,tariff:0,shock:0,type:'digital'},
    {name:'Căng thẳng thuế quan',desc:'Thuế nhập khẩu và bất định chính sách tăng.',growth:-3,risk:8,tariff:18,shock:35,type:'trade'},
    {name:'Quy định ESG mới',desc:'Bản địa hóa và tuân thủ được thưởng; chi phí ngắn hạn tăng.',growth:1,risk:5,tariff:0,shock:18,type:'esg'},
    {name:'Gián đoạn logistics',desc:'Chi phí vận chuyển tăng và thời gian giao hàng kéo dài.',growth:-5,risk:10,tariff:4,shock:28,type:'supply_chain'}
  ];

  const $ = id => document.getElementById(id);
  const profileIds = ['financial','managerial','technology','experience','scalability','network'];
  const decisionIds = ['price','marketing','localization'];
  let state, selectedMarket=null, selectedMode=null, decisionLog=[];

  function num(id){ return Number($(id).value); }
  function context(){
    return {
      seed: $('ctx-seed').value.trim() || 'AIBIS-STAGING',
      classroomId: $('ctx-class').value.trim() || null,
      teamId: $('ctx-team').value.trim() || null,
      consent: $('ctx-consent').checked
    };
  }
  function profile(){
    return {
      financial:num('p-financial'), managerial:num('p-managerial'), technology:num('p-technology'),
      internationalExperience:num('p-experience'), productScalability:num('p-scalability'), networkCapability:num('p-network')
    };
  }
  function updateReadiness(){
    const r=A.readinessScore(profile()); $('readiness-score').textContent=r.score.toFixed(1); $('profile-status').textContent=r.score>=60?'Sẵn sàng tương đối':'Cần củng cố';
  }
  function bindRanges(){
    document.querySelectorAll('input[type=range]').forEach(input=>{ const out=input.parentElement.querySelector('output'); const sync=()=>{if(out)out.textContent=input.value; if(input.id.startsWith('p-'))updateReadiness();}; input.addEventListener('input',sync); sync(); });
  }
  function renderChoices(){
    $('market-grid').innerHTML=P.listMarkets().map(id=>{const m=P.getMarket(id), meta=markets[id];return `<button class="choice" data-market="${id}"><span>${meta.flag}</span><strong>${meta.name}</strong><small>${meta.desc}</small><div class="metric">Tăng trưởng ${m.growth} · Rủi ro thể chế ${m.institutionalRisk} · Số hóa ${m.digitalReadiness}</div></button>`}).join('');
    $('mode-grid').innerHTML=P.listEntryModes().map(id=>{const m=P.getEntryMode(id), meta=modes[id];return `<button class="choice" data-mode="${id}"><span>${meta.icon}</span><strong>${meta.name}</strong><small>Cam kết ${m.commitment} · Kiểm soát ${m.control} · Linh hoạt ${m.flexibility}</small><div class="metric">Học hỏi ${m.learning} · Rủi ro nền ${m.baseRisk}</div></button>`}).join('');
    document.querySelectorAll('[data-market]').forEach(b=>b.addEventListener('click',()=>selectMarket(b.dataset.market)));
    document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>selectMode(b.dataset.mode)));
  }
  function selectMarket(id){ selectedMarket=id; document.querySelectorAll('[data-market]').forEach(b=>b.classList.toggle('selected',b.dataset.market===id)); $('market-selected').textContent=markets[id].name; mentor(); }
  function selectMode(id){ selectedMode=id; document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('selected',b.dataset.mode===id)); $('mode-selected').textContent=modes[id].name; mentor(); }

  function initState(){
    const c=context(); state=A.createWorldState({seed:c.seed,cash:1000000,digitalCapability:profile().technology,classroomId:c.classroomId,teamId:c.teamId,consent:c.consent});
    decisionLog=[]; selectedMarket=null; selectedMode=null; $('round-number').textContent='1'; $('decision-log').innerHTML='<p>Chưa có quyết định.</p>'; renderEvent(); renderKpis(); mentor(); $('app-message').textContent='Đã khởi tạo phiên staging.';
  }
  function renderEvent(){ const e=events[Math.min(state?state.round:0,events.length-1)]; $('event-box').innerHTML=`<strong>🌐 ${e.name}</strong><span>${e.desc}</span>`; }
  function inputs(){
    const m=P.getMarket(selectedMarket), mode=P.getEntryMode(selectedMode), e=events[Math.min(state.round,events.length-1)];
    const marketing=num('d-marketing'), localization=num('d-localization'), price=num('d-price');
    const priceFit=Math.max(0,100-Math.abs(price-14)*6);
    return {
      marketGrowth:Math.max(0,Math.min(100,m.growth+e.growth)),
      institutionalRisk:Math.max(0,Math.min(100,m.institutionalRisk+mode.baseRisk*.18+e.risk)),
      tariffPressure:Math.max(0,Math.min(100,m.tariffPressure+e.tariff)),
      localizationFit:Math.max(0,Math.min(100,localization*.8+priceFit*.2)),
      executionQuality:Math.max(0,Math.min(100,marketing*.55+profile().managerial*.25+m.digitalReadiness*.2)),
      shock:e.shock, shockType:e.type, shockSource:e.name
    };
  }
  function append(type,value){ state=A.appendDecision(state,{id:`${type}-${Date.now()}`,type,value,evidenceSources:[],aiAdviceUsed:false,aiAdviceFollowed:false,decisionTimeSeconds:0}); }
  function commit(){
    if(!selectedMarket||!selectedMode){$('app-message').textContent='Hãy chọn thị trường và phương thức thâm nhập.';return;}
    if(state.round>=4){$('app-message').textContent='Phiên đã hoàn tất. Hãy xuất dữ liệu hoặc đặt lại.';return;}
    if(!state.market) append('market_selection',selectedMarket);
    if(!state.entryMode) append('entry_mode',selectedMode);
    append('localization',{price:num('d-price'),marketing:num('d-marketing'),localization:num('d-localization')});
    const result=A.resolveRound(state,inputs()); state=result.state; decisionLog.push({round:state.round,market:selectedMarket,mode:selectedMode,event:events[state.round-1].name,outcome:result.outcome});
    renderKpis(); renderLog(); mentor(result.outcome); $('round-number').textContent=String(Math.min(4,state.round+1)); renderEvent(); $('app-message').textContent=state.round===4?'Hoàn tất 4 vòng. Có thể xuất JSON/CSV.':'Đã ghi quyết định vòng '+state.round+'.';
  }
  function renderKpis(){ const c=state?state.company:{revenue:0,profit:0,marketShare:0,risk:30,doi:0,internationalLearning:0}; $('kpi-revenue').textContent=Math.round(c.revenue).toLocaleString('vi-VN'); $('kpi-profit').textContent=Math.round(c.profit).toLocaleString('vi-VN'); $('kpi-share').textContent=c.marketShare.toFixed(1); $('kpi-risk').textContent=c.risk.toFixed(1); $('kpi-doi').textContent=c.doi.toFixed(1); $('kpi-learning').textContent=c.internationalLearning.toFixed(1); }
  function renderLog(){ $('decision-log').innerHTML=decisionLog.slice().reverse().map(x=>`<div class="log-item"><b>Vòng ${x.round} · ${markets[x.market].name} · ${modes[x.mode].name}</b>${x.event}<br>Lợi nhuận ${Math.round(x.outcome.profit).toLocaleString('vi-VN')} USD · Rủi ro ${x.outcome.risk}</div>`).join(''); }
  function mentor(outcome){
    let t='Hãy hoàn thiện hồ sơ, chọn thị trường và phương thức thâm nhập.';
    if(selectedMarket&&selectedMode){ const m=P.getMarket(selectedMarket), md=P.getEntryMode(selectedMode); t=`Bạn chọn <b>${modes[selectedMode].name}</b> tại <b>${markets[selectedMarket].name}</b>. Mức cam kết ${md.commitment}/100 và rủi ro nền ${md.baseRisk}/100. Hãy cân bằng quyền kiểm soát, tính linh hoạt và khả năng học hỏi.`; }
    if(outcome){ t += outcome.risk>65?' Rủi ro đang cao: kiểm tra lại mức bản địa hóa, chi phí cam kết và khả năng thực thi.':outcome.profit<0?' Lợi nhuận âm có thể là chi phí thâm nhập ban đầu; hãy xem liệu học hỏi và DOI có bù đắp hay không.':' Kết quả hiện cân bằng; tránh tối ưu một KPI duy nhất.'; }
    $('mentor-box').innerHTML=t;
  }
  function download(name,type,text){ const blob=new Blob([text],{type}); const url=URL.createObjectURL(blob); const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),0); }
  function exportJson(){ const r=A.exportResearchRecord(state); r.consent=$('ctx-consent').checked; download('aibis-staging.json','application/json',JSON.stringify(r,null,2)); }
  function exportCsv(){ const rows=[['round','market','entry_mode','event','profit','risk','learning'],...decisionLog.map(x=>[x.round,x.market,x.mode,x.event,x.outcome.profit,x.outcome.risk,x.outcome.learning])]; download('aibis-staging.csv','text/csv',rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n')); }

  bindRanges(); renderChoices(); initState();
  $('btn-commit').addEventListener('click',commit); $('btn-reset').addEventListener('click',initState); $('btn-export-json').addEventListener('click',exportJson); $('btn-export-csv').addEventListener('click',exportCsv);
})();