import { ReviewLevel } from '../types';
import { motion } from 'framer-motion';

interface ReviewBadgeProps {
  review: ReviewLevel;
  score?: number;
}

const reviewStyles: Record<ReviewLevel, { bg: string; text: string; emoji: string }> = {
  'ضعیف': { bg: 'bg-red-50', text: 'text-red-700', emoji: '😞' },
  'متوسط': { bg: 'bg-orange-50', text: 'text-orange-700', emoji: '😐' },
  'خوب': { bg: 'bg-yellow-50', text: 'text-yellow-700', emoji: '🙂' },
  'بسیار خوب': { bg: 'bg-emerald-50', text: 'text-emerald-700', emoji: '😊' },
  'عالی': { bg: 'bg-teal-50', text: 'text-teal-700', emoji: '🤩' },
};

export default function ReviewBadge({ review, score }: ReviewBadgeProps) {
  const style = reviewStyles[review];
  
  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}
    >
      <span className="text-sm">{style.emoji}</span>
      {review}
      {score !== undefined && (
        <span className="opacity-70">({score})</span>
      )}
    </motion.span>
  );
}
