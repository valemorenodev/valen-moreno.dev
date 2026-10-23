/**
 * Orden y anclas de las secciones. Es la única fuente de verdad: la usan la
 * navegación, el resaltado de sección activa y la validación de enlaces.
 */
export const SECTIONS = [
  { id: 'inicio', navKey: null },
  { id: 'sobre-mi', navKey: 'about' },
  { id: 'stack', navKey: 'skills' },
  { id: 'proyectos', navKey: 'projects' },
  { id: 'experiencia', navKey: 'experience' },
  { id: 'servicios', navKey: 'services' },
  { id: 'contacto', navKey: 'contact' },
]

export const NAV_SECTIONS = SECTIONS.filter((section) => section.navKey)

export const SECTION_IDS = SECTIONS.map((section) => section.id)

/**
 * Enlaces internos del portafolio.
 *
 * Con BrowserRouter la ruta vive en el *path* (`/`) y el ancla sigue siendo un
 * fragmento normal (`#proyectos`), así que el enlace es el ancla de toda la vida.
 * `ScrollManager` (App.jsx) es quien anima el desplazamiento.
 */
export const sectionHref = (id) => `#${id}`

/** Ruta de la portada. Al ir a una sección desde otra página se usa `/#seccion`. */
export const HOME_PATH = '/'

export const homeSectionHref = (id) => `${HOME_PATH}#${id}`

