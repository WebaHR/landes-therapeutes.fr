// src/app/dashboard/page.tsx
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Navbar from '@/components/ui/Navbar'
import DashboardContent from '@/components/dashboard/DashboardContent'
import ConsultationsManager from '@/components/dashboard/ConsultationsManager'

export default async function DashboardPage() {
  const user = await getSession()
  if (!user) redirect('/connexion')
  if (user.role === 'ADMIN') redirect('/admin')

  const professional = await prisma.professional.findUnique({
    where: { userId: user.id },
    include: {
      reviews:      { orderBy: { publishedAt: 'desc' }, take: 5 },
      openingHours: true,
      formations:   { orderBy: { annee: 'desc' } },
      faqItems:     { orderBy: { createdAt: 'asc' } },
      photos:       { orderBy: { createdAt: 'asc' } },
    },
  })

  // Fetch consultationTypes séparément — graceful si table pas encore migrée
  let consultationTypes: {
    id: string; name: string; description: string | null
    durationMin: number; price: number; locationType: string; isActive: boolean
  }[] = []
  if (professional) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      consultationTypes = await (prisma as any).consultationType.findMany({
        where: { professionalId: professional.id },
        orderBy: { createdAt: 'asc' },
      })
    } catch {
      // Table pas encore créée — ignoré
    }
  }

  const serialized = professional ? {
    ...professional,
    createdAt: professional.createdAt.toISOString(),
    updatedAt: professional.updatedAt.toISOString(),
    reviews: professional.reviews.map(r => ({
      ...r,
      publishedAt: r.publishedAt.toISOString(),
      createdAt:   r.createdAt.toISOString(),
    })),
    formations: professional.formations.map(f => ({ ...f, createdAt: f.createdAt.toISOString() })),
    faqItems:   professional.faqItems.map(f => ({ ...f, createdAt: f.createdAt.toISOString() })),
    photos:     professional.photos.map(p => ({ ...p, createdAt: p.createdAt.toISOString() })),
  } : null

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar user={{ email: user.email, role: user.role }} />
      <DashboardContent user={{ id: user.id, email: user.email, role: user.role }} professional={serialized} />

      {serialized && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <ConsultationsManager
            professionalId={serialized.id}
            initial={consultationTypes}
          />
        </div>
      )}
    </div>
  )
}
