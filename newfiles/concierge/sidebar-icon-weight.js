(() => {
  const sidebar=document.querySelector('body.concierge-sidebar .sidebar');
  if(!sidebar)return;
  let pending=false;
  function refresh(){
    pending=false;
    sidebar.querySelectorAll('.nav-item,.logout').forEach(link=>{
      const computed=Number.parseFloat(getComputedStyle(link).fontWeight);
      const weight=Number.isFinite(computed)?computed:link.classList.contains('active')?600:400;
      const stroke=Math.max(1.5,Math.min(2.8,1.8+(weight-400)/500)).toFixed(2);
      if(link.style.getPropertyValue('--sidebar-icon-stroke')!==stroke)link.style.setProperty('--sidebar-icon-stroke',stroke);
    });
  }
  function schedule(){if(!pending){pending=true;requestAnimationFrame(refresh)}}
  refresh();
  const observer=new MutationObserver(schedule);
  observer.observe(sidebar,{attributes:true,subtree:true,attributeFilter:['style','class']});
  observer.observe(document.body,{attributes:true,attributeFilter:['style','class']});
  window.addEventListener('resize',schedule);
  if(document.fonts)document.fonts.ready.then(schedule);
})();
