// Load a partial HTML file and inject it into a selector.
// Tries multiple paths so the site works whether partials live in /partials or the root.
async function loadPartial(files, selector) {
  const fileList = Array.isArray(files) ? files : [files];
  let html = '';

  for (const file of fileList) {
    try {
      const res = await fetch(file);
      if (res.ok) {
        html = await res.text();
        break;
      }
    } catch (error) {
      // Try the next fallback path.
    }
  }

  const el = document.querySelector(selector);
  if (el && html) el.outerHTML = html;
}

const container = document.getElementById('content');

function getCurrentPage(path = location.pathname) {
  const cleanPath = path
    .replace(/\/index\.html$/, '/')
    .replace(/\.html$/, '')
    .replace(/\/$/, '') || '/';

  if (cleanPath === '/') return 'about';
  if (cleanPath.startsWith('/games')) return 'games';
  if (cleanPath.startsWith('/projects') || cleanPath.includes('cave-tool') || cleanPath.includes('landing-simulator')) return 'projects';
  if (cleanPath.startsWith('/contact')) return 'contact';

  return '';
}

function setActiveNav(path = location.pathname) {
  const currentPage = getCurrentPage(path);

  document.querySelectorAll('.main-nav a').forEach(link => {
    link.classList.remove('active-page');

    // Resume should never be highlighted.
    if (link.classList.contains('external-link')) return;

    const href = link.getAttribute('href') || '';
    const linkPage = getCurrentPage(href);

    if (linkPage === currentPage) {
      link.classList.add('active-page');
    }
  });
}

async function loadSection(route, addToHistory = true) {
  if (!container) return;

  container.classList.add('fade-out');

  // derive the file: "/" → "index.html", "/games" → "games.html"
  const file = route === '/' ? '/index.html' : `/${route.replace(/^\/|\/$/g, '')}.html`;

  const res = await fetch(file, { credentials: 'omit' });
  if (!res.ok) {
    console.error(`Failed to load ${file}: ${res.status}`);
    container.classList.remove('fade-out');
    return;
  }

  const html = await res.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');

  // ===== swap main content =====
  const newMain = doc.querySelector('main')?.innerHTML ?? '';
  container.innerHTML = newMain;

  // ===== update the <title> =====
  const newTitle = doc.querySelector('title')?.textContent?.trim();
  if (newTitle) document.title = newTitle;

  // ===== UI polish =====
  window.scrollTo({ top: 0, behavior: 'instant' });
  if (window.AOS) AOS.refresh();
  container.classList.replace('fade-out', 'fade-in');
  setActiveNav(route);

  if (addToHistory) history.pushState({ route }, newTitle || '', route);
}

// Initialize partials and animations
async function init() {
  await Promise.all([
    loadPartial('/partials/header.html', 'header'),
    loadPartial('/partials/footer.html', 'footer'),
  ]);

  // Wire up nav clicks after header is injected. Resume is ignored because it opens a PDF.
  const links = document.querySelectorAll('.main-nav a:not(.external-link)');
  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      loadSection(link.getAttribute('href'));
    });
  });

  setActiveNav();

  if (window.AOS) {
    AOS.init({ duration: 800, once: true });
  }
}

init();

// handle back/forward
window.addEventListener('popstate', () => {
  loadSection(location.pathname, false);
});
