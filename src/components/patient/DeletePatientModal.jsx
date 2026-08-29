import { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import Button from '../ui/Button.jsx';

export default function DeletePatientModal({ isOpen, onClose, patient, onDeleteSuccess }) {
  const [confirmInput, setConfirmInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !patient) return null;

  // Ask for username (lowercased name, no spaces) — much friendlier than the internal ID
  const expectedUsername = (patient.username || patient.name || '').toLowerCase().replace(/\s+/g, '');
  const isConfirmed = confirmInput.trim().toLowerCase() === expectedUsername;

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!isConfirmed) {
      setError(`Please type "${expectedUsername}" exactly to confirm.`);
      return;
    }

    try {
      setIsDeleting(true);
      setError('');
      await onDeleteSuccess(patient.id);
      setIsDeleting(false);
      setConfirmInput('');
      onClose();
    } catch (err) {
      setIsDeleting(false);
      setError(err?.message || 'Failed to delete patient. Please try again.');
    }
  };

  const handleClose = () => {
    setConfirmInput('');
    setError('');
    onClose();
  };

  return (
    <div
      className="modal-backdrop animate-fade-in"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-patient-title"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 'var(--z-modal)',
        padding: 'var(--space-4)',
      }}
    >
      <div
        className="modal-card animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-2xl)',
          width: '100%',
          maxWidth: 480,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--color-danger-light)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: 'var(--space-5) var(--space-6)',
            background: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
            borderBottom: '1px solid #FECACA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-full)',
                background: '#EF4444',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
              }}
            >
              <AlertTriangle size={20} aria-hidden="true" />
            </div>
            <div>
              <h2
                id="delete-patient-title"
                style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: 800,
                  color: '#991B1B',
                  margin: 0,
                  fontFamily: 'var(--font-heading)',
                }}
              >
                Delete Patient?
              </h2>
              <span style={{ fontSize: 'var(--text-xs)', color: '#B91C1C', fontWeight: 500 }}>
                Permanent destructive action
              </span>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="btn btn-ghost btn-icon btn-sm"
            aria-label="Close modal"
            style={{ color: '#991B1B' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleDelete} style={{ padding: 'var(--space-6)' }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: 'var(--space-4)' }}>
            This will permanently remove <strong>{patient.name}</strong>'s medical profile and associated records:
          </p>

          <ul
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              marginBottom: 'var(--space-5)',
              paddingLeft: 'var(--space-5)',
              lineHeight: 1.8,
            }}
          >
            <li>Retinal fundus scans and imaging data</li>
            <li>AI classification results and Grad-CAM activation maps</li>
            <li>Doctor clinical review assessments & notes</li>
            <li>Specialist referral letters and scheduled follow-ups</li>
          </ul>

          <div
            style={{
              background: 'var(--color-surface-alt)',
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border-light)',
              marginBottom: 'var(--space-5)',
            }}
          >
            <label
              htmlFor="confirm-patient-id"
              style={{
                display: 'block',
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                fontFamily: 'var(--font-heading)',
                color: 'var(--color-text)',
                marginBottom: 'var(--space-2)',
              }}
            >
              To confirm, type the patient username:{' '}
              <code style={{ color: '#DC2626', background: '#FEE2E2', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>{expectedUsername}</code>
            </label>
            <input
              id="confirm-patient-id"
              type="text"
              className="form-input"
              value={confirmInput}
              onChange={(e) => { setConfirmInput(e.target.value); setError(''); }}
              placeholder={`Type "${expectedUsername}" to confirm`}
              autoFocus
              style={{
                borderColor: confirmInput ? (isConfirmed ? 'var(--color-success)' : 'var(--color-danger)') : undefined,
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
              }}
            />
          </div>

          {error && (
            <div
              className="alert alert-danger"
              style={{ fontSize: 'var(--text-xs)', marginBottom: 'var(--space-4)', padding: 'var(--space-2) var(--space-3)' }}
            >
              {error}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
            <Button type="button" variant="ghost" onClick={handleClose} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              icon={Trash2}
              disabled={!isConfirmed || isDeleting}
              loading={isDeleting}
            >
              Delete Patient
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
