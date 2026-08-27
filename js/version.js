/* Miracle-Ear Clinical Assistant release metadata */
(function(){
  'use strict';

  const VERSION='1.8.0-dev15';
  const RELEASE_NOTES=[
    '<li><strong>Simplified the Spark comparison panel</strong> by removing the redundant availability legend.</li>',
    '<li><strong>Organized features in cumulative treatment order</strong> so included features always appear first.</li>',
    '<li><strong>Kept every feature in a fixed position</strong> while higher levels turn additional features on.</li>',
    '<li><strong>Consolidated AutoSense OS</strong> into one feature while retaining each level designation in the solution badge.</li>'
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
