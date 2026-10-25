/* BizOn Bật Nghiệp · giao diện mới — chuyển động cho danh sách (thị phần, lời khuyên Lumina, các vòng đã chơi).
 *
 * bn2-ui.js vẽ lại cả trang bằng innerHTML, nên mọi nút đều là nút mới và không có gì để «chuyển động».
 * Ở đây giữ lại các khung có data-aa giữa hai lần vẽ: sau khi vẽ, gắn khung CŨ trở lại chỗ khung mới rồi
 * đồng bộ từng con theo data-k (giữ nút cũ, thêm nút mới, bỏ nút thừa, xếp lại thứ tự). auto-animate
 * (vendor/auto-animate, MIT) thấy được thêm/bớt/đổi chỗ thật nên tạo hiệu ứng. Thanh .bn2-bar i được giữ
 * độ rộng cũ một nhịp rồi mới đặt độ rộng mới, để CSS transition chạy.
 * Chỉ đổi cách hiển thị: không đọc, không ghi trạng thái ván. Thiếu auto-animate thì vẫn đồng bộ, chỉ không có hiệu ứng.
 */
(function () {
  'use strict';
  const bars = el => { const m = new Map(); el.querySelectorAll('[data-k]').forEach(k => { const b = k.querySelector('.bn2-bar i'); if (b) m.set(k.dataset.k, b.style.width); }); return m; };

  function before(root) {
    const keep = new Map();
    root.querySelectorAll('[data-aa]').forEach(c => keep.set(c.dataset.aa, { node: c, w: bars(c) }));
    return keep;
  }

  function watch(node) {
    if (node.__aa || typeof window.autoAnimate !== 'function') return;
    try { window.autoAnimate(node, { duration: 320 }); node.__aa = true; } catch (e) { /* không có hiệu ứng thì thôi */ }
  }

  // hold: tên các khung tạm giữ nguyên nội dung cũ (vd. khi hộp báo cáo vòng đang phủ lên trang – đổi lúc ấy thì
  // hiệu ứng chạy sau lớp phủ, không ai thấy; để lần vẽ sau, khi đóng hộp, mới đổi và trượt trước mắt người chơi).
  function after(root, keep, hold) {
    root.querySelectorAll('[data-aa]').forEach(fresh => {
      const old = keep && keep.get(fresh.dataset.aa);
      if (!old) { watch(fresh); return; }
      const box = old.node;
      fresh.replaceWith(box);
      if (hold && hold.includes(fresh.dataset.aa)) { watch(box); return; }                                // gắn lại trước rồi mới đổi con: auto-animate đo vị trí trong trang
      Array.from(fresh.attributes).forEach(a => { if (box.getAttribute(a.name) !== a.value) box.setAttribute(a.name, a.value); });
      const byKey = new Map(Array.from(box.children).filter(n => n.dataset && n.dataset.k).map(n => [n.dataset.k, n]));
      const want = Array.from(fresh.children);
      const slide = [];
      want.forEach((n, i) => {
        const k = n.dataset && n.dataset.k;
        let use = k && byKey.get(k);
        if (use) {
          byKey.delete(k);
          if (use.outerHTML !== n.outerHTML) {
            Array.from(n.attributes).forEach(a => use.setAttribute(a.name, a.value));
            use.innerHTML = n.innerHTML;
            const b = use.querySelector('.bn2-bar i'), w0 = old.w.get(k);
            if (b && w0 && w0 !== b.style.width) { const w1 = b.style.width; b.style.width = w0; slide.push([b, w1]); }
          }
        } else use = n;
        if (box.children[i] !== use) box.insertBefore(use, box.children[i] || null);
      });
      byKey.forEach(n => n.remove());
      Array.from(box.children).slice(want.length).forEach(n => { if (!want.includes(n)) n.remove(); });
      if (slide.length) requestAnimationFrame(() => requestAnimationFrame(() => slide.forEach(([b, w]) => { b.style.width = w; })));
      watch(box);
    });
  }

  window.BN2Motion = { before, after };
})();
