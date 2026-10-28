// src/app/api/inscription/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, verifyPassword, createSession } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()

    const firstName      = formData.get('firstName') as string
    const lastName       = formData.get('lastName') as string
    const email          = formData.get('email') as string
    const phonePro       = formData.get('phonePro') as string | null
    const emailPro       = formData.get('emailPro') as string | null
    const password       = formData.get('password') as string
    const companyNameRaw = formData.get('companyName') as string | null
    // Si pas de nom d'entreprise, construire depuis prénom + nom
    const companyName    = companyNameRaw?.trim() || `${firstName} ${lastName}`
    const siren          = (formData.get('siren') as string).replace(/\s/g, '')
    const category       = formData.get('category') as string
    const activityTitle   = formData.get('activityTitle') as string | null
    const description     = formData.get('description') as string | null
    const richDescription = formData.get('richDescription') as string | null
    const phone          = formData.get('phone') as string | null
    const website        = formData.get('website') as string | null
    const address        = formData.get('address') as string | null
    const city           = formData.get('city') as string
    const postalCode     = formData.get('postalCode') as string
    const sirenVerified  = formData.get('sirenVerified') === 'true'
    const acceptsPublic  = formData.get('acceptsPublic') === 'true'
    const travelsHome    = formData.get('travelsHome') === 'true'
    const hoursRaw       = formData.get('hours') as string | null

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { professional: true },
    })

    if (existingUser) {
      // Cas 1 : l'utilisateur a déjà une fiche pro active → bloquer
      if (existingUser.professional) {
        return NextResponse.json(
          { error: 'Cet email est déjà associé à une fiche praticien.' },
          { status: 400 }
        )
      }
      // Cas 2 : l'utilisateur existe mais sans fiche (supprimée par admin)
      // → vérifier le mot de passe pour authentifier
      const passwordMatch = await verifyPassword(password, existingUser.password)
      if (!passwordMatch) {
        return NextResponse.json(
          { error: 'Ce compte existe déjà. Veuillez entrer votre mot de passe actuel pour vous réinscrire.' },
          { status: 400 }
        )
      }
      // Mot de passe correct → on va recréer la fiche pro plus bas
    }

    // Vérifier l'unicité du SIREN
    const existingSiren = await prisma.professional.findUnique({ where: { siren } })
    if (existingSiren) {
      return NextResponse.json(
        { error: 'Ce numéro SIREN est déjà inscrit.' },
        { status: 400 }
      )
    }

    // Uploads
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadsDir, { recursive: true })

    let logoUrl: string | null = null

    const logoFile = formData.get('logo') as File | null
    if (logoFile && logoFile.size > 0) {
      const ext = logoFile.name.split('.').pop()
      const filename = `logo_${siren}_${Date.now()}.${ext}`
      await writeFile(path.join(uploadsDir, filename), Buffer.from(await logoFile.arrayBuffer()))
      logoUrl = `/uploads/${filename}`
    }

    const proData = {
      companyName,
      siren,
      sirenVerified,
      category,
      activityTitle: activityTitle || null,
      description:   description || null,
      phone:         phone || null,
      email,
      website:       website || null,
      address:       address || null,
      city,
      postalCode,
      logoUrl,
      acceptsPublic,
      travelsHome,
      status:        'PENDING' as const,
    }

    let userId: string

    if (existingUser) {
      // Réinscription : recréer uniquement la fiche pro sur le compte existant
      const newPro = await prisma.professional.create({
        data: { ...proData, userId: existingUser.id },
      })
      userId = existingUser.id

      // Sauvegarder les horaires
      if (hoursRaw) {
        type DayHours = {
          isClosed: boolean; openTime: string; closeTime: string
          hasAfternoon: boolean; openAfternoon: string; closeAfternoon: string
        }
        const hours: DayHours[] = JSON.parse(hoursRaw)
        await prisma.openingHour.createMany({
          data: hours.map((h, i) => ({
            professionalId: newPro.id,
            dayOfWeek:      i,
            isClosed:       h.isClosed,
            openTime:       h.isClosed ? null : h.openTime,
            closeTime:      h.isClosed ? null : h.closeTime,
            openAfternoon:  h.isClosed || !h.hasAfternoon ? null : h.openAfternoon,
            closeAfternoon: h.isClosed || !h.hasAfternoon ? null : h.closeAfternoon,
          })),
        })
      }
    } else {
      // Nouvelle inscription : créer user + fiche pro
      const hashedPassword = await hashPassword(password)
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'PROFESSIONAL',
          professional: { create: proData },
        },
        include: { professional: true },
      })
      userId = newUser.id

      // Sauvegarder les horaires
      if (hoursRaw && newUser.professional) {
        type DayHours = {
          isClosed: boolean; openTime: string; closeTime: string
          hasAfternoon: boolean; openAfternoon: string; closeAfternoon: string
        }
        const hours: DayHours[] = JSON.parse(hoursRaw)
        await prisma.openingHour.createMany({
          data: hours.map((h, i) => ({
            professionalId: newUser.professional!.id,
            dayOfWeek:      i,
            isClosed:       h.isClosed,
            openTime:       h.isClosed ? null : h.openTime,
            closeTime:      h.isClosed ? null : h.closeTime,
            openAfternoon:  h.isClosed || !h.hasAfternoon ? null : h.openAfternoon,
            closeAfternoon: h.isClosed || !h.hasAfternoon ? null : h.closeAfternoon,
          })),
        })
      }
    }

    // Session cookie
    const token = await createSession(userId)
    const cookieStore = await cookies()
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    })

    return NextResponse.json({ success: true, isReinscription: !!existingUser })
  } catch (error) {
    console.error('Inscription error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
