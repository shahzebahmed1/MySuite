(() => {
 try{history.scrollRestoration='manual'}catch{}
 let interacted=false;
 const cancel=()=>{interacted=true};
 for(const type of ['wheel','touchstart','pointerdown'])window.addEventListener(type,cancel,{passive:true,once:true});
 window.addEventListener('keydown',event=>{if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key))cancel()},{passive:true});
 window.addEventListener('pageshow',()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{if(!interacted&&!location.hash)window.scrollTo({top:0,left:0,behavior:'instant'})})));
})();
