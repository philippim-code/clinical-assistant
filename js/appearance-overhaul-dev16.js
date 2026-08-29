/* Miracle-Ear Clinical Assistant — v1.9.0-dev16
   Final pictogram cleanup and About emoji removal.
*/
(function(){
  'use strict';

  const ICONS={
    hearingAid:`<svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4.1" y="3.2" width="8.2" height="11.7" rx="3.8" fill="#AAB4B9"/>
      <rect x="5.8" y="5.1" width="4.7" height="7.8" rx="2.1" fill="#C6CDD1"/>
      <circle cx="8.2" cy="7.4" r=".9" fill="#6D7B82"/>
      <path d="M12.1 8.6c4.2.1 7.2 3.2 7.1 6.9-.1 2.2-1.3 3.8-3.2 4.4" fill="none" stroke="#68777E" stroke-width="1.55" stroke-linecap="round"/>
      <rect x="13.9" y="18.1" width="5.8" height="2.8" rx="1.35" fill="#69B3AC"/>
      <circle cx="18.7" cy="19.5" r=".55" fill="#D9F0ED"/>
      <rect class="picto-outline" x="4.1" y="3.2" width="8.2" height="11.7" rx="3.8"/>
      <path class="picto-outline" d="M12.1 8.6c4.2.1 7.2 3.2 7.1 6.9-.1 2.2-1.3 3.8-3.2 4.4"/>
    </svg>`,

    rocket:`<svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.7c3.7 1.7 5.8 5.3 5.8 9.5l-3.2 4.1H9.4l-3.2-4.1C6.2 8 8.3 4.4 12 2.7Z" fill="#F7F9FA"/>
      <path d="M12 2.7c1.6.8 2.9 1.9 3.8 3.3H8.2c.9-1.4 2.2-2.5 3.8-3.3Z" fill="#D9655E"/>
      <circle cx="12" cy="9.3" r="2.1" fill="#75A8D5"/>
      <circle cx="12" cy="9.3" r="1" fill="#CDE4F4"/>
      <path d="m8.8 13.6-3.4 1.1-1.8 3.1 4.8-.5M15.2 13.6l3.4 1.1 1.8 3.1-4.8-.5" fill="#D9655E"/>
      <path d="M10.1 16.3h3.8l-.8 4.8-1.1-1.4-1.1 1.4z" fill="#F0A248"/>
      <path d="M11 16.3h2l-1 3.1z" fill="#F5D369"/>
      <path class="picto-outline" d="M12 2.7c3.7 1.7 5.8 5.3 5.8 9.5l-3.2 4.1H9.4l-3.2-4.1C6.2 8 8.3 4.4 12 2.7Z"/>
    </svg>`,

    purpose:`<svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="4.2" width="14" height="16" rx="2.2" fill="#F5E7BF"/>
      <rect x="8.5" y="2.8" width="7" height="3.1" rx="1.2" fill="#84959E"/>
      <circle cx="12" cy="11.2" r="3.4" fill="#78B9B2"/>
      <path d="M12 9.3v3.8M10.1 11.2h3.8" stroke="#fff" stroke-width="1.35" stroke-linecap="round"/>
      <path d="M8 16.4h8" stroke="#C5A76B" stroke-width="1.15" stroke-linecap="round"/>
      <rect class="picto-outline" x="5" y="4.2" width="14" height="16" rx="2.2"/>
    </svg>`,

    features:`<svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.8" y="4" width="6.7" height="6.7" rx="1.7" fill="#75A9D5"/>
      <rect x="13.5" y="4" width="6.7" height="6.7" rx="1.7" fill="#78B8A8"/>
      <rect x="3.8" y="13.3" width="6.7" height="6.7" rx="1.7" fill="#E6B35F"/>
      <rect x="13.5" y="13.3" width="6.7" height="6.7" rx="1.7" fill="#D97970"/>
      <path d="m5.8 7.3 1 1 1.8-2M15.5 7.3l1 1 1.8-2M5.8 16.6l1 1 1.8-2M15.5 16.6l1 1 1.8-2" stroke="#fff" stroke-width="1.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <rect class="picto-outline" x="3.8" y="4" width="6.7" height="6.7" rx="1.7"/>
      <rect class="picto-outline" x="13.5" y="4" width="6.7" height="6.7" rx="1.7"/>
      <rect class="picto-outline" x="3.8" y="13.3" width="6.7" height="6.7" rx="1.7"/>
      <rect class="picto-outline" x="13.5" y="13.3" width="6.7" height="6.7" rx="1.7"/>
    </svg>`,

    keyboard:`<svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2.7" y="5.3" width="18.6" height="13.5" rx="2.4" fill="#A7B2B8"/>
      <rect x="4.5" y="7.3" width="15" height="7.1" rx="1.2" fill="#E9EEF0"/>
      <g fill="#7C8A91"><rect x="5.3" y="8.1" width="1.8" height="1.5" rx=".35"/><rect x="8" y="8.1" width="1.8" height="1.5" rx=".35"/><rect x="10.7" y="8.1" width="1.8" height="1.5" rx=".35"/><rect x="13.4" y="8.1" width="1.8" height="1.5" rx=".35"/><rect x="16.1" y="8.1" width="1.8" height="1.5" rx=".35"/><rect x="5.3" y="10.6" width="1.8" height="1.5" rx=".35"/><rect x="8" y="10.6" width="1.8" height="1.5" rx=".35"/><rect x="10.7" y="10.6" width="1.8" height="1.5" rx=".35"/><rect x="13.4" y="10.6" width="1.8" height="1.5" rx=".35"/><rect x="16.1" y="10.6" width="1.8" height="1.5" rx=".35"/></g>
      <rect x="7.3" y="13" width="9.4" height="1.2" rx=".5" fill="#75B5AE"/>
      <rect class="picto-outline" x="2.7" y="5.3" width="18.6" height="13.5" rx="2.4"/>
    </svg>`,

    portable:`<svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.5" y="7.1" width="17" height="12.5" rx="2.5" fill="#86AFCF"/>
      <path d="M8.6 7.1V5.4c0-.8.6-1.4 1.4-1.4h4c.8 0 1.4.6 1.4 1.4v1.7" fill="none" stroke="#607985" stroke-width="1.35"/>
      <rect x="7.6" y="10" width="8.8" height="6.2" rx="1.1" fill="#EEF5F8"/>
      <rect x="9" y="11.3" width="6" height="3.6" rx=".7" fill="#76B9B1"/>
      <path d="M3.5 12.4h4.1M16.4 12.4h4.1" stroke="#6D8792" stroke-width="1.1"/>
      <rect class="picto-outline" x="3.5" y="7.1" width="17" height="12.5" rx="2.5"/>
    </svg>`,

    mail:`<svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.3" y="5.4" width="17.4" height="13.2" rx="2.2" fill="#F5F7F8"/>
      <path d="m4.5 7 7.5 6 7.5-6" fill="#7BAAD1"/>
      <path d="m4.2 17.2 5.5-5M19.8 17.2l-5.5-5" stroke="#D98A51" stroke-width="1.15" stroke-linecap="round"/>
      <rect class="picto-outline" x="3.3" y="5.4" width="17.4" height="13.2" rx="2.2"/>
    </svg>`
  };

  function applyIcon(el,svg,key){
    if(!el||!svg)return;
    if(el.dataset.oaDev16Icon===key)return;
    el.innerHTML=svg;
    el.classList.add('oa-color-picto');
    el.dataset.oaDev16Icon=key;
  }

  function refreshExistingPictograms(){
    document.querySelectorAll('[data-oa-color-picto="spark"],[data-oa-color-picto="hearingAid"]').forEach(el=>applyIcon(el,ICONS.hearingAid,'hearingAid'));
    document.querySelectorAll('[data-oa-color-picto="whatsnew"]').forEach(el=>applyIcon(el,ICONS.rocket,'rocket'));
  }

  function decorateAboutCards(){
    const about=document.getElementById('about');
    if(!about)return;
    const map=[
      [/^Purpose$/i,'purpose'],
      [/^Core Features$/i,'features'],
      [/^Keyboard Shortcuts$/i,'keyboard'],
      [/^Portable App$/i,'portable']
    ];
    about.querySelectorAll('.about-card').forEach(card=>{
      const title=card.querySelector('h3')?.textContent.trim()||'';
      const match=map.find(([pattern])=>pattern.test(title));
      if(!match)return;
      applyIcon(card.querySelector('.about-icon'),ICONS[match[1]],match[1]);
    });

    about.querySelectorAll('.about-section-head').forEach(head=>{
      const title=head.querySelector('h3')?.textContent.trim()||'';
      if(/^What's New/i.test(title))applyIcon(head.querySelector('.about-icon'),ICONS.rocket,'rocket');
    });

    const contact=[...about.querySelectorAll('.about-hero-actions button')].find(btn=>/Contact Developer/i.test(btn.textContent||''));
    if(contact&&contact.dataset.oaDev16Mail!=='1'){
      contact.dataset.oaDev16Mail='1';
      contact.innerHTML=`<span class="oa-button-picto" aria-hidden="true">${ICONS.mail}</span><span>Contact Developer</span>`;
    }
  }

  function stripLegacyReferenceEmoji(){
    const root=document.getElementById('references');
    if(!root)return;
    root.querySelectorAll('.ref-accordion > summary').forEach(summary=>{
      if(!/Hearing Aids/i.test(summary.textContent||''))return;
      const icon=summary.querySelector('[data-oa-color-picto="hearingAid"],.oa-reference-title-picto');
      if(icon)applyIcon(icon,ICONS.hearingAid,'hearingAid');
    });
  }

  function decorate(){
    refreshExistingPictograms();
    decorateAboutCards();
    stripLegacyReferenceEmoji();
  }

  let queued=false;
  function queue(){
    if(queued)return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;decorate();});
  }

  function init(){
    decorate();
    ['home','about','references','settings','tools'].forEach(id=>{
      const root=document.getElementById(id);
      if(!root||root.dataset.oaDev16Observer==='1')return;
      root.dataset.oaDev16Observer='1';
      new MutationObserver(queue).observe(root,{childList:true,subtree:true});
    });
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.addEventListener('load',decorate,{once:true});
  window.addEventListener('pageshow',decorate);
})();
