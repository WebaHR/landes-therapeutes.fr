// prisma/create-admin.ts
// Script autonome — crée ou recrée le compte admin
// Usage : npx tsx prisma/create-admin.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const EMAIL    = process.env.ADMIN_EMAIL    || 'admin@landes-therapeutes.fr'
const PASSWORD = process.env.ADMIN_PASSWORD || 'Admin1234!'

async function main() {
  console.log('🔧 Création / mise à jour du compte administrateur...\n')

  const hashed = await bcrypt.hash(PASSWORD, 12)

  // upsert : crée si absent, met à jour le mot de passe si présent
  const user = await prisma.user.upsert({
    where:  { email: EMAIL },
    update: { password: hashed, role: 'ADMIN' },
    create: { email: EMAIL, password: hashed, role: 'ADMIN' },
  })

  console.log('✅ Compte admin prêt')
  console.log('   ID       :', user.id)
  console.log('   Email    :', EMAIL)
  console.log('   Password :', PASSWORD)
  console.log('\n👉 Connectez-vous sur : http://localhost:3000/connexion/admin')
}

main()
  .catch(e => { console.error('❌ Erreur :', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
