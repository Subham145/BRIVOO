import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDir = process.argv[2];
const scriptName = process.argv[3] || 'dev';

if (!targetDir) {
  console.error('Usage: node run.js <backend|frontend> <script>');
  process.exit(1);
}

const cwd = path.resolve(__dirname, targetDir);
const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

const args = scriptName === 'install' ? ['install'] : ['run', scriptName];

const res = spawnSync(npmCmd, args, {
  cwd,
  stdio: 'inherit',
  shell: isWin
});

process.exit(res.status ?? 0);
