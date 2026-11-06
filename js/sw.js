// 极简版 Service Worker (专用于测试环境，防止缓存导致代码不更新)
self.addEventListener('install', (event) => {
  // 强制立即激活，跳过等待
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // 激活后立即接管所有页面
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // 什么都不拦截，所有网络请求直接走浏览器默认行为
  // 这样你每次改代码，手机上刷新都能拿到最新的
});
