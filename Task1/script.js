document.addEventListener('DOMContentLoaded', () => {
    // ========================================
    // Theme
    // ========================================
    const root = document.documentElement;
    const themeBtn = document.getElementById('themeToggle');
    const saved = localStorage.getItem('theme');

    if (saved) {
        root.setAttribute('data-theme', saved);
    } else {
        root.setAttribute('data-theme', 'light');
    }

    themeBtn.addEventListener('click', () => {
        const current = root.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    });

    // ========================================
    // Mobile menu
    // ========================================
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    hamburger.addEventListener('click', () => {
        const open = navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', open);
    });

    navLinks.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        });
    });

    // ========================================
    // Active nav on scroll
    // ========================================
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-link');

    function setActive() {
        let current = '';
        sections.forEach(section => {
            const top = section.offsetTop - 120;
            if (window.scrollY >= top) {
                current = section.id;
            }
        });
        navItems.forEach(item => {
            item.classList.toggle('active', item.getAttribute('href') === `#${current}`);
        });
    }

    window.addEventListener('scroll', setActive, { passive: true });
    setActive();

    // ========================================
    // Scroll reveal
    // ========================================
    const reveals = document.querySelectorAll(
        '.section-label, .about-lead, .about-body > p, .about-details, ' +
        '.edu-item, .work-item, .project-item, .skill-col, .cert-item, ' +
        '.contact-heading, .contact-sub, .contact-links, .contact-form'
    );

    reveals.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
    });

    reveals.forEach(el => observer.observe(el));

    // ========================================
    // Contact form
    // ========================================
    const form = document.getElementById('contactForm');
    const submitBtn = form.querySelector('.form-submit');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        setTimeout(() => {
            submitBtn.textContent = 'Sent';
            setTimeout(() => {
                submitBtn.textContent = 'Send Message';
                submitBtn.disabled = false;
                form.reset();
            }, 2000);
        }, 1000);
    });

    // ========================================
    // Smooth scroll
    // ========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const id = anchor.getAttribute('href');
            if (id === '#') return;
            const target = document.querySelector(id);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});
