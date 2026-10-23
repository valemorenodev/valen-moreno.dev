import { ExternalLink, Target } from 'lucide-react'
import { FaGithub } from 'react-icons/fa'
import { TECH_ICONS, FallbackIcon } from './techIcons.js'

/** Detecta los campos que quedaron pendientes de completar: "[...]". */
export function isPlaceholder(text) {
  return typeof text === 'string' && /^\[.*\]$/.test(text.trim())
}

/** Convierte "[RESULTADO: añade una métrica]" en algo legible. */
function placeholderBody(text) {
  return text.replace(/^\[|\]$/g, '')
}

function StackChips({ stack }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {stack.map((tech) => {
        const Icon = TECH_ICONS[tech] ?? FallbackIcon
        return (
          <li
            key={tech}
            className="flex items-center gap-1.5 rounded-lg border border-line/80 bg-surface/70 px-2.5 py-1.5 font-mono text-[0.7rem] text-ink-soft"
          >
            <Icon aria-hidden="true" className="size-3.5 text-violet/90" />
            {tech}
          </li>
        )
      })}
    </ul>
  )
}

function ResultCallout({ text, note }) {
  if (isPlaceholder(text)) {
    return (
      <div className="rounded-xl border border-dashed border-amber/40 bg-amber/6 p-4">
        <p className="flex items-center gap-2 font-mono text-[0.68rem] tracking-wider text-amber uppercase">
          <Target aria-hidden="true" className="size-3.5" />
          {note}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{placeholderBody(text)}</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-violet/25 bg-violet/6 p-4">
      <p className="flex items-center gap-2 font-mono text-[0.68rem] tracking-wider text-violet uppercase">
        <Target aria-hidden="true" className="size-3.5" />
        {note}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{text}</p>
    </div>
  )
}

function ProjectLinks({ links, labels }) {
  const hasDemo = Boolean(links?.demo)
  const hasCode = Boolean(links?.code)

  if (!hasDemo && !hasCode) return null

  return (
    <div className="flex flex-wrap gap-2">
      {hasDemo && (
        <a
          href={links.demo}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-4 py-2 text-xs text-ink transition-colors hover:border-violet/45 hover:text-violet"
        >
          <ExternalLink aria-hidden="true" className="size-3.5" />
          {labels.demo}
        </a>
      )}
      {hasCode && (
        <a
          href={links.code}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-4 py-2 text-xs text-ink transition-colors hover:border-violet/45 hover:text-violet"
        >
          <FaGithub aria-hidden="true" className="size-3.5" />
          {labels.code}
        </a>
      )}
    </div>
  )
}

export default function CaseStudyCard({ project, labels, image }) {
  return (
    <article className="surface-card group h-full overflow-hidden transition-colors duration-300 hover:border-violet/30">
      {/* --- Portada --- */}
      {image && (
        // Altura acotada: las capturas de las apps son verticales y a tamaño
        // completo se comen la ficha. Como banner se leen y dejan ver el caso.
        <div className="relative h-44 overflow-hidden sm:h-52">
          <img
            src={image}
            alt=""
            loading="lazy"
            decoding="async"
            className="size-full object-cover object-top transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-linear-to-t from-abyss via-abyss/55 to-abyss/10"
          />
          <span className="absolute top-4 left-4 rounded-full border border-violet/30 bg-void/80 px-3 py-1 font-mono text-[0.65rem] tracking-wider text-violet uppercase backdrop-blur">
            {project.category}
          </span>
        </div>
      )}

      {/* --- Contenido del caso --- */}
      <div className="flex flex-col gap-5 p-6 sm:p-7">
        {!image && (
          <span className="w-fit rounded-full border border-violet/30 bg-violet/8 px-3 py-1 font-mono text-[0.65rem] tracking-wider text-violet uppercase">
            {project.category}
          </span>
        )}

        <div>
          <h3 className="font-display text-xl leading-snug text-ink sm:text-2xl">{project.title}</h3>
          <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">{project.summary}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-line/70 bg-surface/50 p-4">
            <h4 className="font-mono text-[0.68rem] tracking-wider text-cyan uppercase">
              {labels.challenge}
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{project.challenge}</p>
          </div>

          <div className="rounded-xl border border-line/70 bg-surface/50 p-4">
            <h4 className="font-mono text-[0.68rem] tracking-wider text-violet-soft uppercase">
              {labels.solution}
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{project.solution}</p>
          </div>
        </div>

        {project.highlights?.length > 0 && (
          <div>
            <h4 className="font-mono text-[0.68rem] tracking-wider text-ink-dim uppercase">
              {labels.highlights}
            </h4>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {project.highlights.map((highlight) => (
                <li
                  key={highlight.slice(0, 30)}
                  className="flex gap-2.5 text-sm leading-relaxed text-ink-soft"
                >
                  <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-violet" />
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        )}

        <ResultCallout text={project.result} note={labels.result} />

        <div>
          <h4 className="font-mono text-[0.68rem] tracking-wider text-ink-dim uppercase">
            {labels.stack}
          </h4>
          <div className="mt-3">
            <StackChips stack={project.stack} />
          </div>
        </div>

        <ProjectLinks links={project.links} labels={labels} />
      </div>
    </article>
  )
}
