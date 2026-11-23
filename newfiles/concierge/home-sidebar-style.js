(() => {
  const sidebar = document.querySelector('body[data-home-sidebar-style="warm-beige"] .sidebar');
  if (!sidebar) return;
  const key = 'mysuite-concierge-home-sidebar-surface-v1';
  const valid = value => /^#[\da-f]{6}$/i.test(value || '');
  const picker = sidebar.querySelector('input[aria-label="Sidebar background color"]');
  const controls = picker?.closest('details');
  function apply(color, persist = true) {
    const value = valid(color) ? color : '#e9e2d5';
    sidebar.style.setProperty('--home-sidebar-background', value);
    if (picker) picker.value = value;
    controls?.querySelectorAll('[data-rgb]').forEach((input,i) => input.value = parseInt(value.slice(1+i*2,3+i*2),16));
    if (persist) { try { localStorage.setItem(key,value); } catch {} }
  }
  controls?.addEventListener('input', event => {
    if (event.target.type === 'number' && (!event.target.value || !event.target.validity.valid)) return;
    const value = sidebar.style.getPropertyValue('--custom-sidebar-bg').trim();
    if (valid(value)) apply(value);
  });
  controls?.querySelector('button')?.addEventListener('click', () => apply(null));
  document.addEventListener('sidebar:pill-changed', () => sidebar.style.setProperty('--home-sidebar-selection', 'var(--sidebar-highlight)'));
  let saved;
  try { saved = localStorage.getItem(key); } catch {}
  apply(saved,false);
  try { if (valid(localStorage.getItem('mysuite-concierge-original-sidebar-pill-v2'))) sidebar.style.setProperty('--home-sidebar-selection', 'var(--sidebar-highlight)'); } catch {}
  window.addEventListener('storage', event => { if (event.key === key) apply(event.newValue,false); });
})();
