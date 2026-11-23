(() => {
  if(document.documentElement.dataset.dashboardShell!=='monochrome')return;
  const greeting=document.querySelector('.dashboard .welcome');
  if(greeting){
    greeting.id='dashboard-greeting';
  }
  const packages=document.querySelector('#packages .card-heading h2');
  if(packages){
    const text=[...packages.childNodes].find(node=>node.nodeType===Node.TEXT_NODE&&node.textContent.trim());
    if(text)text.textContent='Recent Packages';
  }
  for(const id of ['packages','announcements','maint-queue','schedule']){
    const section=document.getElementById(id),heading=section?.querySelector('.card-heading h2');
    if(section&&heading){heading.id=heading.id||`home-section-${id}`;section.setAttribute('aria-labelledby',heading.id);}
  }
  const shop=document.querySelector('#shop');
  const content=shop?.querySelector('.shop-content');
  const title=content?.querySelector('h2');
  if(shop&&content&&title){
    const heading=document.createElement('div');heading.className='card-heading';heading.append(title);shop.prepend(heading);
    const imagePanel=document.createElement('div');imagePanel.className='monochrome-shop-panel';
    content.before(imagePanel);imagePanel.append(content);
  }
})();
