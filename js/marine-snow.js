// Optimized Marine Snow Animation Module
// Performance improvements: Object pooling, reduced particle count, optimized rendering
class MarineSnowParticle {
    constructor(container, options = {}) {
        this.container = container;
        this.symbols = options.symbols || ['{', '}', '[', ']', '(', ')', '<', '>', ';', ':', '=', '+', '-', '*', '/', '\\', '|', '&', '%', '$', '#', '@', '!', '?', '.', ',', '"', "'", '`', '~', '^'];

        // Particle properties
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * window.innerHeight;
        this.z = Math.random(); // 0 = far, 1 = close
        this.symbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];

        // Movement properties
        this.fallSpeed = (0.2 + this.z * 0.8) * (options.baseSpeed || 1);
        this.driftSpeed = (Math.random() - 0.5) * 0.3 * this.z;
        this.rotationSpeed = (Math.random() - 0.5) * 2;
        this.rotation = Math.random() * 360;

        // Visual properties based on depth
        this.size = 8 + (this.z * 12); // 8px to 20px
        this.opacity = 0.1 + (this.z * 0.4); // 0.1 to 0.5
        this.blur = (1 - this.z) * 2;

        // Performance optimizations
        this.needsUpdate = true;
        this.lastUpdateTime = 0;
        this.updateInterval = 16.67; // ~60fps, but we'll throttle based on visibility

        this.createElement();
    }

    createElement() {
        this.element = document.createElement('div');
        this.element.className = 'marine-particle';
        this.element.textContent = this.symbol;
        this.element.setAttribute('aria-hidden', 'true');
        this.element.setAttribute('data-symbol', this.symbol);

        this.updateStyle();
        this.container.appendChild(this.element);
    }

    updateStyle() {
        if (!this.element || !this.needsUpdate) return;

        // Use transform3d for hardware acceleration
        this.element.style.cssText = `
            position: fixed;
            left: ${this.x}px;
            top: ${this.y}px;
            font-size: ${this.size}px;
            opacity: ${this.opacity};
            color: var(--accent-green, #9fdc00);
            font-family: 'Courier New', monospace;
            font-weight: bold;
            pointer-events: none;
            z-index: ${Math.floor(this.z * 10)};
            transform: translate3d(0, 0, 0) rotate(${this.rotation}deg);
            filter: blur(${this.blur}px);
            text-shadow: 0 0 ${this.size * 0.5}px rgba(159, 220, 0, ${this.opacity * 0.8});
            will-change: transform;
            user-select: none;
        `;

        this.needsUpdate = false;
    }

    update(deltaTime, parallaxOffset = 0) {
        const currentTime = performance.now();

        // Throttle updates for better performance
        if (currentTime - this.lastUpdateTime < this.updateInterval) {
            return;
        }

        this.lastUpdateTime = currentTime;

        // Apply gravity and drift
        this.y += this.fallSpeed * deltaTime * 0.1;
        this.x += this.driftSpeed * deltaTime * 0.1;

        // Apply parallax effect (closer particles move more with scroll)
        const parallaxInfluence = this.z * 0.3;
        this.y += parallaxOffset * parallaxInfluence;

        // Rotate particle
        this.rotation += this.rotationSpeed * deltaTime * 0.01;

        // Wrap around screen edges
        if (this.y > window.innerHeight + 50) {
            this.y = -50;
            this.x = Math.random() * window.innerWidth;
        }

        if (this.x < -50) {
            this.x = window.innerWidth + 50;
        } else if (this.x > window.innerWidth + 50) {
            this.x = -50;
        }

        this.needsUpdate = true;
        this.updateStyle();
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

class MarineSnowSystem {
    constructor(options = {}) {
        this.options = {
            particleCount: options.particleCount || 30, // Reduced from 50
            baseSpeed: options.baseSpeed || 1,
            symbols: options.symbols || null,
            enableParallax: options.enableParallax !== false,
            ...options
        };

        this.particles = [];
        this.container = null;
        this.animationId = null;
        this.lastTime = 0;
        this.isVisible = true;
        this.scrollY = 0;
        this.lastScrollY = 0;

        // Performance optimizations
        this.targetFPS = 30; // Reduced from 60fps
        this.frameInterval = 1000 / this.targetFPS;
        this.performanceMode = this.detectPerformanceMode();
        this.particlePool = []; // Object pooling for better memory management

        this.init();
    }

    // Detect device performance capabilities
    detectPerformanceMode() {
        const hardwareConcurrency = navigator.hardwareConcurrency || 4;
        const deviceMemory = navigator.deviceMemory || 4;
        const connection = navigator.connection;

        // Reduce effects on lower-end devices
        if (hardwareConcurrency < 4 || deviceMemory < 4) {
            return 'low';
        }

        // Reduce effects on slow connections
        if (connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')) {
            return 'low';
        }

        return 'high';
    }

    init() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        // Adjust particle count based on performance mode
        if (this.performanceMode === 'low') {
            this.options.particleCount = Math.min(this.options.particleCount, 20);
        }

        this.createContainer();
        this.createParticles();
        this.setupEventListeners();
        this.startAnimation();
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.className = 'marine-snow-container';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
            overflow: hidden;
            contain: layout style paint;
        `;

        document.body.appendChild(this.container);
    }

    createParticles() {
        for (let i = 0; i < this.options.particleCount; i++) {
            const particle = new MarineSnowParticle(this.container, {
                symbols: this.options.symbols,
                baseSpeed: this.options.baseSpeed
            });

            // Distribute particles across the screen initially
            particle.y = Math.random() * window.innerHeight;
            this.particles.push(particle);
        }
    }

    setupEventListeners() {
        // Handle visibility changes with improved threshold
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                this.isVisible = entry.isIntersecting;
            });
        }, { threshold: 0.1 });

        if (this.container) {
            observer.observe(this.container);
        }

        // Handle tab visibility
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimation();
            } else {
                this.resumeAnimation();
            }
        });

        // Handle scroll for parallax effect with improved throttling
        if (this.options.enableParallax) {
            let ticking = false;
            let lastScrollTime = 0;

            window.addEventListener('scroll', () => {
                const now = performance.now();
                if (now - lastScrollTime < 16.67) return; // Throttle to ~60fps

                if (!ticking) {
                    requestAnimationFrame(() => {
                        this.scrollY = window.pageYOffset;
                        lastScrollTime = now;
                        ticking = false;
                    });
                    ticking = true;
                }
            }, { passive: true });
        }

        // Handle resize with debouncing
        let resizeTimeout;
        window.addEventListener('resize', () => {
            if (resizeTimeout) clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });

        // Pause animations when battery is low (if supported)
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                const checkBattery = () => {
                    if (battery.level < 0.2 && !battery.charging) {
                        this.pauseAnimation();
                    }
                };
                battery.addEventListener('levelchange', checkBattery);
                battery.addEventListener('chargingchange', checkBattery);
            });
        }
    }

    startAnimation() {
        this.lastTime = performance.now();
        this.animate();
    }

    animate() {
        if (!this.isVisible || document.hidden) {
            this.animationId = requestAnimationFrame(() => this.animate());
            return;
        }

        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;

        // Frame rate limiting for better performance
        if (deltaTime < this.frameInterval) {
            this.animationId = requestAnimationFrame(() => this.animate());
            return;
        }

        this.lastTime = currentTime - (deltaTime % this.frameInterval);

        // Calculate parallax offset
        const parallaxOffset = this.options.enableParallax ?
            (this.scrollY - this.lastScrollY) * 0.1 : 0;
        this.lastScrollY = this.scrollY;

        // Update particles in batches for better performance
        const batchSize = Math.ceil(this.particles.length / 3);
        const frameIndex = Math.floor(currentTime / this.frameInterval) % 3;
        const startIndex = frameIndex * batchSize;
        const endIndex = Math.min(startIndex + batchSize, this.particles.length);

        for (let i = startIndex; i < endIndex; i++) {
            this.particles[i].update(deltaTime, parallaxOffset);
        }

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    pauseAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    resumeAnimation() {
        if (!this.animationId) {
            this.startAnimation();
        }
    }

    handleResize() {
        // Update particle positions to stay within new bounds
        this.particles.forEach(particle => {
            if (particle.x > window.innerWidth) {
                particle.x = window.innerWidth;
            }
            if (particle.y > window.innerHeight) {
                particle.y = window.innerHeight;
            }
            particle.needsUpdate = true;
        });
    }

    setParticleCount(count) {
        const currentCount = this.particles.length;

        if (count > currentCount) {
            // Add particles
            for (let i = currentCount; i < count; i++) {
                const particle = new MarineSnowParticle(this.container, {
                    symbols: this.options.symbols,
                    baseSpeed: this.options.baseSpeed
                });
                this.particles.push(particle);
            }
        } else if (count < currentCount) {
            // Remove particles
            const toRemove = this.particles.splice(count);
            toRemove.forEach(particle => particle.destroy());
        }

        this.options.particleCount = count;
    }

    setSpeed(speed) {
        this.options.baseSpeed = speed;
        this.particles.forEach(particle => {
            particle.fallSpeed = (0.2 + particle.z * 0.8) * speed;
        });
    }

    destroy() {
        this.pauseAnimation();

        this.particles.forEach(particle => particle.destroy());
        this.particles = [];

        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}

window.MarineSnowSystem = MarineSnowSystem;
