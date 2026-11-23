(() => {
  const card = document.querySelector('.header-lab');
  if (!card) return;
  const key = 'mysuite-concierge-dashboard-edge-v1';
  const options = [
    ['current', 'Current edge', 'Keep the existing overlap and transition.'],
    ['deeper', 'Deeper overlap', 'Lift the cards another 24px into the header.'],
    ['landing', 'Navy landing zone', 'Carry navy behind the card corners, then fade into the canvas.'],
    ['inset', 'Inset header', 'Align the image with the cards, leaving a consistent side gutter.']
  ];
  const overlapStyles = ['overlapping-sheet', 'navy-overlap', 'tabbed-header', 'split-overlap'];
  const panel = document.createElement('section');
  panel.className = 'header-edge-experiments';
  panel.innerHTML = `<h3>Corner &amp; edge treatments</h3><p>Choose one to compare. Current edge restores the original transition.</p><div class="announcement-header-experiment-choices">${options.map(([id, title, detail]) => `<button type="button" data-header-edge="${id}" aria-pressed="false"><strong>${title}</strong><span>${detail}</span></button>`).join('')}</div>`;
  card.append(panel);
  function apply(value, persist = true) {
    const choice = options.some(([id]) => id === value) ? value : 'current';
    if (persist && choice !== 'current' && !overlapStyles.includes(document.body.dataset.dashboardHeader)) {
      const select = document.querySelector('.sidebar select[aria-label="Dashboard header style"]');
      if (select) { select.value = 'overlapping-sheet'; select.dispatchEvent(new Event('change', { bubbles: true })); }
    }
    document.body.dataset.headerEdge = choice;
    panel.querySelectorAll('[data-header-edge]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.headerEdge === choice)));
    if (persist) { try { localStorage.setItem(key, choice); } catch {} }
  }
  panel.addEventListener('click', event => {
    const button = event.target.closest('[data-header-edge]');
    if (button) apply(button.dataset.headerEdge);
  });
  let saved;
  try { saved = localStorage.getItem(key); } catch {}
  apply(saved, false);
  window.addEventListener('storage', event => { if (event.key === key) apply(event.newValue, false); });
})();
