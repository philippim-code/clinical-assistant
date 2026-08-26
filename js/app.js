/* Miracle-Ear Clinical Assistant v1.8.0-dev4 loader */
(function(){
  const SYCLE_URL='https://www.mymiracle-ear.com/freecvs/schedule_hm.php';
  const APP_VERSION='1.8.0-dev4';

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

      @media(max-width:600px){
        .appbar-actions{display:flex!important;width:100%!important;gap:8px!important;flex-wrap:nowrap!important;}
        .appbar-actions button{display:block!important;flex:1 1 0!important;margin:0!important;min-width:0!important;min-height:44px!important;}
      }
    `;
    document.head.appendChild(style);
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

  function ready(){applyLayoutFixes();installSycleLaunch();installVersionGuard();}

  function loadReferenceImages(){
    if(document.querySelector('script[data-reference-images-loader]'))return;
    const images=document.createElement('script');
    images.src='js/reference-images.js?v=dev4';
    images.async=false;
    images.dataset.referenceImagesLoader='1';
    images.onload=applyDisplayVersion;
    document.body.appendChild(images);
  }

  function loadReferences(){
    if(document.querySelector('script[data-references-loader]'))return;
    const ref=document.createElement('script');
    ref.src='js/references.js?v=dev4';
    ref.async=false;
    ref.dataset.referencesLoader='1';
    ref.onload=function(){loadReferenceImages();applyDisplayVersion();};
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
    document.write('<script src="js/app-core.js"><\/script><script src="js/smart-notes.js"><\/script><script src="js/references.js?v=dev4"><\/script><script src="js/reference-images.js?v=dev4"><\/script>');
    document.addEventListener('DOMContentLoaded',ready,{once:true});
  }else{
    loadSequentially();
  }

  window.addEventListener('pageshow',function(){installSycleLaunch();applyDisplayVersion();});
})();
