(() => {
  const dashboard = document.querySelector('body.sidebar-merge .dashboard');
  const sidebar = document.querySelector('.sidebar');
  if (!dashboard || !sidebar) return;
  const key = 'mysuite-concierge-dashboard-header-v1';
  // Retire the two banner previews without retaining their temporary sizing/font.
  try {
    const previous = localStorage.getItem(key);
    if (['compact-navy-banner','editorial-navy-split'].includes(previous)) {
      const before = localStorage.getItem('mysuite-concierge-before-compact-banner-v1');
      if (before) localStorage.setItem('mysuite-concierge-dashboard-header-adjustments-v1',before);
      if (previous === 'editorial-navy-split') {
        const font = localStorage.getItem('mysuite-concierge-before-editorial-font-v1');
        if (font) {
          let greeting; try { greeting = JSON.parse(localStorage.getItem('mysuite-concierge-greeting-experiments-v1')); } catch {}
          localStorage.setItem('mysuite-concierge-greeting-experiments-v1',JSON.stringify({ ...(greeting || {}), font }));
        }
      }
      localStorage.setItem(key,previous === 'editorial-navy-split' ? 'split-header' : 'clean-edge');
    }
  } catch {}
  const options = [
    { id: 'premium-welcome-card', title: 'Premium Welcome Card', detail: 'A compact navy and champagne greeting card with a role badge and quiet metadata.' },
    { id: 'clean-edge', title: 'Clean Edge', detail: 'A crisp banner ending above the cards. No fade or overlap.' },
    { id: 'navy-overlap', title: 'Navy Overlap', detail: 'Cards overlap the navy image directly. No grey transition.' },
    { id: 'framed-banner', title: 'Framed Banner', detail: 'An inset, softly rounded image with space beneath it.' },
    { id: 'floating-island', title: 'Floating Island', detail: 'An inset navy banner with generous curves and a soft shadow.' },
    { id: 'glass-header', title: 'Glassmorphism', detail: 'A blurred photograph behind a sheer navy overlay.' },
    { id: 'split-header', title: 'Split Header', detail: 'Cream greeting area, photograph on the right.' },
    { id: 'tabbed-header', title: 'Tabbed Header', detail: 'Cards overlap the banner by 28px with lifted shadows.' },
    { id: 'greeting-pill', title: 'Cream Greeting Pill', detail: 'A floating cream greeting within the navy image.' },
    { id: 'panoramic-card', title: 'Panoramic Card', detail: 'An image card aligned with the dashboard, with 24px corners and a navy reading overlay.' },
    { id: 'square-split-card', title: 'Square Split Card', detail: 'The diagonal split inside an inset card with square corners, aligned with the dashboard.' },
    { id: 'overlapping-sheet', title: 'Overlapping Sheet', detail: 'A navy image backdrop with cards lifted 40px over its edge.' },
    { id: 'floating-glass-pill', title: 'Floating Glass Pill', detail: 'A compact glass nameplate bridges the image and the dashboard.' },
    { id: 'editorial-split', title: 'Split Layout', detail: 'An architectural 50/50 split with cream text area and a fine gold seam.' },
    { id: 'contained-banner', title: 'Contained Banner', detail: 'A 24px rounded image card aligned with the dashboard grid.' },
    { id: 'asymmetrical-cutout', title: 'Asymmetrical Cutout', detail: 'A sweeping cream curve separates the greeting from the image.' },
    { id: 'split-overlap', title: 'Split + Overlap', detail: 'The adjustable diagonal split with dashboard cards lifted 40px over the header.' },
    { id: 'square-card-plain', title: 'Square Card — No Shadow', detail: 'An inset image card with square corners, no shadow, and no default overlay.' },
    { id: 'reference-cream', title: 'Original Cream', detail: 'A warm room image fading into the canvas, with the dashboard cards overlapping below.' },
    { id: 'rounded-split-card', title: 'Rounded Split Card', detail: 'An inset diagonal split with 24px corners, a fine outline, and a soft shadow.' }
  ];
  const section = document.createElement('section');
  section.className = 'dashboard-header-experiments';
  section.id = 'dashboard-header-experiments';
  section.innerHTML = '<h2>Try a cleaner header</h2><div class="dashboard-header-experiment-grid"></div>';
  const grid = section.querySelector('div');
  for (const option of options) {
    const article = document.createElement('article');
    article.innerHTML = `<h3>${option.title}</h3><p>${option.detail}</p><div class="header-experiment-preview" data-preview="${option.id}" aria-hidden="true"><div class="header-experiment-photo"><span>Welcome back</span></div><div class="header-experiment-cards"><i></i><i></i><i></i></div></div><button type="button" data-header-option="${option.id}" aria-pressed="false">Try this header</button>`;
    grid.append(article);
  }
  dashboard.after(section);
  const controls = document.createElement('details');
  controls.className = 'sidebar-rgb-controls';
  controls.innerHTML = `<summary>Dashboard header</summary><div class="sidebar-rgb-panel"><label class="header-experiment-label">Header style<select aria-label="Dashboard header style">${options.map(option => `<option value="${option.id}">${option.title}</option>`).join('')}</select></label><a href="#dashboard-header-experiments">Compare all options</a></div>`;
  const previous = [...sidebar.querySelectorAll('.sidebar-rgb-controls')].pop();
  if (previous) previous.after(controls);
  else sidebar.querySelector('nav')?.append(controls);
  const select = controls.querySelector('select');
  const announcementControls = document.createElement('section');
  announcementControls.className = 'announcement-header-experiments';
  announcementControls.setAttribute('aria-label', 'More dashboard header experiments');
  announcementControls.innerHTML = `<h3>Header experiments</h3><div class="announcement-header-experiment-choices">${options.slice(3).map(option => `<button type="button" data-header-option="${option.id}" aria-pressed="false"><strong>${option.title}</strong><span>${option.detail}</span></button>`).join('')}</div>`;
  dashboard.querySelector('#announcements')?.append(announcementControls);
  const experimentCard = document.createElement('article');
  experimentCard.className = 'card header-lab';
  experimentCard.setAttribute('aria-labelledby', 'header-lab-title');
  experimentCard.innerHTML = `<div class="card-heading"><h2 id="header-lab-title">Header experiments</h2></div><p class="header-lab-intro">Try a layout. Your image and sizing controls still apply.</p><div class="announcement-header-experiment-choices">${options.filter(option => ['overlapping-sheet', 'floating-glass-pill', 'editorial-split', 'contained-banner', 'asymmetrical-cutout', 'split-overlap', 'square-card-plain', 'rounded-split-card'].includes(option.id)).map(option => `<button type="button" data-header-option="${option.id}" aria-pressed="false"><strong>${option.title}</strong><span>${option.detail}</span></button>`).join('')}</div>`;
  dashboard.querySelector('#schedule')?.before(experimentCard);
  const header = document.querySelector('.welcome');
  const nameplate = document.createElement('div');
  nameplate.className = 'header-glass-nameplate';
  nameplate.innerHTML = '<span class="header-glass-avatar" aria-hidden="true"></span><div><strong></strong><span class="header-glass-status"><i aria-hidden="true"></i>Signed in</span></div>';
  header?.append(nameplate);
  function syncNameplate() {
    const name = sidebar.querySelector('[data-user-name]')?.textContent.trim() || header?.querySelector('h1')?.textContent.replace(/^Welcome back,\s*/i, '').trim() || 'Concierge';
    nameplate.querySelector('strong').textContent = name;
    nameplate.querySelector('.header-glass-avatar').textContent = name.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
  }
  syncNameplate();
  const userName = sidebar.querySelector('[data-user-name]');
  if (userName) new MutationObserver(syncNameplate).observe(userName, { childList: true, subtree: true, characterData: true });
  function apply(value, persist = true) {
    const choice = options.some(option => option.id === value) ? value : 'premium-welcome-card';
    document.body.dataset.dashboardHeader = choice;
    select.value = choice;
    section.querySelectorAll('[data-header-option]').forEach(button => {
      const selected = button.dataset.headerOption === choice;
      button.setAttribute('aria-pressed', String(selected));
      button.textContent = selected ? 'Selected' : 'Try this header';
    });
    announcementControls.querySelectorAll('[data-header-option]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.headerOption === choice)));
    experimentCard.querySelectorAll('[data-header-option]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.headerOption === choice)));
    if (persist) { try { localStorage.setItem(key, choice); } catch {} }
  }
  section.addEventListener('click', event => {
    const button = event.target.closest('[data-header-option]');
    if (button) apply(button.dataset.headerOption);
  });
  select.addEventListener('change', () => apply(select.value));
  experimentCard.addEventListener('click', event => {
    const button = event.target.closest('[data-header-option]');
    if (button) apply(button.dataset.headerOption);
  });
  announcementControls.addEventListener('click', event => {
    const button = event.target.closest('[data-header-option]');
    if (button) apply(button.dataset.headerOption);
  });
  let saved;
  try { saved = localStorage.getItem(key); } catch {}
  apply(saved, false);
  window.addEventListener('storage', event => { if (event.key === key) apply(event.newValue, false); });
})();
