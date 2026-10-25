import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSnapshotImport, createSnapshotMock, createSnapshotSession, snapshotImportLimit } from '../src/snapshot-import.js';
import { renderSnapshotImport } from '../src/snapshot-view.js';
const parse=value=>parseSnapshotImport(JSON.stringify(value));

test('snapshot v1 preserves outcome, source and lifecycle claims without reclassification',()=>{
  const value=createSnapshotMock();value.episodes[0].outcome={status:'success',source:'model',reason:'模型声明',evidence:[]};value.skills[0].status='retracted';
  const result=parse(value);assert.deepEqual(result.snapshot,value);assert.deepEqual(result.warnings,[]);
  const session=createSnapshotSession();session.importText(JSON.stringify(value));session.state.kind='episodes';
  const html=renderSnapshotImport(session.state);assert.match(html,/本地导入 · 来源未核验/);assert.match(html,/文件声明的结果/);assert.match(html,/Console 未核验/);assert.match(html,/model/);assert.doesNotMatch(html,/MOCK · 自建字段示例/);
});
test('invalid shape, scope, identifiers and revision identity are rejected',()=>{
  for(const change of [v=>v.schemaVersion=2,v=>v.episodes=null,v=>v.skills[0].scope='other',v=>v.skills.push(v.skills[0]),v=>v.episodes[0].steps[0].observation=42,v=>v.skills[0].confidence=1.1,v=>v.revisions[0].version=2,v=>v.episodes[0].completedAt=0,v=>delete v.feedback]){
    const value=createSnapshotMock();change(value);assert.throws(()=>parse(value));
  }
  assert.throws(()=>parseSnapshotImport('{no json}'),/无法解析/);
  assert.throws(()=>parseSnapshotImport('{"__proto__":{}}'),/不支持的属性/);
});
test('missing sources remain explicit and tool-evidence is not certified by importer',()=>{
  const value=createSnapshotMock();value.skills[0].episodeIds=['redacted-id'];value.episodes[0].outcome.source='tool-evidence';
  const result=parse(value);assert.ok(result.warnings.some(x=>x.includes('未包含')));assert.ok(result.warnings.some(x=>x.includes('assessment')));
  const session=createSnapshotSession();session.importText(JSON.stringify(value));assert.match(renderSnapshotImport(session.state),/redacted-id · 来源缺失/);
});
test('empty snapshots are allowed; size and nested-data bounds are enforced',()=>{
  const empty={schemaVersion:1,scope:'empty',episodes:[],skills:[],revisions:[],feedback:[]};assert.deepEqual(parse(empty).snapshot,empty);
  assert.throws(()=>parseSnapshotImport(' '.repeat(snapshotImportLimit+1)),/5 MiB/);
  assert.throws(()=>parse({...empty,extra:'x'.repeat(50001)}),/50000/);
  let nested={};for(let i=0;i<25;i++)nested={nested};assert.throws(()=>parse({...empty,extra:nested}),/层级/);
});
test('untrusted text is escaped in titles, attributes and evidence without creating HTML',()=>{
  const value=createSnapshotMock();value.skills[0].title='<img src=x onerror=alert(1)>';value.scope='scope';value.skills[0].scope='scope';value.episodes[0].scope='scope';value.revisions[0].skill.scope='scope';
  const session=createSnapshotSession();session.importText(JSON.stringify(value),'file"><img src=x>');
  const html=renderSnapshotImport(session.state);assert.doesNotMatch(html,/<img/);assert.match(html,/&lt;img/);
});
test('invalid import clears old data and never falls back to mock',()=>{
  const session=createSnapshotSession();session.importText(JSON.stringify(createSnapshotMock()),'MOCK','mock');assert.equal(session.state.mode,'mock');
  session.importText('{}');assert.equal(session.state.data,null);assert.equal(session.state.status,'error');assert.equal(session.state.mode,'imported');assert.match(renderSnapshotImport(session.state),/不会回退为 MOCK/);
});
test('assessment quotes, recalled versions and feedback attribution stay separate',()=>{
  const v=createSnapshotMock(),e=v.episodes[0];
  e.recalledSkills=[{id:v.skills[0].id,version:1}];
  e.outcome.assessment={id:'mock-assessment',assessor:'MOCK',confidence:0.2,observedAt:e.completedAt,requirementsComplete:false,criteria:[{requirement:'MOCK requirement',status:'unknown',evidence:[{eventId:'missing-event',quote:'  <check>\n  exact whitespace  '}]}]};
  v.feedback=[{id:'mock-feedback',skillId:v.skills[0].id,episodeId:e.id,verdict:'irrelevant',reason:'MOCK 未确认采用',createdAt:e.completedAt,attribution:{skillVersion:1,assessmentId:'mock-assessment',actionEvidence:[],verificationEvidence:[]}}];
  const session=createSnapshotSession();session.importText(JSON.stringify(v));session.state.kind='episodes';
  assert.match(renderSnapshotImport(session.state),/召回记录（不等于注入或采用）/);
  assert.match(renderSnapshotImport(session.state),/  &lt;check&gt;\n  exact whitespace  /);
  session.state.kind='feedback';assert.match(renderSnapshotImport(session.state),/未独立确认/);
  assert.match(renderSnapshotImport(session.state),/irrelevant/);
});
test('clearing or importing again prevents stale asynchronous file reads from replacing data',async()=>{
  const session=createSnapshotSession();let finish;const read=session.importFile({name:'old.json',size:100,text:()=>new Promise(resolve=>finish=resolve)});
  session.clear();finish(JSON.stringify(createSnapshotMock()));await read;assert.equal(session.state.status,'empty');assert.equal(session.state.data,null);
  let finishSecond;const second=session.importFile({name:'older.json',size:100,text:()=>new Promise(resolve=>finishSecond=resolve)});
  session.importText(JSON.stringify({schemaVersion:1,scope:'new',episodes:[],skills:[],revisions:[],feedback:[]}));finishSecond(JSON.stringify(createSnapshotMock()));await second;
  assert.equal(session.state.data.snapshot.scope,'new');assert.equal(session.state.mode,'imported');
});
