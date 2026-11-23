(() => {
  const main=document.querySelector('body.sidebar-merge main');
  const nav=document.querySelector('.sidebar nav');
  if(!main||!nav)return;
  const key='mysuite-concierge-background-pattern-v1';
  const options=[
    {id:'plain',label:'Plain',tile:null},
    {id:'diamonds',label:'Diamond lattice',size:40,art:'<path d="M20 0L40 20 20 40 0 20Z" fill="none" stroke="#383329" stroke-opacity=".09" stroke-width=".7"/>'},
    {id:'pinstripes',label:'Pinstripes',size:18,art:'<path d="M4 0V18" stroke="#383329" stroke-opacity=".09" stroke-width=".7"/>'},
    {id:'waves',label:'Soft waves',size:48,art:'<path d="M-12 12Q0 0 12 12T36 12T60 12M-12 36Q0 24 12 36T36 36T60 36" fill="none" stroke="#383329" stroke-opacity=".1" stroke-width=".7"/>'},
    {id:'rings',label:'Quiet rings',size:52,art:'<circle cx="26" cy="26" r="14" fill="none" stroke="#383329" stroke-opacity=".08" stroke-width=".7"/>'},
    {id:'staggered-dots',label:'Staggered dots',size:32,art:'<g fill="#383329" opacity=".13"><circle cx="3" cy="3" r=".8"/><circle cx="19" cy="19" r=".8"/></g>'},
    {id:'woven',label:'Woven lines',size:36,art:'<path d="M0 9H14M22 27H36M9 22V36M27 0V14" fill="none" stroke="#383329" stroke-opacity=".11" stroke-width=".8"/>'},
    {id:'fine-dots',label:'Fine dots',size:20,art:'<circle cx="2" cy="2" r=".85" fill="#383329" opacity=".16"/>'},
    {id:'spaced-dots',label:'Spaced dots',size:34,art:'<circle cx="3" cy="3" r="1.2" fill="#383329" opacity=".14"/>'},
    {id:'fine-grid',label:'Fine grid',size:32,art:'<path d="M32 0H0V32" fill="none" stroke="#383329" stroke-opacity=".11" stroke-width=".7"/>'},
    {id:'diagonal',label:'Diagonal lines',size:22,art:'<path d="M-5 5L5-5M0 22L22 0M17 27L27 17" fill="none" stroke="#383329" stroke-opacity=".09" stroke-width=".7"/>'},
    {id:'crosses',label:'Tiny crosses',size:36,art:'<path d="M3 0V6M0 3H6" fill="none" stroke="#383329" stroke-opacity=".14" stroke-width=".8"/>'}
  ];
  const surface=document.createElement('div');surface.className='dashboard-pattern-surface';surface.setAttribute('aria-hidden','true');main.prepend(surface);
  const controls=document.createElement('div');controls.className='dashboard-pattern-switcher';
  controls.innerHTML='<span class="dashboard-pattern-label" aria-live="polite"></span><button type="button" aria-label="Try next background pattern">Next pattern <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5"/></svg></button>';
  nav.prepend(controls);
  const sidebar=document.querySelector('.sidebar');
  const sidebarSurface=document.createElement('div');sidebarSurface.className='sidebar-pattern-surface';sidebarSurface.setAttribute('aria-hidden','true');sidebar.prepend(sidebarSurface);
  const extensionKey='mysuite-concierge-pattern-in-sidebar-v1';
  const extension=document.createElement('label');extension.className='sidebar-pattern-extension';
  extension.innerHTML='<input type="checkbox"> Match page pattern in sidebar';controls.append(extension);
  const checkbox=extension.querySelector('input');
  try{checkbox.checked=localStorage.getItem(extensionKey)==='true'}catch{}
  const sidebarKey='mysuite-concierge-sidebar-pattern-v1';
  let sidebarCurrent='plain';try{const saved=localStorage.getItem(sidebarKey);if(options.some(item=>item.id===saved))sidebarCurrent=saved}catch{}
  const sidebarControls=document.createElement('div');sidebarControls.className='sidebar-pattern-independent';
  sidebarControls.innerHTML='<span class="sidebar-pattern-label" aria-live="polite"></span><button type="button" aria-label="Try next sidebar pattern">Next sidebar pattern <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5"/></svg></button>';
  controls.append(sidebarControls);
  function imageFor(option){
    return option.tile===null?'none':`url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${option.size}" height="${option.size}" viewBox="0 0 ${option.size} ${option.size}">${option.art}</svg>`)}")`;
  }

  function extendPattern(persist=false){
    const option=options.find(item=>item.id===(checkbox.checked?current:sidebarCurrent))||options[0];
    const visible=option.id!=='plain';
    sidebarSurface.hidden=!visible;
    sidebar.toggleAttribute('data-sidebar-pattern',visible);
    sidebarSurface.style.backgroundImage=imageFor(option);
    sidebarControls.querySelector('.sidebar-pattern-label').textContent=`Sidebar: ${option.label}${checkbox.checked?' (matched)':''}`;
    sidebarControls.querySelector('button').title=`Next: ${options[(options.indexOf(option)+1)%options.length].label}`;
    if(persist)try{localStorage.setItem(extensionKey,String(checkbox.checked))}catch{}
  }
  checkbox.addEventListener('change',()=>extendPattern(true));
  sidebarControls.querySelector('button').addEventListener('click',()=>{
    const base=checkbox.checked?current:sidebarCurrent;
    sidebarCurrent=options[(options.findIndex(item=>item.id===base)+1)%options.length].id;
    checkbox.checked=false;extendPattern(true);
    try{localStorage.setItem(sidebarKey,sidebarCurrent)}catch{}
  });
  window.addEventListener('storage',event=>{if(event.key===sidebarKey){sidebarCurrent=options.some(item=>item.id===event.newValue)?event.newValue:'plain';extendPattern()}});

  window.addEventListener('storage',event=>{if(event.key===extensionKey){checkbox.checked=event.newValue==='true';extendPattern()}});

  let current='fine-dots';try{const saved=localStorage.getItem(key);if(options.some(item=>item.id===saved))current=saved}catch{}
  function apply(persist=false){
    const option=options.find(item=>item.id===current)||options[0];
    surface.style.backgroundImage=imageFor(option);
    controls.querySelector('.dashboard-pattern-label').textContent=`Background: ${option.label}`;
    controls.querySelector('button').title=`Next: ${options[(options.indexOf(option)+1)%options.length].label}`;
    main.dataset.backgroundPattern=option.id;extendPattern();
    if(persist)try{localStorage.setItem(key,option.id)}catch{}
  }
  controls.querySelector('button').addEventListener('click',()=>{current=options[(options.findIndex(item=>item.id===current)+1)%options.length].id;apply(true)});
  window.addEventListener('storage',event=>{if(event.key===key){current=options.some(item=>item.id===event.newValue)?event.newValue:'plain';apply()}});
  function matchCanvas(){
    const rgb=getComputedStyle(main).backgroundColor.match(/[\d.]+/g);
    const dark=rgb&&rgb.length>=3&&Number(rgb[0])*.299+Number(rgb[1])*.587+Number(rgb[2])*.114<120;
    surface.style.filter=dark?'invert(1)':'none';
    const sideRGB=getComputedStyle(sidebar).backgroundColor.match(/[\d.]+/g);
    const darkSidebar=sideRGB&&Number(sideRGB[0])*.299+Number(sideRGB[1])*.587+Number(sideRGB[2])*.114<120;
    sidebarSurface.style.filter=darkSidebar?'invert(1)':'none';
  }
  new MutationObserver(matchCanvas).observe(main,{attributes:true,attributeFilter:['style','class']});
  new MutationObserver(matchCanvas).observe(document.body,{attributes:true,attributeFilter:['style','data-finish','data-card-experiments']});
  new MutationObserver(matchCanvas).observe(sidebar,{attributes:true,attributeFilter:['style','class']});
  apply();matchCanvas();
})();
