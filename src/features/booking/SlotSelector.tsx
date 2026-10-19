import React from 'react';
import { mockTimeSlots } from '../../data/mock';
import { Badge } from '../../components/common/Badge';
import { Calendar, Clock, CheckCircle, Lock, AlertTriangle } from 'lucide-react';

interface SlotSelectorProps {
  selectedDate: string;
  selectedSlotId: number | null;
  onSelectDate: (date: string) => void;
  onSelectSlot: (slotId: number) => void;
}

export const SlotSelector: React.FC<SlotSelectorProps> = ({
  selectedDate,
  selectedSlotId,
  onSelectDate,
  onSelectSlot
}) => {
  // Generate next 7 dates for quick day switching
  const getNextDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      days.push({
        iso: d.toISOString().split('T')[0],
        dayName: d.toLocaleDateString('en-IN', { weekday: 'short' }),
        dayNum: d.getDate(),
        month: d.toLocaleDateString('en-IN', { month: 'short' })
      });
    }
    return days;
  };

  const quickDays = getNextDays();

  // Mock slot statuses for demonstration (some slots booked or reserved)
  const getSlotStatus = (slotId: number) => {
    if (slotId === selectedSlotId) return 'selected';
    // For demo variety: slot 4 is booked by another member, slot 8 is reserved for maintenance
    if (slotId === 4) return 'booked';
    if (slotId === 8) return 'unavailable';
    return 'available';
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.35rem' }}>
          Step 4: Select First Class Date & Time Slot
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          The academy operates ten consecutive one-hour sessions daily between <strong>8:00 AM and 6:00 PM</strong>. Choose your inaugural class schedule below.
        </p>
      </div>

      {/* Date Selection Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '1.75rem',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.85rem',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem' }}>
            <Calendar size={18} color="var(--brand-primary)" />
            <span>Select Class Date</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Custom Date:</span>
            <input
              type="date"
              value={selectedDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => onSelectDate(e.target.value)}
              className="input"
              style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        {/* Quick Date Pills */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
            gap: '0.5rem'
          }}
        >
          {quickDays.map(day => {
            const isDaySelected = selectedDate === day.iso;
            return (
              <button
                key={day.iso}
                onClick={() => onSelectDate(day.iso)}
                style={{
                  padding: '0.65rem 0.5rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid',
                  borderColor: isDaySelected ? 'var(--brand-primary)' : 'var(--border-default)',
                  backgroundColor: isDaySelected ? 'var(--brand-primary)' : 'var(--surface-bg)',
                  color: isDaySelected ? '#FFFFFF' : 'var(--text-primary)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.2rem',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', opacity: 0.85 }}>
                  {day.dayName}
                </span>
                <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>{day.dayNum}</span>
                <span style={{ fontSize: '0.7rem', opacity: 0.85 }}>{day.month}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          flexWrap: 'wrap',
          marginBottom: '1rem',
          fontSize: '0.82rem',
          color: 'var(--text-secondary)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '3px', border: '1px solid var(--border-default)', backgroundColor: '#FFFFFF' }} />
          <span>Available</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'var(--brand-primary)' }} />
          <span>Selected</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#F0EFF2' }} />
          <span>Booked (Occupied)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#F6F5F8', opacity: 0.6 }} />
          <span>Unavailable (Maintenance)</span>
        </div>
      </div>

      {/* Ten Consecutive One-Hour Slots Grid */}
      <div className="slots-grid">
        {mockTimeSlots.map(slot => {
          const status = getSlotStatus(slot.id);
          const isSelected = status === 'selected';
          const isBooked = status === 'booked';
          const isUnavailable = status === 'unavailable';

          return (
            <div
              key={slot.id}
              className={`slot-card ${status}`}
              onClick={() => {
                if (status === 'available') {
                  onSelectSlot(slot.id);
                }
              }}
              role="button"
              tabIndex={status === 'available' ? 0 : -1}
              aria-label={`Slot ${slot.id}: ${slot.label}, ${status}`}
              onKeyDown={e => {
                if (e.key === 'Enter' && status === 'available') {
                  onSelectSlot(slot.id);
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: isSelected ? 'var(--brand-primary)' : 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  Slot #{slot.id}
                </span>

                {isSelected && (
                  <Badge variant="primary" icon={<CheckCircle size={12} />}>
                    Selected
                  </Badge>
                )}
                {isBooked && (
                  <Badge variant="neutral" icon={<Lock size={11} />}>
                    Booked
                  </Badge>
                )}
                {isUnavailable && (
                  <Badge variant="neutral" icon={<AlertTriangle size={11} />}>
                    Unavailable
                  </Badge>
                )}
                {status === 'available' && (
                  <Badge variant="success">Open</Badge>
                )}
              </div>

              <div className="slot-time" style={{ color: isSelected ? 'var(--brand-plum-900)' : undefined }}>
                {slot.label}
              </div>

              <div style={{ fontSize: '0.78rem', color: isSelected ? 'var(--brand-plum-700)' : 'var(--text-muted)' }}>
                {isBooked
                  ? 'Class occupied by member'
                  : isUnavailable
                  ? 'Acoustic tuning block'
                  : '1-on-1 Studio Mentorship'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
