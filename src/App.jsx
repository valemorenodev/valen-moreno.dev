import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { LanguageProvider, useTranslation } from './i18n/LanguageProvider.jsx'
import { useSmoothScroll } from './hooks/useSmoothScroll.js'
import { useDocumentTitle } from './hooks/useDocumentTitle.js'
import Navbar from './components/layout/Navbar.jsx'
import Footer from './components/layout/Footer.jsx'
import NoiseOverlay from './components/layout/NoiseOverlay.jsx'
import Hero from './components/sections/Hero.jsx'
import About from './components/sections/About.jsx'
import Skills from './components/sections/Skills.jsx'
import Projects from './components/sections/Projects.jsx'
import Experience from './components/sections/Experience.jsx'
import Services from './components/sections/Services.jsx'
import Contact from './components/sections/Contact.jsx'
import NotFound from './pages/NotFound.jsx'

/**
 * Orden narrativo pensado para un reclutador:
 * quién soy → con qué trabajo → qué he construido → dónde lo he aplicado
 * → qué ofrezco → cómo contactarme.
 */
function Portfolio() {
  const { t } = useTranslation()
  const { scrollTo } = useSmoothScroll()

  useDocumentTitle(t.meta.title)

  // El enlace de salto no puede ser un ancla: al no haber elemento `#contenido`
  // navegable, se resuelve por código y se mueve el foco al contenido.
  const skipToContent = () => {
    const main = document.getElementById('contenido')
    if (!main) return
    scrollTo(main)
    main.focus({ preventScroll: true })
  }

  return (
    <>
      <button
        type="button"
        onClick={skipToContent}
        className="sr-only z-[80] rounded-full bg-violet px-4 py-2 text-sm font-medium text-void focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        {t.ui.skipToContent}
      </button>

      <Navbar />

      <main id="contenido" tabIndex={-1} className="outline-none">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Services />
        <Contact />
      </main>

      <Footer />
    </>
  )
}

/**
 * Única fuente de verdad para el desplazamiento.
 *
 * Cubre los dos casos: pulsar un ancla dentro de la misma página (cambia el
 * hash) y llegar a una sección desde otra ruta (cambia la ruta y el hash, por
 * ejemplo «Ver proyectos» desde el 404). `location.key` cambia en cada
 * navegación del router, así que sirve para detectar ambos.
 */
function ScrollManager() {
  const location = useLocation()
  const { scrollTo } = useSmoothScroll()

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: 'auto' })
      return
    }

    // Esperamos a que la vista destino esté pintada antes de desplazarnos.
    let frame = requestAnimationFrame(() => {
      const target = document.getElementById(location.hash.slice(1))
      if (target) scrollTo(target)
    })

    // Si la vista acaba de montarse (ruta nueva), un frame puede no bastar.
    const retry = window.setTimeout(() => {
      const target = document.getElementById(location.hash.slice(1))
      if (target) scrollTo(target)
    }, 320)

    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(retry)
    }
  }, [location.key, location.pathname, location.hash, scrollTo])

  return null
}

export default function App() {
  return (
    <LanguageProvider>
      {/* BrowserRouter: URLs limpias y una 404 real para rutas inexistentes.
          Requiere que el hosting devuelva index.html en rutas desconocidas
          (ver vercel.json). */}
      <BrowserRouter>
        <div className="relative min-h-screen overflow-x-clip bg-void">
          <ScrollManager />
          <Routes>
            <Route path="/" element={<Portfolio />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <NoiseOverlay />
        </div>
      </BrowserRouter>
    </LanguageProvider>
  )
}
