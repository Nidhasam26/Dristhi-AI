/**
 * Generates minimal valid PNG files for DRISHTI AI PWA icons.
 * Uses pure Node.js Buffer manipulation — no canvas package needed.
 * Creates properly structured PNG with DRISHTI AI branding colors.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const outDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function uint32BE(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n, 0);
  return b;
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  const table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    table[i] = c;
  }
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const payload = Buffer.concat([typeBytes, data]);
  const crc = crc32(payload);
  return Buffer.concat([uint32BE(data.length), typeBytes, data, uint32BE(crc)]);
}

function makePng(size) {
  // Generate pixel data: a teal circle on dark background
  const r = size / 2;
  const raw = [];
  
  for (let y = 0; y < size; y++) {
    raw.push(0); // filter byte
    for (let x = 0; x < size; x++) {
      const dx = x - r, dy = y - r;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      if (dist <= r) {
        // Inside circle — teal gradient background
        const factor = 1 - (dist / r) * 0.4;
        const br = Math.round(8 * factor);
        const bg_r = Math.round(14 * factor + 6);
        const bg_g = Math.round(116 * factor + 30);
        const bg_b = Math.round(144 * factor + 40);
        
        // Eye ellipse region (center band)
        const eyeRx = r * 0.58, eyeRy = r * 0.22;
        const eyeDist = Math.sqrt((dx/eyeRx)**2 + (dy/eyeRy)**2);
        
        if (eyeDist <= 1.0) {
          // Inside eye ellipse
          const irisDist = Math.sqrt(dx*dx + dy*dy) / (eyeRy * 0.85);
          if (irisDist <= 1.0) {
            const pupilDist = Math.sqrt(dx*dx + dy*dy) / (eyeRy * 0.34);
            if (pupilDist <= 1.0) {
              // Pupil — dark
              raw.push(6, 26, 34, 255);
            } else {
              // Iris — bright teal
              const f = 1 - irisDist * 0.4;
              raw.push(Math.round(56*f + 20), Math.round(189*f + 30), Math.round(248*f + 10), 255);
            }
          } else {
            // Eye border — semi-transparent teal
            raw.push(bg_r, bg_g + 30, bg_b + 40, 255);
          }
        } else {
          // Background gradient
          raw.push(bg_r, bg_g, bg_b, 255);
        }
      } else {
        // Outside circle — transparent
        raw.push(0, 0, 0, 0);
      }
    }
  }
  
  const rawBuf = Buffer.from(raw);
  const deflated = zlib.deflateSync(rawBuf);
  
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);   // width
  ihdr.writeUInt32BE(size, 4);   // height
  ihdr.writeUInt8(8, 8);         // bit depth
  ihdr.writeUInt8(6, 9);         // color type: RGBA
  ihdr.writeUInt8(0, 10);        // compression
  ihdr.writeUInt8(0, 11);        // filter
  ihdr.writeUInt8(0, 12);        // interlace
  
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflated),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

fs.writeFileSync(path.join(outDir, 'icon-192.png'), makePng(192));
fs.writeFileSync(path.join(outDir, 'icon-512.png'), makePng(512));
console.log('PNG icons generated successfully.');
