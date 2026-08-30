/* Miracle-Ear Clinical Assistant — v1.9.0-dev29
   Home hierarchy cleanup.
*/
(function(){
  'use strict';

  const OFFICE_PROFILES_KEY='meClinicalOfficeProfilesV1';
  const CURRENT_OFFICE_KEY='meClinicalCurrentOfficeIdV1';

  function escapeHtml(value){
    return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  }

  function completedOutcomeCount(){
    try{
      if(typeof window.getSavedOutcomes!=='function')return 0;
      return window.getSavedOutcomes().filter(item=>{
        if(typeof window.getOutcomeStatus==='function')return window.getOutcomeStatus(item)==='closed';
        return item?.closed===true||item?.status==='closed'||item?.status==='completed';
      }).length;
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
    return headerName.replace(/\s+Office$/i,'').trim()||'Not selected';
  }

  function renderHomeOverview(){
    const cards=document.getElementById('dashboardCards');
    if(!cards)return;

    const completed=completedOutcomeCount();
    const office=currentOfficeName();
    const version=window.CLINICAL_ASSISTANT_VERSION||'1.9.0';

    cards.classList.add('oa-overview-grid');
    cards.innerHTML=`
      <div class="dashboard-card oa-overview-card" data-overview="completed">
        <div class="oa-overview-head"><span class="oa-overview-emoji" aria-hidden="true">✅</span><div class="label">Completed Outcomes</div></div>
        <div class="number">${completed}</div>
        <div class="oa-overview-detail">Saved work marked complete</div>
      </div>
      <div class="dashboard-card oa-overview-card" data-overview="office">
        <div class="oa-overview-head"><span class="oa-overview-emoji" aria-hidden="true">🏢</span><div class="label">Current Office</div></div>
        <div class="number">${escapeHtml(office)}</div>
        <div class="oa-overview-detail">Active Office Profile on this device</div>
      </div>
      <div class="dashboard-card oa-overview-card" data-overview="storage">
        <div class="oa-overview-head"><span class="oa-overview-emoji" aria-hidden="true">💾</span><div class="label">Data Storage</div></div>
        <div class="number">Local</div>
        <div class="oa-overview-detail">Drafts, settings, and outcomes stay on this device</div>
      </div>
      <div class="dashboard-card oa-overview-card" data-overview="version">
        <div class="oa-overview-head"><span class="oa-overview-emoji" aria-hidden="true">ℹ️</span><div class="label">Current Version</div></div>
        <div class="number">${escapeHtml(version)}</div>
        <button type="button" class="tiny secondary" onclick="showVersionInfo()">What's New</button>
      </div>`;

    const intro=document.querySelector('#homeDashboardSection > p.muted');
    if(intro){
      intro.classList.add('oa-dashboard-intro');
      intro.textContent='At-a-glance status for this device. Start a visit below or continue unfinished work when needed.';
    }
  }

  function wrapRenderDashboard(){
    if(typeof window.renderDashboard!=='function'||window.renderDashboard.__oaDev29Wrapped)return;
    const baseRenderDashboard=window.renderDashboard;
    const wrapped=function(){
      const result=baseRenderDashboard.apply(this,arguments);
      renderHomeOverview();
      return result;
    };
    wrapped.__oaDev29Wrapped=true;
    window.renderDashboard=wrapped;
  }

  function watchOfficeHeader(){
    const header=document.querySelector('.header');
    if(!header||header.dataset.oaDev29OfficeWatch==='1')return;
    header.dataset.oaDev29OfficeWatch='1';
    new MutationObserver(()=>{
      if(document.getElementById('home')?.classList.contains('active'))renderHomeOverview();
    }).observe(header,{childList:true,subtree:true,characterData:true});
  }

  function init(){
    wrapRenderDashboard();
    renderHomeOverview();
    watchOfficeHeader();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.addEventListener('load',()=>{wrapRenderDashboard();renderHomeOverview();watchOfficeHeader();},{once:true});
  window.addEventListener('pageshow',renderHomeOverview);
  window.addEventListener('storage',renderHomeOverview);
})();
