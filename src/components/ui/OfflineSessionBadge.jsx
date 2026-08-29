import { ShieldAlert } from 'lucide-react';
import { useConnectivity } from '../../context/ConnectivityContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function OfflineSessionBadge() {
  const { isOnline } = useConnectivity();
  const { isAuthenticated } = useAuth();

  if (isOnline || !isAuthenticated) return null;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 8px',
        borderRadius: 6,
        background: 'rgba(234, 179, 8, 0.15)',
        color: '#fde047',
        border: '1px solid rgba(250, 204, 21, 0.3)',
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.02em',
      }}
      title="You are operating in an offline session authenticated from cached device credentials."
    >
      <ShieldAlert size={12} />
      Offline Session
    </span>
  );
}
