(() => {
  const copy = document.querySelector('body.sidebar-merge .welcome-copy');
  if (!copy) return;
  let account;
  try { account = getSessionAccount('concierge'); } catch {}
  const row = document.createElement('p');
  row.className = 'home-welcome-details';
  const location = document.createElement('span');
  location.textContent = account?.suite ? `Suite ${account.suite}` : account?.station || 'Main Lobby';
  const separator = document.createElement('span');
  separator.textContent = '·'; separator.setAttribute('aria-hidden','true');
  const badge = document.createElement('span');
  badge.className = 'home-welcome-role'; badge.textContent = account?.title || 'Concierge';
  row.append(badge);
  copy.append(row);
})();
