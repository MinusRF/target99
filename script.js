const CONFIG = {
  csvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSV4LNJm-Lw-zSo5hCbYNaN8KBt_v36r7e2dQkr72tQVteWN2McQ8tA8tltenNITqpmYfuMKsefzY4r/pub?gid=0&single=true&output=csv",
  imageField: "image_filename"
};

function esc(s){ return (s||'').toString().replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function imgUrl(n){ return n ? 'images/' + encodeURIComponent(n.trim()) : 'images/placeholder.jpg'; }

async function fetchData(){
  try{
    const res = await fetch(CONFIG.csvUrl + '&t=' + Date.now());
    const txt = await res.text();
    const parsed = Papa.parse(txt, {header:true, skipEmptyLines:true, transformHeader:h=>h.trim().toLowerCase()});
    return parsed.data.map(r=>({
      id: (r.id||'').trim(),
      title: (r.title||'').trim(),
      description: (r.description||'').trim(),
      price: (r.price||'').trim(),
      address: (r.address||'').trim(),
      image_filename: (r[CONFIG.imageField]||'').trim()
    }));
  }catch(e){
    console.error(e);
    return [];
  }
}

function createCard(item){
  const div = document.createElement('div'); div.className = 'card';
  div.innerHTML = `
    <img src="${esc(imgUrl(item.image_filename))}" alt="${esc(item.title)}" onerror="this.src='images/placeholder.jpg'"/>
    <div class="card-body">
      <h3>${esc(item.title)}</h3>
      <p>${esc(item.description)}</p>
      <p class="price">₹${esc(item.price)}</p>
      <p><small>${esc(item.address)}</small></p>
      <div style="display:flex;gap:.5rem;margin-top:.6rem">
        <button class="btn primary" onclick="scrollToContact()">Contact Us</button>
        <button class="btn" style="background:transparent;border:1px solid rgba(255,255,255,0.06);color:var(--gold)" onclick="moreInfo('${esc(item.id)}')">More details</button>
      </div>
    </div>
  `;
  return div;
}

function scrollToContact(){ document.getElementById('contact').scrollIntoView({behavior:'smooth'}); }
function moreInfo(id){ alert('Please contact us using details from website'); }

(async function init(){
  const data = await fetchData();
  const container = document.getElementById('property-list');
  container.innerHTML = '';
  data.forEach(it => container.appendChild(createCard(it)));

  // search
  const search = document.getElementById('search');
  const clearBtn = document.getElementById('search-clear');
  search.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    const filtered = data.filter(d => (d.title + ' ' + d.description + ' ' + d.address + ' ' + d.price).toLowerCase().includes(q));
    container.innerHTML = ''; filtered.forEach(it=>container.appendChild(createCard(it)));
  });
  clearBtn.addEventListener('click', ()=>{ search.value=''; search.dispatchEvent(new Event('input')); });

  // contact form (local only)
  document.getElementById('contact-submit').addEventListener('click', ()=>{
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    if(!name||!phone){ alert('Please provide name and phone'); return; }
    alert('Thanks ' + name + '. We will call you soon.');
    document.getElementById('contact-form').reset();
  });

  // small nav toggle for mobile
  const navToggle = document.querySelector('.nav-toggle');
  navToggle.addEventListener('click', ()=>{
    const nav = document.querySelector('.nav-links');
    nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
  });

  // rotating hero background
  (function heroRotator(){
    const slides = Array.from(document.querySelectorAll('.hero-bg .slide'));
    if(!slides.length) return;

    // preload images
    slides.forEach(s => {
      const url = s.dataset.src || (s.style.backgroundImage || '').slice(5,-2);
      if(url) new Image().src = url;
    });

    // initial state
    slides.forEach((s,i) => s.classList.toggle('active', i === 0));
    let idx = 0;
    const intervalMs = 5000;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(prefersReduced) return;

    function nextSlide(){
      const prev = slides[idx];
      idx = (idx + 1) % slides.length;
      const cur = slides[idx];
      prev.classList.remove('active');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          cur.classList.add('active');
        });
      });
    }

    let timer = setInterval(nextSlide, intervalMs);

    // pause rotation on user interaction
    const heroEl = document.querySelector('.hero');
    if(heroEl){
      heroEl.addEventListener('mouseenter', ()=> clearInterval(timer));
      heroEl.addEventListener('focusin', ()=> clearInterval(timer));
      heroEl.addEventListener('mouseleave', ()=>{
        clearInterval(timer);
        timer = setInterval(nextSlide, intervalMs);
      });
    }
  })();
})();
