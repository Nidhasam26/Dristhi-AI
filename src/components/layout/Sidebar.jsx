import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useVoice } from '../../hooks/useVoice.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import {
  LayoutDashboard,
  ScanLine,
  Users,
  ShieldCheck,
  LogOut,
  Eye,
  Calendar,
  BarChart3,
  Database,
  FlaskConical,
  Settings2,
  X,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, labelKey: 'commandCenter', prompt: 'nav_dashboard', roles: ['patient', 'user', 'admin'] },
  { to: '/scan/new', icon: ScanLine, labelKey: 'newScreening', prompt: 'nav_scan', roles: ['patient', 'user', 'admin'] },
  { to: '/appointments', icon: Calendar, labelKey: 'appointments', prompt: 'nav_appointments', roles: ['patient', 'user', 'admin'] },
  { to: '/patients', icon: Users, labelKey: 'patientRegistry', prompt: 'nav_patients', roles: ['patient', 'user', 'admin'] },
  { to: '/analytics', icon: BarChart3, labelKey: 'analytics', prompt: 'nav_analytics', roles: ['admin', 'user'] },
  { to: '/dataset', icon: Database, labelKey: 'dataset', prompt: 'nav_dataset', roles: ['admin'] },
  { to: '/validation', icon: FlaskConical, labelKey: 'validation', prompt: 'nav_validation', roles: ['admin'] },
  { to: '/settings', icon: Settings2, labelKey: 'settings', prompt: 'nav_settings', roles: ['patient', 'user', 'admin'] },
  { to: '/admin', icon: ShieldCheck, labelKey: 'admin', prompt: 'nav_admin', roles: ['admin'] },
];

const ROLE_LABELS = {
  patient: 'Health Worker',
  user: 'Field Screener',
  admin: 'Ophthalmologist',
};

export default function Sidebar({ collapsed = false, isMobile = false, mobileOpen = false, onClose }) {
  const { user, logout } = useAuth();
  const { speak } = useVoice();
  const { labels } = useLanguage();
  const navigate = useNavigate();

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(user?.role));

  const handleLogout = () => {
    onClose?.();
    logout();
    navigate('/login');
  };

  const handleNavClick = (prompt) => {
    speak(prompt);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const sidebarWidth = isMobile
    ? '280px'
    : collapsed
    ? 'var(--sidebar-collapsed, 68px)'
    : 'var(--sidebar-width, 260px)';

  const sidebarTransform = isMobile
    ? mobileOpen
      ? 'translateX(0)'
      : 'translateX(-100%)'
    : 'translateX(0)';

  return (
    <aside
      className={`sidebar ${isMobile ? 'sidebar-mobile' : ''} ${mobileOpen ? 'mobile-open' : ''} ${collapsed ? 'collapsed' : ''}`}
      aria-label="Main navigation"
      style={{
        width: sidebarWidth,
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        background: 'linear-gradient(180deg, #071F2C 0%, #092B3C 50%, #061F2B 100%)',
        borderRight: '1px solid rgba(34, 211, 238, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: isMobile ? 1100 : 'var(--z-sticky, 40)',
        transform: sidebarTransform,
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), width 0.3s ease',
        overflow: 'hidden',
        boxShadow: mobileOpen || !collapsed ? '4px 0 30px rgba(0, 0, 0, 0.5)' : 'none',
        pointerEvents: isMobile && !mobileOpen ? 'none' : 'auto',
      }}
    >
      {/* ── Brand Logo ── */}
      <div
        style={{
          padding: 'var(--space-5, 20px) var(--space-4, 16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 'var(--navbar-height, 64px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3, 12px)' }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-lg, 12px)',
              background: 'var(--color-primary, #0891B2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 14px rgba(8, 145, 178, 0.4)',
            }}
          >
            <Eye size={20} color="white" aria-hidden="true" />
          </div>

          {(!collapsed || isMobile) && (
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-heading, "Figtree", sans-serif)',
                  fontWeight: 800,
                  fontSize: '1.125rem',
                  color: 'white',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                }}
              >
                DRISHTI AI
              </div>
              <div
                style={{
                  fontSize: '0.6875rem',
                  color: '#38BDF8',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  marginTop: 2,
                }}
              >
                Rural Screening AI
              </div>
            </div>
          )}
        </div>

        {/* Mobile Close Button */}
        {isMobile && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation sidebar"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 10,
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94A3B8',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* ── Navigation Links ── */}
      <nav
        style={{
          flex: 1,
          padding: 'var(--space-4, 16px) var(--space-2, 8px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-1, 4px)',
          overflowY: 'auto',
        }}
      >
        {visibleItems.map(({ to, icon: Icon, labelKey, prompt }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => handleNavClick(prompt)}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3, 12px)',
              padding: collapsed && !isMobile ? 'var(--space-3, 12px)' : '10px var(--space-4, 16px)',
              borderRadius: 'var(--radius-lg, 12px)',
              color: isActive ? 'white' : '#94A3B8',
              background: isActive ? 'rgba(8, 145, 178, 0.25)' : 'transparent',
              border: isActive ? '1px solid rgba(34, 211, 238, 0.35)' : '1px solid transparent',
              textDecoration: 'none',
              fontFamily: 'var(--font-heading, "Figtree", sans-serif)',
              fontWeight: isActive ? 700 : 500,
              fontSize: 'var(--text-sm, 0.875rem)',
              transition: 'all var(--transition-base, 0.2s ease)',
              whiteSpace: 'nowrap',
              justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
              cursor: 'pointer',
            })}
            title={collapsed && !isMobile ? labels[labelKey] : undefined}
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={19}
                  aria-hidden="true"
                  color={isActive ? '#38BDF8' : '#94A3B8'}
                  style={{ flexShrink: 0 }}
                />
                {(!collapsed || isMobile) && <span style={{ flex: 1 }}>{labels[labelKey]}</span>}
                {(!collapsed || isMobile) && isActive && (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#38BDF8',
                      flexShrink: 0,
                    }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── User info + Logout ── */}
      <div
        style={{
          padding: 'var(--space-4, 16px) var(--space-3, 12px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2, 8px)',
        }}
      >
        {(!collapsed || isMobile) && user && (
          <div
            style={{
              padding: 'var(--space-3, 12px)',
              borderRadius: 'var(--radius-lg, 12px)',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div
              style={{
                fontSize: 'var(--text-xs, 0.75rem)',
                fontWeight: 700,
                color: 'white',
                fontFamily: 'var(--font-heading, "Figtree", sans-serif)',
              }}
            >
              {user.name}
            </div>
            <div style={{ fontSize: '11px', color: '#7DD3FC', marginTop: 2 }}>
              {ROLE_LABELS[user.role] || user.role} • {user.district || 'Yavatmal'}
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          title="Logout"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3, 12px)',
            padding: collapsed && !isMobile ? 'var(--space-3, 12px)' : '10px var(--space-3, 12px)',
            borderRadius: 'var(--radius-lg, 12px)',
            background: 'transparent',
            border: 'none',
            color: '#94A3B8',
            cursor: 'pointer',
            fontFamily: 'var(--font-heading, "Figtree", sans-serif)',
            fontSize: 'var(--text-xs, 0.75rem)',
            fontWeight: 600,
            transition: 'all var(--transition-base, 0.2s ease)',
            width: '100%',
            justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
            minHeight: 40,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
            e.currentTarget.style.color = '#FCA5A5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#94A3B8';
          }}
        >
          <LogOut size={16} aria-hidden="true" style={{ flexShrink: 0 }} />
          {(!collapsed || isMobile) && 'Sign Out'}
        </button>
      </div>
    </aside>
  );
}
