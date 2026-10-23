/**
 * Textura de grano sutil sobre todo el sitio. Es un SVG en línea como data URI:
 * sin petición de red ni imagen extra en el bundle, y se repite con `background`.
 */
const NOISE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.42'/%3E%3C/svg%3E"

export default function NoiseOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[70] opacity-[0.035] mix-blend-soft-light"
      style={{ backgroundImage: `url("${NOISE}")` }}
    />
  )
}
