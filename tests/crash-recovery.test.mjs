import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const main=await fs.readFile(path.join(process.cwd(),'app/main.mjs'),'utf8');

test('renderer recovery is wired for crashed and unresponsive renderers',()=>{
  assert.match(main,/render-process-gone/);
  assert.match(main,/unresponsive/);
  assert.match(main,/recoverWindow\(/);
});

test('renderer recovery does not recreate during application shutdown',()=>{
  assert.match(main,/if\(recovering\|\|app\.isQuitting\)return/);
  assert.match(main,/if\(details\?\.reason==='killed'&&app\.isQuitting\)return/);
});

test('recovery destroys the failed window before creating a replacement',()=>{
  assert.match(main,/win=null;try\{if\(old&&!old\.isDestroyed\(\)\)old\.destroy\(\);\}finally\{recovering=false;createWindow\(\);\}/);
});
