(() => {
  const card = document.querySelector('body.sidebar-merge #packages');
  const header = document.querySelector('.welcome');
  if (!card || !header) return;
  const fonts = window.MYSUITE_GREETING_FONTS || [{ id: 'georgia', label: 'Georgia', family: 'Georgia' }];
  const key = 'mysuite-concierge-greeting-experiments-v1';
  const defaults = { phrase: 'Hello', layout: 'quiet', font: 'georgia', size: 42, parts: { hello: { bold: false, italic: false }, comma: { bold: false, italic: false }, name: { bold: false, italic: false } }, date: false, weather: false, weatherText: '12° · Partly cloudy', role: 'Concierge', rolePlacement: 'hello', roleColor: 'sand' };
  const layouts = [['quiet', 'Quiet', 'A smaller, balanced greeting.'], ['emphasis', 'Name emphasis', 'Give your name a little more weight.'], ['stacked', 'Two-line', 'Hello above your name.'], ['compact', 'Compact', 'A concise greeting with room around it.']];
  const roles = ['Concierge', 'Board of Directors', 'Manager', 'Technician'];
  const placements = [['hello', 'Beside Hello', 'Keep the role on the smaller greeting line.'], ['name', 'Beside name', 'Pair the role with the name; wrap when needed.'], ['above', 'Above greeting', 'Give the role its own compact line.'], ['below', 'Below name', 'Keep a separate detail row beneath the name.']];
  const roleColors = [
    { id: 'sand', label: 'Sand', bg: '#e7dfd2', ink: '#5b5146', edge: 'transparent' },
    { id: 'slate', label: 'Slate', bg: '#e7edf3', ink: '#3b526b', edge: 'transparent' },
    { id: 'sage', label: 'Sage', bg: '#e6ece3', ink: '#3f5844', edge: 'transparent' },
    { id: 'bronze', label: 'Bronze', bg: '#eee0cd', ink: '#76532d', edge: 'transparent' },
    { id: 'charcoal', label: 'Charcoal', bg: '#293647', ink: '#f6f1e9', edge: 'transparent' },
    { id: 'outline', label: 'Quiet outline', bg: 'transparent', ink: '#675342', edge: '#b7a48e' }
  ];
  let settings;
  function normalize(value) {
    const result = { ...defaults, parts: {} };
    result.phrase = ['Hello','Good Afternoon','Welcome Home','Morning'].includes(value?.phrase) ? value.phrase : defaults.phrase;
    result.layout = layouts.some(([id]) => id === value?.layout) ? value.layout : defaults.layout;
    result.font = fonts.some(font => font.id === value?.font) ? value.font : defaults.font;
    result.size = Number.isFinite(value?.size) ? Math.max(12,Math.min(96,Math.round(value.size))) : defaults.size;
    for (const part of ['hello','comma','name']) result.parts[part] = { bold: value?.parts?.[part]?.bold === true, italic: value?.parts?.[part]?.italic === true };
    result.date = value?.date === true; result.weather = value?.weather === true;
    result.weatherText = typeof value?.weatherText === 'string' ? value.weatherText.slice(0,80) : defaults.weatherText;
    result.role = roles.includes(value?.role) ? value.role : defaults.role;
    result.rolePlacement = placements.some(([id]) => id === value?.rolePlacement) ? value.rolePlacement : defaults.rolePlacement;
    result.roleColor = roleColors.some(color => color.id === value?.roleColor) ? value.roleColor : defaults.roleColor;
    return result;
  }
  try { settings = normalize(JSON.parse(localStorage.getItem(key))); } catch { settings = normalize(null); }
  let account; try { account = getSessionAccount('concierge'); } catch {}
  const fullName = account?.name || document.querySelector('.sidebar [data-user-name]')?.textContent.trim() || 'Shahzeb';
  const firstName = fullName.split(/\s+/)[0];
  const targets = [header.querySelector('.welcome-copy > h1'),header.querySelector('.classic-welcome-copy h2')].filter(Boolean);
  const headingBadges = new Map();
  const greetingSpaces = new Map();
  document.body.setAttribute('data-greeting-experiments','');
  for (const target of targets) {
    target.removeAttribute('data-user-greeting');
    const hello = document.createElement('span'); hello.dataset.greetingPart = 'hello'; hello.textContent = 'Hello';
    const comma = document.createElement('span'); comma.dataset.greetingPart = 'comma'; comma.textContent = ',';
    const name = document.createElement('span'); name.dataset.greetingPart = 'name'; name.textContent = firstName;
    const space=document.createTextNode(' ');greetingSpaces.set(target,space);
    target.replaceChildren(hello,comma,space,name);
    target.classList.add('experimental-greeting');
    const badge = document.createElement('span'); badge.className = 'home-welcome-role greeting-heading-role';
    headingBadges.set(target, badge);
    target.style.removeProperty('font-size'); target.style.removeProperty('font-weight'); target.style.removeProperty('font-style');
  }
  const metadata = [header.querySelector('.home-welcome-details'),header.querySelector('.classic-welcome-copy p')].filter(Boolean);
  for (const row of metadata) {
    row.replaceChildren();
    const badge = document.createElement('span'); badge.className='home-welcome-role'; badge.textContent='Concierge';
    const date = document.createElement('span');date.className='greeting-date';
    const weather = document.createElement('span');weather.className='greeting-weather';weather.title='Sample weather for this design preview';
    row.append(badge,date,weather);
  }
  const panel = document.createElement('section');
  panel.className='home-greeting-experiments'; panel.setAttribute('data-home-editor',''); panel.setAttribute('aria-label','Greeting experiments');
  panel.innerHTML=`<h3>Greeting experiments</h3><p>Keep Concierge visible. Compare a quieter greeting, a stronger name, or a two-line layout.</p><div class="greeting-layout-options">${layouts.map(([id,title,detail])=>`<button type="button" data-greeting-layout="${id}" aria-pressed="false"><strong>${title}</strong><span>${detail}</span></button>`).join('')}</div><div class="greeting-font-browser"><label>Page font<select aria-label="Page font">${fonts.map(font=>`<option value="${font.id}">${font.label}</option>`).join('')}</select></label><div><button type="button" data-font-step="-1">Previous font</button><button type="button" data-font-step="1">Next font</button><output data-font-count aria-live="polite"></output></div></div><label class="greeting-size-label">Greeting size <output data-greeting-size-output></output><input type="range" min="12" max="96" step="1" data-greeting-size aria-label="Greeting font size"></label><div class="greeting-word-controls">${[['hello','Hello'],['comma',','],['name',firstName]].map(([id,title])=>`<div><span data-part-label="${id}"></span><button type="button" data-part="${id}" data-format="bold" aria-pressed="false" aria-label="Bold ${id==='name'?'name':id}">Bold</button><button type="button" data-part="${id}" data-format="italic" aria-pressed="false" aria-label="Italic ${id==='name'?'name':id}">Italic</button></div>`).join('')}</div><div class="greeting-context-options"><label><input type="checkbox" data-context="date"> Show date</label><label><input type="checkbox" data-context="weather"> Sample weather</label><label class="greeting-weather-input">Weather preview text<input type="text" maxlength="80" data-weather-text aria-label="Sample weather text"></label></div><p class="greeting-font-note">The selected font applies across this page. MySuite keeps its logo font. Fonts come from your supplied folder. Italics are simulated where an italic file is unavailable. Weather is a preview, not live data.</p><button type="button" data-greeting-reset>Reset greeting experiments</button>`;
  panel.querySelector('[data-part-label="hello"]').textContent='Hello';
  panel.querySelector('[data-part-label="comma"]').textContent=',';
  panel.querySelector('[data-part-label="name"]').textContent=firstName;
  const rolePanel = document.createElement('fieldset');
  rolePanel.className = 'greeting-role-controls';
  rolePanel.innerHTML = `<legend>Role badge experiments</legend><label>Preview role<select aria-label="Preview greeting role">${roles.map(role => `<option>${role}</option>`).join('')}</select></label><p>Visual preview only. This does not change your account or permissions.</p><div class="greeting-layout-options">${placements.map(([id,title,detail]) => `<button type="button" data-role-placement="${id}" aria-pressed="false"><strong>${title}</strong><span>${detail}</span></button>`).join('')}</div><div class="greeting-role-colors" role="group" aria-label="Role badge color">${roleColors.map(color => `<button type="button" data-role-color="${color.id}" aria-pressed="false"><i aria-hidden="true" style="background:${color.bg};border-color:${color.edge}"></i>${color.label}</button>`).join('')}</div>`;
  panel.querySelector('.greeting-context-options').before(rolePanel);
  card.prepend(panel);
  function apply(persist=true) {
    const font=fonts.find(item=>item.id===settings.font);
    document.body.style.setProperty('--dashboard-font-family', `"${font.family}", Georgia, serif`);
    header.dataset.greetingLayout=settings.layout;
    header.dataset.rolePlacement=settings.rolePlacement;
    const roleColor=roleColors.find(color=>color.id===settings.roleColor);
    header.style.setProperty('--greeting-role-bg',roleColor.bg);
    header.style.setProperty('--greeting-role-ink',roleColor.ink);
    header.style.setProperty('--greeting-role-edge',roleColor.edge);
    header.style.setProperty('--greeting-experiment-size',`${settings.size}px`);
    if (header.hasAttribute('data-fixed-greeting-size')) {
      header.style.setProperty('--locked-greeting-heading', `${settings.size}px`);
      header.style.setProperty('--locked-greeting-classic', `${settings.size}px`);
    }
    for (const target of targets) {
      const hello=target.querySelector('[data-greeting-part="hello"]');
      const comma=target.querySelector('[data-greeting-part="comma"]');
      const name=target.querySelector('[data-greeting-part="name"]');
      hello.textContent=settings.phrase;
      if(settings.phrase==='Morning')hello.after(greetingSpaces.get(target),name,comma);
      else hello.after(comma,greetingSpaces.get(target),name);
      target.style.fontSize=`${settings.size}px`;
      target.style.fontFamily=`"${font.family}", Georgia, serif`;
      for (const part of ['hello','comma','name']) {
        const span=target.querySelector(`[data-greeting-part="${part}"]`);
        span.style.fontWeight=settings.parts[part].bold?'700':'400'; span.style.fontStyle=settings.parts[part].italic?'italic':'normal';
      }
      const badge=headingBadges.get(target);badge.textContent=settings.role;
      if(settings.rolePlacement==='hello')target.querySelector('[data-greeting-part="comma"]').after(badge);
      else if(settings.rolePlacement==='name')target.querySelector('[data-greeting-part="name"]').append(badge);
      else if(settings.rolePlacement==='above')target.prepend(badge);
      else badge.remove();
    }
    for (const row of metadata) {
      row.querySelector('.home-welcome-role').textContent=settings.role;
      row.querySelector('.home-welcome-role').hidden=settings.rolePlacement!=='below';
      row.classList.toggle('greeting-metadata-empty',settings.rolePlacement!=='below'&&!settings.date&&!settings.weather);
      row.querySelector('.greeting-date').textContent=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Edmonton',weekday:'short',month:'short',day:'numeric'}).format(new Date());
      row.querySelector('.greeting-date').hidden=!settings.date;
      row.querySelector('.greeting-weather').textContent=settings.weatherText;
      row.querySelector('.greeting-weather').hidden=!settings.weather;
    }
    panel.querySelector('select[aria-label="Page font"]').value=settings.font;
    rolePanel.querySelector('select').value=settings.role;
    rolePanel.querySelectorAll('[data-role-placement]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.rolePlacement===settings.rolePlacement)));
    rolePanel.querySelectorAll('[data-role-color]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.roleColor===settings.roleColor)));
    panel.querySelector('[data-font-count]').textContent=`${fonts.findIndex(item=>item.id===settings.font)+1} / ${fonts.length}`;
    panel.querySelector('[data-greeting-size]').value=settings.size;
    panel.querySelector('[data-greeting-size-output]').textContent=`${settings.size}px`;
    panel.querySelectorAll('[data-greeting-layout]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.greetingLayout===settings.layout)));
    panel.querySelectorAll('[data-part]').forEach(button=>button.setAttribute('aria-pressed',String(settings.parts[button.dataset.part][button.dataset.format])));
    panel.querySelectorAll('[data-context]').forEach(input=>input.checked=settings[input.dataset.context]);
    panel.querySelector('[data-weather-text]').value=settings.weatherText;
    panel.querySelector('.greeting-weather-input').hidden=!settings.weather;
    if(persist){try{localStorage.setItem(key,JSON.stringify(settings))}catch{}}
  }
  panel.addEventListener('click',event=>{
    const button=event.target.closest('button'); if(!button)return;
    if(button.dataset.greetingLayout){
      settings.layout=button.dataset.greetingLayout;
      settings.size={quiet:42,emphasis:42,stacked:50,compact:34}[settings.layout];
      settings.parts.name.bold=settings.layout==='emphasis';
    }
    if(button.dataset.fontStep){const index=fonts.findIndex(font=>font.id===settings.font);settings.font=fonts[(index+Number(button.dataset.fontStep)+fonts.length)%fonts.length].id;}
    if(button.dataset.part){const {part,format}=button.dataset;settings.parts[part][format]=!settings.parts[part][format];}
    if(button.dataset.rolePlacement)settings.rolePlacement=button.dataset.rolePlacement;
    if(button.dataset.roleColor)settings.roleColor=button.dataset.roleColor;
    if(button.hasAttribute('data-greeting-reset'))settings=normalize(null);
    apply();
  });
  panel.querySelector('select[aria-label="Page font"]').addEventListener('change',event=>{settings.font=event.target.value;apply()});
  rolePanel.querySelector('select').addEventListener('change',event=>{settings.role=event.target.value;apply()});
  panel.addEventListener('input',event=>{
    const input=event.target;
    if(input.hasAttribute('data-greeting-size'))settings.size=Number(input.value);
    else if(input.dataset.context)settings[input.dataset.context]=input.checked;
    else if(input.hasAttribute('data-weather-text'))settings.weatherText=input.value;
    else return;
    apply();
  });
  apply(false);
  document.addEventListener('greeting:phrase-changed',event=>{
    if(!['Hello','Good Afternoon','Welcome Home','Morning'].includes(event.detail?.phrase))return;
    settings.phrase=event.detail.phrase;apply();
  });
  document.addEventListener('greeting:size-changed',event=>{
    if (!Number.isFinite(event.detail?.size)) return;
    settings.size=Math.max(12,Math.min(96,Math.round(event.detail.size)));apply();
  });
  window.addEventListener('storage',event=>{if(event.key===key){let value;try{value=JSON.parse(event.newValue)}catch{}settings=normalize(value);apply(false)}});
})();
