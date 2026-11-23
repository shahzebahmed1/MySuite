(() => {
  const grid=document.querySelector('body.sidebar-merge .dashboard');
  const header=document.querySelector('.welcome');
  if(!grid||!header)return;
  const key='mysuite-concierge-dashboard-card-layout-v1';
  const names={greeting:'Greeting',packages:'Package log',announcements:'Announcements','maint-queue':'Maintenance queue',schedule:'Upcoming bookings',payments:'Upcoming payments',shop:'Shop','booking-promo':'Book a space'};
  const defaultOrder=['greeting','packages','announcements','maint-queue','schedule','payments','shop','booking-promo'];
  const cards=new Map([['greeting',header],...defaultOrder.slice(1).map(id=>[id,document.getElementById(id)]).filter(([,card])=>card)]);
  const editorCards=[...grid.querySelectorAll('.dashboard-col > .card')].filter(card=>![...cards.values()].includes(card));
  let state;
  let arranging=false;
  let dragging=null;
  let dropTarget=null;
  let beforeTarget=true;
  let pending=false;
  let headerTools=null;
  function widthOptions(id){return ['greeting','shop','booking-promo'].includes(id)?[1,1.5,2,3]:[1,2,3]}
  function normalize(value){
    const order=Array.isArray(value?.order)?[...new Set(value.order.filter(id=>cards.has(id)))]:[];
    for(const id of defaultOrder)if(cards.has(id)&&!order.includes(id)){if(id==='booking-promo'&&order.includes('shop'))order.splice(order.indexOf('shop')+1,0,id);else order.push(id);}
    const packagePosition=order.indexOf('packages'),announcementPosition=order.indexOf('announcements');
    if(packagePosition>=0&&announcementPosition>packagePosition)[order[packagePosition],order[announcementPosition]]=[order[announcementPosition],order[packagePosition]];
    const bookingPosition=order.indexOf('booking-promo'),recentPosition=order.indexOf('packages');
    if(recentPosition>=0&&bookingPosition>recentPosition)[order[recentPosition],order[bookingPosition]]=[order[bookingPosition],order[recentPosition]];
    const schedulePosition=order.indexOf('schedule'),spacePosition=order.indexOf('booking-promo');
    if(schedulePosition>spacePosition&&spacePosition>=0){order.splice(schedulePosition,1);order.splice(spacePosition,0,'schedule');}
    const shopPosition=order.indexOf('shop'),bookingAnchor=order.indexOf('booking-promo');
    if(shopPosition>=0&&bookingAnchor>=0){order.splice(shopPosition,1);order.splice(order.indexOf('booking-promo')+1,0,'shop');}
    if(order.includes('payments')&&order.includes('schedule')){order.splice(order.indexOf('payments'),1);order.splice(order.indexOf('schedule')+1,0,'payments');}
    const widths={};
    for(const id of order)widths[id]=widthOptions(id).includes(value?.widths?.[id])?value.widths[id]:id==='greeting'?2:id==='booking-promo'?(widthOptions(id).includes(value?.widths?.shop)?value.widths.shop:2):1;
    return{order,widths};
  }
  try{state=normalize(JSON.parse(localStorage.getItem(key)))}catch{state=normalize(null)}
  document.body.setAttribute('data-dashboard-card-layout','');
  header.classList.add('card','dashboard-greeting-card');
  header.setAttribute('aria-label','Greeting card');
  for(const[id,card]of cards){
    card.dataset.layoutId=id;
    const bar=document.createElement('div');bar.className='dashboard-card-movebar';bar.hidden=true;
    bar.innerHTML=`<button type="button" class="dashboard-card-grip" data-card-grip="${id}" aria-label="Drag ${names[id]}. Arrow keys move this card." title="Drag to move, or use arrow keys"><svg viewBox="0 0 18 18" aria-hidden="true"><g fill="currentColor"><circle cx="6" cy="4" r="1.3"/><circle cx="12" cy="4" r="1.3"/><circle cx="6" cy="9" r="1.3"/><circle cx="12" cy="9" r="1.3"/><circle cx="6" cy="14" r="1.3"/><circle cx="12" cy="14" r="1.3"/></g></svg></button><button type="button" data-card-move="-1" data-move-id="${id}" aria-label="Move ${names[id]} earlier" title="Move earlier">←</button><button type="button" data-card-move="1" data-move-id="${id}" aria-label="Move ${names[id]} later" title="Move later">→</button><button type="button" data-card-width="${id}" aria-label="Change ${names[id]} width"></button>`;
    card.prepend(bar);
  }
  const toolbar=document.createElement('div');toolbar.className='dashboard-layout-toolbar';toolbar.setAttribute('role','group');toolbar.setAttribute('aria-label','Dashboard arrangement');
  toolbar.innerHTML='<button type="button" data-layout-toggle aria-pressed="false">Rearrange cards</button><button type="button" data-layout-reset hidden>Reset layout</button>';
  document.body.append(toolbar);
  const status=document.createElement('p');status.className='dashboard-layout-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');document.body.append(status);
  function save(){try{localStorage.setItem(key,JSON.stringify(state))}catch{status.textContent='The layout could not be saved in this browser.'}}
  function schedule(){if(!pending){pending=true;requestAnimationFrame(measure)}}
  function measure(){
    pending=false;
    const computed=getComputedStyle(grid);
    if(computed.getPropertyValue('--dashboard-fit-overview').trim()==='1'){
      for(const card of cards.values()){
        if(card.style.gridColumn)card.style.removeProperty('grid-column');
        if(card.style.gridRowEnd)card.style.removeProperty('grid-row-end');
      }
      return;
    }

    const columns=Number.parseInt(computed.getPropertyValue('--dashboard-columns'),10)||3;
    const rowHeight=Number.parseFloat(computed.gridAutoRows)||4;
    const gap=Number.parseFloat(computed.rowGap)||16;
    for(const[id,card]of cards){
      const width=Math.min(state.widths[id],columns);
      const column=`span ${width*2}`;if(card.style.gridColumn!==column)card.style.gridColumn=column;
      const button=card.querySelector('[data-card-width]');button.textContent=`${width} ${width===1?'column':'columns'}`;button.disabled=columns===1;
    }
    const greetingHeight=Math.round(header.getBoundingClientRect().height);
    if(greetingHeight>0){
      const height=`${greetingHeight}px`;
      if(grid.style.getPropertyValue('--dashboard-greeting-card-height')!==height)grid.style.setProperty('--dashboard-greeting-card-height',height);
      const shop=cards.get('shop');if(shop)shop.toggleAttribute('data-short-shop',shop.getBoundingClientRect().height<155);
    }
    for(const card of [...cards.values(),...editorCards,...(headerTools?[headerTools]:[])]){
      const height=card.getBoundingClientRect().height;
      const rows=height>0?`span ${Math.max(1,Math.ceil((height+gap)/(rowHeight+gap)))}`:'auto';
      if(card.style.gridRowEnd!==rows)card.style.gridRowEnd=rows;
    }
  }
  function render(){
    for(const id of state.order){grid.append(cards.get(id));if(id==='greeting'&&headerTools)grid.append(headerTools);}
    for(const card of editorCards){card.classList.add('dashboard-layout-tools-card');grid.append(card)}
    for(const wrapper of [...grid.querySelectorAll('.dashboard-col')])if(wrapper.children.length===0)wrapper.remove();
    schedule();
  }
  function setMode(enabled){
    arranging=enabled;document.body.toggleAttribute('data-rearranging-cards',enabled);
    toolbar.querySelector('[data-layout-toggle]').textContent=enabled?'Done rearranging':'Rearrange cards';
    toolbar.querySelector('[data-layout-toggle]').setAttribute('aria-pressed',String(enabled));
    toolbar.querySelector('[data-layout-reset]').hidden=!enabled;
    for(const card of cards.values()){card.querySelector('.dashboard-card-movebar').hidden=!enabled;card.querySelector('[data-card-grip]').draggable=enabled}
    status.textContent=enabled?'Drag a handle or use the move arrows. Escape finishes rearranging.':'';
    schedule();
  }
  function move(id,step){
    const index=state.order.indexOf(id),next=Math.max(0,Math.min(state.order.length-1,index+step));
    if(index===next)return;
    state.order.splice(index,1);state.order.splice(next,0,id);render();save();
    cards.get(id).querySelector('[data-card-grip]').focus();
    status.textContent=`${names[id]} moved to position ${next+1} of ${state.order.length}.`;
  }
  toolbar.querySelector('[data-layout-toggle]').addEventListener('click',()=>setMode(!arranging));
  toolbar.querySelector('[data-layout-reset]').addEventListener('click',()=>{state=normalize(null);render();save();status.textContent='Default card layout restored.'});
  grid.addEventListener('click',event=>{
    if(!arranging)return;
    const moveButton=event.target.closest('[data-card-move]');if(moveButton){move(moveButton.dataset.moveId,Number(moveButton.dataset.cardMove));return}
    const widthButton=event.target.closest('[data-card-width]');if(widthButton){const id=widthButton.dataset.cardWidth;const columns=Number.parseInt(getComputedStyle(grid).getPropertyValue('--dashboard-columns'),10)||3;const sizes=widthOptions(id).filter(size=>size<=columns);const current=Math.min(state.widths[id],columns);state.widths[id]=sizes[(sizes.indexOf(current)+1)%sizes.length];schedule();save()}
  });
  grid.addEventListener('keydown',event=>{
    const grip=event.target.closest('[data-card-grip]');if(!arranging||!grip)return;
    if(['ArrowLeft','ArrowUp','ArrowRight','ArrowDown','Home','End'].includes(event.key)){
      event.preventDefault();const step=event.key==='Home'?-state.order.length:event.key==='End'?state.order.length:['ArrowLeft','ArrowUp'].includes(event.key)?-1:1;move(grip.dataset.cardGrip,step);
    }
  });
  function clearDrag(){
    for(const card of cards.values())card.classList.remove('dashboard-card-dragging','dashboard-card-drop-before','dashboard-card-drop-after');
    dragging=null;dropTarget=null;
  }
  grid.addEventListener('dragstart',event=>{
    const grip=event.target.closest('[data-card-grip]');if(!arranging||!grip){event.preventDefault();return}
    dragging=grip.dataset.cardGrip;event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',dragging);cards.get(dragging).classList.add('dashboard-card-dragging');
  });
  grid.addEventListener('dragover',event=>{
    if(!arranging||!dragging)return;
    const card=event.target.closest('[data-layout-id]');if(!card||card.dataset.layoutId===dragging)return;
    event.preventDefault();event.dataTransfer.dropEffect='move';
    for(const item of cards.values())item.classList.remove('dashboard-card-drop-before','dashboard-card-drop-after');
    const rect=card.getBoundingClientRect();beforeTarget=event.clientY<rect.top+rect.height/2;
    dropTarget=card.dataset.layoutId;card.classList.add(beforeTarget?'dashboard-card-drop-before':'dashboard-card-drop-after');
  });
  grid.addEventListener('drop',event=>{
    if(!arranging||!dragging||!dropTarget)return;event.preventDefault();
    const id=dragging;state.order=state.order.filter(item=>item!==id);const index=state.order.indexOf(dropTarget)+(beforeTarget?0:1);state.order.splice(index,0,id);clearDrag();render();save();status.textContent=`${names[id]} moved.`;
  });
  grid.addEventListener('dragend',clearDrag);
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&arranging){clearDrag();setMode(false)}});
  const observer=new ResizeObserver(schedule);observer.observe(grid);for(const card of [...cards.values(),...editorCards])observer.observe(card);
  document.addEventListener('dashboard:card-width',event=>{
    const {id,width}=event.detail||{};
    if(!cards.has(id)||!widthOptions(id).includes(width))return;
    state.widths[id]=width;render();save();
  });
  document.addEventListener('dashboard:header-tools',event=>{
    headerTools=event.detail?.element;
    if(!headerTools)return;
    observer.observe(headerTools);render();
  });
  window.addEventListener('resize',schedule);
  if(document.fonts)document.fonts.ready.then(schedule);
  function updateReadingColor(){
    const photo=document.body.style.getPropertyValue('--dashboard-header-photo');
    const creamStyles=['split-header','square-split-card','rounded-split-card','split-overlap','editorial-split','asymmetrical-cutout','greeting-pill'];
    const light=/header-(morning|afternoon)/.test(photo)||creamStyles.includes(document.body.dataset.dashboardHeader);
    const ink=light?'#35261e':'#fff8ef',muted=light?'#716454':'#eee2ce';
    if(header.style.getPropertyValue('--greeting-card-ink')!==ink)header.style.setProperty('--greeting-card-ink',ink);
    if(header.style.getPropertyValue('--greeting-card-muted')!==muted)header.style.setProperty('--greeting-card-muted',muted);
  }
  new MutationObserver(()=>{updateReadingColor();schedule()}).observe(document.body,{attributes:true,attributeFilter:['style','data-dashboard-header','data-home-tools-hidden','data-home-design-trial']});
  render();setMode(false);updateReadingColor();
  // Start the new greeting card with the supplied navy photograph once.
  try{
    const marker='mysuite-concierge-card-layout-header-v1';
    if(!localStorage.getItem(marker)){
      localStorage.setItem('mysuite-concierge-before-card-layout-v1',JSON.stringify({style:localStorage.getItem('mysuite-concierge-dashboard-header-v1'),adjustments:localStorage.getItem('mysuite-concierge-dashboard-header-adjustments-v1')}));
      const select=document.querySelector('.sidebar select[aria-label="Dashboard header style"]');if(select){select.value='clean-edge';select.dispatchEvent(new Event('change',{bubbles:true}))}
      for(const[name,value]of Object.entries({image:'navy-ledger-wide',height:180,zoom:100,x:100,y:100})){
        const input=document.querySelector(`[data-adjust="${name}"]`);if(input){input.value=String(value);input.dispatchEvent(new Event('input',{bubbles:true}))}
      }
      localStorage.setItem('mysuite-concierge-home-layout-trial-v1','current');
      delete document.body.dataset.homeDesignTrial;
      localStorage.setItem(marker,'true');
    }
  }catch{}
  updateReadingColor();schedule();
  window.addEventListener('storage',event=>{if(event.key===key){let value;try{value=JSON.parse(event.newValue)}catch{}state=normalize(value);render()}});
})();
