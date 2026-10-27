'use client'
// src/components/dashboard/ConsultationsManager.tsx
import { useState } from 'react'
import { Plus, Pencil, Trash2, Loader2, CheckCircle2, X, Clock, Euro, Users, Car, Video } from 'lucide-react'
import toast from 'react-hot-toast'

type ConsultationType = {
  id: string
  name: string
  description: string | null
  durationMin: number
  price: number
  locationType: string
  isActive: boolean
}

interface Props {
  professionalId: string
  initial: ConsultationType[]
}

const LOCATION_OPTIONS = [
  { value: 'cabinet',  label: 'En cabinet',    icon: <Users className="w-4 h-4" /> },
  { value: 'domicile', label: 'À domicile',    icon: <Car className="w-4 h-4" /> },
  { value: 'distance', label: 'À distance',    icon: <Video className="w-4 h-4" /> },
]

const emptyForm = { name: '', description: '', durationMin: 60, price: 60, locations: ['cabinet'] }

export default function ConsultationsManager({ initial }: Props) {
  const [types, setTypes]       = useState<ConsultationType[]>(initial)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]   = useState<string | null>(null)
  const [loading, setLoading]   = useState<string | null>(null)
  const [form, setForm]         = useState(emptyForm)

  const openNew = () => { setForm(emptyForm); setEditing(null); setShowForm(true) }
  const openEdit = (t: ConsultationType) => {
    setForm({
      name: t.name,
      description: t.description || '',
      durationMin: t.durationMin,
      price: t.price,
      locations: t.locationType.split(','),
    })
    setEditing(t.id)
    setShowForm(true)
  }

  const toggleLocation = (val: string) => {
    setForm(f => ({
      ...f,
      locations: f.locations.includes(val)
        ? f.locations.filter(l => l !== val)
        : [...f.locations, val],
    }))
  }

  const handleSave = async () => {
    if (!form.name.trim() || form.locations.length === 0) {
      toast.error('Nom et lieu requis'); return
    }
    setLoading('save')
    const payload = {
      name:        form.name.trim(),
      description: form.description.trim() || null,
      durationMin: Number(form.durationMin),
      price:       Number(form.price),
      locationType:form.locations.join(','),
      isActive:    true,
    }
    try {
      if (editing) {
        const res = await fetch(`/api/dashboard/consultations/${editing}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        })
        const updated = await res.json()
        setTypes(prev => prev.map(t => t.id === editing ? updated : t))
        toast.success('Consultation mise à jour')
      } else {
        const res = await fetch('/api/dashboard/consultations', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        })
        const created = await res.json()
        setTypes(prev => [...prev, created])
        toast.success('Consultation ajoutée')
      }
      setShowForm(false); setEditing(null)
    } catch { toast.error('Erreur') }
    finally { setLoading(null) }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Supprimer « ${name} » ?`)) return
    setLoading(id)
    try {
      await fetch(`/api/dashboard/consultations/${id}`, { method: 'DELETE' })
      setTypes(prev => prev.filter(t => t.id !== id))
      toast.success('Consultation supprimée')
    } catch { toast.error('Erreur') }
    finally { setLoading(null) }
  }

  const toggleActive = async (t: ConsultationType) => {
    setLoading(t.id + 'active')
    try {
      await fetch(`/api/dashboard/consultations/${t.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !t.isActive }),
      })
      setTypes(prev => prev.map(c => c.id === t.id ? { ...c, isActive: !c.isActive } : c))
      toast.success(t.isActive ? 'Consultation désactivée' : 'Consultation activée')
    } catch { toast.error('Erreur') }
    finally { setLoading(null) }
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Types de consultations</h3>
          <p className="text-sm text-gray-400 mt-0.5">Ces informations apparaissent dans le calendrier de prise de rendez-vous.</p>
        </div>
        <button onClick={openNew} className="btn-primary text-sm py-2 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-surface-50 border border-brand-100 rounded-2xl p-5 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-brand-700">{editing ? 'Modifier la consultation' : 'Nouvelle consultation'}</p>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-gray-400" /></button>
          </div>

          <div>
            <label className="label">Nom de la consultation *</label>
            <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
              className="input" placeholder="Bilan naturopathique initial" />
          </div>
          <div>
            <label className="label">Description (recommandé)</label>
            <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
              className="input resize-none" rows={2} placeholder="Première consultation complète de 1h…" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />Durée (minutes) *</label>
              <input type="number" min={15} step={15} value={form.durationMin}
                onChange={e => setForm(f => ({...f, durationMin: Number(e.target.value)}))}
                className="input" />
            </div>
            <div>
              <label className="label flex items-center gap-1.5"><Euro className="w-3.5 h-3.5" />Tarif (€) *</label>
              <input type="number" min={0} step={5} value={form.price}
                onChange={e => setForm(f => ({...f, price: Number(e.target.value)}))}
                className="input" />
            </div>
          </div>
          <div>
            <label className="label">Lieux disponibles *</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {LOCATION_OPTIONS.map(opt => (
                <button key={opt.value} type="button" onClick={() => toggleLocation(opt.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                    form.locations.includes(opt.value)
                      ? 'border-brand-500 bg-brand-50 text-brand-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}>
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button onClick={() => setShowForm(false)} className="btn-secondary py-2 px-4 text-sm">Annuler</button>
            <button onClick={handleSave} disabled={loading === 'save'}
              className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
              {loading === 'save' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Enregistrer
            </button>
          </div>
        </div>
      )}

      {/* Liste */}
      {types.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Aucune consultation configurée.</p>
          <p className="text-xs mt-1">Ajoutez vos types de consultations pour activer la prise de rendez-vous.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {types.map(t => (
            <div key={t.id} className={`flex items-start justify-between gap-4 p-4 rounded-xl border transition-all ${
              t.isActive ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 opacity-60'
            }`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                    {t.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                {t.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{t.description}</p>}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{t.durationMin} min</span>
                  <span className="flex items-center gap-1"><Euro className="w-3 h-3" />{t.price} €</span>
                  {t.locationType.split(',').map(l => (
                    <span key={l} className="flex items-center gap-1">
                      {l === 'cabinet' && <><Users className="w-3 h-3" />Cabinet</>}
                      {l === 'domicile' && <><Car className="w-3 h-3" />Domicile</>}
                      {l === 'distance' && <><Video className="w-3 h-3" />Distance</>}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button onClick={() => toggleActive(t)} disabled={!!loading}
                  className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                  title={t.isActive ? 'Désactiver' : 'Activer'}>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <button onClick={() => openEdit(t)} className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors" title="Modifier">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(t.id, t.name)} disabled={loading === t.id}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
                  {loading === t.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
