(() => {
 const root=document.documentElement;
 function apply(){
  let mode='light',canvas='#fafafa';
  try{if(localStorage.getItem('mysuite-resident-home-color-mode-v1')==='dark')mode='dark';const saved=localStorage.getItem('mysuite-resident-monochrome-canvas-background-v1');if(/^#[0-9a-f]{6}$/i.test(saved||''))canvas=saved}catch{}
  root.dataset.residentTheme=mode;
  root.style.setProperty('--resident-canvas',mode==='dark'?'#11151c':canvas);
 }
 apply();window.addEventListener('storage',apply);window.addEventListener('resident-theme-change',apply);
})();
