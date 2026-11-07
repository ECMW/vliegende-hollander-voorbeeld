'use strict';
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const menu = $('#menu-toggle');
menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); $('#navigation').classList.toggle('open', open); });
$$('#navigation a').forEach(a => a.addEventListener('click', () => { menu.setAttribute('aria-expanded', 'false'); $('#navigation').classList.remove('open'); }));
document.addEventListener('keydown', e => { if(e.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true'){ menu.click(); menu.focus(); } });
const services = {
 particulier: ['PARTICULIER VERHUIZEN', 'Een huis vol spullen.\nEen plan dat bij je past.', 'Een appartement, een eengezinswoning of alleen de grote meubels. Geef aan wat er mee moet en waar je hulp bij wilt.', ['Zelf inpakken of inpakwerk bespreken', 'Grote en kwetsbare spullen vooraf doorgeven', 'Montage en eventuele opslag meenemen']],
 senioren: ['VERHUIZEN MET EXTRA BEGELEIDING', 'Een vertrouwde aanpak.\nAandacht voor de verandering.', 'Verhuis je zelf, of help je een ouder of familielid? Geef aan waar extra uitleg, tijd of praktische hulp nodig is.', ['Samen bepalen welke spullen meegaan', 'Inpakwerk en montage vooraf bespreken', 'Afspreken wie het contact onderhoudt']],
 zakelijk: ['BEDRIJFSVERHUIZING', 'Een nieuwe werkplek.\nMet een helder verhuisplan.', 'Van kantoorinventaris tot archief. Breng de werkzaamheden, toegang en planning in kaart, zodat de verhuizing bij je bedrijf past.', ['Verhuisvolgorde en gewenste tijden bespreken', 'Inventaris en bereikbaarheid in kaart brengen', 'Montage en opslag meenemen in de aanvraag']]
};
function selectService(key){
 const data = services[key]; if(!data) return;
 $$('[data-service]').forEach(b => { b.classList.toggle('active',b.dataset.service===key); b.setAttribute('aria-pressed',String(b.dataset.service===key)); });
 $('#service-kicker').textContent=data[0]; $('#service-title').textContent=data[1]; $('#service-title').style.whiteSpace='pre-line'; $('#service-description').textContent=data[2];
 $('#service-points').replaceChildren(...data[3].map(s=>{ const li=document.createElement('li');li.textContent=s;return li;}));
 $('#move-type').value=key;
}
$$('[data-service]').forEach(b=>b.addEventListener('click',()=>selectService(b.dataset.service)));
$$('[data-extra]').forEach(a=>a.addEventListener('click',()=>{
 $('#move-type').value='anders';
 const extra=a.dataset.extra;
 if(extra==='Opslag') $('input[name="help"][value="Opslag"]').checked=true;
 else if(!$('#notes').value.includes(extra)) $('#notes').value=[$('#notes').value,extra].filter(Boolean).join('\n');
}));
const form=$('#quote-form'), fields=$$('fieldset[data-step]'); let step=0;
const stepNames=['De route','Jouw wensen','Contactvoorkeur'];
const nextLabels=['Verder: jouw wensen','Verder: contact','Bekijk mijn samenvatting'];
const today=new Date(); $('#date').min=[today.getFullYear(),String(today.getMonth()+1).padStart(2,'0'),String(today.getDate()).padStart(2,'0')].join('-');
function showStep(index, focus=true){
 step=index; fields.forEach((f,i)=>{f.hidden=i!==step;});
 $('#step-label').textContent=`STAP ${step+1} VAN 3`; $('#step-name').textContent=stepNames[step]; $('#progress').style.width=`${(step+1)*100/3}%`;
 $('#back').hidden=step===0; $('#next').textContent=nextLabels[step]+' →'; $('#form-error').hidden=true;
 if(focus){ const heading=fields[step].querySelector('legend');heading.tabIndex=-1;heading.focus({preventScroll:true});$('.quote-card').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'}); }
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
 return [['Route',`${d.get('from').trim()} → ${d.get('to').trim()}`],['Gewenste datum',date?new Date(date+'T12:00:00').toLocaleDateString('nl-NL',{day:'numeric',month:'long',year:'numeric'})+' (nog niet bevestigd)':'Nog niet bekend'],['Situatie',$('#move-type').selectedOptions[0].textContent],['Inboedel',d.get('home')],['Gewenste hulp',d.getAll('help').join(', ')||'Nog te bespreken'],['Bijzonderheden',d.get('notes').trim()||'Niet opgegeven'],['Naam',d.get('name').trim()||'Niet opgegeven'],['Contactvoorkeur',d.get('contact')==='phone'?'Telefoon: '+d.get('phone'):'E-mail: '+d.get('email')]];
}
function showSummary(){
 $('#summary').replaceChildren(...summaryRows().flatMap(([k,v])=>{const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=k;dd.textContent=v;return[dt,dd];}));
 form.hidden=true;$('#result').hidden=false;$('#step-label').textContent='VOORBEREIDING COMPLEET';$('#step-name').textContent='Niet verstuurd';$('#result').focus();
}
form.addEventListener('submit',e=>{e.preventDefault();if(!validate())return;if(step<2)showStep(step+1);else showSummary();});
$('#back').addEventListener('click',()=>showStep(Math.max(0,step-1)));
$('#edit').addEventListener('click',()=>{form.hidden=false;$('#result').hidden=true;showStep(0);});
$('#download').addEventListener('click',()=>{
 const text='VOORBEREIDING VERHUIZING — LOKAAL VOORBEELD\nEr is geen aanvraag verstuurd. Geen offerte of reservering.\n\n'+summaryRows().map(([k,v])=>k+': '+v).join('\n\n')+'\n\nNog af te spreken: prijs inclusief btw, werkzaamheden, eventuele toeslagen, datum, verzekering en voorwaarden.\n';
 const url=URL.createObjectURL(new Blob(['\uFEFF'+text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='mijn-verhuisvoorbereiding.txt';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
});

// Show the demo form only after all local handlers are installed.
form.hidden=false;
