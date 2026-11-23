(() => {
  const header=document.querySelector('.dashboard .welcome');
  if(!header)return;
  try {
    if(!localStorage.getItem('mysuite-concierge-premium-overlay-restored-v1')){
      document.querySelector('.header-gradient-controls button')?.click();
      localStorage.setItem('mysuite-concierge-premium-overlay-restored-v1','true');
    }
  } catch {}

  const metadata=header.querySelector('.classic-welcome-copy p');
  if(metadata){
    const row=document.createElement('span');row.className='premium-card-meta';
    const date=metadata.querySelector('.greeting-date');
    const weather=metadata.querySelector('.greeting-weather');
    if(date)row.append(date);
    if(weather){
      const group=document.createElement('span');group.className='premium-weather-group';
      group.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2v1m7 2-1 1m4 6h-1M5 5l1 1"/><path d="M8 9a5 5 0 1 1 9 4"/><path d="M7 21a5 5 0 1 1 1.2-9.85A6 6 0 0 1 19 15a3 3 0 1 1 0 6Z"/></svg>';
      group.append(weather);row.append(group);
    }
    metadata.append(row);
  }
  const controls=document.querySelector('.dashboard-header-adjustments');
  if(controls){
    const dock=document.createElement('section');
    dock.className='dashboard-header-tools-top';
    dock.setAttribute('data-home-editor','');
    dock.setAttribute('aria-label','Header editing tools');
    document.dispatchEvent(new CustomEvent('dashboard:header-tools',{detail:{element:dock}}));
    dock.append(controls);controls.open=true;
    window.dispatchEvent(new Event('resize'));
  }
  try {
    if(!localStorage.getItem('mysuite-concierge-premium-image-controls-v1')){
      const select=document.querySelector('.sidebar select[aria-label="Dashboard header style"]');
      if(select){select.value='premium-welcome-card';select.dispatchEvent(new Event('change',{bubbles:true}));}
      for(const [name,value] of Object.entries({image:'sunlit-workspace',zoom:125,x:100,y:100,height:160})){
        const input=document.querySelector(`[data-adjust="${name}"]`);
        if(input){input.value=String(value);input.dispatchEvent(new Event('input',{bubbles:true}));}
      }
      localStorage.setItem('mysuite-concierge-premium-image-controls-v1','true');
    }
  } catch {}

  // Repair the old intrinsic aspect-ratio overflow without resetting other cards.
  try {
    if(!localStorage.getItem('mysuite-concierge-premium-welcome-layout-v2')){
      document.dispatchEvent(new CustomEvent('dashboard:card-width',{detail:{id:'greeting',width:2}}));
      localStorage.setItem('mysuite-concierge-premium-welcome-layout-v2','true');
    }
  } catch {}
  const marker='mysuite-concierge-premium-welcome-applied-v1';
  try { if(localStorage.getItem(marker))return; } catch {}
  const preferenceKeys=['mysuite-concierge-dashboard-header-v1','mysuite-concierge-greeting-experiments-v1'];
  try { localStorage.setItem('mysuite-concierge-before-premium-welcome-v1',JSON.stringify(Object.fromEntries(preferenceKeys.map(key=>[key,localStorage.getItem(key)])))); } catch {}
  const style=document.querySelector('.sidebar select[aria-label="Dashboard header style"]');
  if(style){style.value='premium-welcome-card';style.dispatchEvent(new Event('change',{bubbles:true}));}
  const panel=document.querySelector('.home-greeting-experiments');
  if(panel){
    panel.querySelector('[data-greeting-layout="quiet"]')?.click();
    panel.querySelector('[data-role-placement="below"]')?.click();
    const role=panel.querySelector('[aria-label="Preview greeting role"]');
    if(role){role.value='Board of Directors';role.dispatchEvent(new Event('change',{bubbles:true}));}
    for(const context of ['date','weather']){
      const input=panel.querySelector(`[data-context="${context}"]`);
      if(input){input.checked=true;input.dispatchEvent(new Event('input',{bubbles:true}));}
    }
  }
  document.dispatchEvent(new CustomEvent('greeting:size-changed',{detail:{size:30}}));
  try { localStorage.setItem(marker,'true'); } catch {}
})();
