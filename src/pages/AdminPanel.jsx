import { usePatients } from '../context/PatientContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import { Users, Activity, Eye, Download, CheckCircle2 } from 'lucide-react';
import CountUp from '../components/ui/CountUp.jsx';

const ROLE_LABELS = { patient: 'Patient', user: 'Field Screener', admin: 'Administrator' };

export default function AdminPanel() {
  const { patients, scans } = usePatients();
  const { getRegisteredUsers } = useAuth();

  const registeredUsers = getRegisteredUsers();

  // Aggregate stats
  const totalScans = scans.length;
  const patientsCount = patients.length;
  const grade2Plus = scans.filter((s) => s.ai_result?.grade >= 2).length;

  const nonAdminUsers = registeredUsers.filter((u) => u.role !== 'admin');

  return (
    <PageWrapper>
      <div className="dr-admin-screen">
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
              <span className="dr-live-dot" /> SYSTEM ADMINISTRATION · WORKSTATION
            </div>
            <h1 style={{ fontSize: 'clamp(28px, 3.5vw, 36px)', fontWeight: 800, letterSpacing: '-0.02em', margin: 0, color: '#f0fdfa' }}>
              Admin Panel
            </h1>
            <p style={{ color: '#91b4af', fontSize: 14, marginTop: 4, margin: 0 }}>
              System overview, audit metrics, and user account management
            </p>
          </div>

          <button
            type="button"
            className="dr-secondary-btn"
            disabled
            title="Export feature available in production"
            style={{
              background: 'rgba(11, 36, 34, 0.7)',
              color: '#91b4af',
              borderColor: 'rgba(115, 231, 214, 0.2)',
              opacity: 0.7,
              cursor: 'not-allowed',
            }}
          >
            <Download size={16} /> Export District Report
          </button>
        </div>

        {/* Aggregate KPI Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 18,
            marginBottom: 26,
          }}
        >
          <div className="dr-patient-card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 22px' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: 'rgba(34, 211, 238, 0.12)',
                border: '1px solid rgba(34, 211, 238, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#22d3ee',
              }}
            >
              <Activity size={22} />
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#f0fdfa', fontFamily: 'var(--font-heading)' }}>
                <CountUp end={totalScans} />
              </div>
              <div className="patient-label" style={{ marginTop: 2 }}>TOTAL SCANS</div>
            </div>
          </div>

          <div className="dr-patient-card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 22px' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fbbf24',
              }}
            >
              <Eye size={22} />
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#fbbf24', fontFamily: 'var(--font-heading)' }}>
                <CountUp end={grade2Plus} />
              </div>
              <div className="patient-label" style={{ marginTop: 2 }}>REFERRALS TRIGGERED</div>
            </div>
          </div>

          <div className="dr-patient-card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 22px' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34d399',
              }}
            >
              <Users size={22} />
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-heading)' }}>
                <CountUp end={registeredUsers.length} />
              </div>
              <div className="patient-label" style={{ marginTop: 2 }}>REGISTERED USERS</div>
            </div>
          </div>
        </div>

        {/* Stacked Layout: One after another */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* 1. Registered Users Card */}
          <div className="dr-patient-card" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#f0fdfa' }}>Registered Users</h2>
                <span style={{ fontSize: 12, color: '#91b4af', display: 'block', marginTop: 2 }}>
                  Active screener and patient accounts in registry
                </span>
              </div>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#22d3ee',
                background: 'rgba(34, 211, 238, 0.1)',
                padding: '4px 10px',
                borderRadius: 20,
                border: '1px solid rgba(34, 211, 238, 0.2)',
              }}>
                {nonAdminUsers.length} Accounts
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: 'transparent' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(115, 231, 214, 0.15)', background: 'rgba(6, 24, 23, 0.6)' }}>
                    <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, fontWeight: 700, color: '#72a8a1', textTransform: 'uppercase', letterSpacing: '0.08em' }}>NAME</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, fontWeight: 700, color: '#72a8a1', textTransform: 'uppercase', letterSpacing: '0.08em' }}>USERNAME</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, fontWeight: 700, color: '#72a8a1', textTransform: 'uppercase', letterSpacing: '0.08em' }}>ROLE</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, fontWeight: 700, color: '#72a8a1', textTransform: 'uppercase', letterSpacing: '0.08em' }}>DISTRICT</th>
                  </tr>
                </thead>
                <tbody>
                  {nonAdminUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '36px 12px', color: '#91b4af', fontSize: 13, background: 'transparent' }}>
                        No user accounts registered yet.
                      </td>
                    </tr>
                  ) : (
                    nonAdminUsers.map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid rgba(115, 231, 214, 0.08)', background: 'transparent' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: '#f0fdfa', fontSize: 13.5, background: 'transparent' }}>{u.name}</td>
                        <td style={{ padding: '14px 16px', background: 'transparent' }}>
                          <code style={{
                            fontSize: 12,
                            background: 'rgba(6, 24, 23, 0.8)',
                            color: '#22d3ee',
                            padding: '4px 10px',
                            borderRadius: 6,
                            border: '1px solid rgba(34, 211, 238, 0.2)',
                            fontFamily: 'monospace',
                          }}>
                            {u.username}
                          </code>
                        </td>
                        <td style={{ padding: '14px 16px', background: 'transparent' }}>
                          <span style={{
                            fontSize: 11.5,
                            fontWeight: 700,
                            padding: '4px 12px',
                            borderRadius: 20,
                            background: 'rgba(34, 211, 238, 0.12)',
                            color: '#67e8f9',
                            border: '1px solid rgba(34, 211, 238, 0.25)',
                          }}>
                            {ROLE_LABELS[u.role] || u.role}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 13.5, color: '#d1f2ec', background: 'transparent' }}>{u.district || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. System Health Card */}
          <div className="dr-patient-card" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#f0fdfa' }}>System Health & Infrastructure</h2>
                <span style={{ fontSize: 12, color: '#91b4af', display: 'block', marginTop: 2 }}>
                  Real-time status of AI inference pipelines and local database
                </span>
              </div>
              <div className="dr-eyebrow" style={{ color: '#34d399' }}>
                <span className="dr-live-dot" style={{ background: '#34d399' }} /> ALL SYSTEMS OPERATIONAL
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 18px',
                  background: 'rgba(6, 24, 23, 0.6)',
                  borderRadius: 14,
                  border: '1px solid rgba(115, 231, 214, 0.1)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#f0fdfa' }}>AI Model Inference Engine</div>
                  <div style={{ fontSize: 12, color: '#72a8a1', marginTop: 2 }}>drishti-v2.1-mobile · PyTorch / ONNX</div>
                </div>
                <span style={{
                  padding: '5px 12px',
                  borderRadius: 20,
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#34d399',
                  fontSize: 11.5,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}>
                  <CheckCircle2 size={13} /> Online
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 18px',
                  background: 'rgba(6, 24, 23, 0.6)',
                  borderRadius: 14,
                  border: '1px solid rgba(115, 231, 214, 0.1)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#f0fdfa' }}>Database & Encrypted Storage</div>
                  <div style={{ fontSize: 12, color: '#72a8a1', marginTop: 2 }}>Local IndexedDB · Offline resilient</div>
                </div>
                <span style={{
                  padding: '5px 12px',
                  borderRadius: 20,
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#34d399',
                  fontSize: 11.5,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}>
                  <CheckCircle2 size={13} /> Healthy
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 18px',
                  background: 'rgba(6, 24, 23, 0.6)',
                  borderRadius: 14,
                  border: '1px solid rgba(115, 231, 214, 0.1)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#f0fdfa' }}>Registered Patients in Store</div>
                  <div style={{ fontSize: 12, color: '#72a8a1', marginTop: 2 }}>IndexedDB encrypted patient directory</div>
                </div>
                <span style={{
                  padding: '5px 12px',
                  borderRadius: 20,
                  background: 'rgba(34, 211, 238, 0.15)',
                  border: '1px solid rgba(34, 211, 238, 0.3)',
                  color: '#22d3ee',
                  fontSize: 12,
                  fontWeight: 800,
                }}>
                  {patientsCount} records
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
