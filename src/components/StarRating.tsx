import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface StarRatingProps {
  stars: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function StarRating({ stars, size = 'sm' }: StarRatingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: i * 0.05, type: 'spring', damping: 10 }}
        >
          <Star
            className={`${sizeClasses[size]} transition-colors ${
              i < stars ? 'text-amber-400 fill-amber-400' : 'text-gray-200'
            }`}
          />
        </motion.div>
      ))}
    </div>
  );
}
