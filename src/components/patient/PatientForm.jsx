import { useState } from 'react';
import { validatePatientForm } from '../../utils/validators.js';
import Button from '../ui/Button.jsx';

const GENDER_OPTIONS = [
  { value: '', label: 'Select gender' },
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
  { value: 'Other', label: 'Other' },
];

const CURRENT_YEAR = new Date().getFullYear();

export default function PatientForm({ initialData = {}, onSubmit, onCancel, loading = false }) {
  const [data, setData] = useState({
    name: '', age: '', gender: '', phone: '',
    village: '', district: 'Yavatmal', diabetes_since: '', hba1c: '',
    ...initialData,
  });
  const [errors, setErrors] = useState({});

  const [success, setSuccess] = useState(false);

  const set = (field) => (e) => setData((d) => ({ ...d, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validatePatientForm(data);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSuccess(true);
    setTimeout(() => {
      onSubmit(data);
    }, 1200); // Show success state briefly before redirect
  };

  if (success) {
    return (
      <div className="animate-scale-up" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-success-light)', color: 'var(--color-success-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h3 style={{ fontSize: 'var(--text-xl)', color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>Registration Complete</h3>
        <p style={{ color: 'var(--color-text-muted)' }}>Preparing new scan for {data.name}…</p>
      </div>
    );
  }

  const field = (id, label, required = false) => (
    <div className="form-group">
      <label htmlFor={id} className={`form-label${required ? ' required' : ''}`}>{label}</label>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Row 1: Name + Age */}
      <div className="grid-2">
        <div className="form-group">
          <label htmlFor="pat-name" className="form-label required">Full Name</label>
          <input id="pat-name" type="text" className={`form-input${errors.name ? ' error' : ''}`} value={data.name} onChange={set('name')} placeholder="e.g. Ramesh Patil" autoComplete="name" />
          {errors.name && <span className="form-error" role="alert">{errors.name}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="pat-age" className="form-label required">Age (years)</label>
          <input id="pat-age" type="number" min={1} max={120} className={`form-input${errors.age ? ' error' : ''}`} value={data.age} onChange={set('age')} placeholder="e.g. 58" />
          {errors.age && <span className="form-error" role="alert">{errors.age}</span>}
        </div>
      </div>

      {/* Row 2: Gender + Phone */}
      <div className="grid-2">
        <div className="form-group">
          <label htmlFor="pat-gender" className="form-label required">Gender</label>
          <select id="pat-gender" className={`form-input form-select${errors.gender ? ' error' : ''}`} value={data.gender} onChange={set('gender')}>
            {GENDER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {errors.gender && <span className="form-error" role="alert">{errors.gender}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="pat-phone" className="form-label">Phone (optional)</label>
          <input id="pat-phone" type="tel" className={`form-input${errors.phone ? ' error' : ''}`} value={data.phone} onChange={set('phone')} placeholder="10-digit number" autoComplete="tel" />
          {errors.phone && <span className="form-error" role="alert">{errors.phone}</span>}
        </div>
      </div>

      {/* Row 3: Village + District */}
      <div className="grid-2">
        <div className="form-group">
          <label htmlFor="pat-village" className="form-label required">Village</label>
          <input id="pat-village" type="text" className={`form-input${errors.village ? ' error' : ''}`} value={data.village} onChange={set('village')} placeholder="e.g. Wardha" />
          {errors.village && <span className="form-error" role="alert">{errors.village}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="pat-district" className="form-label required">District</label>
          <input id="pat-district" type="text" className="form-input" value={data.district} onChange={set('district')} placeholder="e.g. Yavatmal" />
        </div>
      </div>

      {/* Row 4: Diabetes since + HbA1c */}
      <div className="grid-2">
        <div className="form-group">
          <label htmlFor="pat-diabetes-since" className="form-label">Diabetic Since (year)</label>
          <input id="pat-diabetes-since" type="number" min={1950} max={CURRENT_YEAR} className="form-input" value={data.diabetes_since} onChange={set('diabetes_since')} placeholder={`e.g. 2015`} />
        </div>
        <div className="form-group">
          <label htmlFor="pat-hba1c" className="form-label">Last HbA1c (%)</label>
          <input id="pat-hba1c" type="number" min={3} max={20} step={0.1} className={`form-input${errors.hba1c ? ' error' : ''}`} value={data.hba1c} onChange={set('hba1c')} placeholder="e.g. 8.2" />
          {errors.hba1c && <span className="form-error" role="alert">{errors.hba1c}</span>}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', paddingTop: 'var(--space-2)' }}>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        )}
        <Button type="submit" variant="primary" loading={loading}>
          {initialData?.id ? 'Save Changes' : 'Register Patient'}
        </Button>
      </div>
    </form>
  );
}
