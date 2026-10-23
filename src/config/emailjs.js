/**
 * Configuración de EmailJS.
 *
 * Las credenciales se leen de variables de entorno (Vite solo expone las que
 * empiezan por `VITE_`). Se mantienen los valores por defecto para no romper el
 * despliegue actual, pero lo recomendable es definirlas en un archivo `.env`
 * local y en las variables del proveedor de hosting.
 *
 * Nota de seguridad: en EmailJS la "public key" es pública por diseño; el riesgo
 * a evitar es dejar el identificador de plantilla y servicio hardcodeado en el
 * repositorio, ya que facilita el spam si el sitio se copia.
 */
const env = import.meta.env ?? {}

export const EMAILJS_CONFIG = {
  publicKey: env.VITE_EMAILJS_PUBLIC_KEY ?? 'AmdLUtFXN7QyLtLIO',
  serviceId: env.VITE_EMAILJS_SERVICE_ID ?? 'service_wwompuo',
  templateId: env.VITE_EMAILJS_TEMPLATE_ID ?? 'template_3qocs2t',
}

export const isEmailJsConfigured = Boolean(
  EMAILJS_CONFIG.publicKey && EMAILJS_CONFIG.serviceId && EMAILJS_CONFIG.templateId,
)
