/* Miracle-Ear Clinical Assistant — v1.9.0-dev15
   Unified colored pictograms beyond the primary navigation.
*/
(function(){
  'use strict';

  const P={
    appearance:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.1 4.8c3.5-3 9-2.7 12.3.6 3.7 3.7 2.6 8.6-.4 9.1-1.8.3-2.2-1.6-3.7-1.2-1.6.5-.8 2.5-2.3 3.7-2.1 1.6-5.5.4-7.3-1.8-2.8-3.5-2.1-8.5 1.1-11.6Z" fill="#F0D6A4"/><circle cx="8" cy="7.7" r="1.5" fill="#D96D61"/><circle cx="12" cy="6.5" r="1.5" fill="#6FA9D8"/><circle cx="15.9" cy="8.2" r="1.5" fill="#69B29C"/><circle cx="7.4" cy="12" r="1.5" fill="#E3A54C"/><path d="m15.2 16.9 4-4 1.7 1.7-4 4-2.4.6z" fill="#7D8B93"/><path class="picto-outline" d="M5.1 4.8c3.5-3 9-2.7 12.3.6 3.7 3.7 2.6 8.6-.4 9.1-1.8.3-2.2-1.6-3.7-1.2-1.6.5-.8 2.5-2.3 3.7-2.1 1.6-5.5.4-7.3-1.8-2.8-3.5-2.1-8.5 1.1-11.6Z"/></svg>`,
    financing:`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.2" y="5" width="17.6" height="13.6" rx="2.2" fill="#8DB6D5"/><rect x="3.2" y="8.2" width="17.6" height="3.1" fill="#E7BC63"/><rect x="6.2" y="14" width="4.5" height="2.2" rx=".5" fill="#DFF0EC"/><path class="picto-outline" d="M5.4 5h13.2a2.2 2.2 0 0 1 2.2 2.2v9.2a2.2 2.2 0 0 1-2.2 2.2H5.4a2.2 2.2 0 0 1-2.2-2.2V7.2A2.2 2.2 0 0 1 5.4 5Z"/></svg>`,
    programming:`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3.5" width="16" height="17" rx="3" fill="#9AA7AE"/><path d="M8 7v10M12 7v10M16 7v10" stroke="#EDF2F4" stroke-width="1.2" stroke-linecap="round"/><circle cx="8" cy="10" r="2" fill="#67B6AD"/><circle cx="12" cy="14" r="2" fill="#E4A34D"/><circle cx="16" cy="9" r="2" fill="#7FA8D2"/><rect class="picto-outline" x="4" y="3.5" width="16" height="17" rx="3"/></svg>`,
    office:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5.2h9.7v15H5z" fill="#D7C7A5"/><path d="M8 8h2v2H8zM11.7 8h2v2h-2zM8 12h2v2H8zM11.7 12h2v2h-2z" fill="#94BED1"/><path d="M16.2 7.7a4.2 4.2 0 0 1 4.2 4.2c0 3.7-4.2 7.3-4.2 7.3S12 15.6 12 11.9a4.2 4.2 0 0 1 4.2-4.2Z" fill="#61AFA9"/><circle cx="16.2" cy="11.9" r="1.4" fill="#fff"/><path class="picto-outline" d="M5 5.2h9.7v15H5zM7 20.2v-3h3.6v3"/></svg>`,
    pta:`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.8" width="17" height="16.3" rx="2.2" fill="#F8FBFC"/><path d="M7 6v11M11 6v11M15 6v11M19 6v11M5 9h14M5 13h14M5 17h14" stroke="#D8E4E7" stroke-width=".7"/><path d="m6 15 4-4 3 2 5-6" fill="none" stroke="#4DAA9F" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6" cy="15" r="1.35" fill="#E09A47"/><circle cx="10" cy="11" r="1.35" fill="#E09A47"/><circle cx="13" cy="13" r="1.35" fill="#E09A47"/><circle cx="18" cy="7" r="1.35" fill="#E09A47"/><rect class="picto-outline" x="3.5" y="3.8" width="17" height="16.3" rx="2.2"/></svg>`,
    referral:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.7 7.4h6l1.7 1.8h8.9v9.7a2 2 0 0 1-2 2H5.7a2 2 0 0 1-2-2z" fill="#82B7D7"/><path d="M3.7 7.4V5.8a2 2 0 0 1 2-2h4l1.7 1.8h6.9a2 2 0 0 1 2 2v1.6" fill="#A8CDE3"/><circle cx="16.5" cy="14" r="3.2" fill="#D66D68"/><path d="M16.5 12.2v3.6M14.7 14h3.6" stroke="#fff" stroke-width="1.35" stroke-linecap="round"/><path class="picto-outline" d="M3.7 7.4h6l1.7 1.8h8.9v9.7a2 2 0 0 1-2 2H5.7a2 2 0 0 1-2-2z"/></svg>`,
    terminology:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.2 5.7A3.2 3.2 0 0 1 7.4 2.5H11v16.8H7.4a3.2 3.2 0 0 0-3.2 2.2z" fill="#79B8A6"/><path d="M19.8 5.7a3.2 3.2 0 0 0-3.2-3.2H13v16.8h3.6a3.2 3.2 0 0 1 3.2 2.2z" fill="#789FD0"/><path d="M7 7h2.2M7 10h2.2M14.8 7H17M14.8 10H17" stroke="#F4FAFA" stroke-width="1.1" stroke-linecap="round"/><path class="picto-outline" d="M4.2 5.7A3.2 3.2 0 0 1 7.4 2.5H11v16.8H7.4a3.2 3.2 0 0 0-3.2 2.2zM19.8 5.7a3.2 3.2 0 0 0-3.2-3.2H13v16.8h3.6a3.2 3.2 0 0 1 3.2 2.2zM12 3v17"/></svg>`,
    spark:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.8 4.4c4.3-.8 7.7 1.7 8 5.3.2 2.3-.8 4.2-2.5 5.5l-2.1-2.1c1.1-.8 1.7-2 1.5-3.1-.2-1.9-2-3-4.3-2.5z" fill="#AAB3B7"/><path d="M9.3 7.5c-2.8.7-4.8 2.9-4.3 5.3.3 1.7 1.7 2.9 3.4 3.2" fill="none" stroke="#6A7C84" stroke-width="1.5" stroke-linecap="round"/><rect x="7.4" y="15.2" width="4.2" height="5.1" rx="1.5" fill="#7CB8B3"/><path d="M11.5 17.6c3.4.1 5.8 1.3 7.2 3" fill="none" stroke="#727F85" stroke-width="1.25" stroke-linecap="round"/><path class="picto-outline" d="M8.8 4.4c4.3-.8 7.7 1.7 8 5.3.2 2.3-.8 4.2-2.5 5.5l-2.1-2.1c1.1-.8 1.7-2 1.5-3.1-.2-1.9-2-3-4.3-2.5z"/></svg>`,
    resume:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.2 3.8h10l3.6 3.6v12.8H5.2z" fill="#F2E8C8"/><path d="M15.2 3.8v4h3.6" fill="#D9C79D"/><circle cx="14.4" cy="14.2" r="4.2" fill="#64AFA8"/><path d="m13.2 12.2 3 2-3 2z" fill="#fff"/><path class="picto-outline" d="M5.2 3.8h10l3.6 3.6v12.8H5.2z"/></svg>`,
    outcomes:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3.8h12.2L20 6.6v13.6H5z" fill="#70A9DB"/><rect x="8" y="3.8" width="7.4" height="5.2" rx=".7" fill="#EAF3FA"/><circle cx="16.7" cy="16.9" r="4.1" fill="#57A773"/><path d="m14.9 16.9 1.2 1.2 2.3-2.5" stroke="#fff" stroke-width="1.45" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path class="picto-outline" d="M5 3.8h12.2L20 6.6v13.6H5zM8 3.8V9h7.4V3.8"/></svg>`,
    activity:`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.6" fill="#8EB8D7"/><circle cx="12" cy="12" r="6.3" fill="#EAF3F8"/><path d="M12 7.8V12l3 2" stroke="#D89A48" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle class="picto-outline" cx="12" cy="12" r="8.6"/></svg>`,
    privacy:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2 19 6v5.2c0 4.5-2.8 7.7-7 9.7-4.2-2-7-5.2-7-9.7V6z" fill="#7FA8D2"/><rect x="9" y="10.4" width="6" height="5.2" rx="1.2" fill="#F0C86E"/><path d="M10.3 10.4V9a1.7 1.7 0 0 1 3.4 0v1.4" stroke="#7B6230" stroke-width="1.1" fill="none"/><path class="picto-outline" d="M12 3.2 19 6v5.2c0 4.5-2.8 7.7-7 9.7-4.2-2-7-5.2-7-9.7V6z"/></svg>`,
    whatsnew:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.2 3.5c3.2.5 5.8 3.1 6.3 6.3l-5.6 5.6-6.3-6.3z" fill="#7CA6D4"/><path d="m8.6 9.1-3 1-2.1 3.2 4.2.4M14.9 15.4l-.6 4.2 3.2-2.1 1-3" fill="#D86C61"/><circle cx="15.3" cy="8.7" r="1.7" fill="#F3D36F"/><path d="m7.7 16.2-2.6 2.6M9.8 17.1l-2.1 3" stroke="#E6A04D" stroke-width="1.5" stroke-linecap="round"/><path class="picto-outline" d="M14.2 3.5c3.2.5 5.8 3.1 6.3 6.3l-5.6 5.6-6.3-6.3z"/></svg>`,
    hearingAid:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.3 4.3c4.7-.8 8.5 1.9 8.7 5.9.1 2.1-.8 4-2.4 5.3l-2.2-2.2c1-.8 1.5-1.8 1.4-2.9-.2-2.1-2.1-3.2-4.8-2.7z" fill="#B4BCC0"/><path d="M9 7.7c-2.8.7-4.8 2.8-4.5 5.2.2 1.9 1.8 3.3 3.8 3.5" fill="none" stroke="#647981" stroke-width="1.5" stroke-linecap="round"/><rect x="7.1" y="15.7" width="4.3" height="4.6" rx="1.4" fill="#76B7B0"/><circle cx="16.4" cy="6" r="1.3" fill="#D56B67"/><circle cx="18.9" cy="8.8" r="1.3" fill="#6B9FD2"/><path class="picto-outline" d="M8.3 4.3c4.7-.8 8.5 1.9 8.7 5.9.1 2.1-.8 4-2.4 5.3l-2.2-2.2c1-.8 1.5-1.8 1.4-2.9-.2-2.1-2.1-3.2-4.8-2.7z"/></svg>`
  };

  function setPicto(el,key){
    if(!el||!P[key]||el.dataset.oaColorPicto===key)return;
    el.innerHTML=P[key];
    el.dataset.oaColorPicto=key;
    el.classList.add('oa-color-picto');
  }

  function keyForTitle(text){
    const t=(text||'').toLowerCase();
    if(t.includes('appearance'))return'appearance';
    if(t.includes('financing'))return'financing';
    if(t.includes('programming'))return'programming';
    if(t.includes('office profile'))return'office';
    if(t.includes('pta'))return'pta';
    if(t.includes('medical referral'))return'referral';
    if(t.includes('terminology'))return'terminology';
    if(t.includes('spark'))return'spark';
    return'';
  }

  function decorateLaunchCards(){
    document.querySelectorAll('.tool-launch-card').forEach(card=>{
      const key=keyForTitle(card.querySelector('h3,h4')?.textContent||'');
      if(key)setPicto(card.querySelector('.tool-launch-icon'),key);
    });
  }

  function decorateHome(){
    document.querySelectorAll('#home .home-shortcut-card,#home .home-reference-card,#home .home-continue-card').forEach(card=>{
      const text=card.querySelector('strong')?.textContent||'';
      let key=keyForTitle(text);
      if(/resume/i.test(text))key='resume';
      if(/pending outcomes/i.test(text))key='outcomes';
      if(key)setPicto(card.querySelector('.home-command-icon'),key);
    });
    document.querySelectorAll('#home .oa-empty-state').forEach(state=>{
      const type=state.dataset.oaEmpty;
      setPicto(state.querySelector('.oa-empty-state-icon'),type==='activity'?'activity':type==='referral'?'referral':'outcomes');
    });
  }

  function decorateEmptyStates(){
    document.querySelectorAll('.oa-empty-state').forEach(state=>{
      const type=state.dataset.oaEmpty;
      const key=type==='activity'?'activity':type==='referral'?'referral':'outcomes';
      setPicto(state.querySelector('.oa-empty-state-icon'),key);
    });
  }

  function decorateAbout(){
    document.querySelectorAll('#about .about-section-head').forEach(head=>{
      const title=head.querySelector('h3')?.textContent||'';
      const key=/data\s*&\s*privacy/i.test(title)?'privacy':/what'?s new/i.test(title)?'whatsnew':'';
      if(key)setPicto(head.querySelector('.about-icon'),key);
    });
  }

  function decorateReferences(){
    const root=document.getElementById('references');
    if(!root)return;
    root.querySelectorAll('.ref-image-icon').forEach(icon=>setPicto(icon,'hearingAid'));
    root.querySelectorAll('.ref-accordion > summary').forEach(summary=>{
      if(!/hearing aids/i.test(summary.textContent||''))return;
      if(summary.querySelector('.oa-reference-summary-left'))return;
      summary.innerHTML=`<span class="oa-reference-summary-left"><span class="oa-color-picto oa-reference-title-picto" data-oa-color-picto="hearingAid">${P.hearingAid}</span><span>Hearing Aids</span></span>`;
    });
    root.querySelectorAll('button').forEach(button=>{
      const text=(button.textContent||'').trim();
      let cls='';let label='';
      if(text==='🔵🔴 Both'){cls='both';label='Both';}
      else if(text==='🔵 Left'){cls='';label='Left';}
      else if(text==='🔴 Right'){cls='right';label='Right';}
      if(!label||button.dataset.oaSideNormalized==='1')return;
      button.dataset.oaSideNormalized='1';
      button.innerHTML=`<span class="oa-reference-side-label"><span class="ref-side-marker ${cls}"></span><span>${label}</span></span>`;
    });
  }

  function decorateAll(){decorateLaunchCards();decorateHome();decorateEmptyStates();decorateAbout();decorateReferences();}

  let queued=false;
  function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;decorateAll();});}

  function observeRoots(){
    ['home','tools','settings','about','references','outcomes'].forEach(id=>{
      const root=document.getElementById(id);if(!root||root.dataset.oaColorIconObserver==='1')return;
      root.dataset.oaColorIconObserver='1';
      new MutationObserver(queue).observe(root,{childList:true,subtree:true});
    });
  }

  function init(){observeRoots();decorateAll();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.addEventListener('load',init,{once:true});
  window.addEventListener('pageshow',decorateAll);
  document.addEventListener('clinical-assistant:references-rendered',queue);
})();
