'use client'
// src/components/ui/BookingCalendar.tsx
import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Clock, MapPin, Euro, Loader2, CheckCircle2, Users, Car, Video, CalendarDays } from 'lucide-react'

type ConsultationType = {
  id: string
  name: string
  description: string | null
  durationMin: number
  price: number
  locationType: string
}

type OpeningHour = {
  dayOfWeek: number
  isClosed: boolean
  openTime: string | null
  closeTime: string | null
  openAfternoon: string | null
  closeAfternoon: string | null
}

interface Props {
  professionalId: string
  consultationTypes: ConsultationType[]
  openingHours: OpeningHour[]
}

const LOCATION_ICONS: Record<string, React.ReactNode> = {
  cabinet:  <Users className="w-3.5 h-3.5" />,
  domicile: <Car className="w-3.5 h-3.5" />,
  distance: <Video className="w-3.5 h-3.5" />,
}
const LOCATION_LABELS: Record<string, string> = {
  cabinet:  'En cabinet',
  domicile: 'À domicile',
  distance: 'À distance',
}

const DAYS_SHORT = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam']
const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']

function generateSlots(openTime: string, closeTime: string, duration: number): string[] {
  const slots: string[] = []
  const [oh, om] = openTime.split(':').map(Number)
  const [ch, cm] = closeTime.split(':').map(Number)
  let cur = oh * 60 + om
  const end = ch * 60 + cm
  while (cur + duration <= end) {
    slots.push(`${String(Math.floor(cur/60)).padStart(2,'0')}:${String(cur%60).padStart(2,'0')}`)
    cur += duration
  }
  return slots
}

export default function BookingCalendar({ professionalId, consultationTypes, openingHours }: Props) {
  const active = consultationTypes.filter(c => c.id)

  const [selectedTypeId,   setSelectedTypeId]   = useState(() => consultationTypes.filter(c => c.id)[0]?.id ?? '')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [currentMonth,     setCurrentMonth]     = useState(() => { const d = new Date(); d.setDate(1); return d })
  const [selectedDate,     setSelectedDate]     = useState('')
  const [bookedSlots,      setBookedSlots]      = useState<string[]>([])
  const [selectedTime,     setSelectedTime]     = useState('')
  const [loadingSlots,     setLoadingSlots]     = useState(false)
  const [submitting,       setSubmitting]       = useState(false)
  const [confirmed,        setConfirmed]        = useState(false)
  const [form,             setForm]             = useState({ name: '', email: '', phone: '', note: '' })

  const selectedType = active.find(c => c.id === selectedTypeId) ?? null
  const locations    = selectedType?.locationType.split(',').map(l => l.trim()).filter(l => LOCATION_LABELS[l]) ?? []

  // Pré-sélectionner le premier lieu disponible quand le type change
  useEffect(() => {
    const locs = active.find(c => c.id === selectedTypeId)?.locationType.split(',').map(l => l.trim()).filter(l => LOCATION_LABELS[l]) ?? []
    setSelectedLocation(locs[0] ?? '')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTypeId])
  // Reset date/heure si le lieu change
  useEffect(() => { setSelectedDate(''); setSelectedTime('') }, [selectedLocation])
  // Reset heure si la date change
  useEffect(() => { setSelectedTime('') }, [selectedDate])

  // Charger créneaux réservés
  const loadBooked = useCallback(async (date: string) => {
    setLoadingSlots(true)
    try {
      const res = await fetch(`/api/appointments?professionalId=${professionalId}&date=${date}`)
      setBookedSlots(await res.json())
    } catch { setBookedSlots([]) }
    finally { setLoadingSlots(false) }
  }, [professionalId])

  useEffect(() => { if (selectedDate) loadBooked(selectedDate) }, [selectedDate, loadBooked])

  // Calendrier
  const today = new Date(); today.setHours(0,0,0,0)
  const firstDay    = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const lastDay     = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
  const startOffset = firstDay.getDay()
  const calendarCells: (Date | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: lastDay.getDate() }, (_, i) => new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1)),
  ]
  const toDateStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  const isDayAvailable = (date: Date) => {
    if (date < today) return false
    const oh = openingHours.find(h => h.dayOfWeek === date.getDay())
    return !!oh && !oh.isClosed
  }

  // Créneaux disponibles
  const availableSlots = (() => {
    if (!selectedDate || !selectedType) return []
    const oh = openingHours.find(h => h.dayOfWeek === new Date(selectedDate + 'T12:00:00').getDay())
    if (!oh || oh.isClosed) return []
    const dur = selectedType.durationMin
    const morning   = oh.openTime   && oh.closeTime   ? generateSlots(oh.openTime,   oh.closeTime,   dur) : []
    const afternoon = oh.openAfternoon && oh.closeAfternoon ? generateSlots(oh.openAfternoon, oh.closeAfternoon, dur) : []
    return [...morning, ...afternoon].filter(s => !bookedSlots.includes(s))
  })()

  const canSubmit = selectedType && selectedLocation && selectedDate && selectedTime && form.name && form.email

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professionalId,
          consultationTypeId: selectedType!.id,
          patientName:  form.name,
          patientEmail: form.email,
          patientPhone: form.phone,
          patientNote:  form.note,
          date: selectedDate,
          time: selectedTime,
          locationType: selectedLocation,
        }),
      })
      const data = await res.json()
      if (!res.ok) { alert(data.error || 'Erreur'); return }
      setConfirmed(true)
    } catch { alert('Erreur réseau') }
    finally { setSubmitting(false) }
  }

  const resetBooking = () => {
    setSelectedTypeId(''); setSelectedLocation(''); setSelectedDate(''); setSelectedTime('')
    setForm({ name:'', email:'', phone:'', note:'' }); setConfirmed(false)
  }

  if (active.length === 0) {
    return (
      <div className="card p-6 text-center text-gray-400">
        <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm font-medium">Pas encore de consultations configurées</p>
        <p className="text-xs mt-1 opacity-60">Le praticien n&apos;a pas encore renseigné ses consultations.</p>
      </div>
    )
  }

  /* ── Confirmation ── */
  if (confirmed && selectedType) {
    return (
      <div className="card p-6 text-center space-y-3">
        <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto" />
        <div>
          <p className="text-lg font-bold text-gray-900">Rendez-vous confirmé !</p>
          <p className="text-sm text-gray-500 mt-1">
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' })} à {selectedTime}
          </p>
          <p className="text-sm text-brand-700 font-medium mt-0.5">{selectedType.name} — {selectedType.price} €</p>
          <p className="text-xs text-gray-400 mt-1">{LOCATION_LABELS[selectedLocation]} · {selectedType.durationMin} min</p>
        </div>
        <p className="text-xs text-gray-400">Confirmation envoyée à <strong>{form.email}</strong></p>
        <button onClick={resetBooking} className="btn-secondary text-sm py-2">Prendre un autre rendez-vous</button>
      </div>
    )
  }

  /* ── Formulaire unique ── */
  return (
    <div className="card overflow-hidden">
      {/* En-tête */}
      <div className="bg-brand-600 px-5 py-4">
        <h2 className="text-white font-bold text-base flex items-center gap-2">
          <CalendarDays className="w-5 h-5" /> Prendre rendez-vous
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-5">

        {/* 1. Type de consultation */}
        <div>
          <label className="label flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-brand-500" /> Type de consultation
          </label>
          <select
            value={selectedTypeId}
            onChange={e => setSelectedTypeId(e.target.value)}
            className="input py-2.5 text-sm"
          >
            <option value="">— Choisissez une consultation —</option>
            {active.map(t => (
              <option key={t.id} value={t.id}>
                {t.name} · {t.durationMin} min · {t.price} €
              </option>
            ))}
          </select>

          {/* Détail dynamique */}
          {selectedType && (
            <div className="mt-2 bg-brand-50 border border-brand-100 rounded-xl px-3 py-2 flex items-center justify-between text-xs text-brand-700">
              <span className="font-medium">{selectedType.name}</span>
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{selectedType.durationMin} min</span>
                <span className="flex items-center gap-1"><Euro className="w-3 h-3" />{selectedType.price} €</span>
              </span>
            </div>
          )}
        </div>

        {/* 2. Lieu */}
        {selectedType && locations.length > 0 && (
          <div>
            <label className="label flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-500" /> Lieu du rendez-vous
            </label>
            <select
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              className="input py-2.5 text-sm"
            >
              <option value="">— Choisissez un lieu —</option>
              {locations.map(loc => (
                <option key={loc} value={loc}>{LOCATION_LABELS[loc]}</option>
              ))}
            </select>
            {selectedLocation && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-brand-700 bg-brand-50 border border-brand-100 rounded-xl px-3 py-2">
                {LOCATION_ICONS[selectedLocation]}
                <span className="font-medium">{LOCATION_LABELS[selectedLocation]}</span>
              </div>
            )}
          </div>
        )}

        {/* 3. Calendrier */}
        {selectedType && selectedLocation && (
          <div>
            <label className="label flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-brand-500" /> Choisissez une date
            </label>

            {/* Navigation mois */}
            <div className="flex items-center justify-between mb-2">
              <button type="button"
                onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth()-1, 1))}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              </button>
              <span className="text-sm font-bold text-gray-800 capitalize">
                {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </span>
              <button type="button"
                onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth()+1, 1))}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Jours */}
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {DAYS_SHORT.map(d => (
                <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {calendarCells.map((date, i) => {
                if (!date) return <div key={i} />
                const available = isDayAvailable(date)
                const dateStr   = toDateStr(date)
                const isSel     = dateStr === selectedDate
                const isTdy     = toDateStr(today) === dateStr
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={!available}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`aspect-square flex items-center justify-center text-xs rounded-lg font-medium transition-all ${
                      isSel     ? 'bg-brand-600 text-white shadow-sm' :
                      isTdy && available ? 'bg-brand-50 text-brand-700 border border-brand-300' :
                      available ? 'hover:bg-brand-50 hover:text-brand-700 text-gray-700' :
                      'text-gray-200 cursor-not-allowed'
                    }`}
                  >
                    {date.getDate()}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* 4. Créneaux horaires */}
        {selectedDate && (
          <div>
            <label className="label flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-brand-500" />
              Créneaux disponibles —{' '}
              <span className="text-brand-600 font-semibold">
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' })}
              </span>
            </label>
            {loadingSlots ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
              </div>
            ) : availableSlots.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-3 bg-gray-50 rounded-xl">
                Aucun créneau disponible ce jour
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-1.5">
                {availableSlots.map(slot => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTime(slot)}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                      selectedTime === slot
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-brand-400 hover:text-brand-700'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. Formulaire patient */}
        {selectedTime && (
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-700">Vos informations</p>

            <div>
              <label className="label text-xs">Nom complet *</label>
              <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                className="input py-2 text-sm" placeholder="Marie Dupont" required />
            </div>
            <div>
              <label className="label text-xs">Email *</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
                className="input py-2 text-sm" placeholder="marie@email.fr" required />
            </div>
            <div>
              <label className="label text-xs">Téléphone</label>
              <input type="tel" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))}
                className="input py-2 text-sm" placeholder="06 12 34 56 78" />
            </div>
            <div>
              <label className="label text-xs">Motif / précisions</label>
              <textarea value={form.note} onChange={e => setForm(f => ({...f, note: e.target.value}))}
                className="input py-2 text-sm resize-none" rows={2} placeholder="Recommandé…" />
            </div>

            <button
              type="submit"
              disabled={submitting || !canSubmit}
              className="btn-primary w-full text-sm py-3 flex items-center justify-center gap-2"
            >
              {submitting
                ? <><Loader2 className="w-4 h-4 animate-spin" />Envoi…</>
                : <><CheckCircle2 className="w-4 h-4" />Confirmer le rendez-vous</>
              }
            </button>
          </div>
        )}

      </form>
    </div>
  )
}
