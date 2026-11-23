(() => {
  const sidebar = document.querySelector('body.concierge-sidebar .sidebar');
  if (!sidebar) return;
  const key = 'mysuite-concierge-sidebar-icons-visible-v1';
  const controls = document.createElement('details');
  controls.className = 'sidebar-rgb-controls';
  controls.setAttribute('data-home-editor', '');
  controls.innerHTML = '<summary>Sidebar icons</summary><div class="sidebar-rgb-panel"><label class="sidebar-icon-toggle"><input type="checkbox" checked><span>Show sidebar icons</span></label></div>';
  sidebar.querySelector('nav')?.append(controls);
  const checkbox = controls.querySelector('input');
  function apply(visible, persist = true) {
    checkbox.checked = visible;
    sidebar.toggleAttribute('data-hide-nav-icons', !visible);
    if (persist) { try { localStorage.setItem(key, String(visible)); } catch {} }
  }
  checkbox.addEventListener('change', () => apply(checkbox.checked));
  let visible = true;
  try { visible = localStorage.getItem(key) !== 'false'; } catch {}
  apply(visible, false);
  window.addEventListener('storage', event => { if (event.key === key) apply(event.newValue !== 'false', false); });
})();
