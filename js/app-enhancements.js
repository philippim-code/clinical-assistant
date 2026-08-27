/* Miracle-Ear Clinical Assistant post-load enhancements */
(function(){
  'use strict';
  const SYCLE_URL='https://www.mymiracle-ear.com/freecvs/schedule_hm.php';
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
  let receiverMode='right',receiverSyncing=false,receiverInitialized=false;
  const receiverSelections={left:{power:'M',length:'0'},right:{power:'M',length:'0'}};

  function installStyles(){
    if(document.getElementById('dev11-enhancement-styles'))return;
    const style=document.createElement('style');style.id='dev11-enhancement-styles';style.textContent=`
      #aboutData + .about-grid{margin-top:24px}
      .ref-retention-gallery-ready > .ref-choice-row,.ref-retention-gallery-ready > .ref-selection-summary,.ref-retention-gallery-ready > .ref-retention-preview{display:none!important}
      .ref-retention-gallery{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:14px}
      .ref-retention-card{position:relative;margin:0!important;padding:12px!important;width:100%;border:2px solid var(--border)!important;border-radius:14px!important;background:#fff!important;color:var(--text)!important;box-shadow:none!important;cursor:pointer}
      .ref-retention-card.active{border-color:var(--teal)!important;box-shadow:0 5px 16px rgba(0,140,149,.12)!important;transform:translateY(-2px)!important}
      .ref-retention-card.active:after{content:'✓';position:absolute;right:10px;top:9px;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--teal);color:#fff;font-size:12px;font-weight:900}
      .ref-retention-card img{display:block;width:100%;height:190px;object-fit:contain}.ref-retention-card strong{display:block;margin-top:7px;text-align:center;font-size:13px}
      .ref-bilateral-preview{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;height:280px;min-height:280px;align-items:center;margin:0 0 8px;padding:4px 8px 0}
      .ref-bilateral-preview img{width:100%;height:260px;object-fit:contain;display:block}
      .ref-component-preview.ref-bilateral-ready .ref-image-slot{display:none!important}.ref-component-preview:not(.ref-bilateral-ready) .ref-bilateral-preview{display:none!important}
      .ref-component-preview.ref-bilateral-ready{display:flex;flex-direction:column;min-height:350px}
      .ref-feature-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:14px}.ref-feature-head h4{margin-bottom:4px!important}.ref-feature-head p{margin:0}
      .ref-solution-badge{flex:0 0 auto;padding:6px 10px;border-radius:999px;background:var(--teal);color:#fff;font-size:11px;font-weight:850;white-space:nowrap}
      .ref-feature-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
      .ref-feature-item{display:flex;align-items:flex-start;gap:8px;padding:10px 11px;border:1px solid var(--border);border-radius:11px;background:#f8fbfc;color:var(--text);font-size:13px;font-weight:700;line-height:1.3}
      .ref-feature-check{display:grid;place-items:center;flex:0 0 19px;width:19px;height:19px;border-radius:50%;background:var(--teal-light);color:var(--teal-dark);font-size:11px;font-weight:900}
      @media(max-width:800px){.ref-feature-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
      @media(max-width:600px){.ref-feature-grid{grid-template-columns:1fr}.ref-feature-head{flex-direction:column}.ref-retention-card img{height:125px}.ref-bilateral-preview{height:220px;min-height:220px}.ref-bilateral-preview img{height:205px}}
    `;document.head.appendChild(style);
  }
  function setText(el,value){if(el&&el.textContent!==value)el.textContent=value}
  function applyVersion(){window.applyClinicalAssistantVersion();}
  function installSycle(){const b=document.querySelector('.sycle-shortcut');if(b){b.textContent='Open Sycle';b.removeAttribute('title')}window.openSycle=function(){window.location.assign(SYCLE_URL)}}
  function referenceSection(title){const root=document.getElementById('references');return root?[...root.querySelectorAll('.ref-section')].find(el=>el.querySelector('h4')?.textContent.trim()===title)||null:null}
  function installRetentionGallery(){
    const section=referenceSection('Retention Locks');if(!section)return;const buttons=[...section.querySelectorAll('[data-retention]')];if(buttons.length!==3)return;section.classList.add('ref-retention-gallery-ready');
    let gallery=section.querySelector('.ref-retention-gallery');if(!gallery){const names={S:'Small',M:'Medium',L:'Large'},files={S:'IMG_2176.png',M:'IMG_2177.png',L:'IMG_2178.png'};gallery=document.createElement('div');gallery.className='ref-retention-gallery';gallery.innerHTML=['S','M','L'].map(size=>`<button type="button" class="ref-retention-card" data-retention-card="${size}"><img src="assets/spark/catalog/retention-locks/${files[size]}?v=dev11" alt="${names[size]} Spark retention lock"><strong>${names[size]} (${size})</strong></button>`).join('');section.appendChild(gallery);gallery.querySelectorAll('[data-retention-card]').forEach(card=>card.addEventListener('click',()=>section.querySelector(`[data-retention="${card.dataset.retentionCard}"]`)?.click()))}
    const selected=buttons.find(b=>b.classList.contains('active'))?.dataset.retention||'M';gallery.querySelectorAll('[data-retention-card]').forEach(card=>card.classList.toggle('active',card.dataset.retentionCard===selected));
  }
  function receiverAsset(side,length,power){return `assets/spark/catalog/receivers/${side}-${length}-${power}.png?v=dev11`}
  function receiverEarLabel(ear){const s=receiverSelections[ear];return `${s.length}${s.power} ${ear==='left'?'Left':'Right'}`}
  function receiverLabel(){return receiverMode==='both'?`${receiverEarLabel('left')} + ${receiverEarLabel('right')}`:receiverEarLabel(receiverMode==='left'?'left':'right')}
  function currentReceiver(section){return {power:section?.querySelector('[data-receiver-power].active')?.dataset.receiverPower||'M',length:section?.querySelector('[data-receiver-length].active')?.dataset.receiverLength||'0'}}
  function restoreReceiver(ear){if(receiverSyncing)return;receiverSyncing=true;try{let s=referenceSection('Receivers'),d=receiverSelections[ear];const p=s?.querySelector(`[data-receiver-power="${d.power}"]`);if(p&&!p.classList.contains('active'))p.click();s=referenceSection('Receivers');const l=s?.querySelector(`[data-receiver-length="${d.length}"]`);if(l&&!l.classList.contains('active'))l.click()}finally{receiverSyncing=false}}
  function updateReceiverDisplay(section){
    const preview=section?.querySelector('.ref-component-preview');if(!preview)return;let dual=preview.querySelector('.ref-bilateral-preview');if(!dual){dual=document.createElement('div');dual.className='ref-bilateral-preview';preview.querySelector('.ref-image-slot')?.insertAdjacentElement('afterend',dual)}
    const left=receiverSelections.left,right=receiverSelections.right,key=`${left.length}-${left.power}|${right.length}-${right.power}`;if(dual&&dual.dataset.key!==key){dual.dataset.key=key;dual.innerHTML=`<img src="${receiverAsset('L',left.length,left.power)}" alt="${receiverEarLabel('left')}"><img src="${receiverAsset('R',right.length,right.power)}" alt="${receiverEarLabel('right')}">`}
    preview.classList.toggle('ref-bilateral-ready',receiverMode==='both');const label=receiverLabel();const summary=preview.querySelector('.ref-selection-summary strong');if(summary&&summary.textContent!==label)summary.textContent=label;
    const config=document.querySelector('#references .ref-config-value');if(config){const pattern=/\b(?:00|0|1|2|3)(?:S|M|P)\s+(?:Left(?: \(Blue\))?|Right(?: \(Red\))?|Both(?: \(Blue \+ Red\))?)(?:\s*\+\s*(?:00|0|1|2|3)(?:S|M|P)\s+(?:Left(?: \(Blue\))?|Right(?: \(Red\))?))?/;if(pattern.test(config.textContent))config.textContent=config.textContent.replace(pattern,label)}
  }
  function installBilateralReceiver(){
    const section=referenceSection('Receivers');if(!section)return;const row=section.querySelector('[data-receiver-side]')?.parentElement;if(!row)return;const sides=[...row.querySelectorAll('[data-receiver-side]')];
    if(!receiverInitialized){const active=sides.find(b=>b.classList.contains('active'))?.dataset.receiverSide||'right';receiverSelections[active]={...currentReceiver(section)};receiverMode=active;receiverInitialized=true}
    let both=row.querySelector('[data-receiver-both]');if(!both){both=document.createElement('button');both.type='button';both.className='ref-choice';both.dataset.receiverBoth='1';both.textContent='🔵🔴 Both';both.addEventListener('click',()=>{const live=referenceSection('Receivers'),active=live?.querySelector('[data-receiver-side].active')?.dataset.receiverSide;if(active)receiverSelections[active]={...currentReceiver(live)};receiverMode='both';installBilateralReceiver()});row.appendChild(both)}
    sides.forEach(b=>{if(b.dataset.dev11Listener)return;b.dataset.dev11Listener='1';b.addEventListener('click',()=>{if(receiverSyncing)return;receiverMode=b.dataset.receiverSide;queueMicrotask(()=>{restoreReceiver(receiverMode);installBilateralReceiver()})})});
    section.querySelectorAll('[data-receiver-power],[data-receiver-length]').forEach(b=>{if(b.dataset.dev11ValueListener)return;b.dataset.dev11ValueListener='1';b.addEventListener('click',()=>{if(receiverSyncing)return;queueMicrotask(()=>{const live=referenceSection('Receivers'),value=currentReceiver(live);if(receiverMode==='both'){receiverSelections.left={...value};receiverSelections.right={...value}}else receiverSelections[receiverMode]={...value};installBilateralReceiver()})})});
    both.classList.toggle('active',receiverMode==='both');if(receiverMode==='both')sides.forEach(b=>b.classList.remove('active'));updateReceiverDisplay(section);
  }
  function currentSpark(){const root=document.getElementById('references'),model=root?.querySelector('.ref-model-name')?.textContent.trim()||'';if(!model)return null;const level=Number(root.querySelector('[data-level].active')?.dataset.level||model.match(/MEMINI E (\d)/i)?.[1]||0);return {level,family:/\bAI\b/i.test(model)?'ai':'standard'}}
  function installFeatures(){
    const root=document.getElementById('references'),info=currentSpark();if(!root||!info)return;const features=sparkFeatures[info.family]?.[info.level];if(!features)return;let section=root.querySelector('[data-ref-section="features"]');if(!section){section=document.createElement('div');section.className='ref-section ref-feature-section';section.dataset.refSection='features';const config=root.querySelector('.ref-config-card');config?config.insertAdjacentElement('afterend',section):referenceSection('Treatment Level')?.insertAdjacentElement('afterend',section)}
    const key=`${info.family}-${info.level}`;if(section.dataset.featureKey!==key){section.dataset.featureKey=key;const solution=solutionNames[info.level],family=info.family==='ai'?'MEMINI E AI RIC':'MEMINI E RIC';section.innerHTML=`<div class="ref-feature-head"><div><h4>Solution-Level Features</h4><p class="muted">${family} · E${info.level} ${solution}</p></div><span class="ref-solution-badge">E${info.level} · ${solution}</span></div><div class="ref-feature-grid">${features.map(f=>`<div class="ref-feature-item"><span class="ref-feature-check">✓</span><span>${f}</span></div>`).join('')}</div>`}
    const links=root.querySelector('.ref-sticky-links');if(links&&!links.querySelector('[data-scroll-section="features"]')){const b=document.createElement('button');b.type='button';b.className='ref-nav-link';b.dataset.scrollSection='features';b.textContent='Features';b.addEventListener('click',()=>section.scrollIntoView({behavior:'smooth',block:'start'}));const colors=links.querySelector('[data-scroll-section="colors"]');colors?links.insertBefore(b,colors):links.appendChild(b)}
  }
  function enhanceReferences(){installRetentionGallery();installBilateralReceiver();installFeatures()}
  function installReferenceObserver(){const root=document.getElementById('references');if(!root||root.dataset.dev11Observer)return;root.dataset.dev11Observer='1';let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;enhanceReferences()})}).observe(root,{childList:true,subtree:true})}
  function init(){installStyles();installSycle();applyVersion();enhanceReferences();installReferenceObserver()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.addEventListener('load',init);window.addEventListener('pageshow',init);
})();
