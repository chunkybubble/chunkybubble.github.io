// Initialize animations
AOS.init({ duration: 800, once: true });

// Grab clickable links & content container
const links = document.querySelectorAll('.main-nav a');
const container = document.getElementById('content');

async function loadSection(route, addToHistory = true) {
  container.classList.add('fade-out');

  // derive the actual file to fetch:
  // "/" → "index.html", "/games" → "games.html", etc.
  let file = route === '/' 
    ? 'index.html' 
    : `${route.replace(/^\/|\/$/g, '')}.html`;

  const res  = await fetch(file);
  const html = await res.text();
  const doc  = new DOMParser().parseFromString(html, 'text/html');
  const newMain = doc.querySelector('main').innerHTML;

  container.innerHTML = newMain;
  AOS.refresh();   // re-init AOS on fresh content
  container.classList.replace('fade-out', 'fade-in');

  if (addToHistory) history.pushState(null, '', route);
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
