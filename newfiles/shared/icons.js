/* MySuite icon registry — shared across all role dashboards.
   Call renderIcons() once per page after the DOM is ready. */
const icons = {
  /* ── Original resident icons ── */
  home:      '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
  building:  '<path d="M3 21V7h6V3h7v8h5v10M9 21V7m7 14V11M1 21h22M6 10v1m0 3v1m6-9v1m0 3v1m0 3v1m7-1v1M11 21v-3h3v3"/>',
  megaphone: '<path d="m4 9 13-5v15L4 14H2V9zm3 6 2 6h3l-2-5M20 8l2-1m-2 9 2 1M20 12h3"/>',
  pool:      '<path d="M2 13c2-3 4 3 7 0s5 3 8 0 4 1 5 0M2 18c2-3 4 3 7 0s5 3 8 0 4 1 5 0M6 9V4a2 2 0 0 1 4 0m3 7V4a2 2 0 0 1 4 0M6 7h7"/>',
  wrench:    '<path d="M21 3a6 6 0 0 1-7 8L6 20a2 2 0 0 1-3-3l9-8a6 6 0 0 1 8-7l-4 4 2 2z"/>',
  calendar:  '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v5m10-5v5M3 11h18m-14 4h3"/>',
  file:      '<path d="M14 2H5v20h14V7zm0 0v6h5M8 12h8m-8 4h8"/>',
  bag:       '<rect x="4" y="7" width="16" height="15" rx="2"/><path d="M8 9V6a4 4 0 0 1 8 0v3"/>',
  users:     '<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3m2-17a3 3 0 0 1 0 6m2 11v-3a5 5 0 0 0-3-5"/>',
  board:     '<rect x="7" y="3" width="10" height="7" rx="1"/><path d="M12 10v4M4 17v-3h16v3"/><rect x="1" y="17" width="6" height="5" rx="1"/><rect x="9" y="17" width="6" height="5" rx="1"/><rect x="17" y="17" width="6" height="5" rx="1"/>',
  bell:      '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 10h18c0-2-3-3-3-10M10 21h4"/>',
  chevron:   '<path d="m9 5 7 7-7 7"/>',
  left:      '<path d="m15 5-7 7 7 7"/>',
  arrow:     '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  chart:     '<rect x="3" y="11" width="4" height="10" rx="1"/><rect x="10" y="3" width="4" height="18" rx="1"/><rect x="17" y="7" width="4" height="14" rx="1"/>',
  video:     '<rect x="2" y="5" width="13" height="14" rx="2"/><path d="m15 10 7-4v12l-7-4"/>',
  sparkle:   '<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5zM20 2v4m-2-2h4"/>',
  send:      '<path d="m22 2-7 20-4-9L2 9zm-11 11L22 2"/>',
  menu:      '<path d="M3 6h18M3 12h18M3 18h18"/>',
  close:     '<path d="m6 6 12 12M6 18 18 6"/>',
  /* ── Concierge & manager icons ── */
  package:   '<path d="m12 2 10 6v8l-10 6-10-6V8zm0 0v14M2 8l10 6 10-6"/>',
  person:    '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>',
  key:       '<path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/>',
  trending:  '<path d="m22 7-8.5 8.5-5-5L2 17m20-10h-5m5 0v5"/>',
  dollar:    '<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  clipboard: '<rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-3M8 12h4m-4 4h4"/>',
  activity:  '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  grid:      '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  settings:  '<circle cx="12" cy="12" r="3"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>',
  logout:    '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14 5-5-5-5m5 5H9"/>',
  /* ── Technician icons ── */
  check:     '<path d="M20 6 9 17l-5-5"/>',
  toolbox:   '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M2 12h20"/>',
  alert:     '<path d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>',
  search:    '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  phone:     '<path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1.5 1.5 0 0 1 1.5-.4 9.5 9.5 0 0 0 3 1 1.5 1.5 0 0 1 1.5 1.5V20A1.5 1.5 0 0 1 20.4 21.5 18.5 18.5 0 0 1 2.5 3.6 1.5 1.5 0 0 1 4 2.1h3.1A1.5 1.5 0 0 1 8.6 3.6a9.5 9.5 0 0 0 1 3 1.5 1.5 0 0 1-.4 1.5z"/>',
  mail:      '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="m2 7 10 7 10-7"/>',
  info:      '<circle cx="12" cy="12" r="9"/><path d="M12 10v6m0-10h.01"/>',
  pencil:    '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  trash:     '<path d="M3 6h18M8 6V4h8v2m-9 0v14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V6"/>',
  elevator:  '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M5 11h14M12 3v18M9 7v2m6-2v2M9 15v2m6-2v2"/>',
  suitcase:  '<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M12 12v4"/>'
};

function renderIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach(el => {
    el.outerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[el.dataset.icon] || icons.home}</svg>`;
  });
}
