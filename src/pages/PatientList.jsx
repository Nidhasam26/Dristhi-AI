import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePatients } from '../context/PatientContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import PatientCard from '../components/patient/PatientCard.jsx';
import Modal from '../components/ui/Modal.jsx';
import PatientForm from '../components/patient/PatientForm.jsx';
import DeletePatientModal from '../components/patient/DeletePatientModal.jsx';
import { Search, UserPlus, Users, Sparkles } from 'lucide-react';

const GRADE_FILTERS = [
  { label: 'All Patients', value: null },
  { label: 'High Risk (Gr 2-4)', value: 'high' },
  { label: 'No DR (0)', value: 0 },
  { label: 'Mild (1)', value: 1 },
  { label: 'Moderate (2)', value: 2 },
  { label: 'Severe (3)', value: 3 },
  { label: 'PDR (4)', value: 4 },
  { label: 'Unscanned', value: -1 },
];

export default function PatientList() {
  const { user } = useAuth();
  const { patients, scans, addPatient, deletePatient, getPatientScans } = usePatients();

  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const getLatestScan = (patientId) => {
    const ps = getPatientScans(patientId);
    return ps.length > 0 ? ps[0] : null;
  };

  const filtered = patients.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.village.toLowerCase().includes(q) ||
      p.district.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q);

    if (!matchSearch) return false;

    const latest = getLatestScan(p.id);

    if (gradeFilter === null) return true;
    if (gradeFilter === 'high') return latest && latest.ai_result.grade >= 2;
    if (gradeFilter === -1) return !latest;
    return latest?.ai_result.grade === gradeFilter;
  });

  const handleAddPatient = async (formData) => {
    setSaving(true);
    await addPatient({
      ...formData,
      id: `pat_${Date.now()}`,
      created_by: user.id,
      created_at: new Date().toISOString().slice(0, 10),
    });
    setSaving(false);
    setShowAddModal(false);
    setToastMessage('✓ Patient registered successfully');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleDeletePatient = async (patientId) => {
    await deletePatient(patientId);
    setPatientToDelete(null);
    setToastMessage('✓ Patient and associated scan records deleted successfully');
    setTimeout(() => setToastMessage(''), 3500);
  };

  return (
    <PageWrapper>
      <div className="dr-patient-screen">
        {/* Toast banner */}
        {toastMessage && (
          <div
            className="animate-slide-up"
            style={{
              position: 'fixed',
              top: 24,
              right: 24,
              zIndex: 9999,
              padding: '12px 20px',
              borderRadius: 14,
              background: 'linear-gradient(135deg, #059669, #10b981)',
              color: 'white',
              fontWeight: 700,
              fontSize: 13,
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            {toastMessage}
          </div>
        )}

        {/* Header */}
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
          <div>
            <div className="dr-eyebrow" style={{ marginBottom: 6 }}>
              <span className="dr-live-dot" /> CLINICAL REGISTRY · {user?.district || 'YAVATMAL'}
            </div>
            <h1 style={{ fontSize: 'clamp(28px, 3.5vw, 36px)', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
              Patient Directory
            </h1>
            <p style={{ color: '#91b4af', fontSize: 14, marginTop: 4, margin: 0 }}>
              {patients.length} registered patient medical records in {user?.district || 'Yavatmal'} registry
            </p>
          </div>

          <button
            type="button"
            className="dr-primary-btn"
            onClick={() => setShowAddModal(true)}
            style={{ padding: '12px 22px', fontSize: 13.5 }}
          >
            <UserPlus size={17} /> Register Patient
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <Search
              size={17}
              aria-hidden="true"
              style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: '#648c86' }}
            />
            <input
              type="search"
              className="dr-patient-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, ID (e.g. pat_001), village..."
              aria-label="Search patients"
            />
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }} role="group" aria-label="Filter by DR grade">
            {GRADE_FILTERS.map((f) => {
              const active = gradeFilter === f.value;
              return (
                <button
                  key={f.label}
                  type="button"
                  onClick={() => setGradeFilter(f.value)}
                  className={`dr-filter-pill ${active ? 'active' : ''}`}
                  aria-pressed={active}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Patient Grid */}
        {filtered.length === 0 ? (
          <div
            style={{
              padding: '60px 30px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 14,
              background: 'rgba(11, 36, 34, 0.4)',
              border: '1px solid rgba(115, 231, 214, 0.1)',
              borderRadius: 20,
              color: '#91b4af',
            }}
          >
            <Users size={48} color="#22d3ee" style={{ opacity: 0.6 }} aria-hidden="true" />
            <h3 style={{ color: '#f0fdfa', fontSize: 18, margin: 0 }}>No patients found</h3>
            <p style={{ margin: 0, maxWidth: 450, fontSize: 13.5 }}>
              {search || gradeFilter !== null
                ? 'Try adjusting your search query or filter tags.'
                : 'Register your first patient to begin screening.'}
            </p>
            {!search && gradeFilter === null && (
              <button
                type="button"
                className="dr-primary-btn"
                onClick={() => setShowAddModal(true)}
                style={{ marginTop: 8 }}
              >
                <UserPlus size={16} /> Register First Patient
              </button>
            )}
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
              gap: 20,
            }}
          >
            {filtered.map((p) => (
              <PatientCard
                key={p.id}
                patient={p}
                latestScan={getLatestScan(p.id)}
                onDeleteClick={(pat) => setPatientToDelete(pat)}
              />
            ))}
          </div>
        )}

        {/* Register Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Register New Patient"
          size="lg"
        >
          <PatientForm onSubmit={handleAddPatient} onCancel={() => setShowAddModal(false)} loading={saving} />
        </Modal>

        {/* Verified Delete Patient Modal */}
        <DeletePatientModal
          isOpen={!!patientToDelete}
          patient={patientToDelete}
          onClose={() => setPatientToDelete(null)}
          onDeleteSuccess={handleDeletePatient}
        />
      </div>
    </PageWrapper>
  );
}
