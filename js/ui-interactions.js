// UI Interactions Module
// Handles interactive UI features such as badge hovers, smooth scrolling, card animations, and parallax effects.
class UIInteractions {
    /**
     * Initializes the UIInteractions instance.
     * observers: Stores IntersectionObservers for cleanup.
     * throttleTimeout: Used for throttling scroll events.
     */
    constructor() {
        this.observers = new Map();
        this.throttleTimeout = null;
    }

    /**
     * Initializes all UI interaction features.
     */
    init() {
        this.setupBadgeHovers();
        this.setupSmoothScrolling();
        this.setupCardAnimations();
        this.setupParallaxEffects();
    }

    /**
     * Adds hover event listeners to all elements with the 'badge' class.
     * On hover, changes badge style for visual feedback.
     */
    setupBadgeHovers() {
        const badges = document.querySelectorAll('.badge');

        badges.forEach(badge => {
            badge.addEventListener('mouseenter', this.handleBadgeHover.bind(this, badge, true));
            badge.addEventListener('mouseleave', this.handleBadgeHover.bind(this, badge, false));
        });
    }

    /**
     * Handles badge hover state changes.
     * @param {HTMLElement} badge - The badge element.
     * @param {boolean} isHover - True if mouse entered, false if left.
     */
    handleBadgeHover(badge, isHover) {
        if (isHover) {
            // Highlight badge on hover
            badge.style.cssText = `
                background: var(--accent-green-light) !important;
                border-color: var(--accent-green) !important;
                box-shadow: 0 4px 16px rgba(159, 220, 0, 0.3) !important;
                transform: translateY(-2px);
            `;
        } else {
            // Reset badge style when not hovered
            badge.style.cssText = `
                background: rgba(42, 42, 42, 0.8) !important;
                border-color: var(--glass-border) !important;
                box-shadow: none !important;
                transform: translateY(0);
            `;
        }
    }

    /**
     * Enables smooth scrolling for anchor links that reference IDs on the page.
     */
    setupSmoothScrolling() {
        const anchorLinks = document.querySelectorAll('a[href^="#"]');

        anchorLinks.forEach(anchor => {
            anchor.addEventListener('click', this.handleSmoothScroll.bind(this));
        });
    }

    /**
     * Handles click event for anchor links, scrolling smoothly to the target element.
     * @param {Event} e - The click event.
     */
    handleSmoothScroll(e) {
        e.preventDefault();
        const targetId = e.currentTarget.getAttribute('href');
        const target = document.querySelector(targetId);

        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    /**
     * Sets up fade-in and slide-up animations for card elements as they enter the viewport.
     * Uses IntersectionObserver for performance.
     */
    setupCardAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        // Observer callback animates cards when they become visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        const cards = document.querySelectorAll('.card-glass');
        cards.forEach(card => {
            // Initial state: hidden and shifted down
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
        });

        // Store observer for cleanup
        this.observers.set('cards', observer);
    }

    /**
     * Sets up parallax effects for background circles and funnel layers.
     * Uses throttled scroll event for performance.
     */
    setupParallaxEffects() {
        // Use throttled scroll for better performance
        window.addEventListener('scroll', this.throttledParallax.bind(this), { passive: true });
    }

    /**
     * Throttles the parallax effect to animation frames for smoothness and efficiency.
     */
    throttledParallax() {
        if (this.throttleTimeout) return;

        this.throttleTimeout = requestAnimationFrame(() => {
            this.handleParallax();
            this.throttleTimeout = null;
        });
    }

    /**
     * Applies parallax transformations to circles and funnel layers based on scroll position.
     * Circles move vertically at different speeds; funnel layers move both vertically and horizontally.
     */
    handleParallax() {
        const scrolled = window.pageYOffset;
        const parallax = scrolled * 0.5;

        // Parallax for background circles
        const circles = document.querySelectorAll('.circle');
        circles.forEach((circle, index) => {
            // Each circle moves at a slightly different speed for depth effect
            const speed = 0.2 + (index * 0.1);
            circle.style.transform = `translateY(${parallax * speed}px)`;
        });

        // Parallax for funnel layers
        const funnelLayers = document.querySelectorAll('.funnel-layer');
        funnelLayers.forEach((layer, index) => {
            // Funnel layers move vertically and horizontally for dynamic effect
            const depthSpeed = 0.1 + (index * 0.05);
            const parallaxOffset = scrolled * depthSpeed;
            const horizontalOffset = Math.sin(scrolled * 0.001 + index) * 10;

            layer.style.transform = `translateY(${parallaxOffset}px) translateX(${horizontalOffset}px)`;
        });
    }

    /**
     * Cleans up observers and cancels any pending animation frames.
     * Call this when removing UIInteractions to prevent memory leaks.
     */
    destroy() {
        // Clean up observers
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();

        // Cancel any pending animation frames
        if (this.throttleTimeout) {
            cancelAnimationFrame(this.throttleTimeout);
        }
    }
}

// Export for use in main.js
window.UIInteractions = UIInteractions;
