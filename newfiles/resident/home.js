/* Resident Home: read the same records used by the dedicated portal pages. */
(function initResidentHome() {
  const account = getSessionAccount('resident');
  function initWelcomeFontControls() {
    const heading = document.querySelector('.home-header h1');
    const label = document.querySelector('#home-font-name');
    const nextFontButton = document.querySelector('#home-next-font');
    const removeFontButton = document.querySelector('#home-remove-font');
    const weightButtons = [...document.querySelectorAll('[data-home-font-weight]')];
    if (!heading || !label || !nextFontButton || !removeFontButton || weightButtons.length !== 3) return;
    const fonts = [
      { name: 'Proxima Nova', family: "'Proxima Nova', sans-serif" },
      { name: 'Theinhardt', family: "'MySuite Sidebar', sans-serif" },
      { name: 'Sailec', family: "'Sailec', sans-serif" },
      { name: 'Soleil', family: "'Soleil', sans-serif" },
      { name: 'Averta', family: "'Averta', sans-serif" },
      { name: 'GT Walsheim', family: "'GT Walsheim', sans-serif" },
      { name: 'Circular Std', family: "'Circular Std', sans-serif" },
      { name: 'Sofia Pro', family: "'Sofia Pro', sans-serif" },
      { name: 'Metropolis', family: "'Metropolis', sans-serif" },
      { name: 'Sohne', family: "'Sohne', sans-serif" },
      { name: 'PP Mori', family: "'PP Mori', sans-serif" },
      { name: 'Degular', family: "'Degular', sans-serif" },
      { name: 'National', family: "'National', sans-serif" },
      { name: 'Segoe UI', family: "'Segoe UI', sans-serif" },
      { name: 'Arial', family: 'Arial, sans-serif' },
      { name: 'Verdana', family: 'Verdana, sans-serif' },
      { name: 'Trebuchet MS', family: "'Trebuchet MS', sans-serif" },
      { name: 'Tahoma', family: 'Tahoma, sans-serif' },
      { name: 'Georgia', family: 'Georgia, serif' },
      { name: 'Times New Roman', family: "'Times New Roman', serif" },
      { name: 'Courier New', family: "'Courier New', monospace" }
    ];
    const storageKey = 'mysuite-welcome-font-v1';
    const removedKey = 'mysuite-welcome-font-removed-v1';
    let removed = [];
    try {
      const savedRemoved = JSON.parse(localStorage.getItem(removedKey));
      if (Array.isArray(savedRemoved)) removed = savedRemoved.filter(name => fonts.some(font => font.name === name));
    } catch { /* Keep an empty removed list if storage is unavailable. */ }
    let active = fonts.filter(font => !removed.includes(font.name));
    if (!active.length) active = fonts.slice();
    let fontIndex = 0;
    let weight = '700';
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      const savedIndex = active.findIndex(font => font.name === saved?.font);
      if (savedIndex >= 0) fontIndex = savedIndex;
      if (['400', '600', '700'].includes(saved?.weight)) weight = saved.weight;
      else if (typeof saved?.bold === 'boolean') weight = saved.bold ? '700' : '400';
    } catch { /* Keep the default if preferences are unavailable. */ }
    function applyFont() {
      const font = active[fontIndex];
      heading.style.fontFamily = font.family;
      heading.style.fontWeight = weight;
      label.textContent = font.name;
      removeFontButton.disabled = active.length <= 1;
      weightButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.homeFontWeight === weight)));
      try { localStorage.setItem(storageKey, JSON.stringify({ font: font.name, weight })); }
      catch { /* Font controls still work without browser storage. */ }
    }
    nextFontButton.addEventListener('click', () => {
      fontIndex = (fontIndex + 1) % active.length;
      applyFont();
    });
    removeFontButton.addEventListener('click', () => {
      if (active.length <= 1) return;
      removed = [...new Set([...removed, active[fontIndex].name])];
      active = fonts.filter(font => !removed.includes(font.name));
      if (!active.length) active = fonts.slice();
      fontIndex = fontIndex % active.length;
      try { localStorage.setItem(removedKey, JSON.stringify(removed)); }
      catch { /* Removal still applies for this session without storage. */ }
      applyFont();
    });
    weightButtons.forEach(button => button.addEventListener('click', () => {
      weight = button.dataset.homeFontWeight;
      applyFont();
    }));
    applyFont();
  }
  initWelcomeFontControls();

  function initLogoControls() {
    const logo = document.querySelector('.sidebar .brand');
    const slider = document.querySelector('#home-logo-size');
    const output = document.querySelector('#home-logo-size-value');
    const moveButton = document.querySelector('#home-logo-move');
    const resetButton = document.querySelector('#home-logo-reset');
    const hint = document.querySelector('#home-logo-hint');
    if (!logo || !slider || !output || !moveButton || !resetButton || !hint) return;
    const key = 'mysuite-home-logo-layout-v1';
    const originalParent = logo.parentNode;
    const originalNext = logo.nextSibling;
    const defaultSize = Math.round(parseFloat(getComputedStyle(logo).fontSize));
    let size = defaultSize;
    let position = null;
    let placeholder = null;
    let moving = false;
    let drag = null;

    function save() {
      try { localStorage.setItem(key, JSON.stringify({ size, position, layoutVersion: 2 })); }
      catch { /* Layout controls work even when storage is unavailable. */ }
    }
    function applySize() {
      logo.style.fontSize = `${size}px`;
      slider.value = String(size);
      output.textContent = `${size}px`;
    }
    function place(x, y) {
      if (!placeholder) {
        const rect = logo.getBoundingClientRect();
        const style = getComputedStyle(logo);
        placeholder = document.createElement('div');
        placeholder.setAttribute('aria-hidden', 'true');
        placeholder.style.height = `${rect.height}px`;
        placeholder.style.margin = style.margin;
        originalParent.insertBefore(placeholder, logo);
        document.body.appendChild(logo);
        logo.classList.add('home-logo-positioned');
      }
      const rect = logo.getBoundingClientRect();
      position = {
        x: Math.max(0, Math.min(x, Math.max(0, innerWidth - rect.width))),
        y: Math.max(0, Math.min(y, Math.max(0, innerHeight - rect.height)))
      };
      logo.style.left = `${position.x}px`;
      logo.style.top = `${position.y}px`;
    }
    function setMoving(value) {
      moving = value;
      logo.classList.toggle('home-logo-moving', moving);
      moveButton.setAttribute('aria-pressed', String(moving));
      moveButton.textContent = moving ? 'Done moving' : 'Move logo';
      hint.hidden = !moving;
      if (moving) logo.focus();
    }
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      if (Number.isFinite(saved?.size)) size = Math.max(24, Math.min(80, saved.size));
      applySize();
      if (saved?.layoutVersion === 2 && Number.isFinite(saved?.position?.x) && Number.isFinite(saved?.position?.y)) {
        place(saved.position.x, saved.position.y);
      }
    } catch { applySize(); }
    slider.addEventListener('input', () => {
      size = Number(slider.value);
      applySize();
      if (position) place(position.x, position.y);
      save();
    });
    moveButton.addEventListener('click', () => setMoving(!moving));
    logo.addEventListener('click', event => {
      if (moving) event.preventDefault();
    });
    logo.addEventListener('pointerdown', event => {
      if (!moving || event.button !== 0) return;
      event.preventDefault();
      const rect = logo.getBoundingClientRect();
      drag = { id: event.pointerId, x: event.clientX - rect.left, y: event.clientY - rect.top };
      place(rect.left, rect.top);
      logo.setPointerCapture(event.pointerId);
    });
    logo.addEventListener('pointermove', event => {
      if (drag?.id !== event.pointerId) return;
      place(event.clientX - drag.x, event.clientY - drag.y);
    });
    function finishDrag(event) {
      if (drag?.id !== event.pointerId) return;
      drag = null;
      save();
    }
    logo.addEventListener('pointerup', finishDrag);
    logo.addEventListener('pointercancel', finishDrag);
    logo.addEventListener('keydown', event => {
      if (!moving) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        setMoving(false);
        moveButton.focus();
        return;
      }
      const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
      const direction = directions[event.key];
      if (!direction) return;
      event.preventDefault();
      const rect = logo.getBoundingClientRect();
      const step = event.shiftKey ? 10 : 1;
      place(rect.left + direction[0] * step, rect.top + direction[1] * step);
      save();
    });
    resetButton.addEventListener('click', () => {
      setMoving(false);
      if (placeholder) {
        originalParent.insertBefore(logo, placeholder);
        placeholder.remove();
        placeholder = null;
      } else if (logo.parentNode !== originalParent) {
        originalParent.insertBefore(logo, originalNext);
      }
      logo.classList.remove('home-logo-positioned');
      logo.style.removeProperty('font-size');
      logo.style.removeProperty('left');
      logo.style.removeProperty('top');
      size = defaultSize;
      position = null;
      slider.value = String(size);
      output.textContent = `${size}px`;
      try { localStorage.removeItem(key); } catch { /* Reset still applies locally. */ }
    });
    window.addEventListener('resize', () => {
      if (position) { place(position.x, position.y); save(); }
    });
    document.fonts?.ready.then(() => {
      if (position) place(position.x, position.y);
    });
  }
  initLogoControls();

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const dateLabel = value => new Intl.DateTimeFormat('en-CA', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${value}T12:00:00Z`));
  const timeLabel = value => {
    const [hour, minute] = value.split(':').map(Number);
    return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
  };
  const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;
  const requestStatuses = { submitted: 'Submitted', 'in-progress': 'In progress', completed: 'Completed', cancelled: 'Cancelled' };

  function homeRequests() {
    if (!account?.id || !account.suite) throw new Error('Resident account unavailable.');
    const raw = localStorage.getItem('mysuite-resident-maintenance-v1');
    const saved = raw === null ? [] : JSON.parse(raw);
    if (!Array.isArray(saved)) throw new Error('Request data unavailable.');
    const owned = [...residentMaintenanceExamples(account), ...saved].filter(row => row && row.residentId === account.id && row.suite === account.suite);
    return [...new Map(owned.map(row => [row.id, row])).values()]
      .map(row => row.status === 'scheduled' ? { ...row, status: 'in-progress' } : row)
      .filter(row => Object.hasOwn(requestStatuses, row.status) && Number.isFinite(Date.parse(row.createdAt)))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  function homeReservations() {
    const now = amenityNowParts();
    const amenities = [...myAmenityBookings(), ...demoAmenityActiveBookings()]
      .filter(row => Object.hasOwn(BOOKABLE_AMENITIES, row.amenity) && amenityBookingIsUpcoming(row, now))
      .map(row => ({ ...row, kind: 'amenity', name: BOOKABLE_AMENITIES[row.amenity].name, icon: BOOKABLE_AMENITIES[row.amenity].icon, href: 'amenities.html?tab=active' }));
    const elevators = getBookingsForSuite(account?.suite || '')
      .filter(row => `${row.date}T${row.endTime}` > `${now.date}T${now.time}`)
      .map(row => ({ ...row, kind: 'elevator', name: 'Service elevator', icon: 'elevator', href: 'elevator-booking.html?tab=open' }));
    return [...amenities, ...elevators].sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`));
  }

  function renderReservations(rows) {
    document.querySelector('#home-bookings-count').textContent = `${rows.length} upcoming`;
    document.querySelector('#home-reservations-empty').hidden = rows.length > 0;
    const now = amenityNowParts();
    document.querySelector('#home-reservations-list').innerHTML = rows.slice(0, 3).map(row => {
      const dates = row.bookingType === 'daily' ? `${dateLabel(row.date)} – ${dateLabel(row.endDate)}` : dateLabel(row.date);
      const time = row.bookingType === 'daily' ? 'Daily reservation' : `${timeLabel(row.startTime)}–${timeLabel(row.endTime)}`;
      const status = `${row.date}T${row.startTime}` <= `${now.date}T${now.time}` ? 'In progress' : 'Reserved';
      return `<a class="home-reservation-row" href="${row.href}"><span class="home-row-icon"><i data-icon="${row.icon}"></i></span><span class="home-row-copy"><strong>${escapeHtml(row.name)}</strong><span>${escapeHtml(dates)}</span><small>${escapeHtml(time)}</small></span><span class="home-state is-reserved">${status}</span><i data-icon="chevron"></i></a>`;
    }).join('');
  }

  function renderRequests(rows) {
    const open = rows.filter(row => !['completed', 'cancelled'].includes(row.status));
    document.querySelector('#home-requests-count').textContent = `${open.length} open`;
    document.querySelector('#home-requests-note').textContent = open.length ? `${plural(open.filter(row => row.status === 'in-progress').length, 'request')} in progress` : 'Your repairs are up to date';
    document.querySelector('#home-requests-empty').hidden = rows.length > 0;
    document.querySelector('#home-requests-list').innerHTML = rows.slice(0, 3).map(row => {
      const tab = ['completed', 'cancelled'].includes(row.status) ? 'past' : 'open';
      const created = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Edmonton', month: 'short', day: 'numeric' }).format(new Date(row.createdAt));
      return `<a class="home-request-row" href="maintenance.html?tab=${tab}"><span class="home-row-icon"><i data-icon="wrench"></i></span><span class="home-row-copy"><strong>${escapeHtml(row.title)}</strong><small>${escapeHtml(row.reference)} · ${escapeHtml(row.category)} · ${escapeHtml(created)}</small></span><span class="home-state is-${row.status}">${requestStatuses[row.status]}</span><span class="home-row-link">View details<i data-icon="chevron"></i></span></a>`;
    }).join('');
  }

  function renderAnnouncements(rows) {
    document.querySelector('#home-announcements-count').textContent = plural(rows.length, 'announcement');
    document.querySelector('#home-announcements-empty').hidden = rows.length > 0;
    document.querySelector('#home-announcements-list').innerHTML = rows.slice(0, 3).map(row => `<button type="button" class="home-announcement-row" data-home-announcement="${escapeHtml(row.id)}"><span class="home-row-icon"><i data-icon="${['pool', 'building', 'users', 'megaphone'].includes(row.icon) ? row.icon : 'megaphone'}"></i></span><span class="home-row-copy"><strong>${escapeHtml(row.title)}</strong><span class="home-announcement-summary">${escapeHtml(row.summary || row.body)}</span><small>${escapeHtml(row.category)} · ${escapeHtml(formatAnnouncementWhen(row.postedAt))}</small></span><i data-icon="chevron"></i></button>`).join('');
  }

  function refreshHome() {
    const failed = [];
    for (const [name, read, render, countId, listId, emptyId] of [
      ['reservations', homeReservations, renderReservations, '#home-bookings-count', '#home-reservations-list', '#home-reservations-empty'],
      ['requests', homeRequests, renderRequests, '#home-requests-count', '#home-requests-list', '#home-requests-empty'],
      ['announcements', () => sortAnnouncementsNewestFirst(getAnnouncements()), renderAnnouncements, '#home-announcements-count', '#home-announcements-list', '#home-announcements-empty']
    ]) {
      try { render(read()); }
      catch {
        failed.push(name);
        document.querySelector(countId).textContent = 'Unavailable';
        document.querySelector(listId).innerHTML = `<p class="home-empty">Could not load ${name}. Please refresh and try again.</p>`;
        document.querySelector(emptyId).hidden = true;
      }
    }
    const error = document.querySelector('#home-data-error');
    error.hidden = !failed.length;
    error.textContent = failed.length ? `Some information could not be loaded: ${failed.join(', ')}. Please refresh and try again.` : '';
    renderIcons(document.querySelector('.home-main'));
  }

  function openExtra(id, scroll = true) {
    if (!['calendar', 'shop'].includes(id)) return;
    document.querySelector('#home-extras').open = true;
    if (scroll) document.getElementById(id).scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }

  document.addEventListener('click', event => {
    const extra = event.target.closest('[data-home-extra]');
    if (extra) {
      event.preventDefault();
      openExtra(extra.dataset.homeExtra);
      history.replaceState(null, '', `#${extra.dataset.homeExtra}`);
      return;
    }
    const announcement = event.target.closest('[data-home-announcement]');
    if (announcement) {
      try {
        const item = findAnnouncementById(announcement.dataset.homeAnnouncement);
        if (!item) throw new Error();
        openModal(item.title, announcementDetailHtml(item));
      } catch { toast('This announcement could not be opened. Please try again.'); }
    }
  });
  window.addEventListener('storage', refreshHome);
  window.addEventListener('focus', refreshHome);
  window.addEventListener('hashchange', () => openExtra(location.hash.slice(1)));
  openExtra(location.hash.slice(1), false);
  refreshHome();
})();
