// ============================================
// Interacciones del portfolio
// ============================================

// --- Efecto de escritura en el hero ---
const roles = [
    'Desarrollador Full-Stack',
    'Bachiller en Ing. Informática',
    'Automatización e IA aplicada',
    'Sistemas en producción'
];

const typedEl = document.getElementById('typed');
let roleIndex = 0;
let charIndex = 0;
let deleting = false;

function type() {
    const current = roles[roleIndex];

    if (!deleting) {
        typedEl.textContent = current.slice(0, ++charIndex);
        if (charIndex === current.length) {
            deleting = true;
            setTimeout(type, 2200);
            return;
        }
    } else {
        typedEl.textContent = current.slice(0, --charIndex);
        if (charIndex === 0) {
            deleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
        }
    }

    setTimeout(type, deleting ? 40 : 75);
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reducedMotion) {
    typedEl.textContent = roles[0];
} else {
    type();
}

// --- Aparición de elementos al hacer scroll ---
const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// --- Contadores animados en "Sobre mí" ---
const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const duration = 1200;
        const start = performance.now();

        function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(target * eased);
            if (progress < 1) requestAnimationFrame(tick);
        }

        reducedMotion ? (el.textContent = target) : requestAnimationFrame(tick);
        counterObserver.unobserve(el);
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num').forEach(el => counterObserver.observe(el));

// --- Nav: fondo al hacer scroll + barra de progreso ---
const nav = document.querySelector('.nav');
const progressBar = document.querySelector('.scroll-progress');

window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 30);

    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (window.scrollY / scrollable) * 100 + '%';
}, { passive: true });

// --- Menú móvil ---
const toggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

toggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
});

navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        toggle.classList.remove('open');
    });
});
