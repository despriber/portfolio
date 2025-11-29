/**
 * BACKGROUND EFFECTS SYSTEM
 * Multiple beautiful background options with smooth transitions
 */

const BackgroundSystem = {
    currentEffect: null,
    canvas: null,
    ctx: null,
    animationId: null,
    particles: [],
    mouse: { x: 0, y: 0 },

    effects: ['particles', 'gradient', 'waves', 'constellation', 'aurora', 'light-minimal', 'light-gradient', 'light-dots'],
    currentIndex: 0,
    isLightMode: false,

    init: function(defaultEffect = 'particles') {
        this.createCanvas();
        this.createSwitcher();
        this.bindEvents();

        const saved = localStorage.getItem('bgEffect');
        if (saved && this.effects.includes(saved)) {
            this.currentIndex = this.effects.indexOf(saved);
            this.switchEffect(saved);
        } else {
            this.switchEffect(defaultEffect);
        }
    },

    createCanvas: function() {
        const existing = document.getElementById('bg-canvas');
        if (existing) existing.remove();

        this.canvas = document.createElement('canvas');
        this.canvas.id = 'bg-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            pointer-events: none;
        `;
        document.body.insertBefore(this.canvas, document.body.firstChild);
        this.ctx = this.canvas.getContext('2d');
        this.resize();
    },

    createSwitcher: function() {
        const switcher = document.createElement('div');
        switcher.id = 'bg-switcher';
        switcher.innerHTML = `
            <button class="bg-switch-btn" id="bgSwitchBtn" title="Switch Background">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
            </button>
            <div class="bg-menu" id="bgMenu">
                <div class="bg-menu-title">Background Effect</div>
                <button class="bg-option" data-effect="particles">
                    <span class="bg-option-icon">✦</span>
                    <span>Particles</span>
                </button>
                <button class="bg-option" data-effect="gradient">
                    <span class="bg-option-icon">◐</span>
                    <span>Gradient Flow</span>
                </button>
                <button class="bg-option" data-effect="waves">
                    <span class="bg-option-icon">≋</span>
                    <span>Waves</span>
                </button>
                <button class="bg-option" data-effect="constellation">
                    <span class="bg-option-icon">✧</span>
                    <span>Constellation</span>
                </button>
                <button class="bg-option" data-effect="aurora">
                    <span class="bg-option-icon">☽</span>
                    <span>Aurora</span>
                </button>
                <button class="bg-option" data-effect="none">
                    <span class="bg-option-icon">○</span>
                    <span>None (Pure Dark)</span>
                </button>
                <div class="bg-menu-title" style="margin-top: 10px;">Light Mode</div>
                <button class="bg-option" data-effect="light-minimal">
                    <span class="bg-option-icon">☀</span>
                    <span>Minimal White</span>
                </button>
                <button class="bg-option" data-effect="light-gradient">
                    <span class="bg-option-icon">◑</span>
                    <span>Soft Gradient</span>
                </button>
                <button class="bg-option" data-effect="light-dots">
                    <span class="bg-option-icon">⋯</span>
                    <span>Dotted Pattern</span>
                </button>
            </div>
        `;
        document.body.appendChild(switcher);
    },

    bindEvents: function() {
        window.addEventListener('resize', () => this.resize());

        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        const btn = document.getElementById('bgSwitchBtn');
        const menu = document.getElementById('bgMenu');

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('#bg-switcher')) {
                menu.classList.remove('active');
            }
        });

        document.querySelectorAll('.bg-option').forEach(opt => {
            opt.addEventListener('click', () => {
                const effect = opt.dataset.effect;
                this.switchEffect(effect);
                menu.classList.remove('active');

                document.querySelectorAll('.bg-option').forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
            });
        });
    },

    resize: function() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    switchEffect: function(effect) {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        this.currentEffect = effect;
        localStorage.setItem('bgEffect', effect);
        this.particles = [];

        document.querySelectorAll('.bg-option').forEach(opt => {
            opt.classList.toggle('active', opt.dataset.effect === effect);
        });

        switch(effect) {
            case 'particles':
                this.setLightMode(false);
                this.initParticles();
                this.animateParticles();
                break;
            case 'gradient':
                this.setLightMode(false);
                this.animateGradient();
                break;
            case 'waves':
                this.setLightMode(false);
                this.animateWaves();
                break;
            case 'constellation':
                this.setLightMode(false);
                this.initConstellation();
                this.animateConstellation();
                break;
            case 'aurora':
                this.setLightMode(false);
                this.animateAurora();
                break;
            case 'none':
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.setLightMode(false);
                break;
            case 'light-minimal':
                this.setLightMode(true);
                this.animateLightMinimal();
                break;
            case 'light-gradient':
                this.setLightMode(true);
                this.animateLightGradient();
                break;
            case 'light-dots':
                this.setLightMode(true);
                this.animateLightDots();
                break;
        }
    },

    setLightMode: function(isLight) {
        this.isLightMode = isLight;
        document.body.classList.toggle('light-mode', isLight);
    },

    // PARTICLES EFFECT
    initParticles: function() {
        const count = Math.min(80, Math.floor((this.canvas.width * this.canvas.height) / 15000));
        this.particles = [];

        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: (Math.random() - 0.5) * 0.3,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
    },

    animateParticles: function() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.fillStyle = '#030303';
        ctx.fillRect(0, 0, w, h);

        this.particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;

            if (p.x < 0) p.x = w;
            if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h;
            if (p.y > h) p.y = 0;

            const dx = this.mouse.x - p.x;
            const dy = this.mouse.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 150) {
                const force = (150 - dist) / 150;
                p.x -= dx * force * 0.02;
                p.y -= dy * force * 0.02;
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(180, 143, 95, ${p.opacity})`;
            ctx.fill();
        });

        // Connect nearby particles
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    ctx.strokeStyle = `rgba(180, 143, 95, ${0.1 * (1 - dist / 120)})`;
                    ctx.stroke();
                }
            }
        }

        this.animationId = requestAnimationFrame(() => this.animateParticles());
    },

    // GRADIENT FLOW EFFECT
    gradientTime: 0,
    animateGradient: function() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        this.gradientTime += 0.003;

        const gradient = ctx.createRadialGradient(
            w * 0.3 + Math.sin(this.gradientTime) * w * 0.2,
            h * 0.3 + Math.cos(this.gradientTime * 0.7) * h * 0.2,
            0,
            w * 0.5,
            h * 0.5,
            w * 0.8
        );

        gradient.addColorStop(0, `rgba(60, 40, 20, ${0.3 + Math.sin(this.gradientTime) * 0.1})`);
        gradient.addColorStop(0.5, 'rgba(20, 15, 10, 0.5)');
        gradient.addColorStop(1, '#030303');

        ctx.fillStyle = '#030303';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // Second gradient layer
        const gradient2 = ctx.createRadialGradient(
            w * 0.7 + Math.cos(this.gradientTime * 0.5) * w * 0.15,
            h * 0.6 + Math.sin(this.gradientTime * 0.8) * h * 0.15,
            0,
            w * 0.5,
            h * 0.5,
            w * 0.6
        );

        gradient2.addColorStop(0, `rgba(80, 50, 30, ${0.15 + Math.cos(this.gradientTime * 1.3) * 0.05})`);
        gradient2.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient2;
        ctx.fillRect(0, 0, w, h);

        // Mouse interaction glow
        const mouseGradient = ctx.createRadialGradient(
            this.mouse.x, this.mouse.y, 0,
            this.mouse.x, this.mouse.y, 200
        );
        mouseGradient.addColorStop(0, 'rgba(180, 143, 95, 0.08)');
        mouseGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = mouseGradient;
        ctx.fillRect(0, 0, w, h);

        this.animationId = requestAnimationFrame(() => this.animateGradient());
    },

    // WAVES EFFECT
    waveTime: 0,
    animateWaves: function() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        this.waveTime += 0.008;

        ctx.fillStyle = '#030303';
        ctx.fillRect(0, 0, w, h);

        const waves = [
            { amplitude: 50, frequency: 0.008, speed: 1, opacity: 0.08, color: '180, 143, 95' },
            { amplitude: 35, frequency: 0.012, speed: 1.3, opacity: 0.06, color: '150, 120, 80' },
            { amplitude: 25, frequency: 0.015, speed: 0.8, opacity: 0.04, color: '200, 160, 100' }
        ];

        waves.forEach((wave, index) => {
            ctx.beginPath();
            ctx.moveTo(0, h);

            for (let x = 0; x <= w; x += 5) {
                const y = h * 0.6 +
                    Math.sin(x * wave.frequency + this.waveTime * wave.speed) * wave.amplitude +
                    Math.sin(x * wave.frequency * 0.5 + this.waveTime * wave.speed * 0.7) * wave.amplitude * 0.5 +
                    index * 80;
                ctx.lineTo(x, y);
            }

            ctx.lineTo(w, h);
            ctx.closePath();

            const gradient = ctx.createLinearGradient(0, h * 0.4, 0, h);
            gradient.addColorStop(0, `rgba(${wave.color}, ${wave.opacity})`);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fill();
        });

        this.animationId = requestAnimationFrame(() => this.animateWaves());
    },

    // CONSTELLATION EFFECT
    initConstellation: function() {
        const count = Math.min(100, Math.floor((this.canvas.width * this.canvas.height) / 12000));
        this.particles = [];

        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 1.5 + 0.5,
                twinkle: Math.random() * Math.PI * 2,
                twinkleSpeed: Math.random() * 0.02 + 0.01
            });
        }
    },

    animateConstellation: function() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.fillStyle = '#030303';
        ctx.fillRect(0, 0, w, h);

        // Draw stars with twinkle
        this.particles.forEach(p => {
            p.twinkle += p.twinkleSpeed;
            const opacity = 0.3 + Math.sin(p.twinkle) * 0.3;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.fill();

            // Glow effect for larger stars
            if (p.size > 1) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(180, 143, 95, ${opacity * 0.1})`;
                ctx.fill();
            }
        });

        // Connect stars near mouse
        const connectionRadius = 180;
        this.particles.forEach(p => {
            const dx = this.mouse.x - p.x;
            const dy = this.mouse.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < connectionRadius) {
                const opacity = (1 - dist / connectionRadius) * 0.4;
                ctx.beginPath();
                ctx.moveTo(this.mouse.x, this.mouse.y);
                ctx.lineTo(p.x, p.y);
                ctx.strokeStyle = `rgba(180, 143, 95, ${opacity})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        });

        // Connect nearby stars
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 80) {
                    ctx.beginPath();
                    ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    ctx.strokeStyle = `rgba(100, 100, 120, ${0.15 * (1 - dist / 80)})`;
                    ctx.lineWidth = 0.3;
                    ctx.stroke();
                }
            }
        }

        this.animationId = requestAnimationFrame(() => this.animateConstellation());
    },

    // AURORA EFFECT
    auroraTime: 0,
    animateAurora: function() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        this.auroraTime += 0.005;

        ctx.fillStyle = '#030303';
        ctx.fillRect(0, 0, w, h);

        const layers = [
            { color: [100, 80, 60], yOffset: 0.2, amplitude: 100, frequency: 0.003 },
            { color: [80, 100, 80], yOffset: 0.25, amplitude: 80, frequency: 0.004 },
            { color: [60, 80, 100], yOffset: 0.3, amplitude: 60, frequency: 0.005 }
        ];

        layers.forEach((layer, idx) => {
            ctx.beginPath();

            for (let x = 0; x <= w; x += 3) {
                const noise1 = Math.sin(x * layer.frequency + this.auroraTime) * layer.amplitude;
                const noise2 = Math.sin(x * layer.frequency * 2 + this.auroraTime * 1.5) * layer.amplitude * 0.5;
                const noise3 = Math.sin(x * layer.frequency * 0.5 + this.auroraTime * 0.7) * layer.amplitude * 0.3;

                const y = h * layer.yOffset + noise1 + noise2 + noise3;

                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }

            ctx.lineTo(w, h);
            ctx.lineTo(0, h);
            ctx.closePath();

            const gradient = ctx.createLinearGradient(0, h * 0.1, 0, h * 0.7);
            const opacity = 0.15 + Math.sin(this.auroraTime + idx) * 0.05;
            gradient.addColorStop(0, `rgba(${layer.color.join(',')}, ${opacity})`);
            gradient.addColorStop(0.5, `rgba(${layer.color.join(',')}, ${opacity * 0.5})`);
            gradient.addColorStop(1, 'transparent');

            ctx.fillStyle = gradient;
            ctx.fill();
        });

        // Subtle noise overlay
        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 5;
            data[i] += noise;
            data[i + 1] += noise;
            data[i + 2] += noise;
        }
        ctx.putImageData(imageData, 0, 0);

        this.animationId = requestAnimationFrame(() => this.animateAurora());
    },

    // LIGHT MINIMAL EFFECT
    animateLightMinimal: function() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.fillStyle = '#fafafa';
        ctx.fillRect(0, 0, w, h);

        // Subtle mouse glow
        const mouseGradient = ctx.createRadialGradient(
            this.mouse.x, this.mouse.y, 0,
            this.mouse.x, this.mouse.y, 300
        );
        mouseGradient.addColorStop(0, 'rgba(180, 143, 95, 0.08)');
        mouseGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = mouseGradient;
        ctx.fillRect(0, 0, w, h);

        this.animationId = requestAnimationFrame(() => this.animateLightMinimal());
    },

    // LIGHT GRADIENT EFFECT
    lightGradientTime: 0,
    animateLightGradient: function() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        this.lightGradientTime += 0.002;

        // Base gradient
        const gradient = ctx.createLinearGradient(0, 0, w, h);
        gradient.addColorStop(0, '#f8f6f3');
        gradient.addColorStop(0.5, '#faf9f7');
        gradient.addColorStop(1, '#f5f3f0');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // Moving color blob 1
        const x1 = w * 0.3 + Math.sin(this.lightGradientTime) * w * 0.15;
        const y1 = h * 0.3 + Math.cos(this.lightGradientTime * 0.7) * h * 0.15;
        const grad1 = ctx.createRadialGradient(x1, y1, 0, x1, y1, w * 0.4);
        grad1.addColorStop(0, 'rgba(180, 143, 95, 0.1)');
        grad1.addColorStop(1, 'transparent');
        ctx.fillStyle = grad1;
        ctx.fillRect(0, 0, w, h);

        // Moving color blob 2
        const x2 = w * 0.7 + Math.cos(this.lightGradientTime * 0.5) * w * 0.1;
        const y2 = h * 0.6 + Math.sin(this.lightGradientTime * 0.8) * h * 0.1;
        const grad2 = ctx.createRadialGradient(x2, y2, 0, x2, y2, w * 0.35);
        grad2.addColorStop(0, 'rgba(100, 130, 160, 0.08)');
        grad2.addColorStop(1, 'transparent');
        ctx.fillStyle = grad2;
        ctx.fillRect(0, 0, w, h);

        this.animationId = requestAnimationFrame(() => this.animateLightGradient());
    },

    // LIGHT DOTS EFFECT
    lightDotsParticles: [],
    initLightDots: function() {
        const count = Math.min(60, Math.floor((this.canvas.width * this.canvas.height) / 20000));
        this.lightDotsParticles = [];

        for (let i = 0; i < count; i++) {
            this.lightDotsParticles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 0.2,
                speedY: (Math.random() - 0.5) * 0.2,
                opacity: Math.random() * 0.3 + 0.1
            });
        }
    },

    animateLightDots: function() {
        if (this.lightDotsParticles.length === 0) {
            this.initLightDots();
        }

        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.fillStyle = '#fafafa';
        ctx.fillRect(0, 0, w, h);

        // Draw grid pattern
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.03)';
        ctx.lineWidth = 1;
        const gridSize = 40;
        for (let x = 0; x < w; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
        for (let y = 0; y < h; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // Draw and move dots
        this.lightDotsParticles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;

            if (p.x < 0) p.x = w;
            if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h;
            if (p.y > h) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(180, 143, 95, ${p.opacity})`;
            ctx.fill();
        });

        // Mouse interaction
        const mouseGradient = ctx.createRadialGradient(
            this.mouse.x, this.mouse.y, 0,
            this.mouse.x, this.mouse.y, 150
        );
        mouseGradient.addColorStop(0, 'rgba(180, 143, 95, 0.15)');
        mouseGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = mouseGradient;
        ctx.fillRect(0, 0, w, h);

        this.animationId = requestAnimationFrame(() => this.animateLightDots());
    }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    BackgroundSystem.init('particles');
});
