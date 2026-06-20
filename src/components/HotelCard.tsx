import { Link } from 'react-router-dom';
import { MapPin, Wifi, Car, UtensilsCrossed, Dumbbell, Waves, Coffee, ArrowLeft } from 'lucide-react';
import { Hotel } from '../types';
import StarRating from './StarRating';
import ReviewBadge from './ReviewBadge';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

const amenityIcons: Record<string, React.ReactNode> = {
  'استخر': <Waves className="w-3.5 h-3.5" />,
  'سونا': <Waves className="w-3.5 h-3.5" />,
  'جکوزی': <Waves className="w-3.5 h-3.5" />,
  'رستوران': <UtensilsCrossed className="w-3.5 h-3.5" />,
  'کافی‌شاپ': <Coffee className="w-3.5 h-3.5" />,
  'پارکینگ': <Car className="w-3.5 h-3.5" />,
  'اینترنت رایگان': <Wifi className="w-3.5 h-3.5" />,
  'مرکز بدنسازی': <Dumbbell className="w-3.5 h-3.5" />,
};

interface HotelCardProps {
  hotel: Hotel;
  index?: number;
}

export default function HotelCard({ hotel, index = 0 }: HotelCardProps) {
  const { theme } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="group relative overflow-hidden card-lift"
      style={{
        backgroundColor: theme.colors.cardBg,
        borderRadius: theme.sizes.cardBorderRadius + 4,
        border: `1px solid ${theme.colors.cardBorder}`,
        boxShadow: '0 2px 4px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)',
      }}
      whileHover={{ y: -6 }}
    >
      <Link to={`/hotel/${hotel.id}`} className="block">
        {/* Image */}
        <div className="relative overflow-hidden" style={{ height: theme.sizes.cardImageHeight }}>
          <img
            src={hotel.images[0]}
            alt={`تصویر ${hotel.name} در ${hotel.city}`}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          {/* Type badge */}
          <div className="absolute top-3 right-3">
            <span className="px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-full text-xs font-semibold text-gray-800 shadow-lg">
              {hotel.type}
            </span>
          </div>

          {/* Featured badge */}
          {hotel.isFeatured && (
            <div className="absolute top-3 left-3">
              <span
                className="px-3 py-1.5 text-white rounded-full text-xs font-bold shadow-lg flex items-center gap-1"
                style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})` }}
              >
                ⭐ ویژه
              </span>
            </div>
          )}

          {/* Price on image */}
          <div className="absolute bottom-3 right-3">
            <div className="bg-white/95 backdrop-blur-md rounded-xl px-3 py-2 shadow-lg">
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold" style={{ color: theme.colors.priceBadgeColor }}>
                  {hotel.pricePerNight.toLocaleString('fa-IR')}
                </span>
                <span className="text-xs text-gray-500">تومان</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h3
                className="font-bold text-base leading-tight mb-2 truncate"
                style={{ color: theme.colors.textPrimary }}
              >
                {hotel.name}
              </h3>
              <StarRating stars={hotel.stars} />
            </div>
            <ReviewBadge review={hotel.review} score={hotel.reviewScore} />
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 mb-4" style={{ color: theme.colors.textSecondary }}>
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs truncate">{hotel.city}، {hotel.address}</span>
          </div>

          {/* Amenities */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {hotel.amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity}
                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg text-xs text-gray-600"
              >
                {amenityIcons[amenity] || null}
                {amenity}
              </span>
            ))}
            {hotel.amenities.length > 3 && (
              <span className="px-2 py-1 bg-gray-50 rounded-lg text-xs text-gray-500">
                +{hotel.amenities.length - 3}
              </span>
            )}
          </div>

          {/* CTA */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <span className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>
              مشاهده و رزرو
            </span>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                boxShadow: `0 4px 12px ${theme.colors.primary}40`,
              }}
            >
              <ArrowLeft className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
