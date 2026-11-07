'use strict';
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const menu = $('#menu-toggle');
menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); $('#navigation').classList.toggle('open', open); });
$$('#navigation a').forEach(a => a.addEventListener('click', () => { menu.setAttribute('aria-expanded', 'false'); $('#navigation').classList.remove('open'); }));
document.addEventListener('keydown', e => { if(e.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true'){ menu.click(); menu.focus(); } });
const form=$('#quote-form'), fields=$$('fieldset[data-step]'); let step=0;
const stepNames=['De route','Jouw wensen','Contactvoorkeur'];
const nextLabels=['Verder: jouw wensen','Verder: contact','Bekijk mijn samenvatting'];
const today=new Date(); $('#date').min=[today.getFullYear(),String(today.getMonth()+1).padStart(2,'0'),String(today.getDate()).padStart(2,'0')].join('-');
function showStep(index, focus=true){
 step=index; fields.forEach((f,i)=>{f.hidden=i!==step;});
 updateContext(); $('#step-label').textContent=`STAP ${step+1} VAN 3`; $('#step-name').textContent=stepNames[step]; $('#progress').style.width=`${(step+1)*100/3}%`;
 $('#back').hidden=step===0; $('#next').textContent=nextLabels[step]+' →'; $('#form-error').hidden=true;
 if(focus){ const heading=fields[step].querySelector('legend');heading.tabIndex=-1;heading.focus({preventScroll:true});$('.quote-card').scrollIntoView({behavior:'instant',block:'start'}); }
}
function contactChanged(){ const phone=$('input[name="contact"]:checked').value==='phone';$('#email-field').hidden=phone;$('#phone-field').hidden=!phone;$('#email').disabled=phone;$('#email').required=!phone;$('#phone').disabled=!phone;$('#phone').required=phone; }
$$('input[name="contact"]').forEach(r=>r.addEventListener('change',contactChanged));
form.addEventListener('input',e=>{e.target.removeAttribute('aria-invalid');e.target.removeAttribute('aria-describedby');if(e.target.id==='notes')e.target.setAttribute('aria-describedby','notes-hint');$('#form-error').hidden=true;});
function validate(){
 for(const input of fields[step].querySelectorAll('input,select,textarea')){
  if(input.disabled)continue;
  let error='';
  if(input.required&&!input.value.trim()) error = input.id==='from'?'Vul de vertrekplaats in.':input.id==='to'?'Vul de plaats van bestemming in.':input.id==='phone'?'Vul een telefoonnummer in.':'Vul een e-mailadres in.';
  else if(input.validity.typeMismatch)error='Vul een geldig e-mailadres in, bijvoorbeeld voorbeeld@example.com.';
  else if(input.id==='date'&&input.validity.rangeUnderflow)error='Kies vandaag of een latere datum, of laat de datum leeg.';
  else if(input.validity.badInput)error='Controleer de ingevulde datum.';
  else if(input.id==='phone'&&input.required&&input.value.replace(/\D/g,'').length<7)error='Vul een telefoonnummer met minimaal 7 cijfers in.';
  if(error){$('#form-error').textContent=error;$('#form-error').hidden=false;input.setAttribute('aria-invalid','true');input.setAttribute('aria-describedby','form-error');input.focus();return false;}
 }
 return true;
}
function summaryRows(){
 const d=new FormData(form);const date=d.get('date');
 return [['Route',`${d.get('from').trim()} → ${d.get('to').trim()}`],['Gewenste datum',date?new Date(date+'T12:00:00').toLocaleDateString('nl-NL',{day:'numeric',month:'long',year:'numeric'})+' (nog niet bevestigd)':'Nog niet bekend'],['Situatie',$('#move-type').selectedOptions[0].textContent],['Inboedel',d.get('home')],['Gewenste hulp',d.getAll('help').join(', ')||'Nog te bespreken'],['Toegang vertrekadres',d.get('access-from')],['Toegang nieuwe adres',d.get('access-to')],['Bijzonderheden',d.get('notes').trim()||'Niet opgegeven'],['Naam',d.get('name').trim()||'Niet opgegeven'],['Contactvoorkeur',d.get('contact')==='phone'?'Telefoon: '+d.get('phone'):'E-mail: '+d.get('email')]];
}
function showSummary(){
 $('#summary').replaceChildren(...summaryRows().flatMap(([k,v])=>{const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=k;dd.textContent=v;return[dt,dd];}));
 $('#personal-checklist').replaceChildren(...personalChecklist().map(text=>{const li=document.createElement('li');li.textContent=text;return li;})); form.hidden=true;$('#result').hidden=false;$('#step-label').textContent='VOORBEREIDING COMPLEET';$('#step-name').textContent='Niet verstuurd';$('#result').focus();
}
form.addEventListener('submit',e=>{e.preventDefault();if(!validate())return;if(step<2)showStep(step+1);else showSummary();});
$('#back').addEventListener('click',()=>showStep(Math.max(0,step-1)));
$('#edit').addEventListener('click',()=>{form.hidden=false;$('#result').hidden=true;showStep(0);});
$('#download').addEventListener('click',()=>{
 const text='VOORBEREIDING VERHUIZING — LOKAAL VOORBEELD\nEr is geen aanvraag verstuurd. Geen offerte of reservering.\n\n'+summaryRows().map(([k,v])=>k+': '+v).join('\n\n')+'\n\nAANDACHTSPUNTEN\n'+personalChecklist().map(s=>'• '+s).join('\n')+'\n\nNog af te spreken: prijs inclusief btw, werkzaamheden, eventuele toeslagen, datum, verzekering en voorwaarden.\n';
 const url=URL.createObjectURL(new Blob(['\uFEFF'+text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='mijn-verhuisvoorbereiding.txt';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
});

// Show the demo form only after all local handlers are installed.
form.hidden=false;

let selectedPackage = '';
let selectedSituation = 'flat';
function updateContext(){
 const from=$('#from').value.trim(),to=$('#to').value.trim();
 const context=$('#plan-context');context.hidden=!from&&!to;
 if($('#quick-from').value!==$('#from').value)$('#quick-from').value=$('#from').value;
 if($('#quick-to').value!==$('#to').value)$('#quick-to').value=$('#to').value;
 context.textContent=(from||'Vertrekplaats nog onbekend')+' → '+(to||'Bestemming nog onbekend');
 const help=$$('input[name="help"]:checked').map(x=>x.value);
 if(!help.includes('Inpakken')&&selectedPackage==='basis')help.unshift('Zelf inpakken');
 $('#plan-selection').hidden=help.length===0;$('#plan-selection').textContent='Jouw keuze: '+help.join(' · ');
}
function openPlan(){
 form.hidden=false;$('#result').hidden=true;showStep(0);updateContext();
}
$$('[data-package]').forEach(button=>button.addEventListener('click',()=>{
 selectedPackage=button.dataset.package;
 $$('[data-package]').forEach(b=>{b.closest('.help-card').classList.toggle('chosen',b===button);b.setAttribute('aria-pressed',String(b===button));});
 const inpack=$('input[name="help"][value="Inpakken"]'),advice=$('input[name="help"][value="Advies over de aanpak"]');
 inpack.checked=selectedPackage==='inpakken';advice.checked=selectedPackage==='advies';
 
 openPlan();
}));
$$('[data-extra]').forEach(a=>a.addEventListener('click',e=>{
 e.preventDefault();
 const extra=a.dataset.extra;
 const check=$$('input[name="help"]').find(input=>input.value===extra);
 if(check)check.checked=true;
 else if(!$('#notes').value.includes(extra))$('#notes').value=[$('#notes').value,extra].filter(Boolean).join('\n');
 openPlan();
}));
const situations={
 flat:{title:'Een verdieping maakt verschil.',description:'Een lift, trappenhuis en de afstand tot de verhuiswagen beïnvloeden de aanpak.',points:['Verdieping op beide adressen','Is er een lift en passen je meubels erin?','Kan de verhuiswagen dichtbij staan?'],home:'Een appartement'},
 house:{title:'Van zolder tot schuur: wat gaat mee?',description:'Ook spullen buiten de woonkamer tellen mee. Een compleet beeld helpt bij een passende offerte.',points:['Spullen op zolder, in de schuur en in de tuin','Grote meubels die uit elkaar moeten','De route van voordeur naar verhuiswagen'],home:'Een eengezinswoning'},
 storage:{title:'Twee verhuisdagen, één duidelijk plan.',description:'Zijn de sleutels nog niet binnen? Bespreek tijdelijke opslag en het vervoer naar je nieuwe woning.',points:['Wat moet in opslag, en voor hoelang?','Welke spullen wil je tussentijds kunnen bereiken?','Kosten voor opslag én beide transportmomenten'],home:null}
};
$$('[data-situation]').forEach(b=>b.addEventListener('click',()=>{
 selectedSituation=b.dataset.situation;const data=situations[selectedSituation];
 $$('[data-situation]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
 const h=document.createElement('h3'),p=document.createElement('p'),ul=document.createElement('ul');h.textContent=data.title;p.textContent=data.description;
 data.points.forEach(point=>{const li=document.createElement('li');li.textContent=point;ul.append(li);});$('#situation-content').replaceChildren(h,p,ul);
}));
$('#use-situation').addEventListener('click',()=>{
 const data=situations[selectedSituation];if(data.home)$('#home-type').value=data.home;
 if(selectedSituation==='storage')$('input[name="help"][value="Opslag"]').checked=true;
 openPlan();
});
function personalChecklist(){
 const points=['Maak een overzicht van wat meegaat, inclusief schuur of berging.'];
 if($('#home-type').value==='Een appartement'||[$('#access-from').value,$('#access-to').value].some(s=>s.includes('Verdieping')))points.push('Geef de verdiepingen en liftmaten door. Bespreek of grote meubels door de trap of lift passen.');
 if($('input[name="help"][value="Inpakken"]').checked)points.push('Spreek af welke spullen worden ingepakt en wie het verpakkingsmateriaal verzorgt.');
 else points.push('Bespreek geschikt verpakkingsmateriaal en label dozen per kamer.');
 if($('input[name="help"][value="Demontage en montage"]').checked)points.push('Maak een lijst van meubels die uit elkaar moeten en weer gemonteerd worden.');
 if($('input[name="help"][value="Opslag"]').checked)points.push('Vraag naar opslagduur, toegang, dekking en de kosten van beide transportmomenten.');
 points.push('Controleer parkeerruimte en eventuele toestemming bij beide adressen.');
 if(!$('#date').value)points.push('Bepaal een voorkeursperiode; er is nog geen verhuisdatum gekozen.');
 return points;
}
$('#quick-form').addEventListener('submit',e=>{e.preventDefault();if($('#quick-from').value.trim())$('#from').value=$('#quick-from').value.trim();if($('#quick-to').value.trim())$('#to').value=$('#quick-to').value.trim();openPlan();});
$('#quick-form').hidden=false;
$$('#from,#to').forEach(input=>input.addEventListener('input',updateContext));

$$('input[name="help"]').forEach(input=>input.addEventListener('change',updateContext));

[['#quick-from','#from'],['#quick-to','#to']].forEach(([quick,full])=>$(quick).addEventListener('input',()=>{$(full).value=$(quick).value;updateContext();}));
