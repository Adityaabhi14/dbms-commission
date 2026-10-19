import React, { useState } from 'react';
import { mockBranches, mockInstruments, mockTeachers, mockMembers } from '../../data/mock';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { formatCurrency } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import { Building2, Sparkles, MapPin, Phone, Mail, Clock, Check, Users } from 'lucide-react';

export const OwnerBranchesInstrumentsView: React.FC<{ initialSubTab?: 'branches' | 'instruments' }> = ({
  initialSubTab = 'branches'
}) => {
  const { showToast } = useToast();
  const [subTab, setSubTab] = useState<'branches' | 'instruments'>(initialSubTab);

  return (
    <div>
      {/* Tab Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
            {subTab === 'branches' ? 'Studio Branch Infrastructure' : 'Master Instruments Catalogue Management'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {subTab === 'branches'
              ? 'Acoustic campus amenities, instrument availability matrices, and faculty assignments.'
              : 'Base tuition rates, active student enrollments, and teacher competencies.'}
          </p>
        </div>

        <div style={{ display: 'flex', backgroundColor: 'var(--surface-card)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
          <button
            onClick={() => setSubTab('branches')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 600,
              backgroundColor: subTab === 'branches' ? 'var(--brand-primary)' : 'transparent',
              color: subTab === 'branches' ? '#FFFFFF' : 'var(--text-secondary)'
            }}
          >
            Studio Branches (3)
          </button>
          <button
            onClick={() => setSubTab('instruments')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 600,
              backgroundColor: subTab === 'instruments' ? 'var(--brand-primary)' : 'transparent',
              color: subTab === 'instruments' ? '#FFFFFF' : 'var(--text-secondary)'
            }}
          >
            Instruments (7)
          </button>
        </div>
      </div>

      {/* 1. BRANCHES SUBTAB */}
      {subTab === 'branches' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Matrix Card */}
          <Card>
            <CardHeader>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                Instrument Availability Matrix Across Campuses
              </h3>
              <Badge variant="primary">Configurable Data</Badge>
            </CardHeader>
            <CardBody style={{ padding: 0 }}>
              <div className="table-container" style={{ border: 'none' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Instrument</th>
                      <th>Category</th>
                      <th style={{ textAlign: 'center' }}>Madhapur Campus</th>
                      <th style={{ textAlign: 'center' }}>Kokila Campus</th>
                      <th style={{ textAlign: 'center' }}>Himayatnagar Studio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockInstruments.map(inst => {
                      const inMadhapur = mockBranches.find(b => b.id === 'madhapur')?.availableInstruments.includes(inst.id);
                      const inKokila = mockBranches.find(b => b.id === 'kokila')?.availableInstruments.includes(inst.id);
                      const inHimayatnagar = mockBranches.find(b => b.id === 'himayatnagar')?.availableInstruments.includes(inst.id);

                      return (
                        <tr key={inst.id}>
                          <td style={{ fontWeight: 700 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <span>{inst.imagePlaceholder}</span>
                              <span>{inst.name}</span>
                            </span>
                          </td>
                          <td>
                            <Badge variant="neutral">{inst.category}</Badge>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {inMadhapur ? (
                              <Badge variant="success">Available</Badge>
                            ) : (
                              <Badge variant="neutral">Not Taught</Badge>
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {inKokila ? (
                              <Badge variant="success">Available</Badge>
                            ) : (
                              <Badge variant="neutral">Not Taught</Badge>
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {inHimayatnagar ? (
                              <Badge variant="success">Available</Badge>
                            ) : (
                              <Badge variant="neutral">Not Taught</Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>

          {/* Individual Branch Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {mockBranches.map(branch => {
              const assignedTeachers = mockTeachers.filter(t => t.assignedBranches.includes(branch.id));
              const enrolledStudents = mockMembers.filter(m => m.branchId === branch.id);

              return (
                <Card key={branch.id}>
                  <CardHeader>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span style={{ fontSize: '1.75rem' }}>{branch.imagePlaceholder}</span>
                      <div>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{branch.name} Campus</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', fontWeight: 600 }}>
                          {branch.area}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                        <MapPin size={16} color="var(--brand-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{branch.address}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                        <Clock size={16} color="var(--brand-primary)" />
                        <span>{branch.dailyClassHours} ({branch.classSlotsCount} slots)</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                        <Users size={16} color="var(--brand-primary)" />
                        <span>Active Enrolled Students: <strong>{enrolledStudents.length}</strong></span>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                        Assigned Faculty Mentors ({assignedTeachers.length}):
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {assignedTeachers.map(t => (
                          <Badge key={t.id} variant="neutral">
                            {t.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. INSTRUMENTS SUBTAB */}
      {subTab === 'instruments' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {mockInstruments.map(inst => {
            const facultyCount = mockTeachers.filter(t => t.instrumentsTaught.includes(inst.id)).length;
            const studentCount = mockMembers.filter(m => m.enrolledInstrumentId === inst.id).length;

            return (
              <Card key={inst.id}>
                <CardBody style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '2.5rem' }}>{inst.imagePlaceholder}</span>
                    <Badge variant="primary">{inst.category}</Badge>
                  </div>

                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                    {inst.name}
                  </h3>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem', flex: 1 }}>
                    {inst.description}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', padding: '0.85rem', backgroundColor: 'var(--surface-bg)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Base Monthly Tuition</div>
                      <div style={{ fontWeight: 800, fontSize: '1.15rem' }}>{formatCurrency(inst.startingPricePerMonth)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Enrolled Students</div>
                      <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--brand-primary)' }}>{studentCount} Members</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>Faculty Mentors: <strong>{facultyCount} Teachers</strong></span>
                    <span>Branches: <strong>{inst.availableBranches.length} / 3 Campuses</strong></span>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
