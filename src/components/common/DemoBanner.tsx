import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQueryInspector } from '../../context/QueryInspectorContext';
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
  const { logQuery } = useQueryInspector();

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
            logQuery({
              sourceButton: 'Quick Switch: [Public Site]',
              pageContext: 'Public Navigation',
              type: 'SELECT',
              primaryTable: 'instruments',
              sql: `SELECT id, name, category, starting_price_per_month, available_branches 
FROM instruments 
WHERE is_active = TRUE 
ORDER BY name ASC;`,
              executionTimeMs: 1.8,
              rowsAffected: '7 records retrieved',
              dbmsConcept: 'Read-only catalog projection'
            });
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
            logQuery({
              sourceButton: 'Quick Switch: [Demo Client (Aarav)]',
              pageContext: 'Client Portal Entry',
              type: 'SELECT',
              primaryTable: 'users',
              relatedTables: ['members'],
              sql: `SELECT u.id, u.email, u.role, m.id AS member_id, m.full_name, m.enrolled_instrument_id, m.branch_id
FROM users u
INNER JOIN members m ON u.id = m.user_id
WHERE u.email = 'aarav.patel@example.com' AND u.role = 'CLIENT';`,
              executionTimeMs: 2.2,
              rowsAffected: '1 authenticated student tuple',
              dbmsConcept: 'Foreign key 1:1 join users.id = members.user_id'
            });
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
            logQuery({
              sourceButton: 'Quick Switch: [Demo Owner (Director)]',
              pageContext: 'Executive Console Entry',
              type: 'SELECT',
              primaryTable: 'users',
              relatedTables: ['owner_profiles'],
              sql: `SELECT u.id, u.email, u.role, op.id AS owner_profile_id, op.full_name, op.permissions
FROM users u
INNER JOIN owner_profiles op ON u.id = op.user_id
WHERE u.email = 'director@apdmusicclass.com' AND u.role = 'OWNER';`,
              executionTimeMs: 2.5,
              rowsAffected: '1 executive owner profile',
              dbmsConcept: 'Owner authorization and RBAC verification'
            });
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
              logQuery({
                sourceButton: 'Sign Out Action',
                pageContext: 'Session Management',
                type: 'UPDATE',
                primaryTable: 'users',
                sql: `UPDATE users 
SET updated_at = NOW() 
WHERE id = '${user.id}';`,
                executionTimeMs: 1.6,
                rowsAffected: 'Session invalidated',
                dbmsConcept: 'Session termination and audit timestamp update'
              });
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
