// Hamburger menu
const hamburger = document.querySelector('.nav-hamburger');
const navLinks = document.querySelector('.nav-links');
const overlay = document.querySelector('.nav-mobile-overlay');

function closeMenu() {
  hamburger.classList.remove('open');
  navLinks.classList.remove('open');
  overlay.classList.remove('visible');
  document.body.classList.remove('menu-open');
  hamburger.setAttribute('aria-expanded', 'false');
}

hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  overlay.classList.toggle('visible', isOpen);
  document.body.classList.toggle('menu-open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
});

overlay.addEventListener('click', closeMenu);
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

// Smooth scroll fallback
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
  });
});

// Active nav highlight
const sections = document.querySelectorAll('section[id]');
const links = document.querySelectorAll('.nav-links a');

const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      links.forEach(l => l.style.color = '');
      const active = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
      if (active) active.style.color = 'var(--accent)';
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => observer.observe(s));

// Hero stats counter animation
function animateCounter(el, target, duration) {
  const isPercent = target.toString().includes('%');
  const num = parseInt(target);
  const start = performance.now();
  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(eased * num);
    el.textContent = isPercent ? value + '%' : value;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const heroStats = document.querySelector('.hero-stats');
let countersDone = false;
const statsObserver = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting && !countersDone) {
    countersDone = true;
    document.querySelectorAll('.hero-stat-num').forEach(el => {
      const val = el.textContent.trim();
      if (val === '∞') return;
      animateCounter(el, val, 1800);
    });
  }
}, { threshold: 0.5 });
if (heroStats) statsObserver.observe(heroStats);

// Generic slider factory
function initSlider(trackSel, prevSel, nextSel, dotsSel, gap, visibleFn) {
  const track = document.querySelector(trackSel);
  if (!track) return;
  const cards = Array.from(track.children);
  const prevBtn = document.querySelector(prevSel);
  const nextBtn = document.querySelector(nextSel);
  const dotsContainer = document.querySelector(dotsSel);

  let current = 0;

  function maxIndex() { return cards.length - visibleFn(); }
  function cardWidth() { return cards[0].getBoundingClientRect().width + gap; }

  function buildDots() {
    dotsContainer.innerHTML = '';
    for (let i = 0; i <= maxIndex(); i++) {
      const dot = document.createElement('button');
      dot.className = 'chata-slider-dot' + (i === current ? ' active' : '');
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots() {
    dotsContainer.querySelectorAll('.chata-slider-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function goTo(index) {
    current = Math.max(0, Math.min(index, maxIndex()));
    track.style.transform = `translateX(-${current * cardWidth()}px)`;
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === maxIndex();
    updateDots();
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(current + (diff > 0 ? 1 : -1));
  });

  window.addEventListener('resize', () => { buildDots(); goTo(Math.min(current, maxIndex())); });

  buildDots();
  goTo(0);
}

initSlider(
  '.historky-grid',
  '.historky-slider-prev',
  '.historky-slider-next',
  '.historky-slider-dots',
  24,
  () => window.innerWidth <= 768 ? 1 : 2
);

initSlider(
  '.chata-roky-grid',
  '.chata-slider-prev',
  '.chata-slider-next',
  '.chata-slider-dots',
  20,
  () => window.innerWidth <= 768 ? 1 : 4
);
