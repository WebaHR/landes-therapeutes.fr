'use client'
// src/components/dashboard/AdminDashboard.tsx
import { useState, useMemo } from 'react'
import Image from 'next/image'
import {
  Users, Building2, Star, LayoutDashboard, CheckCircle, XCircle,
  Clock, Pause, Trash2, Search, BadgeCheck, Loader2, Pencil,
  AlertCircle, Phone, Mail, Globe, MapPin, FileText,
  ChevronDown, ChevronUp, Calendar, ShieldCheck, Filter, X
} from 'lucide-react'
import toast from 'react-hot-toast'
import { STATUS_LABELS, STATUS_COLORS, PLAN_LABELS, formatDate, formatSiren } from '@/lib/utils'
import { CATEGORIES } from '@/types'

type OpeningHour = {
  id: string; dayOfWeek: number
  openTime: string | null; closeTime: string | null
  openAfternoon?: string | null; closeAfternoon?: string | null
  isClosed: boolean
}

type Pro = {
  id: string; companyName: string; siren: string; sirenVerified: boolean
  category: string; description: string | null; logoUrl: string | null
  phone: string | null; email: string | null; website: string | null
  address: string | null; city: string; postalCode: string
  latitude: number | null; longitude: number | null
  status: string; plan: string; featured: boolean
  createdAt: string; updatedAt: string
  googleRating: number | null; googleReviews: number | null
  acceptsPublic: boolean
  openingHours: OpeningHour[]
  reviews: { id: string }[]
  user: { email: string; createdAt: string }
}

interface AdminDashboardProps {
  pending: Pro[]
  all: Pro[]
  stats: { totalUsers: number; totalPros: number; totalReviews: number; activePros: number }
}

const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

const TABS = [
  { id: 'overview', label: "Vue d'ensemble", icon: LayoutDashboard },
  { id: 'pending',  label: 'En attente',     icon: Clock },
  { id: 'all',      label: 'Toutes les fiches', icon: Building2 },
] as const

/* ─────────────────── COMPOSANT PRINCIPAL ─────────────────── */
export default function AdminDashboard({ pending, all, stats }: AdminDashboardProps) {
  const [tab, setTab]               = useState<'overview' | 'pending' | 'all'>('overview')
  const [pros, setPros]             = useState(all)
  const [pendingList, setPendingList] = useState(pending)
  const [search, setSearch]         = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [catFilter, setCatFilter]   = useState('')
  const [loading, setLoading]       = useState<string | null>(null)
  const [editingId, setEditingId]   = useState<string | null>(null)

  /* ── Actions ── */
  const updateStatus = async (id: string, status: string) => {
    setLoading(id + status)
    try {
      const res = await fetch(`/api/admin/professional/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      setPros(prev => prev.map(p => p.id === id ? { ...p, status } : p))
      setPendingList(prev => prev.filter(p => p.id !== id))
      toast.success(`Statut mis à jour : ${STATUS_LABELS[status] ?? status}`)
    } catch { toast.error('Erreur lors de la mise à jour') }
    finally { setLoading(null) }
  }

  const toggleFeatured = async (id: string, featured: boolean) => {
    setLoading(id + 'feat')
    try {
      await fetch(`/api/admin/professional/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !featured }),
      })
      setPros(prev => prev.map(p => p.id === id ? { ...p, featured: !p.featured } : p))
      toast.success(featured ? 'Retiré de la une' : 'Mis en vedette')
    } catch { toast.error('Erreur') }
    finally { setLoading(null) }
  }

  const deletePro = async (id: string, name: string) => {
    if (!confirm(`Supprimer définitivement la fiche « ${name} » ?\nCette action est irréversible.`)) return
    setLoading(id + 'del')
    try {
      const res = await fetch(`/api/admin/professional/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setPros(prev => prev.filter(p => p.id !== id))
      setPendingList(prev => prev.filter(p => p.id !== id))
      toast.success('Fiche supprimée')
    } catch { toast.error('Erreur lors de la suppression') }
    finally { setLoading(null) }
  }

  const saveEdit = async (id: string, data: Partial<Pro>) => {
    setLoading(id + 'edit')
    try {
      const res = await fetch(`/api/admin/professional/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error()
      setPros(prev => prev.map(p => p.id === id ? { ...p, ...data } : p))
      setEditingId(null)
      toast.success('Fiche mise à jour')
    } catch { toast.error('Erreur lors de la sauvegarde') }
    finally { setLoading(null) }
  }

  /* ── Filtres ── */
  const filtered = useMemo(() => pros.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = !q || [p.companyName, p.city, p.user.email, p.siren, p.category]
      .some(v => v?.toLowerCase().includes(q))
    const matchStatus = !statusFilter || p.status === statusFilter
    const matchCat    = !catFilter    || p.category === catFilter
    return matchSearch && matchStatus && matchCat
  }), [pros, search, statusFilter, catFilter])

  const pendingCount = pendingList.length

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">

      {/* En-tête */}
      <div className="mt-8 mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-brand-600" /> Administration
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">Tableau de bord administrateur — landes-therapeutes.fr</p>
        </div>
        {pendingCount > 0 && (
          <button
            onClick={() => setTab('pending')}
            className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-2 text-sm font-semibold hover:bg-amber-100 transition-colors"
          >
            <AlertCircle className="w-4 h-4" />
            {pendingCount} fiche{pendingCount > 1 ? 's' : ''} en attente
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">

        {/* Sidebar */}
        <aside>
          <nav className="card p-2 space-y-1">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  tab === t.id ? 'bg-brand-600 text-white shadow-sm' : 'text-gray-600 hover:bg-surface-100'
                }`}
              >
                <t.icon className="w-4 h-4 flex-shrink-0" />
                <span>{t.label}</span>
                {t.id === 'pending' && pendingCount > 0 && (
                  <span className={`ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full ${
                    tab === 'pending' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
                  }`}>{pendingCount}</span>
                )}
              </button>
            ))}
          </nav>

          {/* Mini-stats */}
          <div className="mt-4 card p-4 space-y-3">
            {[
              { label: 'Utilisateurs',    value: stats.totalUsers,   icon: Users,     color: 'text-blue-500' },
              { label: 'Praticiens',      value: stats.totalPros,    icon: Building2, color: 'text-brand-600' },
              { label: 'Actifs',          value: stats.activePros,   icon: CheckCircle, color: 'text-green-500' },
              { label: 'Avis',            value: stats.totalReviews, icon: Star,      color: 'text-amber-500' },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                  <span className="text-xs text-gray-500">{s.label}</span>
                </div>
                <span className="text-sm font-bold text-gray-800">{s.value}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Contenu principal */}
        <main className="min-w-0">

          {/* ── VUE D'ENSEMBLE ── */}
          {tab === 'overview' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Total praticiens', value: stats.totalPros,    icon: Building2,  bg: 'bg-brand-50',  color: 'text-brand-600' },
                  { label: 'Actifs',           value: stats.activePros,   icon: CheckCircle,bg: 'bg-green-50',  color: 'text-green-600' },
                  { label: 'En attente',       value: pendingCount,       icon: Clock,      bg: 'bg-amber-50',  color: 'text-amber-600' },
                  { label: 'Avis clients',     value: stats.totalReviews, icon: Star,       bg: 'bg-purple-50', color: 'text-purple-600' },
                ].map(s => (
                  <div key={s.label} className="card p-5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.bg}`}>
                      <s.icon className={`w-5 h-5 ${s.color}`} />
                    </div>
                    <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="card p-6">
                <h3 className="font-bold text-gray-900 mb-4">Répartition par statut</h3>
                <div className="space-y-3">
                  {(['ACTIVE','PENDING','SUSPENDED','REJECTED'] as const).map(s => {
                    const count = pros.filter(p => p.status === s).length
                    const pct   = pros.length ? Math.round(count / pros.length * 100) : 0
                    return (
                      <div key={s} className="flex items-center gap-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full w-24 text-center flex-shrink-0 ${STATUS_COLORS[s]}`}>
                          {STATUS_LABELS[s]}
                        </span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div className="bg-brand-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-sm font-semibold text-gray-700 w-6 text-right">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="card p-6">
                <h3 className="font-bold text-gray-900 mb-4">Dernières inscriptions</h3>
                <div className="space-y-2">
                  {[...pros].sort((a,b) => b.createdAt.localeCompare(a.createdAt)).slice(0,5).map(p => (
                    <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-sm font-bold text-brand-600 flex-shrink-0">
                          {p.companyName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{p.companyName}</p>
                          <p className="text-xs text-gray-400">{p.category} · {p.city}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[p.status]}`}>
                          {STATUS_LABELS[p.status]}
                        </span>
                        <span className="text-xs text-gray-400">{formatDate(p.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── EN ATTENTE ── */}
          {tab === 'pending' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-400">{pendingList.length} fiche(s) en attente de validation</p>
              {pendingList.length === 0 ? (
                <div className="card p-16 text-center">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <p className="font-semibold text-gray-700">Aucune fiche en attente</p>
                </div>
              ) : pendingList.map(pro => (
                <PendingCard
                  key={pro.id}
                  pro={pro}
                  loading={!!loading?.startsWith(pro.id)}
                  onApprove={() => updateStatus(pro.id, 'ACTIVE')}
                  onReject ={() => updateStatus(pro.id, 'REJECTED')}
                  onDelete ={() => deletePro(pro.id, pro.companyName)}
                />
              ))}
            </div>
          )}

          {/* ── TOUTES LES FICHES ── */}
          {tab === 'all' && (
            <div className="space-y-4">
              {/* Barre de filtres */}
              <div className="card p-4 flex flex-wrap gap-3">
                <div className="flex-1 min-w-[180px] flex items-center gap-2 bg-surface-50 border border-gray-200 rounded-xl px-3 py-2">
                  <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Nom, ville, email, SIREN…" className="flex-1 text-sm outline-none bg-transparent" />
                  {search && <button onClick={() => setSearch('')}><X className="w-3.5 h-3.5 text-gray-400" /></button>}
                </div>
                <div className="flex items-center gap-2 bg-surface-50 border border-gray-200 rounded-xl px-3 py-2">
                  <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    className="text-sm outline-none bg-transparent text-gray-700">
                    <option value="">Tous statuts</option>
                    <option value="ACTIVE">Actif</option>
                    <option value="PENDING">En attente</option>
                    <option value="SUSPENDED">Suspendu</option>
                    <option value="REJECTED">Rejeté</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 bg-surface-50 border border-gray-200 rounded-xl px-3 py-2">
                  <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
                    className="text-sm outline-none bg-transparent text-gray-700">
                    <option value="">Toutes catégories</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <p className="text-xs text-gray-400 self-center ml-auto">{filtered.length} résultat(s)</p>
              </div>

              {/* Tableau */}
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-surface-50 border-b border-gray-100 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        <th className="px-4 py-3">Praticien</th>
                        <th className="px-4 py-3 hidden sm:table-cell">Catégorie</th>
                        <th className="px-4 py-3 hidden md:table-cell">Ville</th>
                        <th className="px-4 py-3 hidden lg:table-cell">Inscrit le</th>
                        <th className="px-4 py-3">Statut</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(pro => (
                        <>
                          <tr key={pro.id} className="border-b border-gray-100 hover:bg-surface-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="relative w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                                  <Image src={pro.logoUrl || '/defaults/default-logo.svg'} alt={pro.companyName} fill className="object-cover" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-gray-800 text-sm flex items-center gap-1 truncate">
                                    {pro.companyName}
                                    {pro.sirenVerified && <BadgeCheck className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />}
                                    {pro.featured && <Star className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                                  </p>
                                  <p className="text-xs text-gray-400 truncate">{pro.user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">{pro.category}</td>
                            <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">{pro.city}</td>
                            <td className="px-4 py-3 text-xs text-gray-400 hidden lg:table-cell">{formatDate(pro.createdAt)}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[pro.status]}`}>
                                {STATUS_LABELS[pro.status]}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-1">
                                {/* Modifier */}
                                <button onClick={() => setEditingId(editingId === pro.id ? null : pro.id)}
                                  className={`p-1.5 rounded-lg transition-colors ${editingId === pro.id ? 'bg-brand-100 text-brand-700' : 'text-gray-400 hover:bg-gray-100'}`}
                                  title="Modifier">
                                  <Pencil className="w-4 h-4" />
                                </button>
                                {/* Activer */}
                                {pro.status !== 'ACTIVE' && (
                                  <button onClick={() => updateStatus(pro.id, 'ACTIVE')}
                                    disabled={!!loading} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Activer">
                                    {loading === pro.id + 'ACTIVE' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                  </button>
                                )}
                                {/* Suspendre */}
                                {pro.status !== 'SUSPENDED' && (
                                  <button onClick={() => updateStatus(pro.id, 'SUSPENDED')}
                                    disabled={!!loading} className="p-1.5 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors" title="Suspendre">
                                    <Pause className="w-4 h-4" />
                                  </button>
                                )}
                                {/* Vedette */}
                                <button onClick={() => toggleFeatured(pro.id, pro.featured)}
                                  disabled={!!loading} title={pro.featured ? 'Retirer de la une' : 'Mettre en vedette'}
                                  className={`p-1.5 rounded-lg transition-colors ${pro.featured ? 'text-amber-500 bg-amber-50' : 'text-gray-300 hover:bg-gray-100'}`}>
                                  <Star className="w-4 h-4" />
                                </button>
                                {/* Supprimer */}
                                <button onClick={() => deletePro(pro.id, pro.companyName)}
                                  disabled={!!loading} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
                                  {loading === pro.id + 'del' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                </button>
                              </div>
                            </td>
                          </tr>
                          {/* Formulaire d'édition inline */}
                          {editingId === pro.id && (
                            <tr key={pro.id + '-edit'} className="bg-brand-50 border-b border-brand-100">
                              <td colSpan={6} className="px-4 py-4">
                                <EditInlineForm
                                  pro={pro}
                                  loading={loading === pro.id + 'edit'}
                                  onSave={data => saveEdit(pro.id, data)}
                                  onCancel={() => setEditingId(null)}
                                />
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
                  {filtered.length === 0 && (
                    <div className="text-center py-12 text-gray-400 text-sm">Aucun résultat</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

/* ─────────────────── FORMULAIRE ÉDITION INLINE ─────────────────── */
function EditInlineForm({ pro, loading, onSave, onCancel }: {
  pro: Pro
  loading: boolean
  onSave: (data: Partial<Pro>) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({
    companyName: pro.companyName,
    category:    pro.category,
    description: pro.description || '',
    phone:       pro.phone || '',
    email:       pro.email || '',
    website:     pro.website || '',
    address:     pro.address || '',
    city:        pro.city,
    postalCode:  pro.postalCode,
    status:      pro.status,
    plan:        pro.plan,
    sirenVerified: pro.sirenVerified,
    acceptsPublic: pro.acceptsPublic,
  })

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))
  const fBool = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.checked }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-bold text-brand-700 flex items-center gap-2">
          <Pencil className="w-4 h-4" /> Modifier la fiche — {pro.companyName}
        </p>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Nom */}
        <div>
          <label className="label">Nom de l'entreprise</label>
          <input value={form.companyName} onChange={f('companyName')} className="input text-sm py-2" />
        </div>
        {/* Catégorie */}
        <div>
          <label className="label">Catégorie</label>
          <select value={form.category} onChange={f('category')} className="input text-sm py-2">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {/* Statut */}
        <div>
          <label className="label">Statut</label>
          <select value={form.status} onChange={f('status')} className="input text-sm py-2">
            <option value="ACTIVE">Actif</option>
            <option value="PENDING">En attente</option>
            <option value="SUSPENDED">Suspendu</option>
            <option value="REJECTED">Rejeté</option>
          </select>
        </div>
        {/* Plan */}
        <div>
          <label className="label">Plan</label>
          <select value={form.plan} onChange={f('plan')} className="input text-sm py-2">
            <option value="FREE">Gratuit</option>
            <option value="PRO">Pro</option>
            <option value="PREMIUM">Premium</option>
          </select>
        </div>
        {/* Téléphone */}
        <div>
          <label className="label">Téléphone</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input value={form.phone} onChange={f('phone')} className="input text-sm py-2 pl-9" placeholder="01 23 45 67 89" />
          </div>
        </div>
        {/* Email */}
        <div>
          <label className="label">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input value={form.email} onChange={f('email')} className="input text-sm py-2 pl-9" />
          </div>
        </div>
        {/* Site web */}
        <div>
          <label className="label">Site web</label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input value={form.website} onChange={f('website')} className="input text-sm py-2 pl-9" placeholder="https://…" />
          </div>
        </div>
        {/* Adresse */}
        <div>
          <label className="label">Adresse</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input value={form.address} onChange={f('address')} className="input text-sm py-2 pl-9" />
          </div>
        </div>
        {/* Ville */}
        <div>
          <label className="label">Ville</label>
          <input value={form.city} onChange={f('city')} className="input text-sm py-2" />
        </div>
        {/* CP */}
        <div>
          <label className="label">Code postal</label>
          <input value={form.postalCode} onChange={f('postalCode')} className="input text-sm py-2" maxLength={5} />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="label">Description</label>
        <textarea value={form.description} onChange={f('description')}
          className="input text-sm py-2 min-h-[80px] resize-none" rows={3} />
      </div>

      {/* Checkboxes */}
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={form.sirenVerified} onChange={fBool('sirenVerified')}
            className="w-4 h-4 rounded text-brand-600" />
          <BadgeCheck className="w-4 h-4 text-brand-500" />
          SIREN vérifié
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={form.acceptsPublic} onChange={fBool('acceptsPublic')}
            className="w-4 h-4 rounded text-brand-600" />
          <Users className="w-4 h-4 text-gray-400" />
          Reçoit du public
        </label>
      </div>

      {/* Boutons */}
      <div className="flex justify-end gap-2 pt-2 border-t border-brand-100">
        <button onClick={onCancel} className="btn-secondary py-2 px-4 text-sm">Annuler</button>
        <button onClick={() => onSave(form)} disabled={loading}
          className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          Enregistrer
        </button>
      </div>
    </div>
  )
}

/* ─────────────────── CARD EN ATTENTE ─────────────────── */
function PendingCard({ pro, loading, onApprove, onReject, onDelete }: {
  pro: Pro; loading: boolean
  onApprove: () => void; onReject: () => void; onDelete: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const sorted = [...pro.openingHours].sort((a, b) => a.dayOfWeek - b.dayOfWeek)

  return (
    <div className="card border-l-4 border-l-amber-400 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
              <Image src={pro.logoUrl || '/defaults/default-logo.svg'} alt={pro.companyName} fill className="object-cover" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                {pro.companyName}
                {pro.sirenVerified && (
                  <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <BadgeCheck className="w-3 h-3" /> SIREN vérifié
                  </span>
                )}
              </h3>
              <p className="text-sm text-brand-600 font-medium">{pro.category}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-gray-400">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{pro.city} {pro.postalCode}</span>
                <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{formatSiren(pro.siren)}</span>
                <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{pro.user.email}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(pro.createdAt)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={onReject} disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />} Rejeter
            </button>
            <button onClick={onApprove} disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-xl transition-colors">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Approuver
            </button>
          </div>
        </div>

        <button onClick={() => setExpanded(v => !v)}
          className="mt-4 flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-800 transition-colors">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {expanded ? 'Masquer les détails' : 'Voir toutes les données saisies'}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 bg-surface-50 p-5 space-y-5">

          {pro.description && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Description</p>
              <p className="text-sm text-gray-700 bg-white rounded-xl p-3 border border-gray-200">{pro.description}</p>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Adresse', value: [pro.address, pro.city, pro.postalCode].filter(Boolean).join(', '), icon: <MapPin className="w-4 h-4 text-gray-400" /> },
              { label: 'Téléphone', value: pro.phone || '—', icon: <Phone className="w-4 h-4 text-gray-400" /> },
              { label: 'Email', value: pro.email || '—', icon: <Mail className="w-4 h-4 text-gray-400" /> },
              { label: 'Site web', value: pro.website || '—', icon: <Globe className="w-4 h-4 text-gray-400" /> },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-2 bg-white rounded-xl p-3 border border-gray-200">
                {item.icon}
                <div>
                  <p className="text-xs text-gray-400">{item.label}</p>
                  <p className="text-sm font-medium text-gray-800 break-all">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
          {sorted.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Horaires</p>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {sorted.map((h, i) => (
                  <div key={h.id} className={`flex items-center justify-between px-4 py-2 text-sm ${i < sorted.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    <span className="font-medium text-gray-600 w-10">{DAYS[h.dayOfWeek]}</span>
                    {h.isClosed
                      ? <span className="text-red-400 text-xs">Fermé</span>
                      : <span className="text-gray-600">{h.openTime}–{h.closeTime}{h.openAfternoon ? ` / ${h.openAfternoon}–${h.closeAfternoon}` : ''}</span>
                    }
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-end pt-2 border-t border-gray-100">
            <button onClick={onDelete} disabled={loading}
              className="flex items-center gap-1.5 text-sm text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
              <Trash2 className="w-4 h-4" /> Supprimer définitivement
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Pour éviter l'erreur "Users is not defined" dans EditInlineForm