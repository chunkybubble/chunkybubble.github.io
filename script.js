// Load a partial HTML file and inject it into a selector
async function loadPartial(file, selector) {
  const res = await fetch(file);
  if (!res.ok) return;
  const html = await res.text();
  const el = document.querySelector(selector);
  if (el) el.outerHTML = html;
}

const container = document.getElementById('content');

async function loadSection(route, addToHistory = true) {
  container.classList.add('fade-out');

  // derive the file: "/" → "index.html", "/games" → "games.html"
  const file = route === '/' ? '/index.html' : `/${route.replace(/^\/|\/$/g, '')}.html`;

  const res  = await fetch(file, { credentials: 'omit' });
  if (!res.ok) {
    console.error(`Failed to load ${file}: ${res.status}`);
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
  window.scrollTo({ top: 0, behavior: 'instant' });
  AOS.refresh();
  container.classList.replace('fade-out', 'fade-in');

  if (addToHistory) history.pushState({ route }, newTitle || '', route);
}

// Initialize partials and animations
async function init() {
  await Promise.all([
    loadPartial('/partials/header.html', 'header'),
    loadPartial('/partials/footer.html', 'footer'),
  ]);

  // Wire up nav clicks after header is injected
  const links = document.querySelectorAll('.main-nav a:not(.external-link)');
  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      loadSection(link.getAttribute('href'));
    });
  });

  AOS.init({ duration: 800, once: true });
}

init();

// handle back/forward
window.addEventListener('popstate', () => {
  loadSection(location.pathname, false);
});