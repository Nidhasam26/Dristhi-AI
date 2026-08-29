import { getDRInfo } from '../../utils/drClassification.js';

export default function SeverityGauge({ grade }) {
  const currentInfo = getDRInfo(grade);

  const GRADES = [
    { g: 0, label: 'No DR', desc: 'Routine Annual' },
    { g: 1, label: 'Mild NPDR', desc: 'Monitor 6mo' },
    { g: 2, label: 'Moderate', desc: 'Refer 1mo' },
    { g: 3, label: 'Severe NPDR', desc: 'Urgent 1wk' },
    { g: 4, label: 'PDR', desc: 'Immediate' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {/* 5-Grade Segmented Grid */}
      <div className="dr-scale" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
        {GRADES.map(({ g, label, desc }) => {
          const info = getDRInfo(g);
          const isSelected = g === grade;
          return (
            <div
              key={g}
              className={`dr-scale-step ${isSelected ? 'active' : ''}`}
              style={{
                borderRadius: 10,
                padding: '10px 8px',
                textAlign: 'center',
                borderColor: isSelected ? info.color : 'rgba(255, 255, 255, 0.08)',
                background: isSelected ? `${info.color}25` : 'rgba(5, 24, 31, 0.85)',
                borderWidth: isSelected ? '2px' : '1px',
                borderStyle: 'solid',
                boxShadow: isSelected ? `0 0 14px ${info.color}40` : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: isSelected ? info.color : '#91B4AF',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                Grade {g}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? '#F0FDFA' : '#91B4AF',
                  marginTop: 2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontSize: '9px',
                  color: isSelected ? info.color : '#64748B',
                  fontWeight: 600,
                  marginTop: 2,
                }}
              >
                {desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Grade Status Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          borderRadius: 'var(--radius-lg)',
          background: `${currentInfo.color}15`,
          border: `1px solid ${currentInfo.color}40`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: currentInfo.color,
              display: 'inline-block',
              boxShadow: `0 0 8px ${currentInfo.color}`,
            }}
          />
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: '#F0FDFA', fontFamily: 'var(--font-heading)' }}>
            CURRENT: Grade {grade} — {currentInfo.fullLabel}
          </span>
        </div>
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: currentInfo.color }}>
          {currentInfo.urgencyLabel}
        </span>
      </div>
    </div>
  );
}
