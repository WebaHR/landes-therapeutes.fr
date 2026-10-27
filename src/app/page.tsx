// src/app/page.tsx
import Link from 'next/link'
import { Search, MapPin, Star, BadgeCheck, ChevronRight, ArrowRight, Users, Building2, Award } from 'lucide-react'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ProfessionalCard from '@/components/ui/ProfessionalCard'
import { CATEGORIES } from '@/types'
import SpecialtySlider from '@/components/landing/SpecialtySlider'

async function getStats() {
  try {
    const [totalPros, totalCities, totalReviews] = await Promise.all([
      prisma.professional.count({ where: { status: 'ACTIVE' } }),
      prisma.professional.groupBy({ by: ['city'], where: { status: 'ACTIVE' } }).then(r => r.length),
      prisma.review.count(),
    ])
    return { totalPros, totalCities, totalReviews }
  } catch {
    return { totalPros: 0, totalCities: 0, totalReviews: 0 }
  }
}

async function getFeaturedPros() {
  try {
    return await prisma.professional.findMany({
      where: { status: 'ACTIVE' },
      include: { reviews: true },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      take: 6,
    })
  } catch {
    return []
  }
}

const CATEGORY_ICONS: Record<string, string> = {
  'Naturopathie': '🌿',
  'Sophrologie': '🧘',
  'Réflexologie': '🦶',
  'Ostéopathie': '🤲',
  'Acupuncture': '🪡',
  'Hypnothérapie': '💫',
  'Méditation & Pleine conscience': '🔮',
  'Massage bien-être': '💆',
  'Aromathérapie': '🌸',
  'Homéopathie': '💊',
  'Phytothérapie': '🌱',
  'Kinésiologie': '⚡',
  'Chromothérapie': '🌈',
  'Lithothérapie': '💎',
  'Reiki & Énergétique': '✨',
  'Ayurveda': '🪷',
  'Nutrition holistique': '🥗',
  'Yoga & Pranayama': '🧘',
  'Qi Gong & Tai Chi': '☯️',
  'Psychothérapie humaniste': '🧠',
  'Art-thérapie': '🎨',
  'Musicothérapie': '🎵',
  'Coaching de vie': '🌟',
  'Autre médecine douce': '🌙',
}

export default async function HomePage() {
  const [user, stats, featuredPros] = await Promise.all([
    getSession(),
    getStats(),
    getFeaturedPros(),
  ])

  return (
    <div className="min-h-screen">
      <Navbar user={user} transparent />

      {/* ═══════════ HERO ═══════════ */}
      <section className="hero-bg min-h-[92vh] flex items-center relative overflow-hidden">
        {/* Floating blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -right-20 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full text-white/80 text-sm font-medium mb-8">
            <MapPin className="w-4 h-4 text-accent-400" />
            <span>L&apos;annuaire des praticiens bien-être de votre région</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight">
            Trouvez votre
            <br />
            <SpecialtySlider />
            <br />
            <span className="text-white">près de chez vous</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-white/60 max-w-2xl mx-auto">
            Thérapeutes, coachs, soignants — des milliers de praticiens bien-être vérifiés
            avec avis clients et coordonnées directes.
          </p>

          {/* Search bar */}
          <div className="mt-10 w-4/5 mx-auto">
            <form action="/annuaire" method="GET">
              <div className="flex flex-col sm:flex-row gap-3 bg-white rounded-2xl p-2 shadow-2xl">
                <div className="flex-1 flex items-center gap-3 px-3">
                  <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <input
                    name="q"
                    type="text"
                    placeholder="Spécialité, trouble, praticien…"
                    className="flex-1 py-3 text-gray-800 placeholder-gray-400 bg-transparent border-none outline-none text-base"
                  />
                </div>
                <div className="hidden sm:block w-px bg-gray-200 my-2" />
                <div className="flex-1 flex items-center gap-3 px-3">
                  <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <input
                    name="city"
                    type="text"
                    placeholder="Ville ou code postal"
                    className="flex-1 py-3 text-gray-800 placeholder-gray-400 bg-transparent border-none outline-none text-base"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary text-base px-8 py-3 rounded-xl"
                >
                  Rechercher
                </button>
              </div>
            </form>
          </div>

          {/* Quick categories */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {['Naturopathie', 'Sophrologie', 'Ostéopathie', 'Massage bien-être', 'Yoga & Pranayama'].map(cat => (
              <Link
                key={cat}
                href={`/annuaire?category=${encodeURIComponent(cat)}`}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white/80 hover:text-white text-sm rounded-full transition-all"
              >
                <span>{CATEGORY_ICONS[cat]}</span>
                <span>{cat}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="w-5 h-8 border-2 border-white/30 rounded-full flex items-start justify-center pt-1">
            <div className="w-1 h-2 bg-white/50 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ═══════════ STATS ═══════════ */}
      <section className="bg-white py-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-brand-600">
                {stats.totalPros > 0 ? `${stats.totalPros}+` : '—'}
              </div>
              <div className="mt-1 text-sm text-gray-500">Praticiens inscrits</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-brand-600">
                {stats.totalCities > 0 ? `${stats.totalCities}` : '—'}
              </div>
              <div className="mt-1 text-sm text-gray-500">Villes couvertes</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-brand-600">
                {stats.totalReviews > 0 ? `${stats.totalReviews}+` : '—'}
              </div>
              <div className="mt-1 text-sm text-gray-500">Avis clients</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ CATEGORIES ═══════════ */}
      <section className="py-20 bg-surface-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="section-tag">🗂️ Catégories</span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-gray-900">
              Tous les secteurs d&apos;activité
            </h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">
              Des praticiens vérifiés dans chaque domaine, près de chez vous.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {CATEGORIES.map(cat => (
              <Link
                key={cat}
                href={`/annuaire?category=${encodeURIComponent(cat)}`}
                className="group card p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="text-3xl mb-3">{CATEGORY_ICONS[cat] || '📋'}</div>
                <h3 className="font-semibold text-gray-800 text-sm group-hover:text-brand-600 transition-colors">
                  {cat}
                </h3>
                <div className="mt-1.5 flex items-center gap-1 text-xs text-gray-400 group-hover:text-brand-400 transition-colors">
                  <span>Voir les pros</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/annuaire" className="btn-outline inline-flex items-center gap-2">
              Toutes les catégories <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURED PROFESSIONALS ═══════════ */}
      <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="section-tag">⭐ En vedette</span>
                <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-gray-900">
                  Praticiens recommandés
                </h2>
              </div>
              <Link href="/annuaire" className="hidden sm:flex items-center gap-1 text-brand-600 font-semibold hover:underline text-sm">
                Voir tous <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPros.map(pro => (
                <ProfessionalCard
                  key={pro.id}
                  pro={{
                    ...pro,
                    createdAt: pro.createdAt.toISOString(),
                    updatedAt: pro.updatedAt.toISOString(),
                    reviews: pro.reviews.map(r => ({
                      ...r,
                      publishedAt: r.publishedAt.toISOString(),
                    })),
                  }}
                />
              ))}
            </div>
          </div>
        </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="py-20 bg-surface-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="section-tag">💡 Comment ça marche</span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-gray-900">
              Simple, rapide, efficace
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Search, step: '01', title: 'Recherchez', desc: 'Par métier, ville ou code postal. Filtrez par catégorie, note ou disponibilité.' },
              { icon: BadgeCheck, step: '02', title: 'Vérifiez', desc: 'Chaque praticien est vérifié par numéro SIREN. Avis Google synchronisés.' },
              { icon: Star, step: '03', title: 'Contactez', desc: 'Téléphone, email, site web — les coordonnées directes sans intermédiaire.' },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="card p-8 text-center relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-brand-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {step}
                </div>
                <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Icon className="w-7 h-7 text-brand-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA FOR PROFESSIONALS ═══════════ */}
      <section className="py-20 bg-gradient-to-br from-brand-600 to-brand-800 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-white/5 rounded-full" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="flex -space-x-2">
              {['🏪', '🔧', '💈', '🍕'].map((emoji, i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg border-2 border-white/30">
                  {emoji}
                </div>
              ))}
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Vous êtes praticien bien-être ?
          </h2>
          <p className="mt-4 text-lg text-white/70 max-w-xl mx-auto">
            Inscrivez votre activité gratuitement et attirez de nouveaux clients bien-être.
            Validation SIREN automatique, importez votre logo et vos horaires.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/inscription" className="bg-white text-brand-700 font-bold px-8 py-4 rounded-xl hover:bg-brand-50 transition-all active:scale-95 shadow-lg">
              Inscrire mon activité gratuitement
            </Link>
            <Link href="/tarifs" className="border-2 border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-all">
              Voir les offres →
            </Link>
          </div>
          <div className="mt-6 flex items-center justify-center gap-6 text-white/50 text-sm">
            <span className="flex items-center gap-1.5"><BadgeCheck className="w-4 h-4" /> Validation SIREN incluse</span>
            <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> Sans engagement</span>
            <span className="flex items-center gap-1.5"><Award className="w-4 h-4" /> Gratuit à vie</span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
