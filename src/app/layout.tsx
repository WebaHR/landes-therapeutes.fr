// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'landes-therapeutes.fr — Annuaire des praticiens bien-être',
  description: 'Trouvez les meilleurs praticiens près de chez vous. Avis vérifiés, coordonnées, horaires.',
  keywords: 'annuaire praticien, artisans locaux, praticiens, avis, proximité',
  openGraph: {
    title: 'landes-therapeutes.fr — Annuaire des praticiens bien-être',
    description: 'Trouvez les meilleurs praticiens près de chez vous.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="bg-surface-50 text-gray-900 antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: { fontFamily: 'Inter, sans-serif', borderRadius: '12px' },
            success: { iconTheme: { primary: '#3f8a73', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  )
}
