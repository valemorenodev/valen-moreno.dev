import CountUp from 'react-countup'
import { useInView } from 'react-intersection-observer'
import { useReducedMotion } from '../../hooks/useSmoothScroll.js'

/**
 * Métrica con contador animado. El número es visible desde el primer render
 * para lectores de pantalla; la animación solo decora.
 */
export default function StatCounter({ value, suffix = '', prefix = '', label, decimals = 0 }) {
  const reducedMotion = useReducedMotion()
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.4 })
  const isPlaceholder = value === 0 && !suffix && !prefix

  return (
    <div ref={ref} className="surface-card group flex h-full flex-col justify-between p-5">
      <p className="font-mono text-3xl font-semibold text-gradient sm:text-4xl">
        {isPlaceholder ? (
          // Métrica pendiente de dato real: se marca en ámbar, no se inventa.
          <span className="font-mono text-3xl text-amber sm:text-4xl">—</span>
        ) : (
          <>
            {prefix}
            {reducedMotion ? (
              value
            ) : (
              <CountUp
                end={value}
                duration={1.9}
                decimals={decimals}
                separator="."
                start={inView ? 0 : value}
                redraw={false}
              />
            )}
            {suffix}
          </>
        )}
      </p>
      <p className="mt-3 text-sm leading-snug text-ink-soft">{label}</p>
      <span
        aria-hidden="true"
        className="mt-4 h-px w-full origin-left scale-x-0 bg-linear-to-r from-violet to-transparent transition-transform duration-500 group-hover:scale-x-100"
      />
    </div>
  )
}
