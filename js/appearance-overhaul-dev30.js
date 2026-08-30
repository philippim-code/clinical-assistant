/* Miracle-Ear Clinical Assistant — v1.9.0-dev30
   Integrated Home Dashboard command center.
*/
(function(){
  'use strict';

  const OFFICE_PROFILES_KEY='meClinicalOfficeProfilesV1';
  const CURRENT_OFFICE_KEY='meClinicalCurrentOfficeIdV1';

  function escapeHtml(value){
    return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  }

  function appointmentName(key){
    const names={hae:'HAE',aftercare:'Aftercare',delivery:'Delivery',retest:'Annual Retest',retestUnder:'Annual Retest',retestOver:'Annual Retest'};
    return names[key]||'Appointment';
  }

  function currentDraft(){
    try{return typeof window.getActiveDraft==='function'?window.getActiveDraft():null;}
    catch(e){return null;}
  }

  function pendingOutcomes(){
    try{
      if(typeof window.getSavedOutcomes!=='function')return[];
      const items=window.getSavedOutcomes();
      return items.filter(item=>typeof window.getOutcomeStatus==='function'?window.getOutcomeStatus(item)==='pending':!item.closed);
    }catch(e){return[];}
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
    return headerName.replace(/\s+Office$/i,'').trim()||'Not selected';
  }

  function draftDetail(draft){
    const label=draft?.fields?.currentPatientLabel?.value?.trim();
    return label||'Unfinished appointment saved locally';
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
      const target=document.getElementById('aboutWhatsNew');
      target?.scrollIntoView({behavior:'smooth',block:'start'});
    });
  }

  function resumeDraft(){
    if(typeof window.resumeActiveDraft==='function')window.resumeActiveDraft();
  }

  function openPendingOutcomes(){
    openTab('outcomes','Saved Outcomes');
  }

  function renderIntegratedDashboard(){
    const cards=document.getElementById('dashboardCards');
    if(!cards)return;

    const draft=currentDraft();
    const pending=pendingOutcomes();
    const office=currentOfficeName();
    const version=window.CLINICAL_ASSISTANT_VERSION||'1.9.0';
    const draftType=draft?appointmentName(draft.appointment):'';
    const draftCopy=draft?draftDetail(draft):'Nothing unfinished on this device';
    const pendingCopy=pending.length?`${pending.length} ${pending.length===1?'outcome is':'outcomes are'} waiting for completion`:'Everything is up to date';

    cards.classList.add('oa-overview-grid','oa-integrated-dashboard');
    cards.innerHTML=`
      <div class="dashboard-card oa-overview-card oa-dashboard-action ${draft?'is-actionable':'is-idle'}" data-dashboard-action="draft" role="${draft?'button':'group'}" ${draft?'tabindex="0"':''} aria-disabled="${draft?'false':'true'}">
        <div class="oa-overview-head"><span class="oa-overview-emoji" aria-hidden="true">📝</span><div class="label">Unfinished Appointment</div></div>
        <div class="number">${draft?`Resume ${escapeHtml(draftType)}`:'No Unfinished Appointment'}</div>
        <div class="oa-overview-detail">${escapeHtml(draftCopy)}</div>
        ${draft?'<span class="oa-dashboard-arrow" aria-hidden="true">›</span>':''}
      </div>
      <div class="dashboard-card oa-overview-card oa-dashboard-action ${pending.length?'is-actionable':'is-idle'}" data-dashboard-action="outcomes" role="${pending.length?'button':'group'}" ${pending.length?'tabindex="0"':''} aria-disabled="${pending.length?'false':'true'}">
        <div class="oa-overview-head"><span class="oa-overview-emoji" aria-hidden="true">💾</span><div class="label">Pending Outcomes</div></div>
        <div class="number">${pending.length?'Review Pending Outcomes':'No Pending Outcomes'}</div>
        <div class="oa-overview-detail">${escapeHtml(pendingCopy)}</div>
        ${pending.length?'<span class="oa-dashboard-arrow" aria-hidden="true">›</span>':''}
      </div>
      <div class="dashboard-card oa-overview-card oa-dashboard-action is-actionable" data-dashboard-action="office" role="button" tabindex="0">
        <div class="oa-overview-head"><span class="oa-overview-emoji" aria-hidden="true">🏢</span><div class="label">Current Office</div></div>
        <div class="number">${escapeHtml(office)}</div>
        <div class="oa-overview-detail">Open Office Profiles</div>
        <span class="oa-dashboard-arrow" aria-hidden="true">›</span>
      </div>
      <div class="dashboard-card oa-overview-card oa-dashboard-action is-actionable" data-dashboard-action="version" role="button" tabindex="0">
        <div class="oa-overview-head"><span class="oa-overview-emoji" aria-hidden="true">ℹ️</span><div class="label">Current Version</div></div>
        <div class="number">${escapeHtml(version)}</div>
        <div class="oa-overview-detail">View What's New</div>
        <span class="oa-dashboard-arrow" aria-hidden="true">›</span>
      </div>`;

    const intro=document.querySelector('#homeDashboardSection > p.muted');
    if(intro){
      intro.classList.add('oa-dashboard-intro');
      intro.textContent='Continue unfinished work, review pending outcomes, or jump to your current office and latest app updates.';
    }

    bindDashboardActions(cards);
    retireStandaloneContinueWorking();
    retireContinueWorkingPreference();
  }

  function activateCard(card,handler){
    if(!card||card.classList.contains('is-idle'))return;
    card.addEventListener('click',handler);
    card.addEventListener('keydown',event=>{
      if(event.key==='Enter'||event.key===' '){event.preventDefault();handler();}
    });
  }

  function bindDashboardActions(cards){
    activateCard(cards.querySelector('[data-dashboard-action="draft"]'),resumeDraft);
    activateCard(cards.querySelector('[data-dashboard-action="outcomes"]'),openPendingOutcomes);
    activateCard(cards.querySelector('[data-dashboard-action="office"]'),openOfficeProfiles);
    activateCard(cards.querySelector('[data-dashboard-action="version"]'),openWhatsNew);
  }

  function retireStandaloneContinueWorking(){
    const section=document.getElementById('homeContinueSection');
    if(section){
      section.hidden=true;
      section.classList.remove('oa-has-work');
      section.setAttribute('aria-hidden','true');
    }
  }

  function retireContinueWorkingPreference(){
    const input=document.getElementById('homeShowContinueWorking');
    const wrapper=input?.closest('label');
    if(wrapper)wrapper.hidden=true;
  }

  function wrapRenderDashboard(){
    if(typeof window.renderDashboard!=='function'||window.renderDashboard.__oaDev30Wrapped)return;
    const baseRenderDashboard=window.renderDashboard;
    const wrapped=function(){
      const result=baseRenderDashboard.apply(this,arguments);
      renderIntegratedDashboard();
      return result;
    };
    wrapped.__oaDev30Wrapped=true;
    window.renderDashboard=wrapped;
  }

  function wrapRenderSettings(){
    if(typeof window.renderSettings!=='function'||window.renderSettings.__oaDev30Wrapped)return;
    const baseRenderSettings=window.renderSettings;
    const wrapped=function(){
      const result=baseRenderSettings.apply(this,arguments);
      retireContinueWorkingPreference();
      return result;
    };
    wrapped.__oaDev30Wrapped=true;
    window.renderSettings=wrapped;
  }

  function watchOfficeHeader(){
    const header=document.querySelector('.header');
    if(!header||header.dataset.oaDev30OfficeWatch==='1')return;
    header.dataset.oaDev30OfficeWatch='1';
    new MutationObserver(()=>{
      if(document.getElementById('home')?.classList.contains('active'))renderIntegratedDashboard();
    }).observe(header,{childList:true,subtree:true,characterData:true});
  }

  function init(){
    wrapRenderDashboard();
    wrapRenderSettings();
    renderIntegratedDashboard();
    retireStandaloneContinueWorking();
    retireContinueWorkingPreference();
    watchOfficeHeader();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.addEventListener('load',init,{once:true});
  window.addEventListener('pageshow',renderIntegratedDashboard);
  window.addEventListener('storage',renderIntegratedDashboard);
})();
