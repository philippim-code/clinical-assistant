/* Miracle-Ear Clinical Assistant — v1.9.0-dev11
   Local Office Profiles + contextual header contact information.
*/
(function(){
  'use strict';

  const OFFICE_PROFILES_KEY='meClinicalOfficeProfilesV1';
  const CURRENT_OFFICE_KEY='meClinicalCurrentOfficeIdV1';
  const DEFAULT_OFFICE={
    id:'trumbull-default',
    name:'Trumbull',
    phone:'2038805883',
    extension:'',
    address:'132 Monroe Turnpike, Trumbull, CT 06611'
  };
  let editingOfficeId=null;

  function escapeHtml(value){
    return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  }

  function normalizePhone(value){return String(value||'').replace(/\D/g,'').slice(0,15);}
  function formatPhone(value){
    const digits=normalizePhone(value);
    if(digits.length===10)return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
    return digits||'';
  }
  function phoneHref(value){const digits=normalizePhone(value);return digits?`tel:${digits}`:'#';}
  function mapsHref(address){return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address||'')}`;}

  function initializeOfficeStorage(){
    if(localStorage.getItem(OFFICE_PROFILES_KEY)===null){
      localStorage.setItem(OFFICE_PROFILES_KEY,JSON.stringify([DEFAULT_OFFICE]));
      localStorage.setItem(CURRENT_OFFICE_KEY,DEFAULT_OFFICE.id);
    }
  }

  function getOffices(){
    initializeOfficeStorage();
    try{
      const value=JSON.parse(localStorage.getItem(OFFICE_PROFILES_KEY)||'[]');
      return Array.isArray(value)?value.filter(office=>office&&office.id&&office.name):[];
    }catch(e){return[];}
  }

  function saveOffices(offices){
    localStorage.setItem(OFFICE_PROFILES_KEY,JSON.stringify(offices));
  }

  function getCurrentOfficeId(){
    const offices=getOffices();
    let id=localStorage.getItem(CURRENT_OFFICE_KEY)||'';
    if(!offices.some(office=>office.id===id)){
      id=offices[0]?.id||'';
      if(id)localStorage.setItem(CURRENT_OFFICE_KEY,id);else localStorage.removeItem(CURRENT_OFFICE_KEY);
    }
    return id;
  }

  function getCurrentOffice(){
    const id=getCurrentOfficeId();
    return getOffices().find(office=>office.id===id)||null;
  }

  function setCurrentOffice(id,notify=true){
    const office=getOffices().find(item=>item.id===id);
    if(!office)return;
    localStorage.setItem(CURRENT_OFFICE_KEY,id);
    renderOfficeHeader();
    renderOfficeManager();
    updateSettingsLauncher();
    if(notify&&typeof window.toast==='function')window.toast(`✓ Current office changed to ${office.name}.`);
  }

  function installHeader(){
    const header=document.querySelector('.header');
    if(!header||document.getElementById('oaOfficeHeader'))return;
    const block=document.createElement('div');
    block.id='oaOfficeHeader';
    block.className='oa-office-header';
    header.appendChild(block);
    renderOfficeHeader();
  }

  function renderOfficeHeader(){
    const block=document.getElementById('oaOfficeHeader');
    if(!block)return;
    const office=getCurrentOffice();
    block.hidden=!office;
    if(!office){block.innerHTML='';return;}
    const phone=formatPhone(office.phone);
    const extension=String(office.extension||'').trim();
    block.innerHTML=`
      <div class="oa-office-header-full" aria-label="Current office: ${escapeHtml(office.name)}">
        <div class="oa-office-header-name">${escapeHtml(office.name)} Office</div>
        <div class="oa-office-header-meta"><a href="${phoneHref(office.phone)}">${escapeHtml(phone)}</a>${extension?`<span>· Ext. ${escapeHtml(extension)}</span>`:''}</div>
        <div class="oa-office-header-meta"><a href="${mapsHref(office.address)}" target="_blank" rel="noopener">${escapeHtml(office.address)}</a></div>
      </div>
      <button type="button" class="oa-office-mobile-chip" id="oaOfficeMobileChip" aria-label="View ${escapeHtml(office.name)} office information">⌖ ${escapeHtml(office.name)}</button>`;
    block.querySelector('#oaOfficeMobileChip')?.addEventListener('click',openOfficeInfo);
  }

  function installSettingsLauncher(){
    const section=document.querySelector('#settings > .section');
    if(!section||document.getElementById('oaOfficeSettingsLauncher'))return;
    const launcher=document.createElement('article');
    launcher.id='oaOfficeSettingsLauncher';
    launcher.className='tool-launch-card oa-office-settings-launcher';
    launcher.innerHTML=`
      <div class="tool-launch-content">
        <div class="tool-launch-icon" aria-hidden="true">⌖</div>
        <div><h3>Office Profiles</h3><p class="muted">Choose the current office and manage locally saved office contact information.</p><div class="oa-office-settings-current" id="oaOfficeSettingsCurrent"></div></div>
      </div>
      <button type="button" class="primary tool-launch-action" id="oaOfficeSettingsOpen">Open</button>`;
    const firstAction=[...section.children].find(el=>el.tagName==='BUTTON');
    if(firstAction)section.insertBefore(launcher,firstAction);else section.appendChild(launcher);
    launcher.querySelector('#oaOfficeSettingsOpen')?.addEventListener('click',openOfficeManager);
    updateSettingsLauncher();
  }

  function updateSettingsLauncher(){
    const line=document.getElementById('oaOfficeSettingsCurrent');
    if(!line)return;
    const office=getCurrentOffice();
    line.textContent=office?`Current: ${office.name}`:'No current office selected';
  }

  function installOfficeManager(){
    if(document.getElementById('oaOfficeOverlay'))return;
    const overlay=document.createElement('div');
    overlay.id='oaOfficeOverlay';
    overlay.className='oa-office-overlay hidden';
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-labelledby','oaOfficeProfilesTitle');
    overlay.innerHTML=`
      <div class="oa-office-panel" tabindex="-1">
        <div class="oa-office-panel-head">
          <div><div class="oa-office-eyebrow">Settings</div><h3 id="oaOfficeProfilesTitle">Office Profiles</h3></div>
          <button type="button" class="secondary" id="oaOfficeClose">Close</button>
        </div>
        <div class="oa-office-panel-body">
          <div class="oa-office-current-block">
            <div><label class="inline-label" for="oaCurrentOfficeSelect">Current Office</label><select id="oaCurrentOfficeSelect"></select></div>
            <div class="muted">The selected office appears in the app header on this device.</div>
          </div>
          <div class="oa-office-section-title">Saved Offices</div>
          <div class="oa-office-list" id="oaOfficeList"></div>
          <div class="oa-office-section-title" id="oaOfficeFormTitle">Add Office</div>
          <form class="oa-office-form" id="oaOfficeForm">
            <div class="oa-office-form-grid">
              <div><label class="inline-label" for="oaOfficeName">Office Name</label><input type="text" id="oaOfficeName" required placeholder="ex. Trumbull"></div>
              <div><label class="inline-label" for="oaOfficePhone">Phone Number</label><input type="tel" id="oaOfficePhone" required placeholder="(203) 555-1234"></div>
              <div><label class="inline-label" for="oaOfficeExtension">Extension <span class="muted">(optional)</span></label><input type="text" id="oaOfficeExtension" placeholder="ex. 201"></div>
            </div>
            <label class="inline-label" for="oaOfficeAddress">Address</label><input type="text" id="oaOfficeAddress" required placeholder="Street, city, state, ZIP">
            <div class="oa-office-form-actions"><button type="submit" class="primary" id="oaOfficeSave">Add Office</button><button type="button" class="secondary hidden" id="oaOfficeCancelEdit">Cancel Edit</button></div>
          </form>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click',event=>{if(event.target===overlay)closeOfficeManager();});
    overlay.querySelector('#oaOfficeClose')?.addEventListener('click',closeOfficeManager);
    overlay.querySelector('#oaCurrentOfficeSelect')?.addEventListener('change',event=>setCurrentOffice(event.target.value));
    overlay.querySelector('#oaOfficeForm')?.addEventListener('submit',saveOfficeFromForm);
    overlay.querySelector('#oaOfficeCancelEdit')?.addEventListener('click',resetOfficeForm);
  }

  function renderOfficeManager(){
    const select=document.getElementById('oaCurrentOfficeSelect');
    const list=document.getElementById('oaOfficeList');
    if(!select||!list)return;
    const offices=getOffices(),currentId=getCurrentOfficeId();
    select.innerHTML=offices.length?offices.map(office=>`<option value="${escapeHtml(office.id)}" ${office.id===currentId?'selected':''}>${escapeHtml(office.name)}</option>`).join(''):'<option value="">No offices saved</option>';
    select.disabled=!offices.length;
    list.innerHTML=offices.length?offices.map(office=>{
      const current=office.id===currentId,phone=formatPhone(office.phone),ext=office.extension?` · Ext. ${escapeHtml(office.extension)}`:'';
      return `<div class="oa-office-list-card ${current?'current':''}" data-office-id="${escapeHtml(office.id)}"><div class="oa-office-list-copy"><strong>${escapeHtml(office.name)}${current?' · Current':''}</strong><span>${escapeHtml(phone)}${ext}</span><span>${escapeHtml(office.address)}</span></div><div class="oa-office-list-actions">${current?'':`<button type="button" class="tiny secondary" data-office-current="${escapeHtml(office.id)}">Set Current</button>`}<button type="button" class="tiny secondary" data-office-edit="${escapeHtml(office.id)}">Edit</button><button type="button" class="tiny danger-outline" data-office-delete="${escapeHtml(office.id)}">Delete</button></div></div>`;
    }).join(''):'<div class="muted">No office profiles saved.</div>';
    list.querySelectorAll('[data-office-current]').forEach(button=>button.addEventListener('click',()=>setCurrentOffice(button.dataset.officeCurrent)));
    list.querySelectorAll('[data-office-edit]').forEach(button=>button.addEventListener('click',()=>beginEditOffice(button.dataset.officeEdit)));
    list.querySelectorAll('[data-office-delete]').forEach(button=>button.addEventListener('click',()=>deleteOffice(button.dataset.officeDelete)));
  }

  function openOfficeManager(){
    installOfficeManager();
    renderOfficeManager();
    resetOfficeForm();
    const overlay=document.getElementById('oaOfficeOverlay');
    overlay?.classList.remove('hidden');
    document.body.classList.add('clinical-tool-open');
    requestAnimationFrame(()=>overlay?.querySelector('.oa-office-panel')?.focus());
  }

  function closeOfficeManager(){
    document.getElementById('oaOfficeOverlay')?.classList.add('hidden');
    document.body.classList.remove('clinical-tool-open');
    resetOfficeForm();
  }

  function saveOfficeFromForm(event){
    event.preventDefault();
    const name=document.getElementById('oaOfficeName')?.value.trim()||'';
    const phone=normalizePhone(document.getElementById('oaOfficePhone')?.value||'');
    const extension=document.getElementById('oaOfficeExtension')?.value.trim()||'';
    const address=document.getElementById('oaOfficeAddress')?.value.trim()||'';
    if(!name||!phone||!address)return;
    const offices=getOffices();
    if(editingOfficeId){
      const index=offices.findIndex(office=>office.id===editingOfficeId);
      if(index>=0)offices[index]={...offices[index],name,phone,extension,address};
      saveOffices(offices);
      if(typeof window.toast==='function')window.toast('✓ Office updated.');
    }else{
      const office={id:`office-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,name,phone,extension,address};
      offices.push(office);saveOffices(offices);
      if(offices.length===1)setCurrentOffice(office.id,false);
      if(typeof window.toast==='function')window.toast(`✓ ${name} office added.`);
    }
    resetOfficeForm();renderOfficeManager();renderOfficeHeader();updateSettingsLauncher();
  }

  function beginEditOffice(id){
    const office=getOffices().find(item=>item.id===id);if(!office)return;
    editingOfficeId=id;
    document.getElementById('oaOfficeFormTitle').textContent=`Edit ${office.name}`;
    document.getElementById('oaOfficeName').value=office.name||'';
    document.getElementById('oaOfficePhone').value=formatPhone(office.phone);
    document.getElementById('oaOfficeExtension').value=office.extension||'';
    document.getElementById('oaOfficeAddress').value=office.address||'';
    document.getElementById('oaOfficeSave').textContent='Save Changes';
    document.getElementById('oaOfficeCancelEdit').classList.remove('hidden');
    document.getElementById('oaOfficeName').focus();
  }

  function resetOfficeForm(){
    editingOfficeId=null;
    const form=document.getElementById('oaOfficeForm');if(form)form.reset();
    const title=document.getElementById('oaOfficeFormTitle');if(title)title.textContent='Add Office';
    const save=document.getElementById('oaOfficeSave');if(save)save.textContent='Add Office';
    document.getElementById('oaOfficeCancelEdit')?.classList.add('hidden');
  }

  function deleteOffice(id){
    const offices=getOffices(),office=offices.find(item=>item.id===id);if(!office)return;
    if(offices.length<=1){
      if(typeof window.toast==='function')window.toast('Add another office before deleting your only office.');
      return;
    }
    if(!window.confirm(`Delete ${office.name} from Office Profiles?`))return;
    const remaining=offices.filter(item=>item.id!==id);saveOffices(remaining);
    if(getCurrentOfficeId()===id)localStorage.setItem(CURRENT_OFFICE_KEY,remaining[0].id);
    renderOfficeManager();renderOfficeHeader();updateSettingsLauncher();
    if(typeof window.toast==='function')window.toast(`✓ ${office.name} office removed.`);
  }

  function installOfficeInfo(){
    if(document.getElementById('oaOfficeInfoOverlay'))return;
    const overlay=document.createElement('div');
    overlay.id='oaOfficeInfoOverlay';
    overlay.className='oa-office-overlay hidden';
    overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');
    overlay.innerHTML=`<div class="oa-office-panel" tabindex="-1"><div class="oa-office-panel-head"><div><div class="oa-office-eyebrow">Current Office</div><h3>Office Information</h3></div><button type="button" class="secondary" data-office-info-close>Close</button></div><div class="oa-office-panel-body" id="oaOfficeInfoBody"></div></div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click',event=>{if(event.target===overlay)closeOfficeInfo();});
    overlay.querySelector('[data-office-info-close]')?.addEventListener('click',closeOfficeInfo);
  }

  function openOfficeInfo(){
    installOfficeInfo();
    const office=getCurrentOffice();if(!office)return;
    const phone=formatPhone(office.phone),ext=office.extension?` · Ext. ${escapeHtml(office.extension)}`:'';
    const body=document.getElementById('oaOfficeInfoBody');
    body.innerHTML=`<div class="oa-office-mobile-sheet-copy"><strong>${escapeHtml(office.name)} Office</strong><span>${escapeHtml(phone)}${ext}</span><span>${escapeHtml(office.address)}</span></div><div class="oa-office-mobile-actions"><a class="primary-link" href="${phoneHref(office.phone)}">Call Office</a><a class="secondary-link" href="${mapsHref(office.address)}" target="_blank" rel="noopener">Directions</a></div>`;
    const overlay=document.getElementById('oaOfficeInfoOverlay');overlay.classList.remove('hidden');document.body.classList.add('clinical-tool-open');
  }

  function closeOfficeInfo(){document.getElementById('oaOfficeInfoOverlay')?.classList.add('hidden');document.body.classList.remove('clinical-tool-open');}

  function wrapSettingsRender(){
    if(typeof window.renderSettings!=='function'||window.renderSettings.__oaOfficeWrapped)return;
    const base=window.renderSettings;
    const wrapped=function(){const result=base.apply(this,arguments);setTimeout(()=>{installSettingsLauncher();updateSettingsLauncher();},0);return result;};
    wrapped.__oaOfficeWrapped=true;window.renderSettings=wrapped;
  }

  function init(){
    initializeOfficeStorage();
    installHeader();
    installOfficeManager();
    installOfficeInfo();
    wrapSettingsRender();
    installSettingsLauncher();
    renderOfficeHeader();
    updateSettingsLauncher();
  }

  document.addEventListener('keydown',event=>{
    if(event.key!=='Escape')return;
    if(!document.getElementById('oaOfficeInfoOverlay')?.classList.contains('hidden'))closeOfficeInfo();
    else if(!document.getElementById('oaOfficeOverlay')?.classList.contains('hidden'))closeOfficeManager();
  });

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.addEventListener('load',()=>{installHeader();installSettingsLauncher();renderOfficeHeader();updateSettingsLauncher();},{once:true});
  window.addEventListener('pageshow',()=>{renderOfficeHeader();updateSettingsLauncher();});
})();
