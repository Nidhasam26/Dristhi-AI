import { useState } from 'react';
import { getDRInfo } from '../../utils/drClassification.js';
import { DRBadge } from '../ui/Badge.jsx';
import { TrendingUp, TrendingDown, Minus, ArrowRight, Calendar, AlertCircle } from 'lucide-react';

export default function ProgressionLens({ scans = [] }) {
  if (!scans || scans.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: '#91B4AF', fontSize: 'var(--text-sm)' }}>
        No scans available for progression analysis.
      </div>
    );
  }

  // Sort scans chronological
  const sortedScans = [...scans].sort((a, b) => new Date(a.scan_date) - new Date(b.scan_date));

  if (sortedScans.length < 2) {
    const singleScan = sortedScans[0];
    return (
      <div
        className="animate-fade-in"
        style={{
          padding: 'var(--space-6)',
          background: 'rgba(6, 26, 25, 0.92)',
          borderRadius: 'var(--radius-xl)',
          textAlign: 'center',
          border: '1px solid rgba(97, 230, 214, 0.18)',
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'rgba(8, 145, 178, 0.2)',
            color: '#38BDF8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-3)',
          }}
        >
          <Minus size={22} />
        </div>
        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: '#F0FDFA', margin: 0, fontFamily: 'var(--font-heading)' }}>
          Baseline Screening Registered
        </h3>
        <p style={{ fontSize: 'var(--text-xs)', color: '#91B4AF', maxWidth: 400, margin: 'var(--space-2) auto' }}>
          This patient has 1 recorded scan on {singleScan.scan_date}. Subsequent screenings will automatically activate the AI Progression Lens to track retinopathy evolution over time.
        </p>
        <div style={{ marginTop: 'var(--space-3)' }}>
          <DRBadge grade={singleScan.ai_result.grade} size="lg" />
        </div>
      </div>
    );
  }

  const prevScan = sortedScans[sortedScans.length - 2];
  const currScan = sortedScans[sortedScans.length - 1];

  const prevGrade = prevScan.ai_result.grade;
  const currGrade = currScan.ai_result.grade;

  const diff = currGrade - prevGrade;
  const isProgressed = diff > 0;
  const isImproved = diff < 0;
  const isStable = diff === 0;

  const prevInfo = getDRInfo(prevGrade);
  const currInfo = getDRInfo(currGrade);

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* ── Progression Status Banner ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-4) var(--space-5)',
          borderRadius: 'var(--radius-xl)',
          background: isProgressed
            ? 'rgba(239, 68, 68, 0.15)'
            : isImproved
            ? 'rgba(34, 197, 94, 0.15)'
            : 'rgba(8, 145, 178, 0.15)',
          border: `1.5px solid ${
            isProgressed
              ? 'rgba(239, 68, 68, 0.35)'
              : isImproved
              ? 'rgba(34, 197, 94, 0.35)'
              : 'rgba(8, 145, 178, 0.35)'
          }`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-lg)',
              background: isProgressed ? '#EF4444' : isImproved ? '#22C55E' : '#0891B2',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isProgressed ? <TrendingUp size={20} /> : isImproved ? <TrendingDown size={20} /> : <Minus size={20} />}
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-base)', fontWeight: 800, color: '#F0FDFA', fontFamily: 'var(--font-heading)' }}>
              {isProgressed ? 'Retinopathy Progression Detected (+)' : isImproved ? 'Retinal State Improved (-)' : 'Stable Disease Trajectory (=)'}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: '#91B4AF' }}>
              Comparing {prevScan.scan_date} ➔ {currScan.scan_date}
            </div>
          </div>
        </div>

        <span
          style={{
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(5, 24, 31, 0.8)',
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            color: isProgressed ? '#F87171' : isImproved ? '#4ADE80' : '#38BDF8',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {isProgressed ? `Grade ${prevGrade} ➔ ${currGrade} (Increased)` : isImproved ? `Grade ${prevGrade} ➔ ${currGrade} (Regressed)` : `Grade ${currGrade} (Unchanged)`}
        </span>
      </div>

      {/* ── Side-by-Side Comparison Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        {/* Prior Scan */}
        <div
          style={{
            background: 'rgba(6, 26, 25, 0.92)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-4)',
            border: '1px solid rgba(97, 230, 214, 0.14)',
          }}
        >
          <div style={{ fontSize: 'var(--text-xs)', color: '#91B4AF', fontWeight: 700, textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>
            Previous Screening
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
            <Calendar size={13} color="#38BDF8" />
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: '#F0FDFA' }}>{prevScan.scan_date}</span>
          </div>
          <DRBadge grade={prevGrade} size="md" />
          <div style={{ fontSize: 'var(--text-xs)', color: '#91B4AF', marginTop: 'var(--space-2)' }}>
            Confidence: <strong style={{ color: '#F0FDFA' }}>{Math.round(prevScan.ai_result.confidence * 100)}%</strong>
          </div>
        </div>

        {/* Current Scan */}
        <div
          style={{
            background: 'rgba(6, 26, 25, 0.92)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-4)',
            border: `1.5px solid ${currInfo.color}`,
          }}
        >
          <div style={{ fontSize: 'var(--text-xs)', color: currInfo.color, fontWeight: 700, textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>
            Current Screening
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
            <Calendar size={13} color="#38BDF8" />
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: '#F0FDFA' }}>{currScan.scan_date}</span>
          </div>
          <DRBadge grade={currGrade} size="md" />
          <div style={{ fontSize: 'var(--text-xs)', color: '#91B4AF', marginTop: 'var(--space-2)' }}>
            Confidence: <strong style={{ color: '#F0FDFA' }}>{Math.round(currScan.ai_result.confidence * 100)}%</strong>
          </div>
        </div>
      </div>

      <div style={{ fontSize: '11px', color: '#91B4AF', fontStyle: 'italic', textAlign: 'center' }}>
        * AI-assisted progression indicator — decision support only.
      </div>
    </div>
  );
}
