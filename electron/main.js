const { app, BrowserWindow, ipcMain, shell } = require('electron')
const path = require('path')
const { spawn } = require('child_process')
const http = require('http')

const isDev = process.env.NODE_ENV === 'development'
const JAVA_PORT = 7878

let mainWindow
let javaProcess

function getJavaExecutable() {
  const platform = process.platform
  const jdkBase = app.isPackaged
    ? path.join(process.resourcesPath, 'jdk')
    : path.join(__dirname, '..', 'resources', 'jdk')

  const javaExe = platform === 'win32' ? 'java.exe' : 'java'

  // Try bundled JDK first
  const bundledJava = path.join(jdkBase, 'bin', javaExe)
  const fs = require('fs')
  if (fs.existsSync(bundledJava)) return bundledJava

  // Fall back to system Java
  return javaExe
}

function getJarPath() {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'saleskit-service.jar')
    : path.join(__dirname, '..', 'java-service', 'target', 'saleskit-service.jar')
}

function waitForJavaService(retries = 20) {
  return new Promise((resolve, reject) => {
    const check = (n) => {
      const req = http.get(`http://localhost:${JAVA_PORT}/health`, (res) => {
        if (res.statusCode === 200) resolve()
        else if (n > 0) setTimeout(() => check(n - 1), 500)
        else reject(new Error('Java service failed to start'))
      })
      req.on('error', () => {
        if (n > 0) setTimeout(() => check(n - 1), 500)
        else reject(new Error('Java service not reachable'))
      })
      req.end()
    }
    check(retries)
  })
}

async function startJavaService() {
  const jarPath = getJarPath()
  const fs = require('fs')
  if (!fs.existsSync(jarPath)) {
    console.log('Java service JAR not found, skipping...')
    return
  }

  const javaExe = getJavaExecutable()
  console.log(`Starting Java service: ${javaExe} -jar ${jarPath}`)

  javaProcess = spawn(javaExe, ['-jar', jarPath, '--port', JAVA_PORT.toString()], {
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  javaProcess.stdout.on('data', (d) => console.log('[Java]', d.toString().trim()))
  javaProcess.stderr.on('data', (d) => console.error('[Java]', d.toString().trim()))
  javaProcess.on('exit', (code) => console.log(`Java service exited with code ${code}`))

  try {
    await waitForJavaService()
    console.log('Java service ready on port', JAVA_PORT)
  } catch (e) {
    console.warn('Java service did not start:', e.message)
  }
}

async function createWindow() {
  await startJavaService()

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0f172a',
    show: false,
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools()
  } else {
    const serve = require('electron-serve')
    const loadURL = serve({ directory: path.join(__dirname, '..', 'renderer', 'out') })
    await loadURL(mainWindow)
  }

  mainWindow.once('ready-to-show', () => mainWindow.show())
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (javaProcess) javaProcess.kill()
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

ipcMain.handle('get-java-port', () => JAVA_PORT)
ipcMain.handle('get-app-version', () => app.getVersion())
