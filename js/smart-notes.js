/* =========================================================
   Miracle-Ear Clinical Assistant v1.7.0-dev1
   Smart Note Generation layer

   Safety rule: this layer only reorganizes and rewrites facts already
   produced by the existing structured workflow. It does not infer or add
   unselected clinical findings, testing, services, counseling, or outcomes.
   ========================================================= */
(function(){
  'use strict';

  const SMART_NOTE_VERSION='1.7.0-dev1';

  function cleanText(value){return String(value||'').replace(/\s+/g,' ').trim();}
  function keyText(value){return cleanText(value).toLowerCase();}
  function ensureSentence(value){
    let text=cleanText(value);
    if(!text)return'';
    text=fixAcronyms(text);
    text=text.charAt(0).toUpperCase()+text.slice(1);
    if(!/[.!?]$/.test(text))text+='.';
    return text;
  }
  function lowerSentenceFragment(value){
    const text=fixAcronyms(cleanText(value));
    if(!text)return'';
    const protectedStart=/^(AU|AD|AS|AC|BC|SRT|WR|UCL|MCL|PTA|COU|NOAH|FDA|HFD|RIC|BTE|ITE|ITC|CIC|CROS|BiCROS|MEPO|MEPO2|AVG)\b/;
    return protectedStart.test(text)?text:text.charAt(0).toLowerCase()+text.slice(1);
  }
  function unique(items){
    const seen=new Set();
    return items.filter(item=>{const k=keyText(item);if(!k||seen.has(k))return false;seen.add(k);return true;});
  }

  function concernPrefix(){
    if(currentAppointment==='hae')return'hae';
    if(currentAppointment==='aftercare')return'ac';
    if(currentAppointment==='retest'||currentAppointment==='retestUnder'||currentAppointment==='retestOver')return'rt';
    return'';
  }
  function concernSentence(){
    const prefix=concernPrefix();
    if(!prefix||!checked('sec_'+prefix+'Concern'))return'';
    const raw=cleanText(val(prefix+'ConcernText'));
    if(!raw)return'';
    const alreadyAttributed=/^(patient|pt\.?|wife|husband|spouse|daughter|son|family|caregiver|parent|mother|father|reports?\b|states?\b|denies?\b|concerned\b)/i.test(raw);
    return ensureSentence(alreadyAttributed?raw:'Patient reports '+lowerSentenceFragment(raw));
  }

  function isHearingFinding(text){
    const k=keyText(text);
    return k.includes('hearing loss')||k.startsWith('normal hearing')||k==='no hearing loss identified';
  }
  function categoryFor(text){
    const k=keyText(text);
    if(!k)return'other';
    if(k==='patient satisfied')return'satisfied';
    if(k.startsWith('otoscopy')||k.startsWith('patient denies all fda')||k.startsWith('tested ac + bc')||isHearingFinding(text)||k.startsWith('med referral')||k.startsWith('med referred')||k.startsWith('medical referral'))return'evaluation';
    if(k.startsWith('cleaned both hearing aids')||k.includes('vacuumed microphones')||k.includes('listening check performed')||k.includes('dry chamber')||k.startsWith('replaced ')||k==='replaced items'||k.startsWith('connected to computer'))return'service';
    if(k.startsWith('demoed new tech')||k.startsWith('cou completed')||k.includes('improvement in clarity and understanding'))return'demonstration';
    if(k.startsWith('delivered new hearing aids')||k.endsWith(' complete')||k.endsWith(' completed')||k.startsWith('first fit')||k.startsWith('fit ')||k.includes(' receivers ')||k.includes(' receiver using '))return'fitting';
    if(k.startsWith('counseled on')||k.startsWith('discussed hearing conservation')||k.startsWith('advised to return')||k.startsWith('cleaning set for')||k.startsWith('put demos in ears while cleaning'))return'counseling';
    if(k.startsWith('hearing aids recommended')||k.startsWith('hearing aids are not recommended')||k.startsWith('test results indicate')||k.startsWith('purchased ')||k.startsWith('traded up to ')||k.startsWith('accepted a 3-day')||k.startsWith('did not purchase')||k.startsWith('did not trade in')||k.startsWith('recommended better treatment')||k.startsWith('went over warranty'))return'treatment';
    if(k.startsWith('financing complete')||k.includes('my essentials'))return'admin';
    return'other';
  }

  function rewriteMedicalReferral(text){
    let out=cleanText(text);
    out=out.replace(/^Med referred due to /i,'Medical referral recommended due to ');
    out=out.replace(/^Med referral recommended/i,'Medical referral recommended');
    return ensureSentence(out);
  }

  function evaluationSentences(parts){
    const remaining=[...parts];
    const out=[];
    const take=(predicate)=>{const index=remaining.findIndex(predicate);return index>=0?remaining.splice(index,1)[0]:'';};

    const oto=take(p=>keyText(p).startsWith('otoscopy'));
    if(oto)out.push(ensureSentence(oto));

    const fda=take(p=>keyText(p).startsWith('patient denies all fda'));
    if(fda)out.push(ensureSentence(fda));

    const testing=take(p=>keyText(p).startsWith('tested ac + bc'));
    const finding=take(p=>isHearingFinding(p));
    if(testing&&finding&&keyText(finding)!=='hearing loss type/laterality not selected'){
      out.push(ensureSentence('AC and BC testing was completed and entered into NOAH, with results documented as '+lowerSentenceFragment(finding)));
    }else{
      if(testing)out.push('AC and BC testing was completed and entered into NOAH.');
      if(finding)out.push(ensureSentence(finding));
    }

    remaining.forEach(part=>{
      const k=keyText(part);
      if(k.startsWith('med referral')||k.startsWith('med referred')||k.startsWith('medical referral'))out.push(rewriteMedicalReferral(part));
      else out.push(ensureSentence(part));
    });
    return out;
  }

  function maintenanceSentence(text){
    const k=keyText(text);
    const actions=[];
    if(k.includes('cleaned both hearing aids'))actions.push('hearing aids cleaned');
    if(k.includes('vacuumed microphones'))actions.push('microphones vacuumed');
    if(k.includes('listening check performed'))actions.push('listening check performed');
    if(k.includes('placed hearing aids in the dry chamber'))actions.push('hearing aids placed in the dry chamber');
    if(!actions.length)return ensureSentence(text);
    return ensureSentence('Maintenance completed: '+formatList(actions));
  }

  function serviceSentences(parts){
    return parts.map(part=>{
      const k=keyText(part);
      if(k.includes('cleaned both hearing aids')||k.includes('vacuumed microphones')||k.includes('listening check performed')||k.includes('dry chamber'))return maintenanceSentence(part);
      if(k.startsWith('connected to computer')){
        let out=cleanText(part)
          .replace(/^Connected to computer/i,'Hearing aids connected to computer')
          .replace(/\bAVG WT\b/g,'average wear time')
          .replace(/\bupdated firmware\b/gi,'firmware updated');
        return ensureSentence(out);
      }
      return ensureSentence(part);
    });
  }

  function demonstrationSentences(parts){
    return parts.map(part=>{
      const k=keyText(part);
      if(k==='demoed new tech')return'New technology was demonstrated.';
      if(k==='significant improvement in clarity and understanding')return'Significant improvement in clarity and understanding was observed.';
      return ensureSentence(part);
    });
  }

  function treatmentSentences(parts){
    return parts.map(part=>{
      const k=keyText(part);
      if(k==='hearing aids recommended as treatment')return'Hearing aids were recommended as treatment.';
      if(k==='recommended better treatment')return'Better treatment was recommended.';
      if(k==='went over warranty / trade-in discussion')return'Warranty and trade-in options were reviewed.';
      if(k.startsWith('purchased '))return ensureSentence('Patient '+lowerSentenceFragment(part));
      if(k.startsWith('traded up to '))return ensureSentence('Patient '+lowerSentenceFragment(part));
      if(k.startsWith('accepted a 3-day'))return ensureSentence('Patient '+lowerSentenceFragment(part));
      if(k.startsWith('did not purchase'))return ensureSentence('Patient '+lowerSentenceFragment(part));
      if(k.startsWith('did not trade in'))return ensureSentence('Patient '+lowerSentenceFragment(part));
      return ensureSentence(part);
    });
  }

  function counselingTopicsFromPart(part){
    const k=keyText(part);
    const topics=[];
    const known=[
      ['insertion and removal','insertion and removal'],
      ['charger use','charger use'],
      ['set realistic expectations','realistic expectations'],
      ['realistic expectations','realistic expectations'],
      ['importance of daily full-time wear','importance of daily full-time wear'],
      ['test results','test results'],
      ['cleaning','cleaning']
    ];
    if(k.startsWith('counseled on'))known.forEach(([needle,label])=>{if(k.includes(needle))topics.push(label);});
    if(k.startsWith('discussed hearing conservation'))topics.push('hearing conservation');
    return unique(topics);
  }

  function counselingSentences(parts){
    let topics=[];
    const other=[];
    parts.forEach(part=>{const parsed=counselingTopicsFromPart(part);if(parsed.length)topics.push(...parsed);else other.push(part);});
    topics=unique(topics);
    const out=[];
    if(topics.length)out.push(ensureSentence('Counseling included '+formatList(topics)));
    other.forEach(part=>out.push(ensureSentence(part)));
    return out;
  }

  function fittingSentences(parts){
    return parts.map(part=>{
      let text=cleanText(part);
      if(/^Delivered new hearing aids$/i.test(text))return'New hearing aids were delivered.';
      if(/ complete$/i.test(text))text=text.replace(/ complete$/i,' completed');
      return ensureSentence(text);
    });
  }

  function adminSentences(parts){return parts.map(ensureSentence);}
  function otherSentences(parts){return parts.map(ensureSentence);}

  function groupOrder(){
    if(currentAppointment==='hae')return['evaluation','demonstration','treatment','counseling','service','fitting','admin','other'];
    if(currentAppointment==='aftercare')return['evaluation','service','counseling','demonstration','treatment','fitting','admin','other'];
    if(currentAppointment==='delivery')return['evaluation','fitting','counseling','admin','service','demonstration','treatment','other'];
    return['service','evaluation','demonstration','treatment','counseling','fitting','admin','other'];
  }

  function composeSmartNote(parts){
    const groups={evaluation:[],service:[],demonstration:[],fitting:[],treatment:[],counseling:[],admin:[],other:[]};
    let satisfied=false;
    const concern=concernSentence();
    const concernKey=keyText(concernText(concernPrefix()));
    const hasNormalLimitsStatement=parts.some(part=>keyText(part).startsWith('test results indicate hearing within normal limits'));

    parts.filter(Boolean).forEach(part=>{
      const k=keyText(part);
      if(k==='patient satisfied'){satisfied=true;return;}
      if(concernKey&&k===concernKey)return;
      if(hasNormalLimitsStatement&&k==='no hearing loss identified')return;
      const category=categoryFor(part);
      (groups[category]||groups.other).push(part);
    });

    const sentences=[];
    if(concern)sentences.push(concern);

    groupOrder().forEach(category=>{
      const items=groups[category];
      if(!items.length)return;
      let groupSentences=[];
      if(category==='evaluation')groupSentences=evaluationSentences(items);
      else if(category==='service')groupSentences=serviceSentences(items);
      else if(category==='demonstration')groupSentences=demonstrationSentences(items);
      else if(category==='treatment')groupSentences=treatmentSentences(items);
      else if(category==='counseling')groupSentences=counselingSentences(items);
      else if(category==='fitting')groupSentences=fittingSentences(items);
      else if(category==='admin')groupSentences=adminSentences(items);
      else groupSentences=otherSentences(items);
      sentences.push(...groupSentences.filter(Boolean));
    });

    const details=cleanText(val('details'));
    if(details)sentences.push(ensureSentence(details));
    if(satisfied)sentences.push('Patient satisfied.');
    return unique(sentences).join(' ');
  }

  function getCurrentStructuredParts(){
    let arr=[];
    if(currentAppointment==='hae')arr=generateHae();
    if(currentAppointment==='aftercare')arr=generateAftercare();
    if(currentAppointment==='delivery')arr=generateDelivery();
    if(currentAppointment==='retest')arr=generateRetest();
    if(currentAppointment==='retestUnder')arr=generateRetestUnder();
    if(currentAppointment==='retestOver')arr=generateRetestOver();
    return arr;
  }

  window.generateNote=function(){
    const arr=getCurrentStructuredParts();
    if(arr===null)return;
    const note=composeSmartNote(Array.isArray(arr)?arr:[]);
    document.getElementById('output').value=note;
    document.getElementById('copyStatus').textContent='';
    if(note)copyNote(true);
  };

  const baseCollectDraftState=window.collectDraftState;
  if(typeof baseCollectDraftState==='function'){
    window.collectDraftState=function(){const state=baseCollectDraftState();if(state)state.version=SMART_NOTE_VERSION;return state;};
  }

  function applySmartNoteVersion(){
    document.querySelectorAll('[data-app-version]').forEach(el=>{el.textContent=SMART_NOTE_VERSION;});
    const heading=document.querySelector('#aboutWhatsNew h3');
    if(heading)heading.textContent="What's New in v"+SMART_NOTE_VERSION;
    const list=document.querySelector('#aboutWhatsNew .changelog-list');
    if(list)list.innerHTML=[
      '<li><strong>Added Smart Note Generation</strong> to organize selected clinical facts into clearer, more natural Sycle-ready sentences.</li>',
      '<li><strong>Improved context-aware wording</strong> for testing, hearing findings, demonstrations, treatment outcomes, service, fitting, and counseling.</li>',
      '<li><strong>Combined related counseling and maintenance items</strong> to reduce repetitive, mechanical note phrasing.</li>',
      '<li><strong>Preserved documentation safety</strong>: only selected or entered information is used, and manual edits remain authoritative when saving.</li>',
      '<li><strong>Kept Additional Details intact</strong> as user-entered documentation rather than inferring missing clinical information.</li>'
    ].join('');
  }

  window.showVersionInfo=function(){
    alert(`Miracle-Ear Clinical Assistant\n\nVersion ${SMART_NOTE_VERSION}\n\nWhat's new:\n• Smart Note Generation with context-aware sentence organization\n• Cleaner treatment, service, fitting, and counseling wording\n• Related documentation combined to reduce repetition\n• No unselected clinical facts are added\n• Manually edited Generated Notes remain authoritative`);
  };
  window.checkForUpdates=function(){
    alert(`Update check\n\nCurrent version: ${SMART_NOTE_VERSION}\n\nThis portable/browser version cannot automatically download updates yet. Replace the App folder when a new version is released.`);
  };

  function addSmartNoteIndicator(){
    const output=document.getElementById('output');
    if(!output||document.getElementById('smartNoteIndicator'))return;
    const note=output.parentElement?.querySelector('p.muted');
    if(note){
      const indicator=document.createElement('div');
      indicator.id='smartNoteIndicator';
      indicator.className='muted';
      indicator.style.margin='-4px 0 10px';
      indicator.style.fontSize='12px';
      indicator.textContent='Smart Note Generation • Uses only selected or entered information.';
      note.insertAdjacentElement('afterend',indicator);
    }
  }

  function initSmartNotes(){applySmartNoteVersion();addSmartNoteIndicator();}
  if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',initSmartNotes);
  else initSmartNotes();
  window.addEventListener('load',initSmartNotes);
})();
