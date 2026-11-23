(() => {
  const pattern=document.querySelector('.dashboard-pattern-switcher');
  const greeting=document.querySelector('.sidebar-greeting-size');
  if(!pattern&&!greeting)return;
  const controls=[pattern,greeting].filter(Boolean);
  const toggle=document.createElement('button');toggle.type='button';toggle.className='sidebar-quick-controls-toggle';
  toggle.setAttribute('aria-label','Hide quick appearance controls');
  const announcements=document.querySelector('.sidebar nav .nav-item[href="announcements.html"]');
  if(announcements)announcements.after(toggle);
  else controls[controls.length-1].after(toggle);
  controls.forEach((control,index)=>{control.id=`sidebar-quick-control-${index}`});
  toggle.setAttribute('aria-controls',controls.map(control=>control.id).join(' '));
  const key='mysuite-concierge-sidebar-quick-controls-hidden-v1';
  function apply(hidden,persist=false){
    controls.forEach(control=>control.hidden=hidden);
    toggle.textContent=hidden?'Show quick controls':'Hide quick controls';
    toggle.setAttribute('aria-label',hidden?'Show quick appearance controls':'Hide quick appearance controls');
    toggle.setAttribute('aria-expanded',String(!hidden));
    if(persist)try{localStorage.setItem(key,String(hidden))}catch{}
  }
  toggle.addEventListener('click',()=>apply(toggle.getAttribute('aria-expanded')==='true',true));
  let hidden=false;try{hidden=localStorage.getItem(key)==='true'}catch{}
  apply(hidden);
  window.addEventListener('storage',event=>{if(event.key===key)apply(event.newValue==='true')});
})();
