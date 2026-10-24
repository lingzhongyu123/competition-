import { readFile, writeFile, mkdir } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const read = name => readFile(new URL(name, root), 'utf8');
await mkdir(new URL('dist/', root), { recursive: true });
// Local modules have no external dependencies. Produce a portable single-file artifact.
const modules = await Promise.all(['data.js','model.js','public-tasks.js','app.js'].map(name=>read('src/'+name)));
const js = modules.map(source=>source.replace(/^import .*;\n/gm,'').replace(/^export /gm,'')).join('\n');
if (/<\/script/i.test(js)) throw new Error('Script contains an unsafe HTML closing tag');
const html = (await read('index.html'))
  .replace('<link rel="stylesheet" href="./src/styles.css">','<style></style>');
const css = await read('src/styles.css');
const output = html.replace('<style></style>',()=>`<style>${css}</style>`)
  .replace('<script type="module" src="./src/app.js"></script>',()=>`<script>(()=>{${js}
})();</script>`);
await writeFile(new URL('dist/memory-console.html',root),output);
console.log('Built dist/memory-console.html (standalone; no external assets)');
