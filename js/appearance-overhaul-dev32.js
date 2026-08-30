/* Miracle-Ear Clinical Assistant — v1.9.0-dev32
   Consolidated Home Dashboard controller.
   Replaces the competing dev29/dev30/dev31 dashboard scripts.
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
      return window.getSavedOutcomes().filter(item=>typeof window.getOutcomeStatus==='function'?window.getOutcomeStatus(item)==='pending':!item.closed);
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

  function tabButton(label){
    return [...document.querySelectorAll('.tabs .tab-btn')].find(button=>button.textContent.includes(label));
  }

  function openTab(tabId,label){
    const button=tabButton(label);
    if(button&&typeof window.showTab==='function')window.showTab(tabId,button);
  }

  function resumeDraft(){
    if(typeof window.resumeActiveDraft==='function')window.resumeActiveDraft();
  }

  function openPendingOutcomes(){
    openTab('outcomes','Saved Outcomes');
  }

  function openOfficeProfiles(){
    openTab('settings','Settings');
    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>{
        const openButton=document.getElementById('oaOfficeSettingsOpen');
        if(openButton){openButton.click();return;}
        document.getElementById('oaOfficeSettingsLauncher')?.scrollIntoView({behavior:'smooth',block:'center'});
      });
    });
  }

  function openWhatsNew(){
    openTab('about','About');
    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>document.getElementById('aboutWhatsNew')?.scrollIntoView({behavior:'smooth',block:'start'}));
    });
  }

  function makeCard({action,emoji,label,title,detail,enabled=true}){
    return `<button type="button" class="dashboard-card oa-dashboard-card ${enabled?'is-actionable':'is-idle'}" data-dashboard-action="${action}" ${enabled?'':'disabled aria-disabled="true"'}>
      <span class="oa-dashboard-head"><span class="oa-dashboard-emoji" aria-hidden="true">${emoji}</span><span class="label">${escapeHtml(label)}</span></span>
      <span class="oa-dashboard-primary-row"><span class="number">${escapeHtml(title)}</span>${enabled?'<span class="oa-dashboard-arrow" aria-hidden="true">›</span>':''}</span>
      <span class="oa-dashboard-detail">${escapeHtml(detail)}</span>
    </button>`;
  }

  function bindCard(cards,action,handler){
    const card=cards.querySelector(`[data-dashboard-action="${action}"]`);
    if(card&&!card.disabled)card.addEventListener('click',handler);
  }

  function renderIntegratedDashboard(){
    const cards=document.getElementById('dashboardCards');
    if(!cards)return;

    const draft=currentDraft();
    const pending=pendingOutcomes();
    const office=currentOfficeName();
    const version=window.CLINICAL_ASSISTANT_VERSION||'1.9.0';
    const draftType=draft?appointmentName(draft.appointment):'';

    cards.className='dashboard-cards oa-integrated-dashboard';
    cards.innerHTML=[
      makeCard({
        action:'draft',emoji:'📝',label:'Unfinished Appointment',
        title:draft?`Resume ${draftType}`:'No Unfinished Appointment',
        detail:draft?'Unfinished appointment saved locally':'Nothing unfinished on this device',
        enabled:Boolean(draft)
      }),
      makeCard({
        action:'outcomes',emoji:'💾',label:'Pending Outcomes',
        title:pending.length?'Review Pending Outcomes':'No Pending Outcomes',
        detail:pending.length?`${pending.length} ${pending.length===1?'outcome is':'outcomes are'} waiting for completion`:'Everything is up to date',
        enabled:pending.length>0
      }),
      makeCard({
        action:'office',emoji:'🏢',label:'Current Office',title:office,
        detail:'Open Office Profiles',enabled:true
      }),
      makeCard({
        action:'version',emoji:'ℹ️',label:'Current Version',title:version,
        detail:"View What's New",enabled:true
      })
    ].join('');

    bindCard(cards,'draft',resumeDraft);
    bindCard(cards,'outcomes',openPendingOutcomes);
    bindCard(cards,'office',openOfficeProfiles);
    bindCard(cards,'version',openWhatsNew);

    const intro=document.querySelector('#homeDashboardSection > p.muted');
    if(intro){
      intro.classList.add('oa-dashboard-intro');
      intro.textContent='Continue unfinished work, review pending outcomes, or jump to your current office and latest app updates.';
    }

    const continueSection=document.getElementById('homeContinueSection');
    if(continueSection){
      continueSection.hidden=true;
      continueSection.classList.remove('oa-has-work');
      continueSection.setAttribute('aria-hidden','true');
    }

    retireContinueWorkingPreference();
  }

  function retireContinueWorkingPreference(){
    const input=document.getElementById('homeShowContinueWorking');
    const wrapper=input?.closest('label');
    if(wrapper)wrapper.hidden=true;
  }

  function wrapRenderDashboard(){
    if(typeof window.renderDashboard!=='function'||window.renderDashboard.__oaDev32Wrapped)return;
    const baseRenderDashboard=window.renderDashboard;
    const wrapped=function(){
      const result=baseRenderDashboard.apply(this,arguments);
      renderIntegratedDashboard();
      return result;
    };
    wrapped.__oaDev32Wrapped=true;
    window.renderDashboard=wrapped;
  }

  function wrapRenderSettings(){
    if(typeof window.renderSettings!=='function'||window.renderSettings.__oaDev32Wrapped)return;
    const baseRenderSettings=window.renderSettings;
    const wrapped=function(){
      const result=baseRenderSettings.apply(this,arguments);
      retireContinueWorkingPreference();
      return result;
    };
    wrapped.__oaDev32Wrapped=true;
    window.renderSettings=wrapped;
  }

  function watchOfficeHeader(){
    const header=document.querySelector('.header');
    if(!header||header.dataset.oaDev32OfficeWatch==='1')return;
    header.dataset.oaDev32OfficeWatch='1';
    new MutationObserver(()=>{
      if(document.getElementById('home')?.classList.contains('active'))renderIntegratedDashboard();
    }).observe(header,{childList:true,subtree:true,characterData:true});
  }

  function init(){
    wrapRenderDashboard();
    wrapRenderSettings();
    renderIntegratedDashboard();
    retireContinueWorkingPreference();
    watchOfficeHeader();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.addEventListener('load',init,{once:true});
  window.addEventListener('pageshow',renderIntegratedDashboard);
  window.addEventListener('storage',renderIntegratedDashboard);
})();
