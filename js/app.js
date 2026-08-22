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

  function ready(){
    applyLayoutFixes();
    installSycleLaunch();
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
    document.addEventListener('DOMContentLoaded',installSycleLaunch,{once:true});
    /* smart-notes.js still contains the earlier embed-test load hook. Run
       after it on window load so the final UI/function is always production-like. */
    window.addEventListener('load',installSycleLaunch,{once:true});
  }else{
    loadSequentially();
  }
})();