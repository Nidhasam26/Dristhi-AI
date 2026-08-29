import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { usePatients } from '../context/PatientContext.jsx';
import { useAppointments } from '../context/AppointmentContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import HistoryTimeline from '../components/patient/HistoryTimeline.jsx';
import ProgressionLens from '../components/scan/ProgressionLens.jsx';
import DeletePatientModal from '../components/patient/DeletePatientModal.jsx';
import Button from '../components/ui/Button.jsx';
import { DRBadge } from '../components/ui/Badge.jsx';
import {
  ArrowLeft, ScanLine, Droplets, Trash2, Clock, ShieldAlert, Activity, User, Calendar, Plus, Stethoscope, CheckCircle2
} from 'lucide-react';
import { getDRInfo } from '../utils/drClassification.js';

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getPatientById, getPatientScans, deletePatient } = usePatients();
  const { getAppointmentsForPatient } = useAppointments();

  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const patient = getPatientById(id);
  const scans = getPatientScans(id);
  const patientAppointments = getAppointmentsForPatient(id);

  if (!patient) {
    return (
      <PageWrapper>
        <div className="dr-patient-detail-screen">
          <div style={{
            padding: '60px 30px',
            textAlign: 'center',
            background: 'rgba(11, 36, 34, 0.5)',
            border: '1px solid rgba(115, 231, 214, 0.15)',
            borderRadius: 20,
            color: '#91b4af',
          }}>
            <h2 style={{ color: '#f0fdfa' }}>Patient not found</h2>
            <p>The patient record does not exist or may have been deleted.</p>
            <Link to="/patients"><Button variant="outline">Back to Patient Directory</Button></Link>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const latestScan = scans[0] ?? null;

  const handleDeletePatient = async (patientId) => {
    await deletePatient(patientId);
    setShowDeleteModal(false);
    navigate('/patients');
  };

  const hba1cColor = !patient.hba1c
    ? '#91b4af'
    : patient.hba1c < 7
    ? '#34d399'
    : patient.hba1c < 9
    ? '#fbbf24'
    : '#f87171';

  return (
    <PageWrapper>
      <div className="dr-patient-detail-screen">
        {/* ── Top Header & Actions ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 28,
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              type="button"
              className="btn btn-ghost btn-icon"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              style={{
                background: 'rgba(11, 36, 34, 0.6)',
                border: '1px solid rgba(115, 231, 214, 0.15)',
                color: '#e8fffc',
              }}
            >
              <ArrowLeft size={18} aria-hidden="true" />
            </button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h1 style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 800, letterSpacing: '-0.02em', margin: 0, color: '#f0fdfa' }}>
                  {patient.name}
                </h1>
                {latestScan && <DRBadge grade={latestScan.ai_result.grade} size="lg" />}
              </div>
              <p style={{ color: '#91b4af', fontSize: 13, marginTop: 4, margin: 0 }}>
                Patient ID: <code style={{ fontWeight: 700, color: '#22d3ee' }}>{patient.id}</code> • Registered {patient.created_at || '2026'} • {patient.village}, {patient.district}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link
              to={`/appointments/book?patientId=${patient.id}${latestScan ? `&scanId=${latestScan.id}` : ''}`}
              style={{ textDecoration: 'none' }}
            >
              <button
                type="button"
                className="dr-primary-btn"
                style={{
                  background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
                  boxShadow: '0 4px 14px rgba(8, 145, 178, 0.4)',
                }}
              >
                <Calendar size={16} /> Book Doctor Appointment
              </button>
            </Link>

            <Link to="/scan/new" state={{ patientId: patient.id }} style={{ textDecoration: 'none' }}>
              <button
                type="button"
                className="dr-secondary-btn"
                style={{
                  background: 'rgba(11, 36, 34, 0.8)',
                  color: '#22d3ee',
                  borderColor: 'rgba(34, 211, 238, 0.3)',
                }}
              >
                <ScanLine size={16} /> New Screening
              </button>
            </Link>

            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              style={{
                padding: '0 16px',
                minHeight: 44,
                borderRadius: 12,
                border: '1px solid rgba(239, 68, 68, 0.3)',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#fca5a5',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s',
              }}
            >
              <Trash2 size={16} /> Delete Patient
            </button>
          </div>
        </div>

        {/* ── Patient Tabs Navigation ── */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            borderBottom: '1px solid rgba(115, 231, 214, 0.12)',
            marginBottom: 26,
            overflowX: 'auto',
          }}
        >
          {[
            { id: 'overview', label: 'Patient Overview', icon: User },
            { id: 'timeline', label: `Screening History (${scans.length})`, icon: Clock },
            { id: 'appointments', label: `Appointments (${patientAppointments.length})`, icon: Calendar },
            { id: 'progression', label: 'AI Progression Lens', icon: Activity },
            { id: 'referrals', label: 'Referrals & Directives', icon: ShieldAlert },
          ].map(({ id: tabId, label, icon: Icon }) => {
            const active = activeTab === tabId;
            return (
              <button
                key={tabId}
                type="button"
                onClick={() => setActiveTab(tabId)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 18px',
                  background: 'none',
                  border: 'none',
                  borderBottom: active ? '3px solid #22d3ee' : '3px solid transparent',
                  color: active ? '#22d3ee' : '#91b4af',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: active ? 700 : 500,
                  fontSize: 13.5,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon size={16} />
                {label}
              </button>
            );
          })}
        </div>


        {/* ── TAB 1: OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 20, alignItems: 'start' }}>
            {/* Patient Details */}
            <div className="dr-patient-card">
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 20px 0', color: '#f0fdfa' }}>Clinical Demographics</h2>
              <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 16, margin: 0 }}>
                {[
                  { label: 'Age', value: `${patient.age} years` },
                  { label: 'Gender', value: patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : patient.gender },
                  { label: 'Phone Number', value: patient.phone || 'Not recorded' },
                  { label: 'Village', value: patient.village },
                  { label: 'District', value: patient.district },
                  { label: 'Diabetic Duration', value: patient.diabetes_since ? `Since ${patient.diabetes_since}` : 'Unspecified' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <dt className="patient-label">{label}</dt>
                    <dd className="patient-val" style={{ margin: '4px 0 0', fontSize: 14 }}>{value}</dd>
                  </div>
                ))}
              </dl>

              {patient.hba1c && (
                <div style={{
                  marginTop: 22,
                  padding: '14px 16px',
                  borderRadius: 14,
                  background: 'rgba(6, 24, 23, 0.6)',
                  border: '1px solid rgba(115, 231, 214, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                }}>
                  <Droplets size={22} color={hba1cColor} />
                  <div>
                    <span className="patient-label" style={{ display: 'block' }}>Recent Glycated Hemoglobin (HbA1c)</span>
                    <span style={{ fontSize: 20, fontWeight: 800, color: hba1cColor, fontFamily: 'var(--font-heading)' }}>
                      {patient.hba1c}%
                    </span>
                    <span style={{ fontSize: 12, color: '#91b4af', marginLeft: 8 }}>
                      {patient.hba1c >= 9 ? '• Poor glycemic control (high risk)' : patient.hba1c >= 7 ? '• Moderate control' : '• Target glycemic range'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Latest Screening Card */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {latestScan ? (
                <div className="dr-patient-card" style={{ border: '1.5px solid rgba(34, 211, 238, 0.35)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#f0fdfa' }}>Latest Screening Summary</h2>
                    <span style={{ fontSize: 12, color: '#91b4af' }}>{latestScan.scan_date}</span>
                  </div>

                  <div style={{ margin: '14px 0' }}>
                    <DRBadge grade={latestScan.ai_result.grade} size="lg" />
                    <p style={{ fontSize: 13, color: '#91b4af', marginTop: 10 }}>
                      Confidence: <strong style={{ color: '#e8fffc' }}>{Math.round(latestScan.ai_result.confidence * 100)}%</strong> • Eye: <strong style={{ color: '#e8fffc' }}>{latestScan.eye === 'right' ? 'Right Eye (OD)' : 'Left Eye (OS)'}</strong>
                    </p>
                  </div>

                  {latestScan.doctor_notes && (
                    <div style={{
                      marginTop: 14,
                      padding: 14,
                      background: 'rgba(6, 24, 23, 0.6)',
                      borderRadius: 10,
                      fontSize: 13,
                      borderLeft: '3px solid #22d3ee',
                      color: '#d1f2ec',
                    }}>
                      <strong style={{ color: '#22d3ee' }}>Doctor Assessment:</strong> {latestScan.doctor_notes}
                    </div>
                  )}

                  <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
                    <Link to={`/scan/${latestScan.id}`} style={{ textDecoration: 'none' }}>
                      <button type="button" className="dr-secondary-btn" style={{ background: 'rgba(11, 36, 34, 0.8)', color: '#22d3ee', borderColor: 'rgba(34, 211, 238, 0.3)' }}>
                        Open Workstation Evaluation →
                      </button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="dr-patient-card" style={{ textAlign: 'center', padding: '36px 20px' }}>
                  <ScanLine size={44} color="#22d3ee" style={{ margin: '0 auto 14px' }} />
                  <h3 style={{ color: '#f0fdfa', fontSize: 18, margin: 0 }}>No Screenings Recorded</h3>
                  <p style={{ fontSize: 13.5, color: '#91b4af', margin: '8px 0 20px' }}>
                    Capture a fundus image to generate the baseline AI screening report.
                  </p>
                  <Link to="/scan/new" state={{ patientId: patient.id }} style={{ textDecoration: 'none' }}>
                    <button type="button" className="dr-primary-btn">
                      <ScanLine size={16} /> Start First Scan
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 2: TIMELINE ── */}
        {activeTab === 'timeline' && (
          <div className="dr-patient-card">
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#f0fdfa' }}>Retinopathy Screening History</h2>
              <p style={{ fontSize: 13, color: '#91b4af', margin: '4px 0 0' }}>{scans.length} screening record{scans.length !== 1 ? 's' : ''} logged in timeline</p>
            </div>
            <HistoryTimeline scans={scans} />
          </div>
        )}

        {/* ── TAB 3: PROGRESSION LENS ── */}
        {activeTab === 'progression' && (
          <div className="dr-patient-card">
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#f0fdfa' }}>AI Retinopathy Progression Lens</h2>
              <p style={{ fontSize: 13, color: '#91b4af', margin: '4px 0 0' }}>Automated longitudinal tracking of fundus microvascular alterations</p>
            </div>
            <ProgressionLens scans={scans} />
          </div>
        )}

        {/* ── TAB: APPOINTMENTS ── */}
        {activeTab === 'appointments' && (
          <div className="dr-patient-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#f0fdfa' }}>Scheduled Doctor Consultations</h2>
                <p style={{ fontSize: 13, color: '#91b4af', margin: '4px 0 0' }}>
                  {patientAppointments.length} appointment record{patientAppointments.length !== 1 ? 's' : ''} for {patient.name}
                </p>
              </div>

              <Link
                to={`/appointments/book?patientId=${patient.id}${latestScan ? `&scanId=${latestScan.id}` : ''}`}
                style={{ textDecoration: 'none' }}
              >
                <button type="button" className="dr-primary-btn" style={{ padding: '10px 18px', fontSize: 13 }}>
                  <Plus size={15} /> Book Specialist
                </button>
              </Link>
            </div>

            {patientAppointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 20px', color: '#91b4af' }}>
                <Calendar size={40} color="#22d3ee" style={{ opacity: 0.5, margin: '0 auto 12px' }} />
                <h3 style={{ color: '#f0fdfa', fontSize: 16, margin: 0 }}>No Appointments Booked</h3>
                <p style={{ fontSize: 13, margin: '6px 0 16px' }}>Schedule a clinical follow-up review for this patient.</p>
                <Link
                  to={`/appointments/book?patientId=${patient.id}${latestScan ? `&scanId=${latestScan.id}` : ''}`}
                  style={{ textDecoration: 'none' }}
                >
                  <button type="button" className="dr-primary-btn">
                    <Calendar size={15} /> Book Appointment Now
                  </button>
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {patientAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    style={{
                      padding: 18,
                      borderRadius: 14,
                      background: 'rgba(6, 24, 33, 0.6)',
                      border: '1px solid rgba(115, 231, 214, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 14,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 12,
                          background: 'rgba(8, 145, 178, 0.2)',
                          border: '1px solid rgba(34, 211, 238, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#22d3ee',
                        }}
                      >
                        <Stethoscope size={20} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 800, fontSize: 15, color: '#f0fdfa' }}>{apt.doctorName}</span>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: 10,
                            fontSize: 11,
                            fontWeight: 700,
                            background: apt.status === 'confirmed' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 211, 238, 0.15)',
                            color: apt.status === 'confirmed' ? '#4ade80' : '#67e8f9',
                            textTransform: 'uppercase',
                          }}>
                            {apt.status}
                          </span>
                        </div>
                        <div style={{ fontSize: 13, color: '#22d3ee', marginTop: 2 }}>
                          {apt.doctorRole} • {apt.doctorHospital}
                        </div>
                        <div style={{ fontSize: 12, color: '#72a8a1', marginTop: 2 }}>
                          {apt.date} at {apt.time} ({apt.type === 'tele-consultation' ? 'Tele-Consultation' : 'In-Person'})
                        </div>
                      </div>
                    </div>

                    <Link to={`/appointments/${apt.id}`} style={{ textDecoration: 'none' }}>
                      <button
                        type="button"
                        className="dr-secondary-btn"
                        style={{ background: 'rgba(11, 36, 34, 0.8)', color: '#22d3ee', borderColor: 'rgba(34, 211, 238, 0.3)' }}
                      >
                        View Details →
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}


        {/* ── TAB 5: REFERRALS ── */}
        {activeTab === 'referrals' && (
          <div className="dr-patient-card">
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#f0fdfa' }}>Clinical Referrals & Follow-Up Tracking</h2>
              <p style={{ fontSize: 13, color: '#91b4af', margin: '4px 0 0' }}>Directives generated by AI classification & verified by ophthalmology team</p>
            </div>

            {scans.length === 0 ? (
              <p style={{ fontSize: 13.5, color: '#91b4af' }}>No referrals generated yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {scans.map((s) => {
                  const info = getDRInfo(s.ai_result.grade);
                  return (
                    <div
                      key={s.id}
                      style={{
                        padding: 16,
                        borderRadius: 14,
                        background: `${info.color}15`,
                        border: `1.5px solid ${info.color}45`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 12,
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <DRBadge grade={s.ai_result.grade} size="sm" />
                          <span style={{ fontSize: 12, color: '#91b4af' }}>{s.scan_date}</span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#f0fdfa', marginTop: 6 }}>
                          {info.referral}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Link to={`/appointments/book?patientId=${patient.id}&scanId=${s.id}`} style={{ textDecoration: 'none' }}>
                          <button
                            type="button"
                            className="dr-primary-btn"
                            style={{ padding: '8px 14px', fontSize: 12.5 }}
                          >
                            <Calendar size={13} /> Book Specialist
                          </button>
                        </Link>
                        <Link to={`/scan/${s.id}`} style={{ textDecoration: 'none' }}>
                          <button
                            type="button"
                            className="dr-secondary-btn"
                            style={{ background: 'rgba(11, 36, 34, 0.8)', color: '#22d3ee', borderColor: 'rgba(34, 211, 238, 0.3)', padding: '8px 14px', fontSize: 12.5 }}
                          >
                            Review Finding
                          </button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Delete Confirmation Modal ── */}
        <DeletePatientModal
          isOpen={showDeleteModal}
          patient={patient}
          onClose={() => setShowDeleteModal(false)}
          onDeleteSuccess={handleDeletePatient}
        />
      </div>
    </PageWrapper>
  );
}
