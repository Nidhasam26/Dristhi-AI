import { useState, useEffect } from 'react';
import Sidebar from './Sidebar.jsx';
import Navbar from './Navbar.jsx';

export default function PageWrapper({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 1024 : false));

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggleSidebar = () => {
    if (isMobile) {
      setMobileOpen((prev) => !prev);
    } else {
      setCollapsed((prev) => !prev);
    }
  };

  const handleCloseMobile = () => {
    setMobileOpen(false);
  };

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <div className="app-layout">
        {/* Mobile Backdrop Overlay */}
        {isMobile && mobileOpen && (
          <div
            className="sidebar-mobile-backdrop active"
            onClick={handleCloseMobile}
            aria-hidden="true"
          />
        )}

        <Sidebar
          collapsed={!isMobile && collapsed}
          isMobile={isMobile}
          mobileOpen={mobileOpen}
          onClose={handleCloseMobile}
        />

        <div
          className="app-main"
          style={{
            marginLeft: isMobile ? 0 : (collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)'),
            transition: 'margin-left var(--transition-slow, 0.3s ease)',
            minHeight: '100vh',
            width: isMobile ? '100%' : undefined,
          }}
        >
          <Navbar
            isMobile={isMobile}
            collapsed={collapsed}
            onToggleSidebar={handleToggleSidebar}
          />
          <main id="main-content" className="page-content" tabIndex={-1}>
            {children}
          </main>
        </div>
      </div>
    </>
  );
}

