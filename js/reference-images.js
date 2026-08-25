/* Miracle-Ear Clinical Assistant v1.8.0-dev5 — Spark catalog imagery */
(function(){
  'use strict';

  const IMG={
    standard:'assets/spark/standard-silver-gray.svg?v=dev5',
    ai:'assets/spark/ai-silver-gray.svg?v=dev5'
  };

  const COLOR_FILTERS={
    'sand-beige':'sepia(.34) saturate(.78) hue-rotate(352deg) brightness(1.08) contrast(.94)',
    'sandalwood':'sepia(.48) saturate(.86) hue-rotate(345deg) brightness(.88) contrast(1.02)',
    'silver-gray':'none',
    'velvet-black':'grayscale(.88) brightness(.34) contrast(1.28)'
  };

  function installStyles(){
    if(document.getElementById('reference-image-styles'))return;
    const style=document.createElement('style');
    style.id='reference-image-styles';
    style.textContent=`
      .ref-catalog-image{width:100%;height:100%;object-fit:contain;display:block;filter:drop-shadow(0 8px 10px rgba(24,52,58,.10));transition:filter .18s ease,transform .18s ease}
      .ref-image-slot.ref-has-catalog-image{border-style:solid;border-color:#d9e6e8;background:linear-gradient(180deg,#fff,#f8fbfc);padding:8px;overflow:hidden}
      .ref-product-card .ref-image-slot.ref-has-catalog-image,.ref-family-card .ref-image-slot.ref-has-catalog-image{height:210px}
      .ref-model-hero .ref-image-slot.ref-has-catalog-image{height:285px;background:#fff}
      .ref-color-card{position:relative;overflow:hidden;padding:8px 8px 10px!important}
      .ref-color-card .ref-color-chip{height:88px!important;border:0!important;background:linear-gradient(180deg,#fff,#f7fafb)!important;display:flex;align-items:center;justify-content:center;overflow:hidden;margin-bottom:7px!important}
      .ref-color-product{width:100%;height:100%;object-fit:contain;display:block;transform:scale(1.06);filter:var(--spark-color-filter,none) drop-shadow(0 4px 5px rgba(24,52,58,.08))}
      .ref-color-card.active .ref-color-chip{box-shadow:inset 0 0 0 2px rgba(0,140,149,.18)}
      .ref-color-card.active:after{content:'✓';position:absolute;right:10px;top:9px;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--teal);color:#fff;font-size:12px;font-weight:900;box-shadow:0 2px 6px rgba(0,0,0,.14)}
      @media(max-width:760px){
        .ref-product-card .ref-image-slot.ref-has-catalog-image,.ref-family-card .ref-image-slot.ref-has-catalog-image{height:190px}
        .ref-model-hero .ref-image-slot.ref-has-catalog-image{height:240px}
        .ref-color-card .ref-color-chip{height:74px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function setImage(slot,src,alt,filter='none'){
    if(!slot)return;
    const key=src+'|'+filter;
    if(slot.dataset.catalogImage===key)return;
    slot.dataset.catalogImage=key;
    slot.classList.add('ref-has-catalog-image');
    slot.innerHTML=`<img class="ref-catalog-image" src="${src}" alt="${alt}" style="filter:${filter==='none'?'drop-shadow(0 8px 10px rgba(24,52,58,.10))':filter+' drop-shadow(0 8px 10px rgba(24,52,58,.10))'}">`;
  }

  function activeColor(root){
    const active=root.querySelector('.ref-color-card.active');
    return active?.dataset.color||'silver-gray';
  }

  function patchColorCards(root,familySrc){
    root.querySelectorAll('.ref-color-card[data-color]').forEach(card=>{
      const id=card.dataset.color||'silver-gray';
      const chip=card.querySelector('.ref-color-chip');
      if(!chip)return;
      const marker=familySrc+'|'+id;
      if(chip.dataset.catalogThumb===marker)return;
      chip.dataset.catalogThumb=marker;
      chip.innerHTML=`<img class="ref-color-product" src="${familySrc}" alt="${card.querySelector('strong')?.textContent||'Spark color'}" style="--spark-color-filter:${COLOR_FILTERS[id]||'none'}">`;
    });
  }

  function patch(){
    const root=document.getElementById('references');
    if(!root)return;

    setImage(root.querySelector('.ref-product-card[data-ref-product="spark"] .ref-image-slot'),IMG.standard,'Miracle-Ear Spark MEMINI E RIC in Silver Gray');
    setImage(root.querySelector('.ref-family-card[data-family="standard"] .ref-image-slot'),IMG.standard,'Miracle-Ear Spark MEMINI E RIC in Silver Gray');
    setImage(root.querySelector('.ref-family-card[data-family="ai"] .ref-image-slot'),IMG.ai,'Miracle-Ear Spark MEMINI E AI RIC in Silver Gray');

    const hero=root.querySelector('.ref-model-hero');
    if(hero){
      const model=(hero.querySelector('.ref-model-name')?.textContent||hero.textContent||'').toUpperCase();
      const isAI=model.includes(' AI');
      const src=isAI?IMG.ai:IMG.standard;
      const color=activeColor(root);
      const colorName=root.querySelector('.ref-color-card.active strong')?.textContent||'Silver Gray';
      setImage(hero.querySelector('.ref-image-slot'),src,`Miracle-Ear ${isAI?'Spark MEMINI E AI RIC':'Spark MEMINI E RIC'} in ${colorName}`,COLOR_FILTERS[color]||'none');
      patchColorCards(root,src);
    }
  }

  function start(){
    installStyles();
    patch();
    const root=document.getElementById('references');
    if(!root)return;
    new MutationObserver(()=>patch()).observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
