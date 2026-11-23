(() => {
  const panel = document.querySelector('.dashboard-header-adjustments');
  const header = document.querySelector('.welcome');
  if (!panel || !header) return;
  const key = 'mysuite-concierge-header-edge-finish-v1';
  let settings = { shadow: false, outline: false };
  const controls = document.createElement('fieldset');
  controls.className = 'header-finish-controls';
  controls.innerHTML = '<legend>Header edges &amp; shadow</legend><label><input type="checkbox" data-header-remove="shadow">Remove header shadow</label><label><input type="checkbox" data-header-remove="outline">Remove header outline</label>';
  panel.querySelector('.header-adjustment-fields').after(controls);
  function apply(persist = true) {
    for (const name of ['shadow', 'outline']) {
      header.toggleAttribute(`data-remove-header-${name}`, settings[name]);
      controls.querySelector(`[data-header-remove="${name}"]`).checked = settings[name];
    }
    if (persist) { try { localStorage.setItem(key,JSON.stringify(settings)); } catch {} }
  }
  function load(value) {
    let saved; try { saved = JSON.parse(value); } catch {}
    settings = { shadow: saved?.shadow === true, outline: saved?.outline === true }; apply(false);
  }
  controls.addEventListener('change', event => {
    const name = event.target.dataset.headerRemove;
    if (!Object.hasOwn(settings,name)) return;
    settings[name] = event.target.checked; apply();
  });
  let saved; try { saved = localStorage.getItem(key); } catch {}
  load(saved);
  window.addEventListener('storage',event=>{if(event.key===key)load(event.newValue)});
})();
