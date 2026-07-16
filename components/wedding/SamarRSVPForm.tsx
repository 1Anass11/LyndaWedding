'use client'

import { useState, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'

interface SamarRSVPFormProps {
  slug: string
  name1: string
  name2: string
}

interface FormState {
  full_name: string
  email: string
  attendance: 'yes' | 'no'
  guest_count: number
  diet: string
  transportation_needed: boolean
  accommodation_needed: boolean
  message: string
}

const INITIAL_STATE: FormState = {
  full_name: '',
  email: '',
  attendance: 'yes',
  guest_count: 1,
  diet: '',
  transportation_needed: false,
  accommodation_needed: false,
  message: '',
}

export function SamarRSVPForm({ slug, name1, name2 }: SamarRSVPFormProps) {
  const [form, setForm] = useState<FormState>(INITIAL_STATE)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.full_name.trim()) {
      setError('Veuillez entrer votre nom')
      return
    }
    setError(null)
    setSubmitting(true)

    const notes = [
      form.message.trim(),
      form.transportation_needed ? '[Transport nécessaire]' : '',
      form.accommodation_needed ? '[Hébergement nécessaire]' : '',
    ]
      .filter(Boolean)
      .join(' ')

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitationSlug: slug,
          guestName: form.full_name.trim(),
          attending: form.attendance === 'yes',
          partySize: form.attendance === 'yes' ? form.guest_count : 1,
          notes: notes || undefined,
          dietary: form.diet || undefined,
          email: form.email.trim() || undefined,
        }),
      })
      if (!res.ok) throw new Error('Failed to submit')
      setSubmitted(true)
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <section id="rsvp" className="min-h-[70vh] bg-ivory flex items-center justify-center relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="w-full flex flex-col items-center justify-center px-6 py-20"
        >
          {form.attendance === 'yes' ? (
            <>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="font-script text-5xl md:text-6xl text-foreground mb-8 text-center"
              >
                Merci d&apos;avoir confirmé !
              </motion.h2>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="space-y-4 max-w-2xl text-center"
              >
                <p className="text-foreground/90 font-body text-lg md:text-xl leading-relaxed">
                  Nous sommes ravis de savoir que vous serez des nôtres pour ce jour si spécial.
                </p>
                <p className="text-foreground/90 font-body text-lg md:text-xl leading-relaxed">
                  Merci de faire partie de notre histoire.
                </p>
              </motion.div>
            </>
          ) : (
            <>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="font-script text-5xl md:text-6xl text-foreground mb-6 text-center"
              >
                Merci
              </motion.h2>
              <p className="text-muted-foreground font-body text-lg leading-relaxed text-center max-w-lg">
                Nous sommes désolés que vous ne puissiez pas être présents. Vous serez dans nos pensées en ce jour si spécial.
              </p>
              <p className="text-muted-foreground font-script text-3xl mt-8">
                — {name1} &amp; {name2}
              </p>
            </>
          )}
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
          className="absolute -left-8 top-[-28px] w-36 md:w-44 pointer-events-none z-20"
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="font-script text-5xl md:text-6xl text-foreground mb-2">Rsvp</h2>
          <p className="text-muted-foreground font-body tracking-wide">
            Nous espérons que vous pourrez vous joindre à nous
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
            <Label htmlFor="full_name" className="font-body text-foreground">
              Votre nom <span className="text-destructive">*</span>
            </Label>
            <Input
              id="full_name"
              placeholder="Nom complet"
              maxLength={100}
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="font-body text-foreground">Préférence alimentaire</Label>
            <RadioGroup
              value={form.diet}
              onValueChange={(v) => setForm({ ...form, diet: v })}
              className="flex gap-6"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="Végétarien" id="diet-veg" />
                <Label htmlFor="diet-veg" className="font-body cursor-pointer">Végétarien</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="Non-végétarien" id="diet-nonveg" />
                <Label htmlFor="diet-nonveg" className="font-body cursor-pointer">Non-végétarien</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="font-body text-foreground">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="votre@email.com"
              maxLength={255}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="space-y-3">
            <Label className="font-body text-foreground">Serez-vous présent(e) ?</Label>
            <RadioGroup
              value={form.attendance}
              onValueChange={(v) => setForm({ ...form, attendance: v as 'yes' | 'no' })}
              className="flex gap-6"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="yes" id="att-yes" />
                <Label htmlFor="att-yes" className="font-body cursor-pointer">J&apos;accepte avec joie</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="no" id="att-no" />
                <Label htmlFor="att-no" className="font-body cursor-pointer">Je décline à regret</Label>
              </div>
            </RadioGroup>
          </div>

          <AnimatePresence initial={false}>
            {form.attendance === 'yes' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6 overflow-hidden"
              >
                <div className="space-y-2">
                  <Label htmlFor="guest_count" className="font-body text-foreground">
                    Nombre d&apos;invités
                  </Label>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full border-primary/40 text-foreground hover:bg-primary hover:text-primary-foreground"
                      onClick={() =>
                        setForm((f) => ({ ...f, guest_count: Math.max(1, f.guest_count - 1) }))
                      }
                      disabled={form.guest_count <= 1}
                    >
                      −
                    </Button>
                    <span className="font-display text-xl text-foreground w-8 text-center">
                      {form.guest_count}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full border-primary/40 text-foreground hover:bg-primary hover:text-primary-foreground"
                      onClick={() =>
                        setForm((f) => ({ ...f, guest_count: Math.min(10, f.guest_count + 1) }))
                      }
                      disabled={form.guest_count >= 10}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="flex items-center gap-3 p-3 border border-border rounded-md cursor-pointer hover:bg-secondary/30 transition-colors">
                    <Checkbox
                      checked={form.transportation_needed}
                      onCheckedChange={(c) => setForm({ ...form, transportation_needed: c })}
                    />
                    <span className="font-body text-sm text-foreground">Transport nécessaire</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-border rounded-md cursor-pointer hover:bg-secondary/30 transition-colors">
                    <Checkbox
                      checked={form.accommodation_needed}
                      onCheckedChange={(c) => setForm({ ...form, accommodation_needed: c })}
                    />
                    <span className="font-body text-sm text-foreground">Hébergement nécessaire</span>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <Label htmlFor="message" className="font-body text-foreground">
              Message pour les mariés
            </Label>
            <Textarea
              id="message"
              placeholder="Partagez vos vœux..."
              maxLength={500}
              rows={3}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>

          {error && <p className="text-destructive text-sm font-body">{error}</p>}

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-6 text-base"
          >
            {submitting ? 'Envoi en cours...' : 'Envoyer ma réponse'}
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
