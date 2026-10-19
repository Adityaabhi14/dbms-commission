import React from 'react';
import { BranchId, InstrumentId } from '../../types';
import { mockBranches, mockInstruments } from '../../data/mock';
import { Card, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { MapPin, Clock, Check, AlertCircle, CheckCircle2 } from 'lucide-react';

interface BranchSelectorProps {
  selectedBranchId: BranchId | null;
  selectedInstrumentId: InstrumentId | null;
  onSelect: (id: BranchId) => void;
}

export const BranchSelector: React.FC<BranchSelectorProps> = ({
  selectedBranchId,
  selectedInstrumentId,
  onSelect
}) => {
  const currentInstrument = mockInstruments.find(i => i.id === selectedInstrumentId);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.35rem' }}>
          Step 2: Choose Your Studio Branch
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Select from our three specialized academy campuses in Hyderabad. Studio acoustic facilities and master faculty allocations vary by branch.
        </p>
        {currentInstrument && (
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
            <span>Selected Instrument: <strong>{currentInstrument.name}</strong></span>
          </div>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.25rem'
        }}
      >
        {mockBranches.map(branch => {
          const isSelected = selectedBranchId === branch.id;
          const isInstrumentAvailable = selectedInstrumentId
            ? branch.availableInstruments.includes(selectedInstrumentId)
            : true;

          return (
            <Card
              key={branch.id}
              interactive={isInstrumentAvailable}
              selected={isSelected}
              onClick={() => {
                if (isInstrumentAvailable) onSelect(branch.id);
              }}
              style={{
                opacity: isInstrumentAvailable ? 1 : 0.6,
                borderColor: isSelected ? 'var(--brand-primary)' : undefined,
                cursor: isInstrumentAvailable ? 'pointer' : 'not-allowed'
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{ fontSize: '2rem' }}>{branch.imagePlaceholder}</span>
                    <div>
                      <h4 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{branch.name}</h4>
                      <span style={{ fontSize: '0.78rem', color: 'var(--brand-primary)', fontWeight: 600 }}>
                        {branch.area}
                      </span>
                    </div>
                  </div>

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

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.45rem',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '1rem'
                  }}
                >
                  <MapPin size={16} color="var(--brand-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{branch.address}</span>
                </div>

                {/* Instrument availability check banner */}
                {!isInstrumentAvailable ? (
                  <div
                    style={{
                      padding: '0.65rem 0.85rem',
                      backgroundColor: 'var(--status-warning-bg)',
                      border: '1px solid var(--status-warning-border)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.8rem',
                      color: 'var(--status-warning)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      marginBottom: '1rem'
                    }}
                  >
                    <AlertCircle size={15} style={{ flexShrink: 0 }} />
                    <span>
                      {currentInstrument?.name} is not taught at {branch.name}. Please select Kokila or Himayatnagar.
                    </span>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: '0.5rem 0.75rem',
                      backgroundColor: 'var(--status-success-bg)',
                      border: '1px solid var(--status-success-border)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.78rem',
                      color: 'var(--status-success)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      marginBottom: '1rem'
                    }}
                  >
                    <CheckCircle2 size={14} />
                    <span>{currentInstrument?.name || 'Instrument'} available at this studio</span>
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    marginBottom: '1rem'
                  }}
                >
                  <Clock size={15} />
                  <span>
                    Operating: <strong>{branch.dailyClassHours}</strong> (10 daily slots)
                  </span>
                </div>

                {/* Available Instruments tags */}
                <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                    Available Programs:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {branch.availableInstruments.map(instId => {
                      const inst = mockInstruments.find(i => i.id === instId);
                      const isTarget = instId === selectedInstrumentId;
                      return (
                        <span
                          key={instId}
                          style={{
                            fontSize: '0.72rem',
                            padding: '0.2rem 0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: isTarget ? 'var(--brand-primary-light)' : 'var(--surface-bg)',
                            color: isTarget ? 'var(--brand-plum-900)' : 'var(--text-secondary)',
                            fontWeight: isTarget ? 700 : 500,
                            border: isTarget ? '1px solid var(--brand-primary-border)' : '1px solid var(--border-subtle)'
                          }}
                        >
                          {inst?.name || instId}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
