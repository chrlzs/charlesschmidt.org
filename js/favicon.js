// js/favicon.js
// Neon cyberpunk “radar” favicon with glitch bursts.
// Uses data: URLs and fully owns the favicon <link> to prevent fallback to favicon.ico.

(() => {
    // Remove any existing icon links so the browser can't "choose" a different one later
    document.querySelectorAll('link[rel~="icon"]').forEach((n) => n.remove());

    // Create a single, controlled favicon link
    const faviconLink = document.createElement("link");
    faviconLink.rel = "icon";
    faviconLink.type = "image/svg+xml";
    document.head.appendChild(faviconLink);

    const setFavicon = (svg) => {
        const min = svg.replace(/\s{2,}/g, " ").trim();

        // data URL encode (reliable for favicons; avoids blob fetch weirdness)
        const encoded = encodeURIComponent(min)
            .replace(/%0A/g, "")
            .replace(/%20/g, " ")
            .replace(/%3D/g, "=")
            .replace(/%3A/g, ":")
            .replace(/%2F/g, "/")
            .replace(/%22/g, "'");

        faviconLink.href = `data:image/svg+xml,${encoded}`;
    };

    // Aggressive neon palette
    const NEON = "#00ff66";
    const HOT = "#00ffd0";
    const PINK = "#ff2bd6";

    const baseSvg = (sweepAngleDeg, extra = "") => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2.2" result="blur"/>
      <feColorMatrix in="blur" type="matrix"
        values="1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 4 0" result="boost"/>
      <feMerge>
        <feMergeNode in="boost"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Outer ring -->
  <g filter="url(#glow)">
    <circle cx="32" cy="32" r="26" fill="none" stroke="${NEON}" stroke-width="3"/>
    <circle cx="32" cy="32" r="18" fill="none" stroke="${HOT}" stroke-width="2" opacity="0.6"/>
  </g>

  <!-- Center core -->
  <g filter="url(#glow)">
    <circle cx="32" cy="32" r="3" fill="${NEON}"/>
    <circle cx="32" cy="32" r="1.5" fill="${HOT}" opacity="0.9"/>
  </g>

  <!-- Sweep -->
  <g transform="rotate(${sweepAngleDeg} 32 32)" filter="url(#glow)">
    <path d="M32 32 L32 8 A24 24 0 0 1 38 9 Z"
          fill="${NEON}"
          opacity="0.18"/>
    <line x1="32" y1="32" x2="32" y2="8"
          stroke="${NEON}"
          stroke-width="3"
          stroke-linecap="round"/>
  </g>

  ${extra}
</svg>`;

    const glitchSvg = (sweepAngleDeg) =>
        baseSvg(
            sweepAngleDeg,
            `
        <g opacity="0.9">
          <rect x="0" y="18" width="64" height="6" fill="${PINK}" opacity="0.22"/>
          <rect x="0" y="40" width="64" height="5" fill="${PINK}" opacity="0.18"/>
          <rect x="0" y="28" width="64" height="2" fill="${HOT}" opacity="0.28"/>

          <g filter="url(#glow)" opacity="0.85">
            <circle cx="34" cy="31" r="3.2" fill="${PINK}" opacity="0.35"/>
            <circle cx="30" cy="33" r="3.2" fill="${HOT}" opacity="0.20"/>
          </g>
        </g>`
        );

    let angle = 0;
    setFavicon(baseSvg(angle));

    setInterval(() => {
        angle = (angle + 18) % 360;
        setFavicon(baseSvg(angle));
    }, 120);

    setInterval(() => {
        if (Math.random() > 0.82) {
            const a = angle;
            setFavicon(glitchSvg(a));
            setTimeout(() => setFavicon(baseSvg((a + 10) % 360)), 90);
            setTimeout(() => setFavicon(baseSvg((a + 22) % 360)), 180);
        }
    }, 1400);

    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) {
            setFavicon(glitchSvg(angle));
            setTimeout(() => setFavicon(baseSvg(angle)), 120);
        }
    });
})();
