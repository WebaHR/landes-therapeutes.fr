'use client'
// src/components/dashboard/DashboardContent.tsx
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  LayoutDashboard, Settings, Star, Eye, Clock,
  BadgeCheck, AlertCircle, TrendingUp, Phone, Mail,
  Globe, MapPin, Edit3, ExternalLink, CheckCircle2,
  Building2
} from 'lucide-react'
import type { Professional } from '@/types'
import { STATUS_LABELS, STATUS_COLORS, formatDate } from '@/lib/utils'
import StarRating from '@/components/ui/StarRating'
import EditProForm from './EditProForm'

interface DashboardContentProps {
  user: { id: string; email: string; role: string }
  professional: (Professional & { reviews: NonNullable<Professional['reviews']> }) | null
}

export default function DashboardContent({ user, professional }: DashboardContentProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'edit' | 'reviews' | 'hours'>('overview')

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: LayoutDashboard },
    { id: 'edit', label: 'Ma fiche', icon: Edit3 },
    { id: 'reviews', label: 'Avis clients', icon: Star },
    { id: 'hours', label: 'Horaires', icon: Clock },
  ] as const

  if (!professional) {
    return (
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-12 text-center">
        <div className="card p-12">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Votre fiche est en cours de création</h2>
          <p className="text-gray-500">Elle apparaîtra ici une fois validée par notre équipe.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
      {/* Header */}
      <div className="mt-8 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Mon espace praticien</h1>
          <p className="text-gray-500 text-sm mt-1">{user.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-semibold px-3 py-1.5 rounded-full ${STATUS_COLORS[professional.status]}`}>
            {STATUS_LABELS[professional.status]}
          </span>
          <Link href={`/profil/${professional.id}`} target="_blank" className="btn-secondary text-sm py-2 flex items-center gap-1.5">
            <ExternalLink className="w-3.5 h-3.5" /> Voir ma fiche
          </Link>
        </div>
      </div>

      {/* Status alert */}
      {professional.status === 'PENDING' && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
          <div>
            <p className="font-semibold text-yellow-800 text-sm">Fiche en attente de validation</p>
            <p className="text-yellow-700 text-xs mt-0.5">Notre équipe examine votre inscription sous 24-48h.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="card p-2 mb-4">
            {/* Mini profile */}
            <div className="p-4 flex items-center gap-3 border-b border-gray-100 mb-2">
              <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                {professional.logoUrl ? (
                  <Image src={professional.logoUrl} alt={professional.companyName} width={48} height={48} className="object-cover" />
                ) : (
                  <span className="text-brand-600 font-bold text-xl">{professional.companyName.charAt(0)}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{professional.companyName}</p>
                <p className="text-xs text-brand-600 truncate">{professional.category}</p>
              </div>
            </div>

            <nav className="space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-brand-600 text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Quick stats */}
          <div className="card p-4 space-y-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Statistiques</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avis Google</span>
              <span className="font-bold text-gray-900">{professional.googleReviews || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Note moyenne</span>
              <span className="font-bold text-gray-900">
                {professional.googleRating ? `⭐ ${professional.googleRating}` : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">SIREN vérifié</span>
              <span>{professional.sirenVerified ? '✅' : '❌'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Offre</span>
              <span className="font-bold text-brand-600 capitalize">{professional.plan}</span>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="lg:col-span-3">
          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Summary card */}
              <div className="card overflow-hidden">

                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative w-16 h-16 rounded-xl bg-white shadow-md border-4 border-white overflow-hidden flex-shrink-0">
                      <Image
                        src={professional.logoUrl || '/defaults/default-logo.svg'}
                        alt={professional.companyName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mt-6">
                      {professional.companyName}
                      {professional.sirenVerified && <BadgeCheck className="w-5 h-5 text-brand-500" />}
                    </h2>
                  </div>
                  {professional.description && (
                    <p className="mt-2 text-gray-500 text-sm leading-relaxed">{professional.description}</p>
                  )}

                  <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {professional.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4 text-brand-400" />
                        {professional.phone}
                      </div>
                    )}
                    {professional.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4 text-brand-400" />
                        <span className="truncate">{professional.email}</span>
                      </div>
                    )}
                    {professional.website && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Globe className="w-4 h-4 text-brand-400" />
                        <a href={professional.website} target="_blank" className="text-brand-600 hover:underline truncate">
                          Site web
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-brand-400" />
                      {professional.city} {professional.postalCode}
                    </div>
                  </div>

                  {professional.googleRating && (
                    <div className="mt-5 pt-5 border-t border-gray-100">
                      <StarRating rating={professional.googleRating} count={professional.googleReviews || 0} size="lg" />
                      <p className="text-xs text-gray-400 mt-1">Avis Google importés</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent reviews */}
              {professional.reviews && professional.reviews.length > 0 && (
                <div className="card p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Derniers avis</h3>
                  <div className="space-y-4">
                    {professional.reviews.slice(0, 3).map(review => (
                      <div key={review.id} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                        <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold text-gray-600">
                          {review.authorName.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-800 text-sm">{review.authorName}</p>
                            <StarRating rating={review.rating} showCount={false} size="sm" />
                          </div>
                          {review.text && <p className="text-gray-500 text-xs mt-1 leading-relaxed">{review.text}</p>}
                          <p className="text-xs text-gray-400 mt-1">{formatDate(review.publishedAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick actions */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Modifier ma fiche', icon: Edit3, tab: 'edit', color: 'bg-brand-50 text-brand-700' },
                  { label: 'Mes avis', icon: Star, tab: 'reviews', color: 'bg-amber-50 text-amber-700' },
                  { label: 'Horaires', icon: Clock, tab: 'hours', color: 'bg-green-50 text-green-700' },
                ].map(action => (
                  <button
                    key={action.tab}
                    onClick={() => setActiveTab(action.tab as typeof activeTab)}
                    className={`card p-5 text-left hover:shadow-md transition-all ${action.color}`}
                  >
                    <action.icon className="w-6 h-6 mb-3" />
                    <p className="font-semibold text-sm">{action.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'edit' && (
            <EditProForm professional={professional} />
          )}

          {activeTab === 'reviews' && (
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 text-xl mb-6">Avis clients</h3>
              {!professional.reviews || professional.reviews.length === 0 ? (
                <div className="text-center py-12">
                  <Star className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500">Aucun avis pour le moment.</p>
                  <p className="text-sm text-gray-400 mt-1">Configurez votre Google Place ID pour importer vos avis.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {professional.reviews.map(review => (
                    <div key={review.id} className="flex gap-4 p-4 bg-surface-50 rounded-xl">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-600 flex-shrink-0">
                        {review.authorName.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-gray-800">{review.authorName}</p>
                          <StarRating rating={review.rating} showCount={false} size="sm" />
                        </div>
                        {review.text && <p className="text-gray-600 text-sm leading-relaxed">{review.text}</p>}
                        <p className="text-xs text-gray-400 mt-2">{formatDate(review.publishedAt)} · {review.source}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'hours' && (
            <HoursEditor professionalId={professional.id} openingHours={professional.openingHours || []} />
          )}
        </main>
      </div>
    </div>
  )
}

// ── Inline Hours Editor ──
import type { OpeningHour } from '@/types'
import toast from 'react-hot-toast'
import { Loader2, Sun, Sunset, X as XIcon } from 'lucide-react'

const DAY_NAMES_LIST = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

type DayState = {
  dayOfWeek: number
  isClosed: boolean
  openTime: string
  closeTime: string
  hasAfternoon: boolean
  openAfternoon: string
  closeAfternoon: string
}

function toState(openingHours: OpeningHour[]): DayState[] {
  return DAY_NAMES_LIST.map((_, i) => {
    const h = openingHours.find(x => x.dayOfWeek === i)
    if (!h) return {
      dayOfWeek: i, isClosed: i === 0 || i === 6,
      openTime: '09:00', closeTime: '12:00',
      hasAfternoon: true, openAfternoon: '14:00', closeAfternoon: '18:00',
    }
    return {
      dayOfWeek: i,
      isClosed: h.isClosed,
      openTime: h.openTime || '09:00',
      closeTime: h.closeTime || '12:00',
      hasAfternoon: !!(h.openAfternoon && h.closeAfternoon),
      openAfternoon: h.openAfternoon || '14:00',
      closeAfternoon: h.closeAfternoon || '18:00',
    }
  })
}

function HoursEditor({ professionalId, openingHours }: { professionalId: string, openingHours: OpeningHour[] }) {
  const [hours, setHours] = useState<DayState[]>(() => toState(openingHours))
  const [saving, setSaving] = useState(false)

  const update = (i: number, patch: Partial<DayState>) =>
    setHours(prev => prev.map((h, idx) => idx === i ? { ...h, ...patch } : h))

  const save = async () => {
    setSaving(true)
    try {
      const payload = hours.map(h => ({
        dayOfWeek: h.dayOfWeek,
        isClosed: h.isClosed,
        openTime: h.isClosed ? null : h.openTime,
        closeTime: h.isClosed ? null : h.closeTime,
        openAfternoon: h.isClosed || !h.hasAfternoon ? null : h.openAfternoon,
        closeAfternoon: h.isClosed || !h.hasAfternoon ? null : h.closeAfternoon,
      }))
      const res = await fetch('/api/dashboard/hours', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ professionalId, hours: payload }),
      })
      if (!res.ok) throw new Error()
      toast.success('Horaires enregistrés !')
    } catch {
      toast.error("Erreur lors de l'enregistrement")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-gray-900 text-xl">Horaires d&apos;ouverture</h3>
        <div className="flex gap-2">
          <button type="button" onClick={() => setHours(h => h.map((d, i) => ({ ...d, isClosed: i === 0 || i === 6 })))}
            className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg">Lun–Ven</button>
          <button type="button" onClick={() => setHours(h => h.map(d => ({ ...d, isClosed: false })))}
            className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg">7j/7</button>
        </div>
      </div>

      <div className="space-y-3">
        {DAY_NAMES_LIST.map((day, i) => {
          const h = hours[i]
          return (
            <div key={i} className={`rounded-xl border p-4 transition-all ${h.isClosed ? 'bg-gray-50 border-gray-200 opacity-70' : 'bg-white border-gray-200'}`}>
              {/* Titre + toggle */}
              <div className="flex items-center justify-between mb-0">
                <span className="font-semibold text-gray-800 w-28 text-sm">{day}</span>
                <button
                  type="button"
                  onClick={() => update(i, { isClosed: !h.isClosed })}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    h.isClosed ? 'bg-red-50 text-red-500 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
                  }`}
                >
                  {h.isClosed ? '✕ Fermé' : '✓ Ouvert'}
                </button>
              </div>

              {!h.isClosed && (
                <div className="mt-3 space-y-2.5">
                  {/* Matin */}
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span className="text-xs text-gray-500 w-16">Matin</span>
                    <input type="time" value={h.openTime}
                      onChange={e => update(i, { openTime: e.target.value })}
                      className="input py-1.5 text-sm flex-1" />
                    <span className="text-gray-300 text-sm">→</span>
                    <input type="time" value={h.closeTime}
                      onChange={e => update(i, { closeTime: e.target.value })}
                      className="input py-1.5 text-sm flex-1" />
                  </div>

                  {/* Après-midi */}
                  {h.hasAfternoon ? (
                    <div className="flex items-center gap-2">
                      <Sunset className="w-4 h-4 text-orange-400 flex-shrink-0" />
                      <span className="text-xs text-gray-500 w-16">Après-midi</span>
                      <input type="time" value={h.openAfternoon}
                        onChange={e => update(i, { openAfternoon: e.target.value })}
                        className="input py-1.5 text-sm flex-1" />
                      <span className="text-gray-300 text-sm">→</span>
                      <input type="time" value={h.closeAfternoon}
                        onChange={e => update(i, { closeAfternoon: e.target.value })}
                        className="input py-1.5 text-sm flex-1" />
                      <button type="button" onClick={() => update(i, { hasAfternoon: false })}
                        className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0" title="Supprimer">
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => update(i, { hasAfternoon: true })}
                      className="text-xs text-brand-600 hover:text-brand-800 font-medium border border-dashed border-brand-300 px-3 py-1.5 rounded-lg transition-colors ml-6">
                      + Ajouter une plage après-midi
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-6 flex justify-end">
        <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          Enregistrer les horaires
        </button>
      </div>
    </div>
  )
}
