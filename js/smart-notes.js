/* =========================================================
   Miracle-Ear Clinical Assistant shared release patch layer
   Concise note + quality-of-life patch layer
   ========================================================= */
(function(){
  'use strict';

  const PATCH_VERSION=window.CLINICAL_ASSISTANT_VERSION;

  function cleanText(value){return String(value||'').replace(/\s+/g,' ').trim();}
  function concernPrefix(){
    if(currentAppointment==='hae')return'hae';
    if(currentAppointment==='aftercare')return'ac';
    if(currentAppointment==='retest'||currentAppointment==='retestUnder'||currentAppointment==='retestOver')return'rt';
    return'';
  }
  function attributedConcern(raw){
    const text=cleanText(raw); if(!text)return'';
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
    let arr=getStructuredParts(); if(arr===null)return; arr=Array.isArray(arr)?arr.filter(Boolean):[];
    const prefix=concernPrefix();
    if(prefix&&checked('sec_'+prefix+'Concern')){
      const raw=cleanText(val(prefix+'ConcernText'));
      if(raw){const rawKey=raw.toLowerCase();const index=arr.findIndex(item=>cleanText(item).toLowerCase()===rawKey);const attributed=attributedConcern(raw);if(index>=0)arr[index]=attributed;else arr.unshift(attributed);}
    }
    const hasPatientSatisfied=arr.some(x=>cleanText(x).toLowerCase()==='patient satisfied');
    arr=arr.filter(x=>cleanText(x).toLowerCase()!=='patient satisfied');
    let note='';
    if(arr.length){const normalized=[capFirst(arr[0]),...arr.slice(1).map(normalizeFragmentAfterComma)];note=sentenceText(normalized.join(', '));}
    const details=val('details'); if(details)note+=(note?' ':'')+sentenceText(details); if(hasPatientSatisfied)note+=(note?' ':'')+'Patient satisfied.';
    const output=document.getElementById('output');if(output)output.value=note;
    const copyStatus=document.getElementById('copyStatus');if(copyStatus)copyStatus.textContent='';
    if(note)copyNote(true);
  };

  const baseCollectDraftState=window.collectDraftState;
  if(typeof baseCollectDraftState==='function')window.collectDraftState=function(){const state=baseCollectDraftState();if(state)state.version=PATCH_VERSION;return state;};

  const baseEditOutcome=window.editOutcome;
  if(typeof baseEditOutcome==='function')window.editOutcome=function(id){
    const item=getSavedOutcomes().find(x=>x.id===id);
    const exactSavedNote=item&&item.note&&item.note!=='(Draft saved before note was generated.)'?item.note:'';
    baseEditOutcome(id);if(!item||editingOutcomeId!==item.id)return;
    const restoreExactNote=()=>{const output=document.getElementById('output');if(output)output.value=exactSavedNote||item.state?.generatedNote||'';};
    restoreExactNote();requestAnimationFrame(restoreExactNote);
  };

  function fixDuplicateIdentifierText(){const panel=document.querySelector('.active-patient-panel');if(!panel)return;const note=[...panel.querySelectorAll('p.muted')].find(p=>p.textContent.includes('Used when saving to Saved Outcomes'));if(note)note.textContent='Used when saving to Saved Outcomes. Keep identifiers minimal if possible.';}
  function fixAboutSpacing(){const aboutGrid=document.querySelector('#about .about-grid');if(aboutGrid)aboutGrid.style.marginTop='16px';}
  function fixDashboardVersion(){const cards=document.querySelectorAll('#dashboardCards .dashboard-card');const versionCard=[...cards].find(card=>card.querySelector('.label')?.textContent.trim()==='Current Version');const number=versionCard?.querySelector('.number');if(number)number.textContent=PATCH_VERSION;}

  const baseRenderDashboard=window.renderDashboard;
  if(typeof baseRenderDashboard==='function')window.renderDashboard=function(){const result=baseRenderDashboard();fixDashboardVersion();updatePendingOutcomeBadge();return result;};

  function createToolLauncher(title,description,panelId,icon){const launcher=document.createElement('article');launcher.className='section tool-launch-card';launcher.innerHTML=`<div class="tool-launch-content"><div class="tool-launch-icon" aria-hidden="true">${icon}</div><div><h3>${title}</h3><p class="muted">${description}</p></div></div><button type="button" class="primary tool-launch-action" aria-haspopup="dialog">Open</button>`;launcher.querySelector('button').addEventListener('click',()=>openClinicalTool(panelId));return launcher;}
  function createOverlay(panelId,title,contentNodes,eyebrow='Tool'){const overlay=document.createElement('div');overlay.className='clinical-tool-overlay hidden';overlay.id=panelId;overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.addEventListener('click',closeClinicalToolFromBackdrop);const panel=document.createElement('div');panel.className='clinical-tool-panel';panel.tabIndex=-1;const head=document.createElement('div');head.className='clinical-tool-panel-head';head.innerHTML=`<div><span class="tool-panel-eyebrow">${eyebrow}</span><h3>${title}</h3></div><button type="button" class="secondary clinical-tool-close">Close</button>`;head.querySelector('button').addEventListener('click',()=>closeClinicalTool(panelId));panel.appendChild(head);contentNodes.forEach(node=>panel.appendChild(node));overlay.appendChild(panel);return overlay;}
  function collapseAppearanceAndHomeSettings(){const settings=document.getElementById('settings');if(!settings||document.getElementById('appearanceHomeSettingsPanel'))return;const groups=[...settings.querySelectorAll('.settings-group')];const appearance=groups.find(g=>g.querySelector('h4')?.textContent.trim()==='Appearance & Experience');const home=groups.find(g=>g.querySelector('h4')?.textContent.trim()==='Home Dashboard');if(!appearance||!home)return;const launcher=createToolLauncher('Appearance & Home','Appearance, color theme, landing page, and Home Dashboard visibility.','appearanceHomeSettingsPanel','⚙️');appearance.parentNode.insertBefore(launcher,appearance);const overlay=createOverlay('appearanceHomeSettingsPanel','Appearance & Home',[appearance,home],'Settings');settings.appendChild(overlay);}
  function collapseFinancingSettings(){const settings=document.getElementById('settings');if(!settings||document.getElementById('financingSettingsPanel'))return;const financing=settings.querySelector('[data-settings-financing]');if(!financing)return;const launcher=createToolLauncher('Financing Companies','Customize the financing companies available in documentation workflows.','financingSettingsPanel','💳');financing.parentNode.insertBefore(launcher,financing);const overlay=createOverlay('financingSettingsPanel','Financing Companies',[financing],'Settings');settings.appendChild(overlay);}
  function collapsePTASeverity(){const tools=document.getElementById('tools');if(!tools||document.getElementById('ptaSeverityPanel'))return;const section=tools.querySelector('[data-pta-severity-tool]');if(!section)return;const launcher=createToolLauncher('PTA Severity Calculator','Classify right- and left-ear PTA severity when needed.','ptaSeverityPanel','📊');tools.insertBefore(launcher,section);const overlay=createOverlay('ptaSeverityPanel','PTA Severity Calculator',[section],'Clinical Tool');tools.appendChild(overlay);}
  function collapseClinicalTerminology(){const tools=document.getElementById('tools');if(!tools||document.getElementById('clinicalTerminologyPanel'))return;const section=[...tools.querySelectorAll(':scope > .section')].find(s=>s.querySelector('h3')?.textContent.trim()==='Clinical Terminology');if(!section)return;const launcher=createToolLauncher('Clinical Terminology','Quick-reference terminology for clinical workflow and studying.','clinicalTerminologyPanel','📚');tools.insertBefore(launcher,section);const overlay=createOverlay('clinicalTerminologyPanel','Clinical Terminology',[section],'Clinical Tool');tools.appendChild(overlay);}
  function removeSmartNoteIndicator(){document.getElementById('smartNoteIndicator')?.remove();}

  function installBadgeStyles(){
    if(document.getElementById('pending-outcome-badge-styles'))return;
    const style=document.createElement('style');style.id='pending-outcome-badge-styles';style.textContent=`
      .saved-outcomes-nav-badge-host{position:relative!important;overflow:visible!important;}
      .pending-outcome-nav-badge{position:absolute;top:-10px;right:-8px;min-width:25px;height:25px;padding:0 7px;border-radius:999px;background:#ff2449;color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;line-height:1;box-sizing:border-box;box-shadow:0 2px 6px rgba(0,0,0,.18);z-index:5;pointer-events:none;}
      @media(max-width:600px){.pending-outcome-nav-badge{top:-8px;right:-6px;min-width:23px;height:23px;font-size:13px;padding:0 6px;}}
    `;document.head.appendChild(style);
  }
  function savedOutcomesNavButton(){return [...document.querySelectorAll('.tab-btn')].find(b=>/Saved Outcomes/i.test(b.textContent));}
  function outcomeIsCompleted(item){
    if(!item)return false;
    if(item.completed===true||item.isCompleted===true||item.done===true)return true;
    if(item.pending===false)return true;
    const status=cleanText(item.status).toLowerCase();
    return ['completed','complete','closed','done'].includes(status);
  }
  function pendingOutcomeCount(){try{return getSavedOutcomes().filter(item=>!outcomeIsCompleted(item)).length;}catch(e){return 0;}}
  function updatePendingOutcomeBadge(){
    installBadgeStyles();const button=savedOutcomesNavButton();if(!button)return;
    button.classList.add('saved-outcomes-nav-badge-host');let badge=button.querySelector('.pending-outcome-nav-badge');const count=pendingOutcomeCount();
    if(!count){badge?.remove();button.removeAttribute('aria-label');return;}
    if(!badge){badge=document.createElement('span');badge.className='pending-outcome-nav-badge';badge.setAttribute('aria-hidden','true');button.appendChild(badge);}
    badge.textContent=count>99?'99+':String(count);button.setAttribute('aria-label',`Saved Outcomes, ${count} pending`);
  }
  const baseRenderOutcomes=window.renderOutcomes;
  if(typeof baseRenderOutcomes==='function')window.renderOutcomes=function(){const result=baseRenderOutcomes();updatePendingOutcomeBadge();return result;};

  function installOutcomeBadgeRefresh(){
    if(document.documentElement.dataset.outcomeBadgeRefreshInstalled)return;
    document.documentElement.dataset.outcomeBadgeRefreshInstalled='1';
    document.addEventListener('click',function(event){
      const button=event.target.closest('button');
      if(!button)return;
      const text=cleanText(button.textContent).toLowerCase();
      if(text.includes('complete')||text.includes('delete')||text.includes('save outcome')){
        setTimeout(updatePendingOutcomeBadge,0);
        setTimeout(updatePendingOutcomeBadge,100);
      }
    },true);
  }

  function applyVersion(){window.applyClinicalAssistantVersion();}
  const baseRenderAbout=window.renderAbout;if(typeof baseRenderAbout==='function')window.renderAbout=function(){baseRenderAbout();applyVersion();fixAboutSpacing();};
  window.showVersionInfo=function(){const notes=(window.CLINICAL_ASSISTANT_RELEASE_NOTE_TEXT||[]).map(item=>'• '+item).join('\n');alert(`Miracle-Ear Clinical Assistant\n\nVersion ${PATCH_VERSION}\n\nWhat's new:\n${notes}`);};
  window.checkForUpdates=function(){alert(`Update check\n\nCurrent version: ${PATCH_VERSION}\n\nThis portable/browser version cannot automatically download updates yet. Replace the App folder when a new version is released.`);};

  function initPatch(){applyVersion();fixDashboardVersion();removeSmartNoteIndicator();fixDuplicateIdentifierText();fixAboutSpacing();collapseAppearanceAndHomeSettings();collapseFinancingSettings();collapsePTASeverity();collapseClinicalTerminology();installOutcomeBadgeRefresh();updatePendingOutcomeBadge();}
  if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',initPatch);else initPatch();
  window.addEventListener('load',initPatch);window.addEventListener('pageshow',updatePendingOutcomeBadge);window.addEventListener('storage',updatePendingOutcomeBadge);
})();
