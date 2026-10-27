// src/app/api/dashboard/hours/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

type HourInput = {
  dayOfWeek: number
  isClosed: boolean
  openTime?: string | null
  closeTime?: string | null
  openAfternoon?: string | null
  closeAfternoon?: string | null
}

export async function PUT(req: Request) {
  try {
    const user = await requireAuth()
    const { professionalId, hours } = await req.json()

    const professional = await prisma.professional.findUnique({ where: { userId: user.id } })
    if (!professional || professional.id !== professionalId) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    await prisma.openingHour.deleteMany({ where: { professionalId } })
    await prisma.openingHour.createMany({
      data: hours.map((h: HourInput) => ({
        professionalId,
        dayOfWeek:     h.dayOfWeek,
        isClosed:      h.isClosed,
        openTime:      h.isClosed ? null : (h.openTime || null),
        closeTime:     h.isClosed ? null : (h.closeTime || null),
        openAfternoon:  h.isClosed ? null : (h.openAfternoon || null),
        closeAfternoon: h.isClosed ? null : (h.closeAfternoon || null),
      })),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
