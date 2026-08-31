/* Miracle-Ear Clinical Assistant — v1.9.0-dev49
   Make Current Version navigate directly to About > What's New.
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

  function wireVersionCard(){
    const dashboard=document.getElementById('dashboardCards');
    if(!dashboard)return;
    const card=[...dashboard.querySelectorAll('.dashboard-card')].find(item=>item.querySelector('.label')?.textContent.trim()==='Current Version');
    if(!card||card.dataset.oaDev49Wired==='1')return;

    card.dataset.oaDev49Wired='1';
    card.setAttribute('role','button');
    card.setAttribute('tabindex','0');
    card.setAttribute('aria-label',"Open What's New in About");
    card.style.cursor='pointer';

    card.addEventListener('click',event=>{
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      openWhatsNew();
    },true);

    card.addEventListener('keydown',event=>{
      if(event.key==='Enter'||event.key===' '){
        event.preventDefault();
        event.stopPropagation();
        openWhatsNew();
      }
    });
  }

  function wrapRenderDashboard(attempt=0){
    if(typeof window.renderDashboard==='function'&&!window.renderDashboard.__oaDev49Wrapped){
      const baseRenderDashboard=window.renderDashboard;
      const wrapped=function(){
        const result=baseRenderDashboard.apply(this,arguments);
        requestAnimationFrame(wireVersionCard);
        return result;
      };
      wrapped.__oaDev49Wrapped=true;
      window.renderDashboard=wrapped;
      requestAnimationFrame(wireVersionCard);
      return;
    }
    if(attempt<60)setTimeout(()=>wrapRenderDashboard(attempt+1),50);
  }

  function init(){
    wrapRenderDashboard();
    requestAnimationFrame(wireVersionCard);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.addEventListener('load',()=>requestAnimationFrame(wireVersionCard),{once:true});
  window.addEventListener('pageshow',()=>requestAnimationFrame(wireVersionCard));
})();
