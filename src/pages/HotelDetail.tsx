import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Phone, Mail, Wifi, Car, UtensilsCrossed, Dumbbell, Waves, Coffee, ArrowRight, Star, Check, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import StarRating from '../components/StarRating';
import ReviewBadge from '../components/ReviewBadge';
import PersianRangeDatePicker from '../components/PersianRangeDatePicker';
import { motion } from 'framer-motion';
import { formatJalali, getTodayJalali, gregorianToISO, jalaliToGregorian, toPersianNumber } from '../utils/date';
import { useDocumentTitle } from '../utils/useDocumentTitle';

const amenityIcons: Record<string, React.ReactNode> = {
  'استخر': <Waves className="w-5 h-5" />,
  'سونا': <Waves className="w-5 h-5" />,
  'جکوزی': <Waves className="w-5 h-5" />,
  'رستوران': <UtensilsCrossed className="w-5 h-5" />,
  'کافی‌شاپ': <Coffee className="w-5 h-5" />,
  'پارکینگ': <Car className="w-5 h-5" />,
  'اینترنت رایگان': <Wifi className="w-5 h-5" />,
  'مرکز بدنسازی': <Dumbbell className="w-5 h-5" />,
  'حیاط سنتی': <Coffee className="w-5 h-5" />,
  'چایخانه سنتی': <Coffee className="w-5 h-5" />,
  'صبحانه سنتی': <UtensilsCrossed className="w-5 h-5" />,
  'حیاط بزرگ': <Coffee className="w-5 h-5" />,
  'استخر سنتی': <Waves className="w-5 h-5" />,
  'چشم‌انداز دریا': <Waves className="w-5 h-5" />,
  'رستوران محلی': <UtensilsCrossed className="w-5 h-5" />,
  'چشم‌انداز کوهستان': <Waves className="w-5 h-5" />,
  'چادر سنتی': <Coffee className="w-5 h-5" />,
  'آتش‌دان': <Coffee className="w-5 h-5" />,
  'آشپزخانه': <UtensilsCrossed className="w-5 h-5" />,
  'یخچال': <Coffee className="w-5 h-5" />,
  'تلویزیون': <Coffee className="w-5 h-5" />,
  'گرمایش': <Coffee className="w-5 h-5" />,
  'بالکن': <Coffee className="w-5 h-5" />,
};

export default function HotelDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hotels, reviews, addBooking, filters, setFilters } = useApp();
  const { theme } = useTheme();
  const hotel = hotels.find((h) => h.id === Number(id));

  const today = getTodayJalali();
  const todayISO = gregorianToISO(jalaliToGregorian(today));

  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [checkIn, setCheckIn] = useState(filters.checkIn || '');
  const [checkOut, setCheckOut] = useState(filters.checkOut || '');
  const [bookingForm, setBookingForm] = useState({ name: '', phone: '', email: '' });
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    setCheckIn(filters.checkIn || '');
    setCheckOut(filters.checkOut || '');
  }, [filters.checkIn, filters.checkOut]);

  useDocumentTitle(hotel ? hotel.name : 'هتل یافت نشد');

  // Booking modal: lock body scroll and close on Escape
  useEffect(() => {
    if (!showBookingModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !bookingSuccess) setShowBookingModal(false);
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [showBookingModal, bookingSuccess]);

  const handleCheckInChange = (date: string) => {
    setCheckIn(date);
    setFilters((prev) => ({ ...prev, checkIn: date }));
    if (checkOut && checkOut <= date) {
      setCheckOut('');
      setFilters((prev) => ({ ...prev, checkOut: '' }));
    }
  };

  const handleCheckOutChange = (date: string) => {
    setCheckOut(date);
    setFilters((prev) => ({ ...prev, checkOut: date }));
  };

  if (!hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.colors.bodyBg }}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-3" style={{ color: theme.colors.textPrimary }}>هتل مورد نظر یافت نشد</h2>
          <button onClick={() => navigate('/')} className="text-emerald-600 hover:underline">بازگشت به صفحه اصلی</button>
        </div>
      </div>
    );
  }

  const hotelReviews = reviews.filter((r) => r.hotelId === hotel.id);
  const nights = checkIn && checkOut
    ? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  const selectedRoomObj = selectedRoom ? hotel.rooms.find((r) => r.id === selectedRoom) : null;
  const totalPrice = selectedRoomObj ? selectedRoomObj.price * nights : 0;

  const handleBooking = () => {
    if (!selectedRoom || !checkIn || !checkOut || !bookingForm.name || !bookingForm.phone) return;
    const room = hotel.rooms.find((r) => r.id === selectedRoom);
    if (!room) return;

    addBooking({
      id: Date.now(),
      hotelId: hotel.id,
      hotelName: hotel.name,
      roomId: room.id,
      roomName: room.name,
      guestName: bookingForm.name,
      guestPhone: bookingForm.phone,
      guestEmail: bookingForm.email,
      checkIn,
      checkOut,
      guests: selectedRoomObj ? selectedRoomObj.capacity : 1,
      totalPrice,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    });

    setBookingSuccess(true);
    setTimeout(() => {
      setShowBookingModal(false);
      setBookingSuccess(false);
      setSelectedRoom(null);
      setBookingForm({ name: '', phone: '', email: '' });
    }, 2000);
  };

  return (
    <div className="min-h-screen pb-12" style={{ backgroundColor: theme.colors.bodyBg }}>
      {/* Image Header */}
      <div className="relative h-80 md:h-[500px] overflow-hidden">
        <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2.5 glass-dark text-white rounded-full hover:bg-white/20 transition-all backdrop-blur-xl"
        >
          <ArrowRight className="w-4 h-4" />
          بازگشت
        </button>

        {/* Info overlay */}
        <div className="absolute bottom-0 right-0 left-0 p-6 md:p-10">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-4 py-1.5 glass-dark text-white rounded-full text-sm font-medium backdrop-blur-xl">
                  {hotel.type}
                </span>
                <ReviewBadge review={hotel.review} score={hotel.reviewScore} />
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-3" style={{ fontFamily: `'${theme.fonts.heading}'` }}>
                {hotel.name}
              </h1>
              <div className="flex items-center gap-2 text-white/90">
                <MapPin className="w-5 h-5" />
                <span>{hotel.city}، {hotel.address}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 rounded-3xl shadow-soft"
              style={{ backgroundColor: theme.colors.cardBg, border: `1px solid ${theme.colors.cardBorder}` }}
            >
              <div className="flex items-center justify-between mb-6">
                <StarRating stars={hotel.stars} size="md" />
                <div className="text-left">
                  <span className="text-3xl font-bold" style={{ color: theme.colors.priceBadgeColor }}>
                    {hotel.pricePerNight.toLocaleString('fa-IR')}
                  </span>
                  <span className="text-sm mr-2" style={{ color: theme.colors.textMuted }}>تومان / شب</span>
                </div>
              </div>
              <p className="leading-relaxed text-base" style={{ color: theme.colors.textSecondary }}>{hotel.description}</p>
            </motion.div>

            {/* Amenities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-8 rounded-3xl shadow-soft"
              style={{ backgroundColor: theme.colors.cardBg, border: `1px solid ${theme.colors.cardBorder}` }}
            >
              <h2 className="text-xl font-bold mb-6" style={{ color: theme.colors.textPrimary }}>امکانات</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {hotel.amenities.map((amenity) => (
                  <motion.div
                    key={amenity}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-3 p-4 rounded-2xl transition-all"
                    style={{ backgroundColor: theme.colors.primaryLight + '40' }}
                  >
                    <div style={{ color: theme.colors.primary }}>{amenityIcons[amenity] || <Check className="w-5 h-5" />}</div>
                    <span className="text-sm font-medium" style={{ color: theme.colors.textPrimary }}>{amenity}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Rooms */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-8 rounded-3xl shadow-soft"
              style={{ backgroundColor: theme.colors.cardBg, border: `1px solid ${theme.colors.cardBorder}` }}
            >
              <h2 className="text-xl font-bold mb-6" style={{ color: theme.colors.textPrimary }}>اتاق‌ها و سوئیت‌ها</h2>
              <div className="space-y-4">
                {hotel.rooms.map((room) => (
                  <motion.div
                    key={room.id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setSelectedRoom(room.id)}
                    className={`p-5 rounded-2xl cursor-pointer transition-all border-2 ${
                      selectedRoom === room.id ? 'shadow-lg' : 'hover:shadow-md'
                    }`}
                    style={{
                      backgroundColor: selectedRoom === room.id ? theme.colors.primaryLight + '60' : theme.colors.bodyBg,
                      borderColor: selectedRoom === room.id ? theme.colors.primary : theme.colors.cardBorder,
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>{room.name}</h3>
                      <span className="font-bold text-lg" style={{ color: theme.colors.priceBadgeColor }}>
                        {room.price.toLocaleString('fa-IR')} تومان
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm mb-3" style={{ color: theme.colors.textSecondary }}>
                      <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> ظرفیت: {room.capacity} نفر</span>
                      <span>تعداد: {room.count} اتاق</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {room.features.map((f) => (
                        <span key={f} className="px-3 py-1 rounded-lg text-xs font-medium" style={{ backgroundColor: theme.colors.cardBg, color: theme.colors.textSecondary }}>
                          {f}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Reviews */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-8 rounded-3xl shadow-soft"
              style={{ backgroundColor: theme.colors.cardBg, border: `1px solid ${theme.colors.cardBorder}` }}
            >
              <h2 className="text-xl font-bold mb-6" style={{ color: theme.colors.textPrimary }}>نظرات کاربران</h2>
              {hotelReviews.length === 0 ? (
                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>هنوز نظری ثبت نشده است.</p>
              ) : (
                <div className="space-y-4">
                  {hotelReviews.map((review) => (
                    <motion.div
                      key={review.id}
                      whileHover={{ scale: 1.01 }}
                      className="p-5 rounded-2xl"
                      style={{ backgroundColor: theme.colors.bodyBg }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>{review.userName}</span>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm mb-2" style={{ color: theme.colors.textSecondary }}>{review.comment}</p>
                      <span className="text-xs" style={{ color: theme.colors.textMuted }}>{formatJalali(review.date, { weekday: true })}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Contact Card */}
              <div className="p-6 rounded-3xl shadow-soft" style={{ backgroundColor: theme.colors.cardBg, border: `1px solid ${theme.colors.cardBorder}` }}>
                <h3 className="font-bold mb-5" style={{ color: theme.colors.textPrimary }}>اطلاعات تماس</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: theme.colors.primaryLight }}>
                      <Phone className="w-5 h-5" style={{ color: theme.colors.primary }} />
                    </div>
                    <span style={{ color: theme.colors.textSecondary }}>{hotel.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: theme.colors.primaryLight }}>
                      <Mail className="w-5 h-5" style={{ color: theme.colors.primary }} />
                    </div>
                    <span style={{ color: theme.colors.textSecondary }}>{hotel.email}</span>
                  </div>
                </div>
              </div>

              {/* Booking Card */}
              <div className="p-6 rounded-3xl shadow-soft-lg" style={{ backgroundColor: theme.colors.cardBg, border: `1px solid ${theme.colors.cardBorder}` }}>
                <h3 className="font-bold mb-5" style={{ color: theme.colors.textPrimary }}>رزرو اقامتگاه</h3>
                <div className="space-y-5">
                  <PersianRangeDatePicker
                    label="تاریخ ورود و خروج"
                    checkIn={checkIn}
                    checkOut={checkOut}
                    onCheckInChange={handleCheckInChange}
                    onCheckOutChange={handleCheckOutChange}
                    minDate={todayISO}
                    placeholder="انتخاب تاریخ ورود و خروج"
                  />

                  {selectedRoomObj && nights > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-5 rounded-2xl space-y-3"
                      style={{ backgroundColor: theme.colors.primaryLight + '50' }}
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span style={{ color: theme.colors.textSecondary }}>قیمت هر شب</span>
                        <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                          {selectedRoomObj.price.toLocaleString('fa-IR')} تومان
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span style={{ color: theme.colors.textSecondary }}>تعداد شب</span>
                        <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>{toPersianNumber(nights)} شب</span>
                      </div>
                      <div className="border-t pt-3 flex items-center justify-between" style={{ borderColor: theme.colors.primary + '40' }}>
                        <span className="font-bold" style={{ color: theme.colors.textPrimary }}>جمع کل</span>
                        <span className="text-xl font-bold" style={{ color: theme.colors.primary }}>
                          {totalPrice.toLocaleString('fa-IR')} تومان
                        </span>
                      </div>
                    </motion.div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowBookingModal(true)}
                    disabled={!selectedRoom || !checkIn || !checkOut}
                    className="w-full py-4 text-white font-bold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                      boxShadow: `0 8px 24px ${theme.colors.primary}40`,
                    }}
                  >
                    {!selectedRoom
                      ? 'ابتدا اتاق را انتخاب کنید'
                      : (!checkIn || !checkOut)
                      ? 'تاریخ ورود و خروج را انتخاب کنید'
                      : 'ادامه رزرو'}
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => { if (!bookingSuccess) setShowBookingModal(false); }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-modal-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl p-8 shadow-2xl max-h-[90dvh] overflow-y-auto"
            style={{ backgroundColor: theme.colors.cardBg }}
          >
            {bookingSuccess ? (
              <div className="text-center py-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 10 }}
                  className="w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: theme.colors.primaryLight }}
                >
                  <Check className="w-10 h-10" style={{ color: theme.colors.primary }} />
                </motion.div>
                <h3 className="text-xl font-bold mb-3" style={{ color: theme.colors.textPrimary }}>رزرو با موفقیت ثبت شد!</h3>
                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>پس از تأیید مدیریت، اطلاعات تکمیلی برای شما ارسال خواهد شد.</p>
              </div>
            ) : (
              <>
                <h3 id="booking-modal-title" className="text-xl font-bold mb-6" style={{ color: theme.colors.textPrimary }}>تکمیل اطلاعات رزرو</h3>
                <div className="space-y-5">
                  <div>
                    <label htmlFor="booking-name" className="text-sm font-medium mb-2 block" style={{ color: theme.colors.textPrimary }}>نام و نام خانوادگی *</label>
                    <input
                      id="booking-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={bookingForm.name}
                      onChange={(e) => setBookingForm((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border-2 rounded-xl text-sm focus:outline-none transition-all"
                      style={{ borderColor: theme.colors.cardBorder, backgroundColor: theme.colors.bodyBg }}
                      placeholder="نام خود را وارد کنید"
                    />
                  </div>
                  <div>
                    <label htmlFor="booking-phone" className="text-sm font-medium mb-2 block" style={{ color: theme.colors.textPrimary }}>شماره موبایل *</label>
                    <input
                      id="booking-phone"
                      name="tel"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      dir="ltr"
                      required
                      value={bookingForm.phone}
                      onChange={(e) => setBookingForm((prev) => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 border-2 rounded-xl text-sm focus:outline-none transition-all text-right"
                      style={{ borderColor: theme.colors.cardBorder, backgroundColor: theme.colors.bodyBg }}
                      placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    />
                  </div>
                  <div>
                    <label htmlFor="booking-email" className="text-sm font-medium mb-2 block" style={{ color: theme.colors.textPrimary }}>ایمیل</label>
                    <input
                      id="booking-email"
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      dir="ltr"
                      value={bookingForm.email}
                      onChange={(e) => setBookingForm((prev) => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border-2 rounded-xl text-sm focus:outline-none transition-all text-right"
                      style={{ borderColor: theme.colors.cardBorder, backgroundColor: theme.colors.bodyBg }}
                      placeholder="example@email.com"
                    />
                  </div>
                  {selectedRoomObj && (
                    <div className="p-4 rounded-xl text-sm space-y-2" style={{ backgroundColor: theme.colors.bodyBg }}>
                      <div className="flex items-center justify-between">
                        <span style={{ color: theme.colors.textSecondary }}>اتاق:</span>
                        <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>{selectedRoomObj.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span style={{ color: theme.colors.textSecondary }}>تاریخ اقامت:</span>
                        <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>{formatJalali(checkIn)} تا {formatJalali(checkOut)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span style={{ color: theme.colors.textSecondary }}>جمع کل:</span>
                        <span className="font-bold text-lg" style={{ color: theme.colors.primary }}>{totalPrice.toLocaleString('fa-IR')} تومان</span>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowBookingModal(false)}
                      className="flex-1 py-3 border-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                      style={{ borderColor: theme.colors.cardBorder, color: theme.colors.textSecondary }}
                    >
                      انصراف
                    </button>
                    <button
                      onClick={handleBooking}
                      disabled={!bookingForm.name || !bookingForm.phone}
                      className="flex-1 py-3 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                      style={{
                        background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                        boxShadow: `0 4px 16px ${theme.colors.primary}40`,
                      }}
                    >
                      ثبت رزرو
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
