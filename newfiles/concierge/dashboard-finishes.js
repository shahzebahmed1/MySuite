(() => {
  const card = document.querySelector('body.sidebar-merge #schedule');
  const main = document.querySelector('main');
  if (!card || !main) return;
  const key = 'mysuite-concierge-dashboard-finish-v1';
  const options = [
    { id: 'original-cream', label: 'Original Cream', detail: 'Warm cream canvas, softly rounded ivory cards, and caramel accents.' },
    { id: 'warm-stone', label: 'Warm Stone', detail: 'Stone canvas, ivory cards, navy buttons.' },
    { id: 'soft-slate', label: 'Soft Slate', detail: 'Blue-grey surfaces and restrained steel accents.' },
    { id: 'midnight-brass', label: 'Midnight Brass', detail: 'Layered navy cards with warm brass highlights.' }
  ];
  const panel = document.createElement('section');
  panel.className = 'dashboard-finish-controls';
  panel.setAttribute('aria-label', 'Dashboard color experiments');
  panel.innerHTML = '<h3>Dashboard finish</h3><div class="dashboard-finish-choices" role="group" aria-label="Choose dashboard finish"></div><p class="dashboard-finish-description" aria-live="polite"></p>';
  const choices = panel.querySelector('div');
  for (const option of options) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.finish = option.id;
    button.setAttribute('aria-pressed', 'false');
    button.innerHTML = `<span class="finish-swatches" aria-hidden="true"><i></i><i></i><i></i></span><span>${option.label}</span>`;
    choices.append(button);
  }
  const headerControls = card.querySelector('.dashboard-header-adjustments');
  if (headerControls) card.insertBefore(panel, headerControls);
  else card.append(panel);
  function apply(value, persist = true) {
    const option = options.find(item => item.id === value) || options[0];
    document.body.dataset.dashboardFinish = option.id;
    // The canvas follows this experiment; cards and controls share the same tokens.
    document.body.style.setProperty('background', 'var(--finish-canvas)');
    main.style.setProperty('background', 'var(--finish-canvas)');
    choices.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.finish === option.id)));
    panel.querySelector('p').textContent = option.detail;
    if (persist) { try { localStorage.setItem(key, option.id); } catch {} }
  }
  choices.addEventListener('click', event => {
    const button = event.target.closest('[data-finish]');
    if (button) apply(button.dataset.finish);
  });
  let saved;
  try { saved = localStorage.getItem(key); } catch {}
  apply(saved, false);
  window.addEventListener('storage', event => { if (event.key === key) apply(event.newValue, false); });
})();
