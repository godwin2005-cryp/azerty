(function () {
    // Preloader hide
    window.addEventListener('load', () => {
        const p = document.getElementById('preloader');
        if (p) setTimeout(() => p.classList.add('hidden'), 250);
    });

    // Reveal on scroll
    const io = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (entry.isIntersecting) entry.target.classList.add('in-view');
        }
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));

    // Split text into characters
    function splitText(container) {
        const el = document.querySelector(container);
        if (!el) return;
        const html = el.innerHTML;
        el.innerHTML = html.replace(/([^\s])/g, '<span data-char>$1</span>');
        const chars = el.querySelectorAll('[data-char]');
        chars.forEach((c, i) => {
            setTimeout(() => c.classList.add('in'), 18 * i);
        });
    }
    splitText('[data-split]');
})();
