import { useCallback, useEffect, useRef, useState } from 'react'
import { Crown, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import { useTranslation } from '../../i18n/LanguageProvider.jsx'
import { RunnerEngine } from '../../game/RunnerGame.js'
import { GameSound } from '../../game/GameSound.js'
import { useReducedMotion } from '../../hooks/useSmoothScroll.js'

const BEST_KEY = 'vm-runner-best'

function readBest() {
  try {
    return Number(window.localStorage.getItem(BEST_KEY)) || 0
  } catch {
    return 0
  }
}

/**
 * Minijuego tipo Geometry Dash: un cubo que corre solo y salta sobre pinchos.
 * El motor vive en `RunnerEngine`; aquí solo gestionamos entrada y HUD.
 */
export default function Runner({ onPlayingChange }) {
  const { t } = useTranslation()
  const copy = t.notFound.game

  const canvasRef = useRef(null)
  const engineRef = useRef(null)
  const soundRef = useRef(null)
  const reducedMotion = useReducedMotion()

  const [status, setStatus] = useState('ready')
  const [score, setScore] = useState({ distance: 0, coins: 0 })
  const [best, setBest] = useState(readBest)
  const [lastRun, setLastRun] = useState(null)
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const sound = new GameSound()
    soundRef.current = sound
    setMuted(sound.muted)

    const initialBest = readBest()

    const engine = new RunnerEngine(canvas, {
      best: initialBest,
      reducedMotion,
      onState: setStatus,
      onScore: setScore,
      onDeath: (result) => {
        setLastRun(result)
        if (result.isRecord) {
          setBest(result.best)
          try {
            window.localStorage.setItem(BEST_KEY, String(result.best))
          } catch {
            // Sin persistencia del récord, pero la sesión lo conserva.
          }
        }
      },
    })

    engine.attachSound(sound)
    engine.run()
    engineRef.current = engine

    // Punto de inspección para los scripts de verificación visual
    // (scripts/verify-404.mjs). No altera el comportamiento del juego.
    window.__game = engine

    const onResize = () => engine.resize()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      engine.destroy()
      engineRef.current = null
      delete window.__game
    }
    // Solo se recrea si cambia la preferencia de movimiento reducido.
  }, [reducedMotion])

  const restart = useCallback(() => {
    engineRef.current?.start()
    soundRef.current?.start()
  }, [])

  const jump = useCallback(() => {
    engineRef.current?.jump()
  }, [])

  // Una sola acción: saltar. Al chocar, la misma tecla reinicia la partida.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.key === 'Tab') return

      const isRestartKey = event.key === 'r' || event.key === 'R' || event.key === 'Enter'
      if (engineRef.current?.state.status === 'dead' && isRestartKey) {
        event.preventDefault()
        restart()
        return
      }

      if (event.key === ' ' || event.key === 'ArrowUp' || event.key === 'w' || event.key === 'W' || event.key === 'Enter') {
        // Evitamos que la barra espaciadora desplace la página.
        event.preventDefault()
        jump()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [jump, restart])

  const toggleMute = () => {
    const next = soundRef.current?.toggleMute()
    setMuted(Boolean(next))
  }

  // La página 404 usa esto para reflejar la partida en el título del documento.
  useEffect(() => {
    onPlayingChange?.(status === 'playing')
  }, [status, onPlayingChange])

  const isDead = status === 'dead'
  const isReady = status === 'ready'

  return (
    <div className="surface-card overflow-hidden">
      {/* --- HUD --- */}
      <div className="flex flex-col gap-2 border-b border-line/70 bg-surface/70 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs">
          <span className="flex items-baseline gap-1.5">
            <span className="text-ink-dim uppercase">{copy.distance}</span>
            <span className="text-base text-violet">{score.distance}</span>
          </span>
          <span className="flex items-baseline gap-1.5">
            <span className="text-ink-dim uppercase">{copy.coins}</span>
            <span className="text-base text-amber">{score.coins}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Crown aria-hidden="true" className="size-3.5 text-violet-soft" />
            <span className="text-ink-dim uppercase">{copy.best}</span>
            <span className="text-base text-violet-soft">{best}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!isReady && (
            <button
              type="button"
              onClick={restart}
              className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 font-mono text-xs text-ink-soft transition-colors hover:border-violet/40 hover:text-ink"
            >
              <RotateCcw aria-hidden="true" className="size-3.5" />
              {copy.restart}
            </button>
          )}

          <button
            type="button"
            onClick={toggleMute}
            aria-pressed={muted}
            aria-label={muted ? copy.unmute : copy.mute}
            title={muted ? copy.unmute : copy.mute}
            className="grid size-8 place-items-center rounded-full border border-line text-ink-soft transition-colors hover:border-violet/40 hover:text-ink"
          >
            {muted ? (
              <VolumeX aria-hidden="true" className="size-3.5" />
            ) : (
              <Volume2 aria-hidden="true" className="size-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* --- Tablero --- */}
      <div className="relative bg-void">
        <canvas
          ref={canvasRef}
          // role="img": para un lector de pantalla es un gráfico con descripción,
          // y toda la interacción se explica en el texto de ayuda.
          role="img"
          aria-label={copy.canvasLabel}
          onClick={jump}
          className="w-full cursor-pointer touch-manipulation select-none"
        />

        {isReady && (
          <Overlay>
            <button
              type="button"
              onClick={restart}
              className="inline-flex items-center gap-2 rounded-full bg-violet px-5 py-2.5 text-sm font-medium text-void transition-colors hover:bg-violet-soft sm:px-6 sm:py-3"
            >
              <Play aria-hidden="true" className="size-4" />
              {copy.start}
            </button>
            <Controls copy={copy} />
          </Overlay>
        )}

        {isDead && (
          <Overlay>
            <p className="font-mono text-[0.68rem] tracking-[0.2em] text-rose uppercase sm:text-xs">
              {copy.gameOver}
            </p>
            <p className="font-display text-xl text-ink sm:text-3xl">
              {copy.distance}: <span className="text-violet">{lastRun?.distance ?? 0}</span>
            </p>
            {lastRun?.isRecord ? (
              <p className="font-mono text-[0.68rem] text-amber sm:text-xs">{copy.newRecord}</p>
            ) : (
              <p className="font-mono text-[0.68rem] text-ink-dim sm:text-xs">
                {copy.best}: {best}
              </p>
            )}
            <button
              type="button"
              onClick={restart}
              className="mt-0.5 inline-flex items-center gap-2 rounded-full bg-violet px-5 py-2.5 text-sm font-medium text-void transition-colors hover:bg-violet-soft sm:mt-1 sm:px-6 sm:py-3"
            >
              <RotateCcw aria-hidden="true" className="size-4" />
              {copy.again}
            </button>
            <Controls copy={copy} />
          </Overlay>
        )}
      </div>

      {/* Anuncio para lectores de pantalla: no se ve, pero informa del estado. */}
      <p aria-live="polite" className="sr-only">
        {isDead
          ? `${copy.gameOver}. ${copy.distance}: ${lastRun?.distance ?? 0}. ${copy.best}: ${best}`
          : `${copy.distance}: ${score.distance}`}
      </p>
    </div>
  )
}

function Overlay({ children }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-void/72 px-3 py-2 text-center backdrop-blur-[2px] sm:gap-3 sm:px-4">
      {children}
    </div>
  )
}

/** Las teclas solo se anuncian donde existen: en móvil no hay teclado. */
function Controls({ copy }) {
  return (
    <div className="mt-1 hidden space-y-1 text-xs text-ink-soft sm:block">
      <p className="flex flex-wrap items-center justify-center gap-1.5">
        {copy.controlsJump.map((key) => (
          <kbd
            key={key}
            className="rounded-md border border-line bg-surface px-2 py-1 font-mono text-[0.68rem] text-ink"
          >
            {key}
          </kbd>
        ))}
        <span className="ml-1">{copy.controlsJumpLabel}</span>
      </p>
      <p className="text-ink-dim">{copy.controlsTouch}</p>
    </div>
  )
}
