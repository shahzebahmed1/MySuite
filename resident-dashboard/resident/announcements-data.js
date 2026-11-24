/* Announcements shared by all local portal roles (localStorage).
   Production requires authenticated server-side publishing permissions. */

const ANNOUNCEMENT_STORAGE_KEY = 'mysuite-resident-announcements-v1';

const ANNOUNCEMENT_SEED = [
  {
    id: 'ann-1003',
    title: 'Pool maintenance',
    summary: 'Pool will be closed on Friday for scheduled maintenance.',
    body: 'The pool will be closed on Friday, November 6 for scheduled maintenance. Thank you for your patience while we keep our amenities in great shape.',
    category: 'Building update',
    icon: 'pool',
    postedAt: '2026-11-13T10:00:00',
    postedBy: 'Building management'
  },
  {
    id: 'ann-1002',
    title: 'Community social',
    summary: 'Meet your neighbours this Saturday in the common room.',
    body: 'Join your neighbours in the common room on Saturday, November 14, 2026, from 3:00–5:00 PM. Drop by for coffee, conversation, and a chance to meet the community.',
    category: 'Community',
    icon: 'users',
    postedAt: '2026-11-12T16:30:00',
    postedBy: 'Building management'
  },
  {
    id: 'ann-1001',
    title: 'Elevator service notice',
    summary: 'Elevator B will be offline Monday morning for inspection.',
    body: 'Elevator B will be offline Monday from 8:00–11:00 AM for a routine safety inspection. Please use Elevator A during that window.',
    category: 'Building update',
    icon: 'building',
    postedAt: '2026-11-11T09:15:00',
    postedBy: 'Building management'
  }
];

function getAnnouncements() {
  const stored = readSaved(ANNOUNCEMENT_STORAGE_KEY, null);
  if (!Array.isArray(stored) || stored.length === 0) {
    save(ANNOUNCEMENT_STORAGE_KEY, ANNOUNCEMENT_SEED);
    return ANNOUNCEMENT_SEED.map(a => ({ ...a }));
  }
  return stored;
}

function setAnnouncements(list) {
  if (!canPublishAnnouncements()) throw new Error('Only managers and board members can publish announcements.');
  try {
    localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, JSON.stringify(list));
  } catch {
    throw new Error('Could not publish. Browser storage may be full or unavailable. Please try again.');
  }
}

function canPublishAnnouncements() {
  const role = document.body.dataset.portalRole;
  return role === 'manager' || role === 'board';
}

function publishAnnouncement(values) {
  if (!canPublishAnnouncements()) throw new Error('Only managers and board members can publish announcements.');
  const role = document.body.dataset.portalRole;
  const account = getSessionAccount(role);
  if (account && account.role !== role) throw new Error('Your account cannot publish from this portal.');
  const title = String(values.title || '').trim();
  const body = String(values.body || '').trim();
  const categories = ['Building update', 'Community', 'Maintenance', 'Safety'];
  if (!title || title.length > 160) throw new Error('Enter a title up to 160 characters.');
  if (!body || body.length > 10000) throw new Error('Enter a message up to 10,000 characters.');
  if (!categories.includes(values.category)) throw new Error('Choose an announcement category.');
  const item = {
    id: `ann-${crypto.randomUUID()}`, title, body,
    summary: body.length > 180 ? `${body.slice(0, 177)}…` : body,
    category: values.category,
    icon: values.category === 'Community' ? 'users' : 'megaphone',
    postedAt: new Date().toISOString(),
    postedBy: account?.name || (role === 'board' ? 'Board member' : 'Building management'),
    postedRole: role
  };
  setAnnouncements([item, ...getAnnouncements()]);
  return item;
}

function escapeAnnouncementHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

function sortAnnouncementsNewestFirst(list) {
  return [...list].sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
}

function formatAnnouncementWhen(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (sameDay) {
      return d.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' });
    }
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

function findAnnouncementById(id) {
  return getAnnouncements().find(a => a.id === id) || null;
}

function renderAnnouncementRow(item, options = {}) {
  const when = formatAnnouncementWhen(item.postedAt);
  const meta = [options.showCategory === false ? null : item.category, when].filter(Boolean).join(' · ');
  const icon = ['pool', 'users', 'building', 'megaphone'].includes(item.icon) ? item.icon : 'megaphone';
  return `<button type="button" class="announcement" data-announcement="${escapeAnnouncementHtml(item.id)}">
    <span class="tile-icon"><i data-icon="${icon}"></i></span>
    <span>
      <strong>${escapeAnnouncementHtml(item.title)}${options.showAttachment ? ' <i data-icon="paperclip"></i>' : ''}</strong>
      <small>${escapeAnnouncementHtml(item.summary)}</small>
      <em>${escapeAnnouncementHtml(meta)}</em>
    </span>
    <i data-icon="chevron"></i>
  </button>`;
}

function announcementDetailHtml(item) {
  const when = formatAnnouncementWhen(item.postedAt);
  const meta = [item.category, when, item.postedBy].filter(Boolean).join(' · ');
  return `<div class="dialog-info">${escapeAnnouncementHtml(meta)}</div><p class="announcement-message">${escapeAnnouncementHtml(item.body || item.summary)}</p>`;
}
