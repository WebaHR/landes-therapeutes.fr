'use client'
// src/components/dashboard/EditProForm.tsx
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import {
  Upload, X, Loader2, CheckCircle2, Globe, Phone, Mail, MapPin,
  GraduationCap, HelpCircle, Plus, Trash2, ChevronDown,
} from 'lucide-react'
import Image from 'next/image'
import type { Professional } from '@/types'
import { CATEGORIES } from '@/types'
import RichTextEditor from '@/components/ui/RichTextEditor'

interface EditProFormProps {
  professional: Professional
}

type FormationRow = { id: string; titre: string; etablissement: string; annee: string }
type FaqRow = { id: string; question: string; reponse: string }
type ExistingPhoto = { id: string; url: string }
type NewPhoto = { id: string; file: File; preview: string }

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
  const [richDescription, setRichDescription] = useState(professional.richDescription || '')
  const [logoPreview, setLogoPreview] = useState<string | null>(professional.logoUrl || null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  // Galerie photos (max 5)
  const [existingPhotos, setExistingPhotos] = useState<ExistingPhoto[]>(
    (professional.photos || []).map(p => ({ id: p.id, url: p.url }))
  )
  const [newPhotos, setNewPhotos] = useState<NewPhoto[]>([])
  const totalPhotos = existingPhotos.length + newPhotos.length
  const removeExistingPhoto = (id: string) => setExistingPhotos(prev => prev.filter(p => p.id !== id))
  const addPhotos = (files: FileList | null) => {
    if (!files) return
    const remaining = 5 - totalPhotos
    Array.from(files).slice(0, remaining).forEach(file => {
      if (file.type.startsWith('image/')) {
        setNewPhotos(prev => [...prev, { id: Date.now().toString() + Math.random(), file, preview: URL.createObjectURL(file) }])
      }
    })
  }
  const removeNewPhoto = (id: string) => setNewPhotos(prev => prev.filter(p => p.id !== id))

  // Formations
  const [formations, setFormations] = useState<FormationRow[]>(
    (professional.formations || []).map(f => ({
      id: f.id, titre: f.titre, etablissement: f.etablissement || '', annee: f.annee || '',
    }))
  )
  const addFormation = () => setFormations(prev => [...prev, { id: Date.now().toString(), titre: '', etablissement: '', annee: new Date().getFullYear().toString() }])
  const updateFormation = (id: string, field: string, val: string) => setFormations(prev => prev.map(f => f.id === id ? { ...f, [field]: val } : f))
  const removeFormation = (id: string) => setFormations(prev => prev.filter(f => f.id !== id))

  // FAQ
  const [faqItems, setFaqItems] = useState<FaqRow[]>(
    (professional.faqItems || []).map(f => ({ id: f.id, question: f.question, reponse: f.reponse }))
  )
  const addFaq = () => setFaqItems(prev => [...prev, { id: Date.now().toString(), question: '', reponse: '' }])
  const updateFaq = (id: string, field: string, val: string) => setFaqItems(prev => prev.map(f => f.id === id ? { ...f, [field]: val } : f))
  const removeFaq = (id: string) => setFaqItems(prev => prev.filter(f => f.id !== id))

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
      fd.append('richDescription', richDescription)
      if (logoFile) fd.append('logo', logoFile)
      fd.append('keepPhotoIds', JSON.stringify(existingPhotos.map(p => p.id)))
      newPhotos.forEach((p, i) => fd.append(`newPhoto_${i}`, p.file))
      fd.append('formations', JSON.stringify(formations.map(({ titre, etablissement, annee }) => ({ titre, etablissement, annee }))))
      fd.append('faq', JSON.stringify(faqItems.map(({ question, reponse }) => ({ question, reponse }))))

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
        <div>
          <label className="label">Description détaillée</label>
          <RichTextEditor
            value={richDescription}
            onChange={setRichDescription}
            placeholder="Décrivez de la façon la plus claire et précise votre activité…"
            minLength={0}
            maxLength={2500}
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

        {/* Galerie photos */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="label mb-0">Galerie photos</label>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${totalPhotos >= 5 ? 'bg-amber-50 text-amber-600' : 'bg-brand-50 text-brand-600'}`}>
              {totalPhotos}/5 photos
            </span>
          </div>
          <div className="grid grid-cols-5 gap-3 mb-2">
            {existingPhotos.map(p => (
              <div key={p.id} className="relative aspect-square rounded-xl overflow-hidden group border border-gray-200">
                <Image src={p.url} alt="photo" fill className="object-cover" />
                <button type="button" onClick={() => removeExistingPhoto(p.id)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            ))}
            {newPhotos.map(p => (
              <div key={p.id} className="relative aspect-square rounded-xl overflow-hidden group border border-gray-200">
                <Image src={p.preview} alt="photo" fill className="object-cover" />
                <button type="button" onClick={() => removeNewPhoto(p.id)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            ))}
            {totalPhotos < 5 && (
              <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-brand-400 hover:bg-brand-50 flex flex-col items-center justify-center cursor-pointer text-gray-300 hover:text-brand-400 transition-colors">
                <Upload className="w-5 h-5" />
                <input type="file" accept="image/*" multiple className="hidden" onChange={e => addPhotos(e.target.files)} />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Formations */}
      <div className="border-t border-gray-100 pt-5">
        <label className="label mb-0 flex items-center gap-1.5">
          <GraduationCap className="w-4 h-4 text-brand-500" />
          Formations
        </label>
        <div className="space-y-3 mt-3">
          {formations.map(f => (
            <div key={f.id} className="border border-gray-200 rounded-xl p-4 space-y-3 bg-surface-50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Formation</span>
                <button type="button" onClick={() => removeFormation(f.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div>
                <label className="label text-xs">Intitulé de la formation</label>
                <input value={f.titre} onChange={e => updateFormation(f.id, 'titre', e.target.value)}
                  className="input py-2 text-sm" placeholder="Naturopathie holistique, Sophrologie RNCP…" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">École / Établissement</label>
                  <input value={f.etablissement} onChange={e => updateFormation(f.id, 'etablissement', e.target.value)}
                    className="input py-2 text-sm" placeholder="ISUPNAT, FEPS…" />
                </div>
                <div>
                  <label className="label text-xs flex items-center gap-1.5">
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> Année d&apos;obtention
                  </label>
                  <select value={f.annee} onChange={e => updateFormation(f.id, 'annee', e.target.value)} className="input py-2 text-sm">
                    {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={addFormation}
          className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-800 border border-brand-300 border-dashed px-3 py-1.5 rounded-lg transition-colors">
          <Plus className="w-3.5 h-3.5" /> Ajouter une formation
        </button>
      </div>

      {/* FAQ */}
      <div className="border-t border-gray-100 pt-5">
        <label className="label mb-0 flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-brand-500" />
          Foire aux questions (FAQ)
        </label>
        <div className="space-y-3 mt-3">
          {faqItems.map((item, idx) => (
            <div key={item.id} className="border border-gray-200 rounded-xl p-4 space-y-3 bg-surface-50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Question {idx + 1}</span>
                <button type="button" onClick={() => removeFaq(item.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div>
                <label className="label text-xs">Question</label>
                <input value={item.question} onChange={e => updateFaq(item.id, 'question', e.target.value)}
                  className="input py-2 text-sm" placeholder="Ex : La naturopathie est-elle remboursée par la sécurité sociale ?" />
              </div>
              <div>
                <label className="label text-xs">Réponse</label>
                <textarea value={item.reponse} onChange={e => updateFaq(item.id, 'reponse', e.target.value)}
                  className="input py-2 text-sm resize-none" rows={3} placeholder="Répondez de façon claire et rassurante…" />
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={addFaq}
          className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-800 border border-brand-300 border-dashed px-3 py-1.5 rounded-lg transition-colors">
          <Plus className="w-3.5 h-3.5" /> Ajouter une question
        </button>
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
