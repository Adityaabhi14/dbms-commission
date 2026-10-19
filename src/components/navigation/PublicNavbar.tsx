import React, { useState } from 'react';
import { Music, Menu, X, ArrowRight, User, Shield } from 'lucide-react';
import { Button } from '../common/Button';

export interface PublicNavbarProps {
  currentSection: string;
  onNavigateSection: (sectionId: string) => void;
  onNavigateAuth: (type: 'client-login' | 'client-register' | 'owner-login') => void;
  onStartBooking: () => void;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({
  currentSection,
  onNavigateSection,
  onNavigateAuth,
  onStartBooking
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'instruments', label: 'Instruments' },
    { id: 'locations', label: 'Locations' },
    { id: 'plans', label: 'Membership Plans' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' }
  ];

  const handleLinkClick = (id: string) => {
    onNavigateSection(id);
    setMobileMenuOpen(false);
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 900,
        backgroundColor: 'var(--surface-header)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border-subtle)',
        height: 'var(--header-height)'
      }}
    >
      <div
        className="container"
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* Brand Logo */}
        <div
          onClick={() => handleLinkClick('home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer'
          }}
          role="button"
          tabIndex={0}
          aria-label="APD Music Class Home"
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 3px 10px rgba(198, 84, 195, 0.35)'
            }}
          >
            <Music size={22} strokeWidth={2.4} />
          </div>
          <div>
            <div
              style={{
                fontSize: '1.2rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: 'var(--brand-plum-900)',
                lineHeight: 1.1
              }}
            >
              APD MUSIC CLASS
            </div>
            <div
              style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                letterSpacing: '0.12em',
                color: 'var(--brand-primary)',
                textTransform: 'uppercase'
              }}
            >
              Academy of Modern & Classical Arts
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '1.75rem'
          }}
          className="desktop-nav"
        >
          {navLinks.map(link => (
            <button
              key={link.id}
              onClick={() => handleLinkClick(link.id)}
              style={{
                fontSize: '0.9rem',
                fontWeight: currentSection === link.id ? 700 : 500,
                color: currentSection === link.id ? 'var(--brand-primary)' : 'var(--text-secondary)',
                position: 'relative',
                padding: '0.4rem 0',
                transition: 'color var(--transition-fast)'
              }}
            >
              {link.label}
              {currentSection === link.id && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    backgroundColor: 'var(--brand-primary)',
                    borderRadius: '2px'
                  }}
                />
              )}
            </button>
          ))}
        </nav>

        {/* Entry Points & CTAs */}
        <div
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '0.65rem'
          }}
          className="desktop-actions"
        >
          <button
            onClick={() => onNavigateAuth('client-login')}
            className="btn btn-ghost btn-sm"
            style={{ fontWeight: 600, fontSize: '0.85rem' }}
          >
            <User size={15} /> Client Login
          </button>

          <button
            onClick={() => onNavigateAuth('client-register')}
            className="btn btn-outline btn-sm"
            style={{ fontWeight: 600, fontSize: '0.85rem' }}
          >
            Sign Up
          </button>

          <Button
            size="sm"
            variant="primary"
            onClick={onStartBooking}
            icon={<ArrowRight size={15} />}
            iconPosition="right"
          >
            Book a Class
          </Button>

          <div
            style={{
              width: '1px',
              height: '24px',
              backgroundColor: 'var(--border-default)',
              margin: '0 0.2rem'
            }}
          />

          <button
            onClick={() => onNavigateAuth('owner-login')}
            className="btn btn-ghost btn-sm"
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
            title="Academy Management & Owner Portal"
          >
            <Shield size={14} /> Owner
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(prev => !prev)}
          className="mobile-toggle"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.5rem',
            color: 'var(--text-primary)'
          }}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-lg)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                style={{
                  textAlign: 'left',
                  fontSize: '1rem',
                  fontWeight: currentSection === link.id ? 700 : 500,
                  color: currentSection === link.id ? 'var(--brand-primary)' : 'var(--text-primary)',
                  padding: '0.5rem 0',
                  borderBottom: '1px solid var(--border-subtle)'
                }}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
              marginTop: '0.5rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--border-default)'
            }}
          >
            <Button
              variant="primary"
              onClick={() => {
                setMobileMenuOpen(false);
                onStartBooking();
              }}
              icon={<ArrowRight size={16} />}
              iconPosition="right"
            >
              Book a Class Now
            </Button>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateAuth('client-login');
                }}
              >
                Client Login
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateAuth('client-register');
                }}
              >
                Sign Up
              </Button>
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateAuth('owner-login');
              }}
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                textAlign: 'center',
                padding: '0.5rem'
              }}
            >
              Owner Portal Entry →
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 900px) {
          .desktop-nav { display: flex !important; }
          .desktop-actions { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
      `}</style>
    </header>
  );
};
