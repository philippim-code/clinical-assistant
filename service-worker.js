const CACHE_NAME='clinical-assistant-v1.7.0-dev1';
const APP_ASSETS=[
  './index.html',
  './css/styles.css',
  './js/app.js',
  './js/app-core.js',
  './js/smart-notes.js',
  './manifest.json',
  './clinical-assistant-icon-v2.png',
  './icon-192.png',
  './icon-512.png',
  './favicon-16x16.png',
  './favicon-24x24.png',
  './favicon-32x32.png',
  './favicon-48x48.png',
  './favicon-64x64.png',
  './favicon.ico',
  './logo.ico',
  './logo.png',
  './icon-master.png',
  './miracle-ear-logo-original.png',
  './assets/logo.png',
  './assets/favicon.ico',
  './assets/favicon-16x16.png',
  './assets/favicon-24x24.png',
  './assets/favicon-32x32.png',
  './assets/favicon-48x48.png',
  './assets/favicon-64x64.png',
  './assets/icon-192.png',
  './assets/icon-512.png'
];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(APP_ASSETS)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE_NAME).then(c=>c.put(e.request,copy));return r;}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));});
