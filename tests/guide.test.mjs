import test from 'node:test';
import assert from 'node:assert/strict';
import { getGuideFrame } from '../src/demo-guide.js';

test('home replay keeps later statements and history out of the earlier stage', () => {
  const early = getGuideFrame(0);
  assert.equal(early.value, '27:12');
  assert.equal(early.history, false);
  assert.ok(!early.quote.includes('25:50'));
  const incoming = getGuideFrame(1);
  assert.equal(incoming.value, '27:12');
  assert.ok(incoming.quote.includes('25:50'));
  assert.equal(incoming.history, false);
  const updated = getGuideFrame(2);
  assert.equal(updated.value, '25:50');
  assert.equal(updated.history, true);
  assert.deepEqual(getGuideFrame(0), early);
});
