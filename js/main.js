// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {

    // Enhanced card hover effects with 3D tilt
    document.querySelectorAll('.card-glass').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 30;
            const rotateY = (centerX - x) / 30;

            card.style.transform = `translateY(-8px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) rotateX(0deg) rotateY(0deg)';
        });
    });

    // Badge hover effects
    document.querySelectorAll('.badge').forEach(badge => {
        badge.addEventListener('mouseenter', () => {
            badge.style.background = 'var(--accent-green-light)';
            badge.style.borderColor = 'var(--accent-green)';
            badge.style.boxShadow = '0 4px 16px rgba(159, 220, 0, 0.3)';
        });

        badge.addEventListener('mouseleave', () => {
            badge.style.background = 'rgba(42, 42, 42, 0.8)';
            badge.style.borderColor = 'var(--glass-border)';
            badge.style.boxShadow = 'none';
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add loading animation for cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all cards for animation
    document.querySelectorAll('.card-glass').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    // Add parallax effect to background circles
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallax = scrolled * 0.5;

        document.querySelectorAll('.circle').forEach((circle, index) => {
            const speed = 0.2 + (index * 0.1);
            circle.style.transform = `translateY(${parallax * speed}px)`;
        });
    });

    // Initialize Funnel Animation
    initializeFunnels();

});

// Funnel Animation Class
class FunnelAnimation {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.text = options.text || "NUI ";
        this.maxRadius = options.maxRadius || 200;
        this.minRadius = options.minRadius || 15;
        this.totalHeight = options.totalHeight || 300;
        this.spiralTurns = options.spiralTurns || 3;
        this.rotationSpeed = options.rotationSpeed || 20; // seconds
        this.fontSize = options.fontSize || 16;
        this.opacity = options.opacity || 1;
        this.centerX = options.centerX || window.innerWidth / 2;
        this.centerY = options.centerY || window.innerHeight / 2;

        this.init();
    }

    init() {
        this.createSpiralText();
        this.startRotation();
    }

    createSpiralText() {
        const totalChars = this.text.length * 6; // Repeat text multiple times

        for (let i = 0; i < totalChars; i++) {
            const charIndex = i % this.text.length;
            const character = this.text[charIndex];

            if (character === ' ') continue;

            const char = document.createElement('div');
            char.className = 'text-char';
            char.textContent = character;

            // Calculate spiral position
            const progress = i / totalChars;

            // Y position - moves from top to bottom
            const y = this.centerY - (this.totalHeight / 2) + (progress * this.totalHeight);

            // Radius - decreases as we go down
            const radius = this.maxRadius - (progress * (this.maxRadius - this.minRadius));

            // Angle - increases to create spiral
            const angle = progress * this.spiralTurns * 360;
            const radians = (angle * Math.PI) / 180;

            // X and Z positions around the circle
            const x = this.centerX + Math.cos(radians) * radius;
            const z = Math.sin(radians) * radius;

            // Determine if character is on back side
            const isBack = Math.sin(radians) < 0;

            // Position the character
            char.style.left = x + 'px';
            char.style.top = y + 'px';
            char.style.transform = `translateZ(${z}px) rotateY(${angle}deg)`;

            // Handle back-side appearance
            if (isBack) {
                char.classList.add('back');
                char.style.transform += ' scaleX(-1)';
            }

            // Size variation
            const sizeMultiplier = 0.6 + (radius / this.maxRadius) * 0.8;
            char.style.fontSize = (this.fontSize * sizeMultiplier) + 'px';

            // Opacity fade from top to bottom
            const fadeOpacity = (1 - progress) * this.opacity;
            const depthOpacity = 0.8 + (radius / this.maxRadius) * 0.2;
            const finalOpacity = fadeOpacity * depthOpacity;

            char.style.opacity = isBack ? finalOpacity * 0.4 : finalOpacity;

            this.container.appendChild(char);
        }
    }

    startRotation() {
        this.container.style.animation = `containerRotate ${this.rotationSpeed}s linear infinite`;
    }
}

// Create multiple funnel animations with different properties
function initializeFunnels() {
    // Large background funnel
    new FunnelAnimation('funnel1', {
        text: "CODE ",
        maxRadius: 280,
        minRadius: 18,
        totalHeight: 380,
        spiralTurns: 4,
        rotationSpeed: 30,
        fontSize: 16,
        opacity: 0.15,
        centerX: window.innerWidth * 0.25,
        centerY: window.innerHeight * 0.6
    });

    // Medium funnel
    new FunnelAnimation('funnel2', {
        text: "TECH ",
        maxRadius: 160,
        minRadius: 10,
        totalHeight: 220,
        spiralTurns: 3,
        rotationSpeed: 22,
        fontSize: 12,
        opacity: 0.2,
        centerX: window.innerWidth * 0.75,
        centerY: window.innerHeight * 0.4
    });

    // Small funnel
    new FunnelAnimation('funnel3', {
        text: "NUI ",
        maxRadius: 100,
        minRadius: 6,
        totalHeight: 150,
        spiralTurns: 2.5,
        rotationSpeed: 18,
        fontSize: 10,
        opacity: 0.25,
        centerX: window.innerWidth * 0.5,
        centerY: window.innerHeight * 0.8
    });
}

// Reinitialize on resize
window.addEventListener('resize', () => {
    document.querySelectorAll('.funnel-layer').forEach(layer => {
        layer.innerHTML = '';
    });
    setTimeout(initializeFunnels, 100);
});
