import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
const html=fs.readFileSync(new URL('../longmemeval-public.html',import.meta.url),'utf8');
const entries=JSON.parse(gunzipSync(Buffer.from(html.match(/atob\('([A-Za-z0-9+/=]+)'\)/)[1],'base64')));
const files=new Map(entries),index=files.get('cases_index.json');
test('published archive retains all selected cases, QA and evidence references',()=>{
 let nodes=0,qa=0,docs=0;
 assert.equal(index.length,7);
 for(const c of index){const dir='cases/'+c.qid+'/';const g=files.get(dir+'l1_graph.json'),d=files.get(dir+'l0_documents.json'),q=files.get(dir+'qa_complete.json');nodes+=g.nodes.length;docs+=d.length;qa+=q.length;assert.equal(g.edges.length,0);assert.equal(d.length,c.l0Documents);assert.equal(g.nodes.length,c.l1Nodes);assert.equal(q.length,c.qaUnits);for(const n of g.nodes)for(const e of n.evidence)assert.equal(d.filter(x=>x.document===e.document).length,1);assert.equal(new Set(q.map(x=>x.arm+'/'+x.round)).size,9);}
 assert.deepEqual({nodes,qa,docs},{nodes:85,qa:63,docs:3430});
});
test('public copy excludes complete requests, raw calls and source manifests',()=>{
 for(const [name,value] of entries){if(!name.endsWith('qa_complete.json'))continue;for(const q of value){assert.equal(q.calls,undefined);assert.equal(q.manifest,undefined);assert.equal(q.reader.request,undefined);assert.equal(q.judge.request,undefined);assert.ok([true,false].includes(q.label));}}
 const serialized=JSON.stringify(entries);assert.doesNotMatch(serialized,/\b(?:api)?sk-[A-Za-z0-9_-]{16,}|Bearer\s+[A-Za-z0-9._-]{12,}|[A-Z]:[\\/](?:Users|home|workspace)[\\/]/i);
});
