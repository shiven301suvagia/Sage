import { mkdir, cp, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

await mkdir('release', { recursive: true });
execFileSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build'], { stdio: 'inherit' });
await cp('dist', 'release/dist', { recursive: true });
await cp('package.json', 'release/package.json');
await writeFile('release/VERSION', `${JSON.parse(await (await import('node:fs/promises')).readFile('package.json', 'utf8')).version}\n`);
console.log('SAGE release bundle prepared in release/');
