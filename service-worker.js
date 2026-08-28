const CACHE_NAME='clinical-assistant-v1.8.0-dev19';
const APP_ASSETS=[
  './index.html',
  './css/styles.css',
  './js/version.js?v=dev19',
  './js/app-core.js?v=dev19',
  './js/smart-notes.js?v=dev19',
  './js/references.js?v=dev19',
  './js/reference-images.js?v=dev19',
  './js/app-enhancements.js?v=dev19',
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

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  event.respondWith(
    fetch(event.request,{cache:'no-store'}).then(response=>{
      if(response&&response.ok){
        const copy=response.clone();
        caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));
      }
      return response;
    }).catch(()=>caches.match(event.request).then(cached=>cached||caches.match('./index.html')))
  );
});
