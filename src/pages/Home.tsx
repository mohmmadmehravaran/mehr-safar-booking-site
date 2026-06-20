import { useState } from 'react';
import { Search, MapPin, Award, TrendingUp, Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import HotelCard from '../components/HotelCard';
import FilterPanel from '../components/FilterPanel';
import PersianRangeDatePicker from '../components/PersianRangeDatePicker';
import { motion } from 'framer-motion';
import { getTodayJalali, gregorianToISO, jalaliToGregorian } from '../utils/date';
import { useDocumentTitle } from '../utils/useDocumentTitle';

export default function Home() {
  const { filteredHotels, filters, setFilters } = useApp();
  const { theme } = useTheme();
  useDocumentTitle();
  const [searchInput, setSearchInput] = useState(filters.search);

  const today = getTodayJalali();
  const todayISO = gregorianToISO(jalaliToGregorian(today));

  const handleSearch = () => setFilters((prev) => ({ ...prev, search: searchInput }));
  const handleCheckInChange = (date: string) => setFilters((prev) => ({ ...prev, checkIn: date, checkOut: prev.checkOut && prev.checkOut <= date ? '' : prev.checkOut }));
  const handleCheckOutChange = (date: string) => setFilters((prev) => ({ ...prev, checkOut: date }));

  const featuredHotels = filteredHotels.filter((h) => h.isFeatured);
  const regularHotels = filteredHotels.filter((h) => !h.isFeatured);

  return (
    <div className="min-h-screen pb-20 md:pb-0" style={{ backgroundColor: theme.colors.bodyBg }}>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden" style={{ background: `linear-gradient(180deg, ${theme.colors.heroBgFrom}, ${theme.colors.heroBgVia} 50%, ${theme.colors.heroBgTo})`, color: theme.colors.heroText }}>
        {/* Soft decorative blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full blur-3xl opacity-20" style={{ backgroundColor: '#93c5fd' }} />
          <div className="absolute bottom-0 -right-32 w-[400px] h-[400px] rounded-full blur-3xl opacity-15" style={{ backgroundColor: '#60a5fa' }} />
        </div>

        <div className="relative mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: theme.sizes.maxContentWidth, paddingTop: theme.sizes.heroTopPadding + 20, paddingBottom: theme.sizes.heroBottomPadding + 40 }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }} className="text-center max-w-4xl mx-auto">

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-5 leading-tight" style={{ fontFamily: `'${theme.fonts.heading}'`, fontWeight: theme.fonts.headingWeight, color: theme.colors.textPrimary }}>
              {theme.texts.heroTitle}
            </h1>
            <p className="text-base md:text-lg mb-10 leading-relaxed max-w-2xl mx-auto" style={{ color: theme.colors.textSecondary }}>
              {theme.texts.heroSubtitle}
            </p>

            {/* Search box - clean white card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-soft-xl max-w-4xl mx-auto p-5 md:p-6"
              style={{ border: `1px solid ${theme.colors.cardBorder}` }}
            >
              <div className="flex flex-col gap-4">
                {/* Inputs Row */}
                <div className="flex flex-col md:flex-row gap-3">
                  {/* City Search */}
                  <div className="flex-1 relative">
                    <label htmlFor="hotel-search" className="sr-only">{theme.texts.searchPlaceholder}</label>
                    <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 z-10" style={{ color: theme.colors.textMuted }} aria-hidden="true" />
                    <input
                      id="hotel-search"
                      name="search"
                      type="search"
                      enterKeyHint="search"
                      autoComplete="off"
                      aria-label={theme.texts.searchPlaceholder}
                      placeholder={theme.texts.searchPlaceholder}
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="w-full pr-12 pl-4 py-3.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{ borderColor: theme.colors.cardBorder, color: theme.colors.textPrimary }}
                    />
                  </div>

                  {/* Date Range */}
                  <div className="flex-1">
                    <PersianRangeDatePicker
                      checkIn={filters.checkIn}
                      checkOut={filters.checkOut}
                      onCheckInChange={handleCheckInChange}
                      onCheckOutChange={handleCheckOutChange}
                      minDate={todayISO}
                      className="w-full"
                      placeholder="تاریخ ورود  ←  تاریخ خروج"
                    />
                  </div>
                </div>

                {/* Search Button */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSearch}
                  className="flex items-center justify-center gap-3 py-3.5 text-white font-bold text-base rounded-xl transition-all w-full"
                  style={{ 
                    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`, 
                    boxShadow: `0 4px 16px ${theme.colors.primary}40` 
                  }}
                >
                  <Search className="w-5 h-5" />
                  <span>جستجو</span>
                </motion.button>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="grid grid-cols-3 gap-4 mt-10 max-w-lg mx-auto">
              {[
                { val: theme.texts.statsHotels, label: 'هتل و اقامتگاه' },
                { val: theme.texts.statsCities, label: 'شهر' },
                { val: theme.texts.statsSatisfaction, label: 'رضایت مشتریان' },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl md:text-3xl font-black mb-0.5">{s.val}</div>
                  <div className="text-xs opacity-75">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── HOTELS ── */}
      <section id="hotels" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-80 flex-shrink-0">
            <FilterPanel />
          </aside>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black mb-1" style={{ color: theme.colors.textPrimary }}>هتل‌ها و اقامتگاه‌ها</h2>
                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>{filteredHotels.length} مورد یافت شد</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: theme.colors.primaryLight }}>
                <TrendingUp className="w-4 h-4" style={{ color: theme.colors.primary }} />
                <span className="text-sm font-bold" style={{ color: theme.colors.primary }}>محبوب‌ترین</span>
              </div>
            </div>

            {filteredHotels.length === 0 ? (
              <div className="text-center py-20 rounded-3xl" style={{ backgroundColor: theme.colors.cardBg, border: `1px solid ${theme.colors.cardBorder}` }}>
                <Search className="w-14 h-14 mx-auto mb-4" style={{ color: theme.colors.textMuted }} />
                <h3 className="text-lg font-bold mb-2" style={{ color: theme.colors.textPrimary }}>هتلی یافت نشد</h3>
                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>فیلترها را تغییر دهید</p>
              </div>
            ) : (
              <>
                {featuredHotels.length > 0 && (
                  <div className="mb-10">
                    <div className="flex items-center gap-2 mb-5">
                      <Award className="w-5 h-5" style={{ color: theme.colors.primary }} />
                      <h3 className="font-black" style={{ color: theme.colors.textPrimary }}>هتل‌های ویژه</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {featuredHotels.map((h, i) => <HotelCard key={h.id} hotel={h} index={i} />)}
                    </div>
                  </div>
                )}
                {regularHotels.length > 0 && (
                  <div>
                    {featuredHotels.length > 0 && (
                      <div className="flex items-center gap-2 mb-5">
                        <Heart className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                        <h3 className="font-bold" style={{ color: theme.colors.textSecondary }}>سایر هتل‌ها</h3>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {regularHotels.map((h, i) => <HotelCard key={h.id} hotel={h} index={i} />)}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
