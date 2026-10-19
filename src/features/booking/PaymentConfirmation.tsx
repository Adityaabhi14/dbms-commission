import React, { useState } from 'react';
import { InstrumentId, BranchId, MembershipDuration, Booking } from '../../types';
import { mockInstruments, mockBranches, mockMembershipPlans, mockTimeSlots, calculateMembershipPrice } from '../../data/mock';
import { Card, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { formatCurrency, formatDatePretty } from '../../utils/formatters';
import { CheckCircle2, ShieldAlert, CreditCard, Smartphone, Building, Check, ArrowRight, Music } from 'lucide-react';

interface PaymentConfirmationProps {
  instrumentId: InstrumentId;
  branchId: BranchId;
  duration: MembershipDuration;
  date: string;
  slotId: number;
  onConfirmBooking: (mode: 'UPI' | 'Card' | 'Net Banking' | 'Demo Cash') => Booking;
  onGoToClientPortal: () => void;
  onResetBooking: () => void;
}

export const PaymentConfirmation: React.FC<PaymentConfirmationProps> = ({
  instrumentId,
  branchId,
  duration,
  date,
  slotId,
  onConfirmBooking,
  onGoToClientPortal,
  onResetBooking
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'UPI' | 'Card' | 'Net Banking' | 'Demo Cash'>('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  const instrument = mockInstruments.find(i => i.id === instrumentId) || mockInstruments[0];
  const branch = mockBranches.find(b => b.id === branchId) || mockBranches[0];
  const plan = mockMembershipPlans.find(p => p.id === duration) || mockMembershipPlans[0];
  const slot = mockTimeSlots.find(s => s.id === slotId) || mockTimeSlots[0];
  const priceDetails = calculateMembershipPrice(instrument.id, plan.id);

  const handleConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const result = onConfirmBooking(selectedMethod);
      setConfirmedBooking(result);
      setIsProcessing(false);
    }, 600);
  };

  if (confirmedBooking) {
    return (
      <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            padding: '2.5rem 2rem',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              backgroundColor: 'var(--status-success-bg)',
              color: 'var(--status-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto'
            }}
          >
            <CheckCircle2 size={38} strokeWidth={2.5} />
          </div>

          <Badge variant="success" style={{ marginBottom: '0.75rem' }}>
            Interactive Demo Booking Confirmed
          </Badge>

          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--brand-plum-900)', marginBottom: '0.5rem' }}>
            Welcome to APD Music Class!
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.75rem' }}>
            Your enrollment booking has been generated and appended to your active Client Portal records.
          </p>

          {/* Receipt Box */}
          <div
            style={{
              backgroundColor: 'var(--surface-bg)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-default)',
              padding: '1.5rem',
              textAlign: 'left',
              marginBottom: '2rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Booking Reference ID</span>
              <span style={{ fontWeight: 800, color: 'var(--brand-primary)', letterSpacing: '0.04em' }}>
                {confirmedBooking.id}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Instrument</span>
                <span style={{ fontWeight: 700 }}>{instrument.name} Masterclass</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Campus</span>
                <span style={{ fontWeight: 700 }}>{branch.name} Campus</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>First Class Slot</span>
                <span style={{ fontWeight: 700 }}>{formatDatePretty(date)} at {slot.label}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Plan Duration</span>
                <span style={{ fontWeight: 700 }}>{plan.title}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                <span style={{ fontWeight: 700 }}>Total Paid (Simulation)</span>
                <span style={{ fontWeight: 800, color: 'var(--brand-primary)', fontSize: '1.1rem' }}>
                  {formatCurrency(priceDetails.finalPrice)}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              size="lg"
              onClick={onGoToClientPortal}
              icon={<ArrowRight size={18} />}
              iconPosition="right"
            >
              Open Client Portal
            </Button>
            <Button variant="outline" size="lg" onClick={onResetBooking}>
              Book Another Program
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.35rem' }}>
          Step 6: Payment Confirmation Placeholder
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Select your simulated payment option. Phase 1 demonstrates the complete workflow without charging actual cards.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          maxWidth: '900px'
        }}
      >
        {/* Payment Methods Selection */}
        <Card>
          <CardBody>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
              Select Payment Method
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
              {/* UPI */}
              <div
                onClick={() => setSelectedMethod('UPI')}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid',
                  borderColor: selectedMethod === 'UPI' ? 'var(--brand-primary)' : 'var(--border-default)',
                  backgroundColor: selectedMethod === 'UPI' ? 'var(--brand-lavender-50)' : '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Smartphone size={20} color="var(--brand-primary)" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Instant UPI (GPay / PhonePe / Paytm)</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Zero transaction fees</div>
                  </div>
                </div>
                {selectedMethod === 'UPI' && (
                  <span style={{ color: 'var(--brand-primary)' }}>
                    <Check size={18} strokeWidth={3} />
                  </span>
                )}
              </div>

              {/* Card */}
              <div
                onClick={() => setSelectedMethod('Card')}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid',
                  borderColor: selectedMethod === 'Card' ? 'var(--brand-primary)' : 'var(--border-default)',
                  backgroundColor: selectedMethod === 'Card' ? 'var(--brand-lavender-50)' : '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <CreditCard size={20} color="var(--brand-primary)" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Credit / Debit Card</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Visa, Mastercard, RuPay</div>
                  </div>
                </div>
                {selectedMethod === 'Card' && (
                  <span style={{ color: 'var(--brand-primary)' }}>
                    <Check size={18} strokeWidth={3} />
                  </span>
                )}
              </div>

              {/* Net Banking */}
              <div
                onClick={() => setSelectedMethod('Net Banking')}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid',
                  borderColor: selectedMethod === 'Net Banking' ? 'var(--brand-primary)' : 'var(--border-default)',
                  backgroundColor: selectedMethod === 'Net Banking' ? 'var(--brand-lavender-50)' : '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Building size={20} color="var(--brand-primary)" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Net Banking</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>All major Indian banks</div>
                  </div>
                </div>
                {selectedMethod === 'Net Banking' && (
                  <span style={{ color: 'var(--brand-primary)' }}>
                    <Check size={18} strokeWidth={3} />
                  </span>
                )}
              </div>
            </div>

            {/* Disclaimer Callout */}
            <div
              style={{
                padding: '0.85rem 1rem',
                backgroundColor: 'var(--status-warning-bg)',
                border: '1px solid var(--status-warning-border)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.65rem',
                fontSize: '0.82rem',
                color: '#8A580C'
              }}
            >
              <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Phase 1 Architecture Notice:</strong> Real Razorpay / Stripe payment gateway integration is scheduled for subsequent phases. Clicking below registers an interactive test booking in state.
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Order Payable Summary */}
        <Card style={{ backgroundColor: 'var(--surface-card-subtle)' }}>
          <CardBody style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
              Final Amount Payable
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Item</span>
                <span style={{ fontWeight: 700 }}>{instrument.name} ({plan.title})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Campus</span>
                <span>{branch.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Selected Slot</span>
                <span>{slot.label}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>Total Tuition</span>
                <span style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--brand-primary)' }}>
                  {formatCurrency(priceDetails.finalPrice)}
                </span>
              </div>
            </div>

            <div style={{ marginTop: 'auto' }}>
              <Button
                variant="primary"
                size="lg"
                style={{ width: '100%' }}
                onClick={handleConfirm}
                loading={isProcessing}
                icon={<CheckCircle2 size={18} />}
              >
                Confirm Mock Booking ({formatCurrency(priceDetails.finalPrice)})
              </Button>
              <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                Instant confirmation • No credit card charged
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
