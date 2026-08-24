/* Miracle-Ear Clinical Assistant v1.8.0-dev2 — References / Spark prototype */
(function(){
  'use strict';

  const REFERENCES_VERSION='1.8.0-dev2';
  const SPARK_STORE_URL='https://miracle-earspark.com/miracleearus/en/USD/elements/home?continue=';

  const sparkData={
    colors:[
      {id:'sand-beige',name:'Sand Beige'},
      {id:'sandalwood',name:'Sandalwood'},
      {id:'silver-gray',name:'Silver Gray',default:true},
      {id:'velvet-black',name:'Velvet Black'}
    ],
    families:{
      standard:{
        title:'MEMINI E RIC',
        subtitle:'Standard Spark RIC family',
        levels:[5,4,3,2],
        modelName(level){return `MEMINI E ${level} 5P R-R`;}
      },
      ai:{
        title:'MEMINI E AI RIC',
        subtitle:'Spark AI RIC family',
        levels:[5,4],
        modelName(level){return `MEMINI E ${level} 5P R-R AI`;}
      }
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
      {name:'MECHARGE Charger',type:'Charger',status:'Verified accessory'},
      {name:'CeruStop',type:'Wax Guards',status:'Verified accessory'}
    ]
  };

  const state={view:'home',family:'standard',level:5,color:'silver-gray',receiverPower:'M',receiverLength:'0',receiverSide:'right',dome:'vented',domeSize:'S',retention:'M'};

  function installStyles(){
    if(document.getElementById('references-v2-styles'))return;
    const style=document.createElement('style');
    style.id='references-v2-styles';
    style.textContent=`
      .ref-shell{display:block}
      .ref-breadcrumbs{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin:0 0 14px;color:var(--muted);font-size:13px}
      .ref-breadcrumbs button{margin:0;padding:0;background:none!important;color:var(--teal)!important;border:0!important;box-shadow:none!important;font-size:13px}
      .ref-breadcrumbs button:hover{text-decoration:underline;transform:none!important;box-shadow:none!important}
      .ref-accordion{background:var(--card);border:1px solid var(--border);border-radius:14px;box-shadow:var(--shadow-sm,0 2px 8px rgba(0,0,0,.05));overflow:hidden}
      .ref-accordion summary{list-style:none;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px 20px;cursor:pointer;color:var(--teal);font-weight:800;font-size:19px;background:#fbfefe}
      .ref-accordion summary::-webkit-details-marker{display:none}
      .ref-accordion summary:after{content:'⌃';font-size:16px;transition:transform .15s ease}
      .ref-accordion:not([open]) summary:after{transform:rotate(180deg)}
      .ref-accordion-body{padding:20px;border-top:1px solid var(--border)}
      .ref-product-grid,.ref-family-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}
      .ref-product-card,.ref-family-card{border:1px solid var(--border);border-radius:16px;background:#fff;padding:18px;text-align:center;cursor:pointer;transition:.16s;box-shadow:var(--shadow-sm,0 2px 8px rgba(0,0,0,.05))}
      .ref-product-card:hover,.ref-family-card:hover{border-color:var(--teal);transform:translateY(-2px);box-shadow:var(--shadow-md,0 8px 24px rgba(0,0,0,.1))}
      .ref-product-card h3,.ref-family-card h3{margin:12px 0 5px;color:var(--teal)}
      .ref-product-card p,.ref-family-card p{margin:0;color:var(--muted);font-size:13px}
      .ref-image-slot{height:180px;border-radius:14px;border:1px dashed #b9cdd1;background:linear-gradient(180deg,#fbfefe,#f3f8f9);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:7px;padding:16px;color:var(--muted)}
      .ref-image-slot .ref-image-icon{font-size:42px;opacity:.6}
      .ref-image-slot strong{color:var(--text);font-size:14px}
      .ref-image-slot small{text-align:center;line-height:1.35}
      .ref-soon{display:inline-block;margin-top:10px;border-radius:999px;padding:4px 9px;background:#f2f4f5;color:var(--muted);font-size:11px;font-weight:700}
      .ref-page-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:18px;flex-wrap:wrap}
      .ref-page-head h3{font-size:24px;margin-bottom:5px}
      .ref-page-head p{margin:0}
      .ref-page-actions{display:flex;gap:8px;flex-wrap:wrap}
      .ref-back{margin:0}
      .ref-section{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:18px;box-shadow:var(--shadow-sm,0 2px 8px rgba(0,0,0,.05));margin-top:16px}
      .ref-section h4{margin:0 0 6px;color:var(--teal);font-size:17px}
      .ref-section > p{margin:0 0 12px}
      .ref-level-row,.ref-choice-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
      .ref-choice{border:2px solid var(--border);background:#fff;color:var(--text);box-shadow:none;margin:0;padding:9px 13px;border-radius:999px;min-width:48px}
      .ref-choice:hover{background:var(--teal-light);color:var(--teal-dark);box-shadow:none;transform:none}
      .ref-choice.active{background:var(--teal);border-color:var(--teal);color:#fff}
      .ref-model-hero{display:grid;grid-template-columns:minmax(220px,.8fr) minmax(0,1.2fr);gap:20px;align-items:start}
      .ref-model-name{font-size:23px;font-weight:800;color:var(--text);margin-bottom:4px}
      .ref-family-name{color:var(--teal);font-weight:700;margin-bottom:12px}
      .ref-fact-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:12px}
      .ref-fact{background:#f8fbfc;border:1px solid var(--border);border-radius:10px;padding:11px}
      .ref-fact span{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted);font-weight:700;margin-bottom:4px}
      .ref-color-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:12px}
      .ref-color-card{border:2px solid var(--border);border-radius:12px;background:#fff;padding:10px;cursor:pointer;text-align:center}
      .ref-color-card.active{border-color:var(--teal);box-shadow:0 0 0 2px rgba(0,140,149,.09)}
      .ref-color-chip{height:38px;border-radius:9px;border:1px solid rgba(0,0,0,.08);margin-bottom:7px}
      .ref-color-card strong{font-size:12px}
      .ref-component-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
      .ref-component-preview{border:1px solid var(--border);border-radius:12px;padding:14px;background:#fbfefe}
      .ref-selection-summary{margin-top:12px;padding:12px;border-radius:10px;background:var(--teal-light);color:var(--teal-dark);font-weight:700}
      .ref-accessory-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:12px}
      .ref-accessory-card{border:1px solid var(--border);border-radius:12px;padding:14px;background:#fff}
      .ref-accessory-card h5{margin:10px 0 3px;font-size:15px;color:var(--text)}
      .ref-accessory-card p{margin:0;color:var(--muted);font-size:12px}
      .ref-coming-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:12px}
      .ref-coming-card{border:1px dashed #bccfd3;border-radius:12px;padding:14px;background:#fafcfc}
      .ref-coming-card strong{display:block;margin-bottom:4px}
      @media(max-width:760px){
        .ref-product-grid,.ref-family-grid,.ref-model-hero,.ref-component-grid,.ref-accessory-grid,.ref-coming-grid{grid-template-columns:1fr}
        .ref-color-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
        .ref-image-slot{height:150px}
        .ref-page-actions{width:100%}.ref-page-actions button{flex:1}
      }
    `;
    document.head.appendChild(style);
  }

  function placeholder(label,note='Product image will be added from the verified Spark catalog assets.'){
    return `<div class="ref-image-slot"><div class="ref-image-icon">🦻</div><strong>${label}</strong><small>${note}</small></div>`;
  }

  function colorVisual(id){
    const map={
      'sand-beige':'linear-gradient(135deg,#d5c2a7,#eee4d4)',
      'sandalwood':'linear-gradient(135deg,#9e7e66,#c4a48c)',
      'silver-gray':'linear-gradient(135deg,#aeb5b7,#e4e7e8)',
      'velvet-black':'linear-gradient(135deg,#1d2328,#545c62)'
    };
    return map[id]||'#ddd';
  }

  function referencesRoot(){return document.getElementById('references');}
  function scrollReferencesTop(){const el=referencesRoot();if(el)el.scrollIntoView({behavior:'smooth',block:'start'});}

  function renderHome(){
    state.view='home';
    const root=referencesRoot();if(!root)return;
    root.innerHTML=`<div class="ref-shell">
      <details class="ref-accordion" open>
        <summary>🦻 Hearing Aids</summary>
        <div class="ref-accordion-body">
          <p class="muted" style="margin-top:0">Product reference library. Select a hearing-aid family to open its detailed reference.</p>
          <div class="ref-product-grid">
            <article class="ref-product-card" data-ref-product="spark" role="button" tabindex="0">
              ${placeholder('Spark · Silver Gray','Default Spark product image slot. Actual catalog image pending repository upload.')}
              <h3>Spark</h3><p>MEMINI E RIC and MEMINI E AI RIC</p>
            </article>
            <article class="ref-product-card" data-ref-product="genius" role="button" tabindex="0">
              ${placeholder('Genius','Genius product image and product data will be added in a later development pass.')}
              <h3>Genius</h3><p>Reference framework ready for future product data.</p><span class="ref-soon">Coming Soon</span>
            </article>
          </div>
        </div>
      </details>
    </div>`;
    root.querySelector('[data-ref-product="spark"]').addEventListener('click',renderSparkLanding);
    root.querySelector('[data-ref-product="genius"]').addEventListener('click',renderGeniusPlaceholder);
    root.querySelectorAll('[data-ref-product]').forEach(card=>card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();card.click();}}));
  }

  function breadcrumb(items){
    return `<div class="ref-breadcrumbs">${items.map((item,i)=>item.action?`<button type="button" data-ref-breadcrumb="${item.action}">${item.label}</button><span>›</span>`:`<strong>${item.label}</strong>`).join('')}</div>`;
  }

  function wireBreadcrumbs(root){
    root.querySelectorAll('[data-ref-breadcrumb="home"]').forEach(b=>b.addEventListener('click',renderHome));
    root.querySelectorAll('[data-ref-breadcrumb="spark"]').forEach(b=>b.addEventListener('click',renderSparkLanding));
  }

  function renderSparkLanding(){
    state.view='spark';
    const root=referencesRoot();if(!root)return;
    root.innerHTML=`<div class="ref-shell">
      ${breadcrumb([{label:'References',action:'home'},{label:'Hearing Aids',action:'home'},{label:'Spark'}])}
      <div class="ref-page-head"><div><h3>Spark</h3><p class="muted">Select a Spark RIC family to view treatment levels, colors, coupling, receivers, accessories, and future feature details.</p></div><div class="ref-page-actions"><button type="button" class="secondary ref-back" data-ref-breadcrumb="home">← Hearing Aids</button><button type="button" class="primary" id="openSparkStore">Open Spark Store ↗</button></div></div>
      <div class="ref-family-grid">
        <article class="ref-family-card" data-family="standard" role="button" tabindex="0">
          ${placeholder('MEMINI E RIC · Silver Gray','Standard Spark RIC image slot; Silver Gray is the default product color.')}
          <h3>MEMINI E RIC</h3><p>Available treatment levels: E5, E4, E3, E2</p>
        </article>
        <article class="ref-family-card" data-family="ai" role="button" tabindex="0">
          ${placeholder('MEMINI E AI RIC · Silver Gray','Spark AI RIC image slot; uses the larger AI housing supplied from the Spark catalog.')}
          <h3>MEMINI E AI RIC</h3><p>Available treatment levels: E5, E4</p>
        </article>
      </div>
      <div class="ref-section"><h4>Verified Spark Structure</h4><p class="muted">This development page is populated only with product structure and components supplied from the Spark manufacturer/store. Feature and programming specifications will be added after they are verified.</p></div>
    </div>`;
    wireBreadcrumbs(root);
    root.querySelector('#openSparkStore').addEventListener('click',()=>window.location.assign(SPARK_STORE_URL));
    root.querySelectorAll('[data-family]').forEach(card=>{
      card.addEventListener('click',()=>{state.family=card.dataset.family;state.level=sparkData.families[state.family].levels[0];renderSparkProduct();});
      card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();card.click();}});
    });
    scrollReferencesTop();
  }

  function renderGeniusPlaceholder(){
    state.view='genius';
    const root=referencesRoot();if(!root)return;
    root.innerHTML=`<div class="ref-shell">${breadcrumb([{label:'References',action:'home'},{label:'Hearing Aids',action:'home'},{label:'Genius'}])}<div class="ref-page-head"><div><h3>Genius</h3><p class="muted">The Genius reference area is ready, but no product data has been entered yet.</p></div><button type="button" class="secondary ref-back" data-ref-breadcrumb="home">← Hearing Aids</button></div><div class="ref-section">${placeholder('Genius','Product imagery, models, coupling, features, and accessories will be added after the Spark reference is established.')}</div></div>`;
    wireBreadcrumbs(root);scrollReferencesTop();
  }

  function activeFamily(){return sparkData.families[state.family]||sparkData.families.standard;}
  function activeDome(){return sparkData.domes.find(d=>d.id===state.dome)||sparkData.domes[0];}

  function renderSparkProduct(){
    state.view='product';
    const family=activeFamily();
    if(!family.levels.includes(state.level))state.level=family.levels[0];
    const model=family.modelName(state.level);
    const selectedColor=sparkData.colors.find(c=>c.id===state.color)||sparkData.colors[2];
    const dome=activeDome();
    if(!dome.sizes.includes(state.domeSize))state.domeSize=dome.sizes[0];
    const root=referencesRoot();if(!root)return;
    root.innerHTML=`<div class="ref-shell">
      ${breadcrumb([{label:'References',action:'home'},{label:'Hearing Aids',action:'home'},{label:'Spark',action:'spark'},{label:family.title}])}
      <div class="ref-page-head"><div><h3>${family.title}</h3><p class="muted">Choose a treatment level, then review color and compatible fitting-component selections.</p></div><div class="ref-page-actions"><button type="button" class="secondary ref-back" data-ref-breadcrumb="spark">← Spark</button><button type="button" class="primary" id="openSparkStore">Open Spark Store ↗</button></div></div>

      <div class="ref-section">
        <h4>Treatment Level</h4><p class="muted">Available levels for ${family.title}.</p>
        <div class="ref-level-row">${family.levels.map(level=>`<button type="button" class="ref-choice ${state.level===level?'active':''}" data-level="${level}">E${level}</button>`).join('')}</div>
      </div>

      <div class="ref-section ref-model-hero">
        <div>${placeholder(`${family.title} · ${selectedColor.name}`,`${selectedColor.name} product image slot. The actual verified catalog image will replace this placeholder once uploaded to the repository.`)}</div>
        <div>
          <div class="ref-model-name">${model}</div><div class="ref-family-name">${family.title}</div>
          <div class="ref-fact-grid">
            <div class="ref-fact"><span>Treatment Level</span><strong>E${state.level}</strong></div>
            <div class="ref-fact"><span>Selected Color</span><strong>${selectedColor.name}</strong></div>
            <div class="ref-fact"><span>Receiver System</span><strong>S / M / P</strong></div>
            <div class="ref-fact"><span>Receiver Lengths</span><strong>00 / 0 / 1 / 2 / 3</strong></div>
          </div>
        </div>
      </div>

      <div class="ref-section"><h4>Colors</h4><p class="muted">The same four colors are available across the confirmed Spark treatment levels. Silver Gray is the default display color.</p>
        <div class="ref-color-grid">${sparkData.colors.map(color=>`<div class="ref-color-card ${state.color===color.id?'active':''}" data-color="${color.id}" role="button" tabindex="0"><div class="ref-color-chip" style="background:${colorVisual(color.id)}"></div><strong>${color.name}</strong></div>`).join('')}</div>
      </div>

      <div class="ref-section"><h4>Receivers</h4><p class="muted">Select receiver power, length, and side. Left receivers are blue; right receivers are red.</p>
        <div class="ref-component-grid">
          <div>
            <div class="row-title">Power</div><div class="ref-choice-row">${sparkData.receivers.powers.map(x=>`<button type="button" class="ref-choice ${state.receiverPower===x?'active':''}" data-receiver-power="${x}">${x}</button>`).join('')}</div>
            <div class="row-title">Length</div><div class="ref-choice-row">${sparkData.receivers.lengths.map(x=>`<button type="button" class="ref-choice ${state.receiverLength===x?'active':''}" data-receiver-length="${x}">${x}</button>`).join('')}</div>
            <div class="row-title">Side</div><div class="ref-choice-row">${sparkData.receivers.sides.map(x=>`<button type="button" class="ref-choice ${state.receiverSide===x.id?'active':''}" data-receiver-side="${x.id}">${x.id==='left'?'🔵':'🔴'} ${x.name}</button>`).join('')}</div>
          </div>
          <div class="ref-component-preview">${placeholder(`${state.receiverLength}${state.receiverPower} · ${state.receiverSide==='left'?'Left / Blue':'Right / Red'}`,'Representative receiver image slot. The supplied 0M left/right images will be replaced with exact receiver images as they are provided.')}<div class="ref-selection-summary">Selected: ${state.receiverLength}${state.receiverPower} ${state.receiverSide==='left'?'Left (Blue)':'Right (Red)'}</div></div>
        </div>
      </div>

      <div class="ref-section"><h4>Domes</h4><p class="muted">Cap is one size. Open, Vented, and Power domes are available in S, M, and L.</p>
        <div class="ref-component-grid">
          <div><div class="row-title">Dome Type</div><div class="ref-choice-row">${sparkData.domes.map(x=>`<button type="button" class="ref-choice ${state.dome===x.id?'active':''}" data-dome="${x.id}">${x.name}</button>`).join('')}</div><div class="row-title">Size</div><div class="ref-choice-row">${dome.sizes.map(x=>`<button type="button" class="ref-choice ${state.domeSize===x?'active':''}" data-dome-size="${x}">${x}</button>`).join('')}</div></div>
          <div class="ref-component-preview">${placeholder(`${dome.name} Dome · ${state.domeSize}`,'Representative dome image slot. The supplied small vented dome is being used as the temporary reference until each exact dome image is provided.')}<div class="ref-selection-summary">Selected: ${dome.name} Dome · ${state.domeSize}</div></div>
        </div>
      </div>

      <div class="ref-section"><h4>Retention Locks</h4><p class="muted">Available in S, M, and L.</p><div class="ref-choice-row">${sparkData.retentionLocks.map(x=>`<button type="button" class="ref-choice ${state.retention===x?'active':''}" data-retention="${x}">${x}</button>`).join('')}</div><div class="ref-selection-summary">Selected retention lock: ${state.retention}</div></div>

      <div class="ref-section"><h4>Charger & Maintenance</h4><p class="muted">Verified accessories supplied from the Spark catalog.</p><div class="ref-accessory-grid">${sparkData.accessories.map(item=>`<div class="ref-accessory-card">${placeholder(item.name,'Verified product image supplied; repository image upload pending.')}<h5>${item.name}</h5><p>${item.type} · ${item.status}</p></div>`).join('')}</div></div>

      <div class="ref-section"><h4>Programming, Features & Resources</h4><p class="muted">These sections are intentionally not populated until the specifications are verified from manufacturer materials.</p><div class="ref-coming-grid"><div class="ref-coming-card"><strong>Treatment-Level Features</strong><span class="muted">E2 vs E3 vs E4 vs E5 comparison coming next.</span></div><div class="ref-coming-card"><strong>Programming</strong><span class="muted">Programming software, connection method, and fitting notes coming next.</span></div><div class="ref-coming-card"><strong>Product Links</strong><span class="muted">Direct hearing aid, receiver, dome, charger, and maintenance links will be added as item URLs are collected.</span></div><div class="ref-coming-card"><strong>Additional Accessories</strong><span class="muted">Additional compatible Spark parts can drop into this same reference structure without redesigning the page.</span></div></div></div>
    </div>`;

    wireBreadcrumbs(root);
    root.querySelector('#openSparkStore').addEventListener('click',()=>window.location.assign(SPARK_STORE_URL));
    root.querySelectorAll('[data-level]').forEach(b=>b.addEventListener('click',()=>{state.level=Number(b.dataset.level);renderSparkProduct();}));
    root.querySelectorAll('[data-color]').forEach(card=>{card.addEventListener('click',()=>{state.color=card.dataset.color;renderSparkProduct();});card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();card.click();}});});
    root.querySelectorAll('[data-receiver-power]').forEach(b=>b.addEventListener('click',()=>{state.receiverPower=b.dataset.receiverPower;renderSparkProduct();}));
    root.querySelectorAll('[data-receiver-length]').forEach(b=>b.addEventListener('click',()=>{state.receiverLength=b.dataset.receiverLength;renderSparkProduct();}));
    root.querySelectorAll('[data-receiver-side]').forEach(b=>b.addEventListener('click',()=>{state.receiverSide=b.dataset.receiverSide;renderSparkProduct();}));
    root.querySelectorAll('[data-dome]').forEach(b=>b.addEventListener('click',()=>{state.dome=b.dataset.dome;state.domeSize=activeDome().sizes[0];renderSparkProduct();}));
    root.querySelectorAll('[data-dome-size]').forEach(b=>b.addEventListener('click',()=>{state.domeSize=b.dataset.domeSize;renderSparkProduct();}));
    root.querySelectorAll('[data-retention]').forEach(b=>b.addEventListener('click',()=>{state.retention=b.dataset.retention;renderSparkProduct();}));
  }

  function applyVersion(){
    document.querySelectorAll('[data-app-version]').forEach(el=>el.textContent=REFERENCES_VERSION);
    const aboutVersion=document.getElementById('aboutVersion');if(aboutVersion)aboutVersion.textContent=REFERENCES_VERSION;
    const heading=document.querySelector('#aboutWhatsNew h3');if(heading)heading.textContent="What's New in v"+REFERENCES_VERSION;
    const list=document.querySelector('#aboutWhatsNew .changelog-list');
    if(list)list.innerHTML=[
      '<li><strong>Started the References product library</strong> with a new expandable Hearing Aids menu.</li>',
      '<li><strong>Added the Spark reference framework</strong> for MEMINI E RIC and MEMINI E AI RIC treatment levels.</li>',
      '<li><strong>Added interactive fitting-component selectors</strong> for Spark receivers, domes, retention locks, colors, charger, and CeruStop.</li>',
      '<li><strong>Removed the experimental AI interface from this development cycle</strong> so v1.8.0 development can focus on References.</li>',
      '<li><strong>Production v1.7.2 remains unchanged.</strong></li>'
    ].join('');
    const cards=document.querySelectorAll('#dashboardCards .dashboard-card');
    const versionCard=[...cards].find(card=>card.querySelector('.label')?.textContent.trim()==='Current Version');
    const number=versionCard?.querySelector('.number');if(number)number.textContent=REFERENCES_VERSION;
  }

  const previousRenderDashboard=window.renderDashboard;
  if(typeof previousRenderDashboard==='function')window.renderDashboard=function(){const result=previousRenderDashboard();applyVersion();return result;};
  const previousRenderAbout=window.renderAbout;
  if(typeof previousRenderAbout==='function')window.renderAbout=function(){const result=previousRenderAbout();applyVersion();return result;};

  function init(){installStyles();renderHome();applyVersion();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.addEventListener('pageshow',applyVersion);
})();
