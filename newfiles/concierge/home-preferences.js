(() => {
 const root=document.documentElement;
 root.dataset.dashboardShell='monochrome';
 const families={"red-hat-display": "Red Hat Display", "georgia": "Georgia", "theinhardt": "Greeting Theinhardt", "bw-diagrid": "Greeting Bw Diagrid", "averta": "Greeting Averta", "circular": "Greeting Circular Std", "degular": "Greeting Degular", "gt-walsheim": "Greeting GT Walsheim", "metropolis": "Greeting Metropolis", "national": "Greeting National", "pp-mori": "Greeting PP Mori", "proxima-nova": "Greeting Proxima Nova", "sailec": "Greeting Sailec", "sofia-pro": "Greeting Sofia Pro", "sohne": "Greeting S?hne", "soleil": "Greeting Soleil"};
 try{
  const greeting=JSON.parse(localStorage.getItem('mysuite-concierge-greeting-experiments-v1')||'null');
  const family=families[greeting?.font]||'Red Hat Display';
  root.style.setProperty('--dashboard-font-family',`"${family}",${family==='Georgia'?'serif':'sans-serif'}`);
  const shape=JSON.parse(localStorage.getItem('mysuite-concierge-sidebar-shape-v1')||'null');
  const width=Number(shape?.width);
  if(Number.isFinite(width)&&width>=210&&width<=340)root.style.setProperty('--sidebar-shape-width',`${width}px`);
  const shop=JSON.parse(localStorage.getItem('mysuite-concierge-shop-card-height-v1')||'null');
  if(Number.isFinite(shop?.height))root.style.setProperty('--dashboard-shop-height',`${Math.max(40,Math.min(800,shop.height))}px`);
 }catch{}
})();
