(() => {
  const panel = document.querySelector('.dashboard-header-adjustments');
  const title = document.querySelector('.welcome-copy h1');
  const subtitle = document.querySelector('.welcome-copy .welcome-note');
  if (!panel || !title || !subtitle) return;
  const key = 'mysuite-concierge-dashboard-header-text-v1';
  const targets = { primary: title, secondary: subtitle };
  const originals = Object.fromEntries(Object.entries(targets).map(([id, target]) => [id, { text: target.textContent, size: target.style.fontSize, color: target.style.color, weight: target.style.fontWeight }]));
  let settings = {};
  const controls = document.createElement('section');
  controls.className = 'header-text-controls';
  controls.setAttribute('aria-label', 'Header text controls');
  controls.innerHTML = Object.entries({ primary: 'Primary text', secondary: 'Secondary text' }).map(([id, label]) => `<fieldset><legend>${label}</legend><label>Text<textarea rows="2" maxlength="300" data-header-text="${id}" aria-label="${label} content"></textarea></label><div class="header-text-format"><label>Size (px)<input type="number" min="12" max="96" step="1" data-text-size="${id}" aria-label="${label} size"></label><label>Color<input type="color" data-text-color="${id}" aria-label="${label} color"></label><label>Weight<select data-text-weight="${id}" aria-label="${label} weight"><option value="">Automatic</option><option value="400">Regular</option><option value="500">Medium</option><option value="600">Semibold</option><option value="700">Bold</option></select></label></div><button type="button" data-reset-text="${id}">Reset ${id} text</button></fieldset>`).join('');
  panel.append(controls);
  function normalize(value) {
    const result = {};
    for (const id of Object.keys(targets)) {
      const source = value?.[id];
      result[id] = {};
      if (typeof source?.text === 'string') result[id].text = source.text.slice(0, 300);
      if (Number.isFinite(source?.size)) result[id].size = Math.max(12, Math.min(96, Math.round(source.size)));
      if (typeof source?.color === 'string' && /^#[\da-f]{6}$/i.test(source.color)) result[id].color = source.color;
      if (['400', '500', '600', '700'].includes(source?.weight)) result[id].weight = source.weight;
    }
    return result;
  }
  function apply(persist = true) {
    for (const [id, target] of Object.entries(targets)) {
      if (id === 'primary' && document.body.hasAttribute('data-greeting-experiments')) {
        const computed = getComputedStyle(target);
        const header = document.querySelector('.welcome');
        controls.querySelector('[data-header-text="primary"]').value = 'Hello, ' + (target.querySelector('[data-greeting-part="name"]')?.firstChild?.textContent || 'Shahzeb');
        controls.querySelector('[data-text-size="primary"]').value = parseFloat(header.style.getPropertyValue('--greeting-experiment-size')) || Math.round(parseFloat(computed.fontSize));
        continue;
      }
      const config = settings[id] || {};
      const content = config.text ?? originals[id].text;
      if (target.textContent !== content) target.textContent = content;
      target.style.fontSize = config.size ? `${config.size}px` : originals[id].size;
      target.style.color = config.color || originals[id].color;
      target.style.fontWeight = config.weight || originals[id].weight;
      if (id === 'secondary' && document.body.hasAttribute('data-greeting-experiments')) {
        const header = document.querySelector('.welcome');
        if (config.size) header.style.setProperty('--greeting-details-size', `${config.size}px`);
        else header.style.removeProperty('--greeting-details-size');
      }
      const computed = getComputedStyle(target);
      const text = controls.querySelector(`[data-header-text="${id}"]`);
      if (text.value !== content) text.value = content;
      controls.querySelector(`[data-text-size="${id}"]`).value = config.size || Math.round(parseFloat(computed.fontSize));
      const rgb = computed.color.match(/[\d.]+/g);
      controls.querySelector(`[data-text-color="${id}"]`).value = config.color || (rgb ? '#' + rgb.slice(0, 3).map(channel => Math.round(Number(channel)).toString(16).padStart(2, '0')).join('') : '#ffffff');
      controls.querySelector(`[data-text-weight="${id}"]`).value = config.weight || '';
    }
    if (persist) { try { localStorage.setItem(key, JSON.stringify(settings)); } catch {} }
  }
  controls.addEventListener('input', event => {
    const input = event.target;
    const id = input.dataset.headerText || input.dataset.textSize || input.dataset.textColor || input.dataset.textWeight;
    if (!Object.hasOwn(targets, id)) return;
    const config = { ...settings[id] };
    if (input.dataset.headerText) config.text = input.value;
    if (input.dataset.textSize) { if (!input.value || !input.validity.valid) return; config.size = Number(input.value); }
    if (input.dataset.textColor) config.color = input.value;
    if (input.dataset.textWeight) config.weight = input.value;
    settings = normalize({ ...settings, [id]: config });
    if (id === 'primary' && input.dataset.textSize && document.body.hasAttribute('data-greeting-experiments')) document.dispatchEvent(new CustomEvent('greeting:size-changed', { detail: { size: config.size } }));
    apply();
  });
  controls.addEventListener('click', event => {
    const button = event.target.closest('[data-reset-text]');
    if (button) { delete settings[button.dataset.resetText]; apply(); }
  });
  try { settings = normalize(JSON.parse(localStorage.getItem(key))); } catch { settings = normalize(null); }
  apply(false);
  new MutationObserver(() => apply(false)).observe(document.body, { attributes: true, attributeFilter: ['data-dashboard-header', 'style'] });
  new ResizeObserver(() => apply(false)).observe(title);
  window.addEventListener('storage', event => {
    if (event.key !== key) return;
    let value;
    try { value = JSON.parse(event.newValue); } catch {}
    settings = normalize(value); apply(false);
  });
})();
