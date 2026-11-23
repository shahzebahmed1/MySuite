(() => {
  const changed='mysuite-concierge-directory-warm-navy-v1';
  const undone='mysuite-concierge-directory-warm-navy-undone-v1';
  try {
    if(!localStorage.getItem(changed)||localStorage.getItem(undone))return;
    const picker=document.querySelector('[aria-label="Page background color"]');
    if(picker&&picker.value.toLowerCase()==='#f2efe6'){
      const reset=picker.closest('.sidebar-rgb-controls')?.querySelector('button');reset?.click();
    }
    localStorage.setItem(undone,'true');
  }catch{}
})();
