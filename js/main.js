(function () {
    // Mobile nav toggle
    const toggle = document.querySelector('.nav-toggle');
    const menu = document.getElementById('nav-menu');
    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            const open = menu.classList.toggle('open');
            toggle.setAttribute('aria-expanded', String(open));
        });
    }

    // Slider
    const slider = document.querySelector('[data-slider]');
    if (slider) {
        const track = slider.querySelector('.slides');
        const slides = Array.from(slider.querySelectorAll('.slide'));
        const prev = slider.querySelector('.prev');
        const next = slider.querySelector('.next');
        let index = 0;
        function update() { track.style.transform = `translateX(${-index * (slider.clientWidth + 24)}px)`; }
        function clamp() { if (index < 0) index = 0; if (index > slides.length - 1) index = slides.length - 1; }
        prev?.addEventListener('click', () => { index--; clamp(); update(); });
        next?.addEventListener('click', () => { index++; clamp(); update(); });
        window.addEventListener('resize', update);

        // Drag support
        let startX = 0, current = 0, dragging = false;
        const start = (x) => { dragging = true; startX = x; current = 0; track.style.transition = 'none'; };
        const move = (x) => { if (!dragging) return; current = x - startX; track.style.transform = `translateX(${-index * (slider.clientWidth + 24) + current}px)`; };
        const end = () => { if (!dragging) return; dragging = false; track.style.transition = ''; if (Math.abs(current) > slider.clientWidth * 0.2) { index += current < 0 ? 1 : -1; clamp(); } update(); };
        slider.addEventListener('pointerdown', (e) => start(e.clientX));
        window.addEventListener('pointermove', (e) => move(e.clientX));
        window.addEventListener('pointerup', end);

        // Autoplay
        setInterval(() => { index = (index + 1) % slides.length; update(); }, 5000);
        update();
    }

    // FAQ keyboard polish (close others)
    const faqs = document.querySelectorAll('.faq-item');
    faqs.forEach(d => {
        d.addEventListener('toggle', () => {
            if (d.open) faqs.forEach(o => { if (o !== d) o.open = false; });
        });
    });
})();
