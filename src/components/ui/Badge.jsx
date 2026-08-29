import { getDRInfo } from '../../utils/drClassification.js';

/** DR grade badge — color is NOT the only indicator; grade label text is always shown */
export function DRBadge({ grade, size = 'sm' }) {
  const info = getDRInfo(grade);
  return (
    <span className={`badge ${info.badgeClass}`} style={{ fontSize: size === 'lg' ? '0.875rem' : undefined }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: info.color, display: 'inline-block', flexShrink: 0 }} aria-hidden="true" />
      Grade {grade} — {info.label}
    </span>
  );
}

/** Generic badge */
export function Badge({ children, variant = 'neutral', className = '' }) {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {children}
    </span>
  );
}

/** Urgency badge */
export function UrgencyBadge({ urgency, label }) {
  const variantMap = {
    routine: 'success',
    monitor: 'neutral',
    refer: 'warning',
    urgent: 'danger',
    emergency: 'danger',
  };
  return <Badge variant={variantMap[urgency] ?? 'neutral'}>{label}</Badge>;
}
