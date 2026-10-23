/* BizOn – sw-bizon.js: ĐÃ NGỪNG (10/2026). Trước đây BizOn Game 3D và Trang Giảng Viên đăng ký service worker này
 * trong khi js/site-ui.js đăng ký sw.js, cùng phạm vi gốc, nên mỗi lần tải trang
 * service worker bị thay qua lại và trang tự tải lại liên tục. Nay cả trang chỉ dùng sw.js.
 * Tệp này còn lại cho trình duyệt đang giữ trang cũ: kích hoạt xong thì xoá cache
 * 'bizon-3d*' của mình và tự gỡ đăng ký; trang kế tiếp sẽ đăng ký lại sw.js.
 * Không có trình xử lý fetch nên mọi yêu cầu đi thẳng ra mạng. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('bizon-3d')).map(k => caches.delete(k)));
    await self.registration.unregister();
  })());
});
