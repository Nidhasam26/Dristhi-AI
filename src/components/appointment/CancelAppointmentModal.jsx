import { useState } from 'react';
import { XCircle, X, AlertTriangle } from 'lucide-react';

/**
 * CancelAppointmentModal
 * Proper cancellation confirmation dialog styled with DRISHTI dark-glass design tokens.
 * Replaces the bare window.confirm() call for appointment cancellations.
 *
 * Props:
 *   appointment  — the appointment object to cancel
 *   onConfirm(reason)  — async fn to call when user confirms; receives cancellation reason
 *   onClose()    — called when user dismisses without cancelling
 */
export default function CancelAppointmentModal({ appointment, onConfirm, onClose }) {
  const [reason, setReason] = useState('');
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await onConfirm(reason.trim());
    } finally {
      setConfirming(false);
    }
  };

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(3, 13, 13, 0.88)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        className="dr-patient-card animate-slide-up"
        style={{
          maxWidth: 480,
          width: '100%',
          padding: 28,
          border: '1.5px solid rgba(239, 68, 68, 0.3)',
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 20,
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 13,
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f87171',
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={22} />
            </div>
            <div>
              <h2
                id="cancel-modal-title"
                style={{
                  fontSize: 17,
                  fontWeight: 800,
                  margin: 0,
                  color: '#f0fdfa',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                Cancel Appointment
              </h2>
              {appointment && (
                <div style={{ fontSize: 12.5, color: '#72a8a1', marginTop: 3 }}>
                  {appointment.doctorName}
                  {appointment.date
                    ? ` · ${new Date(appointment.date + 'T00:00:00').toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}`
                    : ''}
                  {appointment.time ? ` at ${appointment.time}` : ''}
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#72a8a1',
              padding: 4,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#f0fdfa')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#72a8a1')}
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Warning message ── */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: 11,
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            marginBottom: 20,
          }}
        >
          <p style={{ fontSize: 13.5, color: '#fca5a5', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
            Are you sure you want to cancel this appointment? This action cannot be undone.
            The reserved time slot will be released for other patients.
          </p>
        </div>

        {/* ── Reason input ── */}
        <div style={{ marginBottom: 22 }}>
          <label
            htmlFor="cancel-reason"
            className="patient-label"
            style={{ display: 'block', marginBottom: 7 }}
          >
            REASON FOR CANCELLATION <span style={{ color: '#648c86', fontWeight: 500 }}>(OPTIONAL)</span>
          </label>
          <textarea
            id="cancel-reason"
            className="dr-patient-search"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Schedule conflict, feeling better, rescheduling to a later date…"
            style={{
              padding: '12px 14px',
              minHeight: 80,
              resize: 'vertical',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* ── Action buttons ── */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            className="dr-secondary-btn"
            onClick={onClose}
            style={{ flex: 1, justifyContent: 'center', minHeight: 44 }}
          >
            Keep Appointment
          </button>

          <button
            type="button"
            disabled={confirming}
            onClick={handleConfirm}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 12,
              background: confirming ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.18)',
              border: '1.5px solid rgba(239, 68, 68, 0.45)',
              color: '#fca5a5',
              fontWeight: 800,
              fontSize: 13.5,
              cursor: confirming ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontFamily: 'var(--font-heading)',
              minHeight: 44,
              transition: 'all 0.2s',
              opacity: confirming ? 0.7 : 1,
            }}
          >
            <XCircle size={16} />
            {confirming ? 'Cancelling…' : 'Confirm Cancellation'}
          </button>
        </div>
      </div>
    </div>
  );
}
