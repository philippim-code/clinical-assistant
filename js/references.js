/* Miracle-Ear Clinical Assistant Spark reference UI refinement */
(function(){
  'use strict';

  const SPARK_STORE_URL='https://miracle-earspark.com/miracleearus/en/USD/elements/home?continue=';

  const sparkData={
    colors:[
      {id:'sand-beige',name:'Sand Beige',abbreviation:'SB'},
      {id:'sandalwood',name:'Sandalwood',abbreviation:'SW'},
      {id:'silver-gray',name:'Silver Gray',abbreviation:'SG'},
      {id:'velvet-black',name:'Velvet Black',abbreviation:'VB'}
    ],
    families:{
      standard:{title:'MEMINI E RIC',subtitle:'Spark RIC family',levels:[5,4,3,2],modelName(level){return `MEMINI E ${level} 5P R-R`;}},
      ai:{title:'MEMINI E AI RIC',subtitle:'Spark AI RIC family',levels:[5,4],modelName(level){return `MEMINI E ${level} 5P R-R AI`;}}
    },
    receivers:{powers:['S','M','P'],lengths:['00','0','1','2','3'],sides:[{id:'left',name:'Left',code:'L',color:'Blue'},{id:'right',name:'Right',code:'R',color:'Red'}]},
    domes:[
      {id:'cap',name:'Cap',sizes:['One Size']},
      {id:'open',name:'Open',sizes:['S','M','L']},
      {id:'vented',name:'Vented',sizes:['S','M','L']},
      {id:'power',name:'Power',sizes:['S','M','L']}
    ],
    retentionLocks:['S','M','L'],
    accessories:[
      {name:'MECHARGE Charger',type:'Charger'},
      {name:'CeruStop',type:'Wax Guards'}
    ]
  };
  const solutionNames={5:'Premium',4:'Advanced',3:'Standard',2:'Essential'};
  const SPARK_SAVED_CONFIGURATION_STORAGE_KEY='meClinicalAssistantSavedDeviceConfiguration';

  const state={view:'home',family:'standard',level:null,color:null,receiverSelections:{left:{power:null,length:null},right:{power:null,length:null}},couplingSelections:{left:{type:null,size:null},right:{type:null,size:null}},retention:null};
  let sectionObserver=null;

  function installStyles(){
    if(document.getElementById('references-v2-styles'))return;
    const style=document.createElement('style');
    style.id='references-v2-styles';
    style.textContent=`
      .ref-shell{display:block}
      .ref-breadcrumbs{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin:0 0 14px;color:var(--muted);font-size:13px}
      .ref-breadcrumbs button{margin:0;padding:0;background:none!important;color:var(--teal)!important;border:0!important;box-shadow:none!important;font-size:13px}
      .ref-breadcrumbs button:hover{text-decoration:underline;transform:none!important;box-shadow:none!important}
      .ref-accordion{background:var(--card);border:1px solid var(--border);border-radius:16px;box-shadow:var(--shadow-sm,0 2px 8px rgba(0,0,0,.05));overflow:hidden}
      .ref-accordion summary{list-style:none;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px 20px;cursor:pointer;color:var(--teal);font-weight:800;font-size:19px;background:#fbfefe}
      .ref-accordion summary::-webkit-details-marker{display:none}
      .ref-accordion summary:after{content:'⌃';font-size:16px;transition:transform .15s ease}
      .ref-accordion:not([open]) summary:after{transform:rotate(180deg)}
      .ref-accordion-body{padding:20px;border-top:1px solid var(--border)}
      .ref-product-grid,.ref-family-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}
      .ref-product-card,.ref-family-card{border:1px solid var(--border);border-radius:18px;background:#fff;padding:18px;text-align:center;cursor:pointer;transition:.16s;box-shadow:var(--shadow-sm,0 2px 8px rgba(0,0,0,.05))}
      .ref-product-card:hover,.ref-family-card:hover{border-color:var(--teal);transform:translateY(-2px);box-shadow:var(--shadow-md,0 8px 24px rgba(0,0,0,.1))}
      .ref-product-card h3,.ref-family-card h3{margin:12px 0 5px;color:var(--teal)}
      .ref-product-card p,.ref-family-card p{margin:0;color:var(--muted);font-size:13px}
      .ref-image-slot{height:180px;border-radius:14px;border:1px solid #d9e6e8;background:#fff;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:7px;padding:16px;color:var(--muted)}
      .ref-image-slot .ref-image-icon{font-size:34px;opacity:.45}
      .ref-image-slot strong{color:var(--text);font-size:14px}
      .ref-image-slot small{text-align:center;line-height:1.35}
      .ref-soon{display:inline-block;margin-top:10px;border-radius:999px;padding:4px 9px;background:#f2f4f5;color:var(--muted);font-size:11px;font-weight:700}
      .ref-page-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:16px;flex-wrap:wrap}
      .ref-page-head h3{font-size:26px;margin-bottom:5px}
      .ref-page-head p{margin:0}
      .ref-page-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
      .ref-page-actions > button{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;height:46px;margin:0;padding:0 17px}
      .ref-back{margin:0}
      .ref-section{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:18px;box-shadow:var(--shadow-sm,0 2px 8px rgba(0,0,0,.05));margin-top:16px;scroll-margin-top:84px}
      .ref-section h4{margin:0 0 6px;color:var(--teal);font-size:17px}
      .ref-section > p{margin:0 0 12px}
      .ref-level-row,.ref-choice-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
      .ref-choice{border:2px solid var(--border);background:#fff;color:var(--text);box-shadow:none;margin:0;padding:9px 13px;border-radius:999px;min-width:48px;transition:.12s ease}
      .ref-choice:hover{background:var(--teal-light);color:var(--teal-dark);box-shadow:none;transform:none}
      .ref-choice.active{background:var(--teal);border-color:var(--teal);color:#fff}
      .ref-choice-side{display:inline-flex;align-items:center;justify-content:center;gap:7px}
      .ref-side-marker{display:inline-block;width:11px;height:11px;border-radius:50%;background:#2472c8;box-shadow:inset 0 0 0 1px rgba(0,0,0,.12)}
      .ref-side-marker.right{background:#cf4650}
      .ref-side-marker.both{background:linear-gradient(90deg,#2472c8 0 50%,#cf4650 50% 100%)}
      .ref-choice.active .ref-side-marker{box-shadow:0 0 0 2px rgba(255,255,255,.7),inset 0 0 0 1px rgba(0,0,0,.12)}
      .ref-sticky-nav{position:sticky;top:8px;z-index:25;display:flex;align-items:center;gap:8px;margin:0 0 16px;padding:8px;background:rgba(255,255,255,.94);border:1px solid var(--border);border-radius:14px;box-shadow:0 8px 24px rgba(26,53,57,.08);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
      .ref-sticky-links{display:flex;gap:5px;overflow-x:auto;scrollbar-width:none;flex:1}
      .ref-sticky-links::-webkit-scrollbar{display:none}
      .ref-nav-link{flex:0 0 auto;margin:0;padding:8px 11px;border:0!important;border-radius:9px;background:transparent!important;color:var(--muted)!important;box-shadow:none!important;font-size:12px;font-weight:800}
      .ref-nav-link:hover,.ref-nav-link.active{background:var(--teal-light)!important;color:var(--teal-dark)!important;transform:none!important}
      .ref-nav-model{flex:0 0 auto;max-width:230px;padding:7px 10px;border-left:1px solid var(--border);font-size:11px;font-weight:800;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .ref-model-hero{display:grid;grid-template-columns:minmax(230px,.82fr) minmax(0,1.18fr);gap:22px;align-items:center;padding:20px}
      .ref-hero-visual{min-width:0}
      .ref-hero-components{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;min-height:136px;margin-top:10px}
      .ref-hero-components:empty{visibility:hidden}
      .ref-hero-component{display:grid;grid-template-columns:48px minmax(0,1fr);align-items:center;gap:8px;min-width:0;padding:8px 9px;border-radius:10px;background:#f5f9fa}
      .ref-hero-component-visual,.ref-hero-component-img{display:block;width:48px;height:48px;object-fit:contain;filter:none!important}
      .ref-hero-component-visual .ref-catalog-image{width:100%;height:100%;object-fit:contain}
      .ref-hero-component span{display:block;font-size:9px;text-transform:uppercase;letter-spacing:.055em;color:var(--muted);font-weight:850;margin-bottom:2px}
      .ref-hero-component strong{display:block;min-width:0;color:var(--text);font-size:11px;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .ref-model-name{font-size:25px;font-weight:850;color:var(--text);margin-bottom:5px;line-height:1.18}
      .ref-family-name{color:var(--teal);font-weight:750;margin-bottom:12px}
      .ref-identity-chips{display:flex;gap:7px;flex-wrap:wrap;margin:0 0 14px}
      .ref-identity-chip{display:inline-flex;align-items:center;padding:5px 9px;border-radius:999px;background:#f1f7f8;border:1px solid #d9e7e9;color:var(--teal-dark);font-size:11px;font-weight:800}
      .ref-fact-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:12px}
      .ref-fact{background:#f8fbfc;border:1px solid var(--border);border-radius:11px;padding:11px}
      .ref-fact span{display:block;font-size:10px;text-transform:uppercase;letter-spacing:.055em;color:var(--muted);font-weight:800;margin-bottom:4px}
      .ref-fact-wide{grid-column:1/-1}
      .ref-config-card{display:flex;align-items:center;justify-content:space-between;gap:14px;background:linear-gradient(135deg,var(--teal-light),#f9fcfc);border:1px solid #cfe3e5;border-radius:14px;padding:14px 16px;margin-top:16px}
      .ref-config-copy{min-width:0;flex:1 1 auto}
      .ref-config-label{font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:var(--teal-dark);font-weight:900;margin-bottom:4px}
      .ref-config-value{font-size:14px;color:var(--text);font-weight:800;line-height:1.4}
      .ref-config-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex:0 0 auto}
      .ref-config-badge{flex:0 0 auto;border:1px solid var(--border);border-radius:10px;background:#fff;color:var(--teal-dark);padding:8px 10px;font-size:11px;font-weight:850;box-shadow:var(--shadow-sm,0 2px 8px rgba(0,0,0,.05))}
      .ref-config-badge.incomplete{background:#fff;color:#627074;box-shadow:none}
      .ref-copy-config,.ref-reset-config{box-sizing:border-box;min-height:38px;margin:0;padding:8px 12px;border-radius:10px;font-size:12px;white-space:nowrap}
      .ref-copy-config:disabled{background:#dfe7e9!important;border-color:#dfe7e9!important;color:#849195!important;box-shadow:none!important;cursor:not-allowed;transform:none!important}
      .ref-reset-config:disabled{background:#fff!important;border-color:var(--border)!important;color:#9aa4a7!important;box-shadow:none!important;cursor:not-allowed;transform:none!important}
      .ref-inline-hint,.ref-empty-prompt{color:var(--muted);font-size:12px}
      .ref-empty-prompt{display:flex;align-items:center;justify-content:center;min-height:86px;border:1px dashed var(--border);border-radius:11px;background:#fafcfc;text-align:center;padding:14px}
      .ref-color-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:12px}
      .ref-color-card{border:2px solid var(--border);border-radius:13px;background:#fff;padding:10px;cursor:pointer;text-align:center;transition:transform .12s ease,border-color .12s ease,box-shadow .12s ease}
      .ref-color-card.active{border-color:var(--teal);box-shadow:0 5px 16px rgba(0,140,149,.12);transform:translateY(-2px)}
      .ref-color-chip{height:38px;border-radius:9px;border:1px solid rgba(0,0,0,.08);margin-bottom:7px}
      .ref-color-card strong{font-size:12px}
      .ref-component-grid{display:grid;grid-template-columns:minmax(0,.9fr) minmax(260px,1.1fr);gap:18px;align-items:start}
      .ref-component-preview{border:1px solid var(--border);border-radius:14px;padding:14px;background:#fbfefe}
      .ref-component-kicker{font-size:10px;text-transform:uppercase;letter-spacing:.065em;color:var(--muted);font-weight:850;margin-bottom:8px}
      .ref-selection-summary{margin-top:12px;padding:12px;border-radius:10px;background:var(--teal-light);color:var(--teal-dark);font-weight:800}
      .ref-selection-summary strong{color:var(--text)}
      .ref-ear-config-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:14px}
      .ref-ear-panel{min-width:0;border-radius:13px;background:#f7fafb;padding:14px}
      .ref-ear-panel.complete{background:#f1f8f8}
      .ref-ear-panel.partial{background:#fff9ef}
      .ref-ear-panel-head{display:flex;align-items:center;justify-content:space-between;gap:10px}
      .ref-ear-title{display:flex;align-items:center;gap:8px;min-width:0}
      .ref-ear-title-copy{min-width:0}
      .ref-ear-title strong{display:block;color:var(--text);font-size:14px}
      .ref-ear-title small{display:block;color:var(--muted);font-size:10px;margin-top:2px}
      .ref-ear-panel .row-title{font-size:12px;margin-top:12px}
      .ref-ear-panel .ref-choice-row{margin-top:7px}
      .ref-ear-panel .ref-choice{padding:8px 11px;min-width:43px}
      .ref-ear-clear{min-height:30px!important;margin:0;padding:5px 8px;border:1px solid var(--border);border-radius:8px;background:transparent;color:var(--muted);box-shadow:none;font-size:10px}
      .ref-ear-clear:hover{background:#fff;color:var(--teal-dark);border-color:#b9d4d7;box-shadow:none;transform:none}
      .ref-ear-status{display:flex;align-items:center;gap:6px;min-height:28px;margin-top:12px;padding:7px 9px;border-radius:8px;background:#fff;color:var(--muted);font-size:11px;font-weight:750}
      .ref-ear-status.complete{color:var(--teal-dark)}
      .ref-ear-status.partial{color:#8a5a0a}
      .ref-ear-status-dot{width:7px;height:7px;border-radius:50%;background:#aeb8bb;flex:0 0 auto}
      .ref-ear-status.complete .ref-ear-status-dot{background:var(--teal)}
      .ref-ear-status.partial .ref-ear-status-dot{background:#d49327}
      .ref-receiver-preview{margin-top:14px}
      .ref-coupling-preview{margin-top:14px}
      .ref-receiver-preview-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));min-height:220px}
      .ref-ear-preview{display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:0;min-height:220px;padding:8px 14px;text-align:center}
      .ref-ear-preview+.ref-ear-preview{border-left:1px solid var(--border)}
      .ref-ear-preview img{display:block;width:100%;height:166px;max-width:260px;object-fit:contain;filter:none!important}
      .ref-coupling-preview .ref-ear-preview img{height:156px;max-width:220px}
      .ref-coupling-size-row{min-height:44px;align-items:center}
      .ref-ear-preview-label{display:flex;align-items:center;justify-content:center;gap:6px;min-height:20px;color:var(--text);font-size:12px;font-weight:800}
      .ref-ear-empty-symbol{display:grid;place-items:center;width:48px;height:48px;margin-bottom:11px;border-radius:50%;background:#eaf2f7;color:#2472c8;font-size:18px;font-weight:900}
      .ref-ear-empty-symbol.right{background:#f7e9eb;color:#bf3e49}
      .ref-ear-preview small{display:block;color:var(--muted);font-size:10px;margin-top:3px}
      .ref-section-title-row{display:flex;align-items:center;gap:9px;flex-wrap:wrap}
      .ref-section-title-row h4{margin-bottom:0}
      .ref-optional-label{display:inline-flex;align-items:center;padding:4px 7px;border:1px solid var(--border);border-radius:999px;background:#f7f9fa;color:var(--muted);font-size:9px;font-weight:850;text-transform:uppercase;letter-spacing:.05em}
      .ref-accessory-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:12px}
      .ref-accessory-card{border:1px solid var(--border);border-radius:14px;padding:14px;background:#fff;box-shadow:0 2px 7px rgba(25,58,62,.04)}
      .ref-accessory-card h5{margin:10px 0 3px;font-size:15px;color:var(--text)}
      .ref-accessory-card p{margin:0;color:var(--muted);font-size:12px}
      @media(max-width:760px){
        .ref-product-grid,.ref-family-grid,.ref-model-hero,.ref-component-grid,.ref-accessory-grid{grid-template-columns:1fr}
        .ref-color-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
        .ref-image-slot{height:150px}
        .ref-page-actions{width:100%}.ref-page-actions button{flex:1}
        .ref-sticky-nav{top:6px;margin-left:-2px;margin-right:-2px;padding:6px}
        .ref-nav-model{display:none}
        .ref-nav-link{padding:8px 10px}
        .ref-model-hero{padding:16px;gap:14px}
        .ref-hero-components{grid-template-columns:1fr;min-height:0}
        .ref-hero-components:empty{display:none;visibility:visible}
        .ref-model-name{font-size:22px}
        .ref-config-card{align-items:flex-start;flex-direction:column}
        .ref-config-actions{width:100%;justify-content:flex-start;flex-wrap:wrap}
        .ref-copy-config{margin-left:auto}
        .ref-ear-config-grid{grid-template-columns:1fr}
        .ref-receiver-preview-grid{min-height:190px}
        .ref-ear-preview{min-height:190px;padding:8px}
        .ref-ear-preview img{height:142px}
        .ref-coupling-preview .ref-ear-preview img{height:132px}
      }
    `;
    document.head.appendChild(style);
  }

  function placeholder(label,note='Loading product image…'){
    return `<div class="ref-image-slot"><div class="ref-image-icon">🦻</div><strong>${label}</strong>${note?`<small>${note}</small>`:''}</div>`;
  }

  function colorVisual(id){
    const map={'sand-beige':'linear-gradient(135deg,#d5c2a7,#eee4d4)','sandalwood':'linear-gradient(135deg,#9e7e66,#c4a48c)','silver-gray':'linear-gradient(135deg,#aeb5b7,#e4e7e8)','velvet-black':'linear-gradient(135deg,#1d2328,#545c62)'};
    return map[id]||'#ddd';
  }

  function referencesRoot(){return document.getElementById('references');}
  function notifyRendered(){document.dispatchEvent(new CustomEvent('clinical-assistant:references-rendered'));}
  function scrollReferencesTop(){const el=referencesRoot();if(el)el.scrollIntoView({behavior:'smooth',block:'start'});}
  function activeFamily(){return sparkData.families[state.family]||sparkData.families.standard;}
  function selectedColor(){return sparkData.colors.find(c=>c.id===state.color)||null;}
  function resetConfiguration(familyId){
    state.family=familyId;state.level=null;state.color=null;state.receiverSelections={left:{power:null,length:null},right:{power:null,length:null}};state.couplingSelections={left:{type:null,size:null},right:{type:null,size:null}};state.retention=null;
  }
  const receiverEars=['left','right'];
  function earName(ear){return ear==='left'?'Left':'Right';}
  function earCode(ear){return ear==='left'?'AS':'AD';}
  function receiverHasSelection(ear){const item=state.receiverSelections[ear];return Boolean(item?.power||item?.length);}
  function receiverReady(ear){const item=state.receiverSelections[ear];return Boolean(item?.power&&item?.length);}
  function receiverPartial(ear){return receiverHasSelection(ear)&&!receiverReady(ear);}
  function selectedReceiverEars(){return receiverEars.filter(receiverReady);}
  function receiverConfigurationComplete(){return selectedReceiverEars().length>0&&!receiverEars.some(receiverPartial);}
  function isBilateral(){return selectedReceiverEars().length===2;}
  function receiverEarLabel(ear){const item=state.receiverSelections[ear];return receiverReady(ear)?`${item.length}${item.power} ${ear==='left'?'Left':'Right'}`:'';}
  function receiverEarStatus(ear){
    const item=state.receiverSelections[ear];
    if(receiverReady(ear))return {kind:'complete',text:`Ready · ${item.length}${item.power}`};
    if(item.power)return {kind:'partial',text:'Choose a receiver length'};
    if(item.length)return {kind:'partial',text:'Choose a receiver power'};
    return {kind:'empty',text:'Not selected'};
  }
  function receiverLabel(){
    const ready=selectedReceiverEars(),partial=receiverEars.filter(receiverPartial);
    if(partial.length)return `Complete ${partial.map(earName).join(' and ')} receiver`;
    if(ready.length)return ready.map(receiverEarLabel).join(' + ');
    return 'Select at least one receiver';
  }
  function activeCoupling(ear){const item=state.couplingSelections[ear];return sparkData.domes.find(dome=>dome.id===item?.type)||null;}
  function couplingHasSelection(ear){const item=state.couplingSelections[ear];return Boolean(item?.type||item?.size);}
  function couplingReady(ear){const item=state.couplingSelections[ear],coupling=activeCoupling(ear);return Boolean(coupling&&item?.size&&coupling.sizes.includes(item.size));}
  function couplingPartial(ear){return couplingHasSelection(ear)&&!couplingReady(ear);}
  function couplingShortLabel(ear){const item=state.couplingSelections[ear],coupling=activeCoupling(ear);if(!couplingReady(ear))return '';return `${item.size==='One Size'?'':`${item.size} `}${coupling.name}`;}
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
    return selected.length>0&&selected.every(couplingReady)&&!receiverEars.some(couplingPartial)&&!receiverEars.some(ear=>couplingReady(ear)&&!receiverReady(ear));
  }
  function couplingLabel(){
    if(couplingConfigurationComplete())return selectedReceiverEars().map(couplingEarLabel).join(' + ');
    if(selectedReceiverEars().length||receiverEars.some(couplingHasSelection))return 'Complete selected couplings';
    return 'Select coupling';
  }
  function configurationComplete(){return Boolean(state.level&&selectedColor()&&receiverConfigurationComplete()&&couplingConfigurationComplete());}
  function hasAnyConfigurationSelection(){return Boolean(state.level||state.color||receiverEars.some(receiverHasSelection)||receiverEars.some(couplingHasSelection)||state.retention);}
  function configurationText(){
    const family=activeFamily(),color=selectedColor();
    const parts=[state.level?family.modelName(state.level):'Select treatment level',color?color.name:'Select color',receiverConfigurationComplete()?receiverLabel():(receiverEars.some(receiverHasSelection)?receiverLabel():'Select at least one receiver'),couplingLabel()];
    if(state.retention)parts.push(`${state.retention} Retention Lock`);
    return parts.join(' · ');
  }
  function receiverClinicalItems(){
    if(isBilateral()){
      const left=state.receiverSelections.left,right=state.receiverSelections.right;
      return left.power===right.power&&left.length===right.length?[`${left.length}${left.power} receivers AU`]:[`${left.length}${left.power} receiver AS`,`${right.length}${right.power} receiver AD`];
    }
    const selectedEar=selectedReceiverEars()[0],item=state.receiverSelections[selectedEar];
    return [`${item.length}${item.power} receiver ${earCode(selectedEar)}`];
  }
  function couplingClinicalDescription(ear,plural=false){const item=state.couplingSelections[ear],coupling=activeCoupling(ear),size=item.size==='One Size'?'':`${item.size} `;return `${size}${coupling.name.toLowerCase()} dome${plural?'s':''}`;}
  function couplingClinicalItems(){
    const selected=selectedReceiverEars();
    if(selected.length===2){
      const left=state.couplingSelections.left,right=state.couplingSelections.right;
      if(left.type===right.type&&left.size===right.size)return [`${couplingClinicalDescription('left',true)} AU`];
    }
    return selected.map(ear=>`${couplingClinicalDescription(ear)} ${earCode(ear)}`);
  }
  function retentionClinicalText(){return `${state.retention} retention lock${isBilateral()?'s':''}`;}
  function clinicalNoteText(){
    const family=activeFamily(),color=selectedColor(),items=[`Spark ${family.modelName(state.level)}`,color.abbreviation,...receiverClinicalItems(),...couplingClinicalItems()];
    if(state.retention)items.push(retentionClinicalText());
    return `${items.join(', ')}.`;
  }
  function legacyCopy(text){const area=document.createElement('textarea');area.value=text;area.setAttribute('readonly','');area.style.position='fixed';area.style.opacity='0';document.body.appendChild(area);area.select();area.setSelectionRange(0,text.length);let copied=false;try{copied=document.execCommand('copy')}catch(_){copied=false}area.remove();return copied;}
  function saveConfigurationForWorkflow(button){
    if(!configurationComplete())return;
    const text=clinicalNoteText(),record={source:'Spark Reference',family:activeFamily().title,model:activeFamily().modelName(state.level),deviceText:text.replace(/[.]$/,''),fullText:text,savedAt:new Date().toISOString()};
    let saved=false;
    try{localStorage.setItem(SPARK_SAVED_CONFIGURATION_STORAGE_KEY,JSON.stringify(record));saved=true;window.dispatchEvent(new CustomEvent('clinical-assistant:configuration-saved',{detail:record}));}catch(e){saved=false;}
    const finish=(copied)=>{
      if(typeof window.toast==='function')window.toast(saved?(copied?'✓ Configuration saved and copied.':'✓ Configuration saved. Clipboard unavailable.'):(copied?'Configuration copied. Saving unavailable.':'Could not save configuration.'));
      if(button){button.textContent=saved?'Saved ✓':(copied?'Copied':'Try Again');setTimeout(()=>{if(button.isConnected)button.textContent='Save Configuration'},1600)}
    };
    if(navigator.clipboard?.writeText)navigator.clipboard.writeText(text).then(()=>finish(true),()=>finish(legacyCopy(text)));
    else finish(legacyCopy(text));
  }
  function receiverSelectorMarkup(ear){
    const item=state.receiverSelections[ear],status=receiverEarStatus(ear),name=ear==='left'?'Left':'Right',markerClass=ear==='right'?' right':'';
    return `<div class="ref-ear-panel ${status.kind}" data-ear-panel="${ear}"><div class="ref-ear-panel-head"><div class="ref-ear-title"><span class="ref-side-marker${markerClass}" aria-hidden="true"></span><div class="ref-ear-title-copy"><strong>${name} Ear</strong><small>${ear==='left'?'Blue':'Red'} receiver</small></div></div>${receiverHasSelection(ear)?`<button type="button" class="ref-ear-clear" data-clear-receiver="${ear}">Clear</button>`:''}</div><div class="row-title">Power</div><div class="ref-choice-row" aria-label="${name} receiver power">${sparkData.receivers.powers.map(value=>`<button type="button" class="ref-choice ${item.power===value?'active':''}" data-receiver-ear="${ear}" data-receiver-power="${value}" aria-pressed="${item.power===value}">${value}</button>`).join('')}</div><div class="row-title">Length</div><div class="ref-choice-row" aria-label="${name} receiver length">${sparkData.receivers.lengths.map(value=>`<button type="button" class="ref-choice ${item.length===value?'active':''}" data-receiver-ear="${ear}" data-receiver-length="${value}" aria-pressed="${item.length===value}">${value}</button>`).join('')}</div><div class="ref-ear-status ${status.kind}"><span class="ref-ear-status-dot" aria-hidden="true"></span>${status.text}</div></div>`;
  }
  function receiverPreviewEarMarkup(ear){
    const status=receiverEarStatus(ear),name=ear==='left'?'Left':'Right',markerClass=ear==='right'?' right':'',assetSide=ear==='left'?'L':'R',item=state.receiverSelections[ear];
    if(receiverReady(ear))return `<div class="ref-ear-preview complete" data-preview-ear="${ear}"><img src="assets/spark/catalog/receivers/${assetSide}-${item.length}-${item.power}.png?v=dev24" alt="${receiverEarLabel(ear)} Spark receiver"><div class="ref-ear-preview-label"><span class="ref-side-marker${markerClass}" aria-hidden="true"></span>${receiverEarLabel(ear)}</div></div>`;
    return `<div class="ref-ear-preview ${status.kind}" data-preview-ear="${ear}"><div class="ref-ear-empty-symbol ${ear==='right'?'right':''}" aria-hidden="true">${ear==='left'?'L':'R'}</div><div class="ref-ear-preview-label">${name} Receiver</div><small>${status.text}</small></div>`;
  }
  function receiverPreviewMarkup(){return `<div class="ref-receiver-preview-grid">${receiverEars.map(receiverPreviewEarMarkup).join('')}</div>`;}
  function couplingAsset(ear){
    const item=state.couplingSelections[ear],coupling=activeCoupling(ear);
    if(!couplingReady(ear))return '';
    const filename=coupling.id==='cap'?'cap':`${coupling.id}-${item.size.toLowerCase()}`;
    return `assets/spark/catalog/domes/${filename}.png?v=dev24`;
  }
  function couplingSelectorMarkup(ear){
    const item=state.couplingSelections[ear],coupling=activeCoupling(ear),sizes=coupling?coupling.sizes:[],status=couplingStatus(ear),name=earName(ear),markerClass=ear==='right'?' right':'';
    return `<div class="ref-ear-panel ${status.kind}" data-coupling-panel="${ear}"><div class="ref-ear-panel-head"><div class="ref-ear-title"><span class="ref-side-marker${markerClass}" aria-hidden="true"></span><div class="ref-ear-title-copy"><strong>${name} Coupling</strong><small>For the ${name.toLowerCase()} ear</small></div></div>${couplingHasSelection(ear)?`<button type="button" class="ref-ear-clear" data-clear-coupling="${ear}">Clear</button>`:''}</div><div class="row-title">Type</div><div class="ref-choice-row" aria-label="${name} coupling type">${sparkData.domes.map(value=>`<button type="button" class="ref-choice ${item.type===value.id?'active':''}" data-coupling-ear="${ear}" data-coupling-type="${value.id}" aria-pressed="${item.type===value.id}">${value.name}</button>`).join('')}</div><div class="row-title">Size</div><div class="ref-choice-row ref-coupling-size-row" aria-label="${name} coupling size">${sizes.length?sizes.map(value=>`<button type="button" class="ref-choice ${item.size===value?'active':''}" data-coupling-ear="${ear}" data-coupling-size="${value}" aria-pressed="${item.size===value}">${value}</button>`).join(''):'<span class="ref-inline-hint">Select a coupling type first.</span>'}</div><div class="ref-ear-status ${status.kind}"><span class="ref-ear-status-dot" aria-hidden="true"></span>${status.text}</div></div>`;
  }
  function couplingPreviewEarMarkup(ear){
    const status=couplingStatus(ear),name=earName(ear),markerClass=ear==='right'?' right':'';
    if(couplingReady(ear))return `<div class="ref-ear-preview ${status.kind}" data-coupling-preview-ear="${ear}"><img src="${couplingAsset(ear)}" alt="${couplingShortLabel(ear)} ${name.toLowerCase()} coupling"><div class="ref-ear-preview-label"><span class="ref-side-marker${markerClass}" aria-hidden="true"></span>${couplingEarLabel(ear)}</div></div>`;
    return `<div class="ref-ear-preview ${status.kind}" data-coupling-preview-ear="${ear}"><div class="ref-ear-empty-symbol ${ear==='right'?'right':''}" aria-hidden="true">${ear==='left'?'L':'R'}</div><div class="ref-ear-preview-label">${name} Coupling</div><small>${status.text}</small></div>`;
  }
  function couplingPreviewMarkup(){return `<div class="ref-receiver-preview-grid ref-coupling-preview-grid">${receiverEars.map(couplingPreviewEarMarkup).join('')}</div>`;}
  function heroComponentsMarkup(){
    const items=selectedReceiverEars().map(ear=>{const receiver=state.receiverSelections[ear],side=ear==='left'?'L':'R';return `<div class="ref-hero-component"><img class="ref-hero-component-img" src="assets/spark/catalog/receivers/${side}-${receiver.length}-${receiver.power}.png?v=dev24" alt="${receiverEarLabel(ear)} Spark receiver"><div><span>${earName(ear)} Receiver</span><strong>${receiver.length}${receiver.power}</strong></div></div>`;});
    receiverEars.filter(couplingReady).forEach(ear=>items.push(`<div class="ref-hero-component"><img class="ref-hero-component-img" src="${couplingAsset(ear)}" alt="${couplingShortLabel(ear)} ${earName(ear).toLowerCase()} coupling"><div><span>${earName(ear)} Coupling</span><strong>${couplingShortLabel(ear)}</strong></div></div>`));
    return items.join('');
  }
  function receiverFactText(ear){const item=state.receiverSelections[ear];return receiverReady(ear)?`${item.length}${item.power}`:(receiverHasSelection(ear)?'Incomplete':'Not selected');}
  function couplingFactText(ear){return couplingReady(ear)?couplingShortLabel(ear):(couplingHasSelection(ear)?'Incomplete':'Not selected');}
  function resetCurrentConfiguration(){
    if(!hasAnyConfigurationSelection()||!window.confirm('Reset this Spark configuration and start over?'))return;
    resetConfiguration(state.family);renderSparkProduct();if(typeof window.toast==='function')window.toast('Configuration reset.');
  }

  function renderHome(){
    state.view='home';
    if(sectionObserver){sectionObserver.disconnect();sectionObserver=null;}
    const root=referencesRoot();if(!root)return;
    root.innerHTML=`<div class="ref-shell">
      <details class="ref-accordion" open>
        <summary>🦻 Hearing Aids</summary>
        <div class="ref-accordion-body">
          <p class="muted" style="margin-top:0">Select a hearing-aid platform to open its product reference.</p>
          <div class="ref-product-grid">
            <article class="ref-product-card" data-ref-product="spark" role="button" tabindex="0">${placeholder('Spark · Silver Gray')}<h3>Spark</h3><p>MEMINI E RIC and MEMINI E AI RIC</p></article>
            <article class="ref-product-card" data-ref-product="genius" role="button" tabindex="0">${placeholder('Genius','Product reference coming soon.')}<h3>Genius</h3><p>Genius product reference</p><span class="ref-soon">Coming Soon</span></article>
          </div>
        </div>
      </details>
    </div>`;
    root.querySelector('[data-ref-product="spark"]').addEventListener('click',renderSparkLanding);
    root.querySelector('[data-ref-product="genius"]').addEventListener('click',renderGeniusPlaceholder);
    root.querySelectorAll('[data-ref-product]').forEach(card=>card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();card.click();}}));
    notifyRendered();
  }

  function breadcrumb(items){return `<div class="ref-breadcrumbs">${items.map(item=>item.action?`<button type="button" data-ref-breadcrumb="${item.action}">${item.label}</button><span>›</span>`:`<strong>${item.label}</strong>`).join('')}</div>`;}
  function wireBreadcrumbs(root){root.querySelectorAll('[data-ref-breadcrumb="home"]').forEach(b=>b.addEventListener('click',renderHome));root.querySelectorAll('[data-ref-breadcrumb="spark"]').forEach(b=>b.addEventListener('click',renderSparkLanding));}

  function renderSparkLanding(){
    state.view='spark';
    if(sectionObserver){sectionObserver.disconnect();sectionObserver=null;}
    const root=referencesRoot();if(!root)return;
    root.innerHTML=`<div class="ref-shell">
      ${breadcrumb([{label:'References',action:'home'},{label:'Hearing Aids',action:'home'},{label:'Spark'}])}
      <div class="ref-page-head"><div><h3>Spark</h3><p class="muted">Choose a Spark RIC family to open its complete fitting-component reference.</p></div><div class="ref-page-actions"><button type="button" class="secondary ref-back" data-ref-breadcrumb="home">← Hearing Aids</button><button type="button" class="primary" id="openSparkStore">Open Spark Store ↗</button></div></div>
      <div class="ref-family-grid">
        <article class="ref-family-card" data-family="standard" role="button" tabindex="0">${placeholder('MEMINI E RIC · Silver Gray')}<h3>MEMINI E RIC</h3><p>Treatment levels E5, E4, E3, E2</p></article>
        <article class="ref-family-card" data-family="ai" role="button" tabindex="0">${placeholder('MEMINI E AI RIC · Silver Gray')}<h3>MEMINI E AI RIC</h3><p>Treatment levels E5, E4</p></article>
      </div>
    </div>`;
    wireBreadcrumbs(root);
    root.querySelector('#openSparkStore').addEventListener('click',()=>window.location.assign(SPARK_STORE_URL));
    root.querySelectorAll('[data-family]').forEach(card=>{card.addEventListener('click',()=>{resetConfiguration(card.dataset.family);renderSparkProduct();});card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();card.click();}});});
    notifyRendered();scrollReferencesTop();
  }

  function renderGeniusPlaceholder(){
    state.view='genius';if(sectionObserver){sectionObserver.disconnect();sectionObserver=null;}
    const root=referencesRoot();if(!root)return;
    root.innerHTML=`<div class="ref-shell">${breadcrumb([{label:'References',action:'home'},{label:'Hearing Aids',action:'home'},{label:'Genius'}])}<div class="ref-page-head"><div><h3>Genius</h3><p class="muted">Genius will use the same polished product-reference structure established for Spark.</p></div><button type="button" class="secondary ref-back" data-ref-breadcrumb="home">← Hearing Aids</button></div><div class="ref-section">${placeholder('Genius','Product data and imagery have not been added yet.')}</div></div>`;
    wireBreadcrumbs(root);notifyRendered();scrollReferencesTop();
  }

  function stickyNav(model){return `<nav class="ref-sticky-nav" aria-label="Spark reference sections"><div class="ref-sticky-links"><button type="button" class="ref-nav-link active" data-scroll-section="features">Features</button><button type="button" class="ref-nav-link" data-scroll-section="colors">Colors</button><button type="button" class="ref-nav-link" data-scroll-section="receivers">Receivers</button><button type="button" class="ref-nav-link" data-scroll-section="couplings">Couplings</button><button type="button" class="ref-nav-link" data-scroll-section="retention">Retention</button><button type="button" class="ref-nav-link" data-scroll-section="accessories">Accessories</button></div><div class="ref-nav-model" title="${model}">${model}</div></nav>`;}

  function wireSectionNav(root){
    root.querySelectorAll('[data-scroll-section]').forEach(button=>button.addEventListener('click',()=>{const target=root.querySelector(`[data-ref-section="${button.dataset.scrollSection}"]`);if(target)target.scrollIntoView({behavior:'smooth',block:'start'});}));
    if(sectionObserver)sectionObserver.disconnect();
    const links=[...root.querySelectorAll('[data-scroll-section]')],sections=[...root.querySelectorAll('[data-ref-section]')];
    if(!('IntersectionObserver' in window)||!links.length||!sections.length)return;
    sectionObserver=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(!visible)return;const id=visible.target.dataset.refSection;links.forEach(link=>link.classList.toggle('active',link.dataset.scrollSection===id));},{rootMargin:'-18% 0px -62% 0px',threshold:[0,.15,.35,.6]});
    sections.forEach(section=>sectionObserver.observe(section));
  }

  function renderSparkProduct(){
    state.view='product';
    const family=activeFamily();if(state.level&&!family.levels.includes(state.level))state.level=null;
    const model=state.level?family.modelName(state.level):family.title,color=selectedColor(),isComplete=configurationComplete(),hasAnySelection=hasAnyConfigurationSelection();
    const root=referencesRoot();if(!root)return;
    root.innerHTML=`<div class="ref-shell">
      ${breadcrumb([{label:'References',action:'home'},{label:'Hearing Aids',action:'home'},{label:'Spark',action:'spark'},{label:family.title}])}
      <div class="ref-page-head"><div><h3>${family.title}</h3><p class="muted">Configure the device and review compatible Spark fitting components.</p></div><div class="ref-page-actions"><button type="button" class="secondary ref-back" data-ref-breadcrumb="spark">← Spark</button><button type="button" class="primary" id="openSparkStore">Open Spark Store ↗</button></div></div>
      ${stickyNav(model)}
      <div class="ref-section ref-model-hero"><div class="ref-hero-visual">${placeholder(color?`${family.title} · ${color.name}`:family.title)}<div class="ref-hero-components">${heroComponentsMarkup()}</div></div><div><div class="ref-model-name">${model}</div><div class="ref-family-name">${family.title}</div><div class="ref-identity-chips"><span class="ref-identity-chip">Spark</span><span class="ref-identity-chip">RIC</span>${state.level?`<span class="ref-identity-chip">E${state.level}</span>`:''}${color?`<span class="ref-identity-chip">${color.name}</span>`:''}</div><div class="ref-fact-grid"><div class="ref-fact"><span>Model</span><strong>${state.level?model:'Not selected'}</strong></div><div class="ref-fact"><span>Color</span><strong>${color?color.name:'Not selected'}</strong></div><div class="ref-fact"><span>Left Receiver</span><strong>${receiverFactText('left')}</strong></div><div class="ref-fact"><span>Left Coupling</span><strong>${couplingFactText('left')}</strong></div><div class="ref-fact"><span>Right Receiver</span><strong>${receiverFactText('right')}</strong></div><div class="ref-fact"><span>Right Coupling</span><strong>${couplingFactText('right')}</strong></div><div class="ref-fact ref-fact-wide"><span>Retention</span><strong>${state.retention?`${state.retention} Lock`:'Not selected · Optional'}</strong></div></div></div></div>
      <div class="ref-config-card" aria-label="Current Spark configuration"><div class="ref-config-copy"><div class="ref-config-label">Current Configuration</div><div class="ref-config-value" aria-live="polite">${configurationText()}</div></div><div class="ref-config-actions"><span class="ref-config-badge ${isComplete?'':'incomplete'}">${isComplete?'✓ Configured':'Incomplete'}</span><button type="button" class="secondary ref-reset-config" data-reset-configuration ${hasAnySelection?'':'disabled'}>Reset</button><button type="button" class="ref-copy-config" data-save-configuration ${isComplete?'':'disabled'}>Save Configuration</button></div></div>
      <div class="ref-section ref-feature-section" data-ref-section="features"><div class="ref-feature-head"><div><h4>Treatment Level &amp; Features</h4><p class="muted">Switch levels to compare included and unavailable features.</p></div><span class="ref-solution-badge">${state.level?`E${state.level} · ${solutionNames[state.level]}`:'Select level'}</span></div><div class="ref-level-row ref-feature-levels" aria-label="Treatment level">${family.levels.map(level=>`<button type="button" class="ref-choice ${state.level===level?'active':''}" data-level="${level}">E${level}</button>`).join('')}</div><div class="ref-feature-content">${state.level?'':'<div class="ref-empty-prompt">Select a treatment level to compare its included features.</div>'}</div></div>
      <div class="ref-section" data-ref-section="colors"><h4>Colors</h4><p class="muted">Select the hearing-aid finish.</p><div class="ref-color-grid">${sparkData.colors.map(item=>`<div class="ref-color-card ${state.color===item.id?'active':''}" data-color="${item.id}" role="button" tabindex="0"><div class="ref-color-chip" style="background:${colorVisual(item.id)}"></div><strong>${item.name}</strong></div>`).join('')}</div></div>
      <div class="ref-section" data-ref-section="receivers"><h4>Receivers</h4><p class="muted">Configure each ear independently. Complete either ear for a unilateral fitting or both for a bilateral fitting.</p><div class="ref-ear-config-grid">${receiverEars.map(receiverSelectorMarkup).join('')}</div><div class="ref-component-preview ref-receiver-preview"><div class="ref-component-kicker">Receiver Preview</div>${receiverPreviewMarkup()}</div></div>
      <div class="ref-section" data-ref-section="couplings"><h4>Couplings</h4><p class="muted">Configure each ear independently. Cap is one size; Open, Vented, and Power domes are available in S, M, and L.</p><div class="ref-ear-config-grid">${receiverEars.map(couplingSelectorMarkup).join('')}</div><div class="ref-component-preview ref-coupling-preview"><div class="ref-component-kicker">Coupling Preview</div>${couplingPreviewMarkup()}</div></div>
      <div class="ref-section" data-ref-section="retention"><div class="ref-section-title-row"><h4>Retention Locks</h4><span class="ref-optional-label">Optional</span></div><p class="muted">Select a size only when a retention lock is being used. Tap the selected size again to clear it.</p><div class="ref-choice-row">${sparkData.retentionLocks.map(x=>`<button type="button" class="ref-choice ${state.retention===x?'active':''}" data-retention="${x}" aria-pressed="${state.retention===x}">${x}</button>`).join('')}</div><div class="ref-selection-summary"><strong>${state.retention?`${state.retention} Retention Lock`:'No retention lock selected'}</strong></div></div>
      <div class="ref-section" data-ref-section="accessories"><h4>Charger & Maintenance</h4><p class="muted">Spark charging and wax-management accessories.</p><div class="ref-accessory-grid">${sparkData.accessories.map(item=>`<div class="ref-accessory-card">${placeholder(item.name)}<h5>${item.name}</h5><p>${item.type}</p></div>`).join('')}</div></div>
    </div>`;
    wireBreadcrumbs(root);wireSectionNav(root);
    root.querySelector('#openSparkStore').addEventListener('click',()=>window.location.assign(SPARK_STORE_URL));
    root.querySelectorAll('[data-level]').forEach(b=>b.addEventListener('click',()=>{state.level=Number(b.dataset.level);renderSparkProduct();}));
    root.querySelectorAll('[data-color]').forEach(card=>{card.addEventListener('click',()=>{state.color=card.dataset.color;renderSparkProduct();});card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();card.click();}});});
    root.querySelectorAll('[data-receiver-power]').forEach(b=>b.addEventListener('click',()=>{state.receiverSelections[b.dataset.receiverEar].power=b.dataset.receiverPower;renderSparkProduct();}));
    root.querySelectorAll('[data-receiver-length]').forEach(b=>b.addEventListener('click',()=>{state.receiverSelections[b.dataset.receiverEar].length=b.dataset.receiverLength;renderSparkProduct();}));
    root.querySelectorAll('[data-clear-receiver]').forEach(b=>b.addEventListener('click',()=>{state.receiverSelections[b.dataset.clearReceiver]={power:null,length:null};renderSparkProduct();}));
    root.querySelectorAll('[data-coupling-type]').forEach(b=>b.addEventListener('click',()=>{const item=state.couplingSelections[b.dataset.couplingEar];item.type=b.dataset.couplingType;item.size=null;renderSparkProduct();}));
    root.querySelectorAll('[data-coupling-size]').forEach(b=>b.addEventListener('click',()=>{state.couplingSelections[b.dataset.couplingEar].size=b.dataset.couplingSize;renderSparkProduct();}));
    root.querySelectorAll('[data-clear-coupling]').forEach(b=>b.addEventListener('click',()=>{state.couplingSelections[b.dataset.clearCoupling]={type:null,size:null};renderSparkProduct();}));
    root.querySelectorAll('[data-retention]').forEach(b=>b.addEventListener('click',()=>{state.retention=state.retention===b.dataset.retention?null:b.dataset.retention;renderSparkProduct();}));
    root.querySelector('[data-reset-configuration]')?.addEventListener('click',resetCurrentConfiguration);
    root.querySelector('[data-save-configuration]')?.addEventListener('click',e=>saveConfigurationForWorkflow(e.currentTarget));
    notifyRendered();
  }

  function applyVersion(){window.applyClinicalAssistantVersion();}

  const previousRenderDashboard=window.renderDashboard;if(typeof previousRenderDashboard==='function')window.renderDashboard=function(){const result=previousRenderDashboard();applyVersion();return result;};
  const previousRenderAbout=window.renderAbout;if(typeof previousRenderAbout==='function')window.renderAbout=function(){const result=previousRenderAbout();applyVersion();return result;};
  function init(){installStyles();renderHome();applyVersion();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.addEventListener('pageshow',applyVersion);
})();
