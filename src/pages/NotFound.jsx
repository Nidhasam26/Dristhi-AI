import { Link } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg)',
      padding: 'var(--space-4)',
    }}>
      <div className="card" style={{ maxWidth: 480, textAlign: 'center', padding: 'var(--space-8)' }}>
        <div style={{
          width: 64, height: 64, borderRadius: 'var(--radius-full)',
          background: 'var(--color-danger-light)', color: 'var(--color-danger-dark)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto var(--space-6)'
        }}>
          <AlertCircle size={32} aria-hidden="true" />
        </div>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>Page Not Found</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Button variant="primary">Return to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
