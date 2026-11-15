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
  const choices = [...document.querySelectorAll('input[name="amenity-choice"]')];
  const continueButton = document.querySelector('#amenity-continue');
  const pageTitle = document.querySelector('#amenity-page-title');
  const pageNote = document.querySelector('#amenity-page-note');
  let saving = false;
  let pendingReview = null;
  let bookingTab = 'active';
  let mainView = 'book';
  let currentWizardStep = 1;
  let pastBookingsPage = 1;
  const pastBookingsPageSize = 5;
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

  function renderPricing() {
    const pricing = amenityPricing(selectedAmenities());
    document.querySelectorAll('[data-amenity-price]').forEach(label => {
      label.textContent = `${formatAmenityPrice(BOOKABLE_AMENITIES[label.dataset.amenityPrice].feeCents)} per booking`;
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

  function renderAvailability() {
    const container = document.querySelector('#amenity-availability');
    container.innerHTML = selectedAmenities().map(amenity => {
      const times = dateInput.value ? reservedAmenityTimes(amenity, dateInput.value) : [];
      const label = BOOKABLE_AMENITIES[amenity].name;
      return `<div><strong>Reserved times · ${escapeHtml(label)}</strong>${!dateInput.value
      ? '<p>Choose a date to check reserved times.</p>'
      : times.length ? `<ul>${times.map(row => `<li>${formatTime(row.startTime)} – ${formatTime(row.endTime)}</li>`).join('')}</ul>`
        : '<p>No reservations for this date yet.</p>'}</div>`;
    }).join('');
  }

  function renderBookings() {
    const now = amenityNowParts();
    const all = [...myAmenityBookings().filter(row => Object.hasOwn(BOOKABLE_AMENITIES, row.amenity)), ...demoAmenityPastBookings()];
    const active = all.filter(row => amenityBookingIsUpcoming(row, now));
    const past = all.filter(row => !amenityBookingIsUpcoming(row, now))
      .sort((a, b) => `${b.date}T${b.startTime}`.localeCompare(`${a.date}T${a.startTime}`));
    document.querySelector('#amenity-my-bookings-count').textContent = `(${active.length})`;
    const pageCount = Math.max(1, Math.ceil(past.length / pastBookingsPageSize));
    pastBookingsPage = Math.max(1, Math.min(pastBookingsPage, pageCount));
    const offset = (pastBookingsPage - 1) * pastBookingsPageSize;
    const rows = bookingTab === 'past' ? past.slice(offset, offset + pastBookingsPageSize) : active;
    document.querySelectorAll('[data-action="bookings-tab"]').forEach(tab => {
      const selected = tab.dataset.tab === bookingTab;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      tab.textContent = tab.dataset.tab === 'past' ? `Past bookings (${past.length})` : `Active bookings (${active.length})`;
    });
    document.querySelector('#amenity-bookings-panel').setAttribute('aria-labelledby', `amenity-tab-${bookingTab}`);
    document.querySelector('#amenity-past-pagination').hidden = bookingTab !== 'past' || past.length <= pastBookingsPageSize;
    document.querySelector('#amenity-page-previous').disabled = pastBookingsPage <= 1;
    document.querySelector('#amenity-page-next').disabled = pastBookingsPage >= pageCount;
    document.querySelector('#amenity-page-info').textContent = past.length
      ? `${offset + 1}–${Math.min(offset + pastBookingsPageSize, past.length)} of ${past.length} · Page ${pastBookingsPage} of ${pageCount}` : '';
    const list = document.querySelector('#amenity-booking-list');
    const empty = document.querySelector('#amenity-booking-empty');
    empty.hidden = rows.length > 0;
    empty.textContent = bookingTab === 'past' ? 'You have no past bookings.' : 'You have no active bookings.';
    list.hidden = rows.length === 0;
    list.innerHTML = rows.map(row => {
      const upcoming = amenityBookingIsUpcoming(row, now);
      const status = row.status === 'cancelled' ? 'Cancelled' : !upcoming ? 'Completed'
        : `${row.date}T${row.startTime}` <= `${now.date}T${now.time}` ? 'In progress' : 'Reserved';
      return `<article class="amenity-booking">
        <div><h3>${escapeHtml(BOOKABLE_AMENITIES[row.amenity]?.name || 'Amenity')}${row.demo ? '<span class="amenity-demo-label">Demo</span>' : ''}</h3>
          <p>${escapeHtml(formatDate(row.date))}</p>
          <p>${formatTime(row.startTime)} – ${formatTime(row.endTime)}</p>
          ${Number.isInteger(row.feeCents) ? `<p>Booking price: ${formatAmenityPrice(row.feeCents)}</p>` : ''}
          ${row.notes ? `<p class="amenity-booking-notes">${escapeHtml(row.notes)}</p>` : ''}
        </div>
        <div class="amenity-booking-side"><span class="amenity-booking-status${upcoming ? '' : ' is-inactive'}">${status}</span>
          ${upcoming ? `<button type="button" class="button outline compact" data-action="cancel-amenity" data-booking-id="${escapeHtml(row.id)}">Cancel booking</button>` : ''}
        </div>
      </article>`;
    }).join('');
  }

  function refresh() {
    try {
      renderAvailability();
      renderBookings();
      pageError.hidden = true;
    } catch (error) {
      pageError.textContent = error.message || 'Could not load amenities. Please try again.';
      pageError.hidden = false;
      document.querySelector('#amenity-availability').textContent = 'Availability could not be loaded.';
    }
  }

  dateInput.min = amenityNowParts().date;
  dateInput.value = dateInput.min;

  function applyMainView() {
    document.querySelector('#amenity-top-actions').hidden = mainView !== 'book' || currentWizardStep !== 1;
    document.querySelector('#amenity-book-view').hidden = mainView !== 'book';
    document.querySelector('#amenity-my-bookings').hidden = mainView !== 'bookings';
    document.querySelectorAll('[data-action="amenity-view-tab"]').forEach(tab => {
      const selected = tab.dataset.view === mainView;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    if (mainView === 'bookings') {
      pageTitle.textContent = 'My bookings';
      pageNote.textContent = 'View your active reservations and past bookings.';
      document.title = 'MySuite — My bookings';
    }
  }

  function setMainView(view, updateHistory = false, focus = false) {
    if (!['book', 'bookings'].includes(view)) return;
    mainView = view;
    if (updateHistory) {
      const url = new URL(window.location.href);
      if (view === 'bookings') url.searchParams.set('view', 'bookings');
      else url.searchParams.delete('view');
      if (currentWizardStep > 1) url.searchParams.set('step', currentWizardStep === 3 ? 'review' : 'availability');
      else url.searchParams.delete('step');
      window.history.pushState({}, '', url);
    }
    showScreen(currentWizardStep, false, focus);
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
      if (step > 1) url.searchParams.set('step', step === 3 ? 'review' : 'availability');
      else url.searchParams.delete('step');
      window.history.pushState({}, '', url);
    }
    applyMainView();
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
    mainView = params.get('view') === 'bookings' ? 'bookings' : 'book';
    showScreen(requested === 'review' ? 3 : requested === 'availability' ? 2 : 1);
  }

  choices.forEach(choice => choice.addEventListener('change', () => {
    pendingReview = null;
    continueButton.disabled = !choices.some(item => item.checked);
    renderPricing();
  }));
  window.addEventListener('popstate', syncScreenFromUrl);
  dateInput.addEventListener('change', refresh);
  form.addEventListener('input', () => { pendingReview = null; });
  form.addEventListener('change', () => { pendingReview = null; });

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (saving) return;
    formError.hidden = true;
    pendingReview = null;
    try {
      pendingReview = validateAmenityBookings({ ...Object.fromEntries(new FormData(form)), amenities: selectedAmenities() });
      const values = pendingReview[0];
      const pricing = amenityPricing(pendingReview.map(item => item.amenity));
      document.querySelector('#amenity-review-summary').innerHTML = `
        <div><dt>${pendingReview.length > 1 ? 'Spaces' : 'Space'}</dt><dd>${pendingReview.map(item => escapeHtml(BOOKABLE_AMENITIES[item.amenity].name)).join('<br>')}</dd></div>
        <div><dt>Date</dt><dd>${escapeHtml(formatDate(values.date))}</dd></div>
        <div><dt>Time</dt><dd>${formatTime(values.startTime)} – ${formatTime(values.endTime)}<br>Calgary time</dd></div>
        ${pricing.items.map(item => `<div><dt>${escapeHtml(item.name)}</dt><dd>${formatAmenityPrice(item.feeCents)}</dd></div>`).join('')}
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
    if (action === 'amenity-view-tab') {
      if (!saving) setMainView(button.dataset.view, true);
    } else if (action === 'bookings-tab') {
      if (!['active', 'past'].includes(button.dataset.tab)) return;
      bookingTab = button.dataset.tab;
      pastBookingsPage = 1;
      refresh();
    } else if (action === 'next-bookings-page' || action === 'previous-bookings-page') {
      if (bookingTab !== 'past') return;
      pastBookingsPage += action === 'next-bookings-page' ? 1 : -1;
      refresh();
    } else if (action === 'continue-amenity') {
      if (saving) return;
      showScreen(2, true, true);
    } else if (action === 'back-to-amenities') {
      if (!saving) showScreen(1, true, true);
    } else if (action === 'back-to-date-time') {
      if (!saving) showScreen(2, true, true);
    } else if (action === 'confirm-amenity-booking') {
      if (saving || !pendingReview || reviewScreen.hidden) return;
      saving = true;
      reviewError.hidden = true;
      const controls = [...reviewScreen.querySelectorAll('button')];
      controls.forEach(control => { control.disabled = true; });
      reviewScreen.setAttribute('aria-busy', 'true');
      button.textContent = 'Confirming…';
      const values = { ...pendingReview[0], amenities: pendingReview.map(item => item.amenity) };
      try {
        await withBookingLock(() => createAmenityBookings(values));
        pendingReview = null;
        fields.namedItem('startTime').value = '';
        fields.namedItem('endTime').value = '';
        fields.namedItem('notes').value = '';
        bookingTab = 'active';
        pastBookingsPage = 1;
        showScreen(2);
        setMainView('bookings', true, true);
        toast(values.amenities.length > 1 ? `${values.amenities.length} amenity bookings saved.` : `${BOOKABLE_AMENITIES[values.amenity].name} booking saved.`);
      } catch (error) {
        reviewError.textContent = error.message || 'Could not confirm your booking. Please try again.';
        reviewError.hidden = false;
      } finally {
        saving = false;
        controls.forEach(control => { control.disabled = false; });
        reviewScreen.removeAttribute('aria-busy');
        button.textContent = 'Confirm booking';
      }
    } else if (action === 'cancel-amenity') {
      try {
        const booking = myAmenityBookings().find(row => row.id === button.dataset.bookingId);
        if (!booking || !amenityBookingIsUpcoming(booking)) return;
        openModal('Cancel this booking?', `<p>${escapeHtml(BOOKABLE_AMENITIES[booking.amenity].name)} · ${escapeHtml(formatDate(booking.date))}<br>${formatTime(booking.startTime)} – ${formatTime(booking.endTime)}</p>
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
    else if (action === 'help') openModal('Amenities booking', '<p>Select one or more spaces. Each amenity costs $20 per booking. Choose a date and time for your selected spaces, then review your details. Reservations are saved together when you choose <strong>Confirm booking</strong>.</p><p>Use the back buttons to change your selection. Your reservations appear under your bookings.</p>');
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
    const mainTab = event.target.closest('[data-action="amenity-view-tab"]');
    if (mainTab && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      if (saving) return;
      const view = event.key === 'Home' ? 'book' : event.key === 'End' ? 'bookings' : mainTab.dataset.view === 'book' ? 'bookings' : 'book';
      setMainView(view, true);
      document.querySelector(`#amenity-view-${view}`).focus();
      return;
    }
    const tab = event.target.closest('[data-action="bookings-tab"]');
    if (tab && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      bookingTab = event.key === 'Home' ? 'active' : event.key === 'End' ? 'past' : tab.dataset.tab === 'active' ? 'past' : 'active';
      pastBookingsPage = 1;
      refresh();
      document.querySelector(`#amenity-tab-${bookingTab}`).focus();
    }
  });
  modal?.addEventListener('click', event => {
    if (event.target !== modal) return;
    const box = modal.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) modal.close();
  });
  window.addEventListener('storage', event => { if (event.key === AMENITY_STORAGE_KEY || event.key === null) refresh(); });
  window.addEventListener('focus', () => { dateInput.min = amenityNowParts().date; refresh(); });

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
