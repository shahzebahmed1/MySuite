(() => {
  const shop=document.querySelector('.dashboard #shop');
  const controls=document.querySelector('.dashboard-header-adjustments');
  if(!shop||!controls)return;
  const key='mysuite-concierge-shop-card-height-v1';
  let settings={match:false,height:160};
  function normalize(value){return{match:value?.match===true,height:Number.isFinite(value?.height)?Math.max(40,Math.min(800,Math.round(value.height))):160}}
  try{settings=normalize(JSON.parse(localStorage.getItem(key)))}catch{}
  const panel=document.createElement('fieldset');panel.className='shop-height-controls';
  panel.innerHTML='<legend>Shop card height</legend><label class="shop-match-header"><input type="checkbox"> Match header height</label><label class="header-adjustment-range"><span>Shop height <output></output></span><input type="range" min="40" max="800" step="1" aria-label="Shop card height"></label>';
  controls.querySelector('.header-adjustment-fields').after(panel);
  const checkbox=panel.querySelector('[type="checkbox"]'),range=panel.querySelector('[type="range"]'),output=panel.querySelector('output');
  function apply(persist=false){
    shop.toggleAttribute('data-match-header-height',settings.match);
    shop.style.setProperty('--dashboard-shop-height',`${settings.height}px`);
    checkbox.checked=settings.match;range.value=String(settings.height);range.disabled=settings.match;
    output.textContent=settings.match?'Matches header':`${settings.height}px`;
    if(persist)try{localStorage.setItem(key,JSON.stringify(settings))}catch{}
  }
  checkbox.addEventListener('change',()=>{settings.match=checkbox.checked;apply(true)});
  range.addEventListener('input',()=>{settings.height=Number(range.value);settings=normalize(settings);apply(true)});
  window.addEventListener('storage',event=>{if(event.key===key){let value;try{value=JSON.parse(event.newValue)}catch{}settings=normalize(value);apply()}});
  apply();
})();
