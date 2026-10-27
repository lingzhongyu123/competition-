import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { Script } from 'node:vm';
const root = new URL('../', import.meta.url);
const read = name => readFile(new URL(name, root), 'utf8');
await mkdir(new URL('dist/', root), { recursive: true });
// Vendor the pinned animation runtime for offline, single-file delivery. Produce a portable single-file artifact.
const modules = await Promise.all(['data.js','model.js','public-tasks.js','source-browser.js','mock-story.js','osworld-story.js','snapshot-import.js','snapshot-view.js','demo-guide.js','app.js'].map(name=>read('src/'+name)));
const sourceJson = JSON.stringify(JSON.parse(await read('data/longmemeval/展示样本-原始会话.json'))).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
const js = `const sourceDataset = ${sourceJson};\n` + modules.map(source=>source.replace(/^import [^\r\n]*;\r?\n/gm,'').replace(/^export /gm,'')).join('\n');
if (/<\/script/i.test(js)) throw new Error('Script contains an unsafe HTML closing tag');
new Script(`(()=>{${js}\n})();`); // Reject broken standalone scripts before replacing the deliverables.
const html = (await read('index.html'))
  .replace('<link rel="stylesheet" href="./src/styles.css">','<style></style>')
  .replace(/^[ \t]*<link rel="stylesheet" href="\.\/src\/(?:sources|osworld|snapshot|guide)\.css">\r?\n/gm,'');
const css = await read('src/styles.css') + '\n' + await read('src/sources.css') + '\n' + await read('src/osworld.css') + '\n' + await read('src/snapshot.css') + '\n' + await read('src/guide.css');
const vendor = await read('src/vendor/gsap.min.js');
new Script(vendor);
if (/<\/script/i.test(vendor)) throw new Error('Unsafe vendor script');
const output = html.replace('<script src="./src/vendor/gsap.min.js"></script>', () => `<script>${vendor}</script>`).replace('<style></style>',()=>`<style>${css}</style>`)
  .replace('<script type="module" src="./src/app.js"></script>',()=>`<script>(()=>{${js}
})();</script>`);
await writeFile(new URL('dist/memory-console.html',root),output);
await writeFile(new URL('双击打开演示.html',root),output);
console.log('Built dist/memory-console.html (standalone; no external assets)');
