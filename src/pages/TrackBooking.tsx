import { useState } from 'react';
import { Search, CalendarCheck, Hotel, Phone, CheckCircle, XCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { formatJalali } from '../utils/date';
import { useDocumentTitle } from '../utils/useDocumentTitle';

export default function TrackBooking() {
  const { bookings } = useApp();
  const { theme } = useTheme();
  useDocumentTitle('پیگیری رزرو');
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<{ found: boolean; data?: typeof bookings[0] } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setTimeout(() => {
      const found = bookings.find(
        (b) => b.guestPhone.replace(/\D/g, '').includes(q.replace(/\D/g, '')) || String(b.id) === q
      );
      setResult(found ? { found: true, data: found } : { found: false });
      setLoading(false);
    }, 600);
  };

  const statusMeta = {
    confirmed: { label: 'تأیید شده', color: '#059669', bg: '#d1fae5', icon: CheckCircle },
    pending: { label: 'در انتظار تأیید', color: '#d97706', bg: '#fef3c7', icon: Clock },
    cancelled: { label: 'لغو شده', color: '#dc2626', bg: '#fee2e2', icon: XCircle },
  };

  return (
    <div className="min-h-screen pb-24 md:pb-0" style={{ backgroundColor: theme.colors.bodyBg }}>

      {/* ── APP HEADER ── */}
      <div className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${theme.colors.heroBgFrom}, ${theme.colors.heroBgTo})` }}>
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-8 right-8 w-40 h-40 rounded-full blur-3xl bg-white" />
          <div className="absolute bottom-0 left-4 w-28 h-28 rounded-full blur-2xl" style={{ backgroundColor: theme.colors.primary }} />
        </div>
        <div className="relative px-6 pt-10 pb-16 text-center text-white">
          <motion.div initial={{ scale: 0, y: 16 }} animate={{ scale: 1, y: 0 }} className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <CalendarCheck className="w-8 h-8" />
          </motion.div>
          <h1 className="text-2xl font-black mb-1">پیگیری رزرو</h1>
          <p className="text-sm opacity-85">شماره موبایل یا کد رزرو خود را وارد کنید</p>
        </div>
      </div>

      {/* ── SEARCH CARD ── */}
      <div className="px-5 -mt-8 max-w-xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl p-6 shadow-soft-xl" style={{ backgroundColor: theme.colors.cardBg, border: `1px solid ${theme.colors.cardBorder}` }}>
          <form onSubmit={handleSearch} className="flex flex-col gap-3">
            <div className="relative">
              <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: theme.colors.primary }} />
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setResult(null); }}
                placeholder="مثال: ۰۹۱۲۱۲۳۴۵۶۷ یا کد رزرو"
                className="w-full pr-12 pl-4 py-4 rounded-2xl text-sm focus:outline-none transition-colors"
                style={{ backgroundColor: theme.colors.bodyBg, border: `2px solid ${theme.colors.cardBorder}`, color: theme.colors.textPrimary }}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="w-full py-4 rounded-2xl text-white font-black text-base transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`, boxShadow: `0 10px 28px ${theme.colors.primary}40` }}
            >
              {loading ? (
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" opacity="0.3" />
                  <path d="M4 12a8 8 0 018-8" stroke="white" strokeWidth="4" strokeLinecap="round" />
                </svg>
              ) : (
                <Search className="w-5 h-5" />
              )}
              {loading ? 'در حال جستجو...' : 'جستجوی رزرو'}
            </button>
          </form>
        </motion.div>

        {/* ── RESULTS ── */}
        <AnimatePresence>
          {result && (
            <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-5">
              {!result.found ? (
                <div className="rounded-3xl p-6 text-center" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                  <XCircle className="w-12 h-12 mx-auto mb-3 text-red-400" />
                  <h3 className="font-black text-red-700 mb-1">رزروی یافت نشد</h3>
                  <p className="text-sm text-red-600">لطفاً شماره موبایل یا کد رزرو را دوباره بررسی کنید.</p>
                </div>
              ) : result.data ? (
                <div className="rounded-3xl overflow-hidden shadow-soft-lg" style={{ backgroundColor: theme.colors.cardBg, border: `1px solid ${theme.colors.cardBorder}` }}>
                  {/* Status Banner */}
                  {(() => {
                    const meta = statusMeta[result.data.status];
                    const Icon = meta.icon;
                    return (
                      <div className="flex items-center gap-3 px-6 py-4" style={{ backgroundColor: meta.bg }}>
                        <Icon className="w-6 h-6" style={{ color: meta.color }} />
                        <div>
                          <div className="text-xs font-bold" style={{ color: meta.color }}>وضعیت رزرو</div>
                          <div className="font-black" style={{ color: meta.color }}>{meta.label}</div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Details */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: theme.colors.primaryLight }}>
                        <Hotel className="w-5 h-5" style={{ color: theme.colors.primary }} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold" style={{ color: theme.colors.textSecondary }}>هتل</div>
                        <div className="font-black text-base" style={{ color: theme.colors.textPrimary }}>{result.data.hotelName}</div>
                        <div className="text-sm mt-0.5" style={{ color: theme.colors.textSecondary }}>{result.data.roomName}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'نام مهمان', value: result.data.guestName },
                        { label: 'تعداد مهمان', value: `${result.data.guests} نفر` },
                        { label: 'تاریخ ورود', value: formatJalali(result.data.checkIn) },
                        { label: 'تاریخ خروج', value: formatJalali(result.data.checkOut) },
                      ].map((item) => (
                        <div key={item.label} className="rounded-2xl p-3" style={{ backgroundColor: theme.colors.bodyBg }}>
                          <div className="text-[10px] font-semibold mb-1" style={{ color: theme.colors.textSecondary }}>{item.label}</div>
                          <div className="text-sm font-bold" style={{ color: theme.colors.textPrimary }}>{item.value}</div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: theme.colors.cardBorder }}>
                      <span className="font-bold" style={{ color: theme.colors.textSecondary }}>جمع کل پرداخت</span>
                      <span className="text-xl font-black" style={{ color: theme.colors.primary }}>
                        {result.data.totalPrice.toLocaleString('fa-IR')} تومان
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
