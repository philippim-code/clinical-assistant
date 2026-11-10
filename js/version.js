/* Miracle-Ear Clinical Assistant release metadata */
(function(){
  'use strict';

  const VERSION='1.10.0';

  const APPEARANCE_STYLESHEETS=[
    'css/appearance-overhaul.css?v='+encodeURIComponent(VERSION),
    'css/appearance-overhaul-dev2.css?v='+encodeURIComponent(VERSION),
    'css/appearance-overhaul-dev3.css?v='+encodeURIComponent(VERSION),
    'css/appearance-overhaul-dev4.css?v='+encodeURIComponent(VERSION),
    'css/appearance-overhaul-dev5.css?v='+encodeURIComponent(VERSION),
    'css/appearance-overhaul-dev6.css?v='+encodeURIComponent(VERSION),
    'css/appearance-overhaul-dev7.css?v='+encodeURIComponent(VERSION),
    'css/appearance-overhaul-dev8.css?v='+encodeURIComponent(VERSION),
    'css/appearance-overhaul-dev9.css?v='+encodeURIComponent(VERSION),
    'css/appearance-overhaul-dev10.css?v='+encodeURIComponent(VERSION),
    'css/appearance-overhaul-dev11.css?v='+encodeURIComponent(VERSION),
    'css/appearance-overhaul-dev12.css?v='+encodeURIComponent(VERSION),
    'css/appearance-overhaul-dev13.css?v='+encodeURIComponent(VERSION),
    'css/appearance-overhaul-dev20.css?v='+encodeURIComponent(VERSION),
    'css/appearance-overhaul-dev21.css?v='+encodeURIComponent(VERSION),
    'css/appearance-overhaul-dev22.css?v='+encodeURIComponent(VERSION),
    'css/appearance-overhaul-dev23.css?v='+encodeURIComponent(VERSION),
    'css/appearance-overhaul-dev24.css?v='+encodeURIComponent(VERSION),
    'css/appearance-overhaul-dev25.css?v='+encodeURIComponent(VERSION),
    'css/appearance-overhaul-dev26.css?v='+encodeURIComponent(VERSION),
    'css/appearance-overhaul-dev27.css?v='+encodeURIComponent(VERSION),
    'css/appearance-overhaul-dev28.css?v='+encodeURIComponent(VERSION),
    'css/appearance-overhaul-dev46.css?v='+encodeURIComponent(VERSION),
    'css/appearance-overhaul-dev47.css?v='+encodeURIComponent(VERSION),
    'css/appearance-overhaul-dev48.css?v='+encodeURIComponent(VERSION),
    'css/appearance-overhaul-dev50.css?v='+encodeURIComponent(VERSION),
    'css/appearance-overhaul-dev51.css?v='+encodeURIComponent(VERSION)
  ];

  const APPEARANCE_SCRIPTS=[
    'js/appearance-overhaul-dev5.js?v='+encodeURIComponent(VERSION),
    'js/appearance-overhaul-dev6.js?v='+encodeURIComponent(VERSION),
    'js/appearance-overhaul-dev8.js?v='+encodeURIComponent(VERSION),
    'js/appearance-overhaul-dev9.js?v='+encodeURIComponent(VERSION),
    'js/appearance-overhaul-dev11.js?v='+encodeURIComponent(VERSION),
    'js/appearance-overhaul-dev13.js?v='+encodeURIComponent(VERSION),
    'js/appearance-overhaul-dev20.js?v='+encodeURIComponent(VERSION),
    'js/appearance-overhaul-dev21.js?v='+encodeURIComponent(VERSION),
    'js/appearance-overhaul-dev22.js?v='+encodeURIComponent(VERSION),
    'js/appearance-overhaul-dev48.js?v='+encodeURIComponent(VERSION),
    'js/appearance-overhaul-dev50.js?v='+encodeURIComponent(VERSION)
  ];

  const RELEASE_NOTE_TEXT=[
    'Complete Genius hearing-aid reference and configuration builder',
    'Separate binaural receiver and coupling controls in Spark and Genius',
    'Printable Equipment Card after saving a configuration',
    'Editable two-column Insurance Guide in References',
    'Office numbers managed inside Office Profiles',
    'Distinct outcome statuses and a back-to-top shortcut',
    'Expandable Programming Changes field',
    'Annual retest stable/progression options',
    'Automatic settings saving',
    'Bug fixes'
  ];

  const RELEASE_NOTES=[
    '<li><strong>Genius Reference</strong> includes product features, colors, receivers, couplings, concha locks, accessories, and saved configurations.</li>',
    '<li><strong>Binaural fit</strong> has separate receiver and coupling controls in Spark and Genius, with colored selected states.</li>',
    '<li><strong>Equipment Card</strong> opens after saving a configuration and creates a printable patient sheet with the patient name and today\'s date.</li>',
    '<li><strong>Insurance Guide</strong> shows companies and vendors in separate columns, with editable entries saved on this device.</li>',
    '<li><strong>Office Profiles</strong> stores an office number alongside each office.</li>',
    '<li><strong>Saved Outcomes</strong> uses distinct pending/completed backgrounds and includes a back-to-top shortcut.</li>',
    '<li><strong>Programming Changes</strong> uses a taller text area that can expand for longer adjustments.</li>',
    '<li><strong>Annual Retest</strong> supports stable hearing or significant progression.</li>',
    '<li><strong>Settings</strong> saves preferences, Home options, financing companies, and programming presets automatically.</li>',
    '<li><strong>Bug fixes</strong></li>'
  ];

  document.documentElement.classList.add('appearance-overhaul');

  APPEARANCE_STYLESHEETS.forEach((href,index)=>{
    const ids=[
      'appearanceOverhaulStyles','appearanceOverhaulDev2Styles','appearanceOverhaulDev3Styles','appearanceOverhaulDev4Styles',
      'appearanceOverhaulDev5Styles','appearanceOverhaulDev6Styles','appearanceOverhaulDev7Styles','appearanceOverhaulDev8Styles',
      'appearanceOverhaulDev9Styles','appearanceOverhaulDev10Styles','appearanceOverhaulDev11Styles','appearanceOverhaulDev12Styles',
      'appearanceOverhaulDev13Styles','appearanceOverhaulDev20Styles','appearanceOverhaulDev21Styles','appearanceOverhaulDev22Styles',
      'appearanceOverhaulDev23Styles','appearanceOverhaulDev24Styles','appearanceOverhaulDev25Styles','appearanceOverhaulDev26Styles',
      'appearanceOverhaulDev27Styles','appearanceOverhaulDev28Styles','appearanceOverhaulDev46Styles','appearanceOverhaulDev47Styles',
      'appearanceOverhaulDev48Styles','appearanceOverhaulDev50Styles','appearanceOverhaulDev51Styles'
    ];
    const id=ids[index]||('appearanceOverhaulStyles'+index);
    if(document.getElementById(id))return;
    const link=document.createElement('link');
    link.id=id;
    link.rel='stylesheet';
    link.href=href;
    document.head.appendChild(link);
  });

  APPEARANCE_SCRIPTS.forEach((src,index)=>{
    const ids=[
      'appearanceOverhaulScript5','appearanceOverhaulScript6','appearanceOverhaulScript8','appearanceOverhaulScript9',
      'appearanceOverhaulScript11','appearanceOverhaulScript13','appearanceOverhaulScript20','appearanceOverhaulScript21',
      'appearanceOverhaulScript22','appearanceOverhaulScript48','appearanceOverhaulScript50'
    ];
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
    const dateBadge=document.querySelector('#aboutWhatsNew .about-section-head > .badge');
    if(dateBadge&&dateBadge.textContent!=='November 10, 2026')dateBadge.textContent='November 10, 2026';
    const list=document.querySelector('#aboutWhatsNew .changelog-list');
    const notesMarkup=RELEASE_NOTES.join('');
    if(list&&list.innerHTML!==notesMarkup)list.innerHTML=notesMarkup;
    const cards=document.querySelectorAll('#dashboardCards .dashboard-card');
    const versionCard=[...cards].find(card=>card.querySelector('.label')?.textContent.trim()==='Current Version');
    const number=versionCard?.querySelector('.number');
    if(number&&number.textContent!==VERSION)number.textContent=VERSION;
  };
})();


