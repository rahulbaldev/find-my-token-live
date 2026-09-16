const fs = require('fs');

const svg = `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="ticketGrad" x1="10" y1="20" x2="90" y2="80" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#00A3FF" />
      <stop offset="100%" stop-color="#A855F7" />
    </linearGradient>

    <linearGradient id="foldGrad" x1="30" y1="70" x2="65" y2="30" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#3B82F6" stop-opacity="0.8"/>
      <stop offset="50%" stop-color="#E0E7FF" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#FFFFFF" />
    </linearGradient>

    <linearGradient id="foldShadow" x1="35" y1="70" x2="70" y2="40" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </linearGradient>
  </defs>

  <g transform="rotate(-22 50 50)">
    <!-- Base Ticket -->
    <path d="
      M 20 30 
      H 80 
      A 8 8 0 0 1 88 38 
      V 44 
      A 6 6 0 0 0 88 56 
      V 62 
      A 8 8 0 0 1 80 70 
      H 20 
      A 8 8 0 0 1 12 62 
      V 56 
      A 6 6 0 0 0 12 44 
      V 38 
      A 8 8 0 0 1 20 30 
      Z" fill="url(#ticketGrad)" />

    <!-- Shadow -->
    <path d="
      M 30 70 
      C 60 70, 80 50, 65 30 
      C 55 50, 45 65, 30 70 
      Z" fill="url(#foldShadow)" />

    <!-- Fold Flap -->
    <path d="
      M 30 70 
      C 55 70, 75 50, 60 30 
      C 50 50, 40 65, 30 70 
      Z" fill="url(#foldGrad)" />
  </g>
</svg>`;

fs.writeFileSync('test.svg', svg);
console.log('Done');
