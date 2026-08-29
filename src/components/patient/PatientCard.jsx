import { Link } from 'react-router-dom';
import { User, Trash2, ChevronRight, Droplets } from 'lucide-react';
import { DRBadge } from '../ui/Badge.jsx';
import SyncStatusBadge from '../ui/SyncStatusBadge.jsx';

export default function PatientCard({ patient, latestScan, onDeleteClick }) {
  const isHighRisk = latestScan?.ai_result?.grade >= 2;

  return (
    <div
      className="dr-patient-card animate-slide-up"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        border: isHighRisk ? '1.5px solid rgba(239, 68, 68, 0.45)' : '1px solid rgba(115, 231, 214, 0.14)',
        boxShadow: isHighRisk ? '0 10px 30px rgba(239, 68, 68, 0.12)' : '0 10px 30px rgba(0, 15, 14, 0.35)',
      }}
    >
      <div>
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(25, 195, 177, 0.12)',
                border: '1px solid rgba(97, 230, 214, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: '#22d3ee',
              }}
            >
              <User size={20} color="#22d3ee" aria-hidden="true" />
            </div>
            <div>
              <div className="patient-name">
                {patient.name}
              </div>
              <div className="patient-id" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>ID: {patient.id}</span>
                <SyncStatusBadge status={patient.sync_status} size="sm" />
              </div>
            </div>
          </div>

          {latestScan ? (
            <DRBadge grade={latestScan.ai_result.grade} />
          ) : (
            <span style={{
              fontSize: '10px',
              padding: '3px 9px',
              borderRadius: 20,
              background: 'rgba(115, 231, 214, 0.08)',
              color: '#72a8a1',
              fontWeight: 600,
              border: '1px solid rgba(115, 231, 214, 0.15)',
            }}>
              Unscanned
            </span>
          )}
        </div>

        {/* Demographics Details */}
        <div style={{
          marginTop: 18,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          padding: '12px 14px',
          borderRadius: 12,
          background: 'rgba(6, 24, 23, 0.5)',
          border: '1px solid rgba(115, 231, 214, 0.08)',
        }}>
          <div>
            <span className="patient-label">AGE / GENDER</span>
            <span className="patient-val" style={{ display: 'block', marginTop: 2, fontSize: 13 }}>
              {patient.age}y · {patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : patient.gender}
            </span>
          </div>
          <div>
            <span className="patient-label">VILLAGE</span>
            <span className="patient-val" style={{ display: 'block', marginTop: 2, fontSize: 13 }}>
              {patient.village}
            </span>
          </div>
        </div>

        {patient.hba1c && (
          <div style={{
            marginTop: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11.5,
            color: '#91b4af',
          }}>
            <Droplets size={13} color={patient.hba1c >= 8 ? '#f87171' : '#34d399'} />
            <span>HbA1c: <strong style={{ color: '#e8fffc' }}>{patient.hba1c}%</strong></span>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div
        style={{
          marginTop: 18,
          paddingTop: 14,
          borderTop: '1px solid rgba(115, 231, 214, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link
          to={`/patients/${patient.id}`}
          style={{
            fontSize: 12.5,
            fontWeight: 700,
            color: '#22d3ee',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            transition: 'gap 0.2s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#67e8f9'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#22d3ee'; }}
        >
          View Profile <ChevronRight size={15} />
        </Link>

        {onDeleteClick && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDeleteClick(patient); }}
            title={`Delete ${patient.name}`}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#648c86',
              padding: 6,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ef4444';
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#648c86';
              e.currentTarget.style.background = 'none';
            }}
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
