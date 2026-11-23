/* Concierge amenity reservations. Uses the shared resident availability records. */
(function () {
  renderIcons();
  applyLoggedInUser('concierge');
  const form = document.querySelector('#amenity-booking-form');
  const fields = form.elements;
  const amenityChoices = [...form.querySelectorAll('input[name="amenities"]')];
  const selectedAmenities = () => amenityChoices.filter(choice => choice.checked).map(choice => choice.value);
  const cardChoices = [...document.querySelectorAll('[data-amenity-card-choice]')];
  const selectedCardAmenities = () => cardChoices.filter(choice => choice.checked).map(choice => choice.value);
  const formError = document.querySelector('#amenity-form-error');
  const pageError = document.querySelector('#amenity-page-error');
  const rowMenu = document.querySelector('#amenity-row-menu');
  const tabs = [...document.querySelectorAll('[data-amenity-main-tab]')];
  const progressBar = document.querySelector('#amenity-progress');
  const progressItems = [...document.querySelectorAll('[data-progress-stage]')];
  const pageSize = 5;
  const queries = { upcoming: '', history: '' };
  const filters = { upcoming: 'all', history: 'all' };
  let activeTab = 'upcoming';
  let page = 1;
  let saving = false;
  let cancelling = false;
  let menuTrigger = null;
  let activeView = 'spaces';
  let bookingStage = 'spaces';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const spaceName = id => id === 'common-area' ? 'Common Area' : BOOKABLE_AMENITIES[id]?.name || 'Amenity';
  const dateLabel = date => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));
  const timeLabel = value => {
    const [hour, minute] = value.split(':').map(Number);
    return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour >= 12 ? 'p.m.' : 'a.m.'}`;
  };
  const residentName = row => row.residentName || findAccountById(row.residentId)?.name || conciergeAmenityResident(row.suite)?.name || 'Unknown resident';
  const hasPrice = id => Number.isFinite(BOOKABLE_AMENITIES[id]?.feeCents) && BOOKABLE_AMENITIES[id].feeCents >= 0;
  const priceLabel = id => hasPrice(id) ? BOOKABLE_AMENITIES[id].feeCents === 0 ? 'Free' : `${formatAmenityPrice(BOOKABLE_AMENITIES[id].feeCents)} per booking` : 'Price not set';

  function renderBookingPrices() {
    const summary = document.querySelector('#amenity-price-summary');
    const selected = selectedAmenities();
    summary.hidden = selected.length === 0;
    if (!selected.length) { summary.innerHTML = ''; return; }
    const priced = selected.filter(hasPrice);
    const total = priced.reduce((sum, id) => sum + BOOKABLE_AMENITIES[id].feeCents, 0);
    const missing = priced.length !== selected.length;
    const totalLabel = missing && priced.length ? 'Priced subtotal' : 'Total';
    const totalValue = missing && !priced.length ? 'Price not set' : formatAmenityPrice(total);
    summary.innerHTML = '<h3>Booking Summary</h3>' + selected.map(id => `<div class="amenity-price-line"><span>${escape(spaceName(id))}</span><span>${escape(hasPrice(id) ? formatAmenityPrice(BOOKABLE_AMENITIES[id].feeCents) : 'Price not set')}</span></div>`).join('') + `<div class="amenity-price-line amenity-price-total"><span>${totalLabel}</span><span>${escape(totalValue)}</span></div>` + (missing ? '<p class="amenity-price-note">Pricing is not set for one or more selected amenities.</p>' : '');
  }

  function syncCardSelections() {
    cardChoices.forEach(choice => {
      choice.closest('.amenity-space').classList.toggle('is-selected', choice.checked);
      choice.closest('.amenity-space').querySelector('[data-amenity-card-price]').textContent = priceLabel(choice.value);
      choice.closest('label').querySelector('span').textContent = choice.checked ? 'Selected' : 'Select';
    });
    const count = selectedCardAmenities().length;
    const trigger = document.querySelector('.amenity-header-actions [data-action="book-amenity"]');
    trigger.innerHTML = `<span aria-hidden="true">+</span> ${count ? `Book Selected (${count})` : 'Book Amenity'}`;
  }
  cardChoices.forEach(choice => choice.addEventListener('change', syncCardSelections));
  cardChoices.forEach(choice => {
    choice.closest('.amenity-space').addEventListener('click', event => {
      if (event.target.closest('label, input, button, a, select, textarea')) return;
      choice.checked = !choice.checked;
      syncCardSelections();
    });
  });

  function closeSidebar() {
    document.querySelector('.sidebar').classList.remove('open');
    document.querySelector('.scrim').classList.remove('visible');
    document.querySelector('.mobile-toggle').setAttribute('aria-expanded', 'false');
  }

  function closeRowMenu(restoreFocus = false) {
    const previous = menuTrigger;
    if (previous) previous.setAttribute('aria-expanded', 'false');
    rowMenu.hidden = true;
    menuTrigger = null;
    if (restoreFocus && previous?.isConnected) previous.focus();
  }

  function renderUpcomingPreview(bookings, errorMessage = '') {
    const preview = document.querySelector('#amenity-upcoming-preview');
    if (!preview) return;
    const ordered = [...bookings].sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`));
    const now = amenityNowParts();
    const tomorrow = new Date(`${now.date}T12:00:00Z`);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    const tomorrowDate = tomorrow.toISOString().slice(0, 10);
    const when = row => {
      const day = row.date === now.date ? 'Today' : row.date === tomorrowDate ? 'Tomorrow' : new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', ...(row.date.slice(0, 4) !== now.date.slice(0, 4) ? { year: 'numeric' } : {}), timeZone: 'UTC' }).format(new Date(`${row.date}T12:00:00Z`));
      const compactTime = value => `${Number(value.slice(0, 2)) % 12 || 12}${value.slice(3) === '00' ? '' : `:${value.slice(3)}`}`;
      const startPeriod = Number(row.startTime.slice(0, 2)) < 12 ? 'a.m.' : 'p.m.';
      const endPeriod = Number(row.endTime.slice(0, 2)) < 12 ? 'a.m.' : 'p.m.';
      return `${day}, ${compactTime(row.startTime)}${startPeriod === endPeriod ? '' : ` ${startPeriod}`}–${compactTime(row.endTime)} ${endPeriod}`;
    };
    const renderRow = row => `<div class="amenity-sidebar-row"><i data-icon="${BOOKABLE_AMENITIES[row.amenity]?.icon || 'users'}"></i><div><div class="amenity-sidebar-row-heading"><strong>${spaceName(row.amenity)}</strong><span>Suite ${escape(row.suite)}</span></div><span class="amenity-sidebar-when">${escape(when(row))}</span></div></div>`;
    document.querySelector('#amenity-preview-count').textContent = errorMessage ? '?' : String(ordered.length);
    document.querySelector('#amenity-upcoming-sidebar-list').innerHTML = errorMessage ? '' : ordered.map(renderRow).join('');
    const empty = document.querySelector('#amenity-sidebar-empty');
    empty.hidden = ordered.length > 0 && !errorMessage;
    empty.textContent = errorMessage || 'No upcoming bookings yet.';
    renderIcons(document.querySelector('#amenity-upcoming-preview'));
  }

  function renderTable() {
    closeRowMenu();
    try {
      const now = amenityNowParts();
      const all = conciergeAmenityBookings();
      const upcoming = all.filter(row => amenityBookingIsUpcoming(row, now));
      renderUpcomingPreview(upcoming);
      document.querySelector('#amenity-upcoming-count').textContent = String(upcoming.length);
      const query = queries[activeTab].trim().toLowerCase();
      const rows = all.filter(row => {
        if (amenityBookingIsUpcoming(row, now) !== (activeTab === 'upcoming')) return false;
        if (filters[activeTab] !== 'all' && row.amenity !== filters[activeTab]) return false;
        return [residentName(row), row.suite, spaceName(row.amenity), row.notes || '', row.recordedBy || ''].join(' ').toLowerCase().includes(query);
      }).sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`) * (activeTab === 'upcoming' ? 1 : -1));
      const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
      page = Math.max(1, Math.min(page, pageCount));
      const offset = (page - 1) * pageSize;
      document.querySelector('#amenity-booking-rows').innerHTML = rows.slice(offset, offset + pageSize).map(row => {
        const upcoming = amenityBookingIsUpcoming(row, now);
        const status = row.status === 'cancelled' ? 'Cancelled' : upcoming ? (`${row.date}T${row.startTime}` <= `${now.date}T${now.time}` ? 'In progress' : 'Reserved') : 'Completed';
        const notes = row.notes ? `<details class="amenity-inline-notes"><summary>Notes</summary><p>${escape(row.notes)}</p></details>` : '';
        const action = upcoming ? `<button type="button" class="amenity-menu-toggle" data-booking-menu="${escape(row.id)}" aria-label="Booking actions for Suite ${escape(row.suite)}" aria-haspopup="menu" aria-controls="amenity-row-menu" aria-expanded="false">&#8942;</button>` : '';
        return `<tr><td><strong class="amenity-primary">${escape(residentName(row))}</strong><span class="amenity-secondary">Suite ${escape(row.suite)}</span></td><td>${spaceName(row.amenity)}${notes}</td><td>${escape(dateLabel(row.date))}<span class="amenity-secondary">${timeLabel(row.startTime)}–${timeLabel(row.endTime)}</span></td><td>${escape(row.recordedBy || residentName(row))}</td><td>${status}</td><td>${action}</td></tr>`;
      }).join('');
      const empty = document.querySelector('#amenity-empty');
      empty.hidden = rows.length > 0;
      empty.querySelector('h2').textContent = query || filters[activeTab] !== 'all' ? 'No matching bookings' : activeTab === 'upcoming' ? 'No upcoming bookings' : 'No booking history yet';
      empty.querySelector('p').textContent = query || filters[activeTab] !== 'all' ? 'Try another search or amenity filter.' : activeTab === 'upcoming' ? 'Choose Book Amenity to make a reservation.' : 'Finished and cancelled reservations will appear here.';
      document.querySelector('#amenity-range').textContent = pageCount === 1 ? `${rows.length} ${rows.length === 1 ? 'booking' : 'bookings'}` : `Showing ${offset + 1}–${Math.min(offset + pageSize, rows.length)} of ${rows.length}`;
      document.querySelector('#amenity-pagination').hidden = pageCount === 1;
      document.querySelector('#amenity-page').innerHTML = Array.from({ length: pageCount }, (_, index) => `<option value="${index + 1}"${page === index + 1 ? ' selected' : ''}>Page ${index + 1} of ${pageCount}</option>`).join('');
      document.querySelector('#amenity-previous').disabled = page === 1;
      document.querySelector('#amenity-next').disabled = page === pageCount;
      pageError.hidden = true;
    } catch (error) {
      renderUpcomingPreview([], error.message);
      document.querySelector('#amenity-booking-rows').innerHTML = '';
      document.querySelector('#amenity-empty').hidden = true;
      document.querySelector('#amenity-pagination').hidden = true;
      document.querySelector('#amenity-range').textContent = '';
      pageError.textContent = error.message;
      pageError.hidden = false;
    }
  }

  function renderSelectedSpacePills() {
    const inlineChoices = document.querySelector('.amenity-inline-choices');
    inlineChoices.classList.toggle('is-visible', selectedAmenities().length === 0);
  }

  function setBookingStage(stage) {
    bookingStage = stage;
    progressBar.dataset.stage = stage;
    const stages = ['spaces', 'schedule', 'confirmed'];
    const currentIndex = stages.indexOf(stage);
    progressItems.forEach((item, index) => {
      const isActive = index === currentIndex;
      const isComplete = index < currentIndex;
      item.classList.toggle('is-active', isActive);
      item.classList.toggle('is-complete', isComplete);
      if (isActive) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    });
    const isBookingsView = activeView === 'bookings';
    progressBar.hidden = isBookingsView;
    document.querySelector('#amenity-spaces-view').hidden = isBookingsView || stage !== 'spaces';
    document.querySelector('#amenity-booking-view').hidden = isBookingsView || stage !== 'schedule';
    document.querySelector('#amenity-confirmed-view').hidden = isBookingsView || stage !== 'confirmed';
    const bookTrigger = document.querySelector('.amenity-header-actions [data-action="book-amenity"]');
    bookTrigger.hidden = isBookingsView || stage !== 'spaces';
    if (!isBookingsView) {
      document.querySelector('.amenities-header h1').textContent = 'Amenities';
      document.querySelector('.amenities-header p').textContent = stage === 'spaces'
        ? 'Select one or more spaces to book together.'
        : stage === 'schedule'
          ? 'Choose the date, time, and resident for this reservation.'
          : 'Your reservation has been saved.';
    }
  }

  function syncMainTabs() {
    const current = activeView === 'spaces' ? 'create' : activeTab;
    tabs.forEach(button => {
      const selected = button.dataset.amenityMainTab === current;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
  }

  function setView(view) {
    activeView = view;
    const bookings = view === 'bookings';
    closeRowMenu();
    document.querySelector('#amenity-reservations-view').hidden = !bookings;
    syncMainTabs();
    if (bookings) {
      progressBar.hidden = true;
      document.querySelector('#amenity-spaces-view').hidden = true;
      document.querySelector('#amenity-booking-view').hidden = true;
      document.querySelector('#amenity-confirmed-view').hidden = true;
      document.querySelector('.amenity-header-actions [data-action="book-amenity"]').hidden = false;
      document.querySelector('#amenity-reservations-view').setAttribute('aria-labelledby', `amenity-main-tab-${activeTab}`);
      document.querySelector('.amenities-header h1').textContent = 'Amenities';
      document.querySelector('.amenities-header p').textContent = activeTab === 'upcoming'
        ? 'Review active amenity reservations.'
        : 'Review finished and cancelled amenity bookings.';
    } else {
      setBookingStage(bookingStage);
    }
    renderTable();
  }

  function setTab(tab) {
    activeTab = tab;
    page = 1;
    syncMainTabs();
    document.querySelector('#amenity-reservations-view').setAttribute('aria-labelledby', `amenity-main-tab-${tab}`);
    document.querySelector('#amenity-search').value = queries[tab];
    document.querySelector('#amenity-filter').value = filters[tab];
    renderTable();
  }

  const slotLabel = value => {
    const [hour, minute] = value.split(':').map(Number);
    return `${String(hour % 12 || 12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  function isSlotRangeBooked(amenityIds, date, startTime, endTime) {
    if (!amenityIds.length || !date) return false;
    const rows = getAmenityBookings();
    return amenityIds.some(amenity => rows.some(row => amenityBookingsOverlap({ amenity, date, startTime, endTime }, row)));
  }

  function renderEndTimeOptions() {
    const startSelect = fields.namedItem('startTime');
    const endSelect = fields.namedItem('endTime');
    const date = fields.namedItem('date').value;
    const amenities = selectedAmenities();
    const startValue = startSelect.value;
    const previousEnd = endSelect.value;
    if (!startValue) {
      endSelect.innerHTML = '<option value="" disabled selected>Select start time first</option>';
      return;
    }
    const startMin = amenityMinuteOfDay(startValue);
    const maxMin = Math.min(amenityMinuteOfDay(AMENITY_BOOKING_HOURS.end), startMin + 480);
    const options = [];
    for (let min = startMin + 30; min <= maxMin; min += 30) {
      const val = amenityTimeOfDay(min);
      const unavailable = isSlotRangeBooked(amenities, date, startValue, val);
      options.push(`<option value="${val}"${unavailable ? ' disabled' : ''}>${slotLabel(val)}${unavailable ? ' (Unavailable)' : ''}</option>`);
    }
    endSelect.innerHTML = options.join('');
    const validPrev = [...endSelect.options].find(opt => opt.value === previousEnd && !opt.disabled);
    const firstOpen = [...endSelect.options].find(opt => !opt.disabled);
    if (validPrev) endSelect.value = validPrev.value;
    else if (firstOpen) endSelect.value = firstOpen.value;
  }

  function renderTimeOptions() {
    const startSelect = fields.namedItem('startTime');
    const date = fields.namedItem('date').value;
    const amenities = selectedAmenities();
    const previousStart = startSelect.value;
    const minStart = amenityMinuteOfDay(AMENITY_BOOKING_HOURS.start);
    const maxStart = amenityMinuteOfDay(AMENITY_BOOKING_HOURS.end) - 30;
    const options = [];
    for (let min = minStart; min <= maxStart; min += 30) {
      const val = amenityTimeOfDay(min);
      const nextVal = amenityTimeOfDay(min + 30);
      const unavailable = isSlotRangeBooked(amenities, date, val, nextVal);
      options.push(`<option value="${val}"${unavailable ? ' disabled' : ''}>${slotLabel(val)}${unavailable ? ' (Unavailable)' : ''}</option>`);
    }
    startSelect.innerHTML = options.join('');
    const validPrev = [...startSelect.options].find(opt => opt.value === previousStart && !opt.disabled);
    const firstOpen = [...startSelect.options].find(opt => !opt.disabled);
    if (validPrev) startSelect.value = validPrev.value;
    else if (firstOpen) startSelect.value = firstOpen.value;
    renderEndTimeOptions();
  }

  function renderReservedTimes() {
    const hint = document.querySelector('#amenity-reserved-times');
    const amenities = selectedAmenities();
    const date = fields.namedItem('date').value;
    if (!amenities.length || !date) { hint.hidden = true; return; }
    try {
      const all = getAmenityBookings();
      hint.textContent = amenities.map(amenity => {
        const reserved = all.filter(row => row.status === 'confirmed' && row.amenity === amenity && row.date === date).sort((a, b) => a.startTime.localeCompare(b.startTime));
        return `${spaceName(amenity)}: ${reserved.length ? `already reserved ${reserved.map(row => `${timeLabel(row.startTime)} to ${timeLabel(row.endTime)}`).join(', ')}` : 'no reservations on this date.'}`;
      }).join('\n');
      hint.hidden = false;
    } catch (error) { hint.textContent = error.message; hint.hidden = false; }
  }

  function openBooking(amenities = []) {
    closeRowMenu();
    form.reset();
    formError.hidden = true;
    const selection = Array.isArray(amenities) ? amenities : [amenities];
    amenityChoices.forEach(choice => { choice.checked = selection.includes(choice.value); });
    const today = amenityNowParts().date;
    fields.namedItem('date').min = today;
    fields.namedItem('date').value = today;
    renderSelectedSpacePills();
    renderBookingPrices();
    renderTimeOptions();
    renderReservedTimes();
    activeView = 'spaces';
    setView('spaces');
    setBookingStage('schedule');
    fields.namedItem('date').focus();
  }

  form.addEventListener('input', event => {
    formError.hidden = true;
    if (event.target.name === 'suite') fields.namedItem('residentName').value = conciergeAmenityResident(event.target.value)?.name || '';
  });
  form.addEventListener('change', event => {
    if (event.target.name === 'amenities') {
      const selected = selectedAmenities();
      cardChoices.forEach(choice => { choice.checked = selected.includes(choice.value); });
      syncCardSelections();
      renderSelectedSpacePills();
      renderBookingPrices();
    }
    if (['amenities', 'date'].includes(event.target.name)) {
      renderTimeOptions();
      renderReservedTimes();
    }
    if (event.target.name === 'startTime') renderEndTimeOptions();
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (saving || !form.reportValidity()) return;
    if (!selectedAmenities().length) {
      formError.textContent = 'Choose at least one amenity.';
      formError.hidden = false;
      amenityChoices[0].focus();
      return;
    }
    saving = true;
    document.querySelector('#amenity-save').disabled = true;
    try {
      const values = Object.fromEntries(new FormData(form));
      values.amenities = selectedAmenities();
      const bookings = await withConciergeAmenityLock(() => createConciergeAmenityBookings(values));
      const bookedLabel = new Intl.ListFormat('en-CA', { style: 'long', type: 'conjunction' }).format(bookings.map(booking => spaceName(booking.amenity)));
      document.querySelector('#amenity-confirmed-summary').textContent = `${bookedLabel} booked for Suite ${bookings[0].suite} on ${dateLabel(bookings[0].date)} from ${timeLabel(bookings[0].startTime)} to ${timeLabel(bookings[0].endTime)}.`;
      cardChoices.forEach(choice => { choice.checked = false; });
      syncCardSelections();
      queries.upcoming = '';
      filters.upcoming = 'all';
      setTab('upcoming');
      setBookingStage('confirmed');
      renderTable();
      toast(`${bookedLabel} booked for Suite ${bookings[0].suite}.`);
    } catch (error) {
      formError.textContent = error.message;
      formError.hidden = false;
      formError.focus();
      renderReservedTimes();
    } finally { saving = false; document.querySelector('#amenity-save').disabled = false; }
  });

  document.querySelector('#amenity-search').addEventListener('input', event => { queries[activeTab] = event.target.value; page = 1; renderTable(); });
  document.querySelector('#amenity-filter').addEventListener('change', event => { filters[activeTab] = event.target.value; page = 1; renderTable(); });
  document.querySelector('#amenity-page').addEventListener('change', event => { page = Number(event.target.value); renderTable(); });
  document.querySelector('#amenity-previous').addEventListener('click', () => { page--; renderTable(); });
  document.querySelector('#amenity-next').addEventListener('click', () => { page++; renderTable(); });
  tabs.forEach(button => {
    button.addEventListener('click', () => {
      const target = button.dataset.amenityMainTab;
      if (target === 'create') { setView('spaces'); return; }
      setTab(target);
      setView('bookings');
    });
    button.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const index = tabs.indexOf(button);
      const next = event.key === 'Home' ? tabs[0]
        : event.key === 'End' ? tabs[tabs.length - 1]
          : event.key === 'ArrowLeft' ? tabs[(index - 1 + tabs.length) % tabs.length]
            : tabs[(index + 1) % tabs.length];
      next.click(); next.focus();
    });
  });

  document.addEventListener('click', async event => {
    const toggle = event.target.closest('[data-booking-menu]');
    if (toggle) {
      const wasOpen = menuTrigger === toggle;
      closeRowMenu();
      if (wasOpen) return;
      menuTrigger = toggle;
      toggle.setAttribute('aria-expanded', 'true');
      rowMenu.querySelector('button').dataset.bookingId = toggle.dataset.bookingMenu;
      rowMenu.hidden = false;
      const rect = toggle.getBoundingClientRect();
      rowMenu.style.left = `${Math.max(8, Math.min(rect.right - rowMenu.offsetWidth, innerWidth - rowMenu.offsetWidth - 8))}px`;
      rowMenu.style.top = `${Math.max(8, rect.bottom + rowMenu.offsetHeight + 5 <= innerHeight - 8 ? rect.bottom + 5 : rect.top - rowMenu.offsetHeight - 5)}px`;
      rowMenu.querySelector('button').focus();
      return;
    }
    if (!rowMenu.contains(event.target)) closeRowMenu();
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    if (action === 'menu') {
      const open = document.querySelector('.sidebar').classList.toggle('open');
      document.querySelector('.scrim').classList.toggle('visible', open);
      document.querySelector('.mobile-toggle').setAttribute('aria-expanded', String(open));
    } else if (action === 'close-menu') closeSidebar();
    else if (action === 'toggle-amenity-view') {
      if (activeView === 'bookings') { bookingStage = 'spaces'; setView('spaces'); }
      else setView('bookings');
    }
    else if (action === 'go-spaces') {
      activeView = 'spaces';
      setBookingStage('spaces');
      setView('spaces');
    }
    else if (action === 'view-upcoming-bookings') {
      queries.upcoming = ''; filters.upcoming = 'all';
      setTab('upcoming'); setView('bookings');
      document.querySelector('#amenity-main-tab-upcoming').focus();
    }
    else if (action === 'book-amenity') openBooking(button.dataset.amenity || selectedCardAmenities());
    else if (action === 'close-modal') modal.close();
    else if (action === 'cancel-amenity') {
      closeRowMenu();
      try {
        const booking = conciergeAmenityBookings().find(row => row.id === button.dataset.bookingId);
        if (!booking || !amenityBookingIsUpcoming(booking)) { renderTable(); toast('This booking is no longer available to cancel.'); return; }
        openModal('Cancel booking', `<p>Cancel the ${spaceName(booking.amenity)} reservation for <strong>Suite ${escape(booking.suite)}</strong> on ${escape(dateLabel(booking.date))}, ${timeLabel(booking.startTime)}–${timeLabel(booking.endTime)}?</p><div class="amenity-form-actions"><button type="button" class="button outline" data-action="close-modal">Keep booking</button><button type="button" class="button" data-action="confirm-amenity-cancel" data-booking-id="${escape(booking.id)}">Cancel booking</button></div>`);
      } catch (error) { toast(error.message); }
    } else if (action === 'confirm-amenity-cancel') {
      if (cancelling) return;
      cancelling = true; button.disabled = true;
      try {
        await withConciergeAmenityLock(() => cancelConciergeAmenityBooking(button.dataset.bookingId));
        modal.close(); renderTable(); toast('Amenity booking cancelled.');
      } catch (error) { toast(error.message); }
      finally { cancelling = false; button.disabled = false; }
    } else if (action === 'help') openModal('Amenities help', '<p>Choose <strong>Book Amenity</strong> or a space’s <strong>Book</strong> button. Enter the resident and booking times; reserved periods are shown in the form.</p><p>Upcoming lists current and future reservations. Use the three-dot menu to cancel a reservation. Finished and cancelled bookings appear in History.</p>');
  });
  document.querySelector('.sidebar nav').addEventListener('click', closeSidebar);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') { closeRowMenu(true); closeSidebar(); } });
  document.addEventListener('focusin', event => { if (menuTrigger && event.target !== menuTrigger && !rowMenu.contains(event.target)) closeRowMenu(); });
  document.addEventListener('scroll', () => closeRowMenu(), true);
  window.addEventListener('resize', () => closeRowMenu());
  window.addEventListener('storage', event => { if (event.key === AMENITY_STORAGE_KEY || event.key === null) { renderTable(); if (bookingStage === 'schedule') renderReservedTimes(); } });
  window.addEventListener('pageshow', renderTable);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) renderTable(); });
  modal.addEventListener('click', event => {
    if (event.target !== modal) return;
    const rect = modal.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) modal.close();
  });
  const lighting = document.querySelector('#header-lighting');
  const lightingOptions = ['morning', 'afternoon', 'evening', 'night'];
  const savedLighting = readSaved('mysuite-header-lighting', 'afternoon');
  lighting.value = lightingOptions.includes(savedLighting) ? savedLighting : 'afternoon';
  document.body.dataset.time = lighting.value;
  lighting.addEventListener('change', () => { document.body.dataset.time = lighting.value; save('mysuite-header-lighting', lighting.value); });
  syncCardSelections();
  renderTable();
})();
