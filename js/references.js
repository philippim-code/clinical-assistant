/* Miracle-Ear Clinical Assistant Spark reference UI refinement */
(function(){
  'use strict';

  const SPARK_STORE_URL='https://miracle-earspark.com/miracleearus/en/USD/elements/home?continue=';

  const sparkData={
    colors:[
      {id:'sand-beige',name:'Sand Beige'},
      {id:'sandalwood',name:'Sandalwood'},
      {id:'silver-gray',name:'Silver Gray',default:true},
      {id:'velvet-black',name:'Velvet Black'}
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

  const state={view:'home',family:'standard',level:5,color:'silver-gray',receiverPower:'M',receiverLength:'0',receiverSide:'right',dome:'vented',domeSize:'S',retention:'M'};
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
      .ref-page-actions{display:flex;gap:8px;flex-wrap:wrap}
      .ref-back{margin:0}
      .ref-section{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:18px;box-shadow:var(--shadow-sm,0 2px 8px rgba(0,0,0,.05));margin-top:16px;scroll-margin-top:84px}
      .ref-section h4{margin:0 0 6px;color:var(--teal);font-size:17px}
      .ref-section > p{margin:0 0 12px}
      .ref-level-row,.ref-choice-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
      .ref-choice{border:2px solid var(--border);background:#fff;color:var(--text);box-shadow:none;margin:0;padding:9px 13px;border-radius:999px;min-width:48px;transition:.12s ease}
      .ref-choice:hover{background:var(--teal-light);color:var(--teal-dark);box-shadow:none;transform:none}
      .ref-choice.active{background:var(--teal);border-color:var(--teal);color:#fff}
      .ref-sticky-nav{position:sticky;top:8px;z-index:25;display:flex;align-items:center;gap:8px;margin:0 0 16px;padding:8px;background:rgba(255,255,255,.94);border:1px solid var(--border);border-radius:14px;box-shadow:0 8px 24px rgba(26,53,57,.08);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
      .ref-sticky-links{display:flex;gap:5px;overflow-x:auto;scrollbar-width:none;flex:1}
      .ref-sticky-links::-webkit-scrollbar{display:none}
      .ref-nav-link{flex:0 0 auto;margin:0;padding:8px 11px;border:0!important;border-radius:9px;background:transparent!important;color:var(--muted)!important;box-shadow:none!important;font-size:12px;font-weight:800}
      .ref-nav-link:hover,.ref-nav-link.active{background:var(--teal-light)!important;color:var(--teal-dark)!important;transform:none!important}
      .ref-nav-model{flex:0 0 auto;max-width:230px;padding:7px 10px;border-left:1px solid var(--border);font-size:11px;font-weight:800;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .ref-model-hero{display:grid;grid-template-columns:minmax(230px,.82fr) minmax(0,1.18fr);gap:22px;align-items:center;padding:20px}
      .ref-model-name{font-size:25px;font-weight:850;color:var(--text);margin-bottom:5px;line-height:1.18}
      .ref-family-name{color:var(--teal);font-weight:750;margin-bottom:12px}
      .ref-identity-chips{display:flex;gap:7px;flex-wrap:wrap;margin:0 0 14px}
      .ref-identity-chip{display:inline-flex;align-items:center;padding:5px 9px;border-radius:999px;background:#f1f7f8;border:1px solid #d9e7e9;color:var(--teal-dark);font-size:11px;font-weight:800}
      .ref-fact-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:12px}
      .ref-fact{background:#f8fbfc;border:1px solid var(--border);border-radius:11px;padding:11px}
      .ref-fact span{display:block;font-size:10px;text-transform:uppercase;letter-spacing:.055em;color:var(--muted);font-weight:800;margin-bottom:4px}
      .ref-config-card{display:flex;align-items:center;justify-content:space-between;gap:14px;background:linear-gradient(135deg,var(--teal-light),#f9fcfc);border:1px solid #cfe3e5;border-radius:14px;padding:14px 16px;margin-top:16px}
      .ref-config-copy{min-width:0}
      .ref-config-label{font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:var(--teal-dark);font-weight:900;margin-bottom:4px}
      .ref-config-value{font-size:14px;color:var(--text);font-weight:800;line-height:1.4}
      .ref-config-badge{flex:0 0 auto;border-radius:999px;background:var(--teal);color:#fff;padding:7px 10px;font-size:11px;font-weight:850}
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
        .ref-model-name{font-size:22px}
        .ref-config-card{align-items:flex-start;flex-direction:column}
        .ref-config-badge{align-self:flex-start}
      }
    `;
    document.head.appendChild(style);
  }

  function placeholder(label,note='Loading product image…'){
    return `<div class="ref-image-slot"><div class="ref-image-icon">🦻</div><strong>${label}</strong><small>${note}</small></div>`;
  }

  function colorVisual(id){
    const map={'sand-beige':'linear-gradient(135deg,#d5c2a7,#eee4d4)','sandalwood':'linear-gradient(135deg,#9e7e66,#c4a48c)','silver-gray':'linear-gradient(135deg,#aeb5b7,#e4e7e8)','velvet-black':'linear-gradient(135deg,#1d2328,#545c62)'};
    return map[id]||'#ddd';
  }

  function referencesRoot(){return document.getElementById('references');}
  function notifyRendered(){document.dispatchEvent(new CustomEvent('clinical-assistant:references-rendered'));}
  function scrollReferencesTop(){const el=referencesRoot();if(el)el.scrollIntoView({behavior:'smooth',block:'start'});}
  function activeFamily(){return sparkData.families[state.family]||sparkData.families.standard;}
  function activeDome(){return sparkData.domes.find(d=>d.id===state.dome)||sparkData.domes[0];}
  function selectedColor(){return sparkData.colors.find(c=>c.id===state.color)||sparkData.colors[2];}
  function receiverLabel(){return `${state.receiverLength}${state.receiverPower} ${state.receiverSide==='left'?'Left (Blue)':'Right (Red)'}`;}
  function domeLabel(){const dome=activeDome();return `${dome.name} Dome · ${state.domeSize}`;}
  function configurationText(){const family=activeFamily();return `${family.modelName(state.level)} · ${selectedColor().name} · ${receiverLabel()} · ${domeLabel()} · ${state.retention} Retention Lock`;}

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
    root.querySelectorAll('[data-family]').forEach(card=>{card.addEventListener('click',()=>{state.family=card.dataset.family;state.level=sparkData.families[state.family].levels[0];renderSparkProduct();});card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();card.click();}});});
    notifyRendered();scrollReferencesTop();
  }

  function renderGeniusPlaceholder(){
    state.view='genius';if(sectionObserver){sectionObserver.disconnect();sectionObserver=null;}
    const root=referencesRoot();if(!root)return;
    root.innerHTML=`<div class="ref-shell">${breadcrumb([{label:'References',action:'home'},{label:'Hearing Aids',action:'home'},{label:'Genius'}])}<div class="ref-page-head"><div><h3>Genius</h3><p class="muted">Genius will use the same polished product-reference structure established for Spark.</p></div><button type="button" class="secondary ref-back" data-ref-breadcrumb="home">← Hearing Aids</button></div><div class="ref-section">${placeholder('Genius','Product data and imagery have not been added yet.')}</div></div>`;
    wireBreadcrumbs(root);notifyRendered();scrollReferencesTop();
  }

  function stickyNav(model){return `<nav class="ref-sticky-nav" aria-label="Spark reference sections"><div class="ref-sticky-links"><button type="button" class="ref-nav-link active" data-scroll-section="overview">Overview</button><button type="button" class="ref-nav-link" data-scroll-section="colors">Colors</button><button type="button" class="ref-nav-link" data-scroll-section="receivers">Receivers</button><button type="button" class="ref-nav-link" data-scroll-section="domes">Domes</button><button type="button" class="ref-nav-link" data-scroll-section="retention">Retention</button><button type="button" class="ref-nav-link" data-scroll-section="accessories">Accessories</button></div><div class="ref-nav-model" title="${model}">${model}</div></nav>`;}

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
    const family=activeFamily();if(!family.levels.includes(state.level))state.level=family.levels[0];
    const model=family.modelName(state.level),color=selectedColor(),dome=activeDome();if(!dome.sizes.includes(state.domeSize))state.domeSize=dome.sizes[0];
    const root=referencesRoot();if(!root)return;
    root.innerHTML=`<div class="ref-shell">
      ${breadcrumb([{label:'References',action:'home'},{label:'Hearing Aids',action:'home'},{label:'Spark',action:'spark'},{label:family.title}])}
      <div class="ref-page-head"><div><h3>${family.title}</h3><p class="muted">Configure the device and review compatible Spark fitting components.</p></div><div class="ref-page-actions"><button type="button" class="secondary ref-back" data-ref-breadcrumb="spark">← Spark</button><button type="button" class="primary" id="openSparkStore">Open Spark Store ↗</button></div></div>
      ${stickyNav(model)}
      <div class="ref-section" data-ref-section="overview"><h4>Treatment Level</h4><p class="muted">Select the model treatment level.</p><div class="ref-level-row">${family.levels.map(level=>`<button type="button" class="ref-choice ${state.level===level?'active':''}" data-level="${level}">E${level}</button>`).join('')}</div></div>
      <div class="ref-section ref-model-hero"><div>${placeholder(`${family.title} · ${color.name}`)}</div><div><div class="ref-model-name">${model}</div><div class="ref-family-name">${family.title}</div><div class="ref-identity-chips"><span class="ref-identity-chip">Spark</span><span class="ref-identity-chip">RIC</span><span class="ref-identity-chip">E${state.level}</span><span class="ref-identity-chip">${color.name}</span></div><div class="ref-fact-grid"><div class="ref-fact"><span>Model</span><strong>${model}</strong></div><div class="ref-fact"><span>Color</span><strong>${color.name}</strong></div><div class="ref-fact"><span>Receiver System</span><strong>S / M / P</strong></div><div class="ref-fact"><span>Receiver Lengths</span><strong>00 / 0 / 1 / 2 / 3</strong></div></div></div></div>
      <div class="ref-config-card" aria-label="Current Spark configuration"><div class="ref-config-copy"><div class="ref-config-label">Current Configuration</div><div class="ref-config-value">${configurationText()}</div></div><span class="ref-config-badge">Configured</span></div>
      <div class="ref-section" data-ref-section="colors"><h4>Colors</h4><p class="muted">Select the hearing-aid finish.</p><div class="ref-color-grid">${sparkData.colors.map(item=>`<div class="ref-color-card ${state.color===item.id?'active':''}" data-color="${item.id}" role="button" tabindex="0"><div class="ref-color-chip" style="background:${colorVisual(item.id)}"></div><strong>${item.name}</strong></div>`).join('')}</div></div>
      <div class="ref-section" data-ref-section="receivers"><h4>Receivers</h4><p class="muted">Choose power, length, and side. Left receivers are blue; right receivers are red.</p><div class="ref-component-grid"><div><div class="row-title">Power</div><div class="ref-choice-row">${sparkData.receivers.powers.map(x=>`<button type="button" class="ref-choice ${state.receiverPower===x?'active':''}" data-receiver-power="${x}">${x}</button>`).join('')}</div><div class="row-title">Length</div><div class="ref-choice-row">${sparkData.receivers.lengths.map(x=>`<button type="button" class="ref-choice ${state.receiverLength===x?'active':''}" data-receiver-length="${x}">${x}</button>`).join('')}</div><div class="row-title">Side</div><div class="ref-choice-row">${sparkData.receivers.sides.map(x=>`<button type="button" class="ref-choice ${state.receiverSide===x.id?'active':''}" data-receiver-side="${x.id}">${x.id==='left'?'🔵':'🔴'} ${x.name}</button>`).join('')}</div></div><div class="ref-component-preview"><div class="ref-component-kicker">Selected Receiver</div>${placeholder(receiverLabel())}<div class="ref-selection-summary"><strong>${receiverLabel()}</strong></div></div></div></div>
      <div class="ref-section" data-ref-section="domes"><h4>Domes</h4><p class="muted">Cap is one size. Open, Vented, and Power domes are available in S, M, and L.</p><div class="ref-component-grid"><div><div class="row-title">Dome Type</div><div class="ref-choice-row">${sparkData.domes.map(x=>`<button type="button" class="ref-choice ${state.dome===x.id?'active':''}" data-dome="${x.id}">${x.name}</button>`).join('')}</div><div class="row-title">Size</div><div class="ref-choice-row">${dome.sizes.map(x=>`<button type="button" class="ref-choice ${state.domeSize===x?'active':''}" data-dome-size="${x}">${x}</button>`).join('')}</div></div><div class="ref-component-preview"><div class="ref-component-kicker">Selected Dome</div>${placeholder(domeLabel())}<div class="ref-selection-summary"><strong>${domeLabel()}</strong></div></div></div></div>
      <div class="ref-section" data-ref-section="retention"><h4>Retention Locks</h4><p class="muted">Available in S, M, and L.</p><div class="ref-choice-row">${sparkData.retentionLocks.map(x=>`<button type="button" class="ref-choice ${state.retention===x?'active':''}" data-retention="${x}">${x}</button>`).join('')}</div><div class="ref-selection-summary"><strong>${state.retention} Retention Lock</strong></div></div>
      <div class="ref-section" data-ref-section="accessories"><h4>Charger & Maintenance</h4><p class="muted">Spark charging and wax-management accessories.</p><div class="ref-accessory-grid">${sparkData.accessories.map(item=>`<div class="ref-accessory-card">${placeholder(item.name)}<h5>${item.name}</h5><p>${item.type}</p></div>`).join('')}</div></div>
    </div>`;
    wireBreadcrumbs(root);wireSectionNav(root);
    root.querySelector('#openSparkStore').addEventListener('click',()=>window.location.assign(SPARK_STORE_URL));
    root.querySelectorAll('[data-level]').forEach(b=>b.addEventListener('click',()=>{state.level=Number(b.dataset.level);renderSparkProduct();}));
    root.querySelectorAll('[data-color]').forEach(card=>{card.addEventListener('click',()=>{state.color=card.dataset.color;renderSparkProduct();});card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();card.click();}});});
    root.querySelectorAll('[data-receiver-power]').forEach(b=>b.addEventListener('click',()=>{state.receiverPower=b.dataset.receiverPower;renderSparkProduct();}));
    root.querySelectorAll('[data-receiver-length]').forEach(b=>b.addEventListener('click',()=>{state.receiverLength=b.dataset.receiverLength;renderSparkProduct();}));
    root.querySelectorAll('[data-receiver-side]').forEach(b=>b.addEventListener('click',()=>{state.receiverSide=b.dataset.receiverSide;renderSparkProduct();}));
    root.querySelectorAll('[data-dome]').forEach(b=>b.addEventListener('click',()=>{state.dome=b.dataset.dome;state.domeSize=activeDome().sizes[0];renderSparkProduct();}));
    root.querySelectorAll('[data-dome-size]').forEach(b=>b.addEventListener('click',()=>{state.domeSize=b.dataset.domeSize;renderSparkProduct();}));
    root.querySelectorAll('[data-retention]').forEach(b=>b.addEventListener('click',()=>{state.retention=b.dataset.retention;renderSparkProduct();}));
    notifyRendered();
  }

  function applyVersion(){window.applyClinicalAssistantVersion();}

  const previousRenderDashboard=window.renderDashboard;if(typeof previousRenderDashboard==='function')window.renderDashboard=function(){const result=previousRenderDashboard();applyVersion();return result;};
  const previousRenderAbout=window.renderAbout;if(typeof previousRenderAbout==='function')window.renderAbout=function(){const result=previousRenderAbout();applyVersion();return result;};
  function init(){installStyles();renderHome();applyVersion();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.addEventListener('pageshow',applyVersion);
})();
