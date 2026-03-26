import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names with Tailwind CSS
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to Arabic locale
 */
export function formatDateArabic(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ar-SY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate Syrian phone number format
 */
export function isValidSyrianPhone(phone: string): boolean {
  const phoneRegex = /^\+?963[0-9]{9}$|^[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

export { getErrorMessage } from './errorHandling';
