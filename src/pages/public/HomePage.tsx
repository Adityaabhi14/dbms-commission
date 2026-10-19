import React, { useState } from 'react';
import {
  Music,
  ArrowRight,
  Sparkles,
  MapPin,
  Calendar,
  CheckCircle2,
  Volume2,
  Award,
  ChevronDown,
  ChevronUp,
  Send,
  Clock,
  ShieldCheck,
  Star
} from 'lucide-react';
import { mockInstruments, mockBranches, mockMembershipPlans } from '../../data/mock';
import { Button } from '../../components/common/Button';
import { Card, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { formatCurrency } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import { InstrumentId, BranchId } from '../../types';

interface HomePageProps {
  onStartBooking: (instrumentId?: InstrumentId, branchId?: BranchId) => void;
  onNavigateSection: (sectionId: string) => void;
  onNavigateAuth: (type: 'client-login' | 'client-register' | 'owner-login') => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onStartBooking,
  onNavigateSection,
  onNavigateAuth
}) => {
  const { showToast } = useToast();

  // Contact Form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactBranch, setContactBranch] = useState('madhapur');
  const [contactInstrument, setContactInstrument] = useState('guitar');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSubmitting, setContactSubmitting] = useState(false);

  // FAQ Accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does daily class scheduling work across the 10 slots?',
      a: 'The academy conducts ten consecutive one-hour sessions every single day between 8:00 AM and 6:00 PM. Each member can reserve their regular weekly slots or flexibly reschedule up to 24 hours in advance via the Client Portal.'
    },
    {
      q: 'Do I need to own an instrument before joining my first class?',
      a: 'No! All three APD studios (Madhapur, Kokila, and Himayatnagar) maintain soundproofed rehearsal rooms stocked with master-grade acoustic grand pianos, guitars, drum sets, sitars, and brass instruments for studio use.'
    },
    {
      q: 'Can I switch my branch or instrument during my membership?',
      a: 'Yes. With our multi-branch architecture, members enrolled in 3, 6, or 12-month plans have flexibility to practice or reschedule across branches based on faculty and room availability.'
    },
    {
      q: 'Are classes 1-on-1 mentorship or group batches?',
      a: 'We prioritize personalized 1-on-1 mentorship so each student receives direct technical attention, posture correction, and tailored musical progression at their individual pace.'
    },
    {
      q: 'Does APD Music Class prepare students for certified board exams?',
      a: 'Yes. Our curriculum thoroughly trains students for Trinity College London, ABRSM, and Pracheen Kala Kendra examination certifications.'
    }
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail) {
      showToast('Please provide your name and email address', 'error');
      return;
    }
    setContactSubmitting(true);
    setTimeout(() => {
      setContactSubmitting(false);
      showToast('Thank you! Our studio counselor will contact you shortly.', 'success');
      setContactName('');
      setContactEmail('');
      setContactPhone('');
      setContactMsg('');
    }, 600);
  };

  return (
    <div className="page-wrapper">
      {/* 1. HERO SECTION */}
      <section
        style={{
          position: 'relative',
          backgroundColor: 'var(--brand-plum-900)',
          color: '#FFFFFF',
          paddingTop: '5.5rem',
          paddingBottom: '5.5rem',
          overflow: 'hidden'
        }}
      >
        {/* Subtle background audio waveform effect */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.08,
            backgroundImage: `radial-gradient(var(--brand-primary) 1.5px, transparent 1.5px)`,
            backgroundSize: '28px 28px',
            pointerEvents: 'none'
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '3.5rem',
              alignItems: 'center'
            }}
          >
            {/* Left: Headline & Actions */}
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(198, 84, 195, 0.2)',
                  border: '1px solid rgba(198, 84, 195, 0.4)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  marginBottom: '1.25rem',
                  letterSpacing: '0.04em'
                }}
              >
                <Sparkles size={14} color="var(--brand-primary)" />
                HYDERABAD’S PREMIER MUSIC ACADEMY
              </div>

              <h1
                style={{
                  fontSize: 'clamp(2.4rem, 5vw, 3.6rem)',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  lineHeight: 1.15,
                  letterSpacing: '-0.03em',
                  marginBottom: '1.25rem'
                }}
              >
                Find Your Rhythm.{' '}
                <span
                  style={{
                    color: 'var(--brand-primary)',
                    display: 'inline-block'
                  }}
                >
                  Master Your Instrument.
                </span>
              </h1>

              <p
                style={{
                  fontSize: '1.15rem',
                  color: '#D1D5E2',
                  lineHeight: 1.6,
                  marginBottom: '2rem',
                  maxWidth: '540px'
                }}
              >
                World-class 1-on-1 mentorship across 7 master instruments and 3 soundproofed studios in <strong>Madhapur, Kokila, and Himayatnagar</strong>. Ten daily sessions from 8:00 AM to 6:00 PM.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
                <Button
                  size="lg"
                  variant="primary"
                  onClick={() => onStartBooking()}
                  icon={<ArrowRight size={18} />}
                  iconPosition="right"
                >
                  Book Your First Class
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => onNavigateSection('instruments')}
                  style={{ color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)' }}
                >
                  Explore Instruments
                </Button>
              </div>

              {/* Quick Academy Stats */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '1.5rem',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.12)'
                }}
              >
                <div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
                    3
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>Studio Campuses</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
                    7
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>Instruments</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
                    10
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>Daily Class Slots</div>
                </div>
              </div>
            </div>

            {/* Right: Interactive Live Visual Showcase */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '2rem',
                  backdropFilter: 'blur(8px)',
                  boxShadow: 'var(--shadow-xl)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                    <span style={{ fontSize: '0.85rem', color: '#E5E7EB', fontWeight: 600 }}>
                      Live Studio Schedule • Today
                    </span>
                  </div>
                  <Badge variant="primary">Hyderabad</Badge>
                </div>

                {/* Animated Instrument Visuals Bar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {[
                    { inst: 'Piano Masterclass', branch: 'Kokila Campus', slot: '10:00 AM–11:00 AM', icon: '🎹', teacher: 'Nandini S.' },
                    { inst: 'Acoustic Guitar', branch: 'Madhapur Studio', slot: '11:00 AM–12:00 PM', icon: '🎸', teacher: 'David C.' },
                    { inst: 'Indian Classical Sitar', branch: 'Himayatnagar', slot: '2:00 PM–3:00 PM', icon: '🪕', teacher: 'Pt. Someshwar' },
                    { inst: 'Percussion Drum Kit', branch: 'Kokila Campus', slot: '4:00 PM–5:00 PM', icon: '🥁', teacher: 'Vikramaditya' }
                  ].map((row, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '0.85rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.4rem' }}>{row.icon}</span>
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF' }}>{row.inst}</div>
                          <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{row.branch} • Mentor: {row.teacher}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--brand-primary)', fontWeight: 600 }}>
                        {row.slot}
                      </span>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: '1.5rem',
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(198, 84, 195, 0.15)',
                    border: '1px solid rgba(198, 84, 195, 0.3)',
                    textAlign: 'center'
                  }}
                >
                  <span style={{ fontSize: '0.82rem', color: '#F3E8F5' }}>
                    Enrollment is active across all 3 studios • 10 consecutive hours daily
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED INSTRUMENTS SECTION */}
      <section id="instruments" className="section-py" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span className="eyebrow">Disciplines & Masterclasses</span>
            <h2 className="section-title">Explore Our 7 Master Instruments</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              From intimate acoustic fingerpicking to orchestral grand piano and traditional Indian Classical sitar, choose your artistic voice.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2.5rem'
            }}
          >
            {mockInstruments.map(inst => (
              <Card key={inst.id} interactive className="card">
                <CardBody style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '2.75rem', lineHeight: 1 }}>{inst.imagePlaceholder}</span>
                    <Badge variant="primary">{inst.category}</Badge>
                  </div>

                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                    {inst.name}
                  </h3>

                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem', flex: 1 }}>
                    {inst.description}
                  </p>

                  <div style={{ padding: '0.75rem 0', borderTop: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tuition Starts At</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {formatCurrency(inst.startingPricePerMonth)}
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}> / month</span>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    style={{ width: '100%' }}
                    onClick={() => onStartBooking(inst.id)}
                    icon={<ArrowRight size={15} />}
                    iconPosition="right"
                  >
                    Explore Classes
                  </Button>
                </CardBody>
              </Card>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <Button variant="outline" size="lg" onClick={() => onNavigateSection('instruments')}>
              View Detailed Instruments Catalogue →
            </Button>
          </div>
        </div>
      </section>

      {/* 3. STUDIO LOCATIONS SECTION */}
      <section id="locations" className="section-py" style={{ backgroundColor: 'var(--surface-bg)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span className="eyebrow">Acoustic Studio Campuses</span>
            <h2 className="section-title">Three Premier Studios in Hyderabad</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Strategically situated in Madhapur, Kokila, and Himayatnagar with customized acoustic soundproofing, instrument suites, and parking.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.75rem'
            }}
          >
            {mockBranches.map(branch => (
              <Card key={branch.id} interactive>
                <CardBody style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '2.25rem' }}>{branch.imagePlaceholder}</span>
                    <div>
                      <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>{branch.name} Campus</h3>
                      <span style={{ fontSize: '0.8rem', color: 'var(--brand-primary)', fontWeight: 600 }}>
                        {branch.area}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    <MapPin size={17} color="var(--brand-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{branch.address}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    <Clock size={16} />
                    <span>Schedule: <strong>{branch.dailyClassHours}</strong> (10 daily sessions)</span>
                  </div>

                  <div style={{ marginBottom: '1.5rem', flex: 1 }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Available Instruments ({branch.availableInstruments.length}/7):
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {branch.availableInstruments.map(instId => {
                        const inst = mockInstruments.find(i => i.id === instId);
                        return (
                          <Badge key={instId} variant="primary">
                            {inst?.name || instId}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    style={{ width: '100%' }}
                    onClick={() => onStartBooking(undefined, branch.id)}
                    icon={<ArrowRight size={15} />}
                    iconPosition="right"
                  >
                    Choose This Studio
                  </Button>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 4. MEMBERSHIP PLANS PREVIEW */}
      <section id="plans" className="section-py" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span className="eyebrow">Milestone Progressions</span>
            <h2 className="section-title">Transparent Membership Plans</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Flexible terms tailored to your learning pace. Extended commitments include priority slot reservation, masterclass stage recitals, and studio demo recording.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}
          >
            {mockMembershipPlans.map(plan => (
              <Card key={plan.id} interactive style={{ position: 'relative' }}>
                {plan.badge && (
                  <div style={{ position: 'absolute', top: '14px', right: '14px' }}>
                    <Badge variant={plan.discountPercentage >= 20 ? 'success' : 'primary'}>
                      {plan.badge}
                    </Badge>
                  </div>
                )}
                <CardBody style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                    {plan.title}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    {plan.description}
                  </p>

                  <div style={{ padding: '0.85rem', backgroundColor: 'var(--surface-bg)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Commitment Horizon</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
                      {plan.months} Month{plan.months > 1 ? 's' : ''}
                    </div>
                    {plan.discountPercentage > 0 ? (
                      <span style={{ fontSize: '0.75rem', color: 'var(--status-success)', fontWeight: 700 }}>
                        Includes {plan.discountPercentage}% Term Savings
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Standard monthly rate
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', flex: 1 }}>
                    {plan.features.map((feat, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        <CheckCircle2 size={15} color="var(--brand-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    style={{ width: '100%' }}
                    onClick={() => onStartBooking()}
                  >
                    Select Plan
                  </Button>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 5. BENEFITS OF LEARNING */}
      <section className="section-py" style={{ backgroundColor: 'var(--brand-charcoal-900)', color: '#FFFFFF' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.3rem 0.85rem',
                backgroundColor: 'rgba(198, 84, 195, 0.25)',
                color: '#FFFFFF',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '1rem'
              }}
            >
              The APD Standard
            </span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.75rem' }}>
              Why Musicians Choose APD Music Class
            </h2>
            <p style={{ color: '#A5A9B8', maxWidth: '640px', margin: '0 auto', fontSize: '1.05rem' }}>
              We blend rigorous classical musicianship with modern acoustic engineering and stage performance experience.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.75rem'
            }}
          >
            {[
              {
                icon: <Award size={26} color="var(--brand-primary)" />,
                title: 'Concert & Degree Faculty',
                desc: 'Our instructors hold Trinity FTCL fellowships, Berklee degrees, and traditional Gharana discipleships with real performance resumes.'
              },
              {
                icon: <Volume2 size={26} color="var(--brand-primary)" />,
                title: 'Treated Acoustic Studios',
                desc: 'Sound-isolated rooms with calibrated reflection control so you hear every nuanced overtone of your instrument in clean fidelity.'
              },
              {
                icon: <Calendar size={26} color="var(--brand-primary)" />,
                title: '10 Flexible Daily Slots',
                desc: 'Consistent 1-hour slots from 8:00 AM through 6:00 PM ensure busy professionals and students can maintain consistent weekly riyaaz.'
              },
              {
                icon: <ShieldCheck size={26} color="var(--brand-primary)" />,
                title: 'Annual Recital Showcases',
                desc: 'Regular academy performance showcases on legitimate concert auditorium stages to conquer performance anxiety and build confidence.'
              }
            ].map((b, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                <div>{b.icon}</div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF' }}>{b.title}</h3>
                <p style={{ fontSize: '0.875rem', color: '#9CA3AF', lineHeight: 1.5 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS (Sample demonstration content) */}
      <section className="section-py" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span className="eyebrow">Student Stories</span>
            <h2 className="section-title">What Our Community Experiences</h2>
            <div
              style={{
                display: 'inline-block',
                padding: '0.25rem 0.75rem',
                backgroundColor: 'var(--surface-bg)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                marginTop: '0.25rem'
              }}
            >
              (Demonstration sample testimonials for showcase)
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}
          >
            {[
              {
                name: 'Kavita Menon',
                role: 'Adult Piano Student, Kokila Campus',
                quote: '“Starting piano at 34 felt intimidating, but Nandini Ma’am broke down two-hand coordination with so much patience. Practicing on their grand piano is a weekly highlight.”',
                stars: 5
              },
              {
                name: 'Rohan Deshmukh',
                role: 'Drums Student, Madhapur Studio',
                quote: '“The sound-isolated drum pods in Madhapur let you play full dynamics with a click track. In 6 months my groove lock and limb independence have leveled up noticeably.”',
                stars: 5
              },
              {
                name: 'Dr. Siddharth Rao',
                role: 'Sitar Student, Himayatnagar Studio',
                quote: '“Pandit Someshwar’s guidance in Raag Yaman gave me deep appreciation for Indian classical nuances. The Liberty campus has a wonderful meditative aura for morning riyaaz.”',
                stars: 5
              }
            ].map((t, idx) => (
              <Card key={idx}>
                <CardBody style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '1rem', color: '#F59E0B' }}>
                    {[...Array(t.stars)].map((_, s) => (
                      <Star key={s} size={16} fill="#F59E0B" />
                    ))}
                  </div>
                  <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.6, marginBottom: '1.5rem', flex: 1 }}>
                    {t.quote}
                  </p>
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
                    <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{t.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--brand-primary)', fontWeight: 600 }}>{t.role}</div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FAQ SECTION */}
      <section className="section-py" style={{ backgroundColor: 'var(--surface-bg)' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="eyebrow">Got Questions?</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Clear answers on admissions, slot reservations, instrument provisions, and progress assessments.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-subtle)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-xs)'
                  }}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    style={{
                      width: '100%',
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textAlign: 'left',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      color: isOpen ? 'var(--brand-primary)' : 'var(--text-primary)'
                    }}
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>

                  {isOpen && (
                    <div
                      style={{
                        padding: '0 1.5rem 1.25rem 1.5rem',
                        fontSize: '0.88rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.6,
                        borderTop: '1px solid var(--border-subtle)',
                        paddingTop: '1rem'
                      }}
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. CONTACT INFORMATION & INQUIRY SECTION */}
      <section id="contact" className="section-py" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '3rem',
              alignItems: 'flex-start'
            }}
          >
            {/* Left: Verified Business Placeholders */}
            <div>
              <span className="eyebrow">Connect With Us</span>
              <h2 className="section-title" style={{ marginBottom: '1rem' }}>
                Visit Our Studios or Book an Audition
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
                Walk into any of our three Hyderabad campuses during operating hours (8:00 AM to 6:00 PM) to tour the acoustic rooms, inspect instruments, and speak directly with faculty counselors.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {mockBranches.map(branch => (
                  <div
                    key={branch.id}
                    style={{
                      padding: '1.25rem',
                      backgroundColor: 'var(--surface-bg)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '1.2rem' }}>{branch.imagePlaceholder}</span>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--brand-plum-900)' }}>
                        {branch.name} Campus
                      </strong>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      {branch.address}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--brand-primary)', fontWeight: 600 }}>
                      <span>Phone: {branch.phone}</span>
                      <span>Email: {branch.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Interactive Contact Form */}
            <Card style={{ boxShadow: 'var(--shadow-md)', borderColor: 'var(--border-default)' }}>
              <CardBody style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                  Request Studio Visit & Audition
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  Complete the inquiry form below. Our admissions counselor will schedule a 30-minute studio walkthrough.
                </p>

                <form onSubmit={handleContactSubmit}>
                  <div className="form-group">
                    <label className="form-label">
                      Full Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Sanya Reddy"
                      value={contactName}
                      onChange={e => setContactName(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <div className="form-group">
                      <label className="form-label">
                        Email Address <span className="required">*</span>
                      </label>
                      <input
                        type="email"
                        className="input"
                        placeholder="sanya@example.com"
                        value={contactEmail}
                        onChange={e => setContactEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        className="input"
                        placeholder="+91 98765 43210"
                        value={contactPhone}
                        onChange={e => setContactPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <div className="form-group">
                      <label className="form-label">Preferred Studio Branch</label>
                      <select
                        className="select"
                        value={contactBranch}
                        onChange={e => setContactBranch(e.target.value)}
                      >
                        <option value="madhapur">Madhapur Campus</option>
                        <option value="kokila">Kokila Campus</option>
                        <option value="himayatnagar">Himayatnagar Studio</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Instrument of Interest</label>
                      <select
                        className="select"
                        value={contactInstrument}
                        onChange={e => setContactInstrument(e.target.value)}
                      >
                        {mockInstruments.map(i => (
                          <option key={i.id} value={i.id}>
                            {i.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Your Message or Musical Background</label>
                    <textarea
                      rows={3}
                      className="textarea"
                      placeholder="Tell us about your prior musical experience or specific goals..."
                      value={contactMsg}
                      onChange={e => setContactMsg(e.target.value)}
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    style={{ width: '100%', marginTop: '0.5rem' }}
                    loading={contactSubmitting}
                    icon={<Send size={16} />}
                  >
                    Submit Studio Inquiry
                  </Button>
                </form>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};
