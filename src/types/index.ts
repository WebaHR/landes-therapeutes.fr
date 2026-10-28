// src/types/index.ts

export type Role = 'ADMIN' | 'PROFESSIONAL'
export type ProfStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED'
export type Plan = 'FREE' | 'PRO' | 'PREMIUM'

export interface Professional {
  id: string
  userId: string
  companyName: string
  siren: string
  sirenVerified: boolean
  category: string
  activityTitle?: string | null
  description?: string | null
  logoUrl?: string | null
  bannerUrl?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  address?: string | null
  city: string
  postalCode: string
  latitude?: number | null
  longitude?: number | null
  googlePlaceId?: string | null
  googleRating?: number | null
  googleReviews?: number | null
  acceptsPublic?: boolean
  travelsHome?: boolean
  status: ProfStatus
  featured: boolean
  plan: Plan
  createdAt: string
  updatedAt: string
  reviews?: Review[]
  openingHours?: OpeningHour[]
}

export interface Review {
  id: string
  professionalId: string
  authorName: string
  authorPhoto?: string | null
  rating: number
  text?: string | null
  publishedAt: string
  source: string
}

export interface OpeningHour {
  id: string
  professionalId: string
  dayOfWeek: number
  openTime?: string | null
  closeTime?: string | null
  openAfternoon?: string | null
  closeAfternoon?: string | null
  isClosed: boolean
}

export interface User {
  id: string
  email: string
  role: Role
  professional?: Professional | null
}

export interface SirenData {
  siren: string
  denominationUniteLegale: string
  categorieJuridiqueUniteLegale: string
  activitePrincipaleUniteLegale: string
  etatAdministratifUniteLegale: string
  nicSiegeUniteLegale: string
}

export const CATEGORIES = [
  'Naturopathie',
  'Sophrologie',
  'Réflexologie',
  'Ostéopathie',
  'Acupuncture',
  'Hypnothérapie',
  'Méditation & Pleine conscience',
  'Massage bien-être',
  'Aromathérapie',
  'Homéopathie',
  'Phytothérapie',
  'Kinésiologie',
  'Chromothérapie',
  'Lithothérapie',
  'Reiki & Énergétique',
  'Ayurveda',
  'Nutrition holistique',
  'Yoga & Pranayama',
  'Qi Gong & Tai Chi',
  'Psychothérapie humaniste',
  'Art-thérapie',
  'Musicothérapie',
  'Coaching de vie',
  'Autre médecine douce',
] as const

export type Category = typeof CATEGORIES[number]
