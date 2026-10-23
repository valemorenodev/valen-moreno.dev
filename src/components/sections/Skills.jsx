import { useTranslation } from '../../i18n/LanguageProvider.jsx'
import SectionShell from '../ui/SectionShell.jsx'
import Reveal from '../ui/Reveal.jsx'
import TechMarquee from '../ui/TechMarquee.jsx'
import { TECH_ICONS, FallbackIcon } from '../ui/techIcons.js'

const GROUP_ACCENTS = {
  frontend: 'violet',
  backend: 'cyan',
  data: 'indigo',
  quality: 'amber',
  devops: 'cyan',
  practices: 'indigo',
}

const ACCENT_CLASSES = {
  violet: 'border-violet/25 bg-violet/8 text-violet',
  cyan: 'border-cyan/25 bg-cyan/8 text-cyan',
  indigo: 'border-indigo/25 bg-indigo/8 text-violet-soft',
  amber: 'border-amber/25 bg-amber/8 text-amber',
}

const HIGHLIGHT_STACK = [
  'React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'TanStack Query',
  'GraphQL', 'Vitest', 'Tailwind CSS', 'GitHub Actions', 'Redis', 'Playwright',
]

export default function Skills() {
  const { t } = useTranslation()

  return (
    <SectionShell
      id="stack"
      eyebrow={t.skills.eyebrow}
      title={t.skills.title}
      subtitle={t.skills.subtitle}
      className="border-y border-line/60 bg-abyss/60"
    >
      <ul className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {t.skills.groups.map((group, index) => {
          const accent = GROUP_ACCENTS[group.id] ?? 'violet'
          const accentClass = ACCENT_CLASSES[accent] ?? ACCENT_CLASSES.violet

          return (
            <Reveal as="li" key={group.id} delay={0.05 * index} className="h-full">
              <article className="surface-card group h-full p-5 transition-all duration-300 hover:-translate-y-1 hover:border-violet/30">
                <header className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg text-ink">{group.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{group.description}</p>
                  </div>
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-xl border font-mono text-xs ${accentClass}`}
                    aria-hidden="true"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </header>

                <ul className="mt-5 flex flex-wrap gap-2">
                  {group.items.map((tech) => {
                    const Icon = TECH_ICONS[tech] ?? FallbackIcon
                    return (
                      <li
                        key={tech}
                        className="flex items-center gap-1.5 rounded-lg border border-line/80 bg-surface/70 px-2.5 py-1.5 font-mono text-[0.7rem] text-ink-soft transition-colors hover:border-violet/40 hover:text-ink"
                      >
                        <Icon aria-hidden="true" className="size-3.5 text-violet/90" />
                        {tech}
                      </li>
                    )
                  })}
                </ul>
              </article>
            </Reveal>
          )
        })}
      </ul>

      <Reveal delay={0.1} className="mt-12">
        <TechMarquee items={HIGHLIGHT_STACK} reverse duration={52} />
      </Reveal>
    </SectionShell>
  )
}
