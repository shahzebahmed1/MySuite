/* MySuite dashboard. All data and interactions here are LOCAL DEMO DATA.
   Connect your own authenticated services before using this in production. */
const icons={
 home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
 building:'<path d="M3 21V7h6V3h7v8h5v10M9 21V7m7 14V11M1 21h22M6 10v1m0 3v1m6-9v1m0 3v1m0 3v1m7-1v1M11 21v-3h3v3"/>',
 megaphone:'<path d="m4 9 13-5v15L4 14H2V9zm3 6 2 6h3l-2-5M20 8l2-1m-2 9 2 1M20 12h3"/>',
 pool:'<path d="M2 13c2-3 4 3 7 0s5 3 8 0 4 1 5 0M2 18c2-3 4 3 7 0s5 3 8 0 4 1 5 0M6 9V4a2 2 0 0 1 4 0m3 7V4a2 2 0 0 1 4 0M6 7h7"/>',
 wrench:'<path d="M21 3a6 6 0 0 1-7 8L6 20a2 2 0 0 1-3-3l9-8a6 6 0 0 1 8-7l-4 4 2 2z"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v5m10-5v5M3 11h18m-14 4h3"/>',
 file:'<path d="M14 2H5v20h14V7zm0 0v6h5M8 12h8m-8 4h8"/>',
 bag:'<rect x="4" y="7" width="16" height="15" rx="2"/><path d="M8 9V6a4 4 0 0 1 8 0v3"/>',
 users:'<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3m2-17a3 3 0 0 1 0 6m2 11v-3a5 5 0 0 0-3-5"/>',
 board:'<rect x="7" y="3" width="10" height="7" rx="1"/><path d="M12 10v4M4 17v-3h16v3"/><rect x="1" y="17" width="6" height="5" rx="1"/><rect x="9" y="17" width="6" height="5" rx="1"/><rect x="17" y="17" width="6" height="5" rx="1"/>',
 bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 10h18c0-2-3-3-3-10M10 21h4"/>',
 chevron:'<path d="m9 5 7 7-7 7"/>',left:'<path d="m15 5-7 7 7 7"/>',arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
 chart:'<rect x="3" y="11" width="4" height="10" rx="1"/><rect x="10" y="3" width="4" height="18" rx="1"/><rect x="17" y="7" width="4" height="14" rx="1"/>',
 video:'<rect x="2" y="5" width="13" height="14" rx="2"/><path d="m15 10 7-4v12l-7-4"/>',
 sparkle:'<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5zM20 2v4m-2-2h4"/>',
 send:'<path d="m22 2-7 20-4-9L2 9zm-11 11L22 2"/>',menu:'<path d="M3 6h18M3 12h18M3 18h18"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>'
};
function renderIcons(root=document){root.querySelectorAll('[data-icon]').forEach(el=>{el.outerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true">${icons[el.dataset.icon]||icons.home}</svg>`})}
renderIcons();
const modal=document.querySelector('#modal');
function openModal(title,content){document.querySelector('#modal-title').textContent=title;document.querySelector('#modal-body').innerHTML=content;renderIcons(modal);if(!modal.open)modal.showModal()}
let toastTimer;
function toast(message){const el=document.querySelector('#toast');el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),4000)}
function readSaved(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
function save(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{/* The demo still works if storage is unavailable. */}}
let savedVote=readSaved('mysuite-vote',null);if(savedVote)document.querySelector('#vote-button').textContent='View your vote';
let shownMonth=new Date(2026,10,1);
function renderCalendar(){const year=shownMonth.getFullYear(),month=shownMonth.getMonth();const label=shownMonth.toLocaleDateString('en-CA',{month:'long',year:'numeric'});document.querySelector('#calendar-title').textContent=label;const first=new Date(year,month,1).getDay();const total=new Date(year,month+1,0).getDate();const isDemoMonth=year===2026&&month===10;document.querySelector('#calendar-days').innerHTML=Array.from({length:first},()=>'<span></span>').join('')+Array.from({length:total},(_,i)=>{const n=i+1;return `<button type="button" data-date="${n}" class="${isDemoMonth&&n===12?'board-day':isDemoMonth&&n===14?'event-day':''}" aria-label="${label} ${n}${isDemoMonth&&n===12?', Board meeting':isDemoMonth&&n===14?', Community social':''}">${n}</button>`}).join('');document.querySelector('#calendar-events').innerHTML=isDemoMonth?'<button data-action="meeting"><span class="event-dot"></span><span><strong>Nov 12</strong> · Board meeting</span></button><button data-action="announcement-social"><span class="event-dot light"></span><span><strong>Nov 14</strong> · Community social</span></button>':'<p class="muted">No demo events this month.</p>'}
renderCalendar();
function closeMenu(){document.querySelector('.sidebar').classList.remove('open');document.querySelector('.scrim').classList.remove('visible');document.querySelector('.mobile-toggle').setAttribute('aria-expanded','false')}
// Sidebar links are separate page redirects (not wired to the dashboard). Fill in real hrefs later.
document.querySelector('.sidebar nav')?.addEventListener('click',event=>{
  const link=event.target.closest('a.nav-item');
  if(!link)return;
  closeMenu();
  if(link.getAttribute('href')==='#')event.preventDefault();
});
const actions={
 menu(){const open=document.querySelector('.sidebar').classList.toggle('open');document.querySelector('.scrim').classList.toggle('visible',open);document.querySelector('.mobile-toggle').setAttribute('aria-expanded',String(open))},
 'close-menu':closeMenu,'close-modal':()=>modal.close(),
 notifications:()=>openModal('You’re all caught up','<p>You have two new community announcements.</p><div class="dialog-options"><button class="button outline" data-action="announcement-pool">Pool maintenance</button><button class="button outline" data-action="announcement-social">Community social</button></div>'),
 profile:()=>openModal('Alex Morgan','<p>Resident · Suite 1204<br>The Point on the Bow</p><div class="dialog-info">Board member access enabled in this demo.</div>'),
 'announcement-pool':()=>openModal('Pool maintenance','<p>The pool will be closed on Friday, November 6 for scheduled maintenance.</p><p>Thank you for your patience while we keep our amenities in great shape.</p><div class="dialog-info">Demo announcement · Building management</div>'),
 'announcement-social':()=>openModal('Community social','<p>Join your neighbours in the common room on Saturday, November 14, 2026, from 3:00–5:00 PM.</p><p>Drop by for coffee, conversation, and a chance to meet the community.</p><button class="button full" data-action="rsvp">Add a demo RSVP</button>'),
 rsvp(){save('mysuite-rsvp',true);modal.close();toast('Your demo RSVP has been saved on this device.')},
 maintenance:()=>openModal('Kitchen sink leak','<div class="dialog-info">#M-4821 · In progress</div><p><strong>Nov 5 · Request received</strong><br>Water leaking from the pipe below the kitchen sink.</p><p><strong>Nov 6 · Assigned to maintenance</strong><br>Your building team is reviewing availability. They will confirm the appointment with you.</p><p class="muted">Sample request for this dashboard demo.</p>'),
 vote(){openModal('Lobby refresh',savedVote?`<p>Your demo vote has been saved: <strong>${savedVote==='warm'?'Warm natural finishes':'Contemporary neutral finishes'}</strong>.</p><p>This is stored only in your browser. No official vote has been cast.</p><button class="button outline full" data-action="change-vote">Change demo vote</button>`:'<p>Which direction would you prefer for our lobby refresh?</p><div class="dialog-options"><button class="button outline" data-vote="warm">Warm natural finishes</button><button class="button outline" data-vote="neutral">Contemporary neutral finishes</button></div><p>Demo only. Your selection stays on this device.</p>')},
 'change-vote'(){savedVote=null;save('mysuite-vote',null);document.querySelector('#vote-button').textContent='Vote now';actions.vote()},
 meeting:()=>openModal('Board meeting','<p>Thursday, November 12, 2026 · 6:00 PM<br>Google Meet · Board members</p><div class="dialog-info">No meeting link is configured in this demo. Add your real Google Meet or Zoom URL before enabling the join action.</div><p>Agenda: building updates, maintenance priorities, and the lobby refresh.</p>'),
 documents:()=>openModal('Condo documents','<p>The dashboard is ready to connect to your document service.</p><div class="dialog-info">No documents have been uploaded to this demo. Add policies, bylaws, and resident guides through your future backend.</div>'),
 board:()=>openModal('Board workspace','<p>You’re viewing the resident dashboard with board member access.</p><p>Board documents, vote creation, and meeting management can be added as separate screens.</p><div class="dialog-info">Production access must be enforced by your server, not by hiding interface elements.</div>'),
 shop:()=>openModal('Fobs & essentials','<p>A preview of the essentials available through your building.</p><div class="dialog-info">Entry fobs · Batteries · Everyday supplies</div><p>Ordering and checkout are outside this dashboard demo. Connect your inventory and payment service to enable purchases.</p>'),
 help:()=>openModal('A little help, close to home','<p>For this demo, explore bookings, your maintenance request, and the community vote from the dashboard.</p><p>Add your concierge or management team’s real contact information here before launch.</p>')
};
document.addEventListener('click',event=>{const button=event.target.closest('[data-action],[data-scroll],[data-book],[data-month],[data-date],[data-vote]');if(!button)return;if(button.dataset.scroll){closeMenu();document.getElementById(button.dataset.scroll).scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});return}if(button.dataset.month){shownMonth=new Date(shownMonth.getFullYear(),shownMonth.getMonth()+Number(button.dataset.month),1);renderCalendar();return}if(button.dataset.date){const n=Number(button.dataset.date),demo=shownMonth.getFullYear()===2026&&shownMonth.getMonth()===10;if(demo&&n===12)actions.meeting();else if(demo&&n===14)actions['announcement-social']();else toast(`No demo events on ${shownMonth.toLocaleDateString('en-CA',{month:'long'})} ${n}.`);return}if(button.dataset.book){const amenity=button.dataset.book;openModal(`Reserve the ${amenity.toLowerCase()}`,`<p>Choose a date and time for your demo booking.</p><form id="booking-form"><input type="hidden" name="amenity" value="${amenity}"><label>Date<input type="date" name="date" required min="${localDate()}"></label><label>Time<select name="time"><option>9:00 AM</option><option>11:00 AM</option><option>1:00 PM</option><option>3:00 PM</option><option>5:00 PM</option></select></label><p>Demo only. Availability and building rules are not checked.</p><button class="button full">Save demo booking</button></form>`);return}if(button.dataset.vote){savedVote=button.dataset.vote;save('mysuite-vote',savedVote);document.querySelector('#vote-button').textContent='View your vote';modal.close();toast('Demo vote saved on this device.');return}if(button.dataset.action){if(button.closest('.sidebar'))closeMenu();actions[button.dataset.action]?.()}});
function localDate(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
document.addEventListener('submit',event=>{if(event.target.id==='booking-form'){event.preventDefault();const data=Object.fromEntries(new FormData(event.target));save('mysuite-booking',data);modal.close();toast(`${data.amenity} demo booking saved for ${data.date}, ${data.time}.`)}if(event.target.id==='ai-form'){event.preventDefault();const input=document.querySelector('#ai-input');const answer=document.querySelector('#ai-answer');answer.hidden=false;answer.textContent='This is a demo assistant. No condo policies or bylaws are connected yet, so I can’t give a verified answer about your building. Connect your document search and AI service to enable this feature.';input.value=''}});
modal.addEventListener('click',event=>{if(event.target===modal){const r=modal.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)modal.close()}});
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu()});

// Header lighting is a visual preference, independent of the demo calendar.
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
