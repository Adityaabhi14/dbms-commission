import React, { useState } from 'react';
import { mockTimeSlots, mockBranches, mockInstruments, mockBookings } from '../../data/mock';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { BranchId } from '../../types';
import { Calendar, Clock, CheckCircle2, Lock, Users, Building2 } from 'lucide-react';
import { formatDatePretty } from '../../utils/formatters';

export const OwnerScheduleOccupancyView: React.FC = () => {
  const [selectedBranch, setSelectedBranch] = useState<BranchId>('kokila');
  const [selectedDay, setSelectedDay] = useState<'Today' | 'Tomorrow' | 'This Weekend'>('Today');

  // Calculate branch occupancy rate
  const currentBranch = mockBranches.find(b => b.id === selectedBranch) || mockBranches[0];

  // Mock occupancy for the 10 slots
  const getSlotDetails = (slotId: number) => {
    // Variety across the 10 slots
    if (slotId === 2 || slotId === 3 || slotId === 7 || slotId === 9) {
      return {
        status: 'occupied',
        student: slotId === 3 ? 'Aarav Patel (Piano)' : slotId === 7 ? 'Sanya Reddy (Guitar)' : 'Rohan Deshmukh (Drums)',
        teacher: slotId === 3 ? 'Nandini Swaminathan' : slotId === 7 ? 'David Christopher' : 'Vikramaditya Rao'
      };
    }
    if (slotId === 5) {
      return { status: 'reserved', note: 'Acoustic Sound Check & Tuning' };
    }
    return { status: 'available' };
  };

  const occupiedSlotsCount = [2, 3, 7, 9].length;
  const occupancyPercentage = Math.round((occupiedSlotsCount / 10) * 100);

  return (
    <div>
      {/* Title */}
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Master Class Schedule & Occupancy</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Ten consecutive 1-hour sessions daily (8:00 AM – 6:00 PM) across all 3 campuses.
          </p>
        </div>

        {/* Branch Switcher */}
        <div style={{ display: 'flex', gap: '0.4rem', backgroundColor: '#FFFFFF', padding: '0.3rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
          {mockBranches.map(b => (
            <button
              key={b.id}
              onClick={() => setSelectedBranch(b.id)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontWeight: 600,
                backgroundColor: selectedBranch === b.id ? 'var(--brand-primary)' : 'transparent',
                color: selectedBranch === b.id ? '#FFFFFF' : 'var(--text-secondary)'
              }}
            >
              {b.name} Campus
            </button>
          ))}
        </div>
      </div>

      {/* Occupancy Stats Banner */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem'
        }}
      >
        <Card>
          <CardBody style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--brand-primary-light)',
                color: 'var(--brand-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Clock size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Daily Consecutive Slots</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>10 Slots (8 AM - 6 PM)</div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--status-success-bg)',
                color: 'var(--status-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Users size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Booked Occupancy</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--status-success)' }}>
                {occupancyPercentage}% ({occupiedSlotsCount}/10 Slots)
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--brand-lavender-100)',
                color: 'var(--brand-plum-900)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Building2 size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Studio Rooms</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>4 Soundproof Suites</div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Ten Consecutive Slots Grid Table */}
      <Card>
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} color="var(--brand-primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              Daily Master Class Schedule Matrix: {currentBranch.name}
            </h3>
          </div>
          <Badge variant="primary">10 Consecutive 1-Hour Classes</Badge>
        </CardHeader>
        <CardBody style={{ padding: 0 }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Slot #</th>
                  <th>Class Window</th>
                  <th>Session Status</th>
                  <th>Assigned Student & Instrument</th>
                  <th>Faculty Mentor</th>
                  <th>Room Assignment</th>
                </tr>
              </thead>
              <tbody>
                {mockTimeSlots.map(slot => {
                  const details = getSlotDetails(slot.id);
                  const isOccupied = details.status === 'occupied';
                  const isReserved = details.status === 'reserved';

                  return (
                    <tr key={slot.id}>
                      <td style={{ fontWeight: 800, color: 'var(--brand-primary)' }}>
                        Slot #{slot.id}
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        <div style={{ fontSize: '0.92rem' }}>{slot.label}</div>
                      </td>
                      <td>
                        {isOccupied && <Badge variant="success">Occupied</Badge>}
                        {isReserved && <Badge variant="warning">Maintenance / Tech</Badge>}
                        {!isOccupied && !isReserved && <Badge variant="neutral">Open / Available</Badge>}
                      </td>
                      <td>
                        {isOccupied ? (
                          <span style={{ fontWeight: 600 }}>{details.student}</span>
                        ) : isReserved ? (
                          <span style={{ color: 'var(--status-warning)', fontSize: '0.85rem' }}>{details.note}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Available for Booking</span>
                        )}
                      </td>
                      <td>
                        {isOccupied ? (
                          <span>{details.teacher}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          Suite {((slot.id % 4) + 1)} (Acoustics A)
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
