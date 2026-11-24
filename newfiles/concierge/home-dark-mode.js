(() => {
 const root=document.documentElement,key='mysuite-concierge-home-color-mode-v1';
 let dark=false;try{dark=localStorage.getItem(key)==='dark'}catch{}
 root.dataset.homeMode=dark?'dark':'light';
 function init(){
  const account=document.querySelector('.home-topbar-account');if(!account)return;
  const palette=['#2585fb','#013bc7','#2565ed'],avatarKey='mysuite-concierge-avatar-color-v1';
  const profile=account.querySelector('[data-avatar-cycle]'),avatar=account.querySelector('.topbar-avatar');
  if(profile&&avatar){
   let color;try{color=localStorage.getItem(avatarKey)}catch{}
   let index=Math.max(0,palette.indexOf(color));
   function paint(){avatar.style.backgroundColor=palette[index];avatar.style.color='#fff';profile.title=`Avatar color ${palette[index]} - click to try next`;}
   paint();profile.addEventListener('click',()=>{index=(index+1)%palette.length;paint();try{localStorage.setItem(avatarKey,palette[index])}catch{}});
  }
  const toggle=document.createElement('button');toggle.type='button';toggle.className='home-theme-toggle';
  account.prepend(toggle);
  function apply(persist=false){
   root.dataset.homeMode=dark?'dark':'light';toggle.setAttribute('aria-pressed',String(dark));
   toggle.setAttribute('aria-label',dark?'Switch to light mode':'Switch to dark mode');
   toggle.title=dark?'Switch to light mode':'Switch to dark mode';
   const path=dark?'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>':'<path d="M20.8 13a9 9 0 0 1-9.8-9.8A9 9 0 1 0 20.8 13Z"/>';
   toggle.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg><span>${dark?'Light mode':'Dark mode'}</span>`;
   if(persist){try{localStorage.setItem(key,dark?'dark':'light')}catch{} window.dispatchEvent(new Event('concierge-theme-change'));}
  }
  toggle.addEventListener('click',()=>{dark=!dark;apply(true)});
  window.addEventListener('storage',event=>{if(event.key===key){dark=event.newValue==='dark';apply()}});
  apply();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
