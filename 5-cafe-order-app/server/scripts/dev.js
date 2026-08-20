const { spawn, execSync } = require('child_process')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

const rootDir = path.join(__dirname, '..')
const srcDir = path.join(rootDir, 'src')
const entry = path.join(srcDir, 'index.js')

require('dotenv').config({ path: path.join(rootDir, '.env') })
const PORT = Number(process.env.PORT) || 4000

const hashes = new Map()
let child = null
let restartTimer = null

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) {
      walk(full, files)
    } else if (/\.js$/i.test(name)) {
      files.push(full)
    }
  }
  return files
}

function hashFile(file) {
  try {
    return crypto.createHash('md5').update(fs.readFileSync(file)).digest('hex')
  } catch {
    return null
  }
}

function refreshHashes() {
  hashes.clear()
  for (const file of walk(srcDir)) {
    hashes.set(path.normalize(file), hashFile(file))
  }
}

function freePort(port) {
  if (process.platform !== 'win32') return

  let output = ''
  try {
    output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' })
  } catch {
    return
  }

  const pids = new Set()
  for (const line of output.split(/\r?\n/)) {
    if (!/LISTENING/i.test(line)) continue
    const parts = line.trim().split(/\s+/)
    const pid = parts[parts.length - 1]
    if (/^\d+$/.test(pid) && pid !== '0' && Number(pid) !== process.pid) {
      pids.add(pid)
    }
  }

  for (const pid of pids) {
    try {
      execSync(`taskkill /PID ${pid} /T /F`, { stdio: 'ignore' })
    } catch {
      // already gone
    }
  }
}

function stopServer() {
  if (!child || !child.pid) {
    child = null
    return
  }

  const pid = child.pid
  child = null

  if (process.platform === 'win32') {
    try {
      execSync(`taskkill /PID ${pid} /T /F`, { stdio: 'ignore' })
    } catch {
      // already gone
    }
  } else {
    try {
      process.kill(pid, 'SIGTERM')
    } catch {
      // already gone
    }
  }
}

function startServer() {
  stopServer()
  freePort(PORT)

  child = spawn(process.execPath, [entry], {
    stdio: 'inherit',
    cwd: rootDir,
  })
}

function scheduleRestart(filename) {
  clearTimeout(restartTimer)
  restartTimer = setTimeout(() => {
    const file = path.normalize(path.resolve(srcDir, filename))
    if (!/\.js$/i.test(file)) return
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      hashes.delete(file)
      return
    }

    const nextHash = hashFile(file)
    if (nextHash == null) return
    if (hashes.get(file) === nextHash) return

    hashes.set(file, nextHash)
    console.log(`코드 변경 감지: ${path.relative(rootDir, file)}`)
    startServer()
  }, 400)
}

refreshHashes()
startServer()

fs.watch(srcDir, { recursive: true }, (_event, filename) => {
  if (!filename) return
  scheduleRestart(filename)
})

process.on('SIGINT', () => {
  stopServer()
  process.exit(0)
})

process.on('SIGTERM', () => {
  stopServer()
  process.exit(0)
})
