import React from 'react';
import {
  Music,
  LayoutDashboard,
  Users,
  GraduationCap,
  Sparkles,
  Building2,
  Layers,
  CalendarDays,
  FileCheck2,
  CreditCard,
  Receipt,
  TrendingUp,
  Settings,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type OwnerNavTab =
  | 'overview'
  | 'members'
  | 'teachers'
  | 'instruments'
  | 'branches'
  | 'plans'
  | 'schedule'
  | 'enrollments'
  | 'payments'
  | 'expenses'
  | 'reports'
  | 'settings';

interface OwnerSidebarProps {
  currentTab: OwnerNavTab;
  onSelectTab: (tab: OwnerNavTab) => void;
  onLogout: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const OwnerSidebar: React.FC<OwnerSidebarProps> = ({
  currentTab,
  onSelectTab,
  onLogout,
  isOpenMobile,
  onCloseMobile
}) => {
  const { user } = useAuth();

  const menuItems: { id: OwnerNavTab; label: string; icon: React.ReactNode; group?: string }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} />, group: 'Core' },
    { id: 'members', label: 'Members', icon: <Users size={18} />, group: 'Academy Operations' },
    { id: 'teachers', label: 'Teachers', icon: <GraduationCap size={18} /> },
    { id: 'instruments', label: 'Instruments', icon: <Sparkles size={18} /> },
    { id: 'branches', label: 'Branches', icon: <Building2 size={18} /> },
    { id: 'plans', label: 'Membership Plans', icon: <Layers size={18} /> },
    { id: 'schedule', label: 'Class Schedule', icon: <CalendarDays size={18} /> },
    { id: 'enrollments', label: 'Enrollments', icon: <FileCheck2 size={18} /> },
    { id: 'payments', label: 'Payments', icon: <CreditCard size={18} />, group: 'Finance & Accounts' },
    { id: 'expenses', label: 'Expenses', icon: <Receipt size={18} /> },
    { id: 'reports', label: 'Financial Reports', icon: <TrendingUp size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} />, group: 'System' }
  ];

  const handleItemClick = (id: OwnerNavTab) => {
    onSelectTab(id);
    onCloseMobile();
  };

  return (
    <>
      <aside
        className={`owner-sidebar ${isOpenMobile ? 'open-mobile' : ''}`}
        style={{
          width: 'var(--sidebar-width)',
          backgroundColor: 'var(--brand-charcoal-900)',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          color: '#E3E5EB',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          zIndex: 950,
          flexShrink: 0
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-sm)',
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
              <div
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  letterSpacing: '-0.02em'
                }}
              >
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
                Owner Console
              </div>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="owner-mobile-close"
            style={{
              display: 'none',
              color: '#A5A9B8',
              padding: '0.2rem'
            }}
            aria-label="Close owner sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation list */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem 0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem'
          }}
        >
          {menuItems.map(item => {
            const isActive = currentTab === item.id;
            return (
              <React.Fragment key={item.id}>
                {item.group && (
                  <div
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: '#6F7485',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      padding: '0.85rem 0.75rem 0.35rem 0.75rem'
                    }}
                  >
                    {item.group}
                  </div>
                )}
                <button
                  onClick={() => handleItemClick(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 700 : 500,
                    backgroundColor: isActive ? 'var(--brand-primary)' : 'transparent',
                    color: isActive ? '#FFFFFF' : '#B8BCC8',
                    transition: 'all var(--transition-fast)',
                    textAlign: 'left'
                  }}
                  onMouseEnter={e => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  }}
                  onMouseLeave={e => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{ color: isActive ? '#FFFFFF' : 'var(--brand-primary)' }}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Footer info & Logout */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(0, 0, 0, 0.2)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem'
            }}
          >
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF' }}>
                {user?.name || 'Dr. Alok Prasad'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#8E93A4' }}>Academy Director</div>
            </div>
          </div>

          <button
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              width: '100%',
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#F87171',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              cursor: 'pointer'
            }}
          >
            <LogOut size={15} />
            <span>Sign Out of Owner Console</span>
          </button>
        </div>
      </aside>

      <style>{`
        @media (max-width: 992px) {
          .owner-sidebar {
            position: fixed !important;
            left: -280px;
            transition: left 250ms ease-in-out;
          }
          .owner-sidebar.open-mobile {
            left: 0 !important;
          }
          .owner-mobile-close {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
};
