import { useState, useMemo } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ReviewLevel, AccommodationType } from '../types';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const starOptions = [1, 2, 3, 4, 5];
const typeOptions: AccommodationType[] = ['هتل', 'هتل آپارتمان', 'مهمان‌پذیر', 'اقامتگاه بوم‌گردی', 'اقامتگاه سنتی'];
const reviewOptions: ReviewLevel[] = ['ضعیف', 'متوسط', 'خوب', 'بسیار خوب', 'عالی'];

export default function FilterPanel() {
  const { filters, setFilters, filteredHotels } = useApp();
  const { theme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    stars: true,
    types: true,
    reviews: true,
    price: true,
  });

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleStar = (star: number) => {
    setFilters((prev) => ({
      ...prev,
      stars: prev.stars.includes(star) ? prev.stars.filter((s) => s !== star) : [...prev.stars, star],
    }));
  };

  const toggleType = (type: AccommodationType) => {
    setFilters((prev) => ({
      ...prev,
      types: prev.types.includes(type) ? prev.types.filter((t) => t !== type) : [...prev.types, type],
    }));
  };

  const toggleReview = (review: ReviewLevel) => {
    setFilters((prev) => ({
      ...prev,
      reviews: prev.reviews.includes(review) ? prev.reviews.filter((r) => r !== review) : [...prev.reviews, review],
    }));
  };

  const hasActiveFilters = useMemo(() => (
    filters.stars.length > 0 ||
    filters.types.length > 0 ||
    filters.reviews.length > 0 ||
    filters.minPrice > 0 ||
    filters.maxPrice < 10000000
  ), [filters]);

  const clearFilters = () => {
    setFilters({
      stars: [],
      types: [],
      reviews: [],
      minPrice: 0,
      maxPrice: 10000000,
      city: '',
      search: '',
      checkIn: '',
      checkOut: '',
    });
  };

  const handleMinPrice = (newMin: number) => {
    setFilters((prev) => ({
      ...prev,
      minPrice: Math.min(newMin, prev.maxPrice - 100000),
    }));
  };

  const handleMaxPrice = (newMax: number) => {
    setFilters((prev) => ({
      ...prev,
      maxPrice: Math.max(newMax, prev.minPrice + 100000),
    }));
  };

  // We define the filter body content directly as JSX to prevent remounting bugs
  const renderFilterBody = (
    <div className="space-y-6">
      {hasActiveFilters && (
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={clearFilters}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
          پاک کردن فیلترها
        </motion.button>
      )}

      {/* Stars */}
      <div>
        <button onClick={() => toggleSection('stars')} className="flex items-center justify-between w-full mb-3 group cursor-pointer">
          <span className="font-semibold text-sm" style={{ color: theme.colors.textPrimary }}>ستاره هتل</span>
          {expandedSections.stars ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        <AnimatePresence>
          {expandedSections.stars && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="flex flex-wrap gap-2">
                {starOptions.map((star) => (
                  <motion.button
                    key={star}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleStar(star)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer ${
                      filters.stars.includes(star)
                        ? 'text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    style={
                      filters.stars.includes(star)
                        ? {
                            background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                            boxShadow: `0 4px 12px ${theme.colors.primary}40`,
                          }
                        : {}
                    }
                  >
                    {star} ستاره
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Types */}
      <div className="border-t border-gray-100 pt-6">
        <button onClick={() => toggleSection('types')} className="flex items-center justify-between w-full mb-3 cursor-pointer">
          <span className="font-semibold text-sm" style={{ color: theme.colors.textPrimary }}>نوع اقامتگاه</span>
          {expandedSections.types ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        <AnimatePresence>
          {expandedSections.types && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="space-y-2">
                {typeOptions.map((type) => (
                  <motion.label
                    key={type}
                    whileHover={{ x: -2 }}
                    className="flex items-center gap-3 cursor-pointer group p-2 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                        filters.types.includes(type) ? 'border-transparent' : 'border-gray-300'
                      }`}
                      style={
                        filters.types.includes(type)
                          ? { background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})` }
                          : {}
                      }
                    >
                      {filters.types.includes(type) && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <input type="checkbox" className="sr-only" aria-label={type} checked={filters.types.includes(type)} onChange={() => toggleType(type)} />
                    <span className="text-sm" style={{ color: theme.colors.textPrimary }}>{type}</span>
                  </motion.label>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reviews */}
      <div className="border-t border-gray-100 pt-6">
        <button onClick={() => toggleSection('reviews')} className="flex items-center justify-between w-full mb-3 cursor-pointer">
          <span className="font-semibold text-sm" style={{ color: theme.colors.textPrimary }}>نظرات کاربران</span>
          {expandedSections.reviews ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        <AnimatePresence>
          {expandedSections.reviews && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="space-y-2">
                {reviewOptions.map((review) => (
                  <motion.label
                    key={review}
                    whileHover={{ x: -2 }}
                    className="flex items-center gap-3 cursor-pointer group p-2 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                        filters.reviews.includes(review) ? 'border-transparent' : 'border-gray-300'
                      }`}
                      style={
                        filters.reviews.includes(review)
                          ? { background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})` }
                          : {}
                      }
                    >
                      {filters.reviews.includes(review) && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <input type="checkbox" className="sr-only" aria-label={review} checked={filters.reviews.includes(review)} onChange={() => toggleReview(review)} />
                    <span className="text-sm" style={{ color: theme.colors.textPrimary }}>{review}</span>
                  </motion.label>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Price */}
      <div className="border-t border-gray-100 pt-6">
        <button onClick={() => toggleSection('price')} className="flex items-center justify-between w-full mb-3 cursor-pointer">
          <span className="font-semibold text-sm" style={{ color: theme.colors.textPrimary }}>محدوده قیمت</span>
          {expandedSections.price ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        <AnimatePresence>
          {expandedSections.price && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span style={{ color: theme.colors.textSecondary }}>حداقل</span>
                    <span className="font-semibold" style={{ color: theme.colors.primary }}>
                      {filters.minPrice.toLocaleString('fa-IR')} تومان
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10000000}
                    step={100000}
                    value={filters.minPrice}
                    onChange={(e) => handleMinPrice(Number(e.target.value))}
                    aria-label="حداقل قیمت"
                    aria-valuetext={`${filters.minPrice.toLocaleString('fa-IR')} تومان`}
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span style={{ color: theme.colors.textSecondary }}>حداکثر</span>
                    <span className="font-semibold" style={{ color: theme.colors.primary }}>
                      {filters.maxPrice.toLocaleString('fa-IR')} تومان
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10000000}
                    step={100000}
                    value={filters.maxPrice}
                    onChange={(e) => handleMaxPrice(Number(e.target.value))}
                    aria-label="حداکثر قیمت"
                    aria-valuetext={`${filters.maxPrice.toLocaleString('fa-IR')} تومان`}
                    className="w-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile FAB */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-24 left-6 z-[8000] flex items-center gap-2 px-5 py-3.5 text-white rounded-full shadow-2xl cursor-pointer"
        style={{
          background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
          boxShadow: `0 8px 32px ${theme.colors.primary}50`,
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Filter className="w-5 h-5" />
        <span className="text-sm font-medium">فیلترها</span>
        {hasActiveFilters && (
          <span className="w-5 h-5 bg-white text-emerald-600 rounded-full text-xs flex items-center justify-center font-bold">
            {filters.stars.length + filters.types.length + filters.reviews.length}
          </span>
        )}
      </motion.button>

      {/* Desktop */}
      <div
        className="hidden lg:block sticky top-24 p-6"
        style={{
          backgroundColor: theme.colors.cardBg,
          borderRadius: theme.sizes.cardBorderRadius + 4,
          border: `1px solid ${theme.colors.cardBorder}`,
          boxShadow: '0 2px 4px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)',
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold" style={{ color: theme.colors.textPrimary }}>فیلترها</h2>
          <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: theme.colors.primaryLight, color: theme.colors.primary }}>
            {filteredHotels.length} هتل
          </span>
        </div>
        {renderFilterBody}
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-full z-50 overflow-y-auto p-6 pb-28 lg:hidden"
              style={{ backgroundColor: theme.colors.cardBg }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold" style={{ color: theme.colors.textPrimary }}>فیلترها</h2>
                <button onClick={() => setMobileOpen(false)} aria-label="بستن فیلترها" className="p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer">
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
              {renderFilterBody}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
