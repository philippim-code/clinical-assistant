/* Miracle-Ear Clinical Assistant — v1.9.0-dev21
   Restore Appearance & Experience to a closed-by-default Settings launcher.
*/
(function(){
  'use strict';

  function findAppearanceGroup(){
    const section=document.querySelector('#settings > .section');
    if(!section)return null;
    return [...section.querySelectorAll(':scope > .settings-group')].find(group=>
      /Appearance\s*&\s*Experience/i.test(group.querySelector('h4')?.textContent||'')
    )||null;
  }

  function closeAppearanceSettings(){
    document.getElementById('oaAppearanceSettingsOverlay')?.classList.add('hidden');
    document.body.classList.remove('clinical-tool-open');
  }

  function openAppearanceSettings(){
    const overlay=document.getElementById('oaAppearanceSettingsOverlay');
    if(!overlay)return;
    overlay.classList.remove('hidden');
    document.body.classList.add('clinical-tool-open');
    requestAnimationFrame(()=>overlay.querySelector('.oa-appearance-settings-panel')?.focus());
  }

  function installAppearanceSettings(){
    if(document.getElementById('oaAppearanceSettingsLauncher'))return;
    const group=findAppearanceGroup();
    const settingsSection=document.querySelector('#settings > .section');
    if(!group||!settingsSection)return;

    const launcher=document.createElement('article');
    launcher.id='oaAppearanceSettingsLauncher';
    launcher.className='tool-launch-card oa-appearance-settings-launcher';
    launcher.innerHTML=`
      <div class="tool-launch-content">
        <div class="tool-launch-icon oa-emoji-restored" aria-hidden="true"><span class="oa-native-emoji">🎨</span></div>
        <div>
          <h3>Appearance & Experience</h3>
          <p class="muted">Customize appearance, color theme, and the default landing page.</p>
        </div>
      </div>
      <button type="button" class="primary tool-launch-action" id="oaAppearanceSettingsOpen">Open</button>`;

    group.insertAdjacentElement('beforebegin',launcher);

    const overlay=document.createElement('div');
    overlay.id='oaAppearanceSettingsOverlay';
    overlay.className='clinical-tool-overlay hidden oa-appearance-settings-overlay';
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-labelledby','oaAppearanceSettingsTitle');
    overlay.innerHTML=`
      <div class="clinical-tool-panel oa-appearance-settings-panel" tabindex="-1">
        <div class="clinical-tool-panel-head">
          <div><span class="tool-panel-eyebrow">Settings</span><h3 id="oaAppearanceSettingsTitle">🎨 Appearance & Experience</h3></div>
          <button type="button" class="secondary" id="oaAppearanceSettingsClose">Close</button>
        </div>
        <div class="oa-appearance-settings-body"></div>
        <div class="oa-appearance-settings-actions">
          <button type="button" class="primary" id="oaAppearanceSettingsSave">Save Settings</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('.oa-appearance-settings-body')?.appendChild(group);

    launcher.querySelector('#oaAppearanceSettingsOpen')?.addEventListener('click',openAppearanceSettings);
    overlay.querySelector('#oaAppearanceSettingsClose')?.addEventListener('click',closeAppearanceSettings);
    overlay.addEventListener('click',event=>{if(event.target===overlay)closeAppearanceSettings();});
    overlay.querySelector('#oaAppearanceSettingsSave')?.addEventListener('click',()=>{
      if(typeof window.saveSettings==='function')window.saveSettings();
      closeAppearanceSettings();
    });
  }

  function init(){
    installAppearanceSettings();
    closeAppearanceSettings();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.addEventListener('load',init,{once:true});
  window.addEventListener('pageshow',()=>{installAppearanceSettings();closeAppearanceSettings();});
})();
