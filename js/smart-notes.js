/* =========================================================
   Miracle-Ear Clinical Assistant v1.7.1
   Concise note + quality-of-life patch layer

   Keeps the established concise Sycle note style. The only contextual
   wording added automatically is patient attribution for a documented
   concern/reported difficulty when the user did not already enter one.
   ========================================================= */
(function(){
  'use strict';

  const PATCH_VERSION='1.7.1';

  function cleanText(value){return String(value||'').replace(/\s+/g,' ').trim();}
  function concernPrefix(){
    if(currentAppointment==='hae')return'hae';
    if(currentAppointment==='aftercare')return'ac';
    if(currentAppointment==='retest'||currentAppointment==='retestUnder'||currentAppointment==='retestOver')return'rt';
    return'';
  }
  function attributedConcern(raw){
    const text=cleanText(raw);
    if(!text)return'';
    const alreadyAttributed=/^(patient|pt\.?|wife|husband|spouse|daughter|son|family|caregiver|parent|mother|father)\b/i.test(text);
    const alreadyReporting=/^(reports?|reported|states?|stated|denies?|denied|complains?|complained)\b/i.test(text);
    if(alreadyAttributed)return fixAcronyms(text);
    if(alreadyReporting)return fixAcronyms('Patient '+text.charAt(0).toLowerCase()+text.slice(1));
    return fixAcronyms('Patient reports '+text.charAt(0).toLowerCase()+text.slice(1));
  }
  function getStructuredParts(){
    let arr=[];
    if(currentAppointment==='hae')arr=generateHae();
    if(currentAppointment==='aftercare')arr=generateAftercare();
    if(currentAppointment==='delivery')arr=generateDelivery();
    if(currentAppointment==='retest')arr=generateRetest();
    if(currentAppointment==='retestUnder')arr=generateRetestUnder();
    if(currentAppointment==='retestOver')arr=generateRetestOver();
    return arr;
  }

  window.generateNote=function(){
    let arr=getStructuredParts();
    if(arr===null)return;
    arr=Array.isArray(arr)?arr.filter(Boolean):[];

    const prefix=concernPrefix();
    if(prefix&&checked('sec_'+prefix+'Concern')){
      const raw=cleanText(val(prefix+'ConcernText'));
      if(raw){
        const rawKey=raw.toLowerCase();
        const index=arr.findIndex(item=>cleanText(item).toLowerCase()===rawKey);
        const attributed=attributedConcern(raw);
        if(index>=0)arr[index]=attributed;
        else arr.unshift(attributed);
      }
    }

    const hasPatientSatisfied=arr.some(x=>cleanText(x).toLowerCase()==='patient satisfied');
    arr=arr.filter(x=>cleanText(x).toLowerCase()!=='patient satisfied');

    let note='';
    if(arr.length){
      const normalized=[capFirst(arr[0]),...arr.slice(1).map(normalizeFragmentAfterComma)];
      note=sentenceText(normalized.join(', '));
    }

    const details=val('details');
    if(details)note+=(note?' ':'')+sentenceText(details);
    if(hasPatientSatisfied)note+=(note?' ':'')+'Patient satisfied.';

    const output=document.getElementById('output');
    if(output)output.value=note;
    const copyStatus=document.getElementById('copyStatus');
    if(copyStatus)copyStatus.textContent='';
    if(note)copyNote(true);
  };

  const baseCollectDraftState=window.collectDraftState;
  if(typeof baseCollectDraftState==='function'){
    window.collectDraftState=function(){
      const state=baseCollectDraftState();
      if(state)state.version=PATCH_VERSION;
      return state;
    };
  }

  const baseEditOutcome=window.editOutcome;
  if(typeof baseEditOutcome==='function'){
    window.editOutcome=function(id){
      const item=getSavedOutcomes().find(x=>x.id===id);
      const exactSavedNote=item&&item.note&&item.note!=='(Draft saved before note was generated.)'?item.note:'';
      baseEditOutcome(id);
      if(!item||editingOutcomeId!==item.id)return;
      const restoreExactNote=()=>{
        const output=document.getElementById('output');
        if(output)output.value=exactSavedNote||item.state?.generatedNote||'';
      };
      restoreExactNote();
      requestAnimationFrame(restoreExactNote);
    };
  }

  function fixDuplicateIdentifierText(){
    const panel=document.querySelector('.active-patient-panel');
    if(!panel)return;
    const note=[...panel.querySelectorAll('p.muted')].find(p=>p.textContent.includes('Used when saving to Saved Outcomes'));
    if(note)note.textContent='Used when saving to Saved Outcomes. Keep identifiers minimal if possible.';
  }

  function fixAboutSpacing(){
    const aboutGrid=document.querySelector('#about .about-grid');
    if(aboutGrid)aboutGrid.style.marginTop='16px';
  }

  function fixDashboardVersion(){
    const cards=document.querySelectorAll('#dashboardCards .dashboard-card');
    const versionCard=[...cards].find(card=>card.querySelector('.label')?.textContent.trim()==='Current Version');
    const number=versionCard?.querySelector('.number');
    if(number)number.textContent=PATCH_VERSION;
  }

  const baseRenderDashboard=window.renderDashboard;
  if(typeof baseRenderDashboard==='function'){
    window.renderDashboard=function(){
      const result=baseRenderDashboard();
      fixDashboardVersion();
      return result;
    };
  }

  function createToolLauncher(title,description,panelId,icon){
    const launcher=document.createElement('article');
    launcher.className='section tool-launch-card';
    launcher.innerHTML=`<div class="tool-launch-content"><div class="tool-launch-icon" aria-hidden="true">${icon}</div><div><h3>${title}</h3><p class="muted">${description}</p></div></div><button type="button" class="primary tool-launch-action" aria-haspopup="dialog">Open</button>`;
    launcher.querySelector('button').addEventListener('click',()=>openClinicalTool(panelId));
    return launcher;
  }

  function createOverlay(panelId,title,contentNodes,eyebrow='Tool'){
    const overlay=document.createElement('div');
    overlay.className='clinical-tool-overlay hidden';
    overlay.id=panelId;
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.addEventListener('click',closeClinicalToolFromBackdrop);

    const panel=document.createElement('div');
    panel.className='clinical-tool-panel';
    panel.tabIndex=-1;
    const head=document.createElement('div');
    head.className='clinical-tool-panel-head';
    head.innerHTML=`<div><span class="tool-panel-eyebrow">${eyebrow}</span><h3>${title}</h3></div><button type="button" class="secondary clinical-tool-close">Close</button>`;
    head.querySelector('button').addEventListener('click',()=>closeClinicalTool(panelId));
    panel.appendChild(head);
    contentNodes.forEach(node=>panel.appendChild(node));
    overlay.appendChild(panel);
    return overlay;
  }

  function collapseAppearanceAndHomeSettings(){
    const settings=document.getElementById('settings');
    if(!settings||document.getElementById('appearanceHomeSettingsPanel'))return;
    const groups=[...settings.querySelectorAll('.settings-group')];
    const appearance=groups.find(g=>g.querySelector('h4')?.textContent.trim()==='Appearance & Experience');
    const home=groups.find(g=>g.querySelector('h4')?.textContent.trim()==='Home Dashboard');
    if(!appearance||!home)return;

    const launcher=createToolLauncher('Appearance & Home','Appearance, color theme, landing page, and Home Dashboard visibility.','appearanceHomeSettingsPanel','⚙️');
    appearance.parentNode.insertBefore(launcher,appearance);
    const overlay=createOverlay('appearanceHomeSettingsPanel','Appearance & Home',[appearance,home],'Settings');
    settings.appendChild(overlay);
  }

  function collapseClinicalTerminology(){
    const tools=document.getElementById('tools');
    if(!tools||document.getElementById('clinicalTerminologyPanel'))return;
    const section=[...tools.querySelectorAll(':scope > .section')].find(s=>s.querySelector('h3')?.textContent.trim()==='Clinical Terminology');
    if(!section)return;

    const launcher=createToolLauncher('Clinical Terminology','Quick-reference terminology for clinical workflow and studying.','clinicalTerminologyPanel','📚');
    tools.insertBefore(launcher,section);
    const overlay=createOverlay('clinicalTerminologyPanel','Clinical Terminology',[section],'Clinical Tool');
    tools.appendChild(overlay);
  }

  function removeSmartNoteIndicator(){document.getElementById('smartNoteIndicator')?.remove();}

  function applyVersion(){
    document.querySelectorAll('[data-app-version]').forEach(el=>{el.textContent=PATCH_VERSION;});
    const aboutVersion=document.getElementById('aboutVersion');
    if(aboutVersion)aboutVersion.textContent=PATCH_VERSION;
    const heading=document.querySelector('#aboutWhatsNew h3');
    if(heading)heading.textContent="What's New in v"+PATCH_VERSION;
    const list=document.querySelector('#aboutWhatsNew .changelog-list');
    if(list)list.innerHTML=[
      '<li><strong>Added a mobile-friendly Open Sycle launcher</strong> that keeps navigation in the current app/browser view and allows returning with the Back control.</li>',
      '<li><strong>Returned Generated Notes to the concise Sycle style</strong> while keeping automatic patient-reported wording for documented concerns when appropriate.</li>',
      '<li><strong>Protected manual Saved Outcome edits</strong> so reopening an outcome restores the Generated Note exactly as it was saved.</li>',
      '<li><strong>Collapsed infrequently used settings</strong> by combining Appearance & Experience with Home Dashboard in an on-demand panel.</li>',
      '<li><strong>Made Clinical Terminology on-demand</strong> instead of keeping the full reference expanded by default.</li>',
      '<li><strong>Fixed minor interface issues</strong>, including the repeated identifier reminder and About-card spacing.</li>'
    ].join('');
  }

  const baseRenderAbout=window.renderAbout;
  if(typeof baseRenderAbout==='function'){
    window.renderAbout=function(){
      baseRenderAbout();
      applyVersion();
      fixAboutSpacing();
    };
  }

  window.showVersionInfo=function(){
    alert(`Miracle-Ear Clinical Assistant\n\nVersion ${PATCH_VERSION}\n\nWhat's new:\n• Open Sycle works in the current app/browser view\n• Concise Sycle note style retained\n• Patient-reported concern wording retained\n• Saved Outcome manual edits protected when reopening\n• Appearance/Home settings moved into an on-demand panel\n• Clinical Terminology moved into an on-demand panel\n• Minor spacing and duplicate-text fixes`);
  };
  window.checkForUpdates=function(){
    alert(`Update check\n\nCurrent version: ${PATCH_VERSION}\n\nThis portable/browser version cannot automatically download updates yet. Replace the App folder when a new version is released.`);
  };

  function initPatch(){
    applyVersion();
    fixDashboardVersion();
    removeSmartNoteIndicator();
    fixDuplicateIdentifierText();
    fixAboutSpacing();
    collapseAppearanceAndHomeSettings();
    collapseClinicalTerminology();
  }

  if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',initPatch);
  else initPatch();
  window.addEventListener('load',initPatch);
})();