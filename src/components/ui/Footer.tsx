// src/components/ui/Footer.tsx
import Link from 'next/link'
import { MapPin, Mail, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-surface-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                landes<span className="text-accent-400">-therapeutes.fr</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              L&apos;annuaire de référence pour trouver les meilleurs praticiens bien-être.
            </p>
            <div className="mt-5 flex items-center gap-2 text-sm text-gray-500">
              <Mail className="w-4 h-4" />
              <a href="mailto:contact@landes-therapeutes.fr" className="hover:text-white transition-colors">
                contact@landes-therapeutes.fr
              </a>
            </div>
          </div>

          {/* Annuaire */}
          <div>
            <h4 className="text-white font-semibold mb-4">Annuaire</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/annuaire" className="hover:text-white transition-colors">Tous les praticiens</Link></li>
              <li><Link href="/annuaire?view=map" className="hover:text-white transition-colors">Vue carte</Link></li>
              <li><Link href="/annuaire?sort=rating" className="hover:text-white transition-colors">Mieux notés</Link></li>
              <li><Link href="/annuaire?sort=new" className="hover:text-white transition-colors">Nouveaux inscrits</Link></li>
            </ul>
          </div>

          {/* Praticiens */}
          <div>
            <h4 className="text-white font-semibold mb-4">Praticiens</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/inscription" className="hover:text-white transition-colors">Inscrire mon entreprise</Link></li>
              <li><Link href="/connexion" className="hover:text-white transition-colors">Espace praticien</Link></li>
              <li><Link href="/tarifs" className="hover:text-white transition-colors">Nos offres</Link></li>
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Informations</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link></li>
              <li><Link href="/confidentialite" className="hover:text-white transition-colors">Confidentialité</Link></li>
              <li><Link href="/cgu" className="hover:text-white transition-colors">CGU</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p>© {new Date().getFullYear()} landes-therapeutes.fr. Tous droits réservés.</p>
          <div className="flex items-center gap-1 text-gray-500">
            <Phone className="w-3.5 h-3.5" />
            <span>Fait en France 🇫🇷</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
