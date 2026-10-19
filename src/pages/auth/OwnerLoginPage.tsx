import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { validateEmail, validatePassword } from '../../utils/validators';
import { Card, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Music, Eye, EyeOff, Shield, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

interface OwnerLoginPageProps {
  onSuccessLogin: () => void;
  onGoToOwnerInvite: () => void;
  onGoToClientLogin: () => void;
  onGoHome: () => void;
}

export const OwnerLoginPage: React.FC<OwnerLoginPageProps> = ({
  onSuccessLogin,
  onGoToOwnerInvite,
  onGoToClientLogin,
  onGoHome
}) => {
  const { loginWithCredentials, loginAsOwner } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('director@apdmusicclass.com');
  const [password, setPassword] = useState('directorSecure2026');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!validateEmail(email)) {
      setErrorMsg('Please enter a valid administrator email');
      return;
    }

    const passValidation = validatePassword(password);
    if (!passValidation.valid) {
      setErrorMsg(passValidation.message || 'Invalid password');
      return;
    }

    setLoading(true);
    try {
      await loginWithCredentials(email, password, 'owner');
      showToast('Welcome, Academy Director. Owner console authenticated.', 'success');
      onSuccessLogin();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleInstantDemoOwner = () => {
    loginAsOwner();
    showToast('Signed in as Academy Director (Owner Demo)', 'success');
    onSuccessLogin();
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
      <div style={{ maxWidth: '440px', width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            onClick={onGoHome}
            style={{
              width: '46px',
              height: '46px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--brand-primary)',
              color: '#FFFFFF',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(198, 84, 195, 0.4)'
            }}
          >
            <Shield size={24} strokeWidth={2.4} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF' }}>
            Owner & Director Console
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Academy operations, teacher schedules, members & finances.
          </p>
        </div>

        {/* Quick Demo Reviewer Bar */}
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(198, 84, 195, 0.15)',
            border: '1px solid rgba(198, 84, 195, 0.35)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#FFFFFF' }}>
            <ShieldCheck size={16} color="var(--brand-primary)" />
            <span>Fast Reviewer Demo:</span>
          </div>
          <Button size="sm" variant="primary" onClick={handleInstantDemoOwner}>
            Instant Director Login
          </Button>
        </div>

        {/* Login Card */}
        <Card style={{ backgroundColor: 'var(--brand-charcoal-900)', borderColor: 'rgba(255,255,255,0.1)' }}>
          <CardBody style={{ padding: '2rem' }}>
            {errorMsg && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#FCA5A5',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem'
                }}
              >
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" style={{ color: '#FFFFFF' }}>
                  Owner / Administrator Email <span className="required">*</span>
                </label>
                <div className="input-with-icon">
                  <input
                    type="email"
                    className="input"
                    style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.15)' }}
                    placeholder="director@apdmusicclass.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                  <span className="input-icon-btn" style={{ color: '#9CA3AF' }}>
                    <Mail size={16} />
                  </span>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ color: '#FFFFFF' }}>
                  Password <span className="required">*</span>
                </label>
                <div className="input-with-icon">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input"
                    style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.15)' }}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="input-icon-btn"
                    style={{ color: '#9CA3AF' }}
                    onClick={() => setShowPassword(p => !p)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                style={{ width: '100%' }}
                loading={loading}
                icon={<ArrowRight size={17} />}
                iconPosition="right"
              >
                Authenticate as Director
              </Button>
            </form>

            <div
              style={{
                marginTop: '1.5rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                textAlign: 'center',
                fontSize: '0.82rem',
                color: '#9CA3AF'
              }}
            >
              Need owner credentials or onboarding?{' '}
              <button
                type="button"
                onClick={onGoToOwnerInvite}
                style={{ color: 'var(--brand-primary)', fontWeight: 700 }}
              >
                Invitation Placeholder
              </button>
            </div>
          </CardBody>
        </Card>

        {/* Client Portal Link */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button
            type="button"
            onClick={onGoToClientLogin}
            style={{ fontSize: '0.82rem', color: '#9CA3AF' }}
          >
            Are you a student or parent?{' '}
            <strong style={{ color: 'var(--brand-primary)' }}>Client Login →</strong>
          </button>
        </div>
      </div>
    </div>
  );
};
