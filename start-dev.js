import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\x1b[1m\x1b[33m%s\x1b[0m', '═══════════════════════════════════════════════════');
console.log('\x1b[1m\x1b[33m%s\x1b[0m', '  ✨ Starting BRIVOO Luxury E-Commerce Platform');
console.log('\x1b[1m\x1b[33m%s\x1b[0m', '═══════════════════════════════════════════════════\n');

const backendDir = path.join(__dirname, 'backend');
const frontendDir = path.join(__dirname, 'frontend');

// Universal missing dependencies check
if (!fs.existsSync(path.join(backendDir, 'node_modules')) || !fs.existsSync(path.join(frontendDir, 'node_modules'))) {
  console.log('\x1b[33m[notice]\x1b[0m Missing dependencies detected.');
  console.log('\x1b[33m[notice]\x1b[0m Run: \x1b[1mnpm run install:all\x1b[0m to install all dependencies.\n');
}

// Cross-platform Node version feature check (Node >= 18.11 supports --watch)
const [major = 18, minor = 0] = (process.versions?.node || '').split('.').map(Number);
const supportsWatch = major > 18 || (major === 18 && minor >= 11);
const backendArgs = supportsWatch ? ['--watch', 'server.js'] : ['server.js'];

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

// Start Backend Process
const backend = spawn(process.execPath, backendArgs, {
  cwd: backendDir,
  stdio: 'pipe',
  shell: isWin,
  env: { ...process.env, PORT: process.env.PORT || '5005' }
});

backend.stdout?.on('data', data => {
  process.stdout.write(`\x1b[36m[backend]\x1b[0m ${data}`);
});

backend.stderr?.on('data', data => {
  process.stderr.write(`\x1b[31m[backend-err]\x1b[0m ${data}`);
});

// Start Frontend Process
const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: frontendDir,
  stdio: 'pipe',
  shell: isWin,
  env: process.env
});

frontend.stdout?.on('data', data => {
  process.stdout.write(`\x1b[32m[frontend]\x1b[0m ${data}`);
});

frontend.stderr?.on('data', data => {
  process.stderr.write(`\x1b[31m[frontend-err]\x1b[0m ${data}`);
});

// Universal cross-platform process tree killer
function killProcess(child) {
  if (!child || !child.pid) return;
  if (isWin) {
    try {
      spawn('taskkill', ['/pid', child.pid.toString(), '/T', '/F'], { stdio: 'ignore' });
    } catch {
      try { child.kill(); } catch {}
    }
  } else {
    try {
      child.kill('SIGTERM');
    } catch {
      try { child.kill(); } catch {}
    }
  }
}

let isCleaningUp = false;
function cleanup() {
  if (isCleaningUp) return;
  isCleaningUp = true;
  console.log('\n\x1b[33mShutting down BRIVOO services gracefully...\x1b[0m');
  killProcess(backend);
  killProcess(frontend);
  setTimeout(() => process.exit(0), 400);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
