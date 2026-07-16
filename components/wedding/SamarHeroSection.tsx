'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

interface SamarHeroSectionProps {
  name1: string
  name2: string
  date: string
  subtitle?: string
  videos?: string[]
}

function formatDate(raw: string): string {
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    return new Date(raw + 'T12:00:00').toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }
  return raw
}

export function SamarHeroSection({ name1, name2, date, subtitle, videos }: SamarHeroSectionProps) {
  const formattedDate = formatDate(date)
  const playlist = videos && videos.length > 0 ? videos : []
  // Two stacked video elements cross-fade on transition instead of remounting
  // a single element, which avoids a blank/grey flash while the next clip loads.
  const [activeSlot, setActiveSlot] = useState<0 | 1>(0)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [slotSrc, setSlotSrc] = useState<[string | undefined, string | undefined]>([
    playlist[0],
    playlist[1],
  ])
  const videoRefs = [useRef<HTMLVideoElement>(null), useRef<HTMLVideoElement>(null)]

  const scrollToRSVP = () => {
    document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleVideoEnded = () => {
    if (playlist.length <= 1) return
    const nextIndex = (currentIndex + 1) % playlist.length
    const idleSlot = activeSlot === 0 ? 1 : 0
    setSlotSrc((prev) => {
      const next: [string | undefined, string | undefined] = [...prev]
      next[idleSlot] = playlist[nextIndex]
      return next
    })
    setCurrentIndex(nextIndex)
    setActiveSlot(idleSlot)
    const el = videoRefs[idleSlot].current
    if (el) {
      el.currentTime = 0
      el.play().catch(() => {})
    }
  }

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-ivory">
      {/* Full-bleed background video, cross-fading between clips */}
      <div className="absolute inset-0">
        {playlist.length > 0 ? (
          [0, 1].map((slot) => (
            <video
              key={slot}
              ref={videoRefs[slot]}
              src={slotSrc[slot]}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out"
              style={{ opacity: activeSlot === slot ? 1 : 0 }}
              autoPlay={slot === 0}
              loop={playlist.length === 1}
              onEnded={slot === activeSlot && playlist.length > 1 ? handleVideoEnded : undefined}
              muted
              playsInline
            />
          ))
        ) : (
          <div className="w-full h-full bg-sage" />
        )}
      </div>

      {/* Ornate gold oval frame overlay, from the doMe reference template */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <img src="/samar/dome/hero-oval-DFMa000H.png" alt="" className="w-[85%] max-w-md h-auto" />
      </div>

      <div className="relative z-20 text-center px-6 max-w-sm mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="font-script text-3xl md:text-4xl text-foreground mb-6"
        >
          {subtitle || 'Nous nous marions'}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mb-6"
        >
          <span className="font-display text-3xl md:text-5xl tracking-[0.15em] uppercase text-foreground block">
            {name1}
          </span>
          <span className="font-script text-2xl md:text-3xl text-foreground/80 italic block my-1">
            &amp;
          </span>
          <span className="font-display text-3xl md:text-5xl tracking-[0.15em] uppercase text-foreground block">
            {name2}
          </span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex items-center justify-center gap-4 mb-6"
        >
          <span className="h-px bg-foreground/30 w-12 md:w-16" />
          <span className="text-foreground/60 text-base">✦</span>
          <span className="h-px bg-foreground/30 w-12 md:w-16" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="font-display text-lg md:text-xl tracking-wider text-foreground/80 italic"
        >
          {formattedDate}
        </motion.p>
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.3 }}
        onClick={scrollToRSVP}
        className="absolute bottom-8 inset-x-0 z-20 flex flex-col items-center gap-2 text-center text-foreground/60 hover:text-primary transition-colors cursor-pointer"
      >
        <span className="text-xs tracking-[0.3em] uppercase font-body">
          Votre présence rendra ce jour plus spécial ❤️
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.button>
    </section>
  )
}
