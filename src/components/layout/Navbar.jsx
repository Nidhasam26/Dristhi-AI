import { Menu, Wifi, WifiOff, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useConnectivity } from '../../context/ConnectivityContext.jsx';
import { useSync } from '../../context/SyncContext.jsx';
import OfflineSessionBadge from '../ui/OfflineSessionBadge.jsx';

export default function Navbar({ onToggleSidebar, isMobile = false, collapsed = false }) {
  const { isOnline, isSlow } = useConnectivity();
  const { pendingCount, status, isProcessing, triggerSync } = useSync();

  const leftOffset = isMobile
    ? 0
    : collapsed
    ? 'var(--sidebar-collapsed, 68px)'
    : 'var(--sidebar-width, 260px)';

  return (
    <header
      className="dr-navbar"
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        left: leftOffset,
        height: 'var(--navbar-height, 64px)',
        background: 'rgba(5, 24, 31, 0.94)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(34, 211, 238, 0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '0 16px' : '0 var(--space-8, 32px)',
        zIndex: 'var(--z-sticky, 40)',
        transition: 'left 0.3s ease, padding 0.3s ease',
      }}
    >
      <button
        className="btn btn-ghost btn-icon"
        onClick={onToggleSidebar}
        aria-label="Toggle navigation sidebar"
        style={{
          width: 42,
          height: 42,
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <Menu size={22} aria-hidden="true" color="#e8fffc" />
      </button>

      {/* Connectivity & Sync status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3, 12px)' }}>
        <OfflineSessionBadge />

        {!isOnline ? (
          <div
            className="animate-slide-up"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2, 8px)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full, 9999px)',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              fontSize: 'var(--text-xs, 12px)',
              fontWeight: 600,
            }}
            role="status"
            aria-live="polite"
          >
            <WifiOff size={14} aria-hidden="true" />
            {pendingCount > 0
              ? `Offline — ${pendingCount} saved locally`
              : 'Offline — local storage active'}
          </div>
        ) : isSlow ? (
          <div
            className="animate-fade-in"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2, 8px)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full, 9999px)',
              background: 'rgba(234, 179, 8, 0.15)',
              color: '#facc15',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              fontSize: 'var(--text-xs, 12px)',
              fontWeight: 600,
            }}
            role="status"
            aria-live="polite"
          >
            <AlertTriangle size={14} aria-hidden="true" />
            Slow Connection
          </div>
        ) : isProcessing || status === 'SYNCING' ? (
          <div
            className="animate-fade-in"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2, 8px)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full, 9999px)',
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              fontSize: 'var(--text-xs, 12px)',
              fontWeight: 600,
            }}
            role="status"
            aria-live="polite"
          >
            <RefreshCw size={14} className="spinner-ai" aria-hidden="true" />
            Syncing {pendingCount} item{pendingCount > 1 ? 's' : ''}...
          </div>
        ) : pendingCount > 0 ? (
          <button
            onClick={triggerSync}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2, 8px)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full, 9999px)',
              background: 'rgba(14, 116, 144, 0.25)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              fontSize: 'var(--text-xs, 12px)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            title="Click to trigger manual synchronization"
          >
            <RefreshCw size={13} />
            {pendingCount} record{pendingCount > 1 ? 's' : ''} waiting to sync
          </button>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2, 8px)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full, 9999px)',
              background: 'rgba(34, 197, 94, 0.12)',
              color: '#4ade80',
              border: '1px solid rgba(74, 222, 128, 0.25)',
              fontSize: 'var(--text-xs, 12px)',
              fontWeight: 600,
            }}
            title="All records synchronized with central server"
          >
            <CheckCircle2 size={14} aria-hidden="true" />
            All data synced
          </div>
        )}
      </div>
    </header>
  );
}
