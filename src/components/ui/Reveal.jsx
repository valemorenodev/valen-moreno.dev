import { motion } from 'motion/react'
import { useReducedMotion } from '../../hooks/useSmoothScroll.js'

/**
 * Aparición al entrar en pantalla, con la curva de easing de la casa.
 * Si la persona usuaria prefiere movimiento reducido, mostramos el contenido
 * sin desplazamiento (nunca oculto).
 */
export default function Reveal({
  children,
  as = 'div',
  delay = 0,
  y = 26,
  duration = 0.6,
  amount = 0.25,
  className = '',
  ...rest
}) {
  const reducedMotion = useReducedMotion()
  const Component = motion[as] ?? motion.div

  if (reducedMotion) {
    const Static = as
    return (
      <Static className={className} {...rest}>
        {children}
      </Static>
    )
  }

  return (
    <Component
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </Component>
  )
}
