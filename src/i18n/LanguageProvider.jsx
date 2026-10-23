import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import contentEs from '../data/content.es.json'
import contentEn from '../data/content.en.json'

export const DICTIONARIES = { es: contentEs, en: contentEn }
export const LANGUAGES = ['es', 'en']
const STORAGE_KEY = 'vm-portfolio-language'

export const LanguageContext = createContext(null)

/** Idioma inicial: preferencia guardada → idioma del navegador → español. */
function resolveInitialLanguage() {
  if (typeof window === 'undefined') return 'es'

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored && LANGUAGES.includes(stored)) return stored
  } catch {
    // localStorage puede estar bloqueado (modo privado): seguimos con el navegador.
  }

  const browser = window.navigator?.language?.slice(0, 2).toLowerCase()
  return LANGUAGES.includes(browser) ? browser : 'es'
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(resolveInitialLanguage)

  /**
   * Ojo: el título del documento NO se fija aquí. Lo decide cada vista, porque
   * un efecto del proveedor se ejecutaría después del de la vista hija y
   * pisaría el título propio de la página 404.
   */
  useEffect(() => {
    document.documentElement.lang = language

    try {
      window.localStorage.setItem(STORAGE_KEY, language)
    } catch {
      // Ignoramos el fallo de persistencia: la sesión actual sigue funcionando.
    }
  }, [language])

  const toggleLanguage = useCallback(() => {
    setLanguage((current) => (current === 'es' ? 'en' : 'es'))
  }, [])

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t: DICTIONARIES[language],
      isSpanish: language === 'es',
    }),
    [language, toggleLanguage],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useTranslation() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useTranslation debe usarse dentro de <LanguageProvider>')
  }
  return context
}
