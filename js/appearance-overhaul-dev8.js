/* Miracle-Ear Clinical Assistant — v1.9.0-dev8
   Presentation/UX layer for Home command center and targeted Spark selection feedback.
*/
(function(){
  'use strict';

  const HOME_COMMAND_PREFS_KEY='meClinicalHomeCommandPrefs';
  const DEFAULT_COMMAND_PREFS={continueWorking:true,quickTools:true,clinicalReference:true};
  let pendingSparkSelection=null;

  const icons={
    resume:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 7H5v-3"/><path d="M5.5 7A8 8 0 1 1 4 14"/><path d="M9 12h6"/><path d="m12 9 3 3-3 3"/></svg>`,
    outcomes:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h9l3 3v13H6z"/><path d="M9 4v5h6V5"/><path d="M9 15h6"/></svg>`,
    pta:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19V11"/><path d="M10 19V6"/><path d="M15 19v-9"/><path d="M20 19V4"/><path d="M3 19h19"/></svg>`,
    referral:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18"/><path d="M3 12h18"/><circle cx="12" cy="12" r="8"/></svg>`,
    terminology:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v17H7.5A3.5 3.5 0 0 0 4 22z"/><path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H13v17h3.5A3.5 3.5 0 0 1 20 22z"/></svg>`,
    spark:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12c2.2-3.5 4.2-5.2 6-5.2 2.2 0 3 2.2 4.1 4.5 1 2.1 1.9 4.1 3.9 4.1 1 0 1.8-.5 2.6-1.4"/><path d="M4 16c1.6-2.3 3.1-3.4 4.5-3.4 1.7 0 2.5 1.4 3.3 2.9.8 1.5 1.6 2.9 3.2 2.9"/></svg>`
  };

  function getCommandPrefs(){
    try{return {...DEFAULT_COMMAND_PREFS,...JSON.parse(localStorage.getItem(HOME_COMMAND_PREFS_KEY)||'{}')};}
    catch(e){return {...DEFAULT_COMMAND_PREFS};}
  }

  function setCommandPrefs(prefs){
    localStorage.setItem(HOME_COMMAND_PREFS_KEY,JSON.stringify({...DEFAULT_COMMAND_PREFS,...prefs}));
  }

  function tabButton(text){return [...document.querySelectorAll('.tab-btn')].find(button=>button.textContent.includes(text));}

  function openTab(tabId,label){
    const button=tabButton(label);
    if(button&&typeof window.showTab==='function')window.showTab(tabId,button);
  }

  function openTool(panelId){
    openTab('tools','Clinical Tools');
    requestAnimationFrame(()=>{
      if(typeof window.openClinicalTool==='function')window.openClinicalTool(panelId);
    });
  }

  function openSparkReference(){
    openTab('references','References');
    requestAnimationFrame(()=>{
      const root=document.getElementById('references');
      if(!root)return;
      const spark=root.querySelector('[data-ref-product="spark"]');
      if(spark)spark.click();
    });
  }

  function activateLikeButton(element,handler){
    if(!element)return;
    element.addEventListener('click',handler);
    element.addEventListener('keydown',event=>{
      if(event.key==='Enter'||event.key===' '){event.preventDefault();handler();}
    });
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

  function draftDetail(draft){
    const label=draft?.fields?.currentPatientLabel?.value?.trim();
    return label||'Unfinished appointment saved locally';
  }

  function installHomeStructure(){
    const home=document.getElementById('home');
    const newAppointment=document.getElementById('homeNewAppointmentSection');
    if(!home||!newAppointment)return;

    let continueSection=document.getElementById('homeContinueSection');
    if(!continueSection){
      continueSection=document.createElement('div');
      continueSection.className='section';
      continueSection.id='homeContinueSection';
      continueSection.innerHTML=`<h3>Continue Working</h3><p class="home-command-intro">Pick up exactly where you left off.</p><div class="home-continue-grid" id="homeContinueGrid"></div>`;
      newAppointment.insertAdjacentElement('afterend',continueSection);
    }

    let commandGrid=document.getElementById('homeCommandGrid');
    if(!commandGrid){
      commandGrid=document.createElement('div');
      commandGrid.className='home-command-grid';
      commandGrid.id='homeCommandGrid';
      commandGrid.innerHTML=`
        <section class="home-command-panel" id="homeQuickToolsSection">
          <h3>Quick Tools</h3>
          <p class="home-command-intro">Open frequently used clinical tools without leaving Home.</p>
          <div class="home-shortcut-grid">
            <div class="home-shortcut-card" role="button" tabindex="0" data-home-tool="pta"><span class="home-command-icon">${icons.pta}</span><strong>PTA Severity</strong></div>
            <div class="home-shortcut-card" role="button" tabindex="0" data-home-tool="referrals"><span class="home-command-icon">${icons.referral}</span><strong>Medical Referrals</strong></div>
            <div class="home-shortcut-card" role="button" tabindex="0" data-home-tool="terminology"><span class="home-command-icon">${icons.terminology}</span><strong>Terminology</strong></div>
          </div>
        </section>
        <section class="home-command-panel" id="homeClinicalReferenceSection">
          <h3>Clinical Reference</h3>
          <p class="home-command-intro">Jump directly into the reference you use most.</p>
          <div class="home-reference-card" role="button" tabindex="0" id="homeSparkReferenceCard">
            <span class="home-command-icon">${icons.spark}</span>
            <div><strong>Spark Reference</strong><span>Features, colors, receivers, couplings, retention, accessories, and saved configurations.</span></div>
            <span class="home-command-arrow" aria-hidden="true">›</span>
          </div>
        </section>`;
      continueSection.insertAdjacentElement('afterend',commandGrid);

      const pta=commandGrid.querySelector('[data-home-tool="pta"]');
      const referrals=commandGrid.querySelector('[data-home-tool="referrals"]');
      const terminology=commandGrid.querySelector('[data-home-tool="terminology"]');
      activateLikeButton(pta,()=>openTool('ptaSeverityPanel'));
      activateLikeButton(referrals,()=>openTool('medicalReferralsPanel'));
      activateLikeButton(terminology,()=>openTool('clinicalTerminologyPanel'));
      activateLikeButton(commandGrid.querySelector('#homeSparkReferenceCard'),openSparkReference);
    }
  }

  function renderContinueWorking(){
    const section=document.getElementById('homeContinueSection');
    const grid=document.getElementById('homeContinueGrid');
    if(!section||!grid)return;
    const prefs=getCommandPrefs();
    const draft=currentDraft();
    const pending=pendingOutcomes();
    const cards=[];

    if(draft){
      cards.push(`<div class="home-continue-card" role="button" tabindex="0" data-home-continue="draft"><span class="home-command-icon">${icons.resume}</span><div class="home-command-copy"><strong>Resume ${appointmentName(draft.appointment)}</strong><span>${escapeText(draftDetail(draft))}</span></div><span class="home-command-arrow" aria-hidden="true">›</span></div>`);
    }
    if(pending.length){
      cards.push(`<div class="home-continue-card" role="button" tabindex="0" data-home-continue="outcomes"><span class="home-command-icon">${icons.outcomes}</span><div class="home-command-copy"><strong>Review Pending Outcomes</strong><span>${pending.length} ${pending.length===1?'outcome is':'outcomes are'} waiting for completion</span></div><span class="home-command-arrow" aria-hidden="true">›</span></div>`);
    }

    grid.innerHTML=cards.join('');
    const hasWork=cards.length>0&&prefs.continueWorking;
    section.classList.toggle('oa-has-work',hasWork);
    section.hidden=!hasWork;

    const draftCard=grid.querySelector('[data-home-continue="draft"]');
    const outcomeCard=grid.querySelector('[data-home-continue="outcomes"]');
    activateLikeButton(draftCard,()=>{if(typeof window.resumeActiveDraft==='function')window.resumeActiveDraft();});
    activateLikeButton(outcomeCard,()=>openTab('outcomes','Saved Outcomes'));
  }

  function escapeText(value){
    return String(value||'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  }

  function applyCommandPrefs(){
    const prefs=getCommandPrefs();
    const quick=document.getElementById('homeQuickToolsSection');
    const reference=document.getElementById('homeClinicalReferenceSection');
    const grid=document.getElementById('homeCommandGrid');
    if(quick)quick.hidden=!prefs.quickTools;
    if(reference)reference.hidden=!prefs.clinicalReference;
    if(grid)grid.hidden=!prefs.quickTools&&!prefs.clinicalReference;
    renderContinueWorking();
  }

  function installCommandPreferenceControls(){
    const grid=document.querySelector('#settings .home-toggle-grid');
    if(!grid)return;
    const prefs=getCommandPrefs();
    const controls=[
      ['homeShowContinueWorking','Continue Working','continueWorking'],
      ['homeShowQuickTools','Quick Tools','quickTools'],
      ['homeShowClinicalReference','Clinical Reference','clinicalReference']
    ];
    controls.forEach(([id,label,key])=>{
      let input=document.getElementById(id);
      if(!input){
        const wrapper=document.createElement('label');
        wrapper.className='inline-label oa-home-pref';
        wrapper.innerHTML=`<input type="checkbox" id="${id}"> ${label}`;
        grid.appendChild(wrapper);
        input=wrapper.querySelector('input');
      }
      input.checked=prefs[key]!==false;
    });
  }

  function saveCommandPreferenceControls(){
    setCommandPrefs({
      continueWorking:document.getElementById('homeShowContinueWorking')?.checked!==false,
      quickTools:document.getElementById('homeShowQuickTools')?.checked!==false,
      clinicalReference:document.getElementById('homeShowClinicalReference')?.checked!==false
    });
    applyCommandPrefs();
  }

  function wrapAppFunctions(){
    if(typeof window.renderDashboard==='function'&&!window.renderDashboard.__oaDev8Wrapped){
      const baseRenderDashboard=window.renderDashboard;
      const wrapped=function(){const result=baseRenderDashboard.apply(this,arguments);renderContinueWorking();return result;};
      wrapped.__oaDev8Wrapped=true;
      window.renderDashboard=wrapped;
    }

    if(typeof window.renderSettings==='function'&&!window.renderSettings.__oaDev8Wrapped){
      const baseRenderSettings=window.renderSettings;
      const wrapped=function(){const result=baseRenderSettings.apply(this,arguments);installCommandPreferenceControls();return result;};
      wrapped.__oaDev8Wrapped=true;
      window.renderSettings=wrapped;
    }

    if(typeof window.saveSettings==='function'&&!window.saveSettings.__oaDev8Wrapped){
      const baseSaveSettings=window.saveSettings;
      const wrapped=function(){const result=baseSaveSettings.apply(this,arguments);saveCommandPreferenceControls();return result;};
      wrapped.__oaDev8Wrapped=true;
      window.saveSettings=wrapped;
    }
  }

  function sparkDescriptor(element){
    if(!element)return null;
    const pairs=[
      ['data-color','[data-color="VALUE"]'],
      ['data-level','[data-level="VALUE"]'],
      ['data-receiver-power','[data-receiver-power="VALUE"][data-receiver-ear="EAR"]'],
      ['data-receiver-length','[data-receiver-length="VALUE"][data-receiver-ear="EAR"]'],
      ['data-coupling-type','[data-coupling-type="VALUE"][data-coupling-ear="EAR"]'],
      ['data-coupling-size','[data-coupling-size="VALUE"][data-coupling-ear="EAR"]'],
      ['data-retention-card','[data-retention-card="VALUE"]'],
      ['data-retention','[data-retention="VALUE"]']
    ];
    for(const [attr,template] of pairs){
      if(element.hasAttribute(attr)){
        const value=element.getAttribute(attr);
        const ear=element.getAttribute('data-receiver-ear')||element.getAttribute('data-coupling-ear')||'';
        return template.replace('VALUE',cssEscape(value)).replace('EAR',cssEscape(ear));
      }
    }
    return null;
  }

  function cssEscape(value){
    if(window.CSS&&typeof window.CSS.escape==='function')return window.CSS.escape(String(value));
    return String(value).replace(/["\\]/g,'\\$&');
  }

  function installSparkSelectionTargeting(){
    if(document.documentElement.dataset.oaSparkTargeting==='1')return;
    document.documentElement.dataset.oaSparkTargeting='1';
    document.addEventListener('click',event=>{
      const target=event.target.closest('#references [data-color],#references [data-level],#references [data-receiver-power],#references [data-receiver-length],#references [data-coupling-type],#references [data-coupling-size],#references [data-retention-card],#references [data-retention]');
      if(target)pendingSparkSelection=sparkDescriptor(target);
    },true);

    document.addEventListener('clinical-assistant:references-rendered',()=>{
      if(!pendingSparkSelection)return;
      const selector=pendingSparkSelection;
      pendingSparkSelection=null;
      requestAnimationFrame(()=>{
        const selected=document.querySelector(`#references ${selector}`);
        if(!selected)return;
        selected.classList.remove('oa-selected-now');
        void selected.offsetWidth;
        selected.classList.add('oa-selected-now');
        setTimeout(()=>selected.classList.remove('oa-selected-now'),190);
      });
    });
  }

  function init(){
    installHomeStructure();
    wrapAppFunctions();
    installCommandPreferenceControls();
    applyCommandPrefs();
    installSparkSelectionTargeting();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.addEventListener('load',()=>{installHomeStructure();installCommandPreferenceControls();applyCommandPrefs();},{once:true});
  window.addEventListener('pageshow',()=>{applyCommandPrefs();renderContinueWorking();});
})();
