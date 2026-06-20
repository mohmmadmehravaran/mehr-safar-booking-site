import {
  toJalaali,
  toGregorian,
  isValidJalaaliDate,
} from 'jalaali-js';

export interface JalaliDate {
  year: number;
  month: number;
  day: number;
}

const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toPersianNumber(num: number | string): string {
  return String(num).replace(/\d/g, (w) => persianDigits[+w]);
}

export function gregorianToJalali(date: Date | string | undefined): JalaliDate | null {
  if (!date) return null;
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return null;
  const j = toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  return { year: j.jy, month: j.jm, day: j.jd };
}

export function jalaliToGregorian({ year, month, day }: JalaliDate): Date {
  const g = toGregorian(year, month, day);
  return new Date(g.gy, g.gm - 1, g.gd);
}

export function formatJalali(date: Date | string | undefined, options?: { weekday?: boolean; monthName?: boolean }): string {
  const j = gregorianToJalali(date);
  if (!j) return '-';
  const monthNames = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
  const weekdayNames = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];
  const parts: string[] = [];
  if (options?.weekday) {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (d) parts.push(weekdayNames[d.getDay()]);
  }
  parts.push(`${toPersianNumber(j.year)}/${toPersianNumber(j.month.toString().padStart(2, '0'))}/${toPersianNumber(j.day.toString().padStart(2, '0'))}`);
  if (options?.monthName) {
    parts.push(monthNames[j.month - 1]);
  }
  return parts.join(' ');
}

export function formatJalaliShort(date: Date | string | undefined): string {
  return formatJalali(date);
}

export function getTodayJalali(): JalaliDate {
  return gregorianToJalali(new Date())!;
}

export function jalaliStringToGregorian(value: string): Date | null {
  // Expects format: 1404/01/15 (Persian or Latin digits)
  const normalized = value.replace(/[۰-۹]/g, (w) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(w)));
  const [year, month, day] = normalized.split('/').map(Number);
  if (!year || !month || !day) return null;
  if (!isValidJalaaliDate(year, month, day)) return null;
  return jalaliToGregorian({ year, month, day });
}

export function gregorianToISO(date: Date | undefined): string {
  if (!date || isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().split('T')[0];
}

export function addDaysToJalali(j: JalaliDate, days: number): JalaliDate {
  const g = jalaliToGregorian(j);
  g.setDate(g.getDate() + days);
  return gregorianToJalali(g)!;
}

export function getJalaliMonthDays(year: number, month: number): number {
  // Approximation: Jalali months 1-6 have 31 days, 7-11 have 30 days, 12 has 29 or 30
  if (month >= 1 && month <= 6) return 31;
  if (month >= 7 && month <= 11) return 30;
  // Check leap year for Esfand
  const nextYearFirstDay = jalaliToGregorian({ year: year + 1, month: 1, day: 1 });
  const thisYearFirstDay = jalaliToGregorian({ year, month: 1, day: 1 });
  const diff = Math.round((nextYearFirstDay.getTime() - thisYearFirstDay.getTime()) / (1000 * 60 * 60 * 24));
  return diff - 337; // 365-337=28 or 366-337=29
}

export function getJalaliMonthStartWeekday(year: number, month: number): number {
  const g = jalaliToGregorian({ year, month, day: 1 });
  return g.getDay();
}

export function jalaliDateToString(j: JalaliDate): string {
  return `${toPersianNumber(j.year)}/${toPersianNumber(j.month.toString().padStart(2, '0'))}/${toPersianNumber(j.day.toString().padStart(2, '0'))}`;
}
