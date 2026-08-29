/* Miracle-Ear Clinical Assistant — v1.9.0-dev20
   Restore native emoji iconography while preserving the v1.9 visual system.
*/
(function(){
  'use strict';

  const NAV_EMOJI={
    'Home':'🏠',
    'Sycle Notes':'📝',
    'Saved Outcomes':'💾',
    'Clinical Tools':'🦻',
    'References':'📚',
    'Settings':'⚙️',
    'About':'ℹ️'
  };

  function setEmoji(el,emoji,key){
    if(!el||!emoji)return;
    if(el.dataset.oaDev20Emoji===key&&el.textContent===emoji)return;
    el.innerHTML=`<span class="oa-native-emoji" aria-hidden="true">${emoji}</span>`;
    el.dataset.oaDev20Emoji=key;
    el.classList.add('oa-emoji-restored');
    el.classList.remove('oa-color-picto','oa-hearing-aid-emoji');
  }

  function restoreNavigation(){
    document.querySelectorAll('.tabs .tab-btn.oa-icon-tab').forEach(button=>{
      const label=button.querySelector('.oa-nav-label')?.textContent.trim();
      const icon=button.querySelector('.oa-nav-icon');
      if(label&&NAV_EMOJI[label])setEmoji(icon,NAV_EMOJI[label],'nav-'+label);
    });
  }

  function restoreHome(){
    const home=document.getElementById('home');
    if(!home)return;

    const homeMap=[
      ['[data-home-tool="pta"]','📊','home-pta'],
      ['[data-home-tool="referrals"]','🏥','home-referrals'],
      ['[data-home-tool="terminology"]','📖','home-terminology'],
      ['#homeSparkReferenceCard','🦻','home-spark'],
      ['[data-home-continue="draft"]','📝','home-draft'],
      ['[data-home-continue="outcomes"]','💾','home-outcomes']
    ];
    homeMap.forEach(([selector,emoji,key])=>{
      home.querySelectorAll(selector).forEach(card=>setEmoji(card.querySelector('.home-command-icon'),emoji,key));
    });

    home.querySelectorAll('.oa-empty-state').forEach(state=>{
      const type=state.dataset.oaEmpty;
      const emoji=type==='activity'?'🕒':type==='saved'?'💾':type==='referral'?'📍':'📋';
      setEmoji(state.querySelector('.oa-empty-state-icon'),emoji,'empty-'+type);
    });
  }

  function restoreClinicalTools(){
    const tools=document.getElementById('tools');
    if(!tools)return;
    tools.querySelectorAll('.tool-launch-card').forEach(card=>{
      const text=(card.textContent||'').toLowerCase();
      const emoji=text.includes('medical referral')?'🏥':text.includes('terminology')?'📖':text.includes('pta')?'📊':'🧰';
      setEmoji(card.querySelector('.tool-launch-icon'),emoji,'tool-'+emoji);
    });
  }

  function decorateSettings(){
    const settings=document.getElementById('settings');
    if(!settings)return;
    settings.querySelectorAll('.settings-group').forEach(group=>{
      const heading=group.querySelector('h4');
      if(!heading)return;
      const title=heading.textContent.replace(/^[^A-Za-z0-9]+/,'').trim();
      let emoji='⚙️';
      if(/appearance/i.test(title))emoji='🎨';
      else if(/home dashboard/i.test(title))emoji='🏠';
      else if(/financing/i.test(title))emoji='💳';
      else if(/programming/i.test(title))emoji='🎛️';
      else if(/office profile/i.test(title))emoji='🏢';

      let icon=heading.querySelector('.oa-settings-emoji');
      if(!icon){
        const text=heading.textContent.trim();
        heading.textContent='';
        icon=document.createElement('span');
        icon.className='oa-settings-emoji';
        icon.setAttribute('aria-hidden','true');
        const label=document.createElement('span');
        label.className='oa-settings-heading-label';
        label.textContent=text;
        heading.append(icon,label);
      }
      icon.textContent=emoji;
    });
  }

  function restoreAbout(){
    const about=document.getElementById('about');
    if(!about)return;
    const map=[
      [/^Purpose$/i,'🩺'],
      [/^Core Features$/i,'✨'],
      [/^Keyboard Shortcuts$/i,'⌨️'],
      [/^Portable App$/i,'🧰']
    ];
    about.querySelectorAll('.about-card').forEach(card=>{
      const title=card.querySelector('h3')?.textContent.trim()||'';
      const match=map.find(([pattern])=>pattern.test(title));
      if(match)setEmoji(card.querySelector('.about-icon'),match[1],'about-'+title);
    });
    about.querySelectorAll('.about-section-head').forEach(head=>{
      const title=head.querySelector('h3')?.textContent.trim()||'';
      if(/data\s*&\s*privacy/i.test(title))setEmoji(head.querySelector('.about-icon'),'🔒','about-privacy');
      if(/^what'?s new/i.test(title))setEmoji(head.querySelector('.about-icon'),'🚀','about-whatsnew');
    });
  }

  function restoreReferences(){
    const root=document.getElementById('references');
    if(!root)return;

    root.querySelectorAll('.ref-image-icon').forEach(icon=>{
      icon.innerHTML='<span class="oa-native-emoji" aria-hidden="true">🦻</span>';
      icon.classList.add('oa-emoji-restored');
      icon.classList.remove('oa-color-picto','oa-hearing-aid-emoji');
    });

    root.querySelectorAll('.ref-accordion > summary').forEach(summary=>{
      if(!/Hearing Aids/i.test(summary.textContent||''))return;
      const left=summary.querySelector('.oa-reference-summary-left');
      if(left){
        const icon=left.querySelector('.oa-reference-title-picto');
        if(icon)setEmoji(icon,'🦻','reference-hearing-aids');
      }else if(!/^\s*🦻/.test(summary.textContent||'')){
        const label=(summary.textContent||'Hearing Aids').replace(/^\s*[^A-Za-z]+/,'').trim()||'Hearing Aids';
        summary.textContent='🦻 '+label;
      }
    });
  }

  function restoreEmptyStates(){
    document.querySelectorAll('.oa-empty-state').forEach(state=>{
      const type=state.dataset.oaEmpty;
      const emoji=type==='activity'?'🕒':type==='saved'?'💾':type==='referral'?'📍':'📋';
      setEmoji(state.querySelector('.oa-empty-state-icon'),emoji,'empty-'+type);
    });
  }

  function restoreOfficeChip(){
    document.querySelectorAll('.oa-office-mobile-chip').forEach(chip=>{
      const text=(chip.textContent||'').replace(/^\s*[⌖📍]\s*/,'').trim();
      if(text)chip.textContent='📍 '+text;
    });
  }

  function restoreAll(){
    restoreNavigation();
    restoreHome();
    restoreClinicalTools();
    decorateSettings();
    restoreAbout();
    restoreReferences();
    restoreEmptyStates();
    restoreOfficeChip();
  }

  let queued=false;
  function queue(){
    if(queued)return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;restoreAll();});
  }

  function init(){
    restoreAll();
    ['home','tools','settings','about','references','outcomes'].forEach(id=>{
      const root=document.getElementById(id);
      if(!root||root.dataset.oaDev20Observer==='1')return;
      root.dataset.oaDev20Observer='1';
      new MutationObserver(queue).observe(root,{childList:true,subtree:true});
    });
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.addEventListener('load',restoreAll,{once:true});
  window.addEventListener('pageshow',restoreAll);
})();
