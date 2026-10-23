import { motion } from 'motion/react'
import { ArrowDown, Sparkles } from 'lucide-react'
import { useTranslation } from '../../i18n/LanguageProvider.jsx'
import { useSmoothScroll } from '../../hooks/useSmoothScroll.js'
import { sectionHref } from '../../data/sections.js'
import Hero3D from '../three/Hero3D.jsx'
import ParallaxLayer from '../ui/ParallaxLayer.jsx'
import ButtonLink from '../ui/ButtonLink.jsx'
import TechMarquee from '../ui/TechMarquee.jsx'

const MARQUEE_ITEMS = [
  'React', 'TypeScript', 'Node.js', 'Tailwind CSS', 'Three.js', 'TanStack Query',
  'PostgreSQL', 'Docker', 'Vite', 'GraphQL', 'Vitest', 'Framer Motion',
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
}

export default function Hero() {
  const { t, isSpanish } = useTranslation()
  const { scrollTo } = useSmoothScroll()

  return (
    <section id="inicio" aria-labelledby="hero-title" className="relative overflow-hidden pt-28 pb-16 sm:pt-32">
      {/* --- Fondo con parallax: rejilla, orbes y degradados --- */}
      <ParallaxLayer speed={60} className="pointer-events-none absolute inset-0 -z-20">
        <div className="bg-grid mask-fade-b absolute inset-0 opacity-[0.35]" />
      </ParallaxLayer>

      <ParallaxLayer speed={110} className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 size-[30rem] rounded-full bg-violet/10 blur-[110px]" />
        <div className="absolute top-16 -right-20 size-[26rem] rounded-full bg-indigo/12 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 size-[22rem] rounded-full bg-cyan/8 blur-[100px]" />
      </ParallaxLayer>

      <div className="container-page">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          {/* --- Columna de texto --- */}
          <motion.div variants={container} initial="hidden" animate="show" className="relative z-10">
            <motion.div variants={item}>
              <span className="inline-flex items-center gap-2 rounded-full border border-violet/30 bg-violet/8 px-3.5 py-1.5 font-mono text-xs text-violet">
                <Sparkles aria-hidden="true" className="size-3.5" />
                {t.hero.status}
              </span>
            </motion.div>

            <motion.p variants={item} className="mt-6 font-mono text-xs tracking-[0.2em] text-ink-dim uppercase sm:text-sm">
              {t.hero.role}
            </motion.p>

            <motion.h1
              id="hero-title"
              variants={item}
              className="mt-4 font-display text-[2.1rem] leading-[1.08] font-bold text-ink text-balance-pretty sm:text-5xl lg:text-[3.4rem]"
            >
              {t.hero.headline}{' '}
              <span className="text-gradient">{t.hero.headlineAccent}</span>
            </motion.h1>

            <motion.p variants={item} className="mt-6 max-w-xl text-base leading-relaxed text-ink-soft">
              {t.hero.intro}
            </motion.p>

            <motion.div variants={item} className="mt-9 flex flex-wrap items-center gap-3">
              {/* Enlaces del router: los resuelve react-router-dom y ScrollManager. */}
              <ButtonLink href={sectionHref('proyectos')} size="lg">
                {t.hero.primaryCta}
              </ButtonLink>
              <ButtonLink href={sectionHref('contacto')} variant="secondary" size="lg">
                {t.hero.secondaryCta}
              </ButtonLink>
            </motion.div>

            {/* Tarjeta tipo terminal: datos legibles de un vistazo para reclutadores. */}
            <motion.div
              variants={item}
              className="surface-card mt-10 max-w-md overflow-hidden p-0 font-mono text-xs"
            >
              <div className="flex items-center gap-2 border-b border-line/70 bg-surface/80 px-4 py-2.5">
                <span className="size-2 rounded-full bg-rose/80" />
                <span className="size-2 rounded-full bg-amber/80" />
                <span className="size-2 rounded-full bg-violet/80" />
                <span className="ml-2 text-ink-dim">{t.hero.terminalTitle}</span>
              </div>
              <dl className="space-y-2 px-4 py-4">
                {[
                  { key: isSpanish ? 'rol' : 'role', value: 'full-stack-developer' },
                  { key: isSpanish ? 'foco' : 'focus', value: 'fintech · data interfaces' },
                  { key: isSpanish ? 'stack' : 'stack', value: 'react · typescript · node' },
                  { key: isSpanish ? 'ubicación' : 'location', value: 'colombia · remote' },
                ].map((row) => (
                  <div key={row.key} className="flex gap-3">
                    <dt className="shrink-0 text-violet">{row.key}</dt>
                    <dd className="text-ink-dim">: {row.value}</dd>
                  </div>
                ))}
                <div className="flex gap-3 pt-1">
                  <span className="text-violet">{isSpanish ? 'estado' : 'status'}</span>
                  <span className="text-ink-soft">
                    : {isSpanish ? 'disponible' : 'available'}
                    <span className="animate-blink">_</span>
                  </span>
                </div>
              </dl>
            </motion.div>
          </motion.div>

          {/* --- Columna 3D --- */}
          <div className="relative z-10">
            <Hero3D />
            <p className="mt-2 text-center font-mono text-[0.7rem] text-ink-dim">{t.hero.hint3d}</p>
          </div>
        </div>

        {/* --- Marquesina del stack --- */}
        <div className="mt-14 space-y-3">
          <TechMarquee items={MARQUEE_ITEMS} duration={42} />
        </div>

        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => scrollTo('#sobre-mi')}
            className="group flex flex-col items-center gap-2 font-mono text-[0.7rem] tracking-widest text-ink-dim uppercase transition-colors hover:text-violet"
          >            {t.hero.scrollHint}
            <ArrowDown aria-hidden="true" className="size-4 animate-float" />
          </button>
        </div>
      </div>

      {/* Latido del degradado inferior para separar del contenido siguiente. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent to-void"
      />
      <span className="sr-only">{isSpanish ? 'Inicio del portafolio' : 'Portfolio start'}</span>
    </section>
  )
}
