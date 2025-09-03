(function () {
    // Mobile nav toggle
    const toggle = document.querySelector('.nav-toggle');
    const menu = document.getElementById('nav-menu');
    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            const open = menu.classList.toggle('open');
            toggle.setAttribute('aria-expanded', String(open));
            document.body.classList.toggle('no-scroll', open);
        });

        // Close on link click
        menu.addEventListener('click', (e) => {
            const target = e.target;
            if (target && target.closest('a')) {
                menu.classList.remove('open');
                document.body.classList.remove('no-scroll');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && menu.classList.contains('open')) {
                menu.classList.remove('open');
                document.body.classList.remove('no-scroll');
                toggle.setAttribute('aria-expanded', 'false');
            }
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

    // Contact form -> Telegram Bot API
    const form = document.getElementById('contact-form');
    const status = document.getElementById('form-status');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const BOT_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN_HERE'; // TODO: replace
            const CHAT_ID = 'YOUR_CHAT_ID_HERE'; // TODO: replace (e.g., 12345678)

            if (!BOT_TOKEN || !CHAT_ID || BOT_TOKEN.includes('YOUR_') || CHAT_ID.includes('YOUR_')) {
                status && (status.textContent = 'Configuration missing: please set Telegram BOT_TOKEN and CHAT_ID.');
                return;
            }

            const formData = new FormData(form);
            const payload = {
                name: formData.get('name')?.toString().trim() || '',
                telegram: formData.get('telegram')?.toString().trim() || '',
                email: formData.get('email')?.toString().trim() || '',
                instagram: formData.get('instagram')?.toString().trim() || '',
                message: formData.get('message')?.toString().trim() || ''
            };

            // Basic validation
            if (!payload.name || !payload.email || !payload.message) {
                status && (status.textContent = 'Please fill in Name, Email, and Message.');
                return;
            }

            const text = `New contact message from LadyLuxury site:%0A` +
                `Name: ${encodeURIComponent(payload.name)}%0A` +
                (payload.telegram ? `Telegram: ${encodeURIComponent(payload.telegram)}%0A` : '') +
                `Email: ${encodeURIComponent(payload.email)}%0A` +
                (payload.instagram ? `Instagram: ${encodeURIComponent(payload.instagram)}%0A` : '') +
                `Message:%0A${encodeURIComponent(payload.message)}`;

            status && (status.textContent = 'Sending...');
            try {
                const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${text}`;
                const res = await fetch(url, { method: 'GET' });
                if (!res.ok) throw new Error('Network response was not ok');
                const data = await res.json();
                if (!data.ok) throw new Error(data.description || 'Telegram API error');
                status && (status.textContent = 'Message sent! We will get back to you soon.');
                form.reset();
            } catch (err) {
                console.error(err);
                status && (status.textContent = 'Failed to send. Please try again later.');
            }
        });
    }
})();
