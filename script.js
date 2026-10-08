/* ============================================================
   PORTFOLIO — Полякова Ксения
   Vanilla JS (ES6+)
   Функционал:
   1. Переключение темы (light/dark)
   2. Анимация появления при скролле (Intersection Observer)
   3. Валидация формы обратной связи
   4. Бургер-меню для мобильных
   5. Живой главный экран:
      5.1. Кинетическая типографика
      5.2. Интерактивные 3D-кубы
      5.3. Контекстный курсор
      5.4. Шлейф из частиц за курсором
   ============================================================ */

'use strict';

/* Флаги: тач-устройство / reduce-motion */
const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const effectsEnabled = !isTouch && !reduceMotion;

/* ------------------------------------------------------------
   1. ПЕРЕКЛЮЧЕНИЕ ТЕМЫ
   ------------------------------------------------------------ */
(function initTheme() {
    const html = document.documentElement;
    const toggle = document.getElementById('themeToggle');
    const icon = toggle?.querySelector('.theme-toggle__icon');

    const saved = localStorage.getItem('portfolio-theme');
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    const initial = saved || (prefersLight ? 'light' : 'dark');

    applyTheme(initial);

    toggle?.addEventListener('click', () => {
        const current = html.getAttribute('data-theme');
        applyTheme(current === 'dark' ? 'light' : 'dark');
    });

    function applyTheme(theme) {
        html.setAttribute('data-theme', theme);
        localStorage.setItem('portfolio-theme', theme);
        if (icon) icon.textContent = theme === 'dark' ? '🌙' : '☀️';
    }
})();

/* ------------------------------------------------------------
   2. АНИМАЦИЯ ПОЯВЛЕНИЯ ПРИ СКРОЛЛЕ
   ------------------------------------------------------------ */
(function initReveal() {
    const items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
        items.forEach(el => el.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                obs.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -60px 0px'
    });

    items.forEach(el => observer.observe(el));
})();

/* ------------------------------------------------------------
   3. ВАЛИДАЦИЯ ФОРМЫ
   ------------------------------------------------------------ */
(function initForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const nameInput = document.getElementById('nameInput');
    const emailInput = document.getElementById('emailInput');
    const messageInput = document.getElementById('messageInput');
    const status = document.getElementById('formStatus');

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function setError(input, hasError) {
        input.classList.toggle('is-error', hasError);
    }

    function setStatus(text, isError = false) {
        status.textContent = text;
        status.classList.toggle('is-error', isError);
    }

    [nameInput, emailInput, messageInput].forEach(input => {
        input?.addEventListener('input', () => {
            setError(input, false);
            setStatus('');
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const message = messageInput.value.trim();

        let hasError = false;

        if (name.length < 2) { setError(nameInput, true); hasError = true; }
        if (!emailRe.test(email)) { setError(emailInput, true); hasError = true; }
        if (message.length < 5) { setError(messageInput, true); hasError = true; }

        if (hasError) {
            setStatus('Пожалуйста, проверьте выделенные поля.', true);
            return;
        }

        setStatus('Отправка...');

        setTimeout(() => {
            setStatus('Спасибо! Ваше сообщение отправлено ✅');
            form.reset();
        }, 700);
    });
})();

/* ------------------------------------------------------------
   4. БУРГЕР-МЕНЮ
   ------------------------------------------------------------ */
(function initBurger() {
    const burger = document.getElementById('burgerBtn');
    const navList = document.getElementById('navList');
    if (!burger || !navList) return;

    function closeMenu() {
        burger.classList.remove('is-active');
        navList.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    function toggleMenu() {
        const isOpen = navList.classList.toggle('is-open');
        burger.classList.toggle('is-active', isOpen);
        burger.setAttribute('aria-expanded', String(isOpen));
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    burger.addEventListener('click', toggleMenu);

    navList.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navList.classList.contains('is-open')) {
            closeMenu();
        }
    });
})();

/* ============================================================
   5. ЖИВОЙ ГЛАВНЫЙ ЭКРАН
   ============================================================ */

/* ------------------------------------------------------------
   5.1. КИНЕТИЧЕСКАЯ ТИПОГРАФИКА
   ------------------------------------------------------------ */
(function initKineticTitle() {
    const title = document.getElementById('kineticTitle');
    if (!title || !effectsEnabled) return;

    const text = 'PORTFOLIO';
    const letters = [];

    title.textContent = '';
    [...text].forEach(ch => {
        const span = document.createElement('span');
        span.className = 'k-letter';
        span.textContent = ch;
        title.appendChild(span);
        letters.push(span);
    });

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let scrollY = 0;
    let currentScroll = 0;

    let rects = [];
    function updateRects() {
        rects = letters.map(el => {
            const r = el.getBoundingClientRect();
            return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
        });
    }
    updateRects();

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    window.addEventListener('scroll', () => {
        scrollY = window.scrollY;
    }, { passive: true });

    window.addEventListener('resize', updateRects);

    function animate() {
        currentScroll += (scrollY - currentScroll) * 0.1;

        letters.forEach((el, i) => {
            const r = rects[i];
            if (!r) return;

            const dx = r.cx - mouseX;
            const dy = r.cy - mouseY;
            const dist = Math.hypot(dx, dy);

            const radius = 260;
            const force = Math.max(0, 1 - dist / radius);

            const pushX = (dx / (dist || 1)) * force * 18;
            const pushY = (dy / (dist || 1)) * force * 18;

            const rotate = (dx / (dist || 1)) * force * 14;
            const scaleX = 1 + force * 0.18;
            const scaleY = 1 - force * 0.08;

            const scrollProgress = Math.min(currentScroll / 300, 1);
            const explode = scrollProgress * (i - (letters.length - 1) / 2) * 22;
            const fadeOut = 1 - scrollProgress * 0.85;

            el.style.transform =
                `translate(${pushX + explode}px, ${pushY + scrollProgress * -60}px) ` +
                `rotate(${rotate}deg) ` +
                `scale(${scaleX}, ${scaleY})`;

            el.style.opacity = fadeOut;
        });

        requestAnimationFrame(animate);
    }
    animate();
})();

/* ------------------------------------------------------------
   5.2. ИНТЕРАКТИВНЫЕ 3D-КУБЫ
   ------------------------------------------------------------ */
(function initInteractiveCubes() {
    if (!effectsEnabled) return;

    const cubes = document.querySelectorAll('.decor--cube-1, .decor--cube-2');
    if (!cubes.length) return;

    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;

    window.addEventListener('mousemove', (e) => {
        targetX = (e.clientX / window.innerWidth) * 2 - 1;
        targetY = (e.clientY / window.innerHeight) * 2 - 1;
    });

    function animate() {
        currentX += (targetX - currentX) * 0.08;
        currentY += (targetY - currentY) * 0.08;

        cubes.forEach((cube, i) => {
            const depth = i === 0 ? 1 : -0.6;
            const rotateY = currentX * 25 * depth;
            const rotateX = -currentY * 25 * depth;
            const translateX = currentX * 30 * depth;
            const translateY = currentY * 30 * depth;

            const mouseDist = Math.hypot(currentX, currentY);
            const glow = 0.4 + (1 - Math.min(mouseDist, 1)) * 0.6;
            const baseRotate = i === 0 ? 20 : -15;

            cube.style.transform =
                `translate3d(${translateX}px, ${translateY}px, 0) ` +
                `rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotate(${baseRotate}deg)`;

            cube.style.boxShadow =
                `0 0 ${40 * glow}px rgba(0, 210, 255, ${0.3 + glow * 0.4}), ` +
                `inset 0 0 ${30 * glow}px rgba(0, 210, 255, ${0.15 + glow * 0.25})`;
        });

        requestAnimationFrame(animate);
    }
    animate();
})();

/* ------------------------------------------------------------
   5.3. КОНТЕКСТНЫЙ КУРСОР
   ------------------------------------------------------------ */
(function initContextCursor() {
    if (!effectsEnabled) return;

    const label = document.getElementById('cursorLabel');
    if (!label) return;

    window.addEventListener('mousemove', (e) => {
        label.style.left = e.clientX + 'px';
        label.style.top = (e.clientY - 30) + 'px';
    });

    document.addEventListener('mouseover', (e) => {
        const target = e.target.closest('[data-cursor]');
        if (target) {
            label.textContent = target.dataset.cursor;
            label.classList.add('is-active');
        }
    });

    document.addEventListener('mouseout', (e) => {
        const target = e.target.closest('[data-cursor]');
        if (target) {
            label.classList.remove('is-active');
        }
    });

    document.addEventListener('mouseleave', () => {
        label.classList.remove('is-active');
    });
})();

/* ------------------------------------------------------------
   5.4. ШЛЕЙФ ЗА КУРСОРОМ (canvas)
   ------------------------------------------------------------ */
(function initCursorTrail() {
    if (!effectsEnabled) return;

    const canvas = document.getElementById('cursorTrail');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let W, H, dpr;

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = canvas.width = window.innerWidth * dpr;
        H = canvas.height = window.innerHeight * dpr;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
    }
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    const MAX_PARTICLES = 90;

    let mouseX = -100, mouseY = -100;
    let prevX = -100, prevY = -100;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX * dpr;
        mouseY = e.clientY * dpr;
    });

    function getColor() {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        return isLight
            ? { r: 37, g: 99, b: 235 }
            : { r: 0, g: 210, b: 255 };
    }

    function spawnParticle(x, y) {
        const c = getColor();
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 2.4,
            vy: (Math.random() - 0.5) * 2.4,
            life: 1,
            decay: 0.015 + Math.random() * 0.02,
            size: 1.5 + Math.random() * 3,
            color: c
        });
        if (particles.length > MAX_PARTICLES) particles.shift();
    }

    function loop() {
        // Затухание
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.fillRect(0, 0, W, H);

        ctx.globalCompositeOperation = 'lighter';

        // Спавн вдоль траектории
        if (mouseX > 0 && mouseY > 0) {
            const dx = mouseX - prevX;
            const dy = mouseY - prevY;
            const speed = Math.hypot(dx, dy);
            const steps = Math.min(Math.floor(speed / 3) + 1, 5);

            for (let i = 0; i < steps; i++) {
                const t = i / steps;
                spawnParticle(
                    prevX + dx * t + (Math.random() - 0.5) * 6,
                    prevY + dy * t + (Math.random() - 0.5) * 6
                );
            }

            prevX = mouseX;
            prevY = mouseY;
        }

        // Рисуем частицы
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.97;
            p.vy *= 0.97;
            p.life -= p.decay;

            if (p.life <= 0) {
                particles.splice(i, 1);
                continue;
            }

            const alpha = p.life * 0.9;
            const radius = p.size * p.life;

            const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 6);
            gradient.addColorStop(0, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha})`);
            gradient.addColorStop(1, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0)`);

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(p.x, p.y, radius * 6, 0, Math.PI * 2);
            ctx.fill();
        }

        // Линии между близкими частицами
        ctx.lineWidth = 1 * dpr;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const a = particles[i];
                const b = particles[j];
                const d = Math.hypot(a.x - b.x, a.y - b.y);
                if (d < 70 * dpr) {
                    const alpha = (1 - d / (70 * dpr)) * 0.25 * a.life * b.life;
                    ctx.strokeStyle = `rgba(${a.color.r}, ${a.color.g}, ${a.color.b}, ${alpha})`;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(loop);
    }
    loop();
})();