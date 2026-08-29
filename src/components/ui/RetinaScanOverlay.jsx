import { useEffect, useRef } from 'react';

/* ═══════════════════════════════════════════════════════════════
   RETINAL MOTION SCAN OVERLAY — SMOOTH MEDICAL SCANNING
   ═══════════════════════════════════════════════════════════════
   Features:
     • Slow vertical scanning beam sweeping across the iris & retina
     • Subtle luminous trailing glow illuminating the scanned region
     • Dynamic optical flare tracking the beam across the iris limb
     • Smooth rotating OCT radar sweep arcs
     • Breathing biometric autofocus reticle brackets
     • Pulsing diagnostic data nodes
   ═══════════════════════════════════════════════════════════════ */

export default function RetinaScanOverlay() {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let w, h;
    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      w = rect.width * Math.min(window.devicePixelRatio, 2);
      h = rect.height * Math.min(window.devicePixelRatio, 2);
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
    };
    resize();
    window.addEventListener('resize', resize);

    let t = 0;

    const draw = () => {
      frameRef.current = requestAnimationFrame(draw);
      t += 0.01;

      ctx.clearRect(0, 0, w, h);

      // Center of the 3/4 perspective eye
      const cx = w * 0.615;
      const cy = h * 0.485;
      const irX = Math.min(w, h) * 0.165; // ellipse horizontal radius
      const irY = Math.min(w, h) * 0.195; // ellipse vertical radius
      const scale = h / 1000;

      // ── 1. VERTICAL MOTION SCANNING SWEEP ──
      // Smooth sinusoidal sweep traversing top-to-bottom across the iris (period ~6.5s)
      const scanProgress = Math.sin(t * 0.95);
      const scanOffsetY = scanProgress * (irY * 0.9);
      const beamY = cy + scanOffsetY;

      // The beam spans horizontally across the eyeball
      const beamStartX = cx - irX * 2.7;
      const beamEndX = cx + irX * 2.5;

      // ── 2. SCANNED REGION ILLUMINATION TRAIL ──
      // Subtle glow trail behind the moving beam (directional based on velocity)
      const scanVelocity = Math.cos(t * 0.95);
      const trailHeight = 45 * scale;
      const trailDirection = scanVelocity >= 0 ? -1 : 1; // trail extends opposite of movement

      const trailGrad = ctx.createLinearGradient(0, beamY, 0, beamY + trailDirection * trailHeight);
      trailGrad.addColorStop(0, `rgba(6, 182, 212, ${0.12 + Math.sin(t * 2) * 0.03})`);
      trailGrad.addColorStop(0.3, 'rgba(34, 211, 238, 0.04)');
      trailGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      
      ctx.fillStyle = trailGrad;
      ctx.fillRect(beamStartX, Math.min(beamY, beamY + trailDirection * trailHeight), beamEndX - beamStartX, trailHeight);

      // Subtle localized iris highlight under the moving beam
      const irisBeamGlow = ctx.createRadialGradient(cx, beamY, 0, cx, beamY, irX * 0.9);
      irisBeamGlow.addColorStop(0, 'rgba(34, 211, 238, 0.12)');
      irisBeamGlow.addColorStop(0.5, 'rgba(6, 182, 212, 0.04)');
      irisBeamGlow.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = irisBeamGlow;
      ctx.beginPath();
      ctx.ellipse(cx, beamY, irX * 1.1, 28 * scale, -0.08, 0, Math.PI * 2);
      ctx.fill();

      // ── 3. MAIN SCANNING LASER BEAM ──
      const laserGrad = ctx.createLinearGradient(beamStartX, 0, beamEndX, 0);
      laserGrad.addColorStop(0, 'rgba(6, 182, 212, 0)');
      laserGrad.addColorStop(0.12, 'rgba(6, 182, 212, 0.35)');
      laserGrad.addColorStop(0.5, 'rgba(103, 232, 249, 0.85)');
      laserGrad.addColorStop(0.72, 'rgba(255, 255, 255, 0.95)'); // flare peak
      laserGrad.addColorStop(0.85, 'rgba(6, 182, 212, 0.55)');
      laserGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');

      ctx.beginPath();
      ctx.moveTo(beamStartX, beamY);
      ctx.lineTo(beamEndX, beamY);
      ctx.strokeStyle = laserGrad;
      ctx.lineWidth = 1.8 * scale;
      ctx.stroke();

      // Sharp bright laser core
      ctx.beginPath();
      ctx.moveTo(cx - irX * 1.6, beamY);
      ctx.lineTo(cx + irX * 1.8, beamY);
      ctx.strokeStyle = `rgba(224, 242, 254, ${0.8 + Math.sin(t * 2.5) * 0.15})`;
      ctx.lineWidth = 0.9 * scale;
      ctx.stroke();

      // ── 4. DYNAMIC OPTICAL LENS FLARE (Tracks with beam) ──
      // The flare is positioned near the right curved limb of the iris
      const flareX = cx + irX * (1.02 + Math.abs(scanOffsetY / irY) * 0.12);
      const flarePulse = 1 + Math.sin(t * 3) * 0.18;

      // Radial burst
      const flareGrad = ctx.createRadialGradient(flareX, beamY, 0, flareX, beamY, 40 * scale * flarePulse);
      flareGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      flareGrad.addColorStop(0.15, 'rgba(103, 232, 249, 0.7)');
      flareGrad.addColorStop(0.4, 'rgba(6, 182, 212, 0.2)');
      flareGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = flareGrad;
      ctx.beginPath();
      ctx.arc(flareX, beamY, 40 * scale * flarePulse, 0, Math.PI * 2);
      ctx.fill();

      // Horizontal optical streak
      const streakGrad = ctx.createLinearGradient(flareX - 100 * scale, 0, flareX + 100 * scale, 0);
      streakGrad.addColorStop(0, 'rgba(34, 211, 238, 0)');
      streakGrad.addColorStop(0.5, `rgba(255, 255, 255, ${0.75 * flarePulse})`);
      streakGrad.addColorStop(1, 'rgba(34, 211, 238, 0)');
      ctx.beginPath();
      ctx.moveTo(flareX - 100 * scale, beamY);
      ctx.lineTo(flareX + 100 * scale, beamY);
      ctx.strokeStyle = streakGrad;
      ctx.lineWidth = 2.0 * scale;
      ctx.stroke();

      // ── 5. AUTOFOCUS RETICLE BRACKETS [ | ] (Smooth tracking) ──
      const bLeftX = cx - irX * 1.55;
      const bracketBreath = Math.sin(t * 1.2) * (2 * scale);
      
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.75)';
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.moveTo(bLeftX + (8 + bracketBreath) * scale, beamY - 13 * scale);
      ctx.lineTo(bLeftX, beamY - 13 * scale);
      ctx.lineTo(bLeftX, beamY + 13 * scale);
      ctx.lineTo(bLeftX + (8 + bracketBreath) * scale, beamY + 13 * scale);
      ctx.stroke();

      // Central indicator tick on left bracket
      ctx.beginPath();
      ctx.moveTo(bLeftX - 6 * scale, beamY);
      ctx.lineTo(bLeftX, beamY);
      ctx.stroke();

      // ── 6. CONCENTRIC HUD ARCS WITH MOTION RADAR SWEEP ──
      const hudRings = [
        { rx: irX * 1.18, ry: irY * 1.18, startAngle: -0.65, endAngle: 0.65, alpha: 0.35, width: 1.2 },
        { rx: irX * 1.45, ry: irY * 1.45, startAngle: -0.55, endAngle: 0.55, alpha: 0.22, width: 1.0 },
        { rx: irX * 1.75, ry: irY * 1.75, startAngle: -0.45, endAngle: 0.45, alpha: 0.15, width: 0.8 },
      ];

      hudRings.forEach(({ rx, ry, startAngle, endAngle, alpha, width }) => {
        const pulseAlpha = alpha + Math.sin(t * 0.8) * 0.03;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, -0.08, startAngle, endAngle);
        ctx.strokeStyle = `rgba(34, 211, 238, ${pulseAlpha})`;
        ctx.lineWidth = width * scale;
        ctx.stroke();

        // Terminal dots on arc ends
        [startAngle, endAngle].forEach((ang) => {
          const dx = cx + Math.cos(ang - 0.08) * rx;
          const dy = cy + Math.sin(ang - 0.08) * ry;
          ctx.beginPath();
          ctx.arc(dx, dy, 2.2 * scale, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(103, 232, 249, ${pulseAlpha + 0.25})`;
          ctx.fill();
        });
      });

      // Smooth rotating OCT radar sweep arc
      const radarAngle = (t * 0.35) % (Math.PI * 2);
      ctx.beginPath();
      ctx.ellipse(cx, cy, irX * 1.32, irY * 1.32, -0.08, radarAngle, radarAngle + 0.5);
      ctx.strokeStyle = 'rgba(103, 232, 249, 0.45)';
      ctx.lineWidth = 1.8 * scale;
      ctx.stroke();

      // Outer dashed circle ticks
      const tickCount = 18;
      const tickR_X = irX * 1.62;
      const tickR_Y = irY * 1.62;
      for (let i = 0; i < tickCount; i++) {
        const ang = -0.5 + (i / (tickCount - 1)) * 1.0;
        const x1 = cx + Math.cos(ang - 0.08) * tickR_X;
        const y1 = cy + Math.sin(ang - 0.08) * tickR_Y;
        const x2 = cx + Math.cos(ang - 0.08) * (tickR_X + 6 * scale);
        const y2 = cy + Math.sin(ang - 0.08) * (tickR_Y + 6 * scale);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(34, 211, 238, ${0.18 + (i % 3 === 0 ? 0.22 : 0)})`;
        ctx.lineWidth = (i % 3 === 0 ? 1.2 : 0.7) * scale;
        ctx.stroke();
      }

      // ── 7. DIAGNOSTIC DATA NODES (Subtle Biometric Coordinates) ──
      const dataNodes = [
        { ang: -0.32, dist: 1.22 },
        { ang: 0.18, dist: 1.5 },
        { ang: 0.38, dist: 1.28 },
        { ang: -0.15, dist: 1.85 },
        { ang: 0.48, dist: 1.65 },
        { ang: -0.52, dist: 1.38 },
      ];

      dataNodes.forEach(({ ang, dist }, i) => {
        const nx = cx + Math.cos(ang - 0.08) * irX * dist;
        const ny = cy + Math.sin(ang - 0.08) * irY * dist;
        const pulse = 0.35 + Math.sin(t * 2.0 + i * 1.3) * 0.25;

        // Node core
        ctx.beginPath();
        ctx.arc(nx, ny, 2.0 * scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(103, 232, 249, ${pulse + 0.3})`;
        ctx.fill();

        // Pulsing halo
        ctx.beginPath();
        ctx.arc(nx, ny, 5.5 * scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(6, 182, 212, ${pulse * 0.18})`;
        ctx.fill();
      });

      // ── 8. SUBTLE ROTATING CROSSHAIR AT IRIS APEX ──
      const chSize = 7 * scale;
      const chAngle = Math.sin(t * 0.5) * 0.1;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(chAngle);
      ctx.beginPath();
      ctx.moveTo(-chSize, 0); ctx.lineTo(chSize, 0);
      ctx.moveTo(0, -chSize); ctx.lineTo(0, chSize);
      ctx.strokeStyle = 'rgba(103, 232, 249, 0.3)';
      ctx.lineWidth = 0.8 * scale;
      ctx.stroke();
      ctx.restore();
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 3,
      }}
    />
  );
}
