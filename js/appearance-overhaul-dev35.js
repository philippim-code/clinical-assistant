/* Miracle-Ear Clinical Assistant — v1.9.0-dev35
   Home Dashboard interaction proxy only. No layout changes.
*/
(function(){
  'use strict';

  function cardAt(x,y){
    const cards=[...document.querySelectorAll('#dashboardCards .oa-dashboard-card.is-actionable')];
    return cards.find(card=>{
      const rect=card.getBoundingClientRect();
      return x>=rect.left&&x<=rect.right&&y>=rect.top&&y<=rect.bottom;
    })||null;
  }

  function clearPressed(){
    document.querySelectorAll('#dashboardCards .oa-dashboard-card.oa-proxy-pressed').forEach(card=>card.classList.remove('oa-proxy-pressed'));
  }

  document.addEventListener('pointerdown',event=>{
    const card=cardAt(event.clientX,event.clientY);
    clearPressed();
    if(card)card.classList.add('oa-proxy-pressed');
  },true);

  document.addEventListener('pointercancel',clearPressed,true);

  document.addEventListener('pointerup',()=>{
    setTimeout(clearPressed,80);
  },true);

  document.addEventListener('click',event=>{
    const card=cardAt(event.clientX,event.clientY);
    if(!card)return;
    const action=card.dataset.dashboardAction||'';
    if(!action||typeof window.oaDashboardAction!=='function')return;
    event.preventDefault();
    event.stopImmediatePropagation();
    window.oaDashboardAction(action);
  },true);
})();
