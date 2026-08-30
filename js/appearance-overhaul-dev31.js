/* Miracle-Ear Clinical Assistant — v1.9.0-dev31
   Home Dashboard interaction repair + fuller action copy.
*/
(function(){
  'use strict';

  const OFFICE_PROFILES_KEY='meClinicalOfficeProfilesV1';
  const CURRENT_OFFICE_KEY='meClinicalCurrentOfficeIdV1';
  let suppressClickUntil=0;
  let queued=false;

  function appointmentName(key){
    const names={hae:'HAE',aftercare:'Aftercare',delivery:'Delivery',retest:'Annual Retest',retestUnder:'Annual Retest',retestOver:'Annual Retest'};
    return names[key]||'Appointment';
  }

  function currentDraft(){
    try{return typeof window.getActiveDraft==='function'?window.getActiveDraft():null;}
    catch(e){return null;}
  }

  function pendingOutcomeCount(){
    try{
      if(typeof window.getSavedOutcomes!=='function')return 0;
      return window.getSavedOutcomes().filter(item=>typeof window.getOutcomeStatus==='function'?window.getOutcomeStatus(item)==='pending':!item.closed).length;
    }catch(e){return 0;}
  }

  function currentOfficeName(){
    try{
      const offices=JSON.parse(localStorage.getItem(OFFICE_PROFILES_KEY)||'[]');
      const currentId=localStorage.getItem(CURRENT_OFFICE_KEY)||'';
      if(Array.isArray(offices)){
        const current=offices.find(office=>office&&office.id===currentId)||offices[0];
        if(current?.name)return String(current.name).trim();
      }
    }catch(e){}
    const headerName=document.querySelector('.oa-office-header-name')?.textContent.trim()||'';
    return headerName.replace(/\s+Office$/i,'').trim()||'Current';
  }

  function tabButton(label){
    return [...document.querySelectorAll('.tabs .tab-btn')].find(button=>button.textContent.includes(label));
  }

  function openTab(tabId,label){
    const button=tabButton(label);
    if(button&&typeof window.showTab==='function')window.showTab(tabId,button);
  }

  function openOfficeProfiles(){
    openTab('settings','Settings');
    requestAnimationFrame(()=>{
      const openButton=document.getElementById('oaOfficeSettingsOpen');
      if(openButton){openButton.click();return;}
      document.getElementById('oaOfficeSettingsLauncher')?.scrollIntoView({behavior:'smooth',block:'center'});
    });
  }

  function openWhatsNew(){
    openTab('about','About');
    requestAnimationFrame(()=>{
      document.getElementById('aboutWhatsNew')?.scrollIntoView({behavior:'smooth',block:'start'});
    });
  }

  function runAction(action){
    if(action==='draft'){
      if(typeof window.resumeActiveDraft==='function')window.resumeActiveDraft();
      return;
    }
    if(action==='outcomes'){
      openTab('outcomes','Saved Outcomes');
      return;
    }
    if(action==='office'){
      openOfficeProfiles();
      return;
    }
    if(action==='version')openWhatsNew();
  }

  function actionableCard(target){
    const card=target?.closest?.('#dashboardCards .oa-dashboard-action.is-actionable');
    return card&&card.dataset.dashboardAction?card:null;
  }

  function clearPressed(){
    document.querySelectorAll('#dashboardCards .oa-dashboard-action.is-pressed').forEach(card=>card.classList.remove('is-pressed'));
  }

  function installDelegatedInteractions(){
    if(document.documentElement.dataset.oaDev31DashboardInteractions==='1')return;
    document.documentElement.dataset.oaDev31DashboardInteractions='1';

    document.addEventListener('pointerdown',event=>{
      const card=actionableCard(event.target);
      if(!card)return;
      clearPressed();
      card.classList.add('is-pressed');
    },true);

    ['pointerup','pointercancel'].forEach(type=>document.addEventListener(type,clearPressed,true));

    document.addEventListener('click',event=>{
      const card=actionableCard(event.target);
      if(!card)return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      clearPressed();
      if(Date.now()<suppressClickUntil)return;
      runAction(card.dataset.dashboardAction);
    },true);

    document.addEventListener('keydown',event=>{
      if(event.key!=='Enter'&&event.key!==' ')return;
      const card=actionableCard(event.target);
      if(!card)return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      suppressClickUntil=Date.now()+500;
      card.classList.add('is-pressed');
      setTimeout(()=>card.classList.remove('is-pressed'),110);
      runAction(card.dataset.dashboardAction);
    },true);
  }

  function setCopy(card,title,detail){
    if(!card)return;
    const number=card.querySelector('.number');
    const sub=card.querySelector('.oa-overview-detail');
    if(number&&number.textContent!==title)number.textContent=title;
    if(sub&&sub.textContent!==detail)sub.textContent=detail;
  }

  function enhanceDashboardCopy(){
    const cards=document.getElementById('dashboardCards');
    if(!cards?.classList.contains('oa-integrated-dashboard'))return;

    const draft=currentDraft();
    const pending=pendingOutcomeCount();
    const office=currentOfficeName();
    const version=window.CLINICAL_ASSISTANT_VERSION||'1.9.0';

    const draftCard=cards.querySelector('[data-dashboard-action="draft"]');
    if(draft){
      const type=appointmentName(draft.appointment);
      setCopy(draftCard,`Resume Unfinished ${type}`,`Continue exactly where this ${type} was left off on this device`);
    }else{
      setCopy(draftCard,'No Unfinished Appointment','Nothing is waiting to be resumed on this device');
    }

    const outcomeCard=cards.querySelector('[data-dashboard-action="outcomes"]');
    if(pending){
      setCopy(outcomeCard,`Review ${pending} Pending ${pending===1?'Outcome':'Outcomes'}`,`Open Saved Outcomes and finish ${pending===1?'the item':'the items'} waiting for completion`);
    }else{
      setCopy(outcomeCard,'No Pending Outcomes','All saved outcomes are currently completed');
    }

    setCopy(cards.querySelector('[data-dashboard-action="office"]'),`Manage ${office} Office Profile`,'Open Office Profiles to view or change the active office');
    setCopy(cards.querySelector('[data-dashboard-action="version"]'),`View What’s New in v${version}`,'Jump to About for the latest features, updates, and changes');
  }

  function queueEnhance(){
    if(queued)return;
    queued=true;
    requestAnimationFrame(()=>{
      queued=false;
      enhanceDashboardCopy();
    });
  }

  function installDashboardObserver(){
    const cards=document.getElementById('dashboardCards');
    if(!cards||cards.dataset.oaDev31Observer==='1')return;
    cards.dataset.oaDev31Observer='1';
    new MutationObserver(queueEnhance).observe(cards,{childList:true,subtree:true});
  }

  function wrapRenderDashboard(){
    if(typeof window.renderDashboard!=='function'||window.renderDashboard.__oaDev31Wrapped)return;
    const baseRenderDashboard=window.renderDashboard;
    const wrapped=function(){
      const result=baseRenderDashboard.apply(this,arguments);
      enhanceDashboardCopy();
      return result;
    };
    wrapped.__oaDev31Wrapped=true;
    window.renderDashboard=wrapped;
  }

  function init(){
    installDelegatedInteractions();
    wrapRenderDashboard();
    installDashboardObserver();
    enhanceDashboardCopy();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.addEventListener('load',init,{once:true});
  window.addEventListener('pageshow',()=>{installDashboardObserver();enhanceDashboardCopy();});
  window.addEventListener('storage',enhanceDashboardCopy);
})();
