/**
 * IMAGE LIGHTBOX GALLERY
 * Full-screen image viewer with navigation
 */

const Lightbox = {
    overlay: null,
    images: [],
    currentIndex: 0,
    isOpen: false,

    init: function() {
        this.createLightbox();
        this.bindImages();
        this.bindEvents();
    },

    createLightbox: function() {
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox-overlay';
        lightbox.innerHTML = `
            <div class="lightbox-backdrop"></div>
            <button class="lightbox-close" aria-label="Close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
            <button class="lightbox-nav lightbox-prev" aria-label="Previous">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
            </button>
            <button class="lightbox-nav lightbox-next" aria-label="Next">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </button>
            <div class="lightbox-content">
                <div class="lightbox-image-container">
                    <img class="lightbox-image" src="" alt="">
                    <div class="lightbox-loader">
                        <div class="lightbox-spinner"></div>
                    </div>
                </div>
            </div>
            <div class="lightbox-info">
                <div class="lightbox-caption"></div>
                <div class="lightbox-counter"></div>
            </div>
            <div class="lightbox-thumbnails"></div>
        `;
        document.body.appendChild(lightbox);
        this.overlay = lightbox;
    },

    bindImages: function() {
        const galleryImages = document.querySelectorAll('[data-lightbox], .project-image img, .gallery-image');

        galleryImages.forEach((img, index) => {
            img.style.cursor = 'pointer';
            img.setAttribute('data-lightbox-index', index);

            this.images.push({
                src: img.dataset.fullsize || img.src,
                caption: img.dataset.caption || img.alt || '',
                thumb: img.src
            });

            img.addEventListener('click', () => {
                this.open(index);
            });
        });

        this.renderThumbnails();
    },

    renderThumbnails: function() {
        const container = this.overlay.querySelector('.lightbox-thumbnails');
        if (this.images.length <= 1) {
            container.style.display = 'none';
            return;
        }

        container.innerHTML = this.images.map((img, i) =>
            `<div class="lightbox-thumb ${i === 0 ? 'active' : ''}" data-index="${i}">
                <img src="${img.thumb}" alt="">
            </div>`
        ).join('');

        container.querySelectorAll('.lightbox-thumb').forEach(thumb => {
            thumb.addEventListener('click', () => {
                this.goTo(parseInt(thumb.dataset.index));
            });
        });
    },

    bindEvents: function() {
        this.overlay.querySelector('.lightbox-close').addEventListener('click', () => this.close());
        this.overlay.querySelector('.lightbox-backdrop').addEventListener('click', () => this.close());
        this.overlay.querySelector('.lightbox-prev').addEventListener('click', () => this.prev());
        this.overlay.querySelector('.lightbox-next').addEventListener('click', () => this.next());

        document.addEventListener('keydown', (e) => {
            if (!this.isOpen) return;

            switch(e.key) {
                case 'Escape': this.close(); break;
                case 'ArrowLeft': this.prev(); break;
                case 'ArrowRight': this.next(); break;
            }
        });

        let touchStartX = 0;
        this.overlay.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });

        this.overlay.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > 50) {
                if (diff > 0) this.next();
                else this.prev();
            }
        });
    },

    open: function(index) {
        this.currentIndex = index;
        this.isOpen = true;
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.showImage();
    },

    close: function() {
        this.isOpen = false;
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
    },

    showImage: function() {
        const img = this.overlay.querySelector('.lightbox-image');
        const loader = this.overlay.querySelector('.lightbox-loader');
        const caption = this.overlay.querySelector('.lightbox-caption');
        const counter = this.overlay.querySelector('.lightbox-counter');

        loader.classList.add('show');
        img.classList.remove('loaded');

        const imageData = this.images[this.currentIndex];

        const newImg = new Image();
        newImg.onload = () => {
            img.src = imageData.src;
            img.classList.add('loaded');
            loader.classList.remove('show');
        };
        newImg.src = imageData.src;

        caption.textContent = imageData.caption;
        counter.textContent = `${this.currentIndex + 1} / ${this.images.length}`;

        this.overlay.querySelectorAll('.lightbox-thumb').forEach((thumb, i) => {
            thumb.classList.toggle('active', i === this.currentIndex);
        });

        // Update nav visibility
        this.overlay.querySelector('.lightbox-prev').style.opacity = this.currentIndex === 0 ? '0.3' : '1';
        this.overlay.querySelector('.lightbox-next').style.opacity = this.currentIndex === this.images.length - 1 ? '0.3' : '1';
    },

    prev: function() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.showImage();
        }
    },

    next: function() {
        if (this.currentIndex < this.images.length - 1) {
            this.currentIndex++;
            this.showImage();
        }
    },

    goTo: function(index) {
        this.currentIndex = index;
        this.showImage();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Lightbox.init();
});
