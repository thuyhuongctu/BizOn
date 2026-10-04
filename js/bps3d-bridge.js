/* Cầu nối cảnh 3D (bps3d-v2.js) với Bến Phù Sa v2. Tạo khung #bps3d một lần, giữ renderer sống khi chuyển màn. */
(function(){
  var wrap=null,hold=null,loaded=false,failed=false;
  function css(){ if(document.getElementById('bps3d-style'))return; var s=document.createElement('style'); s.id='bps3d-style'; s.textContent=
  '.bps3d-chip{background:linear-gradient(180deg,#0f5a60,#033337);color:#fff;font:700 12px/1.2 "Plus Jakarta Sans",system-ui,sans-serif;padding:7px 13px;border-radius:99px;border:0;white-space:nowrap;box-shadow:0 4px 0 #011e21,inset 0 2px 0 rgba(255,255,255,.22)}'+
  '.bps3d-lab{position:absolute;left:0;top:0;pointer-events:auto;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:1px;color:#033337;border-radius:16px;padding:5px 10px;font:800 12px/1.2 "Plus Jakarta Sans",sans-serif;white-space:nowrap;background:linear-gradient(180deg,#fffdf6,#f1e7d3);box-shadow:0 5px 0 #d9c7a6,0 10px 16px -6px rgba(3,51,55,.35),inset 0 2px 0 #fff}'+
  '.bps3d-lab small{font-weight:600;font-size:10px;opacity:.7}.bps3d-lab.on{background:linear-gradient(180deg,#ffd38a,#fda127);box-shadow:0 2px 0 #c97a12,inset 0 3px 6px rgba(150,80,0,.3)}'+
  '.bps3d-pop{position:absolute;left:0;top:0;pointer-events:none;font:800 18px "Plus Jakarta Sans",sans-serif;color:#fff;background:#3f8a44;padding:6px 12px;border-radius:99px;box-shadow:0 5px 0 rgba(0,0,0,.25),inset 0 2px 0 rgba(255,255,255,.35)}'+
  '.bps3d-pop.bad{background:#c0443a}.bps3d-pop small{font-size:11px;font-weight:700;opacity:.9;margin-left:6px}'+
  '@media (max-width:640px){.bps3d-lab small{display:none}}';
  document.head.appendChild(s); }
  function ensure(){ if(wrap)return; css();
    hold=document.createElement('div'); hold.style.cssText='position:fixed;left:-10000px;top:0;width:800px;height:480px;overflow:hidden;pointer-events:none'; document.body.appendChild(hold);
    wrap=document.createElement('div'); wrap.style.cssText='position:relative;width:100%;height:100%';
    var host=document.createElement('div'); host.id='bps3d'; host.style.cssText='position:relative;width:100%;height:100%;background:#bfe6f5';
    var lab=document.createElement('div'); lab.id='bps3d-labels'; lab.style.cssText='position:absolute;inset:0;pointer-events:none;overflow:hidden';
    host.appendChild(lab); wrap.appendChild(host); hold.appendChild(wrap); }
  function webgl(){ try{ var c=document.createElement('canvas'); return !!(c.getContext('webgl2')||c.getContext('webgl')); }catch(e){ return false; } }
  function attach(el){ ensure(); (el||hold).appendChild(wrap);
    if(!loaded){ loaded=true; if(!webgl()){ failed=true; window.dispatchEvent(new Event('bps3d-fail')); return; }
      import(new URL('js/bps3d-v2.js',document.baseURI).href).catch(function(e){ failed=true; console.warn('3D không tải được',e); window.dispatchEvent(new Event('bps3d-fail')); }); } }
  function ev(n,d){ window.dispatchEvent(new CustomEvent(n,{detail:d})); }
  window.BPS3D={attach:attach,ev:ev,get failed(){return failed;}};
})();
