import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getDB, generateClientId } from '../data/db.js';
import { syncEngine } from '../services/syncEngine.js';
import { useAuth } from './AuthContext.jsx';

const PatientContext = createContext(null);

export function PatientProvider({ children }) {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [scans, setScans] = useState([]);

  /**
   * Load patients and scans from IndexedDB with role-based ownership filtering.
   */
  const loadAll = useCallback(async () => {
    if (!user) {
      setPatients([]);
      setScans([]);
      return;
    }
    const db = await getDB();
    let p = await db.getAll('patients');
    let s = await db.getAll('scans');

    if (user.role === 'patient') {
      p = p.filter((pat) => pat.userId === user.id || pat.id === user.id);
      s = s.filter((scan) => scan.ownerUserId === user.id);
    }

    setPatients(p);
    setScans(s);
  }, [user?.id, user?.role]);

  useEffect(() => {
    setPatients([]);
    setScans([]);
    loadAll();
  }, [loadAll]);

  const addPatient = async (patientData) => {
    const db = await getDB();
    const id = patientData.id || generateClientId('pat');
    const patient = {
      ...patientData,
      id,
      sync_status: patientData.sync_status || 'pending_sync',
      created_at: patientData.created_at || new Date().toISOString().slice(0, 10),
      updated_at: new Date().toISOString(),
    };

    await db.put('patients', patient);

    setPatients((prev) => {
      const idx = prev.findIndex((p) => p.id === patient.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = patient;
        return next;
      }
      return [...prev, patient];
    });

    // Enqueue operation into sync queue
    await syncEngine.enqueueOperation({
      operationType: 'CREATE_PATIENT',
      entityType: 'patient',
      entityId: patient.id,
      payload: patient,
    });

    return patient;
  };

  const updatePatient = async (patientId, updates) => {
    const db = await getDB();
    const existing = await db.get('patients', patientId);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...updates,
      sync_status: 'pending_sync',
      updated_at: new Date().toISOString(),
    };

    await db.put('patients', updated);
    setPatients((prev) => prev.map((p) => (p.id === patientId ? updated : p)));

    await syncEngine.enqueueOperation({
      operationType: 'UPDATE_PATIENT',
      entityType: 'patient',
      entityId: patientId,
      payload: updated,
    });

    return updated;
  };

  const deletePatient = async (patientId) => {
    const db = await getDB();
    await db.delete('patients', patientId);

    const allScans = await db.getAll('scans');
    const patientScans = allScans.filter((s) => s.patient_id === patientId);
    for (const scan of patientScans) {
      await db.delete('scans', scan.id);
      await syncEngine.enqueueOperation({
        operationType: 'DELETE_SCAN',
        entityType: 'scan',
        entityId: scan.id,
        payload: { id: scan.id },
      });
    }

    setPatients((prev) => prev.filter((p) => p.id !== patientId));
    setScans((prev) => prev.filter((s) => s.patient_id !== patientId));

    await syncEngine.enqueueOperation({
      operationType: 'DELETE_PATIENT',
      entityType: 'patient',
      entityId: patientId,
      payload: { id: patientId },
    });

    return true;
  };

  const addScan = async (scanData) => {
    const id = scanData.id || generateClientId('scn');
    const ownedScan = {
      ...scanData,
      id,
      ownerUserId: scanData.ownerUserId || user?.id,
      sync_status: scanData.sync_status || 'pending_sync',
      scan_date: scanData.scan_date || new Date().toISOString().slice(0, 10),
      created_at: scanData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const db = await getDB();
    await db.put('scans', ownedScan);

    setScans((prev) => {
      const idx = prev.findIndex((s) => s.id === ownedScan.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = ownedScan;
        return next;
      }
      return [...prev, ownedScan];
    });

    await syncEngine.enqueueOperation({
      operationType: 'CREATE_SCAN',
      entityType: 'scan',
      entityId: ownedScan.id,
      payload: ownedScan,
    });

    return ownedScan;
  };

  const updateScan = async (scanId, updates) => {
    const db = await getDB();
    const existing = await db.get('scans', scanId);
    if (!existing) return null;

    if (user?.role === 'patient' && existing.ownerUserId !== user.id) {
      console.warn('Unauthorized scan update attempt blocked.');
      return null;
    }

    const updated = {
      ...existing,
      ...updates,
      sync_status: 'pending_sync',
      updated_at: new Date().toISOString(),
    };

    await db.put('scans', updated);
    setScans((prev) => prev.map((s) => (s.id === scanId ? updated : s)));

    await syncEngine.enqueueOperation({
      operationType: 'UPDATE_SCAN',
      entityType: 'scan',
      entityId: scanId,
      payload: updated,
    });

    return updated;
  };

  const getPatientScans = (patientId) =>
    scans
      .filter((s) => s.patient_id === patientId)
      .sort((a, b) => new Date(b.scan_date) - new Date(a.scan_date));

  const getScanById = (scanId) => {
    const scan = scans.find((s) => s.id === scanId) ?? null;
    return scan;
  };

  const getPatientById = (patientId) => patients.find((p) => p.id === patientId) ?? null;

  return (
    <PatientContext.Provider
      value={{
        patients,
        scans,
        addPatient,
        updatePatient,
        deletePatient,
        addScan,
        updateScan,
        getPatientScans,
        getScanById,
        getPatientById,
        reload: loadAll,
      }}
    >
      {children}
    </PatientContext.Provider>
  );
}

export function usePatients() {
  const ctx = useContext(PatientContext);
  if (!ctx) throw new Error('usePatients must be used within PatientProvider');
  return ctx;
}
