import { createElement } from 'react'
import { useInView } from 'react-intersection-observer'

/**
 * Observador de scroll compartido. `triggerOnce` evita que las animaciones se
 * repitan al subir y bajar, que es lo que delata a un portafolio "animado de más".
 */
export const inViewOnceOptions = {
  triggerOnce: true,
  threshold: 0.2,
  rootMargin: '0px 0px -10% 0px',
}

/** Solo el `ref`: útil cuando el elemento ya existe (tablas, listas, tarjetas). */
export function useInViewOnce(options) {
  return useInView({ ...inViewOnceOptions, ...options }).ref
}

export default function InView({ children, as = 'div', className = '', options, ...rest }) {
  const ref = useInViewOnce(options)
  return createElement(as, { className, ref, ...rest }, children)
}
