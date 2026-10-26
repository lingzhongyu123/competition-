import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { createSnapshotMock, parseSnapshotImport } from '../src/snapshot-import.js';
import { exportFromFile, exportFromExperienceMemory } from '../scripts/export-experience-snapshot.mjs';

async function temporary(run) {
  const directory = await mkdtemp(join(tmpdir(), 'console-snapshot-export-'));
  try { await run(directory); } finally { await rm(directory, { recursive: true, force: true }); }
}

test('selected file-store scope exports without changing source or its writer lease', async()=>temporary(async dir=>{
  const snapshot=createSnapshotMock();
  const store=join(dir,'store');await mkdir(store);
  const name=createHash('sha256').update(snapshot.scope).digest('hex')+'.json';
  const original=JSON.stringify(snapshot);
  await writeFile(join(store,name),original);await writeFile(join(store,'.writer.lock'),'synthetic lease');
  await writeFile(join(store,'other.json'),'unrelated data');
  const before=(await readdir(store)).sort();
  const output=join(dir,'export.json');
  const receipt=await exportFromFile({store,scope:snapshot.scope,output});
  const bytes=await readFile(output);
  assert.deepEqual(parseSnapshotImport(bytes.toString()).snapshot,snapshot);
  assert.equal(receipt.sha256,createHash('sha256').update(bytes).digest('hex'));
  assert.equal(receipt.sourceVerification,'not-verified-by-console');
  assert.equal(await readFile(join(store,name),'utf8'),original);
  assert.equal(await readFile(join(store,'.writer.lock'),'utf8'),'synthetic lease');
  assert.deepEqual((await readdir(store)).sort(),before);
}));

test('missing input, wrong scope and existing output fail without fabricating data',async()=>temporary(async dir=>{
  const snapshot=createSnapshotMock(), input=join(dir,'input.json'),output=join(dir,'output.json');
  await writeFile(input,JSON.stringify(snapshot));
  await assert.rejects(exportFromFile({input,scope:'other',output}),/scope/);
  await assert.rejects(exportFromFile({store:dir,scope:'missing',output}),/ENOENT/);
  assert.deepEqual((await readdir(dir)).sort(),['input.json']);
  await writeFile(output,'keep existing');
  await assert.rejects(exportFromFile({input,scope:snapshot.scope,output}),/EEXIST/);
  assert.equal(await readFile(output,'utf8'),'keep existing');
}));

test('host adapter calls only snapshot and preserves an empty host response',async()=>temporary(async dir=>{
  const scope='synthetic-empty',snapshot={schemaVersion:1,scope,episodes:[],skills:[],revisions:[],feedback:[]};
  let calls=0;
  const memory={snapshot:async requested=>{calls++;assert.equal(requested,scope);return snapshot;},maintain:()=>assert.fail('must not mutate')};
  await exportFromExperienceMemory(memory,{scope,output:join(dir,'empty.json')});
  assert.equal(calls,1);
  assert.deepEqual(JSON.parse(await readFile(join(dir,'empty.json'),'utf8')),snapshot);
}));
