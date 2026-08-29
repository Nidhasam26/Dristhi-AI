import { Link } from 'react-router-dom';
import {
  CheckCircle2, Calendar, Clock, MapPin, User, Stethoscope,
  ScanLine, ArrowRight, Home, Video, Check
} from 'lucide-react';
import { DRBadge } from '../ui/Badge.jsx';

export default function AppointmentConfirmation({ appointment, onReset }) {
  if (!appointment) return null;

  const formattedDate = new Date(appointment.date + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div
      className="animate-slide-up"
      style={{
        maxWidth: 760,
        margin: '0 auto',
        padding: '20px 0 60px',
      }}
    >
      {/* ── Main Confirmation Card (Exact match with DRISHTI dark medical card) ── */}
      <div
        className="dr-patient-card"
        style={{
          padding: '40px 32px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          border: '1.5px solid rgba(34, 211, 238, 0.35)',
          background: 'linear-gradient(180deg, rgba(11, 36, 34, 0.9) 0%, rgba(6, 24, 33, 0.95) 100%)',
        }}
      >
        {/* Animated Checkmark Badge */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: '#0eaa99',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 0 30px rgba(14, 170, 153, 0.4), 0 4px 14px rgba(0,0,0,0.3)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          <Check size={40} color="#ffffff" strokeWidth={3} />
        </div>

        <div className="dr-eyebrow" style={{ justifyContent: 'center', marginBottom: 8 }}>
          <span className="dr-live-dot" /> CLINICAL APPOINTMENT CONFIRMED
        </div>

        <h1
          style={{
            fontSize: 'clamp(24px, 3.5vw, 32px)',
            fontWeight: 800,
            color: '#f0fdfa',
            margin: '0 0 10px 0',
            letterSpacing: '-0.02em',
          }}
        >
          Booking Confirmed with {appointment.doctorName}
        </h1>

        <p
          style={{
            color: '#91b4af',
            fontSize: 14,
            maxWidth: 540,
            margin: '0 auto 28px',
            lineHeight: 1.5,
          }}
        >
          Your clinical follow-up appointment has been scheduled and linked with your DRISHTI AI retinal screening dossier.
        </p>

        {/* ── Appointment Details Dossier ── */}
        <div
          style={{
            background: 'rgba(6, 24, 33, 0.7)',
            border: '1px solid rgba(115, 231, 214, 0.14)',
            borderRadius: 16,
            padding: '24px',
            textAlign: 'left',
            marginBottom: 28,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {/* Doctor Info Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: 16,
              borderBottom: '1px solid rgba(115, 231, 214, 0.1)',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 12,
                  background: 'rgba(8, 145, 178, 0.2)',
                  border: '1px solid rgba(34, 211, 238, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#22d3ee',
                  flexShrink: 0,
                }}
              >
                <Stethoscope size={24} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#f0fdfa' }}>
                  {appointment.doctorName}
                </div>
                <div style={{ fontSize: 13, color: '#22d3ee', fontWeight: 600 }}>
                  {appointment.doctorRole}
                </div>
                <div style={{ fontSize: 12, color: '#72a8a1', marginTop: 2 }}>
                  {appointment.doctorHospital}
                </div>
              </div>
            </div>

            <span
              style={{
                padding: '4px 12px',
                borderRadius: 8,
                background: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.35)',
                color: '#4ade80',
                fontSize: 11,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                textTransform: 'uppercase',
              }}
            >
              <CheckCircle2 size={12} /> Confirmed
            </span>
          </div>

          {/* Date & Time Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 14,
            }}
          >
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 12,
                background: 'rgba(11, 36, 34, 0.6)',
                border: '1px solid rgba(115, 231, 214, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <Calendar size={18} color="#22d3ee" />
              <div>
                <div className="patient-label">CONSULTATION DATE</div>
                <div className="patient-val" style={{ fontSize: 13.5, marginTop: 2 }}>
                  {formattedDate}
                </div>
              </div>
            </div>

            <div
              style={{
                padding: '12px 14px',
                borderRadius: 12,
                background: 'rgba(11, 36, 34, 0.6)',
                border: '1px solid rgba(115, 231, 214, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <Clock size={18} color="#22d3ee" />
              <div>
                <div className="patient-label">TIME SLOT</div>
                <div className="patient-val" style={{ fontSize: 13.5, marginTop: 2 }}>
                  {appointment.time}
                </div>
              </div>
            </div>
          </div>

          {/* Patient & Mode Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 14,
            }}
          >
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 12,
                background: 'rgba(11, 36, 34, 0.6)',
                border: '1px solid rgba(115, 231, 214, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <User size={18} color="#22d3ee" />
              <div>
                <div className="patient-label">PATIENT</div>
                <div className="patient-val" style={{ fontSize: 13.5, marginTop: 2 }}>
                  {appointment.patientName} {appointment.patientVillage ? `(${appointment.patientVillage})` : ''}
                </div>
              </div>
            </div>

            <div
              style={{
                padding: '12px 14px',
                borderRadius: 12,
                background: 'rgba(11, 36, 34, 0.6)',
                border: '1px solid rgba(115, 231, 214, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              {appointment.type === 'tele-consultation' ? (
                <Video size={18} color="#22d3ee" />
              ) : (
                <MapPin size={18} color="#22d3ee" />
              )}
              <div>
                <div className="patient-label">CONSULTATION MODE</div>
                <div className="patient-val" style={{ fontSize: 13.5, marginTop: 2, textTransform: 'capitalize' }}>
                  {appointment.type === 'tele-consultation' ? 'Tele-Ophthalmology Video Call' : 'In-Person Hospital Visit'}
                </div>
              </div>
            </div>
          </div>

          {/* Linked DRISHTI Retinal Scan Section */}
          {appointment.scanId && (
            <div
              style={{
                padding: '14px 18px',
                borderRadius: 12,
                background: 'rgba(8, 145, 178, 0.15)',
                border: '1px solid rgba(34, 211, 238, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: 'rgba(34, 211, 238, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#22d3ee',
                  }}
                >
                  <ScanLine size={18} />
                </div>
                <div>
                  <div className="patient-label" style={{ color: '#22d3ee' }}>
                    LINKED RETINAL SCREENING REPORT
                  </div>
                  <div style={{ fontSize: 13, color: '#e8fffc', fontWeight: 600 }}>
                    Scan ID: <code style={{ color: '#67e8f9' }}>{appointment.scanId}</code>
                    {appointment.scanGradeLabel && ` · ${appointment.scanGradeLabel}`}
                  </div>
                </div>
              </div>

              {appointment.scanGrade !== undefined && appointment.scanGrade !== null && (
                <DRBadge grade={appointment.scanGrade} size="sm" />
              )}
            </div>
          )}

          {/* Clinical Reason */}
          {appointment.reason && (
            <div
              style={{
                fontSize: 13,
                color: '#91b4af',
                paddingTop: 10,
                borderTop: '1px solid rgba(115, 231, 214, 0.08)',
              }}
            >
              <strong style={{ color: '#d1f2ec' }}>Clinical Purpose:</strong> {appointment.reason}
            </div>
          )}
        </div>

        {/* ── Action Buttons (Matching Dashboard.jsx) ── */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Link to={`/appointments/${appointment.id}`} style={{ textDecoration: 'none' }}>
            <button type="button" className="dr-primary-btn">
              View Appointment Details <ArrowRight size={15} />
            </button>
          </Link>

          <Link to="/appointments" style={{ textDecoration: 'none' }}>
            <button type="button" className="dr-secondary-btn">
              <Calendar size={15} /> My Appointments
            </button>
          </Link>

          <Link to="/dashboard" style={{ textDecoration: 'none' }}>
            <button type="button" className="dr-secondary-btn">
              <Home size={15} /> Command Center
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
