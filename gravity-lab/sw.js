/* Gravity Lab đã chuyển về kho riêng (https://thuyhuongctu.github.io/Gravity-Lab/).
 * Service worker này thay bản cũ để dọn bộ nhớ đệm "gl-*" của nó trên bizonland.com
 * rồi tự gỡ, để /gravity-lab/ không còn phục vụ bản sao cũ. */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keys) { return Promise.all(keys.filter(function (k) { return k.indexOf('gl-') === 0; }).map(function (k) { return caches.delete(k); })); })
      .then(function () { return self.registration.unregister(); })
      .then(function () { return self.clients.matchAll({ type: 'window' }); })
      .then(function (list) { list.forEach(function (c) { c.navigate(c.url); }); })
  );
});
