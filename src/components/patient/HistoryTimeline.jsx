import { Link } from 'react-router-dom';
import { DRBadge } from '../ui/Badge.jsx';
import { getDRInfo } from '../../utils/drClassification.js';

/**
 * HistoryTimeline
 * Shows a chronological list of scans for a patient.
 * Items slide in on mount — allowed motion context #3 (progression comparison).
 * The `animation-delay` staggers each item to make the progression readable.
 */
export default function HistoryTimeline({ scans }) {
  if (!scans || scans.length === 0) {
    return (
      <div className="empty-state">
        <p>No scans recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="timeline" aria-label="Patient scan history">
      {scans.map((scan, i) => {
        const info = getDRInfo(scan.ai_result.grade);
        const date = new Date(scan.scan_date).toLocaleDateString('en-IN', {
          day: 'numeric', month: 'short', year: 'numeric',
        });

        return (
          <div
            key={scan.id}
            className="timeline-item"
            // Stagger entrance for comparison readability (allowed motion context #3)
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className={`timeline-dot ${info.dotClass}`} aria-hidden="true" />
            <Link
              to={`/scan/${scan.id}`}
              style={{ textDecoration: 'none', display: 'block' }}
              aria-label={`Scan on ${date}: ${info.fullLabel}, ${Math.round(scan.ai_result.confidence * 100)}% confidence`}
            >
              <div className="card" style={{ padding: 'var(--space-4)', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
                      {date}
                    </span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                      {scan.eye === 'right' ? 'Right eye (OD)' : 'Left eye (OS)'}
                      {scan.reviewed_by && ' · Reviewed'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <DRBadge grade={scan.ai_result.grade} />
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-subtle)' }}>
                      Confidence: {Math.round(scan.ai_result.confidence * 100)}%
                    </span>
                  </div>
                </div>
                {scan.doctor_notes && (
                  <div style={{
                    marginTop: 'var(--space-3)', padding: 'var(--space-2) var(--space-3)',
                    borderRadius: 'var(--radius-md)', background: 'var(--color-surface-alt)',
                    fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)',
                    borderLeft: '3px solid var(--color-primary)',
                  }}>
                    {scan.doctor_notes}
                  </div>
                )}
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
