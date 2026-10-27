import test from 'node:test';
import assert from 'node:assert/strict';
import { getGuideFrame, getGuideTarget } from '../src/demo-guide.js';
import { evidence } from '../src/data.js';

test('explicit mock change updates the current rule only after the new instruction arrives', () => {
  const early = getGuideFrame(0);
  const incoming = getGuideFrame(1);
  const updated = getGuideFrame(2);
  assert.equal(early.value, '报名时间倒序');
  assert.ok(!early.quote.includes('成绩'));
  assert.equal(incoming.value, early.value);
  assert.match(incoming.quote, /改为按成绩从高到低排序/);
  assert.match(incoming.quote, /其他要求不变/);
  assert.equal(incoming.history, false);
  assert.equal(updated.value, '成绩从高到低');
  assert.equal(updated.history, true);
  assert.deepEqual(getGuideFrame(0), early);
});

test('home story retains existing MOCK evidence rather than rewriting public samples', () => {
  for (const step of [0, 1, 2]) {
    const frame = getGuideFrame(step);
    const source = evidence.find(item => item.id === frame.evidenceId);
    assert.equal(frame.provenance, 'mock');
    assert.equal(source.provenance, 'mock');
    assert.equal(frame.quote, source.text);
    assert.ok(frame.quote.includes(frame.translation));
  }
  assert.deepEqual(getGuideTarget('sorting'), {page:'manage',day:14});
  assert.equal(getGuideTarget('update').sample, '6a1eabeb');
});
