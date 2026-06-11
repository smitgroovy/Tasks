document.addEventListener('DOMContentLoaded', () => {

    // ========================================
    // Theme Toggle
    // ========================================
    const root = document.documentElement;
    const themeBtn = document.getElementById('themeToggle');
    const saved = localStorage.getItem('theme');

    if (saved) {
        root.setAttribute('data-theme', saved);
    } else {
        root.setAttribute('data-theme', 'dark');
    }

    themeBtn.addEventListener('click', () => {
        const current = root.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    });

    // ========================================
    // Mobile Menu Toggle
    // ========================================
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');

    menuToggle.addEventListener('click', () => {
        const open = navLinks.classList.toggle('active');
        menuToggle.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', open);
        document.body.style.overflow = open ? 'hidden' : '';
    });

    navLinks.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        });
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && !menuToggle.contains(e.target) && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    });

    // ========================================
    // Active Nav on Scroll
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
    // Scroll Reveal Animation
    // ========================================
    const revealElements = document.querySelectorAll(
        '.hero-badge, .hero-name, .hero-role, .hero-desc, .hero-actions, .hero-stats, ' +
        '.section-header, .about-lead, .about-text, .about-info, ' +
        '.timeline-item, .exp-card, .project-card, .skill-card, .cert-card, ' +
        '.contact-heading, .contact-sub, .contact-links, .contact-form-wrap'
    );

    revealElements.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px'
    });

    revealElements.forEach(el => observer.observe(el));

    // ========================================
    // Staggered Reveal for Grid Items
    // ========================================
    const staggerItems = document.querySelectorAll('.project-card, .skill-card, .cert-card');

    const staggerObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 80);
                staggerObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    staggerItems.forEach(el => {
        el.classList.add('reveal');
        staggerObserver.observe(el);
    });

    // ========================================
    // Contact Form
    // ========================================
    const form = document.getElementById('contactForm');
    const submitBtn = form.querySelector('.btn-primary');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Sending...</span>';

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
            });

            if (response.ok) {
                submitBtn.innerHTML = '<span>Message Sent!</span>';
                form.reset();
                setTimeout(() => {
                    submitBtn.innerHTML = '<span>Send Message</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
                    submitBtn.disabled = false;
                }, 3000);
            } else {
                throw new Error('Failed');
            }
        } catch (error) {
            submitBtn.innerHTML = '<span>Failed. Try again.</span>';
            setTimeout(() => {
                submitBtn.innerHTML = '<span>Send Message</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
                submitBtn.disabled = false;
            }, 3000);
        }
    });

    // ========================================
    // Smooth Scroll
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

    // ========================================
    // Navbar Background on Scroll
    // ========================================
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 4px 24px rgba(0,0,0,0.06)';
        } else {
            navbar.style.boxShadow = 'none';
        }
    }, { passive: true });
});
