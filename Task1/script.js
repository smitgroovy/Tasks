document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    const savedTheme = localStorage.getItem('theme') || 'dark';

    function setTheme(theme) {
        html.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        const icon = themeToggle.querySelector('i');
        icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    }

    setTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
        const current = html.getAttribute('data-theme');
        setTheme(current === 'dark' ? 'light' : 'dark');
    });

    // Mobile Menu
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const navLinkItems = document.querySelectorAll('.nav-link');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    navLinkItems.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // Active Nav Link on Scroll
    const sections = document.querySelectorAll('section');

    function updateActiveLink() {
        let current = '';
        sections.forEach(section => {
            const top = section.offsetTop - 100;
            if (window.scrollY >= top) {
                current = section.getAttribute('id');
            }
        });

        navLinkItems.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', updateActiveLink);

    // Navbar Background on Scroll
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.2)';
        } else {
            navbar.style.boxShadow = 'none';
        }
    });

    // Typing Animation
    const typedTextEl = document.getElementById('typedText');
    const phrases = [
        'Computer Science Student',
        'AI/ML Enthusiast',
        'Full Stack Developer',
        'Flutter Developer',
        'Problem Solver'
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeEffect() {
        const currentPhrase = phrases[phraseIndex];

        if (isDeleting) {
            typedTextEl.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typedTextEl.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
        }

        let speed = isDeleting ? 50 : 100;

        if (!isDeleting && charIndex === currentPhrase.length) {
            speed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            speed = 500;
        }

        setTimeout(typeEffect, speed);
    }

    typeEffect();

    // Particle Effect
    const particlesContainer = document.getElementById('particles');

    function createParticles() {
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            particle.style.left = Math.random() * 100 + '%';
            particle.style.width = Math.random() * 4 + 2 + 'px';
            particle.style.height = particle.style.width;
            particle.style.animationDuration = Math.random() * 15 + 10 + 's';
            particle.style.animationDelay = Math.random() * 10 + 's';
            particlesContainer.appendChild(particle);
        }
    }

    createParticles();

    // Scroll Animations (Intersection Observer)
    const animateElements = document.querySelectorAll('.timeline-item, .skill-category, .project-card, .cert-card');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    animateElements.forEach(el => observer.observe(el));

    // Contact Form
    const contactForm = document.getElementById('contactForm');

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const btn = contactForm.querySelector('button');
        const originalText = btn.innerHTML;
        btn.innerHTML = 'Sending... <i class="fas fa-spinner fa-spin"></i>';
        btn.disabled = true;

        setTimeout(() => {
            btn.innerHTML = 'Message Sent! <i class="fas fa-check"></i>';
            btn.style.background = '#22c55e';

            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '';
                btn.disabled = false;
                contactForm.reset();
            }, 2000);
        }, 1500);
    });

    // Smooth scroll for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Parallax effect on hero
    window.addEventListener('scroll', () => {
        const hero = document.querySelector('.hero-content');
        const scrolled = window.scrollY;
        if (scrolled < window.innerHeight) {
            hero.style.transform = `translateY(${scrolled * 0.3}px)`;
            hero.style.opacity = 1 - (scrolled / window.innerHeight);
        }
    });
});
