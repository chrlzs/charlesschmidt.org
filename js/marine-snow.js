// Marine Snow Animation Module
// Creates a suspended particulate effect using programming-related characters
// with depth-based sizing, opacity, and parallax movement

class MarineSnowParticle {
    /**
     * Creates a single marine snow particle with programming symbols
     * @param {HTMLElement} container - The container element
     * @param {object} options - Configuration options
     */
    constructor(container, options = {}) {
        this.container = container;
        this.symbols = options.symbols || ['{', '}', '[', ']', '(', ')', '<', '>', ';', ':', '=', '+', '-', '*', '/', '\\', '|', '&', '%', '$', '#', '@', '!', '?', '.', ',', '"', "'", '`', '~', '^'];

        // Particle properties
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * window.innerHeight;
        this.z = Math.random(); // 0 = far, 1 = close
        this.symbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];

        // Movement properties
        this.fallSpeed = (0.2 + this.z * 0.8) * (options.baseSpeed || 1); // Closer particles fall faster
        this.driftSpeed = (Math.random() - 0.5) * 0.3 * this.z; // Horizontal drift
        this.rotationSpeed = (Math.random() - 0.5) * 2; // Rotation speed
        this.rotation = Math.random() * 360;

        // Visual properties based on depth
        this.size = 8 + (this.z * 12); // 8px to 20px
        this.opacity = 0.1 + (this.z * 0.4); // 0.1 to 0.5
        this.blur = (1 - this.z) * 2; // Far particles are more blurred

        this.createElement();
    }

    /**
     * Creates the DOM element for the particle
     */
    createElement() {
        this.element = document.createElement('div');
        this.element.className = 'marine-particle';
        this.element.textContent = this.symbol;
        this.element.setAttribute('aria-hidden', 'true');

        this.updateStyle();
        this.container.appendChild(this.element);
    }

    /**
     * Updates the particle's CSS styles based on current properties
     */
    updateStyle() {
        if (!this.element) return;

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
            transform: rotate(${this.rotation}deg);
            filter: blur(${this.blur}px);
            text-shadow: 0 0 ${this.size * 0.5}px rgba(159, 220, 0, ${this.opacity * 0.8});
            will-change: transform, opacity;
            user-select: none;
        `;
    }

    /**
     * Updates particle position and rotation
     * @param {number} deltaTime - Time elapsed since last update
     * @param {number} parallaxOffset - Parallax scroll offset
     */
    update(deltaTime, parallaxOffset = 0) {
        // Apply gravity and drift
        this.y += this.fallSpeed * deltaTime;
        this.x += this.driftSpeed * deltaTime;

        // Apply parallax effect (closer particles move more with scroll)
        const parallaxInfluence = this.z * 0.3;
        this.y += parallaxOffset * parallaxInfluence;

        // Rotate particle
        this.rotation += this.rotationSpeed * deltaTime * 0.1;

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

        this.updateStyle();
    }

    /**
     * Removes the particle from the DOM
     */
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

class MarineSnowSystem {
    /**
     * Creates a marine snow particle system
     * @param {object} options - Configuration options
     */
    constructor(options = {}) {
        this.options = {
            particleCount: options.particleCount || 50,
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

        this.init();
    }

    /**
     * Initializes the marine snow system
     */
    init() {
        // Respect user's motion preferences
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        this.createContainer();
        this.createParticles();
        this.setupEventListeners();
        this.startAnimation();
    }

    /**
     * Creates the container element for particles
     */
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
        `;

        document.body.appendChild(this.container);
    }

    /**
     * Creates all particles
     */
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

    /**
     * Sets up event listeners for performance optimization
     */
    setupEventListeners() {
        // Handle visibility changes
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                this.isVisible = entry.isIntersecting;
            });
        });

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

        // Handle scroll for parallax effect
        if (this.options.enableParallax) {
            let ticking = false;

            window.addEventListener('scroll', () => {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        this.scrollY = window.pageYOffset;
                        ticking = false;
                    });
                    ticking = true;
                }
            }, { passive: true });
        }

        // Handle resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    /**
     * Starts the animation loop
     */
    startAnimation() {
        this.lastTime = performance.now();
        this.animate();
    }

    /**
     * Main animation loop
     */
    animate() {
        if (!this.isVisible || document.hidden) {
            this.animationId = requestAnimationFrame(() => this.animate());
            return;
        }

        const currentTime = performance.now();
        const deltaTime = Math.min(currentTime - this.lastTime, 16.67); // Cap at 60fps
        this.lastTime = currentTime;

        // Calculate parallax offset
        const parallaxOffset = this.options.enableParallax ?
            (this.scrollY - this.lastScrollY) * 0.1 : 0;
        this.lastScrollY = this.scrollY;

        // Update all particles
        this.particles.forEach(particle => {
            particle.update(deltaTime, parallaxOffset);
        });

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    /**
     * Pauses the animation
     */
    pauseAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    /**
     * Resumes the animation
     */
    resumeAnimation() {
        if (!this.animationId) {
            this.startAnimation();
        }
    }

    /**
     * Handles window resize
     */
    handleResize() {
        // Update particle positions to stay within new bounds
        this.particles.forEach(particle => {
            if (particle.x > window.innerWidth) {
                particle.x = window.innerWidth;
            }
            if (particle.y > window.innerHeight) {
                particle.y = window.innerHeight;
            }
        });
    }

    /**
     * Updates the particle count
     * @param {number} count - New particle count
     */
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

    /**
     * Updates the animation speed
     * @param {number} speed - New base speed multiplier
     */
    setSpeed(speed) {
        this.options.baseSpeed = speed;
        this.particles.forEach(particle => {
            particle.fallSpeed = (0.2 + particle.z * 0.8) * speed;
        });
    }

    /**
     * Destroys the marine snow system
     */
    destroy() {
        this.pauseAnimation();

        this.particles.forEach(particle => particle.destroy());
        this.particles = [];

        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}

// Export for use in main.js
window.MarineSnowSystem = MarineSnowSystem;
