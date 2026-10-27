'use client'
// src/components/map/MapView.tsx
import { useEffect, useRef, useState } from 'react'
import type { Professional } from '@/types'
import { useHover } from '@/components/landing/HoverContext'

interface MapViewProps {
  professionals: Professional[]
  center?: [number, number]
  zoom?: number
}

const ICON_NORMAL = {
  html: `<div style="position:relative;width:32px;height:32px">
    <div style="width:32px;height:32px;background:linear-gradient(135deg,#3f8a73,#2e6f5c);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25)"></div>
  </div>`,
  size: [32, 32] as [number, number],
  anchor: [16, 32] as [number, number],
}

const ICON_ACTIVE = {
  html: `<div style="position:relative;width:40px;height:40px">
    <div style="width:40px;height:40px;background:linear-gradient(135deg,#3f8a73,#2e6f5c);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 4px 14px rgba(63,138,115,0.5)"></div>
    <div style="position:absolute;top:50%;left:50%;transform:translate(-60%,-30%);width:10px;height:10px;background:#f97316;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>
  </div>`,
  size: [40, 40] as [number, number],
  anchor: [20, 40] as [number, number],
}

export default function MapView({
  professionals,
  center = [46.603354, 1.888334],
  zoom = 6,
}: MapViewProps) {
  const mapRef          = useRef<HTMLDivElement>(null)
  const mapInstanceRef  = useRef<unknown>(null)
  const markersRef      = useRef<Record<string, unknown>>({})
  const leafletRef      = useRef<unknown>(null)
  const isReadyRef      = useRef(false)        // vraie garde : carte prête et non détruite
  const [mounted, setMounted] = useState(false)
  const { hoveredId } = useHover()

  // ── Init carte ──
  useEffect(() => {
    setMounted(true)
    if (!mapRef.current) return

    let cancelled = false

    const initMap = async () => {
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')
      if (cancelled || !mapRef.current) return

      // Détruire proprement l'ancienne instance
      isReadyRef.current = false
      if (mapInstanceRef.current) {
        try { (mapInstanceRef.current as { remove(): void }).remove() } catch (_) {}
        mapInstanceRef.current = null
      }
      markersRef.current = {}

      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!, { center, zoom, zoomControl: true, fadeAnimation: false, zoomAnimation: false })
      mapInstanceRef.current = map
      leafletRef.current = L

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap',
      }).addTo(map)

      professionals.forEach(pro => {
        if (!pro.latitude || !pro.longitude) return

        const icon = L.divIcon({
          className: '',
          html: ICON_NORMAL.html,
          iconSize:   ICON_NORMAL.size,
          iconAnchor: ICON_NORMAL.anchor,
          popupAnchor:[0, -40],
        })

        const popup = L.popup({ maxWidth: 260 }).setContent(`
          <div style="font-family:Inter,sans-serif;padding:4px">
            <div style="font-weight:700;font-size:14px;color:#1e293b;margin-bottom:4px">${pro.companyName}</div>
            <div style="font-size:12px;color:#2e6f5c;font-weight:600;margin-bottom:6px">${pro.category}</div>
            ${pro.address ? `<div style="font-size:12px;color:#64748b">${pro.address}, ${pro.city}</div>` : `<div style="font-size:12px;color:#64748b">${pro.city}</div>`}
            ${pro.phone ? `<div style="font-size:12px;color:#64748b;margin-top:2px">📞 ${pro.phone}</div>` : ''}
            ${pro.googleRating ? `<div style="font-size:12px;color:#f59e0b;margin-top:4px">⭐ ${pro.googleRating} (${pro.googleReviews || 0} avis)</div>` : ''}
            <a href="/profil/${pro.id}" style="display:block;margin-top:8px;background:#2ea86d;color:white;text-align:center;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:600;text-decoration:none">Voir la fiche →</a>
          </div>
        `)

        const marker = L.marker([pro.latitude, pro.longitude], { icon })
          .bindPopup(popup)
          .addTo(map)

        markersRef.current[pro.id] = marker
      })

      const withCoords = professionals.filter(p => p.latitude && p.longitude)
      if (withCoords.length > 1) {
        const bounds = L.latLngBounds(withCoords.map(p => [p.latitude!, p.longitude!]))
        map.fitBounds(bounds, { padding: [30, 30], animate: false })
      }

      // Carte prête — autoriser les mises à jour d'icônes
      isReadyRef.current = true
    }

    initMap()

    return () => {
      cancelled = true
      isReadyRef.current = false
      markersRef.current = {}
      if (mapInstanceRef.current) {
        try { (mapInstanceRef.current as { remove(): void }).remove() } catch (_) {}
        mapInstanceRef.current = null
      }
      leafletRef.current = null
    }
  }, [professionals, center, zoom])

  // ── Survol : changer l'icône du marqueur concerné ──
  useEffect(() => {
    // Garde stricte : ne rien faire si carte non prête
    if (!isReadyRef.current || !leafletRef.current) return

    const L = leafletRef.current as {
      divIcon: (opts: {
        className: string
        html: string
        iconSize: [number, number]
        iconAnchor: [number, number]
        popupAnchor: [number, number]
      }) => unknown
    }

    Object.entries(markersRef.current).forEach(([proId, marker]) => {
      // Vérifier que le marqueur est encore attaché à une carte valide
      const m = marker as {
        setIcon: (icon: unknown) => void
        _map?: unknown
      }
      if (!m._map) return   // marqueur détaché — on ne touche à rien

      const active = proId === hoveredId
      const cfg = active ? ICON_ACTIVE : ICON_NORMAL

      try {
        m.setIcon(L.divIcon({
          className: '',
          html: cfg.html,
          iconSize:   cfg.size,
          iconAnchor: cfg.anchor,
          popupAnchor:[0, -40],
        }))
      } catch (_) {
        // Ignorer silencieusement si Leaflet est en cours de démontage
      }
    })
  }, [hoveredId])

  if (!mounted) {
    return (
      <div className="h-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-400 text-sm">
        Chargement de la carte…
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full" />
      {professionals.filter(p => !p.latitude).length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 text-xs text-gray-500 shadow-md z-10">
          {professionals.filter(p => !p.latitude).length} praticien(s) sans coordonnées GPS
        </div>
      )}
    </div>
  )
}
