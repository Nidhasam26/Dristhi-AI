import { useMemo, useState } from 'react';
import { usePatients } from '../context/PatientContext.jsx';
import { useAppointments } from '../context/AppointmentContext.jsx';
import { useSync } from '../context/SyncContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import {
  BarChart2,
  Users,
  Eye,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  MapPin,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { DR_GRADES } from '../utils/drClassification.js';

export default function DistrictAnalytics() {
  const { user } = useAuth();
  const { patients, scans } = usePatients();
  const { appointments } = useAppointments();
  const { pendingCount } = useSync();

  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');

  // Available districts from real patient records
  const districts = useMemo(() => {
    const set = new Set();
    patients.forEach((p) => {
      if (p.district) set.add(p.district);
    });
    return Array.from(set);
  }, [patients]);

  // Filtered scans based on real geographic and severity criteria
  const filteredScans = useMemo(() => {
    return scans.filter((s) => {
      const patient = patients.find((p) => p.id === s.patient_id);
      if (selectedDistrict !== 'ALL' && patient?.district !== selectedDistrict) {
        return false;
      }
      if (selectedSeverity !== 'ALL' && String(s.ai_result?.grade) !== selectedSeverity) {
        return false;
      }
      return true;
    });
  }, [scans, patients, selectedDistrict, selectedSeverity]);

  // Aggregated clinical metrics derived strictly from stored data
  const totalScreenings = filteredScans.length;
  const gradeCounts = useMemo(() => {
    const counts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    filteredScans.forEach((s) => {
      const g = s.ai_result?.grade ?? 0;
      counts[g] = (counts[g] || 0) + 1;
    });
    return counts;
  }, [filteredScans]);

  const highRiskCount = (gradeCounts[2] || 0) + (gradeCounts[3] || 0) + (gradeCounts[4] || 0);
  const reviewedCount = filteredScans.filter((s) => s.reviewed_by).length;

  const villageDistribution = useMemo(() => {
    const map = {};
    filteredScans.forEach((s) => {
      const patient = patients.find((p) => p.id === s.patient_id);
      const v = patient?.village || 'Unassigned';
      map[v] = (map[v] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredScans, patients]);

  const appointmentsCount = appointments.length;
  const completedAppointments = appointments.filter((a) => a.status === 'completed').length;

  return (
    <PageWrapper>
      <div className="dr-patient-screen" style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div className="dr-eyebrow">
              <span className="dr-live-dot" /> DISTRICT EPIDEMIOLOGICAL SURVEILLANCE
            </div>
            <h1 style={{ fontSize: 'clamp(26px, 3.2vw, 34px)', fontWeight: 800, margin: 0, color: '#f0fdfa' }}>
              District Health Analytics
            </h1>
            <p style={{ color: '#91b4af', fontSize: 14, margin: '4px 0 0 0' }}>
              Aggregated population screening indicators for {user?.district || 'Yavatmal District'} · De-identified clinical telemetry
            </p>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(5, 24, 31, 0.8)', padding: '6px 12px', borderRadius: 10, border: '1px solid rgba(34, 211, 238, 0.2)' }}>
              <MapPin size={14} color="#38bdf8" />
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 13, outline: 'none', cursor: 'pointer' }}
              >
                <option value="ALL" style={{ background: '#071f2c' }}>All Districts</option>
                {districts.map((d) => (
                  <option key={d} value={d} style={{ background: '#071f2c' }}>{d}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(5, 24, 31, 0.8)', padding: '6px 12px', borderRadius: 10, border: '1px solid rgba(34, 211, 238, 0.2)' }}>
              <Filter size={14} color="#38bdf8" />
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 13, outline: 'none', cursor: 'pointer' }}
              >
                <option value="ALL" style={{ background: '#071f2c' }}>All DR Grades</option>
                <option value="0" style={{ background: '#071f2c' }}>Grade 0 (No DR)</option>
                <option value="1" style={{ background: '#071f2c' }}>Grade 1 (Mild)</option>
                <option value="2" style={{ background: '#071f2c' }}>Grade 2 (Moderate)</option>
                <option value="3" style={{ background: '#071f2c' }}>Grade 3 (Severe)</option>
                <option value="4" style={{ background: '#071f2c' }}>Grade 4 (PDR)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Primary Metric Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
          <div className="dr-stat dr-stat-teal">
            <div className="dr-stat-icon"><Eye size={20} /></div>
            <div>
              <strong>{totalScreenings}</strong>
              <span>Total Screenings</span>
            </div>
          </div>

          <div className="dr-stat dr-stat-amber">
            <div className="dr-stat-icon"><AlertTriangle size={20} /></div>
            <div>
              <strong>{highRiskCount}</strong>
              <span>High-Risk DR (Gr 2-4)</span>
            </div>
          </div>

          <div className="dr-stat dr-stat-green">
            <div className="dr-stat-icon"><CheckCircle2 size={20} /></div>
            <div>
              <strong>{reviewedCount}</strong>
              <span>Physician Confirmed</span>
            </div>
          </div>

          <div className="dr-stat dr-stat-purple">
            <div className="dr-stat-icon"><Calendar size={20} /></div>
            <div>
              <strong>{completedAppointments} / {appointmentsCount}</strong>
              <span>Referral Completion</span>
            </div>
          </div>
        </div>

        {/* Grade Breakdown & Village Distribution */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20, marginBottom: 24 }}>
          {/* DR Severity Distribution */}
          <div className="dr-panel">
            <div className="dr-panel-head">
              <div>
                <span className="dr-eyebrow">DIAGNOSTIC EPIDEMIOLOGY</span>
                <h3>Retinopathy Grade Distribution</h3>
              </div>
              <BarChart2 size={20} color="#38bdf8" />
            </div>

            <div className="dr-bars" style={{ marginTop: 16 }}>
              {[0, 1, 2, 3, 4].map((g) => {
                const count = gradeCounts[g] || 0;
                const pct = totalScreenings ? Math.round((count / totalScreenings) * 100) : 0;
                const info = DR_GRADES[g];
                return (
                  <div className="dr-bar-row" key={g}>
                    <span>G{g} · {info.label}</span>
                    <div>
                      <i style={{ width: `${Math.max(4, pct)}%`, background: info.color }} />
                    </div>
                    <b style={{ minWidth: 60, textAlign: 'right' }}>
                      {count} ({pct}%)
                    </b>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Screening Volume by Village */}
          <div className="dr-panel">
            <div className="dr-panel-head">
              <div>
                <span className="dr-eyebrow">GEOGRAPHIC COVERAGE</span>
                <h3>Screenings by Village / PHC</h3>
              </div>
              <MapPin size={20} color="#38bdf8" />
            </div>

            {villageDistribution.length === 0 ? (
              <p style={{ color: '#91b4af', fontSize: 13, textAlign: 'center', margin: '40px 0' }}>
                No geographic distribution records found for this filter.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                {villageDistribution.slice(0, 6).map(([village, count]) => {
                  const pct = totalScreenings ? Math.round((count / totalScreenings) * 100) : 0;
                  return (
                    <div
                      key={village}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: 10,
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                      }}
                    >
                      <span style={{ fontWeight: 600, color: '#f0fdfa', fontSize: 13 }}>{village}</span>
                      <span style={{ color: '#38bdf8', fontWeight: 700, fontSize: 13 }}>
                        {count} screenings ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sync & Privacy Notice */}
        <div
          style={{
            padding: 16,
            borderRadius: 12,
            background: 'rgba(14, 116, 144, 0.12)',
            border: '1px solid rgba(34, 211, 238, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 12,
            color: '#cbd5e1',
          }}
        >
          <ShieldCheck size={20} color="#38bdf8" style={{ flexShrink: 0 }} />
          <span>
            <strong>Health Worker Privacy & Data Protection:</strong> All analytics are calculated using direct, anonymized counts from local database records. Individual patient names, contact numbers, and identifiers are excluded from this epidemiological view.
          </span>
        </div>
      </div>
    </PageWrapper>
  );
}
