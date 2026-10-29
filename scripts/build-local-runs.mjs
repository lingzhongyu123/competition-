import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// The generated file contains research data and must remain in the ignored directory.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = process.argv[2];
if (!source) throw new Error('用法：node scripts/build-local-runs.mjs <完整导出目录>');
const directory = fs.realpathSync(source);
const payload = [];
let total = 0;
function read(relative) {
  const target = fs.realpathSync(path.join(directory, relative));
  const rel = path.relative(directory, target);
  if (rel.startsWith('..') || path.isAbsolute(rel)) throw new Error('输入文件越出导出目录');
  const size = fs.statSync(target).size;
  total += size;
  if (size > 12 * 1024 * 1024 || total > 100 * 1024 * 1024) throw new Error('导出包超出读取容量');
  const data = JSON.parse(fs.readFileSync(target, 'utf8'));
  payload.push([relative, data]);
  return data;
}
const cases = read('cases_index.json');
if (!Array.isArray(cases) || !cases.length || cases.length > 100 ||
    cases.some(c => !c || typeof c.qid !== 'string' || !/^[\w-]+$/.test(c.qid)) ||
    new Set(cases.map(c => c.qid)).size !== cases.length) throw new Error('案例目录无效');
for (const c of cases) {
  for (const name of ['qa_complete.json', 'l0_documents.json', 'l1_graph.json']) read(`cases/${c.qid}/${name}`);
  const optional = `cases/${c.qid}/profile_and_retrieval.json`;
  if (fs.existsSync(path.join(directory, optional))) read(optional);
}
const encoded = JSON.stringify(payload).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
let html = fs.readFileSync(path.join(root, 'longmemeval-runs.html'), 'utf8');
html = html.replace('LongMemEval · 本地读取 · 刷新即清空', '本机内嵌数据版 · 刷新重新载入 · 此文件含原始研究数据');
const loader = `<script>\n(async()=>{const entries=${encoded};const selected=entries.map(([name,data])=>{const f=new File([JSON.stringify(data)],name,{type:'application/json'});Object.defineProperty(f,'webkitRelativePath',{value:'export/'+name});return f});await $('#folder').onchange({target:{files:selected}});$('#clear').addEventListener('click',()=>{$('#status').textContent='已清空当前视图。数据仍在此本地 HTML 文件中，刷新会重新载入。'});})();\n</script>`;
html = html.replace('</html>', loader + '</html>');
const outputDir = path.join(root, '.local');
fs.mkdirSync(outputDir, { recursive: true });
const output = path.join(outputDir, 'LongMemEval-直接打开.html');
fs.writeFileSync(output, html);
console.log(`已生成本机页面，包含 ${cases.length} 个案例；请勿将含原始数据的产物提交到公开仓库。\n${output}`);
