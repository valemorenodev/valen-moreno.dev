import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

/**
 * Malla tipo "grafo de datos": wireframe con nodos en los vértices y conexiones
 * entre los cercanos. Encaja con el relato fintech (red de transacciones /
 * grafo de información) mejor que una esfera abstracta.
 *
 * Implementado con primitivas de three.js en lugar de ayudantes de terceros:
 * menos dependencias y un chunk notablemente más pequeño.
 */
export default function NetworkMesh({ count = 90, radius = 2.4 }) {
  const group = useRef(null)
  const inner = useRef(null)

  const nodeCloud = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const goldenAngle = Math.PI * (3 - Math.sqrt(5))

    for (let i = 0; i < count; i += 1) {
      const y = 1 - (i / Math.max(1, count - 1)) * 2
      const ringRadius = Math.sqrt(Math.max(0, 1 - y * y))
      const theta = goldenAngle * i
      const jitter = 0.94 + Math.random() * 0.12

      positions[i * 3] = Math.cos(theta) * ringRadius * radius * jitter
      positions[i * 3 + 1] = y * radius * jitter
      positions[i * 3 + 2] = Math.sin(theta) * ringRadius * radius * jitter
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const material = new THREE.PointsMaterial({
      color: '#b794ff',
      size: 0.055,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
    })

    return new THREE.Points(geometry, material)
  }, [count, radius])

  /** Un único LineSegments con todos los enlaces: una sola llamada de dibujo. */
  const linkSegments = useMemo(() => {
    const positions = nodeCloud.geometry.attributes.position.array
    const maxDistance = radius * 0.85
    const maxLinks = 70
    const points = []

    for (let i = 0; i < count && points.length / 6 < maxLinks; i += 1) {
      for (let j = i + 1; j < count && points.length / 6 < maxLinks; j += 1) {
        const dx = positions[i * 3] - positions[j * 3]
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1]
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2]

        if (Math.sqrt(dx * dx + dy * dy + dz * dz) < maxDistance) {
          points.push(
            positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
            positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2],
          )
        }
      }
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))

    const material = new THREE.LineBasicMaterial({
      color: '#8b5cf6',
      transparent: true,
      opacity: 0.26,
      depthWrite: false,
    })

    return new THREE.LineSegments(geometry, material)
  }, [nodeCloud, count, radius])

  // Liberamos la geometría y los materiales creados a mano.
  useEffect(
    () => () => {
      nodeCloud.geometry.dispose()
      nodeCloud.material.dispose()
      linkSegments.geometry.dispose()
      linkSegments.material.dispose()
    },
    [nodeCloud, linkSegments],
  )

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime

    if (group.current) {
      group.current.rotation.y += delta * 0.16
      group.current.rotation.x = Math.sin(t * 0.22) * 0.12
    }

    if (inner.current) {
      // "Respiración" suave de la malla interna.
      inner.current.scale.setScalar(1 + Math.sin(t * 0.9) * 0.025)
    }

    nodeCloud.rotation.y -= delta * 0.05
    linkSegments.rotation.y -= delta * 0.05
  })

  return (
    <group ref={group} dispose={null}>
      <group ref={inner}>
        <mesh>
          <icosahedronGeometry args={[radius * 0.72, 1]} />
          <meshBasicMaterial color="#a78bfa" wireframe transparent opacity={0.28} />
        </mesh>

        <mesh>
          <icosahedronGeometry args={[radius * 0.5, 0]} />
          <meshStandardMaterial
            color="#120f21"
            emissive="#8b5cf6"
            emissiveIntensity={0.35}
            metalness={0.85}
            roughness={0.28}
          />
        </mesh>
      </group>

      <primitive object={linkSegments} />
      <primitive object={nodeCloud} />
    </group>
  )
}
