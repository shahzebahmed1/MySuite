(() => {
  if(document.documentElement.dataset.dashboardShell!=='monochrome')return;
  try{if('scrollRestoration' in history)history.scrollRestoration='manual'}catch{}
  try{
    const marker='mysuite-concierge-rounded-shell-v1:monochrome-top-start-v1';
    if(!localStorage.getItem(marker)){
      localStorage.setItem('mysuite-concierge-vertically-centered-greeting-v1','false');
      const key='mysuite-concierge-dashboard-card-layout-v1';
      let layout;try{layout=JSON.parse(localStorage.getItem(key))}catch{}
      if(Array.isArray(layout?.order))localStorage.setItem(key,JSON.stringify({...layout,order:['greeting',...layout.order.filter(id=>id!=='greeting')]}));
      localStorage.setItem(marker,'true');
    }
  }catch{}
  let interacted=false;
  const cancel=()=>{interacted=true};
  for(const type of ['wheel','touchstart','pointerdown'])window.addEventListener(type,cancel,{passive:true,once:true});
  window.addEventListener('keydown',event=>{if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key))cancel()},{passive:true});
  function startAtTop(){if(!interacted&&!location.hash)window.scrollTo({top:0,left:0,behavior:'instant'})}
  window.addEventListener('pageshow',()=>requestAnimationFrame(()=>requestAnimationFrame(startAtTop)));
})();
