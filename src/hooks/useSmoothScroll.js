import { useCallback, useEffect, useRef, useState } from 'react'

/** ¿La persona usuaria pidió reducir el movimiento? */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    if (!window.matchMedia) return
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (event) => setReduced(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return reduced
}

/**
 * Scroll suave con Lenis.
 * - Se desactiva si la persona usuaria prefiere movimiento reducido.
 * - Respeta `#anclas` interceptando el clic, para que la navegación del header
 *   y Lenis no compitan entre sí.
 */
export function useSmoothScroll() {
  const reducedMotion = useReducedMotion()
  const lenisRef = useRef(null)

  useEffect(() => {
    if (reducedMotion) return

    let lenis
    let cancelled = false

    import('lenis').then(({ default: Lenis }) => {
      if (cancelled) return

      lenis = new Lenis({
        duration: 1.05,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        // Mantiene el scroll nativo de fondo: así `position: fixed` (navbar)
        // y las utilidades sticky siguen funcionando sin sorpresas.
        autoRaf: true,
        touchMultiplier: 1.6,
      })

      lenisRef.current = lenis
      document.documentElement.classList.add('lenis', 'lenis-smooth')
    })

    return () => {
      cancelled = true
      lenis?.destroy()
      lenisRef.current = null
      document.documentElement.classList.remove('lenis', 'lenis-smooth', 'lenis-stopped')
    }
  }, [reducedMotion])

  const scrollTo = useCallback(
    (target, options = {}) => {
      const element = typeof target === 'string' ? document.querySelector(target) : target
      if (!element) return

      if (lenisRef.current) {
        lenisRef.current.scrollTo(element, { offset: options.offset ?? -72, duration: 1.2 })
      } else {
        element.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
      }
    },
    [reducedMotion],
  )

  // El desplazamiento hacia las anclas lo orquesta `ScrollManager` (App.jsx),
  // que conoce la ruta actual. Antes se interceptaban aquí los clics, pero con
  // BrowserRouter un enlace puede cambiar de ruta y de ancla a la vez, y eso
  // necesita una única fuente de verdad.

  return { scrollTo, reducedMotion }
}
