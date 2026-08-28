/* Miracle-Ear Clinical Assistant release metadata */
(function(){
  'use strict';

  const VERSION='1.8.0';
  const RELEASE_NOTE_TEXT=[
    'Complete Spark configuration reference and documentation workflow',
    'Independent left and right receiver and coupling selections',
    'Saved Spark configurations in Sycle purchase notes',
    'Collapsible Clinical Tools and Settings panels',
    'Flexible COU scoring',
    'Bug fixes'
  ];
  const RELEASE_NOTES=[
    '<li><strong>Complete Spark configuration reference and documentation workflow</strong> makes the Spark reference useful for both product selection and concise clinical documentation.</li>',
    '<li><strong>Independent left and right receiver and coupling selections</strong> support monaural and binaural configurations with optional retention locks.</li>',
    '<li><strong>Saved Spark configurations in Sycle purchase notes</strong> connect the reference workflow directly to purchase documentation.</li>',
    '<li><strong>Collapsible Clinical Tools and Settings panels</strong> keep optional tools and customization controls closed until needed.</li>',
    '<li><strong>Flexible COU scoring</strong> supports documentation when at least one score is entered.</li>',
    '<li><strong>Bug fixes</strong></li>'
  ];

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
