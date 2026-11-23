(() => {
  const key = 'mysuite-board-sidebar-color-v1';
  const sidebar = document.querySelector('.sidebar');
  const main = document.querySelector('main');
  if (!sidebar || !main) return;
  const valid = color => /^#[\da-f]{6}$/i.test(color || '');
  const rgb = color => [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16));
  const footer = document.createElement('section');
  footer.className = 'board-sidebar-colors';
  footer.setAttribute('aria-label', 'Sidebar color settings');
  footer.innerHTML = `<label for="board-sidebar-color">Sidebar color</label>
    <input id="board-sidebar-color" type="color" value="#39281e">
    <span class="board-color-rgb">RGB <label>R<input type="number" min="0" max="255" step="1" data-channel="0" aria-label="Red"></label><label>G<input type="number" min="0" max="255" step="1" data-channel="1" aria-label="Green"></label><label>B<input type="number" min="0" max="255" step="1" data-channel="2" aria-label="Blue"></label></span>
    <button type="button">Reset</button>`;
  main.append(footer);
  const picker = footer.querySelector('input[type="color"]');
  const fields = [...footer.querySelectorAll('[data-channel]')];
  function apply(color, persist = true) {
    picker.value = color || '#39281e';
    const channels = rgb(picker.value);
    fields.forEach((input, i) => { input.value = channels[i]; });
    if (color) {
      const linear = channels.map(n => n / 255 <= .04045 ? n / 255 / 12.92 : ((n / 255 + .055) / 1.055) ** 2.4);
      const light = linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722 > .179;
      sidebar.classList.add('board-custom-sidebar');
      sidebar.style.setProperty('--board-sidebar-bg', color);
      sidebar.style.setProperty('--board-sidebar-text', light ? '#251d17' : '#fffaf5');
      sidebar.style.setProperty('--board-sidebar-line', light ? '#35261e33' : '#ffffff33');
    } else {
      sidebar.classList.remove('board-custom-sidebar');
      for (const property of ['--board-sidebar-bg', '--board-sidebar-text', '--board-sidebar-line']) sidebar.style.removeProperty(property);
    }
    if (persist) {
      try { color ? localStorage.setItem(key, color) : localStorage.removeItem(key); } catch {}
    }
  }
  picker.addEventListener('input', () => apply(picker.value));
  fields.forEach(input => input.addEventListener('input', () => {
    if (fields.some(field => field.value === '' || !field.validity.valid)) return;
    apply('#' + fields.map(field => Number(field.value).toString(16).padStart(2, '0')).join(''));
  }));
  footer.querySelector('button').addEventListener('click', () => apply(null));
  let saved;
  try { saved = localStorage.getItem(key); } catch {}
  apply(valid(saved) ? saved : null, false);
  window.addEventListener('storage', event => {
    if (event.key === key) apply(valid(event.newValue) ? event.newValue : null, false);
  });

  const styleKey = 'mysuite-board-sidebar-style-v1';
  const options = [
    { id: 'cream', title: 'Crisp cream', detail: 'Cream highlight, espresso text', background: '#f5efe6', text: '#35261e' },
    { id: 'taupe', title: 'Warm taupe', detail: 'Muted brown, cream text', background: '#6b4f3a', text: '#fff8f0' },
    { id: 'accent', title: 'Subtle accent', detail: 'Dark tint, fine cream accent', background: '#3a2e26', text: '#fff8f0' },
    { id: 'olive', title: 'Muted olive', detail: 'Soft olive, cream text', background: '#5a5a40', text: '#fff8f0' }
  ];
  const comparison = document.createElement('section');
  comparison.className = 'board-style-comparison';
  comparison.setAttribute('aria-label', 'Compare sidebar selection styles');
  const heading = document.createElement('h2');
  heading.textContent = 'Compare sidebar styles';
  comparison.append(heading);
  const grid = document.createElement('div');
  grid.className = 'board-style-grid';
  comparison.append(grid);
  let selected = null;
  function choose(id, persist = true) {
    const option = options.find(item => item.id === id);
    selected = option?.id || null;
    sidebar.classList.toggle('board-selection-custom', Boolean(option));
    sidebar.classList.toggle('board-selection-accent', option?.id === 'accent');
    if (option) {
      sidebar.style.setProperty('--board-selection-bg', option.background);
      sidebar.style.setProperty('--board-selection-text', option.text);
    }
    grid.querySelectorAll('[data-style]').forEach(button => {
      const active = button.dataset.style === selected;
      button.setAttribute('aria-pressed', String(active));
      button.textContent = active ? 'Selected' : 'Use this style';
    });
    if (persist) {
      try { selected ? localStorage.setItem(styleKey, selected) : localStorage.removeItem(styleKey); } catch {}
    }
  }
  for (const option of options) {
    const article = document.createElement('article');
    article.className = 'board-style-option';
    article.innerHTML = `<h3>${option.title}</h3><p>${option.detail}</p><div class="board-sidebar-preview"><div class="board-preview-brand">MySuite<span>.</span></div><div class="board-preview-links"></div></div><button type="button" class="button outline" data-style="${option.id}" aria-pressed="false">Use this style</button>`;
    const links = article.querySelector('.board-preview-links');
    [...sidebar.querySelectorAll('.nav-item')].slice(0, 4).forEach((link, index) => {
      const row = document.createElement('div');
      row.className = 'board-preview-row';
      row.innerHTML = link.innerHTML;
      if (index === 0) {
        row.classList.add('is-active');
        row.style.background = option.background;
        row.style.color = option.text;
        if (option.id === 'accent') row.classList.add('has-accent');
      }
      links.append(row);
    });
    article.querySelector('button').addEventListener('click', () => choose(option.id));
    grid.append(article);
  }
  main.insertBefore(comparison, footer);
  footer.querySelector('button').addEventListener('click', () => choose(null));
  let savedStyle;
  try { savedStyle = localStorage.getItem(styleKey); } catch {}
  choose(savedStyle, false);
  window.addEventListener('storage', event => {
    if (event.key === styleKey) choose(event.newValue, false);
  });
})();
