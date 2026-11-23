(() => {
  const header=document.querySelector('.welcome');
  const home=document.querySelector('.sidebar nav .nav-item');
  if(!header||!home)return;
  const panel=document.createElement('section');panel.className='sidebar-greeting-size';panel.setAttribute('aria-label','Greeting size');
  panel.innerHTML='<div><label for="sidebar-greeting-size">Greeting size</label><label class="sidebar-greeting-number"><input type="number" min="12" max="96" step="1" aria-label="Greeting size in pixels"><span>px</span></label></div><input id="sidebar-greeting-size" type="range" min="12" max="96" step="1" aria-label="Greeting size">';
  home.before(panel);
  const styleLabel=document.createElement('label');styleLabel.className='sidebar-greeting-style';
  styleLabel.innerHTML='Greeting style<select aria-label="Greeting style"><option value="compact">Classic greeting</option><option value="editorial">Italic name / role above</option></select>';
  panel.prepend(styleLabel);
  const styleSelect=styleLabel.querySelector('select');
  const styleKey='mysuite-concierge-greeting-finish-v1';
  function applyStyle(value,persist=false){
    const style=value==='compact'?'compact':'editorial';
    header.dataset.greetingFinish=style;styleSelect.value=style;
    if(persist)try{localStorage.setItem(styleKey,style)}catch{}
  }
  let selected='editorial';try{selected=localStorage.getItem(styleKey)||'editorial'}catch{}
  applyStyle(selected);
  styleSelect.addEventListener('change',()=>applyStyle(styleSelect.value,true));
  window.addEventListener('storage',event=>{if(event.key===styleKey)applyStyle(event.newValue)});

  const nextGreeting=document.createElement('button');nextGreeting.type='button';nextGreeting.className='sidebar-next-greeting';
  const phrases=['Hello','Good Afternoon','Welcome Home','Morning'];
  function syncPhrase(){
    const current=header.querySelector('.classic-welcome-copy [data-greeting-part="hello"]')?.textContent||'Hello';
    nextGreeting.textContent='Next greeting';nextGreeting.title=`Next: ${phrases[(phrases.indexOf(current)+1)%phrases.length]}`;
  }
  styleLabel.after(nextGreeting);
  nextGreeting.addEventListener('click',()=>{
    const current=header.querySelector('.classic-welcome-copy [data-greeting-part="hello"]')?.textContent||'Hello';
    document.dispatchEvent(new CustomEvent('greeting:phrase-changed',{detail:{phrase:phrases[(phrases.indexOf(current)+1)%phrases.length]}}));syncPhrase();
  });
  new MutationObserver(syncPhrase).observe(header,{childList:true,subtree:true,characterData:true});syncPhrase();

  const alignment=document.createElement('label');alignment.className='sidebar-greeting-alignment';
  alignment.innerHTML='<input type="checkbox"> Center greeting horizontally';
  nextGreeting.after(alignment);
  const centered=alignment.querySelector('input');
  const alignKey='mysuite-concierge-centered-greeting-v1';
  function applyAlignment(value,persist=false){
    centered.checked=value;header.toggleAttribute('data-center-greeting',value);
    if(persist)try{localStorage.setItem(alignKey,String(value))}catch{}
  }
  let alignValue=false;try{alignValue=localStorage.getItem(alignKey)==='true'}catch{}
  applyAlignment(alignValue);
  centered.addEventListener('change',()=>applyAlignment(centered.checked,true));
  window.addEventListener('storage',event=>{if(event.key===alignKey)applyAlignment(event.newValue==='true')});

  const verticalAlignment=document.createElement('label');verticalAlignment.className='sidebar-greeting-alignment';
  verticalAlignment.innerHTML='<input type="checkbox"> Center greeting vertically';
  alignment.after(verticalAlignment);
  const verticallyCentered=verticalAlignment.querySelector('input');
  const verticalKey='mysuite-concierge-vertically-centered-greeting-v1';
  function applyVerticalAlignment(value,persist=false){
    verticallyCentered.checked=value;header.toggleAttribute('data-center-greeting-vertically',value);
    if(persist)try{localStorage.setItem(verticalKey,String(value))}catch{}
  }
  let verticalValue=false;try{verticalValue=localStorage.getItem(verticalKey)==='true'}catch{}
  applyVerticalAlignment(verticalValue);
  verticallyCentered.addEventListener('change',()=>applyVerticalAlignment(verticallyCentered.checked,true));
  window.addEventListener('storage',event=>{if(event.key===verticalKey)applyVerticalAlignment(event.newValue==='true')});

  const leftAlignment=document.createElement('label');leftAlignment.className='sidebar-greeting-alignment';
  leftAlignment.innerHTML='<input type="checkbox"> Center text within left block';
  alignment.after(leftAlignment);
  const leftCentered=leftAlignment.querySelector('input');
  const leftAlignKey='mysuite-concierge-left-block-centered-greeting-v1';
  function applyLeftAlignment(value,persist=false){
    leftCentered.checked=value;header.toggleAttribute('data-center-left-greeting',value);
    if(value)applyAlignment(false,persist);
    if(persist)try{localStorage.setItem(leftAlignKey,String(value))}catch{}
  }
  let leftAlignValue=false;try{leftAlignValue=localStorage.getItem(leftAlignKey)==='true'}catch{}
  applyLeftAlignment(leftAlignValue);
  leftCentered.addEventListener('change',()=>applyLeftAlignment(leftCentered.checked,true));
  centered.addEventListener('change',()=>{if(centered.checked)applyLeftAlignment(false,true)});
  window.addEventListener('storage',event=>{
    if(event.key===leftAlignKey)applyLeftAlignment(event.newValue==='true');
    if(event.key===alignKey&&event.newValue==='true')applyLeftAlignment(false);
  });

  const range=panel.querySelector('[type="range"]');const number=panel.querySelector('[type="number"]');
  function sync(){
    const value=Number.parseFloat(header.style.getPropertyValue('--greeting-experiment-size'))||36;
    range.value=String(value);number.value=String(value);
  }
  function update(event){
    if(event.target.value==='')return;
    const raw=Number(event.target.value);if(!Number.isFinite(raw))return;
    const size=Math.max(12,Math.min(96,Math.round(raw)));
    document.dispatchEvent(new CustomEvent('greeting:size-changed',{detail:{size}}));sync();
  }
  range.addEventListener('input',update);number.addEventListener('change',update);
  new MutationObserver(sync).observe(header,{attributes:true,attributeFilter:['style']});
  sync();
})();
