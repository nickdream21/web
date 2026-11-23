// Proyectos: pestañas de la terminal. Siempre hay una abierta.
const tabs = [...document.querySelectorAll('#deck .tab')];

function selectTab(tab) {
    tabs.forEach(t => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
}

tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', e => {
        const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!step) return;
        e.preventDefault();
        const next = tabs[(i + step + tabs.length) % tabs.length];
        next.focus();
        selectTab(next);
    });
});

if (tabs.length) selectTab(tabs[0]);

// Línea de estado: marca la sección que se está leyendo.
const navLinks = [...document.querySelectorAll('.status-nav a')];
const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(a => a.classList.toggle('on', a.hash === '#' + entry.target.id));
    });
}, { rootMargin: '-45% 0px -45% 0px' });

document.querySelectorAll('[data-section]').forEach(s => sectionObserver.observe(s));

// Hora de Piura.
const clock = document.getElementById('clock');
const timeFormat = new Intl.DateTimeFormat('es-PE', {
    timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit', hour12: false
});
const tick = () => { clock.textContent = 'Piura ' + timeFormat.format(new Date()); };
tick();
setInterval(tick, 30000);

// Último push, leído de la API pública de GitHub.
// Si falla, la terminal del inicio conserva el enlace al perfil.
const push = document.getElementById('push');

function timeAgo(date) {
    const minutes = Math.round((Date.now() - date.getTime()) / 60000);
    const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
    if (minutes < 60) return rtf.format(-Math.max(minutes, 1), 'minute');
    if (minutes < 1440) return rtf.format(-Math.round(minutes / 60), 'hour');
    return rtf.format(-Math.round(minutes / 1440), 'day');
}

function showPush(repo) {
    push.textContent = `último push ${timeAgo(new Date(repo.pushed_at))} en ${repo.name}`;
    push.href = repo.html_url;
}

(async () => {
    try {
        const cached = sessionStorage.getItem('push');
        if (cached) return showPush(JSON.parse(cached));
        const res = await fetch('https://api.github.com/users/nickdream21/repos?sort=pushed&per_page=1');
        if (!res.ok) return;
        const [repo] = await res.json();
        if (!repo) return;
        const data = { name: repo.name, pushed_at: repo.pushed_at, html_url: repo.html_url };
        sessionStorage.setItem('push', JSON.stringify(data));
        showPush(data);
    } catch { /* sin red o sin cuota: queda el enlace al perfil */ }
})();

// Copiar el correo.
const copy = document.getElementById('copy');
copy.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(copy.dataset.copy);
        copy.textContent = 'Correo copiado';
    } catch {
        copy.textContent = 'No se pudo copiar';
    }
    setTimeout(() => { copy.textContent = 'Copiar correo'; }, 2000);
});
