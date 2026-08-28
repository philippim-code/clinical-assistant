/* Miracle-Ear Clinical Assistant release metadata */
(function(){
  'use strict';

  const VERSION='1.8.0-dev21';
  const RELEASE_NOTES=[
    '<li><strong>Added independent Left and Right coupling builders</strong> for unilateral fittings or different bilateral dome configurations.</li>',
    '<li><strong>Shortened copied configurations for Sycle notes</strong> with color abbreviations and AS, AD, and AU notation.</li>',
    '<li><strong>Simplified coupling labels</strong> to compact formats such as S Vented and M Power.</li>',
    '<li><strong>Completed the Spark configuration workflow</strong> with per-ear receiver and coupling validation.</li>'
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
