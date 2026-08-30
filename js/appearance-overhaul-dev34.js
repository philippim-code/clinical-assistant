/* Miracle-Ear Clinical Assistant — v1.9.0-dev34
   Consolidated Home Dashboard controller with coordinate-based tap routing.
*/
(function(){
  'use strict';

  const OFFICE_PROFILES_KEY='meClinicalOfficeProfilesV1';
  const CURRENT_OFFICE_KEY='meClinicalCurrentOfficeIdV1';
  let pressState=null;
  let lastActivationAt=0;

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

  function navButton(label){
    return [...document.querySelectorAll('.tabs .tab-btn')].find(button=>button.textContent.includes(label));
  }

  function clickNav(label){
    const button=navButton(label);
    if(button){button.click();return true;}
    return false;
  }

  function activateAction(action){
    if(action==='draft'){
      if(typeof window.resumeActiveDraft==='function')window.resumeActiveDraft();
      return;
    }
    if(action==='outcomes'){
      clickNav('Saved Outcomes');
      return;
    }
    if(action==='office'){
      if(!clickNav('Settings'))return;
      setTimeout(()=>{
        const openButton=document.getElementById('oaOfficeSettingsOpen');
        if(openButton){openButton.click();return;}
        document.getElementById('oaOfficeSettingsLauncher')?.scrollIntoView({behavior:'smooth',block:'center'});
      },60);
      return;
    }
    if(action==='version'){
      if(!clickNav('About'))return;
      setTimeout(()=>document.getElementById('aboutWhatsNew')?.scrollIntoView({behavior:'smooth',block:'start'}),60);
    }
  }

  function makeCard({action,emoji,label,title,detail,enabled=true}){
    return `<button type="button" class="dashboard-card oa-dashboard-card ${enabled?'is-actionable':'is-idle'}" data-dashboard-action="${action}" ${enabled?'':'disabled aria-disabled="true"'}>
      <span class="oa-dashboard-content">
        <span class="oa-dashboard-head"><span class="oa-dashboard-emoji" aria-hidden="true">${emoji}</span><span class="label">${escapeHtml(label)}</span></span>
        <span class="number">${escapeHtml(title)}</span>
      </span>
      <span class="oa-dashboard-detail">${escapeHtml(detail)}</span>
      ${enabled?'<span class="oa-dashboard-arrow" aria-hidden="true">›</span>':''}
    </button>`;
  }

  function renderIntegratedDashboard(){
    const cards=document.getElementById('dashboardCards');
    if(!cards)return;

    const draft=currentDraft();
    const pending=pendingOutcomes();
    const office=currentOfficeName();
    const version=window.CLINICAL_ASSISTANT_VERSION||'1.9.0-dev34';
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
      makeCard({action:'office',emoji:'🏢',label:'Current Office',title:office,detail:'Open Office Profiles',enabled:true}),
      makeCard({action:'version',emoji:'ℹ️',label:'Current Version',title:version,detail:"View What's New",enabled:true})
    ].join('');

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

  function actionableCards(){
    return [...document.querySelectorAll('#dashboardCards .oa-dashboard-card.is-actionable:not([disabled])')];
  }

  function cardAtPoint(x,y){
    if(!Number.isFinite(x)||!Number.isFinite(y))return null;
    return actionableCards().find(card=>{
      const r=card.getBoundingClientRect();
      return x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;
    })||null;
  }

  function cardFromEvent(event){
    const direct=event.target?.closest?.('#dashboardCards .oa-dashboard-card.is-actionable:not([disabled])');
    return direct||cardAtPoint(event.clientX,event.clientY);
  }

  function clearPressed(){
    document.querySelectorAll('#dashboardCards .oa-dashboard-card.oa-pressed').forEach(card=>card.classList.remove('oa-pressed'));
  }

  function clearHovered(except=null){
    document.querySelectorAll('#dashboardCards .oa-dashboard-card.oa-hovered').forEach(card=>{
      if(card!==except)card.classList.remove('oa-hovered');
    });
  }

  function installInteractionBridge(){
    if(document.documentElement.dataset.oaDev34Bridge==='1')return;
    document.documentElement.dataset.oaDev34Bridge='1';

    document.addEventListener('pointerdown',event=>{
      const card=cardFromEvent(event);
      clearPressed();
      if(!card){pressState=null;return;}
      card.classList.add('oa-pressed');
      pressState={card,x:event.clientX,y:event.clientY,moved:false,pointerId:event.pointerId};
    },true);

    document.addEventListener('pointermove',event=>{
      if(event.pointerType==='mouse'||event.pointerType==='pen'){
        const hovered=cardAtPoint(event.clientX,event.clientY);
        clearHovered(hovered);
        hovered?.classList.add('oa-hovered');
      }
      if(pressState&&pressState.pointerId===event.pointerId){
        const distance=Math.hypot(event.clientX-pressState.x,event.clientY-pressState.y);
        if(distance>10){pressState.moved=true;clearPressed();}
      }
    },true);

    document.addEventListener('pointerup',event=>{
      const state=pressState;
      pressState=null;
      clearPressed();
      if(!state||state.moved)return;
      const releaseCard=cardAtPoint(event.clientX,event.clientY);
      if(releaseCard!==state.card)return;
      event.preventDefault();
      event.stopPropagation();
      lastActivationAt=Date.now();
      activateAction(state.card.dataset.dashboardAction||'');
    },true);

    document.addEventListener('pointercancel',()=>{pressState=null;clearPressed();},true);
    document.addEventListener('pointerleave',()=>clearHovered(),true);

    /* Keyboard / browsers that don't deliver PointerEvents use click as a fallback. */
    document.addEventListener('click',event=>{
      if(Date.now()-lastActivationAt<650)return;
      const card=cardFromEvent(event);
      if(!card)return;
      event.preventDefault();
      event.stopPropagation();
      lastActivationAt=Date.now();
      activateAction(card.dataset.dashboardAction||'');
    },true);
  }

  function wrapWhenReady(attempt=0){
    if(typeof window.renderDashboard==='function'&&!window.renderDashboard.__oaDev34Wrapped){
      const baseRenderDashboard=window.renderDashboard;
      const wrapped=function(){
        const result=baseRenderDashboard.apply(this,arguments);
        renderIntegratedDashboard();
        return result;
      };
      wrapped.__oaDev34Wrapped=true;
      window.renderDashboard=wrapped;
    }

    if(typeof window.renderSettings==='function'&&!window.renderSettings.__oaDev34Wrapped){
      const baseRenderSettings=window.renderSettings;
      const wrapped=function(){
        const result=baseRenderSettings.apply(this,arguments);
        retireContinueWorkingPreference();
        return result;
      };
      wrapped.__oaDev34Wrapped=true;
      window.renderSettings=wrapped;
    }

    if((typeof window.renderDashboard!=='function'||typeof window.renderSettings!=='function')&&attempt<40){
      setTimeout(()=>wrapWhenReady(attempt+1),50);
    }
  }

  function watchOfficeHeader(){
    const header=document.querySelector('.header');
    if(!header||header.dataset.oaDev34OfficeWatch==='1')return;
    header.dataset.oaDev34OfficeWatch='1';
    new MutationObserver(()=>{
      if(document.getElementById('home')?.classList.contains('active'))renderIntegratedDashboard();
    }).observe(header,{childList:true,subtree:true,characterData:true});
  }

  function init(){
    wrapWhenReady();
    installInteractionBridge();
    renderIntegratedDashboard();
    retireContinueWorkingPreference();
    watchOfficeHeader();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.addEventListener('load',init,{once:true});
  window.addEventListener('pageshow',renderIntegratedDashboard);
  window.addEventListener('storage',renderIntegratedDashboard);
})();
