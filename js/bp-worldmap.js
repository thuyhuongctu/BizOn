/* BizOn — Bản đồ thế giới cho Hộ Chiếu Thương Hiệu 3D (d3-geo + Natural Earth, world-atlas 110m).
 * BPWorldMap.render(el, data) – data: { home:{id,lon,lat,flag,label}, hosts:[{m,label,lon,lat,iso,entered,modeIcon,rival,know,free,cd,tip}], T }
 * Cần d3 v7 + topojson-client (thẻ script trong <head>). Không có mạng thì hiện thông báo thay bản đồ. */
(function () {
  var URL_ATLAS = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json';
  var atlasP = null;
  function atlas() {
    if (!atlasP) atlasP = fetch(URL_ATLAS).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (t) { return topojson.feature(t, t.objects.countries); })
      .catch(function (e) { atlasP = null; throw e; });
    return atlasP;
  }
  var ISO = { vn: '704', th: '764', my: '458', ph: '608', cn: '156', in: '356', us: '840', de: '276', kr: '410', nz: '554', jp: '392', sg: '702', id: '360' };

  function render(el, d) {
    if (!el) return;
    var T = d.T || function (a) { return a; };
    if (!window.d3 || !window.topojson) { el.innerHTML = '<p style="margin:0;padding:14px;font-size:12px;opacity:.6">' + T('Cần kết nối mạng để tải bản đồ thế giới.', 'An internet connection is needed to load the world map.') + '</p>'; return; }
    var W = 960, H = 440;
    atlas().then(function (world) {
      var proj = d3.geoNaturalEarth1().rotate([-60, 0]).fitExtent([[8, 8], [W - 8, H - 8]], { type: 'Sphere' });
      var path = d3.geoPath(proj);
      var hostIso = {}; d.hosts.forEach(function (h) { hostIso[ISO[h.iso]] = h; });
      var homeIso = ISO[d.home.id];
      var svg = d3.create('svg').attr('viewBox', '0 0 ' + W + ' ' + H).attr('role', 'img')
        .attr('aria-label', T('Bản đồ thế giới: quốc gia của bạn và 7 thị trường', 'World map: your home country and 7 markets'))
        .style('width', '100%').style('height', 'auto').style('display', 'block').style('font-family', 'inherit');
      svg.append('path').attr('d', path({ type: 'Sphere' })).attr('fill', '#e8f3f6');
      svg.append('path').attr('d', path(d3.geoGraticule10())).attr('fill', 'none').attr('stroke', '#d3e6eb').attr('stroke-width', 0.5);
      svg.append('g').selectAll('path').data(world.features).join('path').attr('d', path)
        .attr('fill', function (f) { if (f.id === homeIso) return '#fda127'; var h = hostIso[f.id]; if (!h) return '#dde6e3'; return h.entered ? '#2f8a8c' : '#a9ccd2'; })
        .attr('stroke', '#fff').attr('stroke-width', 0.5)
        .style('cursor', function (f) { return d.onPick && hostIso[f.id] ? 'pointer' : null; })
        .on('click', function (e, f) { var h = hostIso[f.id]; if (h && d.onPick) d.onPick(h.m); })
        .append('title').text(function (f) { var h = hostIso[f.id]; return h ? h.tip : f.id === homeIso ? d.home.label : (f.properties && f.properties.name) || ''; });
      // Tuyến thương mại home → host (đường tròn lớn)
      var g = svg.append('g');
      d.hosts.forEach(function (h) {
        g.append('path').attr('d', path({ type: 'LineString', coordinates: [[d.home.lon, d.home.lat], [h.lon, h.lat]] }))
          .attr('fill', 'none').attr('stroke', h.free ? '#2f8a8c' : '#e8762d').attr('stroke-width', h.entered ? 2.4 : 1.2)
          .attr('stroke-dasharray', h.entered ? null : '4 4').attr('opacity', h.entered ? 0.95 : 0.7);
      });
      var hp = proj([d.home.lon, d.home.lat]);
      svg.append('circle').attr('cx', hp[0]).attr('cy', hp[1]).attr('r', 6).attr('fill', '#fda127').attr('stroke', '#033337').attr('stroke-width', 2);
      svg.append('text').attr('x', hp[0]).attr('y', hp[1] + 20).attr('text-anchor', 'middle').attr('font-size', 13).attr('font-weight', 800).attr('fill', '#033337')
        .attr('paint-order', 'stroke').attr('stroke', '#fff').attr('stroke-width', 3).text(d.home.flag + ' ' + d.home.label);
      d.hosts.forEach(function (h) {
        var p = proj([h.lon, h.lat]); if (!p) return;
        var n = svg.append('g').attr('transform', 'translate(' + p[0] + ',' + p[1] + ')').style('cursor', d.onPick ? 'pointer' : 'default');
        if (d.onPick) n.on('click', function () { d.onPick(h.m); });
        n.append('title').text(h.tip);
        n.append('circle').attr('r', h.entered ? 7 : 5).attr('fill', h.entered ? '#2f8a8c' : '#fff').attr('stroke', '#033337').attr('stroke-width', 1.6);
        if (h.rival) n.append('circle').attr('r', 11).attr('fill', 'none').attr('stroke', '#c0443a').attr('stroke-width', 2).attr('stroke-dasharray', '3 2');
        var near = Math.hypot(p[0] - hp[0], p[1] - hp[1]) < 70, idx = d.hosts.indexOf(h);
        var dy = h.lat < -20 ? 22 : near ? (idx % 2 ? 26 : -14) : -12, dx = near ? (p[0] < hp[0] ? -34 : 34) : 0;
        n.append('text').attr('x', dx).attr('y', dy).attr('text-anchor', near ? (dx < 0 ? 'end' : 'start') : 'middle').attr('font-size', 12.5).attr('font-weight', 800).attr('fill', '#033337')
          .attr('paint-order', 'stroke').attr('stroke', '#fff').attr('stroke-width', 3).text((h.entered ? h.modeIcon + ' ' : '') + h.flag + ' ' + h.label);
        if (!near || d.big) n.append('text').attr('x', dx).attr('y', dy + (dy < 0 ? -14 : 14)).attr('text-anchor', near ? (dx < 0 ? 'end' : 'start') : 'middle').attr('font-size', 10.5).attr('font-weight', 700).attr('fill', '#335a5e')
          .attr('paint-order', 'stroke').attr('stroke', '#fff').attr('stroke-width', 3).text(T('tri thức ', 'intel ') + h.know + '% · CD ' + h.cd);
      });
      el.innerHTML = '';
      el.appendChild(svg.node());
      var lg = document.createElement('div');
      lg.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px 14px;padding:6px 10px 2px;font-size:11px;color:#335a5e';
      var sw = function (c, t, line) { return '<span style="display:flex;gap:5px;align-items:center"><i style="display:inline-block;width:' + (line ? '18px;height:0;border-top:2px ' + line + ' ' + c : '11px;height:11px;border-radius:3px;background:' + c) + '"></i>' + t + '</span>'; };
      lg.innerHTML = sw('#fda127', T('Quốc gia của bạn', 'Your home country')) + sw('#2f8a8c', T('Đã thâm nhập', 'Entered')) + sw('#a9ccd2', T('Chưa thâm nhập', 'Not entered')) +
        sw('#2f8a8c', T('Có FTA', 'FTA in force'), 'solid') + sw('#e8762d', T('Không FTA', 'No FTA'), 'solid') +
        '<span style="display:flex;gap:5px;align-items:center"><i style="display:inline-block;width:11px;height:11px;border-radius:50%;border:2px dashed #c0443a"></i>' + T('Đối thủ Kim Long có mặt', 'Rival Kim Long present') + '</span>' +
        '<span style="opacity:.7">CD = ' + T('khoảng cách văn hoá (Kogut & Singh, 1988)', 'cultural distance (Kogut & Singh, 1988)') + ' · Natural Earth</span>';
      el.appendChild(lg);
    }).catch(function () {
      el.innerHTML = '<p style="margin:0;padding:14px;font-size:12px;opacity:.6">' + T('Không tải được dữ liệu bản đồ – kiểm tra kết nối mạng.', 'Could not load the map data – check your connection.') + '</p>';
    });
  }
  window.BPWorldMap = { render: render };
})();
