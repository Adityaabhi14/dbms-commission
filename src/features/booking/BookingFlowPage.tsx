import React from 'react';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { mockInstruments, mockBranches } from '../../data/mock';
import { InstrumentSelector } from './InstrumentSelector';
import { BranchSelector } from './BranchSelector';
import { PlanSelector } from './PlanSelector';
import { SlotSelector } from './SlotSelector';
import { BookingReview } from './BookingReview';
import { PaymentConfirmation } from './PaymentConfirmation';
import { Button } from '../../components/common/Button';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

interface BookingFlowPageProps {
  onGoToClientPortal: () => void;
  onGoHome: () => void;
}

export const BookingFlowPage: React.FC<BookingFlowPageProps> = ({
  onGoToClientPortal,
  onGoHome
}) => {
  const {
    currentStep,
    selectedInstrumentId,
    selectedBranchId,
    selectedPlanDuration,
    selectedDate,
    selectedSlotId,
    setStep,
    nextStep,
    prevStep,
    selectInstrument,
    selectBranch,
    selectPlan,
    selectDate,
    selectSlot,
    confirmBooking,
    resetBooking
  } = useBooking();

  const { loginAsClient } = useAuth();
  const { showToast } = useToast();

  const stepsMeta = [
    { num: 1, label: 'Instrument' },
    { num: 2, label: 'Branch' },
    { num: 3, label: 'Plan' },
    { num: 4, label: 'Schedule' },
    { num: 5, label: 'Review' },
    { num: 6, label: 'Confirmation' }
  ];

  // Validation before advancing
  const handleNextStep = () => {
    if (currentStep === 1 && !selectedInstrumentId) {
      showToast('Please choose an instrument to continue', 'warning');
      return;
    }
    if (currentStep === 2) {
      if (!selectedBranchId) {
        showToast('Please select a studio branch', 'warning');
        return;
      }
      const branch = mockBranches.find(b => b.id === selectedBranchId);
      if (branch && selectedInstrumentId && !branch.availableInstruments.includes(selectedInstrumentId)) {
        showToast(`Selected instrument is not available at ${branch.name}. Please choose another branch.`, 'error');
        return;
      }
    }
    if (currentStep === 4 && !selectedSlotId) {
      showToast('Please pick an available time slot for your class', 'warning');
      return;
    }

    nextStep();
  };

  const handleConfirmed = (mode: 'UPI' | 'Card' | 'Net Banking' | 'Demo Cash') => {
    const booking = confirmBooking(mode);
    // Auto-login as demo client so client portal displays this new booking seamlessly!
    loginAsClient();
    showToast(`Booking ${booking.id} created successfully!`, 'success');
    return booking;
  };

  return (
    <div className="section-py" style={{ minHeight: '80vh', backgroundColor: 'var(--surface-bg)' }}>
      <div className="container" style={{ maxWidth: '1040px' }}>
        {/* Stepper Navigation */}
        <div className="stepper-nav">
          <div className="stepper-track">
            <div
              className="stepper-track-progress"
              style={{ width: `${((currentStep - 1) / (stepsMeta.length - 1)) * 100}%` }}
            />
          </div>

          {stepsMeta.map(step => {
            const isActive = currentStep === step.num;
            const isCompleted = currentStep > step.num;

            return (
              <div
                key={step.num}
                className={`stepper-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => {
                  // Only allow jumping back to completed steps
                  if (step.num < currentStep) setStep(step.num);
                }}
              >
                <div className="stepper-circle">
                  {isCompleted ? <Check size={16} strokeWidth={3} /> : step.num}
                </div>
                <span className="stepper-label">{step.label}</span>
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-subtle)',
            padding: '2rem',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '1.75rem'
          }}
        >
          {currentStep === 1 && (
            <InstrumentSelector
              selectedId={selectedInstrumentId}
              onSelect={id => {
                selectInstrument(id);
              }}
            />
          )}

          {currentStep === 2 && (
            <BranchSelector
              selectedBranchId={selectedBranchId}
              selectedInstrumentId={selectedInstrumentId}
              onSelect={id => {
                selectBranch(id);
              }}
            />
          )}

          {currentStep === 3 && (
            <PlanSelector
              selectedDuration={selectedPlanDuration}
              selectedInstrumentId={selectedInstrumentId}
              onSelect={dur => {
                selectPlan(dur);
              }}
            />
          )}

          {currentStep === 4 && (
            <SlotSelector
              selectedDate={selectedDate}
              selectedSlotId={selectedSlotId}
              onSelectDate={selectDate}
              onSelectSlot={selectSlot}
            />
          )}

          {currentStep === 5 && selectedInstrumentId && selectedBranchId && selectedSlotId && (
            <BookingReview
              instrumentId={selectedInstrumentId}
              branchId={selectedBranchId}
              duration={selectedPlanDuration}
              date={selectedDate}
              slotId={selectedSlotId}
            />
          )}

          {currentStep === 6 && selectedInstrumentId && selectedBranchId && selectedSlotId && (
            <PaymentConfirmation
              instrumentId={selectedInstrumentId}
              branchId={selectedBranchId}
              duration={selectedPlanDuration}
              date={selectedDate}
              slotId={selectedSlotId}
              onConfirmBooking={handleConfirmed}
              onGoToClientPortal={onGoToClientPortal}
              onResetBooking={resetBooking}
            />
          )}
        </div>

        {/* Navigation Step Buttons */}
        {currentStep < 6 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '0.5rem'
            }}
          >
            <Button
              variant="outline"
              onClick={currentStep === 1 ? onGoHome : prevStep}
              icon={<ArrowLeft size={16} />}
            >
              {currentStep === 1 ? 'Cancel & Return Home' : 'Previous Step'}
            </Button>

            <Button
              variant="primary"
              size="lg"
              onClick={handleNextStep}
              icon={<ArrowRight size={16} />}
              iconPosition="right"
            >
              {currentStep === 5 ? 'Proceed to Confirmation' : 'Continue to Next Step'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
