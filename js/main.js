// Main Application Controller
// Orchestrates initialization and cleanup of all major UI modules.
class App {
    /**
     * Constructs the App controller.
     * funnelManager: Manages funnel animations.
     * uiInteractions: Manages UI interactions.
     * isInitialized: Tracks initialization state.
     */
    constructor() {
        this.funnelManager = null;
        this.uiInteractions = null;
        this.isInitialized = false;
    }

    /**
     * Initializes all modules if not already initialized.
     */
    init() {
        if (this.isInitialized) return;

        // Initialize UI interactions first
        this.uiInteractions = new UIInteractions();
        this.uiInteractions.init();

        // Initialize funnel animations (respects reduced motion preference)
        this.funnelManager = new FunnelManager();
        this.funnelManager.init();

        this.isInitialized = true;
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
        this.isInitialized = false;
    }
}

// Initialize application when DOM is ready
/**
 * Initializes the application when the DOM is ready.
 * Ensures required modules are loaded and sets up cleanup on unload.
 */
document.addEventListener('DOMContentLoaded', function () {
    // Check if required classes are available
    if (typeof FunnelManager === 'undefined' || typeof UIInteractions === 'undefined') {
        console.warn('Required modules not loaded. Some features may not work.');
        return;
    }

    const app = new App();
    app.init();

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
        app.destroy();
    });
});
