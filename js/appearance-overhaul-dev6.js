/* Miracle-Ear Clinical Assistant — v1.9.0-dev6
   Presentation-only empty-state refinement.
*/
(function(){
  'use strict';

  const icons={
    activity:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7v5l3 2"/><circle cx="12" cy="12" r="8"/><path d="M5.5 5.5 4 4"/></svg>',
    saved:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h10l2 2v14H6z"/><path d="M9 4v6h6V4M9 15h6"/></svg>',
    referral:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z"/><circle cx="12" cy="10" r="2"/></svg>'
  };

  function emptyMarkup(type,title,detail,compact=false){
    return `<div class="oa-empty-state${compact?' compact':''}" data-oa-empty="${type}">
      <div class="oa-empty-state-icon">${icons[type]||icons.saved}</div>
      <div class="oa-empty-state-copy"><strong>${title}</strong><span>${detail}</span></div>
    </div>`;
  }

  function decorateRecentActivity(){
    const root=document.getElementById('homeRecent');
    if(!root||root.querySelector('.outcome-card')||root.querySelector('[data-oa-empty="activity"]'))return;
    if(/No saved activity yet/i.test(root.textContent||'')){
      root.innerHTML=emptyMarkup('activity','No recent activity','Saved appointments and completed work will appear here.',true);
    }
  }

  function decorateSavedOutcomes(){
    const root=document.getElementById('outcomeList');
    if(!root||root.querySelector('.outcome-card')||root.querySelector('[data-oa-empty="saved"]'))return;
    if(!/No saved outcomes found/i.test(root.textContent||''))return;
    const searching=Boolean(document.getElementById('outcomeSearch')?.value?.trim());
    root.innerHTML=searching
      ? emptyMarkup('saved','No matching outcomes','Try a different patient label, appointment type, reminder, or note.',true)
      : emptyMarkup('saved','No saved outcomes yet','Appointments you save will collect here for follow-up and review.',true);
  }

  function decorateReferrals(){
    const root=document.getElementById('referralList');
    if(!root||root.querySelector('.referral-card')||root.querySelector('[data-oa-empty="referral"]'))return;
    const empty=root.querySelector('.referral-empty');
    if(!empty)return;
    const searching=Boolean(document.getElementById('referralSearch')?.value?.trim());
    root.innerHTML=searching
      ? emptyMarkup('referral','No matching referrals','Try a different provider, specialty, address, or note.',true)
      : emptyMarkup('referral','No referrals saved yet','Add a referral office to build your reusable local directory.',true);
  }

  function decorate(){
    decorateRecentActivity();
    decorateSavedOutcomes();
    decorateReferrals();
  }

  let queued=false;
  function queueDecorate(){
    if(queued)return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;decorate();});
  }

  function observe(id){
    const root=document.getElementById(id);
    if(!root||root.dataset.oaEmptyObserver==='1')return;
    root.dataset.oaEmptyObserver='1';
    new MutationObserver(queueDecorate).observe(root,{childList:true,subtree:true,characterData:true});
  }

  function init(){
    ['homeRecent','outcomeList','referralList'].forEach(observe);
    decorate();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.addEventListener('load',init,{once:true});
  window.addEventListener('pageshow',decorate);
})();
