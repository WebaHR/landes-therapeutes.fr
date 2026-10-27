'use client'
// src/app/connexion/admin/page.tsx
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { ShieldCheck, Eye, EyeOff, Loader2, ArrowLeft, Lock } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Identifiants incorrects')
        return
      }
      if (data.role !== 'ADMIN') {
        toast.error('Accès réservé aux administrateurs')
        return
      }
      toast.success('Bienvenue dans l\'espace administrateur')
      router.push('/admin')
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = () => {
    setEmail('admin@landes-therapeutes.fr')
    setPassword('Admin1234!')
  }

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center px-4">
      {/* Fond décoratif */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-32 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Retour */}
        <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white/80 text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour au site
        </Link>

        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-600 rounded-2xl mb-4 shadow-lg shadow-brand-900/30">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Espace Administrateur</h1>
          <p className="mt-2 text-white/50 text-sm">landes-therapeutes.fr — Accès restreint</p>
        </div>

        {/* Compte démo */}
        <div className="bg-brand-900/60 border border-brand-700/50 rounded-xl p-4 mb-5 backdrop-blur-sm">
          <p className="text-xs font-semibold text-brand-300 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> Compte de démonstration
          </p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-white/50">Email</span>
              <span className="font-mono text-brand-200 text-xs">admin@landes-therapeutes.fr</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/50">Mot de passe</span>
              <span className="font-mono text-brand-200 text-xs">Admin1234!</span>
            </div>
          </div>
          <button
            type="button"
            onClick={fillDemo}
            className="mt-3 w-full text-xs font-semibold text-brand-300 border border-brand-700 hover:bg-brand-800/50 rounded-lg py-1.5 transition-colors"
          >
            Remplir automatiquement →
          </button>
        </div>

        {/* Formulaire */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Email administrateur</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 transition-all"
                placeholder="admin@landes-therapeutes.fr"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-11 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-brand-900/30"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Connexion…</>
                : <><ShieldCheck className="w-4 h-4" /> Accéder au tableau de bord</>
              }
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-white/10 text-center">
            <Link href="/connexion" className="text-sm text-white/40 hover:text-white/70 transition-colors">
              Connexion praticien →
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-white/25">
          Accès réservé aux administrateurs autorisés · landes-therapeutes.fr
        </p>
      </div>
    </div>
  )
}
