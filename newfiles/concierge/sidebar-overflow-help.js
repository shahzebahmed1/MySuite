(() => {
  const sidebar = document.querySelector('.sidebar');
  const nav = sidebar?.querySelector('nav');
  if (!sidebar || !nav) return;
  const popup = document.createElement('aside');
  popup.className = 'sidebar-overflow-help';
  popup.hidden = true;
  popup.setAttribute('aria-labelledby', 'sidebar-overflow-title');
  popup.innerHTML = '<div class="sidebar-overflow-heading"><h2 id="sidebar-overflow-title">Why the sidebar scrolls</h2><button type="button" data-overflow-close aria-label="Close sidebar scroll explanation">Close</button></div><p class="sidebar-overflow-summary" role="status" aria-live="polite"></p><dl class="sidebar-overflow-measurements"></dl><p class="sidebar-overflow-cause"></p><button type="button" data-overflow-collapse>Collapse open settings</button>';
  const reopen = document.createElement('button');
  reopen.type = 'button';
  reopen.className = 'sidebar-overflow-reopen';
  reopen.textContent = 'Why scrolling?';
  reopen.setAttribute('aria-controls', 'sidebar-overflow-help');
  reopen.hidden = true;
  popup.id = 'sidebar-overflow-help';
  document.body.append(popup, reopen);
  let dismissed = false;
  let scheduled = false;
  const observed = new WeakSet();
  function text(element, value) { if (element.textContent !== value) element.textContent = value; }
  function position(element) {
    const sidebarRect = sidebar.getBoundingClientRect();
    const width = Math.min(element.offsetWidth || 330, innerWidth - 24);
    const left = Math.max(12, Math.min(sidebarRect.right + 12, innerWidth - width - 12));
    const top = Math.max(12, Math.min(nav.getBoundingClientRect().top + 8, innerHeight - element.offsetHeight - 12));
    element.style.left = `${left}px`;
    element.style.top = `${top}px`;
  }
  function update() {
    scheduled = false;
    const overflowing = nav.scrollHeight > nav.clientHeight + 2;
    const visible = sidebar.getBoundingClientRect().right > 2 && sidebar.getBoundingClientRect().left < innerWidth;
    if (!overflowing) dismissed = false;
    popup.hidden = !overflowing || !visible || dismissed;
    reopen.hidden = !overflowing || !visible || !dismissed;
    if (!overflowing || !visible) return;
    const links = nav.querySelectorAll('.nav-item').length;
    const sections = [...nav.querySelectorAll('details.sidebar-rgb-controls')];
    const open = sections.filter(section => section.open);
    const extra = Math.ceil(nav.scrollHeight - nav.clientHeight);
    text(popup.querySelector('.sidebar-overflow-summary'), `${links} navigation links and ${sections.length} appearance sections need ${extra}px more space than the sidebar currently has.`);
    const metrics = popup.querySelector('.sidebar-overflow-measurements');
    const content = `<div><dt>Content height</dt><dd>${Math.ceil(nav.scrollHeight)}px</dd></div><div><dt>Available height</dt><dd>${Math.floor(nav.clientHeight)}px</dd></div><div><dt>Window height</dt><dd>${innerHeight}px</dd></div>`;
    if (metrics.innerHTML !== content) metrics.innerHTML = content;
    const labels = open.map(section => section.querySelector('summary')?.textContent.trim()).filter(Boolean);
    text(popup.querySelector('.sidebar-overflow-cause'), open.length
      ? `Expanded settings add extra height: ${labels.join(', ')}. The logo and account area keep their own space at the top and bottom.`
      : 'All appearance settings are collapsed. The menu links and settings headings together still exceed the space left between the logo and account area. A taller window gives them more room.');
    popup.querySelector('[data-overflow-collapse]').hidden = !open.length;
    position(dismissed ? reopen : popup);
    for (const child of nav.children) {
      if (!observed.has(child)) { observed.add(child); resize.observe(child); }
    }
  }
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  }
  popup.querySelector('[data-overflow-close]').addEventListener('click', () => { dismissed = true; schedule(); });
  reopen.addEventListener('click', () => { dismissed = false; schedule(); });
  popup.querySelector('[data-overflow-collapse]').addEventListener('click', () => {
    nav.querySelectorAll('details[open]').forEach(section => { section.open = false; });
    schedule();
  });
  const resize = new ResizeObserver(schedule);
  resize.observe(nav);
  resize.observe(sidebar);
  const changes = new MutationObserver(schedule);
  changes.observe(nav, { childList: true, subtree: true, attributes: true, attributeFilter: ['open', 'hidden', 'class', 'style'] });
  changes.observe(sidebar, { attributes: true, attributeFilter: ['class', 'style'] });
  nav.addEventListener('toggle', schedule, true);
  window.addEventListener('resize', schedule);
  document.fonts?.ready.then(schedule);
  schedule();
})();
