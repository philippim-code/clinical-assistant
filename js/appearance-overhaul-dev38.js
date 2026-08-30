/* Miracle-Ear Clinical Assistant — v1.9.0-dev38
   iPad-compatible Home Dashboard routing using mouse + native touch events.
*/
(function(){
  'use strict';

  let pressedCard=null;
  let lastActivation=0;

  function cards(){
    return [...document.querySelectorAll('#dashboardCards .oa-dashboard-card.is-actionable')];
  }

  function cardAt(x,y){
    return cards().find(card=>{
      const r=card.getBoundingClientRect();
      return x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;
    })||null;
  }

  function setHover(card){
    cards().forEach(item=>item.classList.toggle('oa-compat-hover',item===card));
  }

  function clearPressed(){
    cards().forEach(item=>item.classList.remove('oa-compat-pressed'));
    pressedCard=null;
  }

  function run(card){
    if(!card)return;
    const now=Date.now();
    if(now-lastActivation<350)return;
    lastActivation=now;
    const action=card.dataset.dashboardAction||'';
    if(typeof window.oaDashboardAction==='function'){
      window.oaDashboardAction(action);
      return;
    }
    if(action==='outcomes')document.querySelectorAll('.tab-btn')[2]?.click();
    if(action==='office')document.querySelectorAll('.tab-btn')[5]?.click();
    if(action==='version')document.querySelectorAll('.tab-btn')[6]?.click();
    if(action==='draft'&&typeof window.resumeActiveDraft==='function')window.resumeActiveDraft();
  }

  /* Trackpad / mouse path. These deliberately do not use Pointer Events. */
  document.addEventListener('mousemove',event=>{
    setHover(cardAt(event.clientX,event.clientY));
  },true);

  document.addEventListener('mousedown',event=>{
    const card=cardAt(event.clientX,event.clientY);
    clearPressed();
    if(!card)return;
    pressedCard=card;
    card.classList.add('oa-compat-pressed');
  },true);

  document.addEventListener('mouseup',event=>{
    const card=cardAt(event.clientX,event.clientY);
    const activate=card&&pressedCard===card;
    clearPressed();
    if(activate)run(card);
  },true);

  /* Native iOS touch path. */
  document.addEventListener('touchstart',event=>{
    const touch=event.touches&&event.touches[0];
    if(!touch)return;
    const card=cardAt(touch.clientX,touch.clientY);
    clearPressed();
    if(!card)return;
    pressedCard=card;
    card.classList.add('oa-compat-pressed');
  },{capture:true,passive:true});

  document.addEventListener('touchend',event=>{
    const touch=event.changedTouches&&event.changedTouches[0];
    if(!touch){clearPressed();return;}
    const card=cardAt(touch.clientX,touch.clientY);
    const activate=card&&pressedCard===card;
    clearPressed();
    if(activate)run(card);
  },{capture:true,passive:true});

  document.addEventListener('touchcancel',clearPressed,{capture:true,passive:true});
  document.addEventListener('mouseleave',()=>setHover(null),true);
  window.addEventListener('blur',()=>{setHover(null);clearPressed();});
})();
