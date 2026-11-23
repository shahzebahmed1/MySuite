(() => {
  if(document.documentElement.dataset.dashboardShell !== 'monochrome') return;
  const header=document.getElementById('dashboard-greeting');
  const targets=[header?.querySelector('.classic-welcome-copy h2')].filter(Boolean);
  if(!header || !targets.length) return;
  const key='mysuite-concierge-home-greeting-text-arrangement-v1';
  let saved={};try{saved=JSON.parse(localStorage.getItem(key))||{}}catch{}
  const items=targets.map((element,index)=>{
    const id=index?'subtitle':'greeting',value=saved[id]||{};
    const state={x:Number(value.x)||0,y:Number(value.y)||0,size:Number(value.size)||null};
    element.classList.add('home-arrange-text');
    const handle=document.createElement('button');handle.type='button';handle.className='home-text-resize';
    handle.setAttribute('aria-label',`Resize ${index?'Manage Your Home':'greeting'}; use plus or minus keys`);
    handle.title='Drag to resize; + / ? to adjust';element.append(handle);
    element.setAttribute('data-text-arrange',id);
    return {id,element,handle,state};
  });
  function save(){try{localStorage.setItem(key,JSON.stringify(Object.fromEntries(items.map(item=>[item.id,item.state]))))}catch{}}
  function apply(item){
    const {element,state}=item;
    element.style.setProperty('--home-text-x',`${state.x*header.clientWidth}px`);
    element.style.setProperty('--home-text-y',`${state.y*header.clientHeight}px`);
    if(state.size) element.style.setProperty('font-size',`${state.size}px`,'important');
  }
  function mode(){
    const active=document.body.hasAttribute('data-rearranging-cards');
    for(const item of items){item.element.tabIndex=active?0:-1;item.handle.hidden=!active;}
  }
  for(const item of items){
    apply(item);
    item.element.addEventListener('pointerdown',event=>{
      if(!document.body.hasAttribute('data-rearranging-cards')||event.button!==0)return;
      event.preventDefault();event.stopPropagation();
      const resizing=event.target===item.handle;
      const start={x:event.clientX,y:event.clientY,ox:item.state.x,oy:item.state.y,size:parseFloat(getComputedStyle(item.element).fontSize)};
      const rect=item.element.getBoundingClientRect(),bounds=header.getBoundingClientRect();
      const width=header.clientWidth||1,height=header.clientHeight||1;
      item.element.setPointerCapture(event.pointerId);
      function move(e){
        if(resizing){item.state.size=Math.max(12,Math.min(96,Math.round(start.size+(e.clientX-start.x)*.35+(e.clientY-start.y)*.65)));}
        else {
          const dx=Math.max(bounds.left-rect.left,Math.min(bounds.right-rect.right,e.clientX-start.x));
          const dy=Math.max(bounds.top-rect.top,Math.min(bounds.bottom-rect.bottom,e.clientY-start.y));
          item.state.x=start.ox+dx/width;item.state.y=start.oy+dy/height;
        }
        apply(item);
      }
      function end(){item.element.removeEventListener('pointermove',move);item.element.removeEventListener('pointerup',end);item.element.removeEventListener('pointercancel',end);save();}
      item.element.addEventListener('pointermove',move);item.element.addEventListener('pointerup',end);item.element.addEventListener('pointercancel',end);
    });
    item.element.addEventListener('keydown',event=>{
      if(!document.body.hasAttribute('data-rearranging-cards'))return;
      const step=event.shiftKey?10:1;
      if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){
        event.preventDefault();event.stopPropagation();
        const rect=item.element.getBoundingClientRect(),bounds=header.getBoundingClientRect();
        let dx=event.key==='ArrowLeft'?-step:event.key==='ArrowRight'?step:0;
        let dy=event.key==='ArrowUp'?-step:event.key==='ArrowDown'?step:0;
        dx=Math.max(bounds.left-rect.left,Math.min(bounds.right-rect.right,dx));dy=Math.max(bounds.top-rect.top,Math.min(bounds.bottom-rect.bottom,dy));
        item.state.x+=dx/(header.clientWidth||1);item.state.y+=dy/(header.clientHeight||1);
      }else if(['+','=','-'].includes(event.key)){
        event.preventDefault();item.state.size=Math.max(12,Math.min(96,(item.state.size||parseFloat(getComputedStyle(item.element).fontSize))+(event.key==='-'?-1:1)));
      }else return;
      apply(item);save();
    });
  }
  const reset=document.createElement('button');reset.type='button';reset.className='home-text-reset';reset.textContent='Reset welcome text';reset.hidden=true;
  document.querySelector('.dashboard-layout-toolbar')?.append(reset);
  reset.addEventListener('click',()=>{for(const item of items){item.state.x=0;item.state.y=0;item.state.size=null;item.element.style.removeProperty('font-size');apply(item)}save()});
  function syncMode(){mode();reset.hidden=!document.body.hasAttribute('data-rearranging-cards');}
  new MutationObserver(syncMode).observe(document.body,{attributes:true,attributeFilter:['data-rearranging-cards']});
  new ResizeObserver(()=>items.forEach(apply)).observe(header);
  syncMode();
})();
