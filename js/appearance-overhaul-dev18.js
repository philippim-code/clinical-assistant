/* Miracle-Ear Clinical Assistant — v1.9.0-dev18
   Hearing-aid pictogram anatomy correction.
*/
(function(){
  'use strict';

  const HEARING_AID_ICON=`<svg viewBox="0 0 24 24" aria-hidden="true">
    <!-- Familiar behind-the-ear device, tucked naturally behind the auricle. -->
    <path d="M17.8 4.1c1.8 0 3 1.4 3 3.4v3.1c0 1.8-1 3-2.5 3h-.2c-1.5 0-2.5-1.2-2.5-2.9V7.2c0-1.9.8-3.1 2.2-3.1Z" fill="#6F9FBD"/>
    <path d="M18 5.1c1 0 1.6.8 1.6 2.1v3.2c0 1.1-.5 1.8-1.3 1.8s-1.4-.7-1.4-1.8V7.1c0-1.3.4-2 1.1-2Z" fill="#A7C8DA"/>
    <path class="picto-outline" d="M17.8 4.1c1.8 0 3 1.4 3 3.4v3.1c0 1.8-1 3-2.5 3h-.2c-1.5 0-2.5-1.2-2.5-2.9V7.2c0-1.9.8-3.1 2.2-3.1Z"/>

    <!-- Thin tube/receiver path from the BTE into the concha. -->
    <path d="M17 11.8c-1.5.8-2.4 1.8-2.9 3.2" fill="none" stroke="#647982" stroke-width="1.15" stroke-linecap="round"/>
    <circle cx="13.9" cy="15.4" r=".85" fill="#69B2AA"/>

    <!-- Conventional side-view auricle: helix, antihelix/concha, and lobe. -->
    <path d="M11.1 3.4c-3.7 0-6.5 2.9-6.5 6.8 0 2.6 1.1 4.5 2.8 5.9 1.2 1 1.7 1.9 1.9 3 .3 1.8 1.4 2.8 3.1 2.8 2 0 3.1-1.4 3.4-3.5.2-1.3.7-2.1 1.8-2.9 1.7-1.2 2.7-3.1 2.7-5.5 0-3.8-2.9-6.6-6.8-6.6h-2.4Z" fill="#E5A06F"/>
    <path class="picto-outline" d="M11.1 3.4c-3.7 0-6.5 2.9-6.5 6.8 0 2.6 1.1 4.5 2.8 5.9 1.2 1 1.7 1.9 1.9 3 .3 1.8 1.4 2.8 3.1 2.8 2 0 3.1-1.4 3.4-3.5.2-1.3.7-2.1 1.8-2.9 1.7-1.2 2.7-3.1 2.7-5.5 0-3.8-2.9-6.6-6.8-6.6h-2.4Z"/>

    <!-- Inner ear landmarks keep the icon unmistakably ear-shaped at small sizes. -->
    <path d="M11.2 6.8c2.6 0 4.4 1.7 4.4 4 0 1.7-.9 2.8-2.3 3.6-1.2.7-1.8 1.5-1.8 2.5 0 .8.4 1.4 1.1 1.7" fill="none" stroke="#B96F4F" stroke-width="1.35" stroke-linecap="round"/>
    <path d="M8.4 11.2c.2-2 1.5-3.4 3.2-3.4 1.7 0 2.8 1.1 2.8 2.6 0 1.2-.7 2-1.9 2.6-1.3.6-2 1.5-2 2.8" fill="none" stroke="#C77B57" stroke-width="1.15" stroke-linecap="round"/>
    <path d="M10 18.1c.6.7 1.2 1 2 1" fill="none" stroke="#C77B57" stroke-width="1.05" stroke-linecap="round"/>
  </svg>`;

  function apply(el){
    if(!el||el.dataset.oaDev18HearingAid==='1')return;
    el.innerHTML=HEARING_AID_ICON;
    el.classList.add('oa-color-picto');
    el.dataset.oaDev18HearingAid='1';
  }

  function decorate(){
    document.querySelectorAll(
      '[data-oa-color-picto="spark"],'+
      '[data-oa-color-picto="hearingAid"],'+
      '[data-oa-dev16-icon="hearingAid"],'+
      '[data-oa-dev17-hearing-aid],'+
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
      if(!root||root.dataset.oaDev18Observer==='1')return;
      root.dataset.oaDev18Observer='1';
      new MutationObserver(queue).observe(root,{childList:true,subtree:true});
    });
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.addEventListener('load',decorate,{once:true});
  window.addEventListener('pageshow',decorate);
})();
