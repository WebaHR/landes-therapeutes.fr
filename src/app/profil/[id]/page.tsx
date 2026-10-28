// src/app/profil/[id]/page.tsx
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import StarRating from '@/components/ui/StarRating'
import BookingCalendar from '@/components/ui/BookingCalendar'
import { Phone, Globe, Mail, ExternalLink, ArrowLeft, ShieldCheck, Users, Car, Video, MapPin, GraduationCap, HelpCircle, Facebook, Instagram, Linkedin, Clock } from 'lucide-react'
import ContactModal from '@/components/ui/ContactModal'
import { formatDate } from '@/lib/utils'
import type { Metadata } from 'next'

// dayOfWeek suit la convention Date.getDay() : 0 = dimanche
const DAY_LABELS: Record<number, string> = {
  0: 'Dimanche', 1: 'Lundi', 2: 'Mardi', 3: 'Mercredi',
  4: 'Jeudi', 5: 'Vendredi', 6: 'Samedi',
}
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]

function formatDayHours(h?: {
  isClosed: boolean
  openTime: string | null
  closeTime: string | null
  openAfternoon: string | null
  closeAfternoon: string | null
} | null): string {
  if (!h || h.isClosed) return 'Fermé'
  const parts: string[] = []
  if (h.openTime && h.closeTime) parts.push(`${h.openTime} - ${h.closeTime}`)
  if (h.openAfternoon && h.closeAfternoon) parts.push(`${h.openAfternoon} - ${h.closeAfternoon}`)
  return parts.length ? parts.join(' / ') : 'Fermé'
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const pro = await prisma.professional.findUnique({ where: { id } })
  if (!pro) return { title: 'Praticien introuvable' }
  return {
    title: `${pro.companyName} — landes-therapeutes.fr`,
    description: pro.description || `Fiche praticien de ${pro.companyName} à ${pro.city}`,
  }
}

export default async function ProfilPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [user, pro] = await Promise.all([
    getSession(),
    prisma.professional.findUnique({
      where: { id },
      include: {
        reviews:      { orderBy: { publishedAt: 'desc' } },
        openingHours: { orderBy: { dayOfWeek: 'asc' } },
        formations:   { orderBy: { annee: 'desc' } },
        faqItems:     { orderBy: { createdAt: 'asc' } },
        photos:       { orderBy: { createdAt: 'asc' } },
      },
    }),
  ])

  if (!pro) notFound()

  // Fetch consultation types séparément — graceful si table pas encore migrée
  let consultationTypes: {
    id: string; name: string; description: string | null
    durationMin: number; price: number; locationType: string
  }[] = []
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const types = await (prisma as any).consultationType.findMany({
      where: { professionalId: id, isActive: true },
      orderBy: { createdAt: 'asc' },
    })
    consultationTypes = types
  } catch {
    // Table pas encore créée — on affiche simplement le calendrier vide
  }

  const isOwner = user?.id === (await prisma.user.findUnique({ where: { email: pro.email || '' } }))?.id

  const now = new Date()
  const todayNum = now.getDay()
  const todayHours = pro.openingHours.find(h => h.dayOfWeek === todayNum)
  const currentTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
  let isOpenNow = false
  if (todayHours && !todayHours.isClosed) {
    const inMorning   = todayHours.openTime && todayHours.closeTime
      && currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime
    const inAfternoon = todayHours.openAfternoon && todayHours.closeAfternoon
      && currentTime >= todayHours.openAfternoon && currentTime <= todayHours.closeAfternoon
    isOpenNow = !!(inMorning || inAfternoon)
  }

  // Avis Google en priorité, sinon moyenne des avis de la plateforme
  const platformRating = pro.reviews.length > 0
    ? pro.reviews.reduce((sum, r) => sum + r.rating, 0) / pro.reviews.length
    : null
  const displayRating = pro.googleRating ?? platformRating
  const displayRatingCount = pro.googleRating ? (pro.googleReviews || 0) : pro.reviews.length

  const serializedHours = pro.openingHours.map(h => ({
    dayOfWeek: h.dayOfWeek, isClosed: h.isClosed,
    openTime: h.openTime, closeTime: h.closeTime,
    openAfternoon: h.openAfternoon, closeAfternoon: h.closeAfternoon,
  }))

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <Link href="/annuaire" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mt-6 mb-6">
          <ArrowLeft className="w-4 h-4" /> Retour à l&apos;annuaire
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-6 items-start">

          {/* ══ COLONNE GAUCHE 70% ══ */}
          <div className="space-y-6 min-w-0">

            <div className="card p-6">
              <div className="flex items-start gap-5">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden flex-shrink-0 shadow-md">
                  <Image src={pro.logoUrl || '/defaults/default-logo.svg'} alt={pro.companyName} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{pro.companyName}</h1>
                        {pro.sirenVerified && (
                          <span className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 text-xs font-bold px-3 py-1 rounded-full border border-brand-200">
                            <ShieldCheck className="w-3.5 h-3.5" /> Vérifié landes-therapeutes.fr
                          </span>
                        )}
                        {pro.openingHours.length > 0 && (
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isOpenNow ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {isOpenNow ? '● Ouvert' : '● Fermé'}
                          </span>
                        )}
                      </div>
                      {(pro.activityTitle || displayRating !== null) && (
                        <div className="flex items-center justify-between gap-3 mt-1">
                          {pro.activityTitle && (
                            <p className="text-gray-700 font-medium">{pro.activityTitle}</p>
                          )}
                          {displayRating !== null && (
                            <StarRating rating={displayRating} count={displayRatingCount} size="md" />
                          )}
                        </div>
                      )}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {pro.acceptsPublic && (
                          <span className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-brand-100">
                            <Users className="w-3.5 h-3.5" /> Reçoit en cabinet
                          </span>
                        )}
                        {pro.travelsHome && (
                          <span className="inline-flex items-center gap-1.5 bg-accent-50 text-accent-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-accent-100">
                            <Car className="w-3.5 h-3.5" /> Se déplace à domicile
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-purple-100">
                          <Video className="w-3.5 h-3.5" /> Consultation à distance
                        </span>
                      </div>
                      {pro.description && (
                        <p className="mt-3 text-gray-600 leading-relaxed italic">{pro.description}</p>
                      )}
                      {(pro as { richDescription?: string | null }).richDescription && (
                        <div
                          className="mt-3 rich-content"
                          dangerouslySetInnerHTML={{ __html: (pro as { richDescription?: string | null }).richDescription! }}
                        />
                      )}
                    </div>
                    {isOwner && (
                      <Link href="/dashboard" className="btn-secondary text-sm py-2 flex items-center gap-1.5 flex-shrink-0">
                        <ExternalLink className="w-4 h-4" /> Modifier ma fiche
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Numéro SIREN */}
              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                SIREN : {pro.siren.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3')}
              </div>
            </div>

            {/* Galerie photos */}
            {pro.photos.length > 0 && (
              <div className="card p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Galerie photos</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {pro.photos.map(photo => (
                    <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200">
                      <Image src={photo.url} alt={pro.companyName} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ */}
            {pro.faqItems.length > 0 && (
              <div className="card p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-brand-500" /> Questions fréquentes
                </h2>
                <div className="space-y-4">
                  {pro.faqItems.map(faq => (
                    <div key={faq.id}>
                      <p className="font-semibold text-sm text-gray-800">{faq.question}</p>
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed">{faq.reponse}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Avis */}
            {pro.reviews.length > 0 ? (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Avis clients</h2>
                  {pro.googleRating && <StarRating rating={pro.googleRating} count={pro.reviews.length} size="md" />}
                </div>
                <div className="space-y-5">
                  {pro.reviews.map(review => (
                    <div key={review.id} className="flex gap-4 pb-5 border-b border-gray-100 last:border-0 last:pb-0">
                      {review.authorPhoto
                        ? <Image src={review.authorPhoto} alt={review.authorName} width={40} height={40} className="rounded-full flex-shrink-0" />
                        : <div className="w-10 h-10 bg-brand-50 rounded-full flex items-center justify-center text-sm font-bold text-brand-600 flex-shrink-0">{review.authorName.charAt(0)}</div>
                      }
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-gray-800">{review.authorName}</p>
                          <StarRating rating={review.rating} showCount={false} size="sm" />
                        </div>
                        {review.text && <p className="text-gray-600 text-sm mt-1.5 leading-relaxed">{review.text}</p>}
                        <p className="text-xs text-gray-400 mt-2">{formatDate(review.publishedAt.toISOString())}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="card p-8 text-center text-gray-400">
                <p className="text-sm">Aucun avis pour le moment.</p>
              </div>
            )}
          </div>

          {/* ══ COLONNE DROITE 30% : CONTACT & CALENDRIER RDV ══ */}
          <div className="space-y-6">

            {/* Formations & Parcours */}
            {(pro.formations.length > 0 || pro.parcours) && (
              <div className="card p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-brand-500" /> Formations &amp; Parcours
                </h2>
                {pro.formations.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {pro.formations.map(f => (
                      <div key={f.id} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-brand-400 mt-1.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-sm text-gray-800">{f.titre}</p>
                          <p className="text-xs text-gray-500">
                            {[f.etablissement, f.annee].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {pro.parcours && (
                  <div className="rich-content pt-2 border-t border-gray-100" dangerouslySetInnerHTML={{ __html: pro.parcours }} />
                )}
              </div>
            )}

            {/* Contacter */}
            <div className="card p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contacter</h2>
              <div className="flex flex-col gap-3">
                <ContactModal proName={pro.companyName} proEmail={pro.publicEmail || pro.email} />
                {pro.phone && (
                  <a href={`tel:${pro.phone}`} className="flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-semibold py-3 px-4 rounded-xl transition-all text-sm shadow-sm">
                    <Phone className="w-4 h-4" /> Appeler
                  </a>
                )}
                {(pro.publicEmail || pro.email) && (
                  <a href={`mailto:${pro.publicEmail || pro.email}`} className="flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold py-3 px-4 rounded-xl transition-all text-sm">
                    <Mail className="w-4 h-4" /> Envoyer un email
                  </a>
                )}
                {pro.website && (
                  <a href={pro.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold py-3 px-4 rounded-xl transition-all text-sm">
                    <Globe className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{pro.website.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}
              </div>

              {pro.acceptsPublic && (
                <div className="mt-5 pt-4 border-t border-gray-100 flex items-start gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" />
                  <span>{pro.address ? `${pro.address}, ` : ''}{pro.postalCode} {pro.city}</span>
                </div>
              )}

              {(pro.facebookUrl || pro.instagramUrl || pro.linkedinUrl) && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
                  {pro.facebookUrl && (
                    <a href={pro.facebookUrl} target="_blank" rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-gray-100 hover:bg-brand-50 text-gray-500 hover:text-brand-600 flex items-center justify-center transition-colors">
                      <Facebook className="w-4 h-4" />
                    </a>
                  )}
                  {pro.instagramUrl && (
                    <a href={pro.instagramUrl} target="_blank" rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-gray-100 hover:bg-brand-50 text-gray-500 hover:text-brand-600 flex items-center justify-center transition-colors">
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                  {pro.linkedinUrl && (
                    <a href={pro.linkedinUrl} target="_blank" rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-gray-100 hover:bg-brand-50 text-gray-500 hover:text-brand-600 flex items-center justify-center transition-colors">
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Horaires d'ouverture */}
            {pro.openingHours.length > 0 && (
              <div className="card p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-brand-500" /> Horaires d&apos;ouverture
                </h2>
                <div className="space-y-1.5">
                  {DAY_ORDER.map(day => {
                    const h = pro.openingHours.find(oh => oh.dayOfWeek === day)
                    const isToday = day === todayNum
                    return (
                      <div key={day} className={`flex justify-between items-center py-1.5 px-2 rounded-lg text-sm ${isToday ? 'bg-brand-50 font-semibold text-brand-700' : 'text-gray-600'}`}>
                        <span>{isToday && '→ '}{DAY_LABELS[day]}</span>
                        <span>{formatDayHours(h)}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <BookingCalendar
              professionalId={pro.id}
              consultationTypes={consultationTypes}
              openingHours={serializedHours}
            />
          </div>

        </div>
      </div>
      <Footer />
    </div>
  )
}
