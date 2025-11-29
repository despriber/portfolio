/**
 * PAGE TRANSITION SYSTEM
 * Smooth fade transitions
 */

const PageTransition = {
    overlay: null,
    isAnimating: false,

    init: function() {
        this.createOverlay();
        this.bindLinks();
        this.playEnterAnimation();
    },

    createOverlay: function() {
        const overlay = document.createElement('div');
        overlay.className = 'page-transition-overlay';
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: #0a0a0a;
            z-index: 99999;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
        `;
        document.body.appendChild(overlay);
        this.overlay = overlay;
    },

    bindLinks: function() {
        document.querySelectorAll('a').forEach(link => {
            const href = link.getAttribute('href');
            if (href &&
                href.endsWith('.html') &&
                !href.startsWith('http') &&
                !href.startsWith('#') &&
                !link.hasAttribute('data-no-transition')) {

                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (!this.isAnimating) {
                        this.navigateTo(href);
                    }
                });
            }
        });
    },

    navigateTo: function(url) {
        this.isAnimating = true;
        this.overlay.style.opacity = '1';
        this.overlay.style.pointerEvents = 'auto';

        setTimeout(() => {
            window.location.href = url;
        }, 300);
    },

    playEnterAnimation: function() {
        this.overlay.style.opacity = '1';
        this.overlay.style.pointerEvents = 'auto';

        requestAnimationFrame(() => {
            setTimeout(() => {
                this.overlay.style.opacity = '0';
                this.overlay.style.pointerEvents = 'none';
                this.isAnimating = false;
            }, 50);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    PageTransition.init();
});
