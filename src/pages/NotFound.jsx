import { useState } from 'react'
import { Home } from 'lucide-react'
import { useTranslation } from '../i18n/LanguageProvider.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { HOME_PATH, homeSectionHref } from '../data/sections.js'
import Runner from '../components/game/Runner.jsx'
import ButtonLink from '../components/ui/ButtonLink.jsx'
import Reveal from '../components/ui/Reveal.jsx'
import ParallaxLayer from '../components/ui/ParallaxLayer.jsx'

/**
 * Página 404. Además del mensaje, ofrece algo que hacer: un minijuego estilo
 * Geometry Dash. Mantiene el idioma del sitio y permite volver al portafolio.
 */
export default function NotFound() {
  const { t, isSpanish, toggleLanguage } = useTranslation()
  const copy = t.notFound
  const [playing, setPlaying] = useState(false)

  // Mientras se juega, el título refleja la partida.
  useDocumentTitle(playing ? copy.gameMetaTitle : copy.metaTitle)

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden pt-6 pb-16">
      <ParallaxLayer speed={70} className="pointer-events-none absolute inset-0 -z-20">
        <div className="bg-grid mask-fade-b absolute inset-0 opacity-[0.3]" />
      </ParallaxLayer>

      <ParallaxLayer speed={120} className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-20 size-[26rem] rounded-full bg-violet/10 blur-[110px]" />
        <div className="absolute top-24 -right-16 size-[22rem] rounded-full bg-indigo/12 blur-[120px]" />
      </ParallaxLayer>

      <div className="container-page flex flex-1 flex-col">
        {/* --- Barra mínima: volver y cambiar idioma --- */}
        <div className="flex items-center justify-between gap-4">
          <a
            href={HOME_PATH}
            className="flex items-center gap-2.5 font-display text-sm font-bold text-ink"
          >
            <span className="grid size-8 place-items-center rounded-lg border border-violet/40 bg-violet/10 font-mono text-xs text-violet">
              VM
            </span>
            <span className="hidden sm:inline">Valentina Moreno</span>
          </a>

          <button
            type="button"
            onClick={toggleLanguage}
            className="rounded-full border border-line/80 bg-surface/60 px-3 py-2 font-mono text-xs text-ink-soft transition-colors hover:border-violet/40 hover:text-ink"
          >
            {isSpanish ? 'EN' : 'ES'}
          </button>
        </div>

        <div className="mt-10 grid flex-1 items-center gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
          {/* --- Mensaje del 404 --- */}
          <div>
            <Reveal>
              <p className="font-mono text-xs tracking-[0.25em] text-violet uppercase">{copy.code}</p>
            </Reveal>

            <Reveal delay={0.06}>
              <h1 className="mt-4 font-display text-4xl leading-[1.05] font-bold text-ink text-balance-pretty sm:text-5xl">
                {copy.title}
              </h1>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-soft">
                {copy.description}
              </p>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href={HOME_PATH} size="lg">
                  <Home aria-hidden="true" className="size-4" />
                  {copy.homeCta}
                </ButtonLink>
                {/* Ruta + ancla: vuelve al portafolio y baja a proyectos. */}
                <ButtonLink href={homeSectionHref('proyectos')} variant="secondary" size="lg">
                  {copy.projectsCta}
                </ButtonLink>
              </div>
            </Reveal>
          </div>

          {/* --- Minijuego --- */}
          <Reveal delay={0.1} amount={0.15}>
            <div>
              <div className="mb-4">
                <h2 className="font-display text-xl text-ink">{copy.gameTitle}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{copy.gameSubtitle}</p>
              </div>
              <Runner onPlayingChange={setPlaying} />
            </div>
          </Reveal>
        </div>
      </div>
    </main>
  )
}
