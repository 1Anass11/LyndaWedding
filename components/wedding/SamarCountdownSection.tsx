'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface SamarCountdownSectionProps {
  targetDate: string
  countdownTargetISO?: string | null
  isArabic?: boolean
  /** Distinguishing label shown above the countdown, e.g. the event name when a page has more than one (wedding day vs. Outiya). */
  eventName?: string
  /** DOM id for the section wrapper; defaults to "countdown". Pass a unique value when rendering more than one instance on the same page. */
  id?: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

const LABELS = [
  { key: 'days', label: 'Jours', labelAr: 'أيام' },
  { key: 'hours', label: 'Heures', labelAr: 'ساعات' },
  { key: 'minutes', label: 'Minutes', labelAr: 'دقائق' },
  { key: 'seconds', label: 'Secondes', labelAr: 'ثواني' },
] as const

export function SamarCountdownSection({
  targetDate,
  countdownTargetISO,
  isArabic,
  eventName,
  id = 'countdown',
}: SamarCountdownSectionProps) {
  const normalizedDate = /^\d{4}-\d{2}-\d{2}/.test(targetDate) ? targetDate : '2026-04-09'

  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0, hours: 0, minutes: 0, seconds: 0,
  })

  useEffect(() => {
    const calculate = () => {
      const target = countdownTargetISO
        ? new Date(countdownTargetISO)
        : (() => {
            const t = normalizedDate.includes('T')
              ? new Date(normalizedDate)
              : new Date(`${normalizedDate}T12:00:00`)
            if (Number.isNaN(t.getTime())) return null
            t.setHours(18, 0, 0, 0)
            return t
          })()

      if (!target || Number.isNaN(target.getTime())) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      const diff = target.getTime() - Date.now()

      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / 86400000),
          hours: Math.floor((diff / 3600000) % 24),
          minutes: Math.floor((diff / 60000) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    calculate()
    const interval = setInterval(calculate, 1000)
    return () => clearInterval(interval)
  }, [normalizedDate, countdownTargetISO])

  return (
    <section id={id} className="section-padding bg-background relative">
      <img
        src="/samar/dome/floral-small-CunO5Md5.png"
        alt=""
        className={`absolute top-4 w-20 md:w-28 pointer-events-none z-10${isArabic ? ' right-4' : ' left-4'}`}
      />
      <div className="max-w-4xl mx-auto text-center">
        {eventName && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-display text-xl md:text-2xl text-foreground mb-1 italic"
          >
            {eventName}
          </motion.p>
        )}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={`text-primary text-xs md:text-sm font-body mb-4${isArabic ? '' : ' tracking-[0.4em] uppercase'}`}
        >
          {isArabic ? 'العد التنازلي' : 'Compte à rebours'}
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-script text-5xl md:text-6xl text-foreground mb-16"
        >
          {isArabic ? 'حتى يومنا الكبير' : "Jusqu'au grand jour"}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-4 gap-2 md:gap-8 max-w-2xl mx-auto"
        >
          {LABELS.map((item, i) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-soft w-full">
                <span className="block font-display text-3xl md:text-5xl lg:text-6xl font-normal text-foreground tracking-tight tabular-nums">
                  {String(timeLeft[item.key]).padStart(2, '0')}
                </span>
              </div>
              <span
                className={`block mt-3 text-[9px] md:text-[10px] text-muted-foreground font-body${isArabic ? '' : ' tracking-[0.2em] uppercase'}`}
              >
                {isArabic ? item.labelAr : item.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
