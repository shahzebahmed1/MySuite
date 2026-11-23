(() => {
  const root=document.documentElement;
  const prefix='mysuite-concierge-rounded-shell-v1:';
  const modeKey=prefix+'mode',backupKey=prefix+'original-backup';
  function isAppearance(key){
    return key.startsWith('mysuite-')&&!key.startsWith(prefix)&&!/(backup|before-|restored|restore-|applied|upgrade|undone)/.test(key)&&/sidebar|logo|font|greeting|pill|palette|finish|background|header|navigation|card-(layout|experiments|height)|role-placement|home-(tools|layout|design)|pattern/.test(key);
  }
  function capture(){
    const result={};for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(isAppearance(key))result[key]=localStorage.getItem(key)}return result;
  }
  function read(name,fallback){try{const value=JSON.parse(localStorage.getItem(name));return value&&typeof value==='object'&&!Array.isArray(value)?value:fallback}catch{return fallback}}
  function restore(snapshot){
    for(const key of Object.keys(capture()))if(!(key in snapshot))localStorage.removeItem(key);
    for(const[key,value]of Object.entries(snapshot))if(isAppearance(key)&&typeof value==='string')localStorage.setItem(key,value);
  }
  let mode='rounded',available=true;
  try{
    if(!localStorage.getItem(backupKey)){
      const snapshot=capture();localStorage.setItem(backupKey,JSON.stringify({savedAt:new Date().toISOString(),settings:snapshot}));
      localStorage.setItem(prefix+'bank:original',JSON.stringify(snapshot));
    }
    const savedMode=localStorage.getItem(modeKey);
    mode=['original','rounded','framed','monochrome'].includes(savedMode)?savedMode:'rounded';
    if(!localStorage.getItem(prefix+'framed-introduced')){
      const snapshot=capture();localStorage.setItem(prefix+'bank:'+mode,JSON.stringify(snapshot));
      localStorage.setItem(prefix+'bank:framed',JSON.stringify(snapshot));
      mode='framed';localStorage.setItem(prefix+'framed-introduced','true');
    }
    if(!localStorage.getItem(prefix+'source-backup-return-v1')){
      localStorage.setItem(prefix+'bank:'+mode,JSON.stringify(capture()));
      const backup=read(backupKey,null);
      if(backup?.settings){restore(backup.settings);localStorage.setItem(prefix+'bank:original',JSON.stringify(backup.settings));mode='original';}
      localStorage.setItem(prefix+'source-backup-return-v1','true');
    }
    if(!localStorage.getItem(prefix+'monochrome-introduced')){
      localStorage.setItem(prefix+'bank:'+mode,JSON.stringify(capture()));
      let header;try{header=JSON.parse(localStorage.getItem('mysuite-concierge-dashboard-header-adjustments-v1'))}catch{}
      localStorage.setItem('mysuite-concierge-dashboard-header-adjustments-v1',JSON.stringify({...header,height:160}));
      let greeting;try{greeting=JSON.parse(localStorage.getItem('mysuite-concierge-greeting-experiments-v1'))}catch{}
      localStorage.setItem('mysuite-concierge-greeting-experiments-v1',JSON.stringify({...greeting,font:'circular'}));
      mode='monochrome';localStorage.setItem(prefix+'bank:monochrome',JSON.stringify(capture()));
      localStorage.setItem(prefix+'monochrome-introduced','true');
    }
    if(!localStorage.getItem(prefix+'monochrome-navy-sidebar-v1')){
      const preset={
        'mysuite-concierge-monochrome-sidebar-background-v1':'#1e293b',
        'mysuite-concierge-logo-style-v1':'original',
        'mysuite-concierge-logo-cream-finish-v1':'ivory',
        'mysuite-concierge-logo-custom-dot-v1':'#c6a37a',
        'mysuite-concierge-logo-position-v1':JSON.stringify({size:43,x:0,y:0}),
        'mysuite-concierge-sidebar-ink-colors-v1':JSON.stringify({logo:'#ffffff',icons:'#edf0f6'}),
        'mysuite-concierge-full-width-selection-v1':'true',
        'mysuite-concierge-navigation-colors-v1':JSON.stringify({text:'#c4c9d3',icons:'#edf0f6',selection:'#454b56',selectedText:'#d6bc8c',selectedIcon:'#d6bc8c',divider:'#384457'})
      };
      if(mode==='monochrome')for(const[key,value]of Object.entries(preset))localStorage.setItem(key,value);
      else localStorage.setItem(prefix+'bank:monochrome',JSON.stringify({...read(prefix+'bank:monochrome',capture()),...preset}));
      localStorage.setItem(prefix+'monochrome-navy-sidebar-v1','true');
    }
    if(!localStorage.getItem(prefix+'monochrome-open-sections-v1')){
      const layout={order:['greeting','packages','announcements','schedule','maint-queue','shop'],widths:{greeting:3,packages:3,announcements:2,schedule:1,'maint-queue':2,shop:1}};
      if(mode==='monochrome')localStorage.setItem('mysuite-concierge-dashboard-card-layout-v1',JSON.stringify(layout));
      else localStorage.setItem(prefix+'bank:monochrome',JSON.stringify({...read(prefix+'bank:monochrome',capture()),'mysuite-concierge-dashboard-card-layout-v1':JSON.stringify(layout)}));
      localStorage.setItem(prefix+'monochrome-open-sections-v1','true');
    }
    if(!localStorage.getItem(prefix+'monochrome-red-hat-v1')){
      const fontKey='mysuite-concierge-greeting-experiments-v1';
      if(mode==='monochrome'){
        let value;try{value=JSON.parse(localStorage.getItem(fontKey))}catch{}
        localStorage.setItem(fontKey,JSON.stringify({...value,font:'red-hat-display'}));
      }else{
        const bank=read(prefix+'bank:monochrome',capture());let value;try{value=JSON.parse(bank[fontKey])}catch{}
        bank[fontKey]=JSON.stringify({...value,font:'red-hat-display'});localStorage.setItem(prefix+'bank:monochrome',JSON.stringify(bank));
      }
      localStorage.setItem(prefix+'monochrome-red-hat-v1','true');
    }
    if(!localStorage.getItem(prefix+'monochrome-compact-greeting-v1')){
      const fontKey='mysuite-concierge-greeting-experiments-v1';
      const bank=mode==='monochrome'?capture():read(prefix+'bank:monochrome',capture());
      let value;try{value=JSON.parse(bank[fontKey])}catch{}
      bank[fontKey]=JSON.stringify({...value,phrase:'Morning',size:24,layout:'quiet'});
      bank['mysuite-concierge-centered-greeting-v1']='false';bank['mysuite-concierge-left-block-centered-greeting-v1']='false';
      if(mode==='monochrome')restore(bank);else localStorage.setItem(prefix+'bank:monochrome',JSON.stringify(bank));
      localStorage.setItem(prefix+'monochrome-compact-greeting-v1','true');
    }
    if(!localStorage.getItem(prefix+'monochrome-black-sidebar-v1')){
      const colourKey='mysuite-concierge-monochrome-sidebar-background-v1';
      if(mode==='monochrome')localStorage.setItem(colourKey,'#111111');
      else localStorage.setItem(prefix+'bank:monochrome',JSON.stringify({...read(prefix+'bank:monochrome',capture()),[colourKey]:'#111111'}));
      localStorage.setItem(prefix+'monochrome-black-sidebar-v1','true');
    }
    if(!localStorage.getItem(prefix+'monochrome-balanced-reference-v1')){
      const bank=mode==='monochrome'?capture():read(prefix+'bank:monochrome',capture());
      localStorage.setItem(prefix+'monochrome-before-balance',JSON.stringify(bank));
      let header;try{header=JSON.parse(bank['mysuite-concierge-dashboard-header-adjustments-v1'])}catch{}
      bank['mysuite-concierge-dashboard-header-adjustments-v1']=JSON.stringify({...header,height:120});
      bank['mysuite-concierge-logo-style-v1']='modern';
      bank['mysuite-concierge-logo-position-v1']=JSON.stringify({size:30,x:0,y:0});
      bank['mysuite-concierge-logo-custom-dot-v1']='#ffffff';
      bank['mysuite-concierge-logo-cream-finish-v1']='cream-dot';
      bank['mysuite-concierge-full-width-selection-v1']='false';
      bank['mysuite-concierge-sidebar-ink-colors-v1']=JSON.stringify({logo:'#ffffff',icons:'#b7b7b7'});
      bank['mysuite-concierge-navigation-colors-v1']=JSON.stringify({text:'#b7b7b7',icons:'#b7b7b7',selection:'#242424',selectedText:'#ffffff',selectedIcon:'#ffffff',divider:'#303030'});
      bank['mysuite-concierge-dashboard-card-layout-v1']=JSON.stringify({order:['greeting','packages','announcements','maint-queue','schedule','shop'],widths:{greeting:3,packages:2,announcements:1,'maint-queue':2,schedule:1,shop:2}});
      if(mode==='monochrome')restore(bank);else localStorage.setItem(prefix+'bank:monochrome',JSON.stringify(bank));
      localStorage.setItem(prefix+'monochrome-balanced-reference-v1','true');
    }
    localStorage.setItem(modeKey,mode);
  }catch{available=false;}
  root.dataset.dashboardShell=mode;
  document.addEventListener('DOMContentLoaded',()=>{
    const sidebar=document.querySelector('body.sidebar-merge .sidebar'),main=document.querySelector('body.sidebar-merge main');
    if(!sidebar||!main)return;
    const controls=document.createElement('details');controls.className='sidebar-rgb-controls dashboard-design-switch';
    controls.innerHTML='<summary>Dashboard design</summary><div class="sidebar-rgb-panel"><label>Design<select aria-label="Dashboard design"><option value="monochrome">Soft monochrome</option><option value="framed">Framed workspace</option><option value="rounded">Rounded canvas</option><option value="original">Original backup</option></select></label><button type="button" data-restore-dashboard-backup>Restore original backup</button><small role="status"></small></div>';
    const anchor=sidebar.querySelector('.nav-item[href="announcements.html"]');if(anchor)anchor.after(controls);else sidebar.querySelector('nav').append(controls);
    const select=controls.querySelector('select');select.value=mode;
    const designNames={original:'Original backup',rounded:'Rounded canvas',framed:'Framed workspace',monochrome:'Soft monochrome'};
    const order=['original','rounded','framed','monochrome'];
    const cycle=document.createElement('div');cycle.className='dashboard-design-cycle';
    cycle.innerHTML='<span></span><button type="button"></button>';
    controls.before(cycle);
    const nextMode=()=>order[(order.indexOf(mode)+1)%order.length];
    function syncCycle(){
      cycle.querySelector('span').textContent=`Design: ${designNames[mode]}`;
      cycle.querySelector('button').textContent=`Next design: ${designNames[nextMode()]}`;
    }
    syncCycle();
    cycle.querySelector('button').addEventListener('click',()=>switchMode(nextMode()));

    const status=controls.querySelector('small');
    status.textContent=available?'Your previous design is backed up. Each version keeps its own appearance settings.':'Browser storage is unavailable; the source backup is saved in the project.';
    function switchMode(next){
      if(!['original','rounded','framed','monochrome'].includes(next)||next===mode)return;
      try{
        localStorage.setItem(prefix+'bank:'+mode,JSON.stringify(capture()));
        const baseline=read(backupKey,{settings:{}}).settings;
        restore(read(prefix+'bank:'+next,baseline));
        localStorage.setItem(modeKey,next);location.reload();
      }catch{root.dataset.dashboardShell=next;mode=next;select.value=mode;syncCycle();status.textContent='Design changed, but these settings could not be saved.';}
    }
    select.addEventListener('change',()=>switchMode(select.value));
    controls.querySelector('[data-restore-dashboard-backup]').addEventListener('click',()=>{
      try{
        const backup=read(backupKey,null);if(!backup?.settings){status.textContent='No browser appearance backup is available.';return;}
        localStorage.setItem(prefix+'bank:'+mode,JSON.stringify(capture()));
        restore(backup.settings);localStorage.setItem(prefix+'bank:original',JSON.stringify(backup.settings));
        localStorage.setItem(modeKey,'original');location.reload();
      }catch{status.textContent='The backup could not be restored in this browser.';}
    });
    if(['rounded','framed','monochrome'].includes(mode)){
      const canvasKey=`mysuite-concierge-${mode}-canvas-background-v1`;
      const picker=sidebar.querySelector('[aria-label="Page background color"]');
      let canvas=mode==='monochrome'?'#fafafa':mode==='framed'?'#ece9f2':'#f2f3f5';try{const saved=localStorage.getItem(canvasKey);if(/^#[\da-f]{6}$/i.test(saved||''))canvas=saved}catch{}
      root.style.setProperty(`--${mode}-canvas-colour`,canvas);
      if(picker){
        picker.value=canvas;
        const rgb=[...sidebar.querySelectorAll('[data-page-rgb]')];
        rgb.forEach((input,i)=>input.value=String(parseInt(canvas.slice(1+i*2,3+i*2),16)));
        function changeCanvas(){
          if(!/^#[\da-f]{6}$/i.test(picker.value))return;
          root.style.setProperty(`--${mode}-canvas-colour`,picker.value);
          try{localStorage.setItem(canvasKey,picker.value)}catch{}
        }
        picker.addEventListener('input',changeCanvas);rgb.forEach(input=>input.addEventListener('input',changeCanvas));
      }
    }
    if(mode==='framed'||mode==='monochrome'){
      for(const[id,label,rgbSelector,fallback]of [
        ['sidebar','Sidebar background color','[data-rgb]',mode==='monochrome'?'#111111':'#111e3d'],
        ['card','Dashboard card background','[data-card-rgb]',mode==='monochrome'?'#f1f1f1':'#fffcff']
      ]){
        const key=`mysuite-concierge-${mode}-${id}-background-v1`;
        const picker=sidebar.querySelector(`[aria-label="${label}"]`);
        let colour=fallback;try{const saved=localStorage.getItem(key);if(/^#[\da-f]{6}$/i.test(saved||''))colour=saved}catch{}
        function applyColour(value,persist=false){
          if(!/^#[\da-f]{6}$/i.test(value))return;
          root.style.setProperty(`--${mode}-${id}-colour`,value);
          if(id==='card'){
            const rgb=[1,3,5].map(i=>parseInt(value.slice(i,i+2),16));const dark=rgb[0]*.299+rgb[1]*.587+rgb[2]*.114<140;
            root.style.setProperty(`--${mode}-card-ink`,dark?'#f7f4fd':mode==='monochrome'?'#171717':'#293247');
            root.style.setProperty(`--${mode}-card-muted`,dark?'#d2cddd':mode==='monochrome'?'#626262':'#63677a');
          }
          if(persist)try{localStorage.setItem(key,value)}catch{}
        }
        applyColour(colour);
        if(picker){
          picker.value=colour;
          const container=picker.closest('.sidebar-rgb-controls');
          const inputs=[...container.querySelectorAll(rgbSelector)];
          inputs.forEach((input,i)=>input.value=String(parseInt(colour.slice(1+i*2,3+i*2),16)));
          const update=()=>applyColour(picker.value,true);
          picker.addEventListener('input',update);inputs.forEach(input=>input.addEventListener('input',update));
          container.querySelector('button')?.addEventListener('click',()=>{applyColour(fallback,true);picker.value=fallback;});
        }
      }
    }
    function geometry(){
      const width=`${Math.round(sidebar.getBoundingClientRect().width)}px`;
      if(root.style.getPropertyValue('--rounded-sidebar-width')!==width)root.style.setProperty('--rounded-sidebar-width',width);
      const colour=getComputedStyle(sidebar).backgroundColor;
      if(root.style.getPropertyValue('--rounded-gutter-colour')!==colour)root.style.setProperty('--rounded-gutter-colour',colour);
    }
    new ResizeObserver(geometry).observe(sidebar);
    new MutationObserver(geometry).observe(sidebar,{attributes:true,attributeFilter:['style','class']});geometry();
  });
})();
