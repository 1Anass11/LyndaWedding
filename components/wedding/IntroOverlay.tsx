'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'

interface IntroOverlayProps {
  onEnter: () => void
  onInteraction?: () => void
  posterSrc?: string
  /** undefined = use default Lynda opening video; null = no video, cover image only; string = custom video */
  videoSrc?: string | null
}

export function IntroOverlay({
  onEnter,
  onInteraction,
  posterSrc = '/assets/intro1.png',
  videoSrc: videoSrcProp,
}: IntroOverlayProps) {
  const videoSrc = videoSrcProp === undefined ? '/assets/Video_Edit.mp4' : videoSrcProp
  const [phase, setPhase] = useState<'idle' | 'playing' | 'fading'>('idle')
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleClick = () => {
    if (phase !== 'idle') return
    onInteraction?.()

    if (!videoSrc) {
      // Static cover only (no opening video) - fade straight into the invitation.
      setPhase('fading')
      setTimeout(() => onEnter(), 1200)
      return
    }

    const video = videoRef.current
    if (video) {
      video.playbackRate = 0.85
      video.play()
    }
    setPhase('playing')
  }

  const handleTimeUpdate = () => {
    const video = videoRef.current
    if (!video) return
    if (video.duration - video.currentTime <= 1.2 && phase === 'playing') {
      setPhase('fading')
      setTimeout(() => onEnter(), 1200)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 cursor-pointer"
      onClick={handleClick}
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === 'fading' ? 0 : 1 }}
      transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
      style={{ backgroundColor: '#f5f0e8' }}
    >
      {videoSrc ? (
        <video
          ref={videoRef}
          poster={posterSrc}
          className="w-full h-full object-cover"
          onTimeUpdate={handleTimeUpdate}
          playsInline
          muted
          preload="auto"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : (
        <img src={posterSrc} alt="" className="w-full h-full object-cover" />
      )}
    </motion.div>
  )
}
