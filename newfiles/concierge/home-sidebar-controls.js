(() => {
  const sidebar=document.querySelector('body.sidebar-merge .sidebar');if(!sidebar)return;
  // Undo the previous shadow-removal experiment once; later choices remain editable.
  try {
    if(localStorage.getItem('mysuite-concierge-flat-card-shadows-v1') && !localStorage.getItem('mysuite-concierge-card-shadows-restored-v1')){
      const shadows=document.querySelector('[data-card-experiment="shadows"]');
      if(shadows){shadows.checked=true;shadows.dispatchEvent(new Event('change',{bubbles:true}));}
      localStorage.setItem('mysuite-concierge-card-shadows-restored-v1','true');
    }
  } catch {}
  const labels=['Sidebar color','Active pill color','Page background','Logo & icon colors','Sidebar divider','Logo cream options','Sidebar shape & shading','Navigation colors','Sidebar icons','Selection width'];
  const controls=[...sidebar.querySelectorAll('details.sidebar-rgb-controls')];
  let anchor=sidebar.querySelector('.sidebar-quick-controls-toggle')||sidebar.querySelector('.nav-item[href="announcements.html"]');
  for(const label of labels){
    const control=controls.find(item=>item.querySelector('summary')?.textContent.trim()===label);
    if(!control)continue;
    control.removeAttribute('data-home-editor');
    control.setAttribute('data-home-sidebar-control','');
    if(anchor){anchor.after(control);anchor=control;}
  }
})();
