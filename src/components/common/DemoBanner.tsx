import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, UserCheck, Globe, LogOut } from 'lucide-react';

interface DemoBannerProps {
  onNavigatePublic: () => void;
  onNavigateClient: () => void;
  onNavigateOwner: () => void;
  currentView: 'public' | 'client' | 'owner' | 'auth';
}

export const DemoBanner: React.FC<DemoBannerProps> = ({
  onNavigatePublic,
  onNavigateClient,
  onNavigateOwner,
  currentView
}) => {
  const { user, role, loginAsClient, loginAsOwner, logout } = useAuth();

  return (
    <div
      style={{
        backgroundColor: 'var(--brand-charcoal-950)',
        color: '#E0E2EC',
        fontSize: '0.8rem',
        padding: '0.45rem 1rem',
        borderBottom: '1px solid rgba(198, 84, 195, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
        zIndex: 1000
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            backgroundColor: 'rgba(198, 84, 195, 0.25)',
            color: '#FFFFFF',
            padding: '0.15rem 0.5rem',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 700,
            letterSpacing: '0.04em',
            fontSize: '0.72rem'
          }}
        >
          PHASE 1 PREVIEW
        </span>
        <span style={{ color: '#A5A9B8' }}>
          Interactive Mock Engine: Centralized demonstration data & active multi-step booking.
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ color: '#7E8394', fontSize: '0.75rem', marginRight: '0.2rem' }}>
          Quick Role Switch:
        </span>

        <button
          onClick={() => {
            onNavigatePublic();
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.25rem 0.6rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            fontWeight: 600,
            background: currentView === 'public' ? 'rgba(255,255,255,0.15)' : 'transparent',
            color: currentView === 'public' ? '#FFFFFF' : '#B0B4C3',
            border: '1px solid',
            borderColor: currentView === 'public' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)'
          }}
        >
          <Globe size={13} /> Public Site
        </button>

        <button
          onClick={() => {
            loginAsClient();
            onNavigateClient();
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.25rem 0.6rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            fontWeight: 600,
            background: role === 'client' && currentView === 'client' ? 'var(--brand-primary)' : 'transparent',
            color: '#FFFFFF',
            border: '1px solid',
            borderColor: role === 'client' && currentView === 'client' ? 'var(--brand-primary)' : 'rgba(198, 84, 195, 0.4)'
          }}
        >
          <UserCheck size={13} /> Demo Client (Aarav)
        </button>

        <button
          onClick={() => {
            loginAsOwner();
            onNavigateOwner();
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.25rem 0.6rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            fontWeight: 600,
            background: role === 'owner' && currentView === 'owner' ? '#8C2E8A' : 'transparent',
            color: '#FFFFFF',
            border: '1px solid',
            borderColor: role === 'owner' && currentView === 'owner' ? '#8C2E8A' : 'rgba(198, 84, 195, 0.4)'
          }}
        >
          <ShieldCheck size={13} /> Demo Owner (Director)
        </button>

        {user && (
          <button
            onClick={() => {
              logout();
              onNavigatePublic();
            }}
            title="Sign out of demo session"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.25rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              color: '#F87171',
              background: 'transparent',
              border: '1px solid rgba(248, 113, 113, 0.25)'
            }}
          >
            <LogOut size={13} />
          </button>
        )}
      </div>
    </div>
  );
};
