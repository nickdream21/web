// Proyectos: cada fila imprime su ficha. Siempre hay una abierta.
const rows = [...document.querySelectorAll('#deck .row')];

function openRow(row) {
    rows.forEach(r => {
        const on = r === row;
        r.setAttribute('aria-expanded', String(on));
        document.getElementById(r.getAttribute('aria-controls')).classList.toggle('open', on);
    });
}

rows.forEach((row, i) => {
    row.addEventListener('click', () => openRow(row));
    row.addEventListener('keydown', e => {
        const step = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0;
        if (!step) return;
        e.preventDefault();
        const next = rows[(i + step + rows.length) % rows.length];
        next.focus();
        openRow(next);
    });
});

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

// Último push, leído de la API pública de GitHub. Si falla, no se muestra nada.
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
    push.hidden = false;
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
    } catch { /* sin red o sin cuota: la barra queda solo con la hora */ }
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
