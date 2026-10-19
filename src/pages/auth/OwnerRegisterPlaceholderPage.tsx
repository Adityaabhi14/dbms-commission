import React, { useState } from 'react';
import { Card, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ShieldAlert, ArrowLeft, Key, Lock, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface OwnerRegisterPlaceholderPageProps {
  onGoBackToOwnerLogin: () => void;
  onGoHome: () => void;
}

export const OwnerRegisterPlaceholderPage: React.FC<OwnerRegisterPlaceholderPageProps> = ({
  onGoBackToOwnerLogin,
  onGoHome
}) => {
  const { showToast } = useToast();
  const [tokenInput, setTokenInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleValidateToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      showToast('Please enter an invitation token', 'warning');
      return;
    }
    setIsValidating(true);
    setTimeout(() => {
      setIsValidating(false);
      showToast(
        'Phase 4 Security Policy: Owner creation requires multi-signature cryptographic authorization from the head of academy. Self-service is restricted.',
        'info'
      );
    }, 700);
  };

  return (
    <div
      style={{
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        backgroundColor: 'var(--brand-charcoal-950)'
      }}
    >
      <div style={{ maxWidth: '520px', width: '100%' }}>
        <Card style={{ backgroundColor: 'var(--brand-charcoal-900)', borderColor: 'rgba(255,255,255,0.1)' }}>
          <CardBody style={{ padding: '2.5rem 2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(198, 84, 195, 0.15)',
                  color: 'var(--brand-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto'
                }}
              >
                <Lock size={26} />
              </div>

              <Badge variant="primary" style={{ marginBottom: '0.75rem' }}>
                Phase 4 Architecture Placeholder
              </Badge>

              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.5rem' }}>
                Owner & Executive Onboarding
              </h2>

              <p style={{ color: '#9CA3AF', fontSize: '0.88rem', lineHeight: 1.6 }}>
                To preserve academy data integrity, public self-registration for Owner and Administrative privileges is strictly disallowed.
              </p>
            </div>

            {/* Architecture Explanatory Notice */}
            <div
              style={{
                padding: '1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
                fontSize: '0.82rem',
                color: '#D1D5DB'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#FFFFFF' }}>
                <ShieldAlert size={16} color="var(--brand-primary)" />
                <span>Security Specification</span>
              </div>
              <div>
                • Phase 1 (Current): Mock authenticated owner session is available via direct <strong>Instant Director Login</strong>.
              </div>
              <div>
                • Phase 4: Production owner accounts will require pre-issued cryptographic invitations sent by authorized studio trustees.
              </div>
            </div>

            {/* Simulated Invitation Token Form */}
            <form onSubmit={handleValidateToken} style={{ marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ color: '#FFFFFF' }}>
                  Simulated Invitation Token / Key
                </label>
                <div className="input-with-icon">
                  <input
                    type="text"
                    className="input"
                    style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.15)' }}
                    placeholder="e.g. APD-OWNER-INVITE-2026-X88"
                    value={tokenInput}
                    onChange={e => setTokenInput(e.target.value)}
                  />
                  <span className="input-icon-btn" style={{ color: '#9CA3AF' }}>
                    <Key size={16} />
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                style={{ width: '100%' }}
                loading={isValidating}
              >
                Validate Invitation Token
              </Button>
            </form>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button variant="ghost" size="sm" onClick={onGoBackToOwnerLogin} icon={<ArrowLeft size={15} />} style={{ color: '#9CA3AF' }}>
                Back to Owner Login
              </Button>
              <Button variant="ghost" size="sm" onClick={onGoHome} style={{ color: '#9CA3AF' }}>
                Public Home
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
