// src/app/api/dashboard/professional/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import sharp from 'sharp'

export async function PUT(req: Request) {
  try {
    const user = await requireAuth()
    const professional = await prisma.professional.findUnique({ where: { userId: user.id } })
    if (!professional) return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 })

    const formData = await req.formData()

    let logoUrl = professional.logoUrl

    const logoFile = formData.get('logo') as File | null
    if (logoFile && logoFile.size > 0) {
      const resized = await sharp(Buffer.from(await logoFile.arrayBuffer()))
        .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
        .toFormat('webp', { quality: 80 })
        .toBuffer()
      logoUrl = `data:image/webp;base64,${resized.toString('base64')}`
    }


    await prisma.professional.update({
      where: { userId: user.id },
      data: {
        companyName: formData.get('companyName') as string || professional.companyName,
        category: formData.get('category') as string || professional.category,
        description: formData.get('description') as string || null,
        phone: formData.get('phone') as string || null,
        email: formData.get('email') as string || professional.email,
        website: formData.get('website') as string || null,
        address: formData.get('address') as string || null,
        city: formData.get('city') as string || professional.city,
        postalCode: formData.get('postalCode') as string || professional.postalCode,
        googlePlaceId: formData.get('googlePlaceId') as string || null,
        logoUrl,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
