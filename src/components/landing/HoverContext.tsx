'use client'
// src/components/landing/HoverContext.tsx
// Contexte partagé entre la liste et la carte pour synchroniser le survol
import { createContext, useContext, useState } from 'react'

interface HoverContextType {
  hoveredId: string | null
  setHoveredId: (id: string | null) => void
}

const HoverContext = createContext<HoverContextType>({
  hoveredId: null,
  setHoveredId: () => {},
})

export function HoverProvider({ children }: { children: React.ReactNode }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  return (
    <HoverContext.Provider value={{ hoveredId, setHoveredId }}>
      {children}
    </HoverContext.Provider>
  )
}

export function useHover() {
  return useContext(HoverContext)
}
