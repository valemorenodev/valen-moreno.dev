/**
 * Verificacion visual y de runtime del portafolio.
 *
 * Usa Chrome headless + protocolo DevTools (CDP) a traves del WebSocket nativo
 * de Node (`node --experimental-websocket`). Sin puppeteer ni playwright.
 *
 * Uso: node --experimental-websocket scripts/verify.mjs [puerto] [carpeta]
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

const PORT = Number(process.argv[2] ?? 5199)
const OUT_DIR = path.resolve(process.argv[3] ?? 'tmp-screens')
const DEBUG_PORT = 9333
const BASE_URL = `http://localhost:${PORT}/`

const CHROME_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe`,
]

const DESKTOP = { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false }
const MOBILE = { width: 390, height: 844, deviceScaleFactor: 2, mobile: true }

const SECTION_SHOTS = ['sobre-mi', 'stack', 'proyectos', 'experiencia', 'servicios', 'contacto', 'pie']

class CDP {
  #ws
  #id = 0
  #pending = new Map()
  problems = []

  static async attach(wsUrl) {
    const client = new CDP()
    client.#ws = new WebSocket(wsUrl)

    await new Promise((resolve, reject) => {
      client.#ws.addEventListener('open', resolve, { once: true })
      client.#ws.addEventListener('error', () => reject(new Error('no se pudo abrir el socket CDP')), { once: true })
    })

    client.#ws.addEventListener('message', (event) => {
      let message
      try {
        message = JSON.parse(event.data)
      } catch {
        return
      }

      if (message.id && client.#pending.has(message.id)) {
        const entry = client.#pending.get(message.id)
        client.#pending.delete(message.id)
        if (message.error) entry.reject(new Error(`${entry.method}: ${message.error.message}`))
        else entry.resolve(message.result)
        return
      }

      if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
        client.problems.push(
          `console.error: ${message.params.args.map((arg) => arg.value ?? arg.description ?? '').join(' ')}`,
        )
      }

      if (message.method === 'Runtime.exceptionThrown') {
        const details = message.params.exceptionDetails
        client.problems.push(`exception: ${details.exception?.description ?? details.text}`)
      }
    })

    return client
  }

  send(method, params = {}, timeout = 60000) {
    const id = (this.#id += 1)
    return new Promise((resolve, reject) => {
      this.#pending.set(id, { resolve, reject, method })
      this.#ws.send(JSON.stringify({ id, method, params }))
      setTimeout(() => {
        if (this.#pending.delete(id)) reject(new Error(`timeout en ${method}`))
      }, timeout)
    })
  }

  async evaluate(expression) {
    const { result, exceptionDetails } = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    })
    if (exceptionDetails) {
      const detail =
        exceptionDetails.exception?.description ??
        exceptionDetails.text ??
        'sin detalle'
      throw new Error(`evaluate fallo en [${expression.slice(0, 90)}...]: ${detail}`)
    }
    return result.value
  }

  async shot(name) {
    const { data } = await this.send('Page.captureScreenshot', { format: 'png', fromSurface: true })
    await writeFile(path.join(OUT_DIR, `${name}.png`), Buffer.from(data, 'base64'))
    return name
  }

  close() {
    try {
      this.#ws.close()
    } catch {
      /* ya estaba cerrado */
    }
  }
}

async function waitForDebugger() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`)
      if (response.ok) return true
    } catch {
      /* Chrome todavia no escucha */
    }
    await delay(400)
  }
  throw new Error('Chrome no expuso el puerto de depuracion')
}

async function createPageTarget() {
  const response = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/new?about:blank`, { method: 'PUT' })
  if (!response.ok) throw new Error(`no se pudo crear la pestana (${response.status})`)
  return response.json()
}

/** Espera activa a una condicion evaluada en la pagina. */
async function waitFor(client, expression, { timeout = 30000, interval = 400, label = expression } = {}) {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    if (await client.evaluate(expression)) return true
    await delay(interval)
  }
  throw new Error(`timeout esperando: ${label}`)
}

async function main() {
  const chromePath = CHROME_CANDIDATES.find((candidate) => existsSync(candidate))
  if (!chromePath) throw new Error('Chrome no encontrado')

  await mkdir(OUT_DIR, { recursive: true })

  const chrome = spawn(
    chromePath,
    [
      '--headless=new',
      `--remote-debugging-port=${DEBUG_PORT}`,
      // El perfil va fuera del proyecto: si vive dentro, el watcher de Vite lo
      // detecta, recarga la pagina en bucle y la captura nunca llega a estabilizarse.
      `--user-data-dir=${path.join(tmpdir(), 'vm-portfolio-chrome-profile')}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--hide-scrollbars',
      '--disable-extensions',
      '--window-size=1440,1000',
      'about:blank',
    ],
    { stdio: 'ignore' },
  )

  let client
  try {
    await waitForDebugger()
    const target = await createPageTarget()
    client = await CDP.attach(target.webSocketDebuggerUrl)

    await client.send('Page.enable')
    await client.send('Runtime.enable')
    await client.send('Emulation.setDeviceMetricsOverride', DESKTOP)

    await client.send('Page.navigate', { url: BASE_URL })
    await waitFor(client, 'document.readyState === "complete"', { label: 'documento listo' })

    // Damos tiempo a Lenis, a las animaciones de entrada y a la escena 3D diferida.
    await delay(6500)

    // ---------- Diagnostico del documento ----------
    const health = await client.evaluate(`(() => {
      const sections = Array.from(document.querySelectorAll('section[id]')).map((s) => s.id)
      const canvas = document.querySelector('canvas')
      const style = getComputedStyle(document.body)
      return {
        title: document.title,
        lang: document.documentElement.lang,
        theme: style.backgroundColor,
        font: style.fontFamily,
        height: document.documentElement.scrollHeight,
        sections,
        canvases: document.querySelectorAll('canvas').length,
        webglFlag: document.documentElement.dataset.webgl ?? 'supported',
        h1: document.querySelector('h1')?.innerText?.replace(/\\s+/g, ' ').slice(0, 120) ?? null,
        navLinks: document.querySelectorAll('header nav a[href^="#"]').length,
        stackChips: document.querySelectorAll('#stack li').length,
        caseStudies: document.querySelectorAll('#proyectos article').length,
        placeholders: document.querySelectorAll('#proyectos .border-amber\\\\/40').length,
        timelineItems: document.querySelectorAll('#experiencia article').length,
        services: document.querySelectorAll('#servicios article').length,
        externalLinks: Array.from(document.querySelectorAll('a[target="_blank"]')).length,
        canvasSize: canvas ? { w: canvas.clientWidth, h: canvas.clientHeight } : null,
      }
    })()`)

    console.log('\n=== SALUD DEL DOCUMENTO ===')
    console.log(JSON.stringify(health, null, 2))

    // ---------- Escritorio: hero + cada seccion ----------
    await client.evaluate('window.scrollTo(0, 0)')
    await delay(1200)
    await client.shot('desktop-01-hero')

    for (const [index, id] of SECTION_SHOTS.entries()) {
      await client.evaluate(`document.getElementById('${id}')?.scrollIntoView({ block: 'start' })`)
      await delay(1400)
      const label = String(index + 2).padStart(2, '0')
      await client.shot(`desktop-${label}-${id}`)
    }

    // Volvemos arriba y comprobamos que el parallax y el header reaccionan.
    await client.evaluate('window.scrollTo(0, 0)')
    await delay(900)
    const headerState = await client.evaluate(`(() => {
      const header = document.querySelector('header > div')
      return { scrolledClasses: header.className.includes('backdrop-blur-xl') ? 'visible' : 'transparent' }
    })()`)
    console.log('header en reposo:', headerState.scrolledClasses)

    // ---------- Cambio de idioma ----------
    const langButton = await client.evaluate(`(() => {
      const buttons = Array.from(document.querySelectorAll('header button'))
      const target = buttons.find((b) => /ES|EN/.test(b.textContent.trim()))
      if (!target) return null
      target.click()
      return true
    })()`)

    if (langButton) {
      await delay(1400)
      const afterToggle = await client.evaluate(`({
        lang: document.documentElement.lang,
        h1: document.querySelector('h1')?.innerText?.replace(/\\s+/g, ' ').slice(0, 120) ?? null,
        nav: Array.from(document.querySelectorAll('header nav a')).map((a) => a.textContent.trim()).slice(0, 6),
        title: document.title,
      })`)
      console.log('\n=== TRAS CAMBIAR IDIOMA ===')
      console.log(JSON.stringify(afterToggle, null, 2))
      await client.shot('desktop-09-english')
    } else {
      console.log('AVISO: no se encontro el boton de idioma')
    }

    // ---------- Movil ----------
    await client.send('Emulation.setDeviceMetricsOverride', MOBILE)
    await client.evaluate('window.scrollTo(0, 0)')
    await delay(2600)
    await client.shot('mobile-01-hero')

    const mobileHealth = await client.evaluate(`(() => {
      const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth
      const toggle = Array.from(document.querySelectorAll('header button'))
        .some((b) => b.getAttribute('aria-controls') === 'mobile-nav')
      return { horizontalOverflowPx: overflow, hasMenuButton: toggle }
    })()`)
    console.log('\n=== MOVIL ===')
    console.log(JSON.stringify(mobileHealth, null, 2))

    // Menu movil desplegado.
    await client.evaluate(`(() => {
      const button = Array.from(document.querySelectorAll('header button'))
        .find((b) => b.getAttribute('aria-controls') === 'mobile-nav')
      button?.click()
    })()`)
    await delay(900)
    await client.shot('mobile-02-menu')

    // ---------- Navegacion del router ----------
    // Con BrowserRouter las anclas son fragmentos normales (`#seccion`) mientras
    // la ruta sigue siendo `/`. Comprobamos que el enlace desplaza a la seccion
    // en vez de resolverse como una ruta inexistente.
    await client.send('Emulation.setDeviceMetricsOverride', DESKTOP)
    // Cerramos el menu movil si quedo abierto y volvemos arriba.
    await client.evaluate(`(() => {
      const button = Array.prototype.slice.call(document.querySelectorAll('header button'))
        .filter(function (b) { return b.getAttribute('aria-controls') === 'mobile-nav' })[0]
      if (button && button.getAttribute('aria-expanded') === 'true') button.click()
      window.scrollTo(0, 0)
    })()`)
    await delay(900)

    const navClick = await client.evaluate(`(() => {
      // Seleccion por destino y dentro del header, no por texto: la pagina
      // puede estar en ES o EN y el hero repite el mismo enlace.
      const anchors = Array.prototype.slice.call(document.querySelectorAll('header a'))
      const disponibles = anchors.map(function (a) { return a.getAttribute('href') })
      const link = anchors.filter(function (a) {
        return a.getAttribute('href') === '#proyectos'
      })[0]
      if (!link) return { found: false, disponibles: disponibles.slice(0, 12) }
      link.click()
      return { found: true }
    })()`)
    await delay(2400)

    const afterNav = await client.evaluate(`(() => {
      const target = document.getElementById('proyectos')
      return {
        path: window.location.pathname,
        hash: window.location.hash,
        scrollY: Math.round(window.scrollY),
        projectsTop: target ? Math.round(target.getBoundingClientRect().top) : null,
        sections: document.querySelectorAll('section[id]').length,
      }
    })()`)

    console.log('\n=== NAVEGACION POR ANCLAS ===')
    console.log(JSON.stringify({ linkEncontrado: navClick.found, ...afterNav }, null, 2))

    if (!navClick.found) {
      client.problems.push(
        `no se encontro el enlace #proyectos. Disponibles: ${(navClick.disponibles ?? []).join(', ')}`,
      )
    } else {
      if (afterNav.path !== '/') {
        client.problems.push(`el ancla cambio la ruta a ${afterNav.path} en vez de mantenerse en /`)
      }
      if (afterNav.hash !== '#proyectos') {
        client.problems.push(`el enlace de navegacion produjo un hash inesperado: ${afterNav.hash}`)
      }
      if (afterNav.scrollY < 100) {
        client.problems.push(`el enlace de navegacion no desplazo la pagina (scrollY=${afterNav.scrollY})`)
      }
      if (afterNav.sections !== 7) {
        client.problems.push(`el ancla rompio el portafolio (${afterNav.sections} secciones)`)
      }
    }

    // Entrada directa a una ruta inexistente: debe renderizar el 404.
    await client.send('Page.navigate', { url: `${BASE_URL}seccion-que-no-existe` })
    await waitFor(client, 'document.readyState === "complete"', { label: 'documento listo (404)' })
    await delay(2200)

    const notFoundRoute = await client.evaluate(`({
      path: window.location.pathname,
      sections: document.querySelectorAll('section[id]').length,
      is404: document.body.innerText.includes('Esta ruta no existe')
        || document.body.innerText.includes("doesn't exist"),
      hasGame: Boolean(document.querySelector('canvas')),
    })`)

    console.log('\n=== RUTA INEXISTENTE ===')
    console.log(JSON.stringify(notFoundRoute, null, 2))

    if (!notFoundRoute.is404) client.problems.push('una ruta inexistente no renderizo el 404')
    if (!notFoundRoute.hasGame) client.problems.push('el 404 no monto el minijuego')
    if (notFoundRoute.sections !== 0) client.problems.push('el 404 renderizo el portafolio encima')

    // Volvemos a la portada para medir rendimiento en la vista principal.
    await client.send('Page.navigate', { url: BASE_URL })
    await waitFor(client, 'document.readyState === "complete"', { label: 'portada de nuevo' })
    await delay(2500)

    // ---------- Rendimiento basico ----------
    const perf = await client.evaluate(`(() => {
      const nav = performance.getEntriesByType('navigation')[0]
      const resources = performance.getEntriesByType('resource')
      const scripts = resources.filter((r) => r.name.endsWith('.js') || r.initiatorType === 'script')
      return {
        domContentLoadedMs: Math.round(nav.domContentLoadedEventEnd),
        loadMs: Math.round(nav.loadEventEnd),
        transferKB: Math.round(resources.reduce((sum, r) => sum + (r.transferSize || 0), 0) / 1024),
        scriptCount: scripts.length,
      }
    })()`)
    console.log('\n=== RENDIMIENTO (dev, sin minificar) ===')
    console.log(JSON.stringify(perf, null, 2))

    console.log('\n=== ERRORES DE RUNTIME ===')
    console.log(client.problems.length ? client.problems.join('\n') : 'ninguno')

    console.log('\nCapturas en:', OUT_DIR)
  } finally {
    client?.close()
    chrome.kill()
    await delay(500)
  }
}

main().catch((error) => {
  console.error('FALLO:', error.message)
  process.exitCode = 1
})
