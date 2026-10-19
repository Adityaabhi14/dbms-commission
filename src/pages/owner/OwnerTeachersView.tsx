import React, { useState } from 'react';
import { Teacher, InstrumentId, BranchId } from '../../types';
import { mockTeachers, mockInstruments, mockBranches } from '../../data/mock';
import { Card, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { formatDatePretty } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import {
  GraduationCap,
  Plus,
  Mail,
  Phone,
  Calendar,
  Building2,
  Music,
  Trash2,
  Edit2,
  Eye,
  Star,
  CheckCircle2
} from 'lucide-react';

export const OwnerTeachersView: React.FC = () => {
  const { showToast } = useToast();

  const [teachers, setTeachers] = useState<Teacher[]>(mockTeachers);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states for Add/Edit
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formInstruments, setFormInstruments] = useState<InstrumentId[]>(['guitar']);
  const [formBranches, setFormBranches] = useState<BranchId[]>(['madhapur']);
  const [formAvailability, setFormAvailability] = useState<'Full Time' | 'Part Time' | 'Weekend Specialist'>('Full Time');
  const [formStatus, setFormStatus] = useState<'Active' | 'On Leave' | 'Contract'>('Active');
  const [formBio, setFormBio] = useState('');

  const openAddModal = () => {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormInstruments(['guitar']);
    setFormBranches(['madhapur']);
    setFormAvailability('Full Time');
    setFormStatus('Active');
    setFormBio('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormName(teacher.name);
    setFormEmail(teacher.email);
    setFormPhone(teacher.phone);
    setFormInstruments(teacher.instrumentsTaught);
    setFormBranches(teacher.assignedBranches);
    setFormAvailability(teacher.availability);
    setFormStatus(teacher.employmentStatus);
    setFormBio(teacher.bio);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      showToast('Name and email are required', 'error');
      return;
    }

    const newTeacher: Teacher = {
      id: `APD-T-${Math.floor(210 + Math.random() * 80)}`,
      name: formName,
      email: formEmail,
      phone: formPhone || '+91 98000 00000',
      instrumentsTaught: formInstruments,
      assignedBranches: formBranches,
      availability: formAvailability,
      employmentStatus: formStatus,
      joiningDate: new Date().toISOString().split('T')[0],
      bio: formBio || 'Dedicated music educator passionate about foundational technique.',
      rating: 5.0
    };

    setTeachers(prev => [newTeacher, ...prev]);
    setIsAddModalOpen(false);
    showToast(`Faculty mentor ${formName} added to directory!`, 'success');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;

    setTeachers(prev =>
      prev.map(t =>
        t.id === editingTeacher.id
          ? {
              ...t,
              name: formName,
              email: formEmail,
              phone: formPhone,
              instrumentsTaught: formInstruments,
              assignedBranches: formBranches,
              availability: formAvailability,
              employmentStatus: formStatus,
              bio: formBio
            }
          : t
      )
    );

    setEditingTeacher(null);
    showToast(`Updated details for ${formName}`, 'success');
  };

  const handleDeleteConfirm = () => {
    if (!deletingTeacher) return;
    setTeachers(prev => prev.filter(t => t.id !== deletingTeacher.id));
    showToast(`Teacher ${deletingTeacher.name} removed from active roster.`, 'info');
    setDeletingTeacher(null);
  };

  const toggleInstrumentSelection = (id: InstrumentId) => {
    if (formInstruments.includes(id)) {
      if (formInstruments.length > 1) {
        setFormInstruments(formInstruments.filter(i => i !== id));
      } else {
        showToast('At least one instrument must be selected', 'warning');
      }
    } else {
      setFormInstruments([...formInstruments, id]);
    }
  };

  const toggleBranchSelection = (id: BranchId) => {
    if (formBranches.includes(id)) {
      if (formBranches.length > 1) {
        setFormBranches(formBranches.filter(b => b !== id));
      } else {
        showToast('At least one studio branch must be assigned', 'warning');
      }
    } else {
      setFormBranches([...formBranches, id]);
    }
  };

  return (
    <div>
      {/* Title */}
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Faculty & Mentors Directory</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Manage master instructors who teach multiple instruments across Madhapur, Kokila, and Himayatnagar campuses.
          </p>
        </div>

        <Button variant="primary" onClick={openAddModal} icon={<Plus size={16} />}>
          Add Faculty Mentor
        </Button>
      </div>

      {/* Teachers Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '1.5rem'
        }}
      >
        {teachers.map(teacher => (
          <Card key={teacher.id}>
            <CardBody style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--brand-primary-light)',
                      color: 'var(--brand-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.1rem'
                    }}
                  >
                    {teacher.name.slice(0, 2).toUpperCase()}
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{teacher.name}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ID: {teacher.id}
                    </span>
                  </div>
                </div>

                <Badge
                  variant={
                    teacher.employmentStatus === 'Active'
                      ? 'success'
                      : teacher.employmentStatus === 'On Leave'
                      ? 'warning'
                      : 'neutral'
                  }
                >
                  {teacher.employmentStatus}
                </Badge>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                  <Mail size={14} color="var(--brand-primary)" />
                  <span>{teacher.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                  <Phone size={14} color="var(--brand-primary)" />
                  <span>{teacher.phone}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                  <Calendar size={14} color="var(--brand-primary)" />
                  <span>Joined: {formatDatePretty(teacher.joiningDate)} • {teacher.availability}</span>
                </div>
              </div>

              {/* Multiple Instruments Taught */}
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Instruments Taught ({teacher.instrumentsTaught.length}):
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {teacher.instrumentsTaught.map(i => {
                    const inst = mockInstruments.find(item => item.id === i);
                    return (
                      <Badge key={i} variant="primary">
                        {inst?.imagePlaceholder} {inst?.name || i}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Multiple Assigned Branches */}
              <div style={{ marginBottom: '1rem', flex: 1 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Assigned Campuses ({teacher.assignedBranches.length}):
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {teacher.assignedBranches.map(b => {
                    const branch = mockBranches.find(item => item.id === b);
                    return (
                      <Badge key={b} variant="neutral">
                        <Building2 size={12} /> {branch?.name || b}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Actions Footer */}
              <div
                style={{
                  paddingTop: '0.85rem',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTeacher(teacher)}
                  icon={<Eye size={14} />}
                >
                  View Bio
                </Button>

                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(teacher)}
                    icon={<Edit2 size={13} />}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    style={{ color: 'var(--status-danger)' }}
                    onClick={() => setDeletingTeacher(teacher)}
                    icon={<Trash2 size={14} />}
                    title="Remove Teacher"
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* View Teacher Details Modal */}
      <Modal
        isOpen={!!selectedTeacher}
        onClose={() => setSelectedTeacher(null)}
        title={selectedTeacher ? `${selectedTeacher.name} — Faculty Profile` : ''}
      >
        {selectedTeacher && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#F59E0B' }}>
              <Star size={18} fill="#F59E0B" />
              <strong style={{ color: 'var(--text-primary)' }}>Student Rating: {selectedTeacher.rating} / 5.0</strong>
            </div>

            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.92rem' }}>
              {selectedTeacher.bio}
            </p>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Instruments Instructed
              </h4>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {selectedTeacher.instrumentsTaught.map(instId => {
                  const inst = mockInstruments.find(i => i.id === instId);
                  return (
                    <Badge key={instId} variant="primary">
                      {inst?.imagePlaceholder} {inst?.name}
                    </Badge>
                  );
                })}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Campus Allocations
              </h4>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {selectedTeacher.assignedBranches.map(branchId => {
                  const br = mockBranches.find(b => b.id === branchId);
                  return (
                    <Badge key={branchId} variant="neutral">
                      {br?.name} Campus
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add / Edit Teacher Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingTeacher}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTeacher(null);
        }}
        title={editingTeacher ? `Edit Faculty: ${editingTeacher.name}` : 'Add New Faculty Mentor'}
      >
        <form onSubmit={editingTeacher ? handleSaveEdit : handleSaveAdd}>
          <div className="form-group">
            <label className="form-label">
              Full Name <span className="required">*</span>
            </label>
            <input
              type="text"
              className="input"
              value={formName}
              onChange={e => setFormName(e.target.value)}
              placeholder="e.g. David Christopher"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div className="form-group">
              <label className="form-label">Email <span className="required">*</span></label>
              <input
                type="email"
                className="input"
                value={formEmail}
                onChange={e => setFormEmail(e.target.value)}
                placeholder="mentor@apdmusicclass.com"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                className="input"
                value={formPhone}
                onChange={e => setFormPhone(e.target.value)}
                placeholder="+91 98200 11445"
              />
            </div>
          </div>

          {/* Multiple Instruments Selection Checkboxes */}
          <div className="form-group">
            <label className="form-label">
              Instruments Taught (Select all that apply) <span className="required">*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.4rem' }}>
              {mockInstruments.map(inst => {
                const isChecked = formInstruments.includes(inst.id);
                return (
                  <button
                    key={inst.id}
                    type="button"
                    onClick={() => toggleInstrumentSelection(inst.id)}
                    style={{
                      padding: '0.45rem 0.65rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.78rem',
                      border: '1px solid',
                      borderColor: isChecked ? 'var(--brand-primary)' : 'var(--border-default)',
                      backgroundColor: isChecked ? 'var(--brand-lavender-100)' : '#FFFFFF',
                      color: isChecked ? 'var(--brand-plum-900)' : 'var(--text-primary)',
                      fontWeight: isChecked ? 700 : 500,
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <span>{inst.imagePlaceholder}</span>
                    <span>{inst.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Multiple Assigned Branches */}
          <div className="form-group">
            <label className="form-label">
              Assigned Campuses (Select all that apply) <span className="required">*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.4rem' }}>
              {mockBranches.map(branch => {
                const isChecked = formBranches.includes(branch.id);
                return (
                  <button
                    key={branch.id}
                    type="button"
                    onClick={() => toggleBranchSelection(branch.id)}
                    style={{
                      padding: '0.45rem 0.65rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.8rem',
                      border: '1px solid',
                      borderColor: isChecked ? 'var(--brand-primary)' : 'var(--border-default)',
                      backgroundColor: isChecked ? 'var(--brand-lavender-100)' : '#FFFFFF',
                      color: isChecked ? 'var(--brand-plum-900)' : 'var(--text-primary)',
                      fontWeight: isChecked ? 700 : 500,
                      textAlign: 'left'
                    }}
                  >
                    {branch.name} Campus
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div className="form-group">
              <label className="form-label">Availability</label>
              <select
                className="select"
                value={formAvailability}
                onChange={e => setFormAvailability(e.target.value as any)}
              >
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
                <option value="Weekend Specialist">Weekend Specialist</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="select"
                value={formStatus}
                onChange={e => setFormStatus(e.target.value as any)}
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Bio & Credentials</label>
            <textarea
              rows={3}
              className="textarea"
              value={formBio}
              onChange={e => setFormBio(e.target.value)}
              placeholder="e.g. Trinity Fellow with 12 years classical stage experience..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingTeacher(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingTeacher ? 'Save Changes' : 'Add to Faculty'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingTeacher}
        onClose={() => setDeletingTeacher(null)}
        title="Confirm Faculty Removal"
      >
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          Are you sure you want to remove <strong>{deletingTeacher?.name}</strong> from the APD Music Class faculty roster? Students assigned to this teacher will need to be reallocated.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <Button variant="outline" onClick={() => setDeletingTeacher(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Yes, Remove Teacher
          </Button>
        </div>
      </Modal>
    </div>
  );
};
