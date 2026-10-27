// src/app/not-found.tsx
import Link from 'next/link'
import { MapPin } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-20 h-20 bg-brand-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <MapPin className="w-10 h-10 text-brand-400" />
        </div>
        <h1 className="text-6xl font-extrabold text-gray-900 mb-3">404</h1>
        <p className="text-xl font-semibold text-gray-700 mb-2">Page introuvable</p>
        <p className="text-gray-500 mb-8">Cette page n&apos;existe pas ou a été déplacée.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary">Retour à l&apos;accueil</Link>
          <Link href="/annuaire" className="btn-secondary">Voir l&apos;annuaire</Link>
        </div>
      </div>
    </div>
  )
}
