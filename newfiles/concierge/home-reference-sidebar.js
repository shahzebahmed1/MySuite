(() => {
 if(document.documentElement.dataset.dashboardShell!=='monochrome')return;
 const marker='mysuite-concierge-home-reference-sidebar-v1';
 try{
  if(!localStorage.getItem(marker)){
   const changes={
    'mysuite-concierge-logo-style-v1':'original',
    'mysuite-concierge-logo-position-v1':JSON.stringify({size:43,x:0,y:0}),
    'mysuite-concierge-navigation-colors-v1':JSON.stringify({text:'#e0dfdc',icons:'#c8b99e',selection:'#243244',selectedText:'#fffaf0',selectedIcon:'#cfb992',divider:'#434849'}),
    'mysuite-concierge-monochrome-sidebar-background-v1':'#192638'
   };
   localStorage.setItem(marker+'-backup',JSON.stringify(Object.fromEntries(Object.keys(changes).map(key=>[key,localStorage.getItem(key)]))));
   for(const[key,value]of Object.entries(changes)){localStorage.setItem(key,value);window.dispatchEvent(new StorageEvent('storage',{key,newValue:value}))}
   localStorage.setItem(marker,'true');
  }
  document.documentElement.style.setProperty('--monochrome-sidebar-colour',localStorage.getItem('mysuite-concierge-monochrome-sidebar-background-v1')||'#192638');
 }catch{}
})();
