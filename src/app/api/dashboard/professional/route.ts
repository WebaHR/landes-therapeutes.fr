// src/app/api/dashboard/professional/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import sharp from 'sharp'

type FormationInput = { titre: string; etablissement: string; annee: string }
type FaqInput = { question: string; reponse: string }

async function toWebpDataUri(file: File, maxSize: number): Promise<string> {
  const resized = await sharp(Buffer.from(await file.arrayBuffer()))
    .resize(maxSize, maxSize, { fit: 'inside', withoutEnlargement: true })
    .toFormat('webp', { quality: 80 })
    .toBuffer()
  return `data:image/webp;base64,${resized.toString('base64')}`
}

export async function PUT(req: Request) {
  try {
    const user = await requireAuth()
    const professional = await prisma.professional.findUnique({ where: { userId: user.id } })
    if (!professional) return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 })

    const formData = await req.formData()

    let logoUrl = professional.logoUrl
    const logoFile = formData.get('logo') as File | null
    if (logoFile && logoFile.size > 0) {
      logoUrl = await toWebpDataUri(logoFile, 400)
    }

    await prisma.professional.update({
      where: { userId: user.id },
      data: {
        companyName:     formData.get('companyName') as string || professional.companyName,
        category:        formData.get('category') as string || professional.category,
        description:     formData.get('description') as string || null,
        richDescription: formData.get('richDescription') as string || null,
        phone:           formData.get('phone') as string || null,
        email:           formData.get('email') as string || professional.email,
        website:         formData.get('website') as string || null,
        address:         formData.get('address') as string || null,
        city:            formData.get('city') as string || professional.city,
        postalCode:      formData.get('postalCode') as string || professional.postalCode,
        googlePlaceId:   formData.get('googlePlaceId') as string || null,
        logoUrl,
      },
    })

    // Formations : remplacement complet par la liste soumise
    const formationsRaw = formData.get('formations') as string | null
    if (formationsRaw) {
      const formations: FormationInput[] = JSON.parse(formationsRaw)
      const valid = formations.filter(f => f.titre?.trim())
      await prisma.formation.deleteMany({ where: { professionalId: professional.id } })
      if (valid.length) {
        await prisma.formation.createMany({
          data: valid.map(f => ({
            professionalId: professional.id,
            titre:          f.titre.trim(),
            etablissement:  f.etablissement?.trim() || null,
            annee:          f.annee || null,
          })),
        })
      }
    }

    // FAQ : remplacement complet par la liste soumise
    const faqRaw = formData.get('faq') as string | null
    if (faqRaw) {
      const faq: FaqInput[] = JSON.parse(faqRaw)
      const valid = faq.filter(f => f.question?.trim() && f.reponse?.trim())
      await prisma.faqItem.deleteMany({ where: { professionalId: professional.id } })
      if (valid.length) {
        await prisma.faqItem.createMany({
          data: valid.map(f => ({
            professionalId: professional.id,
            question:       f.question.trim(),
            reponse:        f.reponse.trim(),
          })),
        })
      }
    }

    // Galerie photos : on garde celles listées dans keepPhotoIds, on supprime les autres, on ajoute les nouvelles
    const keepPhotoIdsRaw = formData.get('keepPhotoIds') as string | null
    if (keepPhotoIdsRaw) {
      const keepIds: string[] = JSON.parse(keepPhotoIdsRaw)
      await prisma.professionalPhoto.deleteMany({
        where: { professionalId: professional.id, id: { notIn: keepIds } },
      })
    }

    const newPhotoFiles: File[] = []
    for (let i = 0; i < 5; i++) {
      const file = formData.get(`newPhoto_${i}`) as File | null
      if (file && file.size > 0) newPhotoFiles.push(file)
    }
    if (newPhotoFiles.length) {
      const urls = await Promise.all(newPhotoFiles.map(f => toWebpDataUri(f, 1200)))
      await prisma.professionalPhoto.createMany({
        data: urls.map(url => ({ professionalId: professional.id, url })),
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
