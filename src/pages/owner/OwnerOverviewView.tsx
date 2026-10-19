import React from 'react';
import {
  mockMembers,
  mockTeachers,
  mockBookings,
  getFinancialSummary,
  mockInstruments,
  mockBranches
} from '../../data/mock';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { formatCurrency, calculateDaysRemaining } from '../../utils/formatters';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  TrendingUp,
  CreditCard,
  Receipt,
  Sparkles,
  AlertTriangle,
  Award,
  Building2
} from 'lucide-react';

export const OwnerOverviewView: React.FC<{ onNavigateTab: (tab: any) => void }> = ({ onNavigateTab }) => {
  const finance = getFinancialSummary();

  // Dynamic calculations from centralized member data
  const totalMembers = mockMembers.length;
  const activeMembers = mockMembers.filter(m => m.status === 'Active').length;
  
  // Expiring memberships: daysRemaining > 0 and <= 15
  const expiringMembers = mockMembers.filter(m => {
    const days = calculateDaysRemaining(m.expiryDate);
    return days > 0 && days <= 15;
  }).length;

  const totalTeachers = mockTeachers.length;
  const totalBookings = mockBookings.length;

  // Membership distribution by duration
  const distributionByDuration = {
    '1-month': mockMembers.filter(m => m.planDuration === '1-month').length,
    '3-months': mockMembers.filter(m => m.planDuration === '3-months').length,
    '6-months': mockMembers.filter(m => m.planDuration === '6-months').length,
    '12-months': mockMembers.filter(m => m.planDuration === '12-months').length
  };

  // Monthly revenue vs expenses mock dataset (Jan - Oct 2026)
  const monthlyTrends = [
    { month: 'Jun', rev: 142000, exp: 95000 },
    { month: 'Jul', rev: 168000, exp: 102000 },
    { month: 'Aug', rev: 185000, exp: 110000 },
    { month: 'Sep', rev: 198000, exp: 115000 },
    { month: 'Oct', rev: 215000, exp: 122000 }
  ];

  const maxTrendVal = 230000;

  return (
    <div>
      {/* Page Title */}
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Academy Executive Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Multi-branch operational performance, faculty allocations, and real-time revenue analytics.
          </p>
        </div>

        <Badge variant="primary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}>
          Real-time Central Engine
        </Badge>
      </div>

      {/* Top 10 Executive Metrics Cards (Grid of Cards) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.15rem',
          marginBottom: '2rem'
        }}
      >
        {/* Total Members */}
        <div className="metric-card" onClick={() => onNavigateTab('members')} style={{ cursor: 'pointer' }}>
          <div className="metric-header">
            <span className="metric-title">Total Members</span>
            <div className="metric-icon-badge">
              <Users size={18} />
            </div>
          </div>
          <div className="metric-value">{totalMembers}</div>
          <div className="metric-subtext">Registered across 3 campuses</div>
        </div>

        {/* Active Memberships */}
        <div className="metric-card" onClick={() => onNavigateTab('members')} style={{ cursor: 'pointer' }}>
          <div className="metric-header">
            <span className="metric-title">Active Members</span>
            <div className="metric-icon-badge" style={{ backgroundColor: 'var(--status-success-bg)', color: 'var(--status-success)' }}>
              <Sparkles size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ color: 'var(--status-success)' }}>{activeMembers}</div>
          <div className="metric-subtext">Currently enrolled & attending</div>
        </div>

        {/* Expiring Memberships */}
        <div className="metric-card" onClick={() => onNavigateTab('members')} style={{ cursor: 'pointer' }}>
          <div className="metric-header">
            <span className="metric-title">Expiring (&lt;15d)</span>
            <div className="metric-icon-badge" style={{ backgroundColor: 'var(--status-warning-bg)', color: 'var(--status-warning)' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ color: 'var(--status-warning)' }}>{expiringMembers}</div>
          <div className="metric-subtext">Require renewal follow-up</div>
        </div>

        {/* Total Teachers */}
        <div className="metric-card" onClick={() => onNavigateTab('teachers')} style={{ cursor: 'pointer' }}>
          <div className="metric-header">
            <span className="metric-title">Faculty Mentors</span>
            <div className="metric-icon-badge">
              <GraduationCap size={18} />
            </div>
          </div>
          <div className="metric-value">{totalTeachers}</div>
          <div className="metric-subtext">Certified master pedagogues</div>
        </div>

        {/* Total Bookings */}
        <div className="metric-card" onClick={() => onNavigateTab('enrollments')} style={{ cursor: 'pointer' }}>
          <div className="metric-header">
            <span className="metric-title">Class Bookings</span>
            <div className="metric-icon-badge">
              <CalendarCheck size={18} />
            </div>
          </div>
          <div className="metric-value">{totalBookings}</div>
          <div className="metric-subtext">Scheduled studio sessions</div>
        </div>

        {/* Total Revenue */}
        <div className="metric-card" onClick={() => onNavigateTab('reports')} style={{ cursor: 'pointer' }}>
          <div className="metric-header">
            <span className="metric-title">Recognized Revenue</span>
            <div className="metric-icon-badge" style={{ backgroundColor: 'var(--status-success-bg)', color: 'var(--status-success)' }}>
              <CreditCard size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: '1.65rem', color: 'var(--status-success)' }}>
            {formatCurrency(finance.recognizedRevenue)}
          </div>
          <div className="metric-subtext">Verified collections received</div>
        </div>

        {/* Total Expenses */}
        <div className="metric-card" onClick={() => onNavigateTab('expenses')} style={{ cursor: 'pointer' }}>
          <div className="metric-header">
            <span className="metric-title">Total Expenses</span>
            <div className="metric-icon-badge" style={{ backgroundColor: 'var(--status-danger-bg)', color: 'var(--status-danger)' }}>
              <Receipt size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: '1.65rem', color: 'var(--status-danger)' }}>
            {formatCurrency(finance.totalExpenses)}
          </div>
          <div className="metric-subtext">Rent, faculty payroll & ops</div>
        </div>

        {/* Net Profit */}
        <div className="metric-card" onClick={() => onNavigateTab('reports')} style={{ cursor: 'pointer' }}>
          <div className="metric-header">
            <span className="metric-title">Net Operating Profit</span>
            <div className="metric-icon-badge" style={{ backgroundColor: finance.netProfit >= 0 ? 'var(--brand-primary-light)' : 'var(--status-danger-bg)', color: 'var(--brand-primary)' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: '1.65rem', color: finance.netProfit >= 0 ? 'var(--brand-primary)' : 'var(--status-danger)' }}>
            {formatCurrency(finance.netProfit)}
          </div>
          <div className="metric-subtext">Revenue − Recorded expenses</div>
        </div>

        {/* Most Profitable Instrument */}
        <div className="metric-card" onClick={() => onNavigateTab('instruments')} style={{ cursor: 'pointer' }}>
          <div className="metric-header">
            <span className="metric-title">Top Instrument</span>
            <div className="metric-icon-badge">
              <Award size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ textTransform: 'capitalize', fontSize: '1.6rem' }}>
            {finance.mostProfitableInstrument}
          </div>
          <div className="metric-subtext">
            Highest tuition contributor ({formatCurrency(finance.revenueByInstrument[finance.mostProfitableInstrument])})
          </div>
        </div>

        {/* Most Profitable Branch */}
        <div className="metric-card" onClick={() => onNavigateTab('branches')} style={{ cursor: 'pointer' }}>
          <div className="metric-header">
            <span className="metric-title">Top Campus</span>
            <div className="metric-icon-badge">
              <Building2 size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ textTransform: 'capitalize', fontSize: '1.6rem' }}>
            {finance.mostProfitableBranch}
          </div>
          <div className="metric-subtext">
            Flagship yield ({formatCurrency(finance.revenueByBranch[finance.mostProfitableBranch])})
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
          gap: '1.75rem',
          marginBottom: '2rem'
        }}
      >
        {/* Chart 1: Revenue vs Expenses Over Time */}
        <Card>
          <CardHeader>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Revenue vs Expenses Over Time</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Monthly cashflow progression (Jun - Oct 2026)</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--brand-primary)', borderRadius: '2px' }} />
                <span>Revenue</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: '10px', height: '10px', backgroundColor: '#F87171', borderRadius: '2px' }} />
                <span>Expenses</span>
              </div>
            </div>
          </CardHeader>
          <CardBody style={{ padding: '1.5rem' }}>
            <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
              {monthlyTrends.map((item, idx) => {
                const revHeight = (item.rev / maxTrendVal) * 180;
                const expHeight = (item.exp / maxTrendVal) * 180;
                return (
                  <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                    <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '6px', height: '180px' }}>
                      {/* Revenue Bar */}
                      <div
                        style={{
                          width: '18px',
                          height: `${revHeight}px`,
                          backgroundColor: 'var(--brand-primary)',
                          borderRadius: '3px 3px 0 0',
                          transition: 'height 300ms ease'
                        }}
                        title={`${item.month} Revenue: ${formatCurrency(item.rev)}`}
                      />
                      {/* Expense Bar */}
                      <div
                        style={{
                          width: '18px',
                          height: `${expHeight}px`,
                          backgroundColor: '#F87171',
                          borderRadius: '3px 3px 0 0',
                          transition: 'height 300ms ease'
                        }}
                        title={`${item.month} Expenses: ${formatCurrency(item.exp)}`}
                      />
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>Operating Margin: +43.2%</span>
              <span>Formula: Net Profit = Recognized Revenue − Recorded Expenses</span>
            </div>
          </CardBody>
        </Card>

        {/* Chart 2: Revenue by Instrument */}
        <Card>
          <CardHeader>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Revenue by Instrument</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tuition earnings distribution across all 7 disciplines</p>
            </div>
          </CardHeader>
          <CardBody style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {mockInstruments.map(inst => {
                const rev = finance.revenueByInstrument[inst.id] || 0;
                const maxRev = Math.max(...Object.values(finance.revenueByInstrument), 1);
                const percent = Math.round((rev / maxRev) * 100);

                return (
                  <div key={inst.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span>{inst.imagePlaceholder}</span>
                        <span>{inst.name}</span>
                      </span>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {formatCurrency(rev)}
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--surface-bg)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${percent}%`,
                          height: '100%',
                          backgroundColor: inst.id === finance.mostProfitableInstrument ? 'var(--brand-primary)' : 'var(--brand-plum-600)',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Bottom 3 Grid Charts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
          gap: '1.5rem'
        }}
      >
        {/* Chart 3: Enrollments by Branch */}
        <Card>
          <CardHeader>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Enrollments by Branch</h3>
          </CardHeader>
          <CardBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {mockBranches.map(branch => {
                const count = mockMembers.filter(m => m.branchId === branch.id).length;
                const percent = Math.round((count / totalMembers) * 100);
                return (
                  <div key={branch.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 700 }}>{branch.name} Campus</span>
                      <span style={{ color: 'var(--text-muted)' }}>{count} students ({percent}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--surface-bg)', borderRadius: '5px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${percent}%`,
                          height: '100%',
                          backgroundColor: 'var(--brand-primary)',
                          borderRadius: '5px'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>

        {/* Chart 4: Membership Distribution by Duration */}
        <Card>
          <CardHeader>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Plan Duration Breakdown</h3>
          </CardHeader>
          <CardBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {[
                { label: '1 Month Explorer', count: distributionByDuration['1-month'], color: '#9CA3AF' },
                { label: '3 Months Foundation', count: distributionByDuration['3-months'], color: 'var(--brand-plum-600)' },
                { label: '6 Months Mastery', count: distributionByDuration['6-months'], color: 'var(--brand-primary)' },
                { label: '12 Months Artist Academy', count: distributionByDuration['12-months'], color: 'var(--status-success)' }
              ].map((tier, i) => {
                const percent = Math.round((tier.count / totalMembers) * 100) || 0;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: tier.color }} />
                      <span>{tier.label}</span>
                    </div>
                    <div style={{ fontWeight: 700 }}>
                      {tier.count} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({percent}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>

        {/* Chart 5: Membership Expiry Overview */}
        <Card>
          <CardHeader>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Membership Expiry Overview</h3>
          </CardHeader>
          <CardBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div
                style={{
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--status-danger-bg)',
                  border: '1px solid var(--status-danger-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--status-danger)' }}>Critical Expiry (&lt; 7 Days)</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--status-danger)' }}>Immediate renewal phone alert</div>
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--status-danger)' }}>
                  {mockMembers.filter(m => {
                    const d = calculateDaysRemaining(m.expiryDate);
                    return d > 0 && d <= 7;
                  }).length}
                </div>
              </div>

              <div
                style={{
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--status-warning-bg)',
                  border: '1px solid var(--status-warning-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--status-warning)' }}>Expiring Soon (8 - 15 Days)</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--status-warning)' }}>Send automated reminder email</div>
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--status-warning)' }}>
                  {mockMembers.filter(m => {
                    const d = calculateDaysRemaining(m.expiryDate);
                    return d > 7 && d <= 15;
                  }).length}
                </div>
              </div>

              <div
                style={{
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--status-success-bg)',
                  border: '1px solid var(--status-success-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--status-success)' }}>Healthy Active (&gt; 30 Days)</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--status-success)' }}>Regular ongoing attendance</div>
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--status-success)' }}>
                  {mockMembers.filter(m => calculateDaysRemaining(m.expiryDate) > 30).length}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
