// Initialize AOS
AOS.init({ duration: 800, once: true });

// Page transition overlay
const transitionOverlay = document.createElement('div');
transitionOverlay.classList.add('page-transition');
document.body.appendChild(transitionOverlay);

function animateOut() {
  return gsap.to(transitionOverlay, {
    opacity: 1,
    duration: 0.5,
    ease: 'power2.inOut'
  });
}

function animateIn() {
  return gsap.to(transitionOverlay, {
    opacity: 0,
    duration: 0.5,
    ease: 'power2.inOut'
  });
}

// On link clicks, animate out then navigate
document.querySelectorAll('.main-nav a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const href = link.getAttribute('href');
    animateOut().then(() => {
      window.location = href;
    });
  });
});

// Fade overlay away on initial load
window.addEventListener('load', () => {
  gsap.set(transitionOverlay, { opacity: 1 });
  animateIn();
});

// Card tilt on hover (optional)
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const { width, height, left, top } = card.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    gsap.to(card, { rotationY: x * 10, rotationX: -y * 10, ease: 'power2.out' });
  });
  card.addEventListener('mouseleave', () => {
    gsap.to(card, { rotationY: 0, rotationX: 0, ease: 'power2.out' });
  });
});
