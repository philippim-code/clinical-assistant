/* Miracle-Ear Clinical Assistant v1.8.0-dev5 loader */
(function(){
  const SYCLE_URL='https://www.mymiracle-ear.com/freecvs/schedule_hm.php';
  const APP_VERSION='1.8.0-dev5';

  function applyLayoutFixes(){
    const old=document.getElementById('app-layout-fixes');
    if(old)old.remove();
    const style=document.createElement('style');
    style.id='app-layout-fixes';
    style.textContent=`
      #aboutData + .about-grid{margin-top:24px;}

      /* Keep one visual container per Spark component. The outer component/item card
         provides the structure; catalog images no longer sit inside a second bordered card. */
      .ref-component-preview .ref-image-slot.ref-has-catalog-image,
      .ref-accessory-card .ref-image-slot.ref-has-catalog-image,
      .ref-retention-preview .ref-image-slot.ref-has-catalog-image{
        border:0!important;
        border-radius:0!important;
        background:transparent!important;
        padding:0!important;
        box-shadow:none!important;
      }

      /* Retention locks are more useful as a visual three-up selector than a single preview. */
      .ref-retention-gallery-ready > .ref-choice-row,
      .ref-retention-gallery-ready > .ref-selection-summary,
      .ref-retention-gallery-ready > .ref-retention-preview{display:none!important;}
      .ref-retention-gallery{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:14px;}
      .ref-retention-card{position:relative;margin:0!important;padding:12px 12px 10px!important;min-width:0!important;width:100%;border:2px solid var(--border)!important;border-radius:14px!important;background:#fff!important;color:var(--text)!important;box-shadow:none!important;cursor:pointer;transition:transform .12s ease,border-color .12s ease,box-shadow .12s ease;}
      .ref-retention-card:hover{background:#fff!important;color:var(--text)!important;border-color:#b8d9dc!important;transform:translateY(-1px)!important;box-shadow:0 4px 12px rgba(25,58,62,.06)!important;}
      .ref-retention-card.active{border-color:var(--teal)!important;box-shadow:0 5px 16px rgba(0,140,149,.12)!important;transform:translateY(-2px)!important;}
      .ref-retention-card.active:after{content:'✓';position:absolute;right:10px;top:9px;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--teal);color:#fff;font-size:12px;font-weight:900;box-shadow:0 2px 6px rgba(0,0,0,.14);}
      .ref-retention-card img{display:block;width:100%;height:190px;object-fit:contain;filter:none!important;}
      .ref-retention-card strong{display:block;margin-top:7px;text-align:center;font-size:13px;}

      @media(max-width:600px){
        .appbar-actions{display:flex!important;width:100%!important;gap:8px!important;flex-wrap:nowrap!important;}
        .appbar-actions button{display:block!important;flex:1 1 0!important;margin:0!important;min-width:0!important;min-height:44px!important;}
        .ref-retention-gallery{gap:8px;}
        .ref-retention-card{padding:8px 6px!important;}
        .ref-retention-card img{height:125px;}
        .ref-retention-card strong{font-size:12px;}
      }
    `;
    document.head.appendChild(style);
  }

  function installRetentionGallery(){
    const root=document.getElementById('references');
    if(!root)return;
    const section=[...root.querySelectorAll('.ref-section')].find(el=>el.querySelector('h4')?.textContent.trim()==='Retention Locks');
    if(!section)return;

    const originalButtons=[...section.querySelectorAll('[data-retention]')];
    if(originalButtons.length!==3)return;
    section.classList.add('ref-retention-gallery-ready');

    let gallery=section.querySelector('.ref-retention-gallery');
    if(!gallery){
      const names={S:'Small',M:'Medium',L:'Large'};
      const files={S:'IMG_2176.png',M:'IMG_2177.png',L:'IMG_2178.png'};
      gallery=document.createElement('div');
      gallery.className='ref-retention-gallery';
      gallery.setAttribute('aria-label','Retention lock size');
      gallery.innerHTML=['S','M','L'].map(size=>`<button type="button" class="ref-retention-card" data-retention-card="${size}" aria-label="Select ${names[size]} retention lock"><img src="assets/spark/catalog/retention-locks/${files[size]}?v=dev9" alt="${names[size]} Spark retention lock" decoding="async" loading="eager"><strong>${names[size]} (${size})</strong></button>`).join('');
      section.appendChild(gallery);
      gallery.querySelectorAll('[data-retention-card]').forEach(card=>card.addEventListener('click',()=>{
        const target=section.querySelector(`[data-retention="${card.dataset.retentionCard}"]`);
        if(target)target.click();
      }));
    }

    const selected=originalButtons.find(button=>button.classList.contains('active'))?.dataset.retention||'M';
    gallery.querySelectorAll('[data-retention-card]').forEach(card=>{
      const active=card.dataset.retentionCard===selected;
      card.classList.toggle('active',active);
      card.setAttribute('aria-pressed',active?'true':'false');
    });
  }

  function installRetentionGalleryGuard(){
    installRetentionGallery();
    const root=document.getElementById('references');
    if(!root||root.dataset.retentionGalleryGuard==='1')return;
    root.dataset.retentionGalleryGuard='1';
    let queued=false;
    new MutationObserver(()=>{
      if(queued)return;
      queued=true;
      queueMicrotask(()=>{queued=false;installRetentionGallery();});
    }).observe(root,{childList:true,subtree:true});
  }

  function installSycleLaunch(){
    const button=document.querySelector('.sycle-shortcut');
    if(button){button.textContent='Open Sycle';button.removeAttribute('title');}
    window.openSycle=function(){window.location.assign(SYCLE_URL);};
  }

  function setText(el,value){if(el&&el.textContent!==value)el.textContent=value;}

  function applyDisplayVersion(){
    document.querySelectorAll('[data-app-version]').forEach(el=>setText(el,APP_VERSION));
    setText(document.getElementById('aboutVersion'),APP_VERSION);
    const heading=document.querySelector('#aboutWhatsNew h3');
    if(heading)setText(heading,"What's New in v"+APP_VERSION);
    const cards=document.querySelectorAll('#dashboardCards .dashboard-card');
    const versionCard=[...cards].find(card=>card.querySelector('.label')?.textContent.trim()==='Current Version');
    if(versionCard)setText(versionCard.querySelector('.number'),APP_VERSION);
  }

  function installVersionGuard(){
    applyDisplayVersion();
    if(!document.body||document.body.dataset.versionGuardInstalled==='1')return;
    document.body.dataset.versionGuardInstalled='1';
    new MutationObserver(()=>applyDisplayVersion()).observe(document.body,{childList:true,subtree:true});
  }

  function ready(){applyLayoutFixes();installSycleLaunch();installVersionGuard();installRetentionGalleryGuard();}

  function loadReferenceImages(){
    if(document.querySelector('script[data-reference-images-loader]'))return;
    const images=document.createElement('script');
    images.src='js/reference-images.js?v=dev5';
    images.async=false;
    images.dataset.referenceImagesLoader='1';
    images.onload=function(){applyDisplayVersion();installRetentionGalleryGuard();};
    document.body.appendChild(images);
  }

  function loadReferences(){
    if(document.querySelector('script[data-references-loader]'))return;
    const ref=document.createElement('script');
    ref.src='js/references.js?v=dev5';
    ref.async=false;
    ref.dataset.referencesLoader='1';
    ref.onload=function(){loadReferenceImages();applyDisplayVersion();installRetentionGalleryGuard();};
    document.body.appendChild(ref);
  }

  function loadSequentially(){
    const core=document.createElement('script');
    core.src='js/app-core.js';
    core.async=false;
    core.onload=function(){
      const patch=document.createElement('script');
      patch.src='js/smart-notes.js';
      patch.async=false;
      patch.onload=function(){ready();loadReferences();};
      document.body.appendChild(patch);
    };
    document.body.appendChild(core);
  }

  applyLayoutFixes();

  if(document.readyState==='loading'){
    document.write('<script src="js/app-core.js"><\/script><script src="js/smart-notes.js"><\/script><script src="js/references.js?v=dev5"><\/script><script src="js/reference-images.js?v=dev5"><\/script>');
    document.addEventListener('DOMContentLoaded',ready,{once:true});
  }else{
    loadSequentially();
  }

  window.addEventListener('pageshow',function(){installSycleLaunch();applyDisplayVersion();installRetentionGalleryGuard();});
})();
