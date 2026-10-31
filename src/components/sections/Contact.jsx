import { useEffect, useRef, useState } from 'react'
import emailjs from '@emailjs/browser'
import Swal from 'sweetalert2'
import { Loader2, Mail, Send } from 'lucide-react'
import { FaGithub, FaLinkedin } from 'react-icons/fa'
import { useTranslation } from '../../i18n/LanguageProvider.jsx'
import { EMAILJS_CONFIG, isEmailJsConfigured } from '../../config/emailjs.js'
import SectionShell from '../ui/SectionShell.jsx'
import Reveal from '../ui/Reveal.jsx'
import ButtonLink from '../ui/ButtonLink.jsx'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Alerta con la paleta del sitio, para no romper la coherencia visual. */
const alertBase = {
  background: '#120f21',
  color: '#f1eefb',
  confirmButtonColor: '#8b5cf6',
  confirmButtonText: 'OK',
}

export default function Contact() {
  const { t } = useTranslation()
  const form = t.contact.form

  const [open, setOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [values, setValues] = useState({ name: '', email: '', message: '' })
  const dialogRef = useRef(null)

  // Un diálogo debe poder cerrarse con Escape y llevar el foco dentro al abrirse.
  useEffect(() => {
    if (!open) return

    dialogRef.current?.querySelector('input, textarea, button')?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  const update = (field) => (event) =>
    setValues((current) => ({ ...current, [field]: event.target.value }))

  const reset = () => setValues({ name: '', email: '', message: '' })

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!values.name.trim() || !values.email.trim() || !values.message.trim()) {
      Swal.fire({ ...alertBase, icon: 'error', title: form.validationEmpty })
      return
    }

    if (!EMAIL_PATTERN.test(values.email)) {
      Swal.fire({ ...alertBase, icon: 'error', title: form.validationEmail })
      return
    }

    if (!isEmailJsConfigured) {
      Swal.fire({ ...alertBase, icon: 'error', title: form.errorTitle, text: form.errorText })
      return
    }

    setSending(true)

    try {
      await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        {
          to: values.name,
          email: values.email,
          message: values.message,
          // Compatibilidad con la plantilla original, que esperaba "to".
          from_name: values.name,
          reply_to: values.email,
        },
        { publicKey: EMAILJS_CONFIG.publicKey },
      )

      setOpen(false)
      reset()
      await Swal.fire({ ...alertBase, icon: 'success', title: form.successTitle, text: form.successText })
    } catch {
      Swal.fire({ ...alertBase, icon: 'error', title: form.errorTitle, text: form.errorText })
    } finally {
      setSending(false)
    }
  }

  const channels = [
    { id: 'email', href: `mailto:${t.contact.email}`, label: t.contact.emailLabel, value: t.contact.email, Icon: Mail },
    { id: 'linkedin', href: t.contact.linkedin, label: t.contact.linkedinLabel, value: 'in/diana-valentina-moreno', Icon: FaLinkedin },
    { id: 'github', href: t.contact.github, label: t.contact.githubLabel, value: 'valemorenodev', Icon: FaGithub },
  ]

  return (
    <SectionShell
      id="contacto"
      eyebrow={t.contact.eyebrow}
      title={t.contact.title}
      subtitle={t.contact.subtitle}
      align="center"
      headingClassName="mx-auto"
      className="border-t border-line/60"
    >
      <div className="mx-auto mt-12 max-w-4xl">
        <Reveal>
          <p className="mx-auto flex w-fit items-center gap-2 rounded-full border border-violet/30 bg-violet/8 px-4 py-2 text-xs text-violet">
            <span className="size-2 rounded-full bg-violet animate-pulse-glow" aria-hidden="true" />
            {t.contact.availability}
          </p>
        </Reveal>

        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {channels.map((channel, index) => (
            <Reveal as="li" key={channel.id} delay={0.06 * index} className="h-full">
              <a
                href={channel.href}
                {...(channel.id !== 'email' ? { target: '_blank', rel: 'noopener noreferrer' } : null)}
                className="surface-card group flex h-full flex-col gap-3 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-violet/35"
              >
                <span className="grid size-10 place-items-center rounded-xl border border-violet/25 bg-violet/8 text-violet">
                  <channel.Icon aria-hidden="true" className="size-4" />
                </span>
                <span className="font-mono text-[0.68rem] tracking-wider text-ink-dim uppercase">
                  {channel.label}
                </span>
                <span className="text-sm break-all text-ink-soft transition-colors group-hover:text-ink">
                  {channel.value}
                </span>
              </a>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <ButtonLink size="lg" href={undefined} onClick={() => setOpen(true)}>
              <Send aria-hidden="true" className="size-4" />
              {form.open}
            </ButtonLink>

            {/* El CV solo aparece cuando hay un archivo real: un botón que no
                descarga nada es peor que no tenerlo. */}
            {t.contact.cvHref && (
              <ButtonLink variant="secondary" size="lg" href={t.contact.cvHref}>
                {t.contact.cvLabel}
              </ButtonLink>
            )}
          </div>
        </Reveal>
      </div>

      {/* --- Diálogo de contacto --- */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-dialog-title"
          className="fixed inset-0 z-60 grid place-items-center overflow-y-auto bg-void/80 p-4 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget && !sending) setOpen(false)
          }}
        >
          <div
            ref={dialogRef}
            className="surface-card my-8 w-full max-w-lg p-6 sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 id="contact-dialog-title" className="font-display text-xl text-ink">
                {form.title}
              </h3>
              <button
                type="button"
                onClick={() => !sending && setOpen(false)}
                className="rounded-full border border-line px-3 py-1.5 font-mono text-xs text-ink-dim transition-colors hover:text-ink"
              >
                {form.cancel}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="contact-name" className="font-mono text-[0.68rem] tracking-wider text-ink-dim uppercase">
                  {form.name}
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={values.name}
                  onChange={update('name')}
                  placeholder={form.namePlaceholder}
                  className="mt-2 w-full rounded-xl border border-line bg-surface/80 px-4 py-3 text-sm text-ink placeholder:text-ink-dim/70 focus:border-violet/50 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="contact-email" className="font-mono text-[0.68rem] tracking-wider text-ink-dim uppercase">
                  {form.email}
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={values.email}
                  onChange={update('email')}
                  placeholder={form.emailPlaceholder}
                  className="mt-2 w-full rounded-xl border border-line bg-surface/80 px-4 py-3 text-sm text-ink placeholder:text-ink-dim/70 focus:border-violet/50 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="contact-message" className="font-mono text-[0.68rem] tracking-wider text-ink-dim uppercase">
                  {form.message}
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={4}
                  required
                  value={values.message}
                  onChange={update('message')}
                  placeholder={form.messagePlaceholder}
                  className="mt-2 w-full resize-y rounded-xl border border-line bg-surface/80 px-4 py-3 text-sm text-ink placeholder:text-ink-dim/70 focus:border-violet/50 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-violet px-6 py-3.5 text-sm font-medium text-void transition-colors hover:bg-violet-soft disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending ? (
                  <>
                    <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                    {form.sending}
                  </>
                ) : (
                  <>
                    <Send aria-hidden="true" className="size-4" />
                    {form.submit}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </SectionShell>
  )
}
