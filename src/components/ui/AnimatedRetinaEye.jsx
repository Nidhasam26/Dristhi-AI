import { useState, useEffect } from 'react';

/**
 * AnimatedRetinaEye — Visual Identity & Intelligent Retinal Scanner for DRISHTI AI.
 *
 * Implements a stylized medical retinal vascular tree, optic disc, fovea,
 * calibrated scanning ring/line, and diagnostic landmark nodes.
 *
 * @param {'ambient'|'scanning'|'ready'|'compact'} mode
 * @param {number} size - pixel dimension (default 260)
 * @param {string} statusText - optional status subtitle below eye
 */
export default function AnimatedRetinaEye({
  mode = 'ambient',
  size = 260,
  statusText = '',
  className = '',
}) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((p) => !p);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const isScanning = mode === 'scanning';
  const isReady = mode === 'ready';
  const isCompact = mode === 'compact';

  return (
    <div
      className={`retina-eye-wrapper ${className}`}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          overflow: 'visible',
          filter: 'drop-shadow(0 8px 24px rgba(8, 145, 178, 0.18))',
        }}
        aria-label="DRISHTI AI Retinal Analysis Visualization"
      >
        <defs>
          {/* Gradients */}
          <radialGradient id="retinaBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0B3040" />
            <stop offset="70%" stopColor="#061F2B" />
            <stop offset="100%" stopColor="#03121A" />
          </radialGradient>

          <radialGradient id="opticDiscGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#0284C7" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0369A1" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="foveaGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#0D9488" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0F766E" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="scanBeam" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity="0" />
            <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0891B2" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="ringTeal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#0891B2" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.9" />
          </linearGradient>

          {/* Clip path for retina fundus */}
          <clipPath id="retinaClip">
            <circle cx="150" cy="150" r="116" />
          </clipPath>
        </defs>

        {/* 1. Outer Eye Contour / Sclera Boundary */}
        <ellipse
          cx="150"
          cy="150"
          rx="138"
          ry="105"
          stroke="url(#ringTeal)"
          strokeWidth="1.5"
          strokeDasharray="4 6"
          opacity="0.45"
        />

        {/* Outer Circular Calibrated Ring */}
        <circle
          cx="150"
          cy="150"
          r="126"
          stroke="#0E7490"
          strokeWidth="1"
          strokeDasharray="2 8"
          opacity="0.6"
        />

        {/* 2. Retinal Fundus Globe */}
        <circle
          cx="150"
          cy="150"
          r="116"
          fill="url(#retinaBg)"
          stroke="#0891B2"
          strokeWidth="2"
        />

        {/* 3. Retinal Fundus Content (Clipped) */}
        <g clipPath="url(#retinaClip)">
          {/* Subtle concentric grid rings for depth */}
          <circle cx="150" cy="150" r="90" stroke="#0891B2" strokeWidth="0.75" strokeDasharray="3 9" opacity="0.25" />
          <circle cx="150" cy="150" r="60" stroke="#22D3EE" strokeWidth="0.75" strokeDasharray="2 6" opacity="0.3" />
          <circle cx="150" cy="150" r="30" stroke="#14B8A6" strokeWidth="0.75" strokeDasharray="2 4" opacity="0.35" />

          {/* Optic Disc (Nasal landmark - slightly offset right/center) */}
          <circle
            cx="186"
            cy="150"
            r="20"
            fill="url(#opticDiscGlow)"
            className={isScanning ? 'pulse-fast' : 'pulse-gentle'}
          />
          <circle cx="186" cy="150" r="10" fill="#BAE6FD" opacity="0.85" />
          <circle cx="186" cy="150" r="4" fill="#FFFFFF" opacity="0.95" />

          {/* Fovea / Macula Region (Temporal side - center left) */}
          <circle
            cx="128"
            cy="154"
            r="16"
            fill="url(#foveaGlow)"
            opacity="0.8"
          />
          <circle cx="128" cy="154" r="3.5" fill="#5EEAD4" opacity="0.9" />

          {/* Retinal Vascular Tree (Arterioles & Venules branching from Optic Disc) */}
          <g
            stroke="#38BDF8"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.75"
            style={{
              transition: 'opacity 0.5s ease',
            }}
          >
            {/* Superior Temporal Arcade */}
            <path
              d="M 186 142 C 180 115, 150 92, 118 90 C 95 88, 70 102, 48 118"
              strokeWidth="2.2"
              fill="none"
            />
            <path
              d="M 148 93 C 138 78, 115 68, 92 65"
              strokeWidth="1.4"
              fill="none"
              opacity="0.7"
            />
            <path
              d="M 118 90 C 108 102, 92 110, 78 114"
              strokeWidth="1.2"
              fill="none"
              opacity="0.65"
            />

            {/* Inferior Temporal Arcade */}
            <path
              d="M 186 158 C 180 185, 152 208, 120 210 C 96 212, 72 198, 50 182"
              strokeWidth="2.2"
              fill="none"
            />
            <path
              d="M 150 206 C 140 222, 118 232, 94 235"
              strokeWidth="1.4"
              fill="none"
              opacity="0.7"
            />
            <path
              d="M 120 210 C 110 198, 94 190, 80 186"
              strokeWidth="1.2"
              fill="none"
              opacity="0.65"
            />

            {/* Superior Nasal Arcade */}
            <path
              d="M 192 142 C 205 120, 225 105, 252 98"
              strokeWidth="1.8"
              fill="none"
            />
            <path
              d="M 220 110 C 235 98, 250 90, 266 86"
              strokeWidth="1.1"
              fill="none"
              opacity="0.6"
            />

            {/* Inferior Nasal Arcade */}
            <path
              d="M 192 158 C 205 180, 226 195, 254 202"
              strokeWidth="1.8"
              fill="none"
            />
            <path
              d="M 222 190 C 238 202, 252 210, 268 214"
              strokeWidth="1.1"
              fill="none"
              opacity="0.6"
            />

            {/* Macular microvasculature twigs */}
            <path d="M 155 146 C 144 148, 138 152, 134 153" strokeWidth="0.9" fill="none" opacity="0.6" />
            <path d="M 156 156 C 146 154, 138 155, 134 155" strokeWidth="0.9" fill="none" opacity="0.6" />
          </g>

          {/* AI Analysis Landmark Points */}
          <g className="diagnostic-nodes" opacity={isScanning || isReady ? 1 : 0.65}>
            {/* Macula landmark */}
            <circle cx="128" cy="154" r="5" stroke="#22D3EE" strokeWidth="1" fill="none" className="node-pulse-1" />
            {/* Optic Disc landmark */}
            <circle cx="186" cy="150" r="7" stroke="#38BDF8" strokeWidth="1" fill="none" className="node-pulse-2" />
            {/* Arcade landmark points */}
            <circle cx="118" cy="90" r="2.5" fill="#38BDF8" opacity="0.8" />
            <circle cx="120" cy="210" r="2.5" fill="#38BDF8" opacity="0.8" />
            <circle cx="78" cy="114" r="2" fill="#2DD4BF" opacity="0.8" />
            <circle cx="80" cy="186" r="2" fill="#2DD4BF" opacity="0.8" />
          </g>

          {/* 4. AI Scanning Sweep Overlay */}
          <g className={isScanning ? 'scanner-active' : 'scanner-ambient'}>
            {/* Vertical sweeping scanline */}
            <line
              x1="150"
              y1="34"
              x2="150"
              y2="266"
              stroke="#22D3EE"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.85"
              style={{
                filter: 'drop-shadow(0 0 6px #06B6D4)',
              }}
            />
            {/* Scanning beam highlight strip */}
            <rect
              x="130"
              y="34"
              width="40"
              height="232"
              fill="url(#scanBeam)"
              opacity="0.5"
            />
          </g>
        </g>

        {/* 5. Calibrated HUD Overlays / Crosshairs (Medical Telemetry) */}
        {!isCompact && (
          <>
            {/* 4 Cardinal Tick Marks */}
            <line x1="150" y1="20" x2="150" y2="30" stroke="#0891B2" strokeWidth="2" strokeLinecap="round" />
            <line x1="150" y1="270" x2="150" y2="280" stroke="#0891B2" strokeWidth="2" strokeLinecap="round" />
            <line x1="20" y1="150" x2="30" y2="150" stroke="#0891B2" strokeWidth="2" strokeLinecap="round" />
            <line x1="270" y1="150" x2="280" y2="150" stroke="#0891B2" strokeWidth="2" strokeLinecap="round" />

            {/* Micro-telemetry labels */}
            <text x="36" y="44" fill="#0E7490" fontSize="8" fontFamily="monospace" fontWeight="600">
              FOV: 45°
            </text>
            <text x="218" y="44" fill="#0E7490" fontSize="8" fontFamily="monospace" fontWeight="600">
              RES: 512px
            </text>
            <text x="36" y="266" fill="#0E7490" fontSize="8" fontFamily="monospace" fontWeight="600">
              MODE: {isScanning ? 'ANALYSIS' : isReady ? 'CLASSIFIED' : 'STANDBY'}
            </text>
            <text x="224" y="266" fill="#0E7490" fontSize="8" fontFamily="monospace" fontWeight="600">
              MODEL: v2.4
            </text>
          </>
        )}

        {/* 6. Success / Verified Status Badge when in 'ready' mode */}
        {isReady && (
          <g className="animate-scale-up" transform="translate(150, 150)">
            <circle cx="0" cy="0" r="26" fill="#065F46" stroke="#10B981" strokeWidth="2" opacity="0.95" />
            <polyline
              points="-9 -1, -3 7, 10 -6"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        )}
      </svg>

      {/* Subtitle / Status indicator under eye */}
      {statusText && (
        <div
          style={{
            marginTop: 'var(--space-3)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: '4px 14px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(8, 145, 178, 0.1)',
            border: '1px solid rgba(8, 145, 178, 0.25)',
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            color: 'var(--color-primary-dark)',
            fontFamily: 'var(--font-heading)',
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: isScanning ? 'var(--color-primary)' : isReady ? 'var(--color-success)' : 'var(--color-secondary-dark)',
            }}
            className={isScanning ? 'pulse-fast' : undefined}
          />
          {statusText}
        </div>
      )}
    </div>
  );
}
