// src/components/ui/ProfessionalCard.tsx
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, BadgeCheck } from 'lucide-react'
import StarRating from './StarRating'
import { cn } from '@/lib/utils'
import type { Professional } from '@/types'

interface ProfessionalCardProps {
  pro: Professional
  compact?: boolean
}

export default function ProfessionalCard({ pro, compact = false }: ProfessionalCardProps) {
  return (
    <Link href={`/profil/${pro.id}`}>
      <article className="card overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group">

        {/* Logo + identité */}
        <div className="p-4 flex items-start gap-3">
          <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 shadow-sm">
            <Image
              src={pro.logoUrl || '/defaults/default-logo.svg'}
              alt={pro.companyName}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-semibold text-gray-900 truncate group-hover:text-brand-600 transition-colors">
                {pro.companyName}
              </h3>
              {pro.sirenVerified && (
                <BadgeCheck className="w-4 h-4 text-brand-500 flex-shrink-0" />
              )}
              {pro.featured && (
                <span className="text-xs font-bold bg-accent-100 text-accent-700 px-2 py-0.5 rounded-full">
                  En vedette
                </span>
              )}
            </div>
            <p className="text-xs text-brand-600 font-medium mt-0.5">{pro.category}</p>
            {pro.googleRating && (
              <div className="mt-1">
                <StarRating rating={pro.googleRating} count={pro.googleReviews || 0} size="sm" />
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {!compact && pro.description && (
          <div className="px-4 pb-3">
            <p className="text-sm text-gray-500 line-clamp-2">{pro.description}</p>
          </div>
        )}

        {/* Adresse + CTA */}
        <div className="px-4 pb-4 mt-1 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 min-w-0">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{pro.city} {pro.postalCode}</span>
          </div>
          <span className="text-xs font-semibold text-brand-600 group-hover:underline whitespace-nowrap">
            Voir la fiche →
          </span>
        </div>
      </article>
    </Link>
  )
}
