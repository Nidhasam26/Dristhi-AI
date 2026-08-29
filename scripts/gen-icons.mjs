/**
 * DRISHTI AI — Icon generator (no external deps)
 * Generates 192x192 and 512x512 PNG icons using browser-compatible SVG
 * embedded in an HTML canvas via Node.js built-ins only.
 * 
 * Usage: node scripts/gen-icons.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'public', 'icons');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// SVG template for DRISHTI AI icon
function makeSvg(size) {
  const r = size / 2;
  const eyeRx = size * 0.30;
  const eyeRy = size * 0.13;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <radialGradient id="bg" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#0e7490"/>
      <stop offset="100%" stop-color="#0c4a6e"/>
    </radialGradient>
    <radialGradient id="iris" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0891b2"/>
    </radialGradient>
  </defs>
  <!-- Background -->
  <circle cx="${r}" cy="${r}" r="${r}" fill="url(#bg)"/>
  <!-- Eye outline -->
  <ellipse cx="${r}" cy="${r}" rx="${eyeRx}" ry="${eyeRy}"
    fill="rgba(255,255,255,0.08)" stroke="#22d3ee" stroke-width="${size*0.022}"/>
  <!-- Iris -->
  <circle cx="${r}" cy="${r}" r="${eyeRy*0.78}" fill="url(#iris)"/>
  <!-- Pupil -->
  <circle cx="${r}" cy="${r}" r="${eyeRy*0.32}" fill="#061a22"/>
  <!-- Scan lines -->
  <line x1="${r - eyeRy*0.55}" y1="${r - eyeRy*0.18}" x2="${r + eyeRy*0.55}" y2="${r - eyeRy*0.18}" stroke="rgba(34,211,238,0.6)" stroke-width="${size*0.014}" stroke-linecap="round"/>
  <line x1="${r - eyeRy*0.55}" y1="${r}" x2="${r + eyeRy*0.55}" y2="${r}" stroke="rgba(34,211,238,0.45)" stroke-width="${size*0.012}" stroke-linecap="round"/>
  <line x1="${r - eyeRy*0.55}" y1="${r + eyeRy*0.18}" x2="${r + eyeRy*0.55}" y2="${r + eyeRy*0.18}" stroke="rgba(34,211,238,0.3)" stroke-width="${size*0.010}" stroke-linecap="round"/>
</svg>`;
}

fs.writeFileSync(path.join(outDir, 'icon-192.svg'), makeSvg(192));
fs.writeFileSync(path.join(outDir, 'icon-512.svg'), makeSvg(512));
console.log('SVG icons written to public/icons/');
console.log('Note: vite-plugin-pwa will use these SVGs. For native PNG, convert with Inkscape or similar.');
