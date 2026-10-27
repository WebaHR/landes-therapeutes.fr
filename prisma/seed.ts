// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const DEMO_PROS = [
  {
    email: 'demo@landes-therapeutes.fr',
    companyName: 'Centre Harmonie Naturelle',
    siren: '123456782',
    category: 'Naturopathie',
    description: 'Naturopathe certifiée, j\'accompagne les personnes en quête d\'un mieux-être global grâce à une approche holistique : alimentation vivante, phytothérapie, gestion du stress et rééquilibrage énergétique.',
    phone: '01 23 45 67 89',
    email_pro: 'contact@harmonie-naturelle.fr',
    website: 'https://www.harmonie-naturelle.fr',
    address: '12 rue de la Paix',
    city: 'Paris',
    postalCode: '75001',
    lat: 48.8566, lng: 2.3522,
    rating: 4.7, reviews: 128,
    featured: true, plan: 'PRO' as const,
    acceptsPublic: true,
    hours: [
      { day: 0, closed: true },
      { day: 1, open: '09:00', close: '12:30', openAft: '14:00', closeAft: '18:00' },
      { day: 2, open: '09:00', close: '12:30', openAft: '14:00', closeAft: '18:00' },
      { day: 3, open: '09:00', close: '12:30', openAft: '14:00', closeAft: '18:00' },
      { day: 4, open: '09:00', close: '12:30', openAft: '14:00', closeAft: '18:00' },
      { day: 5, open: '09:00', close: '12:30', openAft: null, closeAft: null },
      { day: 6, closed: true },
    ],
    avis: [
      { author: 'Marie D.', rating: 5, text: 'Une approche bienveillante et efficace. Je me sens transformée après seulement 3 séances !', date: '2024-11-15' },
      { author: 'Pierre M.', rating: 5, text: 'Enfin une professionnelle qui prend le temps d\'écouter. Les conseils en phytothérapie m\'ont vraiment aidé.', date: '2024-10-20' },
      { author: 'Sophie L.', rating: 4, text: 'Très sérieuse et compétente. Je recommande vivement.', date: '2024-09-05' },
    ],
  },
  {
    email: 'sophro@serenite.fr',
    companyName: 'Sérénité Sophrologie',
    siren: '234567893',
    category: 'Sophrologie',
    description: 'Sophrologue diplômée RNCP, je vous accompagne dans la gestion du stress, la préparation mentale, les troubles du sommeil et la confiance en soi. Séances individuelles et en groupe.',
    phone: '04 56 78 90 12',
    email_pro: 'contact@serenite-sophro.fr',
    website: 'https://www.serenite-sophro.fr',
    address: '8 avenue des Fleurs',
    city: 'Lyon',
    postalCode: '69003',
    lat: 45.7485, lng: 4.8467,
    rating: 4.9, reviews: 87,
    featured: true, plan: 'PRO' as const,
    acceptsPublic: true,
    hours: [
      { day: 0, closed: true },
      { day: 1, open: '08:00', close: '12:00', openAft: '14:00', closeAft: '19:00' },
      { day: 2, open: '08:00', close: '12:00', openAft: '14:00', closeAft: '19:00' },
      { day: 3, open: '08:00', close: '12:00', openAft: '14:00', closeAft: '19:00' },
      { day: 4, open: '08:00', close: '12:00', openAft: '14:00', closeAft: '19:00' },
      { day: 5, open: '09:00', close: '13:00', openAft: null, closeAft: null },
      { day: 6, closed: true },
    ],
    avis: [
      { author: 'Camille R.', rating: 5, text: 'Grâce à la sophrologie j\'ai retrouvé un sommeil de qualité. Merci infiniment !', date: '2024-12-01' },
      { author: 'Thomas B.', rating: 5, text: 'Excellent accompagnement pour ma préparation aux examens. Je me sens beaucoup plus serein.', date: '2024-11-10' },
    ],
  },
  {
    email: 'reflexo@bien-etre.fr',
    companyName: 'Réflexologie & Équilibre',
    siren: '345678904',
    category: 'Réflexologie',
    description: 'Praticienne en réflexologie plantaire et palmaire. La réflexologie agit sur l\'ensemble des organes via des points réflexes situés sur les pieds et les mains, pour rétablir l\'équilibre naturel du corps.',
    phone: '05 67 89 01 23',
    email_pro: 'contact@reflexologie-equilibre.fr',
    website: null,
    address: '3 rue des Lilas',
    city: 'Bordeaux',
    postalCode: '33000',
    lat: 44.8378, lng: -0.5792,
    rating: 4.6, reviews: 54,
    featured: false, plan: 'FREE' as const,
    acceptsPublic: true,
    hours: [
      { day: 0, closed: true },
      { day: 1, closed: true },
      { day: 2, open: '09:30', close: '12:30', openAft: '14:30', closeAft: '18:30' },
      { day: 3, open: '09:30', close: '12:30', openAft: '14:30', closeAft: '18:30' },
      { day: 4, open: '09:30', close: '12:30', openAft: '14:30', closeAft: '18:30' },
      { day: 5, open: '09:30', close: '12:30', openAft: '14:30', closeAft: '18:30' },
      { day: 6, open: '10:00', close: '13:00', openAft: null, closeAft: null },
    ],
    avis: [
      { author: 'Isabelle T.', rating: 5, text: 'Séance incroyablement relaxante. Mon dos ne m\'a plus fait mal depuis !', date: '2024-10-30' },
      { author: 'Laurent G.', rating: 4, text: 'Très professionnel et à l\'écoute. Je reviendrai.', date: '2024-09-22' },
    ],
  },
  {
    email: 'osteo@cabinet.fr',
    companyName: 'Cabinet Ostéopathie Centrale',
    siren: '456789015',
    category: 'Ostéopathie',
    description: 'Ostéopathe D.O., diplômé de l\'École Supérieure d\'Ostéopathie. Prise en charge des douleurs musculo-squelettiques, troubles fonctionnels digestifs, céphalées et accompagnement périnatal.',
    phone: '03 78 90 12 34',
    email_pro: 'contact@osteo-centrale.fr',
    website: 'https://www.osteo-centrale.fr',
    address: '22 boulevard Haussmann',
    city: 'Strasbourg',
    postalCode: '67000',
    lat: 48.5734, lng: 7.7521,
    rating: 4.8, reviews: 203,
    featured: true, plan: 'PREMIUM' as const,
    acceptsPublic: true,
    hours: [
      { day: 0, closed: true },
      { day: 1, open: '08:00', close: '12:00', openAft: '14:00', closeAft: '20:00' },
      { day: 2, open: '08:00', close: '12:00', openAft: '14:00', closeAft: '20:00' },
      { day: 3, open: '08:00', close: '12:00', openAft: '14:00', closeAft: '20:00' },
      { day: 4, open: '08:00', close: '12:00', openAft: '14:00', closeAft: '20:00' },
      { day: 5, open: '08:00', close: '13:00', openAft: null, closeAft: null },
      { day: 6, closed: true },
    ],
    avis: [
      { author: 'Nathalie P.', rating: 5, text: 'Trois séances ont suffi à résoudre mes douleurs cervicales chroniques. Merci !', date: '2024-12-05' },
      { author: 'Jean-Marc V.', rating: 5, text: 'Excellent praticien, très précis et efficace. Je recommande sans hésiter.', date: '2024-11-20' },
      { author: 'Aurélie M.', rating: 4, text: 'Bonne prise en charge de mes maux de dos post-grossesse.', date: '2024-10-15' },
    ],
  },
  {
    email: 'acupuncture@vitalite.fr',
    companyName: 'Vitalité Acupuncture',
    siren: '567890126',
    category: 'Acupuncture',
    description: 'Médecin acupuncteur avec 15 ans d\'expérience. Traitement des douleurs chroniques, stress, troubles du sommeil, sevrage tabagique et infertilité par l\'acupuncture traditionnelle chinoise.',
    phone: '02 89 01 23 45',
    email_pro: 'contact@vitalite-acupuncture.fr',
    website: 'https://www.vitalite-acupuncture.fr',
    address: '7 rue du Temple',
    city: 'Nantes',
    postalCode: '44000',
    lat: 47.2184, lng: -1.5536,
    rating: 4.5, reviews: 76,
    featured: false, plan: 'PRO' as const,
    acceptsPublic: true,
    hours: [
      { day: 0, closed: true },
      { day: 1, open: '09:00', close: '13:00', openAft: '15:00', closeAft: '19:00' },
      { day: 2, open: '09:00', close: '13:00', openAft: '15:00', closeAft: '19:00' },
      { day: 3, closed: true },
      { day: 4, open: '09:00', close: '13:00', openAft: '15:00', closeAft: '19:00' },
      { day: 5, open: '09:00', close: '13:00', openAft: '15:00', closeAft: '19:00' },
      { day: 6, open: '10:00', close: '13:00', openAft: null, closeAft: null },
    ],
    avis: [
      { author: 'Élise D.', rating: 5, text: 'Mon sevrage tabagique a été facilité grâce à l\'acupuncture. Cela fait 6 mois que je ne fume plus !', date: '2024-11-28' },
      { author: 'Marc F.', rating: 4, text: 'Soulagement rapide de mes migraines. Je consulte maintenant une fois par mois en prévention.', date: '2024-10-12' },
    ],
  },
  {
    email: 'hypno@liberte.fr',
    companyName: 'Hypnose & Liberté',
    siren: '678901237',
    category: 'Hypnothérapie',
    description: 'Hypnothérapeute certifié en hypnose ericksonienne et EMDR. Accompagnement des phobies, addictions, traumatismes, manque de confiance en soi et gestion des émotions. Résultats rapides et durables.',
    phone: '04 90 12 34 56',
    email_pro: 'contact@hypnose-liberte.fr',
    website: 'https://www.hypnose-liberte.fr',
    address: '15 cours Mirabeau',
    city: 'Marseille',
    postalCode: '13001',
    lat: 43.2965, lng: 5.3698,
    rating: 4.8, reviews: 112,
    featured: true, plan: 'PRO' as const,
    acceptsPublic: true,
    hours: [
      { day: 0, closed: true },
      { day: 1, open: '10:00', close: '13:00', openAft: '15:00', closeAft: '20:00' },
      { day: 2, open: '10:00', close: '13:00', openAft: '15:00', closeAft: '20:00' },
      { day: 3, open: '10:00', close: '13:00', openAft: '15:00', closeAft: '20:00' },
      { day: 4, open: '10:00', close: '13:00', openAft: '15:00', closeAft: '20:00' },
      { day: 5, open: '10:00', close: '14:00', openAft: null, closeAft: null },
      { day: 6, closed: true },
    ],
    avis: [
      { author: 'Sandra K.', rating: 5, text: 'En une seule séance j\'ai réussi à surmonter ma phobie des araignées que j\'avais depuis l\'enfance. Incroyable !', date: '2024-12-10' },
      { author: 'Nicolas H.', rating: 5, text: 'Accompagnement très professionnel pour arrêter de fumer. Je recommande à 100%.', date: '2024-11-05' },
    ],
  },
  {
    email: 'yoga@zenith.fr',
    companyName: 'Zénith Yoga & Méditation',
    siren: '789012348',
    category: 'Yoga & Pranayama',
    description: 'Studio de yoga proposant cours de Hatha, Vinyasa et Yin Yoga, ainsi que des séances de méditation et de pranayama. Cours adaptés à tous les niveaux, en présentiel et en ligne.',
    phone: '03 01 23 45 67',
    email_pro: 'contact@zenith-yoga.fr',
    website: 'https://www.zenith-yoga.fr',
    address: '45 rue de la République',
    city: 'Lille',
    postalCode: '59000',
    lat: 50.6292, lng: 3.0573,
    rating: 4.9, reviews: 189,
    featured: true, plan: 'PREMIUM' as const,
    acceptsPublic: true,
    hours: [
      { day: 0, open: '09:00', close: '12:00', openAft: null, closeAft: null },
      { day: 1, open: '07:00', close: '12:00', openAft: '17:00', closeAft: '21:00' },
      { day: 2, open: '07:00', close: '12:00', openAft: '17:00', closeAft: '21:00' },
      { day: 3, open: '07:00', close: '12:00', openAft: '17:00', closeAft: '21:00' },
      { day: 4, open: '07:00', close: '12:00', openAft: '17:00', closeAft: '21:00' },
      { day: 5, open: '07:00', close: '12:00', openAft: '17:00', closeAft: '21:00' },
      { day: 6, open: '09:00', close: '13:00', openAft: null, closeAft: null },
    ],
    avis: [
      { author: 'Lucie A.', rating: 5, text: 'Ce studio est un havre de paix. Les cours sont variés et les profs exceptionnels.', date: '2024-12-08' },
      { author: 'Antoine S.', rating: 5, text: 'J\'ai commencé débutant complet, aujourd\'hui je pratique chaque matin. Merci !', date: '2024-11-15' },
      { author: 'Céline M.', rating: 4, text: 'Super ambiance, cours de qualité. Les séances de méditation m\'ont transformée.', date: '2024-10-22' },
    ],
  },
  {
    email: 'massage@nuage.fr',
    companyName: 'Massage Sur Nuage',
    siren: '890123459',
    category: 'Massage bien-être',
    description: 'Institut de massage bien-être proposant massage suédois, californien, aux pierres chaudes, drainage lymphatique et massages sportifs. Ambiance zen et produits naturels certifiés bio.',
    phone: '05 12 34 56 78',
    email_pro: 'contact@massage-sur-nuage.fr',
    website: 'https://www.massage-sur-nuage.fr',
    address: '28 allée des Roses',
    city: 'Toulouse',
    postalCode: '31000',
    lat: 43.6047, lng: 1.4442,
    rating: 4.7, reviews: 245,
    featured: false, plan: 'PRO' as const,
    acceptsPublic: true,
    hours: [
      { day: 0, closed: true },
      { day: 1, open: '10:00', close: '12:30', openAft: '14:00', closeAft: '19:30' },
      { day: 2, open: '10:00', close: '12:30', openAft: '14:00', closeAft: '19:30' },
      { day: 3, open: '10:00', close: '12:30', openAft: '14:00', closeAft: '19:30' },
      { day: 4, open: '10:00', close: '12:30', openAft: '14:00', closeAft: '19:30' },
      { day: 5, open: '10:00', close: '12:30', openAft: '14:00', closeAft: '19:30' },
      { day: 6, open: '10:00', close: '17:00', openAft: null, closeAft: null },
    ],
    avis: [
      { author: 'Valérie N.', rating: 5, text: 'Le massage aux pierres chaudes est divin ! Je repars toujours complètement détendue.', date: '2024-12-02' },
      { author: 'Bruno C.', rating: 5, text: 'Excellent massage sportif après ma compétition. Récupération ultra rapide !', date: '2024-11-18' },
      { author: 'Amélie R.', rating: 4, text: 'Très bonne prestation dans un cadre agréable. Rapport qualité-prix imbattable.', date: '2024-10-05' },
    ],
  },
  {
    email: 'reiki@lumiere.fr',
    companyName: 'Lumière Reiki & Soins Énergétiques',
    siren: '901234560',
    category: 'Reiki & Énergétique',
    description: 'Maître Reiki Usui Ryoho certifiée, je vous propose des soins énergétiques pour rééquilibrer vos chakras, réduire le stress et favoriser la guérison naturelle. Soins en présentiel et à distance.',
    phone: '01 34 56 78 90',
    email_pro: 'contact@lumiere-reiki.fr',
    website: 'https://www.lumiere-reiki.fr',
    address: '6 impasse des Violettes',
    city: 'Montpellier',
    postalCode: '34000',
    lat: 43.6108, lng: 3.8767,
    rating: 4.6, reviews: 67,
    featured: false, plan: 'FREE' as const,
    acceptsPublic: true,
    hours: [
      { day: 0, closed: true },
      { day: 1, closed: true },
      { day: 2, open: '10:00', close: '13:00', openAft: '15:00', closeAft: '19:00' },
      { day: 3, open: '10:00', close: '13:00', openAft: '15:00', closeAft: '19:00' },
      { day: 4, open: '10:00', close: '13:00', openAft: '15:00', closeAft: '19:00' },
      { day: 5, open: '10:00', close: '13:00', openAft: '15:00', closeAft: '19:00' },
      { day: 6, open: '10:00', close: '16:00', openAft: null, closeAft: null },
    ],
    avis: [
      { author: 'Françoise B.', rating: 5, text: 'Une expérience profondément apaisante. Je me suis sentie légère comme une plume après la séance.', date: '2024-11-25' },
      { author: 'Yvan D.', rating: 4, text: 'Praticienne très douce et à l\'écoute. Je sens réellement une différence dans mon énergie.', date: '2024-10-10' },
    ],
  },
  {
    email: 'nutrition@holistique.fr',
    companyName: 'Nutrition Holistique & Vitalité',
    siren: '112345671',
    category: 'Nutrition holistique',
    description: 'Nutritionniste holistique et micronutritionniste. Je vous aide à retrouver votre poids de forme, améliorer votre énergie et votre santé digestive à travers une alimentation adaptée à votre terrain.',
    phone: '04 45 67 89 01',
    email_pro: 'contact@nutrition-holistique.fr',
    website: 'https://www.nutrition-holistique.fr',
    address: '19 rue de la Santé',
    city: 'Nice',
    postalCode: '06000',
    lat: 43.7102, lng: 7.2620,
    rating: 4.8, reviews: 93,
    featured: false, plan: 'PRO' as const,
    acceptsPublic: false,
    hours: [
      { day: 0, closed: true },
      { day: 1, open: '09:00', close: '12:00', openAft: '14:00', closeAft: '18:00' },
      { day: 2, open: '09:00', close: '12:00', openAft: '14:00', closeAft: '18:00' },
      { day: 3, open: '09:00', close: '12:00', openAft: '14:00', closeAft: '18:00' },
      { day: 4, open: '09:00', close: '12:00', openAft: '14:00', closeAft: '18:00' },
      { day: 5, open: '09:00', close: '12:00', openAft: null, closeAft: null },
      { day: 6, closed: true },
    ],
    avis: [
      { author: 'Christine L.', rating: 5, text: 'En 3 mois j\'ai perdu 8 kg sans me priver, et je me sens en pleine forme. Merci !', date: '2024-12-07' },
      { author: 'Patrick M.', rating: 5, text: 'Mon bilan sanguin s\'est considérablement amélioré grâce aux conseils en micronutrition.', date: '2024-11-12' },
      { author: 'Anne-Sophie R.', rating: 4, text: 'Approche très complète et personnalisée. Je recommande vivement.', date: '2024-10-28' },
    ],
  },
]

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@landes-therapeutes.fr'
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin1234!'

  // Admin — upsert : crée ou met à jour (synchronise toujours le mot de passe)
  const hashedAdmin = await bcrypt.hash(adminPassword, 12)
  await prisma.user.upsert({
    where:  { email: adminEmail },
    update: { password: hashedAdmin, role: 'ADMIN' },
    create: { email: adminEmail, password: hashedAdmin, role: 'ADMIN' },
  })
  console.log(`✅ Admin : ${adminEmail} / ${adminPassword}`)

  // 10 professionnels de démonstration
  for (const pro of DEMO_PROS) {
    const existingPro = await prisma.user.findUnique({ where: { email: pro.email } })
    if (existingPro) {
      console.log(`⏭️  Déjà présent : ${pro.companyName}`)
      continue
    }
    const user = await prisma.user.create({
      data: {
        email: pro.email,
        password: await bcrypt.hash('Demo1234!', 12),
        role: 'PROFESSIONAL',
      },
    })

    await prisma.professional.create({
      data: {
        userId: user.id,
        companyName: pro.companyName,
        siren: pro.siren,
        sirenVerified: true,
        category: pro.category,
        description: pro.description,
        phone: pro.phone,
        email: pro.email_pro,
        website: pro.website ?? null,
        address: pro.address,
        city: pro.city,
        postalCode: pro.postalCode,
        latitude: pro.lat,
        longitude: pro.lng,
        googleRating: pro.rating,
        googleReviews: pro.reviews,
        status: 'ACTIVE',
        featured: pro.featured,
        plan: pro.plan,
        acceptsPublic: pro.acceptsPublic,
        openingHours: {
          createMany: {
            data: pro.hours.map(h => ({
              dayOfWeek: h.day,
              isClosed: !!(h as { closed?: boolean }).closed,
              openTime: (h as { open?: string }).open ?? null,
              closeTime: (h as { close?: string }).close ?? null,
              openAfternoon: (h as { openAft?: string | null }).openAft ?? null,
              closeAfternoon: (h as { closeAft?: string | null }).closeAft ?? null,
            })),
          },
        },
        reviews: {
          createMany: {
            data: pro.avis.map(a => ({
              authorName: a.author,
              rating: a.rating,
              text: a.text,
              publishedAt: new Date(a.date),
              source: 'google',
            })),
          },
        },
      },
    })
    console.log(`✅ ${pro.companyName} (${pro.category}) — ${pro.city}`)
  }

  console.log('\n🌿 Seed terminé — 10 praticiens de démonstration créés')
  console.log('\n📋 Comptes de démonstration :')
  console.log(`   Admin     : ${adminEmail} / ${adminPassword}`)
  DEMO_PROS.forEach(p => console.log(`   ${p.category.padEnd(25)} : ${p.email} / Demo1234!`))
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
