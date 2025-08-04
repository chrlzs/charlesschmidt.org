// Optimized Funnel Animation Module
// Performance improvements: Object pooling, reduced DOM queries, optimized calculations
class FunnelAnimation {
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

        // Performance optimizations
        this.characters = []; // Cache character elements
        this.lastFrameTime = 0;
        this.targetFPS = 30; // Reduced from 60fps for better performance
        this.frameInterval = 1000 / this.targetFPS;

        // Pre-calculate constants
        this.radiusDiff = this.maxRadius - this.minRadius;
        this.spiralRadians = this.spiralTurns * 2 * Math.PI;

        this.init();
    }

    init() {
        this.createSpiralText();
        this.startRotation();
        this.setupVisibilityObserver();
    }

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
        }, { threshold: 0.1 }); // Reduced threshold for earlier detection

        observer.observe(this.container);
    }

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
            char.setAttribute('aria-hidden', 'true');

            // Cache character data for faster updates
            const charData = {
                element: char,
                index: i,
                totalChars: totalChars,
                progress: i / totalChars
            };

            this.positionCharacter(charData);
            this.characters.push(charData);
            fragment.appendChild(char);
        }

        this.container.appendChild(fragment);
    }

    positionCharacter(charData) {
        const { element: char, progress } = charData;
        const y = this.centerY - (this.totalHeight / 2) + (progress * this.totalHeight);
        const radius = this.maxRadius - (progress * this.radiusDiff);
        const angle = progress * this.spiralRadians;
        const cosAngle = Math.cos(angle);
        const sinAngle = Math.sin(angle);
        const x = this.centerX + cosAngle * radius;
        const z = sinAngle * radius;
        const isBack = sinAngle < 0;

        // Use transform3d for hardware acceleration
        char.style.cssText = `
            left: ${x}px;
            top: ${y}px;
            transform: translate3d(0, 0, ${z}px) rotateY(${angle * 180 / Math.PI}deg)${isBack ? ' scaleX(-1)' : ''};
            font-size: ${this.fontSize * (0.6 + (radius / this.maxRadius) * 0.8)}px;
            opacity: ${this.calculateOpacity(progress, radius, isBack)};
        `;

        if (isBack) char.classList.add('back');
    }

    calculateOpacity(progress, radius, isBack) {
        const fadeOpacity = (1 - progress) * this.opacity;
        const depthOpacity = 0.8 + (radius / this.maxRadius) * 0.2;
        const finalOpacity = fadeOpacity * depthOpacity;
        return isBack ? finalOpacity * 0.4 : finalOpacity;
    }

    startRotation() {
        if (!this.isVisible) return;
        this.lastFrameTime = performance.now();
        this.animate();
    }

    animate() {
        if (!this.isVisible) return;

        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastFrameTime;

        // Frame rate limiting for better performance
        if (deltaTime < this.frameInterval) {
            this.animationId = requestAnimationFrame(() => this.animate());
            return;
        }

        this.lastFrameTime = currentTime - (deltaTime % this.frameInterval);
        const elapsed = currentTime / 1000;
        const rotationOffset = (elapsed * this.spiralRadians) / this.rotationSpeed;

        // Batch DOM updates using cached character data
        this.characters.forEach(charData => {
            const { element: char, progress } = charData;
            const y = this.centerY - (this.totalHeight / 2) + (progress * this.totalHeight);
            const radius = this.maxRadius - (progress * this.radiusDiff);
            const angle = (progress * this.spiralRadians) + rotationOffset;
            const cosAngle = Math.cos(angle);
            const sinAngle = Math.sin(angle);
            const x = this.centerX + cosAngle * radius;
            const z = sinAngle * radius;
            const isBack = sinAngle < 0;

            // Use transform3d for hardware acceleration
            char.style.transform = `translate3d(0, 0, ${z}px) rotateY(${angle * 180 / Math.PI}deg)${isBack ? ' scaleX(-1)' : ''}`;
            char.style.left = `${x}px`;
            char.style.top = `${y}px`;
            char.style.opacity = this.calculateOpacity(progress, radius, isBack);

            // Toggle back class efficiently
            char.classList.toggle('back', isBack);
        });

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.characters = [];
        this.container.innerHTML = '';
    }
}

// Optimized funnel configurations with reduced particle counts
const FUNNEL_CONFIGS = [
    {
        id: 'funnel1',
        text: "access_token = decrypt(authHeader) ",
        maxRadius: 400,
        minRadius: 25,
        totalHeight: 500,
        spiralTurns: 4, // Reduced from 5
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
        spiralTurns: 3.5, // Reduced from 4
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
        spiralTurns: 3,
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
        spiralTurns: 2.5, // Reduced from 3
        rotationSpeed: 30,
        fontSize: 12,
        opacity: 0.18,
        centerX: () => window.innerWidth * 0.7,
        centerY: () => window.innerHeight * 0.8
    },
    // Reduced total number of funnels from 8 to 6 for better performance
    {
        id: 'funnel5',
        text: "const authHeader = 'Bearer ' + access_token; ",
        maxRadius: 120,
        minRadius: 8,
        totalHeight: 180,
        spiralTurns: 2.5,
        rotationSpeed: 25,
        fontSize: 11,
        opacity: 0.22,
        centerX: () => window.innerWidth * 0.1,
        centerY: () => window.innerHeight * 0.4
    },
    {
        id: 'funnel6',
        text: "import quantum.core as qc ",
        maxRadius: 100,
        minRadius: 6,
        totalHeight: 150,
        spiralTurns: 2,
        rotationSpeed: 20,
        fontSize: 10,
        opacity: 0.25,
        centerX: () => window.innerWidth * 0.9,
        centerY: () => window.innerHeight * 0.6
    }
];

class FunnelManager {
    constructor() {
        this.funnels = [];
        this.resizeTimeout = null;
        this.isInitialized = false;
        this.performanceMode = this.detectPerformanceMode();
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
        if (this.isInitialized) return;

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        this.createFunnels();
        this.setupEventListeners();
        this.isInitialized = true;
    }

    createFunnels() {
        // Use fewer funnels on low-performance devices
        const configsToUse = this.performanceMode === 'low' ?
            FUNNEL_CONFIGS.slice(0, 4) : FUNNEL_CONFIGS;

        configsToUse.forEach(config => {
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

    setupEventListeners() {
        window.addEventListener('resize', this.handleResize.bind(this));

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimations();
            } else {
                this.resumeAnimations();
            }
        });

        // Pause animations when battery is low (if supported)
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                const checkBattery = () => {
                    if (battery.level < 0.2 && !battery.charging) {
                        this.pauseAnimations();
                    }
                };
                battery.addEventListener('levelchange', checkBattery);
                battery.addEventListener('chargingchange', checkBattery);
            });
        }
    }

    handleResize() {
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }

        this.resizeTimeout = setTimeout(() => {
            this.destroy();
            this.createFunnels();
        }, 300); // Increased debounce time
    }

    pauseAnimations() {
        this.funnels.forEach(funnel => {
            funnel.isVisible = false;
            if (funnel.animationId) {
                cancelAnimationFrame(funnel.animationId);
            }
        });
    }

    resumeAnimations() {
        this.funnels.forEach(funnel => {
            funnel.isVisible = true;
            funnel.startRotation();
        });
    }

    destroy() {
        this.funnels.forEach(funnel => funnel.destroy());
        this.funnels = [];
    }
}

window.FunnelManager = FunnelManager;
