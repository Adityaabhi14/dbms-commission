import React from 'react';
import { MembershipDuration, InstrumentId } from '../../types';
import { mockMembershipPlans, mockInstruments, calculateMembershipPrice } from '../../data/mock';
import { Card, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { formatCurrency } from '../../utils/formatters';
import { Check, Sparkles } from 'lucide-react';

interface PlanSelectorProps {
  selectedDuration: MembershipDuration;
  selectedInstrumentId: InstrumentId | null;
  onSelect: (duration: MembershipDuration) => void;
}

export const PlanSelector: React.FC<PlanSelectorProps> = ({
  selectedDuration,
  selectedInstrumentId,
  onSelect
}) => {
  const currentInstrument = mockInstruments.find(i => i.id === selectedInstrumentId) || mockInstruments[0];

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.35rem' }}>
          Step 3: Choose Your Membership Plan
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Select your training horizon. Longer commitments unlock substantial tuition savings, stage recital opportunities, and audio recording sessions.
        </p>
        <div
          style={{
            marginTop: '0.75rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 0.85rem',
            backgroundColor: 'var(--brand-lavender-100)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            color: 'var(--brand-plum-900)'
          }}
        >
          <span>Base tuition for <strong>{currentInstrument.name}</strong>: <strong>{formatCurrency(currentInstrument.startingPricePerMonth)}/month</strong></span>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1.25rem'
        }}
      >
        {mockMembershipPlans.map(plan => {
          const isSelected = selectedDuration === plan.id;
          const priceDetails = calculateMembershipPrice(currentInstrument.id, plan.id);

          return (
            <Card
              key={plan.id}
              interactive
              selected={isSelected}
              onClick={() => onSelect(plan.id)}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                borderColor: isSelected ? 'var(--brand-primary)' : undefined
              }}
            >
              {plan.badge && (
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px'
                  }}
                >
                  <Badge variant={plan.discountPercentage >= 20 ? 'success' : 'primary'}>
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <CardBody style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{plan.title}</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {plan.description}
                  </p>
                </div>

                {/* Price block */}
                <div
                  style={{
                    padding: '1rem',
                    backgroundColor: 'var(--surface-card-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    marginBottom: '1.25rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {formatCurrency(priceDetails.finalPrice)}
                    </span>
                    {priceDetails.discountAmount > 0 && (
                      <span
                        style={{
                          fontSize: '0.9rem',
                          color: 'var(--text-muted)',
                          textDecoration: 'line-through'
                        }}
                      >
                        {formatCurrency(priceDetails.rawSubtotal)}
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '0.35rem',
                      fontSize: '0.78rem'
                    }}
                  >
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {plan.months} month{plan.months > 1 ? 's' : ''} total
                    </span>
                    {priceDetails.discountPercentage > 0 ? (
                      <span style={{ color: 'var(--status-success)', fontWeight: 700 }}>
                        Save {priceDetails.discountPercentage}% ({formatCurrency(priceDetails.discountAmount)})
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Standard rate</span>
                    )}
                  </div>
                </div>

                {/* Features list */}
                <div style={{ flex: 1, marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
                    Plan Privileges:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {plan.features.map((feat, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.45rem',
                          fontSize: '0.82rem',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        <Check size={14} color="var(--brand-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border-subtle)',
                    textAlign: 'center',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: isSelected ? 'var(--brand-primary)' : 'var(--text-secondary)'
                  }}
                >
                  {isSelected ? 'Selected Plan ✓' : 'Select Plan'}
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
