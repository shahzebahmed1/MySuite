/* Shared account controls for concierge pages outside the home dashboard. */
(() => {
  if (document.querySelector('.home-topbar-account')) return;
  const main = document.querySelector('main');
  if (!main) return;
  const user = typeof getCurrentConcierge === 'function' ? getCurrentConcierge() : null;
  const name = user?.name || 'Shahzeb';
  const bar = document.createElement('div');
  bar.className = 'concierge-account-bar';
  bar.setAttribute('aria-label', 'Account controls');
  bar.innerHTML = `<div class="home-topbar-account"><button type="button" class="topbar-icon" data-account-action="notifications" aria-label="Notifications"><i data-icon="bell"></i></button><button type="button" class="topbar-profile" data-avatar-cycle aria-label="Try next avatar color"><span class="topbar-avatar"></span><span class="topbar-profile-copy"><strong></strong><small>Concierge</small></span><i data-icon="chevron"></i></button></div>`;
  bar.querySelector('strong').textContent = name;
  bar.querySelector('.topbar-avatar').textContent = name.split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase();
  main.prepend(bar);
  if (typeof renderIcons === 'function') renderIcons(bar);
  const dialog = document.createElement('dialog');
  dialog.className = 'concierge-account-dialog';
  dialog.setAttribute('aria-labelledby', 'concierge-account-title');
  dialog.innerHTML = '<header><h2 id="concierge-account-title"></h2><button type="button" aria-label="Close">×</button></header><p></p>';
  document.body.append(dialog);
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
  bar.addEventListener('click', event => {
    const action = event.target.closest('[data-account-action]')?.dataset.accountAction;
    if (!action) return;
    dialog.querySelector('h2').textContent = action === 'profile' ? name : 'Notifications';
    dialog.querySelector('p').textContent = action === 'profile' ? [user?.title || 'Concierge', user?.station].filter(Boolean).join(' · ') : 'No new notifications.';
    if (!dialog.open) dialog.showModal();
  });
})();
