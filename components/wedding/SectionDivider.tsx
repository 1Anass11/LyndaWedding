'use client'

import { motion } from 'framer-motion'

interface SectionDividerProps {
  ornament?: 'star' | 'floral'
}

export function SectionDivider({ ornament = 'star' }: SectionDividerProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="flex items-center justify-center py-6 bg-ivory"
    >
      <span className="h-px bg-sage-dark/40 w-16 md:w-24" />
      {ornament === 'floral' ? (
        <img
          src="/samar/dome/floral-divider-ehlxSds1.png"
          alt=""
          className="mx-4 h-6 md:h-8 w-auto object-contain"
        />
      ) : (
        <span className="mx-4 text-sage-dark/50 text-sm">✦</span>
      )}
      <span className="h-px bg-sage-dark/40 w-16 md:w-24" />
    </motion.div>
  )
}
