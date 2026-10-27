// src/app/annuaire/page.tsx
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import ProfessionalListCard from '@/components/ui/ProfessionalListCard'
import SortSelect from '@/components/landing/SortSelect'
import AnnuaireLayout from '@/components/landing/AnnuaireLayout'
import { CATEGORIES } from '@/types'
import { Search, MapPin, SlidersHorizontal } from 'lucide-react'

interface SearchParams {
  q?: string
  city?: string
  category?: string
  sort?: string
  page?: string
}

async function getProfessionals(params: SearchParams) {
  const where: Record<string, unknown> = { status: 'ACTIVE' }

  if (params.q) {
    where.OR = [
      { companyName: { contains: params.q } },
      { description: { contains: params.q } },
      { category: { contains: params.q } },
    ]
  }
  if (params.city) {
    where.OR = [
      { city: { contains: params.city } },
      { postalCode: { contains: params.city } },
    ]
  }
  if (params.category) where.category = params.category

  const orderBy: Record<string, unknown> =
    params.sort === 'rating' ? { googleRating: 'desc' } :
    params.sort === 'new'    ? { createdAt: 'desc' }    :
    { featured: 'desc' }

  const page    = parseInt(params.page || '1')
  const perPage = 10

  const [pros, total] = await Promise.all([
    prisma.professional.findMany({
      where, orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
      include: { reviews: { take: 1 } },
    }),
    prisma.professional.count({ where }),
  ])

  return { pros, total, page, perPage }
}

export default async function AnnuairePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const [user, { pros, total, page, perPage }] = await Promise.all([
    getSession(),
    getProfessionals(params),
  ])

  const totalPages = Math.ceil(total / perPage)

  const serializedPros = pros.map(p => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    reviews: p.reviews.map(r => ({
      ...r,
      publishedAt: r.publishedAt.toISOString(),
      createdAt:   r.createdAt.toISOString(),
    })),
  }))

  return (
    /* IMPORTANT : pas de overflow:hidden sur ce wrapper — tuerait le sticky */
    <div className="min-h-screen bg-surface-50">
      <Navbar user={user} />

      {/* Barre de recherche sticky */}
      <div className="bg-white border-b border-gray-200 pt-16 sticky top-0 z-30 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <form method="GET">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center gap-2 bg-surface-50 border border-gray-200 rounded-xl px-4 py-2.5">
                <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  name="q"
                  defaultValue={params.q}
                  placeholder="Spécialité, trouble, praticien…"
                  className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder-gray-400"
                />
              </div>
              <div className="flex items-center gap-2 bg-surface-50 border border-gray-200 rounded-xl px-4 py-2.5 sm:w-52">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  name="city"
                  defaultValue={params.city}
                  placeholder="Ville ou CP"
                  className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder-gray-400"
                />
              </div>
              <div className="flex items-center gap-2 bg-surface-50 border border-gray-200 rounded-xl px-3 py-2.5 sm:w-56">
                <SlidersHorizontal className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <select
                  name="category"
                  defaultValue={params.category}
                  className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
                >
                  <option value="">Toutes catégories</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn-primary px-6 py-2.5 text-sm whitespace-nowrap">
                Rechercher
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Conteneur principal — PAS de overflow:hidden */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <AnnuaireLayout pros={serializedPros}>

          {/* Toolbar */}
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-900">{total}</span>{' '}
              praticien{total !== 1 ? 's' : ''} trouvé{total !== 1 ? 's' : ''}
              {params.city     ? ` à ${params.city}`     : ''}
              {params.category ? ` · ${params.category}` : ''}
            </p>
            <SortSelect defaultValue={params.sort} />
          </div>

          {/* Liste */}
          {pros.length === 0 ? (
            <div className="card p-16 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucun résultat</h3>
              <p className="text-gray-400 text-sm">
                Essayez avec d&apos;autres mots-clés ou une autre ville.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {serializedPros.map(pro => (
                <ProfessionalListCard key={pro.id} pro={pro} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <a
                  key={p}
                  href={`?${new URLSearchParams({ ...params, page: String(p) }).toString()}`}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-medium transition-colors ${
                    p === page
                      ? 'bg-brand-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-400'
                  }`}
                >
                  {p}
                </a>
              ))}
            </div>
          )}

        </AnnuaireLayout>
      </div>

      <Footer />
    </div>
  )
}
