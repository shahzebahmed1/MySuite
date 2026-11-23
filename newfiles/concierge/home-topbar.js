(() => {
  if(document.documentElement.dataset.dashboardShell!=='monochrome')return;
  const main=document.querySelector('main');if(!main)return;
  const bar=document.createElement('div');bar.className='home-topbar';bar.setAttribute('aria-label','Dashboard shortcuts');
  bar.innerHTML=`<div class="topbar-heading"><span class="topbar-community-line">Board Of Directors</span><h1></h1></div><div class="home-topbar-actions"><label class="topbar-search-field" for="home-topbar-query"><button type="button" class="topbar-icon" data-topbar="search" aria-label="Search the portal" aria-expanded="false" aria-controls="home-topbar-search"><i data-icon="search"></i></button><input id="home-topbar-query" type="search" placeholder="Search the portal?" autocomplete="off" aria-label="Search the portal" aria-controls="home-topbar-search"></label><a class="topbar-primary" href="packages.html?action=log-package"><i data-icon="package"></i>Log Package</a><button type="button" class="topbar-assistant" data-topbar="assistant" aria-expanded="false" aria-controls="home-topbar-assistant"><i data-icon="sparkle"></i>AI Assistant</button></div><div class="home-topbar-account"><button type="button" class="topbar-icon" data-action="notifications" aria-label="Notifications" title="Notifications"><i data-icon="bell"></i></button><button type="button" class="topbar-profile" data-action="profile" aria-label="Open your profile"><span class="topbar-avatar"></span><span class="topbar-profile-copy"><strong></strong><small>Concierge</small></span><i data-icon="chevron"></i></button></div><section class="topbar-popover" id="home-topbar-search" hidden aria-label="Portal search"><strong>Find a page</strong><div class="topbar-search-results"></div></section><section class="topbar-popover" id="home-topbar-assistant" hidden aria-label="AI Assistant preview"><strong>AI Assistant</strong><p>This is a design preview. AI chat is not connected yet.</p><a href="contact-directory.html">Find a resident</a><a href="packages.html">Review packages</a><a href="daily-log.html">Open the activity log</a></section>`;
  main.prepend(bar);
  document.body.setAttribute('data-home-title-in-topbar','');
  const name=document.querySelector('.sidebar [data-user-name]')?.textContent.trim()||'Shahzeb';
  bar.querySelector('.topbar-profile-copy strong').textContent=name;
  bar.querySelector('.topbar-heading h1').textContent=`Good Morning, ${name.split(/\s+/)[0]}`;
  bar.querySelector('.topbar-avatar').textContent=name.split(/\s+/).map(part=>part[0]).slice(0,2).join('').toUpperCase();
  if(typeof renderIcons==='function')renderIcons(bar);
  const pages=[['Home','./'],['Contact directory','contact-directory.html'],['Packages','packages.html'],['Incident Reports','incident-report.html'],['Activity Log','daily-log.html'],['Amenities','amenities.html'],['Book elevator','elevator-bookings.html'],['Long-term absence','long-term-absence.html'],['Maintenance','maintenance.html'],['Announcements','announcements.html']];
  const input=bar.querySelector('input'),results=bar.querySelector('.topbar-search-results');
  function search(){results.replaceChildren();const matches=pages.filter(([label])=>label.toLowerCase().includes(input.value.trim().toLowerCase()));for(const[label,url]of matches){const link=document.createElement('a');link.href=url;link.textContent=label;results.append(link)}if(!matches.length)results.textContent='No matching pages.';}
  function revealSearch(){close();bar.querySelector('#home-topbar-search').hidden=false;bar.querySelector('[data-topbar="search"]').setAttribute('aria-expanded','true');}
  input.addEventListener('input',()=>{search();revealSearch()});input.addEventListener('focus',revealSearch);search();
  function close(){for(const id of ['search','assistant']){bar.querySelector(`#home-topbar-${id}`).hidden=true;bar.querySelector(`[data-topbar="${id}"]`).setAttribute('aria-expanded','false')}}
  bar.addEventListener('click',event=>{const button=event.target.closest('[data-topbar]');if(!button)return;const action=button.dataset.topbar;
    if(action==='settings'){document.querySelector('.home-tools-toggle')?.click();return;}
    const panel=bar.querySelector(`#home-topbar-${action}`),opening=panel.hidden;close();panel.hidden=!opening;button.setAttribute('aria-expanded',String(opening));if(opening&&action==='search')input.focus();
  });
  document.addEventListener('click',event=>{if(!bar.contains(event.target))close()});
  bar.addEventListener('keydown',event=>{if(event.key==='Escape'){const open=bar.querySelector('[aria-expanded="true"]');close();open?.focus()}});
})();
