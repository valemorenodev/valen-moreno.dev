import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import NetworkMesh from './NetworkMesh.jsx'

/** Deriva suave de cámara ligada al cursor: da profundidad sin marea visual. */
function CameraRig({ intensity = 0.34 }) {
  const camera = useThree((state) => state.camera)
  const pointer = useThree((state) => state.pointer)

  useFrame((_, delta) => {
    const targetX = pointer.x * intensity
    const targetY = pointer.y * intensity * 0.7

    // Interpolación exponencial: independiente de los FPS, sin saltos.
    const lerp = 1 - Math.pow(0.0015, delta)
    camera.position.x += (targetX - camera.position.x) * lerp
    camera.position.y += (targetY - camera.position.y) * lerp
    camera.lookAt(0, 0, 0)
  })

  return null
}

/** Flotación armónica del conjunto, sin dependencias externas. */
function FloatingGroup({ children, speed = 1, floatIntensity = 0.24, rotationIntensity = 0.14 }) {
  const ref = useRef(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed
    const group = ref.current
    if (!group) return

    group.position.y = Math.sin(t * 0.85) * floatIntensity
    group.position.x = Math.sin(t * 0.42) * floatIntensity * 0.35
    group.rotation.x = Math.sin(t * 0.55) * rotationIntensity
    group.rotation.z = Math.sin(t * 0.38) * rotationIntensity * 0.5
  })

  return <group ref={ref}>{children}</group>
}

/** Sombra de contacto falsa: un plano con degradado radial suave. */
function SoftShadow({ radius = 3.4, opacity = 0.34, y = -2.6 }) {
  const texture = useMemo(() => {
    const size = 512
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size

    const context = canvas.getContext('2d')
    const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    // El degradado debe agotarse mucho antes del borde: si no, el plano se ve
    // como un rectángulo recortado sobre el fondo.
    gradient.addColorStop(0, 'rgba(139, 92, 246, 0.55)')
    gradient.addColorStop(0.32, 'rgba(139, 92, 246, 0.14)')
    gradient.addColorStop(0.62, 'rgba(139, 92, 246, 0.02)')
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0)')

    context.fillStyle = gradient
    context.fillRect(0, 0, size, size)

    const map = new THREE.CanvasTexture(canvas)
    map.colorSpace = THREE.SRGBColorSpace
    return map
  }, [])

  useEffect(() => () => texture.dispose(), [texture])

  return (
    <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[radius * 2, radius * 2]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

/** Campo de partículas lejano para dar sensación de profundidad. */
function DustField({ count = 220 }) {
  const points = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 14
      positions[i * 3 + 1] = (Math.random() - 0.5) * 9
      positions[i * 3 + 2] = (Math.random() - 0.5) * 7 - 2
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const material = new THREE.PointsMaterial({
      color: '#c4b5fd',
      size: 0.035,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
    })

    return new THREE.Points(geometry, material)
  }, [count])

  useEffect(
    () => () => {
      points.geometry.dispose()
      points.material.dispose()
    },
    [points],
  )

  useFrame((state, delta) => {
    points.rotation.y += delta * 0.015
    points.position.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.12
  })

  return <primitive object={points} />
}

/** Ajusta la distancia focal según el ancho disponible para no recortar la malla. */
function ResponsiveCamera() {
  const camera = useThree((state) => state.camera)
  const width = useThree((state) => state.size.width)

  useEffect(() => {
    camera.fov = width < 640 ? 64 : width < 1024 ? 50 : 44
    camera.updateProjectionMatrix()
  }, [camera, width])

  return null
}

export default function HeroScene({ className = '' }) {
  // En móviles reducimos densidad de geometría y de partículas.
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)')
    const update = () => setCompact(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return (
    <div className={className}>
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 7.2], fov: 45 }}
      >
        <ResponsiveCamera />
        <CameraRig />

        <ambientLight intensity={0.55} />
        {/* Las tres luces se quedan dentro de la familia violeta para que la
            malla no derive a otro tono; el cyan solo asoma como contra-luz suave. */}
        <directionalLight position={[4, 5, 3]} intensity={1.15} color="#a78bfa" />
        <pointLight position={[-5, -2, -3]} intensity={26} color="#7c3aed" distance={15} />
        <pointLight position={[3, 3, 4]} intensity={14} color="#22d3ee" distance={13} />

        <Suspense fallback={null}>
          <FloatingGroup speed={1} floatIntensity={0.26} rotationIntensity={0.16}>
            <NetworkMesh count={compact ? 55 : 95} radius={compact ? 2.1 : 2.45} />
          </FloatingGroup>

          <DustField count={compact ? 110 : 220} />
          <SoftShadow radius={compact ? 4 : 5} />
        </Suspense>
      </Canvas>
    </div>
  )
}
