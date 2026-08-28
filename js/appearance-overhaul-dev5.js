/* Miracle-Ear Clinical Assistant — v1.9.0-dev5
   Presentation-only status normalization for the Appearance Overhaul.
*/
(function(){
  'use strict';

  function summaryMarkup(pending,completed,filtered){
    return `<div class="oa-status-line">
      <span class="oa-status-item"><span class="oa-status-dot pending" aria-hidden="true"></span><span>Pending: <strong>${pending}</strong></span></span>
      <span class="oa-status-separator" aria-hidden="true"></span>
      <span class="oa-status-item"><span class="oa-status-dot completed" aria-hidden="true"></span><span>Completed: <strong>${completed}</strong></span></span>
      ${filtered===null?'':`<span class="oa-status-separator" aria-hidden="true"></span><span class="oa-status-filtered">Filtered results: <strong>${filtered}</strong></span>`}
    </div>`;
  }

  function normalizeOutcomeSummary(){
    const summary=document.getElementById('outcomeSummary');
    if(!summary)return;
    const text=summary.textContent||'';
    const pending=text.match(/Pending\s*:?\s*(\d+)/i);
    const completed=text.match(/Completed\s*:?\s*(\d+)/i);
    if(!pending||!completed)return;
    const filteredMatch=text.match(/Filtered results\s*:?\s*(\d+)/i);
    const expected=summaryMarkup(pending[1],completed[1],filteredMatch?filteredMatch[1]:null);
    if(summary.innerHTML.trim()!==expected.trim())summary.innerHTML=expected;
  }

  function normalizeOutcomeHeadings(){
    const list=document.getElementById('outcomeList');
    if(!list)return;
    [...list.children].forEach(node=>{
      if(node.tagName!=='H3')return;
      const text=node.textContent||'';
      const pending=text.match(/Pending\s*\((\d+)\)/i);
      const completed=text.match(/Completed\s*\((\d+)\)/i);
      const match=pending||completed;
      if(!match)return;
      const status=pending?'pending':'completed';
      const label=pending?'Pending':'Completed';
      const expected=`<span class="oa-status-dot ${status}" aria-hidden="true"></span><span>${label} (${match[1]})</span>`;
      node.classList.add('oa-outcome-heading');
      if(node.innerHTML.trim()!==expected.trim())node.innerHTML=expected;
    });
  }

  function normalize(){
    normalizeOutcomeSummary();
    normalizeOutcomeHeadings();
  }

  let queued=false;
  function queueNormalize(){
    if(queued)return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;normalize();});
  }

  function installObserver(){
    const outcomes=document.getElementById('outcomes');
    if(!outcomes||outcomes.dataset.oaStatusObserver==='1')return;
    outcomes.dataset.oaStatusObserver='1';
    const observer=new MutationObserver(queueNormalize);
    observer.observe(outcomes,{childList:true,subtree:true,characterData:true});
    normalize();
  }

  function init(){installObserver();normalize();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.addEventListener('load',init,{once:true});
  window.addEventListener('pageshow',normalize);
})();
