/* Miracle-Ear Clinical Assistant — v1.9.0-dev44
   Unify all four Home Dashboard cards around the original stat-card anatomy
   while preserving the current v1.9 actions and Office Profile behavior.
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
      if(!currentId||!Array.isArray(offices))return '';
      const current=offices.find(office=>office&&office.id===currentId);
      return current?.name?String(current.name).trim():'';
    }catch(e){return '';}
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
    if(typeof window.showVersionInfo==='function'){
      window.showVersionInfo();
      return;
    }
    openTab('about','About');
    requestAnimationFrame(()=>document.getElementById('aboutWhatsNew')?.scrollIntoView({behavior:'smooth',block:'start'}));
  }

  function startAppointment(){
    openTab('notes','Sycle Notes');
  }

  function runAction(action){
    if(action==='draft'){
      const draft=currentDraft();
      if(draft&&typeof window.resumeActiveDraft==='function')window.resumeActiveDraft();
      else startAppointment();
      return;
    }
    if(action==='outcomes'){openTab('outcomes','Saved Outcomes');return;}
    if(action==='office'){openOfficeProfiles();return;}
    if(action==='version'){openWhatsNew();}
  }

  function cardMarkup({kind,cue,primary,label,context,button}){
    return `<div class="dashboard-card oa-dashboard-unified-card" data-dashboard-kind="${kind}" role="button" tabindex="0">
      <div class="oa-dashboard-primary"><span class="oa-dashboard-cue" aria-hidden="true">${cue}</span><span class="oa-dashboard-primary-text">${escapeHtml(primary)}</span></div>
      <div class="label">${escapeHtml(label)}</div>
      <div class="oa-dashboard-context">${escapeHtml(context)}</div>
      <button type="button" class="tiny secondary" data-dashboard-button>${escapeHtml(button)}</button>
    </div>`;
  }

  function renderUnifiedDashboard(){
    const dashboard=document.getElementById('dashboardCards');
    if(!dashboard)return;

    const draft=currentDraft();
    const pending=pendingOutcomes();
    const office=currentOfficeName();
    const version=window.CLINICAL_ASSISTANT_VERSION||'1.9.0-dev44';

    dashboard.className='dashboard-grid oa-unified-dashboard';
    dashboard.innerHTML=[
      cardMarkup({
        kind:'draft',cue:'📝',
        primary:draft?appointmentName(draft.appointment):'None',
        label:'Unfinished Appointment',
        context:draft?'Unfinished appointment saved locally':'Nothing unfinished on this device',
        button:draft?'Resume':'Start Appointment'
      }),
      cardMarkup({
        kind:'outcomes',cue:'💾',
        primary:pending.length?`${pending.length} Pending`:'0 Pending',
        label:'Pending Saved Outcomes',
        context:pending.length?`${pending.length} ${pending.length===1?'outcome is':'outcomes are'} waiting for completion`:'Everything is up to date',
        button:pending.length?'Review':'Open Saved Outcomes'
      }),
      cardMarkup({
        kind:'office',cue:'🏢',
        primary:office||'No Office Selected',
        label:'Current Office',
        context:office?'Office Profile currently in use':'Choose the office profile for this device',
        button:'Office Settings'
      }),
      cardMarkup({
        kind:'version',cue:'ℹ️',
        primary:version,
        label:'Current Version',
        context:'Appearance Overhaul development build',
        button:"What's New"
      })
    ].join('');

    dashboard.querySelectorAll('.oa-dashboard-unified-card').forEach(card=>{
      const action=card.dataset.dashboardKind;
      card.addEventListener('click',event=>{
        if(event.target.closest?.('[data-dashboard-button]'))event.preventDefault();
        runAction(action);
      });
      card.addEventListener('keydown',event=>{
        if(event.key==='Enter'||event.key===' '){
          event.preventDefault();
          runAction(action);
        }
      });
    });
  }

  function wrapWhenReady(attempt=0){
    if(typeof window.renderDashboard==='function'&&!window.renderDashboard.__oaDev44Wrapped){
      const baseRenderDashboard=window.renderDashboard;
      const wrapped=function(){
        const result=baseRenderDashboard.apply(this,arguments);
        renderUnifiedDashboard();
        return result;
      };
      wrapped.__oaDev44Wrapped=true;
      window.renderDashboard=wrapped;
    }
    if(typeof window.renderDashboard!=='function'&&attempt<40)setTimeout(()=>wrapWhenReady(attempt+1),50);
  }

  function init(){
    wrapWhenReady();
    requestAnimationFrame(renderUnifiedDashboard);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.addEventListener('load',()=>requestAnimationFrame(renderUnifiedDashboard),{once:true});
  window.addEventListener('pageshow',()=>requestAnimationFrame(renderUnifiedDashboard));
  window.addEventListener('storage',()=>requestAnimationFrame(renderUnifiedDashboard));
})();
