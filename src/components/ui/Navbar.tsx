'use client'
// src/components/ui/Navbar.tsx
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { MapPin, Menu, X, ChevronDown, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavbarProps {
  user?: { email: string; role: string } | null
  transparent?: boolean
}

export default function Navbar({ user, transparent = false }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navClass = cn(
    'fixed top-0 inset-x-0 z-50 transition-all duration-300',
    scrolled || !transparent
      ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
      : 'bg-transparent'
  )
  const textClass = cn(
    'transition-colors',
    scrolled || !transparent ? 'text-gray-700 hover:text-brand-600' : 'text-white/80 hover:text-white'
  )
  const logoClass = cn(
    scrolled || !transparent ? 'text-brand-600' : 'text-white'
  )

  return (
    <nav className={navClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center', scrolled || !transparent ? 'bg-brand-600' : 'bg-white/20')}>
              <MapPin className={cn('w-4 h-4', scrolled || !transparent ? 'text-white' : 'text-white')} />
            </div>
            <span className={cn('text-xl font-bold', logoClass)}>
              landes<span className={scrolled || !transparent ? 'text-accent-500' : 'text-accent-400'}>-therapeutes.fr</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/annuaire" className={cn('text-sm font-medium', textClass)}>Annuaire</Link>
            <Link href="/annuaire?view=map" className={cn('text-sm font-medium', textClass)}>Carte</Link>
            <Link href="/inscription" className={cn('text-sm font-medium', textClass)}>
              Référencer mon entreprise
            </Link>
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {user.role === 'ADMIN' && (
                  <Link href="/admin"
                    className="flex items-center gap-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 px-3 py-1.5 rounded-lg transition-colors">
                    <ShieldCheck className="w-3.5 h-3.5" /> Admin
                  </Link>
                )}
                <Link
                  href={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-brand-600"
                >
                  Mon espace <ChevronDown className="w-3.5 h-3.5" />
                </Link>
                <form action="/api/auth/logout" method="POST">
                  <button className="text-sm text-gray-500 hover:text-red-500">Déconnexion</button>
                </form>
              </div>
            ) : (
              <>
                <Link href="/connexion/admin"
                  className={cn('flex items-center gap-1.5 text-xs font-medium border rounded-lg px-3 py-1.5 transition-colors',
                    scrolled || !transparent
                      ? 'border-brand-200 text-brand-700 hover:bg-brand-50'
                      : 'border-white/30 text-white/80 hover:border-white/60 hover:text-white'
                  )}>
                  <ShieldCheck className="w-3.5 h-3.5" /> Espace admin
                </Link>
                <Link href="/connexion" className={cn('text-sm font-medium', textClass)}>
                  Connexion
                </Link>
                <Link href="/inscription" className="btn-primary text-sm py-2 px-5">
                  Inscrire mon entreprise
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className={cn('md:hidden p-2 rounded-lg', textClass)}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          <Link href="/annuaire" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setMobileOpen(false)}>Annuaire</Link>
          <Link href="/annuaire?view=map" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setMobileOpen(false)}>Carte</Link>
          <Link href="/inscription" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setMobileOpen(false)}>Référencer mon entreprise</Link>
          <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">
            {user ? (
              <>
                {user.role === 'ADMIN' && (
                  <Link href="/admin" className="flex items-center justify-center gap-1.5 bg-brand-600 text-white text-sm font-semibold py-2 rounded-xl">
                    <ShieldCheck className="w-4 h-4" /> Tableau de bord Admin
                  </Link>
                )}
                <Link href={user.role === 'ADMIN' ? '/admin' : '/dashboard'} className="btn-secondary text-center text-sm py-2">Mon espace</Link>
              </>
            ) : (
              <>
                <Link href="/connexion/admin" className="flex items-center justify-center gap-1.5 border border-brand-200 text-brand-700 text-sm font-medium py-2 rounded-xl hover:bg-brand-50">
                  <ShieldCheck className="w-4 h-4" /> Espace administrateur
                </Link>
                <Link href="/connexion" className="btn-secondary text-center text-sm py-2">Connexion</Link>
                <Link href="/inscription" className="btn-primary text-center text-sm py-2">Inscrire mon entreprise</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
