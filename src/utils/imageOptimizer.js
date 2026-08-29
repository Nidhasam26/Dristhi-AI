/**
 * Retinal Image Optimization Utility
 *
 * Implements clinically conservative client-side image compression:
 * - Validates file types and sizes
 * - Resizes high-resolution fundus images to a standardized, clinically safe dimension (max 1024px)
 * - Compresses to high-quality JPEG (0.88 quality floor) to preserve microvascular details, hemorrhages, and exudates
 * - Generates low-bandwidth thumbnail (128px) for instant local UI rendering
 */

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_MB = 15;
const MAX_DIMENSION = 1024;
const THUMB_DIMENSION = 128;
const JPEG_QUALITY = 0.88; // Safe quality factor preserving subtle retinal pathology

export function validateImage(file) {
  if (!file) return { valid: false, error: 'No file selected.' };
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Please upload a JPEG, PNG, or WebP fundus image.' };
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return { valid: false, error: `Image must be smaller than ${MAX_FILE_SIZE_MB} MB.` };
  }
  return { valid: true };
}

/**
 * Loads an image from a File or DataURL into an HTMLImageElement.
 */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Failed to decode fundus image.'));
    img.src = src;
  });
}

/**
 * Compresses and scales an image using HTML5 Canvas.
 */
function renderToCanvas(img, maxDim, quality) {
  const canvas = document.createElement('canvas');
  let width = img.width;
  let height = img.height;

  if (width > maxDim || height > maxDim) {
    if (width > height) {
      height = Math.round((height * maxDim) / width);
      width = maxDim;
    } else {
      width = Math.round((width * maxDim) / height);
      height = maxDim;
    }
  }

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  // High quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  return {
    dataUrl: canvas.toDataURL('image/jpeg', quality),
    width,
    height,
  };
}

/**
 * Complete retinal optimization pipeline.
 * @param {File|string} input - File object or dataURL string
 * @returns {Promise<{ optimizedUrl: string, thumbnailUrl: string, originalSizeKB: number, optimizedSizeKB: number, reductionPct: number }>}
 */
export async function optimizeRetinalImage(input) {
  let sourceUrl = input;
  let originalSizeKB = 0;

  if (input instanceof File) {
    originalSizeKB = Math.round(input.size / 1024);
    sourceUrl = await new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = (e) => res(e.target.result);
      reader.onerror = rej;
      reader.readAsDataURL(input);
    });
  } else if (typeof input === 'string' && input.startsWith('data:')) {
    originalSizeKB = Math.round((input.length * (3 / 4)) / 1024);
  }

  const img = await loadImage(sourceUrl);

  // 1. Optimized full-resolution scan for clinical analysis
  const optimized = renderToCanvas(img, MAX_DIMENSION, JPEG_QUALITY);
  const optimizedSizeKB = Math.round((optimized.dataUrl.length * (3 / 4)) / 1024);

  // 2. Ultra-light thumbnail for instant list view and offline caching
  const thumb = renderToCanvas(img, THUMB_DIMENSION, 0.75);

  const reductionPct = originalSizeKB > 0
    ? Math.max(0, Math.round(((originalSizeKB - optimizedSizeKB) / originalSizeKB) * 100))
    : 0;

  return {
    optimizedUrl: optimized.dataUrl,
    thumbnailUrl: thumb.dataUrl,
    originalSizeKB,
    optimizedSizeKB,
    reductionPct,
    width: optimized.width,
    height: optimized.height,
  };
}
