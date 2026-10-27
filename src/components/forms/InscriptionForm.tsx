'use client'
// src/components/forms/InscriptionForm.tsx
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import {
  BadgeCheck, AlertCircle, Upload, X, Eye, EyeOff,
  Phone, Mail, Globe, MapPin, Loader2, CheckCircle2,
  Clock, Users, UserX, Sun, Sunset,
  Plus, Trash2, GraduationCap, FileText, HelpCircle, ChevronDown
} from 'lucide-react'
import { CATEGORIES } from '@/types'
import { formatSiren } from '@/lib/utils'
import Image from 'next/image'
import RichTextEditor, { SeoExample } from '@/components/ui/RichTextEditor'

const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

type DayHours = {
  isClosed: boolean
  openTime: string
  closeTime: string
  hasAfternoon: boolean
  openAfternoon: string
  closeAfternoon: string
}

const defaultDay = (): DayHours => ({
  isClosed: false,
  openTime: '09:00',
  closeTime: '12:00',
  hasAfternoon: true,
  openAfternoon: '14:00',
  closeAfternoon: '18:00',
})

const schema = z.object({
  firstName: z.string().min(2, 'Prénom requis (2 caractères min.)'),
  lastName: z.string().min(2, 'Nom requis (2 caractères min.)'),
  companyName: z.string().optional(),
  siren: z.string().regex(/^\d{3}\s?\d{3}\s?\d{3}$/, 'SIREN invalide (9 chiffres)'),
  category: z.string().min(1, 'Catégorie requise'),
  description: z.string().max(250, '250 caractères max').optional(),
  richDescription: z.string().min(0).optional(),
  phonePro: z.string().optional(),
  emailPro: z.string().email('Email invalide').optional().or(z.literal('')),
  phone: z.string().optional(),
  email: z.string().email('Email invalide'),
  website: z.string().url('URL invalide (ex: https://...)').optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().min(2, 'Ville requise'),
  postalCode: z.string().regex(/^\d{5}$/, 'Code postal invalide'),
  acceptsPublic: z.boolean().default(false),
  password: z.string().min(8, '8 caractères minimum'),
  confirmPassword: z.string(),
  acceptCgu: z.boolean().refine(v => v, 'Acceptation requise'),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

interface SirenStatus {
  status: 'idle' | 'checking' | 'valid' | 'invalid'
  message?: string
  companyName?: string
}

export default function InscriptionForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [sirenStatus, setSirenStatus] = useState<SirenStatus>({ status: 'idle' })
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hours, setHours] = useState<DayHours[]>(
    Array.from({ length: 7 }, (_, i) => ({ ...defaultDay(), isClosed: i === 0 || i === 6 }))
  )
  const [acceptsPublic, setAcceptsPublic] = useState(false)
  const [acceptsRdv, setAcceptsRdv] = useState(true)

  // Galerie photos (max 5)
  const [photos, setPhotos] = useState<{ id: string; file: File; preview: string }[]>([])
  const addPhotos = (files: FileList | null) => {
    if (!files) return
    const remaining = 5 - photos.length
    Array.from(files).slice(0, remaining).forEach(file => {
      if (file.type.startsWith('image/')) {
        setPhotos(prev => [...prev, { id: Date.now().toString() + Math.random(), file, preview: URL.createObjectURL(file) }])
      }
    })
  }
  const removePhoto = (id: string) => setPhotos(prev => prev.filter(p => p.id !== id))

  // Formations
  type Formation = { id: string; titre: string; etablissement: string; annee: string }
  const [formations, setFormations] = useState<Formation[]>([])
  const addFormation = () => setFormations(prev => [...prev, { id: Date.now().toString(), titre: '', etablissement: '', annee: new Date().getFullYear().toString() }])
  const updateFormation = (id: string, field: string, val: string) => setFormations(prev => prev.map(f => f.id === id ? { ...f, [field]: val } : f))
  const removeFormation = (id: string) => setFormations(prev => prev.filter(f => f.id !== id))

  // Diplômes PDF
  type Diplome = { id: string; nom: string; file: File }
  const [diplomes, setDiplomes] = useState<Diplome[]>([])
  const addDiplome = (files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach(file => {
      if (file.type === 'application/pdf') {
        setDiplomes(prev => [...prev, { id: Date.now().toString() + Math.random(), nom: file.name.replace('.pdf',''), file }])
      }
    })
  }
  const removeDiplome = (id: string) => setDiplomes(prev => prev.filter(d => d.id !== id))

  // Parcours texte riche
  const [parcours, setParcours] = useState('')

  // FAQ
  type FaqItem = { id: string; question: string; reponse: string }
  const [faqItems, setFaqItems] = useState<FaqItem[]>([
    { id: '1', question: '', reponse: '' },
  ])
  const addFaq = () => setFaqItems(prev => [...prev, { id: Date.now().toString(), question: '', reponse: '' }])
  const updateFaq = (id: string, field: string, val: string) => setFaqItems(prev => prev.map(f => f.id === id ? { ...f, [field]: val } : f))
  const removeFaq = (id: string) => { if (faqItems.length > 1) setFaqItems(prev => prev.filter(f => f.id !== id)) }

  const { register, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { acceptsPublic: false },
  })

  const sirenValue = watch('siren')

  const verifySiren = async () => {
    const siren = sirenValue?.replace(/\s/g, '')
    if (!siren || siren.length !== 9) return
    setSirenStatus({ status: 'checking' })
    try {
      const res = await fetch(`/api/siren/${siren}`)
      const data = await res.json()
      if (data.valid) {
        setSirenStatus({ status: 'valid', message: data.data?.companyName || 'SIREN valide', companyName: data.data?.companyName })
        if (data.data?.companyName && !watch('companyName')) setValue('companyName', data.data.companyName)
      } else {
        setSirenStatus({ status: 'invalid', message: data.error || 'SIREN non reconnu' })
      }
    } catch {
      setSirenStatus({ status: 'invalid', message: 'Erreur de vérification' })
    }
  }

  const onDropLogo = useCallback((files: File[]) => {
    const file = files[0]; if (!file) return
    setLogoFile(file); setLogoPreview(URL.createObjectURL(file))
  }, [])

  const { getRootProps: getLogoProps, getInputProps: getLogoInput, isDragActive: isLogoDrag } = useDropzone({
    onDrop: onDropLogo, accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.svg'] }, maxFiles: 1
  })

  const updateDay = (i: number, patch: Partial<DayHours>) => {
    setHours(prev => prev.map((d, idx) => idx === i ? { ...d, ...patch } : d))
  }

  const nextStep = async () => {
    let fields: (keyof FormData)[] = []
    if (step === 1) fields = ['firstName', 'lastName', 'siren', 'category']
    if (step === 2) fields = ['city', 'postalCode']
    if (step === 5) return // validation au submit
    const ok = await trigger(fields)
    if (ok) setStep(s => s + 1)
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      Object.entries(data).forEach(([k, v]) => formData.append(k, String(v ?? '')))
      if (logoFile) formData.append('logo', logoFile)
      formData.append('sirenVerified', String(sirenStatus.status === 'valid'))
      formData.append('richDescription', watch('richDescription') || '')
      formData.append('acceptsPublic', String(acceptsPublic))
      formData.append('acceptsRdv', String(acceptsRdv))
      formData.append('hours', JSON.stringify(hours))
      photos.forEach((p, i) => formData.append(`photo_${i}`, p.file))
      formData.append('formations', JSON.stringify(formations))
      formData.append('faq', JSON.stringify(faqItems.filter(f => f.question.trim())))
      formData.append('parcours', parcours)
      diplomes.forEach((d, i) => formData.append(`diplome_${i}`, d.file))

      const res = await fetch('/api/inscription', { method: 'POST', body: formData })
      const result = await res.json()
      if (!res.ok) {
        // Message spécifique pour réinscription avec mauvais mot de passe
        toast.error(result.error || "Erreur lors de l'inscription", { duration: 6000 })
        return
      }
      const msg = result.isReinscription
        ? 'Réinscription réussie ! Votre nouvelle fiche est en cours de validation.'
        : 'Inscription réussie ! Votre fiche est en cours de validation.'
      toast.success(msg)
      router.push('/dashboard')
    } catch {
      toast.error('Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  const STEP_LABELS = ['Informations', 'Localisation & RDV', 'Formations & Diplômes', 'Logo & Photos', 'Confirmation']

  return (
    <div className="card p-8">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {STEP_LABELS.map((label, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className={`flex flex-col items-center ${i < STEP_LABELS.length - 1 ? 'flex-1' : ''}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {step > i + 1 ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                </div>
                <span className={`mt-1.5 text-xs font-medium hidden sm:block ${step === i + 1 ? 'text-brand-600' : 'text-gray-400'}`}>
                  {label}
                </span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div className={`h-0.5 flex-1 mx-2 rounded-full transition-all ${step > i + 1 ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>

        {/* ── STEP 1: Informations ── */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-gray-900">Vos informations</h2>

            {/* Identité */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Prénom *</label>
                <input {...register('firstName')} className="input" placeholder="Marie" />
                {errors.firstName && <p className="text-red-500 text-xs mt-1.5">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="label">NOM *</label>
                <input {...register('lastName')} className="input" placeholder="DUPONT" />
                {errors.lastName && <p className="text-red-500 text-xs mt-1.5">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className="label">Nom de l&apos;entreprise / cabinet (facultatif)</label>
              <input {...register('companyName')} className="input" placeholder="Centre Harmonie Naturelle" />
            </div>

            <div>
              <label className="label">Numéro SIREN *</label>
              <div className="flex gap-2">
                <input
                  {...register('siren')}
                  placeholder="123 456 789"
                  className="input flex-1"
                  maxLength={11}
                  onChange={(e) => { setValue('siren', e.target.value); setSirenStatus({ status: 'idle' }) }}
                  onBlur={verifySiren}
                />
                <button type="button" onClick={verifySiren} disabled={sirenStatus.status === 'checking'} className="btn-secondary px-4 py-2 text-sm">
                  {sirenStatus.status === 'checking' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Vérifier'}
                </button>
              </div>
              {errors.siren && <p className="text-red-500 text-xs mt-1.5">{errors.siren.message}</p>}
              {sirenStatus.status === 'valid' && (
                <div className="mt-2 flex items-center gap-2 text-green-700 text-sm bg-green-50 rounded-lg px-3 py-2">
                  <BadgeCheck className="w-4 h-4 text-green-500" /><span className="font-medium">Vérifié :</span> {sirenStatus.companyName}
                </div>
              )}
              {sirenStatus.status === 'invalid' && (
                <div className="mt-2 flex items-center gap-2 text-red-700 text-sm bg-red-50 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />{sirenStatus.message}
                </div>
              )}
            </div>

            <div>
              <label className="label">Catégorie d&apos;activité *</label>
              <select {...register('category')} className="input">
                <option value="">Sélectionnez une catégorie</option>
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1.5">{errors.category.message}</p>}
            </div>

            {/* Contacts visibles sur la fiche */}
            <div className="border-t border-gray-100 pt-4 space-y-4">
              <h3 className="font-semibold text-gray-800">Contacts visibles sur votre fiche praticien</h3>
              <div>
                <label className="label flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  Téléphone (recommandé)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input {...register('phonePro')} className="input pl-10" placeholder="06 12 34 56 78" />
                </div>
              </div>
              <div>
                <label className="label flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  Email professionnel (recommandé)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input {...register('emailPro')} type="email" className="input pl-10" placeholder="contact@monactivite.fr" />
                </div>
                {errors.emailPro && <p className="text-red-500 text-xs mt-1.5">{errors.emailPro.message}</p>}
              </div>
            </div>

            {/* Descriptions */}
            <div className="border-t border-gray-100 pt-4 space-y-4">
              <h3 className="font-semibold text-gray-800">Description de votre activité</h3>
              <div>
                <label className="label">Une petite phrase descriptive sur vous ou votre activité (recommandé)</label>
                <textarea
                  {...register('description')}
                  className="input min-h-[70px] resize-none"
                  placeholder="Naturopathe certifiée, j'accompagne les personnes en quête d'un mieux-être global…"
                  maxLength={250}
                />
                <div className="flex justify-between mt-1">
                  {errors.description
                    ? <p className="text-red-500 text-xs">{errors.description.message}</p>
                    : <span />
                  }
                  <span className="text-xs text-gray-400">{(watch('description') || '').length}/250</span>
                </div>
              </div>

              <div>
                <label className="label">Description détaillée de votre activité (recommandé)</label>
                <SeoExample />
                <div className="mt-3">
                  <RichTextEditor
                    value={watch('richDescription') || ''}
                    onChange={val => setValue('richDescription', val)}
                    placeholder="Décrivez de la façon la plus claire et précise votre activité…"
                    minLength={500}
                    maxLength={2500}
                  />
                  {errors.richDescription && <p className="text-red-500 text-xs mt-1.5">{errors.richDescription.message}</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Localisation, Horaires & RDV ── */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Localisation & Organisation</h2>

            {/* Accueil public */}
            <div>
              <label className="label">Accueil du public *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => { setAcceptsPublic(true); setValue('acceptsPublic', true) }}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                    acceptsPublic ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${acceptsPublic ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-400'}`}>
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`font-semibold text-sm ${acceptsPublic ? 'text-brand-700' : 'text-gray-700'}`}>Je reçois du public</p>
                    <p className="text-xs text-gray-400 mt-0.5">Clients, patients, visiteurs…</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => { setAcceptsPublic(false); setValue('acceptsPublic', false) }}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                    !acceptsPublic ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${!acceptsPublic ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-400'}`}>
                    <UserX className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`font-semibold text-sm ${!acceptsPublic ? 'text-brand-700' : 'text-gray-700'}`}>Je ne reçois pas</p>
                    <p className="text-xs text-gray-400 mt-0.5">Travail à domicile, en déplacement…</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Adresse si reçoit du public */}
            {acceptsPublic && (
              <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 space-y-4">
                <p className="text-sm font-medium text-brand-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Adresse de votre établissement
                </p>
                <div>
                  <label className="label">Adresse *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input {...register('address')} className="input pl-10" placeholder="12 rue de la Paix" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Code postal *</label>
                    <input {...register('postalCode')} className="input" placeholder="75001" maxLength={5} />
                    {errors.postalCode && <p className="text-red-500 text-xs mt-1.5">{errors.postalCode.message}</p>}
                  </div>
                  <div>
                    <label className="label">Ville *</label>
                    <input {...register('city')} className="input" placeholder="Paris" />
                    {errors.city && <p className="text-red-500 text-xs mt-1.5">{errors.city.message}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* CP/Ville si ne reçoit pas */}
            {!acceptsPublic && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Code postal *</label>
                  <input {...register('postalCode')} className="input" placeholder="75001" maxLength={5} />
                  {errors.postalCode && <p className="text-red-500 text-xs mt-1.5">{errors.postalCode.message}</p>}
                </div>
                <div>
                  <label className="label">Ville *</label>
                  <input {...register('city')} className="input" placeholder="Paris" />
                  {errors.city && <p className="text-red-500 text-xs mt-1.5">{errors.city.message}</p>}
                </div>
              </div>
            )}

            {/* Prise de rendez-vous en ligne */}
            <div className="border-t border-gray-100 pt-5">
              <label className="label">Prise de rendez-vous en ligne</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAcceptsRdv(true)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                    acceptsRdv ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${acceptsRdv ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-400'}`}>
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`font-semibold text-sm ${acceptsRdv ? 'text-brand-700' : 'text-gray-700'}`}>J&apos;active la prise de RDV</p>
                    <p className="text-xs text-gray-400 mt-0.5">Les patients pourront réserver en ligne</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setAcceptsRdv(false)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                    !acceptsRdv ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${!acceptsRdv ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-400'}`}>
                    <UserX className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`font-semibold text-sm ${!acceptsRdv ? 'text-brand-700' : 'text-gray-700'}`}>Pas de RDV en ligne</p>
                    <p className="text-xs text-gray-400 mt-0.5">Contact uniquement par téléphone/email</p>
                  </div>
                </button>
              </div>
              {acceptsRdv && (
                <p className="text-xs text-brand-600 bg-brand-50 rounded-lg px-3 py-2 mt-2">
                  ✓ Vous pourrez configurer vos types de consultations et tarifs depuis votre tableau de bord après validation de votre fiche.
                </p>
              )}
            </div>

            {/* Horaires d'ouverture */}
            <div className="border-t border-gray-100 pt-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">Horaires d&apos;ouverture</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Configurez vos horaires matin et après-midi.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button"
                    onClick={() => setHours(h => h.map((d, i) => i === 0 || i === 6 ? { ...d, isClosed: true } : { ...d, isClosed: false }))}
                    className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg">Lun–Ven</button>
                  <button type="button"
                    onClick={() => setHours(h => h.map(d => ({ ...d, isClosed: false })))}
                    className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg">7j/7</button>
                </div>
              </div>

            <div className="space-y-3">
              {DAYS.map((day, i) => (
                <div key={i} className={`rounded-xl border p-4 transition-all ${hours[i].isClosed ? 'bg-gray-50 border-gray-200 opacity-75' : 'bg-white border-gray-200'}`}>
                  {/* Ligne titre + toggle fermé */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-800 w-28">{day}</span>
                    <button
                      type="button"
                      onClick={() => updateDay(i, { isClosed: !hours[i].isClosed })}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        hours[i].isClosed
                          ? 'bg-red-50 text-red-600 border border-red-200'
                          : 'bg-green-50 text-green-700 border border-green-200'
                      }`}
                    >
                      {hours[i].isClosed ? '✕ Fermé' : '✓ Ouvert'}
                    </button>
                  </div>

                  {!hours[i].isClosed && (
                    <div className="space-y-3">
                      {/* Matin */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-amber-500 w-24 flex-shrink-0">
                          <Sun className="w-4 h-4" />
                          <span className="text-xs font-medium text-gray-600">Matin</span>
                        </div>
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="time"
                            value={hours[i].openTime}
                            onChange={e => updateDay(i, { openTime: e.target.value })}
                            className="input py-1.5 text-sm flex-1"
                          />
                          <span className="text-gray-400 text-sm">→</span>
                          <input
                            type="time"
                            value={hours[i].closeTime}
                            onChange={e => updateDay(i, { closeTime: e.target.value })}
                            className="input py-1.5 text-sm flex-1"
                          />
                        </div>
                      </div>

                      {/* Toggle après-midi */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-orange-400 w-24 flex-shrink-0">
                          <Sunset className="w-4 h-4" />
                          <span className="text-xs font-medium text-gray-600">Après-midi</span>
                        </div>
                        {hours[i].hasAfternoon ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="time"
                              value={hours[i].openAfternoon}
                              onChange={e => updateDay(i, { openAfternoon: e.target.value })}
                              className="input py-1.5 text-sm flex-1"
                            />
                            <span className="text-gray-400 text-sm">→</span>
                            <input
                              type="time"
                              value={hours[i].closeAfternoon}
                              onChange={e => updateDay(i, { closeAfternoon: e.target.value })}
                              className="input py-1.5 text-sm flex-1"
                            />
                            <button
                              type="button"
                              onClick={() => updateDay(i, { hasAfternoon: false })}
                              className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                              title="Supprimer l'après-midi"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => updateDay(i, { hasAfternoon: true })}
                            className="text-xs text-brand-600 hover:text-brand-800 font-medium border border-dashed border-brand-300 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            + Ajouter une plage après-midi
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            </div>
          </div>
        )}

        {/* ── STEP 3: Formations & Diplômes ── */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-brand-500" />
                Formations &amp; Diplômes
              </h2>
              <p className="text-sm text-gray-500 mt-1">Ces informations renforcent la crédibilité de votre fiche auprès des patients.</p>
            </div>

            {/* ── Formations ── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="label mb-0">Formations (recommandé)</label>
                <button type="button" onClick={addFormation}
                  className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-800 border border-brand-300 border-dashed px-3 py-1.5 rounded-lg transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Ajouter une formation
                </button>
              </div>

              {formations.length === 0 && (
                <button type="button" onClick={addFormation}
                  className="w-full py-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm hover:border-brand-300 hover:text-brand-500 transition-colors flex flex-col items-center gap-2">
                  <GraduationCap className="w-6 h-6" />
                  Cliquez pour ajouter votre première formation
                </button>
              )}

              <div className="space-y-3">
                {formations.map((f) => (
                  <div key={f.id} className="border border-gray-200 rounded-xl p-4 space-y-3 bg-surface-50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Formation</span>
                      <button type="button" onClick={() => removeFormation(f.id)}
                        className="text-gray-300 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div>
                      <label className="label text-xs">Intitulé de la formation *</label>
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
                          <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> Année d'obtention
                        </label>
                        <select value={f.annee} onChange={e => updateFormation(f.id, 'annee', e.target.value)}
                          className="input py-2 text-sm">
                          {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(y => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Diplômes PDF ── */}
            <div className="border-t border-gray-100 pt-5">
              <div className="flex items-center justify-between mb-3">
                <label className="label mb-0 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-brand-500" />
                  Diplômes (PDF recommandé)
                </label>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-800 border border-brand-300 border-dashed px-3 py-1.5 rounded-lg cursor-pointer transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Ajouter un diplôme
                  <input type="file" accept=".pdf" multiple className="hidden"
                    onChange={e => addDiplome(e.target.files)} />
                </label>
              </div>
              <p className="text-xs text-gray-400 mb-3">Format PDF uniquement • Vos diplômes seront vérifiés par notre équipe avant publication</p>

              {diplomes.length === 0 ? (
                <label className="w-full py-6 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm hover:border-brand-300 hover:text-brand-500 transition-colors flex flex-col items-center gap-2 cursor-pointer">
                  <FileText className="w-6 h-6" />
                  Glissez vos PDF ici ou cliquez pour parcourir
                  <input type="file" accept=".pdf" multiple className="hidden"
                    onChange={e => addDiplome(e.target.files)} />
                </label>
              ) : (
                <div className="space-y-2">
                  {diplomes.map(d => (
                    <div key={d.id} className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                      <FileText className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <span className="text-sm text-gray-700 flex-1 truncate">{d.nom}.pdf</span>
                      <button type="button" onClick={() => removeDiplome(d.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <label className="flex items-center gap-2 text-xs text-brand-600 hover:text-brand-800 cursor-pointer mt-1">
                    <Plus className="w-3.5 h-3.5" /> Ajouter un autre diplôme
                    <input type="file" accept=".pdf" multiple className="hidden"
                      onChange={e => addDiplome(e.target.files)} />
                  </label>
                </div>
              )}
            </div>

            {/* ── Parcours & informations complémentaires ── */}
            <div className="border-t border-gray-100 pt-5">
              <label className="label">Informations complémentaires sur mon parcours (recommandé)</label>
              <RichTextEditor
                value={parcours}
                onChange={setParcours}
                placeholder="Décrivez votre parcours, vos spécialisations, vos approches thérapeutiques…"
                minLength={0}
                maxLength={2000}
              />
            </div>

            {/* ── FAQ ── */}
            <div className="border-t border-gray-100 pt-5">
              <div className="flex items-center justify-between mb-1">
                <label className="label mb-0 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-brand-500" />
                  Foire aux questions (FAQ)
                </label>
                <button type="button" onClick={addFaq}
                  className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-800 border border-brand-300 border-dashed px-3 py-1.5 rounded-lg transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Ajouter une question
                </button>
              </div>
              <p className="text-xs text-gray-400 mb-3">Répondez aux questions les plus fréquentes de vos patients pour rassurer et convertir.</p>

              <div className="space-y-3">
                {faqItems.map((item, idx) => (
                  <div key={item.id} className="border border-gray-200 rounded-xl p-4 space-y-3 bg-surface-50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Question {idx + 1}</span>
                      <button type="button" onClick={() => removeFaq(item.id)}
                        disabled={faqItems.length === 1}
                        className="text-gray-300 hover:text-red-400 transition-colors disabled:opacity-30">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div>
                      <label className="label text-xs">Question</label>
                      <input value={item.question} onChange={e => updateFaq(item.id, 'question', e.target.value)}
                        className="input py-2 text-sm"
                        placeholder="Ex : La naturopathie est-elle remboursée par la sécurité sociale ?" />
                    </div>
                    <div>
                      <label className="label text-xs">Réponse</label>
                      <textarea value={item.reponse} onChange={e => updateFaq(item.id, 'reponse', e.target.value)}
                        className="input py-2 text-sm resize-none" rows={3}
                        placeholder="Répondez de façon claire et rassurante…" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ── STEP 4: Médias ── */}
        {step === 4 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Logo &amp; Photos</h2>
              <p className="text-gray-500 text-sm mt-1">Valorisez votre fiche avec un logo et une galerie de photos de votre cabinet ou activité.</p>
            </div>

            {/* ── Logo ── */}
            <div>
              <label className="label text-base font-semibold">Logo de votre activité</label>
              <p className="text-xs text-gray-400 mb-3">Affiché en tête de votre fiche praticien</p>
              <div className="flex items-start gap-6">
                <div
                  {...getLogoProps()}
                  className={`relative w-28 h-28 rounded-full border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${
                    isLogoDrag ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'
                  }`}
                >
                  <input {...getLogoInput()} />
                  {logoPreview ? (
                    <Image src={logoPreview} alt="Logo" fill className="object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400 text-center p-2">
                      <Upload className="w-5 h-5" />
                      <span className="text-xs">Logo</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Glissez votre logo ici ou cliquez pour parcourir.</p>
                  <p className="text-xs text-gray-400">PNG, JPG, SVG • Max 2 Mo • Recommandé : 400×400px</p>
                  {logoPreview && (
                    <button type="button" onClick={() => { setLogoPreview(null); setLogoFile(null) }}
                      className="mt-2 text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                      <X className="w-3.5 h-3.5" /> Supprimer
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ── Galerie photos ── */}
            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between mb-1">
                <label className="label text-base font-semibold mb-0">Galerie photos (recommandé)</label>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  photos.length >= 5 ? 'bg-amber-50 text-amber-600' : 'bg-brand-50 text-brand-600'
                }`}>
                  {photos.length}/5 photos
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-4">Photos de votre cabinet, de vos soins, de votre environnement de travail… Max 5 photos.</p>

              {/* Grille aperçu */}
              <div className="grid grid-cols-5 gap-3 mb-4">
                {photos.map(p => (
                  <div key={p.id} className="relative aspect-square rounded-xl overflow-hidden group border border-gray-200">
                    <Image src={p.preview} alt="photo" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(p.id)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                ))}
                {/* Slots vides */}
                {Array.from({ length: Math.max(0, 5 - photos.length) }).map((_, i) => (
                  <label key={i}
                    className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${
                      photos.length >= 5
                        ? 'border-gray-100 bg-gray-50 cursor-not-allowed'
                        : 'border-gray-200 hover:border-brand-400 hover:bg-brand-50 text-gray-300 hover:text-brand-400'
                    }`}
                  >
                    {photos.length < 5 && (
                      <>
                        <Upload className="w-5 h-5 mb-1" />
                        <span className="text-xs font-medium">Photo {photos.length + i + 1}</span>
                        <input type="file" accept="image/*" multiple className="hidden"
                          onChange={e => addPhotos(e.target.files)} />
                      </>
                    )}
                  </label>
                ))}
              </div>

              {photos.length === 0 && (
                <label className="w-full py-8 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center gap-2 text-gray-400 hover:border-brand-300 hover:text-brand-500 cursor-pointer transition-colors">
                  <Upload className="w-7 h-7" />
                  <span className="text-sm font-medium">Cliquez ou glissez vos photos ici</span>
                  <span className="text-xs">PNG, JPG • Max 5 Mo par photo • 5 photos maximum</span>
                  <input type="file" accept="image/*" multiple className="hidden"
                    onChange={e => addPhotos(e.target.files)} />
                </label>
              )}

              {photos.length > 0 && photos.length < 5 && (
                <label className="flex items-center gap-2 text-xs text-brand-600 hover:text-brand-800 cursor-pointer w-fit">
                  <Plus className="w-3.5 h-3.5" />
                  Ajouter d&apos;autres photos ({5 - photos.length} restante{5 - photos.length > 1 ? 's' : ''})
                  <input type="file" accept="image/*" multiple className="hidden"
                    onChange={e => addPhotos(e.target.files)} />
                </label>
              )}

              {photos.length >= 5 && (
                <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                  ✓ Galerie complète — 5 photos ajoutées
                </p>
              )}
            </div>

          </div>
        )}

        {/* ── STEP 5: Confirmation ── */}
        {step === 5 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-gray-900">Récapitulatif & Création de compte</h2>

            {/* Récap infos */}
            <div className="bg-surface-50 rounded-xl p-5 space-y-3">
              {[
                ['Prénom', watch('firstName')],
                ['NOM', watch('lastName')],
                ...(watch('companyName') ? [['Cabinet', watch('companyName')]] : []),
                ['SIREN', formatSiren(watch('siren') || '')],
                ['Catégorie', watch('category')],
                ['Ville', `${watch('city')} ${watch('postalCode')}`],
                ...(watch('phonePro') ? [['Tél. pro', watch('phonePro')]] : []),
                ...(watch('emailPro') ? [['Email pro', watch('emailPro')]] : []),
                ['Accueil public', acceptsPublic ? '✅ Oui' : '❌ Non'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-semibold text-gray-900 flex items-center gap-1">
                    {label === 'SIREN' && sirenStatus.status === 'valid' && <BadgeCheck className="w-4 h-4 text-green-500" />}
                    {value}
                  </span>
                </div>
              ))}
              {acceptsPublic && watch('address') && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Adresse</span>
                  <span className="font-medium text-gray-900">{watch('address')}</span>
                </div>
              )}
            </div>

            {/* Récap horaires */}
            <div className="bg-surface-50 rounded-xl p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Horaires
              </p>
              <div className="space-y-1.5">
                {hours.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 w-24">{DAYS[i]}</span>
                    {d.isClosed ? (
                      <span className="text-red-400 text-xs">Fermé</span>
                    ) : (
                      <span className="text-gray-700">
                        {d.openTime}–{d.closeTime}
                        {d.hasAfternoon && ` / ${d.openAfternoon}–${d.closeAfternoon}`}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {logoPreview && (
              <div className="flex items-center justify-between text-sm bg-surface-50 rounded-xl px-5 py-3">
                <span className="text-gray-500">Logo</span>
                <div className="w-10 h-10 rounded-lg overflow-hidden">
                  <Image src={logoPreview} alt="Logo" width={40} height={40} className="object-cover" />
                </div>
              </div>
            )}

            {/* Votre compte */}
            <div className="border border-brand-200 bg-brand-50 rounded-xl p-5 space-y-4">
              <h3 className="font-semibold text-brand-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Votre compte
              </h3>
              <div>
                <label className="label">Email de connexion *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input {...register('email')} type="email" className="input pl-10" placeholder="votre@email.fr" />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>}
              </div>
              <div>
                <label className="label">Mot de passe *</label>
                <p className="text-xs text-gray-400 mb-2">
                  Si votre compte a déjà existé sur notre annuaire, utilisez votre ancien mot de passe.
                </p>
                <div className="relative">
                  <input {...register('password')} type={showPassword ? 'text' : 'password'} className="input pr-10" placeholder="8 caractères minimum" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>}
              </div>
              <div>
                <label className="label">Confirmer le mot de passe *</label>
                <input {...register('confirmPassword')} type="password" className="input" placeholder="Répétez le mot de passe" />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1.5">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <div className="bg-brand-50 rounded-xl p-4 text-sm text-brand-700">
              <p className="font-medium mb-1">📋 Processus de validation</p>
              <p>Votre fiche sera examinée par notre équipe dans les 24–48h. Vous recevrez un email de confirmation.</p>
            </div>

            <div className="flex items-start gap-3">
              <input {...register('acceptCgu')} type="checkbox" id="cgu" className="mt-1 w-4 h-4 rounded text-brand-600" />
              <label htmlFor="cgu" className="text-sm text-gray-600">
                J&apos;accepte les{' '}
                <a href="/cgu" target="_blank" className="text-brand-600 font-medium hover:underline">CGU</a>
                {' '}et la{' '}
                <a href="/confidentialite" target="_blank" className="text-brand-600 font-medium hover:underline">politique de confidentialité</a>
              </label>
            </div>
            {errors.acceptCgu && <p className="text-red-500 text-xs">{errors.acceptCgu.message}</p>}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          {step > 1 ? (
            <button type="button" onClick={() => setStep(s => s - 1)} className="btn-secondary">← Retour</button>
          ) : <div />}
          {step < 5 ? (
            <button type="button" onClick={nextStep} className="btn-primary">Continuer →</button>
          ) : (
            <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center gap-2">
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Envoi en cours…</> : <><CheckCircle2 className="w-4 h-4" /> Créer ma fiche</>}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
