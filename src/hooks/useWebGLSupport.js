import { useEffect, useState } from 'react'

/**
 * Detecta soporte de WebGL antes de montar la escena 3D.
 * Si no hay soporte (o el contexto se pierde), mostramos un degradado estático
 * en lugar de dejar un canvas vacío ocupando espacio.
 */
export function useWebGLSupport() {
  const [supported, setSupported] = useState(null)

  useEffect(() => {
    let canvas

    try {
      canvas = document.createElement('canvas')
      const context =
        canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl')

      setSupported(Boolean(context))

      // Liberamos el contexto de prueba para no consumir uno de los limitados
      // contextos WebGL del navegador.
      context?.getExtension('WEBGL_lose_context')?.loseContext()
    } catch {
      setSupported(false)
    } finally {
      canvas = null
    }
  }, [])

  return supported
}
