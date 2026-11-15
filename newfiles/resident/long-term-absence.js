/* Resident — long-term absence notice.
   Requires: icons.js, utils.js, mockdata.js, absence-data.js */

renderIcons();
const residentAccount = applyLoggedInUser('resident');

function closeMenu() {
  document.querySelector('.sidebar')?.classList.remove('open');
  document.querySelector('.scrim')?.classList.remove('visible');
  document.querySelector('.mobile-toggle')?.setAttribute('aria-expanded', 'false');
}

document.querySelector('.sidebar nav')?.addEventListener('click', event => {
  const link = event.target.closest('a.nav-item');
  if (!link) return;
  closeMenu();
  if (link.getAttribute('href') === '#') event.preventDefault();
});

function showFormMessage(text, isError) {
  const el = document.querySelector('#form-message');
  if (!el) return;
  if (!text) {
    el.hidden = true;
    el.textContent = '';
    el.classList.remove('is-error');
    return;
  }
  el.hidden = false;
  el.textContent = text;
  el.classList.toggle('is-error', Boolean(isError));
}

function absenceStatusLabel(absence) {
  if (isAbsenceActive(absence)) return 'Active';
  if (isAbsenceUpcoming(absence)) return 'Upcoming';
  return 'Past';
}

function renderMyAbsences() {
  const listEl = document.querySelector('#absence-list');
  const emptyEl = document.querySelector('#absence-empty');
  if (!listEl) return;

  const suite = residentAccount?.suite || '';
  const rows = getAbsencesForSuite(suite);

  if (rows.length === 0) {
    listEl.innerHTML = '';
    if (emptyEl) emptyEl.hidden = false;
    return;
  }
  if (emptyEl) emptyEl.hidden = true;

  listEl.innerHTML = rows.map(a => {
    const checks = formatAbsenceChecks(a);
    const checksLine = checks.length ? `<span>${checks.join(' · ')}</span>` : '';
    const notes = a.notes ? `<span>${a.notes}</span>` : '';
    return `<article class="absence-row">
      <strong>${formatAbsenceDate(a.awayFrom)} – ${formatAbsenceDate(a.returnDate)}</strong>
      <span>${absenceStatusLabel(a)} · Emergency: ${a.emergencyName} · ${a.emergencyPhone}</span>
      ${checksLine}
      ${notes}
    </article>`;
  }).join('');
}

document.querySelector('#absence-form')?.addEventListener('submit', event => {
  event.preventDefault();
  const form = event.target;
  const data = Object.fromEntries(new FormData(form));
  const result = createAbsence({
    ...data,
    holdPackages: form.holdPackages?.checked === true,
    checkResidence: form.checkResidence?.checked === true,
    waterOff: form.waterOff?.checked === true,
    suite: residentAccount?.suite || '',
    residentName: residentAccount?.name || ''
  });

  if (!result.ok) {
    showFormMessage(result.message, true);
    toast(result.message);
    return;
  }

  showFormMessage('');
  form.reset();
  renderMyAbsences();
  toast('Absence notice submitted.');
});

document.addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const action = button.dataset.action;
  if (action === 'menu') {
    const open = document.querySelector('.sidebar').classList.toggle('open');
    document.querySelector('.scrim').classList.toggle('visible', open);
    document.querySelector('.mobile-toggle').setAttribute('aria-expanded', String(open));
  } else if (action === 'close-menu') {
    closeMenu();
  } else if (action === 'close-modal') {
    modal.close();
  } else if (action === 'help') {
    openModal(
      'Long-term absence help',
      '<p>Tell the desk when you will be away and who to call in an emergency.</p><p>Use the checkboxes if you want packages held, a residence check, or to note that the water is off.</p>'
    );
  }
});

const lightingPicker = document.querySelector('#header-lighting');
const lightingOptions = ['morning', 'afternoon', 'evening', 'night'];
const savedLighting = readSaved('mysuite-header-lighting', 'afternoon');
function setLighting(value) {
  const selected = lightingOptions.includes(value) ? value : 'afternoon';
  document.body.dataset.time = selected;
  if (lightingPicker) lightingPicker.value = selected;
}
setLighting(savedLighting);
lightingPicker?.addEventListener('change', () => {
  setLighting(lightingPicker.value);
  save('mysuite-header-lighting', lightingPicker.value);
});

renderMyAbsences();
