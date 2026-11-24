(() => {
 const root=document.documentElement;
 function apply(){
  let mode='light',canvas='#fafafa';
  try{if(localStorage.getItem('mysuite-concierge-home-color-mode-v1')==='dark')mode='dark';const saved=localStorage.getItem('mysuite-concierge-monochrome-canvas-background-v1');if(/^#[0-9a-f]{6}$/i.test(saved||''))canvas=saved}catch{}
  root.dataset.conciergeTheme=mode;
  root.style.setProperty('--concierge-canvas',mode==='dark'?'#11151c':canvas);
 }
 apply();window.addEventListener('storage',apply);window.addEventListener('concierge-theme-change',apply);
})();
