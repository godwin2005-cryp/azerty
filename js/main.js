(function () {
    // Safe TikTok Pixel tracking helper
    const ttqTrack = (name, props = {}) => {
        try {
            if (window.ttq && typeof ttq.track === 'function') {
                ttq.track(name, props);
            }
        } catch (_) { /* no-op */ }
    };

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

    // Track clicks on primary "Apply" CTAs
    const applyLinks = document.querySelectorAll('a.btn.btn-primary[href="#contact"]');
    applyLinks.forEach((a) => {
        a.addEventListener('click', () => {
            const section = a.closest('section');
            const location = section?.id || (a.closest('header') ? 'header' : 'unknown');
            ttqTrack('ClickApply', { location });
        });
    });

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

    // Track hero video play/progress/completion
    const heroVideo = document.querySelector('.hero-video');
    if (heroVideo) {
        const milestones = [25, 50, 75];
        const seen = new Set();
        heroVideo.addEventListener('play', () => ttqTrack('VideoPlay', { id: 'hero-video' }));
        heroVideo.addEventListener('timeupdate', () => {
            const dur = heroVideo.duration || 0;
            if (!dur) return;
            const pct = (heroVideo.currentTime / dur) * 100;
            milestones.forEach((m) => {
                if (pct >= m && !seen.has(m)) {
                    seen.add(m);
                    ttqTrack('VideoProgress', { id: 'hero-video', progress: m });
                }
            });
        });
        heroVideo.addEventListener('ended', () => ttqTrack('VideoComplete', { id: 'hero-video' }));
    }

    // FAQ keyboard polish (close others)
    const faqs = document.querySelectorAll('.faq-item');
    faqs.forEach(d => {
        d.addEventListener('toggle', () => {
            if (d.open) faqs.forEach(o => { if (o !== d) o.open = false; });
        });
    });

    // Hide header on scroll down, show on scroll up
    const header = document.querySelector('.site-header');
    if (header) {
        let lastY = window.scrollY;
        const threshold = 8; // minimal movement before toggling
        let ticking = false;

        const handle = () => {
            const y = window.scrollY;
            // Don't hide when mobile menu is open
            if (document.body.classList.contains('no-scroll')) {
                header.classList.remove('hide-on-scroll');
                lastY = y;
                ticking = false;
                return;
            }

            if (y <= 0) {
                header.classList.remove('hide-on-scroll');
            } else if (Math.abs(y - lastY) > threshold) {
                if (y > lastY && y > 80) {
                    // scrolling down
                    header.classList.add('hide-on-scroll');
                } else {
                    // scrolling up
                    header.classList.remove('hide-on-scroll');
                }
                lastY = y;
            }
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(handle);
                ticking = true;
            }
        }, { passive: true });
    }

    // Contact form -> Telegram Bot API
    const form = document.getElementById('contact-form');
    const status = document.getElementById('form-status');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // UI: désactiver le bouton pendant l'envoi
            const submitBtn = form.querySelector('button[type="submit"]');
            const prevText = submitBtn ? submitBtn.textContent : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.setAttribute('aria-busy', 'true');
                submitBtn.textContent = 'Sending…';
            }

            // Utilisation directe de l'API Telegram côté client
            const BOT_TOKEN = (document.querySelector('meta[name="telegram-bot-token"]')?.content || '').trim();
            const CHAT_ID = (document.querySelector('meta[name="telegram-chat-id"]')?.content || '').trim();
            if (!BOT_TOKEN || !CHAT_ID) {
                status && (status.textContent = 'Configuration Telegram manquante : veuillez renseigner BOT_TOKEN et CHAT_ID.');
                ttqTrack('ContactFormConfigMissing');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.removeAttribute('aria-busy');
                    submitBtn.textContent = prevText;
                }
                return;
            }

            // Récupérer les données du formulaire
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
                status && (status.textContent = 'Veuillez renseigner Nom, Email et Message.');
                ttqTrack('ContactFormValidationFailed', {
                    missing: {
                        name: !payload.name,
                        email: !payload.email,
                        message: !payload.message
                    }
                });
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.removeAttribute('aria-busy');
                    submitBtn.textContent = prevText;
                }
                return;
            }

            // Construire le message (URL-encodé)
            const text = `Nouveau message de contact depuis le site LadyLuxury :%0A` +
                `Nom : ${encodeURIComponent(payload.name)}%0A` +
                (payload.telegram ? `Telegram : ${encodeURIComponent(payload.telegram)}%0A` : '') +
                `Email : ${encodeURIComponent(payload.email)}%0A` +
                (payload.instagram ? `Instagram : ${encodeURIComponent(payload.instagram)}%0A` : '') +
                `Message :%0A${encodeURIComponent(payload.message)}`;

            status && (status.textContent = 'Sending...');
            ttqTrack('ContactFormSubmitAttempt', { hasTelegram: !!payload.telegram, hasInstagram: !!payload.instagram, mode: 'bot-api' });
            try {
                const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${encodeURIComponent(CHAT_ID)}&text=${text}`;
                const res = await fetch(url, { method: 'GET' });
                if (!res.ok) throw new Error('Network response was not ok');
                const data = await res.json();
                if (!data.ok) throw new Error(data.description || 'Telegram API error');
                status && (status.textContent = 'Message sent! We will get back to you shortly.');
                ttqTrack('ContactFormSubmitted');
                form.reset();
            } catch (err) {
                console.error(err);
                status && (status.textContent = "Échec de l'envoi. Veuillez réessayer plus tard.");
                ttqTrack('ContactFormSubmitFailed', { error: String(err && err.message || err) });
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.removeAttribute('aria-busy');
                    submitBtn.textContent = prevText;
                }
            }
        });
    }
})();
