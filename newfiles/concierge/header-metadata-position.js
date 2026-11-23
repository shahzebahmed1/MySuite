(() => {
  const header=document.querySelector('.welcome');const controls=document.querySelector('.dashboard-header-adjustments');
  const date=header?.querySelector('.classic-welcome-copy .greeting-date');
  const weather=header?.querySelector('.premium-weather-group');
  if(!header||!controls||!date||!weather)return;
  const key='mysuite-concierge-header-metadata-positions-v1';
  const defaults={date:{anchor:'top-right-spaced',x:0,y:0},weather:{anchor:'top-right',x:0,y:0}};
  const anchors=[['top-right-spaced','Top right / spaced'],['top-left','Top left'],['top-right','Top right'],['bottom-left','Bottom left'],['bottom-right','Bottom right']];
  function normalize(value){const result={};for(const id of ['date','weather']){const v=value?.[id];result[id]={anchor:anchors.some(([a])=>a===v?.anchor)?v.anchor:defaults[id].anchor,x:Number.isFinite(v?.x)?Math.max(-500,Math.min(500,Math.round(v.x))):0,y:Number.isFinite(v?.y)?Math.max(-300,Math.min(300,Math.round(v.y))):0}}return result}
  let settings;try{settings=normalize(JSON.parse(localStorage.getItem(key)))}catch{settings=normalize(null)}
  const panel=document.createElement('fieldset');panel.className='header-metadata-position-controls';
  panel.innerHTML='<legend>Date &amp; weather position</legend><div class="header-metadata-position-grid">'+['date','weather'].map(id=>`<section><h4>${id==='date'?'Date':'Weather'}</h4><label>Position<select data-meta-id="${id}" data-meta-setting="anchor">${anchors.map(([value,label])=>`<option value="${value}">${label}</option>`).join('')}</select></label>${[['x','Left / right',500],['y','Up / down',300]].map(([setting,label,max])=>`<label class="header-adjustment-range"><span>${label}<output data-meta-output="${id}-${setting}"></output></span><input type="range" min="-${max}" max="${max}" step="1" data-meta-id="${id}" data-meta-setting="${setting}" aria-label="${id} ${label}"></label>`).join('')}<button type="button" data-reset-meta="${id}">Reset ${id}</button></section>`).join('')+'</div>';
  controls.querySelector('.header-adjustment-fields').after(panel);
  header.setAttribute('data-metadata-positioning','');
  function apply(persist=false){
    for(const[id,node]of [['date',date],['weather',weather]]){
      const value=settings[id],bottom=value.anchor.startsWith('bottom'),left=value.anchor.endsWith('left');
      node.style.top=bottom?'auto':'18px';node.style.bottom=bottom?'18px':'auto';
      node.style.left=left?'20px':'auto';node.style.right=left?'auto':value.anchor==='top-right-spaced'?'calc(44px + var(--header-weather-width,140px))':'20px';
      node.style.transform=`translate(${value.x}px,${value.y}px)`;
      panel.querySelector(`[data-meta-id="${id}"][data-meta-setting="anchor"]`).value=value.anchor;
      for(const setting of ['x','y']){
        panel.querySelector(`[data-meta-id="${id}"][data-meta-setting="${setting}"]`).value=String(value[setting]);
        panel.querySelector(`[data-meta-output="${id}-${setting}"]`).textContent=`${value[setting]}px`;
      }
    }
    if(persist)try{localStorage.setItem(key,JSON.stringify(settings))}catch{}
  }
  panel.addEventListener('input',event=>{
    const {metaId:id,metaSetting:setting}=event.target.dataset;if(!id||!setting)return;
    if(setting==='anchor'){settings[id].anchor=event.target.value;settings[id].x=0;settings[id].y=0}else settings[id][setting]=Number(event.target.value);
    settings=normalize(settings);apply(true);
  });
  panel.addEventListener('click',event=>{const id=event.target.closest('[data-reset-meta]')?.dataset.resetMeta;if(!id)return;settings[id]={...defaults[id]};apply(true)});
  function measureWeather(){const width=`${Math.round(weather.getBoundingClientRect().width)}px`;if(header.style.getPropertyValue('--header-weather-width')!==width)header.style.setProperty('--header-weather-width',width)}
  new ResizeObserver(measureWeather).observe(weather);measureWeather();
  window.addEventListener('storage',event=>{if(event.key===key){let value;try{value=JSON.parse(event.newValue)}catch{}settings=normalize(value);apply()}});
  apply();
})();
