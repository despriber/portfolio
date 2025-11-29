/**
 * SKELETON LOADING SYSTEM
 * Beautiful loading screen with skeleton placeholders
 */

const SkeletonLoader = {
    overlay: null,
    progress: 0,

    init: function() {
        this.createSkeleton();
        this.simulateLoading();
    },

    createSkeleton: function() {
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton-overlay';
        skeleton.innerHTML = `
            <div class="skeleton-content">
                <div class="skeleton-header">
                    <div class="skeleton-logo shimmer"></div>
                    <div class="skeleton-nav">
                        <div class="skeleton-nav-item shimmer"></div>
                        <div class="skeleton-nav-item shimmer"></div>
                        <div class="skeleton-nav-item shimmer"></div>
                        <div class="skeleton-nav-item shimmer"></div>
                    </div>
                </div>

                <div class="skeleton-hero">
                    <div class="skeleton-title shimmer"></div>
                    <div class="skeleton-title short shimmer"></div>
                    <div class="skeleton-subtitle shimmer"></div>
                </div>

                <div class="skeleton-grid">
                    <div class="skeleton-card shimmer"></div>
                    <div class="skeleton-card shimmer"></div>
                    <div class="skeleton-card shimmer"></div>
                </div>

                <div class="skeleton-progress-container">
                    <div class="skeleton-progress-bar">
                        <div class="skeleton-progress-fill"></div>
                    </div>
                    <div class="skeleton-progress-text">0%</div>
                </div>
            </div>
        `;
        document.body.appendChild(skeleton);
        this.overlay = skeleton;
    },

    simulateLoading: function() {
        const progressFill = this.overlay.querySelector('.skeleton-progress-fill');
        const progressText = this.overlay.querySelector('.skeleton-progress-text');

        const interval = setInterval(() => {
            this.progress += Math.random() * 15 + 5;

            if (this.progress >= 100) {
                this.progress = 100;
                clearInterval(interval);
                this.complete();
            }

            progressFill.style.width = `${this.progress}%`;
            progressText.textContent = `${Math.floor(this.progress)}%`;
        }, 100);
    },

    complete: function() {
        setTimeout(() => {
            this.overlay.classList.add('fade-out');
            setTimeout(() => {
                this.overlay.remove();
                document.body.classList.add('loaded');

                if (typeof SharedApp !== 'undefined') {
                    SharedApp.initScrollAnimations && SharedApp.initScrollAnimations();
                }
            }, 500);
        }, 300);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    SkeletonLoader.init();
});
