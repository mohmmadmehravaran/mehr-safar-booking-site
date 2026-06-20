import { Link, useNavigate } from 'react-router-dom';
import { CalendarDays, Hotel, LogOut, Mail, Phone, UserCircle, Settings, Bell, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { formatJalali } from '../utils/date';
import { useDocumentTitle } from '../utils/useDocumentTitle';

export default function UserPanel() {
  const navigate = useNavigate();
  const { currentUser, logoutUser, bookings } = useApp();
  const { theme } = useTheme();
  useDocumentTitle('پنل کاربری');

  if (!currentUser) {
    return (
      <div className="min-h-[calc(100dvh-64px)] flex flex-col items-center justify-center px-5 pb-24 md:pb-0" style={{ backgroundColor: theme.colors.bodyBg }}>
        <div className="text-center rounded-3xl p-8 w-full max-w-sm shadow-soft" style={{ backgroundColor: theme.colors.cardBg, border: `1px solid ${theme.colors.cardBorder}` }}>
          <UserCircle className="w-20 h-20 mx-auto mb-4" style={{ color: theme.colors.primary, opacity: 0.4 }} />
          <h1 className="text-2xl font-black mb-2" style={{ color: theme.colors.textPrimary }}>وارد نشده‌اید</h1>
          <p className="text-sm mb-6" style={{ color: theme.colors.textSecondary }}>برای مشاهده پنل کاربری ابتدا ورود کنید.</p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-white font-black"
            style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})` }}
          >
            ورود / عضویت
          </Link>
        </div>
      </div>
    );
  }

  const myBookings = bookings.filter(
    (b) => b.guestEmail.toLowerCase() === currentUser.email.toLowerCase() || b.guestPhone === currentUser.phone
  );

  const statusLabel: Record<string, string> = { confirmed: 'تأیید شده', pending: 'در انتظار', cancelled: 'لغو شده' };
  const statusStyle: Record<string, React.CSSProperties> = {
    confirmed: { backgroundColor: '#d1fae5', color: '#065f46' },
    pending: { backgroundColor: '#fef3c7', color: '#92400e' },
    cancelled: { backgroundColor: '#fee2e2', color: '#991b1b' },
  };

  const menuItems = [
    { icon: Bell, label: 'اعلان‌ها', sub: 'هیچ اعلان جدیدی ندارید' },
    { icon: Settings, label: 'تنظیمات حساب', sub: 'ویرایش اطلاعات شخصی' },
  ];

  return (
    <div className="min-h-screen pb-28 md:pb-0" style={{ backgroundColor: theme.colors.bodyBg }}>

      {/* ── PROFILE HEADER ── */}
      <div className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${theme.colors.heroBgFrom}, ${theme.colors.heroBgTo})` }}>
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-8 -left-8 w-48 h-48 rounded-full blur-3xl bg-white" />
        </div>
        <div className="relative px-5 pt-10 pb-16 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center text-2xl font-black shadow-lg">
              {currentUser.fullName.charAt(0)}
            </div>
            <div>
              <div className="text-lg font-black">{currentUser.fullName}</div>
              <div className="text-sm opacity-80">{currentUser.email}</div>
              <div className="text-xs opacity-70 mt-0.5">عضو از {formatJalali(currentUser.createdAt)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-8 space-y-4">

        {/* ── STATS ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-3 gap-3">
          {[
            { label: 'رزروها', val: myBookings.length },
            { label: 'تأیید شده', val: myBookings.filter((b) => b.status === 'confirmed').length },
            { label: 'در انتظار', val: myBookings.filter((b) => b.status === 'pending').length },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-4 text-center shadow-sm" style={{ backgroundColor: theme.colors.cardBg, border: `1px solid ${theme.colors.cardBorder}` }}>
              <div className="text-xl font-black mb-0.5" style={{ color: theme.colors.primary }}>{s.val}</div>
              <div className="text-[10px] font-semibold" style={{ color: theme.colors.textSecondary }}>{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* ── CONTACT INFO ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }} className="rounded-3xl p-5 shadow-sm" style={{ backgroundColor: theme.colors.cardBg, border: `1px solid ${theme.colors.cardBorder}` }}>
          <h3 className="font-black mb-4 text-sm" style={{ color: theme.colors.textPrimary }}>اطلاعات تماس</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: theme.colors.primaryLight }}>
                <Phone className="w-4 h-4" style={{ color: theme.colors.primary }} />
              </div>
              <span className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>{currentUser.phone}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: theme.colors.primaryLight }}>
                <Mail className="w-4 h-4" style={{ color: theme.colors.primary }} />
              </div>
              <span className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>{currentUser.email}</span>
            </div>
          </div>
        </motion.div>

        {/* ── BOOKINGS ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="rounded-3xl p-5 shadow-sm" style={{ backgroundColor: theme.colors.cardBg, border: `1px solid ${theme.colors.cardBorder}` }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-sm" style={{ color: theme.colors.textPrimary }}>رزروهای من</h3>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: theme.colors.primaryLight, color: theme.colors.primary }}>
              {myBookings.length} رزرو
            </span>
          </div>

          {myBookings.length === 0 ? (
            <div className="text-center py-8">
              <Hotel className="w-12 h-12 mx-auto mb-3 opacity-20" style={{ color: theme.colors.textPrimary }} />
              <p className="text-sm mb-4" style={{ color: theme.colors.textSecondary }}>هنوز رزروی ثبت نکرده‌اید.</p>
              <Link to="/#hotels" className="text-sm font-bold" style={{ color: theme.colors.primary }}>مشاهده هتل‌ها ←</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myBookings.map((b) => (
                <div key={b.id} className="rounded-2xl p-4" style={{ backgroundColor: theme.colors.bodyBg }}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="font-black text-sm" style={{ color: theme.colors.textPrimary }}>{b.hotelName}</div>
                      <div className="text-xs mt-0.5" style={{ color: theme.colors.textSecondary }}>{b.roomName}</div>
                    </div>
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full shrink-0" style={statusStyle[b.status]}>
                      {statusLabel[b.status]}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs" style={{ color: theme.colors.textSecondary }}>
                    <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{formatJalali(b.checkIn)} → {formatJalali(b.checkOut)}</span>
                    <span className="font-bold" style={{ color: theme.colors.primary }}>{b.totalPrice.toLocaleString('fa-IR')} تومان</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ── MENU ITEMS ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.17 }} className="rounded-3xl overflow-hidden shadow-sm" style={{ backgroundColor: theme.colors.cardBg, border: `1px solid ${theme.colors.cardBorder}` }}>
          {menuItems.map((item, i) => (
            <button key={i} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors border-b last:border-0" style={{ borderColor: theme.colors.cardBorder }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: theme.colors.primaryLight }}>
                <item.icon className="w-4 h-4" style={{ color: theme.colors.primary }} />
              </div>
              <div className="flex-1 text-right">
                <div className="text-sm font-bold" style={{ color: theme.colors.textPrimary }}>{item.label}</div>
                <div className="text-xs" style={{ color: theme.colors.textSecondary }}>{item.sub}</div>
              </div>
              <ChevronLeft className="w-4 h-4" style={{ color: theme.colors.textMuted }} />
            </button>
          ))}
        </motion.div>

        {/* ── LOGOUT ── */}
        <motion.button
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
          onClick={() => { logoutUser(); navigate('/'); }}
          className="w-full py-4 rounded-3xl flex items-center justify-center gap-2 font-black text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          خروج از حساب کاربری
        </motion.button>

      </div>
    </div>
  );
}
