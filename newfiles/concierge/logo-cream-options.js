(() => {
  const sidebar = document.querySelector('.sidebar');
  const main = document.querySelector('main');
  if (!sidebar || !main) return;
  const key = 'mysuite-concierge-logo-cream-finish-v1';
  const customDotKey = 'mysuite-concierge-logo-custom-dot-v1';
  let customDot = null;
  try { const saved = localStorage.getItem(customDotKey); if (/^#[\da-f]{6}$/i.test(saved || '')) customDot = saved; } catch {}
  const options = [
    { id: 'cream-dot', title: 'White + Cream Dot', text: '#ffffff', dot: '#eadcc6', description: 'White lettering with a soft cream dot.' },
    { id: 'ivory', title: 'White + Warm Gold', text: '#ffffff', dot: '#c6a37a', description: 'White lettering with a warm gold dot.' },
    { id: 'cream', title: 'White + Ivory Dot', text: '#ffffff', dot: '#fff9f0', description: 'White lettering with a pale ivory dot.' },
    { id: 'pearl', title: 'White + Sand Dot', text: '#ffffff', dot: '#d2b38b', description: 'White lettering with a soft sandy dot.' }
  ];
  let selected = 'cream-dot';
  try { const saved = localStorage.getItem(key); if (saved === 'none' || options.some(option => option.id === saved)) selected = saved; } catch {}
  const section = document.createElement('section');
  section.id = 'logo-cream-options';
  section.className = 'logo-cream-options';
  section.innerHTML = '<h2>A touch of cream</h2><p>Compare logo finishes on your current sidebar color.</p><div class="logo-cream-grid"></div>';
  const grid = section.querySelector('.logo-cream-grid');
  for (const option of options) {
    const article = document.createElement('article');
    article.innerHTML = `<h3>${option.title}</h3><p>${option.description}</p><div class="logo-cream-sample"><span style="color:${option.text}">MySuite<span style="color:${option.dot}">.</span></span></div><button type="button" data-logo-finish="${option.id}" aria-pressed="false">Try this logo</button>`;
    grid.append(article);
  }
  const existing = main.querySelector('.navigation-treatment-options, .sidebar-divider-options, .concierge-nav-comparison');
  if (existing) main.insertBefore(section, existing);
  else main.append(section);
  const control = document.createElement('details');
  control.className = 'sidebar-rgb-controls';
  control.innerHTML = `<summary>Logo cream options</summary><div class="sidebar-rgb-panel"><label class="logo-cream-label">Logo finish<select aria-label="MySuite logo cream finish">${options.map(option => `<option value="${option.id}">${option.title}</option>`).join('')}<option value="none">Previous / custom logo color</option></select></label><a href="#logo-cream-options">Compare all four</a></div>`;
  const previous = [...sidebar.querySelectorAll('.sidebar-rgb-controls')].pop();
  if (previous) previous.after(control);
  else sidebar.querySelector('nav')?.append(control);
  const select = control.querySelector('select');
  function apply(id, persist = true) {
    const option = options.find(item => item.id === id);
    selected = option?.id || 'none';
    if (option) {
      sidebar.style.removeProperty('--custom-logo-dot');
      if (persist) { customDot = null; try { localStorage.removeItem(customDotKey); } catch {} }
      document.body.dataset.logoFinish = option.id;
      sidebar.dataset.logoFinish = option.id;
      sidebar.style.setProperty('--logo-finish-text', option.text);
      sidebar.style.setProperty('--logo-finish-dot', option.dot);
    } else {
      if (customDot) sidebar.style.setProperty('--custom-logo-dot', customDot);
      delete document.body.dataset.logoFinish;
      delete sidebar.dataset.logoFinish;
      sidebar.style.removeProperty('--logo-finish-text');
      sidebar.style.removeProperty('--logo-finish-dot');
    }
    select.value = selected;
    section.querySelectorAll('button').forEach(button => {
      const active = button.dataset.logoFinish === selected;
      button.setAttribute('aria-pressed', String(active));
      button.textContent = active ? 'Selected' : 'Try this logo';
    });
    if (persist) { try { localStorage.setItem(key, selected); } catch {} }
  }
  function refreshSamples() {
    const background = getComputedStyle(sidebar).backgroundColor;
    section.querySelectorAll('.logo-cream-sample').forEach(sample => { sample.style.background = background; });
  }
  section.addEventListener('click', event => {
    const button = event.target.closest('[data-logo-finish]');
    if (button) apply(button.dataset.logoFinish);
  });
  select.addEventListener('change', () => apply(select.value));
  document.addEventListener('input', event => {
    if (event.target.matches('[data-ink-color="logo"], [data-ink-rgb="logo"]')) {
      const dot = brandDotColor();
      if (dot) {
        customDot = dot;
        try { localStorage.setItem(customDotKey, customDot); } catch {}
      }
      apply('none');
    }
  });
  function brandDotColor() {
    const dot = sidebar.querySelector('.brand-dot');
    const rgb = dot ? getComputedStyle(dot).color.match(/[\d.]+/g) : null;
    return rgb?.length >= 3 ? '#' + rgb.slice(0, 3).map(value => Math.round(Number(value)).toString(16).padStart(2, '0')).join('') : null;
  }
  apply(selected, false);
  refreshSamples();
  const observer = new MutationObserver(refreshSamples);
  observer.observe(sidebar, { attributes: true, attributeFilter: ['style', 'data-custom-sidebar'] });
  observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });
  window.addEventListener('storage', event => { if (event.key === key) apply(event.newValue, false); });
  window.addEventListener('storage', event => {
    if (event.key !== customDotKey) return;
    customDot = /^#[\da-f]{6}$/i.test(event.newValue || '') ? event.newValue : null;
    if (selected === 'none') {
      if (customDot) sidebar.style.setProperty('--custom-logo-dot', customDot);
      else sidebar.style.removeProperty('--custom-logo-dot');
    }
  });
})();
