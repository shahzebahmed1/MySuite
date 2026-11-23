(() => {
  const header=document.querySelector('.welcome');
  const panel=document.querySelector('.sidebar-greeting-size');
  const brand=document.querySelector('.sidebar .brand');
  if(!header||!panel||!brand)return;
  const key='mysuite-concierge-role-placement-preview-v1';
  const options=[
    ['original','Original placement'],
    ['under-pill','Under name / pill'],
    ['under-text','Under name / plain text'],
    ['under-outline','Under name / outlined pill'],
    ['above-greeting','Above greeting / spaced text'],
    ['top-left','Top left of card / spaced text'],
    ['under-weather','Under weather / spaced text'],
    ['logo-below-text','Below logo / plain text'],
    ['logo-below-pill','Below logo / champagne pill'],
    ['logo-above-text','Above logo / spaced text']
  ];
  const controls=document.createElement('div');controls.className='sidebar-role-placement-control';
  controls.innerHTML='<span aria-live="polite"></span><button type="button">Next role placement <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5"/></svg></button>';
  const previous=panel.querySelector('.sidebar-next-greeting');
  if(previous)previous.after(controls);else panel.append(controls);
  const sidebarRole=document.createElement('div');sidebarRole.className='sidebar-role-preview';sidebarRole.hidden=true;brand.after(sidebarRole);
  let current='original';try{const saved=localStorage.getItem(key);if(options.some(([id])=>id===saved))current=saved}catch{}
  function syncRole(){
    const role=header.querySelector('.classic-welcome-copy p > .home-welcome-role')?.textContent||'Board of Directors';
    if(sidebarRole.textContent!==role)sidebarRole.textContent=role;
  }
  function apply(persist=false){
    header.dataset.rolePreview=current;
    const inSidebar=current.startsWith('logo-');
    sidebarRole.hidden=!inSidebar;sidebarRole.dataset.treatment=current.endsWith('-pill')?'pill':'text';
    if(current==='logo-above-text')brand.before(sidebarRole);else brand.after(sidebarRole);
    if(current!=='original')document.querySelector('[data-role-placement="below"]')?.click();
    controls.querySelector('span').textContent=options.find(([id])=>id===current)[1];
    controls.querySelector('button').title=`Next: ${options[(options.findIndex(([id])=>id===current)+1)%options.length][1]}`;
    syncRole();if(persist)try{localStorage.setItem(key,current)}catch{}
  }
  controls.querySelector('button').addEventListener('click',()=>{current=options[(options.findIndex(([id])=>id===current)+1)%options.length][0];apply(true)});
  new MutationObserver(syncRole).observe(header,{childList:true,subtree:true,characterData:true});
  window.addEventListener('storage',event=>{if(event.key===key){current=options.some(([id])=>id===event.newValue)?event.newValue:'original';apply()}});
  apply();
})();
