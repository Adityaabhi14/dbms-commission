import React, { useState, useMemo } from 'react';
import { Member, BranchId, InstrumentId } from '../../types';
import { mockMembers, mockInstruments, mockBranches } from '../../data/mock';
import { Card, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Drawer } from '../../components/common/Drawer';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import {
  calculateDaysRemaining,
  formatDatePretty,
  getExpiryStatus
} from '../../utils/formatters';
import {
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  RefreshCw,
  AlertTriangle,
  UserCheck,
  Mail,
  Phone,
  Calendar,
  Building,
  Music,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useQueryInspector } from '../../context/QueryInspectorContext';

export const OwnerMembersView: React.FC = () => {
  const { showToast } = useToast();
  const { logQuery } = useQueryInspector();

  const [members, setMembers] = useState<Member[]>(mockMembers);
  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [instrumentFilter, setInstrumentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Sorting
  const [sortField, setSortField] = useState<'name' | 'expiryDate' | 'daysRemaining' | 'status'>('daysRemaining');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  // Selected Member for Drawer
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Filtering & Sorting
  const filteredMembers = useMemo(() => {
    return members
      .filter(m => {
        const query = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !query ||
          m.name.toLowerCase().includes(query) ||
          m.email.toLowerCase().includes(query) ||
          m.id.toLowerCase().includes(query) ||
          m.phone.includes(query);

        const matchesBranch = branchFilter === 'all' || m.branchId === branchFilter;
        const matchesInstrument = instrumentFilter === 'all' || m.enrolledInstrumentId === instrumentFilter;
        const matchesStatus = statusFilter === 'all' || m.status === statusFilter;

        return matchesQuery && matchesBranch && matchesInstrument && matchesStatus;
      })
      .sort((a, b) => {
        if (sortField === 'name') {
          return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        }
        if (sortField === 'expiryDate') {
          return sortAsc
            ? new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
            : new Date(b.expiryDate).getTime() - new Date(a.expiryDate).getTime();
        }
        if (sortField === 'daysRemaining') {
          const daysA = calculateDaysRemaining(a.expiryDate);
          const daysB = calculateDaysRemaining(b.expiryDate);
          return sortAsc ? daysA - daysB : daysB - daysA;
        }
        if (sortField === 'status') {
          return sortAsc ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status);
        }
        return 0;
      });
  }, [members, searchQuery, branchFilter, instrumentFilter, statusFilter, sortField, sortAsc]);

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: 'name' | 'expiryDate' | 'daysRemaining' | 'status') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleRenewMember = (member: Member) => {
    logQuery({
      sourceButton: `Button: [Renew Membership — ${member.name}]`,
      pageContext: 'Owner Member Operations',
      type: 'TRANSACTION',
      primaryTable: 'memberships',
      relatedTables: ['notifications', 'audit_logs'],
      sql: `BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED;

-- 1. Extend membership expiry date by 3 calendar months (dynamic date arithmetic)
UPDATE memberships 
SET expiry_date = (expiry_date + INTERVAL '3 months')::DATE,
    status = 'ACTIVE',
    updated_at = NOW()
WHERE member_id = '${member.id}';

-- 2. Dispatch renewal notification record
INSERT INTO notifications (id, user_id, title, message, type, is_read)
VALUES (
  'NOTIF-${Math.floor(1000 + Math.random() * 8999)}', 
  (SELECT user_id FROM members WHERE id = '${member.id}'), 
  'Membership Extended (3 Months)', 
  'Your music enrollment has been successfully renewed. Thank you for continuing your musical journey!', 
  'BILLING', FALSE
);

-- 3. Audit trail
INSERT INTO audit_logs (id, entity_type, entity_id, action, performed_by_user_id)
VALUES ('AUD-${Math.floor(10000 + Math.random() * 89999)}', 'MEMBERSHIP', '${member.id}', 'RENEW_3_MONTHS', 'USR-O-001');

COMMIT;`,
      executionTimeMs: 4.1,
      rowsAffected: '1 membership renewed + 1 notification queued',
      isolationLevel: 'READ COMMITTED',
      dbmsConcept: 'ACID Transaction: PostgreSQL calendar-month arithmetic with atomic audit logging'
    });

    showToast(`Simulated renewal invoice sent to ${member.name}`, 'success');
  };

  return (
    <div>
      {/* Title */}
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Student Member Directory</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Manage enrollments, inspect expiry warnings, and monitor attendance progress across campuses.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => showToast('In Phase 1, member creation occurs via the student registration or booking flow.', 'info')}
        >
          + Add New Member
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card style={{ marginBottom: '1.5rem' }}>
        <CardBody style={{ padding: '1.25rem' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              alignItems: 'center'
            }}
          >
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}
              />
              <input
                type="text"
                placeholder="Search by ID, name, email..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="input"
                style={{ paddingLeft: '2.4rem' }}
              />
            </div>

            {/* Branch Filter */}
            <div>
              <select
                className="select"
                value={branchFilter}
                onChange={e => {
                  setBranchFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Studio Branches</option>
                <option value="madhapur">Madhapur Campus</option>
                <option value="kokila">Kokila Campus</option>
                <option value="himayatnagar">Himayatnagar Studio</option>
              </select>
            </div>

            {/* Instrument Filter */}
            <div>
              <select
                className="select"
                value={instrumentFilter}
                onChange={e => {
                  setInstrumentFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Instruments (7)</option>
                {mockInstruments.map(i => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                className="select"
                value={statusFilter}
                onChange={e => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Membership Statuses</option>
                <option value="Active">Active</option>
                <option value="Expiring Soon">Expiring Soon</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Table Card */}
      <Card>
        <CardBody style={{ padding: 0 }}>
          {paginatedMembers.length === 0 ? (
            <EmptyState
              title="No Members Found"
              description="No academy students matched your current search filters. Try clearing some filters."
              actionText="Reset Filters"
              onAction={() => {
                setSearchQuery('');
                setBranchFilter('all');
                setInstrumentFilter('all');
                setStatusFilter('all');
              }}
            />
          ) : (
            <div className="table-container" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Member ID</th>
                    <th className="sortable" onClick={() => handleSort('name')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span>Student Name</span>
                        <ArrowUpDown size={13} />
                      </div>
                    </th>
                    <th>Contact</th>
                    <th>Instrument</th>
                    <th>Campus</th>
                    <th>Plan</th>
                    <th>Start Date</th>
                    <th className="sortable" onClick={() => handleSort('expiryDate')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span>Expiry Date</span>
                        <ArrowUpDown size={13} />
                      </div>
                    </th>
                    <th className="sortable" onClick={() => handleSort('daysRemaining')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span>Days Left</span>
                        <ArrowUpDown size={13} />
                      </div>
                    </th>
                    <th className="sortable" onClick={() => handleSort('status')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span>Status</span>
                        <ArrowUpDown size={13} />
                      </div>
                    </th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedMembers.map(member => {
                    const inst = mockInstruments.find(i => i.id === member.enrolledInstrumentId);
                    const br = mockBranches.find(b => b.id === member.branchId);
                    const days = calculateDaysRemaining(member.expiryDate);
                    const expiry = getExpiryStatus(days);

                    return (
                      <tr key={member.id}>
                        <td style={{ fontWeight: 700, color: 'var(--brand-primary)', whiteSpace: 'nowrap' }}>
                          {member.id}
                        </td>
                        <td style={{ fontWeight: 700 }}>
                          <div>{member.name}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{member.email}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{member.phone}</div>
                        </td>
                        <td>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                            <span>{inst?.imagePlaceholder}</span>
                            <span>{inst?.name || member.enrolledInstrumentId}</span>
                          </span>
                        </td>
                        <td>{br?.name || member.branchId}</td>
                        <td style={{ textTransform: 'capitalize' }}>
                          <Badge variant="neutral">{member.planDuration.replace('-', ' ')}</Badge>
                        </td>
                        <td style={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                          {formatDatePretty(member.startDate)}
                        </td>
                        <td style={{ fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {formatDatePretty(member.expiryDate)}
                        </td>
                        <td>
                          {/* Expiry Warning Indicators */}
                          <Badge variant={expiry.variant}>
                            {days > 0 ? `${days}d` : `${Math.abs(days)}d ago`}
                          </Badge>
                        </td>
                        <td>
                          <Badge
                            variant={
                              member.status === 'Active'
                                ? 'success'
                                : member.status === 'Expiring Soon'
                                ? 'warning'
                                : 'danger'
                            }
                          >
                            {member.status}
                          </Badge>
                        </td>
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                logQuery({
                                  sourceButton: `Button: [Inspect Member — ${member.name}]`,
                                  pageContext: 'Student Directory Inspection',
                                  type: 'SELECT',
                                  primaryTable: 'members',
                                  relatedTables: ['users', 'memberships'],
                                  sql: `SELECT 
    m.id AS student_id,
    m.full_name,
    m.email,
    m.phone,
    m.enrolled_instrument_id,
    m.branch_id,
    ms.start_date,
    ms.expiry_date,
    (ms.expiry_date - CURRENT_DATE) AS days_remaining,
    ms.status AS membership_status,
    m.emergency_contact,
    m.notes
FROM members m
INNER JOIN memberships ms ON m.id = ms.member_id
WHERE m.id = '${member.id}'
LIMIT 1;`,
                                  executionTimeMs: 2.1,
                                  rowsAffected: '1 row retrieved',
                                  dbmsConcept: 'Single-row primary key lookup (members.id = $1)'
                                });
                                setSelectedMember(member);
                              }}
                              title="Inspect Member Details"
                              icon={<Eye size={15} />}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRenewMember(member)}
                              title="Renew Membership"
                              icon={<RefreshCw size={14} />}
                            >
                              Renew
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredMembers.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </CardBody>
      </Card>

      {/* Member Details Drawer */}
      <Drawer
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        title={selectedMember ? selectedMember.name : ''}
        subtitle={selectedMember ? `Student ID: ${selectedMember.id}` : ''}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button variant="outline" size="sm" onClick={() => setSelectedMember(null)}>
              Close
            </Button>
            {selectedMember && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  handleRenewMember(selectedMember);
                  setSelectedMember(null);
                }}
              >
                Send Renewal Invoice
              </Button>
            )}
          </div>
        }
      >
        {selectedMember && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div
              style={{
                padding: '1rem',
                backgroundColor: 'var(--surface-bg)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status</span>
                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{selectedMember.status}</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Days Remaining</span>
                <div style={{ fontWeight: 800, fontSize: '1.35rem', color: 'var(--brand-primary)' }}>
                  {calculateDaysRemaining(selectedMember.expiryDate)} days
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Mail size={16} color="var(--brand-primary)" />
                <span>{selectedMember.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Phone size={16} color="var(--brand-primary)" />
                <span>{selectedMember.phone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Music size={16} color="var(--brand-primary)" />
                <span>Enrolled in: <strong>{selectedMember.enrolledInstrumentId.toUpperCase()}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Building size={16} color="var(--brand-primary)" />
                <span>Campus: <strong>{selectedMember.branchId.toUpperCase()}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Calendar size={16} color="var(--brand-primary)" />
                <span>Enrollment: {formatDatePretty(selectedMember.startDate)} → {formatDatePretty(selectedMember.expiryDate)}</span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Curriculum Assessment Notes
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {selectedMember.notes || 'No custom notes logged.'}
              </p>
            </div>

            {selectedMember.emergencyContact && (
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Emergency Contact
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {selectedMember.emergencyContact}
                </p>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};
