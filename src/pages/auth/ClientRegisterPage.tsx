import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { validateEmail, validatePhone, validatePassword } from '../../utils/validators';
import { Card, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Music, Eye, EyeOff, User, Mail, Phone, Lock, ArrowRight } from 'lucide-react';

interface ClientRegisterPageProps {
  onSuccessRegister: () => void;
  onGoToLogin: () => void;
  onGoHome: () => void;
}

export const ClientRegisterPage: React.FC<ClientRegisterPageProps> = ({
  onSuccessRegister,
  onGoToLogin,
  onGoHome
}) => {
  const { registerClient } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    if (!validatePhone(phone)) {
      setErrorMsg('Please enter a valid 10-digit phone number');
      return;
    }

    const passValidation = validatePassword(password);
    if (!passValidation.valid) {
      setErrorMsg(passValidation.message || 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await registerClient(fullName, email, phone, password);
      showToast('Registration successful! Welcome to APD Music Class.', 'success');
      onSuccessRegister();
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
      <div style={{ maxWidth: '480px', width: '100%' }}>
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
            Student Account Registration
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Join APD Music Class across our Hyderabad studios.
          </p>
        </div>

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
              {/* Full Name */}
              <div className="form-group">
                <label className="form-label">
                  Full Name <span className="required">*</span>
                </label>
                <div className="input-with-icon">
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Sanya Reddy"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required
                  />
                  <span className="input-icon-btn">
                    <User size={16} />
                  </span>
                </div>
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label">
                  Email Address <span className="required">*</span>
                </label>
                <div className="input-with-icon">
                  <input
                    type="email"
                    className="input"
                    placeholder="sanya@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                  <span className="input-icon-btn">
                    <Mail size={16} />
                  </span>
                </div>
              </div>

              {/* Phone */}
              <div className="form-group">
                <label className="form-label">
                  Phone Number <span className="required">*</span>
                </label>
                <div className="input-with-icon">
                  <input
                    type="tel"
                    className="input"
                    placeholder="+91 98490 11223"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required
                  />
                  <span className="input-icon-btn">
                    <Phone size={16} />
                  </span>
                </div>
              </div>

              {/* Password */}
              <div className="form-group">
                <label className="form-label">
                  Create Password <span className="required">*</span>
                </label>
                <div className="input-with-icon">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input"
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="input-icon-btn"
                    onClick={() => setShowPassword(p => !p)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">
                  Confirm Password <span className="required">*</span>
                </label>
                <div className="input-with-icon">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
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
                Create Student Account
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
              Already registered?{' '}
              <button
                type="button"
                onClick={onGoToLogin}
                style={{ color: 'var(--brand-primary)', fontWeight: 700 }}
              >
                Sign In Instead
              </button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
