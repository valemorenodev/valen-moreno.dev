import { lazy, Suspense, useEffect, useState } from 'react'
import { useTranslation } from '../../i18n/LanguageProvider.jsx'
import { useWebGLSupport } from '../../hooks/useWebGLSupport.js'
import WebGLFallback from './WebGLFallback.jsx'

// El lienzo 3D y three.js viven en un chunk aparte (~240 kB gzip) que solo se
// descarga cuando la escena está a punto de verse o el navegador queda libre.
const HeroScene = lazy(() => import('./HeroScene.jsx'))

const IDLE_TIMEOUT = 1200

export default function Hero3D() {
  const webglSupported = useWebGLSupport()
  const { t } = useTranslation()
  const [ready, setReady] = useState(false)

  // Cargamos la escena cuando (a) el hero ya está en pantalla o (b) el navegador
  // está ocioso. Así el contenido de texto nunca compite con WebGL por el hilo.
  useEffect(() => {
    if (webglSupported !== true) return

    let idleHandle
    let timeoutHandle

    if ('requestIdleCallback' in window) {
      idleHandle = window.requestIdleCallback(() => setReady(true), { timeout: IDLE_TIMEOUT })
    } else {
      timeoutHandle = window.setTimeout(() => setReady(true), IDLE_TIMEOUT)
    }

    return () => {
      if (idleHandle && 'cancelIdleCallback' in window) window.cancelIdleCallback(idleHandle)
      if (timeoutHandle) window.clearTimeout(timeoutHandle)
    }
  }, [webglSupported])

  return (
    <div
      className="relative h-[19rem] w-full sm:h-[24rem] lg:h-[32rem]"
      role="img"
      aria-label={t.hero.hint3d}
    >
      {webglSupported === false ? (
        <WebGLFallback />
      ) : ready ? (
        <Suspense fallback={<SceneLoader label={t.ui.loading3d} />}>
          <HeroScene className="h-full w-full" />
        </Suspense>
      ) : (
        <SceneLoader label={t.ui.loading3d} />
      )}
    </div>
  )
}

/** Placeholder con la misma silueta que la escena: sin saltos de layout. */
function SceneLoader({ label }) {
  return (
    <div className="grid h-full place-items-center">
      <div className="relative grid place-items-center">
        <span
          aria-hidden="true"
          className="size-40 animate-pulse-glow rounded-full bg-violet/10 blur-2xl"
        />
        <span
          aria-hidden="true"
          className="absolute size-24 rounded-full border border-violet/25 animate-orbit"
        />
        <span className="relative font-mono text-[0.65rem] tracking-[0.2em] text-ink-dim uppercase">
          {label}
        </span>
      </div>
    </div>
  )
}
