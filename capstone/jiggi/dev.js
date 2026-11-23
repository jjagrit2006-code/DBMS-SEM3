const { spawn } = require('child_process');

console.log('\x1b[36m%s\x1b[0m', '>>> Starting Vortex Lounge (Backend Server + Frontend Client)...');

const isWindows = process.platform === 'win32';

const server = spawn('node', ['server/src/index.js'], { stdio: 'inherit', env: process.env });
const client = spawn('npm', ['run', 'dev', '--prefix', 'client'], { stdio: 'inherit', shell: isWindows, env: process.env });

server.on('error', (err) => console.error('[Server Spawn Error]:', err));
client.on('error', (err) => console.error('[Client Spawn Error]:', err));

function cleanup() {
  console.log('\n\x1b[33m%s\x1b[0m', '>>> Shutting down Vortex Lounge processes...');
  try { server.kill(); } catch (e) {}
  try { client.kill(); } catch (e) {}
}

process.on('SIGINT', () => { cleanup(); process.exit(0); });
process.on('SIGTERM', () => { cleanup(); process.exit(0); });

