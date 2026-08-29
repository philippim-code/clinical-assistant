/* Miracle-Ear Clinical Assistant — v1.9.0-dev17
   Emoji-inspired ear + hearing-aid pictogram refinement.
*/
(function(){
  'use strict';

  const HEARING_AID_ICON=`<svg viewBox="0 0 24 24" aria-hidden="true">
    <!-- Behind-the-ear device: deliberately visible before the ear silhouette,
         echoing the familiar hearing-aid emoji without relying on OS emoji. -->
    <rect x="16.3" y="3.2" width="4.2" height="9.1" rx="2.1" fill="#6F9FBD"/>
    <rect x="17.15" y="4.2" width="2.5" height="6.8" rx="1.25" fill="#91BAD0"/>
    <circle cx="18.4" cy="5.4" r=".55" fill="#E8F4F8"/>
    <path d="M18.2 11.5c-.3 1.7-1.4 2.7-3.1 3.3" fill="none" stroke="#596B74" stroke-width="1.25" stroke-linecap="round"/>
    <circle cx="14.7" cy="15" r="1.05" fill="#69B2AA"/>

    <!-- Ear: the dominant silhouette so the symbol reads like the hearing-aid emoji. -->
    <path d="M10.8 3.4c-3.8 0-6.5 2.9-6.5 6.7 0 2.5 1.1 4 2.5 5.3 1.2 1.1 1.5 2.2 1.7 3.4.3 1.7 1.5 2.8 3.2 2.8 2 0 3.2-1.5 3.4-3.6.1-1.2.7-1.9 1.7-2.5 1.8-1.2 2.9-3.1 2.9-5.6 0-3.7-2.9-6.5-6.6-6.5h-2.3Z" fill="#E6A071"/>
    <path d="M11.2 7c2.3 0 3.8 1.5 3.8 3.5 0 1.5-.8 2.5-2 3.1-1.2.6-1.7 1.4-1.7 2.4 0 .8.4 1.4 1 1.6" fill="none" stroke="#B86F50" stroke-width="1.35" stroke-linecap="round"/>
    <path d="M9.1 10.8c.3-1.3 1.2-2.1 2.4-2.1 1.2 0 2 .8 2 1.8 0 .9-.5 1.5-1.4 1.9-.9.4-1.4 1-1.5 1.9" fill="none" stroke="#C77C59" stroke-width="1.05" stroke-linecap="round"/>
    <path class="picto-outline" d="M10.8 3.4c-3.8 0-6.5 2.9-6.5 6.7 0 2.5 1.1 4 2.5 5.3 1.2 1.1 1.5 2.2 1.7 3.4.3 1.7 1.5 2.8 3.2 2.8 2 0 3.2-1.5 3.4-3.6.1-1.2.7-1.9 1.7-2.5 1.8-1.2 2.9-3.1 2.9-5.6 0-3.7-2.9-6.5-6.6-6.5h-2.3Z"/>
    <rect class="picto-outline" x="16.3" y="3.2" width="4.2" height="9.1" rx="2.1"/>
  </svg>`;

  function apply(el){
    if(!el||el.dataset.oaDev17HearingAid==='1')return;
    el.innerHTML=HEARING_AID_ICON;
    el.classList.add('oa-color-picto');
    el.dataset.oaDev17HearingAid='1';
  }

  function decorate(){
    document.querySelectorAll(
      '[data-oa-color-picto="spark"],'+
      '[data-oa-color-picto="hearingAid"],'+
      '[data-oa-dev16-icon="hearingAid"],'+
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
      if(!root||root.dataset.oaDev17Observer==='1')return;
      root.dataset.oaDev17Observer='1';
      new MutationObserver(queue).observe(root,{childList:true,subtree:true});
    });
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.addEventListener('load',decorate,{once:true});
  window.addEventListener('pageshow',decorate);
})();
