import SectionHeading from './SectionHeading.jsx'

/**
 * Envoltorio de sección: gestiona el id para la navegación por anclas,
 * el ancho de lectura y el espaciado vertical consistente.
 */
export default function SectionShell({
  id,
  eyebrow,
  title,
  subtitle,
  align = 'left',
  children,
  className = '',
  headingClassName = '',
}) {
  return (
    <section
      id={id}
      aria-labelledby={title ? `${id}-title` : undefined}
      className={`relative scroll-mt-24 py-20 sm:py-24 lg:py-28 ${className}`}
    >
      <div className="container-page">
        {title && (
          <div id={`${id}-title`}>
            <SectionHeading
              eyebrow={eyebrow}
              title={title}
              subtitle={subtitle}
              align={align}
              className={headingClassName}
            />
          </div>
        )}
        {children}
      </div>
    </section>
  )
}
