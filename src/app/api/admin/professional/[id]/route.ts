// src/app/api/admin/professional/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const data = await req.json()
    const updated = await prisma.professional.update({ where: { id }, data })
    return NextResponse.json(updated)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const professional = await prisma.professional.findUnique({
      where: { id },
      select: { userId: true },
    })
    if (!professional) {
      return NextResponse.json({ error: 'Fiche introuvable' }, { status: 404 })
    }

    await prisma.professional.delete({ where: { id } })
    await prisma.user.update({
      where: { id: professional.userId },
      data: { role: 'PROFESSIONAL' },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
