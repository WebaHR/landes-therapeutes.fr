'use client'
// src/components/landing/AnnuaireLayout.tsx
import dynamic from 'next/dynamic'
import type { Professional } from '@/types'
import { MapPin } from 'lucide-react'
import { HoverProvider } from './HoverContext'

const MapView = dynamic(() => import('@/components/map/MapView'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-surface-50 flex items-center justify-center text-gray-400 text-sm">
      Chargement de la carte…
    </div>
  ),
})

interface Props {
  pros: Professional[]
  children: React.ReactNode
}

export default function AnnuaireLayout({ pros, children }: Props) {
  const withCoords = pros.filter(p => p.latitude && p.longitude)

  return (
    <HoverProvider>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>

        {/* Colonne gauche */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {children}
        </div>

        {/* Colonne droite — sticky */}
        <div
          className="hidden lg:flex flex-col flex-shrink-0"
          style={{
            width: '480px',
            position: 'sticky',
            top: '136px',
            maxHeight: 'calc(100vh - 148px)',
            alignSelf: 'flex-start',
          }}
        >
          <div className="card overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 148px)' }}>
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-white flex-shrink-0">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-500" />
                <span className="text-sm font-semibold text-gray-800">
                  {withCoords.length} praticien{withCoords.length !== 1 ? 's' : ''} sur la carte
                </span>
              </div>
              {pros.length - withCoords.length > 0 && (
                <span className="text-xs text-gray-400">
                  {pros.length - withCoords.length} sans GPS
                </span>
              )}
            </div>
            <div className="flex-1 min-h-0">
              <MapView professionals={pros} />
            </div>
          </div>
        </div>

      </div>
    </HoverProvider>
  )
}
