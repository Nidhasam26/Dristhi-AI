import { RefreshCw, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function SyncStatusBadge({ status, showLabel = true, size = 'sm' }) {
  const normalized = status || 'synced';

  const configs = {
    synced: {
      icon: CheckCircle2,
      label: 'Synced',
      bg: 'rgba(34, 197, 94, 0.12)',
      color: '#4ade80',
      border: '1px solid rgba(74, 222, 128, 0.25)',
    },
    pending_sync: {
      icon: Clock,
      label: 'Pending Sync',
      bg: 'rgba(234, 179, 8, 0.12)',
      color: '#facc15',
      border: '1px solid rgba(250, 204, 21, 0.3)',
    },
    syncing: {
      icon: RefreshCw,
      label: 'Syncing...',
      bg: 'rgba(56, 189, 248, 0.15)',
      color: '#38bdf8',
      border: '1px solid rgba(56, 189, 248, 0.35)',
      spin: true,
    },
    failed: {
      icon: AlertCircle,
      label: 'Sync Failed',
      bg: 'rgba(239, 68, 68, 0.15)',
      color: '#f87171',
      border: '1px solid rgba(248, 113, 113, 0.35)',
    },
  };

  const cfg = configs[normalized] || configs.synced;
  const Icon = cfg.icon;
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: size === 'sm' ? '2px 8px' : '4px 10px',
        borderRadius: 9999,
        background: cfg.bg,
        color: cfg.color,
        border: cfg.border,
        fontSize: size === 'sm' ? 11 : 12,
        fontWeight: 600,
        letterSpacing: '0.02em',
      }}
      title={`Record synchronization status: ${cfg.label}`}
    >
      <Icon
        size={iconSize}
        style={{
          animation: cfg.spin ? 'spin 1.5s linear infinite' : 'none',
        }}
      />
      {showLabel && cfg.label}
    </span>
  );
}
