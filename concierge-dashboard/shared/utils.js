/* MySuite shared utilities — modal, toast, and local-storage helpers.
   Requires icons.js to be loaded first (renderIcons is called inside openModal). */

const modal = document.querySelector('#modal');

function openModal(title, content) {
  document.querySelector('#modal-title').textContent = title;
  document.querySelector('#modal-body').innerHTML = content;
  renderIcons(modal);
  if (!modal.open) modal.showModal();
}

let toastTimer;
function toast(message) {
  const el = document.querySelector('#toast');
  if (!el) return;
  if (el.parentElement !== document.body) document.body.appendChild(el);
  el.textContent = message;
  el.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('visible'), 4000);
}

function readSaved(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}

function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable — demo still works */ }
}
