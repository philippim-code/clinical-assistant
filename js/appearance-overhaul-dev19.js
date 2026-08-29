/* Miracle-Ear Clinical Assistant — v1.9.0-dev19
   Use the native hearing-aid emoji inside the polished icon system.
*/
(function(){
  'use strict';

  const EMOJI='🦻';

  function apply(el){
    if(!el||el.dataset.oaDev19HearingAid==='1')return;
    el.textContent=EMOJI;
    el.classList.add('oa-hearing-aid-emoji');
    el.dataset.oaDev19HearingAid='1';
  }

  function decorate(){
    document.querySelectorAll(
      '[data-oa-color-picto="spark"],'+
      '[data-oa-color-picto="hearingAid"],'+
      '[data-oa-dev16-icon="hearingAid"],'+
      '[data-oa-dev17-hearing-aid="1"],'+
      '[data-oa-dev18-hearing-aid="1"],'+
      '#references .oa-reference-title-picto'
    ).forEach(apply);
  }

  let queued=false;
  function queue(){
    if(queued)return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;decorate();});
  }

  function init(){
    decorate();
    ['home','references'].forEach(id=>{
      const root=document.getElementById(id);
      if(!root||root.dataset.oaDev19Observer==='1')return;
      root.dataset.oaDev19Observer='1';
      new MutationObserver(queue).observe(root,{childList:true,subtree:true});
    });
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.addEventListener('load',decorate,{once:true});
  window.addEventListener('pageshow',decorate);
})();
