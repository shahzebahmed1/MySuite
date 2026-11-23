(() => {
 const list=document.getElementById('home-announcement-list');if(!list)return;
 const announcements=[...list.querySelectorAll('.announcement')];if(!announcements.length)return;
 list.classList.add('announcement-carousel');list.setAttribute('role','region');list.setAttribute('aria-label','Announcements');list.setAttribute('aria-roledescription','carousel');
 const slides=announcements.map((announcement,index)=>{
  const slide=document.createElement('div');slide.className='announcement-carousel-slide';slide.setAttribute('role','group');slide.setAttribute('aria-roledescription','slide');slide.setAttribute('aria-label',`${index+1} of ${announcements.length}`);announcement.before(slide);slide.append(announcement);return slide;
 });
 const dots=document.createElement('div');dots.className='announcement-carousel-dots';dots.setAttribute('role','group');dots.setAttribute('aria-label','Choose an announcement');
 const status=document.createElement('span');status.className='announcement-carousel-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 const buttons=announcements.map((announcement,index)=>{
  const button=document.createElement('button');button.type='button';button.innerHTML='<span aria-hidden="true"></span>';button.setAttribute('aria-label',`Show ${announcement.querySelector('strong')?.textContent||`announcement ${index+1}`}`);button.addEventListener('click',()=>show(index));dots.append(button);return button;
 });
 let current=0;
 function show(index){
  current=(index+slides.length)%slides.length;
  slides.forEach((slide,i)=>slide.hidden=i!==current);
  buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===current)));
  status.textContent=`Announcement ${current+1} of ${slides.length}: ${announcements[current].querySelector('strong')?.textContent||''}`;
 }
 dots.addEventListener('keydown',event=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();show(event.key==='Home'?0:event.key==='End'?slides.length-1:current+(event.key==='ArrowLeft'?-1:1));buttons[current].focus();
 });
 if(slides.length>1)list.append(dots);list.append(status);show(0);
})();
