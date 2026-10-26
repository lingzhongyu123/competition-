import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { Script } from 'node:vm';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const html = await readFile(resolve(here, '../../dist/memory-console.html'), 'utf8');
const source = await readFile(resolve(here, 'client-source.js'), 'utf8');
const js = `window.__ModuleLoader__.load({ id: 'memory-console-dsh', factory: (require) => {\nvar module = { exports: {} }; var exports = module.exports;\nconst CONSOLE_HTML = ${JSON.stringify(html)};\n${source}\nreturn module.exports; } });`;
new Script(js);
await mkdir(resolve(here, 'lib'), { recursive: true });
await writeFile(resolve(here, 'lib/client.js'), js);
await writeFile(resolve(here, 'lib/index.js'), 'export const inject = []; export function apply() {}\n');
console.log('Built DSH client companion with standalone Memory Console');
