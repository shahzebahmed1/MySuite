(() => {
 if(document.documentElement.dataset.dashboardShell!=='monochrome')return;
 const sidebar=document.querySelector('.sidebar'),nav=sidebar?.querySelector('nav');if(!nav)return;
 const options=[
  ['Match page','var(--monochrome-canvas-colour,#fafafa)',false],['White','#ffffff',false],['Charcoal','#272b30',true],['Slate navy','#283548',true],['Ink blue','#1d2b3a',true],
  ['Smoky blue','#384655',true],['Deep teal','#244448',true],['Forest grey','#33433f',true],
  ['Muted plum','#433d4b',true],['Soft stone','#e7e5e1',false],['Mushroom','#dfd9d1',false],
  ['Dusty sage','#dce4dc',false],['Powder blue','#dfe7ee',false],['Pale lilac','#e6e2ec',false]
 ];
 const key='mysuite-concierge-sidebar-color-rotation-v1';let index=0;
 try{const saved=localStorage.getItem(key);const found=options.findIndex(([name])=>name===saved);if(found>=0)index=found}catch{}
 try{const marker='mysuite-concierge-sidebar-white-preview-v1';if(!localStorage.getItem(marker)){index=0;localStorage.setItem(key,'White');localStorage.setItem(marker,'true')}}catch{}
 try{const marker='mysuite-concierge-sidebar-page-match-v1';if(!localStorage.getItem(marker)){index=0;localStorage.setItem(key,'Match page');localStorage.setItem(marker,'true')}}catch{}
 const control=document.createElement('div');control.className='home-sidebar-rotation';
 control.innerHTML='<span class="sidebar-rotation-label" aria-live="polite"></span><button type="button" aria-label="Next sidebar color"><span class="sidebar-rotation-swatch" aria-hidden="true"></span>Next sidebar color<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></button>';
 // Keep the selected palette without showing experiment controls.
 function apply(persist=false){
  const[name,color,dark]=options[index];document.body.setAttribute('data-sidebar-rotation','');
  for(const[property,value]of Object.entries({bg:color,ink:dark?'#f6f6f6':'#252a31',muted:dark?'#c8cbd1':'#4d5560',selection:name==='Match page'?'#2563eb':dark?'rgba(255,255,255,.11)':'rgba(255,255,255,.72)','active-ink':name==='Match page'?'#ffffff':dark?'#f6f6f6':'#252a31',hover:dark?'rgba(255,255,255,.05)':'rgba(255,255,255,.4)',line:dark?'rgba(255,255,255,.15)':'rgba(37,42,49,.13)'}))sidebar.style.setProperty(`--rotation-${property}`,value);
  control.querySelector('.sidebar-rotation-label').textContent=name==='Match page'?'Match page':`${name} ? ${color.toUpperCase()}`;
  control.querySelector('.sidebar-rotation-swatch').style.background=color;
  control.querySelector('button').title=`Next: ${options[(index+1)%options.length][0]}`;
  if(persist)try{localStorage.setItem(key,name)}catch{}
 }
 control.querySelector('button').addEventListener('click',()=>{index=(index+1)%options.length;apply(true)});
 apply();
})();
