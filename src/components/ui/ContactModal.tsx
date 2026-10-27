'use client'
// src/components/ui/ContactModal.tsx
import { useState } from 'react'
import { X, Send, Loader2, Mail } from 'lucide-react'

interface Props {
  proName: string
  proEmail: string | null
}

export default function ContactModal({ proName, proEmail }: Props) {
  const [open, setOpen]       = useState(false)
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent]       = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!proEmail) return
    setSending(true)
    // Ouvre le client mail par défaut avec les infos pré-remplies
    const subject = encodeURIComponent(`Question via landes-therapeutes.fr — ${name}`)
    const body = encodeURIComponent(
      `Bonjour,\n\nJe vous contacte via l'annuaire landes-therapeutes.fr.\n\n${message}\n\nCordialement,\n${name}\n${email}`
    )
    window.location.href = `mailto:${proEmail}?subject=${subject}&body=${body}`
    setSent(true)
    setSending(false)
    setTimeout(() => { setOpen(false); setSent(false); setName(''); setEmail(''); setMessage('') }, 2000)
  }

  return (
    <>
      {/* Bouton déclencheur */}
      <button
        onClick={() => setOpen(true)}
        className="flex-1 flex items-center justify-center gap-2 border-2 border-brand-500 text-brand-700 hover:bg-brand-50 font-semibold py-3 px-4 rounded-xl transition-all text-sm"
      >
        <Mail className="w-4 h-4" />
        Poser une question
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          {/* Boîte */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                <Mail className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Poser une question</h3>
                <p className="text-xs text-gray-400">à {proName}</p>
              </div>
            </div>

            {sent ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-3">✅</div>
                <p className="font-semibold text-gray-700">Votre client mail s&apos;ouvre…</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Votre nom *</label>
                  <input value={name} onChange={e => setName(e.target.value)}
                    className="input" placeholder="Marie Dupont" required />
                </div>
                <div>
                  <label className="label">Votre email *</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="input" placeholder="marie@email.fr" required />
                </div>
                <div>
                  <label className="label">Votre question *</label>
                  <textarea value={message} onChange={e => setMessage(e.target.value)}
                    className="input min-h-[100px] resize-none" rows={4}
                    placeholder="Bonjour, je souhaite…" required />
                </div>
                <button type="submit" disabled={sending}
                  className="btn-primary w-full flex items-center justify-center gap-2">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Envoyer la question
                </button>
                <p className="text-xs text-center text-gray-400">
                  Votre client mail s&apos;ouvrira avec le message pré-rempli.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
