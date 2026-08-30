/* Miracle-Ear Clinical Assistant — v1.9.0-dev22
   Restore Home Dashboard to a closed-by-default Settings launcher.
*/
(function(){
  'use strict';

  function findHomeDashboardGroup(){
    const section=document.querySelector('#settings > .section');
    if(!section)return null;
    return [...section.querySelectorAll(':scope > .settings-group')].find(group=>
      /Home\s+Dashboard/i.test(group.querySelector('h4')?.textContent||'')
    )||null;
  }

  function closeHomeDashboardSettings(){
    document.getElementById('oaHomeDashboardSettingsOverlay')?.classList.add('hidden');
    document.body.classList.remove('clinical-tool-open');
  }

  function openHomeDashboardSettings(){
    const overlay=document.getElementById('oaHomeDashboardSettingsOverlay');
    if(!overlay)return;
    overlay.classList.remove('hidden');
    document.body.classList.add('clinical-tool-open');
    requestAnimationFrame(()=>overlay.querySelector('.oa-home-dashboard-settings-panel')?.focus());
  }

  function installHomeDashboardSettings(){
    if(document.getElementById('oaHomeDashboardSettingsLauncher'))return;
    const group=findHomeDashboardGroup();
    if(!group)return;

    const launcher=document.createElement('article');
    launcher.id='oaHomeDashboardSettingsLauncher';
    launcher.className='tool-launch-card oa-home-dashboard-settings-launcher';
    launcher.innerHTML=`
      <div class="tool-launch-content">
        <div class="tool-launch-icon oa-emoji-restored" aria-hidden="true"><span class="oa-native-emoji">🏠</span></div>
        <div>
          <h3>Home Dashboard</h3>
          <p class="muted">Choose which Home sections are visible on this device.</p>
        </div>
      </div>
      <button type="button" class="primary tool-launch-action" id="oaHomeDashboardSettingsOpen">Open</button>`;

    group.insertAdjacentElement('beforebegin',launcher);

    const overlay=document.createElement('div');
    overlay.id='oaHomeDashboardSettingsOverlay';
    overlay.className='clinical-tool-overlay hidden oa-home-dashboard-settings-overlay';
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-labelledby','oaHomeDashboardSettingsTitle');
    overlay.innerHTML=`
      <div class="clinical-tool-panel oa-home-dashboard-settings-panel" tabindex="-1">
        <div class="clinical-tool-panel-head">
          <div><span class="tool-panel-eyebrow">Settings</span><h3 id="oaHomeDashboardSettingsTitle">🏠 Home Dashboard</h3></div>
          <button type="button" class="secondary" id="oaHomeDashboardSettingsClose">Close</button>
        </div>
        <div class="oa-home-dashboard-settings-body"></div>
        <div class="oa-home-dashboard-settings-actions">
          <button type="button" class="primary" id="oaHomeDashboardSettingsSave">Save Settings</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('.oa-home-dashboard-settings-body')?.appendChild(group);

    launcher.querySelector('#oaHomeDashboardSettingsOpen')?.addEventListener('click',openHomeDashboardSettings);
    overlay.querySelector('#oaHomeDashboardSettingsClose')?.addEventListener('click',closeHomeDashboardSettings);
    overlay.addEventListener('click',event=>{if(event.target===overlay)closeHomeDashboardSettings();});
    overlay.querySelector('#oaHomeDashboardSettingsSave')?.addEventListener('click',()=>{
      if(typeof window.saveSettings==='function')window.saveSettings();
      closeHomeDashboardSettings();
    });
  }

  function init(){
    installHomeDashboardSettings();
    closeHomeDashboardSettings();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.addEventListener('load',init,{once:true});
  window.addEventListener('pageshow',()=>{installHomeDashboardSettings();closeHomeDashboardSettings();});
})();
