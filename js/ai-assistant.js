/* Miracle-Ear Clinical Assistant v1.8.0-dev1 — Optional AI Writing Assistant */
(function(){
  'use strict';

  const AI_VERSION='1.8.0-dev1';
  const ENDPOINT_KEY='clinicalAssistantAiEndpoint';

  function clean(v){return String(v||'').trim();}
  function endpoint(){
    const saved=clean(localStorage.getItem(ENDPOINT_KEY));
    if(saved)return saved;
    if(location.hostname.endsWith('.vercel.app')||location.hostname==='localhost'||location.hostname==='127.0.0.1')return '/api/ai-note';
    return '';
  }

  function installStyles(){
    if(document.getElementById('ai-writing-styles'))return;
    const s=document.createElement('style');
    s.id='ai-writing-styles';
    s.textContent=`
      .ai-writing-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:8px}
      .ai-writing-btn{background:linear-gradient(135deg,#006f78,#008c95);color:#fff;border:0}
      .ai-writing-btn:disabled{opacity:.55;cursor:not-allowed}
      .ai-writing-note{font-size:12px;color:var(--muted,#667085)}
      .ai-suggestion{margin-top:12px;padding:14px;border:1px solid rgba(0,140,149,.28);border-radius:12px;background:rgba(0,140,149,.06)}
      .ai-suggestion-head{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:8px}
      .ai-suggestion textarea{min-height:110px;margin-bottom:8px}
      .ai-suggestion-actions{display:flex;gap:8px;flex-wrap:wrap}
      .ai-privacy-box{margin-top:10px;padding:10px 12px;border-radius:10px;background:rgba(255,193,7,.12);font-size:12px;line-height:1.45}
      .ai-settings-card{margin-top:16px}
      .ai-status-dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px;background:#b7bdc7}
      .ai-status-dot.ready{background:#18a558}
      .ai-status-dot.waiting{background:#e5a100}
      @media(max-width:600px){.ai-writing-row .ai-writing-btn{width:100%;min-height:44px}.ai-suggestion-actions button{flex:1 1 45%}}
    `;
    document.head.appendChild(s);
  }

  function obviousIdentifier(text){
    const checks=[
      /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
      /\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/,
      /\b(?:DOB|date of birth|MRN|medical record|account number)\b/i,
      /\b\d{3}-\d{2}-\d{4}\b/
    ];
    return checks.some(r=>r.test(text));
  }

  async function requestRewrite(source,mode){
    const url=endpoint();
    if(!url)throw new Error('AI service is not connected yet. Open Settings → AI Writing Assistant after the secure backend is deployed.');
    const text=clean(source);
    if(!text)throw new Error('There is no text to improve yet.');
    if(text.length>5000)throw new Error('Please shorten the text before sending it to the AI assistant.');
    if(obviousIdentifier(text))throw new Error('Possible patient-identifying information was detected. Remove names/contact information/record numbers before using AI.');
    const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text,mode})});
    let data={};try{data=await response.json();}catch(e){}
    if(!response.ok)throw new Error(data.error||'The AI service could not complete the request.');
    if(!clean(data.text))throw new Error('The AI service returned an empty suggestion.');
    return clean(data.text);
  }

  function suggestionBox(targetId,sourceId,mode){
    let box=document.getElementById(targetId);
    if(box)return box;
    box=document.createElement('div');
    box.id=targetId;box.className='ai-suggestion hidden';
    box.innerHTML=`<div class="ai-suggestion-head"><strong>✨ AI suggestion</strong><span class="ai-writing-note">Review before using</span></div><textarea class="ai-suggestion-text" aria-label="AI writing suggestion"></textarea><div class="ai-suggestion-actions"><button type="button" class="primary ai-accept">Use Suggestion</button><button type="button" class="secondary ai-copy">Copy</button><button type="button" class="ghost ai-dismiss">Dismiss</button></div>`;
    box.querySelector('.ai-accept').addEventListener('click',()=>{const source=document.getElementById(sourceId);if(source){source.value=box.querySelector('textarea').value;source.dispatchEvent(new Event('input',{bubbles:true}));}box.classList.add('hidden');});
    box.querySelector('.ai-copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(box.querySelector('textarea').value);if(typeof showToast==='function')showToast('AI suggestion copied.');}catch(e){}});
    box.querySelector('.ai-dismiss').addEventListener('click',()=>box.classList.add('hidden'));
    return box;
  }

  function addAiControl(section,sourceId,mode,label){
    if(!section||section.querySelector(`[data-ai-mode="${mode}"]`))return;
    const row=document.createElement('div');row.className='ai-writing-row';row.dataset.aiMode=mode;
    const button=document.createElement('button');button.type='button';button.className='tiny ai-writing-btn';button.textContent='✨ '+label;
    const note=document.createElement('span');note.className='ai-writing-note';note.textContent='Optional · sends only the text in this box';
    row.append(button,note);
    const box=suggestionBox('aiSuggestion-'+mode,sourceId,mode);row.after(box);
    button.addEventListener('click',async()=>{
      const source=document.getElementById(sourceId);const original=button.textContent;button.disabled=true;button.textContent='✨ Working…';
      try{const result=await requestRewrite(source?.value,mode);box.querySelector('textarea').value=result;box.classList.remove('hidden');}
      catch(err){alert(err.message||String(err));}
      finally{button.disabled=false;button.textContent=original;}
    });
    section.appendChild(row);section.appendChild(box);
  }

  function installWritingAssistant(){
    const details=document.getElementById('details');
    const output=document.getElementById('output');
    if(details){const section=details.closest('.section');addAiControl(section,'details','details','Clean Up Details');}
    if(output){const section=output.closest('.section');addAiControl(section,'output','note','Refine Generated Note');}
  }

  function installSettings(){
    const settings=document.querySelector('#settings > .section');
    if(!settings||document.getElementById('aiWritingSettings'))return;
    const card=document.createElement('div');card.id='aiWritingSettings';card.className='settings-group ai-settings-card';
    card.innerHTML=`<h4>✨ AI Writing Assistant <span class="badge">Experimental</span></h4><p class="muted">Optional writing help for Additional Details and Generated Notes. The normal note generator remains unchanged.</p><div class="result-box" id="aiConnectionStatus"></div><div class="ai-privacy-box"><strong>Privacy:</strong> Clinical Assistant never sends the Patient Label or Saved Outcomes automatically. Only the text box you explicitly submit is sent. Do not enter patient names, DOBs, phone numbers, email addresses, record numbers, or other identifying information into an AI request.</div><div style="margin-top:12px"><label class="inline-label" for="aiEndpointInput">Secure AI service URL</label><input type="url" id="aiEndpointInput" placeholder="Not connected yet"><p class="muted">The OpenAI API key is never stored in Clinical Assistant. It belongs on the secure server only.</p><button type="button" class="tiny primary" id="saveAiEndpoint">Save AI Service</button> <button type="button" class="tiny secondary" id="clearAiEndpoint">Clear</button></div>`;
    settings.appendChild(card);
    const input=card.querySelector('#aiEndpointInput');input.value=endpoint();
    card.querySelector('#saveAiEndpoint').addEventListener('click',()=>{const value=clean(input.value);if(value)localStorage.setItem(ENDPOINT_KEY,value);else localStorage.removeItem(ENDPOINT_KEY);renderConnectionStatus();});
    card.querySelector('#clearAiEndpoint').addEventListener('click',()=>{localStorage.removeItem(ENDPOINT_KEY);input.value='';renderConnectionStatus();});
    renderConnectionStatus();
  }

  function renderConnectionStatus(){
    const el=document.getElementById('aiConnectionStatus');if(!el)return;
    const url=endpoint();
    el.innerHTML=url?'<span class="ai-status-dot ready"></span><strong>AI service configured.</strong> Ready for a connection test.':'<span class="ai-status-dot waiting"></span><strong>AI service setup required.</strong> The writing controls are installed, but no text can leave the device until a secure backend is connected.';
  }

  function applyDevVersion(){
    document.querySelectorAll('[data-app-version]').forEach(el=>el.textContent=AI_VERSION);
    const about=document.getElementById('aboutVersion');if(about)about.textContent=AI_VERSION;
    const heading=document.querySelector('#aboutWhatsNew h3');if(heading)heading.textContent="What's New in v"+AI_VERSION;
    const list=document.querySelector('#aboutWhatsNew .changelog-list');
    if(list)list.innerHTML='<li><strong>Added an optional AI Writing Assistant</strong> for cleaning up Additional Details and refining Generated Notes without replacing the normal concise note generator.</li><li><strong>Added privacy guardrails</strong>: Patient Label and Saved Outcomes are never sent automatically, obvious identifiers are blocked, and every AI suggestion requires review before use.</li><li><strong>Prepared secure server integration</strong> so the OpenAI API key never appears in the browser or desktop files.</li><li><strong>Existing v1.7.2 workflows remain unchanged</strong>, including the Pending Saved Outcomes badge and Open Sycle shortcut.</li>';
  }

  function init(){installStyles();installWritingAssistant();installSettings();applyDevVersion();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.addEventListener('load',init);
})();