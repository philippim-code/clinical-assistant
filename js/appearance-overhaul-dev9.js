/* Miracle-Ear Clinical Assistant — v1.9.0-dev9
   Home Quick Tools overlay routing.
*/
(function(){
  'use strict';

  const toolPanels={
    pta:'ptaSeverityPanel',
    referrals:'medicalReferralsPanel',
    terminology:'clinicalTerminologyPanel'
  };
  const originalParents=new WeakMap();

  function restoreOverlay(overlay){
    const parent=originalParents.get(overlay);
    if(!parent||overlay.parentElement===parent)return;
    parent.appendChild(overlay);
    delete overlay.dataset.oaHomeHosted;
  }

  function observeOverlay(overlay){
    if(overlay.dataset.oaDev9Observed==='1')return;
    overlay.dataset.oaDev9Observed='1';
    const observer=new MutationObserver(()=>{
      if(overlay.classList.contains('hidden')&&overlay.dataset.oaHomeHosted==='1'){
        requestAnimationFrame(()=>restoreOverlay(overlay));
      }
    });
    observer.observe(overlay,{attributes:true,attributeFilter:['class']});
  }

  function openHomeTool(toolKey){
    const panelId=toolPanels[toolKey];
    const overlay=panelId?document.getElementById(panelId):null;
    if(!overlay||typeof window.openClinicalTool!=='function')return;

    if(!originalParents.has(overlay))originalParents.set(overlay,overlay.parentElement);
    observeOverlay(overlay);
    overlay.dataset.oaHomeHosted='1';

    /* Hosting the fixed overlay at body level lets Home remain the visible
       context underneath it instead of briefly painting the Tools page. */
    document.body.appendChild(overlay);
    window.openClinicalTool(panelId);
  }

  function homeToolCard(target){
    return target?.closest?.('#homeCommandGrid [data-home-tool]')||null;
  }

  function interceptClick(event){
    const card=homeToolCard(event.target);
    if(!card)return;
    const key=card.dataset.homeTool;
    if(!toolPanels[key])return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openHomeTool(key);
  }

  function interceptKeydown(event){
    if(event.key!=='Enter'&&event.key!==' ')return;
    const card=homeToolCard(event.target);
    if(!card)return;
    const key=card.dataset.homeTool;
    if(!toolPanels[key])return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openHomeTool(key);
  }

  function init(){
    if(document.documentElement.dataset.oaDev9QuickTools==='1')return;
    document.documentElement.dataset.oaDev9QuickTools='1';
    document.addEventListener('click',interceptClick,true);
    document.addEventListener('keydown',interceptKeydown,true);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
