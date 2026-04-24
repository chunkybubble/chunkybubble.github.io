// Load a partial HTML file and inject it into a selector.
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

function setActiveNav(route = location.pathname) {
  const normalizedRoute = route.replace(/\/$/, '') || '/';
  document.querySelectorAll('.main-nav a:not(.external-link)').forEach(link => {
    const linkRoute = link.getAttribute('href').replace(/\/$/, '') || '/';
    const isActive = linkRoute === normalizedRoute;
    link.toggleAttribute('aria-current', isActive);
  });
}

async function loadSection(route, addToHistory = true) {
  if (!container) return;

  container.classList.remove('fade-in');
  container.classList.add('fade-out');

  const cleanRoute = route.replace(/^\/|\/$/g, '');
  const file = route === '/' ? '/index.html' : `/${cleanRoute}.html`;

  const res = await fetch(file, { credentials: 'omit' });
  if (!res.ok) {
    console.error(`Failed to load ${file}: ${res.status}`);
    container.classList.remove('fade-out');
    return;
  }

  const html = await res.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');

  const newMain = doc.querySelector('main')?.innerHTML ?? '';
  const newTitle = doc.querySelector('title')?.textContent?.trim();

  window.setTimeout(() => {
    container.innerHTML = newMain;
    if (newTitle) document.title = newTitle;

    window.scrollTo({ top: 0, behavior: 'instant' });
    if (window.AOS) AOS.refresh();

    container.classList.remove('fade-out');
    container.classList.add('fade-in');
    setActiveNav(route);
  }, 160);

  if (addToHistory) history.pushState({ route }, newTitle || '', route);
}

async function init() {
  await Promise.all([
    loadPartial('/partials/header.html', 'header'),
    loadPartial('/partials/footer.html', 'footer'),
  ]);

  document.querySelectorAll('.main-nav a:not(.external-link)').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      loadSection(link.getAttribute('href'));
    });
  });

  setActiveNav();

  if (window.AOS) {
    AOS.init({ duration: 650, easing: 'ease-out-cubic', once: true, offset: 80 });
  }
}

init();

window.addEventListener('popstate', () => {
  loadSection(location.pathname, false);
});
