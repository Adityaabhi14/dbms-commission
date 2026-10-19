import React from 'react';
import { InstrumentId } from '../../types';
import { mockInstruments } from '../../data/mock';
import { Card, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { formatCurrency } from '../../utils/formatters';
import { Check, Sparkles } from 'lucide-react';

interface InstrumentSelectorProps {
  selectedId: InstrumentId | null;
  onSelect: (id: InstrumentId) => void;
}

export const InstrumentSelector: React.FC<InstrumentSelectorProps> = ({
  selectedId,
  onSelect
}) => {
  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.35rem' }}>
          Step 1: Choose Your Instrument
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Select the instrument you wish to master. Each program features customized curriculum paths from beginner fundamentals to concert stage performance.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.25rem'
        }}
      >
        {mockInstruments.map(inst => {
          const isSelected = selectedId === inst.id;
          return (
            <Card
              key={inst.id}
              interactive
              selected={isSelected}
              onClick={() => onSelect(inst.id)}
              style={{
                borderColor: isSelected ? 'var(--brand-primary)' : undefined,
                transition: 'all var(--transition-normal)'
              }}
            >
              <CardBody style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: '0.85rem'
                  }}
                >
                  <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>{inst.imagePlaceholder}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Badge variant="primary">{inst.category}</Badge>
                    {isSelected && (
                      <span
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--brand-primary)',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Check size={14} strokeWidth={3} />
                      </span>
                    )}
                  </div>
                </div>

                <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  {inst.name}
                </h4>

                <p
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                    marginBottom: '1rem',
                    flex: 1
                  }}
                >
                  {inst.description}
                </p>

                <div
                  style={{
                    paddingTop: '0.85rem',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tuition from</span>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {formatCurrency(inst.startingPricePerMonth)}
                      <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                        /mo
                      </span>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: isSelected ? 'var(--brand-primary)' : 'var(--text-muted)'
                    }}
                  >
                    {isSelected ? 'Selected ✓' : 'Click to Select'}
                  </span>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
