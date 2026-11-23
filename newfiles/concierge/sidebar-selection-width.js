(() => {
  const sidebar=document.querySelector('body.concierge-sidebar .sidebar');
  const nav=sidebar?.querySelector('nav');
  const active=nav?.querySelector('.nav-item.active');
  if(!sidebar||!nav||!active)return;
  const key='mysuite-concierge-full-width-selection-v1';
  let enabled=false;
  const controls=document.createElement('details');
  controls.className='sidebar-rgb-controls';controls.setAttribute('data-home-editor','');
  controls.innerHTML='<summary>Selection width</summary><div class="sidebar-rgb-panel"><label class="sidebar-selection-width-toggle"><input type="checkbox"><span>Extend selection to both edges</span></label></div>';
  nav.append(controls);
  const checkbox=controls.querySelector('input');
  const highlight=document.createElement('div');
  highlight.className='sidebar-full-width-highlight';highlight.setAttribute('aria-hidden','true');
  sidebar.append(highlight);
  function position(){
    if(!enabled||document.body.dataset.homeDesignTrial==='topbar'){highlight.hidden=true;return}
    const bounds=sidebar.getBoundingClientRect(),row=active.getBoundingClientRect(),viewport=nav.getBoundingClientRect();
    const top=Math.max(row.top,viewport.top),bottom=Math.min(row.bottom,viewport.bottom);
    highlight.hidden=bottom<=top;
    highlight.style.top=`${top-bounds.top+sidebar.scrollTop}px`;
    highlight.style.height=`${Math.max(0,bottom-top)}px`;
  }
  function apply(persist=true){
    checkbox.checked=enabled;
    document.body.toggleAttribute('data-full-width-selection',enabled&&document.body.dataset.homeDesignTrial!=='topbar');
    position();
    if(persist){try{localStorage.setItem(key,String(enabled))}catch{}}
  }
  checkbox.addEventListener('change',()=>{enabled=checkbox.checked;apply()});
  nav.addEventListener('scroll',position,{passive:true});
  window.addEventListener('resize',position);
  const observer=new ResizeObserver(position);observer.observe(sidebar);observer.observe(nav);observer.observe(active);
  new MutationObserver(()=>apply(false)).observe(document.body,{attributes:true,attributeFilter:['data-home-design-trial']});
  try{enabled=localStorage.getItem(key)==='true'}catch{}
  apply(false);
  window.addEventListener('storage',event=>{if(event.key===key){enabled=event.newValue==='true';apply(false)}});
})();
