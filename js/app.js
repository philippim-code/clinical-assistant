/* Miracle-Ear Clinical Assistant v1.8.0-dev10 loader */
(function(){
  const SYCLE_URL='https://www.mymiracle-ear.com/freecvs/schedule_hm.php';
  const APP_VERSION='1.8.0-dev10';
  let receiverMode='right',receiverSyncing=false,receiverInitialized=false;
  const receiverSelections={left:{power:'M',length:'0'},right:{power:'M',length:'0'}};
  const solutionNames={5:'Premium',4:'Advanced',3:'Standard',2:'Essential'};
  const sparkFeatures={
    ai:{
      5:['AutoSense OS premium','Adaptive Phonak Digital 3.0','Spheric speech clarity','SpeechSensor','Speech enhancer','Health functionalities','Dynamic noise cancellation','StereoZoom 2.0','Speech in car','SoundRecover2','SoundRelax','Tap control','Motion sensor hearing','WindBlock','RogerDirect','Water resistant'],
      4:['AutoSense OS advanced','Adaptive Phonak Digital 3.0','Spheric speech clarity','SpeechSensor','Health functionalities','Dynamic noise cancellation','StereoZoom 2.0','Speech in car','SoundRecover2','SoundRelax','Tap control','Motion sensor hearing','WindBlock','RogerDirect','Water resistant']
    },
    standard:{
      5:['AutoSense OS premium','Adaptive Phonak Digital 3.0','SpeechSensor','Speech enhancer','Health functionalities','Dynamic noise cancellation','StereoZoom 2.0','Speech in car','SoundRecover2','SoundRelax','Tap control','Motion sensor hearing','WindBlock','RogerDirect','Water resistant'],
      4:['AutoSense OS advanced','Adaptive Phonak Digital 3.0','Health functionalities','Dynamic noise cancellation','StereoZoom 2.0','Speech in car','SoundRecover2','SoundRelax','Tap control','Motion sensor hearing','WindBlock','RogerDirect','Water resistant'],
      3:['AutoSense OS standard','Adaptive Phonak Digital 3.0','Health functionalities','Speech in car','SoundRecover2','SoundRelax','Motion sensor hearing','WindBlock','RogerDirect','Water resistant'],
      2:['AutoSense OS essential','Adaptive Phonak Digital 3.0','Health functionalities','SoundRecover2','Real ear sound','WindBlock','RogerDirect','Water resistant']
    }
  };

  function applyLayoutFixes(){
    document.getElementById('app-layout-fixes')?.remove();
    const style=document.createElement('style');style.id='app-layout-fixes';style.textContent=`
      #aboutData + .about-grid{margin-top:24px}
      .ref-component-preview .ref-image-slot.ref-has-catalog-image,.ref-accessory-card .ref-image-slot.ref-has-catalog-image,.ref-retention-preview .ref-image-slot.ref-has-catalog-image{border:0!important;border-radius:0!important;background:transparent!important;padding:0!important;box-shadow:none!important}
      .ref-retention-gallery-ready > .ref-choice-row,.ref-retention-gallery-ready > .ref-selection-summary,.ref-retention-gallery-ready > .ref-retention-preview{display:none!important}
      .ref-retention-gallery{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:14px}
      .ref-retention-card{position:relative;margin:0!important;padding:12px 12px 10px!important;min-width:0!important;width:100%;border:2px solid var(--border)!important;border-radius:14px!important;background:#fff!important;color:var(--text)!important;box-shadow:none!important;cursor:pointer;transition:transform .12s ease,border-color .12s ease,box-shadow .12s ease}
      .ref-retention-card:hover{background:#fff!important;color:var(--text)!important;border-color:#b8d9dc!important;transform:translateY(-1px)!important;box-shadow:0 4px 12px rgba(25,58,62,.06)!important}
      .ref-retention-card.active{border-color:var(--teal)!important;box-shadow:0 5px 16px rgba(0,140,149,.12)!important;transform:translateY(-2px)!important}
      .ref-retention-card.active:after{content:'✓';position:absolute;right:10px;top:9px;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--teal);color:#fff;font-size:12px;font-weight:900;box-shadow:0 2px 6px rgba(0,0,0,.14)}
      .ref-retention-card img{display:block;width:100%;height:190px;object-fit:contain;filter:none!important}.ref-retention-card strong{display:block;margin-top:7px;text-align:center;font-size:13px}
      .ref-bilateral-preview{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;height:280px;min-height:280px;flex:0 0 280px;align-items:center;overflow:visible;margin:0 0 8px;padding:4px 8px 0}
      .ref-bilateral-preview img{width:100%;height:260px;max-height:260px;min-width:0;object-fit:contain;object-position:center;display:block;filter:none!important}
      .ref-component-preview.ref-bilateral-ready .ref-image-slot{display:none!important}.ref-component-preview:not(.ref-bilateral-ready) .ref-bilateral-preview{display:none!important}
      .ref-component-preview.ref-bilateral-ready .ref-selection-summary{position:static!important;inset:auto!important;transform:none!important;margin:0!important;z-index:2!important;clear:both!important;display:block!important;flex:0 0 auto!important}
      .ref-component-preview.ref-bilateral-ready{overflow:visible!important;display:flex;flex-direction:column;min-height:350px}
      .ref-feature-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:14px}.ref-feature-head h4{margin-bottom:4px!important}.ref-feature-head p{margin:0}
      .ref-solution-badge{flex:0 0 auto;padding:6px 10px;border-radius:999px;background:var(--teal);color:#fff;font-size:11px;font-weight:850;white-space:nowrap}
      .ref-feature-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
      .ref-feature-item{display:flex;align-items:flex-start;gap:8px;padding:10px 11px;border:1px solid var(--border);border-radius:11px;background:#f8fbfc;color:var(--text);font-size:13px;font-weight:700;line-height:1.3}
      .ref-feature-check{display:grid;place-items:center;flex:0 0 19px;width:19px;height:19px;margin-top:-1px;border-radius:50%;background:var(--teal-light);color:var(--teal-dark);font-size:11px;font-weight:900}
      @media(max-width:800px){.ref-feature-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
      @media(max-width:600px){.appbar-actions{display:flex!important;width:100%!important;gap:8px!important;flex-wrap:nowrap!important}.appbar-actions button{display:block!important;flex:1 1 0!important;margin:0!important;min-width:0!important;min-height:44px!important}.ref-retention-gallery{gap:8px}.ref-retention-card{padding:8px 6px!important}.ref-retention-card img{height:125px}.ref-retention-card strong{font-size:12px}.ref-bilateral-preview{height:220px;min-height:220px;flex-basis:220px;gap:8px;margin-bottom:8px;padding:2px 4px 0}.ref-bilateral-preview img{height:205px;max-height:205px}.ref-component-preview.ref-bilateral-ready{min-height:290px}.ref-feature-grid{grid-template-columns:1fr}.ref-feature-head{flex-direction:column}.ref-solution-badge{align-self:flex-start}}
    `;document.head.appendChild(style);
  }

  function referenceSection(title){const root=document.getElementById('references');return root?[...root.querySelectorAll('.ref-section')].find(el=>el.querySelector('h4')?.textContent.trim()===title)||null:null}

  function installRetentionGallery(){
    const section=referenceSection('Retention Locks');if(!section)return;const buttons=[...section.querySelectorAll('[data-retention]')];if(buttons.length!==3)return;section.classList.add('ref-retention-gallery-ready');let gallery=section.querySelector('.ref-retention-gallery');
    if(!gallery){const names={S:'Small',M:'Medium',L:'Large'},files={S:'IMG_2176.png',M:'IMG_2177.png',L:'IMG_2178.png'};gallery=document.createElement('div');gallery.className='ref-retention-gallery';gallery.setAttribute('aria-label','Retention lock size');gallery.innerHTML=['S','M','L'].map(size=>`<button type="button" class="ref-retention-card" data-retention-card="${size}" aria-label="Select ${names[size]} retention lock"><img src="assets/spark/catalog/retention-locks/${files[size]}?v=dev11" alt="${names[size]} Spark retention lock" decoding="async" loading="eager"><strong>${names[size]} (${size})</strong></button>`).join('');section.appendChild(gallery);gallery.querySelectorAll('[data-retention-card]').forEach(card=>card.addEventListener('click',()=>section.querySelector(`[data-retention="${card.dataset.retentionCard}"]`)?.click()))}
    const selected=buttons.find(b=>b.classList.contains('active'))?.dataset.retention||'M';gallery.querySelectorAll('[data-retention-card]').forEach(card=>{const active=card.dataset.retentionCard===selected;card.classList.toggle('active',active);card.setAttribute('aria-pressed',active?'true':'false')})
  }

  function receiverAsset(side,length,power){return `assets/spark/catalog/receivers/${side}-${length}-${power}.png?v=dev11`}
  function receiverEarLabel(ear){const s=receiverSelections[ear];return `${s.length}${s.power} ${ear==='left'?'Left':'Right'}`}
  function receiverConfigurationLabel(){return receiverMode==='both'?`${receiverEarLabel('left')} + ${receiverEarLabel('right')}`:receiverEarLabel(receiverMode==='left'?'left':'right')}
  function currentReceiverButtons(section){return {power:section?.querySelector('[data-receiver-power].active')?.dataset.receiverPower||'M',length:section?.querySelector('[data-receiver-length].active')?.dataset.receiverLength||'0'}}
  function clickReceiverChoice(section,attribute,value){const b=section?.querySelector(`[${attribute}="${value}"]`);if(b&&!b.classList.contains('active'))b.click()}
  function restoreReceiverEar(ear){if(receiverSyncing)return;const desired=receiverSelections[ear];receiverSyncing=true;try{let live=referenceSection('Receivers');clickReceiverChoice(live,'data-receiver-power',desired.power);live=referenceSection('Receivers');clickReceiverChoice(live,'data-receiver-length',desired.length)}finally{receiverSyncing=false}}
  function updateReceiverConfigText(){const config=document.querySelector('#references .ref-config-value');if(!config)return;const label=receiverConfigurationLabel();const pattern=/\b(?:00|0|1|2|3)(?:S|M|P)\s+(?:Left(?: \(Blue\))?|Right(?: \(Red\))?|Both(?: \(Blue \+ Red\))?)(?:\s*\+\s*(?:00|0|1|2|3)(?:S|M|P)\s+(?:Left(?: \(Blue\))?|Right(?: \(Red\))?))?/;if(pattern.test(config.textContent))config.textContent=config.textContent.replace(pattern,label)}

  function renderReceiverPreview(section){
    const preview=section?.querySelector('.ref-component-preview');if(!preview)return;const summary=preview.querySelector('.ref-selection-summary strong');let dual=preview.querySelector('.ref-bilateral-preview');if(!dual){dual=document.createElement('div');dual.className='ref-bilateral-preview';const slot=preview.querySelector('.ref-image-slot');slot?slot.insertAdjacentElement('afterend',dual):preview.prepend(dual)}
    const left=receiverSelections.left,right=receiverSelections.right,key=`${left.length}-${left.power}|${right.length}-${right.power}`;if(dual.dataset.receiverKey!==key){dual.dataset.receiverKey=key;dual.innerHTML=`<img src="${receiverAsset('L',left.length,left.power)}" alt="${receiverEarLabel('left')} Spark receiver" decoding="async" loading="eager"><img src="${receiverAsset('R',right.length,right.power)}" alt="${receiverEarLabel('right')} Spark receiver" decoding="async" loading="eager">`}
    preview.classList.toggle('ref-bilateral-ready',receiverMode==='both');const label=receiverConfigurationLabel();if(summary&&summary.textContent!==label)summary.textContent=label;updateReceiverConfigText()
  }

  function installBilateralReceiver(){
    const section=referenceSection('Receivers');if(!section)return;const first=section.querySelector('[data-receiver-side]'),row=first?.parentElement;if(!row)return;const sides=[...row.querySelectorAll('[data-receiver-side]')];
    if(!receiverInitialized){const current=currentReceiverButtons(section),active=sides.find(b=>b.classList.contains('active'))?.dataset.receiverSide||'right';receiverSelections[active]={...current};receiverMode=active;receiverInitialized=true}
    let both=row.querySelector('[data-receiver-both]');if(!both){both=document.createElement('button');both.type='button';both.className='ref-choice';both.dataset.receiverBoth='true';both.textContent='🔵🔴 Both';both.addEventListener('click',()=>{if(receiverSyncing)return;const live=referenceSection('Receivers'),active=live?.querySelector('[data-receiver-side].active')?.dataset.receiverSide;if(active==='left'||active==='right')receiverSelections[active]={...currentReceiverButtons(live)};receiverMode='both';installBilateralReceiver()});row.appendChild(both)}
    sides.forEach(b=>{if(b.dataset.independentReceiverListener==='1')return;b.dataset.independentReceiverListener='1';b.addEventListener('click',()=>{if(receiverSyncing)return;const ear=b.dataset.receiverSide;if(ear!=='left'&&ear!=='right')return;receiverMode=ear;queueMicrotask(()=>{restoreReceiverEar(ear);installBilateralReceiver()})})});
    section.querySelectorAll('[data-receiver-power],[data-receiver-length]').forEach(b=>{if(b.dataset.independentReceiverValueListener==='1')return;b.dataset.independentReceiverValueListener='1';b.addEventListener('click',()=>{if(receiverSyncing)return;queueMicrotask(()=>{const live=referenceSection('Receivers'),current=currentReceiverButtons(live);if(receiverMode==='both'){receiverSelections.left={...current};receiverSelections.right={...current}}else receiverSelections[receiverMode]={...current};installBilateralReceiver()})})});
    both=row.querySelector('[data-receiver-both]');both?.classList.toggle('active',receiverMode==='both');both?.setAttribute('aria-pressed',receiverMode==='both'?'true':'false');if(receiverMode==='both')sides.forEach(b=>b.classList.remove('active'));renderReceiverPreview(section)
  }

  function currentSparkModel(){const root=document.getElementById('references'),model=root?.querySelector('.ref-model-name')?.textContent.trim()||'';if(!model)return null;const level=Number(root.querySelector('[data-level].active')?.dataset.level||(model.match(/MEMINI E (\d)/i)?.[1]||0));return {model,level,family:/\bAI\b/i.test(model)?'ai':'standard'}}
  function installFeatureReference(){
    const root=document.getElementById('references'),info=currentSparkModel();if(!root||!info)return;const features=sparkFeatures[info.family]?.[info.level];if(!features)return;let section=root.querySelector('[data-ref-section="features"]');if(!section){section=document.createElement('div');section.className='ref-section ref-feature-section';section.dataset.refSection='features';const config=root.querySelector('.ref-config-card');config?config.insertAdjacentElement('afterend',section):referenceSection('Treatment Level')?.insertAdjacentElement('afterend',section)}
    const solution=solutionNames[info.level]||`E${info.level}`,familyLabel=info.family==='ai'?'MEMINI E AI RIC':'MEMINI E RIC',key=`${info.family}-${info.level}`;
    if(section.dataset.featureKey!==key){section.dataset.featureKey=key;section.innerHTML=`<div class="ref-feature-head"><div><h4>Solution-Level Features</h4><p class="muted">${familyLabel} · E${info.level} ${solution}</p></div><span class="ref-solution-badge">E${info.level} · ${solution}</span></div><div class="ref-feature-grid">${features.map(f=>`<div class="ref-feature-item"><span class="ref-feature-check">✓</span><span>${f}</span></div>`).join('')}</div>`}
    const links=root.querySelector('.ref-sticky-links');if(links&&!links.querySelector('[data-scroll-section="features"]')){const b=document.createElement('button');b.type='button';b.className='ref-nav-link';b.dataset.scrollSection='features';b.textContent='Features';b.addEventListener('click',()=>section.scrollIntoView({behavior:'smooth',block:'start'}));const colors=links.querySelector('[data-scroll-section="colors"]');colors?links.insertBefore(b,colors):links.appendChild(b)}
  }

  function installReferenceEnhancements(){installRetentionGallery();installBilateralReceiver();installFeatureReference()}
  function installReferenceEnhancementGuard(){installReferenceEnhancements();const root=document.getElementById('references');if(!root||root.dataset.referenceEnhancementGuard==='1')return;root.dataset.referenceEnhancementGuard='1';let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;installReferenceEnhancements()})}).observe(root,{childList:true,subtree:true})}
  function installSycleLaunch(){const b=document.querySelector('.sycle-shortcut');if(b){b.textContent='Open Sycle';b.removeAttribute('title')}window.openSycle=()=>window.location.assign(SYCLE_URL)}
  function setText(el,value){if(el&&el.textContent!==value)el.textContent=value}
  function applyDisplayVersion(){document.querySelectorAll('[data-app-version]').forEach(el=>setText(el,APP_VERSION));setText(document.getElementById('aboutVersion'),APP_VERSION);const h=document.querySelector('#aboutWhatsNew h3');if(h)setText(h,"What's New in v"+APP_VERSION);const cards=document.querySelectorAll('#dashboardCards .dashboard-card'),card=[...cards].find(c=>c.querySelector('.label')?.textContent.trim()==='Current Version');if(card)setText(card.querySelector('.number'),APP_VERSION)}
  function installVersionGuard(){applyDisplayVersion();if(!document.body||document.body.dataset.versionGuardInstalled==='1')return;document.body.dataset.versionGuardInstalled='1';new MutationObserver(applyDisplayVersion).observe(document.body,{childList:true,subtree:true})}
  function ready(){applyLayoutFixes();installSycleLaunch();installVersionGuard();installReferenceEnhancementGuard()}
  function loadReferenceImages(){if(document.querySelector('script[data-reference-images-loader]'))return;const s=document.createElement('script');s.src='js/reference-images.js?v=dev10';s.async=false;s.dataset.referenceImagesLoader='1';s.onload=()=>{applyDisplayVersion();installReferenceEnhancementGuard()};document.body.appendChild(s)}
  function loadReferences(){if(document.querySelector('script[data-references-loader]'))return;const s=document.createElement('script');s.src='js/references.js?v=dev10';s.async=false;s.dataset.referencesLoader='1';s.onload=()=>{loadReferenceImages();applyDisplayVersion();installReferenceEnhancementGuard()};document.body.appendChild(s)}
  function loadSequentially(){const core=document.createElement('script');core.src='js/app-core.js';core.async=false;core.onload=()=>{const patch=document.createElement('script');patch.src='js/smart-notes.js';patch.async=false;patch.onload=()=>{ready();loadReferences()};document.body.appendChild(patch)};document.body.appendChild(core)}
  applyLayoutFixes();
  if(document.readyState==='loading'){document.write('<script src="js/app-core.js"><\/script><script src="js/smart-notes.js"><\/script><script src="js/references.js?v=dev10"><\/script><script src="js/reference-images.js?v=dev10"><\/script>');document.addEventListener('DOMContentLoaded',ready,{once:true})}else loadSequentially();
  window.addEventListener('pageshow',()=>{installSycleLaunch();applyDisplayVersion();installReferenceEnhancementGuard()});
})();