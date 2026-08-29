/* Miracle-Ear Clinical Assistant — v1.9.0-dev14
   Emoji-inspired, polished colored pictogram navigation icons.
*/
(function(){
  'use strict';

  const pictograms={
    'Home':`<svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3.6 10.4 12 3.8l8.4 6.6v9.1H3.6z" fill="#F3D59A"/>
      <path d="M2.9 10.5 12 3.2l9.1 7.3-1.5 1.7L12 6.1l-7.6 6.1z" fill="#D86B5F"/>
      <rect x="9.3" y="13.2" width="5.4" height="6.3" rx="1" fill="#758A96"/>
      <rect x="5.9" y="11.8" width="2.5" height="2.7" rx=".5" fill="#A8D7E4"/>
      <rect x="15.6" y="11.8" width="2.5" height="2.7" rx=".5" fill="#A8D7E4"/>
      <path class="picto-outline" d="M3.6 10.4 12 3.8l8.4 6.6v9.1H3.6zM9.3 19.5v-6.3h5.4v6.3"/>
    </svg>`,

    'Sycle Notes':`<svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5.2" y="3.6" width="12.3" height="16.7" rx="2" fill="#FFF2B5"/>
      <rect x="8.4" y="2.7" width="5.9" height="2.7" rx="1.1" fill="#6E8795"/>
      <path d="M8.2 9h6.2M8.2 12h5.1M8.2 15h3.8" class="picto-outline"/>
      <path d="m13.6 17.9 4.8-4.8 1.8 1.8-4.8 4.8-2.5.7z" fill="#E7A64B"/>
      <path d="m18.4 13.1 1.8 1.8" stroke="#C86D42" stroke-width="1.2" stroke-linecap="round"/>
      <path class="picto-outline" d="M7.2 3.6h8.3a2 2 0 0 1 2 2v6.9M13.6 20.3H7.2a2 2 0 0 1-2-2V5.6a2 2 0 0 1 2-2"/>
    </svg>`,

    'Saved Outcomes':`<svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 3.8h12.2L20 6.6v13.6H5z" fill="#70A9DB"/>
      <rect x="8" y="3.8" width="7.4" height="5.2" rx=".7" fill="#EAF3FA"/>
      <rect x="8" y="13" width="9" height="4.8" rx="1.2" fill="#F7FBFD"/>
      <circle cx="16.7" cy="16.9" r="4.1" fill="#57A773"/>
      <path d="m14.9 16.9 1.2 1.2 2.3-2.5" stroke="#fff" stroke-width="1.45" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path class="picto-outline" d="M5 3.8h12.2L20 6.6v13.6H5zM8 3.8V9h7.4V3.8"/>
    </svg>`,

    'Clinical Tools':`<svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15.9 5.2c-1.7-2-4.9-1.9-6.6.1-1.4 1.7-1.5 4-.3 5.8.9 1.3 2.1 2 2.5 3.5.3 1.1.1 2.3.7 3.3.7 1.2 2.1 1.7 3.3 1 1-.6 1.4-1.6 1.3-2.8" fill="#E6A071"/>
      <path d="M11.2 8.7c.8-1.2 2.5-1.6 3.7-.7 1 .7 1.3 2.1.7 3.1-.5 1-1.4 1.5-2.1 2.3" fill="none" stroke="#B76F4F" stroke-width="1.35" stroke-linecap="round"/>
      <circle cx="18.4" cy="7.1" r="3.2" fill="#79BDB9"/>
      <path d="M18.4 5.4v3.4M16.7 7.1h3.4" stroke="#fff" stroke-width="1.3" stroke-linecap="round"/>
      <path class="picto-outline" d="M15.9 5.2c-1.7-2-4.9-1.9-6.6.1-1.4 1.7-1.5 4-.3 5.8.9 1.3 2.1 2 2.5 3.5.3 1.1.1 2.3.7 3.3.7 1.2 2.1 1.7 3.3 1 1-.6 1.4-1.6 1.3-2.8"/>
    </svg>`,

    'References':`<svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4.2 5.7A3.2 3.2 0 0 1 7.4 2.5H11v16.8H7.4a3.2 3.2 0 0 0-3.2 2.2z" fill="#76B7A5"/>
      <path d="M19.8 5.7a3.2 3.2 0 0 0-3.2-3.2H13v16.8h3.6a3.2 3.2 0 0 1 3.2 2.2z" fill="#6C93C6"/>
      <path d="M7.2 7h2M7.2 10h2M15 7h2M15 10h2" stroke="#F5FBFB" stroke-width="1.1" stroke-linecap="round"/>
      <path class="picto-outline" d="M4.2 5.7A3.2 3.2 0 0 1 7.4 2.5H11v16.8H7.4a3.2 3.2 0 0 0-3.2 2.2zM19.8 5.7a3.2 3.2 0 0 0-3.2-3.2H13v16.8h3.6a3.2 3.2 0 0 1 3.2 2.2zM12 3v17"/>
    </svg>`,

    'Settings':`<svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9.7 2.9h4.6l.6 2.2c.5.2 1 .5 1.5.9l2.2-.7 2.3 4-1.7 1.5c.1.6.1 1.1 0 1.7l1.7 1.5-2.3 4-2.2-.7c-.5.4-1 .7-1.5.9l-.6 2.2H9.7l-.6-2.2c-.6-.2-1.1-.5-1.5-.9l-2.2.7-2.3-4 1.7-1.5a7 7 0 0 1 0-1.7L3.1 9.3l2.3-4 2.2.7c.4-.4.9-.7 1.5-.9z" fill="#A7B1B7"/>
      <circle cx="12" cy="11.7" r="3.4" fill="#E9EEF0"/>
      <circle cx="12" cy="11.7" r="1.7" fill="#79BDB9"/>
      <path class="picto-outline" d="M9.7 2.9h4.6l.6 2.2c.5.2 1 .5 1.5.9l2.2-.7 2.3 4-1.7 1.5c.1.6.1 1.1 0 1.7l1.7 1.5-2.3 4-2.2-.7c-.5.4-1 .7-1.5.9l-.6 2.2H9.7l-.6-2.2c-.6-.2-1.1-.5-1.5-.9l-2.2.7-2.3-4 1.7-1.5a7 7 0 0 1 0-1.7L3.1 9.3l2.3-4 2.2.7c.4-.4.9-.7 1.5-.9z"/>
    </svg>`,

    'About':`<svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="#7BA8D6"/>
      <circle cx="12" cy="12" r="6.6" fill="#9FC2E4"/>
      <circle cx="12" cy="8.2" r="1.15" fill="#fff"/>
      <rect x="11.15" y="10.5" width="1.7" height="6.1" rx=".8" fill="#fff"/>
      <circle class="picto-outline" cx="12" cy="12" r="9"/>
    </svg>`
  };

  function applyPictograms(){
    document.querySelectorAll('.tabs .tab-btn.oa-icon-tab').forEach(button=>{
      const label=button.querySelector('.oa-nav-label')?.textContent.trim();
      const icon=button.querySelector('.oa-nav-icon');
      if(!label||!icon||!pictograms[label])return;
      icon.innerHTML=pictograms[label];
      icon.dataset.oaPictogram='1';
    });
  }

  function init(){applyPictograms();}

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.addEventListener('load',init,{once:true});
  window.addEventListener('pageshow',init);
})();
