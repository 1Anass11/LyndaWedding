'use client'

import { Volume2, VolumeX } from 'lucide-react'

interface MuteButtonProps {
  muted: boolean
  onToggle: () => void
  isArabic?: boolean
}

export function MuteButton({ muted, onToggle, isArabic }: MuteButtonProps) {
  return (
    <button
      onClick={onToggle}
      className={`fixed bottom-6 z-50 p-3 rounded-full bg-primary/90 text-primary-foreground shadow-lg hover:bg-primary transition-all duration-300 backdrop-blur-sm${isArabic ? ' left-6' : ' right-6'}`}
      aria-label={
        isArabic ? (muted ? 'تشغيل الصوت' : 'كتم الصوت') : muted ? 'Activer le son' : 'Couper le son'
      }
    >
      {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
    </button>
  )
}
