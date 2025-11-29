/**
 * SHARED FUNCTIONALITY
 * Common JavaScript for all pages
 */

const SharedApp = {
    cursor: null,
    cursorFollower: null,
    mouseX: 0,
    mouseY: 0,
    cursorX: 0,
    cursorY: 0,
    followerX: 0,
    followerY: 0,

    init: function(options = {}) {
        this.initCursor();
        this.initNavigation();
        this.initScrollProgress();
        this.initBackToTop();
        this.initPreloader(options.onLoadComplete);
    },

    initCursor: function() {
        this.cursor = document.querySelector('.cursor');
        this.cursorFollower = document.querySelector('.cursor-follower');

        if (!this.cursor || !this.cursorFollower) return;

        if (window.innerWidth <= 768) {
            this.cursor.style.display = 'none';
            this.cursorFollower.style.display = 'none';
            return;
        }

        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.add('cursor-active');
        });

        document.addEventListener('mouseup', () => {
            document.body.classList.remove('cursor-active');
        });

        const hoverElements = document.querySelectorAll('a, button, input, textarea, select, .hover-trigger, [data-cursor]');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                document.body.classList.add('cursor-hover');
            });
            el.addEventListener('mouseleave', () => {
                document.body.classList.remove('cursor-hover');
            });
        });

        this.animateCursor();
    },

    animateCursor: function() {
        const ease = 0.15;
        const followerEase = 0.08;

        const animate = () => {
            this.cursorX += (this.mouseX - this.cursorX) * ease;
            this.cursorY += (this.mouseY - this.cursorY) * ease;
            this.followerX += (this.mouseX - this.followerX) * followerEase;
            this.followerY += (this.mouseY - this.followerY) * followerEase;

            if (this.cursor) {
                this.cursor.style.left = this.cursorX + 'px';
                this.cursor.style.top = this.cursorY + 'px';
            }
            if (this.cursorFollower) {
                this.cursorFollower.style.left = this.followerX + 'px';
                this.cursorFollower.style.top = this.followerY + 'px';
            }

            requestAnimationFrame(animate);
        };
        animate();
    },

    initNavigation: function() {
        const nav = document.querySelector('.nav');
        const navToggle = document.querySelector('.nav-toggle');
        const mobileMenu = document.querySelector('.mobile-menu');
        let lastScrollY = 0;

        if (nav) {
            window.addEventListener('scroll', () => {
                const currentScrollY = window.scrollY;

                if (currentScrollY > 100) {
                    nav.classList.add('scrolled');
                } else {
                    nav.classList.remove('scrolled');
                }

                if (currentScrollY > lastScrollY && currentScrollY > 200) {
                    nav.classList.add('hidden');
                } else {
                    nav.classList.remove('hidden');
                }

                lastScrollY = currentScrollY;
            });
        }

        if (navToggle && mobileMenu) {
            navToggle.addEventListener('click', () => {
                navToggle.classList.toggle('active');
                mobileMenu.classList.toggle('active');
                document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
            });

            const mobileLinks = mobileMenu.querySelectorAll('a');
            mobileLinks.forEach(link => {
                link.addEventListener('click', () => {
                    navToggle.classList.remove('active');
                    mobileMenu.classList.remove('active');
                    document.body.style.overflow = '';
                });
            });
        }
    },

    initScrollProgress: function() {
        const progressBar = document.querySelector('.scroll-progress');
        if (!progressBar) return;

        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (scrollTop / docHeight) * 100;
            progressBar.style.width = progress + '%';
        });
    },

    initBackToTop: function() {
        const backToTop = document.querySelector('.back-to-top');
        if (!backToTop) return;

        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });

        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    },

    initPreloader: function(callback) {
        const preloader = document.querySelector('.preloader');
        if (!preloader) {
            if (callback) callback();
            return;
        }

        const progressText = preloader.querySelector('.loader-text');
        const progressBar = preloader.querySelector('.loader-progress');
        let progress = 0;

        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => {
                    preloader.style.transform = 'translateY(-100%)';
                    preloader.style.transition = 'transform 0.8s cubic-bezier(0.76, 0, 0.24, 1)';
                    if (callback) callback();
                }, 300);
            }
            if (progressText) progressText.textContent = Math.floor(progress) + '%';
            if (progressBar) progressBar.style.width = progress + '%';
        }, 80);
    },

    initScrollAnimations: function() {
        const fadeElements = document.querySelectorAll('.fade-up');
        if (!fadeElements.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        fadeElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    },

    initCounters: function() {
        const counters = document.querySelectorAll('[data-counter]');
        if (!counters.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = parseInt(counter.dataset.counter);
                    let current = 0;
                    const increment = target / 50;
                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= target) {
                            counter.textContent = target;
                            clearInterval(timer);
                        } else {
                            counter.textContent = Math.floor(current);
                        }
                    }, 30);
                    observer.unobserve(counter);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => observer.observe(counter));
    },

    initMagneticButtons: function() {
        const magneticElements = document.querySelectorAll('.magnetic');
        if (!magneticElements.length) return;

        magneticElements.forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
            });

            el.addEventListener('mouseleave', () => {
                el.style.transform = 'translate(0, 0)';
            });
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    SharedApp.init();
});
