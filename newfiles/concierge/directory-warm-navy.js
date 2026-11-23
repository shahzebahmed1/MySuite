(() => {
  if(!document.body.classList.contains('directory-warm-navy'))return;
  const sidebar=document.querySelector('.sidebar');
  // Page-local palette; no global sidebar preferences are overwritten.
  sidebar?.style.setProperty('--custom-sidebar-bg','#1d2a3b');
  const marker='mysuite-concierge-directory-warm-navy-v1';
  try {
    if(!localStorage.getItem(marker)){
      const picker=document.querySelector('[aria-label="Page background color"]');
      if(picker){picker.value='#f2efe6';picker.dispatchEvent(new Event('input',{bubbles:true}));}
      localStorage.setItem(marker,'true');
    }
  } catch {}
})();
