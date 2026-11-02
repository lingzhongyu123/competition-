import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSandboxMindMap, renderSandboxMindMap } from '../src/sandbox-mindmap.js';
import { createArchiveSandbox } from '../src/mock-workspace.js';

test('mind map groups every copy by its case without inventing semantic relations', () => {
  const rows = createArchiveSandbox().rows(), map = buildSandboxMindMap(rows);
  assert.equal(map.total, 85);
  assert.equal(map.nodes.filter(n => n.kind === 'case').length, 7);
  assert.ok(map.edges.every(e => e.kind === 'group'));
  const ids = new Set(map.nodes.map(n => n.id));
  assert.ok(map.edges.every(e => ids.has(e.from) && ids.has(e.to)));
});

test('focused map only links selected memory to its real source references, and highlights mock changes and hits', () => {
  const sandbox = createArchiveSandbox(), first = sandbox.rows()[0];
  sandbox.update(first.key, 'MOCK value');
  const map = buildSandboxMindMap(sandbox.rows(), { caseId: first.caseId, selectedKey: first.key, hitKeys: [first.key] });
  const selected = map.nodes.find(n => n.kind === 'memory' && n.selected);
  assert.ok(selected.hit);
  assert.equal(selected.key, first.key);
  assert.equal(map.edges.filter(e => e.kind === 'source').length, first.sources.length);
  assert.ok(map.edges.filter(e => e.kind === 'source').every(e => e.to === selected.id));
  assert.ok(map.nodes.some(n => n.kind === 'update'));
  assert.ok(map.nodes.filter(n => n.kind === 'memory').every(n => n.key.startsWith(first.caseId + '/')));
});

test('pagination stays bounded, selected fallback matches visible nodes, and empty map is safe', () => {
  const rows = createArchiveSandbox().rows(), caseId = rows[0].caseId;
  const map = buildSandboxMindMap(rows, { caseId, page: 999, selectedKey: 'missing' });
  assert.equal(map.page, map.pages - 1);
  assert.ok(map.nodes.filter(n => n.kind === 'memory').length <= 8);
  assert.ok(map.nodes.find(n => n.key === map.selectedKey));
  assert.doesNotThrow(() => renderSandboxMindMap(buildSandboxMindMap([], { caseId })));
});

test('untrusted text is escaped in node titles and attributes', () => {
  const rows = createArchiveSandbox().rows().slice(0, 1);
  rows[0].label = '<img src=x onerror="bad()">';
  rows[0].summary = '</button><script>bad()</script>';
  const html = renderSandboxMindMap(buildSandboxMindMap(rows, { caseId: rows[0].caseId }));
  assert.doesNotMatch(html, /<img|<script|<\/button><script/);
  assert.match(html, /&lt;img/);
});
