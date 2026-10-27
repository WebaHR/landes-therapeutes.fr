// src/app/inscription/page.tsx
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import { getSession } from '@/lib/auth'
import InscriptionForm from '@/components/forms/InscriptionForm'
import { redirect } from 'next/navigation'

export default async function InscriptionPage() {
  const user = await getSession()
  if (user) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar user={null} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-24">
        <div className="text-center mb-10">
          <span className="section-tag">🏪 Inscription praticienle</span>
          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold text-gray-900">
            Référencez votre entreprise
          </h1>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto">
            Créez votre fiche en quelques minutes. Validation automatique par numéro SIREN.
          </p>
        </div>
        <InscriptionForm />
      </div>
      <Footer />
    </div>
  )
}
