import { redirect } from 'next/navigation'

export default async function AnnuaireIdRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/profil/${id}`)
}
