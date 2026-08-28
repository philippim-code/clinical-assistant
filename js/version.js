/* Miracle-Ear Clinical Assistant release metadata */
(function(){
  'use strict';

  const VERSION='1.9.0-dev8';
  const APPEARANCE_STYLESHEETS=[
    'css/appearance-overhaul.css?v='+encodeURIComponent(VERSION),
    'css/appearance-overhaul-dev2.css?v='+encodeURIComponent(VERSION),
    'css/appearance-overhaul-dev3.css?v='+encodeURIComponent(VERSION),
    'css/appearance-overhaul-dev4.css?v='+encodeURIComponent(VERSION),
    'css/appearance-overhaul-dev5.css?v='+encodeURIComponent(VERSION),
    'css/appearance-overhaul-dev6.css?v='+encodeURIComponent(VERSION),
    'css/appearance-overhaul-dev7.css?v='+encodeURIComponent(VERSION),
    'css/appearance-overhaul-dev8.css?v='+encodeURIComponent(VERSION)
  ];
  const APPEARANCE_SCRIPTS=[
    'js/appearance-overhaul-dev5.js?v='+encodeURIComponent(VERSION),
    'js/appearance-overhaul-dev6.js?v='+encodeURIComponent(VERSION),
    'js/appearance-overhaul-dev8.js?v='+encodeURIComponent(VERSION)
  ];
  const RELEASE_NOTE_TEXT=[
    'Appearance Overhaul development foundation',
    'New premium clinical design system',
    'Redesigned Home dashboard and appointment cards',
    'Deep visual refresh for Sycle Notes, Saved Outcomes, Clinical Tools, References, Settings, and About',
    'Expanded Home command center with Continue Working, Quick Tools, and Clinical Reference',
    'Unified non-interactive Spark configuration status chips',
    'Flat Saved Outcomes status indicators replacing emoji markers',
    'Theme-aware About important notice',
    'Corrected Spark selection animation targeting',
    'Polished empty states and interaction refinement',
    'Global focus, disabled-state, and action consistency sweep',
    'Theme-aware dark and Sycle styling improvements',
    'Reduced-motion accessibility support',
    'Bug fixes'
  ];
  const RELEASE_NOTES=[
    '<li><strong>Appearance Overhaul development foundation</strong> continues the v1.9 visual refresh while preserving the v1.8 clinical workflows.</li>',
    '<li><strong>New premium clinical design system</strong> applies shared spacing, radius, shadow, typography, surface, status, and motion tokens throughout the app.</li>',
    '<li><strong>Expanded Home command center</strong> adds contextual Continue Working actions, one-tap Quick Tools, direct Spark Reference access, and visibility controls in Appearance & Home.</li>',
    '<li><strong>Deep working-screen refresh</strong> extends the new visual language through Sycle Notes, Saved Outcomes, Clinical Tools, Spark References, Settings, and About.</li>',
    '<li><strong>Unified Spark status treatment</strong> presents both Incomplete and Configured as flat, non-interactive status chips rather than button-like controls.</li>',
    '<li><strong>Saved Outcomes status cleanup</strong> replaces yellow and green emoji markers with restrained flat status dots and consistent typography.</li>',
    '<li><strong>Theme correction</strong> updates the About Data & Privacy important notice so it remains readable and appropriately subdued in light and dark appearances.</li>',
    '<li><strong>Targeted Spark selection feedback</strong> animates only the newly selected option rather than the option being replaced.</li>',
    '<li><strong>Layout and empty-state polish</strong> aligns About card rows, restores Settings spacing, and adds intentional empty states for key areas.</li>',
    '<li><strong>Consistency sweep</strong> unifies focus treatment, disabled controls, compact action sizing, and touch behavior.</li>',
    '<li><strong>Theme-aware styling improvements</strong> further unify Clinical Teal, Sycle, and dark appearances.</li>',
    '<li><strong>Reduced-motion accessibility support</strong> respects the device motion preference.</li>',
    '<li><strong>Bug fixes</strong></li>'
  ];

  document.documentElement.classList.add('appearance-overhaul');
  APPEARANCE_STYLESHEETS.forEach((href,index)=>{
    const ids=['appearanceOverhaulStyles','appearanceOverhaulDev2Styles','appearanceOverhaulDev3Styles','appearanceOverhaulDev4Styles','appearanceOverhaulDev5Styles','appearanceOverhaulDev6Styles','appearanceOverhaulDev7Styles','appearanceOverhaulDev8Styles'];
    const id=ids[index]||('appearanceOverhaulStyles'+index);
    if(document.getElementById(id))return;
    const link=document.createElement('link');
    link.id=id;
    link.rel='stylesheet';
    link.href=href;
    document.head.appendChild(link);
  });
  APPEARANCE_SCRIPTS.forEach((src,index)=>{
    const ids=['appearanceOverhaulScript5','appearanceOverhaulScript6','appearanceOverhaulScript8'];
    const id=ids[index]||('appearanceOverhaulScript'+(index+5));
    if(document.getElementById(id))return;
    const script=document.createElement('script');
    script.id=id;
    script.src=src;
    script.async=false;
    document.head.appendChild(script);
  });

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
