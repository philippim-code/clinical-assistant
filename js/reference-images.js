/* Miracle-Ear Clinical Assistant v1.8.0-dev6 — exact Spark manufacturer imagery */
(function(){
  'use strict';

  const BASE='assets/spark/catalog/';
  const FAMILY={
    standard:{
      'sand-beige':BASE+'hearing-aids/standard-sand-beige.png',
      'sandalwood':BASE+'hearing-aids/standard-sandalwood.png',
      'silver-gray':BASE+'hearing-aids/standard-silver-gray.png',
      'velvet-black':BASE+'hearing-aids/standard-velvet-black.png'
    },
    ai:{
      'sand-beige':BASE+'hearing-aids/ai-sand-beige.png',
      'sandalwood':BASE+'hearing-aids/ai-sandalwood.png',
      'silver-gray':BASE+'hearing-aids/ai-silver-gray.png',
      'velvet-black':BASE+'hearing-aids/ai-velvet-black.png'
    }
  };
  const SILVER_FALLBACK={standard:'assets/spark/standard-silver-gray.svg?v=dev6',ai:'assets/spark/ai-silver-gray.svg?v=dev6'};
  const DOME={
    'open-S':BASE+'domes/open-s.png','open-M':BASE+'domes/open-m.png','open-L':BASE+'domes/open-l.png',
    'vented-S':BASE+'domes/vented-s.png','vented-M':BASE+'domes/vented-m.png','vented-L':BASE+'domes/vented-l.png',
    'power-S':BASE+'domes/power-s.png','power-M':BASE+'domes/power-m.png','power-L':BASE+'domes/power-l.png',
    'cap-One Size':BASE+'domes/cap.png'
  };
  const RETENTION={S:BASE+'retention/retention-s.png',M:BASE+'retention/retention-m.png',L:BASE+'retention/retention-l.png'};
  const ACCESSORY={'MECHARGE Charger':BASE+'accessories/mecharge-charger.png','CeruStop':BASE+'accessories/cerustop.png'};

  function receiverSrc(side,length,power){return BASE+`receivers/${side}-${length}-${power}.png`;}

  function installStyles(){
    if(document.getElementById('reference-image-styles'))return;
    const style=document.createElement('style');
    style.id='reference-image-styles';
    style.textContent=`
      .ref-catalog-image{width:100%;height:100%;object-fit:contain;display:block;filter:drop-shadow(0 8px 10px rgba(24,52,58,.10))}
      .ref-image-slot.ref-has-catalog-image{border-style:solid;border-color:#d9e6e8;background:linear-gradient(180deg,#fff,#f8fbfc);padding:8px;overflow:hidden}
      .ref-product-card .ref-image-slot.ref-has-catalog-image,.ref-family-card .ref-image-slot.ref-has-catalog-image{height:210px}
      .ref-model-hero .ref-image-slot.ref-has-catalog-image{height:285px;background:#fff}
      .ref-component-preview .ref-image-slot.ref-has-catalog-image,.ref-accessory-card .ref-image-slot.ref-has-catalog-image{height:220px;background:#fff}
      .ref-retention-preview{margin-top:14px;max-width:430px}
      .ref-color-card{position:relative;overflow:hidden;padding:8px 8px 10px!important}
      .ref-color-card .ref-color-chip{height:88px!important;border:0!important;background:linear-gradient(180deg,#fff,#f7fafb)!important;display:flex;align-items:center;justify-content:center;overflow:hidden;margin-bottom:7px!important}
      .ref-color-product{width:100%;height:100%;object-fit:contain;display:block;filter:drop-shadow(0 4px 5px rgba(24,52,58,.08))}
      .ref-color-card.active .ref-color-chip{box-shadow:inset 0 0 0 2px rgba(0,140,149,.18)}
      .ref-color-card.active:after{content:'✓';position:absolute;right:10px;top:9px;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--teal);color:#fff;font-size:12px;font-weight:900;box-shadow:0 2px 6px rgba(0,0,0,.14)}
      @media(max-width:760px){
        .ref-product-card .ref-image-slot.ref-has-catalog-image,.ref-family-card .ref-image-slot.ref-has-catalog-image{height:190px}
        .ref-model-hero .ref-image-slot.ref-has-catalog-image{height:240px}
        .ref-component-preview .ref-image-slot.ref-has-catalog-image,.ref-accessory-card .ref-image-slot.ref-has-catalog-image{height:190px}
        .ref-color-card .ref-color-chip{height:74px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function setImage(slot,src,alt,fallback=''){
    if(!slot||slot.dataset.catalogImage===src)return;
    const original=slot.innerHTML;
    slot.dataset.catalogImage=src;
    slot.classList.add('ref-has-catalog-image');
    const img=document.createElement('img');
    img.className='ref-catalog-image';img.src=src;img.alt=alt;
    img.onerror=()=>{
      if(fallback&&img.src!==new URL(fallback,document.baseURI).href){img.src=fallback;return;}
      slot.classList.remove('ref-has-catalog-image');slot.innerHTML=original;slot.dataset.catalogImage='';
    };
    slot.replaceChildren(img);
  }

  function patchColorCards(root,family){
    root.querySelectorAll('.ref-color-card[data-color]').forEach(card=>{
      const id=card.dataset.color||'silver-gray';
      const chip=card.querySelector('.ref-color-chip');if(!chip)return;
      const src=FAMILY[family]?.[id];if(!src)return;
      const original=chip.innerHTML;
      const img=document.createElement('img');img.className='ref-color-product';img.src=src;img.alt=card.querySelector('strong')?.textContent||'Spark color';
      img.onerror=()=>{chip.innerHTML=original;chip.style.background='';};
      chip.replaceChildren(img);
    });
  }

  function activeDataset(root,selector,key,fallback){return root.querySelector(selector+'.active')?.dataset[key]||fallback;}
  function section(root,title){return [...root.querySelectorAll('.ref-section')].find(x=>x.querySelector('h4')?.textContent.trim()===title);}

  function patch(){
    const root=document.getElementById('references');if(!root)return;

    setImage(root.querySelector('.ref-product-card[data-ref-product="spark"] .ref-image-slot'),FAMILY.standard['silver-gray'],'Miracle-Ear Spark MEMINI E RIC in Silver Gray',SILVER_FALLBACK.standard);
    setImage(root.querySelector('.ref-family-card[data-family="standard"] .ref-image-slot'),FAMILY.standard['silver-gray'],'Miracle-Ear Spark MEMINI E RIC in Silver Gray',SILVER_FALLBACK.standard);
    setImage(root.querySelector('.ref-family-card[data-family="ai"] .ref-image-slot'),FAMILY.ai['silver-gray'],'Miracle-Ear Spark MEMINI E AI RIC in Silver Gray',SILVER_FALLBACK.ai);

    const hero=root.querySelector('.ref-model-hero');
    if(hero){
      const model=(hero.querySelector('.ref-model-name')?.textContent||'').toUpperCase();
      const family=model.includes(' AI')?'ai':'standard';
      const color=activeDataset(root,'.ref-color-card','color','silver-gray');
      const colorName=root.querySelector('.ref-color-card.active strong')?.textContent||'Silver Gray';
      setImage(hero.querySelector('.ref-image-slot'),FAMILY[family][color],`Miracle-Ear ${family==='ai'?'Spark MEMINI E AI RIC':'Spark MEMINI E RIC'} in ${colorName}`,color==='silver-gray'?SILVER_FALLBACK[family]:'');
      patchColorCards(root,family);
    }

    const receiverSection=section(root,'Receivers');
    if(receiverSection){
      const power=activeDataset(receiverSection,'[data-receiver-power]','receiverPower','M');
      const length=activeDataset(receiverSection,'[data-receiver-length]','receiverLength','0');
      const side=activeDataset(receiverSection,'[data-receiver-side]','receiverSide','right');
      const sideCode=side==='left'?'L':'R';
      setImage(receiverSection.querySelector('.ref-component-preview .ref-image-slot'),receiverSrc(sideCode,length,power),`${length}${power} ${side==='left'?'left blue':'right red'} Spark receiver`);
    }

    const domeSection=section(root,'Domes');
    if(domeSection){
      const type=activeDataset(domeSection,'[data-dome]','dome','vented');
      const size=activeDataset(domeSection,'[data-dome-size]','domeSize',type==='cap'?'One Size':'S');
      const key=type+'-'+size;
      setImage(domeSection.querySelector('.ref-component-preview .ref-image-slot'),DOME[key],`${type} dome ${size}`);
    }

    const retentionSection=section(root,'Retention Locks');
    if(retentionSection){
      const size=activeDataset(retentionSection,'[data-retention]','retention','M');
      let preview=retentionSection.querySelector('.ref-retention-preview');
      if(!preview){
        preview=document.createElement('div');preview.className='ref-retention-preview ref-component-preview';
        preview.innerHTML='<div class="ref-image-slot"><div class="ref-image-icon">🦻</div><strong>Retention Lock</strong><small>Exact manufacturer image</small></div>';
        retentionSection.appendChild(preview);
      }
      setImage(preview.querySelector('.ref-image-slot'),RETENTION[size],`${size} Spark retention lock`);
    }

    root.querySelectorAll('.ref-accessory-card').forEach(card=>{
      const name=card.querySelector('h5')?.textContent.trim();
      if(name&&ACCESSORY[name])setImage(card.querySelector('.ref-image-slot'),ACCESSORY[name],name);
    });
  }

  function start(){
    installStyles();patch();
    const root=document.getElementById('references');if(!root)return;
    new MutationObserver(()=>patch()).observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
