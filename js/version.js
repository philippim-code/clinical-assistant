/* Miracle-Ear Clinical Assistant release metadata */
(function(){
  'use strict';

  const VERSION='1.8.0-dev14';
  const RELEASE_NOTES=[
    '<li><strong>Combined Spark treatment levels and features</strong> into one comparison panel.</li>',
    '<li><strong>Kept the complete feature list visible</strong> while switching between treatment levels.</li>',
    '<li><strong>Added clear availability states</strong> with teal checks for included features and muted empty indicators for unavailable features.</li>',
    '<li><strong>Preserved the complete dev13 repair</strong>, including all tabs, Saved Outcomes, and responsive Spark loading.</li>'
  ];

  window.CLINICAL_ASSISTANT_VERSION=VERSION;
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
