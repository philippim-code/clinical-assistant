/* Miracle-Ear Clinical Assistant — v1.9.0-dev37
   Dashboard pointer routing that does not depend on browser click hit-testing.
*/
(function(){
  'use strict';

  let pressedCard=null;
  let suppressClickUntil=0;

  function actionableCards(){
    return [...document.querySelectorAll('#dashboardCards .oa-dashboard-card.is-actionable')];
  }

  function cardAt(x,y){
    return actionableCards().find(card=>{
      const rect=card.getBoundingClientRect();
      return x>=rect.left&&x<=rect.right&&y>=rect.top&&y<=rect.bottom;
    })||null;
  }

  function clearHover(){
    actionableCards().forEach(card=>card.classList.remove('oa-geometry-hover'));
  }

  function clearPressed(){
    actionableCards().forEach(card=>card.classList.remove('oa-geometry-pressed'));
    pressedCard=null;
  }

  function tabButton(label){
    return [...document.querySelectorAll('.tabs .tab-btn')].find(button=>(button.textContent||'').includes(label))||null;
  }

  function openTabByButton(label){
    const button=tabButton(label);
    if(button){
      button.click();
      return true;
    }
    return false;
  }

  function openOfficeProfiles(){
    if(!openTabByButton('Settings'))return;
    setTimeout(()=>{
      const openButton=document.getElementById('oaOfficeSettingsOpen');
      if(openButton){openButton.click();return;}
      document.getElementById('oaOfficeSettingsLauncher')?.scrollIntoView({behavior:'smooth',block:'center'});
    },40);
  }

  function openWhatsNew(){
    if(!openTabByButton('About'))return;
    setTimeout(()=>document.getElementById('aboutWhatsNew')?.scrollIntoView({behavior:'smooth',block:'start'}),40);
  }

  function runAction(card){
    if(!card)return;
    const action=card.dataset.dashboardAction||'';
    if(action==='draft'){
      if(typeof window.resumeActiveDraft==='function')window.resumeActiveDraft();
      else openTabByButton('Sycle Notes');
      return;
    }
    if(action==='outcomes'){
      openTabByButton('Saved Outcomes');
      return;
    }
    if(action==='office'){
      openOfficeProfiles();
      return;
    }
    if(action==='version'){
      openWhatsNew();
    }
  }

  document.addEventListener('pointermove',event=>{
    const card=cardAt(event.clientX,event.clientY);
    actionableCards().forEach(item=>item.classList.toggle('oa-geometry-hover',item===card));
  },true);

  document.addEventListener('pointerdown',event=>{
    const card=cardAt(event.clientX,event.clientY);
    clearPressed();
    if(!card)return;
    pressedCard=card;
    card.classList.add('oa-geometry-pressed');
  },true);

  document.addEventListener('pointerup',event=>{
    const card=cardAt(event.clientX,event.clientY);
    const shouldRun=Boolean(card&&pressedCard===card);
    clearPressed();
    if(!shouldRun)return;
    suppressClickUntil=performance.now()+650;
    event.preventDefault();
    event.stopImmediatePropagation();
    runAction(card);
  },true);

  document.addEventListener('pointercancel',clearPressed,true);
  document.addEventListener('pointerleave',clearHover,true);
  window.addEventListener('blur',()=>{clearHover();clearPressed();});

  /* Prevent the synthesized click that follows a handled pointerup from
     running the card's legacy inline onclick a second time. */
  document.addEventListener('click',event=>{
    if(performance.now()>suppressClickUntil)return;
    const target=event.target?.closest?.('#dashboardCards .oa-dashboard-card');
    if(!target)return;
    event.preventDefault();
    event.stopImmediatePropagation();
  },true);
})();
