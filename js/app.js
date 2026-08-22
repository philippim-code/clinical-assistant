/* Miracle-Ear Clinical Assistant stable loader — v1.7.0 */
(function(){
  function applyLayoutFixes(){
    const style=document.createElement('style');
    style.id='development-layout-fixes';
    style.textContent=`
      /* Keep the standalone Data & Privacy card separated from the
         Keyboard Shortcuts / Portable App grid just like other About cards. */
      #aboutData + .about-grid{margin-top:24px;}
    `;
    document.head.appendChild(style);
  }

  function loadSequentially(){
    const core=document.createElement('script');
    core.src='js/app-core.js';
    core.async=false;
    core.onload=function(){
      const smart=document.createElement('script');
      smart.src='js/smart-notes.js';
      smart.async=false;
      document.body.appendChild(smart);
    };
    document.body.appendChild(core);
  }

  applyLayoutFixes();

  if(document.readyState==='loading'){
    document.write('<script src="js/app-core.js"><\/script><script src="js/smart-notes.js"><\/script>');
  }else{
    loadSequentially();
  }
})();