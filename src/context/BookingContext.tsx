import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  InstrumentId,
  BranchId,
  MembershipDuration,
  Booking
} from '../types';
import {
  mockBookings,
  mockTimeSlots,
  calculateMembershipPrice
} from '../data/mock';

interface BookingPriceDetails {
  baseRatePerMonth: number;
  months: number;
  rawSubtotal: number;
  discountPercentage: number;
  discountAmount: number;
  finalPrice: number;
}

interface BookingContextType {
  currentStep: number;
  selectedInstrumentId: InstrumentId | null;
  selectedBranchId: BranchId | null;
  selectedPlanDuration: MembershipDuration;
  selectedDate: string;
  selectedSlotId: number | null;
  pricing: BookingPriceDetails;
  bookingsList: Booking[];
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  selectInstrument: (id: InstrumentId) => void;
  selectBranch: (id: BranchId) => void;
  selectPlan: (duration: MembershipDuration) => void;
  selectDate: (date: string) => void;
  selectSlot: (slotId: number) => void;
  startBookingWith: (instrumentId?: InstrumentId, branchId?: BranchId) => void;
  confirmBooking: (paymentMode: 'UPI' | 'Card' | 'Net Banking' | 'Demo Cash') => Booking;
  resetBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

// Helper for tomorrow's date
const getTomorrowString = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedInstrumentId, setSelectedInstrumentId] = useState<InstrumentId | null>('piano');
  const [selectedBranchId, setSelectedBranchId] = useState<BranchId | null>('kokila');
  const [selectedPlanDuration, setSelectedPlanDuration] = useState<MembershipDuration>('3-months');
  const [selectedDate, setSelectedDate] = useState<string>(getTomorrowString());
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(3); // Default 10 AM-11 AM
  const [bookingsList, setBookingsList] = useState<Booking[]>(mockBookings);

  const pricing = calculateMembershipPrice(
    selectedInstrumentId || 'piano',
    selectedPlanDuration
  );

  const setStep = (step: number) => {
    if (step >= 1 && step <= 6) {
      setCurrentStep(step);
    }
  };

  const nextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const selectInstrument = (id: InstrumentId) => {
    setSelectedInstrumentId(id);
  };

  const selectBranch = (id: BranchId) => {
    setSelectedBranchId(id);
  };

  const selectPlan = (duration: MembershipDuration) => {
    setSelectedPlanDuration(duration);
  };

  const selectDate = (date: string) => {
    setSelectedDate(date);
  };

  const selectSlot = (slotId: number) => {
    setSelectedSlotId(slotId);
  };

  const startBookingWith = (instrumentId?: InstrumentId, branchId?: BranchId) => {
    if (instrumentId) setSelectedInstrumentId(instrumentId);
    if (branchId) setSelectedBranchId(branchId);
    // If instrument is preselected from catalog, jump straight to step 2 or start from 1
    setCurrentStep(instrumentId ? 2 : 1);
  };

  const confirmBooking = (paymentMode: 'UPI' | 'Card' | 'Net Banking' | 'Demo Cash'): Booking => {
    const slot = mockTimeSlots.find(s => s.id === selectedSlotId) || mockTimeSlots[0];
    const newBooking: Booking = {
      id: 'APD-BKG-' + Math.floor(1000 + Math.random() * 9000),
      memberId: 'APD-M-1001',
      memberName: 'Aarav Patel',
      memberEmail: 'aarav.patel@example.com',
      instrumentId: selectedInstrumentId || 'piano',
      branchId: selectedBranchId || 'kokila',
      planDuration: selectedPlanDuration,
      bookingDate: new Date().toISOString().split('T')[0],
      firstClassDate: selectedDate,
      slotId: selectedSlotId || 1,
      slotLabel: slot.label,
      baseFee: pricing.rawSubtotal,
      discountAmount: pricing.discountAmount,
      totalPayable: pricing.finalPrice,
      paymentStatus: 'Paid',
      bookingStatus: 'Confirmed',
      paymentMode
    };

    setBookingsList(prev => [newBooking, ...prev]);
    return newBooking;
  };

  const resetBooking = () => {
    setCurrentStep(1);
    setSelectedInstrumentId('piano');
    setSelectedBranchId('kokila');
    setSelectedPlanDuration('3-months');
    setSelectedDate(getTomorrowString());
    setSelectedSlotId(3);
  };

  return (
    <BookingContext.Provider
      value={{
        currentStep,
        selectedInstrumentId,
        selectedBranchId,
        selectedPlanDuration,
        selectedDate,
        selectedSlotId,
        pricing,
        bookingsList,
        setStep,
        nextStep,
        prevStep,
        selectInstrument,
        selectBranch,
        selectPlan,
        selectDate,
        selectSlot,
        startBookingWith,
        confirmBooking,
        resetBooking
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
