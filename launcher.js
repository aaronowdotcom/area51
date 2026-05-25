'use strict'
const path = require('path')
const { spawn } = require('child_process')
const http = require('http')
const { platform } = require('os')
const fs = require('fs')

const isPkg = Boolean(process.pkg)
const baseDir = isPkg ? path.dirname(process.execPath) : path.resolve(__dirname)
const NEXT_PORT = parseInt(process.env.PORT || '3000')
const JAVA_PORT = 7878

// Set env before requiring Next.js server so pages can read CONTENT_DIR
process.env.PORT = String(NEXT_PORT)
process.env.HOSTNAME = 'localhost'
process.env.NODE_ENV = 'production'
process.env.CONTENT_DIR = path.join(baseDir, 'content')

function startJavaService() {
  const javaExe = platform() === 'win32'
    ? path.join(baseDir, 'jdk', 'bin', 'java.exe')
    : path.join(baseDir, 'jdk', 'bin', 'java')
  const jar = path.join(baseDir, 'saleskit-service.jar')

  if (!fs.existsSync(jar)) {
    console.log('[SalesKit] Java service not found — proposal PDF will use browser print fallback')
    return null
  }

  const java = fs.existsSync(javaExe) ? javaExe : 'java'
  const profile = process.env.SPRING_PROFILES_ACTIVE || 'prod'
  const proc = spawn(java, ['-jar', jar, `--spring.profiles.active=${profile}`, `--server.port=${JAVA_PORT}`], {
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  proc.stdout.on('data', d => process.stdout.write('[Java] ' + d))
  proc.stderr.on('data', d => process.stderr.write('[Java] ' + d))
  proc.on('exit', code => console.log('[Java] exited', code))
  return proc
}

function waitForServer(port, maxTries = 40) {
  return new Promise((resolve, reject) => {
    let tries = 0
    const check = () => {
      http.get(`http://localhost:${port}/`, res => {
        if (res.statusCode < 500) resolve()
        else retry()
      }).on('error', retry).end()
    }
    const retry = () => {
      if (++tries >= maxTries) return reject(new Error(`Server not ready on port ${port}`))
      setTimeout(check, 500)
    }
    setTimeout(check, 1000) // give server a head start
  })
}

function openBrowser(url) {
  const cmd = { darwin: 'open', win32: 'start', linux: 'xdg-open' }[platform()] || 'xdg-open'
  spawn(cmd, [url], { shell: true, detached: true, stdio: 'ignore' }).unref()
}

async function main() {
  startJavaService()

  // Load Next.js standalone server from the real filesystem.
  // In pkg mode, require() of an absolute path falls back to the real FS,
  // so __dirname inside server.js resolves correctly and Next.js finds .next/.
  const serverJs = path.join(baseDir, 'server.js')
  if (!fs.existsSync(serverJs)) {
    console.error('[SalesKit] server.js not found at:', serverJs)
    console.error('[SalesKit] Run: npm run build')
    process.exit(1)
  }

  console.log('[SalesKit] Starting Next.js server...')
  require(serverJs)

  console.log(`[SalesKit] Waiting for server on :${NEXT_PORT}...`)
  await waitForServer(NEXT_PORT)

  const url = `http://localhost:${NEXT_PORT}`
  console.log('[SalesKit] Ready —', url)
  openBrowser(url)

  // Keep process alive (Next.js server runs async)
  process.stdin.resume()
  process.on('SIGINT', () => process.exit(0))
  process.on('SIGTERM', () => process.exit(0))
}

main().catch(err => { console.error('[SalesKit] Fatal:', err.message); process.exit(1) })
