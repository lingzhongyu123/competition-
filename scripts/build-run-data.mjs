import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
const root=new URL('../',import.meta.url);
const html=fs.readFileSync(new URL('longmemeval-public.html',root),'utf8');
const files=new Map(JSON.parse(gunzipSync(Buffer.from(html.match(/atob\('([^']+)'\)/)[1],'base64'))));
const data=files.get('cases_index.json').map(c=>{const p='cases/'+c.qid+'/';const docs=files.get(p+'l0_documents.json');return {...c,nodes:files.get(p+'l1_graph.json').nodes.map(n=>({...n,sources:n.evidence.map(e=>{const matches=docs.filter(d=>d.document===e.document);if(matches.length!==1)throw Error('Unresolved evidence');return matches[0]})})),qa:files.get(p+'qa_complete.json').map(q=>({arm:q.arm,round:q.round,label:q.label,hypothesis:q.hypothesis,queryL1:q.queryL1,profileNodes:q.profileNodes}))}});
fs.writeFileSync(new URL('src/run-data.js',root),'export const runData = '+JSON.stringify(data).replace(/</g,'\\u003c')+';\n');
console.log('Generated native workspace data from public archive');
