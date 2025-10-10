// Initialize animations
AOS.init({ duration: 800, once: true });

// Grab clickable links & content container, skip external links
const links = document.querySelectorAll('.main-nav a:not(.external-link)');
const container = document.getElementById('content');

async function loadSection(route, addToHistory = true) {
  container.classList.add('fade-out');

  // derive the file: "/" → "index.html", "/games" → "games.html"
  const file = route === '/' ? 'index.html' : `${route.replace(/^\/|\/$/g, '')}.html`;

  const res  = await fetch(file, { credentials: 'omit' });
  if (!res.ok) {
    console.error(`Failed to load ${file}: ${res.status}`);
    // Optional: load a 404 page or show a toast here
    container.classList.remove('fade-out');
    return;
  }

  const html = await res.text();
  const doc  = new DOMParser().parseFromString(html, 'text/html');

  // ===== swap main content =====
  const newMain = doc.querySelector('main')?.innerHTML ?? '';
  container.innerHTML = newMain;

  // ===== update the <title> =====
  const newTitle = doc.querySelector('title')?.textContent?.trim();
  if (newTitle) document.title = newTitle;

  // ===== UI polish =====
  window.scrollTo({ top: 0, behavior: 'instant' }); // ensures new section starts at top
  AOS.refresh(); // re-init AOS on fresh content
  container.classList.replace('fade-out', 'fade-in');

  if (addToHistory) history.pushState({ route }, newTitle || '', route);
}


// wire up clicks
links.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    loadSection(link.getAttribute('href'));
  });
});

// handle back/forward
window.addEventListener('popstate', () => {
  loadSection(location.pathname, false);
});
