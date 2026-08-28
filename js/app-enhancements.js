/* Miracle-Ear Clinical Assistant post-load enhancements */
(function(){
  'use strict';
  const SYCLE_URL='https://www.mymiracle-ear.com/freecvs/schedule_hm.php';
  const solutionNames={5:'Premium',4:'Advanced',3:'Standard',2:'Essential'};
  const sparkFeatures={
    ai:{
      5:['AutoSense OS','Adaptive Phonak Digital 3.0','Spheric speech clarity','SpeechSensor','Health functionalities','Dynamic noise cancellation','StereoZoom 2.0','Speech in car','SoundRecover2','SoundRelax','Tap control','Motion sensor hearing','WindBlock','RogerDirect','Water resistant','Speech enhancer'],
      4:['AutoSense OS','Adaptive Phonak Digital 3.0','Spheric speech clarity','SpeechSensor','Health functionalities','Dynamic noise cancellation','StereoZoom 2.0','Speech in car','SoundRecover2','SoundRelax','Tap control','Motion sensor hearing','WindBlock','RogerDirect','Water resistant']
    },
    standard:{
      5:['AutoSense OS','Adaptive Phonak Digital 3.0','Health functionalities','SoundRecover2','Real ear sound','WindBlock','RogerDirect','Water resistant','Speech in car','SoundRelax','Motion sensor hearing','Dynamic noise cancellation','StereoZoom 2.0','Tap control','SpeechSensor','Speech enhancer'],
      4:['AutoSense OS','Adaptive Phonak Digital 3.0','Health functionalities','SoundRecover2','Real ear sound','WindBlock','RogerDirect','Water resistant','Speech in car','SoundRelax','Motion sensor hearing','Dynamic noise cancellation','StereoZoom 2.0','Tap control'],
      3:['AutoSense OS','Adaptive Phonak Digital 3.0','Health functionalities','SoundRecover2','Real ear sound','WindBlock','RogerDirect','Water resistant','Speech in car','SoundRelax','Motion sensor hearing'],
      2:['AutoSense OS','Adaptive Phonak Digital 3.0','Health functionalities','SoundRecover2','Real ear sound','WindBlock','RogerDirect','Water resistant']
    }
  };
  const featureOrder=['AutoSense OS','Adaptive Phonak Digital 3.0','Spheric speech clarity','Health functionalities','SoundRecover2','Real ear sound','WindBlock','RogerDirect','Water resistant','Speech in car','SoundRelax','Motion sensor hearing','Dynamic noise cancellation','StereoZoom 2.0','Tap control','SpeechSensor','Speech enhancer'];
  function installStyles(){
    if(document.getElementById('reference-enhancement-styles'))return;
    const style=document.createElement('style');style.id='reference-enhancement-styles';style.textContent=`
      #aboutData + .about-grid{margin-top:24px}
      .ref-retention-gallery-ready > .ref-choice-row,.ref-retention-gallery-ready > .ref-selection-summary,.ref-retention-gallery-ready > .ref-retention-preview{display:none!important}
      .ref-retention-gallery{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:14px}
      .ref-retention-card{position:relative;margin:0!important;padding:12px!important;width:100%;border:2px solid var(--border)!important;border-radius:14px!important;background:#fff!important;color:var(--text)!important;box-shadow:none!important;cursor:pointer}
      .ref-retention-card.active{border-color:var(--teal)!important;box-shadow:0 5px 16px rgba(0,140,149,.12)!important;transform:translateY(-2px)!important}
      .ref-retention-card.active:after{content:'✓';position:absolute;right:10px;top:9px;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--teal);color:#fff;font-size:12px;font-weight:900}
      .ref-retention-card img{display:block;width:100%;height:190px;object-fit:contain}.ref-retention-card strong{display:block;margin-top:7px;text-align:center;font-size:13px}
      .ref-feature-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:14px}.ref-feature-head h4{margin-bottom:4px!important}.ref-feature-head p{margin:0}
      .ref-solution-badge{display:inline-flex;align-items:center;flex:0 0 auto;padding:6px 10px;border:1px solid var(--border);border-radius:999px;background:#f6f8f9;color:#5f6d71;font-size:11px;font-weight:850;white-space:nowrap}
      .ref-feature-levels{margin:2px 0 14px}
      .ref-feature-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-template-rows:repeat(6,auto);grid-auto-flow:column;gap:9px}
      .ref-feature-item{display:flex;align-items:flex-start;gap:8px;padding:10px 11px;border:1px solid var(--border);border-radius:11px;background:#f8fbfc;color:var(--text);font-size:13px;font-weight:700;line-height:1.3;transition:background .18s ease,border-color .18s ease,color .18s ease,opacity .18s ease}
      .ref-feature-item.excluded{background:#f3f5f6;border-color:#e2e7e8;color:#8a9599;opacity:.72}
      .ref-feature-check{display:grid;place-items:center;flex:0 0 19px;width:19px;height:19px;border-radius:50%;background:var(--teal-light);color:var(--teal-dark);font-size:11px;font-weight:900}
      .ref-feature-check.ref-feature-empty{box-sizing:border-box;background:transparent;border:1.5px solid #aeb8bb;color:transparent}
      @media(max-width:800px){.ref-feature-grid{grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:repeat(8,auto)}}
      @media(max-width:600px){.ref-feature-grid{grid-template-columns:1fr;grid-template-rows:repeat(16,auto)}.ref-feature-head{flex-direction:column}.ref-retention-card img{height:125px}}
    `;document.head.appendChild(style);
  }
  function setText(el,value){if(el&&el.textContent!==value)el.textContent=value}
  function applyVersion(){window.applyClinicalAssistantVersion();}
  function installSycle(){const b=document.querySelector('.sycle-shortcut');if(b){b.textContent='Open Sycle';b.removeAttribute('title')}window.openSycle=function(){window.location.assign(SYCLE_URL)}}
  function referenceSection(title){const root=document.getElementById('references');return root?[...root.querySelectorAll('.ref-section')].find(el=>el.querySelector('h4')?.textContent.trim()===title)||null:null}
  function installRetentionGallery(){
    const section=referenceSection('Retention Locks');if(!section)return;const buttons=[...section.querySelectorAll('[data-retention]')];if(buttons.length!==3)return;section.classList.add('ref-retention-gallery-ready');
    let gallery=section.querySelector('.ref-retention-gallery');if(!gallery){const names={S:'Small',M:'Medium',L:'Large'},files={S:'IMG_2176.png',M:'IMG_2177.png',L:'IMG_2178.png'};gallery=document.createElement('div');gallery.className='ref-retention-gallery';gallery.innerHTML=['S','M','L'].map(size=>`<button type="button" class="ref-retention-card" data-retention-card="${size}"><img src="assets/spark/catalog/retention-locks/${files[size]}?v=dev22" alt="${names[size]} Spark retention lock"><strong>${names[size]} (${size})</strong></button>`).join('');section.appendChild(gallery);gallery.querySelectorAll('[data-retention-card]').forEach(card=>card.addEventListener('click',()=>section.querySelector(`[data-retention="${card.dataset.retentionCard}"]`)?.click()))}
    const selected=buttons.find(b=>b.classList.contains('active'))?.dataset.retention||'';gallery.querySelectorAll('[data-retention-card]').forEach(card=>card.classList.toggle('active',card.dataset.retentionCard===selected));
  }
  function currentSpark(){const root=document.getElementById('references'),model=root?.querySelector('.ref-model-name')?.textContent.trim()||'';if(!model)return null;const level=Number(root.querySelector('[data-level].active')?.dataset.level||model.match(/MEMINI E (\d)/i)?.[1]||0);return {level,family:/\bAI\b/i.test(model)?'ai':'standard'}}
  function installFeatures(){
    const root=document.getElementById('references'),info=currentSpark();if(!root||!info)return;const features=sparkFeatures[info.family]?.[info.level];if(!features)return;const section=root.querySelector('[data-ref-section="features"]'),content=section?.querySelector('.ref-feature-content');if(!section||!content)return;
    const key=`${info.family}-${info.level}`;if(section.dataset.featureKey===key)return;section.dataset.featureKey=key;
    const included=new Set(features),available=new Set(Object.values(sparkFeatures[info.family]).flat()),master=featureOrder.filter(feature=>available.has(feature));
    content.innerHTML=`<div class="ref-feature-grid">${master.map(feature=>{const isIncluded=included.has(feature);return `<div class="ref-feature-item ${isIncluded?'included':'excluded'}" aria-label="${feature}: ${isIncluded?'included':'not included'}"><span class="ref-feature-check ${isIncluded?'':'ref-feature-empty'}">${isIncluded?'✓':''}</span><span>${feature}</span></div>`;}).join('')}</div>`;
  }
  function enhanceReferences(){installRetentionGallery();installFeatures()}
  function installReferenceObserver(){if(document.documentElement.dataset.referenceEnhancementEvents)return;document.documentElement.dataset.referenceEnhancementEvents='1';document.addEventListener('clinical-assistant:references-rendered',enhanceReferences)}
  function init(){installStyles();installSycle();applyVersion();enhanceReferences();installReferenceObserver()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.addEventListener('load',init);window.addEventListener('pageshow',init);
})();
