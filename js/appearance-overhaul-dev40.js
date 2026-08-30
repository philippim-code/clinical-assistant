/* Miracle-Ear Clinical Assistant — v1.9.0-dev40
   Safely transplant the existing Continue Working cards into the first two
   Home Dashboard slots without rebuilding the dashboard or changing core logic.
*/
(function(){
  'use strict';

  function tabButton(label){
    return [...document.querySelectorAll('.tabs .tab-btn')].find(button=>button.textContent.includes(label));
  }

  function openSavedOutcomes(){
    const button=tabButton('Saved Outcomes');
    if(button&&typeof window.showTab==='function')window.showTab('outcomes',button);
  }

  function activateCard(card,handler){
    if(!card)return;
    card.addEventListener('click',handler);
    card.addEventListener('keydown',event=>{
      if(event.key==='Enter'||event.key===' '){
        event.preventDefault();
        handler();
      }
    });
  }

  function cloneContinueCard(source,type){
    if(!source)return null;
    const card=source.cloneNode(true);
    card.classList.add('oa-dashboard-continue-card');
    card.dataset.oaDashboardContinue=type;

    if(type==='draft'){
      activateCard(card,()=>{
        if(typeof window.resumeActiveDraft==='function')window.resumeActiveDraft();
      });
    }else if(type==='outcomes'){
      activateCard(card,openSavedOutcomes);
    }
    return card;
  }

  function retireSeparateContinueSection(){
    const section=document.getElementById('homeContinueSection');
    if(section){
      section.hidden=true;
      section.classList.remove('oa-has-work');
      section.setAttribute('aria-hidden','true');
    }

    const preference=document.getElementById('homeShowContinueWorking');
    const wrapper=preference?.closest('label');
    if(wrapper)wrapper.hidden=true;
  }

  function transplantContinueCards(){
    const dashboard=document.getElementById('dashboardCards');
    const continueGrid=document.getElementById('homeContinueGrid');
    if(!dashboard||!continueGrid||dashboard.children.length<4){
      retireSeparateContinueSection();
      return;
    }

    const draftSource=continueGrid.querySelector('[data-home-continue="draft"]');
    const outcomesSource=continueGrid.querySelector('[data-home-continue="outcomes"]');

    /* The base dashboard has just been freshly rendered before this runs.
       Only replace a slot when the corresponding Continue Working card exists;
       otherwise preserve the original zero-state dashboard card. */
    if(draftSource){
      const draftCard=cloneContinueCard(draftSource,'draft');
      if(draftCard)dashboard.children[0].replaceWith(draftCard);
    }

    if(outcomesSource){
      const outcomeCard=cloneContinueCard(outcomesSource,'outcomes');
      if(outcomeCard)dashboard.children[1].replaceWith(outcomeCard);
    }

    retireSeparateContinueSection();
  }

  function retirePreferenceWhenSettingsRender(){
    const input=document.getElementById('homeShowContinueWorking');
    const wrapper=input?.closest('label');
    if(wrapper)wrapper.hidden=true;
  }

  function wrapWhenReady(attempt=0){
    if(typeof window.renderDashboard==='function'&&!window.renderDashboard.__oaDev40Wrapped){
      const baseRenderDashboard=window.renderDashboard;
      const wrapped=function(){
        const result=baseRenderDashboard.apply(this,arguments);
        transplantContinueCards();
        return result;
      };
      wrapped.__oaDev40Wrapped=true;
      window.renderDashboard=wrapped;
    }

    if(typeof window.renderSettings==='function'&&!window.renderSettings.__oaDev40Wrapped){
      const baseRenderSettings=window.renderSettings;
      const wrapped=function(){
        const result=baseRenderSettings.apply(this,arguments);
        retirePreferenceWhenSettingsRender();
        return result;
      };
      wrapped.__oaDev40Wrapped=true;
      window.renderSettings=wrapped;
    }

    if((typeof window.renderDashboard!=='function'||typeof window.renderSettings!=='function')&&attempt<40){
      setTimeout(()=>wrapWhenReady(attempt+1),50);
    }
  }

  function init(){
    wrapWhenReady();
    /* Let dev8 finish its existing Continue Working render first. */
    requestAnimationFrame(()=>{
      transplantContinueCards();
      retirePreferenceWhenSettingsRender();
    });
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.addEventListener('load',()=>requestAnimationFrame(transplantContinueCards),{once:true});
  window.addEventListener('pageshow',()=>requestAnimationFrame(transplantContinueCards));
})();
