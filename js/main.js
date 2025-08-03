// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {

    // Enhanced card hover effects with 3D tilt
    document.querySelectorAll('.nui.card-glass').forEach(card => {
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
    document.querySelectorAll('.nui.badge').forEach(badge => {
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
    document.querySelectorAll('.nui.card-glass').forEach(card => {
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

});
