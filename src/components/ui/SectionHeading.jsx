import Reveal from './Reveal.jsx'

/**
 * Cabecera de sección coherente en todo el sitio: etiqueta, título y entradilla.
 * Centralizarla evita que cada sección invente su propia jerarquía visual.
 */
export default function SectionHeading({ eyebrow, title, subtitle, align = 'left', className = '' }) {
  const alignment = align === 'center' ? 'items-center text-center mx-auto' : 'items-start'

  return (
    <div className={`flex max-w-3xl flex-col ${alignment} ${className}`}>
      {eyebrow && (
        <Reveal amount={0.4}>
          <span className="inline-flex items-center gap-2 rounded-full border border-violet/25 bg-violet/8 px-3 py-1 font-mono text-xs tracking-[0.18em] text-violet uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-violet" aria-hidden="true" />
            {eyebrow}
          </span>
        </Reveal>
      )}

      <Reveal delay={0.06} amount={0.4}>
        <h2 className="mt-4 text-3xl leading-tight text-ink text-balance-pretty sm:text-4xl lg:text-[2.75rem]">
          {title}
        </h2>
      </Reveal>

      {subtitle && (
        <Reveal delay={0.12} amount={0.4}>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft">{subtitle}</p>
        </Reveal>
      )}
    </div>
  )
}
