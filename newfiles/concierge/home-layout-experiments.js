(() => {
  const card = document.querySelector('body.sidebar-merge #packages');
  if (!card) return;
  const key = 'mysuite-concierge-home-layout-trial-v1';
  const options = [
    { id: 'current', title: 'Current edits', detail: 'Return to your saved colors, image, borders, and fades.' },
    { id: 'soft', title: 'Soft separation · Recommended', detail: 'Warm beige sidebar, a fine divider, and a gentle fade below the header. No tint behind the greeting.' },
    { id: 'frame', title: 'Clear frame', detail: 'White sidebar and a contained split banner. Clear edges, with no header fade.' },
    { id: 'topbar', title: 'No sidebar', detail: 'Navigation across the top and a full-width morning header with a clean lower edge.' }
  ];
  const panel = document.createElement('section');
  panel.className = 'home-layout-experiments';
  panel.setAttribute('data-home-editor', '');
  panel.setAttribute('aria-label', 'Complete layout experiments');
  panel.innerHTML = `<h3>Compare complete layouts</h3><p>Start with one combination, then judge it with tools hidden. These previews use the Morning image; your saved image and editing settings are retained.</p><div class="home-layout-choices">${options.map(option => `<button type="button" data-home-layout="${option.id}" aria-pressed="false"><strong>${option.title}</strong><span>${option.detail}</span></button>`).join('')}</div><p class="home-layout-explanation" role="status" aria-live="polite"></p>`;
  card.prepend(panel);
  function apply(value, persist = true) {
    const option = options.find(item => item.id === value) || options[0];
    if (option.id === 'current') delete document.body.dataset.homeDesignTrial;
    else document.body.dataset.homeDesignTrial = option.id;
    panel.querySelectorAll('[data-home-layout]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.homeLayout === option.id)));
    panel.querySelector('.home-layout-explanation').textContent = option.id === 'current' ? 'Your individual editing controls are active.' : 'This preset temporarily controls sidebar separation and header edges. Choose Current edits to resume individual controls.';
    if (persist) { try { localStorage.setItem(key, option.id); } catch {} }
  }
  panel.addEventListener('click', event => {
    const button = event.target.closest('[data-home-layout]');
    if (button) apply(button.dataset.homeLayout);
  });
  let saved; try { saved = localStorage.getItem(key); } catch {}
  apply(saved, false);
  window.addEventListener('storage', event => { if (event.key === key) apply(event.newValue, false); });
})();
