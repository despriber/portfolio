/**
 * TOAST NOTIFICATION SYSTEM
 * Elegant notification popups
 */

const Toast = {
    container: null,
    queue: [],
    maxVisible: 3,

    init: function() {
        this.createContainer();
    },

    createContainer: function() {
        const container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
        this.container = container;
    },

    show: function(message, type = 'info', duration = 4000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icons = {
            success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
            error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
            warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
        };

        toast.innerHTML = `
            <div class="toast-icon">${icons[type]}</div>
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" aria-label="Close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
            <div class="toast-progress">
                <div class="toast-progress-bar"></div>
            </div>
        `;

        this.container.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Progress bar animation
        const progressBar = toast.querySelector('.toast-progress-bar');
        progressBar.style.transition = `width ${duration}ms linear`;
        requestAnimationFrame(() => {
            progressBar.style.width = '0%';
        });

        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.dismiss(toast);
        });

        // Auto dismiss
        const timeout = setTimeout(() => {
            this.dismiss(toast);
        }, duration);

        // Pause on hover
        toast.addEventListener('mouseenter', () => {
            progressBar.style.transitionPlayState = 'paused';
            clearTimeout(timeout);
        });

        toast.addEventListener('mouseleave', () => {
            progressBar.style.transitionPlayState = 'running';
            const remaining = (parseFloat(getComputedStyle(progressBar).width) / toast.offsetWidth) * duration;
            setTimeout(() => this.dismiss(toast), remaining);
        });

        return toast;
    },

    dismiss: function(toast) {
        if (!toast || toast.classList.contains('hiding')) return;

        toast.classList.add('hiding');
        toast.classList.remove('show');

        setTimeout(() => {
            toast.remove();
        }, 300);
    },

    success: function(message, duration) {
        return this.show(message, 'success', duration);
    },

    error: function(message, duration) {
        return this.show(message, 'error', duration);
    },

    warning: function(message, duration) {
        return this.show(message, 'warning', duration);
    },

    info: function(message, duration) {
        return this.show(message, 'info', duration);
    },

    clear: function() {
        this.container.querySelectorAll('.toast').forEach(toast => {
            this.dismiss(toast);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Toast.init();
});

// Make globally accessible
window.Toast = Toast;
