import React, { useState } from 'react';
import { mockInstruments } from '../../data/mock';
import { Card, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { formatCurrency } from '../../utils/formatters';
import { InstrumentId } from '../../types';
import { Search, ArrowRight, Music2, CheckCircle2 } from 'lucide-react';

interface InstrumentsPageProps {
  onStartBookingWithInstrument: (id: InstrumentId) => void;
}

export const InstrumentsPage: React.FC<InstrumentsPageProps> = ({
  onStartBookingWithInstrument
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Strings', 'Percussion', 'Wind', 'Indian Classical'];

  const filteredInstruments = mockInstruments.filter(inst => {
    const matchesCategory = selectedCategory === 'All' || inst.category === selectedCategory;
    const matchesSearch =
      inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.popularFor.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="section-py" style={{ minHeight: '85vh', backgroundColor: 'var(--surface-bg)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="eyebrow">Academic Curriculum</span>
          <h1 className="section-title">Instruments Catalogue</h1>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            Comprehensive training across seven foundational instruments. Customized instructional tracks spanning beginner fundamentals, theory, and stage performance.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            padding: '1.25rem',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          {/* Category Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  border: '1px solid',
                  borderColor: selectedCategory === cat ? 'var(--brand-primary)' : 'var(--border-default)',
                  backgroundColor: selectedCategory === cat ? 'var(--brand-primary)' : '#FFFFFF',
                  color: selectedCategory === cat ? '#FFFFFF' : 'var(--text-secondary)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
            <Search
              size={17}
              style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }}
            />
            <input
              type="text"
              placeholder="Search instruments or styles..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input"
              style={{ paddingLeft: '2.5rem', fontSize: '0.88rem' }}
            />
          </div>
        </div>

        {/* Instruments Grid */}
        {filteredInstruments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xl)' }}>
            <Music2 size={36} color="var(--brand-primary)" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No instruments matched your search</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Try searching for "Guitar", "Sitar", or clearing the category filter.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.75rem'
            }}
          >
            {filteredInstruments.map(inst => (
              <Card key={inst.id} interactive className="card">
                <CardBody style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '3rem', lineHeight: 1 }}>{inst.imagePlaceholder}</span>
                    <Badge variant="primary">{inst.category}</Badge>
                  </div>

                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                    {inst.name}
                  </h3>

                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem', flex: 1 }}>
                    {inst.longDescription}
                  </p>

                  {/* Highlights / Popular For */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.45rem' }}>
                      Key Focus Areas:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {inst.popularFor.map((item, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '0.74rem',
                            padding: '0.2rem 0.55rem',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--surface-bg)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-subtle)'
                          }}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pricing and Action */}
                  <div
                    style={{
                      paddingTop: '1rem',
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 'auto'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Starting Tuition</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {formatCurrency(inst.startingPricePerMonth)}
                        <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                          /mo
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      onClick={() => onStartBookingWithInstrument(inst.id)}
                      icon={<ArrowRight size={15} />}
                      iconPosition="right"
                    >
                      Explore Classes
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
