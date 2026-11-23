(() => {
  const sidebar = document.querySelector('.sidebar');
  const main = document.querySelector('main');
  if (!sidebar || !main) return;
  const key = 'mysuite-concierge-sidebar-divider-v1';
  const options = [
    { id: 'warm-line', title: 'Thin warm line', detail: 'A quiet, full-height boundary.' },
    { id: 'soft-shadow', title: 'Soft shadow', detail: 'Gentle depth without a visible line.' },
    { id: 'inset-line', title: 'Inset line', detail: 'A short line with breathing room at both ends.' },
    { id: 'faded-line', title: 'Faded line', detail: 'A fine line that softly disappears at the ends.' }
  ];
  const section = document.createElement('section');
  section.id = 'sidebar-divider-options';
  section.className = 'sidebar-divider-options';
  section.setAttribute('aria-labelledby', 'sidebar-divider-heading');
  section.innerHTML = '<h2 id="sidebar-divider-heading">Compare sidebar dividers</h2><div class="sidebar-divider-grid"></div>';
  const grid = section.querySelector('.sidebar-divider-grid');
  for (const option of options) {
    const article = document.createElement('article');
    article.innerHTML = `<h3>${option.title}</h3><p>${option.detail}</p><div class="sidebar-divider-demo" data-divider-option="${option.id}" aria-hidden="true"><div class="divider-demo-nav"><span>MySuite<span>.</span></span><i></i><i></i><i></i></div><div class="divider-demo-page"><i></i><i></i></div></div><button type="button" data-divider-choice="${option.id}" aria-pressed="false">Try this divider</button>`;
    grid.append(article);
  }
  const existingPreviews = main.querySelector('.concierge-nav-comparison');
  if (existingPreviews) main.insertBefore(section, existingPreviews);
  else main.append(section);
  const controls = document.createElement('details');
  controls.className = 'sidebar-rgb-controls';
  controls.innerHTML = `<summary>Sidebar divider</summary><div class="sidebar-rgb-panel"><label class="divider-select-label">Style<select aria-label="Sidebar divider style"><option value="none">No divider</option>${options.map(option => `<option value="${option.id}">${option.title}</option>`).join('')}</select></label><a class="divider-compare-link" href="#sidebar-divider-options">Compare all four</a></div>`;
  const previous = [...sidebar.querySelectorAll('.sidebar-rgb-controls')].pop();
  if (previous) previous.after(controls);
  else sidebar.querySelector('nav')?.append(controls);
  const select = controls.querySelector('select');
  function apply(id, persist = true) {
    const valid = id === 'none' || options.some(option => option.id === id);
    const chosen = valid ? id : 'warm-line';
    document.body.dataset.sidebarDivider = chosen;
    select.value = chosen;
    section.querySelectorAll('[data-divider-choice]').forEach(button => {
      const selected = button.dataset.dividerChoice === chosen;
      button.setAttribute('aria-pressed', String(selected));
      button.textContent = selected ? 'Selected' : 'Try this divider';
    });
    if (persist) { try { localStorage.setItem(key, chosen); } catch {} }
  }
  section.addEventListener('click', event => {
    const button = event.target.closest('[data-divider-choice]');
    if (button) apply(button.dataset.dividerChoice);
  });
  select.addEventListener('change', () => apply(select.value));
  let saved;
  try { saved = localStorage.getItem(key); } catch {}
  apply(saved, false);
  window.addEventListener('storage', event => { if (event.key === key) apply(event.newValue, false); });
})();
