import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { useRef } from 'react'

/**
 * Capa con desplazamiento parallax real sobre el scroll de la página.
 * `speed` positivo mueve la capa más despacio que el scroll (sensación de lejanía);
 * negativo la adelanta (sensación de cercanía).
 */
export default function ParallaxLayer({
  children,
  speed = 40,
  rotate = 0,
  scaleRange = 0,
  className = '',
  spring = true,
}) {
  const ref = useRef(null)
  const prefersReduced = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.4 })
  const progress = spring ? smooth : scrollYProgress

  const y = useTransform(progress, [0, 1], [speed, -speed])
  const rotateZ = useTransform(progress, [0, 1], [-rotate, rotate])
  const scale = useTransform(progress, [0, 0.5, 1], [1 - scaleRange, 1, 1 - scaleRange])

  if (prefersReduced) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      ref={ref}
      style={{ y, rotate: rotate ? rotateZ : undefined, scale: scaleRange ? scale : undefined }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
