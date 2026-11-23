(() => {
  const brand=document.querySelector('.sidebar .brand');if(!brand)return;
  const key='mysuite-concierge-logo-style-v1';
  const options=[['original','Original serif'],['rounded','Exact rounded logo'],['spaced','Exact capitals + gold dash'],['mixed','Exact MySuite + gold dot'],['modern','Modern wordmark']];
  const artwork={
    rounded:{file:'Screenshot 2026-11-22 163143.png',width:145,height:52},
    spaced:{file:'Screenshot 2026-11-22 163220.png',width:242,height:75},
    mixed:{file:'Screenshot 2026-11-22 163228.png',width:247,height:77}
  };
  const dot=brand.querySelector('.brand-dot')||document.createElement('span');dot.className='brand-dot';dot.textContent='.';
  const my=document.createElement('span');my.className='brand-my';
  const suite=document.createElement('span');suite.className='brand-suite';
  const image=document.createElement('img');image.className='brand-exact-artwork';image.alt='';image.decoding='async';image.hidden=true;
  brand.replaceChildren(my,suite,dot,image);brand.setAttribute('aria-label','MySuite home');
  const panel=document.querySelector('.sidebar-greeting-size');
  let controls=null;
  if(panel){
    controls=document.createElement('div');controls.className='sidebar-logo-style-control';
    controls.innerHTML='<span aria-live="polite"></span><button type="button">Next logo <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5"/></svg></button>';
    panel.append(controls);
  }
  let current='original';try{const saved=localStorage.getItem(key);if(options.some(([id])=>id===saved))current=saved}catch{}
  function apply(persist=false){
    brand.dataset.logoStyle=current;
    const asset=artwork[current];
    brand.toggleAttribute('data-exact-logo',Boolean(asset));
    image.hidden=!asset;
    if(asset){image.src=`../assets/${asset.file}`;image.width=asset.width;image.height=asset.height;}

    my.textContent=current==='rounded'?'my':current==='spaced'?'MY':'My';
    suite.textContent=current==='rounded'?'suite':current==='spaced'?'SUITE':'Suite';
    if(controls){
      controls.querySelector('span').textContent=options.find(([id])=>id===current)[1];
      controls.querySelector('button').title=`Next: ${options[(options.findIndex(([id])=>id===current)+1)%options.length][1]}`;
    }
    if(persist)try{localStorage.setItem(key,current)}catch{}
  }
  controls?.querySelector('button').addEventListener('click',()=>{current=options[(options.findIndex(([id])=>id===current)+1)%options.length][0];apply(true)});
  window.addEventListener('storage',event=>{if(event.key===key){current=options.some(([id])=>id===event.newValue)?event.newValue:'original';apply()}});
  apply();
})();
