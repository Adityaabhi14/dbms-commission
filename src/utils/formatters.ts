// Utility formatting functions for APD MUSIC CLASS

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Calculates remaining days from an expiry date (YYYY-MM-DD) against current date.
 * Requirement: Calculate days remaining from the membership expiry date rather than storing an arbitrary countdown number.
 */
export function calculateDaysRemaining(expiryDateStr: string): number {
  if (!expiryDateStr) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDateStr);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function formatDatePretty(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export function getExpiryStatus(daysRemaining: number): {
  label: string;
  variant: 'success' | 'warning' | 'danger' | 'neutral';
} {
  if (daysRemaining < 0) {
    return { label: `Expired (${Math.abs(daysRemaining)}d ago)`, variant: 'neutral' };
  }
  if (daysRemaining === 0) {
    return { label: 'Expires Today', variant: 'danger' };
  }
  if (daysRemaining <= 7) {
    return { label: `${daysRemaining} days left (Critical)`, variant: 'danger' };
  }
  if (daysRemaining <= 15) {
    return { label: `${daysRemaining} days left (Renew soon)`, variant: 'warning' };
  }
  return { label: `${daysRemaining} days remaining`, variant: 'success' };
}
