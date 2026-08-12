const { spawn, execSync } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * 내용 해시로 변경을 감지한다.
 * - 코드가 같으면 Ctrl+S 해도 재시작하지 않음
 * - 시작/재시작 전 포트 5000 을 점유한 프로세스를 정리해 EADDRINUSE 방지
 */
const rootDir = path.join(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const entry = path.join(srcDir, 'index.js');

require('dotenv').config({ path: path.join(rootDir, '.env') });
const PORT = Number(process.env.PORT) || 5000;

const hashes = new Map();
let child = null;
let restartTimer = null;

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walk(full, files);
    } else if (/\.(js|json)$/i.test(name)) {
      files.push(full);
    }
  }
  return files;
}

function hashFile(file) {
  try {
    return crypto.createHash('md5').update(fs.readFileSync(file)).digest('hex');
  } catch {
    return null;
  }
}

function refreshHashes() {
  hashes.clear();
  for (const file of walk(srcDir)) {
    hashes.set(path.normalize(file), hashFile(file));
  }
}

/** Windows: 해당 포트를 LISTENING 중인 PID 강제 종료 */
function freePort(port) {
  if (process.platform !== 'win32') return;

  let output = '';
  try {
    output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
  } catch {
    return;
  }

  const pids = new Set();
  for (const line of output.split(/\r?\n/)) {
    if (!/LISTENING/i.test(line)) continue;
    const parts = line.trim().split(/\s+/);
    const pid = parts[parts.length - 1];
    if (/^\d+$/.test(pid) && pid !== '0' && Number(pid) !== process.pid) {
      pids.add(pid);
    }
  }

  for (const pid of pids) {
    try {
      execSync(`taskkill /PID ${pid} /T /F`, { stdio: 'ignore' });
      console.log(`[dev-watch] freed port ${port} (killed PID ${pid})`);
    } catch {
      // already gone
    }
  }
}

function stopServer() {
  if (!child || !child.pid) {
    child = null;
    return;
  }

  const pid = child.pid;
  child = null;

  if (process.platform === 'win32') {
    try {
      execSync(`taskkill /PID ${pid} /T /F`, { stdio: 'ignore' });
    } catch {
      // already gone
    }
  } else {
    try {
      process.kill(pid, 'SIGTERM');
    } catch {
      // already gone
    }
  }
}

function startServer() {
  stopServer();
  freePort(PORT);

  child = spawn(process.execPath, [entry], {
    stdio: 'inherit',
    cwd: rootDir,
    env: { ...process.env, NODE_ENV: 'development' },
  });

  child.on('exit', (code, signal) => {
    if (signal) return;
    if (code && code !== 0) {
      console.log(`[dev-watch] server exited with code ${code}`);
    }
  });

  console.log(`[dev-watch] server starting on port ${PORT}`);
}

function scheduleRestart(filename) {
  clearTimeout(restartTimer);
  restartTimer = setTimeout(() => {
    const file = path.normalize(path.resolve(srcDir, filename));
    if (!/\.(js|json)$/i.test(file)) return;
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      hashes.delete(file);
      return;
    }

    const nextHash = hashFile(file);
    if (nextHash == null) return;

    if (hashes.get(file) === nextHash) {
      console.log(
        `[dev-watch] skip (no content change): ${path.relative(rootDir, file)}`
      );
      return;
    }

    hashes.set(file, nextHash);
    console.log(
      `[dev-watch] restart — changed: ${path.relative(rootDir, file)}`
    );
    startServer();
  }, 400);
}

refreshHashes();
startServer();

fs.watch(srcDir, { recursive: true }, (_event, filename) => {
  if (!filename) return;
  scheduleRestart(filename);
});

process.on('SIGINT', () => {
  stopServer();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopServer();
  process.exit(0);
});

console.log('[dev-watch] content-hash mode — identical Ctrl+S will NOT restart');
console.log('[dev-watch] watching src/');
