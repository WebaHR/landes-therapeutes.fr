// src/app/api/dashboard/consultations/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  try {
    const user = await requireAuth()
    const pro = await prisma.professional.findUnique({ where: { userId: user.id } })
    if (!pro) return NextResponse.json({ error: 'Fiche introuvable' }, { status: 404 })
    const types = await prisma.consultationType.findMany({
      where: { professionalId: pro.id },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(types)
  } catch { return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 }) }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth()
    const pro = await prisma.professional.findUnique({ where: { userId: user.id } })
    if (!pro) return NextResponse.json({ error: 'Fiche introuvable' }, { status: 404 })
    const data = await req.json()
    const type = await prisma.consultationType.create({
      data: { ...data, professionalId: pro.id },
    })
    return NextResponse.json(type)
  } catch { return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 }) }
}
