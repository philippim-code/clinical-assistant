/* Miracle-Ear Clinical Assistant — v1.9.0-dev50
   Final Home Dashboard interaction/alignment polish.
*/
(function(){
  'use strict';

  function aboutButton(){
    return document.querySelector('.tabs .tab-btn[data-tab="about"]') ||
      [...document.querySelectorAll('.tabs .tab-btn')].find(button=>button.textContent.includes('About')) || null;
  }

  function openWhatsNew(){
    const button=aboutButton();
    if(button&&typeof window.showTab==='function')window.showTab('about',button);
    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>{
        document.getElementById('aboutWhatsNew')?.scrollIntoView({behavior:'smooth',block:'start'});
      });
    });
  }

  function wrapCardActions(card){
    if(!card)return;
    let actions=card.querySelector(':scope > .oa-dashboard-actions');
    if(!actions){
      const buttons=[...card.children].filter(child=>child.tagName==='BUTTON');
      if(!buttons.length)return;
      actions=document.createElement('div');
      actions.className='oa-dashboard-actions';
      buttons[0].insertAdjacentElement('beforebegin',actions);
      buttons.forEach(button=>actions.appendChild(button));
    }
  }

  function wireVersionButton(card){
    if(!card)return;
    card.dataset.oaCurrentVersion='true';
    card.removeAttribute('role');
    card.removeAttribute('tabindex');
    card.removeAttribute('aria-label');
    card.style.cursor='';

    const button=card.querySelector('.oa-dashboard-actions button, :scope > button');
    if(!button||button.dataset.oaDev50Wired==='1')return;
    button.dataset.oaDev50Wired='1';
    button.removeAttribute('onclick');
    button.onclick=null;
    button.addEventListener('click',event=>{
      event.preventDefault();
      event.stopPropagation();
      openWhatsNew();
    });
  }

  function polishDashboard(){
    const dashboard=document.getElementById('dashboardCards');
    if(!dashboard)return;
    const cards=[...dashboard.querySelectorAll('.dashboard-card')];
    cards.forEach(wrapCardActions);
    const versionCard=cards.find(card=>card.querySelector('.label')?.textContent.trim()==='Current Version');
    wireVersionButton(versionCard);
  }

  function wrapRenderDashboard(attempt=0){
    if(typeof window.renderDashboard==='function'&&!window.renderDashboard.__oaDev50Wrapped){
      const baseRenderDashboard=window.renderDashboard;
      const wrapped=function(){
        const result=baseRenderDashboard.apply(this,arguments);
        requestAnimationFrame(polishDashboard);
        return result;
      };
      wrapped.__oaDev50Wrapped=true;
      window.renderDashboard=wrapped;
      requestAnimationFrame(polishDashboard);
      return;
    }
    if(attempt<60)setTimeout(()=>wrapRenderDashboard(attempt+1),50);
  }

  function init(){
    wrapRenderDashboard();
    requestAnimationFrame(polishDashboard);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.addEventListener('load',()=>requestAnimationFrame(polishDashboard),{once:true});
  window.addEventListener('pageshow',()=>requestAnimationFrame(polishDashboard));
})();
