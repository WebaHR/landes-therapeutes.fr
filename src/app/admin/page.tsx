// src/app/admin/page.tsx
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Navbar from '@/components/ui/Navbar'
import AdminDashboard from '@/components/dashboard/AdminDashboard'

export default async function AdminPage() {
  const user = await getSession()
  if (!user) redirect('/connexion')
  if (user.role !== 'ADMIN') redirect('/dashboard')

  const [pendingPros, allPros, totalUsers, totalReviews] = await Promise.all([
    prisma.professional.findMany({
      where: { status: 'PENDING' },
      include: {
        user: { select: { email: true, createdAt: true } },
        openingHours: true,
        reviews: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.professional.findMany({
      include: {
        user: { select: { email: true, createdAt: true } },
        openingHours: true,
        reviews: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count(),
    prisma.review.count(),
  ])

  const serialize = (pros: typeof allPros) => pros.map(p => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    user: {
      ...p.user,
      createdAt: p.user.createdAt.toISOString(),
    },
    reviews: p.reviews.map(r => ({
      ...r,
      publishedAt: r.publishedAt.toISOString(),
      createdAt: r.createdAt.toISOString(),
    })),
  }))

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar user={{ email: user.email, role: user.role }} />
      <AdminDashboard
        pending={serialize(pendingPros)}
        all={serialize(allPros)}
        stats={{
          totalUsers,
          totalPros: allPros.length,
          totalReviews,
          activePros: allPros.filter(p => p.status === 'ACTIVE').length,
        }}
      />
    </div>
  )
}
