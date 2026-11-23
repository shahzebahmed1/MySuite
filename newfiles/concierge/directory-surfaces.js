(() => {
  const header=document.querySelector('.dir-header-content');if(!header)return;
  const key='mysuite-concierge-directory-surface-v1';
  const options=['soft-grey','warm-grey','white'];
  const label=document.createElement('label');label.className='directory-surface-control';
  label.innerHTML='Panel colour<select aria-label="Contact directory panel colour"><option value="soft-grey">Soft grey</option><option value="warm-grey">Warm grey</option><option value="white">Original white</option></select>';
  header.append(label);const select=label.querySelector('select');
  function apply(value,persist=false){
    const choice=options.includes(value)?value:'soft-grey';document.body.dataset.directorySurface=choice;select.value=choice;
    if(persist)try{localStorage.setItem(key,choice)}catch{}
  }
  let saved;try{saved=localStorage.getItem(key)}catch{}
  apply(saved);select.addEventListener('change',()=>apply(select.value,true));
  window.addEventListener('storage',event=>{if(event.key===key)apply(event.newValue)});
})();
