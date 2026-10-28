// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { deleteSession } from '@/lib/auth'

export async function POST(req: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (token) await deleteSession(token)
  cookieStore.delete('session')
  return NextResponse.redirect(new URL('/', req.url))
}
