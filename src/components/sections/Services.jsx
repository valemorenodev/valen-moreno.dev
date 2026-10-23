import { useTranslation } from '../../i18n/LanguageProvider.jsx'
import SectionShell from '../ui/SectionShell.jsx'
import Reveal from '../ui/Reveal.jsx'
import TiltCard from '../ui/TiltCard.jsx'
import { SERVICE_ICONS, FallbackIcon } from '../ui/techIcons.js'

export default function Services() {
  const { t } = useTranslation()

  return (
    <SectionShell
      id="servicios"
      eyebrow={t.services.eyebrow}
      title={t.services.title}
      subtitle={t.services.subtitle}
    >
      <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {t.services.items.map((service, index) => {
          const Icon = SERVICE_ICONS[service.icon] ?? FallbackIcon

          return (
            <Reveal as="li" key={service.id} delay={0.06 * index} className="h-full">
              <TiltCard className="h-full" tiltMaxAngle={7}>
                <article className="surface-card group relative h-full overflow-hidden p-6 transition-colors duration-300 hover:border-violet/35">
                  {/* Halo que aparece al pasar el cursor */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-16 -right-16 size-40 rounded-full bg-violet/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                  />

                  <span className="relative grid size-11 place-items-center rounded-xl border border-violet/25 bg-violet/8 text-violet">
                    <Icon aria-hidden="true" className="size-5" />
                  </span>

                  <h3 className="relative mt-5 font-display text-base leading-snug text-ink">
                    {service.title}
                  </h3>
                  <p className="relative mt-2.5 text-sm leading-relaxed text-ink-soft">
                    {service.description}
                  </p>
                </article>
              </TiltCard>
            </Reveal>
          )
        })}
      </ul>
    </SectionShell>
  )
}
