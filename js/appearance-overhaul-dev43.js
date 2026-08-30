/* Miracle-Ear Clinical Assistant — v1.9.0-dev43
   Replace Completed Dashboard card with Current Office shortcut.
   Preserves the working dev40 Continue Working transplant and native Dashboard styling.
*/
(function(){
  'use strict';

  const OFFICE_PROFILES_KEY='meClinicalOfficeProfilesV1';
  const CURRENT_OFFICE_KEY='meClinicalCurrentOfficeIdV1';

  function escapeHtml(value){
    return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  }

  function currentOfficeName(){
    try{
      const offices=JSON.parse(localStorage.getItem(OFFICE_PROFILES_KEY)||'[]');
      const currentId=localStorage.getItem(CURRENT_OFFICE_KEY)||'';
      if(!currentId||!Array.isArray(offices))return '';
      const current=offices.find(office=>office&&office.id===currentId);
      return current?.name?String(current.name).trim():'';
    }catch(e){
      return '';
    }
  }

  function tabButton(label){
    return [...document.querySelectorAll('.tabs .tab-btn')].find(button=>button.textContent.includes(label));
  }

  function openOfficeProfiles(){
    const settingsButton=tabButton('Settings');
    if(settingsButton&&typeof window.showTab==='function'){
      window.showTab('settings',settingsButton);
    }

    requestAnimationFrame(()=>{
      const openButton=document.getElementById('oaOfficeSettingsOpen');
      if(openButton){
        openButton.click();
        return;
      }
      document.getElementById('oaOfficeSettingsLauncher')?.scrollIntoView({behavior:'smooth',block:'center'});
    });
  }

  function renderOfficeCard(){
    const dashboard=document.getElementById('dashboardCards');
    if(!dashboard||dashboard.children.length<4)return;

    const card=dashboard.children[2];
    if(!card)return;

    const office=currentOfficeName();
    const officeTitle=office||'No Office Selected';

    card.className='dashboard-card oa-dashboard-office-card';
    card.setAttribute('role','button');
    card.setAttribute('tabindex','0');
    card.setAttribute('aria-label',office?`Current office: ${office}. Open Office Profiles.`:'No office selected. Open Office Profiles.');
    card.style.cursor='pointer';
    card.innerHTML=`
      <div class="number">${escapeHtml(officeTitle)}</div>
      <div class="label">Current Office</div>
      <button type="button" class="tiny secondary" data-office-settings-button>Office Settings</button>`;

    card.onclick=event=>{
      if(event.target.closest?.('[data-office-settings-button]'))event.preventDefault();
      openOfficeProfiles();
    };
    card.onkeydown=event=>{
      if(event.key==='Enter'||event.key===' '){
        event.preventDefault();
        openOfficeProfiles();
      }
    };
  }

  function wrapWhenReady(attempt=0){
    if(typeof window.renderDashboard==='function'&&!window.renderDashboard.__oaDev43Wrapped){
      const baseRenderDashboard=window.renderDashboard;
      const wrapped=function(){
        const result=baseRenderDashboard.apply(this,arguments);
        renderOfficeCard();
        return result;
      };
      wrapped.__oaDev43Wrapped=true;
      window.renderDashboard=wrapped;
    }

    if(typeof window.renderDashboard!=='function'&&attempt<40){
      setTimeout(()=>wrapWhenReady(attempt+1),50);
    }
  }

  function init(){
    wrapWhenReady();
    requestAnimationFrame(renderOfficeCard);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.addEventListener('load',()=>requestAnimationFrame(renderOfficeCard),{once:true});
  window.addEventListener('pageshow',()=>requestAnimationFrame(renderOfficeCard));
})();
