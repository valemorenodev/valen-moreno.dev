import Tilt from 'react-parallax-tilt'
import { useReducedMotion } from '../../hooks/useSmoothScroll.js'

/**
 * Tarjeta con profundidad 3D al pasar el cursor.
 * Con movimiento reducido devuelve el contenedor plano: mismo layout, sin tilt.
 */
export default function TiltCard({
  children,
  className = '',
  tiltMaxAngle = 7,
  glare = true,
  scale = 1.015,
}) {
  const reducedMotion = useReducedMotion()

  if (reducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <Tilt
      className={className}
      tiltMaxAngleX={tiltMaxAngle}
      tiltMaxAngleY={tiltMaxAngle}
      perspective={1100}
      scale={scale}
      transitionSpeed={1400}
      gyroscope={false}
      glareEnable={glare}
      glareMaxOpacity={0.12}
      glareColor="#b794ff"
      glarePosition="all"
      glareBorderRadius="20px"
      tiltEnable
    >
      {children}
    </Tilt>
  )
}
