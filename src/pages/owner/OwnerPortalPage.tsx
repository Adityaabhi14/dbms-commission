import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { OwnerSidebar, OwnerNavTab } from '../../components/navigation/OwnerSidebar';
import { OwnerOverviewView } from './OwnerOverviewView';
import { OwnerMembersView } from './OwnerMembersView';
import { OwnerTeachersView } from './OwnerTeachersView';
import { OwnerBranchesInstrumentsView } from './OwnerBranchesInstrumentsView';
import { OwnerScheduleOccupancyView } from './OwnerScheduleOccupancyView';
import { OwnerFinanceReportsView } from './OwnerFinanceReportsView';
import { OwnerSettingsView } from './OwnerSettingsView';
import { Menu, Shield, Bell } from 'lucide-react';
import { Badge } from '../../components/common/Badge';

interface OwnerPortalPageProps {
  onGoHome: () => void;
}

export const OwnerPortalPage: React.FC<OwnerPortalPageProps> = ({ onGoHome }) => {
  const { user, logout } = useAuth();
  const [currentTab, setCurrentTab] = useState<OwnerNavTab>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    onGoHome();
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--surface-bg)' }}>
      {/* 1. Dedicated Owner Sidebar */}
      <OwnerSidebar
        currentTab={currentTab}
        onSelectTab={tab => {
          setCurrentTab(tab);
          setMobileSidebarOpen(false);
        }}
        onLogout={handleLogout}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* 2. Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Operational Bar */}
        <header
          style={{
            height: '64px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '0 1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 880
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <button
              onClick={() => setMobileSidebarOpen(true)}
              style={{
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.4rem',
                color: 'var(--text-primary)'
              }}
              className="owner-mobile-menu-btn"
              aria-label="Open navigation sidebar"
            >
              <Menu size={22} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={18} color="var(--brand-primary)" />
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                APD Music Class • Executive Console
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Badge variant="primary">Hyderabad Flagship Cluster</Badge>

            {/* Admin Avatar Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
                padding: '0.3rem 0.65rem',
                backgroundColor: 'var(--surface-bg)',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--brand-primary)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                AP
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                {user?.name || 'Dr. Alok Prasad'}
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic View Body */}
        <main style={{ flex: 1, padding: '2rem 2.25rem', overflowY: 'auto' }}>
          {currentTab === 'overview' && (
            <OwnerOverviewView onNavigateTab={tab => setCurrentTab(tab)} />
          )}

          {currentTab === 'members' && <OwnerMembersView />}

          {currentTab === 'teachers' && <OwnerTeachersView />}

          {currentTab === 'instruments' && (
            <OwnerBranchesInstrumentsView initialSubTab="instruments" />
          )}

          {currentTab === 'branches' && (
            <OwnerBranchesInstrumentsView initialSubTab="branches" />
          )}

          {currentTab === 'plans' && (
            <OwnerBranchesInstrumentsView initialSubTab="instruments" />
          )}

          {(currentTab === 'schedule' || currentTab === 'enrollments') && (
            <OwnerScheduleOccupancyView />
          )}

          {(currentTab === 'payments' || currentTab === 'expenses' || currentTab === 'reports') && (
            <OwnerFinanceReportsView />
          )}

          {currentTab === 'settings' && <OwnerSettingsView />}
        </main>
      </div>

      <style>{`
        @media (max-width: 992px) {
          .owner-mobile-menu-btn {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
};
