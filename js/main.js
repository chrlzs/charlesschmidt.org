// Main Application Controller
// Orchestrates initialization, energy/performance optimization, and UI modules.
class App {
    /**
     * Constructs the App controller.
     */
    constructor() {
        this.funnelManager = null;
        this.uiInteractions = null;
        this.marineSnow = null;
        this.isInitialized = false;
        this.fxEnabled = true;
    }

    /**
     * Initializes all modules if not already initialized.
     */
    init() {
        if (this.isInitialized) return;

        // Initialize UI interactions
        this.uiInteractions = new UIInteractions();
        this.uiInteractions.init();

        // Determine if FX should be active by default
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const savedFxPreference = localStorage.getItem('charles_fx_enabled');
        this.fxEnabled = savedFxPreference !== null ? savedFxPreference === 'true' : !prefersReducedMotion;

        // Initialize funnel animations (respects reduced motion preference)
        this.funnelManager = new FunnelManager();
        this.funnelManager.init();

        // Initialize marine snow with screen-aware particle density
        const isMobile = window.innerWidth <= 768;
        this.marineSnow = new MarineSnowSystem({
            particleCount: isMobile ? 8 : 24,
            baseSpeed: isMobile ? 0.5 : 0.8,
            enableParallax: false
        });

        // Setup FX toggle control button
        this.setupFxToggle();

        // Apply initial FX state
        if (!this.fxEnabled) {
            this.disableFx(false);
        }

        this.isInitialized = true;
    }

    /**
     * Sets up the ambient FX toggle button in the UI
     */
    setupFxToggle() {
        const toggleBtn = document.getElementById('toggle-fx');
        if (!toggleBtn) return;

        toggleBtn.addEventListener('click', () => {
            this.toggleFx();
        });

        this.updateFxButtonUI(toggleBtn);
    }

    /**
     * Toggles ambient background animation FX on/off
     */
    toggleFx() {
        this.fxEnabled = !this.fxEnabled;
        localStorage.setItem('charles_fx_enabled', this.fxEnabled ? 'true' : 'false');

        if (this.fxEnabled) {
            this.enableFx();
        } else {
            this.disableFx();
        }

        const toggleBtn = document.getElementById('toggle-fx');
        if (toggleBtn) {
            this.updateFxButtonUI(toggleBtn);
        }
    }

    /**
     * Disables visual background animations to save battery/reduce distraction
     */
    disableFx(savePreference = true) {
        document.body.classList.add('fx-disabled');
        if (this.funnelManager) {
            this.funnelManager.pauseAnimations();
        }
        if (this.marineSnow) {
            this.marineSnow.pauseAnimation();
        }
        if (savePreference) {
            localStorage.setItem('charles_fx_enabled', 'false');
        }
    }

    /**
     * Enables visual background animations
     */
    enableFx() {
        document.body.classList.remove('fx-disabled');
        if (this.funnelManager) {
            this.funnelManager.resumeAnimations();
        }
        if (this.marineSnow) {
            this.marineSnow.resumeAnimation();
        }
        localStorage.setItem('charles_fx_enabled', 'true');
    }

    /**
     * Updates the FX button label and accessibility attributes
     */
    updateFxButtonUI(btn) {
        const text = btn.querySelector('.fx-label');

        if (this.fxEnabled) {
            btn.classList.remove('off');
            btn.setAttribute('aria-pressed', 'true');
            if (text) text.textContent = 'FX ON';
            btn.setAttribute('aria-label', 'Pause background animations');
        } else {
            btn.classList.add('off');
            btn.setAttribute('aria-pressed', 'false');
            if (text) text.textContent = 'FX OFF';
            btn.setAttribute('aria-label', 'Enable background animations');
        }
    }

    /**
     * Cleans up all modules and resets state.
     */
    destroy() {
        if (this.funnelManager) {
            this.funnelManager.destroy();
        }
        if (this.uiInteractions) {
            this.uiInteractions.destroy();
        }
        if (this.marineSnow) {
            this.marineSnow.destroy();
        }
        this.isInitialized = false;
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    if (typeof FunnelManager === 'undefined' || typeof UIInteractions === 'undefined' || typeof MarineSnowSystem === 'undefined') {
        console.warn('Required modules not loaded. Some features may not work.');
        return;
    }

    const app = new App();
    app.init();
    window.app = app;

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
        app.destroy();
    });
});
