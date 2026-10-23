/**
 * Motor del minijuego estilo Geometry Dash.
 *
 * Es una clase independiente de React: recibe un canvas y notifica cambios por
 * callbacks. Así el bucle de juego nunca provoca renders de React y el
 * componente solo se ocupa de la interfaz.
 */

export const GAME = {
  // Lienzo lógico. Proporción 820x340: da altura suficiente para leer el salto
  // sin que el panel del juego se vuelva desproporcionado en la columna lateral.
  width: 820,
  height: 340,
  groundY: 282,
  playerX: 130,
  playerSize: 36,
  spikeWidth: 26,
  spikeHeight: 30,
  blockHeight: 30,
  // Física: con estos valores el salto alcanza ~142 px y dura ~0,66 s,
  // suficiente para superar un pincho y caer justo antes del siguiente.
  gravity: 2600,
  jumpVelocity: -860,
  // La dificultad es relativa al ancho, así que la velocidad acompaña al recorte.
  baseSpeed: 300,
  maxSpeed: 640,
  // Segundos de recorrido para alcanzar la velocidad máxima.
  rampSeconds: 75,
  // Margen de cortesía en las colisiones: se perdona un borde, nunca el centro.
  hitboxInset: 5,
}

const COIN_RADIUS = 11

/** Espaciado mínimo entre grupos, según dificultad de 0 a 1. */
function gapFor(difficulty) {
  return 330 - 130 * difficulty
}

function choosePattern(difficulty, random) {
  const roll = random()
  if (difficulty < 0.15) return 'single'
  if (roll < 0.34) return 'single'
  if (roll < 0.62) return 'double'
  if (roll < 0.78 && difficulty > 0.3) return 'stack'
  if (roll < 0.9) return 'stair'
  return 'triple'
}

/** Genera la geometría de un grupo de obstáculos alrededor de `x`. */
function buildPattern(kind, x, difficulty, random) {
  const obstacles = []
  const step = GAME.spikeWidth + 4

  switch (kind) {
    case 'double':
      obstacles.push({ x, y: GAME.groundY - GAME.spikeHeight, w: GAME.spikeWidth, h: GAME.spikeHeight, type: 'spike' })
      obstacles.push({ x: x + step, y: GAME.groundY - GAME.spikeHeight, w: GAME.spikeWidth, h: GAME.spikeHeight, type: 'spike' })
      break

    case 'triple':
      for (let i = 0; i < 3; i += 1) {
        obstacles.push({
          x: x + step * i,
          y: GAME.groundY - GAME.spikeHeight,
          w: GAME.spikeWidth,
          h: GAME.spikeHeight,
          type: 'spike',
        })
      }
      break

    case 'stack': {
      // Bloque con un pincho encima: obliga a saltar pronto y largo.
      const blockX = x + 30
      obstacles.push({
        x: blockX,
        y: GAME.groundY - GAME.blockHeight,
        w: GAME.spikeWidth + 22,
        h: GAME.blockHeight,
        type: 'block',
      })
      obstacles.push({
        x: blockX + 8,
        y: GAME.groundY - GAME.blockHeight - GAME.spikeHeight + 4,
        w: GAME.spikeWidth,
        h: GAME.spikeHeight - 4,
        type: 'spike',
      })
      break
    }

    case 'stair': {
      const firstX = x
      obstacles.push({
        x: firstX,
        y: GAME.groundY - GAME.blockHeight,
        w: 34,
        h: GAME.blockHeight,
        type: 'block',
      })
      obstacles.push({
        x: firstX + 74,
        y: GAME.groundY - GAME.blockHeight * 2,
        w: 34,
        h: GAME.blockHeight * 2,
        type: 'block',
      })
      if (difficulty > 0.5 && random() < 0.5) {
        obstacles.push({
          x: firstX + 148,
          y: GAME.groundY - GAME.spikeHeight,
          w: GAME.spikeWidth,
          h: GAME.spikeHeight,
          type: 'spike',
        })
      }
      break
    }

    default:
      obstacles.push({ x, y: GAME.groundY - GAME.spikeHeight, w: GAME.spikeWidth, h: GAME.spikeHeight, type: 'spike' })
  }

  const width = obstacles.length
    ? Math.max(...obstacles.map((o) => o.x + o.w)) - x
    : GAME.spikeWidth

  return { obstacles, width }
}

export class RunnerEngine {
  constructor(canvas, options = {}) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.onState = options.onState ?? (() => {})
    this.onScore = options.onScore ?? (() => {})
    this.onDeath = options.onDeath ?? (() => {})
    this.random = options.random ?? Math.random
    // Con movimiento reducido quitamos la sacudida de cámara; el juego sigue
    // jugándose (es intrínsecamente animado), pero sin vibración de pantalla.
    this.reducedMotion = Boolean(options.reducedMotion)

    this.raf = 0
    this.lastTime = 0
    this.sound = null

    this.state = {
      status: 'ready',
      distance: 0,
      coins: 0,
      speed: GAME.baseSpeed,
      best: Number(options.best ?? 0),
    }

    this.player = { y: 0, vy: 0, rotation: 0, jumps: 0 }
    this.obstacles = []
    this.coins = []
    this.particles = []
    this.dust = []
    this.trail = []
    this.nextSpawnX = GAME.width + 260
    this.groundOffset = 0
    this.gridOffset = 0
    this.shake = 0
    this.flash = 0
    this.stars = Array.from({ length: 46 }, () => ({
      x: this.random() * GAME.width,
      y: this.random() * (GAME.groundY - 60),
      r: 0.6 + this.random() * 1.5,
      depth: 0.2 + this.random() * 0.8,
    }))

    this.resize()
    this.reset()
  }

  /** Ajusta el lienzo al tamaño real y a la densidad de píxeles del dispositivo. */
  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const rect = this.canvas.getBoundingClientRect()
    const cssWidth = rect.width || GAME.width
    const cssHeight = cssWidth * (GAME.height / GAME.width)

    this.canvas.width = Math.round(cssWidth * dpr)
    this.canvas.height = Math.round(cssHeight * dpr)
    this.canvas.style.height = `${cssHeight}px`

    // Trabajamos siempre en coordenadas lógicas y escalamos el contexto.
    this.scale = this.canvas.width / GAME.width
    this.cssHeight = cssHeight
  }

  reset() {
    this.player.y = 0
    this.player.vy = 0
    this.player.rotation = 0
    this.player.jumps = 0
    this.obstacles = []
    this.coins = []
    this.particles = []
    this.trail = []
    this.nextSpawnX = GAME.width + 320
    this.state.distance = 0
    this.state.coins = 0
    this.state.speed = GAME.baseSpeed
    this.shake = 0
    this.flash = 0
    this.emitScore()
  }

  attachSound(sound) {
    this.sound = sound
  }

  /** Constantes de ajuste del juego (las usan también los scripts de verificación). */
  getConfig() {
    return GAME
  }

  setState(status) {
    if (this.state.status === status) return
    this.state.status = status
    this.onState(status)
  }

  emitScore() {
    this.onScore({ distance: Math.floor(this.state.distance), coins: this.state.coins })
  }

  get difficulty() {
    return Math.min(1, this.state.distance / (GAME.baseSpeed * GAME.rampSeconds))
  }

  start() {
    this.reset()
    this.setState('playing')
  }

  jump() {
    if (this.state.status === 'ready') {
      this.start()
      return
    }

    if (this.state.status !== 'playing') return

    // Solo se puede saltar desde el suelo: es la regla del juego original.
    if (this.player.y > 0.5) return

    this.player.vy = GAME.jumpVelocity
    this.player.jumps += 1
    this.sound?.jump()

    for (let i = 0; i < 9; i += 1) {
      this.dust.push({
        x: GAME.playerX + GAME.playerSize / 2,
        y: GAME.groundY,
        vx: (this.random() - 0.5) * 190 - 40,
        vy: -this.random() * 130,
        life: 0.45,
        max: 0.45,
        size: 1.5 + this.random() * 3,
      })
    }
  }

  die() {
    this.setState('dead')
    this.shake = this.reducedMotion ? 0 : 15
    this.flash = 0.85
    this.sound?.death()

    const cx = GAME.playerX
    const cy = GAME.groundY - GAME.playerSize / 2 - this.player.y

    for (let i = 0; i < 34; i += 1) {
      const angle = (Math.PI * 2 * i) / 34 + this.random() * 0.4
      const speed = 90 + this.random() * 330
      this.particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 90,
        life: 0.75,
        max: 0.75,
        size: 2 + this.random() * 5,
        // Explosión en la familia violeta, con un tono casi blanco para que
        // conserve contraste sobre el fondo oscuro.
        color: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ede9fe'][Math.floor(this.random() * 4)],
      })
    }

    const distance = Math.floor(this.state.distance)
    const isRecord = distance > this.state.best
    if (isRecord) this.state.best = distance

    this.onDeath({ distance, coins: this.state.coins, isRecord, best: this.state.best })
  }

  /* ------------------------------------------------------------------ */
  /* Simulación                                                          */
  /* ------------------------------------------------------------------ */

  update(dt) {
    const { status } = this.state

    if (status === 'playing') {
      this.state.speed = Math.min(
        GAME.maxSpeed,
        GAME.baseSpeed + (GAME.maxSpeed - GAME.baseSpeed) * this.difficulty,
      )
      this.state.distance += (this.state.speed * dt) / 40

      this.groundOffset = (this.groundOffset + this.state.speed * dt) % 40
      this.gridOffset = (this.gridOffset + this.state.speed * dt * 0.55) % 90

      // Física vertical.
      this.player.vy += GAME.gravity * dt
      this.player.y -= this.player.vy * dt

      if (this.player.y <= 0) {
        if (this.player.vy > 0) {
          for (let i = 0; i < 4; i += 1) {
            this.dust.push({
              x: GAME.playerX + GAME.playerSize / 2,
              y: GAME.groundY,
              vx: (this.random() - 0.5) * 120,
              vy: -this.random() * 70,
              life: 0.3,
              max: 0.3,
              size: 1 + this.random() * 2,
            })
          }
        }
        this.player.y = 0
        this.player.vy = 0
      }

      this.spawn()
      this.moveObstacles(dt)
      this.moveCoins(dt)
      this.detectCollisions()
      this.updateTrail(dt)
      this.emitScore()
    } else if (status === 'dead') {
      // El cubo sigue cayendo fuera de pantalla tras chocar.
      this.player.vy += GAME.gravity * dt
      this.player.y -= this.player.vy * dt
    }

    // La rotación persigue un cuarto de vuelta por salto: efecto imán.
    const targetRotation = (this.player.jumps * Math.PI) / 2
    this.player.rotation += (targetRotation - this.player.rotation) * Math.min(1, dt * 9)

    this.shake *= Math.pow(0.0025, dt)
    this.flash = Math.max(0, this.flash - dt * 2.4)

    this.updateParticles(dt)
    this.updateDust(dt)

    this.stars.forEach((star) => {
      if (star.x < -4) {
        star.x = GAME.width + 4
        star.y = this.random() * (GAME.groundY - 60)
      }
      star.x -= this.state.speed * dt * star.depth * (status === 'playing' ? 1 : 0.15)
    })
  }

  spawn() {
    // Genera mientras el último grupo esté cerca del borde derecho.
    while (this.nextSpawnX < GAME.width + 500) {
      const kind = choosePattern(this.difficulty, this.random)
      const { obstacles, width } = buildPattern(kind, this.nextSpawnX, this.difficulty, this.random)
      this.obstacles.push(...obstacles)

      // Moneda opcional sobre el hueco, para premiar el salto largo.
      if (this.random() < 0.3) {
        const coinX = this.nextSpawnX + width + 60
        this.coins.push({
          x: coinX,
          y: GAME.groundY - 78 - this.random() * 40,
          taken: false,
          spin: this.random() * Math.PI,
        })
      }

      this.nextSpawnX += width + gapFor(this.difficulty) + this.random() * 90
    }
  }

  moveObstacles(dt) {
    const shift = this.state.speed * dt

    for (let i = this.obstacles.length - 1; i >= 0; i -= 1) {
      this.obstacles[i].x -= shift
      if (this.obstacles[i].x + this.obstacles[i].w < -40) this.obstacles.splice(i, 1)
    }

    // Reajustamos el cursor de aparición junto con el desplazamiento del mundo.
    this.nextSpawnX -= shift
  }

  moveCoins(dt) {
    const shift = this.state.speed * dt

    for (let i = this.coins.length - 1; i >= 0; i -= 1) {
      const coin = this.coins[i]
      coin.x -= shift
      coin.spin += dt * 4

      if (!coin.taken && this.overlapsCoin(coin)) {
        coin.taken = true
        this.state.coins += 1
        this.sound?.coin()
        this.burst(coin.x, coin.y, '#ffc46b', 12)
        this.coins.splice(i, 1)
        continue
      }

      if (coin.x < -40) this.coins.splice(i, 1)
    }
  }

  playerBox(atY = this.player.y) {
    return {
      x: GAME.playerX + GAME.hitboxInset,
      y: GAME.groundY - GAME.playerSize - atY + GAME.hitboxInset,
      w: GAME.playerSize - GAME.hitboxInset * 2,
      h: GAME.playerSize - GAME.hitboxInset * 2,
    }
  }

  overlapsCoin(coin) {
    const box = this.playerBox()
    const cx = Math.max(box.x, Math.min(coin.x, box.x + box.w))
    const cy = Math.max(box.y, Math.min(coin.y, box.y + box.h))
    const dx = coin.x - cx
    const dy = coin.y - cy
    return dx * dx + dy * dy < COIN_RADIUS * COIN_RADIUS
  }

  detectCollisions() {
    const box = this.playerBox()

    for (const obstacle of this.obstacles) {
      const inset = GAME.hitboxInset
      const ox = obstacle.x + inset
      const oy = obstacle.y + inset
      const ow = obstacle.w - inset * 2
      const oh = obstacle.h - inset * 2

      const hit =
        box.x < ox + ow && box.x + box.w > ox && box.y < oy + oh && box.y + box.h > oy

      if (hit) {
        this.die()
        return
      }
    }
  }

  updateTrail(dt) {
    this.trail.unshift({
      x: GAME.playerX,
      y: GAME.groundY - this.player.y,
      life: 0.3,
    })
    if (this.trail.length > 9) this.trail.pop()
    this.trail.forEach((point) => {
      point.life -= dt
    })
  }

  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i -= 1) {
      const particle = this.particles[i]
      particle.vy += 900 * dt
      particle.x += particle.vx * dt
      particle.y += particle.vy * dt
      particle.life -= dt
      if (particle.life <= 0) this.particles.splice(i, 1)
    }
  }

  updateDust(dt) {
    for (let i = this.dust.length - 1; i >= 0; i -= 1) {
      const puff = this.dust[i]
      puff.x += puff.vx * dt
      puff.y += puff.vy * dt
      puff.life -= dt
      if (puff.life <= 0) this.dust.splice(i, 1)
    }
  }

  burst(x, y, color, count) {
    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * 150,
        vy: Math.sin(angle) * 150,
        life: 0.45,
        max: 0.45,
        size: 2 + this.random() * 3,
        color,
      })
    }
  }

  /* ------------------------------------------------------------------ */
  /* Dibujo                                                             */
  /* ------------------------------------------------------------------ */

  draw() {
    const ctx = this.ctx
    ctx.setTransform(this.scale, 0, 0, this.scale, 0, 0)
    ctx.clearRect(0, 0, GAME.width, GAME.height)

    ctx.save()
    if (this.shake > 0.4) {
      ctx.translate((this.random() - 0.5) * this.shake, (this.random() - 0.5) * this.shake)
    }

    this.drawBackground(ctx)
    this.drawCoins(ctx)
    this.drawObstacles(ctx)
    this.drawDust(ctx)
    this.drawTrail(ctx)
    this.drawPlayer(ctx)
    this.drawParticles(ctx)
    this.drawGround(ctx)

    ctx.restore()

    if (this.flash > 0.01) {
      ctx.fillStyle = `rgba(255, 122, 156, ${this.flash * 0.4})`
      ctx.fillRect(0, 0, GAME.width, GAME.height)
    }
  }

  drawBackground(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME.height)
    gradient.addColorStop(0, '#0a0716')
    gradient.addColorStop(0.65, '#0d0a1e')
    gradient.addColorStop(1, '#08060f')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, GAME.width, GAME.height)

    // Estrellas con parallax.
    ctx.fillStyle = 'rgba(183, 148, 255, 0.5)'
    this.stars.forEach((star) => {
      ctx.globalAlpha = 0.15 + star.depth * 0.55
      ctx.beginPath()
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.globalAlpha = 1

    // Rejilla vertical lejana.
    ctx.strokeStyle = 'rgba(183, 148, 255, 0.09)'
    ctx.lineWidth = 1
    for (let x = -this.gridOffset; x < GAME.width + 90; x += 90) {
      ctx.beginPath()
      ctx.moveTo(x, 40)
      ctx.lineTo(x, GAME.groundY)
      ctx.stroke()
    }

    // Horizonte con brillo.
    const glow = ctx.createLinearGradient(0, GAME.groundY - 90, 0, GAME.groundY)
    glow.addColorStop(0, 'rgba(139, 92, 246, 0)')
    glow.addColorStop(1, 'rgba(139, 92, 246, 0.18)')
    ctx.fillStyle = glow
    ctx.fillRect(0, GAME.groundY - 90, GAME.width, 90)
  }

  drawGround(ctx) {
    ctx.fillStyle = '#0d0a1c'
    ctx.fillRect(0, GAME.groundY, GAME.width, GAME.height - GAME.groundY)

    ctx.strokeStyle = '#8b5cf6'
    ctx.lineWidth = 3
    ctx.shadowColor = '#8b5cf6'
    ctx.shadowBlur = 16
    ctx.beginPath()
    ctx.moveTo(0, GAME.groundY)
    ctx.lineTo(GAME.width, GAME.groundY)
    ctx.stroke()
    ctx.shadowBlur = 0

    // Marcas del suelo en movimiento.
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.35)'
    ctx.lineWidth = 2
    for (let x = -this.groundOffset; x < GAME.width + 40; x += 40) {
      ctx.beginPath()
      ctx.moveTo(x, GAME.groundY + 4)
      ctx.lineTo(x - 10, GAME.height)
      ctx.stroke()
    }
  }

  drawObstacles(ctx) {
    this.obstacles.forEach((obstacle) => {
      if (obstacle.type === 'block') {
        const gradient = ctx.createLinearGradient(0, obstacle.y, 0, obstacle.y + obstacle.h)
        gradient.addColorStop(0, '#8b5cf6')
        gradient.addColorStop(1, '#4c2a9e')
        ctx.fillStyle = gradient
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h)

        ctx.strokeStyle = 'rgba(183, 148, 255, 0.9)'
        ctx.lineWidth = 2
        ctx.strokeRect(obstacle.x + 1, obstacle.y + 1, obstacle.w - 2, obstacle.h - 2)
      } else {
        ctx.beginPath()
        ctx.moveTo(obstacle.x, obstacle.y + obstacle.h)
        ctx.lineTo(obstacle.x + obstacle.w / 2, obstacle.y)
        ctx.lineTo(obstacle.x + obstacle.w, obstacle.y + obstacle.h)
        ctx.closePath()

        const gradient = ctx.createLinearGradient(0, obstacle.y, 0, obstacle.y + obstacle.h)
        gradient.addColorStop(0, '#ff7a9c')
        gradient.addColorStop(1, '#a82047')
        ctx.fillStyle = gradient
        ctx.shadowColor = 'rgba(255, 122, 156, 0.8)'
        ctx.shadowBlur = 12
        ctx.fill()
        ctx.shadowBlur = 0

        ctx.strokeStyle = 'rgba(255, 200, 215, 0.85)'
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
    })
  }

  drawCoins(ctx) {
    this.coins.forEach((coin) => {
      const squash = Math.abs(Math.cos(coin.spin))
      ctx.save()
      ctx.translate(coin.x, coin.y)

      ctx.beginPath()
      ctx.arc(0, 0, COIN_RADIUS, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 196, 107, 0.18)'
      ctx.fill()

      ctx.beginPath()
      ctx.ellipse(0, 0, COIN_RADIUS * (0.25 + squash * 0.75), COIN_RADIUS, 0, 0, Math.PI * 2)
      ctx.fillStyle = '#ffc46b'
      ctx.shadowColor = '#ffc46b'
      ctx.shadowBlur = 14
      ctx.fill()
      ctx.shadowBlur = 0

      ctx.beginPath()
      ctx.ellipse(0, 0, COIN_RADIUS * 0.42 * (0.25 + squash * 0.75), COIN_RADIUS * 0.45, 0, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'
      ctx.fill()

      ctx.restore()
    })
  }

  drawTrail(ctx) {
    this.trail.forEach((point, index) => {
      const alpha = Math.max(0, (point.life / 0.3) * 0.22 * (1 - index / this.trail.length))
      if (alpha <= 0.01) return
      const size = GAME.playerSize * (1 - index / (this.trail.length * 1.6))
      ctx.fillStyle = `rgba(183, 148, 255, ${alpha})`
      ctx.fillRect(
        point.x + (GAME.playerSize - size) / 2 - index * 5,
        point.y - GAME.playerSize + (GAME.playerSize - size) / 2,
        size,
        size,
      )
    })
  }

  drawPlayer(ctx) {
    const cx = GAME.playerX + GAME.playerSize / 2
    const cy = GAME.groundY - GAME.playerSize / 2 - this.player.y

    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(this.player.rotation)

    ctx.shadowColor = '#8b5cf6'
    ctx.shadowBlur = 22
    ctx.fillStyle = '#8b5cf6'
    ctx.fillRect(-GAME.playerSize / 2, -GAME.playerSize / 2, GAME.playerSize, GAME.playerSize)

    ctx.shadowBlur = 0
    ctx.fillStyle = '#08060f'
    ctx.fillRect(-GAME.playerSize / 2 + 6, -GAME.playerSize / 2 + 6, GAME.playerSize - 12, GAME.playerSize - 12)

    // Núcleo claro: mantiene la lectura del cubo sobre el violeta.
    ctx.fillStyle = '#ede9fe'
    ctx.fillRect(-GAME.playerSize / 2 + 12, -GAME.playerSize / 2 + 12, 8, 8)

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.lineWidth = 1.5
    ctx.strokeRect(-GAME.playerSize / 2, -GAME.playerSize / 2, GAME.playerSize, GAME.playerSize)

    ctx.restore()
  }

  drawParticles(ctx) {
    this.particles.forEach((particle) => {
      ctx.globalAlpha = Math.max(0, particle.life / particle.max)
      ctx.fillStyle = particle.color
      ctx.fillRect(particle.x, particle.y, particle.size, particle.size)
    })
    ctx.globalAlpha = 1
  }

  drawDust(ctx) {
    this.dust.forEach((puff) => {
      ctx.globalAlpha = Math.max(0, (puff.life / puff.max) * 0.6)
      // Polvo del salto: violeta claro en lugar del antiguo verde menta.
      ctx.fillStyle = '#c4b5fd'
      ctx.fillRect(puff.x, puff.y, puff.size, puff.size)
    })
    ctx.globalAlpha = 1
  }

  /* ------------------------------------------------------------------ */
  /* Bucle                                                              */
  /* ------------------------------------------------------------------ */

  loop = (timestamp) => {
    if (!this.lastTime) this.lastTime = timestamp
    // Limitamos el delta para que una pestaña en segundo plano no teletransporte
    // al jugador a través de los obstáculos al volver.
    const dt = Math.min(0.032, (timestamp - this.lastTime) / 1000)
    this.lastTime = timestamp

    this.update(dt)
    this.draw()
    this.raf = requestAnimationFrame(this.loop)
  }

  run() {
    if (this.raf) return
    this.lastTime = 0
    this.raf = requestAnimationFrame(this.loop)
  }

  stop() {
    cancelAnimationFrame(this.raf)
    this.raf = 0
  }

  destroy() {
    this.stop()
  }
}
