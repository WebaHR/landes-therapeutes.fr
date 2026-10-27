'use client'
// src/components/landing/SpecialtySlider.tsx
import { useEffect, useState } from 'react'

const SPECIALTIES = [
  'naturopathe',
  'sophrologue',
  'réflexologue',
  'ostéopathe',
  'acupuncteur',
  'hypnothérapeute',
  'coach de vie',
  'praticien Reiki',
  'aromathérapeute',
  'kinésiologue',
  'nutritionniste',
  'professeur de yoga',
  'art-thérapeute',
  'homéopathe',
  'musicothérapeute',
]

export default function SpecialtySlider() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      setVisible(false)
      setTimeout(() => {
        setIndex(i => (i + 1) % SPECIALTIES.length)
        // Fade + slide in
        setVisible(true)
      }, 350)
    }, 2400)
    return () => clearInterval(interval)
  }, [])

  return (
    <span
      className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-accent-400 transition-all duration-350"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
        minWidth: '14ch',
        display: 'inline-block',
      }}
    >
      {SPECIALTIES[index]}
    </span>
  )
}
