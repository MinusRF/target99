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
function moreInfo(id){ alert('For more details about property id: ' + id + '\\nPlease contact us or scroll to Contact section.'); }

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
})();
