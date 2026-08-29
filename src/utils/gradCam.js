/**
 * Grad-CAM Heatmap Renderer
 *
 * Renders a gradient-weighted class activation map (Grad-CAM) overlay on a
 * canvas element. The heatmap shows which IMAGE REGIONS most strongly
 * influenced the AI's overall DR grade prediction.
 *
 * SCOPE NOTE: This is region-level attribution only.
 * The heatmap does NOT identify, locate, or name individual lesions.
 * Hot regions indicate areas the model attended to — not confirmed pathology.
 * Lesion-level detection is explicitly out of scope for this MVP.
 */

// Colormap: blue (cold) → yellow → red (hot)
function activationToRGBA(value, alpha = 0.55) {
  // value: 0–1
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const v = clamp(value, 0, 1);

  let r, g, b;
  if (v < 0.25) {
    const t = v / 0.25;
    r = 0; g = Math.round(t * 128); b = 255;
  } else if (v < 0.5) {
    const t = (v - 0.25) / 0.25;
    r = 0; g = Math.round(128 + t * 127); b = Math.round(255 * (1 - t));
  } else if (v < 0.75) {
    const t = (v - 0.5) / 0.25;
    r = Math.round(t * 255); g = 255; b = 0;
  } else {
    const t = (v - 0.75) / 0.25;
    r = 255; g = Math.round(255 * (1 - t)); b = 0;
  }

  return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * Renders Grad-CAM heatmap onto a canvas element
 * @param {HTMLCanvasElement} canvas
 * @param {number[][]} activationMatrix - 2D array of 0–1 values
 * @param {number} imageWidth - rendered image width in px
 * @param {number} imageHeight - rendered image height in px
 * @param {number} alpha - overlay opacity (0–1)
 */
export function renderGradCAM(canvas, activationMatrix, imageWidth, imageHeight, alpha = 0.55) {
  if (!canvas || !activationMatrix || activationMatrix.length === 0) return;

  canvas.width = imageWidth;
  canvas.height = imageHeight;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, imageWidth, imageHeight);

  const rows = activationMatrix.length;
  const cols = activationMatrix[0].length;
  const cellW = imageWidth / cols;
  const cellH = imageHeight / rows;

  // Draw each cell of the activation matrix, scaled to image size
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const value = activationMatrix[r][c];
      ctx.fillStyle = activationToRGBA(value, alpha);
      ctx.fillRect(
        Math.round(c * cellW),
        Math.round(r * cellH),
        Math.ceil(cellW),
        Math.ceil(cellH)
      );
    }
  }

  // Apply Gaussian-like blur for smooth look
  ctx.filter = 'blur(12px)';
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = imageWidth;
  tempCanvas.height = imageHeight;
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.filter = 'blur(14px)';
  tempCtx.drawImage(canvas, 0, 0);

  ctx.clearRect(0, 0, imageWidth, imageHeight);
  ctx.filter = 'none';
  ctx.drawImage(tempCanvas, 0, 0);
}

/**
 * Generates a mock Grad-CAM activation matrix for a given DR grade
 * Creates realistic-looking hotspot patterns for each severity level
 */
export function generateMockActivation(grade, size = 14) {
  const matrix = Array.from({ length: size }, () => Array(size).fill(0));
  const center = Math.floor(size / 2);

  // Seed with grade-specific lesion patterns
  const patterns = {
    0: [], // No activation
    1: [{ x: center - 2, y: center + 1, intensity: 0.7, radius: 1.5 }], // single spot
    2: [
      { x: center - 2, y: center + 1, intensity: 0.85, radius: 2 },
      { x: center + 3, y: center - 2, intensity: 0.7, radius: 1.5 },
    ],
    3: [
      { x: center - 2, y: center + 1, intensity: 0.95, radius: 2.5 },
      { x: center + 3, y: center - 2, intensity: 0.85, radius: 2 },
      { x: center - 1, y: center - 3, intensity: 0.75, radius: 1.5 },
      { x: center + 1, y: center + 3, intensity: 0.8, radius: 1.5 },
    ],
    4: [
      { x: center, y: center, intensity: 1.0, radius: 3.5 },
      { x: center - 3, y: center + 2, intensity: 0.9, radius: 2.5 },
      { x: center + 3, y: center - 3, intensity: 0.85, radius: 2 },
      { x: center - 1, y: center - 4, intensity: 0.8, radius: 2 },
      { x: center + 2, y: center + 4, intensity: 0.75, radius: 1.5 },
    ],
  };

  const spots = patterns[grade] ?? [];

  for (const spot of spots) {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const dist = Math.sqrt((c - spot.x) ** 2 + (r - spot.y) ** 2);
        const contribution = spot.intensity * Math.exp(-(dist ** 2) / (2 * spot.radius ** 2));
        matrix[r][c] = Math.min(1, matrix[r][c] + contribution);
      }
    }
  }

  // Add slight noise for realism
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      matrix[r][c] = Math.min(1, matrix[r][c] + (Math.random() * 0.05));
    }
  }

  return matrix;
}
