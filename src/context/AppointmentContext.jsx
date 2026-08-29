import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getDB, generateClientId } from '../data/db.js';
import { DEMO_DOCTORS } from '../data/seedData.js';
import { syncEngine } from '../services/syncEngine.js';
import { useAuth } from './AuthContext.jsx';

const AppointmentContext = createContext(null);

export function AppointmentProvider({ children }) {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctors] = useState(DEMO_DOCTORS);
  const [loading, setLoading] = useState(true);

  /**
   * Load appointments from IndexedDB filtered by ownership.
   * - admin: sees all appointments in the system
   * - patient/user: sees only appointments where ownerUserId === user.id
   */
  const loadAppointments = useCallback(async () => {
    if (!user) {
      setAppointments([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const db = await getDB();
      let all = await db.getAll('appointments');

      // Apply ownership filter — admin sees everything
      if (user.role !== 'admin') {
        all = all.filter((a) => a.ownerUserId === user.id);
      }

      // Sort newest first
      all.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
      setAppointments(all);
    } catch (err) {
      console.error('Failed to load appointments from IndexedDB', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.role]);

  useEffect(() => {
    setAppointments([]);
    loadAppointments();
  }, [loadAppointments]);

  /**
   * Check if a specific time slot is available for a doctor on a given date.
   * Excludes cancelled appointments.
   */
  const isSlotAvailable = useCallback(
    (doctorId, date, time, excludeId = null) => {
      return !appointments.some((apt) => {
        if (excludeId && apt.id === excludeId) return false;
        if (apt.status === 'cancelled') return false;
        return apt.doctorId === doctorId && apt.date === date && apt.time === time;
      });
    },
    [appointments]
  );

  /**
   * Add a new appointment record.
   * SECURITY: ownerUserId is ALWAYS set from the authenticated session.
   */
  const addAppointment = async (data) => {
    if (!user) throw new Error('Must be authenticated to book an appointment.');
    const db = await getDB();
    const id = data.id || generateClientId('apt');
    const newAppointment = {
      id,
      // ── ownership ──
      ownerUserId: user.id,
      // ── patient info ──
      patientId: data.patientId,
      patientName: data.patientName,
      patientPhone: data.patientPhone || '',
      patientVillage: data.patientVillage || '',
      patientDistrict: data.patientDistrict || '',
      // ── doctor info ──
      doctorId: data.doctorId,
      doctorName: data.doctorName,
      doctorRole: data.doctorRole || 'Ophthalmologist',
      doctorHospital: data.doctorHospital || 'Regional Eye Center',
      doctorFee: data.doctorFee ?? null,
      // ── scan linkage ──
      scanId: data.scanId || null,
      scanGrade: data.scanGrade ?? null,
      scanGradeLabel: data.scanGradeLabel || null,
      // ── schedule ──
      date: data.date,
      time: data.time,
      type: data.type || 'in-person',
      reason: data.reason || 'Clinical follow-up review',
      status: 'confirmed',
      notes: data.notes || '',
      sync_status: 'pending_sync',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.put('appointments', newAppointment);
    setAppointments((prev) => [newAppointment, ...prev]);

    // Enqueue operation into sync queue
    await syncEngine.enqueueOperation({
      operationType: 'CREATE_APPOINTMENT',
      entityType: 'appointment',
      entityId: newAppointment.id,
      payload: newAppointment,
    });

    return newAppointment;
  };

  /**
   * Update appointment fields (status, notes, etc.)
   */
  const updateAppointment = async (appointmentId, updates) => {
    const db = await getDB();
    const existing = await db.get('appointments', appointmentId);
    if (!existing) return null;

    if (user?.role !== 'admin' && existing.ownerUserId !== user?.id) {
      console.warn('Unauthorized appointment update attempt blocked.');
      return null;
    }

    const updated = {
      ...existing,
      ...updates,
      sync_status: 'pending_sync',
      updatedAt: new Date().toISOString(),
    };

    await db.put('appointments', updated);
    setAppointments((prev) => prev.map((a) => (a.id === appointmentId ? updated : a)));

    await syncEngine.enqueueOperation({
      operationType: 'UPDATE_APPOINTMENT',
      entityType: 'appointment',
      entityId: appointmentId,
      payload: updated,
    });

    return updated;
  };

  /**
   * Cancel an appointment with an optional cancellation reason.
   */
  const cancelAppointment = async (appointmentId, cancelReason = '') => {
    return updateAppointment(appointmentId, {
      status: 'cancelled',
      cancellationReason: cancelReason,
      cancelledAt: new Date().toISOString(),
    });
  };

  const getAppointmentById = useCallback(
    (id) => {
      return appointments.find((a) => a.id === id) || null;
    },
    [appointments]
  );

  const getAppointmentsForCurrentUser = useCallback(() => {
    return appointments;
  }, [appointments]);

  const getAppointmentsForPatient = useCallback(
    (patientId) => {
      return appointments.filter((a) => a.patientId === patientId);
    },
    [appointments]
  );

  const getAppointmentsForDoctor = useCallback(
    (doctorId) => {
      return appointments.filter((a) => a.doctorId === doctorId);
    },
    [appointments]
  );

  const getAppointmentForScan = useCallback(
    (scanId) => {
      if (!scanId) return null;
      return appointments.find((a) => a.scanId === scanId && a.status !== 'cancelled') || null;
    },
    [appointments]
  );

  const getDoctorById = useCallback(
    (doctorId) => {
      return doctors.find((d) => d.id === doctorId) || null;
    },
    [doctors]
  );

  return (
    <AppointmentContext.Provider
      value={{
        appointments,
        doctors,
        loading,
        addAppointment,
        updateAppointment,
        cancelAppointment,
        isSlotAvailable,
        getAppointmentById,
        getAppointmentsForCurrentUser,
        getAppointmentsForPatient,
        getAppointmentsForDoctor,
        getAppointmentForScan,
        getDoctorById,
        reload: loadAppointments,
      }}
    >
      {children}
    </AppointmentContext.Provider>
  );
}

export function useAppointments() {
  const ctx = useContext(AppointmentContext);
  if (!ctx) throw new Error('useAppointments must be used within AppointmentProvider');
  return ctx;
}
