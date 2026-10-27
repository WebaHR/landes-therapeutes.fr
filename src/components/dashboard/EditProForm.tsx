'use client'
// src/components/dashboard/EditProForm.tsx
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { Upload, X, Loader2, CheckCircle2, Globe, Phone, Mail, MapPin } from 'lucide-react'
import Image from 'next/image'
import type { Professional } from '@/types'
import { CATEGORIES } from '@/types'

interface EditProFormProps {
  professional: Professional
}

export default function EditProForm({ professional }: EditProFormProps) {
  const [form, setForm] = useState({
    companyName: professional.companyName || '',
    category: professional.category || '',
    description: professional.description || '',
    phone: professional.phone || '',
    email: professional.email || '',
    website: professional.website || '',
    address: professional.address || '',
    city: professional.city || '',
    postalCode: professional.postalCode || '',
    googlePlaceId: professional.googlePlaceId || '',
  })
  const [logoPreview, setLogoPreview] = useState<string | null>(professional.logoUrl || null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  const onDropLogo = useCallback((files: File[]) => {
    const f = files[0]; if (!f) return
    setLogoFile(f); setLogoPreview(URL.createObjectURL(f))
  }, [])

  const { getRootProps: gL, getInputProps: giL, isDragActive: idL } = useDropzone({
    onDrop: onDropLogo, accept: { 'image/*': [] }, maxFiles: 1
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (logoFile) fd.append('logo', logoFile)

      const res = await fetch(`/api/dashboard/professional`, { method: 'PUT', body: fd })
      if (!res.ok) throw new Error()
      toast.success('Fiche mise à jour !')
    } catch {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-6">
      <h3 className="font-bold text-gray-900 text-xl">Modifier ma fiche</h3>

      {/* Basic info */}
      <div className="space-y-4">
        <div>
          <label className="label">Nom de l&apos;entreprise</label>
          <input name="companyName" value={form.companyName} onChange={handleChange} className="input" />
        </div>
        <div>
          <label className="label">Catégorie</label>
          <select name="category" value={form.category} onChange={handleChange} className="input">
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="input min-h-[100px] resize-none"
            placeholder="Décrivez votre activité…"
          />
        </div>
      </div>

      {/* Contact */}
      <div className="border-t border-gray-100 pt-5 space-y-4">
        <h4 className="font-semibold text-gray-800">Contact</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Téléphone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input name="phone" value={form.phone} onChange={handleChange} className="input pl-10" placeholder="01 23 45 67 89" />
            </div>
          </div>
          <div>
            <label className="label">Email public</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input name="email" value={form.email} onChange={handleChange} className="input pl-10" type="email" />
            </div>
          </div>
          <div>
            <label className="label">Site web</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input name="website" value={form.website} onChange={handleChange} className="input pl-10" placeholder="https://..." />
            </div>
          </div>
          <div>
            <label className="label">Adresse</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input name="address" value={form.address} onChange={handleChange} className="input pl-10" />
            </div>
          </div>
          <div>
            <label className="label">Ville</label>
            <input name="city" value={form.city} onChange={handleChange} className="input" />
          </div>
          <div>
            <label className="label">Code postal</label>
            <input name="postalCode" value={form.postalCode} onChange={handleChange} className="input" maxLength={5} />
          </div>
        </div>
      </div>

      {/* Google */}
      <div className="border-t border-gray-100 pt-5">
        <h4 className="font-semibold text-gray-800 mb-4">Avis Google</h4>
        <div>
          <label className="label">Google Place ID</label>
          <input name="googlePlaceId" value={form.googlePlaceId} onChange={handleChange} className="input" placeholder="ChIJN1t_tDeuEmsRUsoyG83frY4" />
          <p className="text-xs text-gray-400 mt-1.5">
            Trouvez votre Place ID sur{' '}
            <a href="https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder" target="_blank" className="text-brand-600 hover:underline">
              Google Place ID Finder
            </a>
          </p>
        </div>
      </div>

      {/* Médias */}
      <div className="border-t border-gray-100 pt-5 space-y-5">
        <h4 className="font-semibold text-gray-800">Visuels</h4>

        <div>
          <label className="label">Logo</label>
          <div className="flex items-center gap-5">
            <div
              {...gL()}
              className={`w-24 h-24 rounded-2xl border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden transition-all relative ${
                idL ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-brand-300'
              }`}
            >
              <input {...giL()} />
              <Image
                src={logoPreview || '/defaults/default-logo.svg'}
                alt="Logo"
                fill
                className="object-cover"
              />
              {!logoPreview && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl">
                  <Upload className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-xs text-gray-500">Cliquez sur l&apos;image pour changer</p>
              {logoPreview && (
                <button type="button" onClick={() => { setLogoPreview(null); setLogoFile(null) }} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                  <X className="w-3.5 h-3.5" /> Supprimer (revenir au défaut)
                </button>
              )}
            </div>
          </div>
        </div>

      </div>

      <div className="flex justify-end pt-2">
        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          Enregistrer les modifications
        </button>
      </div>
    </form>
  )
}
