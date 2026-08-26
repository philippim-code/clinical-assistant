/* Miracle-Ear Clinical Assistant v1.8.0-dev7 loader */
(function(){
  const SYCLE_URL='https://www.mymiracle-ear.com/freecvs/schedule_hm.php';
  const APP_VERSION='1.8.0-dev7';
  let receiverMode='right';
  let receiverSyncing=false;
  let receiverInitialized=false;
  const receiverSelections={left:{power:'M',length:'0'},right:{power:'M',length:'0'}};

  function applyLayoutFixes(){
    const old=document.getElementById('app-layout-fixes');if(old)old.remove();
    const style=document.createElement('style');style.id='app-layout-fixes';style.textContent=`
      #aboutData + .about-grid{margin-top:24px;}
      .ref-component-preview .ref-image-slot.ref-has-catalog-image,.ref-accessory-card .ref-image-slot.ref-has-catalog-image,.ref-retention-preview .ref-image-slot.ref-has-catalog-image{border:0!important;border-radius:0!important;background:transparent!important;padding:0!important;box-shadow:none!important;}
      .ref-retention-gallery-ready > .ref-choice-row,.ref-retention-gallery-ready > .ref-selection-summary,.ref-retention-gallery-ready > .ref-retention-preview{display:none!important;}
      .ref-retention-gallery{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:14px;}
      .ref-retention-card{position:relative;margin:0!important;padding:12px 12px 10px!important;min-width:0!important;width:100%;border:2px solid var(--border)!important;border-radius:14px!important;background:#fff!important;color:var(--text)!important;box-shadow:none!important;cursor:pointer;transition:transform .12s ease,border-color .12s ease,box-shadow .12s ease;}
      .ref-retention-card:hover{background:#fff!important;color:var(--text)!important;border-color:#b8d9dc!important;transform:translateY(-1px)!important;box-shadow:0 4px 12px rgba(25,58,62,.06)!important;}
      .ref-retention-card.active{border-color:var(--teal)!important;box-shadow:0 5px 16px rgba(0,140,149,.12)!important;transform:translateY(-2px)!important;}
      .ref-retention-card.active:after{content:'✓';position:absolute;right:10px;top:9px;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--teal);color:#fff;font-size:12px;font-weight:900;box-shadow:0 2px 6px rgba(0,0,0,.14);}
      .ref-retention-card img{display:block;width:100%;height:190px;object-fit:contain;filter:none!important;}.ref-retention-card strong{display:block;margin-top:7px;text-align:center;font-size:13px;}
      .ref-bilateral-preview{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;height:230px;align-items:center;overflow:hidden;margin:0 0 12px;}
      .ref-bilateral-preview img{width:100%;height:100%;min-width:0;object-fit:contain;display:block;filter:none!important;}
      .ref-component-preview.ref-bilateral-ready .ref-image-slot{display:none!important;}.ref-component-preview:not(.ref-bilateral-ready) .ref-bilateral-preview{display:none!important;}
      .ref-component-preview.ref-bilateral-ready .ref-selection-summary{position:static!important;inset:auto!important;transform:none!important;margin:0!important;z-index:2!important;clear:both!important;display:block!important;}
      .ref-component-preview.ref-bilateral-ready{overflow:hidden;display:flex;flex-direction:column;}
      @media(max-width:600px){.appbar-actions{display:flex!important;width:100%!important;gap:8px!important;flex-wrap:nowrap!important;}.appbar-actions button{display:block!important;flex:1 1 0!important;margin:0!important;min-width:0!important;min-height:44px!important;}.ref-retention-gallery{gap:8px;}.ref-retention-card{padding:8px 6px!important;}.ref-retention-card img{height:125px;}.ref-retention-card strong{font-size:12px;}.ref-bilateral-preview{height:190px;gap:8px;margin-bottom:10px;}}
    `;document.head.appendChild(style);
  }

  function referenceSection(title){const root=document.getElementById('references');if(!root)return null;return [...root.querySelectorAll('.ref-section')].find(el=>el.querySelector('h4')?.textContent.trim()===title)||null;}

  function installRetentionGallery(){
    const section=referenceSection('Retention Locks');if(!section)return;
    const originalButtons=[...section.querySelectorAll('[data-retention]')];if(originalButtons.length!==3)return;section.classList.add('ref-retention-gallery-ready');
    let gallery=section.querySelector('.ref-retention-gallery');
    if(!gallery){const names={S:'Small',M:'Medium',L:'Large'},files={S:'IMG_2176.png',M:'IMG_2177.png',L:'IMG_2178.png'};gallery=document.createElement('div');gallery.className='ref-retention-gallery';gallery.setAttribute('aria-label','Retention lock size');gallery.innerHTML=['S','M','L'].map(size=>`<button type="button" class="ref-retention-card" data-retention-card="${size}" aria-label="Select ${names[size]} retention lock"><img src="assets/spark/catalog/retention-locks/${files[size]}?v=dev10" alt="${names[size]} Spark retention lock" decoding="async" loading="eager"><strong>${names[size]} (${size})</strong></button>`).join('');section.appendChild(gallery);gallery.querySelectorAll('[data-retention-card]').forEach(card=>card.addEventListener('click',()=>{const target=section.querySelector(`[data-retention="${card.dataset.retentionCard}"]`);if(target)target.click();}));}
    const selected=originalButtons.find(button=>button.classList.contains('active'))?.dataset.retention||'M';gallery.querySelectorAll('[data-retention-card]').forEach(card=>{const active=card.dataset.retentionCard===selected;card.classList.toggle('active',active);card.setAttribute('aria-pressed',active?'true':'false');});
  }

  function receiverAsset(side,length,power){return `assets/spark/catalog/receivers/${side}-${length}-${power}.png?v=dev10`;}
  function receiverEarLabel(ear){const s=receiverSelections[ear];return `${s.length}${s.power} ${ear==='left'?'Left (Blue)':'Right (Red)'}`;}
  function receiverConfigurationLabel(){return `${receiverEarLabel('left')} + ${receiverEarLabel('right')}`;}
  function currentReceiverButtons(section){return {power:section?.querySelector('[data-receiver-power].active')?.dataset.receiverPower||'M',length:section?.querySelector('[data-receiver-length].active')?.dataset.receiverLength||'0'};}
  function clickReceiverChoice(section,attribute,value){const button=section?.querySelector(`[${attribute}="${value}"]`);if(button&&!button.classList.contains('active'))button.click();}

  function restoreReceiverEar(ear){
    if(receiverSyncing)return;const desired=receiverSelections[ear];receiverSyncing=true;
    try{let live=referenceSection('Receivers');clickReceiverChoice(live,'data-receiver-power',desired.power);live=referenceSection('Receivers');clickReceiverChoice(live,'data-receiver-length',desired.length);}finally{receiverSyncing=false;}
  }

  function updateReceiverConfigText(){
    const config=document.querySelector('#references .ref-config-value');if(!config)return;const bilateral=receiverConfigurationLabel();
    const pattern=/\b(?:00|0|1|2|3)(?:S|M|P)\s+(?:Left \(Blue\)|Right \(Red\)|Both \(Blue \+ Red\))(?:\s*\+\s*(?:00|0|1|2|3)(?:S|M|P)\s+(?:Left \(Blue\)|Right \(Red\)))?/;
    if(pattern.test(config.textContent)){const updated=config.textContent.replace(pattern,bilateral);if(updated!==config.textContent)config.textContent=updated;}
  }

  function renderReceiverPreview(section){
    const preview=section?.querySelector('.ref-component-preview');if(!preview)return;const summary=preview.querySelector('.ref-selection-summary strong');let dual=preview.querySelector('.ref-bilateral-preview');
    if(!dual){dual=document.createElement('div');dual.className='ref-bilateral-preview';const slot=preview.querySelector('.ref-image-slot');if(slot)slot.insertAdjacentElement('afterend',dual);else preview.prepend(dual);}
    const left=receiverSelections.left,right=receiverSelections.right,key=`${left.length}-${left.power}|${right.length}-${right.power}`;
    if(dual.dataset.receiverKey!==key){dual.dataset.receiverKey=key;dual.innerHTML=`<img src="${receiverAsset('L',left.length,left.power)}" alt="${receiverEarLabel('left')} Spark receiver" decoding="async" loading="eager"><img src="${receiverAsset('R',right.length,right.power)}" alt="${receiverEarLabel('right')} Spark receiver" decoding="async" loading="eager">`;}
    const both=receiverMode==='both';preview.classList.toggle('ref-bilateral-ready',both);if(summary&&both)summary.textContent=receiverConfigurationLabel();updateReceiverConfigText();
  }

  function installBilateralReceiver(){
    const section=referenceSection('Receivers');if(!section)return;const firstSide=section.querySelector('[data-receiver-side]'),sideRow=firstSide?.parentElement;if(!sideRow)return;
    const originalSides=[...sideRow.querySelectorAll('[data-receiver-side]')];
    if(!receiverInitialized){const current=currentReceiverButtons(section),activeSide=originalSides.find(button=>button.classList.contains('active'))?.dataset.receiverSide||'right';receiverSelections[activeSide]={...current};receiverMode=activeSide;receiverInitialized=true;}

    let both=sideRow.querySelector('[data-receiver-both]');
    if(!both){both=document.createElement('button');both.type='button';both.className='ref-choice';both.dataset.receiverBoth='true';both.textContent='🔵🔴 Both';both.addEventListener('click',()=>{if(receiverSyncing)return;const live=referenceSection('Receivers');const activeSide=live?.querySelector('[data-receiver-side].active')?.dataset.receiverSide;if(activeSide==='left'||activeSide==='right')receiverSelections[activeSide]={...currentReceiverButtons(live)};receiverMode='both';installBilateralReceiver();});sideRow.appendChild(both);}

    originalSides.forEach(button=>{if(button.dataset.independentReceiverListener==='1')return;button.dataset.independentReceiverListener='1';button.addEventListener('click',()=>{if(receiverSyncing)return;const ear=button.dataset.receiverSide;if(ear!=='left'&&ear!=='right')return;receiverMode=ear;queueMicrotask(()=>{restoreReceiverEar(ear);installBilateralReceiver();});});});

    section.querySelectorAll('[data-receiver-power],[data-receiver-length]').forEach(button=>{if(button.dataset.independentReceiverValueListener==='1')return;button.dataset.independentReceiverValueListener='1';button.addEventListener('click',()=>{if(receiverSyncing)return;queueMicrotask(()=>{const live=referenceSection('Receivers'),current=currentReceiverButtons(live);if(receiverMode==='both'){receiverSelections.left={...current};receiverSelections.right={...current};}else if(receiverMode==='left'||receiverMode==='right'){receiverSelections[receiverMode]={...current};}installBilateralReceiver();});});});

    const liveBoth=sideRow.querySelector('[data-receiver-both]');liveBoth?.classList.toggle('active',receiverMode==='both');liveBoth?.setAttribute('aria-pressed',receiverMode==='both'?'true':'false');
    if(receiverMode==='both')originalSides.forEach(button=>button.classList.remove('active'));
    renderReceiverPreview(section);
  }

  function installReferenceEnhancements(){installRetentionGallery();installBilateralReceiver();}
  function installReferenceEnhancementGuard(){installReferenceEnhancements();const root=document.getElementById('references');if(!root||root.dataset.referenceEnhancementGuard==='1')return;root.dataset.referenceEnhancementGuard='1';let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;installReferenceEnhancements();});}).observe(root,{childList:true,subtree:true});}
  function installSycleLaunch(){const button=document.querySelector('.sycle-shortcut');if(button){button.textContent='Open Sycle';button.removeAttribute('title');}window.openSycle=function(){window.location.assign(SYCLE_URL);};}
  function setText(el,value){if(el&&el.textContent!==value)el.textContent=value;}
  function applyDisplayVersion(){document.querySelectorAll('[data-app-version]').forEach(el=>setText(el,APP_VERSION));setText(document.getElementById('aboutVersion'),APP_VERSION);const heading=document.querySelector('#aboutWhatsNew h3');if(heading)setText(heading,"What's New in v"+APP_VERSION);const cards=document.querySelectorAll('#dashboardCards .dashboard-card');const versionCard=[...cards].find(card=>card.querySelector('.label')?.textContent.trim()==='Current Version');if(versionCard)setText(versionCard.querySelector('.number'),APP_VERSION);}
  function installVersionGuard(){applyDisplayVersion();if(!document.body||document.body.dataset.versionGuardInstalled==='1')return;document.body.dataset.versionGuardInstalled='1';new MutationObserver(()=>applyDisplayVersion()).observe(document.body,{childList:true,subtree:true});}
  function ready(){applyLayoutFixes();installSycleLaunch();installVersionGuard();installReferenceEnhancementGuard();}
  function loadReferenceImages(){if(document.querySelector('script[data-reference-images-loader]'))return;const images=document.createElement('script');images.src='js/reference-images.js?v=dev7';images.async=false;images.dataset.referenceImagesLoader='1';images.onload=function(){applyDisplayVersion();installReferenceEnhancementGuard();};document.body.appendChild(images);}
  function loadReferences(){if(document.querySelector('script[data-references-loader]'))return;const ref=document.createElement('script');ref.src='js/references.js?v=dev7';ref.async=false;ref.dataset.referencesLoader='1';ref.onload=function(){loadReferenceImages();applyDisplayVersion();installReferenceEnhancementGuard();};document.body.appendChild(ref);}
  function loadSequentially(){const core=document.createElement('script');core.src='js/app-core.js';core.async=false;core.onload=function(){const patch=document.createElement('script');patch.src='js/smart-notes.js';patch.async=false;patch.onload=function(){ready();loadReferences();};document.body.appendChild(patch);};document.body.appendChild(core);}

  applyLayoutFixes();
  if(document.readyState==='loading'){document.write('<script src="js/app-core.js"><\/script><script src="js/smart-notes.js"><\/script><script src="js/references.js?v=dev7"><\/script><script src="js/reference-images.js?v=dev7"><\/script>');document.addEventListener('DOMContentLoaded',ready,{once:true});}else{loadSequentially();}
  window.addEventListener('pageshow',function(){installSycleLaunch();applyDisplayVersion();installReferenceEnhancementGuard();});
})();