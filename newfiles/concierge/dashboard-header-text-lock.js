(() => {
  const panel = document.querySelector('.dashboard-header-adjustments');
  const header = document.querySelector('.welcome');
  if (!panel || !header) return;
  const key = 'mysuite-concierge-header-text-lock-v1';
  const targets = {
    heading: '.welcome-copy > h1',
    subtitle: '.welcome-note',
    classic: '.classic-welcome-copy h2',
    details: '.classic-welcome-copy p',
    badge: '.classic-welcome-badge'
  };
  const label = document.createElement('label');
  label.className = 'header-match-page-toggle header-text-lock-toggle';
  label.innerHTML = '<input type="checkbox"><span>Keep greeting size fixed when resizing header</span>';
  panel.querySelector('.header-adjustment-fields').after(label);
  const checkbox = label.querySelector('input');
  let sizes = null;
  function capture() {
    return Object.fromEntries(Object.entries(targets).map(([id, selector]) => {
      const element = header.querySelector(selector);
      return [id, element ? parseFloat(getComputedStyle(element).fontSize) : 14];
    }));
  }
  function normalize(value) {
    if (!value || typeof value !== 'object') return null;
    const result = {};
    for (const id of Object.keys(targets)) {
      if (!Number.isFinite(value[id]) || value[id] < 8 || value[id] > 160) return null;
      result[id] = value[id];
    }
    return result;
  }
  function apply(persist = true) {
    checkbox.checked = sizes !== null;
    header.toggleAttribute('data-fixed-greeting-size', sizes !== null);
    for (const id of Object.keys(targets)) {
      if (sizes) header.style.setProperty(`--locked-greeting-${id}`, `${sizes[id]}px`);
      else header.style.removeProperty(`--locked-greeting-${id}`);
    }
    if (persist) { try { if (sizes) localStorage.setItem(key, JSON.stringify(sizes)); else localStorage.removeItem(key); } catch {} }
  }
  checkbox.addEventListener('change', () => { sizes = checkbox.checked ? capture() : null; apply(); });
  try { sizes = normalize(JSON.parse(localStorage.getItem(key))); } catch {}
  apply(false);
  window.addEventListener('storage', event => {
    if (event.key !== key) return;
    let value; try { value = JSON.parse(event.newValue); } catch {}
    sizes = normalize(value); apply(false);
  });
})();
