import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppointments } from '../context/AppointmentContext.jsx';
import { usePatients } from '../context/PatientContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import CancelAppointmentModal from '../components/appointment/CancelAppointmentModal.jsx';
import { DRBadge } from '../components/ui/Badge.jsx';
import {
  ArrowLeft, Calendar, Clock, Stethoscope, User, MapPin,
  Video, Building2, ScanLine, CheckCircle2, XCircle, AlertTriangle,
  FileText, Save, Check, ArrowRight, ShieldOff, IndianRupee
} from 'lucide-react';
import { getDRInfo } from '../utils/drClassification.js';

export default function AppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getAppointmentById, updateAppointment, cancelAppointment, getDoctorById } = useAppointments();
  const { getPatientById, getScanById } = usePatients();

  const appointment = getAppointmentById(id);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [notes, setNotes] = useState(appointment?.notes || '');
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [status, setStatus] = useState(appointment?.status || 'confirmed');

  // ── Access denied: appointment not in the user's filtered state ──
  if (!appointment) {
    return (
      <PageWrapper>
        <div className="dr-appointment-detail-screen">
          <div
            className="dr-patient-card"
            style={{ padding: '60px 24px', textAlign: 'center', color: '#91b4af', maxWidth: 640, margin: '40px auto' }}
          >
            <ShieldOff size={48} color="#22d3ee" style={{ opacity: 0.5, margin: '0 auto 16px' }} />
            <h2 style={{ color: '#f0fdfa' }}>Appointment Not Found</h2>
            <p style={{ margin: '8px 0 20px' }}>
              This appointment record does not exist, has been removed, or you are not authorized to
              view it. Each appointment is private to the account that booked it.
            </p>
            <Link className="dr-primary-btn" to="/appointments">
              Back to My Appointments
            </Link>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const patient = getPatientById(appointment.patientId);
  const scan = appointment?.scanId ? getScanById(appointment.scanId) : null;
  const doctor = appointment?.doctorId ? getDoctorById(appointment.doctorId) : null;

  const isAdmin = user?.role === 'admin';
  const isUpcoming = status === 'scheduled' || status === 'confirmed';

  const formattedDate = new Date(appointment.date + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const scanInfo = scan ? getDRInfo(scan.ai_result.grade) : null;

  const handleSaveNotes = async () => {
    setSaving(true);
    await updateAppointment(appointment.id, { notes, status });
    setSaving(false);
    setToastMessage('Appointment dossier updated successfully');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleCancelConfirm = async (reason) => {
    await cancelAppointment(appointment.id, reason);
    setStatus('cancelled');
    setShowCancelModal(false);
    setToastMessage('Appointment has been cancelled.');
    setTimeout(() => setToastMessage(''), 3500);
  };

  return (
    <PageWrapper>
      <div className="dr-appointment-detail-screen">
        {/* ── Toast ── */}
        {toastMessage && (
          <div
            className="animate-slide-up"
            style={{
              position: 'fixed', top: 24, right: 24, zIndex: 9998,
              padding: '12px 20px', borderRadius: 12,
              background: '#0eaa99', color: 'white', fontWeight: 700, fontSize: 13,
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <CheckCircle2 size={16} /> {toastMessage}
          </div>
        )}

        {/* ── Cancel Modal ── */}
        {showCancelModal && (
          <CancelAppointmentModal
            appointment={appointment}
            onConfirm={handleCancelConfirm}
            onClose={() => setShowCancelModal(false)}
          />
        )}

        {/* ── Page Header ── */}
        <div className="dr-page-head">
          <div>
            <div className="dr-eyebrow">
              <span className="dr-live-dot" /> APPOINTMENT DOSSIER ·{' '}
              <code style={{ color: '#22d3ee' }}>#{appointment.id}</code>
            </div>
            <h1>Clinical Consultation <span>Dossier</span></h1>
            <p>
              Review clinical follow-up details, specialist notes, and associated DRISHTI AI retinal analysis.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" className="dr-secondary-btn" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} /> Back
            </button>
            {scan && (
              <Link className="dr-primary-btn" to={`/scan/${scan.id}`}>
                <ScanLine size={16} /> View Retinal Analysis <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>

        {/* ── Status Banner ── */}
        <div
          className="dr-patient-card"
          style={{
            padding: 20, marginBottom: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44, height: 44, borderRadius: 12,
                background:
                  status === 'confirmed'  ? 'rgba(34, 197, 94, 0.15)' :
                  status === 'completed'  ? 'rgba(34, 211, 238, 0.15)' :
                  status === 'cancelled'  ? 'rgba(239, 68, 68, 0.15)' :
                                           'rgba(245, 158, 11, 0.15)',
                border:
                  status === 'confirmed'  ? '1px solid rgba(34, 197, 94, 0.3)' :
                  status === 'completed'  ? '1px solid rgba(34, 211, 238, 0.3)' :
                  status === 'cancelled'  ? '1px solid rgba(239, 68, 68, 0.3)' :
                                           '1px solid rgba(245, 158, 11, 0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color:
                  status === 'confirmed'  ? '#4ade80' :
                  status === 'completed'  ? '#22d3ee' :
                  status === 'cancelled'  ? '#f87171' :
                                           '#fbbf24',
              }}
            >
              {status === 'confirmed'  && <CheckCircle2 size={22} />}
              {status === 'completed'  && <Check size={22} />}
              {status === 'cancelled'  && <XCircle size={22} />}
              {status === 'scheduled'  && <Clock size={22} />}
            </div>

            <div>
              <span className="patient-label">CONSULTATION STATUS</span>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#f0fdfa', textTransform: 'uppercase', marginTop: 2 }}>
                {status}
              </div>
              <div style={{ fontSize: 12, color: '#91b4af', marginTop: 2 }}>
                Booked on {new Date(appointment.createdAt).toLocaleDateString('en-IN')}
              </div>
            </div>
          </div>

          {/* Admin: quick status update */}
          {isAdmin && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <label htmlFor="status-select" className="patient-label">UPDATE STATUS:</label>
              <select
                id="status-select"
                className="dr-patient-search"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ padding: '8px 14px', width: 'auto', appearance: 'auto', fontSize: 13, fontWeight: 700 }}
              >
                <option value="scheduled" style={{ background: '#071f1d' }}>Scheduled</option>
                <option value="confirmed" style={{ background: '#071f1d' }}>Confirmed</option>
                <option value="completed" style={{ background: '#071f1d' }}>Completed</option>
                <option value="cancelled" style={{ background: '#071f1d' }}>Cancelled</option>
              </select>
            </div>
          )}
        </div>

        {/* ── Main Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24, alignItems: 'start' }}>

          {/* ════ LEFT COLUMN ════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

            {/* Doctor Profile */}
            <div className="dr-patient-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Stethoscope size={18} color="#22d3ee" />
                <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: '#f0fdfa' }}>Specialist Ophthalmologist</h2>
              </div>

              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: doctor?.avatarColor || '#0891b2',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 800, fontSize: 18, flexShrink: 0,
                  }}
                >
                  {appointment.doctorName.replace('Dr. ', '').split(' ').map((n) => n[0]).join('')}
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: '#f0fdfa' }}>
                    {appointment.doctorName}
                  </h3>
                  <div style={{ fontSize: 13.5, color: '#22d3ee', fontWeight: 600, marginTop: 2 }}>
                    {appointment.doctorRole}
                  </div>
                  <div style={{ fontSize: 12.5, color: '#72a8a1', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Building2 size={13} /> {appointment.doctorHospital}
                  </div>
                  {doctor?.location && (
                    <div style={{ fontSize: 12.5, color: '#72a8a1', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={13} /> {doctor.location}
                    </div>
                  )}
                  {appointment.doctorFee != null && (
                    <div
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        marginTop: 10, padding: '4px 10px', borderRadius: 8,
                        background: 'rgba(14, 170, 153, 0.12)',
                        border: '1px solid rgba(14, 170, 153, 0.25)',
                        fontSize: 12, color: '#0eaa99', fontWeight: 800,
                      }}
                    >
                      <IndianRupee size={11} /> ₹{Number(appointment.doctorFee).toLocaleString('en-IN')} Consultation Fee
                    </div>
                  )}
                  {doctor?.about && (
                    <p style={{ fontSize: 12.5, color: '#91b4af', marginTop: 10, lineHeight: 1.5, margin: '8px 0 0' }}>
                      {doctor.about}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div className="dr-patient-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Calendar size={18} color="#22d3ee" />
                <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: '#f0fdfa' }}>Consultation Schedule</h2>
              </div>

              <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, margin: 0 }}>
                <div>
                  <dt className="patient-label">APPOINTMENT DATE</dt>
                  <dd className="patient-val" style={{ margin: '4px 0 0', fontSize: 14 }}>{formattedDate}</dd>
                </div>
                <div>
                  <dt className="patient-label">APPOINTMENT TIME</dt>
                  <dd className="patient-val" style={{ margin: '4px 0 0', fontSize: 14 }}>{appointment.time}</dd>
                </div>
                <div>
                  <dt className="patient-label">CONSULTATION MODE</dt>
                  <dd className="patient-val" style={{ margin: '4px 0 0', fontSize: 14, display: 'flex', alignItems: 'center', gap: 5 }}>
                    {appointment.type === 'tele-consultation'
                      ? <><Video size={14} color="#38bdf8" /> Tele-Ophthalmology Video Call</>
                      : <><MapPin size={14} color="#22d3ee" /> In-Person Hospital Visit</>}
                  </dd>
                </div>
                <div>
                  <dt className="patient-label">LOCATION / CLINIC</dt>
                  <dd className="patient-val" style={{ margin: '4px 0 0', fontSize: 14 }}>{appointment.doctorHospital}</dd>
                </div>
              </dl>
            </div>

            {/* Patient Dossier */}
            <div className="dr-patient-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <User size={18} color="#22d3ee" />
                  <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: '#f0fdfa' }}>Patient Dossier</h2>
                </div>
                {patient && isAdmin && (
                  <Link to={`/patients/${patient.id}`} style={{ textDecoration: 'none' }}>
                    <span style={{ fontSize: 12, color: '#22d3ee', fontWeight: 700 }}>Open Record →</span>
                  </Link>
                )}
              </div>

              <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, margin: 0 }}>
                <div>
                  <dt className="patient-label">PATIENT NAME</dt>
                  <dd className="patient-val" style={{ margin: '4px 0 0', fontSize: 14 }}>{appointment.patientName}</dd>
                </div>
                <div>
                  <dt className="patient-label">PATIENT ID</dt>
                  <dd className="patient-val" style={{ margin: '4px 0 0', fontSize: 14 }}>
                    <code style={{ color: '#67e8f9' }}>{appointment.patientId}</code>
                  </dd>
                </div>
                <div>
                  <dt className="patient-label">LOCATION</dt>
                  <dd className="patient-val" style={{ margin: '4px 0 0', fontSize: 14 }}>
                    {appointment.patientVillage || patient?.village || '—'},{' '}
                    {appointment.patientDistrict || patient?.district || '—'}
                  </dd>
                </div>
                <div>
                  <dt className="patient-label">CONTACT PHONE</dt>
                  <dd className="patient-val" style={{ margin: '4px 0 0', fontSize: 14 }}>
                    {appointment.patientPhone || patient?.phone || 'Not recorded'}
                  </dd>
                </div>
                {patient?.hba1c && (
                  <div>
                    <dt className="patient-label">LAST HBA1C</dt>
                    <dd className="patient-val" style={{ margin: '4px 0 0', fontSize: 14, color: patient.hba1c >= 8 ? '#f87171' : '#34d399' }}>
                      {patient.hba1c}%
                    </dd>
                  </div>
                )}
                {patient?.diabetes_since && (
                  <div>
                    <dt className="patient-label">DIABETES DURATION</dt>
                    <dd className="patient-val" style={{ margin: '4px 0 0', fontSize: 14 }}>
                      Since {patient.diabetes_since}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* ════ RIGHT COLUMN ════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

            {/* Associated Retinal Scan */}
            <div className="dr-patient-card" style={{ border: '1.5px solid rgba(34, 211, 238, 0.35)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ScanLine size={18} color="#22d3ee" />
                  <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: '#f0fdfa' }}>DRISHTI AI Retinal Scan</h2>
                </div>
                {scan && <DRBadge grade={scan.ai_result.grade} size="md" />}
              </div>

              {scan ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#f0fdfa' }}>
                        Screening ID: <code style={{ color: '#67e8f9' }}>{scan.id}</code>
                      </div>
                      <div style={{ fontSize: 12, color: '#91b4af', marginTop: 2 }}>
                        Screened on {new Date(scan.scan_date).toLocaleDateString('en-IN')} ·{' '}
                        {scan.eye === 'right' ? 'Right Eye (OD)' : 'Left Eye (OS)'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="patient-label">CONFIDENCE</span>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#22d3ee' }}>
                        {Math.round(scan.ai_result.confidence * 100)}%
                      </div>
                    </div>
                  </div>

                  {scanInfo && (
                    <div
                      style={{
                        padding: 14, borderRadius: 12,
                        background: `${scanInfo.color}15`,
                        border: `1px solid ${scanInfo.color}40`,
                        marginBottom: 16,
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 800, color: scanInfo.color, textTransform: 'uppercase' }}>
                        AI Screening Finding: {scanInfo.fullLabel}
                      </div>
                      <p style={{ fontSize: 13, color: '#f0fdfa', margin: '4px 0 0', fontWeight: 600 }}>
                        {scanInfo.referral}
                      </p>
                    </div>
                  )}

                  {scan.doctor_notes && (
                    <div
                      style={{
                        padding: 12, borderRadius: 10,
                        background: 'rgba(6, 24, 33, 0.6)',
                        borderLeft: '3px solid #22d3ee',
                        fontSize: 13, color: '#d1f2ec', marginBottom: 16,
                      }}
                    >
                      <strong style={{ color: '#22d3ee' }}>Prior Doctor Review Notes:</strong>{' '}
                      {scan.doctor_notes}
                    </div>
                  )}

                  <Link to={`/scan/${scan.id}`} style={{ textDecoration: 'none' }}>
                    <button
                      type="button"
                      className="dr-primary-btn"
                      style={{ width: '100%', justifyContent: 'center', fontSize: 13.5 }}
                    >
                      <ScanLine size={16} /> View Retinal Analysis &amp; Grad-CAM →
                    </button>
                  </Link>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 10px', color: '#91b4af' }}>
                  <p style={{ margin: 0, fontSize: 13.5 }}>
                    No retinal scan was linked at the time of booking.
                  </p>
                </div>
              )}
            </div>

            {/* Clinical Notes */}
            <div className="dr-patient-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <FileText size={18} color="#22d3ee" />
                <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: '#f0fdfa' }}>Clinical Purpose & Notes</h2>
              </div>

              <div style={{ marginBottom: 16 }}>
                <span className="patient-label" style={{ display: 'block', marginBottom: 4 }}>
                  REASON FOR CLINICAL REVIEW
                </span>
                <div
                  style={{
                    fontSize: 14, color: '#f0fdfa', fontWeight: 600,
                    background: 'rgba(6, 24, 33, 0.5)',
                    padding: '10px 14px', borderRadius: 10,
                    border: '1px solid rgba(115, 231, 214, 0.1)',
                  }}
                >
                  {appointment.reason || 'General clinical follow-up'}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label htmlFor="doctor-dossier-notes" className="patient-label" style={{ display: 'block', marginBottom: 6 }}>
                  CONSULTATION NOTES {isAdmin ? '(EDITABLE)' : ''}
                </label>
                <textarea
                  id="doctor-dossier-notes"
                  className="dr-patient-search"
                  rows={4}
                  readOnly={!isAdmin}
                  value={notes}
                  onChange={(e) => isAdmin && setNotes(e.target.value)}
                  placeholder={isAdmin ? "Record examination findings, treatment details…" : "No consultation notes recorded yet."}
                  style={{
                    padding: '12px 14px', minHeight: 90, resize: 'vertical',
                    opacity: !isAdmin ? 0.75 : 1,
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                {isUpcoming && (
                  <button
                    type="button"
                    onClick={() => setShowCancelModal(true)}
                    style={{
                      padding: '8px 16px', borderRadius: 10,
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: '#fca5a5', fontWeight: 700, fontSize: 12.5,
                      cursor: 'pointer',
                      fontFamily: 'var(--font-heading)',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    <XCircle size={14} /> Cancel Appointment
                  </button>
                )}

                {isAdmin && (
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    disabled={saving}
                    className="dr-primary-btn"
                    style={{ padding: '9px 18px', fontSize: 13, marginLeft: 'auto' }}
                  >
                    <Save size={15} /> {saving ? 'Saving…' : 'Save Dossier Updates'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
