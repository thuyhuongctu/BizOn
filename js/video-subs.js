/* Phụ đề VI/EN (WebVTT) cho video giới thiệu và trailer – tệp ở assets/video/subs/<tên video>.<vi|en>.vtt
   (tên bỏ đuôi -720p để bản 720p và bản gốc dùng chung). Phụ đề tự bật khi tiếng trong video khác ngôn ngữ giao diện
   (giao diện tiếng Việt xem trailer tiếng Anh thì thấy phụ đề tiếng Việt); cùng ngôn ngữ thì để tắt, người xem bật bằng
   nút CC của trình phát. Video hướng dẫn dạng dọc đã có phụ đề in sẵn trên hình và bản riêng cho từng ngôn ngữ nên không cần. */
(function(){
  var AUDIO = {
    'bizon-intro-en-v3': 'en', 'bizon-intro-vi-v4': 'vi',
    'ben-phu-sa-trailer-v2': 'en', 'bizon-trailer-v3': 'en', 'bp-trailer-v2': 'en', 'srp-trailer': 'en', 'gravity-lab-trailer': 'en'
  };
  var LABEL = { vi: 'Tiếng Việt', en: 'English' };
  function attach(v, mp4, ui){
    Array.prototype.slice.call(v.querySelectorAll('track')).forEach(function(t){ v.removeChild(t); });
    var base = String(mp4 || '').replace(/^.*\//, '').replace(/(-720p)?\.mp4$/, ''), audio = AUDIO[base];
    if(!audio) return;
    ui = ui === 'vi' ? 'vi' : 'en';
    ['vi', 'en'].forEach(function(l){
      var t = document.createElement('track');
      t.kind = 'subtitles'; t.srclang = l; t.label = LABEL[l]; t.src = 'assets/video/subs/' + base + '.' + l + '.vtt';
      if(l === ui && l !== audio) t.default = true;
      v.appendChild(t);
    });
    function apply(){
      for(var i = 0; i < v.textTracks.length; i++){
        var tt = v.textTracks[i], m = (tt.language === ui && ui !== audio) ? 'showing' : 'disabled';
        if(tt.mode !== m) tt.mode = m;
      }
    }
    apply();
    /* Sau v.load(), Chrome tự chọn thêm phụ đề theo ngôn ngữ trình duyệt; giữ đúng lựa chọn trong 1,5 giây đầu,
       sau đó người xem tự bật/tắt bằng nút CC. */
    var until = Date.now() + 1500;
    if(v._subsGuard) v.textTracks.removeEventListener('change', v._subsGuard);
    v._subsGuard = function(){ if(Date.now() > until){ v.textTracks.removeEventListener('change', v._subsGuard); v._subsGuard = null; } else apply(); };
    v.textTracks.addEventListener('change', v._subsGuard);
  }
  window.BizOnSubs = { attach: attach, audio: AUDIO };
})();
