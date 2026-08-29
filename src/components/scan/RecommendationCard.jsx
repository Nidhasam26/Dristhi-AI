import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle, AlertCircle, AlertOctagon, XOctagon, MapPin, ShieldAlert, RotateCcw, Stethoscope, Calendar } from 'lucide-react';
import { getDRInfo, getUrgencyColor } from '../../utils/drClassification.js';
import { UrgencyBadge } from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';

const ICONS = {
  'check-circle': CheckCircle,
  'alert-circle': AlertCircle,
  'alert-triangle': AlertTriangle,
  'alert-octagon': AlertOctagon,
  'x-octagon': XOctagon,
};

/**
 * RecommendationCard
 * Displays AI classification result with referral recommendation.
 * Explicitly separates AI Confidence (%) from Clinical Risk Level.
 * Handles AI Abstain & Ask state for uncertain model predictions.
 */
export default function RecommendationCard({ grade, confidence, scanId, patientId, onRetake }) {
  const navigate = useNavigate();
  const info = getDRInfo(grade);
  const Icon = ICONS[info.icon] ?? AlertCircle;
  const urgencyColor = getUrgencyColor(info.urgency);
  const confidencePercent = Math.round(confidence * 100);

  const isAbstain = confidence < 0.60;

  // Clinical Risk Level computation
  const riskLevel = grade === 0 ? 'Minimal Risk' : grade === 1 ? 'Low Risk (Monitor)' : grade === 2 ? 'Moderate Clinical Risk' : grade === 3 ? 'High Sight-Threatening Risk' : 'Critical / Emergency Risk';
  const riskColor = grade === 0 ? '#22C55E' : grade === 1 ? '#84CC16' : grade === 2 ? '#F59E0B' : '#EF4444';

  const handleBookAppointment = () => {
    const query = new URLSearchParams();
    if (scanId) query.set('scanId', scanId);
    if (patientId) query.set('patientId', patientId);
    navigate(`/appointments/book?${query.toString()}`);
  };

  // ── AI ABSTAIN & ASK STATE ──
  if (isAbstain) {
    return (
      <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div
          style={{
            padding: 'var(--space-6)',
            borderRadius: 'var(--radius-2xl)',
            background: 'rgba(30, 20, 5, 0.95)',
            border: '2px solid #F59E0B',
            boxShadow: '0 8px 30px rgba(245, 158, 11, 0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 'var(--radius-xl)',
                background: 'rgba(217, 119, 6, 0.25)',
                color: '#FBBF24',
                border: '1.5px solid rgba(245, 158, 11, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)',
              }}
            >
              <ShieldAlert size={28} />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', fontWeight: 800, color: '#FDE047', margin: 0 }}>
                  AI ABSTAINED & REFERRED
                </h3>
                <span style={{ padding: '2px 10px', borderRadius: 'var(--radius-full)', background: 'rgba(180, 83, 9, 0.4)', color: '#FDE047', border: '1px solid rgba(245, 158, 11, 0.4)', fontSize: 'var(--text-xs)', fontWeight: 700 }}>
                  STATUS: UNCERTAIN
                </span>
              </div>

              <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-sm)', color: '#FCD34D', lineHeight: 1.6, fontWeight: 500 }}>
                Confidence is insufficient (<strong>{confidencePercent}%</strong>) for a reliable automated screening result. DRISHTI AI intentionally pauses automated triage rather than risking a false negative.
              </p>

              {/* Triage Split */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                <div style={{ background: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#FBBF24', textTransform: 'uppercase' }}>Model Confidence</div>
                  <div style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: '#FEF08A' }}>{confidencePercent}% (Low)</div>
                </div>
                <div style={{ background: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#FBBF24', textTransform: 'uppercase' }}>Recommended Action</div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: '#FEF08A' }}>Human Specialist Review</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-5)', flexWrap: 'wrap' }}>
                {onRetake && (
                  <Button variant="outline" size="sm" icon={RotateCcw} onClick={onRetake}>
                    Retake Fundus Image
                  </Button>
                )}
                <Button variant="primary" size="sm" icon={Stethoscope} onClick={handleBookAppointment}>
                  Send for Priority Specialist Review
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── NORMAL CONFIDENT RESULT ──
  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* ── Separate AI Confidence & Clinical Risk Boxes ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
        {/* Box 1: AI Statistical Confidence */}
        <div
          style={{
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-xl)',
            background: 'rgba(6, 26, 25, 0.92)',
            border: '1px solid rgba(34, 211, 238, 0.2)',
          }}
        >
          <div style={{ fontSize: 'var(--text-xs)', color: '#38BDF8', fontWeight: 700, textTransform: 'uppercase', fontFamily: 'var(--font-heading)' }}>
            AI Confidence
          </div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: '#38BDF8', fontFamily: 'var(--font-heading)', marginTop: 2 }}>
            {confidencePercent}%
          </div>
          <span style={{ fontSize: '11px', color: '#91B4AF', fontWeight: 600 }}>
            Model prediction certainty
          </span>
          <div style={{ marginTop: 'var(--space-2)', height: 6, borderRadius: 'var(--radius-full)', background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${confidencePercent}%`, background: '#0891B2' }} />
          </div>
        </div>

        {/* Box 2: Clinical Risk Level */}
        <div
          style={{
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-xl)',
            background: `${riskColor}15`,
            border: `1px solid ${riskColor}35`,
          }}
        >
          <div style={{ fontSize: 'var(--text-xs)', color: riskColor, fontWeight: 700, textTransform: 'uppercase', fontFamily: 'var(--font-heading)' }}>
            Clinical Risk Level
          </div>
          <div style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: riskColor, fontFamily: 'var(--font-heading)', marginTop: 4 }}>
            {riskLevel}
          </div>
          <span style={{ fontSize: '11px', color: '#91B4AF', fontWeight: 600 }}>
            Requires clinical triage
          </span>
          <div style={{ marginTop: 'var(--space-2)', height: 6, borderRadius: 'var(--radius-full)', background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(grade / 4) * 100 || 15}%`, background: riskColor }} />
          </div>
        </div>
      </div>

      {/* Referral Directive */}
      <div
        style={{
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-xl)',
          background: 'rgba(6, 26, 25, 0.92)',
          border: '1px solid rgba(97, 230, 214, 0.18)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <MapPin size={16} color={urgencyColor} />
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: urgencyColor, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-heading)' }}>
              Clinical Referral Directive ({info.urgencyLabel})
            </span>
          </div>

          {grade >= 1 && (
            <button
              type="button"
              onClick={handleBookAppointment}
              style={{
                background: 'none',
                border: 'none',
                color: '#38BDF8',
                fontWeight: 700,
                fontSize: 'var(--text-xs)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontFamily: 'var(--font-heading)',
              }}
            >
              <Calendar size={13} /> Book Specialist →
            </button>
          )}
        </div>
        <p style={{ fontSize: 'var(--text-sm)', color: '#F0FDFA', lineHeight: 1.6, margin: 0, fontWeight: 600 }}>
          {info.referral}
        </p>
      </div>

      {/* AI Finding Explanation */}
      <div
        style={{
          padding: 'var(--space-3) var(--space-4)',
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(5, 24, 31, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: 'var(--text-xs)',
          color: '#91B4AF',
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: '#F0FDFA' }}>Finding Detail:</strong> {info.recommendation}
      </div>
    </div>
  );
}
