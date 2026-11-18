/* Resident amenities UI. Requires shared utilities, mockdata, and amenities-data. */
(function initAmenities() {
  renderIcons();
  applyLoggedInUser('resident');
  const form = document.querySelector('#amenity-form');
  const fields = form.elements;
  const dateInput = fields.namedItem('date');
  const amenityInput = fields.namedItem('amenity');
  const formError = document.querySelector('#amenity-form-error');
  const pageError = document.querySelector('#amenity-page-error');
  const selectionScreen = document.querySelector('#amenity-selection');
  const bookingScreen = document.querySelector('#amenity-booking-step');
  const reviewScreen = document.querySelector('#amenity-review-step');
  const reviewError = document.querySelector('#amenity-review-error');
  const bookingsError = document.querySelector('#amenity-bookings-error');
  const choices = [...document.querySelectorAll('input[name="amenity-choice"]')];
  const continueButton = document.querySelector('#amenity-continue');
  const pageTitle = document.querySelector('#amenity-page-title');
  const pageNote = document.querySelector('#amenity-page-note');
  let saving = false;
  let pendingReview = null;
  let bookingTab = 'active';
  let activeSection = 'book';
  let currentWizardStep = 1;
  let pastBookingsPage = 1;
  const pastBookingsPageSize = 5;
  let scheduleReady = false;
  let selectedWindow = null;
  let windowContext = '';
  const selectedAmenities = () => choices.filter(choice => choice.checked && Object.hasOwn(BOOKABLE_AMENITIES, choice.value)).map(choice => choice.value);
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
  const formatTime = value => {
    const [hour, minute] = value.split(':').map(Number);
    return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
  };
  const formatDate = date => new Intl.DateTimeFormat('en-CA', {
    timeZone: 'UTC', weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  }).format(new Date(`${date}T12:00:00Z`));
  const formatHistoryDate = date => new Intl.DateTimeFormat('en-CA', {
    timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric'
  }).format(new Date(`${date}T12:00:00Z`));
  const bookingReference = row => {
    const hash = Array.from(String(row.id)).reduce((value, char) => Math.imul(value ^ char.charCodeAt(0), 16777619), 2166136261);
    return `MS-${(hash >>> 0).toString(36).toUpperCase().padStart(7, '0')}`;
  };
  const formatBookedAt = iso => {
    const date = new Date(iso || '');
    return Number.isFinite(date.getTime()) ? new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Edmonton', month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit'
    }).format(date) : '—';
  };

  function renderPricing() {
    const selected = selectedAmenities();
    const pricing = amenityPricing(selected, { checkInDate: fields.namedItem('checkInDate').value, checkOutDate: fields.namedItem('checkOutDate').value });
    document.querySelectorAll('[data-amenity-price]').forEach(label => {
      const config = BOOKABLE_AMENITIES[label.dataset.amenityPrice];
      label.textContent = `${formatAmenityPrice(config.feeCents)} per ${config.rateUnit === 'day' ? 'day' : 'booking'}`;
    });
    document.querySelector('#amenity-booking-price').innerHTML = pricing.items.map(item =>
      `<div><span>${escapeHtml(item.name)}</span><span>${formatAmenityPrice(item.feeCents)}</span></div>`
    ).join('') + `<div class="amenity-price-total"><span>Total</span><span>${formatAmenityPrice(pricing.totalCents)}</span></div>`;
  }

  async function withBookingLock(operation) {
    if (globalThis.navigator?.locks?.request) return navigator.locks.request(AMENITY_STORAGE_KEY, operation);
    return operation();
  }

  function closeMenu() {
    document.querySelector('.sidebar')?.classList.remove('open');
    document.querySelector('.scrim')?.classList.remove('visible');
    document.querySelector('.mobile-toggle')?.setAttribute('aria-expanded', 'false');
  }

  const isDailyAmenity = id => BOOKABLE_AMENITIES[id].bookingType === 'daily';
  const nightsBetween = (start, end) => Math.round((Date.parse(`${end}T12:00:00Z`) - Date.parse(`${start}T12:00:00Z`)) / 86400000);
  const scheduleDates = row => row.bookingType === 'daily' ? `${formatHistoryDate(row.date)} – ${formatHistoryDate(row.endDate)}` : formatHistoryDate(row.date);
  const scheduleTime = row => row.bookingType === 'daily' ? `${nightsBetween(row.date, row.endDate)} ${BOOKABLE_AMENITIES[row.amenity].rateUnit === 'day' ? nightsBetween(row.date, row.endDate) === 1 ? 'day' : 'days' : nightsBetween(row.date, row.endDate) === 1 ? 'night' : 'nights'}` : `${formatTime(row.startTime)} – ${formatTime(row.endTime)}`;

  function spacePhoto(id) {
    return choices.find(choice => choice.value === id)?.closest('label').querySelector('img')?.getAttribute('src') || '';
  }

  function windowTimeOptions(start, end) {
    const values = new Set([start, end]);
    for (let minute = Math.ceil(amenityMinuteOfDay(start) / 15) * 15; minute <= amenityMinuteOfDay(end); minute += 15) values.add(amenityTimeOfDay(minute));
    return [...values].sort();
  }

  const compactWindowTime = time => formatTime(time).replace(':00', '');

  function renderTimedWindows(timed) {
    const context = `${dateInput.value}|${timed.join(',')}`;
    const startField = fields.namedItem('startTime'), endField = fields.namedItem('endTime');
    if (context !== windowContext) {
      if (!windowContext.startsWith(`${dateInput.value}|`)) {
        selectedWindow = null;
        startField.value = '';
        endField.value = '';
      }
      windowContext = context;
    }
    const windows = timed.length ? availableAmenityWindows(timed, dateInput.value) : [];
    const hasReservations = Boolean(timed.length && dateInput.value && amenityReservedPeriods(timed, dateInput.value).length);
    document.querySelector('.amenity-window-picker').hidden = windows.length === 1 && !hasReservations;
    if (selectedWindow) {
      selectedWindow = windows.find(window => window.start === selectedWindow.start && window.end === selectedWindow.end)
        || windows.find(window => window.start <= (startField.value || selectedWindow.start) && window.end >= (endField.value || selectedWindow.end)) || null;
    }
    if (windows.length === 1) selectedWindow = windows[0];
    document.querySelector('#amenity-window-context').textContent = dateInput.value ? `${formatHistoryDate(dateInput.value)} · ${timed.map(id => BOOKABLE_AMENITIES[id].name).join(' + ')}` : 'Choose a date';
    document.querySelector('#amenity-available-windows').innerHTML = windows.length ? windows.map(window => windows.length === 1 ? `<span class="amenity-window-single">&#10003; ${compactWindowTime(window.start)}–${compactWindowTime(window.end)}</span>` : `<button type="button" data-action="select-amenity-window" data-window-start="${window.start}" data-window-end="${window.end}" aria-pressed="${Boolean(selectedWindow && selectedWindow.start === window.start && selectedWindow.end === window.end)}">${compactWindowTime(window.start)}–${compactWindowTime(window.end)}</button>`).join('') : (dateInput.value ? '<p>No shared availability for this date. Choose another date or go back to change your spaces.</p>' : '<p>Choose a date to see availability.</p>');
    const setOptions = (field, times, placeholder) => {
      const value = field.value;
      field.innerHTML = `<option value="">${placeholder}</option>` + times.map(time => `<option value="${time}">${formatTime(time)}</option>`).join('');
      field.value = times.includes(value) ? value : '';
      field.disabled = !times.length;
    };
    const starts = selectedWindow ? windowTimeOptions(selectedWindow.start, selectedWindow.end).filter(time => time < selectedWindow.end) : [];
    setOptions(startField, starts, selectedWindow ? 'Choose start time' : 'Choose a window first');
    const endLimit = startField.value && selectedWindow ? amenityTimeOfDay(Math.min(amenityMinuteOfDay(selectedWindow.end), amenityMinuteOfDay(startField.value) + 480)) : '';
    const ends = endLimit ? windowTimeOptions(startField.value, endLimit).filter(time => time > startField.value) : [];
    setOptions(endField, ends, 'Choose end time');
  }

  function spaceAvailability(id, values, complete) {
    if (!complete) return { status: isDailyAmenity(id) ? 'Choose dates' : 'Choose date and time', state: 'is-pending', hint: isDailyAmenity(id) ? 'Choose check-in and check-out dates.' : 'Uses the shared date and time.' };
    try {
      validateAmenityBooking({ ...values, amenity: id });
      return { status: 'Available', state: 'is-available', hint: isDailyAmenity(id) ? '' : 'Uses the shared date and time.' };
    } catch (error) {
      return { status: 'Unavailable', state: 'is-unavailable', hint: error.message };
    }
  }

  function renderAvailability() {
    const selected = selectedAmenities();
    const daily = selected.filter(isDailyAmenity);
    const timed = selected.filter(id => !isDailyAmenity(id));
    document.querySelector('#amenity-daily-rental').hidden = !daily.length;
    document.querySelector('#amenity-reservation').hidden = !timed.length;
    ['checkInDate', 'checkOutDate'].forEach(name => { fields.namedItem(name).disabled = !daily.length; fields.namedItem(name).required = Boolean(daily.length); });
    ['date', 'startTime', 'endTime'].forEach(name => { fields.namedItem(name).disabled = !timed.length; fields.namedItem(name).required = Boolean(timed.length); });
    renderTimedWindows(timed);
    const values = Object.fromEntries(new FormData(form));
    fields.namedItem('checkOutDate').min = values.checkInDate ? new Date(Date.parse(`${values.checkInDate}T12:00:00Z`) + 86400000).toISOString().slice(0, 10) : amenityNowParts().date;
    const dailyComplete = Boolean(values.checkInDate && values.checkOutDate);
    const timedComplete = Boolean(values.date && values.startTime && values.endTime);
    const states = selected.map(id => ({ id, ...spaceAvailability(id, values, isDailyAmenity(id) ? dailyComplete : timedComplete) }));
    scheduleReady = Boolean(selected.length) && (!timed.length || Boolean(selectedWindow)) && states.every(state => state.state === 'is-available');
    const dailyStates = states.filter(state => isDailyAmenity(state.id));
    document.querySelector('#amenity-daily-space').innerHTML = dailyStates.map(state => {
      const item = amenityPricing([state.id], values).items[0];
      return `<div class="amenity-daily-item"><img src="${escapeHtml(spacePhoto(state.id))}" alt=""><div><h2>${escapeHtml(item.name)}</h2><p class="amenity-daily-rate">${formatAmenityPrice(item.unitFeeCents)} per ${item.rateUnit}</p><span class="amenity-schedule-status ${state.state}"${state.state === 'is-pending' ? ' hidden' : ''}>${state.state === 'is-available' ? '&#10003; ' : ''}${state.status}</span>${item.rateUnit === 'day' && dailyComplete && state.state === 'is-available' ? `<p class="amenity-daily-rate">${item.quantity} ${item.quantity === 1 ? 'day' : 'days'}: ${formatAmenityPrice(item.feeCents)}</p>` : ''}</div></div>`;
    }).join('');
    const dailyError = document.querySelector('#amenity-daily-error');
    const blockedRentals = dailyStates.filter(state => state.state === 'is-unavailable');
    dailyError.hidden = !blockedRentals.length;
    dailyError.textContent = blockedRentals.map(state => `${BOOKABLE_AMENITIES[state.id].name}: ${state.hint}`).join(' ');
    renderPricing();
    const minutes = time => time ? Number(time.slice(0, 2)) * 60 + Number(time.slice(3)) : NaN;
    const duration = minutes(values.endTime) - minutes(values.startTime);
    document.querySelector('#amenity-duration').textContent = duration > 0 ? `${Math.floor(duration / 60) ? `${Math.floor(duration / 60)} ${duration >= 120 ? 'hours' : 'hour'}` : ''}${duration % 60 ? ` ${duration % 60} min` : ''}`.trim() : 'Choose a time';
    document.querySelector('#amenity-availability').innerHTML = states.filter(state => !isDailyAmenity(state.id)).map(state => `<article class="amenity-schedule-space"><img src="${escapeHtml(spacePhoto(state.id))}" alt=""><div class="amenity-schedule-space-copy"><strong>${escapeHtml(BOOKABLE_AMENITIES[state.id].name)}</strong><p>${escapeHtml(state.hint)}</p></div><span class="amenity-schedule-status ${state.state}"${state.state === 'is-pending' ? ' hidden' : ''}>${state.state === 'is-available' ? '&#10003; ' : state.state === 'is-unavailable' ? '&#10005; ' : ''}${state.status}</span></article>`).join('');
    const blocked = states.filter(state => !isDailyAmenity(state.id) && state.state === 'is-unavailable');
    const warning = document.querySelector('#amenity-schedule-error');
    warning.hidden = !blocked.length;
    warning.textContent = blocked.length ? `${blocked.map(state => BOOKABLE_AMENITIES[state.id].name).join(', ')} ${blocked.length === 1 ? 'is' : 'are'} unavailable. Choose another date or time, or go back to change your spaces.` : '';
    if (currentWizardStep === 2) applyBookingToolbar();
  }

  function renderBookings() {
    const now = amenityNowParts();
    const all = [...myAmenityBookings().filter(row => Object.hasOwn(BOOKABLE_AMENITIES, row.amenity)), ...demoAmenityPastBookings(), ...demoAmenityActiveBookings()];
    const active = all.filter(row => amenityBookingIsUpcoming(row, now))
      .sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`));
    const past = all.filter(row => !amenityBookingIsUpcoming(row, now))
      .sort((a, b) => `${b.date}T${b.startTime}`.localeCompare(`${a.date}T${a.startTime}`));
    const pageCount = Math.max(1, Math.ceil(past.length / pastBookingsPageSize));
    pastBookingsPage = Math.max(1, Math.min(pastBookingsPage, pageCount));
    const offset = (pastBookingsPage - 1) * pastBookingsPageSize;
    const rows = bookingTab === 'past' ? past.slice(offset, offset + pastBookingsPageSize) : active;
    document.querySelectorAll('[data-action="amenities-section"]').forEach(tab => {
      const selected = tab.dataset.section === activeSection;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (tab.dataset.section === 'past') tab.querySelector('[data-tab-count]').textContent = past.length;
      if (tab.dataset.section === 'active') tab.querySelector('[data-tab-count]').textContent = active.length;
    });
    document.querySelector('#amenity-bookings-panel').setAttribute('aria-labelledby', `amenity-tab-${bookingTab}`);
    document.querySelector('#amenity-bookings-title').textContent = bookingTab === 'past' ? `Booking history (${past.length})` : 'Active bookings';
    document.querySelector('#amenity-past-pagination').hidden = bookingTab !== 'past' || past.length <= pastBookingsPageSize;
    document.querySelector('#amenity-page-previous').disabled = pastBookingsPage <= 1;
    document.querySelector('#amenity-page-next').disabled = pastBookingsPage >= pageCount;
    document.querySelector('#amenity-page-info').textContent = past.length
      ? `Showing ${offset + 1}–${Math.min(offset + pastBookingsPageSize, past.length)} of ${past.length} bookings` : '';
    document.querySelector('#amenity-page-numbers').innerHTML = Array.from({ length: pageCount }, (_, index) => {
      const page = index + 1;
      return `<button type="button" class="button outline compact" data-action="bookings-page" data-page="${page}" aria-label="Page ${page}"${page === pastBookingsPage ? ' aria-current="page"' : ''}>${page}</button>`;
    }).join('');
    const list = document.querySelector('#amenity-booking-list');
    const empty = document.querySelector('#amenity-booking-empty');
    empty.hidden = rows.length > 0;
    empty.textContent = bookingTab === 'past' ? 'You have no past bookings.' : 'You have no active bookings.';
    list.hidden = rows.length === 0;
    if (bookingTab === 'past') {
      list.innerHTML = rows.map(row => `<details class="amenity-history-entry" name="amenity-history-details">
        <summary>
          <span class="amenity-history-name"><i data-icon="${BOOKABLE_AMENITIES[row.amenity].icon}"></i><strong>${escapeHtml(BOOKABLE_AMENITIES[row.amenity].name)}</strong></span>
          <span class="amenity-history-when">${escapeHtml(scheduleDates(row))}<span>${escapeHtml(scheduleTime(row))}</span></span>
          <span class="amenity-history-price">${Number.isInteger(row.feeCents) ? formatAmenityPrice(row.feeCents) : '—'}</span>
          <span class="amenity-booking-status ${row.status === 'cancelled' ? 'is-cancelled' : 'is-completed'}">${row.status === 'cancelled' ? 'Cancelled' : 'Completed'}</span>
          <span class="amenity-history-toggle">Details<i data-icon="chevron"></i></span>
        </summary>
        <div class="amenity-history-details"><span>Booked on ${escapeHtml(formatBookedAt(row.createdAt))}</span><span>Booking reference ${escapeHtml(bookingReference(row))}</span>${row.notes ? `<span class="amenity-history-notes">${escapeHtml(row.notes)}</span>` : ''}</div>
      </details>`).join('');
    } else {
      list.innerHTML = rows.map(row => {
        const amenity = BOOKABLE_AMENITIES[row.amenity];
        const status = `${row.date}T${row.startTime}` <= `${now.date}T${now.time}` ? 'In progress' : 'Reserved';
        return `<article class="amenity-active-row">
          <div class="amenity-active-when"><strong>${escapeHtml(scheduleDates(row))}</strong><span>${escapeHtml(scheduleTime(row))}</span></div>
          <div class="amenity-active-detail"><span class="amenity-active-icon" aria-hidden="true"><i data-icon="${amenity.icon}"></i></span>
            <div><strong>${escapeHtml(amenity.name)}</strong><span>${Number.isInteger(row.feeCents) ? `${formatAmenityPrice(row.feeCents)} booking` : 'Amenity reservation'}</span>
              ${row.notes ? `<span class="amenity-active-notes">${escapeHtml(row.notes)}</span>` : ''}</div>
          </div>
          <div class="amenity-active-actions"><span class="amenity-active-status">${status}</span>
            ${!row.demo ? `<button type="button" class="button outline compact" data-action="cancel-amenity" data-booking-id="${escapeHtml(row.id)}">Cancel booking</button>` : ''}
          </div>
        </article>`;
      }).join('');
    }
    renderIcons(list);
  }

  function refresh() {
    try {
      renderAvailability();
      renderBookings();
      pageError.hidden = true;
      bookingsError.hidden = true;
    } catch (error) {
      pageError.textContent = error.message || 'Could not load amenities. Please try again.';
      pageError.hidden = false;
      bookingsError.textContent = pageError.textContent;
      bookingsError.hidden = false;
      document.querySelector('#amenity-availability').textContent = 'Availability could not be loaded.';
    }
  }

  dateInput.min = amenityNowParts().date;
  dateInput.value = dateInput.min;
  fields.namedItem('checkInDate').min = dateInput.min;
  fields.namedItem('checkInDate').value = dateInput.min;
  fields.namedItem('checkOutDate').value = new Date(Date.parse(`${dateInput.min}T12:00:00Z`) + 86400000).toISOString().slice(0, 10);

  function applyBookingToolbar() {
    document.querySelectorAll('[data-wizard-step]').forEach(item => {
      const number = Number(item.dataset.wizardStep);
      if (number === currentWizardStep) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
      item.classList.toggle('is-complete', number < currentWizardStep);
    });
    continueButton.dataset.action = currentWizardStep === 3 ? 'confirm-amenity-booking' : currentWizardStep === 2 ? 'review-amenity-booking' : 'continue-amenity';
    document.querySelector('#amenity-continue-label').textContent = currentWizardStep === 3 ? 'Confirm booking' : currentWizardStep === 2 ? 'Continue to review' : 'Continue';
    const backButton = document.querySelector('#amenity-back-button');
    document.querySelector('#amenity-back-label').textContent = currentWizardStep === 2 ? 'Back to spaces' : 'Back';
    backButton.hidden = currentWizardStep === 1;
    backButton.disabled = saving;
    backButton.dataset.action = currentWizardStep === 3 ? 'back-to-date-time' : 'back-to-amenities';
    continueButton.disabled = saving || selectedAmenities().length === 0 || (currentWizardStep === 2 && !scheduleReady);
  }

  function applySection() {
    document.querySelector('#amenity-booking-toolbar').hidden = activeSection !== 'book';
    document.querySelector('#amenity-book-view').hidden = activeSection !== 'book';
    document.querySelector('#amenity-my-bookings').hidden = activeSection === 'book';
    if (activeSection !== 'book') {
      pageTitle.textContent = 'Amenities';
      pageNote.textContent = 'View and manage your amenity bookings.';
      document.title = 'MySuite ? Amenities';
    }
  }

  function selectSection(section, updateHistory = true) {
    if (!['book', 'active', 'past'].includes(section) || saving) return;
    activeSection = section;
    if (section !== 'book') bookingTab = section;
    pastBookingsPage = 1;
    if (updateHistory) {
      const url = new URL(window.location.href);
      url.searchParams.delete('view');
      url.searchParams.delete('amenity');
      selectedAmenities().forEach(id => url.searchParams.append('amenity', id));
      if (section === 'book') url.searchParams.delete('tab');
      else url.searchParams.set('tab', section);
      window.history.pushState({}, '', url);
    }
    showScreen(currentWizardStep);
  }

  function showScreen(requestedStep, updateHistory = false, focus = false) {
    const selected = selectedAmenities();
    const selectionKey = selected.join(',');
    const valid = selected.length > 0;
    renderPricing();
    let step = valid ? requestedStep : 1;
    if (step === 3 && (!pendingReview || pendingReview.map(item => item.amenity).join(',') !== selectionKey)) step = 2;
    currentWizardStep = step;
    selectionScreen.hidden = step !== 1;
    bookingScreen.hidden = step !== 2;
    reviewScreen.hidden = step !== 3;
    continueButton.disabled = !valid;
    const name = selected.length > 2 ? `${selected.length} spaces` : selected.map(id => BOOKABLE_AMENITIES[id].name).join(' & ');
    pageTitle.textContent = step === 3 ? 'Review booking' : step === 2 ? name : 'Amenities';
    pageNote.textContent = step === 3 ? 'One last look before you reserve your spaces.' : step === 2
      ? 'Check reserved times, then choose a date and time for your booking.'
      : 'Book shared amenities for your residence, such as the common area or pool.';
    document.title = step > 1 ? `MySuite — ${name} booking` : 'MySuite — Amenities';
    if (valid) {
      if (amenityInput.value !== selectionKey) {
        fields.namedItem('startTime').value = '';
        fields.namedItem('endTime').value = '';
        pendingReview = null;
      }
      amenityInput.value = selectionKey;
    }
    formError.hidden = true;
    reviewError.hidden = true;
    if (updateHistory) {
      const url = new URL(window.location.href);
      url.searchParams.delete('amenity');
      selected.forEach(id => url.searchParams.append('amenity', id));
      if (activeSection === 'book') url.searchParams.delete('tab');
      else url.searchParams.set('tab', activeSection);
      if (step > 1) url.searchParams.set('step', step === 3 ? 'review' : 'availability');
      else url.searchParams.delete('step');
      window.history.pushState({}, '', url);
    }
    applyBookingToolbar();
    applySection();
    refresh();
    if (focus) {
      pageTitle.scrollIntoView({ block: 'start' });
      pageTitle.focus({ preventScroll: true });
    }
  }

  function syncScreenFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const selected = params.getAll('amenity');
    choices.forEach(choice => { choice.checked = selected.includes(choice.value); });
    const requested = params.get('step');
    const section = params.get('tab');
    activeSection = ['active', 'past'].includes(section) ? section : params.get('view') === 'bookings' ? 'active' : 'book';
    if (activeSection !== 'book') bookingTab = activeSection;
    showScreen(requested === 'review' ? 3 : requested === 'availability' ? 2 : 1);
  }

  choices.forEach(choice => choice.addEventListener('change', () => {
    pendingReview = null;
    continueButton.disabled = !choices.some(item => item.checked);
    renderPricing();
  }));
  window.addEventListener('popstate', syncScreenFromUrl);
  dateInput.addEventListener('change', refresh);
  form.addEventListener('input', () => { pendingReview = null; renderAvailability(); });
  form.addEventListener('change', () => { pendingReview = null; renderAvailability(); });

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (saving) return;
    formError.hidden = true;
    pendingReview = null;
    try {
      pendingReview = validateAmenityBookings({ ...Object.fromEntries(new FormData(form)), amenities: selectedAmenities() });
      const values = pendingReview[0];
      const pricing = amenityPricing(pendingReview.map(item => item.amenity), pendingReview.find(item => item.bookingType === 'daily') || {});
      document.querySelector('#amenity-review-summary').innerHTML = `
        <div><dt>${pendingReview.length > 1 ? 'Spaces' : 'Space'}</dt><dd>${pendingReview.map(item => escapeHtml(BOOKABLE_AMENITIES[item.amenity].name)).join('<br>')}</dd></div>
        ${pendingReview.map(item => `<div><dt>${escapeHtml(BOOKABLE_AMENITIES[item.amenity].name)}</dt><dd>${escapeHtml(scheduleDates(item))}<br>${escapeHtml(scheduleTime(item))}</dd></div>`).join('')}
        ${pricing.items.map(item => `<div><dt>${escapeHtml(item.name)}${item.rateUnit === 'day' ? ` (${item.quantity} ${item.quantity === 1 ? 'day' : 'days'} × ${formatAmenityPrice(item.unitFeeCents)})` : ''}</dt><dd>${formatAmenityPrice(item.feeCents)}</dd></div>`).join('')}
        <div class="amenity-price-total"><dt>Total</dt><dd>${formatAmenityPrice(pricing.totalCents)}</dd></div>
        ${values.notes ? `<div><dt>Notes</dt><dd>${escapeHtml(values.notes)}</dd></div>` : ''}`;
      showScreen(3, true, true);
    } catch (error) {
      formError.textContent = error.message || 'Could not reserve this time. Please try again.';
      formError.hidden = false;
      refresh();
    }
  });

  document.querySelector('.sidebar nav')?.addEventListener('click', event => {
    if (event.target.closest('a.nav-item')) closeMenu();
    if (event.target.closest('a[href="#"]')) event.preventDefault();
  });

  document.addEventListener('click', async event => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    if (action === 'select-amenity-window') {
      const timed = selectedAmenities().filter(id => !isDailyAmenity(id));
      selectedWindow = availableAmenityWindows(timed, dateInput.value).find(window => window.start === button.dataset.windowStart && window.end === button.dataset.windowEnd) || null;
      fields.namedItem('startTime').value = '';
      fields.namedItem('endTime').value = '';
      pendingReview = null;
      renderAvailability();
      document.querySelector(`[data-window-start="${button.dataset.windowStart}"]`)?.focus();
    } else if (action === 'explain-amenity-windows') {
      const timed = selectedAmenities().filter(id => !isDailyAmenity(id));
      const periods = dateInput.value ? amenityReservedPeriods(timed, dateInput.value) : [];
      openModal('Why other times are unavailable', `<p>Available windows are times when all selected amenities are free and not booked by another resident.</p>${periods.length ? `<p>Reserved periods on ${escapeHtml(formatHistoryDate(dateInput.value))}:</p><ul>${periods.map(period => `<li>${escapeHtml(BOOKABLE_AMENITIES[period.amenity].name)}: ${formatTime(period.startTime)}–${formatTime(period.endTime)}</li>`).join('')}</ul>` : ''}`);
    } else if (action === 'remove-booking-space') {
      if (saving) return;
      const choice = choices.find(item => item.value === button.dataset.amenity);
      if (!choice) return;
      choice.checked = false;
      pendingReview = null;
      amenityInput.value = selectedAmenities().join(',');
      showScreen(selectedAmenities().length ? 2 : 1, true, true);
    } else if (action === 'amenity-booking-terms') {
      openModal('Booking terms', '<p>Timed amenities share one date and time, with a maximum of 8 hours per booking.</p><p>Daily rentals use separate check-in and check-out dates. The check-out date must be after check-in.</p><p>Daily rental costs $120 per day, excluding the check-out date. Other spaces cost $20 per booking. Availability is checked again when you confirm.</p>');
    } else if (action === 'amenities-section') {
      selectSection(button.dataset.section);
    } else if (action === 'bookings-page') {
      if (bookingTab !== 'past' || !Number.isInteger(Number(button.dataset.page))) return;
      pastBookingsPage = Number(button.dataset.page);
      refresh();
    } else if (action === 'next-bookings-page' || action === 'previous-bookings-page') {
      if (bookingTab !== 'past') return;
      pastBookingsPage += action === 'next-bookings-page' ? 1 : -1;
      refresh();
    } else if (action === 'continue-amenity') {
      if (saving) return;
      showScreen(2, true, true);
    } else if (action === 'review-amenity-booking') {
      if (!saving) form.requestSubmit();
    } else if (action === 'back-to-amenities') {
      if (!saving) showScreen(1, true, true);
    } else if (action === 'back-to-date-time') {
      if (!saving) showScreen(2, true, true);
    } else if (action === 'confirm-amenity-booking') {
      if (saving || !pendingReview || reviewScreen.hidden) return;
      saving = true;
      reviewError.hidden = true;
      const controls = [...reviewScreen.querySelectorAll('button'), document.querySelector('#amenity-back-button')];
      controls.forEach(control => { control.disabled = true; });
      continueButton.disabled = true;
      reviewScreen.setAttribute('aria-busy', 'true');
      const confirmLabel = button === continueButton ? document.querySelector('#amenity-continue-label') : button;
      confirmLabel.textContent = 'Confirming…';
      const timed = pendingReview.find(item => item.bookingType !== 'daily');
      const daily = pendingReview.find(item => item.bookingType === 'daily');
      const values = { ...(timed || pendingReview[0]), checkInDate: daily?.checkInDate, checkOutDate: daily?.checkOutDate, amenities: pendingReview.map(item => item.amenity) };
      try {
        await withBookingLock(() => createAmenityBookings(values));
        pendingReview = null;
        fields.namedItem('startTime').value = '';
        fields.namedItem('endTime').value = '';
        fields.namedItem('notes').value = '';
        bookingTab = 'active';
        activeSection = 'active';
        pastBookingsPage = 1;
        showScreen(2, true, true);
        toast(values.amenities.length > 1 ? `${values.amenities.length} amenity bookings saved.` : `${BOOKABLE_AMENITIES[values.amenity].name} booking saved.`);
      } catch (error) {
        reviewError.textContent = error.message || 'Could not confirm your booking. Please try again.';
        reviewError.hidden = false;
      } finally {
        saving = false;
        controls.forEach(control => { control.disabled = false; });
        reviewScreen.removeAttribute('aria-busy');
        applyBookingToolbar();
      }
    } else if (action === 'cancel-amenity') {
      try {
        const booking = myAmenityBookings().find(row => row.id === button.dataset.bookingId);
        if (!booking || !amenityBookingIsUpcoming(booking)) return;
        openModal('Cancel this booking?', `<p>${escapeHtml(BOOKABLE_AMENITIES[booking.amenity].name)} · ${escapeHtml(scheduleDates(booking))}<br>${escapeHtml(scheduleTime(booking))}</p>
          <div class="dialog-options"><button type="button" class="button outline" data-action="close-modal">Keep booking</button><button type="button" class="button" data-action="confirm-cancel-amenity" data-booking-id="${escapeHtml(booking.id)}">Cancel booking</button></div><p id="amenity-cancel-error" class="amenity-error" role="alert" hidden></p>`);
      } catch (error) {
        pageError.textContent = error.message;
        pageError.hidden = false;
      }
    } else if (action === 'confirm-cancel-amenity') {
      button.disabled = true;
      try {
        await withBookingLock(() => cancelAmenityBooking(button.dataset.bookingId));
        modal.close();
        refresh();
        toast('Booking cancelled.');
      } catch (error) {
        const message = document.querySelector('#amenity-cancel-error');
        message.textContent = error.message;
        message.hidden = false;
      } finally { button.disabled = false; }
    } else if (action === 'menu') {
      const open = document.querySelector('.sidebar').classList.toggle('open');
      document.querySelector('.scrim').classList.toggle('visible', open);
      document.querySelector('.mobile-toggle').setAttribute('aria-expanded', String(open));
    } else if (action === 'close-menu') closeMenu();
    else if (action === 'close-modal') modal.close();
    else if (action === 'help') openModal('Amenities booking', '<p>Select one or more spaces. Daily rental costs $120 per day; other amenities cost $20 per booking. Choose a date and time for your selected spaces, then review your details. Reservations are saved together when you choose <strong>Confirm booking</strong>.</p><p>Use the back buttons to change your selection. Your reservations appear under your bookings.</p>');
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
    const tab = event.target.closest('[data-action="amenities-section"]');
    if (tab && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      if (saving) return;
      const sections = ['book', 'active', 'past'];
      const index = sections.indexOf(tab.dataset.section);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? sections.length - 1
        : (index + (event.key === 'ArrowRight' ? 1 : -1) + sections.length) % sections.length;
      selectSection(sections[next]);
      document.querySelector(`#amenity-tab-${sections[next]}`).focus();
    }
  });
  modal?.addEventListener('click', event => {
    if (event.target !== modal) return;
    const box = modal.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) modal.close();
  });
  window.addEventListener('storage', event => { if (event.key === AMENITY_STORAGE_KEY || event.key === null) refresh(); });
  window.addEventListener('focus', () => { dateInput.min = amenityNowParts().date; fields.namedItem('checkInDate').min = dateInput.min; refresh(); });

  const lighting = document.querySelector('#header-lighting');
  const lightingChoices = ['morning', 'afternoon', 'evening', 'night'];
  const saved = readSaved('mysuite-header-lighting', 'afternoon');
  document.body.dataset.time = lightingChoices.includes(saved) ? saved : 'afternoon';
  lighting.value = document.body.dataset.time;
  lighting.addEventListener('change', () => {
    document.body.dataset.time = lightingChoices.includes(lighting.value) ? lighting.value : 'afternoon';
    save('mysuite-header-lighting', document.body.dataset.time);
  });
  syncScreenFromUrl();
})();
