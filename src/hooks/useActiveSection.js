import { useEffect, useState } from 'react'

/**
 * Devuelve el id de la sección visible para resaltar el enlace activo del header.
 * Usa IntersectionObserver sobre las secciones reales del documento.
 */
export function useActiveSection(sectionIds, options = {}) {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? null)
  const { rootMargin = '-45% 0px -50% 0px' } = options

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element) => Boolean(element))

    if (!elements.length || typeof IntersectionObserver === 'undefined') return

    const visible = new Map()

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visible.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0)
        })

        let bestId = null
        let bestRatio = 0
        visible.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            bestRatio = ratio
            bestId = id
          }
        })

        if (bestId) setActiveId(bestId)
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1], rootMargin },
    )

    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [sectionIds, rootMargin])

  return activeId
}
