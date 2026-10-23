import { useEffect, useState } from 'react'
import { motion, useScroll, useSpring } from 'motion/react'
import { Languages, Menu, X } from 'lucide-react'
import { useTranslation } from '../../i18n/LanguageProvider.jsx'
import { useActiveSection } from '../../hooks/useActiveSection.js'
import { NAV_SECTIONS, SECTION_IDS, sectionHref } from '../../data/sections.js'

export default function Navbar() {
  const { t, language, toggleLanguage, isSpanish } = useTranslation()
  const activeId = useActiveSection(SECTION_IDS)
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // El menú móvil se cierra con Escape: comportamiento esperado en un panel.
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={`transition-all duration-500 ${
          scrolled
            ? 'border-b border-line/70 bg-void/80 backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent'
        }`}
      >
        <nav
          aria-label={isSpanish ? 'Navegación principal' : 'Main navigation'}
          className="container-page flex h-16 items-center justify-between gap-4"
        >
          <a
            href={sectionHref('inicio')}
            className="group flex items-center gap-2.5 font-display text-sm font-bold tracking-tight text-ink"
          >
            <span className="relative grid size-8 place-items-center rounded-lg border border-violet/40 bg-violet/10 font-mono text-xs text-violet">
              VM
              <span className="absolute -right-0.5 -bottom-0.5 size-2 rounded-full bg-violet animate-pulse-glow" />
            </span>
            <span className="hidden sm:inline">Valentina Moreno</span>
          </a>

          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_SECTIONS.map((section) => {
              const isActive = activeId === section.id
              return (
                <li key={section.id}>
                  <a
                    href={sectionHref(section.id)}
                    aria-current={isActive ? 'true' : undefined}
                    className={`relative rounded-full px-3.5 py-2 text-sm transition-colors ${
                      isActive ? 'text-ink' : 'text-ink-dim hover:text-ink-soft'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-active-pill"
                        className="absolute inset-0 -z-10 rounded-full border border-violet/25 bg-violet/10"
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      />
                    )}
                    {t.nav[section.navKey]}
                  </a>
                </li>
              )
            })}
          </ul>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleLanguage}
              aria-label={t.ui.languageToggle}
              title={t.ui.languageToggle}
              className="flex items-center gap-1.5 rounded-full border border-line/80 bg-surface/60 px-3 py-2 font-mono text-xs text-ink-soft transition-colors hover:border-violet/40 hover:text-ink"
            >
              <Languages aria-hidden="true" className="size-3.5" />
              {language === 'es' ? 'ES' : 'EN'}
            </button>

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? t.ui.closeMenu : t.ui.openMenu}
              className="grid size-9 place-items-center rounded-full border border-line/80 bg-surface/60 text-ink-soft transition-colors hover:text-ink lg:hidden"
            >
              {open ? <X aria-hidden="true" className="size-4" /> : <Menu aria-hidden="true" className="size-4" />}
            </button>
          </div>
        </nav>

        {/* Barra de progreso de lectura de la página. */}
        <motion.div
          aria-hidden="true"
          style={{ scaleX: progress }}
          className="h-px w-full origin-left bg-linear-to-r from-violet via-cyan to-indigo"
        />
      </div>

      {open && (
        <motion.div
          id="mobile-nav"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          className="border-b border-line bg-void/95 backdrop-blur-xl lg:hidden"
        >
          <ul className="container-page flex flex-col py-3">
            {NAV_SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  href={sectionHref(section.id)}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-3 text-sm text-ink-soft transition-colors hover:bg-surface/70 hover:text-ink"
                >
                  {t.nav[section.navKey]}
                </a>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </header>
  )
}
