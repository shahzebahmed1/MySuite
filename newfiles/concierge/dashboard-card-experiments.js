(() => {
  const card = document.querySelector('body.sidebar-merge #announcements');
  if (!card) return;
  const key = 'mysuite-concierge-dashboard-card-experiments-v1';
  const options = [
    ['white', 'White cards / stone canvas'],
    ['cream', 'Cream cards / white canvas'],
    ['warm-cream', 'Warm cream cards / stone canvas'],
    ['corners', '12px floating corners'],
    ['shadows', 'Card shadows'],
    ['outlines', 'Card outlines'],
    ['dividers', 'Remove inner dividers'],
    ['pending', 'Defined status pills'],
    ['type', 'Stronger typography'],
    ['rows', 'Row hover & alignment'],
    ['icons', 'Larger announcement icons'],
    ['ghost', 'Tinted header buttons']
  ];
  const colorOptions = ['white', 'cream', 'warm-cream'];
  let enabled = {};
  const panel = document.createElement('section');
  panel.className = 'dashboard-card-experiments';
  panel.setAttribute('aria-label', 'Dashboard card experiments');
  panel.innerHTML = `<h3>Card experiments</h3><p>Choose one card color option, then combine the other treatments. Warm cream uses #f2ede4 cards on #e7e0d5.</p><div class="card-experiment-toggles">${options.map(([id, title]) => `<label><input type="checkbox" data-card-experiment="${id}"><span>${title}</span></label>`).join('')}</div><div class="card-experiment-actions"><button type="button" data-card-try-all>Try recommended set</button><button type="button" data-card-reset>Reset experiments</button><output aria-live="polite"></output></div>`;
  card.querySelector('.card-heading').after(panel);
  function apply(persist = true) {
    const active = options.map(([id]) => id).filter(id => enabled[id]);
    document.body.dataset.cardExperiments = active.join(' ');
    document.body.setAttribute('data-card-depth-controls', '');
    panel.querySelectorAll('[data-card-experiment]').forEach(input => { input.checked = Boolean(enabled[input.dataset.cardExperiment]); });
    panel.querySelector('output').textContent = `${active.length} active`;
    if (persist) { try { localStorage.setItem(key, JSON.stringify(enabled)); } catch {} }
  }
  function load(value) {
    let saved;
    try { saved = JSON.parse(value); } catch {}
    enabled = {};
    for (const [id] of options) enabled[id] = saved?.[id] === true;
    const surface = document.querySelector('.dashboard .card');
    const appearance = surface ? getComputedStyle(surface) : null;
    if (typeof saved?.shadows !== 'boolean') enabled.shadows = Boolean(appearance && appearance.boxShadow !== 'none');
    if (typeof saved?.outlines !== 'boolean') enabled.outlines = Boolean(appearance && parseFloat(appearance.borderTopWidth) > 0 && appearance.borderTopStyle !== 'none');
    const chosenColor = [...colorOptions].reverse().find(id => enabled[id]);
    for (const id of colorOptions) enabled[id] = id === chosenColor;
    apply(false);
  }
  panel.addEventListener('change', event => {
    const id = event.target.dataset.cardExperiment;
    if (!options.some(([name]) => name === id)) return;
    enabled[id] = event.target.checked;
    if (enabled[id] && colorOptions.includes(id)) for (const other of colorOptions) enabled[other] = other === id;
    apply();
  });
  panel.querySelector('[data-card-try-all]').addEventListener('click', () => { const color = colorOptions.find(id => enabled[id]) || 'white'; enabled = Object.fromEntries(options.map(([id]) => [id, !colorOptions.includes(id) || id === color])); apply(); });
  panel.querySelector('[data-card-reset]').addEventListener('click', () => { enabled = {}; apply(); });
  let saved;
  try { saved = localStorage.getItem(key); } catch {}
  load(saved);
  window.addEventListener('storage', event => { if (event.key === key) load(event.newValue); });
})();
