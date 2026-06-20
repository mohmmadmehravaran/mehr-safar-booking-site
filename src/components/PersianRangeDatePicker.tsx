import { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronRight, ChevronLeft, RefreshCw, Repeat } from 'lucide-react';
import {
  getTodayJalali,
  jalaliDateToString,
  gregorianToJalali,
  jalaliToGregorian,
  getJalaliMonthDays,
  getJalaliMonthStartWeekday,
  gregorianToISO,
  toPersianNumber,
} from '../utils/date';

/* ── helpers ── */
function jsWeekdayToPersian(d: number) { return (d + 1) % 7; }

/** local-midnight timestamp of a Date (day-resolution comparison) */
function normTs(d: Date) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); }

/* ── constants ── */
const monthNames = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
const monthNamesGreg = ['ژانویه','فوریه','مارس','آوریل','مه','ژوئن','ژوئیه','اوت','سپتامبر','اکتبر','نوامبر','دسامبر'];
const weekdayLabels = ['ش','ی','د','س','چ','پ','ج'];

type CalSystem = 'jalali' | 'gregorian';
interface ViewMonth { year: number; month: number; }

/* ── gregorian month helpers ── */
function gregMonthDays(year: number, month: number) { return new Date(year, month, 0).getDate(); }
function gregMonthStartWeekday(year: number, month: number) { return new Date(year, month - 1, 1).getDay(); }

/* ── types ── */
interface RangePickerProps {
  checkIn: string;   // ISO
  checkOut: string;   // ISO
  onCheckInChange: (iso: string) => void;
  onCheckOutChange: (iso: string) => void;
  minDate?: string;   // ISO
  className?: string;
  label?: string;
  placeholder?: string;
}

export default function PersianRangeDatePicker({
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
  minDate,
  className = '',
  label,
  placeholder = 'تاریخ ورود  ←  تاریخ خروج',
}: RangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [phase, setPhase] = useState<'checkIn' | 'checkOut'>('checkIn');
  const [hoverTs, setHoverTs] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [calSystem, setCalSystem] = useState<CalSystem>('jalali');

  const checkInJ = useMemo(() => checkIn ? gregorianToJalali(checkIn) : null, [checkIn]);
  const checkOutJ = useMemo(() => checkOut ? gregorianToJalali(checkOut) : null, [checkOut]);

  const checkInTs = useMemo(() => checkIn ? normTs(new Date(checkIn)) : null, [checkIn]);
  const checkOutTs = useMemo(() => checkOut ? normTs(new Date(checkOut)) : null, [checkOut]);
  const minTs = useMemo(() => minDate ? normTs(new Date(minDate)) : null, [minDate]);

  // The primary (earlier) month being viewed, stored in the active system.
  const [view, setView] = useState<ViewMonth>(() => {
    const j = checkInJ || getTodayJalali();
    return { year: j.year, month: j.month };
  });

  const buttonRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Responsive
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Reset phase + view on open
  useEffect(() => {
    if (isOpen) {
      if (checkInJ && checkOutJ) setPhase('checkIn');
      else if (checkInJ) setPhase('checkOut');
      else setPhase('checkIn');
      const focus = checkInJ || getTodayJalali();
      if (calSystem === 'jalali') {
        setView({ year: focus.year, month: focus.month });
      } else {
        const g = jalaliToGregorian({ ...focus, day: 1 });
        setView({ year: g.getFullYear(), month: g.getMonth() + 1 });
      }
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      const t = e.target as Node;
      if (popupRef.current && !popupRef.current.contains(t) &&
          buttonRef.current && !buttonRef.current.contains(t)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    if (!isOpen) return;
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [isOpen]);

  /* ── Position ──
     The popup is rendered into <body> with position:ABSOLUTE using document
     coordinates (scrollX/scrollY added). This way it stays glued to the input
     and moves together with the page during scroll — natively, with NO
     JS-on-scroll repositioning, which is what used to cause the jitter. */
  const [pos, setPos] = useState({ top: 0, left: 0, w: 680 });
  const updatePos = () => {
    if (!buttonRef.current || isMobile) return;
    const r = buttonRef.current.getBoundingClientRect();
    const w = Math.min(680, window.innerWidth - 32);
    let left = r.right - w;                       // align right edges (RTL)
    if (left < 16) left = 16;
    if (left + w > window.innerWidth - 16) left = window.innerWidth - w - 16;
    setPos({
      top: r.bottom + window.scrollY + 8,
      left: left + window.scrollX,
      w,
    });
  };
  useLayoutEffect(() => { if (isOpen && !isMobile) updatePos(); }, [isOpen, isMobile]);
  // Only re-measure on resize (layout actually changes). NOT on scroll.
  useEffect(() => {
    if (!isOpen || isMobile) return;
    const fn = () => updatePos();
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, [isOpen, isMobile]);

  /* ── navigation (works for both calendar systems) ── */
  const nextMonth = (v: ViewMonth): ViewMonth => v.month === 12 ? { year: v.year + 1, month: 1 } : { year: v.year, month: v.month + 1 };
  const prevMonth = (v: ViewMonth): ViewMonth => v.month === 1 ? { year: v.year - 1, month: 12 } : { year: v.year, month: v.month - 1 };
  const goForward = () => setView(v => nextMonth(v));
  const goBack = () => setView(v => prevMonth(v));

  const view2 = nextMonth(view); // later month (shown on the right)

  /* ── toggle calendar system, converting the current view ── */
  const toggleSystem = () => {
    if (calSystem === 'jalali') {
      const g = jalaliToGregorian({ year: view.year, month: view.month, day: 1 });
      setView({ year: g.getFullYear(), month: g.getMonth() + 1 });
      setCalSystem('gregorian');
    } else {
      const j = gregorianToJalali(new Date(view.year, view.month - 1, 1))!;
      setView({ year: j.year, month: j.month });
      setCalSystem('jalali');
    }
  };

  /* ── select logic (operates on a real Gregorian Date) ── */
  const handleDayClick = (greg: Date) => {
    const ts = normTs(greg);
    const iso = gregorianToISO(greg);
    if (phase === 'checkIn') {
      onCheckInChange(iso);
      onCheckOutChange('');
      setPhase('checkOut');
    } else {
      if (checkInTs !== null && ts <= checkInTs) {
        onCheckInChange(iso);
        onCheckOutChange('');
        setPhase('checkOut');
      } else {
        onCheckOutChange(iso);
        setIsOpen(false);
      }
    }
  };

  /* ── display text in the input (always Jalali) ── */
  const displayText = () => {
    if (checkInJ && checkOutJ) return `${jalaliDateToString(checkInJ)}  ←  ${jalaliDateToString(checkOutJ)}`;
    if (checkInJ) return `${jalaliDateToString(checkInJ)}  ←  انتخاب خروج`;
    return '';
  };

  /* ── render a single month grid (system-aware) ── */
  const renderMonth = (v: ViewMonth) => {
    const isJalali = calSystem === 'jalali';
    const monthDays = isJalali ? getJalaliMonthDays(v.year, v.month) : gregMonthDays(v.year, v.month);
    const startWdRaw = isJalali ? getJalaliMonthStartWeekday(v.year, v.month) : gregMonthStartWeekday(v.year, v.month);
    const startWd = jsWeekdayToPersian(startWdRaw);
    const todayTs = normTs(new Date());

    return (
      <div className="flex-1 min-w-0">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {weekdayLabels.map((n, i) => (
            <div key={i} className="text-center text-[11px] font-medium text-gray-400 py-1">{n}</div>
          ))}
        </div>
        {/* Days grid */}
        <div className="grid grid-cols-7 gap-y-0.5">
          {Array.from({ length: startWd }).map((_, i) => <div key={`e${i}`} className="h-9" />)}
          {Array.from({ length: monthDays }).map((_, i) => {
            const day = i + 1;
            const greg = isJalali
              ? jalaliToGregorian({ year: v.year, month: v.month, day })
              : new Date(v.year, v.month - 1, day);
            const ts = normTs(greg);
            const colIndex = (startWd + i) % 7;       // 0..6 (6 = Friday 'ج')
            const isFriday = colIndex === 6;

            const isToday = ts === todayTs;
            const disabled = minTs !== null ? ts < minTs : false;
            const isStart = checkInTs !== null && ts === checkInTs;
            const isEnd = checkOutTs !== null && ts === checkOutTs;

            // Range highlight (committed range or hover preview)
            let inRange = false;
            if (checkInTs !== null) {
              if (checkOutTs !== null) {
                inRange = ts > checkInTs && ts < checkOutTs;
              } else if (phase === 'checkOut' && hoverTs !== null && hoverTs > checkInTs) {
                inRange = ts > checkInTs && ts < hoverTs;
              }
            }
            const isHoverEnd = !checkOutTs && phase === 'checkOut' && hoverTs !== null
              && ts === hoverTs && checkInTs !== null && hoverTs > checkInTs;

            let cls = 'h-9 w-full text-[13px] font-medium transition-colors relative ';
            if (isStart) {
              cls += 'bg-emerald-600 text-white rounded-r-lg z-10';
            } else if (isEnd || isHoverEnd) {
              cls += 'bg-emerald-600 text-white rounded-l-lg z-10';
            } else if (inRange) {
              cls += 'bg-emerald-100 text-emerald-800';
            } else if (disabled) {
              cls += 'text-gray-300 cursor-not-allowed rounded-lg';
            } else if (isToday) {
              cls += 'text-emerald-700 font-bold rounded-lg ring-1 ring-gray-300';
            } else if (isFriday) {
              cls += 'text-red-500 hover:bg-gray-100 rounded-lg';
            } else {
              cls += 'text-gray-700 hover:bg-gray-100 rounded-lg';
            }

            return (
              <button
                key={day}
                type="button"
                disabled={disabled}
                onClick={() => handleDayClick(greg)}
                onMouseEnter={() => setHoverTs(ts)}
                onMouseLeave={() => setHoverTs(null)}
                className={cls}
              >
                {toPersianNumber(day)}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const monthLabel = (v: ViewMonth) =>
    `${(calSystem === 'jalali' ? monthNames : monthNamesGreg)[v.month - 1]} ${toPersianNumber(v.year)}`;

  /* ── popup content ── */
  const calendarPopup = (
    <>
      {isMobile && <div className="fixed inset-0 bg-black/40 z-[9998]" onClick={() => setIsOpen(false)} />}
      <div
        ref={popupRef}
        className="bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden"
        dir="rtl"
        style={{
          position: isMobile ? 'fixed' : 'absolute',
          top: isMobile ? '50%' : pos.top,
          left: isMobile ? '50%' : pos.left,
          transform: isMobile ? 'translate(-50%, -50%)' : undefined,
          width: isMobile ? 'calc(100vw - 24px)' : pos.w,
          maxWidth: isMobile ? '400px' : '720px',
          zIndex: 9999,
          fontFamily: "'Vazirmatn', sans-serif",
        }}
      >
        {/* Top toolbar: tabs + today + convert */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {/* Merged check-in / check-out tabs */}
            <div className="flex items-center rounded-xl border border-gray-300 overflow-hidden">
              <button
                type="button"
                onClick={() => setPhase('checkIn')}
                className={`px-4 py-2 text-sm font-bold transition-colors ${
                  phase === 'checkIn' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                تاریخ ورود
              </button>
              <div className="w-px self-stretch bg-gray-300" />
              <button
                type="button"
                onClick={() => { if (checkInJ) setPhase('checkOut'); }}
                className={`px-4 py-2 text-sm font-bold transition-colors ${
                  phase === 'checkOut' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                تاریخ خروج
              </button>
            </div>

            {/* Today */}
            <button
              type="button"
              onClick={() => {
                const t = getTodayJalali();
                if (calSystem === 'jalali') setView({ year: t.year, month: t.month });
                else { const g = new Date(); setView({ year: g.getFullYear(), month: g.getMonth() + 1 }); }
              }}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-bold"
            >
              <RefreshCw className="w-4 h-4" />
              امروز
            </button>
          </div>

          {/* Convert calendar system */}
          <button
            type="button"
            onClick={toggleSystem}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-bold"
          >
            <Repeat className="w-4 h-4" />
            {calSystem === 'jalali' ? 'تبدیل به میلادی' : 'تبدیل به شمسی'}
          </button>
        </div>

        {/* Calendar grids with per-month headers + divider (RTL order:
            earlier month on the RIGHT, later month on the LEFT) */}
        <div className={`p-5 ${isMobile ? '' : 'flex gap-0'}`}>
          {/* RIGHT column = earlier month (view, contains today) */}
          <div className={`flex-1 min-w-0 ${isMobile ? '' : 'pl-5'}`}>
            <div className="flex items-center justify-between mb-3">
              <button type="button" onClick={goBack} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronRight className="w-5 h-5 text-gray-500" />
              </button>
              <span className="text-[15px] font-bold text-gray-800">{monthLabel(view)}</span>
              {isMobile
                ? <button type="button" onClick={goForward} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><ChevronLeft className="w-5 h-5 text-gray-500" /></button>
                : <span className="w-8" />}
            </div>
            {renderMonth(view)}
          </div>

          {/* vertical divider */}
          {!isMobile && <div className="w-px bg-gray-200 self-stretch" />}

          {/* LEFT column = later month (view2) */}
          {!isMobile && (
            <div className="flex-1 min-w-0 pr-5">
              <div className="flex items-center justify-between mb-3">
                <span className="w-8" />
                <span className="text-[15px] font-bold text-gray-800">{monthLabel(view2)}</span>
                <button type="button" onClick={goForward} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                  <ChevronLeft className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              {renderMonth(view2)}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-6 py-2 bg-gray-100 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-200 transition-colors"
          >
            تایید
          </button>
          {(checkIn || checkOut) && (
            <button
              type="button"
              onClick={() => { onCheckInChange(''); onCheckOutChange(''); setPhase('checkIn'); }}
              className="text-sm text-gray-500 hover:text-gray-700 font-medium"
            >
              پاک کردن
            </button>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className={className}>
      {label && <label className="text-xs font-medium text-gray-700 mb-2 block">{label}</label>}
      <div
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-full flex items-center gap-2 pr-12 pl-4 py-3.5 bg-white border rounded-xl text-sm cursor-pointer focus:outline-none hover:border-blue-400 transition-all select-none"
        style={{ borderColor: '#e2e8f0' }}
      >
        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 z-10 text-gray-400 pointer-events-none" />
        <span className={displayText() ? 'text-gray-900 font-medium truncate' : 'text-gray-400 truncate'}>
          {displayText() || placeholder}
        </span>
      </div>

      {isOpen && typeof document !== 'undefined' && createPortal(calendarPopup, document.body)}
    </div>
  );
}
