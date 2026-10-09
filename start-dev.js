import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\x1b[1m\x1b[33m%s\x1b[0m', '═══════════════════════════════════════════════════');
console.log('\x1b[1m\x1b[33m%s\x1b[0m', '  🚀 Starting BRIVOO Luxury E-Commerce Platform');
console.log('\x1b[1m\x1b[33m%s\x1b[0m', '═══════════════════════════════════════════════════\n');

const backendDir = path.join(__dirname, 'backend');
const frontendDir = path.join(__dirname, 'frontend');

// Start Backend Process
const backend = spawn('node', ['--watch', 'server.js'], {
  cwd: backendDir,
  stdio: 'pipe',
  shell: true,
  env: process.env
});

backend.stdout.on('data', data => {
  process.stdout.write(`\x1b[36m[backend]\x1b[0m ${data}`);
});

backend.stderr.on('data', data => {
  process.stderr.write(`\x1b[31m[backend-err]\x1b[0m ${data}`);
});

// Start Frontend Process
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: frontendDir,
  stdio: 'pipe',
  shell: true,
  env: process.env
});

frontend.stdout.on('data', data => {
  process.stdout.write(`\x1b[32m[frontend]\x1b[0m ${data}`);
});

frontend.stderr.on('data', data => {
  process.stderr.write(`\x1b[31m[frontend-err]\x1b[0m ${data}`);
});

function cleanup() {
  console.log('\n\x1b[33mShutting down BRIVOO services...\x1b[0m');
  try { backend.kill(); } catch {}
  try { frontend.kill(); } catch {}
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
