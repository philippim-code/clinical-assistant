/* Miracle-Ear Clinical Assistant release metadata */
(function(){
  'use strict';

  const VERSION='1.9.0-dev1';
  const APPEARANCE_STYLESHEET='css/appearance-overhaul.css?v='+encodeURIComponent(VERSION);
  const RELEASE_NOTE_TEXT=[
    'Appearance Overhaul development foundation',
    'New premium clinical design system',
    'Redesigned Home dashboard and appointment cards',
    'Refined navigation, typography, spacing, surfaces, and controls',
    'Improved desktop and mobile visual hierarchy',
    'Reduced-motion accessibility support'
  ];
  const RELEASE_NOTES=[
    '<li><strong>Appearance Overhaul development foundation</strong> begins the v1.9 visual refresh while preserving the v1.8 clinical workflows.</li>',
    '<li><strong>New premium clinical design system</strong> introduces shared spacing, radius, shadow, typography, surface, status, and motion tokens.</li>',
    '<li><strong>Redesigned Home dashboard and appointment cards</strong> create a cleaner command-center experience without changing appointment logic.</li>',
    '<li><strong>Refined navigation, typography, spacing, surfaces, and controls</strong> establish a consistent visual language across the app.</li>',
    '<li><strong>Improved desktop and mobile visual hierarchy</strong> makes the interface feel more intentional on both workstations and the PWA.</li>',
    '<li><strong>Reduced-motion accessibility support</strong> respects the device motion preference.</li>'
  ];

  document.documentElement.classList.add('appearance-overhaul');
  if(!document.getElementById('appearanceOverhaulStyles')){
    const link=document.createElement('link');
    link.id='appearanceOverhaulStyles';
    link.rel='stylesheet';
    link.href=APPEARANCE_STYLESHEET;
    document.head.appendChild(link);
  }

  window.CLINICAL_ASSISTANT_VERSION=VERSION;
  window.CLINICAL_ASSISTANT_RELEASE_NOTE_TEXT=RELEASE_NOTE_TEXT.slice();
  window.CLINICAL_ASSISTANT_RELEASE_NOTES=RELEASE_NOTES.slice();
  window.applyClinicalAssistantVersion=function(){
    document.querySelectorAll('[data-app-version]').forEach(el=>{
      if(el.textContent!==VERSION)el.textContent=VERSION;
    });
    const aboutVersion=document.getElementById('aboutVersion');
    if(aboutVersion&&aboutVersion.textContent!==VERSION)aboutVersion.textContent=VERSION;
    const heading=document.querySelector('#aboutWhatsNew h3');
    const headingText="What's New in v"+VERSION;
    if(heading&&heading.textContent!==headingText)heading.textContent=headingText;
    const list=document.querySelector('#aboutWhatsNew .changelog-list');
    const notesMarkup=RELEASE_NOTES.join('');
    if(list&&list.innerHTML!==notesMarkup)list.innerHTML=notesMarkup;
    const cards=document.querySelectorAll('#dashboardCards .dashboard-card');
    const versionCard=[...cards].find(card=>card.querySelector('.label')?.textContent.trim()==='Current Version');
    const number=versionCard?.querySelector('.number');
    if(number&&number.textContent!==VERSION)number.textContent=VERSION;
  };
})();
