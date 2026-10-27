'use client'
// src/components/ui/StarRating.tsx
import { Star, StarHalf } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  count?: number
  size?: 'sm' | 'md' | 'lg'
  showCount?: boolean
}

export default function StarRating({ rating, count, size = 'md', showCount = true }: StarRatingProps) {
  const sizes = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5' }
  const textSizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' }

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5 text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(sizes[size], star <= Math.round(rating) ? 'fill-current' : 'fill-gray-200 text-gray-200')}
          />
        ))}
      </div>
      <span className={cn('font-semibold text-gray-800', textSizes[size])}>{rating.toFixed(1)}</span>
      {showCount && count !== undefined && (
        <span className={cn('text-gray-500', textSizes[size])}>({count} avis)</span>
      )}
    </div>
  )
}
