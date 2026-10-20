import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BookingProvider, useBooking } from './context/BookingContext';
import { ToastProvider } from './context/ToastContext';
import { QueryInspectorProvider } from './context/QueryInspectorContext';
import { QueryInspectorWidget } from './components/queryInspector/QueryInspectorWidget';
import { PublicNavbar } from './components/navigation/PublicNavbar';
import { Footer } from './components/navigation/Footer';
import { DemoBanner } from './components/common/DemoBanner';

// Pages
import { HomePage } from './pages/public/HomePage';
import { InstrumentsPage } from './pages/public/InstrumentsPage';
import { LocationsPage } from './pages/public/LocationsPage';
import { BookingFlowPage } from './features/booking/BookingFlowPage';
import { ClientLoginPage } from './pages/auth/ClientLoginPage';
import { ClientRegisterPage } from './pages/auth/ClientRegisterPage';
import { OwnerLoginPage } from './pages/auth/OwnerLoginPage';
import { OwnerRegisterPlaceholderPage } from './pages/auth/OwnerRegisterPlaceholderPage';
import { ClientPortalPage } from './pages/client/ClientPortalPage';
import { OwnerPortalPage } from './pages/owner/OwnerPortalPage';
import { InstrumentId, BranchId } from './types';

type AppView =
  | 'home'
  | 'instruments'
  | 'locations'
  | 'booking'
  | 'client-login'
  | 'client-register'
  | 'owner-login'
  | 'owner-invite'
  | 'client-portal'
  | 'owner-portal';

const AppContent: React.FC = () => {
  const { role, loginAsClient, loginAsOwner } = useAuth();
  const { startBookingWith } = useBooking();

  const [currentView, setCurrentView] = useState<AppView>('home');
  const [activeSection, setActiveSection] = useState<string>('home');

  const handleStartBooking = (instrumentId?: InstrumentId, branchId?: BranchId) => {
    startBookingWith(instrumentId, branchId);
    setCurrentView('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateSection = (sectionId: string) => {
    setActiveSection(sectionId);
    if (sectionId === 'instruments') {
      setCurrentView('instruments');
    } else if (sectionId === 'locations') {
      setCurrentView('locations');
    } else if (sectionId === 'plans' || sectionId === 'about' || sectionId === 'contact' || sectionId === 'home') {
      setCurrentView('home');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 50);
    }
  };

  const handleNavigateAuth = (type: 'client-login' | 'client-register' | 'owner-login') => {
    if (type === 'client-login') setCurrentView('client-login');
    if (type === 'client-register') setCurrentView('client-register');
    if (type === 'owner-login') setCurrentView('owner-login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Determine which banner mode to highlight
  const bannerMode =
    currentView === 'client-portal'
      ? 'client'
      : currentView === 'owner-portal'
      ? 'owner'
      : currentView.includes('login') || currentView.includes('register') || currentView.includes('invite')
      ? 'auth'
      : 'public';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. Global Reviewer Demo Switcher Banner */}
      <DemoBanner
        currentView={bannerMode}
        onNavigatePublic={() => setCurrentView('home')}
        onNavigateClient={() => setCurrentView('client-portal')}
        onNavigateOwner={() => setCurrentView('owner-portal')}
      />

      {/* 2. Client Authenticated Portal Layout */}
      {currentView === 'client-portal' ? (
        <ClientPortalPage onGoHome={() => setCurrentView('home')} />
      ) : currentView === 'owner-portal' ? (
        /* 3. Owner Authenticated Console Layout */
        <OwnerPortalPage onGoHome={() => setCurrentView('home')} />
      ) : (
        /* 4. Public and Authentication Layout */
        <>
          <PublicNavbar
            currentSection={activeSection}
            onNavigateSection={handleNavigateSection}
            onNavigateAuth={handleNavigateAuth}
            onStartBooking={() => handleStartBooking()}
          />

          <main style={{ flex: 1 }}>
            {currentView === 'home' && (
              <HomePage
                onStartBooking={handleStartBooking}
                onNavigateSection={handleNavigateSection}
                onNavigateAuth={handleNavigateAuth}
              />
            )}

            {currentView === 'instruments' && (
              <InstrumentsPage
                onStartBookingWithInstrument={instId => handleStartBooking(instId)}
              />
            )}

            {currentView === 'locations' && (
              <LocationsPage
                onSelectStudioForBooking={branchId => handleStartBooking(undefined, branchId)}
              />
            )}

            {currentView === 'booking' && (
              <BookingFlowPage
                onGoToClientPortal={() => setCurrentView('client-portal')}
                onGoHome={() => setCurrentView('home')}
              />
            )}

            {currentView === 'client-login' && (
              <ClientLoginPage
                onSuccessLogin={() => setCurrentView('client-portal')}
                onGoToRegister={() => setCurrentView('client-register')}
                onGoToOwnerLogin={() => setCurrentView('owner-login')}
                onGoHome={() => setCurrentView('home')}
              />
            )}

            {currentView === 'client-register' && (
              <ClientRegisterPage
                onSuccessRegister={() => setCurrentView('client-portal')}
                onGoToLogin={() => setCurrentView('client-login')}
                onGoHome={() => setCurrentView('home')}
              />
            )}

            {currentView === 'owner-login' && (
              <OwnerLoginPage
                onSuccessLogin={() => setCurrentView('owner-portal')}
                onGoToOwnerInvite={() => setCurrentView('owner-invite')}
                onGoToClientLogin={() => setCurrentView('client-login')}
                onGoHome={() => setCurrentView('home')}
              />
            )}

            {currentView === 'owner-invite' && (
              <OwnerRegisterPlaceholderPage
                onGoBackToOwnerLogin={() => setCurrentView('owner-login')}
                onGoHome={() => setCurrentView('home')}
              />
            )}
          </main>

          <Footer
            onNavigateSection={handleNavigateSection}
            onNavigateAuth={handleNavigateAuth}
          />
        </>
      )}

      {/* Global DBMS Live Query Inspector (Floating Trigger + Hovering Chatbox) */}
      <QueryInspectorWidget />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <QueryInspectorProvider>
        <AuthProvider>
          <BookingProvider>
            <AppContent />
          </BookingProvider>
        </AuthProvider>
      </QueryInspectorProvider>
    </ToastProvider>
  );
}

