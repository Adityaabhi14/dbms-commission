import React, { useState, useMemo } from 'react';
import {
  mockPayments,
  mockExpenses,
  mockInstruments,
  mockBranches
} from '../../data/mock';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { formatCurrency, formatDatePretty } from '../../utils/formatters';
import {
  CreditCard,
  Receipt,
  TrendingUp,
  AlertCircle,
  Award,
  Building,
  Filter,
  Download,
  Info
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const OwnerFinanceReportsView: React.FC = () => {
  const { showToast } = useToast();

  const [dateRange, setDateRange] = useState<'All Time' | 'This Quarter' | 'This Month'>('All Time');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedInstrument, setSelectedInstrument] = useState<string>('all');

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return mockPayments.filter(p => {
      const matchesBranch = selectedBranch === 'all' || p.branchId === selectedBranch;
      const matchesInstrument = selectedInstrument === 'all' || p.instrumentId === selectedInstrument;
      return matchesBranch && matchesInstrument;
    });
  }, [selectedBranch, selectedInstrument]);

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return mockExpenses.filter(e => {
      const matchesBranch = selectedBranch === 'all' || e.branchId === selectedBranch;
      return matchesBranch;
    });
  }, [selectedBranch]);

  // Financial Computations according to required formula
  // Distinguish cash actually received from amounts merely billed:
  const collectedPayments = filteredPayments
    .filter(p => p.status === 'Collected')
    .reduce((sum, p) => sum + p.amount, 0);

  const outstandingPayments = filteredPayments
    .filter(p => p.status === 'Pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const refunds = filteredPayments
    .filter(p => p.status === 'Refunded')
    .reduce((sum, p) => sum + p.amount, 0);

  // Gross Revenue = All billed amounts (Collected + Pending)
  const grossRevenue = collectedPayments + outstandingPayments;

  // Recognized Revenue = Cash actually received / collected
  const recognizedRevenue = collectedPayments;

  const totalRecordedExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const teacherCompensation = filteredExpenses
    .filter(e => e.category === 'Teacher Compensation')
    .reduce((sum, e) => sum + e.amount, 0);

  const operatingExpenses = totalRecordedExpenses - teacherCompensation;

  // MANDATORY FORMULA: Net profit = Recognized revenue - Recorded expenses
  const netProfit = recognizedRevenue - totalRecordedExpenses;

  // Instrument Ranking
  const instrumentRevenues = useMemo(() => {
    const map: Record<string, number> = {};
    mockInstruments.forEach(i => (map[i.id] = 0));
    filteredPayments.forEach(p => {
      if (p.status === 'Collected') {
        map[p.instrumentId] = (map[p.instrumentId] || 0) + p.amount;
      }
    });

    return Object.entries(map)
      .map(([id, amount]) => {
        const inst = mockInstruments.find(i => i.id === id);
        return { id, name: inst?.name || id, icon: inst?.imagePlaceholder || '🎵', amount };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [filteredPayments]);

  // Branch Ranking
  const branchRevenues = useMemo(() => {
    const map: Record<string, number> = {};
    mockBranches.forEach(b => (map[b.id] = 0));
    filteredPayments.forEach(p => {
      if (p.status === 'Collected') {
        map[p.branchId] = (map[p.branchId] || 0) + p.amount;
      }
    });

    return Object.entries(map)
      .map(([id, amount]) => {
        const br = mockBranches.find(b => b.id === id);
        return { id, name: br?.name || id, area: br?.area || '', amount };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [filteredPayments]);

  return (
    <div>
      {/* Page Title */}
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Financial Performance & Accounting</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Accrual vs. collected tuition cashflows, faculty compensations, operating margins, and profitability rankings.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => showToast('Financial ledger statement exported (Demonstration CSV).', 'success')}
          icon={<Download size={15} />}
        >
          Export Financial Report
        </Button>
      </div>

      {/* Filters Bar */}
      <Card style={{ marginBottom: '1.75rem' }}>
        <CardBody style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>
              <Filter size={16} color="var(--brand-primary)" />
              <span>Report Filters:</span>
            </div>

            {/* Date Range */}
            <div>
              <select className="select" value={dateRange} onChange={e => setDateRange(e.target.value as any)}>
                <option value="All Time">All Accounting Periods</option>
                <option value="This Quarter">Current Quarter (Q3 2026)</option>
                <option value="This Month">October 2026</option>
              </select>
            </div>

            {/* Branch */}
            <div>
              <select className="select" value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)}>
                <option value="all">All Campuses</option>
                <option value="madhapur">Madhapur Campus</option>
                <option value="kokila">Kokila Campus</option>
                <option value="himayatnagar">Himayatnagar Studio</option>
              </select>
            </div>

            {/* Instrument */}
            <div>
              <select className="select" value={selectedInstrument} onChange={e => setSelectedInstrument(e.target.value)}>
                <option value="all">All Instruments</option>
                {mockInstruments.map(i => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>
            </div>

            {(selectedBranch !== 'all' || selectedInstrument !== 'all' || dateRange !== 'All Time') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedBranch('all');
                  setSelectedInstrument('all');
                  setDateRange('All Time');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Primary Financial Metric Cards (7 Required Distinct Values) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem'
        }}
      >
        {/* Gross Revenue */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Gross Revenue (Billed)</span>
            <div className="metric-icon-badge">
              <CreditCard size={18} />
            </div>
          </div>
          <div className="metric-value">{formatCurrency(grossRevenue)}</div>
          <div className="metric-subtext">Total tuition invoices generated</div>
        </div>

        {/* Collected Payments */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Collected Payments</span>
            <div className="metric-icon-badge" style={{ backgroundColor: 'var(--status-success-bg)', color: 'var(--status-success)' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ color: 'var(--status-success)' }}>
            {formatCurrency(collectedPayments)}
          </div>
          <div className="metric-subtext">Verified cash received in bank</div>
        </div>

        {/* Outstanding Payments */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Outstanding / Pending</span>
            <div className="metric-icon-badge" style={{ backgroundColor: 'var(--status-warning-bg)', color: 'var(--status-warning)' }}>
              <AlertCircle size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ color: 'var(--status-warning)' }}>
            {formatCurrency(outstandingPayments)}
          </div>
          <div className="metric-subtext">Due invoices awaiting collection</div>
        </div>

        {/* Operating Expenses */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Operating Expenses</span>
            <div className="metric-icon-badge" style={{ backgroundColor: 'var(--status-danger-bg)', color: 'var(--status-danger)' }}>
              <Receipt size={18} />
            </div>
          </div>
          <div className="metric-value">{formatCurrency(operatingExpenses)}</div>
          <div className="metric-subtext">Studio rents, acoustics & utilities</div>
        </div>

        {/* Teacher Compensation */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Teacher Compensation</span>
            <div className="metric-icon-badge" style={{ backgroundColor: 'var(--brand-primary-light)', color: 'var(--brand-primary)' }}>
              <Award size={18} />
            </div>
          </div>
          <div className="metric-value">{formatCurrency(teacherCompensation)}</div>
          <div className="metric-subtext">Faculty payroll & masterclass fees</div>
        </div>

        {/* Refunds */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Refunds & Reversals</span>
            <div className="metric-icon-badge" style={{ backgroundColor: '#F1F2F6', color: 'var(--text-muted)' }}>
              <Receipt size={18} />
            </div>
          </div>
          <div className="metric-value">{formatCurrency(refunds)}</div>
          <div className="metric-subtext">Processed student cancellations</div>
        </div>

        {/* Net Profit / Loss */}
        <div className="metric-card" style={{ border: '2px solid var(--brand-primary)', backgroundColor: 'var(--brand-lavender-50)' }}>
          <div className="metric-header">
            <span className="metric-title" style={{ color: 'var(--brand-plum-900)' }}>
              Net Profit / (Loss)
            </span>
            <div className="metric-icon-badge" style={{ backgroundColor: 'var(--brand-primary)', color: '#FFFFFF' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ color: netProfit >= 0 ? 'var(--brand-primary)' : 'var(--status-danger)' }}>
            {formatCurrency(netProfit)}
          </div>
          <div className="metric-subtext" style={{ fontWeight: 600, color: 'var(--brand-plum-700)' }}>
            Net profit = Recognized revenue − Recorded expenses
          </div>
        </div>
      </div>

      {/* Two Column Profitability Rankings */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.75rem',
          marginBottom: '2rem'
        }}
      >
        {/* Most Profitable Instrument Ranking */}
        <Card>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={18} color="var(--brand-primary)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                Most Profitable Instrument Ranking
              </h3>
            </div>
            <Badge variant="primary">Tuition Yield</Badge>
          </CardHeader>
          <CardBody style={{ padding: 0 }}>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Instrument</th>
                    <th style={{ textAlign: 'right' }}>Collected Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {instrumentRevenues.map((item, idx) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 800, color: idx === 0 ? 'var(--brand-primary)' : 'var(--text-muted)' }}>
                        #{idx + 1}
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span>{item.icon}</span>
                          <span>{item.name}</span>
                          {idx === 0 && <Badge variant="success">Top Earner</Badge>}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        {/* Most Profitable Branch Ranking */}
        <Card>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building size={18} color="var(--brand-primary)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                Most Profitable Campus Ranking
              </h3>
            </div>
            <Badge variant="primary">Campus Yield</Badge>
          </CardHeader>
          <CardBody style={{ padding: 0 }}>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Campus</th>
                    <th style={{ textAlign: 'right' }}>Collected Tuition</th>
                  </tr>
                </thead>
                <tbody>
                  {branchRevenues.map((item, idx) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 800, color: idx === 0 ? 'var(--brand-primary)' : 'var(--text-muted)' }}>
                        #{idx + 1}
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        <div>{item.name} Campus</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.area}</div>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Illustrative Notice */}
      <div
        style={{
          padding: '0.85rem 1.25rem',
          backgroundColor: 'var(--surface-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.82rem',
          color: 'var(--text-muted)'
        }}
      >
        <Info size={18} color="var(--brand-primary)" style={{ flexShrink: 0 }} />
        <span>
          Note: Demonstration figures shown above are illustrative samples generated for Phase 1 frontend architecture and testing. Real payment gateway reconciliation will be attached in subsequent phases.
        </span>
      </div>
    </div>
  );
};
