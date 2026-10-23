import { ArrowUpRight } from 'lucide-react'

const VARIANTS = {
  primary:
    'bg-violet text-void hover:bg-violet-soft shadow-[0_10px_40px_-12px_rgba(0,216,160,0.65)]',
  secondary:
    'border border-line bg-surface/70 text-ink hover:border-violet/50 hover:bg-elevated/80',
  ghost:
    'border border-transparent text-ink-soft hover:border-line hover:text-ink',
}

/**
 * Botón/enlace unificado. Detecta si el destino es un ancla interna, un enlace
 * externo o una acción, y aplica los atributos de seguridad correspondientes.
 */
export default function ButtonLink({
  href,
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  showExternalIcon = true,
  onClick,
  ...rest
}) {
  const isExternal = typeof href === 'string' && /^(https?:)?\/\//.test(href)
  const isAction = !href

  const sizing = size === 'lg' ? 'px-6 py-3.5 text-sm' : 'px-5 py-3 text-sm'

  const base = [
    'group inline-flex items-center justify-center gap-2 rounded-full font-medium',
    'transition-all duration-300 will-change-transform hover:-translate-y-0.5',
    sizing,
    VARIANTS[variant] ?? VARIANTS.primary,
    className,
  ].join(' ')

  const content = (
    <>
      {children}
      {isExternal && showExternalIcon && (
        <ArrowUpRight
          aria-hidden="true"
          className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      )}
    </>
  )

  if (isAction) {
    return (
      <button type="button" onClick={onClick} className={base} {...rest}>
        {content}
      </button>
    )
  }

  return (
    <a
      href={href}
      onClick={onClick}
      className={base}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : null)}
      {...rest}
    >
      {content}
    </a>
  )
}
