import test from 'node:test';
import assert from 'node:assert/strict';
import { createArchiveSandbox } from '../src/mock-workspace.js';
import { runData } from '../src/run-data.js';

test('archive sandbox clones all 421 nodes without changing their sources or original status', () => {
  const before = JSON.stringify(runData), sandbox = createArchiveSandbox();
  assert.equal(sandbox.rows().length, 421);
  const record = sandbox.rows()[0];
  sandbox.update(record.key, '<script>MOCK replacement</script>');
  assert.equal(sandbox.rows()[0].version, 2);
  assert.equal(sandbox.rows()[0].originalSummary, record.summary);
  assert.deepEqual(sandbox.rows()[0].sources, record.sources);
  assert.equal(JSON.stringify(runData), before);
  assert.equal(sandbox.events()[0].provenance, 'mock');
});

test('keyword search uses current copy and selected case, excludes withdrawn nodes, and reset restores', () => {
  const sandbox = createArchiveSandbox(), first = sandbox.rows()[0];
  sandbox.update(first.key, 'unique-mock-token-20261102');
  assert.deepEqual(sandbox.search('unique-mock-token-20261102', first.caseId).map(n => n.key), [first.key]);
  assert.equal(sandbox.search('unique-mock-token-20261102', 'missing-case').length, 0);
  sandbox.withdraw(first.key);
  assert.equal(sandbox.search('unique-mock-token-20261102').length, 0);
  assert.equal(sandbox.events().at(-1).provenance, 'mock');
  sandbox.reset();
  assert.equal(sandbox.rows()[0].summary, first.summary);
  assert.equal(sandbox.rows()[0].version, 1);
  assert.equal(sandbox.events().length, 0);
});

test('invalid changes fail without events; returned copies cannot mutate sandbox', () => {
  const sandbox = createArchiveSandbox(), row = sandbox.rows()[0];
  assert.throws(() => sandbox.update(row.key, row.summary));
  assert.throws(() => sandbox.update(row.key, ' '));
  assert.throws(() => sandbox.update('missing', 'new'));
  assert.throws(() => sandbox.search(' '));
  assert.equal(sandbox.events().length, 0);
  row.sources.length = 0;
  assert.ok(sandbox.rows()[0].sources.length > 0);
});
