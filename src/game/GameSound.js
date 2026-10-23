/**
 * Efectos de sonido sintetizados con la Web Audio API.
 *
 * No se carga ningún archivo de audio: los tonos se generan en el navegador.
 * Eso evita peso en el bundle y dependencias externas, y es suficiente para un
 * minijuego de este tamaño.
 */

const MUTE_KEY = 'vm-runner-muted'

export class GameSound {
  constructor() {
    this.ctx = null
    this.muted = false

    try {
      this.muted = window.localStorage.getItem(MUTE_KEY) === '1'
    } catch {
      // localStorage bloqueado: seguimos con sonido activado.
    }
  }

  /** El AudioContext solo puede crearse tras una interacción del usuario. */
  ensure() {
    if (this.muted) return null

    if (!this.ctx) {
      const AudioContextClass = window.AudioContext ?? window.webkitAudioContext
      if (!AudioContextClass) return null
      this.ctx = new AudioContextClass()
    }

    // Los navegadores suspenden el contexto hasta que hay gesto del usuario.
    if (this.ctx.state === 'suspended') this.ctx.resume()

    return this.ctx
  }

  setMuted(muted) {
    this.muted = muted
    try {
      window.localStorage.setItem(MUTE_KEY, muted ? '1' : '0')
    } catch {
      // Sin persistencia, pero el cambio se aplica en esta sesión.
    }
  }

  toggleMute() {
    this.setMuted(!this.muted)
    return this.muted
  }

  /** Programa un tono simple con envolvente para evitar clics. */
  tone({ frequency, endFrequency, duration, type = 'square', volume = 0.06, delay = 0 }) {
    const ctx = this.ensure()
    if (!ctx) return

    const start = ctx.currentTime + delay
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()

    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, start)
    if (endFrequency) {
      oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + duration)
    }

    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.linearRampToValueAtTime(volume, start + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)

    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.start(start)
    oscillator.stop(start + duration + 0.02)
  }

  jump() {
    this.tone({ frequency: 380, endFrequency: 720, duration: 0.1, type: 'square', volume: 0.05 })
  }

  coin() {
    this.tone({ frequency: 940, duration: 0.07, type: 'triangle', volume: 0.05 })
    this.tone({ frequency: 1420, duration: 0.1, type: 'triangle', volume: 0.04, delay: 0.06 })
  }

  death() {
    this.tone({ frequency: 320, endFrequency: 70, duration: 0.4, type: 'sawtooth', volume: 0.07 })
  }

  start() {
    this.tone({ frequency: 520, endFrequency: 880, duration: 0.12, type: 'triangle', volume: 0.05 })
  }
}
