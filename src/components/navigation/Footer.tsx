import React from 'react';
import { Music, MapPin, Phone, Mail, Clock, ArrowRight } from 'lucide-react';
import { mockBranches } from '../../data/mock';

interface FooterProps {
  onNavigateSection: (sectionId: string) => void;
  onNavigateAuth: (type: 'client-login' | 'client-register' | 'owner-login') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateSection, onNavigateAuth }) => {
  return (
    <footer
      style={{
        backgroundColor: 'var(--surface-footer)',
        color: '#D8DBE2',
        paddingTop: '4.5rem',
        paddingBottom: '2.5rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      <div className="container">
        {/* Top 4-Column Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3.5rem'
          }}
        >
          {/* Col 1: Brand & Bio */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--brand-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF'
                }}
              >
                <Music size={20} strokeWidth={2.4} />
              </div>
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF' }}>
                  APD MUSIC CLASS
                </div>
                <div
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    color: 'var(--brand-primary)',
                    textTransform: 'uppercase'
                  }}
                >
                  Premier Music Academy
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', color: '#9DA2B3', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Cultivating the next generation of musical artistry across Hyderabad. Personalized 1-on-1 mentorship, acoustic soundproofed rehearsal halls, and comprehensive masterclasses across 7 master instruments.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#BCC1D2', fontSize: '0.85rem' }}>
              <Clock size={16} color="var(--brand-primary)" />
              <span>Operating Daily: <strong>8:00 AM – 6:00 PM</strong> (10 Consecutive Sessions)</span>
            </div>
          </div>

          {/* Col 2: Studio Locations */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Our Studios
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {mockBranches.map(branch => (
                <div key={branch.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <MapPin size={17} color="var(--brand-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FFFFFF' }}>
                      {branch.name} Studio
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#8F94A6', lineHeight: 1.4 }}>
                      {branch.address}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', marginTop: '0.2rem' }}>
                      {branch.phone}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Col 3: Instruments */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Master Instruments
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
              {['Guitar', 'Piano', 'Drums', 'Sitar', 'Violin', 'Ukulele', 'Trumpet'].map(inst => (
                <button
                  key={inst}
                  onClick={() => onNavigateSection('instruments')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    color: '#A5A9B8',
                    textAlign: 'left'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#FFFFFF')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#A5A9B8')}
                >
                  <ArrowRight size={13} color="var(--brand-primary)" />
                  {inst} Masterclass
                </button>
              ))}
            </div>
          </div>

          {/* Col 4: Quick Portals & Contact */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Portal Access
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
              <button
                onClick={() => onNavigateAuth('client-login')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#FFFFFF',
                  fontSize: '0.85rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                Client Member Login →
              </button>
              <button
                onClick={() => onNavigateAuth('client-register')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#FFFFFF',
                  fontSize: '0.85rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                New Student Registration →
              </button>
              <button
                onClick={() => onNavigateAuth('owner-login')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(198, 84, 195, 0.15)',
                  color: '#FFFFFF',
                  fontSize: '0.85rem',
                  border: '1px solid rgba(198, 84, 195, 0.3)'
                }}
              >
                Owner Portal Entry →
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', color: '#9DA2B3' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={14} color="var(--brand-primary)" />
                <span>support@apdmusicclass.com</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={14} color="var(--brand-primary)" />
                <span>+91 40 4821 7733</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.8rem',
            color: '#7D8293'
          }}
        >
          <div>
            © {new Date().getFullYear()} APD MUSIC CLASS. All rights reserved. Madhapur • Kokila • Himayatnagar
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <span>Phase 1 Frontend Demonstration</span>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
