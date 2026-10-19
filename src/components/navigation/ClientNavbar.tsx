import React, { useState } from 'react';
import {
  Music,
  LayoutDashboard,
  Compass,
  CalendarPlus,
  Award,
  CalendarCheck,
  CreditCard,
  User,
  LogOut,
  Menu,
  X,
  Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';

export type ClientNavTab =
  | 'overview'
  | 'instruments'
  | 'booking'
  | 'membership'
  | 'bookings'
  | 'payments'
  | 'profile';

interface ClientNavbarProps {
  currentTab: ClientNavTab;
  onSelectTab: (tab: ClientNavTab) => void;
  onLogout: () => void;
}

export const ClientNavbar: React.FC<ClientNavbarProps> = ({
  currentTab,
  onSelectTab,
  onLogout
}) => {
  const { user } = useAuth();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={17} /> },
    { id: 'instruments', label: 'Browse Instruments', icon: <Compass size={17} /> },
    { id: 'booking', label: 'Book a Class', icon: <CalendarPlus size={17} /> },
    { id: 'membership', label: 'My Membership', icon: <Award size={17} /> },
    { id: 'bookings', label: 'My Bookings', icon: <CalendarCheck size={17} /> },
    { id: 'payments', label: 'Payment History', icon: <CreditCard size={17} /> },
    { id: 'profile', label: 'My Profile', icon: <User size={17} /> }
  ];

  const handleTabClick = (tabId: ClientNavTab) => {
    onSelectTab(tabId);
    setMobileDrawerOpen(false);
  };

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 890,
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-xs)'
        }}
      >
        {/* Top Header Row */}
        <div
          className="container"
          style={{
            height: '66px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* Logo */}
          <div
            onClick={() => handleTabClick('overview')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--brand-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}
            >
              <Music size={18} strokeWidth={2.4} />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--brand-plum-900)' }}>
                APD MUSIC CLASS
              </div>
              <div
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: 'var(--brand-primary)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase'
                }}
              >
                Client Portal
              </div>
            </div>
          </div>

          {/* Right Profile & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleTabClick('booking')}
              icon={<CalendarPlus size={15} />}
              className="client-book-btn"
            >
              Book Class
            </Button>

            <button
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--surface-bg)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
                position: 'relative'
              }}
              title="Class Notifications"
              aria-label="Class notifications"
            >
              <Bell size={17} />
              <span
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  width: '7px',
                  height: '7px',
                  backgroundColor: 'var(--brand-primary)',
                  borderRadius: '50%'
                }}
              />
            </button>

            {/* Member Profile Chip */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.35rem 0.65rem',
                backgroundColor: 'var(--surface-card-subtle)',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--brand-lavender-200)',
                  color: 'var(--brand-plum-800)',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AP'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {user?.name || 'Aarav Patel'}
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  {user?.memberId || 'APD-M-1001'}
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--status-danger)', padding: '0.4rem 0.6rem' }}
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>

            {/* Mobile Nav Toggle */}
            <button
              onClick={() => setMobileDrawerOpen(prev => !prev)}
              className="client-mobile-toggle"
              style={{
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.4rem',
                color: 'var(--text-primary)'
              }}
              aria-label="Toggle client navigation"
            >
              {mobileDrawerOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Sub-Nav Bar (Desktop Tabs) */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--surface-card-subtle)'
          }}
          className="client-subnav-desktop"
        >
          <div
            className="container"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              overflowX: 'auto',
              paddingTop: '0.2rem',
              paddingBottom: '0.2rem'
            }}
          >
            {navItems.map(item => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id as ClientNavTab)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.65rem 1rem',
                    fontSize: '0.85rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
                    borderBottom: '2px solid',
                    borderColor: isActive ? 'var(--brand-primary)' : 'transparent',
                    whiteSpace: 'nowrap',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            top: '66px',
            backgroundColor: '#FFFFFF',
            zIndex: 999,
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}
        >
          {navItems.map(item => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id as ClientNavTab)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.95rem',
                  fontWeight: isActive ? 700 : 500,
                  backgroundColor: isActive ? 'var(--brand-lavender-100)' : 'transparent',
                  color: isActive ? 'var(--brand-primary)' : 'var(--text-primary)',
                  textAlign: 'left'
                }}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </div>
      )}

      <style>{`
        @media (max-width: 820px) {
          .client-subnav-desktop { display: none !important; }
          .client-mobile-toggle { display: flex !important; }
          .client-book-btn { display: none !important; }
        }
      `}</style>
    </>
  );
};
