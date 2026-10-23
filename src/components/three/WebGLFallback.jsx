import { useEffect } from 'react'

/** Marca el documento cuando WebGL no está disponible, para poder avisar por CSS. */
export default function WebGLFallback() {
  useEffect(() => {
    document.documentElement.dataset.webgl = 'unsupported'
    return () => {
      delete document.documentElement.dataset.webgl
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden rounded-[2rem]"
      style={{ contain: 'paint' }}
    >
      <div className="absolute top-1/2 left-1/2 size-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet/12 blur-3xl" />
      <div className="absolute top-1/3 right-8 size-64 rounded-full bg-indigo/12 blur-3xl" />
      <div className="absolute bottom-10 left-6 size-52 rounded-full bg-cyan/10 blur-3xl" />
    </div>
  )
}
