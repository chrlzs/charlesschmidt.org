// Funnel Animation Module
// Handles spiral text animations for funnel layers in the UI.
class FunnelAnimation {
    /**
     * Creates a FunnelAnimation instance for a given container.
     * @param {string} containerId - The DOM id of the container element.
     * @param {object} options - Configuration options for the animation.
     */
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        // Animation configuration
        this.text = options.text || "NUI ";
        this.maxRadius = options.maxRadius || 200;
        this.minRadius = options.minRadius || 15;
        this.totalHeight = options.totalHeight || 300;
        this.spiralTurns = options.spiralTurns || 3;
        this.rotationSpeed = options.rotationSpeed || 20;
        this.fontSize = options.fontSize || 16;
        this.opacity = options.opacity || 1;
        this.centerX = options.centerX || window.innerWidth / 2;
        this.centerY = options.centerY || window.innerHeight / 2;
        this.isVisible = true;
        this.animationId = null;

        this.init();
    }

    /**
     * Initializes the spiral text animation and sets up visibility observer.
     */
    init() {
        this.createSpiralText();
        this.startRotation();
        this.setupVisibilityObserver();
    }

    /**
     * Sets up an IntersectionObserver to pause animation when the funnel is not visible.
     * Improves performance by stopping animation when offscreen.
     */
    setupVisibilityObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                this.isVisible = entry.isIntersecting;
                if (!this.isVisible && this.animationId) {
                    cancelAnimationFrame(this.animationId);
                } else if (this.isVisible) {
                    this.startRotation();
                }
            });
        });

        observer.observe(this.container);
    }

    /**
     * Creates spiral text by positioning each character in a spiral pattern.
     */
    createSpiralText() {
        const fragment = document.createDocumentFragment();
        const totalChars = this.text.length * 6;

        for (let i = 0; i < totalChars; i++) {
            const charIndex = i % this.text.length;
            const character = this.text[charIndex];

            if (character === ' ') continue;

            const char = document.createElement('div');
            char.className = 'text-char';
            char.textContent = character;
            char.setAttribute('aria-hidden', 'true'); // Hide from screen readers

            this.positionCharacter(char, i, totalChars);
            fragment.appendChild(char);
        }

        this.container.appendChild(fragment);
    }

    /**
     * Positions a character in the spiral based on its index.
     * @param {HTMLElement} char - The character element.
     * @param {number} index - The character's index in the spiral.
     * @param {number} totalChars - Total number of characters in the spiral.
     */
    positionCharacter(char, index, totalChars) {
        const progress = index / totalChars;
        const y = this.centerY - (this.totalHeight / 2) + (progress * this.totalHeight);
        const radius = this.maxRadius - (progress * (this.maxRadius - this.minRadius));
        const angle = progress * this.spiralTurns * 360;
        const radians = (angle * Math.PI) / 180;
        const x = this.centerX + Math.cos(radians) * radius;
        const z = Math.sin(radians) * radius;
        const isBack = Math.sin(radians) < 0;

        char.style.cssText = `
            left: ${x}px;
            top: ${y}px;
            transform: translateZ(${z}px) rotateY(${angle}deg)${isBack ? ' scaleX(-1)' : ''};
            font-size: ${this.fontSize * (0.6 + (radius / this.maxRadius) * 0.8)}px;
            opacity: ${this.calculateOpacity(progress, radius, isBack)};
        `;

        if (isBack) char.classList.add('back');
    }

    /**
     * Calculates opacity for a character based on its position and depth.
     * @param {number} progress - Progress through the spiral.
     * @param {number} radius - Current radius for the character.
     * @param {boolean} isBack - Whether the character is on the back side of the spiral.
     * @returns {number} - The calculated opacity value.
     */
    calculateOpacity(progress, radius, isBack) {
        const fadeOpacity = (1 - progress) * this.opacity;
        const depthOpacity = 0.8 + (radius / this.maxRadius) * 0.2;
        const finalOpacity = fadeOpacity * depthOpacity;
        return isBack ? finalOpacity * 0.4 : finalOpacity;
    }

    /**
     * Starts the corkscrew animation for individual characters.
     */
    startRotation() {
        if (!this.isVisible) return;

        this.startTime = performance.now();
        this.animate();
    }

    /**
     * Animates characters along the spiral path to create a corkscrew effect.
     */
    animate() {
        if (!this.isVisible) return;

        const currentTime = performance.now();
        const elapsed = (currentTime - this.startTime) / 1000; // Convert to seconds
        const rotationOffset = (elapsed * 360) / this.rotationSpeed; // Degrees per second

        const chars = this.container.querySelectorAll('.text-char');
        chars.forEach((char, index) => {
            const totalChars = chars.length;
            const progress = index / totalChars;
            const y = this.centerY - (this.totalHeight / 2) + (progress * this.totalHeight);
            const radius = this.maxRadius - (progress * (this.maxRadius - this.minRadius));

            // Add rotation offset to create corkscrew movement
            const angle = (progress * this.spiralTurns * 360) + rotationOffset;
            const radians = (angle * Math.PI) / 180;
            const x = this.centerX + Math.cos(radians) * radius;
            const z = Math.sin(radians) * radius;
            const isBack = Math.sin(radians) < 0;

            char.style.transform = `translateZ(${z}px) rotateY(${angle}deg)${isBack ? ' scaleX(-1)' : ''}`;
            char.style.left = `${x}px`;
            char.style.top = `${y}px`;
            char.style.opacity = this.calculateOpacity(progress, radius, isBack);

            if (isBack) {
                char.classList.add('back');
            } else {
                char.classList.remove('back');
            }
        });

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    /**
     * Destroys the funnel animation and cleans up DOM and animation frames.
     */
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.container.innerHTML = '';
    }
}

// Funnel configuration with performance optimizations
// Each config defines a funnel's appearance and animation parameters.
const FUNNEL_CONFIGS = [
    {
        id: 'funnel1',
        text: "access_token = decrypt(authHeader) ",
        maxRadius: 400,
        minRadius: 25,
        totalHeight: 500,
        spiralTurns: 5,
        rotationSpeed: 60,
        fontSize: 20,
        opacity: 0.08,
        centerX: () => window.innerWidth * 0.15,
        centerY: () => window.innerHeight * 0.7
    },
    {
        id: 'funnel2',
        text: "ssh -i ~/.ssh/id_rsa user@192.168.0.4 ",
        maxRadius: 280,
        minRadius: 18,
        totalHeight: 380,
        spiralTurns: 4,
        rotationSpeed: 50,
        fontSize: 16,
        opacity: 0.12,
        centerX: () => window.innerWidth * 0.8,
        centerY: () => window.innerHeight * 0.3
    },
    {
        id: 'funnel3',
        text: "const payload = JSON.stringify(data); ",
        maxRadius: 200,
        minRadius: 12,
        totalHeight: 280,
        spiralTurns: 3.5,
        rotationSpeed: 40,
        fontSize: 14,
        opacity: 0.15,
        centerX: () => window.innerWidth * 0.3,
        centerY: () => window.innerHeight * 0.5
    },
    {
        id: 'funnel4',
        text: "vm.pushFrame(currentContext); ",
        maxRadius: 160,
        minRadius: 10,
        totalHeight: 220,
        spiralTurns: 3,
        rotationSpeed: 30,
        fontSize: 12,
        opacity: 0.18,
        centerX: () => window.innerWidth * 0.7,
        centerY: () => window.innerHeight * 0.8
    },
    {
        id: 'funnel5',
        text: "const authHeader = 'Bearer ' + access_token; ",
        maxRadius: 120,
        minRadius: 8,
        totalHeight: 180,
        spiralTurns: 2.8,
        rotationSpeed: 25,
        fontSize: 11,
        opacity: 0.22,
        centerX: () => window.innerWidth * 0.1,
        centerY: () => window.innerHeight * 0.4
    },
    {
        id: 'funnel6',
        text: "init_vector = os.urandom(16) ",
        maxRadius: 100,
        minRadius: 6,
        totalHeight: 150,
        spiralTurns: 2.5,
        rotationSpeed: 20,
        fontSize: 10,
        opacity: 0.25,
        centerX: () => window.innerWidth * 0.9,
        centerY: () => window.innerHeight * 0.6
    },
    {
        id: 'funnel7',
        text: "import quantum.core as qc ",
        maxRadius: 80,
        minRadius: 4,
        totalHeight: 120,
        spiralTurns: 2,
        rotationSpeed: 15,
        fontSize: 8,
        opacity: 0.3,
        centerX: () => window.innerWidth * 0.5,
        centerY: () => window.innerHeight * 0.2
    },
    {
        id: 'funnel8',
        text: "echo $(date +%s | sha256sum | base64 | head -c 32) ",
        maxRadius: 60,
        minRadius: 2,
        totalHeight: 100,
        spiralTurns: 1.5,
        rotationSpeed: 10,
        fontSize: 6,
        opacity: 0.35,
        centerX: () => window.innerWidth * 0.2,
        centerY: () => window.innerHeight * 0.9
    }
];

/**
 * Manages multiple funnel animations and their lifecycle.
 */
class FunnelManager {
    constructor() {
        this.funnels = [];
        this.resizeTimeout = null;
        this.isInitialized = false;
    }

    /**
     * Initializes all funnel animations if user allows motion.
     */
    init() {
        if (this.isInitialized) return;

        // Only initialize if user prefers motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        this.createFunnels();
        this.setupEventListeners();
        this.isInitialized = true;
    }

    /**
     * Creates all funnel animations based on configuration.
     */
    createFunnels() {
        FUNNEL_CONFIGS.forEach(config => {
            const options = {
                ...config,
                centerX: typeof config.centerX === 'function' ? config.centerX() : config.centerX,
                centerY: typeof config.centerY === 'function' ? config.centerY() : config.centerY
            };

            const funnel = new FunnelAnimation(config.id, options);
            if (funnel.container) {
                this.funnels.push(funnel);
            }
        });
    }

    /**
     * Sets up event listeners for resize and tab visibility changes.
     */
    setupEventListeners() {
        window.addEventListener('resize', this.handleResize.bind(this));

        // Pause animations when tab is not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimations();
            } else {
                this.resumeAnimations();
            }
        });
    }

    /**
     * Handles window resize by recreating funnel animations after a short delay.
     */
    handleResize() {
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }

        this.resizeTimeout = setTimeout(() => {
            this.destroy();
            this.createFunnels();
        }, 250);
    }

    /**
     * Pauses all funnel animations (used when tab is hidden).
     */
    pauseAnimations() {
        this.funnels.forEach(funnel => {
            funnel.isVisible = false;
            if (funnel.animationId) {
                cancelAnimationFrame(funnel.animationId);
            }
        });
    }

    /**
     * Resumes all funnel animations (used when tab becomes visible).
     */
    resumeAnimations() {
        this.funnels.forEach(funnel => {
            funnel.isVisible = true;
            funnel.startRotation();
        });
    }

    /**
     * Destroys all funnel animations and cleans up resources.
     */
    destroy() {
        this.funnels.forEach(funnel => funnel.destroy());
        this.funnels = [];
    }
}

// Export for use in main.js
window.FunnelManager = FunnelManager;
