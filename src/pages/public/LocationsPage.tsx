import React from 'react';
import { mockBranches, mockInstruments } from '../../data/mock';
import { Card, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { BranchId } from '../../types';
import { MapPin, Phone, Mail, Clock, CheckCircle2, ArrowRight } from 'lucide-react';

interface LocationsPageProps {
  onSelectStudioForBooking: (branchId: BranchId) => void;
}

export const LocationsPage: React.FC<LocationsPageProps> = ({
  onSelectStudioForBooking
}) => {
  return (
    <div className="section-py" style={{ minHeight: '85vh', backgroundColor: 'var(--surface-bg)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span className="eyebrow">Studio Network</span>
          <h1 className="section-title">Our Academy Campuses in Hyderabad</h1>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            Three specialized, acoustically treated learning environments strategically situated in Madhapur, Kokila, and Himayatnagar.
          </p>
        </div>

        {/* Branch Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {mockBranches.map(branch => (
            <Card key={branch.id} style={{ boxShadow: 'var(--shadow-sm)' }}>
              <CardBody style={{ padding: '2rem' }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2.5rem',
                    alignItems: 'center'
                  }}
                >
                  {/* Left Column: Branch Info */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '2.5rem' }}>{branch.imagePlaceholder}</span>
                      <div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-plum-900)' }}>
                          {branch.name} Campus
                        </h2>
                        <span style={{ fontSize: '0.85rem', color: 'var(--brand-primary)', fontWeight: 700 }}>
                          {branch.area} • Hyderabad
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', color: 'var(--text-secondary)' }}>
                        <MapPin size={18} color="var(--brand-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{branch.address}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--text-secondary)' }}>
                        <Clock size={18} color="var(--brand-primary)" />
                        <span>Daily Class Hours: <strong>{branch.dailyClassHours}</strong> ({branch.classSlotsCount} slots daily)</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--text-secondary)' }}>
                        <Phone size={18} color="var(--brand-primary)" />
                        <span>{branch.phone}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--text-secondary)' }}>
                        <Mail size={18} color="var(--brand-primary)" />
                        <span>{branch.email}</span>
                      </div>
                    </div>

                    {/* Amenities */}
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.45rem' }}>
                        Studio Infrastructure & Amenities:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {branch.amenities.map((amenity, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.25rem 0.65rem',
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: 'var(--surface-bg)',
                              color: 'var(--text-secondary)',
                              border: '1px solid var(--border-default)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                          >
                            <CheckCircle2 size={12} color="var(--brand-primary)" />
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Instrument Matrix & Action */}
                  <div
                    style={{
                      backgroundColor: 'var(--surface-card-subtle)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '1.75rem',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1.25rem'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>
                          Instruments Taught at {branch.name}
                        </h4>
                        <Badge variant="primary">
                          {branch.availableInstruments.length} Available
                        </Badge>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.5rem' }}>
                        {mockInstruments.map(inst => {
                          const isAvailable = branch.availableInstruments.includes(inst.id);
                          return (
                            <div
                              key={inst.id}
                              style={{
                                padding: '0.5rem 0.65rem',
                                borderRadius: 'var(--radius-md)',
                                backgroundColor: isAvailable ? '#FFFFFF' : 'transparent',
                                border: '1px solid',
                                borderColor: isAvailable ? 'var(--brand-primary-border)' : 'var(--border-subtle)',
                                opacity: isAvailable ? 1 : 0.45,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.45rem',
                                fontSize: '0.8rem'
                              }}
                            >
                              <span>{inst.imagePlaceholder}</span>
                              <span style={{ fontWeight: isAvailable ? 700 : 400 }}>{inst.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                      <Button
                        variant="primary"
                        size="lg"
                        style={{ width: '100%' }}
                        onClick={() => onSelectStudioForBooking(branch.id)}
                        icon={<ArrowRight size={17} />}
                        iconPosition="right"
                      >
                        Choose This Studio & Book Class
                      </Button>
                      <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        Carries {branch.name} directly into multi-step booking
                      </p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
