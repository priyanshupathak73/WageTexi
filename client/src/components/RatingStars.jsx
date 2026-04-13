import { Star } from 'lucide-react';

const RatingStars = ({ rating, size = 16 }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={star <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
        />
      ))}
      <span className="text-sm text-gray-500 ml-1">{rating?.toFixed(1) || '0.0'}</span>
    </div>
  );
};

export default RatingStars;
