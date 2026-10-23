import { CheckCircle2, MapPin } from 'lucide-react'
import { useTranslation } from '../../i18n/LanguageProvider.jsx'
import SectionShell from '../ui/SectionShell.jsx'
import Reveal from '../ui/Reveal.jsx'
import { TECH_ICONS, FallbackIcon } from '../ui/techIcons.js'

const isPlaceholder = (text) => /^\[.*\]$/.test(text.trim())

export default function Experience() {
  const { t } = useTranslation()

  return (
    <SectionShell
      id="experiencia"
      eyebrow={t.experience.eyebrow}
      title={t.experience.title}
      subtitle={t.experience.subtitle}
      className="border-y border-line/60 bg-abyss/60"
    >
      <ol className="relative mt-12 space-y-6">
        {/* Línea vertical del timeline */}
        <span
          aria-hidden="true"
          className="absolute top-2 bottom-2 left-[1.05rem] w-px bg-linear-to-b from-violet/60 via-line to-transparent sm:left-[1.3rem]"
        />

        {t.experience.items.map((job, index) => (
          <Reveal as="li" key={job.id} delay={0.07 * index} className="relative pl-12 sm:pl-16">
            {/* Marcador */}
            <span
              aria-hidden="true"
              className={`absolute top-6 left-0 grid size-9 place-items-center rounded-full border sm:size-11 ${
                job.current
                  ? 'border-violet/50 bg-violet/12 text-violet'
                  : 'border-line bg-surface text-ink-dim'
              }`}
            >
              {job.current ? (
                <span className="size-2.5 rounded-full bg-violet animate-pulse-glow" />
              ) : (
                <span className="font-mono text-xs">{String(index + 1).padStart(2, '0')}</span>
              )}
            </span>

            <article className="surface-card p-6 transition-colors duration-300 hover:border-violet/30">
              <header className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="font-mono text-xs text-violet">{job.period}</span>
                {job.current && (
                  <span className="rounded-full border border-violet/30 bg-violet/10 px-2.5 py-0.5 font-mono text-[0.65rem] tracking-wider text-violet uppercase">
                    {t.experience.labels.current}
                  </span>
                )}
              </header>

              <h3 className="mt-3 font-display text-lg text-ink sm:text-xl">
                {job.role}
                <span className="text-ink-dim"> · </span>
                <span className={isPlaceholder(job.company) ? 'text-amber' : 'text-ink-soft'}>
                  {job.company}
                </span>
              </h3>

              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-dim">
                <MapPin aria-hidden="true" className="size-3.5" />
                {job.location}
              </p>

              <p className="mt-4 text-sm leading-relaxed text-ink-soft">{job.summary}</p>

              <ul className="mt-4 space-y-2.5">
                {job.achievements.map((achievement) => (
                  <li key={achievement.slice(0, 30)} className="flex gap-2.5 text-sm leading-relaxed">
                    <CheckCircle2
                      aria-hidden="true"
                      className={`mt-0.5 size-4 shrink-0 ${
                        isPlaceholder(achievement) ? 'text-amber' : 'text-violet'
                      }`}
                    />
                    <span className={isPlaceholder(achievement) ? 'text-amber/90' : 'text-ink-soft'}>
                      {isPlaceholder(achievement)
                        ? achievement.replace(/^\[|\]$/g, '')
                        : achievement}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="font-mono text-[0.62rem] tracking-wider text-ink-dim uppercase">
                  {t.experience.labels.stack}
                </span>
                <ul className="flex flex-wrap gap-1.5">
                  {job.stack.map((tech) => {
                    const Icon = TECH_ICONS[tech] ?? FallbackIcon
                    return (
                      <li
                        key={tech}
                        className="flex items-center gap-1.5 rounded-md border border-line/80 bg-surface/70 px-2 py-1 font-mono text-[0.68rem] text-ink-soft"
                      >
                        <Icon aria-hidden="true" className="size-3 text-violet/90" />
                        {tech}
                      </li>
                    )
                  })}
                </ul>
              </div>
            </article>
          </Reveal>
        ))}
      </ol>
    </SectionShell>
  )
}
