(() => {
 function init(){
  const brand=document.querySelector('.sidebar .brand');if(!brand)return;
  const option={"id": "15_horizontal_black", "name": "15 horizontal black", "file": "15_horizontal_black.png", "width": 2172, "height": 724, "frame": [102, 105, 2024, 561]},crop=document.createElement('span');crop.className='supplied-logo-crop supplied-transparent-logo';
  const[x,y,w,h]=option.frame;
  for(const[property,value]of Object.entries({'--logo-frame-aspect':`${w} / ${h}`,'--logo-image-width':`${option.width/w*100}%`,'--logo-image-left':`${-x/w*100}%`,'--logo-image-top':`${-y/h*100}%`}))crop.style.setProperty(property,value);
  const image=document.createElement('img');image.className='supplied-logo-image';image.src=`../assets/transparent-logos/${option.file}`;image.alt='MySuite';image.width=option.width;image.height=option.height;image.decoding='async';crop.append(image);
  brand.replaceChildren(crop);brand.setAttribute('data-supplied-logo','');brand.dataset.suppliedPresentation='board';brand.setAttribute('aria-label','MySuite home');
  document.querySelectorAll('.concierge-logo-switcher').forEach(control=>control.remove());
  try{localStorage.setItem('mysuite-concierge-transparent-logo-choice-v1',option.id)}catch{}

 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
