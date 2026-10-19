import React, { useState } from 'react';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { mockBranches } from '../../data/mock';
import { useToast } from '../../context/ToastContext';
import { Settings, Save, Building, Clock, ShieldCheck, Palette } from 'lucide-react';

export const OwnerSettingsView: React.FC = () => {
  const { showToast } = useToast();

  const [brandName, setBrandName] = useState('APD MUSIC CLASS');
  const [brandColor, setBrandColor] = useState('#C654C3');
  const [operatingHours, setOperatingHours] = useState('8:00 AM - 6:00 PM');
  const [slotDuration, setSlotDuration] = useState('60 Minutes');

  // Branch addresses state (Configurable addresses as required: "make its full address configurable later")
  const [kokilaAddress, setKokilaAddress] = useState(
    mockBranches.find(b => b.id === 'kokila')?.address || ''
  );
  const [madhapurAddress, setMadhapurAddress] = useState(
    mockBranches.find(b => b.id === 'madhapur')?.address || ''
  );
  const [himayatnagarAddress, setHimayatnagarAddress] = useState(
    mockBranches.find(b => b.id === 'himayatnagar')?.address || ''
  );

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Studio parameters and campus addresses updated (Phase 1 local state).', 'success');
  };

  return (
    <div style={{ maxWidth: '840px' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Academy Configuration & Settings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Configure multi-branch locations, operating schedules, brand parameters, and administrative controls.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Brand & Identity */}
        <Card>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Palette size={18} color="var(--brand-primary)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Brand Identity & Theme</h3>
            </div>
          </CardHeader>
          <CardBody>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Brand Name</label>
                <input
                  type="text"
                  className="input"
                  value={brandName}
                  onChange={e => setBrandName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Primary Brand Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <input
                    type="color"
                    value={brandColor}
                    onChange={e => setBrandColor(e.target.value)}
                    style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: '1px solid var(--border-default)', padding: '2px' }}
                  />
                  <input
                    type="text"
                    className="input"
                    value={brandColor}
                    onChange={e => setBrandColor(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Operating Schedule */}
        <Card>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="var(--brand-primary)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Academy Operating Schedule</h3>
            </div>
          </CardHeader>
          <CardBody>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Operating Hours</label>
                <input
                  type="text"
                  className="input"
                  value={operatingHours}
                  onChange={e => setOperatingHours(e.target.value)}
                  placeholder="8:00 AM - 6:00 PM"
                  required
                />
                <span className="form-hint">Ten consecutive 1-hour sessions daily</span>
              </div>

              <div className="form-group">
                <label className="form-label">Slot Duration</label>
                <input
                  type="text"
                  className="input"
                  value={slotDuration}
                  readOnly
                  disabled
                />
                <span className="form-hint">Fixed 60-minute studio periods</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Studio Branch Addresses */}
        <Card>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building size={18} color="var(--brand-primary)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Configurable Studio Branch Addresses</h3>
            </div>
          </CardHeader>
          <CardBody style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Kokila */}
            <div className="form-group">
              <label className="form-label">
                Kokila Studio Campus Address (Exact Name: Kokila)
              </label>
              <textarea
                rows={2}
                className="textarea"
                value={kokilaAddress}
                onChange={e => setKokilaAddress(e.target.value)}
                required
              />
            </div>

            {/* Madhapur */}
            <div className="form-group">
              <label className="form-label">Madhapur Studio Campus Address</label>
              <textarea
                rows={2}
                className="textarea"
                value={madhapurAddress}
                onChange={e => setMadhapurAddress(e.target.value)}
                required
              />
            </div>

            {/* Himayatnagar */}
            <div className="form-group">
              <label className="form-label">Himayatnagar Heritage Studio Address</label>
              <textarea
                rows={2}
                className="textarea"
                value={himayatnagarAddress}
                onChange={e => setHimayatnagarAddress(e.target.value)}
                required
              />
            </div>
          </CardBody>
        </Card>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <Button type="submit" variant="primary" size="lg" icon={<Save size={17} />}>
            Save All Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
