/**
 * Generates DRISHTI AI PWA icons programmatically using Node canvas.
 * Creates icon-192.png and icon-512.png in public/icons/
 * Run once: node scripts/generate-icons.cjs
 */
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const r = size / 2;
  const padding = size * 0.1;

  // Background circle
  ctx.beginPath();
  ctx.arc(r, r, r, 0, Math.PI * 2);
  const bg = ctx.createRadialGradient(r, r * 0.8, 0, r, r, r);
  bg.addColorStop(0, '#0e7490');
  bg.addColorStop(1, '#0c4a6e');
  ctx.fillStyle = bg;
  ctx.fill();

  // Eye shape
  const eyeW = size * 0.65;
  const eyeH = size * 0.28;
  const cx = r;
  const cy = r;

  ctx.beginPath();
  ctx.ellipse(cx, cy, eyeW / 2, eyeH / 2, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.9)';
  ctx.lineWidth = size * 0.025;
  ctx.stroke();

  // Iris
  ctx.beginPath();
  ctx.arc(cx, cy, eyeH * 0.42, 0, Math.PI * 2);
  const iris = ctx.createRadialGradient(cx - eyeH*0.1, cy - eyeH*0.1, 0, cx, cy, eyeH * 0.42);
  iris.addColorStop(0, '#38bdf8');
  iris.addColorStop(1, '#0891b2');
  ctx.fillStyle = iris;
  ctx.fill();

  // Pupil
  ctx.beginPath();
  ctx.arc(cx, cy, eyeH * 0.18, 0, Math.PI * 2);
  ctx.fillStyle = '#0c1a22';
  ctx.fill();

  // AI scan lines
  for (let i = 0; i < 3; i++) {
    const y = cy - eyeH * 0.12 + i * eyeH * 0.12;
    ctx.beginPath();
    ctx.moveTo(cx - eyeH * 0.3, y);
    ctx.lineTo(cx + eyeH * 0.3, y);
    ctx.strokeStyle = `rgba(34, 211, 238, ${0.4 - i * 0.1})`;
    ctx.lineWidth = size * 0.012;
    ctx.stroke();
  }

  return canvas.toBuffer('image/png');
}

try {
  fs.writeFileSync(path.join(outDir, 'icon-192.png'), drawIcon(192));
  fs.writeFileSync(path.join(outDir, 'icon-512.png'), drawIcon(512));
  console.log('Icons generated successfully in public/icons/');
} catch (e) {
  console.error('Could not generate icons with canvas (canvas package not installed):', e.message);
  console.log('Creating placeholder SVG-based PNG icons...');

  // Fallback: copy favicon.svg reference note — icons are generated via vite-plugin-pwa
  fs.writeFileSync(path.join(outDir, 'README.txt'),
    'Run: npm install canvas && node scripts/generate-icons.cjs\nOr place 192x192 and 512x512 PNG icons here manually.');
}
