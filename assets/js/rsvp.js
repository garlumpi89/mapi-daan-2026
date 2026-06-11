const form = document.getElementById('rsvpForm');
const yesOnly = document.getElementById('yesOnly');
const details = document.getElementById('guestDetails');
const guestCount = document.getElementById('guestCount');
function lang(){return document.documentElement.lang||'es'}
function t(k){return I18N[lang()][k]||k}
function namesArray(){return (document.getElementById('guestNames').value||'').split('\n').map(s=>s.trim()).filter(Boolean)}
function renderGuestDetails(){
  if(!details) return; const n = Math.max(parseInt(guestCount.value||'1',10), namesArray().length || 1); const names = namesArray(); details.innerHTML='';
  for(let i=0;i<n;i++){
    const name = names[i] || `${t('yourName')} ${i+1}`;
    const div=document.createElement('div'); div.className='guest-card';
    div.innerHTML=`<h4>${name}</h4><div class="row"><div><label>${t('menu')}</label><select name="menu_${i}"><option value="none">${t('none')}</option><option value="vegetarian">${t('vegetarian')}</option><option value="vegan">${t('vegan')}</option><option value="gluten_free">${t('glutenFree')}</option><option value="other">${t('other')}</option></select></div><div><label>${t('allergies')}</label><input type="text" name="allergies_${i}"></div></div>`;
    details.appendChild(div);
  }
}
document.addEventListener('change', e=>{ if(e.target.name==='attendance'){ yesOnly.classList.toggle('hidden',e.target.value!=='yes'); } if(e.target.id==='guestCount') renderGuestDetails(); });
document.getElementById('guestNames')?.addEventListener('input', renderGuestDetails);
document.addEventListener('langchange', renderGuestDetails);
renderGuestDetails();
form.addEventListener('submit', async (e)=>{
  e.preventDefault(); const status=document.getElementById('status'); status.textContent=t('sending');
  const fd=new FormData(form); const attendance=fd.get('attendance'); const guests=namesArray();
  const payload={timestamp:new Date().toISOString(),language:lang(),attendance,contactName:fd.get('contactName')||'',email:fd.get('email')||'',phone:fd.get('phone')||'',guestCount:attendance==='yes'?fd.get('guestCount'):'0',guestNames:attendance==='yes'?guests:[],prewedding:fd.get('prewedding')||'',bus:fd.get('bus')||'',song:fd.get('song')||'',notes:fd.get('notes')||'',message:fd.get('message')||'',guestDetails:[]};
  if(attendance==='yes') { const n=Math.max(parseInt(payload.guestCount||'1',10),guests.length||1); for(let i=0;i<n;i++) payload.guestDetails.push({name:guests[i]||'',menu:fd.get(`menu_${i}`)||'none',allergies:fd.get(`allergies_${i}`)||''}); }
  try{
    if(!WEDDING_CONFIG.googleScriptUrl) throw new Error('Missing Google Apps Script URL');
    await fetch(WEDDING_CONFIG.googleScriptUrl,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)});
    form.reset(); yesOnly.classList.add('hidden'); renderGuestDetails(); status.textContent=t('sent');
  }catch(err){ console.error(err); status.textContent=t('error'); }
});
