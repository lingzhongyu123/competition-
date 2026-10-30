import fs from 'node:fs';
import path from 'node:path';
import {gzipSync} from 'node:zlib';
const root=path.resolve(import.meta.dirname,'..');
const input=process.argv[2];
if(!input)throw Error('Provide the local export directory');
const read=p=>JSON.parse(fs.readFileSync(path.join(input,p),'utf8'));
const pick=(o,keys)=>Object.fromEntries(keys.filter(k=>o?.[k]!==undefined).map(k=>[k,o[k]]));
const evidence=o=>pick(o,['document','session','turn','dateText','kind','use']);
const node=o=>({...pick(o,['id','type','label','summary','confidence','origin','status']),evidence:(o.evidence??[]).map(evidence)});
const index=read('cases_index.json').map(o=>pick(o,['qid','question','type','abstention','l0Documents','l1Nodes','l1Edges','evidenceLinks','qaUnits','selectedForIllustrationNotRepresentativeSampling']));
if(!Array.isArray(index)||index.some(c=>!/^[\w-]+$/.test(c.qid)))throw Error('Invalid index');
const entries=[['cases_index.json',index]];
for(const c of index){
 const dir='cases/'+c.qid+'/';
 const qa=read(dir+'qa_complete.json').map(o=>({...pick(o,['cohort','qid','type','abstention','round','arm','label','hypothesis','context','profileNodes','queryL1']),reader:pick(o.reader,['usage','latency_ms']),judge:{label:o.label,response:o.judge_response,publicationNote:'公开副本仅含评分结果，不含评分请求或完整日志'}}));
 const l0=read(dir+'l0_documents.json').map(o=>pick(o,['id','document','sessionIndex','sessionId','turnIndex','turn','role','date','textOriginal','provenance']));
 const graph=read(dir+'l1_graph.json');if(graph.edges.length)throw Error('Review semantic edges before publishing');
 const raw=read(dir+'profile_and_retrieval.json'),retrieval={};
 for(const arm of ['A','B','C']){const r=raw[arm];retrieval[arm]={profile:r.profile?{nodes:r.profile.nodes.map(node)}:null,recall:{cues:r.recall.cues.map(o=>({...pick(o,['rank','kind','score','document','recordKind','text']),signals:(o.signals??[]).map(s=>pick(s,['kind','rank','value'])),evidence:(o.evidence??[]).map(evidence)}))},context:pick(r.context,['block','maxChars','chars','sections','profileLines','queryLines','profileDropped','queryDropped'])};}
 entries.push([dir+'qa_complete.json',qa],[dir+'l0_documents.json',l0],[dir+'l1_graph.json',{nodes:graph.nodes.map(node),edges:[]}],[dir+'profile_and_retrieval.json',retrieval]);
}
const serialized=JSON.stringify(entries);
// Refuse credential and local-path patterns; do not silently alter experiment evidence.
for(const pattern of [/\b(?:api)?sk-[A-Za-z0-9_-]{16,}/i,/Bearer\s+[A-Za-z0-9._-]{12,}/i,/[A-Z]:[\\/](?:Users|home|workspace)[\\/]/i,/(?:api_key|access_token|authorization)"\s*:/i])if(pattern.test(serialized))throw Error('Potential secret or local path: public export requires review');
const packed=gzipSync(serialized).toString('base64');
let html=fs.readFileSync(path.join(root,'longmemeval-runs.html'),'utf8');
html=html.replace('LongMemEval · 本地读取 · 刷新即清空','LongMemEval · 真实离线运行 · 公开展示副本');
html=html.replace('选择完整导出目录','可选：载入另一份本机档案');
html=html.replace('本地导入，来源未独立核验。','运行档案公开展示副本，来源未独立核验。完整请求及日志未公开。');
html=html.replace("detail('Reader 请求',u.reader?.request)","detail('Reader 请求',u.reader?.request??'公开副本未包含完整请求；实际记忆上下文保留在上一项')");
const loader=`<script>(async()=>{try{const bytes=Uint8Array.from(atob('${packed}'),c=>c.charCodeAt(0));const entries=JSON.parse(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text());const selected=entries.map(([name,data])=>{const f=new File([JSON.stringify(data)],name,{type:'application/json'});Object.defineProperty(f,'webkitRelativePath',{value:'public/'+name});return f});await $('#folder').onchange({target:{files:selected}});$('#clear').addEventListener('click',()=>{$('#status').textContent='视图已清空。刷新会重新载入公开展示副本。'});}catch(e){$('#status').textContent='公开数据加载失败：'+e.message;}})();</script>`;
html=html.replace('</html>',loader+'</html>');
fs.writeFileSync(path.join(root,'longmemeval-public.html'),html);
console.log(JSON.stringify({cases:index.length,bytes:Buffer.byteLength(html),nodes:index.reduce((n,c)=>n+c.l1Nodes,0),documents:index.reduce((n,c)=>n+c.l0Documents,0)}));
