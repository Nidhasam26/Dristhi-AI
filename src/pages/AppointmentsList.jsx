import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useAppointments } from '../context/AppointmentContext.jsx';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import CancelAppointmentModal from '../components/appointment/CancelAppointmentModal.jsx';
import SyncStatusBadge from '../components/ui/SyncStatusBadge.jsx';
import {
  Calendar, Clock, Stethoscope, User, MapPin, Video,
  ScanLine, CheckCircle2, XCircle, ArrowRight,
  Plus, Search, Check, CalendarCheck, Clock3, IndianRupee
} from 'lucide-react';
import { getDRInfo } from '../utils/drClassification.js';

function StatCard({ icon: Icon, value, label, tone = 'teal', onClick, active }) {
  return (
    <div
      className={`dr-stat dr-stat-${tone}`}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        outline: active ? '2px solid #0eaa99' : 'none',
        transition: 'all 0.2s ease',
      }}
    >
      <div className="dr-stat-icon"><Icon size={19} /></div>
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const configs = {
    confirmed: { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.35)', color: '#4ade80', Icon: CheckCircle2, label: 'Confirmed' },
    scheduled: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.35)', color: '#fbbf24', Icon: Clock, label: 'Scheduled' },
    completed: { bg: 'rgba(34, 211, 238, 0.15)', border: 'rgba(34, 211, 238, 0.35)', color: '#67e8f9', Icon: Check, label: 'Completed' },
    cancelled: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.35)', color: '#f87171', Icon: XCircle, label: 'Cancelled' },
  };
  const cfg = configs[status] || { bg: 'rgba(148, 163, 184, 0.15)', border: 'rgba(148, 163, 184, 0.3)', color: '#94a3b8', Icon: Clock, label: status };
  const { bg, border, color, Icon, label } = cfg;
  return (
    <span
      style={{
        padding: '4px 10px', borderRadius: 8,
        background: bg, border: `1px solid ${border}`, color,
        fontSize: 11, fontWeight: 700,
        display: 'inline-flex', alignItems: 'center', gap: 4,
        textTransform: 'uppercase',
      }}
    >
      <Icon size={12} /> {label}
    </span>
  );
}

export default function AppointmentsList() {
  const { user } = useAuth();
  const { appointments, cancelAppointment } = useAppointments();
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [cancelTarget, setCancelTarget] = useState(null); // appointment to cancel

  const isAdmin = user?.role === 'admin';
  const todayIso = new Date().toISOString().slice(0, 10);

  // appointments from context is ALREADY filtered by ownership — no extra filter needed
  const userAppointments = appointments;

  const filteredAppointments = useMemo(() => {
    return userAppointments.filter((apt) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        apt.patientName?.toLowerCase().includes(q) ||
        apt.doctorName?.toLowerCase().includes(q) ||
        apt.reason?.toLowerCase().includes(q) ||
        apt.id?.toLowerCase().includes(q) ||
        apt.doctorHospital?.toLowerCase().includes(q);

      if (!matchSearch) return false;

      if (activeFilter === 'upcoming') return apt.status === 'scheduled' || apt.status === 'confirmed';
      if (activeFilter === 'completed') return apt.status === 'completed';
      if (activeFilter === 'cancelled') return apt.status === 'cancelled';
      return true;
    });
  }, [userAppointments, search, activeFilter]);

  const upcomingCount = useMemo(() => userAppointments.filter((a) => a.status === 'scheduled' || a.status === 'confirmed').length, [userAppointments]);
  const todayCount = useMemo(() => userAppointments.filter((a) => a.date === todayIso && a.status !== 'cancelled').length, [userAppointments, todayIso]);
  const completedCount = useMemo(() => userAppointments.filter((a) => a.status === 'completed').length, [userAppointments]);
  const cancelledCount = useMemo(() => userAppointments.filter((a) => a.status === 'cancelled').length, [userAppointments]);

  const handleCancelConfirm = async (reason) => {
    if (!cancelTarget) return;
    await cancelAppointment(cancelTarget.id, reason);
    setCancelTarget(null);
    setToastMessage('Appointment has been cancelled.');
    setTimeout(() => setToastMessage(''), 3500);
  };

  return (
    <PageWrapper>
      <div className="dr-appointments-screen">
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
        {cancelTarget && (
          <CancelAppointmentModal
            appointment={cancelTarget}
            onConfirm={handleCancelConfirm}
            onClose={() => setCancelTarget(null)}
          />
        )}

        {/* ── Page Header ── */}
        <div className="dr-page-head">
          <div>
            <div className="dr-eyebrow">
              <span className="dr-live-dot" />
              {isAdmin ? 'CLINICAL SCHEDULE · OPHTHALMOLOGIST QUEUE' : 'PATIENT APPOINTMENTS · MY CONSULTATIONS'}
            </div>
            <h1>Doctor <span>Appointments</span></h1>
            <p>
              {isAdmin
                ? 'Manage the clinical schedule, patient consultations, and linked DRISHTI retinal scans.'
                : 'Your scheduled retinal specialist consultations, tele-reviews, and clinical follow-ups.'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link className="dr-primary-btn" to="/appointments/book">
              <Plus size={18} /> Book Appointment <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* ── Stats Grid ── */}
        <div className="dr-stats-grid">
          <StatCard icon={Calendar}      value={userAppointments.length} label="Total consultations"  tone="teal"   active={activeFilter === 'all'}       onClick={() => setActiveFilter('all')} />
          <StatCard icon={Clock3}        value={upcomingCount}           label="Upcoming appointments" tone="amber"  active={activeFilter === 'upcoming'}  onClick={() => setActiveFilter('upcoming')} />
          <StatCard icon={CalendarCheck} value={todayCount}              label="Scheduled today"       tone="teal" />
          <StatCard icon={CheckCircle2}  value={completedCount}          label="Completed visits"      tone="green"  active={activeFilter === 'completed'} onClick={() => setActiveFilter('completed')} />
          <StatCard icon={XCircle}       value={cancelledCount}          label="Cancelled records"     tone="purple" active={activeFilter === 'cancelled'} onClick={() => setActiveFilter('cancelled')} />
        </div>

        {/* ── Search & Filter Bar ── */}
        <div
          className="dr-panel"
          style={{
            background: 'rgba(11, 36, 34, 0.7)',
            border: '1px solid rgba(115, 231, 214, 0.14)',
            borderRadius: 18,
            padding: 16,
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 14,
          }}
        >
          <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: 440 }}>
            <Search
              size={17}
              aria-hidden="true"
              style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: '#648c86', pointerEvents: 'none' }}
            />
            <input
              type="search"
              className="dr-patient-search"
              placeholder="Search by doctor, reason, or appointment ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: `All (${userAppointments.length})` },
              { id: 'upcoming', label: `Upcoming (${upcomingCount})` },
              { id: 'completed', label: `Completed (${completedCount})` },
              { id: 'cancelled', label: `Cancelled (${cancelledCount})` },
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className={`dr-filter-pill ${activeFilter === id ? 'active' : ''}`}
                onClick={() => setActiveFilter(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Appointments List ── */}
        {filteredAppointments.length === 0 ? (
          <div className="dr-patient-card" style={{ padding: '60px 24px', textAlign: 'center', color: '#91b4af' }}>
            <Calendar size={44} color="#22d3ee" style={{ opacity: 0.5, margin: '0 auto 16px' }} />
            <h3 style={{ color: '#f0fdfa', fontSize: 18, margin: 0 }}>No Appointments Found</h3>
            <p style={{ fontSize: 13.5, color: '#91b4af', margin: '8px 0 20px' }}>
              {search
                ? `No appointments match "${search}".`
                : activeFilter !== 'all'
                ? `No appointments in the "${activeFilter}" category.`
                : 'No doctor consultations are currently scheduled.'}
            </p>
            <Link className="dr-primary-btn" to="/appointments/book" style={{ margin: '0 auto' }}>
              <Plus size={16} /> Book First Appointment
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filteredAppointments.map((apt) => {
              const formattedDate = new Date(apt.date + 'T00:00:00').toLocaleDateString('en-IN', {
                weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
              });
              const isUpcoming = apt.status === 'scheduled' || apt.status === 'confirmed';

              return (
                <div key={apt.id} className="dr-patient-card">
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>

                    {/* Left: Doctor & Patient Info */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flex: '1 1 340px' }}>
                      <div
                        style={{
                          width: 48, height: 48, borderRadius: 12,
                          background: 'rgba(8, 145, 178, 0.2)',
                          border: '1px solid rgba(34, 211, 238, 0.3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#22d3ee', flexShrink: 0,
                        }}
                      >
                        <Stethoscope size={24} />
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <span className="patient-name" style={{ fontSize: 17 }}>{apt.doctorName}</span>
                          <StatusBadge status={apt.status} />
                          <SyncStatusBadge status={apt.sync_status} size="sm" />
                          <span className="patient-id">{apt.id}</span>
                        </div>

                        <div style={{ fontSize: 13, color: '#22d3ee', fontWeight: 600, marginTop: 2 }}>
                          {apt.doctorRole} ·{' '}
                          <span style={{ color: '#91b4af', fontWeight: 500 }}>{apt.doctorHospital}</span>
                        </div>

                        {/* Details grid */}
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                            gap: 10,
                            marginTop: 12, paddingTop: 12,
                            borderTop: '1px solid rgba(115, 231, 214, 0.1)',
                          }}
                        >
                          {isAdmin && (
                            <div>
                              <span className="patient-label">PATIENT</span>
                              <div className="patient-val" style={{ fontSize: 13.5, marginTop: 2 }}>
                                {apt.patientName}{' '}
                                {apt.patientId && (
                                  <small style={{ color: '#72a8a1', fontFamily: 'monospace' }}>
                                    ({apt.patientId})
                                  </small>
                                )}
                              </div>
                            </div>
                          )}

                          <div>
                            <span className="patient-label">CONSULTATION MODE</span>
                            <div className="patient-val" style={{ fontSize: 13.5, marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
                              {apt.type === 'tele-consultation'
                                ? <><Video size={13} color="#22d3ee" /> Tele-Consultation</>
                                : <><MapPin size={13} color="#22d3ee" /> In-Person Visit</>}
                            </div>
                          </div>

                          {apt.doctorFee != null && (
                            <div>
                              <span className="patient-label">CONSULTATION FEE</span>
                              <div className="patient-val" style={{ fontSize: 13.5, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4, color: '#0eaa99' }}>
                                <IndianRupee size={12} /> ₹{Number(apt.doctorFee).toLocaleString('en-IN')}
                              </div>
                            </div>
                          )}

                          {apt.reason && (
                            <div style={{ gridColumn: '1 / -1' }}>
                              <span className="patient-label">CLINICAL PURPOSE</span>
                              <div style={{ fontSize: 13, color: '#d1f2ec', marginTop: 2 }}>{apt.reason}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Date, Time & Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12, flex: '0 0 auto', minWidth: 200 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#f0fdfa' }}>{formattedDate}</div>
                        <div style={{ fontSize: 13, color: '#22d3ee', fontWeight: 700, marginTop: 2 }}>{apt.time}</div>
                      </div>

                      {/* Linked Retinal Scan */}
                      {apt.scanId && (
                        <Link
                          to={`/scan/${apt.scanId}`}
                          style={{
                            textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '6px 12px', borderRadius: 10,
                            background: 'rgba(8, 145, 178, 0.15)', border: '1px solid rgba(34, 211, 238, 0.3)',
                            fontSize: 12, fontWeight: 700, color: '#22d3ee', transition: 'all 0.2s',
                          }}
                        >
                          <ScanLine size={14} /> View Retinal Analysis →
                        </Link>
                      )}

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 8, marginTop: 'auto', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {isUpcoming && (
                          <button
                            type="button"
                            onClick={() => setCancelTarget(apt)}
                            style={{
                              padding: '0 12px', minHeight: 36, fontSize: 12, borderRadius: 10,
                              background: 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              color: '#fca5a5', fontWeight: 700, cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: 5,
                              transition: 'all 0.2s',
                              fontFamily: 'var(--font-heading)',
                            }}
                          >
                            Cancel
                          </button>
                        )}

                        <Link to={`/appointments/${apt.id}`} style={{ textDecoration: 'none' }}>
                          <button
                            type="button"
                            className="dr-primary-btn"
                            style={{ padding: '0 16px', minHeight: 36, fontSize: 12.5 }}
                          >
                            View Details <ArrowRight size={14} />
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="dr-disclaimer" style={{ marginTop: 28 }}>
          DRISHTI AI appointments are for clinical follow-up triage. All consultations are
          private to your account. Changing your password or logging out revokes data access.
        </p>
      </div>
    </PageWrapper>
  );
}
