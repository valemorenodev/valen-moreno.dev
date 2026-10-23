import { Compass, Gauge, Handshake, Users } from 'lucide-react'
import { useTranslation } from '../../i18n/LanguageProvider.jsx'
import SectionShell from '../ui/SectionShell.jsx'
import Reveal from '../ui/Reveal.jsx'
import StatCounter from '../ui/StatCounter.jsx'
import TiltCard from '../ui/TiltCard.jsx'

const VALUE_ICONS = {
  product: Compass,
  quality: Gauge,
  a11y: Users,
  collab: Handshake,
}

export default function About() {
  const { t } = useTranslation()

  return (
    <SectionShell id="sobre-mi" eyebrow={t.about.eyebrow} title={t.about.title}>
      <div className="mt-12 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
        {/* --- Relato profesional --- */}
        <div>
          <Reveal>
            <p className="font-display text-xl leading-relaxed font-medium text-ink sm:text-2xl">
              {t.about.lead}
            </p>
          </Reveal>

          <div className="mt-6 space-y-4">
            {t.about.paragraphs.map((paragraph, index) => (
              <Reveal key={paragraph.slice(0, 24)} delay={0.08 * (index + 1)}>
                <p className="text-base leading-relaxed text-ink-soft">{paragraph}</p>
              </Reveal>
            ))}
          </div>
        </div>

        {/* --- Métricas --- */}
        <div>
          <Reveal>
            <h3 className="font-mono text-xs tracking-[0.2em] text-ink-dim uppercase">
              {t.hero.metricsNote}
            </h3>
          </Reveal>

          <ul className="mt-5 grid grid-cols-2 gap-3">
            {t.about.stats.map((stat, index) => (
              <Reveal as="li" key={stat.id} delay={0.06 * index} className="h-full">
                <StatCounter value={stat.value} suffix={stat.suffix} label={stat.label} />
              </Reveal>
            ))}
          </ul>
        </div>
      </div>

      {/* --- Cómo trabajo --- */}
      <div className="mt-16">
        <Reveal>
          <h3 className="font-display text-xl text-ink">{t.about.valuesTitle}</h3>
        </Reveal>

        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.about.values.map((value, index) => {
            const Icon = VALUE_ICONS[value.id] ?? Compass
            return (
              <Reveal as="li" key={value.id} delay={0.07 * index} className="h-full">
                <TiltCard className="h-full" tiltMaxAngle={6}>
                  <article className="surface-card h-full p-5 transition-colors duration-300 hover:border-violet/35">
                    <span className="grid size-10 place-items-center rounded-xl border border-violet/25 bg-violet/8 text-violet">
                      <Icon aria-hidden="true" className="size-5" />
                    </span>
                    <h4 className="mt-4 font-display text-base leading-snug text-ink">{value.title}</h4>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">{value.description}</p>
                  </article>
                </TiltCard>
              </Reveal>
            )
          })}
        </ul>
      </div>
    </SectionShell>
  )
}
