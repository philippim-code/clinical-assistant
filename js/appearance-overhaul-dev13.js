/* Miracle-Ear Clinical Assistant — v1.9.0-dev13
   Unified SVG navigation icons + Home Dashboard sound-field artwork.
*/
(function(){
  'use strict';

  const navItems=[
    {label:'Home',icon:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 10.5 12 3.8l8.5 6.7"/><path d="M5.5 9.2V20h13V9.2"/><path d="M9.5 20v-6h5v6"/></svg>`},
    {label:'Sycle Notes',icon:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5h8l4 4V20.5H6z"/><path d="M14 3.5v4h4"/><path d="M9 12h6"/><path d="M9 15.5h4.5"/><path d="m15.8 18.3 3.4-3.4 1.3 1.3-3.4 3.4-1.8.5z"/></svg>`},
    {label:'Saved Outcomes',icon:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14v16H5z"/><path d="M8 4v5h8V4"/><path d="M8.5 15.2 10.8 17.5 15.8 12.5"/></svg>`},
    {label:'Clinical Tools',icon:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.7 5.2c-1.4-1.7-4.1-1.7-5.6-.1-1.2 1.3-1.4 3.3-.5 4.8.7 1.1 1.8 1.7 2.2 3 .3 1 .1 2.1.5 3 .5 1.1 1.8 1.7 2.9 1.2.9-.4 1.3-1.3 1.3-2.3"/><path d="M11.2 8.3c.8-1.1 2.3-1.4 3.4-.6.9.7 1.2 1.9.7 2.9-.5 1-1.4 1.4-2 2.2"/><path d="M7 18.5h4"/><path d="M9 16.5v4"/></svg>`},
    {label:'References',icon:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 5.5A3.5 3.5 0 0 1 8 2h3v18H8a3.5 3.5 0 0 0-3.5 2z"/><path d="M19.5 5.5A3.5 3.5 0 0 0 16 2h-3v18h3a3.5 3.5 0 0 1 3.5 2z"/></svg>`},
    {label:'Settings',icon:`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1z"/></svg>`},
    {label:'About',icon:`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 10.5v6"/><path d="M12 7.5h.01"/></svg>`}
  ];

  function installNavigationIcons(){
    const buttons=[...document.querySelectorAll('.tabs .tab-btn')];
    navItems.forEach(item=>{
      const button=buttons.find(btn=>btn.textContent.includes(item.label));
      if(!button||button.dataset.oaIconInstalled==='1')return;
      button.dataset.oaIconInstalled='1';
      button.classList.add('oa-icon-tab');
      [...button.childNodes].filter(node=>node.nodeType===Node.TEXT_NODE).forEach(node=>node.remove());
      const icon=document.createElement('span');
      icon.className='oa-nav-icon';
      icon.setAttribute('aria-hidden','true');
      icon.innerHTML=item.icon;
      const label=document.createElement('span');
      label.className='oa-nav-label';
      label.textContent=item.label;
      button.prepend(label);
      button.prepend(icon);
    });
  }

  function installHomeArtwork(){
    const hero=document.getElementById('homeDashboardSection');
    if(!hero||hero.querySelector('.oa-home-sound-art'))return;
    const art=document.createElement('div');
    art.className='oa-home-sound-art';
    art.setAttribute('aria-hidden','true');
    art.innerHTML=`
      <svg viewBox="0 0 520 240" preserveAspectRatio="xMidYMid slice" focusable="false">
        <g class="oa-sound-guide">
          <path d="M85 28v184M160 28v184M235 28v184M310 28v184M385 28v184M460 28v184"/>
          <path d="M38 60h430M38 120h430M38 180h430"/>
        </g>
        <path class="oa-sound-wave-secondary" d="M34 121c30 0 35-28 54-28 22 0 26 55 50 55 28 0 29-94 60-94 33 0 34 132 70 132 31 0 36-87 67-87 28 0 31 43 55 43 24 0 27-21 54-21"/>
        <path class="oa-sound-wave" d="M34 120c27 0 34-42 54-42 23 0 29 78 53 78 30 0 31-119 63-119 35 0 38 165 74 165 33 0 38-108 70-108 29 0 33 55 57 55 22 0 27-29 51-29"/>
        <path class="oa-sound-arc" d="M420 86c18 8 29 19 36 34M429 66c29 12 47 30 57 54M438 47c39 16 64 40 77 73"/>
      </svg>`;
    hero.appendChild(art);
  }

  function init(){
    installNavigationIcons();
    installHomeArtwork();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.addEventListener('load',init,{once:true});
  window.addEventListener('pageshow',init);
})();
