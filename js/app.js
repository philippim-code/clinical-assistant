/* Miracle-Ear Clinical Assistant development loader — Sycle same-window launch */
(function(){
  const SYCLE_URL='https://www.mymiracle-ear.com/freecvs/schedule_hm.php';

  function applyLayoutFixes(){
    const old=document.getElementById('development-layout-fixes');
    if(old) old.remove();
    const style=document.createElement('style');
    style.id='development-layout-fixes';
    style.textContent=`
      /* Keep About cards consistently separated. */
      #aboutData + .about-grid{margin-top:24px;}

      /* Keep Open Sycle + Help available on portrait phones instead of
         hiding the entire action area on narrow screens. */
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

    /* Navigate in the current browser/app view rather than creating a new
       tab/window. The browser Back control returns to Clinical Assistant. */
    window.openSycle=function(){
      window.location.assign(SYCLE_URL);
    };
  }

  function installSycleLaunchLast(){
    /* The legacy v1.7.0 patch still runs its old embed-test initializer on
       DOMContentLoaded/window load. Queue this after the current event has
       completely finished so our production-like launcher always wins. */
    setTimeout(installSycleLaunch,0);
    setTimeout(installSycleLaunch,100);
  }

  function ready(){
    applyLayoutFixes();
    installSycleLaunchLast();
  }

  function loadSequentially(){
    const core=document.createElement('script');
    core.src='js/app-core.js';
    core.async=false;
    core.onload=function(){
      const smart=document.createElement('script');
      smart.src='js/smart-notes.js';
      smart.async=false;
      smart.onload=ready;
      document.body.appendChild(smart);
    };
    document.body.appendChild(core);
  }

  applyLayoutFixes();

  if(document.readyState==='loading'){
    document.write('<script src="js/app-core.js"><\/script><script src="js/smart-notes.js"><\/script>');
    document.addEventListener('DOMContentLoaded',installSycleLaunchLast,{once:true});
    window.addEventListener('load',installSycleLaunchLast,{once:true});
    window.addEventListener('pageshow',installSycleLaunchLast);
  }else{
    loadSequentially();
    installSycleLaunchLast();
  }
})();