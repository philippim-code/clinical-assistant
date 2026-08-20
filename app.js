const APP_VERSION='1.3.10-mobile-test';
let editingOutcomeId=null;
let currentAppointment='';let replacedItems=[];
const DEFAULT_SETTINGS={finance:['PatientFi','Powerpay','Paymonthly/Care Credit','HFD'],adjustments:['Increased speech 1 click AU','Ran feedback test']};
function getSettings(){try{return Object.assign({},DEFAULT_SETTINGS,JSON.parse(localStorage.getItem('meClinicalSettings')||'{}'))}catch(e){return DEFAULT_SETTINGS}}
function saveSettings(){const finance=document.getElementById('settingsFinance').value.split(/\n/).map(x=>x.trim()).filter(Boolean);const adjustments=document.getElementById('settingsAdjustments').value.split(/\n/).map(x=>x.trim()).filter(Boolean);localStorage.setItem('meClinicalSettings',JSON.stringify({finance:finance.length?finance:DEFAULT_SETTINGS.finance,adjustments:adjustments.length?adjustments:DEFAULT_SETTINGS.adjustments}));document.getElementById('settingsStatus').textContent='Settings saved. Reload the appointment type to see updated dropdowns/presets.';toast('✓ Settings saved.')}
function resetSettings(){if(!confirm('Reset settings to defaults?'))return;localStorage.removeItem('meClinicalSettings');renderSettings();toast('✓ Settings reset.')}
function renderSettings(){const s=getSettings();const f=document.getElementById('settingsFinance');const a=document.getElementById('settingsAdjustments');if(f)f.value=s.finance.join('\n');if(a)a.value=s.adjustments.join('\n');}
function financeOptions(prefix){return getSettings().finance.map(x=>`<label class="inline-label"><input type="radio" name="${prefix}Finance" value="${x.replace(/"/g,'&quot;')}">${x}</label>`).join('')}
function adjustmentPresetPills(id){return getSettings().adjustments.map(x=>`<span class="preset" onclick="setText('${id}','${x.replace(/'/g,"&#39;")}')">${x}</span>`).join('')}
function showTab(tabId,button){document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));document.getElementById(tabId).classList.add('active');document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));button.classList.add('active');if(tabId==='home')renderDashboard();if(tabId==='outcomes')renderOutcomes();if(tabId==='settings')renderSettings();if(tabId==='about')renderAbout();}
function severityForPTA(value){const n=parseFloat(value);if(isNaN(n))return{label:'Not entered',cls:'severity-invalid'};if(n<25)return{label:'No Loss',cls:'severity-normal'};if(n<=40)return{label:'Mild',cls:'severity-mild'};if(n<=55)return{label:'Moderate',cls:'severity-moderate'};if(n<=69)return{label:'Moderate to Severe',cls:'severity-modsev'};if(n<=95)return{label:'Severe to Profound',cls:'severity-severe'};return{label:'Unaidable',cls:'severity-profound'}}
function updateStandalonePTA(){const r=severityForPTA(document.getElementById('toolRightPTA').value),l=severityForPTA(document.getElementById('toolLeftPTA').value);document.getElementById('toolPTAResult').innerHTML=`Right: <span class="${r.cls}">${r.label}</span> &nbsp; | &nbsp; Left: <span class="${l.cls}">${l.label}</span>`}
function setText(id,value){document.getElementById(id).value=value;markNoteAsNotGenerated()}
function section(id,title,body){return `<div class="workflow-card" id="card_${id}"><label class="workflow-head"><input type="checkbox" id="sec_${id}" onchange="toggleSection('${id}',this)">${title}</label><div class="workflow-body" id="body_${id}">${body}</div></div>`}
function miniSection(id,title,body){return `<div class="workflow-card mini-card" id="card_${id}"><label class="workflow-head mini-head"><input type="checkbox" id="sec_${id}" onchange="toggleSection('${id}',this)">${title}</label><div class="workflow-body" id="body_${id}">${body}</div></div>`}
function toggleSection(id,box){document.getElementById('card_'+id).classList.toggle('active',box.checked)}
function checkGroup(cls,on){document.querySelectorAll('.'+cls).forEach(b=>b.checked=on);markNoteAsNotGenerated()}
function toggleBox(id,show){document.getElementById(id).classList.toggle('hidden',!show)}
function otoscopy(prefix){return `<div class="subbox"><div class="row-title">Otoscopy</div><label class="inline-label"><input type="radio" name="${prefix}OtoStatus" value="normal" onchange="toggleBox('${prefix}OtoAbnormalBox',false)">Normal AU</label><label class="inline-label"><input type="radio" name="${prefix}OtoStatus" value="abnormal" onchange="toggleBox('${prefix}OtoAbnormalBox',true)">Abnormal</label><div id="${prefix}OtoAbnormalBox" class="hidden"><div class="grid-2"><div><label class="inline-label">Ear</label><select id="${prefix}OtoEar"><option value="">Select ear...</option><option value="AD">Right / AD</option><option value="AS">Left / AS</option><option value="AU">Both / AU</option></select></div><div><label class="inline-label">Finding</label><input type="text" id="${prefix}OtoDetails" placeholder="ex. excessive cerumen, drainage, redness"></div></div><span class="required">Ear and finding are required when abnormal is selected.</span></div></div>`}
function renderEvaluation(prefix,opts={}){return section(prefix+'Eval','Evaluation',`${otoscopy(prefix)}${cb(prefix+'FDA','Patient Denies All FDA Questions')}${cb(prefix+'Test','Tested AC + BC and Entered into NOAH')}${hearingLoss(prefix)}${medReferral(prefix)}`)}
function concernSection(prefix,title='Patient Concern / Reason for Visit',placeholder='ex. Patient states hearing aids are not working.'){return section(prefix+'Concern',title,`<label class="inline-label">Concern / Reported Difficulty</label><textarea id="${prefix}ConcernText" placeholder="${placeholder}"></textarea>`)}
function cb(id,label,checked=false){return `<label class="inline-label"><input type="checkbox" id="${id}" ${checked?'checked':''}>${label}</label>`}
function hearingLoss(prefix){return `<div class="subbox"><label class="inline-label"><input type="checkbox" id="${prefix}HL">Hearing Loss</label><div class="grid-2"><div><label class="inline-label">Laterality</label><select id="${prefix}Lat"><option value="">Select laterality...</option><option value="Bilateral">Bilateral</option><option value="AD">Right / AD</option><option value="AS">Left / AS</option></select></div><div><label class="inline-label">Type</label><select id="${prefix}Type"><option value="">Select type...</option><option value="sensorineural">Sensorineural</option><option value="conductive">Conductive</option><option value="mixed">Mixed</option><option value="normal hearing">Normal Hearing</option><option value="other">Other</option></select></div></div><input type="text" id="${prefix}OtherHL" placeholder="Other hearing loss type if needed..."></div>`}
function medReferral(prefix){return `<div class="subbox"><label class="inline-label"><input type="checkbox" id="${prefix}Med" onchange="toggleBox('${prefix}MedBox',this.checked)">Med Referral</label><div id="${prefix}MedBox" class="hidden"><label class="inline-label">Reason for Medical Referral</label><input type="text" id="${prefix}MedReason" placeholder="ex. air-bone gap, cerumen buildup, drainage"><span class="required">Required if med referral is checked.</span><div class="pill-row"><span class="preset" onclick="setText('${prefix}MedReason','air-bone gap')">Air-bone gap</span><span class="preset" onclick="setText('${prefix}MedReason','cerumen buildup')">Cerumen buildup</span><span class="preset" onclick="setText('${prefix}MedReason','drainage')">Drainage</span><span class="preset" onclick="setText('${prefix}MedReason','ear pain')">Ear pain</span><span class="preset" onclick="setText('${prefix}MedReason','sudden change in hearing')">Sudden change</span></div></div></div>`}
function cou(prefix){return `<div class="subbox"><label class="inline-label"><input type="checkbox" id="${prefix}COU">COU Completed</label><div class="grid-2"><div><label class="inline-label">Baseline</label><label class="inline-label"><input type="radio" name="${prefix}COUBaseline" value="unaided">Unaided</label><label class="inline-label"><input type="radio" name="${prefix}COUBaseline" value="existing hearing aids">Existing Hearing Aids</label></div><div><label class="inline-label">Baseline Score</label><input type="number" min="0" max="100" id="${prefix}CU" placeholder="ex. 10"></div></div><div class="grid-3"><div><label class="inline-label">New Technology 1</label><input type="number" min="0" max="100" id="${prefix}CA1" placeholder="ex. 80"></div><div><label class="inline-label">New Technology 2</label><input type="number" min="0" max="100" id="${prefix}CA2" placeholder="ex. 90"></div><div><label class="inline-label">New Technology 3</label><input type="number" min="0" max="100" id="${prefix}CA3" placeholder="ex. 100"></div></div></div>`}
function financing(prefix){return `<label class="inline-label"><input type="checkbox" id="${prefix}Fin" onchange="toggleBox('${prefix}FinBox',this.checked)">Financed</label><div id="${prefix}FinBox" class="subbox hidden">${financeOptions(prefix)}</div>`}
function myEssentials(prefix){return `<div class="subbox"><div class="row-title">My Essentials</div><label class="inline-label"><input type="radio" name="${prefix}Ess" value="Signed up for My Essentials">Accepted / Signed Up</label><label class="inline-label"><input type="radio" name="${prefix}Ess" value="Declined My Essentials and signed waiver">Declined and Waiver Signed</label><label class="inline-label"><input type="radio" name="${prefix}Ess" value="My Essentials decision deferred until delivery">Decide Upon Delivery</label></div>`}
function purchaseOutcome(prefix,trade=false){const label=trade?'Traded Up To New Hearing Aids':'Purchased Hearing Aids';return `<div class="subbox"><label class="inline-label"><input type="checkbox" id="${prefix}Purchased" onchange="toggleBox('${prefix}PurchaseBox',this.checked)">${label}</label><div id="${prefix}PurchaseBox" class="hidden"><input type="text" id="${prefix}Device" placeholder="ex. ME Energy 5 RIC R AX">${financing(prefix)}${myEssentials(prefix)}</div></div>`}
function trialOutcome(prefix){return `<div class="subbox"><label class="inline-label"><input type="checkbox" id="${prefix}Trial" onchange="toggleBox('${prefix}TrialBox',this.checked)">Trial Accepted</label><div id="${prefix}TrialBox" class="hidden"><input type="text" id="${prefix}TrialDevice" placeholder="Hearing aid model"><label class="inline-label">Trial Follow-Up / Return Date</label><input type="date" id="${prefix}TrialDate"><p class="muted">Trials are documented as a 3-day take-home trial beginning today.</p></div></div>`}
function renderHae(){return renderEvaluation('hae')+section('haeDemo','Demonstration',`${cb('haeDemoTech','Demoed New Tech')}${cou('hae')}${cb('haeClarity','Significant Improvement in Clarity and Understanding')}`)+section('haeTreatment','Treatment Outcome',`${cb('haeRecommend','Hearing Aids Recommended as Treatment')}${purchaseOutcome('hae',false)}${trialOutcome('hae')}<div class="subbox"><label class="inline-label"><input type="checkbox" id="haeRejected" onchange="toggleBox('haeRejectedBox',this.checked)">Did Not Purchase</label><div id="haeRejectedBox" class="hidden"><input type="text" id="haeRejectedReason" placeholder="ex. price concern, wants to think it over, needs to speak with family"></div></div>`)}
function renderRetest(){return concernSection('rt','Patient Concern / Reported Difficulty','ex. Patient reports trouble with clarity in background noise.')+renderHearingAidService('rt')+renderEvaluation('rt')+section('rtDemo','Demonstration',`${cb('rtDemoTech','Demoed New Tech')}${cou('rt')}`)+section('rtTreatment','Treatment Outcome',`${cb('rtBetter','Recommended Better Treatment')}${cb('rtWarranty','Warranty / Trade-In Discussion')}${purchaseOutcome('rt',true)}${trialOutcome('rt')}<div class="subbox"><label class="inline-label"><input type="checkbox" id="rtRejected" onchange="toggleBox('rtRejectedBox',this.checked)">Did Not Trade In</label><div id="rtRejectedBox" class="hidden"><input type="text" id="rtRejectedReason" placeholder="ex. price concern, wants to think it over, not ready to upgrade"></div></div>`)+section('rtFollow','Counseling / Wrap Up',`${cb('rtRealistic','Counseled on Realistic Expectations')}${cb('rtWearCounsel','Counseled on Importance of Daily Full-Time Wear')}${cb('rtCleaningSet','Cleaning Set for 3 Months')}${cb('rtSatisfied','Patient Satisfied')}`)}
function computer(prefix){return `<div class="subbox"><label class="inline-label"><input type="checkbox" id="${prefix}Connected">Connected to Computer</label><label class="inline-label"><input type="checkbox" id="${prefix}Firmware">Firmware Updated</label><label class="inline-label">Average Wear Time</label><input type="number" id="${prefix}WT" placeholder="ex. 10"><label class="inline-label"><input type="radio" name="${prefix}Prog" value="no" onchange="toggleBox('${prefix}AdjBox',false)">No Programming Changes</label><label class="inline-label"><input type="radio" name="${prefix}Prog" value="yes" onchange="toggleBox('${prefix}AdjBox',this.checked)">Programming Changes</label><div id="${prefix}AdjBox" class="hidden"><input type="text" id="${prefix}Adj" placeholder="ex. Increased speech 1 click AU"><div class="pill-row">${adjustmentPresetPills(prefix+'Adj')}</div></div></div>`}
function renderRetestUnder(){return renderRetest()}
function renderRetestOver(){return renderRetest()}
function deliveryTests(prefix){return `<div class="subbox"><label class="inline-label"><input type="checkbox" id="${prefix}Tests">Delivery Tests Completed</label><button type="button" class="tiny" onclick="checkGroup('${prefix}Test',true)">Check All</button><button type="button" class="tiny secondary" onclick="checkGroup('${prefix}Test',false)">Clear Tests</button><label class="inline-label"><input type="checkbox" class="${prefix}Test" value="WR">WR</label><label class="inline-label"><input type="checkbox" class="${prefix}Test" value="SRT">SRT</label><label class="inline-label"><input type="checkbox" class="${prefix}Test" value="UCL">UCL</label><label class="inline-label"><input type="checkbox" class="${prefix}Test" value="MCL">MCL</label></div>`}
function firstFit(prefix){return `<div class="subbox"><label class="inline-label"><input type="checkbox" id="${prefix}FirstFit">First Fit Completed</label><label class="inline-label"><input type="radio" name="${prefix}User" value="new user">New User</label><label class="inline-label"><input type="radio" name="${prefix}User" value="experienced user">Experienced User</label><label class="inline-label"><input type="radio" name="${prefix}User" value="long-term user">Long-Term User</label><div class="grid-3"><div><label class="inline-label">Receiver Length</label><select id="${prefix}FitReceiverLength"><option value="">Select...</option><option>0</option><option>1</option><option>2</option><option>3</option><option>4</option></select></div><div><label class="inline-label">Receiver Power</label><select id="${prefix}FitReceiverPower"><option value="">Select...</option><option>S</option><option>M</option><option>P</option></select></div><div><label class="inline-label">Side</label><select id="${prefix}FitSide" onchange="updateFirstFitOpposite('${prefix}')"><option value="AU">Both / AU</option><option value="AD">Right / AD</option><option value="AS">Left / AS</option></select></div></div><div class="grid-2"><div><label class="inline-label">Coupling</label><select id="${prefix}FitCoupling"><option value="">Select...</option><option value="dome">Dome</option><option value="sleeve">Sleeve</option><option value="eartip">Eartip</option><option value="mold">Mold</option></select></div><div><label class="inline-label">Type / Size</label><input type="text" id="${prefix}FitCouplingDetails" placeholder="ex. medium power dome"></div></div><div id="${prefix}FitOppositeBox" class="subbox hidden"><div class="row-title" id="${prefix}FitOppositeTitle">Other Side</div><span class="required">Complete the fitting information for the other ear.</span><div class="grid-2"><div><label class="inline-label">Receiver Length</label><select id="${prefix}FitOppositeReceiverLength"><option value="">Select...</option><option>0</option><option>1</option><option>2</option><option>3</option><option>4</option></select></div><div><label class="inline-label">Receiver Power</label><select id="${prefix}FitOppositeReceiverPower"><option value="">Select...</option><option>S</option><option>M</option><option>P</option></select></div></div><div class="grid-2"><div><label class="inline-label">Coupling</label><select id="${prefix}FitOppositeCoupling"><option value="">Select...</option><option value="dome">Dome</option><option value="sleeve">Sleeve</option><option value="eartip">Eartip</option><option value="mold">Mold</option></select></div><div><label class="inline-label">Type / Size</label><input type="text" id="${prefix}FitOppositeCouplingDetails" placeholder="ex. medium power dome"></div></div></div></div>`}
function updateFirstFitOpposite(prefix){const side=val(prefix+'FitSide');const box=document.getElementById(prefix+'FitOppositeBox');const title=document.getElementById(prefix+'FitOppositeTitle');if(!box)return;const needsOther=side==='AD'||side==='AS';box.classList.toggle('hidden',!needsOther);if(title)title.textContent=side==='AD'?'Other Side: Left / AS':side==='AS'?'Other Side: Right / AD':'Other Side';}
function deliveryCounsel(prefix){return `<button type="button" class="tiny" onclick="checkGroup('${prefix}Counsel',true)">Check All</button><button type="button" class="tiny secondary" onclick="checkGroup('${prefix}Counsel',false)">Clear</button><label class="inline-label"><input type="checkbox" class="${prefix}Counsel" value="insertion and removal">Insertion and Removal</label><label class="inline-label"><input type="checkbox" class="${prefix}Counsel" value="cleaning">Cleaning</label><label class="inline-label"><input type="checkbox" class="${prefix}Counsel" value="charger use">Charger Use</label><label class="inline-label"><input type="checkbox" class="${prefix}Counsel" value="set realistic expectations">Set Realistic Expectations</label>`}
function renderDelivery(){return section('delBasics','Delivery Completed',`${otoscopy('del')}${cb('delDelivered','Delivered New Hearing Aids')}`)+section('delFit','Testing / Fitting',`${deliveryTests('del')}${firstFit('del')}${cb('delInsitu','Insitu Completed')}${cb('delCritical','Critical Gain Completed')}`)+section('delCounsel','Delivery Counseling',deliveryCounsel('del'))+section('delAdmin','Financing / My Essentials / Wrap Up',`${myEssentials('del')}<div class="subbox"><label class="inline-label"><input type="checkbox" id="delFinanceComplete" onchange="toggleBox('delFinanceBox',this.checked)">Financing Complete</label><div id="delFinanceBox" class="hidden"><label class="inline-label"><input type="radio" name="delFinanceCompany" value="PatientFi">PatientFi</label><label class="inline-label"><input type="radio" name="delFinanceCompany" value="Powerpay">Powerpay</label><label class="inline-label"><input type="radio" name="delFinanceCompany" value="Paymonthly/Care Credit">Paymonthly/Care Credit</label><label class="inline-label"><input type="radio" name="delFinanceCompany" value="HFD">HFD</label></div></div>${cb('delSatisfied','Patient Satisfied')}`)}
function renderCleaning(prefix){return section(prefix+'Clean','Maintenance',`${otoscopy(prefix)}<div class="subbox"><label class="inline-label"><input type="checkbox" id="${prefix}Cleaned">Cleaned Both Hearing Aids</label><label class="inline-label"><input type="checkbox" id="${prefix}Vacuumed">Vacuumed Microphones</label><label class="inline-label"><input type="checkbox" id="${prefix}Listen">Listening Check Performed</label><label class="inline-label"><input type="checkbox" id="${prefix}Dry">Placed Hearing Aids in Dry Chamber</label></div>`)}
function replacedItemsBody(){return `<div class="subbox"><div class="grid-2"><div><label class="inline-label">Side</label><select id="replaceSide"><option value="">Select side...</option><option value="AU">Both / AU</option><option value="AD">Right / AD</option><option value="AS">Left / AS</option></select></div><div><label class="inline-label">Item Category</label><select id="replaceCategory" onchange="updateReplacementOptions()"><option value="">Select item...</option><option value="eartip">Eartip</option><option value="sleeve">Sleeve</option><option value="dome">Dome</option><option value="wax guards">Wax Guards</option><option value="receiver">Receiver</option><option value="retention lock">Retention Lock</option><option value="tubing">Tubing</option><option value="batteries">Batteries</option><option value="other">Other</option></select></div></div><div class="grid-2"><div><label class="inline-label">Type / Style</label><select id="replaceStyle" onchange="updateReplacementSizes()"><option value="">Select type/style...</option></select></div><div><label class="inline-label">Size / Length</label><select id="replaceSize"><option value="">Select size/length...</option></select></div></div><input type="text" id="replaceOther" placeholder="Other item details, or examples like: small closed sleeves, AD 2M receiver..."><button type="button" class="tiny" onclick="addReplacedItem()">Add Replaced Item</button><button type="button" class="tiny secondary" onclick="clearReplacedItems()">Clear Replaced Items</button><ul class="item-list" id="replacedList"></ul></div>`}
function renderReplacedItems(prefix){replacedItems=[];return section(prefix+'Replace','Replaced Items',replacedItemsBody())}
function renderHearingAidService(prefix){const p=prefix+'Svc';return section(prefix+'Service','Hearing Aid Service',`${miniSection(prefix+'ServiceMaint','Maintenance',`${cb(p+'Cleaned','Cleaned Both Hearing Aids')}${cb(p+'Vacuumed','Vacuumed Microphones')}${cb(p+'Listen','Listening Check Performed')}${cb(p+'Dry','Placed Hearing Aids in Dry Chamber')}`)}${miniSection(prefix+'ServiceReplace','Replaced Items',replacedItemsBody())}${miniSection(prefix+'ServiceProgramming','Programming',computer(p))}${miniSection(prefix+'ServiceCounsel','Counseling',`${cb(p+'WearCounsel','Counseled on Importance of Daily Full-Time Wear')}${cb(p+'Demos','Put Demos in Ears While Cleaning')}`)}`)}
function renderAftercare(){return concernSection('ac','Patient Concern / Reason for Visit','ex. Patient states hearing aids are not working.')+renderCleaning('ac')+renderReplacedItems('ac')+section('acProgramming','Programming',computer('ac'))+section('acCounsel','Counseling / Wrap Up',`${cb('acRealistic','Counseled on Realistic Expectations')}${cb('acWearCounsel','Counseled on Importance of Daily Full-Time Wear')}${cb('acDemos','Put Demos in Ears While Cleaning')}${cb('acSatisfied','Patient Satisfied')}`)}
function loadAppointment(type,card){currentAppointment=type;document.querySelectorAll('.appt-card').forEach(c=>c.classList.remove('active'));card.classList.add('active');document.getElementById('details').value='';document.getElementById('output').value='';document.getElementById('copyStatus').textContent='';let html='<h3>Workflow</h3>';if(type==='hae')html+=renderHae();if(type==='aftercare')html+=renderAftercare();if(type==='delivery')html+=renderDelivery();if(type==='retest')html+=renderRetest();if(type==='retestUnder')html+=renderRetestUnder();if(type==='retestOver')html+=renderRetestOver();document.getElementById('workflow').innerHTML=html;setTimeout(()=>{if(document.getElementById('replaceCategory'))updateReplacementOptions()},0);if(!restoringDraft)saveDraftDebounced()}
const replacementMap={eartip:{styles:['Open','Tulip'],sizes:{Open:['5mm','7mm','10mm'],Tulip:['8mm','12mm']}},sleeve:{styles:['Vented','Closed','Power'],sizes:{Vented:['XS','S','M','L'],Closed:['XS','S','M','L'],Power:['XS','S','M','L']}},dome:{styles:['Cap','Open','Vented','Power'],sizes:{Cap:[''],Open:['S','M','L'],Vented:['S','M','L'],Power:['S','M','L']}},receiver:{styles:['S','M','P'],sizes:{S:['0','1','2','3','4'],M:['0','1','2','3','4'],P:['0','1','2','3','4']}},'wax guards':{styles:[''],sizes:{'':['']}},'retention lock':{styles:[''],sizes:{'':['']}},tubing:{styles:[''],sizes:{'':['']}},batteries:{styles:[''],sizes:{'':['']}},other:{styles:[''],sizes:{'':['']}}};
function updateReplacementOptions(){let cat=document.getElementById('replaceCategory').value,style=document.getElementById('replaceStyle');style.innerHTML='<option value="">Select type/style...</option>';document.getElementById('replaceSize').innerHTML='<option value="">Select size/length...</option>';if(!cat||!replacementMap[cat])return;let map=replacementMap[cat];map.styles.forEach(s=>style.innerHTML+=`<option value="${s}">${s||'N/A'}</option>`);}
function updateReplacementSizes(){let cat=document.getElementById('replaceCategory').value,style=document.getElementById('replaceStyle').value,size=document.getElementById('replaceSize');size.innerHTML='<option value="">Select size/length...</option>';if(!cat||!style||!replacementMap[cat])return;let arr=replacementMap[cat].sizes[style]||[''];arr.forEach(s=>size.innerHTML+=`<option value="${s}">${s||'N/A'}</option>`)}
function addReplacedItem(){let side=document.getElementById('replaceSide').value,cat=document.getElementById('replaceCategory').value,style=document.getElementById('replaceStyle').value,size=document.getElementById('replaceSize').value,other=fragmentText(document.getElementById('replaceOther').value);let text='';if(!cat&&other)cat='other';if(!cat){alert('Select an item category or type details in Other.');return}if(!side&&cat!=='other'){alert('Select a side.');return}if(cat==='other')text=other||'other item';else if(cat==='wax guards')text=side==='AU'?'wax guards AU':side+' wax guard';else if(cat==='receiver'){if(!style||!size){alert('Select receiver type and length.');return}text=side==='AU'?`AU ${size}${style} receivers`:`${side} ${size}${style} receiver`}else if(cat==='retention lock')text=side==='AU'?'retention locks AU':side+' retention lock';else if(cat==='tubing')text=side==='AU'?'tubing AU':side+' tubing';else if(cat==='batteries')text=side==='AU'?'batteries AU':side+' battery';else if(cat==='eartip'){if(!style||!size){alert('Select eartip type and size.');return}text=side==='AU'?[size,style,'eartips','AU'].filter(Boolean).join(' '):[side,size,style,'eartip'].filter(Boolean).join(' ')}else if(cat==='sleeve'){if(!style||!size){alert('Select sleeve type and size.');return}text=side==='AU'?[size,style,'sleeves','AU'].filter(Boolean).join(' '):[side,size,style,'sleeve'].filter(Boolean).join(' ')}else if(cat==='dome'){if(!style){alert('Select dome type.');return}if(style!=='Cap'&&!size){alert('Select dome size.');return}text=style==='Cap'?(side==='AU'?'cap domes AU':side+' cap dome'):(side==='AU'?[size,style,'domes','AU'].filter(Boolean).join(' '):[side,size,style,'dome'].filter(Boolean).join(' '))}text=text.toLowerCase().replace(/\bau\b/g,'AU').replace(/\bad\b/g,'AD').replace(/\bas\b/g,'AS');replacedItems.push(text);renderReplacedList();markNoteAsNotGenerated()}
function renderReplacedList(){let ul=document.getElementById('replacedList');if(!ul)return;ul.innerHTML='';replacedItems.forEach((t,i)=>{ul.innerHTML+=`<li>${t} <button type="button" class="tiny secondary" onclick="removeReplacedItem(${i})">Remove</button></li>`})}
function removeReplacedItem(i){replacedItems.splice(i,1);renderReplacedList();markNoteAsNotGenerated()}function clearReplacedItems(){replacedItems=[];renderReplacedList();markNoteAsNotGenerated()}
function checked(id){let el=document.getElementById(id);return el&&el.checked}function val(id){let el=document.getElementById(id);return el?el.value.trim():''}function radio(name){let el=document.querySelector(`input[name='${name}']:checked`);return el?el.value:''}
function formatList(items){items=items.filter(Boolean);if(items.length===0)return'';if(items.length===1)return items[0];if(items.length===2)return items[0]+' and '+items[1];return items.slice(0,-1).join(', ')+', and '+items[items.length-1]}
function fixAcronyms(text){
  const acronyms={au:'AU',ad:'AD',as:'AS',ac:'AC',bc:'BC',srt:'SRT',wr:'WR',ucl:'UCL',mcl:'MCL',pta:'PTA',cou:'COU',noah:'NOAH',fda:'FDA',hfd:'HFD',ric:'RIC',bte:'BTE',ite:'ITE',itc:'ITC',cic:'CIC',cros:'CROS',bicros:'BiCROS',mepo:'MEPO',mepo2:'MEPO2'};
  return String(text||'').replace(/\s+/g,' ').trim().replace(/([a-zA-Z0-9]+)/g,function(m){let k=m.toLowerCase();return acronyms[k]||m});
}
function capFirst(text){text=fixAcronyms(text);return text?text.charAt(0).toUpperCase()+text.slice(1):''}
function lowerFirst(text){text=fixAcronyms(text);return text?text.charAt(0).toLowerCase()+text.slice(1):''}
function sentenceText(text){text=capFirst(text);if(text&&!/[.!?]$/.test(text))text+='.';return text}
function fragmentText(text){return lowerFirst(text)}
function hlText(prefix){if(!checked(prefix+'HL'))return'';let lat=document.getElementById(prefix+'Lat').value,type=document.getElementById(prefix+'Type').value,other=val(prefix+'OtherHL');if(!lat&&!type)return'Hearing loss type/laterality not selected';if(!lat)lat='';if(!type)type='hearing loss';if(type==='other')type=other||'hearing loss';if(type==='normal hearing')return lat==='Bilateral'?'Normal hearing bilaterally':(lat?`Normal hearing ${lat}`:'Normal hearing');return lat==='Bilateral'?`Bilateral ${type} hearing loss`:(lat?`${type} hearing loss ${lat}`:`${type} hearing loss`)}
function medText(prefix){if(!checked(prefix+'Med'))return'';let r=fragmentText(val(prefix+'MedReason'));return r?'Med referred due to '+r:'Med referral recommended; reason not entered'}
function concernText(prefix){if(!checked('sec_'+prefix+'Concern'))return'';return fragmentText(val(prefix+'ConcernText'))}
function otoscopyText(prefix){const status=radio(prefix+'OtoStatus');if(status==='normal')return 'Otoscopy normal AU';if(status==='abnormal'){const ear=val(prefix+'OtoEar'),details=fragmentText(val(prefix+'OtoDetails'));if(ear&&details)return `Otoscopy abnormal ${ear}: ${details}`;if(details)return `Otoscopy abnormal: ${details}`;return 'Otoscopy abnormal'}return ''}
function trialText(prefix){if(!checked(prefix+'Trial'))return '';const device=fixAcronyms(val(prefix+'TrialDevice'));const date=val(prefix+'TrialDate');let text='Accepted a 3-day take-home trial';if(device)text+=' of '+device;if(date){const d=new Date(date+'T00:00:00');text+=`; follow-up scheduled for ${d.toLocaleDateString()}`;}return text}
function couText(prefix){if(!checked(prefix+'COU'))return'';let baseline=radio(prefix+'COUBaseline')||'unaided',u=val(prefix+'CU'),a1=val(prefix+'CA1'),a2=val(prefix+'CA2'),a3=val(prefix+'CA3');if(u&&a1&&a2&&a3){return baseline==='existing hearing aids'?`COU completed with existing hearing aids: ${u}% VS ${a1}%-${a2}%-${a3}% with new technology`:`COU completed unaided: ${u}% VS ${a1}%-${a2}%-${a3}% with demo hearing aids`;}return baseline==='existing hearing aids'?'COU completed with existing hearing aids':'COU completed unaided with demo hearing aids'}
function financeText(prefix){if(!checked(prefix+'Fin'))return'';let c=radio(prefix+'Finance');return c?'financed through '+c:'financed'}
function essentialsText(prefix){return radio(prefix+'Ess')}
function purchaseText(prefix,trade=false){if(!checked(prefix+'Purchased'))return'';let d=fixAcronyms(val(prefix+'Device')),base=trade?(d?'Traded up to '+d:'Traded up to new hearing aids'):(d?'Purchased '+d:'Purchased hearing aids'),f=financeText(prefix),e=essentialsText(prefix);return formatList([base,f,e])}
function computerText(prefix){if(!checked(prefix+'Connected'))return'';let parts=['Connected to computer'];let wt=val(prefix+'WT');if(wt)parts.push('AVG WT '+wt+' hrs/day');let p=radio(prefix+'Prog');if(p==='no')parts.push('no programming changes made');if(p==='yes'&&val(prefix+'Adj'))parts.push(fragmentText(val(prefix+'Adj')));if(checked(prefix+'Firmware'))parts.push('updated firmware');return parts.join(', ')}
function hearingAidServiceParts(prefix){let arr=[];if(!checked('sec_'+prefix+'Service'))return arr;const p=prefix+'Svc';if(checked('sec_'+prefix+'ServiceMaint')){let clean=[];if(checked(p+'Cleaned'))clean.push('cleaned both hearing aids');if(checked(p+'Vacuumed'))clean.push('vacuumed microphones');if(checked(p+'Listen'))clean.push('listening check performed');if(checked(p+'Dry'))clean.push('placed hearing aids in the dry chamber');if(clean.length)arr.push(formatList(clean));}if(checked('sec_'+prefix+'ServiceReplace')&&replacedItems.length)arr.push('Replaced '+formatList(replacedItems));if(checked('sec_'+prefix+'ServiceProgramming'))arr.push(computerText(p));if(checked('sec_'+prefix+'ServiceCounsel')){if(checked(p+'WearCounsel'))arr.push('Counseled on importance of daily full-time wear');if(checked(p+'Demos'))arr.push('Put demos in ears while cleaning');}return arr.filter(Boolean)}
function evaluationParts(prefix,extra={}){let arr=[];arr.push(otoscopyText(prefix));if(checked(prefix+'FDA'))arr.push('Patient denies all FDA questions');if(checked(prefix+'Test'))arr.push('Tested AC + BC and entered into NOAH');arr.push(hlText(prefix));arr.push(medText(prefix));if(extra.trouble&&checked(prefix+'Trouble'))arr.push('Patient states trouble with clarity');return arr.filter(Boolean)}
function generateHae(){let arr=[];if(checked('sec_haeEval'))arr.push(...evaluationParts('hae'));if(checked('sec_haeDemo')){if(checked('haeDemoTech'))arr.push('Demoed new tech');arr.push(couText('hae'));if(checked('haeClarity'))arr.push('Significant improvement in clarity and understanding')}if(checked('sec_haeTreatment')){if(checked('haeRecommend'))arr.push('Hearing aids recommended as treatment');arr.push(purchaseText('hae',false));arr.push(trialText('hae'));if(checked('haeRejected')){const reason=fragmentText(document.getElementById('haeRejectedReason')?.value);arr.push(reason?'Did not purchase: '+reason:'Did not purchase')}}return arr.filter(Boolean)}
function generateRetest(){let arr=[];arr.push(concernText('rt'));arr.push(...hearingAidServiceParts('rt'));if(checked('sec_rtEval'))arr.push(...evaluationParts('rt'));if(checked('sec_rtDemo')){if(checked('rtDemoTech'))arr.push('Demoed new tech');arr.push(couText('rt'))}if(checked('sec_rtTreatment')){if(checked('rtBetter'))arr.push('Recommended better treatment');if(checked('rtWarranty'))arr.push('Went over warranty / trade-in discussion');arr.push(purchaseText('rt',true));arr.push(trialText('rt'));if(checked('rtRejected')){const reason=fragmentText(document.getElementById('rtRejectedReason')?.value);arr.push(reason?'Did not trade in: '+reason:'Did not trade in')}}if(checked('sec_rtFollow')){if(checked('rtRealistic'))arr.push('Counseled on realistic expectations');if(checked('rtWearCounsel'))arr.push('Counseled on importance of daily full-time wear');if(checked('rtCleaningSet'))arr.push('Cleaning set for 3 months');if(checked('rtSatisfied'))arr.push('Patient satisfied')}return arr.filter(Boolean)}
function generateRetestUnder(){return generateRetest()}
function generateRetestOver(){return generateRetest()}
function generateDelivery(){let arr=[];if(checked('sec_delBasics')){arr.push(otoscopyText('del'));if(checked('delDelivered'))arr.push('Delivered new hearing aids')}if(checked('sec_delFit')){if(checked('delTests')){let tests=[];document.querySelectorAll('.delTest:checked').forEach(b=>tests.push(b.value));arr.push(tests.length?formatList(tests)+' complete':'Delivery tests completed')}if(checked('delFirstFit')){let u=radio('delUser'),len=val('delFitReceiverLength'),pow=val('delFitReceiverPower'),side=val('delFitSide')||'AU',coupling=val('delFitCoupling'),details=fragmentText(val('delFitCouplingDetails'));let fit=u?'First fit completed for '+u:'First fit completed';if(side==='AU'){if(len&&pow)fit+=` with ${len}${pow} receivers AU`;if(coupling||details)fit+=` using ${[details,coupling].filter(Boolean).join(' ')}`;}else{let otherSide=side==='AD'?'AS':'AD',olen=val('delFitOppositeReceiverLength'),opow=val('delFitOppositeReceiverPower'),ocoupling=val('delFitOppositeCoupling'),odetails=fragmentText(val('delFitOppositeCouplingDetails'));if(!olen||!opow||!ocoupling||!odetails){alert(`Please complete receiver and coupling information for ${otherSide} before generating the note.`);return null;}let first=[len&&pow?`${len}${pow} receiver ${side}`:'',coupling||details?`using ${[details,coupling].filter(Boolean).join(' ')}`:''].filter(Boolean).join(' ');let second=`${olen}${opow} receiver ${otherSide} using ${[odetails,ocoupling].filter(Boolean).join(' ')}`;fit+=` with ${first} and ${second}`;}arr.push(fit)}if(checked('delInsitu'))arr.push('Insitu completed');if(checked('delCritical'))arr.push('Critical gain completed')}if(checked('sec_delCounsel')){let c=[];document.querySelectorAll('.delCounsel:checked').forEach(b=>c.push(b.value));if(c.length)arr.push('Counseled on '+formatList(c))}if(checked('sec_delAdmin')){arr.push(essentialsText('del'));if(checked('delFinanceComplete')){let fc=radio('delFinanceCompany');arr.push(fc?'Financing complete through '+fc:'Financing complete')}if(checked('delSatisfied'))arr.push('Patient satisfied')}return arr.filter(Boolean)}
function generateAftercare(){let arr=[];arr.push(concernText('ac'));if(checked('sec_acClean')){arr.push(otoscopyText('ac'));let clean=[];if(checked('acCleaned'))clean.push('cleaned both hearing aids');if(checked('acVacuumed'))clean.push('vacuumed microphones');if(checked('acListen'))clean.push('listening check performed');if(checked('acDry'))clean.push('placed hearing aids in the dry chamber');if(clean.length)arr.push(formatList(clean))}if(checked('sec_acReplace'))arr.push(replacedItems.length?'Replaced '+formatList(replacedItems):'Replaced items');if(checked('sec_acProgramming'))arr.push(computerText('ac'));if(checked('sec_acCounsel')){if(checked('acRealistic'))arr.push('Counseled on realistic expectations');if(checked('acWearCounsel'))arr.push('Counseled on importance of daily full-time wear');if(checked('acDemos'))arr.push('Put demos in ears while cleaning');if(checked('acSatisfied'))arr.push('Patient satisfied')}return arr.filter(Boolean)}
function generateNote(){
  let arr=[];
  if(currentAppointment==='hae')arr=generateHae();
  if(currentAppointment==='aftercare')arr=generateAftercare();
  if(currentAppointment==='delivery')arr=generateDelivery();
  if(currentAppointment==='retest')arr=generateRetest();
  if(currentAppointment==='retestUnder')arr=generateRetestUnder();
  if(currentAppointment==='retestOver')arr=generateRetestOver();
  if(arr===null)return;

  let hasPatientSatisfied=arr.some(x=>String(x).toLowerCase()==='patient satisfied');
  arr=arr.filter(x=>String(x).toLowerCase()!=='patient satisfied');

  let note='';
  let main=arr.filter(Boolean).join(', ');
  if(main)note=sentenceText(main);

  let details=val('details');
  if(details){
    let d=sentenceText(details);
    note+=(note?' ':'')+d;
  }

  if(hasPatientSatisfied){
    note+=(note?' ':'')+'Patient satisfied.';
  }

  document.getElementById('output').value=note;
  document.getElementById('copyStatus').textContent='';
  if(note){copyNote(true);}
}

function appointmentLabel(){
  return appointmentLabelForKey(currentAppointment);
}

function appointmentLabelForKey(key){const labels={hae:'HAE',aftercare:'Aftercare',delivery:'Delivery',retest:'Annual Retest',retestUnder:'Annual Retest',retestOver:'Annual Retest'};return labels[key]||'Appointment';}

function getSavedOutcomes(){
  try{return JSON.parse(localStorage.getItem('meSavedOutcomes')||'[]')}catch(e){return[]}
}
function setSavedOutcomes(items){localStorage.setItem('meSavedOutcomes',JSON.stringify(items))}
function saveOutcome(){
  if(!currentAppointment){alert('Select an appointment type first.');return;}
  if(!document.getElementById('output').value.trim())generateNote();
  const note=document.getElementById('output').value.trim();
  if(!note){alert('Generate a note before saving an outcome.');return;}

  let label=(document.getElementById('currentPatientLabel')?.value||'').trim();
  let reminder=(document.getElementById('currentPatientReminder')?.value||'').trim();

  if(!label){
    const entered=prompt('Patient label (use initials, first name, or appointment time):','');
    if(entered===null)return;
    label=entered.trim();
  }
  if(!reminder){
    reminder=prompt('Optional quick reminder/status (example: needs closeout, waiting on payment, call back):','')||'';
  }

  const appointmentState=collectDraftState();
  appointmentState.generatedNote=note;
  appointmentState.patientLabel=label;
  appointmentState.patientReminder=reminder;

  const items=getSavedOutcomes();
  items.unshift({
    id:Date.now().toString(),
    label:capFirst(label||'Unnamed patient'),
    appointment:appointmentLabel(),
    appointmentKey:currentAppointment,
    reminder:capFirst(reminder),
    note:note,
    state:appointmentState,
    closed:false,
    savedAt:new Date().toLocaleTimeString([], {hour:'numeric', minute:'2-digit'}),
    savedDate:new Date().toLocaleDateString()
  });
  setSavedOutcomes(items);
  renderOutcomes();
  toast('✓ Outcome saved. Form cleared.');
  clearAll();
  document.getElementById('copyStatus').textContent='Outcome saved to Saved Outcomes. Form cleared.';
  showTab('outcomes',document.querySelectorAll('.tab-btn')[1]);
  renderOutcomes();
}
function escapeHtml(text){return String(text||'').replace(/[&<>'"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]})}
function renderOutcomes(){
  const list=document.getElementById('outcomeList');
  const summary=document.getElementById('outcomeSummary');
  if(!list)return;
  const query=(document.getElementById('outcomeSearch')?.value||'').toLowerCase().trim();
  let items=getSavedOutcomes();
  const allPending=items.filter(x=>!x.closed).length;
  const allClosed=items.filter(x=>x.closed).length;
  if(query){
    items=items.filter(item=>[item.label,item.appointment,item.reminder,item.note,item.savedAt].join(' ').toLowerCase().includes(query));
  }
  const pending=items.filter(x=>!x.closed);
  const closed=items.filter(x=>x.closed);
  if(summary){summary.innerHTML=`🟡 Pending: <b>${allPending}</b> &nbsp; | &nbsp; 🟢 Closed: <b>${allClosed}</b>${query?` &nbsp; | &nbsp; Filtered results: <b>${items.length}</b>`:''}`;}
  if(!items.length){list.innerHTML='<p>No saved outcomes found.</p>';return;}

  function card(item){
    return `<div class="outcome-card ${item.closed?'closed':''}"><div class="outcome-head"><div><div class="outcome-title">${escapeHtml(item.label)} <span class="badge">${escapeHtml(item.appointment)}</span></div><div class="muted">Saved ${escapeHtml(item.savedAt)}${item.savedDate?` • ${escapeHtml(item.savedDate)}`:''}${item.closed?' • Closed':''}</div>${item.reminder?`<div class="muted">Reminder: ${escapeHtml(item.reminder)}</div>`:''}</div></div><div class="outcome-note" id="outcomeNote_${item.id}">${escapeHtml(item.note)}</div><div class="outcome-actions"><button class="tiny info" onclick="copyOutcome('${item.id}',this)">Copy</button><button class="tiny secondary" onclick="editOutcome('${item.id}')">Edit</button><button class="tiny secondary" onclick="toggleOutcomeClosed('${item.id}')">${item.closed?'Mark Pending':'Mark Closed'}</button><button class="tiny danger-outline" onclick="deleteOutcome('${item.id}')">Delete</button></div></div>`;
  }

  let html='';
  if(pending.length){html+=`<h3>🟡 Pending (${pending.length})</h3>`+pending.map(card).join('');}
  if(closed.length){html+=`<h3 style="margin-top:22px">🟢 Closed (${closed.length})</h3>`+closed.map(card).join('');}
  list.innerHTML=html;
}
function copyOutcome(id,button){
  const item=getSavedOutcomes().find(x=>x.id===id);
  if(!item)return;
  navigator.clipboard?.writeText(item.note).then(()=>{},()=>{});
  const temp=document.createElement('textarea');temp.value=item.note;document.body.appendChild(temp);temp.select();document.execCommand('copy');document.body.removeChild(temp);
  toast('✓ Saved outcome copied.');
  if(button){const old=button.textContent;button.textContent='Copied ✓';button.classList.add('success-outline');setTimeout(()=>{button.textContent=old;button.classList.remove('success-outline');},1400);}
}
function toggleOutcomeClosed(id){let items=getSavedOutcomes();items=items.map(x=>x.id===id?{...x,closed:!x.closed}:x);setSavedOutcomes(items);renderOutcomes()}
function deleteOutcome(id){if(!confirm('Delete this saved outcome?'))return;setSavedOutcomes(getSavedOutcomes().filter(x=>x.id!==id));renderOutcomes()}
function clearClosedOutcomes(){setSavedOutcomes(getSavedOutcomes().filter(x=>!x.closed));renderOutcomes()}
function clearAllOutcomes(){if(!confirm('Clear all saved outcomes?'))return;setSavedOutcomes([]);renderOutcomes()}
function exportTodaysOutcomes(){
  const items=getSavedOutcomes();
  if(!items.length){alert('No saved outcomes to export.');return;}
  const today=new Date().toLocaleDateString();
  let text='Saved Outcomes - '+today+'\n\n';
  items.forEach(item=>{
    text += `${item.closed?'[CLOSED]':'[PENDING]'} ${item.savedAt||''} | ${item.label||''} | ${item.appointment||''}\n`;
    if(item.reminder)text += `Reminder: ${item.reminder}\n`;
    text += `${item.note||''}\n\n`;
  });
  const blob=new Blob([text],{type:'text/plain'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='Saved_Outcomes_'+new Date().toISOString().slice(0,10)+'.txt';
  document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(a.href);toast('✓ Saved outcomes exported.');
}

function copyNote(silent=false){const o=document.getElementById('output');o.select();o.setSelectionRange(0,99999);try{document.execCommand('copy');document.getElementById('copyStatus').textContent=silent?'Note generated and copied.':'Note copied.';toast(silent?'✓ Note generated and copied.':'✓ Note copied.')}catch(e){document.getElementById('copyStatus').textContent='Copy failed. Highlight and copy manually.'}}
function clearAll(){
  currentAppointment='';
  replacedItems=[];
  document.querySelectorAll('.appt-card').forEach(c=>c.classList.remove('active'));
  const workflow=document.getElementById('workflow');
  if(workflow)workflow.innerHTML='<h3>Workflow</h3><p>Select an appointment type above.</p>';
  ['details','output','copyStatus','currentPatientLabel','currentPatientReminder'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';if(id==='copyStatus'&&el)el.textContent='';});
  clearActiveDraft('Unfinished appointment cleared.');
  renderDashboard();
}
function markNoteAsNotGenerated(){if(currentAppointment){const out=document.getElementById('output');if(out.value.trim()){out.value='';document.getElementById('copyStatus').textContent='Changes made. Click Generate Note when finished.'}}}

let restoringDraft=false;let draftTimer=null;
function toast(message){const t=document.getElementById('toast');if(!t)return;t.textContent=message;t.classList.add('show');clearTimeout(window.__toastTimer);window.__toastTimer=setTimeout(()=>t.classList.remove('show'),2200)}
function setAutosaveStatus(message){const el=document.getElementById('autosaveStatus');if(el)el.textContent=message}
function collectDraftState(){
  const state={version:'1.0.1',appointment:currentAppointment,fields:{},radios:{},replacedItems:[...replacedItems],savedAt:new Date().toISOString()};
  document.querySelectorAll('#notes input[id], #notes select[id], #notes textarea[id]').forEach(el=>{
    if(el.id==='output')return;
    state.fields[el.id]={type:el.type||el.tagName.toLowerCase(),checked:!!el.checked,value:el.value};
  });
  const radioNames=[...new Set([...document.querySelectorAll('#notes input[type="radio"][name]')].map(r=>r.name))];
  radioNames.forEach(name=>{const checkedRadio=document.querySelector(`#notes input[type="radio"][name="${name}"]:checked`);state.radios[name]=checkedRadio?checkedRadio.value:''});
  return state;
}
function clearActiveDraft(message){
  try{localStorage.removeItem('meClinicalAssistantDraft');setAutosaveStatus(message||'No unfinished appointment.')}catch(e){}
}
function saveDraftNow(message){
  if(restoringDraft)return;
  if(!currentAppointment){clearActiveDraft('No unfinished appointment.');return;}
  try{localStorage.setItem('meClinicalAssistantDraft',JSON.stringify(collectDraftState()));setAutosaveStatus(message||'Unfinished appointment autosaved.')}catch(e){setAutosaveStatus('Autosave unavailable.')}
}
function saveDraftDebounced(){clearTimeout(draftTimer);draftTimer=setTimeout(()=>saveDraftNow('Unfinished appointment autosaved.'),650)}
function applyAppointmentState(state, options={}){
  if(!state||!state.appointment)return false;
  const card=document.querySelector(`.appt-card[onclick*="${state.appointment}"]`);
  if(!card)return false;
  restoringDraft=true;
  loadAppointment(state.appointment,card);
  const fields=state.fields||{};
  function applyField(id,data){
    const el=document.getElementById(id);
    if(!el||!data)return;
    if(el.type==='checkbox')el.checked=!!data.checked;
    else if(el.type==='radio'){}
    else el.value=data.value||'';
  }
  Object.keys(fields).forEach(id=>{if(id!=='replaceStyle'&&id!=='replaceSize')applyField(id,fields[id])});
  if(document.getElementById('replaceCategory'))updateReplacementOptions();
  applyField('replaceStyle',fields.replaceStyle);
  if(document.getElementById('replaceStyle'))updateReplacementSizes();
  applyField('replaceSize',fields.replaceSize);
  Object.keys(fields).forEach(id=>applyField(id,fields[id]));
  Object.entries(state.radios||{}).forEach(([name,value])=>{
    if(!value)return;
    const radios=[...document.querySelectorAll(`#notes input[type="radio"][name="${name}"]`)];
    const el=radios.find(r=>r.value===value);
    if(el)el.checked=true;
  });
  replacedItems=Array.isArray(state.replacedItems)?state.replacedItems:[];
  renderReplacedList();
  if(options.outputNote){document.getElementById('output').value=options.outputNote;}
  else {document.getElementById('output').value='';}
  if(state.patientLabel&&document.getElementById('currentPatientLabel'))document.getElementById('currentPatientLabel').value=state.patientLabel;
  if(state.patientReminder&&document.getElementById('currentPatientReminder'))document.getElementById('currentPatientReminder').value=state.patientReminder;
  restoringDraft=false;
  return true;
}

function restoreSavedOutcomeForEdit(item){
  if(!item||!item.state||!item.state.appointment)return false;
  const state=item.state;
  const card=document.querySelector(`.appt-card[onclick*="${state.appointment}"]`);
  if(!card)return false;

  // Use a conservative restore path here. Saved Outcome editing should never
  // depend on appointment-specific helper functions being present.
  restoringDraft=true;
  try{
    loadAppointment(state.appointment,card);
    const fields=state.fields||{};

    Object.entries(fields).forEach(([id,data])=>{
      const el=document.getElementById(id);
      if(!el||!data)return;
      try{
        if(el.type==='checkbox')el.checked=!!data.checked;
        else if(el.type!=='radio')el.value=(data.value ?? '');
      }catch(e){}
    });

    Object.entries(state.radios||{}).forEach(([name,value])=>{
      if(!value)return;
      try{
        const radios=[...document.querySelectorAll(`#notes input[type="radio"][name="${name}"]`)];
        const radioEl=radios.find(r=>r.value===value);
        if(radioEl)radioEl.checked=true;
      }catch(e){}
    });

    replacedItems=Array.isArray(state.replacedItems)?[...state.replacedItems]:[];
    try{renderReplacedList();}catch(e){}

    // Expand top-level workflow cards whose section checkbox was restored.
    document.querySelectorAll('.workflow-card').forEach(cardEl=>{
      try{
        const sectionCheck=cardEl.querySelector('.workflow-head input[type="checkbox"]');
        cardEl.classList.toggle('active',!!(sectionCheck&&sectionCheck.checked));
      }catch(e){}
    });

    const output=document.getElementById('output');
    if(output)output.value=(item.note&&item.note!=='(Draft saved before note was generated.)')?item.note:(state.generatedNote||'');

    const patientLabel=document.getElementById('currentPatientLabel');
    if(patientLabel)patientLabel.value=state.patientLabel||item.label||'';
    const patientReminder=document.getElementById('currentPatientReminder');
    if(patientReminder)patientReminder.value=state.patientReminder||item.reminder||'';

    return true;
  } finally {
    restoringDraft=false;
  }
}

function editOutcome(id){
  const item=getSavedOutcomes().find(x=>x.id===id);
  if(!item){alert('This saved outcome could not be found.');return;}
  if(!item.state){
    alert('This saved outcome was created before edit support was added. You can copy the note, but the original checkbox selections cannot be restored.');
    return;
  }

  try{
    const ok=restoreSavedOutcomeForEdit(item);
    if(!ok){
      alert('This saved outcome could not be restored because its appointment type is no longer available.');
      return;
    }

    editingOutcomeId=item.id;
    const notesButton=document.querySelectorAll('.tab-btn')[1];
    showTab('notes',notesButton);

    const status=getOutcomeStatus(item);
    const copyStatus=document.getElementById('copyStatus');
    if(copyStatus)copyStatus.textContent=status==='draft'
      ?'Unfinished appointment resumed. Make changes, then Generate & Copy Note or Save Outcome.'
      :'Saved outcome reopened for editing. Saving will update this existing outcome.';
    toast(status==='draft'?'Unfinished appointment resumed.':'✓ Saved outcome opened for editing.');
    document.getElementById('workflow')?.scrollIntoView({behavior:'smooth',block:'start'});
  }catch(err){
    editingOutcomeId=null;
    console.error('Edit Saved Outcome failed:',err);
    alert('Could not reopen this saved outcome for editing. The saved note is still safe.');
    showTab('outcomes',document.querySelectorAll('.tab-btn')[2]);
  }
}
function showVersionInfo(){
  alert(`Miracle-Ear Clinical Assistant 1.0.1

Focused polish build with the stable RC5 workflow and permanent App/Data/Backups structure.

Added/changed:
• Saved Outcomes search
• Pending vs Closed sections
• Export Saved Outcomes
• Clear Closed / Clear All workflow
• Current Patient quick label fields
• Resume Last Appointment prompt
• Removed backup buttons from main toolbar
• Added portable launcher and sharing workflow
• Added Help, Check App Health, and Check for Updates buttons
• Added Settings for financing companies and programming presets
• Firmware Update remains its own checkbox and is not included as a Programming Changes preset.
• Portable structure now uses App, Data, and Backups folders.
• Desktop shortcut creator has been removed for better company-computer compatibility.

Still browser-based and company-computer friendly.`);
}

function showHelp(){
  alert(`Miracle-Ear Clinical Assistant Help

How to use:
1. Choose an appointment type.
2. Work through the workflow cards.
3. Click Generate Note when finished.
4. Copy the note into Sycle or Save Outcome for later.

Saved Outcomes:
• Save Outcome stores the generated note on this computer/browser.
• Use Search to quickly find saved outcomes.
• Mark Closed once the appointment is closed out.
• Export Saved Outcomes creates a text file for your records.
• Clear Closed removes completed outcomes.

Keyboard shortcuts:
• Ctrl + Enter = Generate Note
• Ctrl + S = Save Outcome
• Ctrl + 1–5 = Switch tabs

Sharing:
Share the whole folder, not just index.html. The css, js, and assets folders must stay next to index.html.`);
}
function runHealthCheck(){
  const checks=[];
  checks.push(['CSS loaded', !!document.querySelector('link[href="css/styles.css"]')]);
  checks.push(['JavaScript running', true]);
  checks.push(['Logo path present', !!document.querySelector('img[src="assets/logo.png"]')]);
  checks.push(['Local storage available', (function(){try{localStorage.setItem('__me_test','1');localStorage.removeItem('__me_test');return true;}catch(e){return false;}})()]);
  const message=checks.map(([name,ok])=>`${ok?'✓':'✕'} ${name}`).join('\n');
  alert('App Health Check\n\n'+message+'\n\nIf the page looks plain or unstyled, make sure you extracted the ZIP and opened index.html from the extracted folder.');
}

function checkForUpdates(){alert('Update check\n\nCurrent version: 1.0.1\n\nThis portable/browser version cannot automatically download updates yet. For now, keep the latest ZIP in OneDrive and replace the app folder when a new version is released.');}
function activateTabByIndex(index){const btn=document.querySelectorAll('.tab-btn')[index];if(btn)btn.click()}

window.addEventListener('load',()=>{setTimeout(()=>document.getElementById('splash')?.classList.add('hidden'),650);restoreDraft();renderOutcomes();});
document.addEventListener('input',e=>{if(e.target.id!=='output'){markNoteAsNotGenerated();saveDraftDebounced();}});
document.addEventListener('change',e=>{markNoteAsNotGenerated();saveDraftDebounced();});
document.addEventListener('keydown',e=>{
  if(e.ctrlKey&&e.key==='Enter'){e.preventDefault();generateNote();toast('✓ Note generated.');saveDraftNow('Draft autosaved.');}
  if(e.ctrlKey&&e.key.toLowerCase()==='s'){e.preventDefault();saveOutcome();}
  if(e.ctrlKey&&['1','2','3','4','5','6','7'].includes(e.key)){e.preventDefault();activateTabByIndex(Number(e.key)-1);}
});
renderOutcomes();
/* =========================
   1.0.1 workflow/dashboard layer
   ========================= */
function getOutcomeStatus(item){
  if(item.status)return item.status;
  return item.closed?'closed':'pending';
}
function setOutcomeStatus(item,status){
  item.status=status;
  item.closed=(status==='closed');
  return item;
}
function startAppointment(type){
  const card=[...document.querySelectorAll('.appt-card')].find(c=>String(c.getAttribute('onclick')||'').includes("'"+type+"'")||String(c.getAttribute('onclick')||'').includes('("'+type+'")'));
  showTab('notes',document.querySelectorAll('.tab-btn')[1]);
  const notesCard=[...document.querySelectorAll('#notes .appt-card')].find(c=>String(c.getAttribute('onclick')||'').includes("'"+type+"'"));
  if(notesCard)loadAppointment(type,notesCard);
}
function getActiveDraft(){
  try{return JSON.parse(localStorage.getItem('meClinicalAssistantDraft')||'null')}catch(e){return null}
}
function resumeActiveDraft(){
  const draft=getActiveDraft();
  if(!draft){toast('No unfinished appointment found.');return;}
  if(applyAppointmentState(draft,{outputNote:draft.generatedNote||''})){
    showTab('notes',document.querySelectorAll('.tab-btn')[1]);
    document.getElementById('copyStatus').textContent='Unfinished appointment resumed. Make changes, then Generate & Copy Note or Save Outcome.';
    toast('✓ Unfinished appointment resumed.');
  }
}
function discardActiveDraft(){
  if(!confirm('Discard the unfinished appointment?'))return;
  clearActiveDraft('Unfinished appointment discarded.');
  renderDashboard();
  toast('Unfinished appointment discarded.');
}
function renderDashboard(){
  const items=getSavedOutcomes();
  const draft=getActiveDraft();
  const pending=items.filter(x=>getOutcomeStatus(x)==='pending');
  const closed=items.filter(x=>getOutcomeStatus(x)==='closed');
  const cards=document.getElementById('dashboardCards');
  if(cards){
    const draftLabel=draft&&draft.appointment?appointmentLabelForKey(draft.appointment):'None';
    cards.innerHTML=`
      <div class="dashboard-card"><div class="number">${draft?'1':'0'}</div><div class="label">Unfinished Appointment</div>${draft?`<div class="muted">${escapeHtml(draftLabel)}</div><button class="tiny" onclick="resumeActiveDraft()">Resume</button><button class="tiny secondary" onclick="discardActiveDraft()">Discard</button>`:`<button class="tiny" onclick="showTab('notes',document.querySelectorAll('.tab-btn')[1])">Start Appointment</button>`}</div>
      <div class="dashboard-card"><div class="number">${pending.length}</div><div class="label">Pending Saved Outcomes</div><button class="tiny" onclick="showTab('outcomes',document.querySelectorAll('.tab-btn')[2])">Open Saved Outcomes</button></div>
      <div class="dashboard-card"><div class="number">${closed.length}</div><div class="label">Completed</div><button class="tiny secondary" onclick="showTab('outcomes',document.querySelectorAll('.tab-btn')[2])">Review Completed</button></div>
      <div class="dashboard-card"><div class="number">1.0.1</div><div class="label">Current Version</div><button class="tiny secondary" onclick="showVersionInfo()">What's New</button></div>`;
  }
  const recent=document.getElementById('homeRecent');
  if(recent){
    if(!items.length){recent.innerHTML='<p class="muted">No saved activity yet.</p>';return;}
    recent.innerHTML=items.slice(0,5).map(item=>`<div class="outcome-card ${getOutcomeStatus(item)==='closed'?'closed':''}"><div class="outcome-title">${escapeHtml(item.label||'Unnamed')} <span class="badge">${escapeHtml(item.appointment||'Appointment')}</span> <span class="badge status-${getOutcomeStatus(item)}">${getOutcomeStatus(item)==='closed'?'Completed':'Pending'}</span></div><div class="muted">${escapeHtml(item.savedAt||'')} ${item.reminder?' • '+escapeHtml(item.reminder):''}</div><div class="outcome-actions"><button class="tiny" onclick="editOutcome('${item.id}')">Edit</button><button class="tiny secondary" onclick="copyOutcome('${item.id}',this)">Copy</button></div></div>`).join('');
  }
}
function expandRestoredUI(){
  document.querySelectorAll('.workflow-card').forEach(card=>{
    const sec=card.querySelector('.workflow-head input[type="checkbox"]');
    if(sec&&sec.checked)card.classList.add('active');
    else card.classList.remove('active');
  });
  document.querySelectorAll('#notes input[type="checkbox"]:checked, #notes input[type="radio"]:checked').forEach(el=>{
    try{el.dispatchEvent(new Event('change',{bubbles:false}));}catch(e){}
  });
  document.querySelectorAll('.workflow-card').forEach(card=>{
    const sec=card.querySelector('.workflow-head input[type="checkbox"]');
    if(sec&&sec.checked)card.classList.add('active');
  });
}
function applyAppointmentState(state, options={}){
  if(!state||!state.appointment)return false;
  const card=document.querySelector(`.appt-card[onclick*="${state.appointment}"]`);
  if(!card)return false;
  restoringDraft=true;
  loadAppointment(state.appointment,card);
  const fields=state.fields||{};
  function applyField(id,data){
    const el=document.getElementById(id);
    if(!el||!data)return;
    if(el.type==='checkbox')el.checked=!!data.checked;
    else if(el.type==='radio'){}
    else el.value=data.value||'';
  }
  Object.keys(fields).forEach(id=>{if(id!=='replaceStyle'&&id!=='replaceSize')applyField(id,fields[id])});
  if(document.getElementById('replaceCategory'))updateReplacementOptions();
  applyField('replaceStyle',fields.replaceStyle);
  if(document.getElementById('replaceStyle'))updateReplacementSizes();
  applyField('replaceSize',fields.replaceSize);
  Object.keys(fields).forEach(id=>applyField(id,fields[id]));
  Object.entries(state.radios||{}).forEach(([name,value])=>{
    if(!value)return;
    const radios=[...document.querySelectorAll(`#notes input[type="radio"][name="${name}"]`)];
    const el=radios.find(r=>r.value===value);
    if(el)el.checked=true;
  });
  replacedItems=Array.isArray(state.replacedItems)?state.replacedItems:[];
  renderReplacedList();
  if(document.getElementById('delFitSide'))updateFirstFitOpposite('del');
  expandRestoredUI();
  document.getElementById('output').value=options.outputNote||state.generatedNote||'';
  if(state.patientLabel&&document.getElementById('currentPatientLabel'))document.getElementById('currentPatientLabel').value=state.patientLabel;
  if(state.patientReminder&&document.getElementById('currentPatientReminder'))document.getElementById('currentPatientReminder').value=state.patientReminder;
  restoringDraft=false;
  return true;
}
function saveDraftEntry(){saveDraftNow('Unfinished appointment autosaved.')}
function saveOutcome(){
  if(!currentAppointment){alert('Select an appointment type first.');return;}
  if(!document.getElementById('output').value.trim())generateNote();
  const note=document.getElementById('output').value.trim();
  if(!note){alert('Generate a note before saving an outcome.');return;}
  let label=(document.getElementById('currentPatientLabel')?.value||'').trim();
  let reminder=(document.getElementById('currentPatientReminder')?.value||'').trim();
  if(!label){const entered=prompt('Patient label (use initials, first name, or appointment time):','');if(entered===null)return;label=entered.trim();}
  if(!reminder){reminder=prompt('Optional quick reminder/status (example: needs closeout, waiting on payment, call back):','')||'';}
  const appointmentState=collectDraftState();
  appointmentState.generatedNote=note;appointmentState.patientLabel=label;appointmentState.patientReminder=reminder;
  let items=getSavedOutcomes();
  const existingIndex=editingOutcomeId?items.findIndex(x=>x.id===editingOutcomeId):-1;
  if(existingIndex>=0){
    const existing=items[existingIndex];
    items[existingIndex]={...existing,label:capFirst(label||'Unnamed patient'),appointment:appointmentLabel(),appointmentKey:currentAppointment,reminder:capFirst(reminder),note,state:appointmentState,savedAt:new Date().toLocaleTimeString([], {hour:'numeric', minute:'2-digit'}),savedDate:new Date().toLocaleDateString()};
    setSavedOutcomes(items);editingOutcomeId=null;clearActiveDraft('Outcome updated. No unfinished appointment.');toast('✓ Saved outcome updated. Form cleared.');clearAll();document.getElementById('copyStatus').textContent='Saved outcome updated. Form cleared.';
  }else{
    items.unshift({id:Date.now().toString(),label:capFirst(label||'Unnamed patient'),appointment:appointmentLabel(),appointmentKey:currentAppointment,reminder:capFirst(reminder),note,state:appointmentState,status:'pending',closed:false,savedAt:new Date().toLocaleTimeString([], {hour:'numeric', minute:'2-digit'}),savedDate:new Date().toLocaleDateString()});
    setSavedOutcomes(items);clearActiveDraft('Outcome saved. No unfinished appointment.');toast('✓ Outcome saved. Form cleared.');clearAll();document.getElementById('copyStatus').textContent='Outcome saved to Saved Outcomes. Form cleared.';
  }
  showTab('outcomes',document.querySelectorAll('.tab-btn')[2]);renderOutcomes();renderDashboard();
}
function renderOutcomes(){
  const list=document.getElementById('outcomeList');
  const summary=document.getElementById('outcomeSummary');
  if(!list)return;
  const query=(document.getElementById('outcomeSearch')?.value||'').toLowerCase().trim();
  let items=getSavedOutcomes();
  const totalPending=items.filter(x=>getOutcomeStatus(x)==='pending').length;
  const totalClosed=items.filter(x=>getOutcomeStatus(x)==='closed').length;
  if(query){items=items.filter(item=>[item.label,item.appointment,item.reminder,item.note,item.savedAt,getOutcomeStatus(item)].join(' ').toLowerCase().includes(query));}
  const pending=items.filter(x=>getOutcomeStatus(x)==='pending');
  const closed=items.filter(x=>getOutcomeStatus(x)==='closed');
  if(summary){summary.innerHTML=`🟡 Pending: <b>${totalPending}</b> &nbsp; | &nbsp; 🟢 Completed: <b>${totalClosed}</b>${query?` &nbsp; | &nbsp; Filtered results: <b>${items.length}</b>`:''}`;}
  if(!items.length){list.innerHTML='<p>No saved outcomes found.</p>';return;}
  function card(item){
    const status=getOutcomeStatus(item);
    const statusLabel=status==='draft'?'Draft':status==='closed'?'Completed':'Pending';
    return `<div class="outcome-card ${status==='draft'?'draft':''} ${status==='closed'?'closed':''}"><div class="outcome-head"><div><div class="outcome-title">${escapeHtml(item.label)} <span class="badge">${escapeHtml(item.appointment)}</span> <span class="badge status-${status}">${statusLabel}</span></div><div class="muted">Saved ${escapeHtml(item.savedAt)}${item.savedDate?` • ${escapeHtml(item.savedDate)}`:''}</div>${item.reminder?`<div class="muted">Reminder: ${escapeHtml(item.reminder)}</div>`:''}</div></div><div class="outcome-note" id="outcomeNote_${item.id}">${escapeHtml(item.note)}</div><div class="outcome-actions"><button class="tiny info" onclick="copyOutcome('${item.id}',this)">Copy</button><button class="tiny secondary" onclick="editOutcome('${item.id}')">${status==='draft'?'Resume':'Edit'}</button><button class="tiny success-outline" onclick="setSingleOutcomeStatus('${item.id}','${status==='closed'?'pending':'closed'}')">${status==='closed'?'Mark Pending':'Mark Complete'}</button><button class="tiny danger-outline" onclick="deleteOutcome('${item.id}')">Delete</button></div></div>`;
  }
  let html='';
  if(pending.length){html+=`<h3 style="margin-top:22px">🟡 Pending (${pending.length})</h3>`+pending.map(card).join('');}
  if(closed.length){html+=`<h3 style="margin-top:22px">🟢 Completed (${closed.length})</h3>`+closed.map(card).join('');}
  list.innerHTML=html;
}
function setSingleOutcomeStatus(id,status){let items=getSavedOutcomes();items=items.map(x=>x.id===id?setOutcomeStatus({...x},status):x);setSavedOutcomes(items);renderOutcomes();renderDashboard();}
function toggleOutcomeClosed(id){const item=getSavedOutcomes().find(x=>x.id===id);setSingleOutcomeStatus(id,getOutcomeStatus(item)==='closed'?'pending':'closed')}
function markAllOutcomesComplete(){if(!confirm('Mark all pending outcomes as complete?'))return;let items=getSavedOutcomes().map(x=>getOutcomeStatus(x)==='pending'?setOutcomeStatus({...x},'closed'):x);setSavedOutcomes(items);renderOutcomes();renderDashboard();}
function clearCompletedOutcomes(){if(!confirm('Clear all completed saved outcomes? Pending outcomes will stay.'))return;setSavedOutcomes(getSavedOutcomes().filter(x=>getOutcomeStatus(x)!=='closed'));renderOutcomes();renderDashboard();}
function clearClosedOutcomes(){clearCompletedOutcomes();}
function clearAllOutcomes(){if(!confirm('Clear all saved outcomes?'))return;setSavedOutcomes([]);renderOutcomes();renderDashboard();}
function editOutcome(id){
  const item=getSavedOutcomes().find(x=>x.id===id);
  if(!item){alert('This saved outcome could not be found.');return;}
  if(!item.state){alert('This saved outcome was created before edit support was added. You can copy the note, but the original checkbox selections cannot be restored.');return;}
  const notesButton=document.querySelectorAll('.tab-btn')[1];
  try{
    showTab('notes',notesButton);
    const ok=applyAppointmentState(item.state,{outputNote:item.note&&item.note!=='(Draft saved before note was generated.)'?item.note:''});
    if(!ok)throw new Error('Saved appointment state could not be restored.');
    editingOutcomeId=item.id;
    const status=getOutcomeStatus(item);
    const copyStatus=document.getElementById('copyStatus');
    if(copyStatus)copyStatus.textContent=status==='draft'?'Unfinished appointment resumed. Make changes, then Generate & Copy Note or Save Outcome.':'Saved outcome reopened for editing. Saving will update this existing outcome.';
    toast(status==='draft'?'Unfinished appointment resumed.':'✓ Saved outcome opened for editing.');
    document.getElementById('workflow')?.scrollIntoView({behavior:'smooth',block:'start'});
  }catch(err){
    editingOutcomeId=null;console.error('Edit Saved Outcome failed:',err);alert('Could not reopen this saved outcome for editing. The saved note is still safe.');showTab('outcomes',document.querySelectorAll('.tab-btn')[2]);
  }
}
function showVersionInfo(){alert(`Miracle-Ear Clinical Assistant 1.0.1\n\nFocused polish build using the RC5 workflow baseline.\n\nAdded/changed:\n• Home Dashboard with quick start, counters, and recent activity\n• Automatic unfinished appointment autosave with Resume workflow\n• Saved Outcomes organized by Pending and Completed, with unfinished appointment handled from Home\n• Cleaner Saved Outcomes toolbar with Refresh removed\n• Edit/Resume now restores expanded workflow sections and submenus\n• Mark All Complete and Clear Completed workflow\n• Saved Outcome cards include clearer status badges\n• Generate & Copy remains the main note action\n\nStill browser-based and company-computer friendly.`);}
function showHelp(){alert(`Miracle-Ear Clinical Assistant Help\n\nHome:\n• Start a new appointment quickly.\n• See unfinished appointment status, pending outcomes, and completed outcomes at a glance.\n\nSycle Notes:\n1. Choose an appointment type.\n2. Work through the workflow cards.\n3. Click Generate & Copy Note when finished.\n4. Paste into Sycle or Save Outcome for later.\n\nSaved Outcomes:\n• Save Draft stores your current appointment without needing a finished note.\n• Save Outcome stores the generated note and clears the form.\n• Auto-save quietly protects unfinished appointment work.
• Resume/Edit restores the appointment screen, including expanded sections.\n• Mark Complete once the appointment is closed out.\n• Export Saved Outcomes creates a text file for your records.\n\nKeyboard shortcuts:\n• Ctrl + Enter = Generate & Copy Note\n• Ctrl + S = Save Outcome\n• Ctrl + 1–6 = Switch tabs`);}
function checkForUpdates(){alert('Update check\n\nCurrent version: 1.0.1\n\nThis portable/browser version cannot automatically download updates yet. For now, replace the App folder when a new update ZIP is released.');}
window.addEventListener('load',()=>{renderDashboard();});


/* =========================================================
   Miracle-Ear Clinical Assistant v1.0.3 patch layer
   Delivery First Fit redesign + dynamic AD/AS fitting
   ========================================================= */

replacementMap.eartip = {
  styles:['Open','Tulip'],
  sizes:{
    Open:['5mm','7mm','10mm','12mm'],
    Tulip:['5mm','7mm','10mm','12mm']
  }
};
replacementMap.mold = {styles:[''],sizes:{'':['']}};

const deliveryCouplingMap = {
  dome:{
    label:'Dome',
    types:['Open','Vented','Power','Cap'],
    sizes:{
      Open:['S','M','L'],
      Vented:['S','M','L'],
      Power:['S','M','L'],
      Cap:[]
    }
  },
  sleeve:{
    label:'Sleeve',
    types:['Vented','Closed','Power'],
    sizes:{
      Vented:['XS','S','M','L'],
      Closed:['XS','S','M','L'],
      Power:['XS','S','M','L']
    }
  },
  eartip:{
    label:'Eartip',
    types:['Open','Tulip'],
    sizes:{
      Open:['5mm','7mm','10mm','12mm'],
      Tulip:['5mm','7mm','10mm','12mm']
    }
  },
  mold:{
    label:'Mold',
    types:[],
    sizes:{}
  }
};

function deliveryEarCard(prefix, ear, label){
  return `<div class="subbox">
    <label class="inline-label">
      <input type="checkbox" id="${prefix}Fit${ear}Enabled" onchange="toggleDeliveryEar('${prefix}','${ear}',this.checked)">
      Fit ${label}
    </label>
    <div id="${prefix}Fit${ear}Box" class="hidden">
      <div class="grid-2">
        <div>
          <label class="inline-label">Receiver Length</label>
          <select id="${prefix}Fit${ear}ReceiverLength">
            <option value="">Select...</option>
            <option>0</option><option>1</option><option>2</option><option>3</option><option>4</option>
          </select>
        </div>
        <div>
          <label class="inline-label">Receiver Power</label>
          <select id="${prefix}Fit${ear}ReceiverPower">
            <option value="">Select...</option>
            <option>S</option><option>M</option><option>P</option>
          </select>
        </div>
      </div>
      <div class="grid-3">
        <div>
          <label class="inline-label">Coupling</label>
          <select id="${prefix}Fit${ear}Coupling" onchange="updateDeliveryCoupling('${prefix}','${ear}')">
            <option value="">Select...</option>
            <option value="dome">Dome</option>
            <option value="sleeve">Sleeve</option>
            <option value="eartip">Eartip</option>
            <option value="mold">Mold</option>
          </select>
        </div>
        <div id="${prefix}Fit${ear}TypeWrap">
          <label class="inline-label">Type</label>
          <select id="${prefix}Fit${ear}Type" onchange="updateDeliveryCouplingSize('${prefix}','${ear}')">
            <option value="">Select...</option>
          </select>
        </div>
        <div id="${prefix}Fit${ear}SizeWrap">
          <label class="inline-label">Size</label>
          <select id="${prefix}Fit${ear}Size">
            <option value="">Select...</option>
          </select>
        </div>
      </div>
      <button type="button" class="tiny" onclick="applyDeliveryFitBilaterally('${prefix}','${ear}')">
        Copy to Other Ear
      </button>
    </div>
  </div>`;
}

function firstFit(prefix){
  return `<div class="subbox">
    <label class="inline-label"><input type="checkbox" id="${prefix}FirstFit">First Fit Completed</label>
    <div class="row-title">User Experience</div>
    <label class="inline-label"><input type="radio" name="${prefix}User" value="new user">New User</label>
    <label class="inline-label"><input type="radio" name="${prefix}User" value="experienced user">Experienced User</label>
    <label class="inline-label"><input type="radio" name="${prefix}User" value="long-term user">Long-Term User</label>
    ${deliveryEarCard(prefix,'AD','Right / AD')}
    ${deliveryEarCard(prefix,'AS','Left / AS')}
  </div>`;
}

function toggleDeliveryEar(prefix,ear,show){
  toggleBox(`${prefix}Fit${ear}Box`,show);
}

function applyDeliveryFitBilaterally(prefix,sourceEar){
  const targetEar=sourceEar==='AD'?'AS':'AD';
  const source={
    length:val(`${prefix}Fit${sourceEar}ReceiverLength`),
    power:val(`${prefix}Fit${sourceEar}ReceiverPower`),
    coupling:val(`${prefix}Fit${sourceEar}Coupling`),
    type:val(`${prefix}Fit${sourceEar}Type`),
    size:val(`${prefix}Fit${sourceEar}Size`)
  };

  if(!source.length||!source.power||!source.coupling){
    alert(`Complete the receiver length, receiver power, and coupling for ${sourceEar} first.`);
    return;
  }

  if(source.coupling!=='mold'){
    if(!source.type){
      alert(`Select a coupling type for ${sourceEar} first.`);
      return;
    }
    const sizes=deliveryCouplingMap[source.coupling]?.sizes?.[source.type]||[];
    if(sizes.length&&!source.size){
      alert(`Select a coupling size for ${sourceEar} first.`);
      return;
    }
  }

  const targetEnabled=document.getElementById(`${prefix}Fit${targetEar}Enabled`);
  if(targetEnabled)targetEnabled.checked=true;
  toggleDeliveryEar(prefix,targetEar,true);

  document.getElementById(`${prefix}Fit${targetEar}ReceiverLength`).value=source.length;
  document.getElementById(`${prefix}Fit${targetEar}ReceiverPower`).value=source.power;
  document.getElementById(`${prefix}Fit${targetEar}Coupling`).value=source.coupling;

  updateDeliveryCoupling(prefix,targetEar);
  document.getElementById(`${prefix}Fit${targetEar}Type`).value=source.type;
  updateDeliveryCouplingSize(prefix,targetEar);
  document.getElementById(`${prefix}Fit${targetEar}Size`).value=source.size;

  markNoteAsNotGenerated();
  saveDraftDebounced();
  toast(`✓ ${sourceEar} fitting applied to ${targetEar}.`);
}

function updateDeliveryCoupling(prefix,ear){
  const coupling=val(`${prefix}Fit${ear}Coupling`);
  const type=document.getElementById(`${prefix}Fit${ear}Type`);
  const size=document.getElementById(`${prefix}Fit${ear}Size`);
  const typeWrap=document.getElementById(`${prefix}Fit${ear}TypeWrap`);
  const sizeWrap=document.getElementById(`${prefix}Fit${ear}SizeWrap`);
  if(!type||!size)return;

  type.innerHTML='<option value="">Select...</option>';
  size.innerHTML='<option value="">Select...</option>';

  const map=deliveryCouplingMap[coupling];
  const noType=!map||map.types.length===0;
  typeWrap?.classList.toggle('hidden',noType);
  sizeWrap?.classList.toggle('hidden',noType);

  if(!map)return;
  map.types.forEach(item=>type.innerHTML+=`<option value="${item}">${item}</option>`);
}

function updateDeliveryCouplingSize(prefix,ear){
  const coupling=val(`${prefix}Fit${ear}Coupling`);
  const type=val(`${prefix}Fit${ear}Type`);
  const size=document.getElementById(`${prefix}Fit${ear}Size`);
  const sizeWrap=document.getElementById(`${prefix}Fit${ear}SizeWrap`);
  if(!size)return;

  size.innerHTML='<option value="">Select...</option>';
  const sizes=deliveryCouplingMap[coupling]?.sizes?.[type]||[];
  sizeWrap?.classList.toggle('hidden',sizes.length===0);
  sizes.forEach(item=>size.innerHTML+=`<option value="${item}">${item}</option>`);
}

function deliveryEarData(prefix,ear){
  if(!checked(`${prefix}Fit${ear}Enabled`))return null;
  return {
    ear,
    length:val(`${prefix}Fit${ear}ReceiverLength`),
    power:val(`${prefix}Fit${ear}ReceiverPower`),
    coupling:val(`${prefix}Fit${ear}Coupling`),
    type:val(`${prefix}Fit${ear}Type`),
    size:val(`${prefix}Fit${ear}Size`)
  };
}

function validateDeliveryEar(data){
  if(!data.length||!data.power||!data.coupling){
    return `Please complete receiver length, receiver power, and coupling for ${data.ear}.`;
  }
  if(data.coupling!=='mold'){
    if(!data.type)return `Please select a coupling type for ${data.ear}.`;
    const sizes=deliveryCouplingMap[data.coupling]?.sizes?.[data.type]||[];
    if(sizes.length&&!data.size)return `Please select a coupling size for ${data.ear}.`;
  }
  return '';
}

function couplingPhrase(data,plural=false){
  if(data.coupling==='mold')return plural?'molds':'mold';
  const label=deliveryCouplingMap[data.coupling]?.label?.toLowerCase()||data.coupling;
  const parts=[data.size,data.type,label+(plural?'s':'')].filter(Boolean);
  return parts.join(' ');
}

function deliveryFitText(prefix){
  const ad=deliveryEarData(prefix,'AD');
  const as=deliveryEarData(prefix,'AS');
  const ears=[ad,as].filter(Boolean);
  if(!ears.length){
    alert('Select at least one ear under First Fit.');
    return null;
  }

  for(const ear of ears){
    const error=validateDeliveryEar(ear);
    if(error){alert(error);return null;}
  }

  const user=radio(prefix+'User');
  let text=user?`First fit completed for ${user}`:'First fit completed';

  if(ad&&as){
    const sameReceiver=ad.length===as.length&&ad.power===as.power;
    const sameCoupling=ad.coupling===as.coupling&&ad.type===as.type&&ad.size===as.size;
    if(sameReceiver&&sameCoupling){
      text+=` with ${ad.length}${ad.power} receivers AU using ${couplingPhrase(ad,true)}`;
      return text;
    }
  }

  const earParts=ears.map(data=>`${data.ear} ${data.length}${data.power} receiver using ${couplingPhrase(data,false)}`);
  text+=' with '+formatList(earParts);
  return text;
}

function renderDelivery(){
  return section('delBasics','Delivery Completed',`${otoscopy('del')}${cb('delDelivered','Delivered New Hearing Aids')}`)
    +section('delFit','Testing / Fitting',`${deliveryTests('del')}${firstFit('del')}${cb('delInsitu','Insitu Completed')}${cb('delCritical','Critical Gain Completed')}`)
    +section('delCounsel','Delivery Counseling',deliveryCounsel('del'))
    +section('delAdmin','Financing / My Essentials / Wrap Up',`${myEssentials('del')}<div class="subbox"><label class="inline-label"><input type="checkbox" id="delFinanceComplete" onchange="toggleBox('delFinanceBox',this.checked)">Financing Complete</label><div id="delFinanceBox" class="hidden"><label class="inline-label"><input type="radio" name="delFinanceCompany" value="PatientFi">PatientFi</label><label class="inline-label"><input type="radio" name="delFinanceCompany" value="Powerpay">Powerpay</label><label class="inline-label"><input type="radio" name="delFinanceCompany" value="Paymonthly/Care Credit">Paymonthly/Care Credit</label><label class="inline-label"><input type="radio" name="delFinanceCompany" value="HFD">HFD</label></div></div>${cb('delSatisfied','Patient Satisfied')}`);
}

function generateDelivery(){
  let arr=[];
  if(checked('sec_delBasics')){
    arr.push(otoscopyText('del'));
    if(checked('delDelivered'))arr.push('Delivered new hearing aids');
  }
  if(checked('sec_delFit')){
    if(checked('delTests')){
      let tests=[];
      document.querySelectorAll('.delTest:checked').forEach(b=>tests.push(b.value));
      arr.push(tests.length?formatList(tests)+' complete':'Delivery tests completed');
    }
    if(checked('delFirstFit')){
      const fit=deliveryFitText('del');
      if(fit===null)return null;
      arr.push(fit);
    }
    if(checked('delInsitu'))arr.push('Insitu completed');
    if(checked('delCritical'))arr.push('Critical gain completed');
  }
  if(checked('sec_delCounsel')){
    let c=[];
    document.querySelectorAll('.delCounsel:checked').forEach(b=>c.push(b.value));
    if(c.length)arr.push('Counseled on '+formatList(c));
  }
  if(checked('sec_delAdmin')){
    arr.push(essentialsText('del'));
    if(checked('delFinanceComplete')){
      let fc=radio('delFinanceCompany');
      arr.push(fc?'Financing complete through '+fc:'Financing complete');
    }
    if(checked('delSatisfied'))arr.push('Patient satisfied');
  }
  return arr.filter(Boolean);
}

function collectDraftState(){
  const state={version:'1.0.3',appointment:currentAppointment,fields:{},radios:{},replacedItems:[...replacedItems],savedAt:new Date().toISOString()};
  document.querySelectorAll('#notes input[id], #notes select[id], #notes textarea[id]').forEach(el=>{
    if(el.id==='output')return;
    state.fields[el.id]={type:el.type||el.tagName.toLowerCase(),checked:!!el.checked,value:el.value};
  });
  const radioNames=[...new Set([...document.querySelectorAll('#notes input[type="radio"][name]')].map(r=>r.name))];
  radioNames.forEach(name=>{
    const checkedRadio=document.querySelector(`#notes input[type="radio"][name="${name}"]:checked`);
    state.radios[name]=checkedRadio?checkedRadio.value:'';
  });
  return state;
}

function applyAppointmentStateCore(state, options={}){
  if(!state||!state.appointment)return false;
  const card=document.querySelector(`.appt-card[onclick*="${state.appointment}"]`);
  if(!card)return false;
  restoringDraft=true;
  loadAppointment(state.appointment,card);
  const fields=state.fields||{};

  function applyField(id,data){
    const el=document.getElementById(id);
    if(!el||!data)return;
    if(el.type==='checkbox')el.checked=!!data.checked;
    else if(el.type!=='radio')el.value=data.value||'';
  }

  const deferred=new Set([
    'replaceStyle','replaceSize',
    'delFitADType','delFitADSize',
    'delFitASType','delFitASSize'
  ]);

  Object.keys(fields).forEach(id=>{if(!deferred.has(id))applyField(id,fields[id]);});

  if(document.getElementById('replaceCategory'))updateReplacementOptions();
  applyField('replaceStyle',fields.replaceStyle);
  if(document.getElementById('replaceStyle'))updateReplacementSizes();
  applyField('replaceSize',fields.replaceSize);

  // Delivery-only fitting controls do not exist for HAE, Aftercare, or Retest.
  // Guard them before restoring so editing non-delivery Saved Outcomes cannot fail.
  ['AD','AS'].forEach(ear=>{
    const earBox=document.getElementById(`delFit${ear}Box`);
    if(!earBox)return;
    const enabled=checked(`delFit${ear}Enabled`);
    toggleDeliveryEar('del',ear,enabled);
    if(document.getElementById(`delFit${ear}Coupling`)){
      updateDeliveryCoupling('del',ear);
      applyField(`delFit${ear}Type`,fields[`delFit${ear}Type`]);
      updateDeliveryCouplingSize('del',ear);
      applyField(`delFit${ear}Size`,fields[`delFit${ear}Size`]);
    }
  });

  Object.entries(state.radios||{}).forEach(([name,value])=>{
    if(!value)return;
    const radios=[...document.querySelectorAll(`#notes input[type="radio"][name="${name}"]`)];
    const el=radios.find(r=>r.value===value);
    if(el)el.checked=true;
  });

  replacedItems=Array.isArray(state.replacedItems)?state.replacedItems:[];
  renderReplacedList();
  expandRestoredUI();
  document.getElementById('output').value=options.outputNote||state.generatedNote||'';
  if(state.patientLabel&&document.getElementById('currentPatientLabel'))document.getElementById('currentPatientLabel').value=state.patientLabel;
  if(state.patientReminder&&document.getElementById('currentPatientReminder'))document.getElementById('currentPatientReminder').value=state.patientReminder;
  restoringDraft=false;
  return true;
}

function showVersionInfo(){
  alert(`Miracle-Ear Clinical Assistant 1.0.3

Delivery fitting workflow update.

Added/changed:
• Copy to Other Ear copies a completed AD or AS fitting to the opposite ear
• Separate AD and AS First Fit cards
• Receiver length 0–4 for each ear
• Receiver power S, M, or P for each ear
• Dynamic Coupling → Type → Size selections
• Dome, Sleeve, Eartip, and Mold support
• Automatic fitting-note wording
• Matching bilateral fittings are summarized as AU
• Delivery selections restore correctly from autosaved drafts and Saved Outcomes
• Draft data version updated to 1.0.2

All existing appointment workflows and Saved Outcomes remain browser-based and company-computer friendly.`);
}

function checkForUpdates(){
  alert('Update check\n\nCurrent version: 1.0.3\n\nThis portable/browser version cannot automatically download updates yet. Replace the App folder—or this app.js file—when a new version is released.');
}

function renderDashboard(){
  const items=getSavedOutcomes();
  const draft=getActiveDraft();
  const pending=items.filter(x=>getOutcomeStatus(x)==='pending');
  const closed=items.filter(x=>getOutcomeStatus(x)==='closed');
  const cards=document.getElementById('dashboardCards');
  if(cards){
    const draftLabel=draft&&draft.appointment?appointmentLabelForKey(draft.appointment):'None';
    cards.innerHTML=`
      <div class="dashboard-card"><div class="number">${draft?'1':'0'}</div><div class="label">Unfinished Appointment</div>${draft?`<div class="muted">${escapeHtml(draftLabel)}</div><button class="tiny" onclick="resumeActiveDraft()">Resume</button><button class="tiny secondary" onclick="discardActiveDraft()">Discard</button>`:`<button class="tiny" onclick="showTab('notes',document.querySelectorAll('.tab-btn')[1])">Start Appointment</button>`}</div>
      <div class="dashboard-card"><div class="number">${pending.length}</div><div class="label">Pending Saved Outcomes</div><button class="tiny" onclick="showTab('outcomes',document.querySelectorAll('.tab-btn')[2])">Open Saved Outcomes</button></div>
      <div class="dashboard-card"><div class="number">${closed.length}</div><div class="label">Completed</div><button class="tiny secondary" onclick="showTab('outcomes',document.querySelectorAll('.tab-btn')[2])">Review Completed</button></div>
      <div class="dashboard-card"><div class="number">1.0.3</div><div class="label">Current Version</div><button class="tiny secondary" onclick="showVersionInfo()">What's New</button></div>`;
  }
  const recent=document.getElementById('homeRecent');
  if(recent){
    if(!items.length){recent.innerHTML='<p class="muted">No saved activity yet.</p>';return;}
    recent.innerHTML=items.slice(0,5).map(item=>`<div class="outcome-card ${getOutcomeStatus(item)==='closed'?'closed':''}"><div class="outcome-title">${escapeHtml(item.label||'Unnamed')} <span class="badge">${escapeHtml(item.appointment||'Appointment')}</span> <span class="badge status-${getOutcomeStatus(item)}">${getOutcomeStatus(item)==='closed'?'Completed':'Pending'}</span></div><div class="muted">${escapeHtml(item.savedAt||'')} ${item.reminder?' • '+escapeHtml(item.reminder):''}</div><div class="outcome-actions"><button class="tiny" onclick="editOutcome('${item.id}')">Edit</button><button class="tiny secondary" onclick="copyOutcome('${item.id}',this)">Copy</button></div></div>`).join('');
  }
}

function applyAppVersion(){
  document.querySelectorAll('[data-app-version]').forEach(el=>el.textContent=APP_VERSION);
  document.title='Clinical Assistant';
}

function myEssentials(prefix,allowDeferred=true){
  return `<div class="subbox"><div class="row-title">My Essentials</div>
  <label class="inline-label"><input type="radio" name="${prefix}Ess" value="Signed up for My Essentials">Accepted / Signed Up</label>
  <label class="inline-label"><input type="radio" name="${prefix}Ess" value="Declined My Essentials and signed waiver">Declined and Waiver Signed</label>
  ${allowDeferred?`<label class="inline-label"><input type="radio" name="${prefix}Ess" value="My Essentials decision deferred until delivery">Decide Upon Delivery</label>`:''}
  </div>`;
}

function renderDelivery(){
  return section('delBasics','Delivery Completed',`${otoscopy('del')}${cb('delDelivered','Delivered New Hearing Aids')}`)
  +section('delFit','Testing / Fitting',`${deliveryTests('del')}${firstFit('del')}${cb('delInsitu','Insitu Completed')}${cb('delCritical','Critical Gain Completed')}`)
  +section('delCounsel','Delivery Counseling',deliveryCounsel('del'))
  +section('delAdmin','Financing / My Essentials / Wrap Up',`${myEssentials('del',false)}<div class="subbox"><label class="inline-label"><input type="checkbox" id="delFinanceComplete" onchange="toggleBox('delFinanceBox',this.checked)">Financing Complete</label><div id="delFinanceBox" class="hidden"><label class="inline-label"><input type="radio" name="delFinanceCompany" value="PatientFi">PatientFi</label><label class="inline-label"><input type="radio" name="delFinanceCompany" value="Powerpay">Powerpay</label><label class="inline-label"><input type="radio" name="delFinanceCompany" value="Paymonthly/Care Credit">Paymonthly/Care Credit</label><label class="inline-label"><input type="radio" name="delFinanceCompany" value="HFD">HFD</label></div></div>${cb('delSatisfied','Patient Satisfied')}`);
}

function collectDraftState(){
  const state={version:APP_VERSION,appointment:currentAppointment,fields:{},radios:{},replacedItems:[...replacedItems],savedAt:new Date().toISOString()};
  document.querySelectorAll('#notes input[id], #notes select[id], #notes textarea[id]').forEach(el=>{
    if(el.id==='output')return;
    state.fields[el.id]={type:el.type||el.tagName.toLowerCase(),checked:!!el.checked,value:el.value};
  });
  const radioNames=[...new Set([...document.querySelectorAll('#notes input[type="radio"][name]')].map(r=>r.name))];
  radioNames.forEach(name=>{
    const selected=document.querySelector(`#notes input[type="radio"][name="${name}"]:checked`);
    state.radios[name]=selected?selected.value:'';
  });
  return state;
}

function showVersionInfo(){
  alert(`Miracle-Ear Clinical Assistant

Version ${APP_VERSION}
Last updated: July 29, 2026

What's new:
• Added Copy to Other Ear for matching bilateral Delivery fittings
• Removed Decide Upon Delivery from Delivery My Essentials
• Replaced the nonfunctional Check for Updates button with About
• Centralized the application version so every version display stays consistent
• Updated the application title for a cleaner appearance`);
}

function renderDashboard(){
  const items=getSavedOutcomes();
  const draft=getActiveDraft();
  const pending=items.filter(x=>getOutcomeStatus(x)==='pending');
  const closed=items.filter(x=>getOutcomeStatus(x)==='closed');
  const cards=document.getElementById('dashboardCards');
  if(cards){
    const draftLabel=draft&&draft.appointment?appointmentLabelForKey(draft.appointment):'None';
    cards.innerHTML=`
      <div class="dashboard-card"><div class="number">${draft?'1':'0'}</div><div class="label">Unfinished Appointment</div>${draft?`<div class="muted">${escapeHtml(draftLabel)}</div><button class="tiny" onclick="resumeActiveDraft()">Resume</button><button class="tiny secondary" onclick="discardActiveDraft()">Discard</button>`:`<button class="tiny" onclick="showTab('notes',document.querySelectorAll('.tab-btn')[1])">Start Appointment</button>`}</div>
      <div class="dashboard-card"><div class="number">${pending.length}</div><div class="label">Pending Saved Outcomes</div><button class="tiny" onclick="showTab('outcomes',document.querySelectorAll('.tab-btn')[2])">Open Saved Outcomes</button></div>
      <div class="dashboard-card"><div class="number">${closed.length}</div><div class="label">Completed</div><button class="tiny secondary" onclick="showTab('outcomes',document.querySelectorAll('.tab-btn')[2])">Review Completed</button></div>
      <div class="dashboard-card"><div class="number">${APP_VERSION}</div><div class="label">Current Version</div><button class="tiny secondary" onclick="showVersionInfo()">About</button></div>`;
  }
  const recent=document.getElementById('homeRecent');
  if(recent){
    if(!items.length){recent.innerHTML='<p class="muted">No saved activity yet.</p>';return;}
    recent.innerHTML=items.slice(0,5).map(item=>`<div class="outcome-card ${getOutcomeStatus(item)==='closed'?'closed':''}"><div class="outcome-title">${escapeHtml(item.label||'Unnamed')} <span class="badge">${escapeHtml(item.appointment||'Appointment')}</span> <span class="badge status-${getOutcomeStatus(item)}">${getOutcomeStatus(item)==='closed'?'Completed':'Pending'}</span></div><div class="muted">${escapeHtml(item.savedAt||'')} ${item.reminder?' • '+escapeHtml(item.reminder):''}</div><div class="outcome-actions"><button class="tiny" onclick="editOutcome('${item.id}')">Edit</button><button class="tiny secondary" onclick="copyOutcome('${item.id}',this)">Copy</button></div></div>`).join('');
  }
}

window.addEventListener('load',applyAppVersion);

/* =========================================================
   Miracle-Ear Clinical Assistant v1.2.1
   HAE No Loss workflow — built from stable v1.0.4 baseline
   ========================================================= */

function setHaeHearingStatus(status){
  const lossBox=document.getElementById('haeHearingLossBox');
  const noLossBox=document.getElementById('haeNoLossBox');

  if(lossBox)lossBox.classList.toggle('hidden',status!=='loss');
  if(noLossBox)noLossBox.classList.toggle('hidden',status!=='noLoss');

  const boxToClear=status==='noLoss'?lossBox:noLossBox;
  if(boxToClear){
    boxToClear.querySelectorAll('input, select, textarea').forEach(el=>{
      if(el.type==='checkbox'||el.type==='radio')el.checked=false;
      else el.value='';
    });
  }

  markNoteAsNotGenerated();
  saveDraftDebounced();
}

function renderHae(){
  const rejected=`<div class="subbox">
    <label class="inline-label">
      <input type="checkbox" id="haeRejected" onchange="toggleBox('haeRejectedBox',this.checked)">
      Rejected Hearing Aids
    </label>
    <div id="haeRejectedBox" class="hidden">
      <input type="text" id="haeRejectedReason" placeholder="ex. price concern, wants to think it over, needs to speak with family">
    </div>
  </div>`;

  return renderEvaluation('hae')
    +section('haeDemo','Demonstration',
      `${cb('haeDemoTech','Demoed New Tech')}${cou('hae')}${cb('haeClarity','Significant Improvement in Clarity and Understanding')}`)
    +section('haeTreatment','Treatment Outcome',`
      <label class="inline-label">
        <input type="radio" name="haeHearingStatus" value="loss" onchange="setHaeHearingStatus('loss')">
        Hearing Loss
      </label>
      <label class="inline-label">
        <input type="radio" name="haeHearingStatus" value="noLoss" onchange="setHaeHearingStatus('noLoss')">
        No Loss
      </label>

      <div id="haeHearingLossBox" class="hidden">
        ${cb('haeRecommend','Hearing Aids Recommended as Treatment')}
        ${purchaseOutcome('hae',false)}
        ${trialOutcome('hae')}
        ${rejected}
      </div>

      <div id="haeNoLossBox" class="hidden">
        ${cb('haeNoLossCounseled','Counseled on Test Results')}
        ${cb('haeConservation','Hearing Conservation Discussed')}
        ${cb('haeReturnPRN','Advised to Return PRN / Annual Monitoring')}
      </div>`);
}

function generateHae(){
  let arr=[];

  if(checked('sec_haeEval'))arr.push(...evaluationParts('hae'));

  if(checked('sec_haeDemo')){
    if(checked('haeDemoTech'))arr.push('Demoed new tech');
    arr.push(couText('hae'));
    if(checked('haeClarity'))arr.push('Significant improvement in clarity and understanding');
  }

  if(checked('sec_haeTreatment')){
    const status=radio('haeHearingStatus');

    if(status==='noLoss'){
      arr.push('Test results indicate hearing within normal limits bilaterally');
      arr.push('Hearing aids are not recommended at this time');
      if(checked('haeNoLossCounseled'))arr.push('Counseled on test results');
      if(checked('haeConservation'))arr.push('Discussed hearing conservation');
      if(checked('haeReturnPRN'))arr.push('Advised to return as needed or for annual monitoring');
    }else{
      if(checked('haeRecommend'))arr.push('Hearing aids recommended as treatment');
      arr.push(purchaseText('hae',false));
      arr.push(trialText('hae'));

      if(checked('haeRejected')){
        const reason=fragmentText(document.getElementById('haeRejectedReason')?.value);
        arr.push(reason?'Did not purchase: '+reason:'Did not purchase');
      }
    }
  }

  return arr.filter(Boolean);
}

const applyAppointmentState_v121=applyAppointmentStateCore;
function applyAppointmentState_v121_wrapper(state,options={}){
  const ok=applyAppointmentState_v121(state,options);
  const status=state?.radios?.haeHearingStatus;
  if(status)setHaeHearingStatus(status);
  return ok;
}

function showVersionInfo(){
  alert(`Miracle-Ear Clinical Assistant

Version ${APP_VERSION}
Last updated: July 29, 2026

What's new:
• Fixed the HAE tab failure from v1.2.0
• Rebuilt this update from the stable v1.0.4 baseline
• Preserved the original HAE visual layout
• Added Hearing Loss and No Loss under Treatment Outcome
• Added normal-hearing counseling and generated-note wording
• Preserved Delivery fitting, Copy to Other Ear, drafts, notes, and Saved Outcomes`);
}

/* =========================================================
   Miracle-Ear Clinical Assistant v1.2.2
   HAE hearing status moved to Evaluation
   Annual Retest duplicate service counseling removed
   ========================================================= */

function hearingLoss(prefix){
  const isHae=prefix==='hae';

  if(!isHae){
    return `<div class="subbox">
      <label class="inline-label"><input type="checkbox" id="${prefix}HL">Hearing Loss</label>
      <div class="grid-2">
        <div>
          <label class="inline-label">Laterality</label>
          <select id="${prefix}Lat">
            <option value="">Select laterality...</option>
            <option value="Bilateral">Bilateral</option>
            <option value="AD">Right / AD</option>
            <option value="AS">Left / AS</option>
          </select>
        </div>
        <div>
          <label class="inline-label">Type</label>
          <select id="${prefix}Type">
            <option value="">Select type...</option>
            <option value="sensorineural">Sensorineural</option>
            <option value="conductive">Conductive</option>
            <option value="mixed">Mixed</option>
            <option value="normal hearing">Normal Hearing</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      <input type="text" id="${prefix}OtherHL" placeholder="Other hearing loss type if needed...">
    </div>`;
  }

  return `<div class="subbox">
    <div class="row-title">Hearing Status</div>
    <div class="pill-row">
      <label class="inline-label">
        <input type="radio" name="haeHearingStatus" id="haeHL" value="loss"
          onchange="setHaeHearingStatus('loss')">
        Hearing Loss
      </label>
      <label class="inline-label">
        <input type="radio" name="haeHearingStatus" id="haeNoLoss" value="noLoss"
          onchange="setHaeHearingStatus('noLoss')">
        No Loss
      </label>
    </div>

    <div id="haeHearingDetails" class="hidden">
      <div class="grid-2">
        <div>
          <label class="inline-label">Laterality</label>
          <select id="haeLat">
            <option value="">Select laterality...</option>
            <option value="Bilateral">Bilateral</option>
            <option value="AD">Right / AD</option>
            <option value="AS">Left / AS</option>
          </select>
        </div>
        <div>
          <label class="inline-label">Type</label>
          <select id="haeType">
            <option value="">Select type...</option>
            <option value="sensorineural">Sensorineural</option>
            <option value="conductive">Conductive</option>
            <option value="mixed">Mixed</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      <input type="text" id="haeOtherHL" placeholder="Other hearing loss type if needed...">
    </div>
  </div>`;
}

function setHaeHearingStatus(status){
  const details=document.getElementById('haeHearingDetails');
  const lossBox=document.getElementById('haeHearingLossBox');
  const noLossBox=document.getElementById('haeNoLossBox');

  if(details)details.classList.toggle('hidden',status!=='loss');
  if(lossBox)lossBox.classList.toggle('hidden',status!=='loss');
  if(noLossBox)noLossBox.classList.toggle('hidden',status!=='noLoss');

  if(status==='noLoss'){
    ['haeLat','haeType','haeOtherHL'].forEach(id=>{
      const el=document.getElementById(id);
      if(el)el.value='';
    });
    if(lossBox){
      lossBox.querySelectorAll('input, select, textarea').forEach(el=>{
        if(el.type==='checkbox'||el.type==='radio')el.checked=false;
        else el.value='';
      });
    }
  }else if(status==='loss'&&noLossBox){
    noLossBox.querySelectorAll('input, select, textarea').forEach(el=>{
      if(el.type==='checkbox'||el.type==='radio')el.checked=false;
      else el.value='';
    });
  }

  markNoteAsNotGenerated();
  saveDraftDebounced();
}

function hlText(prefix){
  if(prefix==='hae'){
    const status=radio('haeHearingStatus');
    if(status==='noLoss')return'No hearing loss identified';
    if(status!=='loss')return'';

    let lat=val('haeLat');
    let type=val('haeType');
    const other=val('haeOtherHL');

    if(!lat&&!type)return'Hearing loss type/laterality not selected';
    if(!type)type='hearing loss';
    if(type==='other')type=other||'hearing loss';

    return lat==='Bilateral'
      ? `Bilateral ${type} hearing loss`
      : (lat?`${type} hearing loss ${lat}`:`${type} hearing loss`);
  }

  if(!checked(prefix+'HL'))return'';
  let lat=document.getElementById(prefix+'Lat').value;
  let type=document.getElementById(prefix+'Type').value;
  const other=val(prefix+'OtherHL');

  if(!lat&&!type)return'Hearing loss type/laterality not selected';
  if(!lat)lat='';
  if(!type)type='hearing loss';
  if(type==='other')type=other||'hearing loss';
  if(type==='normal hearing'){
    return lat==='Bilateral'?'Normal hearing bilaterally':(lat?`Normal hearing ${lat}`:'Normal hearing');
  }
  return lat==='Bilateral'
    ? `Bilateral ${type} hearing loss`
    : (lat?`${type} hearing loss ${lat}`:`${type} hearing loss`);
}

function renderHae(){
  const rejected=`<div class="subbox">
    <label class="inline-label">
      <input type="checkbox" id="haeRejected" onchange="toggleBox('haeRejectedBox',this.checked)">
      Rejected Hearing Aids
    </label>
    <div id="haeRejectedBox" class="hidden">
      <input type="text" id="haeRejectedReason" placeholder="ex. price concern, wants to think it over, needs to speak with family">
    </div>
  </div>`;

  return renderEvaluation('hae')
    +section('haeDemo','Demonstration',
      `${cb('haeDemoTech','Demoed New Tech')}${cou('hae')}${cb('haeClarity','Significant Improvement in Clarity and Understanding')}`)
    +section('haeTreatment','Treatment Outcome',`
      <div id="haeHearingLossBox" class="hidden">
        ${cb('haeRecommend','Hearing Aids Recommended as Treatment')}
        ${purchaseOutcome('hae',false)}
        ${trialOutcome('hae')}
        ${rejected}
      </div>

      <div id="haeNoLossBox" class="hidden">
        ${cb('haeNoLossCounseled','Counseled on Test Results')}
        ${cb('haeConservation','Hearing Conservation Discussed')}
        ${cb('haeReturnPRN','Advised to Return PRN / Annual Monitoring')}
      </div>`);
}

function renderHearingAidService(prefix){
  const p=prefix+'Svc';
  return section(prefix+'Service','Hearing Aid Service',
    `${miniSection(prefix+'ServiceMaint','Maintenance',
      `${cb(p+'Cleaned','Cleaned Both Hearing Aids')}
       ${cb(p+'Vacuumed','Vacuumed Microphones')}
       ${cb(p+'Listen','Listening Check Performed')}
       ${cb(p+'Dry','Placed Hearing Aids in Dry Chamber')}`)}
     ${miniSection(prefix+'ServiceReplace','Replaced Items',replacedItemsBody())}
     ${miniSection(prefix+'ServiceProgramming','Programming',computer(p))}`);
}

const applyAppointmentState_v122=applyAppointmentState_v121_wrapper;
function applyAppointmentState(state,options={}){
  const ok=applyAppointmentState_v122(state,options);
  const status=state?.radios?.haeHearingStatus;
  if(status)setHaeHearingStatus(status);
  return ok;
}

function showVersionInfo(){
  alert(`Miracle-Ear Clinical Assistant

Version ${APP_VERSION}
Last updated: July 29, 2026

What's new:
• Restored the original Miracle-Ear logo on the splash screen and page header
• Added a simplified ear favicon optimized for browser tabs and Favorites
• Added multi-resolution favicon support for 16, 24, 32, 48, and 64 px
• Shortened the browser tab title to Clinical Assistant
• Preserved all existing workflows, layout, drafts, notes, and Saved Outcomes`);
}



/* =========================================================
   Miracle-Ear Clinical Assistant v1.3.4
   About support and cleanup update
   ========================================================= */

function showVersionInfo(){
  const aboutButton=document.querySelector('.tab-btn[data-tab="about"]');
  if(aboutButton){
    showTab('about',aboutButton);
    aboutButton.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
}

function getStorageSummary(){
  let outcomes=0;
  let pending=0;
  let completed=0;
  let draft=false;
  try{
    const items=getSavedOutcomes();
    outcomes=items.length;
    pending=items.filter(x=>getOutcomeStatus(x)==='pending').length;
    completed=items.filter(x=>getOutcomeStatus(x)==='closed').length;
    draft=!!getActiveDraft();
  }catch(e){}
  return {outcomes,pending,completed,draft};
}

function renderAbout(){
  const version=document.getElementById('aboutVersion');
  if(version)version.textContent=APP_VERSION;
  const summary=getStorageSummary();
  const storage=document.getElementById('aboutStorageSummary');
  if(storage){
    storage.innerHTML=`<div><strong>${summary.draft?'1':'0'}</strong><span>Unfinished appointment</span></div>
      <div><strong>${summary.pending}</strong><span>Pending outcome${summary.pending===1?'':'s'}</span></div>
      <div><strong>${summary.completed}</strong><span>Completed outcome${summary.completed===1?'':'s'}</span></div>`;
  }
}

function openAboutSection(id){
  const el=document.getElementById(id);
  if(el)el.scrollIntoView({behavior:'smooth',block:'start'});
}


function contactDeveloper(){
  const summary=getStorageSummary();
  const now=new Date();
  const recipient='philippim@frasierenterprises.com';
  const subject='Clinical Assistant Feedback';
  const body=[
    'Clinical Assistant Feedback',
    '',
    'Please describe the issue, suggestion, or feature request below:',
    '',
    '',
    '---',
    'Application information',
    `Version: ${APP_VERSION}`,
    `Date/Time: ${now.toLocaleString()}`,
    `Browser: ${navigator.userAgent}`,
    `Platform: ${navigator.platform||'Unknown'}`,
    `Unfinished appointment: ${summary.draft?'Yes':'No'}`,
    `Pending outcomes: ${summary.pending}`,
    `Completed outcomes: ${summary.completed}`,
    '',
    'Please do not include patient-identifying information in this email.'
  ].join('\r\n');

  const outlookUrl='https://outlook.office.com/mail/deeplink/compose'
    +`?to=${encodeURIComponent(recipient)}`
    +`&subject=${encodeURIComponent(subject)}`
    +`&body=${encodeURIComponent(body)}`;

  const opened=window.open(outlookUrl,'_blank','noopener,noreferrer');
  if(!opened){
    const mailto=`mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.assign(mailto);
    showToast('Opening your email app…');
  }else{
    showToast('Opening Outlook to compose your message…');
  }
}

function copyDiagnosticInfo(){
  const summary=getStorageSummary();
  const details=[
    'Miracle-Ear Clinical Assistant',
    `Version: ${APP_VERSION}`,
    `Browser: ${navigator.userAgent}`,
    `Platform: ${navigator.platform||'Unknown'}`,
    `Local storage: ${(()=>{try{localStorage.setItem('__me_diag','1');localStorage.removeItem('__me_diag');return 'Available';}catch(e){return 'Unavailable';}})()}`,
    `Unfinished appointment: ${summary.draft?'Yes':'No'}`,
    `Pending outcomes: ${summary.pending}`,
    `Completed outcomes: ${summary.completed}`
  ].join('\n');
  if(navigator.clipboard?.writeText){
    navigator.clipboard.writeText(details).then(()=>toast('✓ Diagnostic information copied.'),()=>fallbackCopy(details));
  }else fallbackCopy(details);
}

function fallbackCopy(text){
  const temp=document.createElement('textarea');
  temp.value=text;document.body.appendChild(temp);temp.select();document.execCommand('copy');temp.remove();
  toast('✓ Diagnostic information copied.');
}

const renderDashboard_v133=renderDashboard;
function renderDashboard(){
  renderDashboard_v133();
  const versionCard=[...document.querySelectorAll('#dashboardCards .dashboard-card')].find(card=>card.querySelector('.label')?.textContent==='Current Version');
  if(versionCard){
    const number=versionCard.querySelector('.number');
    if(number)number.textContent=APP_VERSION;
    const button=versionCard.querySelector('button');
    if(button){button.textContent='About';button.onclick=showVersionInfo;}
  }
}

window.addEventListener('load',renderAbout);
