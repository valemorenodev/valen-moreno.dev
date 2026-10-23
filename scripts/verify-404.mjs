/**
 * Verificacion de la pagina 404 y del minijuego.
 *
 * Comprueba que una ruta inexistente renderiza el 404, que el minijuego
 * responde al teclado (saltar y reiniciar) y que la navegacion de vuelta
 * funciona.
 *
 * Uso: node --experimental-websocket scripts/verify-404.mjs [puerto] [carpeta]
 */
import path from 'node:path'
import { launchChrome, pressKey, waitFor, delay, DESKTOP, MOBILE } from './lib/chrome.mjs'

const PORT = Number(process.argv[2] ?? 5199)
const OUT_DIR = path.resolve(process.argv[3] ?? 'tmp-screens')
const DEBUG_PORT = 9334
const BOGUS_ROUTE = 'esta-ruta-no-existe'
// Con BrowserRouter la ruta es un path real: `vite preview` responde index.html
// (igual que hará el hosting con la reescritura de vercel.json).
const URL_404 = `http://localhost:${PORT}/${BOGUS_ROUTE}`

const SPACE = { key: ' ', code: 'Space', windowsVirtualKeyCode: 32, text: ' ' }
const KEY_R = { key: 'r', code: 'KeyR', windowsVirtualKeyCode: 82, text: 'r' }

const checks = []
function check(label, ok, detail = '') {
  checks.push({ label, ok, detail })
  console.log(`${ok ? 'OK  ' : 'FALLO'} ${label}${detail ? ` -> ${detail}` : ''}`)
}

async function main() {
  const { client, chrome } = await launchChrome({
    debugPort: DEBUG_PORT,
    outDir: OUT_DIR,
    profileName: 'vm-portfolio-chrome-404',
  })

  try {
    await client.send('Page.enable')
    await client.send('Runtime.enable')
    await client.send('Emulation.setDeviceMetricsOverride', DESKTOP)

    await client.send('Page.navigate', { url: URL_404 })
    await waitFor(client, 'document.readyState === "complete"', { label: 'documento listo' })
    await delay(2500)

    // ---------- La ruta inexistente muestra el 404 ----------
    const page = await client.evaluate(`(() => {
      const canvas = document.querySelector('canvas')
      return {
        title: document.title,
        lang: document.documentElement.lang,
        h1: document.querySelector('h1')?.innerText?.replace(/\\s+/g, ' ').trim() ?? null,
        hasCanvas: Boolean(canvas),
        canvasSize: canvas ? { w: canvas.width, h: canvas.height } : null,
        hasHomeLink: Boolean(
          Array.prototype.slice.call(document.querySelectorAll('a'))
            .filter((a) => a.getAttribute('href') === '/').length,
        ),
        sections: document.querySelectorAll('section[id]').length,
        bodyText: document.body.innerText.slice(0, 160).replace(/\\s+/g, ' '),
        hasGameRef: Boolean(window.__game),
        status: window.__game?.state?.status ?? null,
      }
    })()`)

    console.log('\n=== PAGINA 404 ===')
    console.log(JSON.stringify(page, null, 2))

    check('el titulo del documento cambia al del 404', page.title.includes('404'), page.title)
    check('renderiza un h1 propio del 404', Boolean(page.h1), page.h1 ?? 'sin h1')
    check('el portafolio NO se renderiza en la ruta inexistente', page.sections === 0, `secciones: ${page.sections}`)
    check('el lienzo del juego esta presente', page.hasCanvas, JSON.stringify(page.canvasSize))
    check('el motor del juego esta montado', page.hasGameRef)
    check('el juego arranca en estado "ready"', page.status === 'ready', String(page.status))
    check('hay enlace de vuelta al inicio', page.hasHomeLink)

    await client.shot('404-01-desktop')

    // ---------- El juego responde al teclado ----------
    await client.evaluate('document.activeElement?.blur?.()')
    await pressKey(client, SPACE)
    await delay(700)

    // Primer Espacio: arranca la partida desde el estado "ready".
    const started = await client.evaluate(`(() => ({
      status: window.__game.state.status,
      jumps: window.__game.player.jumps,
    }))()`)
    check('el primer Espacio arranca la partida', started.status === 'playing', String(started.status))

    // Segundo Espacio: ahora sí debe saltar.
    await pressKey(client, SPACE)

    // Muestreamos la altura durante el salto: el cubo vuelve al suelo en ~0,7 s,
    // así que mirar solo al final daría un falso negativo.
    let peak = 0
    let peakJumps = 0
    for (let i = 0; i < 18; i += 1) {
      const sample = await client.evaluate(`(() => ({
        y: window.__game.player.y,
        jumps: window.__game.player.jumps,
      }))()`)
      peak = Math.max(peak, sample.y)
      peakJumps = Math.max(peakJumps, sample.jumps)
      await delay(35)
    }

    await delay(900)

    const running = await client.evaluate(`(() => {
      const game = window.__game
      return {
        status: game.state.status,
        distance: Math.floor(game.state.distance),
        jumps: game.player.jumps,
        obstacles: game.obstacles.length,
        speed: Math.round(game.state.speed),
        hud: document.body.innerText.match(/DISTANCIA\\s+(\\d+)/)?.[1] ?? null,
        title: document.title,
      }
    })()`)

    console.log('\n=== PARTIDA EN CURSO ===')
    console.log(JSON.stringify({ ...running, peakJumpHeight: Number(peak.toFixed(1)), peakJumps }, null, 2))

    check('el estado se mantiene en "playing"', running.status === 'playing', String(running.status))
    check('la distancia avanza', running.distance > 0, String(running.distance))
    check('el cubo salta al pulsar Espacio', peakJumps >= 1, `saltos: ${peakJumps}`)
    check('el cubo se eleva del suelo', peak > 20, `altura maxima: ${peak.toFixed(1)}px`)
    check('se generan obstaculos', running.obstacles > 0, String(running.obstacles))
    check('el HUD refleja la distancia', running.hud !== null && Number(running.hud) > 0, String(running.hud))
    check(
      'mientras juega, el titulo muestra el del minijuego',
      /cubo infinito/i.test(running.title),
      running.title,
    )

    await client.shot('404-02-jugando')

    // ---------- Choque y reinicio ----------
    // Forzamos una muerte determinista colocando un pincho justo encima del cubo.
    // Leemos las constantes reales del juego para no depender de coordenadas fijas.
    await client.evaluate(`(() => {
      const g = window.__game
      const C = g.getConfig()
      g.player.y = 0
      g.player.vy = 0
      g.obstacles.push({
        x: C.playerX,
        y: C.groundY - C.spikeHeight,
        w: C.spikeWidth,
        h: C.spikeHeight,
        type: 'spike',
      })
    })()`)

    await waitFor(client, 'window.__game.state.status === "dead"', { label: 'estado dead', timeout: 6000 })
    const dead = await client.evaluate(`(() => {
      const g = window.__game
      return {
        status: g.state.status,
        particles: g.particles.length,
        best: g.state.best,
        overlay: document.body.innerText.includes('chocado') || document.body.innerText.includes('crashed'),
      }
    })()`)

    console.log('\n=== TRAS EL CHOQUE ===')
    console.log(JSON.stringify(dead, null, 2))

    check('el estado pasa a "dead"', dead.status === 'dead', String(dead.status))
    check('se generan particulas de explosion', dead.particles > 0, String(dead.particles))
    check('el overlay de fin de partida aparece', dead.overlay)

    await client.shot('404-03-game-over')

    const scoreBeforeRestart = await client.evaluate('Math.floor(window.__game.state.distance)')
    await client.evaluate('document.activeElement?.blur?.()')
    await pressKey(client, KEY_R)
    await delay(900)

    const restarted = await client.evaluate(`(() => {
      const g = window.__game
      return { status: g.state.status, distance: Math.floor(g.state.distance) }
    })()`)

    console.log('\n=== TRAS PULSAR "R" ===')
    console.log(JSON.stringify(restarted, null, 2))

    check('el reinicio devuelve a "playing"', restarted.status === 'playing', String(restarted.status))
    check(
      'el marcador se reinicia',
      restarted.distance < scoreBeforeRestart || restarted.distance < 5,
      `${scoreBeforeRestart} -> ${restarted.distance}`,
    )

    // ---------- Cambio de idioma en el 404 ----------
    await client.evaluate(`(() => {
      const button = Array.from(document.querySelectorAll('button'))
        .find((b) => /^(ES|EN)$/.test(b.textContent.trim()))
      button?.click()
    })()`)
    await delay(900)

    const english = await client.evaluate(`({
      lang: document.documentElement.lang,
      h1: document.querySelector('h1')?.innerText?.trim() ?? null,
      title: document.title,
      distanceLabel: /Distance/i.test(document.body.innerText),
    })`)

    console.log('\n=== 404 EN INGLES ===')
    console.log(JSON.stringify(english, null, 2))

    check('el idioma cambia a "en"', english.lang === 'en', english.lang)
    check('el texto del 404 se traduce', /route/i.test(english.h1 ?? ''), english.h1 ?? '')
    check('el HUD del juego se traduce', english.distanceLabel)

    // El título lleva el del minijuego mientras se juega: detenemos la partida
    // para comprobar el título propio del 404.
    await client.evaluate(`(() => {
      const g = window.__game
      const C = g.getConfig()
      g.player.y = 0
      g.player.vy = 0
      g.obstacles.push({
        x: C.playerX,
        y: C.groundY - C.spikeHeight,
        w: C.spikeWidth,
        h: C.spikeHeight,
        type: 'spike',
      })
    })()`)
    await waitFor(client, 'window.__game.state.status === "dead"', { label: 'estado dead (en)', timeout: 8000 })
    await delay(400)

    const englishTitle = await client.evaluate('document.title')
    check('el titulo del documento se traduce', /page not found/i.test(englishTitle), englishTitle)

    await client.shot('404-04-english')

    // ---------- Movil ----------
    await client.send('Emulation.setDeviceMetricsOverride', MOBILE)
    await client.evaluate('window.scrollTo(0,0)')
    await delay(1200)

    const mobile = await client.evaluate(`(() => {
      const canvas = document.querySelector('canvas')
      return {
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        canvasCssHeight: canvas ? Math.round(canvas.getBoundingClientRect().height) : null,
        canvasCssWidth: canvas ? Math.round(canvas.getBoundingClientRect().width) : null,
      }
    })()`)

    console.log('\n=== 404 EN MOVIL ===')
    console.log(JSON.stringify(mobile, null, 2))

    check('sin desbordamiento horizontal', mobile.overflow <= 0, `${mobile.overflow}px`)
    check('el lienzo se adapta al ancho movil', mobile.canvasCssWidth > 0 && mobile.canvasCssWidth <= 390, String(mobile.canvasCssWidth))

    await client.shot('404-05-mobile')

    // ---------- Volver al inicio ----------
    await client.send('Emulation.setDeviceMetricsOverride', DESKTOP)
    await client.evaluate(`(() => {
      const link = Array.prototype.slice.call(document.querySelectorAll('a'))
        .filter(function (a) { return a.getAttribute('href') === '/' })[0]
      link?.click()
    })()`)
    await delay(2200)

    const backHome = await client.evaluate(`(() => ({
      sections: document.querySelectorAll('section[id]').length,
      hasHero: Boolean(document.getElementById('inicio')),
      path: window.location.pathname,
    }))()`)

    console.log('\n=== VUELTA AL PORTAFOLIO ===')
    console.log(JSON.stringify(backHome, null, 2))

    check('el portafolio vuelve a renderizarse', backHome.sections === 7, `secciones: ${backHome.sections}`)
    check('la ruta vuelve a "/"', backHome.path === '/', backHome.path)

    await client.shot('404-06-back-home')

    // ---------- Ancla a una sección desde el 404 ----------
    // Es el caso que rompía con HashRouter: ruta y ancla a la vez.
    await client.send('Page.navigate', { url: URL_404 })
    await waitFor(client, 'document.readyState === "complete"', { label: '404 de nuevo' })
    await delay(2000)

    await client.evaluate(`(() => {
      const link = Array.prototype.slice.call(document.querySelectorAll('a'))
        .filter(function (a) { return a.getAttribute('href') === '/#proyectos' })[0]
      link?.click()
    })()`)
    await delay(3000)

    const anchorNav = await client.evaluate(`(() => {
      const target = document.getElementById('proyectos')
      return {
        path: window.location.pathname,
        hash: window.location.hash,
        sections: document.querySelectorAll('section[id]').length,
        projectsVisible: target ? target.getBoundingClientRect().top < window.innerHeight : false,
        scrollY: Math.round(window.scrollY),
      }
    })()`)

    console.log('\n=== ANCLA A PROYECTOS DESDE EL 404 ===')
    console.log(JSON.stringify(anchorNav, null, 2))

    check('la ruta cambia a "/" con ancla', anchorNav.path === '/' && anchorNav.hash === '#proyectos', `${anchorNav.path}${anchorNav.hash}`)
    check('el portafolio se renderiza', anchorNav.sections === 7, `secciones: ${anchorNav.sections}`)
    check('la pagina se desplaza a proyectos', anchorNav.scrollY > 100, `scrollY: ${anchorNav.scrollY}`)
    check('proyectos queda a la vista', anchorNav.projectsVisible)

    await client.shot('404-07-anchor-nav')

    // ---------- Errores de runtime ----------
    console.log('\n=== ERRORES DE RUNTIME ===')
    console.log(client.problems.length ? client.problems.join('\n') : 'ninguno')
    check('sin errores de runtime', client.problems.length === 0, `${client.problems.length} problemas`)
  } finally {
    client.close()
    chrome.kill()
    await delay(400)
  }

  const failed = checks.filter((c) => !c.ok)
  console.log(`\n=== RESUMEN: ${checks.length - failed.length}/${checks.length} comprobaciones OK ===`)
  if (failed.length) {
    failed.forEach((c) => console.log(`  FALLO: ${c.label} ${c.detail}`))
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error('FALLO:', error.message)
  process.exitCode = 1
})
