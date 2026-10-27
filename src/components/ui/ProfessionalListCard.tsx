'use client'
// src/components/ui/ProfessionalListCard.tsx
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, BadgeCheck, Star } from 'lucide-react'
import type { Professional } from '@/types'
import { useHover } from '@/components/landing/HoverContext'

interface Props {
  pro: Professional
}

export default function ProfessionalListCard({ pro }: Props) {
  const { setHoveredId } = useHover()

  return (
    <Link href={`/profil/${pro.id}`}>
      <article
        className="card flex gap-4 p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
        style={{ border: '1px solid #317460' }}
        onMouseEnter={() => setHoveredId(pro.id)}
        onMouseLeave={() => setHoveredId(null)}
      >
        {/* Logo */}
        <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 self-start">
          <Image
            src={pro.logoUrl || '/defaults/default-logo.svg'}
            alt={pro.companyName}
            fill
            className="object-cover"
          />
        </div>

        {/* Contenu + CTA en colonne */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Ligne titre + note */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-semibold text-gray-900 hover:text-brand-600 transition-colors truncate">
                  {pro.companyName}
                </h3>
                {pro.sirenVerified && (
                  <BadgeCheck className="w-4 h-4 text-brand-500 flex-shrink-0" />
                )}
                {pro.featured && (
                  <span className="text-xs font-bold bg-accent-100 text-accent-700 px-2 py-0.5 rounded-full flex-shrink-0">
                    En vedette
                  </span>
                )}
              </div>
              <p className="text-xs text-brand-600 font-medium mt-0.5">{pro.category}</p>
            </div>
            {pro.googleRating && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-sm font-semibold text-gray-800">{pro.googleRating.toFixed(1)}</span>
                <span className="text-xs text-gray-400">({pro.googleReviews || 0})</span>
              </div>
            )}
          </div>

          {pro.description && (
            <p className="text-sm text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
              {pro.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              {pro.address ? `${pro.address}, ` : ''}{pro.city} {pro.postalCode}
            </span>
            {pro.phone && (
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                {pro.phone}
              </span>
            )}
          </div>

          {/* CTA en bas à droite */}
          <div className="mt-3 flex justify-end">
            <span className="text-xs font-semibold text-brand-600 hover:underline whitespace-nowrap">
              Voir la fiche →
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
