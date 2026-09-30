const MATS = window.FILAMENTOS;   // data/filamentos.js
const DEF = {dolar:41.35, pValle:2.9805, pLlano:6.3098, pPunta:14.6815, mFil:2, mEne:1.5, redondeo:10,
  wPLA:95, wABS:200, wPC:150, volt:230, rBed:47.5, tBed:2, tCal:4, wCal:120};
/* precio mínimo de venta: redondeo hacia arriba al múltiplo elegido (0 = sin redondeo) */
const roundUp = x => { const s=+cfg.redondeo||0; return s>0 ? Math.ceil(r2(x)/s - 1e-9)*s : r2(x); };
const nf0 = new Intl.NumberFormat('es-UY',{maximumFractionDigits:0});
const fmtSale = v => (Math.abs(v-Math.round(v))<1e-9 ? '$'+nf0.format(v) : money(v));
const PHASE = {cama:'Calentando cama', calib:'Arranque y calibración', imp:'Imprimiendo'};
const $ = id => document.getElementById(id);
const r4 = x => Math.round(x*1e4)/1e4;
const r2 = x => Math.round(x*100)/100;
const nf2 = new Intl.NumberFormat('es-UY',{minimumFractionDigits:2,maximumFractionDigits:2});
const nf4 = new Intl.NumberFormat('es-UY',{minimumFractionDigits:4,maximumFractionDigits:4});
const nf1 = new Intl.NumberFormat('es-UY',{maximumFractionDigits:1});
const money = x => '$' + nf2.format(r2(x));
const DIAS = ['dom','lun','mar','mié','jue','vie','sáb'];
const pad = n => String(n).padStart(2,'0');
const NAMES = {valle:'Valle',llano:'Llano',punta:'Punta'};
const SYM = {valle:'V',llano:'L',punta:'P'};
const esc = s => String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const store = {
  get(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } },
  set(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }
};
const uid = () => Math.random().toString(36).slice(2,9);
const DEF_MAT = String(MATS.findIndex(m=>m[2]==='Fremover PLA+ High Speed 1 kg'));
const MAT_TXT = MATS.map(m => norm(m[0]+' '+m[1]+' '+m[2]));
const reduceMotion = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- estado ---------- */
function blankPrint(n, base){
  const now=new Date();
  return Object.assign({id:uid(),name:'Impresión '+n,g:0,h:1,m:0,
    fecha:now.getFullYear()+'-'+pad(now.getMonth()+1)+'-'+pad(now.getDate()),hora:pad(now.getHours())+':00',
    feriado:false,arranque:true,mat:DEF_MAT,cPrecio:16,cGramos:1000}, base||{});
}
function exampleProject(){
  return {name:'Ejemplo: ajedrez medieval',active:'p1',prints:[
    blankPrint(1,{id:'p1',name:'Placa 1',g:103,h:10,m:0,fecha:'2026-09-24',hora:'23:00'}),
    blankPrint(2,{id:'p2',name:'Placa 2',g:103,h:10,m:0,fecha:'2026-09-25',hora:'11:00'})
  ]};
}
/* ---------- proyectos: memoria local + base de datos del artefacto ---------- */
const newPid = () => 'p' + Date.now().toString(36) + uid();
function normProj(p){
  if(!p || !Array.isArray(p.prints) || !p.prints.length) return null;
  p.id = p.id || newPid(); p.name = p.name || 'Proyecto sin nombre';
  p.updatedAt = +p.updatedAt || Date.now(); p.createdAt = +p.createdAt || p.updatedAt;
  p.prints.forEach(x=>{ if(x.arranque===undefined) x.arranque=true; });
  if(!p.prints.find(x=>x.id===p.active)) p.active=p.prints[0].id;
  return p;
}
const clone = o => JSON.parse(JSON.stringify(o));
let allProjects = {};                       // id -> proyecto
(function loadLocal(){
  try{ const l=JSON.parse(store.get('proyectos_v2')); if(l && typeof l==='object') Object.values(l).forEach(p=>{ p=normProj(p); if(p) allProjects[p.id]=p; }); }catch(e){}
  try{ const v1=normProj(JSON.parse(store.get('proyecto_v1'))); if(v1 && !Object.keys(allProjects).length) allProjects[v1.id]=v1; }catch(e){}
  if(!Object.keys(allProjects).length){ const ex=normProj(exampleProject()); ex.seed=true; allProjects[ex.id]=ex; }
})();
let proj = allProjects[store.get('proyecto_actual')] || Object.values(allProjects).sort((a,b)=>b.updatedAt-a.updatedAt)[0];
const cfg = {}; Object.keys(DEF).forEach(k=>{ const v=parseFloat(store.get('cfg_'+k)); cfg[k]=isFinite(v)?v:DEF[k]; });

let DB=null, dirty=false, saveTimer=null, writeChain=Promise.resolve(), syncState='local';
function persistLocal(){
  allProjects[proj.id]=proj;
  store.set('proyectos_v2', JSON.stringify(allProjects)); store.set('proyecto_actual', proj.id);
  Object.keys(cfg).forEach(k=>store.set('cfg_'+k,cfg[k]));
  if(typeof renderCount==='function') renderCount();
}
function setSync(s){ syncState=s; if(typeof renderSync==='function') renderSync(); }
function writeRemote(p){
  if(!DB) return Promise.resolve();
  p.synced=true; const body=clone(p);
  writeChain = writeChain.then(()=>DB.doc('projects/'+p.id).set(body)).then(()=>{ if(p===proj){ dirty=false; } setSync('saved'); })
    .catch(e=>{ setSync(e && e.code==='quota_exceeded' ? 'quota' : 'error'); });
  return writeChain;
}
const save = () => {
  proj.updatedAt = Date.now(); proj.seed = false; dirty = true; persistLocal();
  if(!DB){ return; }
  setSync('saving');
  clearTimeout(saveTimer); saveTimer=setTimeout(()=>writeRemote(proj), 700);   // una escritura por pausa
};
function flushSave(){ if(DB && dirty){ clearTimeout(saveTimer); writeRemote(proj); } }
const active = () => proj.prints.find(p=>p.id===proj.active);

/* ---------- cálculo ---------- */
function band(d, feriado){
  const h=d.getHours(), wd=d.getDay();
  if(h<7) return 'valle';
  const habil = wd>=1 && wd<=5 && !feriado;
  return (habil && h>=17 && h<23) ? 'punta' : 'llano';
}
function nextBoundary(d){
  const n=new Date(d); n.setMinutes(0,0,0);
  n.setHours([7,17,23,24].find(x=>x>d.getHours()));
  return n;
}
function segments(start, hours, feriado){
  const end = new Date(start.getTime()+hours*3600e3);
  const segs=[]; let t=new Date(start);
  while(t<end){
    const nb=nextBoundary(t), s=nb<end?nb:end, b=band(t,feriado), last=segs[segs.length-1];
    if(last && last.band===b && last.end.getTime()===t.getTime()) last.end=s;
    else segs.push({band:b,start:new Date(t),end:s});
    t=s;
  }
  segs.forEach(s=>s.h=(s.end-s.start)/3600e3);
  return {segs,end};
}
const P = () => ({valle:cfg.pValle,llano:cfg.pLlano,punta:cfg.pPunta});
const bedW = () => cfg.rBed>0 ? r4(cfg.volt*cfg.volt/cfg.rBed) : 0;
function printW(mat){
  const t=' '+norm(mat.name).replace(/[^a-z0-9]+/g,' ')+' ';
  if(/ (abs|asa) /.test(t)) return {w:cfg.wABS,src:'ABS/ASA'};
  if(/ pc /.test(t)) return {w:cfg.wPC,src:'PC'};
  return {w:cfg.wPLA,src:'PLA'};
}
function phasesFor(p, hours, mat){
  const pw=printW(mat).w, out=[]; let left=hours;
  if(p.arranque){
    [['cama',bedW(),cfg.tBed/60],['calib',cfg.wCal,cfg.tCal/60]].forEach(([k,w,h])=>{
      const d=Math.min(Math.max(h,0),left); if(d>0){ out.push({k,w,h:d}); left-=d; }
    });
  }
  if(left>0) out.push({k:'imp',w:pw,h:left});
  return out;
}
function pieces(start, hours, p, mat){
  const res=[]; let t=new Date(start);
  phasesFor(p,hours,mat).forEach(ph=>{
    const {segs,end}=segments(t,ph.h,p.feriado);
    segs.forEach(s=>res.push({phase:ph.k,w:ph.w,band:s.band,start:s.start,end:s.end,h:s.h}));
    t=end;
  });
  return res;
}
const pieceCost = s => { const kwh=r4(s.w*r4(s.h)/1000); return {kwh, c:r4(kwh*P()[s.band])}; };
const energyFor = ps => ps.reduce((a,s)=>a+pieceCost(s).c,0);
const kwhFor = ps => ps.reduce((a,s)=>a+pieceCost(s).kwh,0);
const startOf = p => { const [y,mo,d]=(p.fecha||'').split('-').map(Number); const [H,M]=(p.hora||'').split(':').map(Number); return new Date(y,mo-1,d,H,M,0,0); };
function matOf(p){
  if(p.mat==='custom') return {usd:+p.cPrecio||0,bob:+p.cGramos||0,name:'Otra bobina',store:'',short:'Otra bobina'};
  const m=MATS[+p.mat]||MATS[+DEF_MAT]; return {usd:m[3],bob:m[4],name:m[2]+' ('+m[0]+')',store:m[0],short:m[2]};
}
function compute(p, withBest){
  const hours=r4((+p.h||0)+(+p.m||0)/60), mat=matOf(p);
  const pesosBob=r4(mat.usd*cfg.dolar), perG=mat.bob>0?r4(pesosBob/mat.bob):0;
  const err=[];
  const st=startOf(p);
  if(isNaN(st)) err.push('Falta la fecha u hora de inicio.');
  if(hours<=0) err.push('Ingresá la duración de la impresión.');
  if(hours>240) err.push('La duración supera 240 h; revisá el valor.');
  let segs=[],pcs=[],end=null,ene=0,kwh=0,best=null;
  if(!err.length){
    ({segs,end}=segments(st,hours,p.feriado));
    pcs=pieces(st,hours,p,mat); ene=energyFor(pcs); kwh=kwhFor(pcs);
    if(withBest){
      for(let h=0;h<24;h++){
        const s2=new Date(st); s2.setHours(h,0,0,0);
        const c=energyFor(pieces(s2,hours,p,mat));
        if(!best || c<best.c-1e-9) best={h,c};
      }
    }
  }
  const fil=r4((+p.g||0)*perG);
  const vFil=r4(cfg.mFil*fil), vEne=r4(cfg.mEne*ene), vx=r2(vFil+vEne);
  return {hours,mat,pesosBob,perG,err,start:st,segs,pcs,end,ene,kwh,fil,total:r2(ene+fil),best,pw:printW(mat),vFil,vEne,vx,vr:roundUp(vx)};
}
const fmtT = d => DIAS[d.getDay()]+' '+pad(d.getHours())+':'+pad(d.getMinutes());
const fmtD = d => DIAS[d.getDay()]+' '+pad(d.getDate())+'/'+pad(d.getMonth()+1)+' '+pad(d.getHours())+':'+pad(d.getMinutes());
const fmtH = (h,m) => (+h||0)+' h '+pad(+m||0)+' min';
const fmtHd = h => { const H=Math.floor(h+1e-9), M=Math.round((h-H)*60); return H+' h'+(M?' '+pad(M)+' min':''); };


/* ---------- utilidades de animación ---------- */
const RM = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
const easeOut = t => 1-Math.pow(1-t,3);
function tweenText(el, to, fmt, dur){
  if(!el) return;
  const from = (el._v===undefined) ? 0 : el._v;
  el._v = to;
  if(RM() || Math.abs(to-from) < 1e-9){ el.textContent = fmt(to); return; }
  cancelAnimationFrame(el._raf);
  const t0 = performance.now(), d = dur||480;
  const step = now => {
    const k = Math.min(1,(now-t0)/d), v = from + (to-from)*easeOut(k);
    el.textContent = fmt(k<1 ? v : to);
    if(k<1) el._raf = requestAnimationFrame(step);
  };
  el._raf = requestAnimationFrame(step);
}
const fmtMoney = v => money(v);
const fmtG = v => nf1.format(Math.round(v*10)/10)+' g';

/* ---------- hojas (con arrastre para cerrar) ---------- */
function openSheet(d){ d.classList.remove('closing'); d.style.transform=''; try{ d.showModal(); }catch(e){ d.setAttribute('open',''); } }
function closeSheet(d, after){
  if(!d.open){ if(after) after(); return; }
  const done = () => { d.classList.remove('closing'); d.style.transform=''; try{ d.close(); }catch(e){ d.removeAttribute('open'); } if(after) after(); };
  if(RM()){ done(); return; }
  d.classList.add('closing');
  setTimeout(done, 240);
}
function enableDrag(d){
  const top = d.querySelector('.sheet-top'); let y0=null, dy=0, t0=0;
  top.addEventListener('pointerdown', e => {
    if(e.target.closest('button') || window.innerWidth>600) return;
    y0=e.clientY; dy=0; t0=performance.now(); d.classList.add('dragging'); top.setPointerCapture(e.pointerId);
  });
  top.addEventListener('pointermove', e => { if(y0===null) return; dy=Math.max(0,e.clientY-y0); d.style.transform='translateY('+dy+'px)'; });
  const end = () => {
    if(y0===null) return; d.classList.remove('dragging');
    const v = dy/Math.max(1,performance.now()-t0);
    y0=null;
    if(dy>110 || v>0.6){ d.classList.add('snap'); d.style.transform='translateY(100%)'; setTimeout(()=>{ d.classList.remove('snap'); closeSheet(d); },280); }
    else { d.classList.add('snap'); d.style.transform=''; setTimeout(()=>d.classList.remove('snap'),320); }
  };
  top.addEventListener('pointerup', end); top.addEventListener('pointercancel', end);
}
[$('matSheet'),$('setSheet'),$('projSheet')].forEach(d=>{
  enableDrag(d);
  d.addEventListener('cancel', e => { e.preventDefault(); closeSheet(d); });
  d.addEventListener('click', e => { if(e.target===d) closeSheet(d); });
});

/* altura visible real (descuenta el teclado en iPhone) */
(function(){
  const vv=window.visualViewport; if(!vv) return;
  const fit=()=>{ const r=document.documentElement.style; r.setProperty('--vvh', vv.height+'px'); r.setProperty('--vvt', vv.offsetTop+'px'); };
  vv.addEventListener('resize',fit); vv.addEventListener('scroll',fit); fit();
})();

/* ---------- hoja de materiales ---------- */
const ms=$('matSearch'), ml=$('matList'), sheetM=$('matSheet');
let results=[], hi=-1, scope='';
const TOKENS=['PLA','PLA+','PETG','Seda','Mate','ABS','TPU','Madera','Bambu','3N3','Grilon3','4kg'];
$('tokens').innerHTML=TOKENS.map(t=>'<button type="button" data-t="'+esc(t)+'">'+esc(t)+'</button>').join('');
function filterMats(q){
  const toks=norm(q).split(/\s+/).filter(Boolean);
  const idx=[]; MATS.forEach((m,i)=>{ if((!scope||m[0]===scope) && toks.every(t=>MAT_TXT[i].includes(t))) idx.push(String(i)); });
  if(!scope && (!toks.length || 'otra bobina precio a mano personalizado'.includes(norm(q).trim()))) idx.push('custom');
  return {idx,toks};
}
function hl(text,toks){
  if(!toks.length) return esc(text);
  const n=norm(text), marks=new Array(text.length).fill(false);
  toks.forEach(t=>{ let i=n.indexOf(t); while(i>-1){ for(let k=i;k<i+t.length;k++) marks[k]=true; i=n.indexOf(t,i+t.length);} });
  let out='', on=false;
  for(let k=0;k<text.length;k++){ if(marks[k]&&!on){out+='<mark>';on=true;} if(!marks[k]&&on){out+='</mark>';on=false;} out+=esc(text[k]); }
  return on?out+'</mark>':out;
}
function renderList(animate){
  const q=ms.value, {idx,toks}=filterMats(q); results=idx;
  const cur=active().mat; let html='', grp='';
  if(!idx.length) html='<div class="empty">Sin resultados para “'+esc(q)+'”. Probá con otra palabra, cambiá de tienda o elegí “Otra bobina” en Todas.</div>';
  idx.forEach((v,k)=>{
    let g,n,meta,pg;
    if(v==='custom'){ g='Otro'; n='Otra bobina'; meta='Precio y peso a mano'; pg=''; }
    else{ const m=MATS[+v]; g=m[0]+' · '+m[1]; n=m[2]; meta='US$ '+nf2.format(m[3])+' · '+m[4].toLocaleString('es-UY')+' g'; pg='$'+nf4.format(r4(r4(m[3]*cfg.dolar)/m[4]))+'/g'; }
    if(g!==grp){ html+='<div class="grp" role="presentation">'+esc(g)+'</div>'; grp=g; }
    html+='<div class="opt" style="--k:'+Math.min(k,14)+'" role="option" id="o'+k+'" data-v="'+v+'" aria-selected="'+(k===hi)+'"><span class="ck" aria-hidden="true">'+(v===cur?'✓':'')+'</span><span class="tx"><span class="n">'+hl(n,toks)+'</span><span class="m">'+meta+'</span></span><span class="pg">'+pg+'</span></div>';
  });
  const nm=idx.filter(v=>v!=='custom').length;
  ml.classList.toggle('anim', !!animate);
  ml.innerHTML='<div class="count">'+nm+(nm===1?' filamento':' filamentos')+(scope?' en '+esc(scope):'')+'</div>'+html;
  ms.setAttribute('aria-activedescendant', hi>-1?'o'+hi:'');
}
function openMat(){ ms.value=''; hi=-1; renderList(true); openSheet(sheetM); if(window.innerWidth>600) setTimeout(()=>ms.focus(),40); }
function moveHi(d){ if(!results.length) return; hi=(hi+d+results.length)%results.length; renderList(false); const el=$('o'+hi); if(el) el.scrollIntoView({block:'nearest'}); }
function pickMat(v){ active().mat=v; save(); closeSheet(sheetM, ()=>{ renderAll(); if(v==='custom') $('cPrecio').focus(); else $('matBtn').focus(); }); }
$('matBtn').addEventListener('click',openMat);
$('matClose').addEventListener('click',()=>closeSheet(sheetM,()=>$('matBtn').focus()));
ms.addEventListener('input',()=>{ hi=ms.value.trim()?0:-1; renderList(false); });
ms.addEventListener('keydown',e=>{
  if(e.key==='ArrowDown'){ e.preventDefault(); moveHi(1); }
  else if(e.key==='ArrowUp'){ e.preventDefault(); moveHi(-1); }
  else if(e.key==='Enter'){ e.preventDefault(); const v=results[hi>-1?hi:0]; if(v!==undefined && (hi>-1 || ms.value.trim())) pickMat(v); }
});
ml.addEventListener('click',e=>{ const o=e.target.closest('.opt'); if(o) pickMat(o.dataset.v); });
function moveThumb(){ const bs=[...$('scope').querySelectorAll('button')]; const i=Math.max(0,bs.findIndex(b=>b.getAttribute('aria-pressed')==='true')); $('segThumb').style.transform='translateX(calc('+i+' * (100% + 2px)))'; }
$('scope').addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b) return; scope=b.dataset.s; $('scope').querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b)); moveThumb(); hi=-1; renderList(true); });
$('tokens').addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b) return; const t=b.dataset.t; const cur=ms.value.trim(); ms.value = norm(cur).split(/\s+/).includes(norm(t)) ? cur : (cur?cur+' ':'')+t; hi=0; renderList(true); });

/* ---------- hoja de ajustes ---------- */
const sheetS=$('setSheet');
$('setBtn').addEventListener('click',()=>{ fillForm(); openSheet(sheetS); });
$('setClose').addEventListener('click',()=>closeSheet(sheetS,()=>$('setBtn').focus()));
$('setBody').addEventListener('input',()=>{ Object.keys(DEF).forEach(k=>{ const v=parseFloat($(k).value); cfg[k]=isFinite(v)?v:0; }); save(); renderAll(); });
$('reset').addEventListener('click',()=>{ Object.assign(cfg,DEF); save(); fillForm(); renderAll(); toast('Ajustes restaurados a los valores originales.'); });

/* ---------- formulario ---------- */
const FIELDS=['pname','peso','horas','mins','fecha','hora','feriado','arranque','cPrecio','cGramos'];
const MAP={pname:'name',peso:'g',horas:'h',mins:'m',fecha:'fecha',hora:'hora',feriado:'feriado',arranque:'arranque',cPrecio:'cPrecio',cGramos:'cGramos'};
function fillForm(){
  const p=active();
  FIELDS.forEach(f=>{ const el=$(f); if(el.type==='checkbox') el.checked=!!p[MAP[f]]; else el.value=p[MAP[f]]; });
  Object.keys(DEF).forEach(k=>$(k).value=cfg[k]);
  $('projName').value=proj.name;
}
function readForm(){
  const p=active();
  FIELDS.forEach(f=>{ const el=$(f); p[MAP[f]] = el.type==='checkbox'?el.checked : (el.type==='number'? (el.value===''?'':parseFloat(el.value)) : el.value); });
}
/* el dock se esconde mientras el teclado está abierto */
document.addEventListener('focusin',e=>{ if(e.target.matches('input:not([type=checkbox]),textarea') && !e.target.closest('dialog')) document.body.classList.add('typing'); });
document.addEventListener('focusout',()=>setTimeout(()=>{ const a=document.activeElement; if(!(a && a.matches && a.matches('input:not([type=checkbox]),textarea'))) document.body.classList.remove('typing'); },60));

/* ---------- reloj tarifario ---------- */
const CX=130, CY=130;
function pt(r,frac){ const a=frac*2*Math.PI-Math.PI/2; return [CX+r*Math.cos(a), CY+r*Math.sin(a)]; }
function arcPath(r,f0,f1){
  const [x0,y0]=pt(r,f0), [x1,y1]=pt(r,f1), large=(f1-f0)>0.5?1:0;
  return 'M'+x0.toFixed(2)+' '+y0.toFixed(2)+' A'+r+' '+r+' 0 '+large+' 1 '+x1.toFixed(2)+' '+y1.toFixed(2);
}
(function buildTicks(){
  let s='';
  [0,6,12,18].forEach(h=>{ const [x,y]=pt(124,h/24); s+='<text class="hl" x="'+x.toFixed(1)+'" y="'+(y+4).toFixed(1)+'" text-anchor="middle">'+pad(h)+'</text>'; });
  for(let h=0;h<24;h++){ const [x0,y0]=pt(92,h/24),[x1,y1]=pt(h%6?89:86,h/24); s+='<line x1="'+x0.toFixed(1)+'" y1="'+y0.toFixed(1)+'" x2="'+x1.toFixed(1)+'" y2="'+y1.toFixed(1)+'" stroke="var(--ink3)" stroke-width="'+(h%6?1:1.6)+'" opacity=".6"/>'; }
  $('ticks').innerHTML=s;
})();
let ringKey='', rotS=null, rotE=null;
function shortest(prev, deg){ if(prev===null) return deg; let d=((deg-prev)%360+540)%360-180; return prev+d; }
function renderDial(r,p){
  const st=r.start, habil = !isNaN(st) && st.getDay()>=1 && st.getDay()<=5 && !p.feriado;
  const key = habil?'h':'f';
  if(key!==ringKey){
    const ring = habil ? [['valle',0,7],['llano',7,17],['punta',17,23],['llano',23,24]] : [['valle',0,7],['llano',7,24]];
    $('ring').innerHTML = ring.map(([b,a,z])=>'<path d="'+arcPath(104,a/24+0.002,z/24-0.002)+'" fill="none" stroke="var(--'+b+')" stroke-width="16"/>').join('');
    ringKey=key;
  }
  let label='Sin datos suficientes para dibujar la impresión.';
  const arc=$('arc');
  if(r.end){
    const f0=(st.getHours()+st.getMinutes()/60)/24, span=Math.min(r.hours,24)/24;
    rotS = shortest(rotS, f0*360); rotE = shortest(rotE, (f0+span)*360);
    $('arcRot').style.transform='rotate('+rotS+'deg)';
    $('startRot').style.transform='rotate('+rotS+'deg)';
    $('endRot').style.transform='rotate('+rotE+'deg)';
    arc.style.strokeDasharray = (span>=0.999?100:(span*100).toFixed(3))+' 100';
    $('startRot').style.opacity=1; $('endRot').style.opacity=1;
    $('dialH').textContent = fmtHd(r.hours);
    $('dialT').textContent = pad(st.getHours())+':'+pad(st.getMinutes())+' → '+pad(r.end.getHours())+':'+pad(r.end.getMinutes())+(r.hours>24?' · '+Math.ceil(r.hours/24)+' días':'');
    const byBand={}; r.segs.forEach(g=>byBand[g.band]=(byBand[g.band]||0)+g.h);
    label='Reloj de 24 horas. Impresión de '+fmtT(st)+' a '+fmtT(r.end)+': '+Object.keys(byBand).map(b=>fmtHd(byBand[b])+' en '+NAMES[b].toLowerCase()).join(', ')+'. Costo '+money(r.total)+'.';
  } else {
    arc.style.strokeDasharray='0 100'; $('startRot').style.opacity=0; $('endRot').style.opacity=0;
    $('dialH').textContent='—'; $('dialT').textContent='completá los datos';
  }
  $('dial').setAttribute('aria-label',label);
}

/* ---------- render ---------- */
let popId=null;
function renderTabs(results){
  const t=$('tabs'), sc=t.scrollLeft; t.innerHTML='';
  proj.prints.forEach((p,i)=>{
    const b=document.createElement('button'); b.type='button'; b.className='tab'+(p.id===popId?' pop':''); b.setAttribute('role','tab');
    b.setAttribute('aria-selected', p.id===proj.active); b.tabIndex = p.id===proj.active?0:-1; b.dataset.id=p.id;
    const r=results[i];
    b.innerHTML='<span>'+esc(p.name||('Impresión '+(i+1)))+'</span><span class="c">'+(r.err.length?'falta dato':money(r.total))+'</span>';
    t.appendChild(b);
  });
  t.scrollLeft=sc;
  if(popId){ const el=t.querySelector('.pop'); if(el) el.scrollIntoView({inline:'nearest',block:'nearest',behavior:RM()?'auto':'smooth'}); popId=null; }
}
let lastTipKey='';
function renderActive(){
  const p=active(), r=compute(p,true);
  $('customBox').hidden = p.mat!=='custom';
  $('matName').textContent = r.mat.short;
  $('matSub').textContent = (r.mat.store? r.mat.store+' · ':'')+'US$ '+nf2.format(r.mat.usd)+' · '+r.mat.bob.toLocaleString('es-UY')+' g · $'+nf4.format(r.perG)+'/g';
  $('matinfo').textContent='US$ '+nf2.format(r.mat.usd)+' × $'+nf2.format(cfg.dolar)+' = $'+nf2.format(r.pesosBob)+' ÷ '+r.mat.bob.toLocaleString('es-UY')+' g = $'+nf4.format(r.perG)+'/g';
  $('err').hidden=!r.err.length; $('err').textContent=r.err.join(' ');
  const nm = p.name||'Esta impresión';
  $('resLabel').textContent = nm;
  $('dockName').textContent = nm;
  $('totalSub').textContent = r.end ? 'Termina '+fmtT(r.end)+' · '+nf4.format(r4(r.kwh))+' kWh' : 'Completá duración e inicio.';
  tweenText($('pCost'), r.total, fmtMoney); tweenText($('pGrams'), +p.g||0, fmtG);
  tweenText($('dockCost'), r.total, fmtMoney);
  const okP=!r.err.length;
  tweenText($('pSale'), okP?r.vr:0, fmtSale);
  $('pSaleX').textContent = okP ? (cfg.redondeo>0?'exacto '+money(r.vx)+' · ':'')+'margen '+money(r.vr-r.total) : 'completá los datos';
  $('dockGrams').textContent = fmtG(+p.g||0)+(okP?' · mín. '+fmtSale(r.vr):'');
  tweenText($('fil'), r.fil, fmtMoney); tweenText($('ene'), r.ene, fmtMoney);
  $('filPct').textContent = r.total>0 ? Math.round(r2(r.fil)/r.total*100)+' % del total' : '';
  $('enePct').textContent = r.total>0 ? Math.round(r2(r.ene)/r.total*100)+' % del total' : '';
  $('bedInfo').textContent = cfg.volt+'² V ÷ '+nf2.format(cfg.rBed)+' Ω = '+nf2.format(bedW())+' W mientras calienta';
  renderDial(r,p);
  const agg={}; r.pcs.forEach(s=>{ const c=pieceCost(s); agg[s.band]=agg[s.band]||{h:0,c:0}; agg[s.band].h+=s.h; agg[s.band].c+=c.c; });
  const maxH = Math.max(0.0001, ...Object.values(agg).map(a=>a.h));
  document.querySelectorAll('#bands .band').forEach(row=>{
    const a=agg[row.dataset.b];
    row.hidden=!a;
    if(a){ row.querySelector('.h').textContent=fmtHd(a.h); row.querySelector('.c').textContent=money(a.c); row.querySelector('.bar i').style.transform='scaleX('+(a.h/maxH).toFixed(4)+')'; }
    else row.querySelector('.bar i').style.transform='scaleX(0)';
  });
  if(r.best){
    const sv=r2(r.ene)-r2(r.best.c);
    const html = sv>0.004
      ? 'Arrancando ese día a las <strong>'+pad(r.best.h)+':00</strong> la energía costaría <strong>'+money(r.best.c)+'</strong>. Ahorrás <strong>'+money(sv)+'</strong>.'
      : 'Buen horario: ninguna hora de inicio ese día sale más barata en energía.';
    $('tip').hidden=false;
    if(html!==lastTipKey){ $('tipTxt').innerHTML=html; lastTipKey=html; const tp=$('tip'); tp.classList.remove('flash'); void tp.offsetWidth; tp.classList.add('flash'); }
  } else { $('tip').hidden=true; lastTipKey=''; }
  const rows=[];
  r.pcs.forEach(s=>{
    const {kwh,c}=pieceCost(s);
    const lbl = PHASE[s.phase] + (s.phase==='imp' ? ' ('+r.pw.src+')' : '');
    rows.push('<div class="step"><span class="t">'+lbl+'</span><span class="c">'+money(c)+'</span><span class="w"><span class="pill p-'+s.band+'">'+NAMES[s.band]+'</span>'+fmtT(s.start)+' → '+fmtT(s.end)+'</span><span class="f">'+nf2.format(s.w)+' W × '+nf4.format(r4(s.h))+' h ÷ 1000 = '+nf4.format(kwh)+' kWh × $'+nf4.format(P()[s.band])+'</span></div>');
  });
  rows.push('<div class="step"><span class="t">Filamento</span><span class="c">'+money(r.fil)+'</span><span class="w">'+esc(r.mat.name)+'</span><span class="f">'+nf2.format(+p.g||0)+' g × $'+nf4.format(r.perG)+'/g</span></div>');
  rows.push('<div class="step tot"><span class="t">Costo total</span><span class="c">'+money(r.total)+'</span><span class="f">energía '+money(r.ene)+' + filamento '+money(r.fil)+'</span></div>');
  if(!r.err.length){
    const mf=nf2.format(cfg.mFil).replace(/,00$/,''), me=nf2.format(cfg.mEne).replace(/,00$/,'');
    rows.push('<div class="stephead">Precio de venta</div>');
    rows.push('<div class="step"><span class="t">Filamento × '+mf+'</span><span class="c">'+money(r.vFil)+'</span><span class="f">'+nf4.format(r.fil)+' × '+mf+' = '+nf4.format(r.vFil)+'</span></div>');
    rows.push('<div class="step"><span class="t">Energía × '+me+'</span><span class="c">'+money(r.vEne)+'</span><span class="f">'+nf4.format(r.ene)+' × '+me+' = '+nf4.format(r.vEne)+'</span></div>');
    rows.push('<div class="step tot sale"><span class="t">Precio mínimo</span><span class="c">'+fmtSale(r.vr)+'</span><span class="f">'+money(r.vFil)+' + '+money(r.vEne)+' = '+money(r.vx)+(cfg.redondeo>0?' → hacia arriba a $'+nf0.format(cfg.redondeo)+' = '+fmtSale(r.vr):'')+' · margen '+money(r.vr-r.total)+'</span></div>');
  }
  $('steplist').innerHTML=rows.join('');
  $('delBtn').disabled = proj.prints.length<2;
}
function projectTotals(results){
  const ok=results.filter(r=>!r.err.length);
  return {
    g: proj.prints.reduce((a,p,i)=>a+(results[i].err.length?0:(+p.g||0)),0),
    h: ok.reduce((a,r)=>a+r.hours,0),
    ene: ok.reduce((a,r)=>a+r2(r.ene),0),
    fil: ok.reduce((a,r)=>a+r2(r.fil),0),
    total: ok.reduce((a,r)=>a+r.total,0),
    vx: r2(ok.reduce((a,r)=>a+r.vx,0)),
    get vr(){ return roundUp(this.vx); },
    missing: results.length-ok.length
  };
}
function renderSummary(results, T){
  ['projTotal','barTotal','dockTotal','sumTotal'].forEach(id=>tweenText($(id), T.total, fmtMoney));
  ['projGrams','barGrams'].forEach(id=>tweenText($(id), T.g, fmtG));
  $('dockPGrams').textContent = fmtG(T.g)+' · mín. '+fmtSale(T.vr);
  ['projSale','barSale','sumSale'].forEach(id=>tweenText($(id), T.vr, fmtSale));
  const sx = (cfg.redondeo>0?'exacto '+money(T.vx)+' · ':'')+'margen '+money(T.vr-T.total);
  $('projSaleX').textContent = sx; $('sumSaleX').textContent = cfg.redondeo>0?'exacto '+money(T.vx):'';
  $('sumMargin').textContent = 'margen '+money(T.vr-T.total);
  $('saleInfo').textContent = 'Filamento × '+nf2.format(cfg.mFil)+' + energía × '+nf2.format(cfg.mEne)+(cfg.redondeo>0?', redondeado hacia arriba a $'+nf0.format(cfg.redondeo):', sin redondeo')+'.';
  const n=proj.prints.length;
  $('projMeta').textContent = n+(n===1?' impresión':' impresiones')+(T.missing?' · '+T.missing+' sin calcular':'');
  $('projHours').textContent = nf1.format(T.h)+' h de impresión';
  $('plist').innerHTML = proj.prints.map((p,i)=>{
    const r=results[i];
    return '<button type="button" class="pitem'+(p.id===proj.active?' on':'')+'" data-id="'+p.id+'"><span class="n">'+esc(p.name||('Impresión '+(i+1)))+'</span><span class="v">'+(r.err.length?'—':money(r.total))+'</span>'+
      '<span class="m">'+esc(r.mat.short)+' · '+nf1.format(+p.g||0)+' g · '+fmtHd(r.hours)+(isNaN(r.start)?'':' · '+fmtD(r.start))+'</span>'+
      '<span class="e">'+(r.err.length?'falta dato':'luz '+money(r.ene)+' · fil. '+money(r.fil)+' · precio mín. '+money(r.vx))+'</span></button>';
  }).join('');
  $('sumMeta').textContent = nf1.format(T.g)+' g · '+nf1.format(T.h)+' h';
  $('sumSplit').textContent = 'luz '+money(T.ene)+' · fil. '+money(T.fil);
  const tot=T.ene+T.fil;
  $('mixF').style.flexGrow = tot>0?T.fil:1; $('mixE').style.flexGrow = tot>0?T.ene:0;
  $('mixLabel').textContent = tot>0 ? 'Filamento '+Math.round(T.fil/tot*100)+' % · Energía '+Math.round(T.ene/tot*100)+' %' : '';
  $('sumHint').textContent = n<2 ? 'Si el proyecto lleva varias placas, agregalas con “+” y acá vas a ver el total.' : 'Tocá una impresión para editarla.';
}
function renderAll(){
  const results=proj.prints.map(p=>compute(p,false));
  renderTabs(results); renderActive(); renderSummary(results, projectTotals(results));
}
function select(id){
  const changed = id!==proj.active;
  proj.active=id; save(); fillForm(); renderAll();
  if(changed && !RM()){ const rc=$('result'); rc.classList.remove('swap'); void rc.offsetWidth; rc.classList.add('swap'); }
}

/* ---------- acciones ---------- */
function afterEnd(p){
  const r=compute(p,false); if(!r.end) return {};
  const e=r.end; return {fecha:e.getFullYear()+'-'+pad(e.getMonth()+1)+'-'+pad(e.getDate()), hora:pad(e.getHours())+':'+pad(e.getMinutes())};
}
function addPrint(){
  const last=proj.prints[proj.prints.length-1];
  const p=blankPrint(proj.prints.length+1, Object.assign({mat:last.mat,cPrecio:last.cPrecio,cGramos:last.cGramos,feriado:last.feriado}, afterEnd(last)));
  proj.prints.push(p); popId=p.id; select(p.id);
  $('form').scrollIntoView({behavior:RM()?'auto':'smooth',block:'start'});
  toast('Agregada “'+p.name+'”, arranca cuando termina la anterior.');
}
function dupPrint(){
  const a=active(), i=proj.prints.indexOf(a);
  const base=/\d+$/.test(a.name)?a.name.replace(/\d+$/,'')+(proj.prints.length+1):a.name+' (copia)';
  const p=Object.assign({},a,{id:uid(),name:base},afterEnd(a));
  proj.prints.splice(i+1,0,p); popId=p.id; select(p.id);
  toast('Duplicada. La copia arranca cuando termina “'+a.name+'”.');
}
let undoFn=null, tTimer=null;
function hideToast(){ $('toast').hidden=true; undoFn=null; clearTimeout(tTimer); }
function toast(msg, undo){
  const t=$('toast'); t.hidden=true;
  const host=[...document.querySelectorAll('dialog[open]')].filter(d=>!d.classList.contains('closing')).pop()||document.body;   // encima de una hoja abierta
  if(t.parentNode!==host) host.appendChild(t);
  void t.offsetWidth;
  $('toastMsg').textContent=msg; undoFn=undo||null; $('toastUndo').hidden=!undo; t.hidden=false;
  clearTimeout(tTimer); if(!undo) tTimer=setTimeout(hideToast, 4000);   // con Deshacer, queda hasta que la cierres
}
$('toastUndo').addEventListener('click',()=>{ const f=undoFn; hideToast(); if(f) f(); });
$('toastX').addEventListener('click',hideToast);
function delPrint(){
  if(proj.prints.length<2) return;
  const a=active(), i=proj.prints.indexOf(a);
  proj.prints.splice(i,1); select(proj.prints[Math.max(0,i-1)].id);
  toast('Eliminada “'+(a.name||'impresión')+'”.', ()=>{ proj.prints.splice(i,0,a); popId=a.id; select(a.id); toast('Restaurada “'+(a.name||'impresión')+'”.'); });
}
function blankProject(mat){
  const pr=normProj({id:newPid(),name:'Proyecto sin nombre',active:'',prints:[blankPrint(1,{name:'Impresión 1',mat:mat||DEF_MAT})]});
  return pr;
}
function openProject(id, msg){
  if(!allProjects[id]) return;
  flushSave();
  proj=allProjects[id]; store.set('proyecto_actual', proj.id);
  fillForm(); popId=null; renderAll(); renderProjList();
  const rc=$('result'); if(!RM()){ rc.classList.remove('swap'); void rc.offsetWidth; rc.classList.add('swap'); }
  if(msg) toast(msg);
}
function newProject(){
  flushSave();
  const pr=blankProject(active().mat);
  allProjects[pr.id]=pr; proj=pr; popId=pr.prints[0].id; save();
  fillForm(); renderAll(); renderProjList();
  closeSheet($('projSheet'));
  setTimeout(()=>{ $('projName').focus(); $('projName').select(); }, 60);
  toast('Proyecto nuevo creado. Los anteriores siguen en Proyectos.');
}
function deleteProject(id){
  const gone=allProjects[id]; if(!gone) return;
  delete allProjects[id];
  if(DB) DB.doc('projects/'+id).delete().catch(()=>{});
  const wasCurrent = proj.id===id;
  if(wasCurrent){
    const next=Object.values(allProjects).sort((a,b)=>b.updatedAt-a.updatedAt)[0] || (()=>{ const b=blankProject(gone.prints[0].mat); allProjects[b.id]=b; return b; })();
    proj=next; fillForm(); renderAll();
  }
  persistLocal(); if(DB && !allProjects[proj.id].synced) writeRemote(proj);
  renderProjList(); renderCount();
  toast('Eliminado “'+gone.name+'”.', ()=>{
    gone.updatedAt=Date.now(); allProjects[gone.id]=gone; persistLocal();
    if(DB) writeRemote(gone);
    if(wasCurrent) openProject(gone.id); else renderProjList();
    renderCount(); toast('Restaurado “'+gone.name+'”.');
  });
}
function projTotalsOf(pr){
  const res=pr.prints.map(x=>compute(x,false)), ok=res.filter(r=>!r.err.length);
  return {total:ok.reduce((a,r)=>a+r.total,0), g:pr.prints.reduce((a,x,i)=>a+(res[i].err.length?0:(+x.g||0)),0), n:pr.prints.length, vr:roundUp(r2(ok.reduce((a,r)=>a+r.vx,0)))};
}
const fmtUpd = ts => { const d=new Date(ts); return pad(d.getDate())+'/'+pad(d.getMonth()+1)+' '+pad(d.getHours())+':'+pad(d.getMinutes()); };
const TRASH='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/></svg>';
function renderProjList(){
  const list=$('projList'); if(!list) return;
  const items=Object.values(allProjects).sort((a,b)=>b.updatedAt-a.updatedAt);
  list.innerHTML = items.map((pr,k)=>{
    const T=projTotalsOf(pr), on=pr.id===proj.id;
    return '<div class="pj'+(on?' on':'')+'" role="listitem" style="--k:'+Math.min(k,12)+'" data-id="'+pr.id+'">'+
      '<button type="button" class="open" data-id="'+pr.id+'" aria-label="Abrir '+esc(pr.name)+'"><span class="n">'+esc(pr.name)+'</span><span class="v">'+money(T.total)+'</span>'+
      '<span class="m">'+(on?'<span class="cur">Abierto · </span>':'')+T.n+(T.n===1?' impresión':' impresiones')+' · '+fmtG(T.g)+' · mín. '+fmtSale(T.vr)+' · '+fmtUpd(pr.updatedAt)+'</span></button>'+
      '<button type="button" class="del" data-id="'+pr.id+'" aria-label="Eliminar '+esc(pr.name)+'">'+TRASH+'</button></div>';
  }).join('');
  $('projSyncNote').textContent = DB ? 'Se guardan solos en tu cuenta y los ves desde cualquier dispositivo.' : 'Se guardan solo en este navegador. Exportá una copia para no perderlos o para pasarlos a otro dispositivo.';
  renderBackupNote();
}
function renderCount(){ const n=Object.keys(allProjects).length; $('projCount').textContent=n; }
function renderSync(){
  const el=$('syncTxt'); if(!el) return;
  const m={local:['Guardado en este navegador',''],saving:['Guardando…','busy'],saved:['Guardado en tu cuenta','ok'],error:['Sin conexión · copia local','bad'],quota:['Base llena: borrá proyectos viejos','bad']}[syncState]||['',''];
  el.textContent=m[0]; el.className='sync '+m[1];
}
$('projBtn').addEventListener('click',()=>{ renderProjList(); openSheet($('projSheet')); });
$('projClose').addEventListener('click',()=>closeSheet($('projSheet'),()=>$('projBtn').focus()));
$('projNew').addEventListener('click',newProject);
$('projList').addEventListener('click',e=>{
  const del=e.target.closest('.del'); if(del){ const row=del.closest('.pj'); if(!RM()){ row.classList.add('leaving'); setTimeout(()=>deleteProject(del.dataset.id),230); } else deleteProject(del.dataset.id); return; }
  const op=e.target.closest('.open'); if(op){ const id=op.dataset.id; closeSheet($('projSheet'), ()=>{ if(id!==proj.id) openProject(id,'Abriste “'+allProjects[id].name+'”.'); }); }
});

/* ---------- copia de seguridad: exportar e importar ---------- */
// Archivo: {app, version, exportado, proyectos:[...], ajustes:{...}}. Cada impresión lleva además
// matNombre, porque p.mat es un índice de FILAMENTOS y la lista puede cambiar entre exportar e importar.
const BACKUP_APP='calculadora-impresion-3d', BACKUP_VER=1, BACKUP_MAX=2*1024*1024;
const fmtDia = d => pad(d.getDate())+'/'+pad(d.getMonth()+1)+'/'+d.getFullYear();
function renderBackupNote(){
  const t=+store.get('ultima_copia');
  $('backupNote').textContent = t ? 'Última: '+fmtDia(new Date(t)) : 'Nunca exportaste una copia';
}
function exportBackup(){
  flushSave(); persistLocal();
  const list=Object.values(allProjects).filter(p=>!p.seed).sort((a,b)=>b.updatedAt-a.updatedAt).map(p=>({
    id:p.id, name:p.name, active:p.active, createdAt:p.createdAt, updatedAt:p.updatedAt,
    prints:p.prints.map(x=>Object.assign({}, x, x.mat!=='custom' && MATS[+x.mat] ? {matNombre:MATS[+x.mat][2]} : {}))
  }));
  if(!list.length){ toast('Todavía no tenés proyectos propios para exportar.'); return; }
  const now=new Date();
  const data={app:BACKUP_APP, version:BACKUP_VER, exportado:now.toISOString(), proyectos:list, ajustes:Object.assign({},cfg)};
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,1)],{type:'application/json'}));
  a.download='calculadora-3d-copia-'+now.getFullYear()+'-'+pad(now.getMonth()+1)+'-'+pad(now.getDate())+'.json';
  $('projSheet').appendChild(a); a.click(); a.remove();   // dentro de la hoja: fuera de un <dialog> modal el clic puede no llegar
  setTimeout(()=>URL.revokeObjectURL(a.href), 10000);
  store.set('ultima_copia', String(now.getTime())); renderBackupNote();
  toast('Exportaste '+list.length+(list.length===1?' proyecto':' proyectos')+'. Guardá el archivo en un lugar seguro.');
}
/* lo importado entra por una lista cerrada de campos: los ids van sin escapar a data-id="…" */
const okId = s => typeof s==='string' && /^[A-Za-z0-9_-]{1,40}$/.test(s);
const numOr = v => (v===''||v===null||v===undefined||!isFinite(+v)) ? '' : +v;
function cleanPrint(x, ids, st){
  if(!x || typeof x!=='object') return null;
  const id = okId(x.id) && !ids.has(x.id) ? x.id : uid(); ids.add(id);
  let mat = x.mat==='custom' ? 'custom' : (/^\d+$/.test(String(x.mat)) && MATS[+x.mat] ? String(+x.mat) : null);
  if(mat!=='custom' && typeof x.matNombre==='string' && !(mat && MATS[+mat][2]===x.matNombre)){
    const i=MATS.findIndex(m=>m[2]===x.matNombre);
    if(i>=0) mat=String(i); else st.lostMat++;
  }
  if(mat===null){ mat=DEF_MAT; if(typeof x.matNombre!=='string') st.lostMat++; }
  return {id, name:x.name==null?'':String(x.name), g:numOr(x.g), h:numOr(x.h), m:numOr(x.m),
    fecha:String(x.fecha||''), hora:String(x.hora||''), feriado:!!x.feriado, arranque:x.arranque!==false,
    mat, cPrecio:numOr(x.cPrecio), cGramos:numOr(x.cGramos)};
}
function cleanProject(x, st){
  if(!x || typeof x!=='object' || !Array.isArray(x.prints)) return null;
  const ids=new Set(), idMap=new Map();
  const prints=x.prints.map(p=>{ const c=cleanPrint(p,ids,st); if(c && p) idMap.set(p.id,c.id); return c; }).filter(Boolean);
  if(!prints.length) return null;
  return normProj({id:okId(x.id)?x.id:newPid(), name:String(x.name||'Proyecto sin nombre').slice(0,80),
    active:idMap.get(x.active)||prints[0].id, prints, updatedAt:+x.updatedAt||Date.now(), createdAt:+x.createdAt||0});
}
/* dos proyectos son iguales si sus impresiones lo son (sin importar el orden de las claves) */
const printsKey = pr => JSON.stringify(pr.prints, [...new Set(pr.prints.flatMap(Object.keys))].sort());
function applyBackup(data){
  if(!data || typeof data!=='object' || data.app!==BACKUP_APP || !Array.isArray(data.proyectos)){ toast('Ese archivo no es una copia de esta calculadora.'); return; }
  if(+data.version>BACKUP_VER){ toast('Esa copia es de una versión más nueva de la calculadora. Recargá la página y probá de nuevo.'); return; }
  flushSave();
  const st={lostMat:0}, added=[]; let same=0, copies=0;
  data.proyectos.forEach(raw=>{
    const p=cleanProject(raw, st); if(!p) return;
    const key=printsKey(p);
    if(Object.values(allProjects).some(q=>!q.seed && printsKey(q)===key)){ same++; return; }   // ya está acá
    if(allProjects[p.id]){ p.id=newPid(); p.name+=' (importado)'; copies++; }                 // mismo proyecto con otros datos: queda como copia
    allProjects[p.id]=p; added.push(p);
  });
  // los ajustes de la copia se usan solo si acá nunca se cambiaron (dispositivo o navegador nuevo)
  const cfgBefore=Object.assign({},cfg), fresh=Object.keys(DEF).every(k=>cfg[k]===DEF[k]);
  let cfgNew=false, cfgKept=false;
  if(data.ajustes && typeof data.ajustes==='object') Object.keys(DEF).forEach(k=>{
    const v=parseFloat(data.ajustes[k]); if(!isFinite(v) || v===cfg[k]) return;
    if(fresh){ cfg[k]=v; cfgNew=true; } else cfgKept=true;
  });
  if(!added.length && !cfgNew){
    toast(same ? (same===1?'Ese proyecto ya estaba acá.':'Esos '+same+' proyectos ya estaban acá.')+' No cambió nada.' : 'La copia no tiene proyectos.');
    return;
  }
  const beforeId=proj.id, seeds=[];
  if(added.length) Object.values(allProjects).forEach(p=>{ if(p.seed){ delete allProjects[p.id]; seeds.push(p); } });   // el ejemplo sin tocar sobra
  if(!allProjects[proj.id]) proj=added.slice().sort((a,b)=>b.updatedAt-a.updatedAt)[0];
  persistLocal();
  const undo=()=>{
    added.forEach(p=>{ delete allProjects[p.id]; if(DB) DB.doc('projects/'+p.id).delete().catch(()=>{}); });
    seeds.forEach(p=>{ allProjects[p.id]=p; if(DB) writeRemote(p); });
    Object.assign(cfg,cfgBefore);
    proj=allProjects[beforeId]||Object.values(allProjects).sort((a,b)=>b.updatedAt-a.updatedAt)[0]||(()=>{ const b=blankProject(); allProjects[b.id]=b; return b; })();
    persistLocal(); fillForm(); renderAll(); renderProjList(); renderCount();
    toast('Importación deshecha.');
  };
  if(store.get('proyectos_v2')!==JSON.stringify(allProjects)){   // no entró en el almacenamiento del navegador
    undo(); toast('No se pudo guardar la copia en este navegador. No se importó nada.'); return;
  }
  if(DB){ added.forEach(p=>writeRemote(p)); seeds.forEach(p=>DB.doc('projects/'+p.id).delete().catch(()=>{})); }
  fillForm(); renderAll(); renderProjList(); renderCount();
  const n=added.length, msg=[n ? 'Importaste '+n+(n===1?' proyecto.':' proyectos.') : 'Importaste los ajustes.'];
  if(same) msg.push(same===1?'1 ya estaba.':same+' ya estaban.');
  if(copies) msg.push(copies===1?'1 quedó como copia “(importado)”.':copies+' quedaron como copia “(importado)”.');
  if(n && cfgNew) msg.push('También se cargaron sus ajustes.');
  if(cfgKept) msg.push('Tus ajustes quedaron como estaban.');
  if(st.lostMat) msg.push(st.lostMat===1?'Revisá 1 impresión: su filamento ya no está en la lista.':'Revisá '+st.lostMat+' impresiones: su filamento ya no está en la lista.');
  toast(msg.join(' '), undo);
}
function importBackup(file){
  if(file.size>BACKUP_MAX){ toast('Ese archivo es demasiado grande para ser una copia de esta calculadora.'); return; }
  const rd=new FileReader();
  rd.onload=()=>{ let data=null; try{ data=JSON.parse(rd.result); }catch(e){} applyBackup(data); };
  rd.onerror=()=>toast('No se pudo leer el archivo.');
  rd.readAsText(file);
}
$('exportBtn').addEventListener('click',exportBackup);
$('importBtn').addEventListener('click',()=>$('importFile').click());
$('importFile').addEventListener('change',e=>{ const f=e.target.files[0]; e.target.value=''; if(f) importBackup(f); });

/* ---------- sincronización con la base de datos ---------- */
let pendingRemote=false, firstSnap=true;
function applyRemoteIfIdle(){
  if(document.body.classList.contains('typing')){ pendingRemote=true; return; }
  pendingRemote=false; fillForm(); renderAll();
}
document.addEventListener('focusout',()=>setTimeout(()=>{ if(pendingRemote && !document.body.classList.contains('typing')) applyRemoteIfIdle(); },120));
(async function initDb(){
  let db=null;
  try{ db = (window.claude && window.claude.use) ? await window.claude.use('db') : null; }catch(e){ db=null; }
  if(!db){ setSync('local'); renderProjList(); return; }
  DB=db; setSync('saved');
  DB.collection('projects').onSnapshot(snap=>{
    const remoteIds=new Set();
    let currentChanged=false;
    snap.docs.forEach(d=>{
      if(!d.exists) return;
      remoteIds.add(d.id);
      const r=normProj(clone(d.data())); if(!r) return; r.id=d.id; r.synced=true;
      const local=allProjects[d.id];
      if(d.id===proj.id){
        if(!dirty && r.updatedAt>proj.updatedAt){ proj=r; allProjects[r.id]=r; currentChanged=true; }
        else if(local) local.synced=true;
      } else if(!local || r.updatedAt>=local.updatedAt){ allProjects[d.id]=r; }
      else local.synced=true;
    });
    if(firstSnap){
      firstSnap=false;
      Object.values(allProjects).forEach(pr=>{
        if(remoteIds.has(pr.id)) return;
        if(pr.seed && remoteIds.size){ delete allProjects[pr.id]; return; }  // el ejemplo sin tocar no se duplica en otro dispositivo
        if(pr.synced && pr.id!==proj.id){ delete allProjects[pr.id]; }       // borrado en otro dispositivo
        else { pr.synced=true; writeRemote(pr); }                           // subir lo que solo estaba acá
      });
    } else {
      snap.docChanges().forEach(ch=>{ if(ch.type==='removed' && ch.doc.id!==proj.id && !remoteIds.has(ch.doc.id)) delete allProjects[ch.doc.id]; });
    }
    if(!allProjects[proj.id]){ proj=Object.values(allProjects).sort((a,b)=>b.updatedAt-a.updatedAt)[0]; currentChanged=true; }
    store.set('proyectos_v2', JSON.stringify(allProjects)); store.set('proyecto_actual', proj.id);
    if(currentChanged) applyRemoteIfIdle();
    renderCount(); if($('projSheet').open) renderProjList();
    if(syncState!=='saving') setSync('saved');
  }, err=>{ setSync('error'); });
})();

function summaryText(){
  const res=proj.prints.map(p=>compute(p,false)), T=projectTotals(res);
  const lines=['Proyecto: '+proj.name,''];
  proj.prints.forEach((p,i)=>{
    const r=res[i];
    lines.push('• '+(p.name||'Impresión '+(i+1))+': '+nf1.format(+p.g||0)+' g, '+fmtH(p.h,p.m)+(isNaN(r.start)?'':', inicio '+fmtD(r.start))+', '+r.mat.name);
    lines.push(r.err.length?'  falta dato':'  energía '+money(r.ene)+' + filamento '+money(r.fil)+' = '+money(r.total)+' · precio mínimo '+fmtSale(r.vr)+' (exacto '+money(r.vx)+')');
  });
  lines.push('','Total: '+money(T.total)+' ('+nf1.format(T.g)+' g, '+nf1.format(T.h)+' h; energía '+money(T.ene)+', filamento '+money(T.fil)+')');
  lines.push('Precio mínimo de venta: '+fmtSale(T.vr)+' (exacto '+money(T.vx)+' = filamento × '+nf2.format(cfg.mFil)+' + energía × '+nf2.format(cfg.mEne)+') · margen '+money(T.vr-T.total));
  lines.push('Dólar $'+nf2.format(cfg.dolar)+' · A1: cama '+nf2.format(bedW())+' W × '+cfg.tBed+' min, arranque '+cfg.wCal+' W × '+cfg.tCal+' min, impresión PLA '+cfg.wPLA+' W · UTE Triple Horario con IVA');
  return lines.join('\n');
}
$('copyBtn').addEventListener('click',()=>{
  const txt=summaryText();
  const fallback=()=>{ $('copyWrap').hidden=false; const b=$('copyBox'); b.value=txt; b.focus(); b.select(); };
  try{ navigator.clipboard.writeText(txt).then(()=>{ $('copyWrap').hidden=true; toast('Resumen copiado.'); }, fallback); }catch(e){ fallback(); }
});
$('addBtn').addEventListener('click',addPrint);
$('dockAdd').addEventListener('click',addPrint);
$('tabs').addEventListener('click',e=>{ const b=e.target.closest('.tab'); if(b) select(b.dataset.id); });
$('tabs').addEventListener('keydown',e=>{
  if(e.key!=='ArrowRight' && e.key!=='ArrowLeft') return;
  const i=proj.prints.findIndex(p=>p.id===proj.active), j=Math.min(proj.prints.length-1,Math.max(0,i+(e.key==='ArrowRight'?1:-1)));
  select(proj.prints[j].id); const t=$('tabs').querySelector('[aria-selected=true]'); if(t){ t.focus(); t.scrollIntoView({inline:'nearest',block:'nearest'}); }
});
$('plist').addEventListener('click',e=>{ const b=e.target.closest('.pitem'); if(b){ select(b.dataset.id); $('result').scrollIntoView({behavior:RM()?'auto':'smooth',block:'start'}); } });
$('dupBtn').addEventListener('click',dupPrint);
$('delBtn').addEventListener('click',delPrint);
$('newProj').addEventListener('click',newProject);
$('projName').addEventListener('input',()=>{ proj.name=$('projName').value; save(); });
$('form').addEventListener('input',()=>{ readForm(); save(); renderAll(); });
$('form').addEventListener('change',()=>{ readForm(); save(); renderAll(); });
$('form').addEventListener('submit',e=>e.preventDefault());

/* en el teléfono, el paso a paso arranca plegado */
if(window.matchMedia && matchMedia('(max-width:700px)').matches) $('steps').open=false;
fillForm(); renderAll(); moveThumb(); renderCount(); renderSync(); persistLocal();
/* primer dibujo: el arco y las barras crecen desde cero */
if(!RM()){
  const a=$('arc'), v=a.style.strokeDasharray, bars=[...document.querySelectorAll('#bands .bar i')].map(i=>[i,i.style.transform]);
  a.style.transition='none'; a.style.strokeDasharray='0 100'; bars.forEach(([i])=>{ i.style.transition='none'; i.style.transform='scaleX(0)'; });
  requestAnimationFrame(()=>requestAnimationFrame(()=>{ a.style.transition=''; bars.forEach(([i])=>i.style.transition='');
    setTimeout(()=>{ a.style.strokeDasharray=v; bars.forEach(([i,t])=>i.style.transform=t); },260); }));
}
