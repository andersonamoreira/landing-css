const hd        = document.getElementById('hd');
const burger    = document.getElementById('burger');
const nav       = document.getElementById('nav');
const logoLight = document.getElementById('logo-light');
const logoDark  = document.getElementById('logo-dark');

/* Header scroll */
function onScroll() {
  if (window.scrollY > 70) {
    hd.classList.add('on');
    logoLight.style.display = 'none';
    logoDark.style.display  = 'block';
  } else {
    hd.classList.remove('on');
    logoLight.style.display = 'block';
    logoDark.style.display  = 'none';
  }

  /* Active nav link */
  let cur = '';
  document.querySelectorAll('section[id]').forEach(s => {
    if (window.scrollY >= s.offsetTop - 130) cur = s.id;
  });
  document.querySelectorAll('.hd-nav a[href^="#"]').forEach(a => {
    a.classList.toggle('cur', a.getAttribute('href') === '#' + cur);
  });
}

window.addEventListener('scroll', onScroll, { passive: true });

/* Hamburger */
burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  nav.classList.toggle('open');
});

nav.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    burger.classList.remove('open');
    nav.classList.remove('open');
  });
});

/* Intersection observer – fade animations */
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('show'); });
}, { threshold: 0.12 });

document.querySelectorAll('.up, .in').forEach(el => obs.observe(el));

/* Email obfuscation */
document.querySelectorAll('.email-obf').forEach(el => {
  const email = el.dataset.u + '@' + el.dataset.d;
  const a = document.createElement('a');
  a.href = 'mailto:' + email;
  a.textContent = email;
  a.style.fontFamily = 'var(--f-body)';
  a.style.fontSize = '.9rem';
  a.style.color = 'rgba(215,189,166,.65)';
  a.style.transition = 'var(--ease)';
  a.addEventListener('mouseenter', () => a.style.color = 'var(--c-gold)');
  a.addEventListener('mouseleave', () => a.style.color = 'rgba(215,189,166,.65)');
  el.replaceWith(a);
});

/* FAQ accordion */
document.querySelectorAll('.faq-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const item   = btn.parentElement;
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});
