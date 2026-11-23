(() => {
  const panel = document.querySelector('.dashboard-header-adjustments');
  const header = document.querySelector('.welcome');
  const copy = header?.querySelector('.welcome-copy');
  if (!panel || !copy) return;
  const surface = document.createElement('div');
  surface.className = 'classic-welcome-surface';
  surface.setAttribute('aria-hidden', 'true');
  header.append(surface);
  const classic = document.createElement('div');
  classic.className = 'classic-welcome-copy';
  classic.innerHTML = '<h2></h2><p><span class="classic-welcome-location"></span><span aria-hidden="true">·</span><span class="classic-welcome-badge"></span></p>';
  copy.append(classic);
  let account;
  try { account = getSessionAccount('concierge'); } catch {}
  const name = account?.name || document.querySelector('.sidebar [data-user-name]')?.textContent.trim() || 'Concierge';
  classic.querySelector('h2').textContent = `Welcome home, ${name.split(/\s+/)[0]}`;
  classic.querySelector('.classic-welcome-location').textContent = account?.suite ? `Suite ${account.suite}` : account?.station || 'Concierge portal';
  classic.querySelector('.classic-welcome-badge').textContent = account?.title || 'Concierge';
  header.setAttribute('data-classic-welcome', '');
})();
