// src/app/api/appointments/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const { professionalId, consultationTypeId, patientName, patientEmail,
            patientPhone, patientNote, date, time, locationType } = data

    if (!professionalId || !consultationTypeId || !patientName || !patientEmail || !date || !time || !locationType) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    // Vérifier que le créneau n'est pas déjà pris
    const existing = await prisma.appointment.findFirst({
      where: { professionalId, date, time, status: { not: 'CANCELLED' } },
    })
    if (existing) {
      return NextResponse.json({ error: 'Ce créneau est déjà réservé' }, { status: 409 })
    }

    const appt = await prisma.appointment.create({
      data: { professionalId, consultationTypeId, patientName, patientEmail,
               patientPhone: patientPhone || null, patientNote: patientNote || null,
               date, time, locationType },
      include: { consultationType: true },
    })

    return NextResponse.json({ success: true, appointment: appt })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Récupérer les créneaux déjà réservés pour un pro + date
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const professionalId = searchParams.get('professionalId')
    const date = searchParams.get('date')
    if (!professionalId || !date) return NextResponse.json([])

    const booked = await prisma.appointment.findMany({
      where: { professionalId, date, status: { not: 'CANCELLED' } },
      select: { time: true },
    })
    return NextResponse.json(booked.map(a => a.time))
  } catch { return NextResponse.json([]) }
}
