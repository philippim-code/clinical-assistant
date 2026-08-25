/* Miracle-Ear Clinical Assistant v1.8.0-dev4 — Spark catalog imagery */
(function(){
  'use strict';

  const IMG={
    standard:'assets/spark/standard-silver-gray.svg?v=dev4',
    ai:'assets/spark/ai-silver-gray.svg?v=dev4'
  };

  function installStyles(){
    if(document.getElementById('reference-image-styles'))return;
    const style=document.createElement('style');
    style.id='reference-image-styles';
    style.textContent=`
      .ref-catalog-image{width:100%;height:100%;object-fit:contain;display:block;filter:drop-shadow(0 8px 10px rgba(24,52,58,.10))}
      .ref-image-slot.ref-has-catalog-image{border-style:solid;border-color:#d9e6e8;background:linear-gradient(180deg,#fff,#f8fbfc);padding:8px;overflow:hidden}
      .ref-product-card .ref-image-slot.ref-has-catalog-image,.ref-family-card .ref-image-slot.ref-has-catalog-image{height:210px}
      .ref-model-hero .ref-image-slot.ref-has-catalog-image{height:285px;background:#fff}
      @media(max-width:760px){
        .ref-product-card .ref-image-slot.ref-has-catalog-image,.ref-family-card .ref-image-slot.ref-has-catalog-image{height:190px}
        .ref-model-hero .ref-image-slot.ref-has-catalog-image{height:240px}
      }
    `;
    document.head.appendChild(style);
  }

  function setImage(slot,src,alt){
    if(!slot||slot.dataset.catalogImage===src)return;
    slot.dataset.catalogImage=src;
    slot.classList.add('ref-has-catalog-image');
    slot.innerHTML=`<img class="ref-catalog-image" src="${src}" alt="${alt}">`;
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
      setImage(hero.querySelector('.ref-image-slot'),model.includes(' AI')?IMG.ai:IMG.standard,model.includes(' AI')?'Miracle-Ear Spark MEMINI E AI RIC in Silver Gray':'Miracle-Ear Spark MEMINI E RIC in Silver Gray');
    }
  }

  function start(){
    installStyles();
    patch();
    const root=document.getElementById('references');
    if(!root)return;
    new MutationObserver(()=>patch()).observe(root,{childList:true,subtree:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
