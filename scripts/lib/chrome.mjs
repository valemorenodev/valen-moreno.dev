/**
 * Utilidades compartidas para verificar el sitio en un Chrome headless.
 *
 * Habla el protocolo DevTools (CDP) por el WebSocket nativo de Node, sin
 * puppeteer ni playwright: `node --experimental-websocket`.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

export const CHROME_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe`,
]

export const DESKTOP = { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false }
export const MOBILE = { width: 390, height: 844, deviceScaleFactor: 2, mobile: true }

export class CDP {
  #ws
  #id = 0
  #pending = new Map()
  #outDir

  problems = []

  constructor(outDir) {
    this.#outDir = outDir
  }

  static async attach(wsUrl, outDir) {
    const client = new CDP(outDir)
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
    if (exceptionDetails) throw new Error(`evaluate fallo: ${exceptionDetails.text}`)
    return result.value
  }

  async shot(name) {
    const { data } = await this.send('Page.captureScreenshot', { format: 'png', fromSurface: true })
    await writeFile(path.join(this.#outDir, `${name}.png`), Buffer.from(data, 'base64'))
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

async function waitForDebugger(debugPort) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${debugPort}/json/version`)
      if (response.ok) return true
    } catch {
      /* Chrome todavia no escucha */
    }
    await delay(400)
  }
  throw new Error('Chrome no expuso el puerto de depuracion')
}

async function createPageTarget(debugPort) {
  const response = await fetch(`http://127.0.0.1:${debugPort}/json/new?about:blank`, { method: 'PUT' })
  if (!response.ok) throw new Error(`no se pudo crear la pestana (${response.status})`)
  return response.json()
}

/**
 * Levanta Chrome y devuelve `{ client, chrome }`.
 * El perfil vive fuera del proyecto: dentro, el watcher de Vite lo detectaria y
 * recargaria la pagina en bucle, impidiendo que la captura se estabilice.
 */
export async function launchChrome({ debugPort, outDir, profileName, windowSize = '1440,1000' }) {
  const chromePath = CHROME_CANDIDATES.find((candidate) => existsSync(candidate))
  if (!chromePath) throw new Error('Chrome no encontrado')

  await mkdir(outDir, { recursive: true })

  const chrome = spawn(
    chromePath,
    [
      '--headless=new',
      `--remote-debugging-port=${debugPort}`,
      `--user-data-dir=${path.join(tmpdir(), profileName)}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--hide-scrollbars',
      '--disable-extensions',
      `--window-size=${windowSize}`,
      'about:blank',
    ],
    { stdio: 'ignore' },
  )

  await waitForDebugger(debugPort)
  const target = await createPageTarget(debugPort)
  const client = await CDP.attach(target.webSocketDebuggerUrl, outDir)

  return { client, chrome, chromePath }
}

/** Espera activa a una condicion evaluada dentro de la pagina. */
export async function waitFor(client, expression, { timeout = 30000, interval = 300, label = expression } = {}) {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    if (await client.evaluate(expression)) return true
    await delay(interval)
  }
  throw new Error(`timeout esperando: ${label}`)
}

/** Pulsa una tecla real en la pagina (keydown + keyup), como haria una persona. */
export async function pressKey(client, { key, code, windowsVirtualKeyCode, text }) {
  const base = { key, code, windowsVirtualKeyCode, nativeVirtualKeyCode: windowsVirtualKeyCode }
  await client.send('Input.dispatchKeyEvent', { type: text ? 'keyDown' : 'rawKeyDown', ...base, text })
  await client.send('Input.dispatchKeyEvent', { type: 'keyUp', ...base })
}

export { delay }
