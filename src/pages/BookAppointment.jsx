import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { usePatients } from '../context/PatientContext.jsx';
import { useAppointments } from '../context/AppointmentContext.jsx';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import AppointmentConfirmation from '../components/appointment/AppointmentConfirmation.jsx';
import { DRBadge } from '../components/ui/Badge.jsx';
import {
  ArrowLeft, Calendar, Clock, Stethoscope, User, MapPin,
  ScanLine, CheckCircle2, AlertCircle, Video, Building2,
  Check, ArrowRight, IndianRupee, Star
} from 'lucide-react';
import { getDRInfo } from '../utils/drClassification.js';

export default function BookAppointment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { patients, scans, getScanById, getPatientById } = usePatients();
  const { doctors, addAppointment, isSlotAvailable } = useAppointments();

  const paramScanId = searchParams.get('scanId');
  // SECURITY: paramPatientId from URL is only trusted for admin/user roles.
  // For patient role, the booking is always for themselves.
  const paramPatientId = user?.role !== 'patient' ? searchParams.get('patientId') : null;
  const paramDoctorId = searchParams.get('doctorId');

  const linkedScan = useMemo(() => {
    if (!paramScanId) return null;
    const scan = getScanById(paramScanId);
    // Ownership check: only link this scan if it belongs to the current user
    if (scan && user?.role === 'patient' && scan.ownerUserId !== user?.id) return null;
    return scan;
  }, [paramScanId, getScanById, user]);

  // ── Determine initial patient selection ──
  // For patient role: always book for themselves (no dropdown)
  // For user/admin: use URL param or first patient in list
  const initialPatientId = useMemo(() => {
    if (user?.role === 'patient') {
      // Find the patient record linked to this auth user
      const ownRecord = patients.find(
        (p) => p.userId === user.id || p.id === user.id
      );
      return ownRecord ? ownRecord.id : user.id;
    }
    if (paramPatientId) return paramPatientId;
    if (linkedScan) return linkedScan.patient_id;
    return patients[0]?.id || '';
  }, [user, patients, paramPatientId, linkedScan]);

  const [selectedPatientId, setSelectedPatientId] = useState(initialPatientId);
  const [selectedDoctorId, setSelectedDoctorId] = useState(paramDoctorId || doctors[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('in-person');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!selectedPatientId && initialPatientId) {
      setSelectedPatientId(initialPatientId);
    }
  }, [initialPatientId, selectedPatientId]);

  // For patient role, derive their info from user object directly
  const selectedPatient = useMemo(() => {
    if (user?.role === 'patient') {
      // Try to find their patient record first
      const ownRecord = patients.find(
        (p) => p.userId === user.id || p.id === user.id
      );
      if (ownRecord) return ownRecord;
      // Fall back to user object (treat as virtual patient)
      return {
        id: user.id,
        name: user.name,
        phone: user.phone || '',
        village: user.village || '',
        district: user.district || '',
        age: null,
        gender: null,
      };
    }
    return getPatientById(selectedPatientId) || patients.find((p) => p.id === selectedPatientId) || null;
  }, [user, patients, selectedPatientId, getPatientById]);

  const selectedDoctor = useMemo(() => {
    return doctors.find((d) => d.id === selectedDoctorId) || doctors[0] || null;
  }, [selectedDoctorId, doctors]);

  const availableDatesList = useMemo(() => {
    const dates = [];
    const base = new Date();
    base.setDate(base.getDate() + 1);
    for (let i = 0; i < 14; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const isoDate = d.toISOString().slice(0, 10);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      dates.push({ iso: isoDate, dayName, dayNum, monthName });
    }
    return dates;
  }, []);

  useEffect(() => {
    if (!selectedDate && availableDatesList.length > 0) {
      setSelectedDate(availableDatesList[0].iso);
    }
  }, [availableDatesList, selectedDate]);

  useEffect(() => {
    if (linkedScan) {
      const info = getDRInfo(linkedScan.ai_result.grade);
      setReason(
        `Clinical follow-up screening review for ${info.fullLabel} (${linkedScan.eye === 'right' ? 'Right Eye / OD' : 'Left Eye / OS'})`
      );
    } else if (!reason) {
      setReason('Routine retinal evaluation and diabetic eye check-up');
    }
  }, [linkedScan]); // eslint-disable-line react-hooks/exhaustive-deps

  const timeSlots = useMemo(() => {
    if (!selectedDoctor) return [];
    return selectedDoctor.availableSlots || ['09:30 AM', '11:00 AM', '02:00 PM', '04:30 PM'];
  }, [selectedDoctor]);

  useEffect(() => {
    if (selectedDate && selectedDoctorId) {
      const validSlot = timeSlots.find((slot) => isSlotAvailable(selectedDoctorId, selectedDate, slot));
      if (validSlot && (!selectedTime || !isSlotAvailable(selectedDoctorId, selectedDate, selectedTime))) {
        setSelectedTime(validSlot);
      }
    }
  }, [selectedDoctorId, selectedDate, timeSlots, isSlotAvailable, selectedTime]);

  const handleDoctorSelect = (doctorId) => {
    setSelectedDoctorId(doctorId);
    const doc = doctors.find((d) => d.id === doctorId);
    if (doc && !doc.modes.includes(appointmentType)) {
      setAppointmentType(doc.modes[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedPatient) {
      setFormError('Patient information could not be determined. Please try again.');
      return;
    }
    if (!selectedDoctor) {
      setFormError('Please select a specialist ophthalmologist.');
      return;
    }
    if (!selectedDate) {
      setFormError('Please select an appointment date.');
      return;
    }
    if (!selectedTime) {
      setFormError('Please select a consultation time slot.');
      return;
    }
    if (!isSlotAvailable(selectedDoctor.id, selectedDate, selectedTime)) {
      setFormError(
        `The time slot ${selectedTime} on ${selectedDate} is already reserved. Please select another.`
      );
      return;
    }
    if (!reason.trim()) {
      setFormError('Please enter a reason for the consultation.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newApt = await addAppointment({
        // ownerUserId is set inside addAppointment from the auth session — not passed here
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        patientPhone: selectedPatient.phone || '',
        patientVillage: selectedPatient.village || '',
        patientDistrict: selectedPatient.district || '',
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        doctorRole: selectedDoctor.role,
        doctorHospital: selectedDoctor.hospital,
        doctorFee: selectedDoctor.fee ?? null,
        scanId: linkedScan ? linkedScan.id : null,
        scanGrade: linkedScan ? linkedScan.ai_result.grade : null,
        scanGradeLabel: linkedScan ? getDRInfo(linkedScan.ai_result.grade).fullLabel : null,
        date: selectedDate,
        time: selectedTime,
        type: appointmentType,
        reason: reason.trim(),
        notes: notes.trim(),
      });
      setConfirmedAppointment(newApt);
    } catch (err) {
      console.error('Failed to book appointment:', err);
      setFormError('An error occurred while booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (confirmedAppointment) {
    return (
      <PageWrapper>
        <div className="dr-booking-screen">
          <AppointmentConfirmation
            appointment={confirmedAppointment}
            onReset={() => {
              setConfirmedAppointment(null);
              navigate('/appointments');
            }}
          />
        </div>
      </PageWrapper>
    );
  }

  const linkedScanInfo = linkedScan ? getDRInfo(linkedScan.ai_result.grade) : null;
  const isPatientRole = user?.role === 'patient';

  return (
    <PageWrapper>
      <div className="dr-booking-screen">
        {/* ── Page Header ── */}
        <div className="dr-page-head">
          <div>
            <div className="dr-eyebrow">
              <span className="dr-live-dot" /> CLINICAL TRIAGE FOLLOW-UP · SPECIALIST BOOKING
            </div>
            <h1>
              Book Doctor <span>Appointment</span>
            </h1>
            <p>
              Schedule a specialized clinical consultation linked directly with your DRISHTI AI retinal screening.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" className="dr-secondary-btn" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} /> Back
            </button>
            <Link className="dr-secondary-btn" to="/appointments">
              <Calendar size={16} /> My Appointments
            </Link>
          </div>
        </div>

        {/* ── Form Error Banner ── */}
        {formError && (
          <div
            className="animate-slide-up"
            style={{
              padding: '14px 18px',
              borderRadius: 14,
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1.5px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              fontSize: 13.5,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 24,
            }}
          >
            <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
            <span>{formError}</span>
          </div>
        )}

        {/* ── Linked DRISHTI Retinal Scan Banner ── */}
        {linkedScan && (
          <div
            className="dr-patient-card"
            style={{
              padding: 20,
              marginBottom: 24,
              border: '1.5px solid rgba(34, 211, 238, 0.35)',
              background: 'linear-gradient(135deg, rgba(7, 31, 44, 0.7) 0%, rgba(6, 24, 33, 0.8) 100%)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: 'rgba(8, 145, 178, 0.2)',
                    border: '1px solid rgba(34, 211, 238, 0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#22d3ee',
                  }}
                >
                  <ScanLine size={22} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#22d3ee', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      LINKED RETINAL SCREENING REPORT
                    </span>
                    <span className="patient-id">#{linkedScan.id}</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#f0fdfa', marginTop: 2 }}>
                    {linkedScanInfo.fullLabel} ·{' '}
                    <span style={{ color: '#91b4af', fontWeight: 600 }}>
                      {linkedScan.eye === 'right' ? 'Right Eye (OD)' : 'Left Eye (OS)'}
                    </span>
                  </div>
                  <div style={{ fontSize: 12.5, color: '#72a8a1', marginTop: 2 }}>
                    AI Confidence:{' '}
                    <strong style={{ color: '#22d3ee' }}>
                      {Math.round(linkedScan.ai_result.confidence * 100)}%
                    </strong>{' '}
                    · Screened on {new Date(linkedScan.scan_date).toLocaleDateString('en-IN')}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <DRBadge grade={linkedScan.ai_result.grade} size="md" />
                <Link to={`/scan/${linkedScan.id}`} style={{ textDecoration: 'none' }}>
                  <button type="button" className="dr-secondary-btn" style={{ minHeight: 36, padding: '0 12px', fontSize: 12 }}>
                    View Scan
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── Main Booking Form ── */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24, alignItems: 'start' }}>

            {/* ════════ LEFT COLUMN: PATIENT INFO & SPECIALIST ════════ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

              {/* Patient Info Card */}
              <div className="dr-patient-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <User size={18} color="#22d3ee" />
                  <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: '#f0fdfa' }}>Patient Details</h2>
                </div>

                {isPatientRole ? (
                  /* Patient role: show their own info (no dropdown) */
                  <div>
                    <div
                      style={{
                        padding: '14px 16px',
                        borderRadius: 12,
                        background: 'rgba(6, 24, 33, 0.6)',
                        border: '1px solid rgba(115, 231, 214, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          width: 40, height: 40, borderRadius: 10,
                          background: 'rgba(14, 170, 153, 0.2)',
                          border: '1px solid rgba(14, 170, 153, 0.3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#0eaa99', fontWeight: 800, fontSize: 15,
                        }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#f0fdfa' }}>{user.name}</div>
                        <div style={{ fontSize: 12, color: '#22d3ee', marginTop: 1 }}>Authenticated Patient · {user.id}</div>
                      </div>
                    </div>
                    {selectedPatient && (
                      <div
                        style={{
                          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
                          padding: '12px 14px',
                          borderRadius: 10,
                          background: 'rgba(6, 24, 33, 0.4)',
                          border: '1px solid rgba(115, 231, 214, 0.1)',
                        }}
                      >
                        {selectedPatient.age && (
                          <div>
                            <span className="patient-label">AGE / GENDER</span>
                            <div className="patient-val" style={{ fontSize: 13, marginTop: 2 }}>
                              {selectedPatient.age}y · {selectedPatient.gender}
                            </div>
                          </div>
                        )}
                        <div>
                          <span className="patient-label">LOCATION</span>
                          <div className="patient-val" style={{ fontSize: 13, marginTop: 2 }}>
                            {selectedPatient.village || user.village || '—'},{' '}
                            {selectedPatient.district || user.district || '—'}
                          </div>
                        </div>
                        {selectedPatient.phone && (
                          <div>
                            <span className="patient-label">PHONE</span>
                            <div className="patient-val" style={{ fontSize: 13, marginTop: 2 }}>
                              {selectedPatient.phone}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <div
                      style={{
                        marginTop: 10,
                        padding: '8px 12px',
                        borderRadius: 8,
                        background: 'rgba(14, 170, 153, 0.08)',
                        border: '1px solid rgba(14, 170, 153, 0.2)',
                        fontSize: 12,
                        color: '#72a8a1',
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}
                    >
                      <CheckCircle2 size={13} color="#0eaa99" />
                      Appointment will be booked under your authenticated account.
                    </div>
                  </div>
                ) : (
                  /* User/Admin role: patient selector dropdown */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <label htmlFor="patient-select" className="patient-label">
                      SELECT PATIENT RECORD
                    </label>
                    <select
                      id="patient-select"
                      className="dr-patient-search"
                      style={{ paddingLeft: 16, appearance: 'auto' }}
                      value={selectedPatientId}
                      onChange={(e) => setSelectedPatientId(e.target.value)}
                    >
                      {patients.map((p) => (
                        <option key={p.id} value={p.id} style={{ background: '#071f1d', color: '#f0fdfa' }}>
                          {p.name} ({p.id}) · {p.village || 'Village'}{p.age ? `, ${p.age}y` : ''}
                        </option>
                      ))}
                    </select>
                    {selectedPatient && (
                      <div
                        style={{
                          padding: '12px 14px',
                          borderRadius: 10,
                          background: 'rgba(6, 24, 33, 0.6)',
                          border: '1px solid rgba(115, 231, 214, 0.1)',
                          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
                          marginTop: 4,
                        }}
                      >
                        {selectedPatient.age && (
                          <div>
                            <span className="patient-label">AGE / GENDER</span>
                            <div className="patient-val" style={{ fontSize: 13, marginTop: 2 }}>
                              {selectedPatient.age}y · {selectedPatient.gender}
                            </div>
                          </div>
                        )}
                        <div>
                          <span className="patient-label">LOCATION</span>
                          <div className="patient-val" style={{ fontSize: 13, marginTop: 2 }}>
                            {selectedPatient.village}, {selectedPatient.district}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Specialist Selection Card */}
              <div className="dr-patient-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Stethoscope size={18} color="#22d3ee" />
                    <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: '#f0fdfa' }}>Select Specialist</h2>
                  </div>
                  <span style={{ fontSize: 11, color: '#72a8a1', fontWeight: 700 }}>
                    {doctors.length} Available
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {doctors.map((doc) => {
                    const isSelected = selectedDoctorId === doc.id;
                    return (
                      <div
                        key={doc.id}
                        onClick={() => handleDoctorSelect(doc.id)}
                        style={{
                          padding: 16,
                          borderRadius: 14,
                          background: isSelected ? 'rgba(14, 44, 41, 0.9)' : 'rgba(6, 24, 33, 0.6)',
                          border: isSelected ? '2px solid #0eaa99' : '1px solid rgba(115, 231, 214, 0.14)',
                          boxShadow: isSelected ? '0 0 20px rgba(14, 170, 153, 0.25)' : 'none',
                          cursor: 'pointer',
                          display: 'flex', alignItems: 'flex-start', gap: 14,
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div
                          style={{
                            width: 44, height: 44, borderRadius: 12,
                            background: doc.avatarColor || '#0891b2',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 800, fontSize: 16, flexShrink: 0,
                          }}
                        >
                          {doc.name.replace('Dr. ', '').split(' ').map((n) => n[0]).join('')}
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                            <span style={{ fontWeight: 800, fontSize: 15, color: '#f0fdfa' }}>{doc.name}</span>
                            {isSelected && (
                              <span
                                style={{
                                  padding: '2px 8px', borderRadius: 10,
                                  background: '#0eaa99', color: 'white',
                                  fontSize: 11, fontWeight: 700,
                                  display: 'flex', alignItems: 'center', gap: 3,
                                }}
                              >
                                <Check size={11} strokeWidth={3} /> Selected
                              </span>
                            )}
                          </div>

                          <div style={{ fontSize: 13, color: '#22d3ee', fontWeight: 600, marginTop: 2 }}>
                            {doc.role}
                          </div>
                          <div style={{ fontSize: 12, color: '#72a8a1', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Building2 size={12} /> {doc.hospital}
                          </div>
                          <div style={{ fontSize: 12, color: '#72a8a1', marginTop: 2, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                              <MapPin size={11} /> {doc.location || 'Maharashtra'}
                            </span>
                            <span>· {doc.experience}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 2, color: '#fbbf24' }}>
                              <Star size={11} fill="#fbbf24" /> {doc.rating}
                            </span>
                          </div>

                          {/* Consultation Fee */}
                          {doc.fee && (
                            <div
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                marginTop: 8, padding: '4px 10px', borderRadius: 8,
                                background: 'rgba(14, 170, 153, 0.12)',
                                border: '1px solid rgba(14, 170, 153, 0.25)',
                                fontSize: 12, color: '#0eaa99', fontWeight: 800,
                              }}
                            >
                              <IndianRupee size={11} /> ₹{doc.fee.toLocaleString('en-IN')} Consultation Fee
                            </div>
                          )}

                          {doc.about && (
                            <p style={{ fontSize: 12, color: '#91b4af', marginTop: 6, lineHeight: 1.4, margin: '6px 0 0' }}>
                              {doc.about}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ════════ RIGHT COLUMN: DATE, TIME & DETAILS ════════ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

              {/* Date Selection */}
              <div className="dr-patient-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Calendar size={18} color="#22d3ee" />
                    <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: '#f0fdfa' }}>Select Date</h2>
                  </div>
                  <span style={{ fontSize: 11, color: '#72a8a1', fontWeight: 700 }}>Next 14 Days</span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(68px, 1fr))',
                    gap: 8,
                    maxHeight: 220,
                    overflowY: 'auto',
                    padding: 2,
                  }}
                >
                  {availableDatesList.map(({ iso, dayName, dayNum, monthName }) => {
                    const isSelected = selectedDate === iso;
                    return (
                      <button
                        key={iso}
                        type="button"
                        onClick={() => setSelectedDate(iso)}
                        style={{
                          padding: '10px 6px',
                          borderRadius: 12,
                          background: isSelected ? '#0eaa99' : 'rgba(6, 24, 33, 0.6)',
                          border: isSelected ? '1px solid #0eaa99' : '1px solid rgba(115, 231, 214, 0.14)',
                          color: isSelected ? '#ffffff' : '#91b4af',
                          cursor: 'pointer',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                          transition: 'all 0.2s ease',
                          boxShadow: isSelected ? '0 4px 14px rgba(14, 170, 153, 0.35)' : 'none',
                        }}
                      >
                        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>{dayName}</span>
                        <span style={{ fontSize: 18, fontWeight: 800, color: isSelected ? '#ffffff' : '#f0fdfa' }}>{dayNum}</span>
                        <span style={{ fontSize: 10, opacity: 0.8 }}>{monthName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots */}
              <div className="dr-patient-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Clock size={18} color="#22d3ee" />
                    <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: '#f0fdfa' }}>Select Time Slot</h2>
                  </div>
                  <span style={{ fontSize: 11, color: '#72a8a1', fontWeight: 700 }}>
                    {selectedDate || 'Select a date'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 10 }}>
                  {timeSlots.map((slot) => {
                    const isAvailable = selectedDoctor && selectedDate
                      ? isSlotAvailable(selectedDoctor.id, selectedDate, slot)
                      : true;
                    const isSelected = selectedTime === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => setSelectedTime(slot)}
                        style={{
                          padding: '12px 8px',
                          borderRadius: 10,
                          background: isSelected ? '#0eaa99' : isAvailable ? 'rgba(6, 24, 33, 0.6)' : 'rgba(239, 68, 68, 0.08)',
                          border: isSelected ? '1px solid #0eaa99' : isAvailable ? '1px solid rgba(115, 231, 214, 0.16)' : '1px solid rgba(239, 68, 68, 0.2)',
                          color: isSelected ? '#ffffff' : isAvailable ? '#f0fdfa' : '#71717a',
                          fontWeight: 700, fontSize: 13,
                          cursor: isAvailable ? 'pointer' : 'not-allowed',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                          transition: 'all 0.2s ease',
                          boxShadow: isSelected ? '0 4px 14px rgba(14, 170, 153, 0.35)' : 'none',
                        }}
                      >
                        <span>{slot}</span>
                        <span style={{ fontSize: 9.5, opacity: 0.8, textTransform: 'uppercase' }}>
                          {isAvailable ? (isSelected ? 'Selected' : 'Available') : 'Booked'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Consultation Details */}
              <div className="dr-patient-card">
                {/* Modality */}
                <div style={{ marginBottom: 18 }}>
                  <span className="patient-label" style={{ display: 'block', marginBottom: 8 }}>
                    CONSULTATION MODALITY
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {(['in-person', 'tele-consultation']).map((mode) => {
                      const available = !selectedDoctor || selectedDoctor.modes.includes(mode);
                      return (
                        <button
                          key={mode}
                          type="button"
                          disabled={!available}
                          onClick={() => available && setAppointmentType(mode)}
                          style={{
                            padding: 12, borderRadius: 12,
                            background: appointmentType === mode ? 'rgba(14, 44, 41, 0.9)' : 'rgba(6, 24, 33, 0.6)',
                            border: appointmentType === mode ? '2px solid #0eaa99' : '1px solid rgba(115, 231, 214, 0.14)',
                            color: available ? '#f0fdfa' : '#4a6b6b',
                            display: 'flex', alignItems: 'center', gap: 10,
                            cursor: available ? 'pointer' : 'not-allowed',
                            textAlign: 'left', transition: 'all 0.2s ease',
                            opacity: available ? 1 : 0.45,
                          }}
                        >
                          {mode === 'in-person' ? <MapPin size={18} color="#22d3ee" /> : <Video size={18} color="#38bdf8" />}
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 800 }}>
                              {mode === 'in-person' ? 'In-Person Visit' : 'Tele-Ophthalmology'}
                            </div>
                            <div style={{ fontSize: 11, color: '#72a8a1' }}>
                              {mode === 'in-person' ? 'Hospital Eye Clinic' : 'HD Video Call'}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Reason */}
                <div style={{ marginBottom: 16 }}>
                  <label htmlFor="reason-input" className="patient-label" style={{ display: 'block', marginBottom: 6 }}>
                    REASON FOR CONSULTATION *
                  </label>
                  <input
                    id="reason-input"
                    type="text"
                    className="dr-patient-search"
                    style={{ paddingLeft: 16 }}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Follow-up review after DRISHTI AI screening"
                    required
                  />
                </div>

                {/* Notes */}
                <div style={{ marginBottom: 22 }}>
                  <label htmlFor="notes-input" className="patient-label" style={{ display: 'block', marginBottom: 6 }}>
                    ADDITIONAL NOTES / SYMPTOMS <span style={{ color: '#648c86', fontWeight: 500 }}>(OPTIONAL)</span>
                  </label>
                  <textarea
                    id="notes-input"
                    className="dr-patient-search"
                    style={{ padding: '12px 16px', minHeight: 80, resize: 'vertical' }}
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any symptoms, visual blurring, floaters, or relevant medical history…"
                  />
                </div>

                {/* Fee summary */}
                {selectedDoctor?.fee && (
                  <div
                    style={{
                      padding: '12px 16px',
                      borderRadius: 12,
                      background: 'rgba(14, 170, 153, 0.08)',
                      border: '1px solid rgba(14, 170, 153, 0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      marginBottom: 18,
                    }}
                  >
                    <span style={{ fontSize: 13, color: '#91b4af', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <IndianRupee size={14} color="#0eaa99" /> Consultation Fee
                    </span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: '#0eaa99' }}>
                      ₹{selectedDoctor.fee.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="dr-primary-btn"
                  style={{ width: '100%', minHeight: 48, fontSize: 14, justifyContent: 'center' }}
                >
                  <CheckCircle2 size={18} />
                  {isSubmitting ? 'Confirming Appointment…' : 'Confirm Clinical Appointment'}
                  {!isSubmitting && <ArrowRight size={16} />}
                </button>
              </div>
            </div>
          </div>
        </form>

        <p className="dr-disclaimer" style={{ marginTop: 28 }}>
          DRISHTI AI provides automated retinal decision support and appointment scheduling.
          Consultations are performed by certified medical ophthalmologists. Your data is
          private and only accessible to you.
        </p>
      </div>
    </PageWrapper>
  );
}
