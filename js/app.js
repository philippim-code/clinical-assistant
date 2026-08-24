/* Miracle-Ear Clinical Assistant v1.8.0-dev1 loader */
(function(){
  const SYCLE_URL='https://www.mymiracle-ear.com/freecvs/schedule_hm.php';

  function applyLayoutFixes(){
    const old=document.getElementById('app-layout-fixes');
    if(old)old.remove();
    const style=document.createElement('style');
    style.id='app-layout-fixes';
    style.textContent=`
      #aboutData + .about-grid{margin-top:24px;}
      @media(max-width:600px){
        .appbar-actions{display:flex!important;width:100%!important;gap:8px!important;flex-wrap:nowrap!important;}
        .appbar-actions button{display:block!important;flex:1 1 0!important;margin:0!important;min-width:0!important;min-height:44px!important;}
      }
    `;
    document.head.appendChild(style);
  }

  function installSycleLaunch(){
    const button=document.querySelector('.sycle-shortcut');
    if(button){
      button.textContent='Open Sycle';
      button.removeAttribute('title');
    }
    window.openSycle=function(){
      window.location.assign(SYCLE_URL);
    };
  }

  function ready(){
    applyLayoutFixes();
    installSycleLaunch();
  }

  function loadAiAssistant(){
    if(document.querySelector('script[data-ai-assistant-loader]'))return;
    const ai=document.createElement('script');
    ai.src='js/ai-assistant.js';
    ai.async=false;
    ai.dataset.aiAssistantLoader='1';
    document.body.appendChild(ai);
  }

  function loadSequentially(){
    const core=document.createElement('script');
    core.src='js/app-core.js';
    core.async=false;
    core.onload=function(){
      const patch=document.createElement('script');
      patch.src='js/smart-notes.js';
      patch.async=false;
      patch.onload=function(){ready();loadAiAssistant();};
      document.body.appendChild(patch);
    };
    document.body.appendChild(core);
  }

  applyLayoutFixes();

  if(document.readyState==='loading'){
    document.write('<script src="js/app-core.js"><\/script><script src="js/smart-notes.js"><\/script><script src="js/ai-assistant.js"><\/script>');
    document.addEventListener('DOMContentLoaded',ready,{once:true});
  }else{
    loadSequentially();
  }

  window.addEventListener('pageshow',installSycleLaunch);
})();