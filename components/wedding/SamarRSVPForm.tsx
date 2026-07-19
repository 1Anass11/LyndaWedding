'use client'

import { useState, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface SamarRSVPFormProps {
  slug: string
  name1: string
  name2: string
  isArabic?: boolean
}

export function SamarRSVPForm({ slug, name1, name2, isArabic }: SamarRSVPFormProps) {
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!message.trim()) {
      setError(isArabic ? 'يرجى كتابة رسالة' : 'Veuillez écrire un message')
      return
    }
    setError(null)
    setSubmitting(true)

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitationSlug: slug,
          guestName: isArabic ? 'ضيف' : 'Invité',
          attending: true,
          partySize: 1,
          notes: message.trim(),
        }),
      })
      if (!res.ok) throw new Error('Failed to submit')
      setSubmitted(true)
    } catch {
      setError(
        isArabic
          ? 'حدث خطأ. يرجى المحاولة مرة أخرى.'
          : 'Une erreur est survenue. Veuillez réessayer.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <section id="rsvp" className="min-h-[50vh] bg-ivory flex items-center justify-center relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="w-full flex flex-col items-center justify-center px-6 py-20"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="font-script text-5xl md:text-6xl text-foreground mb-8 text-center"
          >
            {isArabic ? 'شكراً لرسالتكم!' : 'Merci pour votre message !'}
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="space-y-4 max-w-2xl text-center"
          >
            <p className="text-foreground/90 font-body text-lg md:text-xl leading-relaxed">
              {isArabic ? 'شكراً لكونكم جزءاً من قصتنا.' : 'Merci de faire partie de notre histoire.'}
            </p>
            <p className="text-muted-foreground font-script text-3xl mt-8">
              — {name1} {isArabic ? 'و' : '&'} {name2}
            </p>
          </motion.div>
        </motion.div>
      </section>
    )
  }

  return (
    <section id="rsvp" className="pt-6 pb-16 px-6 md:px-8 bg-ivory relative z-20">
      <div className="max-w-xl mx-auto bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-elegant p-8 md:p-12 relative">
        <img
          src="/samar/dome/floral-corner-1sG0Ij__.png"
          alt=""
          className={`absolute top-[-28px] w-36 md:w-44 pointer-events-none z-20${isArabic ? ' -right-8' : ' -left-8'}`}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="font-script text-5xl md:text-6xl text-foreground mb-2">
            {isArabic ? 'رسالة للعروسين' : 'Message pour les mariés'}
          </h2>
          <p className={`text-muted-foreground font-body${isArabic ? '' : ' tracking-wide'}`}>
            {isArabic ? 'نتمنى أن تتمكنوا من الانضمام إلينا' : 'Nous espérons que vous pourrez vous joindre à nous'}
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          <div className="space-y-2">
            <Label htmlFor="message" className="font-body text-foreground">
              {isArabic ? 'رسالة للعروسين' : 'Message pour les mariés'}
            </Label>
            <Textarea
              id="message"
              placeholder={isArabic ? 'شاركونا تمنياتكم...' : 'Partagez vos vœux...'}
              maxLength={500}
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {error && <p className="text-destructive text-sm font-body">{error}</p>}

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-6 text-base"
          >
            {isArabic
              ? submitting
                ? 'جارٍ الإرسال...'
                : 'إرسال الرد'
              : submitting
                ? 'Envoi en cours...'
                : 'Envoyer ma réponse'}
          </Button>
          <img
            src="/samar/dome/rsvp-envelope-DVJBnBnU.png"
            alt=""
            className="w-32 md:w-40 mx-auto mt-20 mb-6 object-contain opacity-80"
          />
        </motion.form>
      </div>
    </section>
  )
}
