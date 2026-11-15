/* MySuite — Announcements for all portal roles.
   Requires: shared/icons.js, shared/utils.js, shared/mockdata.js, announcements-data.js */

renderIcons();
const announcementRole = document.body.dataset.portalRole || 'concierge';
applyLoggedInUser(announcementRole);
const canPublish = canPublishAnnouncements();
const composePanel = document.querySelector('.compose-panel');
if (composePanel) {
  composePanel.hidden = !canPublish;
  composePanel.setAttribute('aria-hidden', String(!canPublish));
}
document.querySelector('.announcements-layout')?.classList.toggle('is-reader', !canPublish);
document.querySelectorAll('#announcement-form input, #announcement-form select, #announcement-form textarea, #announcement-form button').forEach(control => {
  control.disabled = !canPublish;
});

document.querySelector('#announcement-form')?.addEventListener('submit', event => {
  event.preventDefault();
  if (!canPublishAnnouncements()) return;
  const form = event.currentTarget;
  const error = form.querySelector('#announcement-form-error');
  const button = form.querySelector('[type="submit"]');
  error.hidden = true;
  button.disabled = true;
  try {
    publishAnnouncement({
      title: form.elements.namedItem('title').value,
      category: form.elements.namedItem('category').value,
      body: form.elements.namedItem('body').value
    });
    form.reset();
    refreshList();
    toast('Announcement published.');
  } catch (err) {
    error.textContent = err.message || 'Could not publish. Please try again.';
    error.hidden = false;
  } finally {
    button.disabled = !canPublishAnnouncements();
  }
});

window.addEventListener('storage', event => {
  if (event.key === ANNOUNCEMENT_STORAGE_KEY || event.key === null) refreshList();
});

function closeMenu() {
  document.querySelector('.sidebar').classList.remove('open');
  document.querySelector('.scrim').classList.remove('visible');
  document.querySelector('.mobile-toggle').setAttribute('aria-expanded', 'false');
}

document.querySelector('.sidebar nav')?.addEventListener('click', event => {
  const link = event.target.closest('a.nav-item');
  if (!link) return;
  closeMenu();
  if (link.getAttribute('href') === '#') event.preventDefault();
});

function refreshList() {
  const listEl = document.querySelector('#announcement-list');
  const emptyEl = document.querySelector('#announcement-empty');
  if (!listEl) return;
  const items = sortAnnouncementsNewestFirst(getAnnouncements());
  if (items.length === 0) {
    listEl.innerHTML = '';
    if (emptyEl) emptyEl.hidden = false;
    return;
  }
  if (emptyEl) emptyEl.hidden = true;
  listEl.innerHTML = items.map(renderAnnouncementRow).join('');
  renderIcons(listEl);
}

function openAnnouncement(id) {
  const item = findAnnouncementById(id);
  if (!item) return;
  openModal(item.title, announcementDetailHtml(item));
}

refreshList();

document.addEventListener('click', event => {
  const row = event.target.closest('[data-announcement]');
  if (row) {
    openAnnouncement(row.dataset.announcement);
    return;
  }

  const button = event.target.closest('[data-action]');
  if (!button) return;
  if (button.closest('.sidebar')) closeMenu();
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
      'Announcements help',
      canPublish
        ? '<p>Publish an announcement to share it with everyone in the building portal. Enter a title, category, and message, then choose <strong>Publish announcement</strong>.</p>'
        : '<p>Review building announcements here. Select an announcement to read the full message.</p>'
    );
  }
});

modal.addEventListener('click', event => {
  if (event.target === modal) {
    const r = modal.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) modal.close();
  }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeMenu();
});

const lightingPicker = document.querySelector('#header-lighting');
const lightingOptions = ['morning', 'afternoon', 'evening', 'night'];
const savedLighting = readSaved('mysuite-header-lighting', 'afternoon');
function setLighting(value) {
  const selected = lightingOptions.includes(value) ? value : 'afternoon';
  document.body.dataset.time = selected;
  lightingPicker.value = selected;
}
setLighting(savedLighting);
lightingPicker.addEventListener('change', () => {
  setLighting(lightingPicker.value);
  save('mysuite-header-lighting', lightingPicker.value);
});
