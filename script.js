const CONFIG = {
  csvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSV4LNJm-Lw-zSo5hCbYNaN8KBt_v36r7e2dQkr72tQVteWN2McQ8tA8tltenNITqpmYfuMKsefzY4r/pub?gid=0&single=true&output=csv",
  imageField: "image_filename"
};

function escapeHtml(s) {
  return (s || "").replace(/[&<>"']/g, m => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[m]));
}

function getImageUrl(filename) {
  if (!filename) return "images/placeholder.jpg";
  return "images/" + encodeURIComponent(filename.trim());
}

async function fetchData() {
  const url = CONFIG.csvUrl + "&t=" + Date.now();
  const res = await fetch(url);
  const text = await res.text();
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
  return parsed.data;
}

function renderProperties(data) {
  const container = document.getElementById("property-list");
  container.innerHTML = "";
  data.forEach(row => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${getImageUrl(row[CONFIG.imageField])}" alt="${escapeHtml(row.title)}" onerror="this.src='images/placeholder.jpg'"/>
      <div class="card-body">
        <h3>${escapeHtml(row.title)}</h3>
        <p>${escapeHtml(row.description)}</p>
        <p class="price">₹${escapeHtml(row.price)}</p>
        <p><small>${escapeHtml(row.address)}</small></p>
        <button onclick="document.getElementById('contact').scrollIntoView({behavior:'smooth'})">More Details</button>
      </div>
    `;
    container.appendChild(card);
  });
}

(async function init() {
  const data = await fetchData();
  renderProperties(data);

  document.getElementById("search").addEventListener("input", e => {
    const q = e.target.value.toLowerCase();
    const filtered = data.filter(d =>
      (d.title + d.description + d.address).toLowerCase().includes(q)
    );
    renderProperties(filtered);
  });
})();
