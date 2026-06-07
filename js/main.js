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

/* Modal de agendamento */
const modalOverlay = document.getElementById('modal-agendamento');
const btnAgendar   = document.getElementById('btn-agendar');
const modalClose   = document.getElementById('modal-close');
const formAgendar  = document.getElementById('form-agendamento');
const formMsg      = document.getElementById('form-msg');
const btnSubmit    = document.getElementById('btn-submit');

function openModal()  { modalOverlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => {
    formAgendar.reset();
    formMsg.className = 'form-msg';
    formMsg.textContent = '';
    btnSubmit.disabled = false;
    btnSubmit.textContent = 'Enviar solicitação';
  }, 350);
}

/* Máscara WhatsApp: (XX) XXXXX-XXXX */
document.getElementById('f-whatsapp').addEventListener('input', function () {
  let v = this.value.replace(/\D/g, '').slice(0, 11);
  if      (v.length > 10) v = v.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  else if (v.length > 6)  v = v.replace(/^(\d{2})(\d{4,5})(\d*)$/, '($1) $2-$3');
  else if (v.length > 2)  v = v.replace(/^(\d{2})(\d+)$/, '($1) $2');
  else if (v.length > 0)  v = '(' + v;
  this.value = v;
});

btnAgendar.addEventListener('click', openModal);
modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

formAgendar.addEventListener('submit', async e => {
  e.preventDefault();
  formMsg.className = 'form-msg';
  formMsg.textContent = '';

  const data = {
    nome:            document.getElementById('f-nome').value.trim(),
    email:           document.getElementById('f-email').value.trim(),
    whatsapp:        document.getElementById('f-whatsapp').value.trim(),
    disponibilidade: document.getElementById('f-disponibilidade').value.trim(),
  };

  if (!data.nome || !data.email || !data.whatsapp || !data.disponibilidade) {
    formMsg.textContent = 'Por favor, preencha todos os campos.';
    formMsg.className = 'form-msg err';
    return;
  }

  btnSubmit.disabled = true;
  btnSubmit.textContent = 'Enviando...';

  try {
    const res  = await fetch('/api/agendamento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.ok) {
      formMsg.textContent = 'Solicitação enviada! Camila entrará em contato em breve.';
      formMsg.className = 'form-msg ok';
      formAgendar.reset();
    } else {
      throw new Error(json.error);
    }
  } catch {
    formMsg.textContent = 'Erro ao enviar. Tente novamente.';
    formMsg.className = 'form-msg err';
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.textContent = 'Enviar solicitação';
  }
});

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
