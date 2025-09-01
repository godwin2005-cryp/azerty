(function () {
    const header = document.querySelector('.site-header');
    const offset = () => (header ? header.offsetHeight + 8 : 0);
    function smoothTo(target) {
        const el = document.querySelector(target);
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY - offset();
        window.scrollTo({ top, behavior: 'smooth' });
    }
    document.addEventListener('click', (e) => {
        const a = e.target.closest('a[href^="#"]');
        if (!a) return;
        const href = a.getAttribute('href');
        if (href.length > 1) {
            e.preventDefault();
            smoothTo(href);
            const menu = document.getElementById('nav-menu');
            if (menu && menu.classList.contains('open')) menu.classList.remove('open');
            const toggle = document.querySelector('.nav-toggle');
            if (toggle) toggle.setAttribute('aria-expanded', 'false');
        }
    });
})();
