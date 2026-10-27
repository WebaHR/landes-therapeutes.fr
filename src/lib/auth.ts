// src/lib/auth.ts
import { cookies } from 'next/headers'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  await prisma.session.create({ data: { userId, token, expiresAt } })
  return token
}

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return null
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: { include: { professional: true } } },
  })
  if (!session || session.expiresAt < new Date()) return null
  return session.user
}

export async function deleteSession(token: string) {
  await prisma.session.delete({ where: { token } }).catch(() => {})
}

export async function requireAuth() {
  const user = await getSession()
  if (!user) throw new Error('Non authentifié')
  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  if (user.role !== 'ADMIN') throw new Error('Accès refusé')
  return user
}
