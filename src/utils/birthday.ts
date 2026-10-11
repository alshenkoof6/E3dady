import { Student } from '../types';

/**
 * Checks if a student's birthday is today (matching month and day)
 */
export function isBirthdayToday(birthDate?: string): boolean {
  if (!birthDate) return false;
  
  try {
    const parts = birthDate.split('-');
    if (parts.length < 3) return false;
    
    const birthMonth = parseInt(parts[1], 10);
    const birthDay = parseInt(parts[2], 10);
    
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // 1-12
    const currentDay = today.getDate(); // 1-31
    
    return birthMonth === currentMonth && birthDay === currentDay;
  } catch {
    return false;
  }
}

/**
 * Checks if a student's birthday is in the current month
 */
export function isBirthdayThisMonth(birthDate?: string): boolean {
  if (!birthDate) return false;
  try {
    const parts = birthDate.split('-');
    if (parts.length < 3) return false;
    const birthMonth = parseInt(parts[1], 10);
    const today = new Date();
    return birthMonth === (today.getMonth() + 1);
  } catch {
    return false;
  }
}

/**
 * Filters all students whose birthday is today
 */
export function getTodayBirthdays(students: Student[]): Student[] {
  return students.filter((s) => isBirthdayToday(s.birthDate));
}

/**
 * Calculates current age in years based on birthDate (YYYY-MM-DD)
 */
export function calculateAge(birthDate?: string): number | null {
  if (!birthDate) return null;
  
  try {
    const parts = birthDate.split('-');
    if (parts.length < 3) return null;
    
    const birthYear = parseInt(parts[0], 10);
    const birthMonth = parseInt(parts[1], 10) - 1; // 0-11
    const birthDay = parseInt(parts[2], 10);
    
    const birth = new Date(birthYear, birthMonth, birthDay);
    const today = new Date();
    
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age >= 0 ? age : null;
  } catch {
    return null;
  }
}

/**
 * Formats a birth date string nicely in Arabic
 * e.g., "15 أكتوبر 2011 (14 سنة)"
 */
export function formatBirthDateArabic(birthDate?: string): string {
  if (!birthDate) return 'غير محدد';
  
  try {
    const parts = birthDate.split('-');
    if (parts.length < 3) return birthDate;
    
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    
    const monthsArabic = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    
    const monthName = monthsArabic[month - 1] || `${month}`;
    const age = calculateAge(birthDate);
    
    if (age !== null) {
      return `${day} ${monthName} ${year} (${age} سنة)`;
    }
    return `${day} ${monthName} ${year}`;
  } catch {
    return birthDate;
  }
}
