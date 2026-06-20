import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronRight, ChevronLeft, X } from 'lucide-react';
import {
  JalaliDate,
  getTodayJalali,
  jalaliDateToString,
  gregorianToJalali,
  jalaliToGregorian,
  getJalaliMonthDays,
  getJalaliMonthStartWeekday,
  gregorianToISO,
} from '../utils/date';

interface PersianDatePickerProps {
  value?: string; // ISO date string YYYY-MM-DD
  onChange: (isoDate: string) => void;
  placeholder?: string;
  label?: string;
  minDate?: string;
  className?: string;
}

const monthNames = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

const weekdayNames = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

function jsWeekdayToPersian(jsWeekday: number): number {
  // JS: 0=Sunday, 6=Saturday
  // Persian: 0=Saturday, 1=Sunday, ..., 6=Friday
  return (jsWeekday + 1) % 7;
}

interface PopupPosition {
  top: number;
  left: number;
  width: number;
  placement: 'bottom' | 'top';
}

export default function PersianDatePicker({
  value,
  onChange,
  placeholder = 'انتخاب تاریخ',
  label,
  minDate,
  className = '',
}: PersianDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState<JalaliDate>(() => {
    const j = value ? gregorianToJalali(value) : getTodayJalali();
    return j || getTodayJalali();
  });
  const [position, setPosition] = useState<PopupPosition>({ top: 0, left: 0, width: 288, placement: 'bottom' });
  const [isMobile, setIsMobile] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const selectedJalali = value ? gregorianToJalali(value) : null;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Update view when value changes externally
  useEffect(() => {
    if (value) {
      const j = gregorianToJalali(value);
      if (j) setViewDate(j);
    }
  }, [value]);

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const popupWidth = isMobile ? Math.min(window.innerWidth - 32, 320) : Math.max(rect.width, 288);
    const popupHeight = 340;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const placement: 'bottom' | 'top' = spaceBelow >= popupHeight || spaceBelow >= spaceAbove ? 'bottom' : 'top';

    let left: number;
    if (isMobile) {
      left = (window.innerWidth - popupWidth) / 2;
    } else {
      // Align to button's right edge
      left = rect.right - popupWidth;
      // Ensure it's within viewport
      if (left < 16) left = 16;
      if (left + popupWidth > window.innerWidth - 16) {
        left = window.innerWidth - popupWidth - 16;
      }
    }

    const top = placement === 'bottom' ? rect.bottom + 8 : rect.top - popupHeight - 8;
    setPosition({ top, left, width: popupWidth, placement });
  };

  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen, isMobile]);

  useEffect(() => {
    if (!isOpen) return;
    const handleScroll = () => updatePosition();
    const handleResize = () => updatePosition();
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, isMobile]);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        popupRef.current && !popupRef.current.contains(target) &&
        buttonRef.current && !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  const handleSelect = (day: number) => {
    const selected = jalaliToGregorian({ year: viewDate.year, month: viewDate.month, day });
    onChange(gregorianToISO(selected));
    setIsOpen(false);
  };

  const goToPrevMonth = () => {
    setViewDate((prev) => {
      if (prev.month === 1) return { year: prev.year - 1, month: 12, day: 1 };
      return { ...prev, month: prev.month - 1 };
    });
  };

  const goToNextMonth = () => {
    setViewDate((prev) => {
      if (prev.month === 12) return { year: prev.year + 1, month: 1, day: 1 };
      return { ...prev, month: prev.month + 1 };
    });
  };

  const goToToday = () => {
    const today = getTodayJalali();
    setViewDate(today);
    const g = jalaliToGregorian(today);
    onChange(gregorianToISO(g));
    setIsOpen(false);
  };

  const monthDays = getJalaliMonthDays(viewDate.year, viewDate.month);
  const startWeekday = jsWeekdayToPersian(getJalaliMonthStartWeekday(viewDate.year, viewDate.month));
  const minJalali = minDate ? gregorianToJalali(minDate) : null;

  const isDisabled = (day: number) => {
    if (!minJalali) return false;
    const current = { year: viewDate.year, month: viewDate.month, day };
    if (current.year < minJalali.year) return true;
    if (current.year === minJalali.year && current.month < minJalali.month) return true;
    if (current.year === minJalali.year && current.month === minJalali.month && day < minJalali.day) return true;
    return false;
  };

  const isSelected = (day: number) => {
    if (!selectedJalali) return false;
    return (
      selectedJalali.year === viewDate.year &&
      selectedJalali.month === viewDate.month &&
      selectedJalali.day === day
    );
  };

  const isToday = (day: number) => {
    const t = getTodayJalali();
    return t.year === viewDate.year && t.month === viewDate.month && t.day === day;
  };

  const displayValue = selectedJalali ? jalaliDateToString(selectedJalali) : '';

  const years = Array.from({ length: 20 }, (_, i) => viewDate.year - 5 + i);

  const calendarContent = (
    <>
      {isMobile && (
        <div
          className="fixed inset-0 bg-black/40 z-[9998]"
          onClick={() => setIsOpen(false)}
        />
      )}
      <div
        ref={popupRef}
        className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-4"
        style={{
          position: 'fixed',
          top: isMobile ? '50%' : position.top,
          left: isMobile ? '50%' : position.left,
          transform: isMobile ? 'translate(-50%, -50%)' : undefined,
          width: position.width,
          zIndex: 9999,
        }}
      >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={goToPrevMonth}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900">{monthNames[viewDate.month - 1]}</span>
          <select
            value={viewDate.year}
            onChange={(e) => setViewDate((prev) => ({ ...prev, year: Number(e.target.value) }))}
            className="text-sm font-bold text-gray-900 bg-transparent border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={goToNextMonth}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekdayNames.map((name) => (
          <div key={name} className="text-center text-xs font-medium text-gray-400 py-1">
            {name}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startWeekday }).map((_, i) => (
          <div key={`empty-${i}`} className="h-9" />
        ))}
        {Array.from({ length: monthDays }).map((_, i) => {
          const day = i + 1;
          const disabled = isDisabled(day);
          const selected = isSelected(day);
          const today = isToday(day);
          return (
            <button
              key={day}
              type="button"
              disabled={disabled}
              onClick={() => handleSelect(day)}
              className={`h-9 w-9 mx-auto rounded-lg text-sm font-medium transition-colors ${
                selected
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : today
                  ? 'bg-emerald-100 text-emerald-700 font-bold'
                  : disabled
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
        <button
          type="button"
          onClick={goToToday}
          className="text-xs text-emerald-600 hover:text-emerald-700 font-medium px-2 py-1 hover:bg-emerald-50 rounded-md transition-colors"
        >
          رفتن به امروز
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 hover:bg-gray-50 rounded-md transition-colors flex items-center gap-1"
        >
          <X className="w-3 h-3" />
          بستن
        </button>
      </div>
    </div>
    </>
  );

  return (
    <div ref={containerRef} className={className}>
      {label && <label className="text-xs text-gray-500 mb-1 block">{label}</label>}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-full flex items-center gap-2 pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-right focus:outline-none focus:ring-2 focus:ring-emerald-500 hover:border-emerald-300 transition-colors"
      >
        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <span className={displayValue ? 'text-gray-900' : 'text-gray-400'}>
          {displayValue || placeholder}
        </span>
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(calendarContent, document.body)}
    </div>
  );
}
