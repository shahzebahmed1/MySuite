(() => {
 const root=document.documentElement,key='mysuite-concierge-home-cream-preview-v1',paletteKey='mysuite-concierge-home-cream-palette-v2';
 const palettes=[["Navy & Porcelain", "#f6f1e7", "#eef1f3", "#20354c", "#b9a078"], ["Sage & Linen", "#f5f1e6", "#e5ece4", "#365c47", "#c0ab7f"], ["Olive & Oat", "#f5f1e2", "#e7e8d8", "#505a38", "#ba9c67"], ["Espresso & Cashmere", "#f5eee5", "#e9ded2", "#503b30", "#c3a06c"], ["Teal & Parchment", "#f6f1e5", "#deebe8", "#24585a", "#bc9e6d"], ["Slate & Almond", "#f6f0e7", "#e5e9ed", "#405269", "#c3a77a"], ["Terracotta & Ivory", "#f8f0e6", "#f0dfd4", "#884933", "#bd9a6d"], ["Plum & Vanilla", "#f7f0e4", "#ebe2ea", "#60415c", "#c2a57b"], ["Charcoal & Champagne", "#f4efe5", "#e7e4dc", "#303536", "#b59a6b"], ["Lavender & Cream", "#f8f3e7", "#e8e4f2", "#554d7c", "#bea879"]];
 let enabled=true,index=0;
 try{enabled=localStorage.getItem(key)!=='false';const saved=localStorage.getItem(paletteKey);const found=palettes.findIndex(p=>p[0]===saved);if(found>=0)index=found}catch{}
 // Replace the rejected single-palette preview with the first coordinated experiment once.
 try{const marker='mysuite-concierge-cream-ten-palettes-v1';if(!localStorage.getItem(marker)){enabled=true;localStorage.setItem(key,'true');localStorage.setItem(marker,'true')}}catch{}
 function theme(){
  root.toggleAttribute('data-home-cream-preview',enabled);
  const[name,bg,card,action,dot]=palettes[index];
  const rgb=action.slice(1).match(/../g).map(c=>parseInt(c,16));
  const hover='#'+rgb.map(v=>Math.round(v*.82).toString(16).padStart(2,'0')).join('');
  const blend=(a,b,t)=>'#'+[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-t)+parseInt(b.slice(i,i+2),16)*t).toString(16).padStart(2,'0')).join('');
  for(const[k,v]of Object.entries({bg,card,action,dot,hover,ink:'#252c32',muted:'#535e67',border:blend(card,action,.19),control:blend(bg,'#ffffff',.45),tint:blend(card,action,.12)}))root.style.setProperty(`--cream-${k}`,v);
 }
 theme();
 function init(){
  if(root.dataset.dashboardShell!=='monochrome')return;
  const bar=document.querySelector('.home-topbar');if(!bar)return;
  const controls=document.createElement('section');controls.className='home-cream-palette-controls';controls.setAttribute('aria-label','Cream color scheme experiments');
  controls.innerHTML='<label>Color scheme<select aria-label="Color scheme"></select></label><div class="cream-palette-swatches" aria-hidden="true"></div><button type="button" data-palette="previous">Previous</button><button type="button" data-palette="next">Next scheme</button><button type="button" data-palette="compare" aria-pressed="false">Original colors</button><span class="cream-palette-status" role="status"></span>';
  bar.after(controls);
  const select=controls.querySelector('select');
  palettes.forEach(([name],i)=>{const option=document.createElement('option');option.value=String(i);option.textContent=`${i+1}. ${name}`;select.append(option)});
  function render(persist=false){
   theme();select.value=String(index);
   const swatches=controls.querySelector('.cream-palette-swatches');swatches.replaceChildren();
   palettes[index].slice(1).forEach(color=>{const dot=document.createElement('span');dot.style.background=color;dot.title=color;swatches.append(dot)});
   controls.querySelector('.cream-palette-status').textContent=enabled?`${index+1} / 10`:'Original light colors';
   controls.querySelector('[data-palette="compare"]').setAttribute('aria-pressed',String(!enabled));
   if(persist)try{localStorage.setItem(key,String(enabled));localStorage.setItem(paletteKey,palettes[index][0])}catch{}
  }
  select.addEventListener('change',()=>{index=Number(select.value);enabled=true;render(true)});
  controls.addEventListener('click',event=>{const button=event.target.closest('[data-palette]');if(!button)return;const action=button.dataset.palette;if(action==='compare')enabled=!enabled;else{index=(index+(action==='next'?1:palettes.length-1))%palettes.length;enabled=true}render(true)});
  window.addEventListener('storage',event=>{if(event.key===key){enabled=event.newValue!=='false';render()}if(event.key===paletteKey){const found=palettes.findIndex(p=>p[0]===event.newValue);if(found>=0){index=found;render()}}});
  render();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
