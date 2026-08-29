import { useEffect, useRef, useState } from 'react';
import { renderGradCAM } from '../../utils/gradCam.js';
import { Eye, EyeOff, Layers, Sliders, Maximize2, SplitSquareVertical } from 'lucide-react';

const PLACEHOLDER_FUNDUS = 'data:image/svg+xml,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#0C1A1A"/>
  <circle cx="256" cy="256" r="230" fill="#0D2929" stroke="#0E3D3D" stroke-width="2"/>
  <circle cx="256" cy="256" r="22" fill="#FF6B35" opacity="0.9"/>
  <circle cx="256" cy="256" r="12" fill="#FF8C5A" opacity="0.8"/>
  <line x1="256" y1="256" x2="340" y2="200" stroke="#D4403A" stroke-width="1.5" opacity="0.6"/>
  <line x1="256" y1="256" x2="180" y2="200" stroke="#D4403A" stroke-width="1.2" opacity="0.5"/>
  <line x1="256" y1="256" x2="256" y2="160" stroke="#D4403A" stroke-width="1" opacity="0.4"/>
  <line x1="256" y1="256" x2="340" y2="310" stroke="#D4403A" stroke-width="1.5" opacity="0.6"/>
  <line x1="256" y1="256" x2="180" y2="320" stroke="#D4403A" stroke-width="1.2" opacity="0.5"/>
  <text x="256" y="430" font-family="sans-serif" font-size="14" fill="#2A6A6A" text-anchor="middle" opacity="0.6">No image uploaded — demo view</text>
</svg>
`);

/**
 * HeatmapOverlay — Hero Grad-CAM Explainability Suite.
 *
 * Provides:
 * - View Modes: 'overlay' | 'original' | 'heatmap-only' | 'side-by-side'
 * - Interactive Opacity Slider (0% to 100%)
 * - Influence Calibration Colorbar
 * - Ethical AI Decision Support Disclaimers
 */
export default function HeatmapOverlay({ imageDataUrl, gradcamData, showOverlay = true }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [viewMode, setViewMode] = useState('overlay'); // 'overlay' | 'original' | 'heatmap' | 'split'
  const [opacity, setOpacity] = useState(70);
  const [imgLoaded, setImgLoaded] = useState(false);

  const src = imageDataUrl || PLACEHOLDER_FUNDUS;

  // Render heatmap onto canvas when image loads and gradcam data is available
  useEffect(() => {
    if (!imgLoaded || !gradcamData || !canvasRef.current || !imgRef.current) return;

    const { offsetWidth: w, offsetHeight: h } = imgRef.current;
    if (w > 0 && h > 0) {
      renderGradCAM(canvasRef.current, gradcamData, w, h);
    }
  }, [imgLoaded, gradcamData]);

  // Compute effective opacity based on view mode
  const effectiveCanvasOpacity = viewMode === 'original' ? 0 : viewMode === 'heatmap' ? 1 : opacity / 100;
  const effectiveImgOpacity = viewMode === 'heatmap' ? 0.15 : 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {/* ── GRAD-CAM INTERACTIVE TOOLBAR ── */}
      <div className="heatmap-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        {/* Mode Selector */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(5, 24, 31, 0.85)', padding: 4, borderRadius: 'var(--radius-md)', border: '1px solid rgba(34, 211, 238, 0.2)' }}>
          <button
            type="button"
            className={`btn btn-sm ${viewMode === 'overlay' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setViewMode('overlay')}
            style={{
              fontSize: 'var(--text-xs)',
              padding: '5px 12px',
              height: 'auto',
              cursor: 'pointer',
              background: viewMode === 'overlay' ? '#0891B2' : 'transparent',
              color: viewMode === 'overlay' ? '#FFF' : '#91B4AF',
              borderRadius: 6,
              border: 'none',
              fontWeight: 600,
            }}
          >
            <Layers size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            Overlay
          </button>

          <button
            type="button"
            className={`btn btn-sm ${viewMode === 'original' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setViewMode('original')}
            style={{
              fontSize: 'var(--text-xs)',
              padding: '5px 12px',
              height: 'auto',
              cursor: 'pointer',
              background: viewMode === 'original' ? '#0891B2' : 'transparent',
              color: viewMode === 'original' ? '#FFF' : '#91B4AF',
              borderRadius: 6,
              border: 'none',
              fontWeight: 600,
            }}
          >
            <Eye size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            Original
          </button>

          <button
            type="button"
            className={`btn btn-sm ${viewMode === 'heatmap' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setViewMode('heatmap')}
            style={{
              fontSize: 'var(--text-xs)',
              padding: '5px 12px',
              height: 'auto',
              cursor: 'pointer',
              background: viewMode === 'heatmap' ? '#0891B2' : 'transparent',
              color: viewMode === 'heatmap' ? '#FFF' : '#91B4AF',
              borderRadius: 6,
              border: 'none',
              fontWeight: 600,
            }}
          >
            <Sliders size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            Heatmap Only
          </button>

          <button
            type="button"
            className={`btn btn-sm ${viewMode === 'split' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setViewMode('split')}
            style={{
              fontSize: 'var(--text-xs)',
              padding: '5px 12px',
              height: 'auto',
              cursor: 'pointer',
              background: viewMode === 'split' ? '#0891B2' : 'transparent',
              color: viewMode === 'split' ? '#FFF' : '#91B4AF',
              borderRadius: 6,
              border: 'none',
              fontWeight: 600,
            }}
          >
            <SplitSquareVertical size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            Side-by-Side
          </button>
        </div>

        {/* Opacity slider when in overlay mode */}
        {viewMode === 'overlay' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: '#91B4AF', fontWeight: 600 }}>
              Blend: {opacity}%
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              aria-label="Grad-CAM overlay blend opacity"
              style={{ width: 90, accentColor: '#0891B2', cursor: 'pointer' }}
            />
          </div>
        )}
      </div>

      {/* ── VIEWER CANVAS / IMAGE FRAME ── */}
      {viewMode === 'split' ? (
        /* Side-by-side mode */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }} className="animate-fade-in">
          <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1.5px solid rgba(34, 211, 238, 0.25)', background: '#041219', position: 'relative' }}>
            <img src={src} alt="Original fundus scan" style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }} />
            <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,0.75)', color: 'white', fontSize: '10px', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
              ORIGINAL RETINA
            </div>
          </div>
          <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1.5px solid rgba(8, 145, 178, 0.5)', background: '#041219', position: 'relative' }}>
            <img src={src} alt="Grad-CAM overlaid scan" style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }} />
            {gradcamData && (
              <canvas
                ref={canvasRef}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  opacity: 0.8,
                }}
              />
            )}
            <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(8, 145, 178, 0.85)', color: 'white', fontSize: '10px', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
              GRAD-CAM ATTRIBUTION
            </div>
          </div>
        </div>
      ) : (
        /* Standard Single Frame with crossfade */
        <div
          className="heatmap-container animate-fade-in"
          style={{
            width: '100%',
            maxWidth: 540,
            margin: '0 auto',
            position: 'relative',
            borderRadius: 'var(--radius-2xl)',
            overflow: 'hidden',
            border: '2px solid rgba(34, 211, 238, 0.25)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
            background: '#041219',
          }}
        >
          <img
            ref={imgRef}
            src={src}
            alt="Retinal fundus scan for AI analysis"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              objectFit: 'contain',
              opacity: effectiveImgOpacity,
              transition: 'opacity 0.4s ease-in-out',
            }}
            onLoad={() => setImgLoaded(true)}
          />

          {gradcamData && (
            <canvas
              ref={canvasRef}
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                opacity: effectiveCanvasOpacity,
                transition: 'opacity 0.35s ease-in-out',
                mixBlendMode: viewMode === 'overlay' ? 'screen' : 'normal',
              }}
            />
          )}

          <div
            style={{
              position: 'absolute',
              top: 10,
              left: 10,
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(4px)',
              color: '#38BDF8',
              border: '1px solid rgba(34, 211, 238, 0.3)',
              fontSize: '10px',
              fontWeight: 700,
              fontFamily: 'monospace',
              letterSpacing: '0.04em',
            }}
          >
            MODE: {viewMode.toUpperCase()}
          </div>
        </div>
      )}

      {/* ── GRAD-CAM COLOR LEGEND ── */}
      <div
        style={{
          background: 'rgba(5, 24, 31, 0.8)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-3) var(--space-4)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)', fontSize: 'var(--text-xs)', fontWeight: 700, color: '#F0FDFA' }}>
          <span>AI Feature Contribution Weight</span>
          <span style={{ color: '#38BDF8', fontWeight: 600 }}>ResNet-GradCAM</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span style={{ fontSize: '10px', color: '#91B4AF', fontWeight: 600 }}>LOW</span>
          <div
            style={{
              flex: 1,
              height: 10,
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(to right, #0000ff 0%, #00ffff 25%, #00ff00 50%, #ffff00 75%, #ff0000 100%)',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4)',
            }}
            aria-hidden="true"
          />
          <span style={{ fontSize: '10px', color: '#F87171', fontWeight: 700 }}>HIGH</span>
        </div>

        <p
          style={{
            fontSize: '11px',
            color: '#91B4AF',
            lineHeight: 1.5,
            margin: 'var(--space-2) 0 0 0',
          }}
        >
          * Highlighted regions represent image areas that influenced the model prediction. Decision support only — not an individual lesion detector.
        </p>
      </div>
    </div>
  );
}
