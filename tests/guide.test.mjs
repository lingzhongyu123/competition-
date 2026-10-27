import test from 'node:test';
import assert from 'node:assert/strict';
import { getGuideFrame, getGuideTarget } from '../src/demo-guide.js';
import { evidence } from '../src/data.js';

test('one activity has four chapters and later memory does not leak into earlier stages', () => {
  for(let i=0;i<8;i++) {
    const frame=getGuideFrame(i);
    assert.equal(frame.chapter,Math.floor(i/2));
    assert.equal(frame.provenance,'mock');
    assert.equal(frame.experience,i>=5);
    assert.equal(frame.recalled,i>=6);
    assert.equal(frame.adopted,i===7);
  }
  assert.equal(getGuideFrame(0).remembered,true);
  assert.equal(getGuideFrame(1).remembered,true);
  assert.equal(getGuideFrame(2).rule,'时间倒序');
  assert.equal(getGuideFrame(3).rule,'成绩从高到低');
  assert.equal(getGuideFrame(2).history,false);
  assert.equal(getGuideFrame(3).history,true);
});

test('source instructions remain the existing MOCK messages and public cases stay separate', () => {
  for(const i of [0,1,2,3,6,7]) {
    const frame=getGuideFrame(i),source=evidence.find(item=>item.id===frame.wordingId);
    assert.equal(frame.quote,source.text);
    assert.equal(source.provenance,'mock');
  }
  assert.deepEqual(getGuideTarget('sorting'),{page:'manage',day:14});
  assert.equal(getGuideTarget('update').sample,'6a1eabeb');
});

test('the same sheet shows time sorting, a text-sort failure, numeric correction and reuse', () => {
  assert.deepEqual(getGuideFrame(1).rows.map(r=>r.id),['B','C','A']);
  assert.deepEqual(getGuideFrame(4).rows.map(r=>r.score),['9','85',100]);
  assert.equal(getGuideFrame(4).wrong,true);
  assert.equal(getGuideFrame(4).checked,false);
  assert.deepEqual(getGuideFrame(5).rows.map(r=>Number(r.score)),[100,85,9]);
  assert.equal(getGuideFrame(5).checked,true);
  assert.equal(getGuideFrame(6).adopted,false);
  assert.equal(getGuideFrame(6).checked,false);
  assert.deepEqual(getGuideFrame(7).rows.map(r=>Number(r.score)),[110,95,12]);
  assert.equal(getGuideFrame(7).checked,true);
});

test('rewinding restores the earlier batch and callers cannot mutate the story fixtures', () => {
  const before=getGuideFrame(0);
  getGuideFrame(7).rows[0].score=-999;
  const changed=getGuideFrame(3);changed.rows[0].score=-999;
  assert.deepEqual(getGuideFrame(0),before);
  assert.equal(getGuideFrame(-100).step,0);
  assert.equal(getGuideFrame(100).step,7);
});
