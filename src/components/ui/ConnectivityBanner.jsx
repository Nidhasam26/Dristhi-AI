import { useConnectivity } from '../../context/ConnectivityContext.jsx';
import { useSync } from '../../context/SyncContext.jsx';
import { WifiOff, AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function ConnectivityBanner() {
  const { state, isOnline, isSlow } = useConnectivity();
  const { pendingCount, status, triggerSync, isProcessing } = useSync();

  if (isOnline && !isSlow && pendingCount === 0 && status !== 'SYNCING') {
    return null; // Silent when fully online and synced
  }

  return (
    <div
      style={{
        background: !isOnline
          ? 'linear-gradient(90deg, rgba(185, 28, 28, 0.95), rgba(153, 27, 27, 0.95))'
          : isSlow
          ? 'linear-gradient(90deg, rgba(180, 83, 9, 0.95), rgba(161, 98, 7, 0.95))'
          : 'linear-gradient(90deg, rgba(14, 116, 144, 0.95), rgba(3, 105, 161, 0.95))',
        color: '#fff',
        padding: '6px 16px',
        fontSize: '12px',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
        position: 'relative',
        zIndex: 50,
      }}
      role="status"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {!isOnline ? (
          <>
            <WifiOff size={15} />
            <span>
              <strong>Offline Mode</strong> — Your work is safely saved on this device.
              {pendingCount > 0 && ` (${pendingCount} record${pendingCount > 1 ? 's' : ''} waiting to sync)`}
            </span>
          </>
        ) : isSlow ? (
          <>
            <AlertTriangle size={15} />
            <span>
              <strong>Slow Connection Detected</strong> — Prioritizing local data & image optimization.
            </span>
          </>
        ) : status === 'SYNCING' || isProcessing ? (
          <>
            <RefreshCw size={14} className="spinner-ai" />
            <span>
              Syncing {pendingCount} record{pendingCount > 1 ? 's' : ''} to central server...
            </span>
          </>
        ) : (
          <>
            <CheckCircle2 size={15} />
            <span>
              {pendingCount > 0
                ? `${pendingCount} record${pendingCount > 1 ? 's' : ''} pending sync`
                : 'All local records synchronized'}
            </span>
          </>
        )}
      </div>

      {isOnline && pendingCount > 0 && !isProcessing && (
        <button
          onClick={triggerSync}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.35)',
            color: '#fff',
            borderRadius: 6,
            padding: '2px 10px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Sync Now
        </button>
      )}
    </div>
  );
}
