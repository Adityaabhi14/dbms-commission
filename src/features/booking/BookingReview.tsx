import React from 'react';
import { InstrumentId, BranchId, MembershipDuration } from '../../types';
import { mockInstruments, mockBranches, mockMembershipPlans, mockTimeSlots, calculateMembershipPrice } from '../../data/mock';
import { Card, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { formatCurrency, formatDatePretty } from '../../utils/formatters';
import { Sparkles, MapPin, Calendar, Clock, Award, ShieldCheck } from 'lucide-react';

interface BookingReviewProps {
  instrumentId: InstrumentId;
  branchId: BranchId;
  duration: MembershipDuration;
  date: string;
  slotId: number;
}

export const BookingReview: React.FC<BookingReviewProps> = ({
  instrumentId,
  branchId,
  duration,
  date,
  slotId
}) => {
  const instrument = mockInstruments.find(i => i.id === instrumentId) || mockInstruments[0];
  const branch = mockBranches.find(b => b.id === branchId) || mockBranches[0];
  const plan = mockMembershipPlans.find(p => p.id === duration) || mockMembershipPlans[0];
  const slot = mockTimeSlots.find(s => s.id === slotId) || mockTimeSlots[0];

  const priceDetails = calculateMembershipPrice(instrument.id, plan.id);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.35rem' }}>
          Step 5: Review Booking & Price Summary
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Please verify your selected instrument, studio branch, membership plan, and inaugural session time before proceeding to confirmation.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}
      >
        {/* Left Column: Booking Details Card */}
        <Card>
          <CardBody>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--brand-primary-light)',
                  color: 'var(--brand-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Sparkles size={18} />
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Program Details</h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Instrument */}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.85rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Selected Instrument</span>
                <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>{instrument.imagePlaceholder}</span>
                  <span>{instrument.name}</span>
                </span>
              </div>

              {/* Branch */}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.85rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Studio Branch</span>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: 700, color: 'var(--brand-plum-900)' }}>{branch.name} Campus</span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{branch.area}</div>
                </div>
              </div>

              {/* Membership Plan */}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.85rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Membership Plan</span>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: 700 }}>{plan.title}</span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', fontWeight: 600 }}>
                    {plan.months} Month Commitment
                  </div>
                </div>
              </div>

              {/* First Class Date & Slot */}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Inaugural Class Slot</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700 }}>{formatDatePretty(date)}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--brand-plum-700)', fontWeight: 600 }}>
                    {slot.label} (Slot #{slot.id})
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Right Column: Pricing Breakdown Card */}
        <Card style={{ backgroundColor: 'var(--brand-lavender-50)', borderColor: 'var(--brand-primary-border)' }}>
          <CardBody>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--brand-primary)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Award size={18} />
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--brand-plum-900)' }}>
                Tuition Fee Breakdown
              </h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  Base Tuition ({formatCurrency(priceDetails.baseRatePerMonth)} × {priceDetails.months} mo)
                </span>
                <span style={{ fontWeight: 600 }}>{formatCurrency(priceDetails.rawSubtotal)}</span>
              </div>

              {priceDetails.discountAmount > 0 ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--status-success)' }}>
                  <span>Term Privilege Discount ({priceDetails.discountPercentage}%)</span>
                  <span style={{ fontWeight: 700 }}>− {formatCurrency(priceDetails.discountAmount)}</span>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  <span>Term Discount</span>
                  <span>₹0 (1-month explorer)</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Studio Maintenance & Sheet Music</span>
                <span style={{ color: 'var(--status-success)', fontWeight: 600 }}>Included (Free)</span>
              </div>

              <div
                style={{
                  margin: '0.5rem 0',
                  height: '1px',
                  backgroundColor: 'var(--brand-primary-border)'
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--brand-plum-900)' }}>
                  Total Payable Amount
                </span>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
                    {formatCurrency(priceDetails.finalPrice)}
                  </span>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    All inclusive of taxes & studio access
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: '1.5rem',
                padding: '0.75rem',
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)'
              }}
            >
              <ShieldCheck size={18} color="var(--status-success)" style={{ flexShrink: 0 }} />
              <span>
                Satisfaction Guarantee: 100% transferrable across instruments within the first 14 days of enrollment.
              </span>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
