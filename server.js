// Root entry file for hosting platforms (Hostinger, Render, cPanel, etc.)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const bundledServer = path.join(__dirname, 'dist', 'server.cjs');

if (!fs.existsSync(bundledServer)) {
  console.log('[Hostinger] dist/server.cjs not found. Triggering build...');
  const { execSync } = await import('child_process');
  execSync('npm run build', { stdio: 'inherit' });
}

await import('./dist/server.cjs');
