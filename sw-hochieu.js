/* BizOn – sw-hochieu.js: ĐÃ NGỪNG (10/2026). Trước đây Hộ Chiếu Thương Hiệu 3D và Phố Thị Trường 3D đăng ký service worker này
 * trong khi js/site-ui.js đăng ký sw.js, cùng phạm vi gốc, nên mỗi lần tải trang
 * service worker bị thay qua lại và trang tự tải lại liên tục. Nay cả trang chỉ dùng sw.js.
 * Tệp này còn lại cho trình duyệt đang giữ trang cũ: kích hoạt xong thì xoá cache
 * 'bizon-hochieu*' của mình và tự gỡ đăng ký; trang kế tiếp sẽ đăng ký lại sw.js.
 * Không có trình xử lý fetch nên mọi yêu cầu đi thẳng ra mạng. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('bizon-hochieu')).map(k => caches.delete(k)));
    await self.registration.unregister();
  })());
});
