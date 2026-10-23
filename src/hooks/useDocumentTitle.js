import { useEffect } from 'react'

/**
 * Fija el título del documento mientras la vista está montada.
 * El `LanguageProvider` no lo toca a propósito: cada vista decide el suyo.
 */
export function useDocumentTitle(title) {
  useEffect(() => {
    if (title) document.title = title
  }, [title])
}
