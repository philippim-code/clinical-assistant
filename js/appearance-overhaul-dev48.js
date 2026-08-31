/* Miracle-Ear Clinical Assistant — v1.9.0-dev48
   One-time Sycle Notes documentation acknowledgment.
*/
(function(){
  'use strict';

  const ACK_KEY='meClinicalDocumentationAcknowledgedV1';

  function isAcknowledged(){
    try{return localStorage.getItem(ACK_KEY)==='true';}
    catch(e){return false;}
  }

  function setAcknowledged(value){
    try{
      if(value)localStorage.setItem(ACK_KEY,'true');
      else localStorage.removeItem(ACK_KEY);
    }catch(e){}
  }

  function ensureModal(){
    let overlay=document.getElementById('oaDocumentationAckOverlay');
    if(overlay)return overlay;

    overlay=document.createElement('div');
    overlay.id='oaDocumentationAckOverlay';
    overlay.className='oa-doc-ack-overlay hidden';
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-labelledby','oaDocumentationAckTitle');
    overlay.setAttribute('aria-describedby','oaDocumentationAckCopy');
    overlay.innerHTML=`
      <div class="oa-doc-ack-panel" tabindex="-1">
        <div class="oa-doc-ack-eyebrow">Sycle Notes</div>
        <h3 id="oaDocumentationAckTitle">Documentation Acknowledgment</h3>
        <div class="oa-doc-ack-copy" id="oaDocumentationAckCopy">
          <p>Clinical Assistant is intended to support accurate documentation of services actually performed.</p>
          <p>Only select tests, services, counseling, or other items that were actually completed. Review all generated documentation for accuracy before copying or saving it.</p>
        </div>
        <div class="oa-doc-ack-actions">
          <button type="button" class="primary" id="oaDocumentationAckConfirm">I Understand</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    overlay.querySelector('#oaDocumentationAckConfirm')?.addEventListener('click',()=>{
      setAcknowledged(true);
      overlay.classList.add('hidden');
      document.body.classList.remove('oa-doc-ack-open');
      updateSettingsControl();
    });

    return overlay;
  }

  function showAcknowledgment(){
    if(isAcknowledged())return;
    const overlay=ensureModal();
    overlay.classList.remove('hidden');
    document.body.classList.add('oa-doc-ack-open');
    requestAnimationFrame(()=>overlay.querySelector('#oaDocumentationAckConfirm')?.focus());
  }

  function appearanceGroup(){
    const groups=[...document.querySelectorAll('#settings .settings-group, #oaAppearanceSettingsOverlay .settings-group')];
    return groups.find(group=>/Appearance\s*&\s*Experience/i.test(group.querySelector('h4')?.textContent||''))||null;
  }

  function updateSettingsControl(){
    const control=document.getElementById('oaDocumentationSetting');
    if(!control)return;
    const done=isAcknowledged();
    const status=control.querySelector('[data-doc-ack-status]');
    const button=control.querySelector('[data-doc-ack-reset]');
    if(status){
      status.textContent=done
        ?'Acknowledged on this device. It will not appear again unless reset.'
        :'The reminder will appear the next time Sycle Notes is opened.';
    }
    if(button)button.disabled=!done;
  }

  function installSettingsControl(){
    if(document.getElementById('oaDocumentationSetting')){
      updateSettingsControl();
      return;
    }
    const group=appearanceGroup();
    if(!group)return;

    const control=document.createElement('div');
    control.id='oaDocumentationSetting';
    control.className='oa-documentation-setting';
    control.innerHTML=`
      <h4>Documentation Acknowledgment</h4>
      <p class="muted" data-doc-ack-status></p>
      <button type="button" class="secondary tiny" data-doc-ack-reset>Show Again</button>`;
    group.appendChild(control);

    control.querySelector('[data-doc-ack-reset]')?.addEventListener('click',()=>{
      setAcknowledged(false);
      updateSettingsControl();
      if(typeof window.toast==='function')window.toast('Documentation acknowledgment will show the next time Sycle Notes is opened.');
    });
    updateSettingsControl();
  }

  function wrapShowTab(attempt=0){
    if(typeof window.showTab==='function'&&!window.showTab.__oaDev48Wrapped){
      const baseShowTab=window.showTab;
      const wrapped=function(tabId,button){
        const result=baseShowTab.apply(this,arguments);
        if(tabId==='notes'&&!isAcknowledged())requestAnimationFrame(showAcknowledgment);
        if(tabId==='settings')requestAnimationFrame(installSettingsControl);
        return result;
      };
      wrapped.__oaDev48Wrapped=true;
      window.showTab=wrapped;
      return;
    }
    if(attempt<60)setTimeout(()=>wrapShowTab(attempt+1),50);
  }

  function blockEscapeWhileOpen(event){
    const overlay=document.getElementById('oaDocumentationAckOverlay');
    if(!overlay||overlay.classList.contains('hidden'))return;
    if(event.key==='Escape'){
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  function init(){
    ensureModal();
    installSettingsControl();
    wrapShowTab();
    document.addEventListener('keydown',blockEscapeWhileOpen,true);
    requestAnimationFrame(()=>{
      if(document.getElementById('notes')?.classList.contains('active')&&!isAcknowledged())showAcknowledgment();
    });
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.addEventListener('load',()=>{
    installSettingsControl();
    wrapShowTab();
    if(document.getElementById('notes')?.classList.contains('active')&&!isAcknowledged())showAcknowledgment();
  },{once:true});
  window.addEventListener('pageshow',()=>{
    installSettingsControl();
    updateSettingsControl();
  });
})();
