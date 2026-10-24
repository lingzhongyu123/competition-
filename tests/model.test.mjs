import test from 'node:test';
import assert from 'node:assert/strict';
import { createMockProvider, filterMemories } from '../src/model.js';
import { publicTasks } from '../src/public-tasks.js';

test('early snapshot has no future facts, evidence, trace or replacement time',()=>{
  const snapshot=createMockProvider().getSnapshot(1);
  assert.equal(snapshot.memories.length,4);
  assert.equal(snapshot.traces.length,0);
  assert.deepEqual(snapshot.evidence.map(item=>item.id),['ev-d1']);
  assert.equal(snapshot.memories.find(memory=>memory.id==='mem-sort-v1').validTo,null);
  assert.equal(snapshot.memories.some(memory=>memory.id==='mem-sort-v2'),false);
  assert.ok(snapshot.events.every(event=>event.day<=1));
});
test('the explicit update replaces only the sort rule, with a half-open validity interval',()=>{
  const provider=createMockProvider();
  assert.equal(provider.getSnapshot(10).memories.find(memory=>memory.id==='mem-sort-v1').status,'active');
  const records=provider.getSnapshot(14).memories;
  assert.equal(records.find(memory=>memory.id==='mem-sort-v1').status,'superseded');
  assert.equal(records.find(memory=>memory.id==='mem-sort-v1').validTo,14);
  assert.equal(records.find(memory=>memory.id==='mem-sort-v2').status,'active');
  assert.equal(records.find(memory=>memory.id==='mem-date').status,'active');
  assert.equal(records.find(memory=>memory.id==='mem-scope').status,'active');
});
test('withdrawing at the present does not mutate prior snapshots or historical traces',()=>{
  const provider=createMockProvider();
  const before=provider.getSnapshot(10);
  const historicalTrace=provider.getSnapshot(14).traces;
  const event=provider.withdraw('mem-date',14);
  assert.equal(event.effects.storage,'not-performed');
  assert.deepEqual(provider.getSnapshot(10),before);
  assert.deepEqual(provider.getSnapshot(14).traces,historicalTrace);
  const records=provider.getSnapshot(14).memories;
  assert.equal(records.find(memory=>memory.id==='mem-date').status,'withdrawn');
  assert.equal(records.find(memory=>memory.id==='mem-sort-v2').status,'active');
});
test('withdrawal rejects historical, missing and inactive records, reset restores fixtures',()=>{
  const provider=createMockProvider();
  assert.throws(()=>provider.withdraw('mem-date',3),/历史快照只读/);
  assert.throws(()=>provider.withdraw('mem-sort-v1',14),/当前有效/);
  assert.throws(()=>provider.withdraw('unknown',14),/当前有效/);
  provider.withdraw('mem-date',14);
  assert.throws(()=>provider.withdraw('mem-date',14),/当前有效/);
  provider.reset();
  assert.equal(provider.getSnapshot(14).memories.find(memory=>memory.id==='mem-date').status,'active');
  assert.equal(provider.getSnapshot(14).withdrawals.length,0);
});
test('returned data is isolated from callers, filter combines text, kind and state',()=>{
  const provider=createMockProvider();const snapshot=provider.getSnapshot(14);
  snapshot.memories[0].title='mutated';snapshot.evidence[0].text='mutated';
  assert.notEqual(provider.getSnapshot(14).memories[0].title,'mutated');
  assert.notEqual(provider.getSnapshot(14).evidence[0].text,'mutated');
  const results=filterMemories(provider.getSnapshot(14),{query:'排序',kind:'preference',status:'active'});
  assert.deepEqual(results.map(memory=>memory.id),['mem-sort-v2']);
});
test('export retains mock provenance and public task cards contain no evaluator answers',()=>{
  const bundle=createMockProvider().exportSnapshot(14);
  assert.equal(bundle.snapshot.provenance,'mock');
  assert.ok(bundle.disclaimer.includes('合成'));
  assert.equal(publicTasks.length,5);
  assert.equal(publicTasks.filter(task=>task.infeasible).length,1);
  for(const task of publicTasks){
    assert.equal(task.executionStatus,'未执行');
    assert.equal(task.provenance,'public-definition');
    for(const field of ['answer','evaluator','config','expected','trajectory']) assert.equal(field in task,false);
  }
});
test('injected-but-unobserved case keeps its use and result unknown',()=>{
  const trace=createMockProvider().getSnapshot(10).traces.find(item=>item.id==='trace-d10');
  assert.ok(trace.injectedIds.includes('strategy-table'));
  assert.equal(trace.useRecorded,false);
  assert.deepEqual(trace.actions,[]);
});
