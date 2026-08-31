/* Miracle-Ear Clinical Assistant — Genius Reference */
(function(){
  'use strict';

  const VERSION='1.10.0-dev1';
  const BASE='assets/genius/catalog/';
  const SAVED_CONFIGURATION_STORAGE_KEY='meClinicalAssistantSavedDeviceConfiguration';
  const ears=['left','right'];
  const solutionNames={5:'Premium',4:'Advanced',3:'Standard',2:'Essential'};

  const geniusData={
    family:'MEENERGY RIC T R 5W',
    levels:[5,4,3,2],
    levelDetails:{
      5:{frequencyChannels:48,compressionControls:20,hearingPrograms:6},
      4:{frequencyChannels:36,compressionControls:18,hearingPrograms:6},
      3:{frequencyChannels:32,compressionControls:16,hearingPrograms:6},
      2:{frequencyChannels:24,compressionControls:12,hearingPrograms:4}
    },
    commonFeatures:[
      'M-E Conversation+',
      'Up to 28 hours of battery life',
      'Apple iOS and Android streaming',
      'Hands-free calling on Apple iOS devices',
      'Binaural wireless',
      'Phone Surround',
      'Telecoil',
      'Tinnitus Control',
      'Miracle-Ear App compatible',
      'GO Remote, Audio Clip, and TV Streamer connectivity',
      'Built-in rechargeable power',
      'Requires Noahlink Wireless programmer'
    ],
    colors:[
      {id:'beige',name:'Beige',file:'beige.png'},
      {id:'black',name:'Black',file:'black.png'},
      {id:'dark-champagne',name:'Dark Champagne',file:'dark-champagne.png'},
      {id:'silver',name:'Silver',file:'silver.png'}
    ],
    receivers:{powers:['S','M','P'],lengths:['0','1','2','3','4','5']},
    couplings:[
      {id:'open',name:'Open Tip',plural:'Open Tips',sizes:[{id:'5mm',label:'5 mm'},{id:'7mm',label:'7 mm'},{id:'10mm',label:'10 mm'}],extension:'jpg'},
      {id:'tulip',name:'Tulip Tip',plural:'Tulip Tips',sizes:[{id:'8mm',label:'8 mm'},{id:'12mm',label:'12 mm'}],extension:'jpg'},
      {id:'round',name:'Round Tip',plural:'Round Tips',sizes:[{id:'s',label:'S'},{id:'m',label:'M'},{id:'l',label:'L'}],extension:'jpg'},
      {id:'vented',name:'Vented Sleeve',plural:'Vented Sleeves',sizes:[{id:'xs',label:'XS'},{id:'s',label:'S'},{id:'m',label:'M'},{id:'l',label:'L'}],extension:'png'},
      {id:'closed',name:'Closed Sleeve',plural:'Closed Sleeves',sizes:[{id:'xs',label:'XS'},{id:'s',label:'S'},{id:'m',label:'M'},{id:'l',label:'L'}],extension:'png'},
      {id:'power',name:'Power Sleeve',plural:'Power Sleeves',sizes:[{id:'xs',label:'XS'},{id:'s',label:'S'},{id:'m',label:'M'},{id:'l',label:'L'}],extension:'png'}
    ],
    accessories:[
      {name:'MECHARGE P',type:'Charger',file:'mecharge-p.png'},
      {name:'WaxGuard 3.0 NanoCare',type:'Wax Guards',file:'waxguard-nanocare.jpg'}
    ]
  };

  const state={
    level:null,
    color:null,
    receiverSelections:{left:{power:null,length:null},right:{power:null,length:null}},
    couplingSelections:{left:{type:null,size:null},right:{type:null,size:null}},
    retentionSelections:{left:false,right:false}
  };
  let sectionObserver=null;

  function asset(path){return `${BASE}${path}?v=${encodeURIComponent(VERSION)}`;}
  function root(){return document.getElementById('references');}
  function notifyRendered(){document.dispatchEvent(new CustomEvent('clinical-assistant:references-rendered'));}
  function scrollTop(){root()?.scrollIntoView({behavior:'smooth',block:'start'});}
  function modelName(){return state.level?`MEENERGY ${state.level} RIC T R 5W`:geniusData.family;}
  function selectedColor(){return geniusData.colors.find(color=>color.id===state.color)||null;}
  function earName(ear){return ear==='left'?'Left':'Right';}
  function earCode(ear){return ear==='left'?'AS':'AD';}
  function sideCode(ear){return ear==='left'?'L':'R';}
  function markerClass(ear){return ear==='right'?' right':'';}

  function resetState(){
    state.level=null;
    state.color=null;
    state.receiverSelections={left:{power:null,length:null},right:{power:null,length:null}};
    state.couplingSelections={left:{type:null,size:null},right:{type:null,size:null}};
    state.retentionSelections={left:false,right:false};
  }

  function receiverHasSelection(ear){const item=state.receiverSelections[ear];return Boolean(item.power||item.length);}
  function receiverReady(ear){const item=state.receiverSelections[ear];return Boolean(item.power&&item.length);}
  function receiverPartial(ear){return receiverHasSelection(ear)&&!receiverReady(ear);}
  function selectedReceiverEars(){return ears.filter(receiverReady);}
  function isBilateral(){return selectedReceiverEars().length===2;}
  function receiverConfigurationComplete(){return selectedReceiverEars().length>0&&!ears.some(receiverPartial);}
  function receiverKey(ear){const item=state.receiverSelections[ear];return `${sideCode(ear)}-${item.length}-${item.power}`;}
  function receiverAsset(ear){return receiverReady(ear)?asset(`receivers/${receiverKey(ear)}.png`):'';}
  function receiverShortLabel(ear){const item=state.receiverSelections[ear];return receiverReady(ear)?`${item.length}${item.power}`:'';}
  function receiverEarLabel(ear){return receiverReady(ear)?`${receiverShortLabel(ear)} ${earName(ear)}`:'';}
  function receiverStatus(ear){
    const item=state.receiverSelections[ear];
    if(receiverReady(ear))return {kind:'complete',text:`Ready · ${receiverShortLabel(ear)}`};
    if(item.power)return {kind:'partial',text:'Choose a receiver length'};
    if(item.length)return {kind:'partial',text:'Choose a receiver power'};
    return {kind:'empty',text:'Not selected'};
  }
  function receiverLabel(){
    const ready=selectedReceiverEars(),partial=ears.filter(receiverPartial);
    if(partial.length)return `Complete ${partial.map(earName).join(' and ')} receiver`;
    if(ready.length)return ready.map(receiverEarLabel).join(' + ');
    return 'Select at least one receiver';
  }

  function activeCoupling(ear){return geniusData.couplings.find(item=>item.id===state.couplingSelections[ear].type)||null;}
  function activeCouplingSize(ear){const coupling=activeCoupling(ear),id=state.couplingSelections[ear].size;return coupling?.sizes.find(size=>size.id===id)||null;}
  function couplingHasSelection(ear){const item=state.couplingSelections[ear];return Boolean(item.type||item.size);}
  function couplingReady(ear){return Boolean(activeCoupling(ear)&&activeCouplingSize(ear));}
  function couplingPartial(ear){return couplingHasSelection(ear)&&!couplingReady(ear);}
  function couplingShortLabel(ear){const coupling=activeCoupling(ear),size=activeCouplingSize(ear);return coupling&&size?`${size.label} ${coupling.name}`:'';}
  function couplingEarLabel(ear){return couplingReady(ear)?`${couplingShortLabel(ear)} ${earName(ear)}`:'';}
  function couplingStatus(ear){
    const item=state.couplingSelections[ear];
    if(couplingReady(ear)&&receiverReady(ear))return {kind:'complete',text:`Ready · ${couplingShortLabel(ear)}`};
    if(couplingReady(ear))return {kind:'partial',text:`Choose a ${earName(ear).toLowerCase()} receiver`};
    if(item.type)return {kind:'partial',text:'Choose a coupling size'};
    if(receiverReady(ear))return {kind:'partial',text:'Choose a coupling type'};
    return {kind:'empty',text:'Not selected'};
  }
  function couplingConfigurationComplete(){
    const selected=selectedReceiverEars();
    return selected.length>0&&selected.every(couplingReady)&&!ears.some(couplingPartial)&&!ears.some(ear=>couplingReady(ear)&&!receiverReady(ear));
  }
  function couplingLabel(){
    if(couplingConfigurationComplete())return selectedReceiverEars().map(couplingEarLabel).join(' + ');
    if(selectedReceiverEars().length||ears.some(couplingHasSelection))return 'Complete selected couplings';
    return 'Select coupling';
  }
  function couplingAsset(ear){
    const coupling=activeCoupling(ear),size=activeCouplingSize(ear);
    return coupling&&size?asset(`couplings/${coupling.id}-${size.id}.${coupling.extension}`):'';
  }

  function retentionSelected(ear){return Boolean(state.retentionSelections[ear]&&receiverReady(ear));}
  function retentionShortLabel(ear){return receiverReady(ear)?`${state.receiverSelections[ear].power} Concha Lock`:'';}
  function retentionAsset(ear){return receiverReady(ear)?asset(`retention-locks/${state.receiverSelections[ear].power}.jpg`):'';}
  function retentionLabel(){
    const selected=selectedReceiverEars().filter(retentionSelected);
    if(!selected.length)return 'No concha locks selected';
    return selected.map(ear=>`${retentionShortLabel(ear)} ${earName(ear)}`).join(' + ');
  }

  function configurationComplete(){return Boolean(state.level&&selectedColor()&&receiverConfigurationComplete()&&couplingConfigurationComplete());}
  function hasAnySelection(){return Boolean(state.level||state.color||ears.some(receiverHasSelection)||ears.some(couplingHasSelection)||ears.some(ear=>state.retentionSelections[ear]));}
  function configurationText(){
    const parts=[
      state.level?modelName():'Select treatment level',
      selectedColor()?.name||'Select color',
      receiverConfigurationComplete()?receiverLabel():(ears.some(receiverHasSelection)?receiverLabel():'Select at least one receiver'),
      couplingLabel()
    ];
    if(ears.some(retentionSelected))parts.push(retentionLabel());
    return parts.join(' · ');
  }

  function receiverClinicalItems(){
    if(isBilateral()){
      const left=state.receiverSelections.left,right=state.receiverSelections.right;
      return left.power===right.power&&left.length===right.length?[`${left.length}${left.power} receivers AU`]:[`${left.length}${left.power} receiver AS`,`${right.length}${right.power} receiver AD`];
    }
    const ear=selectedReceiverEars()[0],item=state.receiverSelections[ear];
    return [`${item.length}${item.power} receiver ${earCode(ear)}`];
  }
  function couplingClinicalItems(){
    const selected=selectedReceiverEars();
    if(selected.length===2){
      const left=state.couplingSelections.left,right=state.couplingSelections.right;
      if(left.type===right.type&&left.size===right.size){
        const coupling=activeCoupling('left'),size=activeCouplingSize('left');
        return [`${size.label} ${coupling.plural.toLowerCase()} AU`];
      }
    }
    return selected.map(ear=>`${activeCouplingSize(ear).label} ${activeCoupling(ear).name.toLowerCase()} ${earCode(ear)}`);
  }
  function retentionClinicalItems(){
    const selected=selectedReceiverEars().filter(retentionSelected);
    if(selected.length===2){
      const leftPower=state.receiverSelections.left.power,rightPower=state.receiverSelections.right.power;
      if(leftPower===rightPower)return [`${leftPower} concha locks AU`];
    }
    return selected.map(ear=>`${state.receiverSelections[ear].power} concha lock ${earCode(ear)}`);
  }
  function clinicalNoteText(){
    const items=[`Genius ${modelName()}`,selectedColor().name,...receiverClinicalItems(),...couplingClinicalItems(),...retentionClinicalItems()];
    return `${items.join(', ')}.`;
  }

  function legacyCopy(text){
    const area=document.createElement('textarea');
    area.value=text;area.setAttribute('readonly','');area.style.position='fixed';area.style.opacity='0';
    document.body.appendChild(area);area.select();area.setSelectionRange(0,text.length);
    let copied=false;try{copied=document.execCommand('copy');}catch(_){copied=false;}area.remove();return copied;
  }
  function saveConfiguration(button){
    if(!configurationComplete())return;
    const text=clinicalNoteText();
    const record={source:'Genius Reference',platform:'Genius',family:geniusData.family,model:modelName(),deviceText:text.replace(/[.]$/,''),fullText:text,savedAt:new Date().toISOString()};
    let saved=false;
    try{
      localStorage.setItem(SAVED_CONFIGURATION_STORAGE_KEY,JSON.stringify(record));
      saved=true;
      window.dispatchEvent(new CustomEvent('clinical-assistant:configuration-saved',{detail:record}));
    }catch(_){saved=false;}
    const finish=copied=>{
      if(typeof window.toast==='function')window.toast(saved?(copied?'✓ Genius configuration saved and copied.':'✓ Genius configuration saved. Clipboard unavailable.'):(copied?'Configuration copied. Saving unavailable.':'Could not save configuration.'));
      if(button){button.textContent=saved?'Saved ✓':(copied?'Copied':'Try Again');setTimeout(()=>{if(button.isConnected)button.textContent='Save Configuration';},1600);}
    };
    if(navigator.clipboard?.writeText)navigator.clipboard.writeText(text).then(()=>finish(true),()=>finish(legacyCopy(text)));
    else finish(legacyCopy(text));
  }

  function breadcrumbs(){
    return `<div class="ref-breadcrumbs"><button type="button" data-genius-home>References</button><span>›</span><button type="button" data-genius-home>Hearing Aids</button><span>›</span><strong>Genius</strong><span>›</span><strong>${geniusData.family}</strong></div>`;
  }
  function stickyNav(){
    return `<nav class="ref-sticky-nav" aria-label="Genius reference sections"><div class="ref-sticky-links"><button type="button" class="ref-nav-link active" data-genius-scroll="features">Features</button><button type="button" class="ref-nav-link" data-genius-scroll="colors">Colors</button><button type="button" class="ref-nav-link" data-genius-scroll="receivers">Receivers</button><button type="button" class="ref-nav-link" data-genius-scroll="couplings">Couplings</button><button type="button" class="ref-nav-link" data-genius-scroll="retention">Retention</button><button type="button" class="ref-nav-link" data-genius-scroll="accessories">Accessories</button></div><div class="ref-nav-model" title="${modelName()}">${modelName()}</div></nav>`;
  }
  function catalogImage(src,alt,className='ref-catalog-image',loading='eager'){
    return `<img class="${className}" src="${src}" alt="${alt}" decoding="async" loading="${loading}">`;
  }
  function emptyReceiverImage(ear){
    return `<div class="genius-image-unavailable"><span>${sideCode(ear)}</span><strong>Image pending</strong><small>${receiverShortLabel(ear)} receiver configuration remains available.</small></div>`;
  }
  function receiverImage(ear,className=''){
    const src=receiverAsset(ear);
    return src?catalogImage(src,`${receiverEarLabel(ear)} EarWear 3.0 receiver`,className||'ref-catalog-image'):emptyReceiverImage(ear);
  }

  function featureMarkup(){
    if(!state.level)return '<div class="ref-empty-prompt">Select a treatment level to view its product specifications.</div>';
    const details=geniusData.levelDetails[state.level];
    return `<div class="genius-spec-grid"><div class="genius-spec-card"><span>Frequency Channels</span><strong>${details.frequencyChannels}</strong></div><div class="genius-spec-card"><span>Compression Controls</span><strong>${details.compressionControls}</strong></div><div class="genius-spec-card"><span>Hearing Programs</span><strong>${details.hearingPrograms}</strong></div></div><div class="ref-feature-grid genius-feature-grid">${geniusData.commonFeatures.map(feature=>`<div class="ref-feature-item included"><span class="ref-feature-check">✓</span><span>${feature}</span></div>`).join('')}</div><div class="genius-requirement-note"><strong>Ordering note:</strong> Charger sold separately. Product details list pocket, desktop, and dry-and-clean charging options.</div>`;
  }

  function receiverSelector(ear){
    const item=state.receiverSelections[ear],status=receiverStatus(ear),name=earName(ear);
    return `<div class="ref-ear-panel ${status.kind}" data-ear-panel="${ear}"><div class="ref-ear-panel-head"><div class="ref-ear-title"><span class="ref-side-marker${markerClass(ear)}" aria-hidden="true"></span><div class="ref-ear-title-copy"><strong>${name} Ear</strong><small>${ear==='left'?'Blue':'Red'} receiver</small></div></div>${receiverHasSelection(ear)?`<button type="button" class="ref-ear-clear" data-genius-clear-receiver="${ear}">Clear</button>`:''}</div><div class="row-title">Power</div><div class="ref-choice-row" aria-label="${name} receiver power">${geniusData.receivers.powers.map(value=>`<button type="button" class="ref-choice ${item.power===value?'active':''}" data-receiver-ear="${ear}" data-receiver-power="${value}" aria-pressed="${item.power===value}">${value}</button>`).join('')}</div><div class="row-title">Length</div><div class="ref-choice-row" aria-label="${name} receiver length">${geniusData.receivers.lengths.map(value=>`<button type="button" class="ref-choice ${item.length===value?'active':''}" data-receiver-ear="${ear}" data-receiver-length="${value}" aria-pressed="${item.length===value}">${value}</button>`).join('')}</div><div class="ref-ear-status ${status.kind}"><span class="ref-ear-status-dot" aria-hidden="true"></span>${status.text}</div></div>`;
  }
  function receiverPreviewEar(ear){
    const status=receiverStatus(ear),name=earName(ear);
    if(receiverReady(ear))return `<div class="ref-ear-preview complete" data-preview-ear="${ear}">${receiverImage(ear,'genius-receiver-image')}<div class="ref-ear-preview-label"><span class="ref-side-marker${markerClass(ear)}" aria-hidden="true"></span>${receiverEarLabel(ear)}</div></div>`;
    return `<div class="ref-ear-preview ${status.kind}" data-preview-ear="${ear}"><div class="ref-ear-empty-symbol ${ear==='right'?'right':''}" aria-hidden="true">${sideCode(ear)}</div><div class="ref-ear-preview-label">${name} Receiver</div><small>${status.text}</small></div>`;
  }
  function receiverPreview(){return `<div class="ref-receiver-preview-grid">${ears.map(receiverPreviewEar).join('')}</div>`;}

  function couplingSelector(ear){
    const item=state.couplingSelections[ear],coupling=activeCoupling(ear),sizes=coupling?.sizes||[],status=couplingStatus(ear),name=earName(ear);
    return `<div class="ref-ear-panel ${status.kind}" data-coupling-panel="${ear}"><div class="ref-ear-panel-head"><div class="ref-ear-title"><span class="ref-side-marker${markerClass(ear)}" aria-hidden="true"></span><div class="ref-ear-title-copy"><strong>${name} Coupling</strong><small>For the ${name.toLowerCase()} ear</small></div></div>${couplingHasSelection(ear)?`<button type="button" class="ref-ear-clear" data-genius-clear-coupling="${ear}">Clear</button>`:''}</div><div class="row-title">Type</div><div class="ref-choice-row genius-coupling-types" aria-label="${name} coupling type">${geniusData.couplings.map(value=>`<button type="button" class="ref-choice ${item.type===value.id?'active':''}" data-coupling-ear="${ear}" data-coupling-type="${value.id}" aria-pressed="${item.type===value.id}">${value.name}</button>`).join('')}</div><div class="row-title">Size</div><div class="ref-choice-row ref-coupling-size-row" aria-label="${name} coupling size">${sizes.length?sizes.map(value=>`<button type="button" class="ref-choice ${item.size===value.id?'active':''}" data-coupling-ear="${ear}" data-coupling-size="${value.id}" aria-pressed="${item.size===value.id}">${value.label}</button>`).join(''):'<span class="ref-inline-hint">Select a coupling type first.</span>'}</div><div class="ref-ear-status ${status.kind}"><span class="ref-ear-status-dot" aria-hidden="true"></span>${status.text}</div></div>`;
  }
  function couplingPreviewEar(ear){
    const status=couplingStatus(ear),name=earName(ear);
    if(couplingReady(ear))return `<div class="ref-ear-preview ${status.kind}" data-coupling-preview-ear="${ear}">${catalogImage(couplingAsset(ear),`${couplingShortLabel(ear)} ${name.toLowerCase()} coupling`,'genius-coupling-image')}<div class="ref-ear-preview-label"><span class="ref-side-marker${markerClass(ear)}" aria-hidden="true"></span>${couplingEarLabel(ear)}</div></div>`;
    return `<div class="ref-ear-preview ${status.kind}" data-coupling-preview-ear="${ear}"><div class="ref-ear-empty-symbol ${ear==='right'?'right':''}" aria-hidden="true">${sideCode(ear)}</div><div class="ref-ear-preview-label">${name} Coupling</div><small>${status.text}</small></div>`;
  }
  function couplingPreview(){return `<div class="ref-receiver-preview-grid ref-coupling-preview-grid">${ears.map(couplingPreviewEar).join('')}</div>`;}

  function retentionCard(ear){
    if(!receiverReady(ear))return `<div class="genius-retention-empty"><span class="ref-side-marker${markerClass(ear)}" aria-hidden="true"></span><strong>${earName(ear)} Ear</strong><small>Select a receiver to match its concha lock.</small></div>`;
    const label=retentionShortLabel(ear),active=retentionSelected(ear),key=`genius-${ear}-${state.receiverSelections[ear].power}`;
    return `<button type="button" class="ref-retention-card genius-retention-card ${active?'active':''}" data-retention-card="${key}" data-genius-retention-ear="${ear}" aria-pressed="${active}">${catalogImage(retentionAsset(ear),`${label} for the ${earName(ear).toLowerCase()} ear`,'genius-retention-image')}<strong><span class="ref-side-marker${markerClass(ear)}" aria-hidden="true"></span>${earName(ear)} · ${label}</strong><small>${active?'Included in configuration':'Tap to include'}</small></button>`;
  }

  function heroComponents(){
    const items=[];
    selectedReceiverEars().forEach(ear=>items.push(`<div class="ref-hero-component">${receiverAsset(ear)?catalogImage(receiverAsset(ear),`${receiverEarLabel(ear)} receiver`,'ref-hero-component-img'):emptyReceiverImage(ear)}<div><span>${earName(ear)} Receiver</span><strong>${receiverShortLabel(ear)}</strong></div></div>`));
    ears.filter(couplingReady).forEach(ear=>items.push(`<div class="ref-hero-component">${catalogImage(couplingAsset(ear),`${couplingShortLabel(ear)} coupling`,'ref-hero-component-img')}<div><span>${earName(ear)} Coupling</span><strong>${couplingShortLabel(ear)}</strong></div></div>`));
    return items.join('');
  }
  function receiverFact(ear){return receiverReady(ear)?receiverShortLabel(ear):(receiverHasSelection(ear)?'Incomplete':'Not selected');}
  function couplingFact(ear){return couplingReady(ear)?couplingShortLabel(ear):(couplingHasSelection(ear)?'Incomplete':'Not selected');}
  function retentionFact(ear){return retentionSelected(ear)?retentionShortLabel(ear):'Not selected · Optional';}

  function renderProduct(){
    const container=root();if(!container)return;
    if(sectionObserver){sectionObserver.disconnect();sectionObserver=null;}
    const color=selectedColor(),heroColor=color||geniusData.colors.find(item=>item.id==='silver'),complete=configurationComplete(),hasSelection=hasAnySelection();
    container.innerHTML=`<div class="ref-shell genius-reference-shell">
      ${breadcrumbs()}
      <div class="ref-page-head"><div><h3>Genius</h3><p class="muted">Configure the MEENERGY RIC T R 5W and review its compatible EarWear 3.0 components.</p></div><div class="ref-page-actions"><button type="button" class="secondary ref-back" data-genius-home>← Hearing Aids</button></div></div>
      ${stickyNav()}
      <div class="ref-section ref-model-hero"><div class="ref-hero-visual"><div class="ref-image-slot ref-has-catalog-image">${catalogImage(asset(`hearing-aids/${heroColor.file}`),`${geniusData.family} in ${heroColor.name}`)}</div><div class="ref-hero-components">${heroComponents()}</div></div><div><div class="ref-model-name">${modelName()}</div><div class="ref-family-name">${geniusData.family}</div><div class="ref-identity-chips"><span class="ref-identity-chip">Genius</span><span class="ref-identity-chip">RIC</span><span class="ref-identity-chip">Rechargeable</span><span class="ref-identity-chip">Telecoil</span>${state.level?`<span class="ref-identity-chip">ME${state.level}</span>`:''}${color?`<span class="ref-identity-chip">${color.name}</span>`:''}</div><div class="ref-fact-grid"><div class="ref-fact"><span>Model</span><strong>${state.level?modelName():'Not selected'}</strong></div><div class="ref-fact"><span>Color</span><strong>${color?color.name:'Not selected'}</strong></div><div class="ref-fact"><span>Left Receiver</span><strong>${receiverFact('left')}</strong></div><div class="ref-fact"><span>Left Coupling</span><strong>${couplingFact('left')}</strong></div><div class="ref-fact"><span>Right Receiver</span><strong>${receiverFact('right')}</strong></div><div class="ref-fact"><span>Right Coupling</span><strong>${couplingFact('right')}</strong></div><div class="ref-fact"><span>Left Retention</span><strong>${retentionFact('left')}</strong></div><div class="ref-fact"><span>Right Retention</span><strong>${retentionFact('right')}</strong></div></div></div></div>
      <div class="ref-config-card" aria-label="Current Genius configuration"><div class="ref-config-copy"><div class="ref-config-label">Current Configuration</div><div class="ref-config-value" aria-live="polite">${configurationText()}</div></div><div class="ref-config-actions"><span class="ref-config-badge ${complete?'':'incomplete'}">${complete?'✓ Configured':'Incomplete'}</span><button type="button" class="secondary ref-reset-config" data-genius-reset ${hasSelection?'':'disabled'}>Reset</button><button type="button" class="ref-copy-config" data-genius-save ${complete?'':'disabled'}>Save Configuration</button></div></div>
      <div class="ref-section ref-feature-section" data-genius-section="features"><div class="ref-feature-head"><div><h4>Treatment Level &amp; Features</h4><p class="muted">Compare the verified product specifications supplied for ME2 through ME5.</p></div><span class="ref-solution-badge">${state.level?`ME${state.level} · ${solutionNames[state.level]}`:'Select level'}</span></div><div class="ref-level-row ref-feature-levels" aria-label="Treatment level">${geniusData.levels.map(level=>`<button type="button" class="ref-choice ${state.level===level?'active':''}" data-level="${level}">ME${level}</button>`).join('')}</div><div class="ref-feature-content">${featureMarkup()}</div></div>
      <div class="ref-section" data-genius-section="colors"><h4>Colors</h4><p class="muted">Select the hearing-aid finish.</p><div class="ref-color-grid">${geniusData.colors.map(item=>`<div class="ref-color-card ${state.color===item.id?'active':''}" data-color="${item.id}" role="button" tabindex="0" aria-pressed="${state.color===item.id}"><div class="ref-color-chip">${catalogImage(asset(`hearing-aids/${item.file}`),`${geniusData.family} in ${item.name}`,'ref-color-product','lazy')}</div><strong>${item.name}</strong></div>`).join('')}</div></div>
      <div class="ref-section" data-genius-section="receivers"><h4>EarWear 3.0 Receivers</h4><p class="muted">Configure each ear independently. S, M, and P receivers are available in lengths 0 through 5.</p><div class="ref-ear-config-grid">${ears.map(receiverSelector).join('')}</div><div class="ref-component-preview ref-receiver-preview"><div class="ref-component-kicker">Receiver Preview</div>${receiverPreview()}</div></div>
      <div class="ref-section" data-genius-section="couplings"><h4>EarWear 3.0 Couplings</h4><p class="muted">Choose the tip or sleeve used on each selected receiver.</p><div class="ref-ear-config-grid">${ears.map(couplingSelector).join('')}</div><div class="ref-component-preview ref-coupling-preview"><div class="ref-component-kicker">Coupling Preview</div>${couplingPreview()}</div></div>
      <div class="ref-section" data-genius-section="retention"><div class="ref-section-title-row"><h4>Concha Locks</h4><span class="ref-optional-label">Optional</span></div><p class="muted">Concha locks are matched automatically to each receiver's S, M, or P power. Configure each ear independently.</p><div class="genius-retention-grid">${ears.map(retentionCard).join('')}</div><div class="ref-selection-summary"><strong>${retentionLabel()}</strong></div></div>
      <div class="ref-section" data-genius-section="accessories"><h4>Charger &amp; Maintenance</h4><p class="muted">Compatible charging and wax-management accessories supplied for this reference.</p><div class="ref-accessory-grid">${geniusData.accessories.map(item=>`<div class="ref-accessory-card"><div class="ref-image-slot ref-has-catalog-image">${catalogImage(asset(`accessories/${item.file}`),item.name,'ref-catalog-image','lazy')}</div><h5>${item.name}</h5><p>${item.type}</p></div>`).join('')}</div></div>
    </div>`;
    wireProduct(container);notifyRendered();
  }

  function renderReferenceHome(){
    if(sectionObserver){sectionObserver.disconnect();sectionObserver=null;}
    if(typeof window.renderHearingAidReferencesHome==='function')window.renderHearingAidReferencesHome();
  }
  function resetConfiguration(){
    if(!hasAnySelection()||!window.confirm('Reset this Genius configuration and start over?'))return;
    resetState();renderProduct();if(typeof window.toast==='function')window.toast('Configuration reset.');
  }
  function wireSectionNav(container){
    container.querySelectorAll('[data-genius-scroll]').forEach(button=>button.addEventListener('click',()=>container.querySelector(`[data-genius-section="${button.dataset.geniusScroll}"]`)?.scrollIntoView({behavior:'smooth',block:'start'})));
    const links=[...container.querySelectorAll('[data-genius-scroll]')],sections=[...container.querySelectorAll('[data-genius-section]')];
    if(!('IntersectionObserver' in window)||!links.length||!sections.length)return;
    sectionObserver=new IntersectionObserver(entries=>{
      const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(!visible)return;
      links.forEach(link=>link.classList.toggle('active',link.dataset.geniusScroll===visible.target.dataset.geniusSection));
    },{rootMargin:'-18% 0px -62% 0px',threshold:[0,.15,.35,.6]});
    sections.forEach(section=>sectionObserver.observe(section));
  }
  function wireProduct(container){
    container.querySelectorAll('[data-genius-home]').forEach(button=>button.addEventListener('click',renderReferenceHome));
    wireSectionNav(container);
    container.querySelectorAll('[data-level]').forEach(button=>button.addEventListener('click',()=>{state.level=Number(button.dataset.level);renderProduct();}));
    container.querySelectorAll('[data-color]').forEach(card=>{
      card.addEventListener('click',()=>{state.color=card.dataset.color;renderProduct();});
      card.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();card.click();}});
    });
    container.querySelectorAll('[data-receiver-power]').forEach(button=>button.addEventListener('click',()=>{state.receiverSelections[button.dataset.receiverEar].power=button.dataset.receiverPower;renderProduct();}));
    container.querySelectorAll('[data-receiver-length]').forEach(button=>button.addEventListener('click',()=>{state.receiverSelections[button.dataset.receiverEar].length=button.dataset.receiverLength;renderProduct();}));
    container.querySelectorAll('[data-genius-clear-receiver]').forEach(button=>button.addEventListener('click',()=>{const ear=button.dataset.geniusClearReceiver;state.receiverSelections[ear]={power:null,length:null};state.retentionSelections[ear]=false;renderProduct();}));
    container.querySelectorAll('[data-coupling-type]').forEach(button=>button.addEventListener('click',()=>{const item=state.couplingSelections[button.dataset.couplingEar];item.type=button.dataset.couplingType;item.size=null;renderProduct();}));
    container.querySelectorAll('[data-coupling-size]').forEach(button=>button.addEventListener('click',()=>{state.couplingSelections[button.dataset.couplingEar].size=button.dataset.couplingSize;renderProduct();}));
    container.querySelectorAll('[data-genius-clear-coupling]').forEach(button=>button.addEventListener('click',()=>{state.couplingSelections[button.dataset.geniusClearCoupling]={type:null,size:null};renderProduct();}));
    container.querySelectorAll('[data-genius-retention-ear]').forEach(button=>button.addEventListener('click',()=>{const ear=button.dataset.geniusRetentionEar;state.retentionSelections[ear]=!state.retentionSelections[ear];renderProduct();}));
    container.querySelector('[data-genius-reset]')?.addEventListener('click',resetConfiguration);
    container.querySelector('[data-genius-save]')?.addEventListener('click',event=>saveConfiguration(event.currentTarget));
  }

  function patchHomeCard(){
    const card=root()?.querySelector('[data-ref-product="genius"]');if(!card)return;
    card.querySelector('.ref-soon')?.remove();
    const slot=card.querySelector('.ref-image-slot');
    if(slot&&!slot.dataset.geniusImage){slot.dataset.geniusImage='1';slot.classList.add('ref-has-catalog-image');slot.innerHTML=catalogImage(asset('hearing-aids/silver.png'),`${geniusData.family} in Silver`,'ref-catalog-image','eager');}
    const description=card.querySelector('p');if(description)description.textContent=geniusData.family;
  }
  function init(){patchHomeCard();document.addEventListener('clinical-assistant:references-rendered',patchHomeCard);}

  window.renderGeniusReference=renderProduct;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
