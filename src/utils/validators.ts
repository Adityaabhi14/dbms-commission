// Input validation utilities for APD MUSIC CLASS

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

export function validatePhone(phone: string): boolean {
  // Supports Indian phone numbers (+91 XXXXX XXXXX or 10 digits)
  const cleaned = phone.replace(/[\s\-\+\(\)]/g, '');
  return cleaned.length >= 10 && cleaned.length <= 13;
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (!password || password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long' };
  }
  return { valid: true };
}
