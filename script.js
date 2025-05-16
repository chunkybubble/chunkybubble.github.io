// Initialize animations
AOS.init({ duration: 800, once: true });

// Grab clickable links & content container
const links = document.querySelectorAll('.main-nav a');
const container = document.getElementById('content');

// Utility to load a URL’s <main> innerHTML
async function loadSection(url, addToHistory = true) {
  // fade out
  container.classList.add('fade-out');
  const res = await fetch(url);
  const html = await res.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const newContent = doc.querySelector('main').innerHTML;
  // swap in
  container.innerHTML = newContent;
  AOS.refresh();                       // re-init AOS on new elements
  container.classList.replace('fade-out', 'fade-in');
  // update URL
  if (addToHistory) history.pushState(null, '', url);
}

// Link clicks → AJAX
links.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    loadSection(link.getAttribute('href'));
  });
});

// Back/forward support
window.addEventListener('popstate', () => {
  loadSection(location.pathname, false);
});
