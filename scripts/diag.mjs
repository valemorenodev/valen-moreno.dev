/**
 * Diagnostico rapido: carga una ruta y reporta errores de consola/excepciones
 * y el estado del DOM. Util para depurar por que una vista no renderiza.
 *
 * Uso: node --experimental-websocket scripts/diag.mjs [puerto] [ruta]
 */
import path from 'node:path'
import { launchChrome, delay } from './lib/chrome.mjs'

const PORT = Number(process.argv[2] ?? 5199)
const ROUTE = process.argv[3] ?? ''
const OUT_DIR = path.resolve('tmp-screens')
const DEBUG_PORT = 9335

const url = `http://localhost:${PORT}/${ROUTE}`

const { client, chrome } = await launchChrome({
  debugPort: DEBUG_PORT,
  outDir: OUT_DIR,
  profileName: 'vm-portfolio-chrome-diag',
})

try {
  await client.send('Page.enable')
  await client.send('Runtime.enable')
  await client.send('Log.enable').catch(() => {})

  // Nos quedamos con los errores que llegan como eventos de Log tambien.
  await client.send('Page.navigate', { url })
  await delay(4000)

  const dom = await client.evaluate(`({
    url: window.location.href,
    hash: window.location.hash,
    title: document.title,
    rootChildren: document.getElementById('root')?.children.length ?? -1,
    rootHtml: (document.getElementById('root')?.innerHTML ?? '').slice(0, 300),
    bodyLen: document.body.innerText.length,
    scripts: Array.from(document.scripts).map((s) => s.src).filter(Boolean),
  })`)

  console.log('URL solicitada:', url)
  console.log('=== DOM ===')
  console.log(JSON.stringify(dom, null, 2))

  console.log('\n=== CONSOLA / EXCEPCIONES ===')
  console.log(client.problems.length ? client.problems.join('\n---\n') : 'ninguno')

  await client.shot('diag')
} finally {
  client.close()
  chrome.kill()
  await delay(300)
}
