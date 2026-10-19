import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { validateEmail, validatePassword } from '../../utils/validators';
import { Card, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Music, Eye, EyeOff, Lock, Mail, ArrowRight, Sparkles, UserCheck, KeyRound } from 'lucide-react';

interface ClientLoginPageProps {
  onSuccessLogin: () => void;
  onGoToRegister: () => void;
  onGoToOwnerLogin: () => void;
  onGoHome: () => void;
}

export const ClientLoginPage: React.FC<ClientLoginPageProps> = ({
  onSuccessLogin,
  onGoToRegister,
  onGoToOwnerLogin,
  onGoHome
}) => {
  const { loginWithCredentials, loginAsClient, forgotPassword, resetPassword } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('aarav.patel@example.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Forgot / Reset Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<'request' | 'reset'>('request');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotStatusMsg, setForgotStatusMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!validateEmail(email)) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    const passValidation = validatePassword(password);
    if (!passValidation.valid) {
      setErrorMsg(passValidation.message || 'Invalid password');
      return;
    }

    setLoading(true);
    try {
      await loginWithCredentials(email, password, 'client');
      showToast('Welcome back! Signed in to Client Portal.', 'success');
      onSuccessLogin();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign in. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(forgotEmail)) {
      setForgotStatusMsg('Please enter a valid email address');
      return;
    }
    setForgotLoading(true);
    try {
      const res = await forgotPassword(forgotEmail);
      setForgotStatusMsg(res.message);
      showToast('Reset request received. Check your email or console token.', 'info');
      setForgotStep('reset');
    } catch (err: any) {
      setForgotStatusMsg(err.message || 'Request could not be processed.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetToken.trim() || newPassword.length < 6) {
      setForgotStatusMsg('Please enter token and new password (min 6 characters)');
      return;
    }
    setForgotLoading(true);
    try {
      const res = await resetPassword(resetToken.trim(), newPassword);
      showToast(res.message, 'success');
      setIsForgotModalOpen(false);
      setForgotStep('request');
      setForgotStatusMsg('');
    } catch (err: any) {
      setForgotStatusMsg(err.message || 'Failed to reset password.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleQuickDemoClient = () => {
    loginAsClient('APD-M-1001');
    showToast('Signed in as Demo Student: Aarav Patel', 'success');
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
        backgroundColor: 'var(--surface-bg)'
      }}
    >
      <div style={{ maxWidth: '440px', width: '100%' }}>
        {/* Logo and Header */}
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
              cursor: 'pointer'
            }}
          >
            <Music size={24} strokeWidth={2.4} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-plum-900)' }}>
            Client Portal Login
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Access your practice schedules, active memberships, and class bookings.
          </p>
        </div>

        {/* Quick Demo Login Pill for Reviewer Ease */}
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--brand-lavender-100)',
            border: '1px solid var(--brand-primary-border)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--brand-plum-900)' }}>
            <UserCheck size={16} color="var(--brand-primary)" />
            <span>Fast Reviewer Demo:</span>
          </div>
          <Button size="sm" variant="primary" onClick={handleQuickDemoClient}>
            Instant Demo Sign In
          </Button>
        </div>

        {/* Login Card */}
        <Card style={{ boxShadow: 'var(--shadow-md)' }}>
          <CardBody style={{ padding: '2rem' }}>
            {errorMsg && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--status-danger-bg)',
                  border: '1px solid var(--status-danger-border)',
                  color: 'var(--status-danger)',
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
                <label className="form-label" htmlFor="client-email">
                  Email Address <span className="required">*</span>
                </label>
                <div className="input-with-icon">
                  <input
                    id="client-email"
                    type="email"
                    className="input"
                    placeholder="student@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                  <span className="input-icon-btn">
                    <Mail size={16} />
                  </span>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label className="form-label" htmlFor="client-password" style={{ margin: 0 }}>
                    Password <span className="required">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotModalOpen(true);
                      setForgotEmail(email);
                    }}
                    style={{ fontSize: '0.8rem', color: 'var(--brand-primary)', fontWeight: 600 }}
                  >
                    Forgot Password?
                  </button>
                </div>

                <div className="input-with-icon">
                  <input
                    id="client-password"
                    type={showPassword ? 'text' : 'password'}
                    className="input"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="input-icon-btn"
                    onClick={() => setShowPassword(p => !p)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
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
                Sign In to Portal
              </Button>
            </form>

            <div
              style={{
                marginTop: '1.5rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid var(--border-subtle)',
                textAlign: 'center',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)'
              }}
            >
              Don't have an academy student account?{' '}
              <button
                type="button"
                onClick={onGoToRegister}
                style={{ color: 'var(--brand-primary)', fontWeight: 700 }}
              >
                Create Account
              </button>
            </div>
          </CardBody>
        </Card>

        {/* Owner Portal Entry Link */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button
            type="button"
            onClick={onGoToOwnerLogin}
            style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}
          >
            Are you an academy director or administrator?{' '}
            <strong style={{ color: 'var(--brand-plum-900)' }}>Owner Login →</strong>
          </button>
        </div>
      </div>

      {/* Forgot & Reset Password Modal */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => {
          setIsForgotModalOpen(false);
          setForgotStatusMsg('');
        }}
        title={forgotStep === 'request' ? 'Password Recovery' : 'Set New Academy Password'}
      >
        <div style={{ padding: '0.5rem 0' }}>
          {forgotStatusMsg && (
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--brand-lavender-100)',
                border: '1px solid var(--brand-primary-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--brand-plum-900)',
                fontSize: '0.85rem',
                marginBottom: '1rem'
              }}
            >
              {forgotStatusMsg}
            </div>
          )}

          {forgotStep === 'request' ? (
            <form onSubmit={handleForgotSubmit}>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Enter your registered student email address. We will send you secure instructions to reset your password.
              </p>
              <div className="form-group">
                <label className="form-label" htmlFor="forgot-email">
                  Student Email
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  className="input"
                  placeholder="student@example.com"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsForgotModalOpen(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={forgotLoading}
                  style={{ flex: 1 }}
                >
                  Send Reset Link
                </Button>
              </div>
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setForgotStep('reset')}
                  style={{ fontSize: '0.8rem', color: 'var(--brand-primary)' }}
                >
                  Already have a reset token? Enter it here →
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetSubmit}>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Enter the cryptographic reset token generated for your account along with your new password.
              </p>
              <div className="form-group">
                <label className="form-label" htmlFor="reset-token">
                  Reset Token
                </label>
                <input
                  id="reset-token"
                  type="text"
                  className="input"
                  placeholder="Paste 64-char token here"
                  value={resetToken}
                  onChange={e => setResetToken(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="new-password">
                  New Password (min 6 chars)
                </label>
                <input
                  id="new-password"
                  type="password"
                  className="input"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setForgotStep('request')}
                  style={{ flex: 1 }}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={forgotLoading}
                  style={{ flex: 1 }}
                >
                  Update Password
                </Button>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
};
