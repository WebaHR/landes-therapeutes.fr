// src/app/api/siren/[siren]/route.ts
import { NextResponse } from 'next/server'
import { verifySiren } from '@/lib/siren'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ siren: string }> }
) {
  const { siren } = await params
  const result = await verifySiren(siren)
  return NextResponse.json(result)
}
