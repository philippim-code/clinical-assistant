/* Miracle-Ear Clinical Assistant — responsive Spark manufacturer imagery */
(function(){
  'use strict';

  const ASSET_VERSION='dev21';
  const BASE='assets/spark/catalog/';
  const asset=path=>`${path}?v=${ASSET_VERSION}`;

  const FAMILY={
    standard:{
      'sand-beige':asset(BASE+'hearing-aids/standard-sand-beige.png'),
      'sandalwood':asset(BASE+'hearing-aids/standard-sandalwood.png'),
      'silver-gray':asset(BASE+'hearing-aids/standard-silver-gray.png'),
      'velvet-black':asset(BASE+'hearing-aids/standard-velvet-black.png')
    },
    ai:{
      'sand-beige':asset(BASE+'hearing-aids/ai-sand-beige.png'),
      'sandalwood':asset(BASE+'hearing-aids/ai-sandalwood.png'),
      'silver-gray':asset(BASE+'hearing-aids/ai-silver-gray.png'),
      'velvet-black':asset(BASE+'hearing-aids/ai-velvet-black.png')
    }
  };

  const DOME={
    'open-S':asset(BASE+'domes/open-s.png'),
    'open-M':asset(BASE+'domes/open-m.png'),
    'open-L':asset(BASE+'domes/open-l.png'),
    'vented-S':asset(BASE+'domes/vented-s.png'),
    'vented-M':asset(BASE+'domes/vented-m.png'),
    'vented-L':asset(BASE+'domes/vented-l.png'),
    'power-S':asset(BASE+'domes/power-s.png'),
    'power-M':asset(BASE+'domes/power-m.png'),
    'power-L':asset(BASE+'domes/power-l.png'),
    'cap-One Size':asset(BASE+'domes/cap.png')
  };

  /* Original manufacturer images uploaded by the user; no recoloring or image editing is applied. */
  const RETENTION={
    S:asset(BASE+'retention-locks/IMG_2176.png'),
    M:asset(BASE+'retention-locks/IMG_2177.png'),
    L:asset(BASE+'retention-locks/IMG_2178.png')
  };

  const ACCESSORY={
    'MECHARGE Charger':asset(BASE+'accessories/IMG_2181.png'),
    'CeruStop':asset(BASE+'accessories/IMG_2182.png')
  };

  function receiverSrc(side,length,power){
    return asset(BASE+`receivers/${side}-${length}-${power}.png`);
  }

  /* Keep decoded images alive in memory so selector changes can reuse them instantly. */
  const imageCache=new Map();

  function preload(src,priority='low'){
    if(!src)return Promise.resolve(null);
    if(imageCache.has(src))return imageCache.get(src).promise;
    const img=new Image();
    img.decoding='async';
    try{img.fetchPriority=priority;}catch(e){}
    const promise=new Promise(resolve=>{
      const done=()=>{
        if(typeof img.decode==='function')img.decode().catch(()=>{}).finally(()=>resolve(img));
        else resolve(img);
      };
      if(img.complete&&img.naturalWidth)done();
      else{
        img.onload=done;
        img.onerror=()=>resolve(null);
      }
    });
    imageCache.set(src,{img,promise});
    img.src=src;
    return promise;
  }

  function allSparkAssets(){
    const urls=[];
    Object.values(FAMILY).forEach(family=>urls.push(...Object.values(family)));
    urls.push(...Object.values(DOME),...Object.values(RETENTION),...Object.values(ACCESSORY));
    ['L','R'].forEach(side=>['00','0','1','2','3'].forEach(length=>['S','M','P'].forEach(power=>urls.push(receiverSrc(side,length,power)))));
    return [...new Set(urls)];
  }

  function preloadSparkLibrary(){
    /* Warm only initial visuals. Loading all catalog images at once can stall iPad browsers. */
    [FAMILY.standard['silver-gray'],FAMILY.ai['silver-gray'],receiverSrc('R','0','M'),DOME['vented-S'],RETENTION.M,ACCESSORY['MECHARGE Charger'],ACCESSORY.CeruStop]
      .forEach(src=>preload(src,'high'));
  }

  function installStyles(){
    if(document.getElementById('reference-image-styles'))return;
    const style=document.createElement('style');
    style.id='reference-image-styles';
    style.textContent=`
      .ref-catalog-image{width:100%;height:100%;object-fit:contain;display:block;filter:none!important}
      .ref-image-slot.ref-has-catalog-image{border-style:solid;border-color:#d9e6e8;background:#fff;padding:8px;overflow:hidden}
      .ref-product-card .ref-image-slot.ref-has-catalog-image,.ref-family-card .ref-image-slot.ref-has-catalog-image{height:210px}
      .ref-model-hero .ref-image-slot.ref-has-catalog-image{height:285px}
      .ref-component-preview .ref-image-slot.ref-has-catalog-image{height:220px}
      .ref-accessory-card .ref-image-slot.ref-has-catalog-image{height:210px}
      .ref-product-card[data-ref-product="spark"] .ref-image-slot.ref-has-catalog-image,.ref-family-card .ref-image-slot.ref-has-catalog-image,.ref-model-hero .ref-image-slot.ref-has-catalog-image,.ref-component-preview .ref-image-slot.ref-has-catalog-image,.ref-accessory-card .ref-image-slot.ref-has-catalog-image{border:0;border-radius:0;background:transparent;padding:4px 8px}
      .ref-retention-preview{margin-top:14px;max-width:440px}
      .ref-color-card{position:relative;overflow:hidden;padding:8px 8px 10px!important}
      .ref-color-card .ref-color-chip{height:88px!important;border:0!important;background:#fff!important;display:flex;align-items:center;justify-content:center;overflow:hidden;margin-bottom:7px!important}
      .ref-color-product{width:100%;height:100%;object-fit:contain;display:block;filter:none!important}
      .ref-color-card.active .ref-color-chip{box-shadow:inset 0 0 0 2px rgba(0,140,149,.18)}
      .ref-color-card.active:after{content:'✓';position:absolute;right:10px;top:9px;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--teal);color:#fff;font-size:12px;font-weight:900;box-shadow:0 2px 6px rgba(0,0,0,.14)}
      @media(max-width:760px){
        .ref-product-card .ref-image-slot.ref-has-catalog-image,.ref-family-card .ref-image-slot.ref-has-catalog-image{height:190px}
        .ref-model-hero .ref-image-slot.ref-has-catalog-image{height:240px}
        .ref-component-preview .ref-image-slot.ref-has-catalog-image{height:190px}
        .ref-accessory-card .ref-image-slot.ref-has-catalog-image{height:190px}
        .ref-color-card .ref-color-chip{height:74px!important}
        .ref-retention-preview{max-width:none}
      }
    `;
    document.head.appendChild(style);
  }

  function catalogImg(src,alt,className='ref-catalog-image'){
    const img=document.createElement('img');
    img.className=className;
    img.alt=alt;
    img.decoding='async';
    img.loading='eager';
    try{img.fetchPriority='high';}catch(e){}
    img.src=src;
    return img;
  }

  function setImage(slot,src,alt){
    if(!slot||!src||slot.dataset.catalogImage===src)return;
    const original=slot.innerHTML;
    slot.dataset.catalogImage=src;
    const cached=imageCache.get(src)?.img;

    const commit=()=>{
      if(!slot.isConnected||slot.dataset.catalogImage!==src)return;
      const img=catalogImg(src,alt);
      img.onerror=()=>{
        if(slot.dataset.catalogImage!==src)return;
        slot.classList.remove('ref-has-catalog-image');
        slot.innerHTML=original;
        slot.dataset.catalogImageFailed='1';
      };
      slot.classList.add('ref-has-catalog-image');
      slot.replaceChildren(img);
    };

    /* If already decoded, swap synchronously. Otherwise keep the existing visual until ready. */
    if(cached&&cached.complete&&cached.naturalWidth){commit();return;}
    preload(src,'high').then(img=>{
      if(img&&img.naturalWidth)commit();
      else if(slot.isConnected&&slot.dataset.catalogImage===src){
        slot.classList.remove('ref-has-catalog-image');
        slot.innerHTML=original;
        slot.dataset.catalogImageFailed='1';
      }
    });
  }

  function patchColorCards(root,family){
    root.querySelectorAll('.ref-color-card[data-color]').forEach(card=>{
      const id=card.dataset.color||'silver-gray';
      const chip=card.querySelector('.ref-color-chip');
      if(!chip)return;
      const src=FAMILY[family]?.[id];
      if(!src||chip.dataset.catalogImage===src)return;
      const original=chip.innerHTML;
      chip.dataset.catalogImage=src;
      const alt=card.querySelector('strong')?.textContent||'Spark color';
      const commit=()=>{
        if(!chip.isConnected||chip.dataset.catalogImage!==src)return;
        const img=catalogImg(src,alt,'ref-color-product');
        img.onerror=()=>{if(chip.dataset.catalogImage===src)chip.innerHTML=original;};
        chip.replaceChildren(img);
      };
      const cached=imageCache.get(src)?.img;
      if(cached&&cached.complete&&cached.naturalWidth)commit();
      else preload(src,'high').then(img=>{if(img&&img.naturalWidth)commit();});
    });
  }

  function activeDataset(root,selector,key,fallback){
    return root.querySelector(selector+'.active')?.dataset[key]||fallback;
  }

  function section(root,title){
    return [...root.querySelectorAll('.ref-section')].find(x=>x.querySelector('h4')?.textContent.trim()===title);
  }

  function patch(){
    const root=document.getElementById('references');
    if(!root)return;

    setImage(root.querySelector('.ref-product-card[data-ref-product="spark"] .ref-image-slot'),FAMILY.standard['silver-gray'],'Miracle-Ear Spark MEMINI E RIC in Silver Gray');
    setImage(root.querySelector('.ref-family-card[data-family="standard"] .ref-image-slot'),FAMILY.standard['silver-gray'],'Miracle-Ear Spark MEMINI E RIC in Silver Gray');
    setImage(root.querySelector('.ref-family-card[data-family="ai"] .ref-image-slot'),FAMILY.ai['silver-gray'],'Miracle-Ear Spark MEMINI E AI RIC in Silver Gray');

    const hero=root.querySelector('.ref-model-hero');
    if(hero){
      const model=(hero.querySelector('.ref-model-name')?.textContent||'').toUpperCase();
      const family=model.includes(' AI')?'ai':'standard';
      const selectedColor=activeDataset(root,'.ref-color-card','color',''),color=selectedColor||'silver-gray';
      const colorName=root.querySelector('.ref-color-card.active strong')?.textContent||'reference finish';
      setImage(hero.querySelector('.ref-hero-visual > .ref-image-slot'),FAMILY[family][color],`Miracle-Ear ${family==='ai'?'Spark MEMINI E AI RIC':'Spark MEMINI E RIC'} in ${colorName}`);
      patchColorCards(root,family);
    }

    const retentionSection=section(root,'Retention Locks');
    if(retentionSection){
      const size=activeDataset(retentionSection,'[data-retention]','retention','');
      if(size){
        let preview=retentionSection.querySelector('.ref-retention-preview');
        if(!preview){
          preview=document.createElement('div');
          preview.className='ref-component-preview ref-retention-preview';
          preview.innerHTML='<div class="ref-image-slot"></div>';
          retentionSection.appendChild(preview);
        }
        setImage(preview.querySelector('.ref-image-slot'),RETENTION[size],`${size} Spark retention lock`);
      }
    }

    const accessorySection=section(root,'Charger & Maintenance');
    if(accessorySection){
      accessorySection.querySelectorAll('.ref-accessory-card').forEach(card=>{
        const name=card.querySelector('h5')?.textContent.trim();
        if(name&&ACCESSORY[name])setImage(card.querySelector('.ref-image-slot'),ACCESSORY[name],name);
      });
    }
  }

  function start(){
    installStyles();
    preloadSparkLibrary();
    patch();
    const root=document.getElementById('references');
    if(!root)return;

    document.addEventListener('clinical-assistant:references-rendered',patch);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
