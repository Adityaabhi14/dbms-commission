import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import { useToast } from '../../context/ToastContext';
import {
  mockMembers,
  mockInstruments,
  mockBranches,
  mockMembershipPlans,
  mockTimeSlots,
  mockPayments
} from '../../data/mock';
import { ClientNavbar, ClientNavTab } from '../../components/navigation/ClientNavbar';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  calculateDaysRemaining,
  formatDatePretty,
  formatCurrency,
  getExpiryStatus
} from '../../utils/formatters';
import {
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Award,
  CreditCard,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  CalendarPlus,
  RefreshCw
} from 'lucide-react';
import { BookingFlowPage } from '../../features/booking/BookingFlowPage';
import { InstrumentsPage } from '../public/InstrumentsPage';
import { InstrumentId, BranchId, MembershipDuration } from '../../types';

interface ClientPortalPageProps {
  onGoHome: () => void;
}

export const ClientPortalPage: React.FC<ClientPortalPageProps> = ({ onGoHome }) => {
  const { user, logout } = useAuth();
  const { bookingsList, startBookingWith } = useBooking();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<ClientNavTab>('overview');

  // Look up current member profile prioritizing live authenticated user
  const matchedMock = mockMembers.find(m => m.id === user?.memberId || m.email === user?.email);
  const currentMember = {
    id: user?.memberId || matchedMock?.id || 'APD-M-1001',
    name: user?.name || matchedMock?.name || 'Aarav Patel',
    email: user?.email || matchedMock?.email || 'aarav.patel@example.com',
    phone: user?.phone || matchedMock?.phone || '+91 98765 43210',
    enrolledInstrumentId: (matchedMock?.enrolledInstrumentId || 'piano') as InstrumentId,
    branchId: (matchedMock?.branchId || 'kokila') as BranchId,
    planDuration: (matchedMock?.planDuration || '3-months') as MembershipDuration,
    startDate: matchedMock?.startDate || '2026-08-15',
    expiryDate: matchedMock?.expiryDate || '2026-11-15',
    status: (matchedMock?.status || 'Active') as any,
    totalClassesAttended: matchedMock?.totalClassesAttended || 14,
    emergencyContact: matchedMock?.emergencyContact || '+91 98765 43219',
    notes: matchedMock?.notes || 'Interested in classical Indian fusion pieces.'
  };
  const instrument = mockInstruments.find(i => i.id === currentMember.enrolledInstrumentId) || mockInstruments[0];
  const branch = mockBranches.find(b => b.id === currentMember.branchId) || mockBranches[0];
  const plan = mockMembershipPlans.find(p => p.id === currentMember.planDuration) || mockMembershipPlans[0];

  // Dynamic days remaining calculation
  const daysRemaining = calculateDaysRemaining(currentMember.expiryDate);
  const expiryInfo = getExpiryStatus(daysRemaining);

  // Client's specific payments
  const clientPayments = mockPayments.filter(p => p.memberName === currentMember.name || p.memberEmail === currentMember.email);

  const handleStartBookingForTab = (instrumentId?: InstrumentId) => {
    startBookingWith(instrumentId);
    setActiveTab('booking');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--surface-bg)' }}>
      {/* Client Authenticated Navbar */}
      <ClientNavbar
        currentTab={activeTab}
        onSelectTab={setActiveTab}
        onLogout={() => {
          logout();
          onGoHome();
        }}
      />

      {/* Main Container */}
      <main className="container" style={{ paddingTop: '2rem', paddingBottom: '3.5rem' }}>
        {/* Authenticated Client Status Bar */}
        <div
          style={{
            padding: '0.65rem 1rem',
            backgroundColor: 'var(--brand-lavender-100)',
            border: '1px solid var(--brand-primary-border)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
            fontSize: '0.82rem',
            color: 'var(--brand-plum-900)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={16} color="var(--brand-primary)" />
            <span>
              <strong>Authenticated Client Session</strong> — Logged in as <strong>{currentMember.name}</strong> ({currentMember.id})
            </span>
          </div>
          <Badge variant="primary">Verified Student Account</Badge>
        </div>

        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div>
            {/* Top Welcome Title */}
            <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--brand-plum-900)' }}>
                  Hello, {currentMember.name} 👋
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Your personalized academy schedule, attendance records, and active membership privileges.
                </p>
              </div>

              <Button
                variant="primary"
                onClick={() => handleStartBookingForTab()}
                icon={<CalendarPlus size={16} />}
              >
                Book Next Session
              </Button>
            </div>

            {/* Active Membership Hero Card */}
            <div
              style={{
                backgroundColor: 'var(--brand-plum-900)',
                color: '#FFFFFF',
                borderRadius: 'var(--radius-xl)',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: 'var(--shadow-md)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  right: '-20px',
                  bottom: '-20px',
                  fontSize: '8rem',
                  opacity: 0.1,
                  userSelect: 'none',
                  pointerEvents: 'none'
                }}
              >
                {instrument.imagePlaceholder}
              </div>

              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.65rem',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'rgba(198, 84, 195, 0.25)',
                        color: '#FFFFFF',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        marginBottom: '0.5rem'
                      }}
                    >
                      Active Academy Membership
                    </span>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF' }}>
                      {instrument.name} Masterclass Program
                    </h2>
                    <p style={{ color: '#D8DBE5', fontSize: '0.88rem' }}>
                      Enrolled at <strong>{branch.name} Campus</strong> ({branch.area})
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: '#B0B5C6' }}>Days Remaining</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--brand-primary)', lineHeight: 1 }}>
                      {daysRemaining > 0 ? daysRemaining : 0}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#D8DBE5', marginTop: '0.2rem' }}>
                      {expiryInfo.label}
                    </div>
                  </div>
                </div>

                {/* 4 Metadata Chips */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '1rem',
                    paddingTop: '1.25rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.12)'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>MEMBERSHIP PLAN</div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#FFFFFF' }}>{plan.title}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>START DATE</div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#FFFFFF' }}>{formatDatePretty(currentMember.startDate)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>EXPIRY DATE</div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#FFFFFF' }}>{formatDatePretty(currentMember.expiryDate)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>CLASSES ATTENDED</div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#FFFFFF' }}>{currentMember.totalClassesAttended} Sessions Completed</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Two Column Grid: Upcoming Classes & Recent Bookings */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                gap: '1.75rem',
                marginBottom: '2rem'
              }}
            >
              {/* Upcoming Classes */}
              <Card>
                <CardHeader>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={18} color="var(--brand-primary)" />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Upcoming Scheduled Classes</h3>
                  </div>
                  <Badge variant="success">Confirmed</Badge>
                </CardHeader>
                <CardBody style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {bookingsList.slice(0, 3).map((bkg, idx) => (
                      <div
                        key={bkg.id}
                        style={{
                          padding: '1rem',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--surface-bg)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: 'var(--radius-md)',
                              backgroundColor: 'var(--brand-lavender-100)',
                              color: 'var(--brand-plum-900)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '1rem'
                            }}
                          >
                            {idx + 1}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                              {formatDatePretty(bkg.firstClassDate)}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--brand-plum-700)', fontWeight: 600 }}>
                              {bkg.slotLabel}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Kokila Flagship Pavilion • Mentor: Nandini S.
                            </div>
                          </div>
                        </div>

                        <Badge variant="success">Scheduled</Badge>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab('bookings')}
                      style={{ width: '100%' }}
                    >
                      View All Class Bookings →
                    </Button>
                  </div>
                </CardBody>
              </Card>

              {/* Recent Payment Records */}
              <Card>
                <CardHeader>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CreditCard size={18} color="var(--brand-primary)" />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recent Tuition Payments</h3>
                  </div>
                  <Badge variant="neutral">Verified</Badge>
                </CardHeader>
                <CardBody style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {clientPayments.map(p => (
                      <div
                        key={p.id}
                        style={{
                          padding: '0.85rem 1rem',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--surface-bg)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                            {formatCurrency(p.amount)}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {formatDatePretty(p.date)} • Mode: {p.method}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            Ref: {p.id} ({p.bookingId})
                          </div>
                        </div>

                        <Badge variant="success">Paid</Badge>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab('payments')}
                      style={{ width: '100%' }}
                    >
                      View Complete Invoices →
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        )}

        {/* 2. BROWSE INSTRUMENTS TAB */}
        {activeTab === 'instruments' && (
          <InstrumentsPage
            onStartBookingWithInstrument={instId => handleStartBookingForTab(instId)}
          />
        )}

        {/* 3. BOOK A CLASS TAB */}
        {activeTab === 'booking' && (
          <BookingFlowPage
            onGoToClientPortal={() => setActiveTab('overview')}
            onGoHome={() => setActiveTab('overview')}
          />
        )}

        {/* 4. MY MEMBERSHIP TAB */}
        {activeTab === 'membership' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: '1.25rem' }}>
              My Membership Details
            </h2>

            <Card style={{ marginBottom: '1.5rem' }}>
              <CardBody style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <Badge variant="success" style={{ marginBottom: '0.5rem' }}>
                      Status: {currentMember.status}
                    </Badge>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{plan.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      Member ID: <strong>{currentMember.id}</strong>
                    </p>
                  </div>

                  <div
                    style={{
                      padding: '0.75rem 1.25rem',
                      backgroundColor: 'var(--brand-lavender-100)',
                      borderRadius: 'var(--radius-md)',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', color: 'var(--brand-plum-700)', fontWeight: 700 }}>
                      DAYS REMAINING
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
                      {daysRemaining}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Enrolled Instrument</div>
                    <div style={{ fontWeight: 700 }}>{instrument.name} ({instrument.category})</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Studio Branch</div>
                    <div style={{ fontWeight: 700 }}>{branch.name} Campus</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Start Date</div>
                    <div style={{ fontWeight: 700 }}>{formatDatePretty(currentMember.startDate)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Expiry Date</div>
                    <div style={{ fontWeight: 700 }}>{formatDatePretty(currentMember.expiryDate)}</div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                    Active Plan Privileges Included:
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.5rem' }}>
                    {plan.features.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                        <CheckCircle2 size={15} color="var(--brand-primary)" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <Button
                    variant="primary"
                    onClick={() => {
                      showToast('Renewal booking initiated in booking engine.', 'info');
                      setActiveTab('booking');
                    }}
                    icon={<RefreshCw size={15} />}
                  >
                    Renew Membership Early
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      showToast('Demonstration membership card downloaded (mock PDF)', 'success');
                    }}
                    icon={<FileText size={15} />}
                  >
                    Download Membership Card
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* 5. MY BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.65rem', fontWeight: 800 }}>My Class Bookings</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Scheduled 1-on-1 and practice room reservations across studios.
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => handleStartBookingForTab()}
                icon={<CalendarPlus size={15} />}
              >
                Book New Slot
              </Button>
            </div>

            <Card>
              <CardBody style={{ padding: 0 }}>
                <div className="table-container" style={{ border: 'none' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Booking ID</th>
                        <th>Instrument</th>
                        <th>Branch</th>
                        <th>Class Date</th>
                        <th>Time Slot</th>
                        <th>Fee Paid</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookingsList.map(bkg => {
                        const inst = mockInstruments.find(i => i.id === bkg.instrumentId);
                        const br = mockBranches.find(b => b.id === bkg.branchId);
                        return (
                          <tr key={bkg.id}>
                            <td style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>{bkg.id}</td>
                            <td>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                                <span>{inst?.imagePlaceholder}</span>
                                <span>{inst?.name || bkg.instrumentId}</span>
                              </span>
                            </td>
                            <td>{br?.name || bkg.branchId}</td>
                            <td style={{ fontWeight: 600 }}>{formatDatePretty(bkg.firstClassDate)}</td>
                            <td>
                              <Badge variant="primary">{bkg.slotLabel}</Badge>
                            </td>
                            <td style={{ fontWeight: 700 }}>{formatCurrency(bkg.totalPayable)}</td>
                            <td>
                              <Badge variant="success">{bkg.bookingStatus}</Badge>
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
        )}

        {/* 6. PAYMENT HISTORY TAB */}
        {activeTab === 'payments' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Payment & Receipt History</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Verified records of all tuition payments and membership dues.
              </p>
            </div>

            <Card>
              <CardBody style={{ padding: 0 }}>
                <div className="table-container" style={{ border: 'none' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Receipt #</th>
                        <th>Date</th>
                        <th>Booking Ref</th>
                        <th>Payment Mode</th>
                        <th>Amount Paid</th>
                        <th>Status</th>
                        <th>Receipt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientPayments.map(p => (
                        <tr key={p.id}>
                          <td style={{ fontWeight: 700 }}>{p.id}</td>
                          <td>{formatDatePretty(p.date)}</td>
                          <td style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>{p.bookingId}</td>
                          <td>{p.method}</td>
                          <td style={{ fontWeight: 800 }}>{formatCurrency(p.amount)}</td>
                          <td>
                            <Badge variant="success">{p.status}</Badge>
                          </td>
                          <td>
                            <button
                              onClick={() => showToast(`Mock Receipt ${p.id} downloaded`, 'success')}
                              style={{ color: 'var(--brand-primary)', fontSize: '0.82rem', fontWeight: 600 }}
                            >
                              Download PDF
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* 7. MY PROFILE TAB */}
        {activeTab === 'profile' && (
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: '1.25rem' }}>
              My Student Profile
            </h2>

            <Card>
              <CardBody style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
                  <div
                    style={{
                      width: '68px',
                      height: '68px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--brand-lavender-200)',
                      color: 'var(--brand-plum-900)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.75rem',
                      fontWeight: 800
                    }}
                  >
                    {currentMember.name.slice(0, 2).toUpperCase()}
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>{currentMember.name}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Academy Member ID: <strong>{currentMember.id}</strong>
                    </p>
                    <Badge variant="success" style={{ marginTop: '0.35rem' }}>
                      Active Member
                    </Badge>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="input" defaultValue={currentMember.name} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input className="input" defaultValue={currentMember.email} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input className="input" defaultValue={currentMember.phone} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Emergency Contact</label>
                    <input className="input" defaultValue={currentMember.emergencyContact || '+91 98765 43219'} />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Faculty Notes & Assessment Focus</label>
                  <textarea className="textarea" rows={2} defaultValue={currentMember.notes || ''} readOnly />
                </div>

                <Button
                  variant="primary"
                  onClick={() => showToast('Profile details updated (Phase 1 local simulation).', 'success')}
                >
                  Save Profile Changes
                </Button>
              </CardBody>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};
