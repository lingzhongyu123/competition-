import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getSourceView, renderSourceBrowser } from '../src/source-browser.js';

const data = JSON.parse(readFileSync(new URL('../data/longmemeval/展示样本-原始会话.json', import.meta.url), 'utf8'));

test('public source anchors point to original user messages; no evaluation fields are included', () => {
  assert.equal(data.cases.length, 4);
  assert.equal(data.cases.reduce((count, sample) => count + sample.sessions.length, 0), 7);
  for (const sample of data.cases) {
    for (const [si, ti] of sample.anchors) {
      assert.equal(sample.sessions[si].turns[ti].role, 'user');
      assert.equal(sample.sessions[si].turns[ti].index, ti);
      assert.ok(sample.sessions[si].turns[ti].content.length);
    }
  }
  function check(value) {
    if (value && typeof value === 'object') for (const [key, child] of Object.entries(value)) {
      assert.ok(!['answer', 'answer_session_ids', 'has_answer'].includes(key), key);
      check(child);
    }
  }
  check(data);
});

test('earlier update view excludes the later value, session and source text', () => {
  const early = getSourceView('6a1eabeb', 0);
  assert.equal(early.visibleSessions.length, 1);
  const html = renderSourceBrowser('6a1eabeb', 0);
  assert.match(html, /27:12/);
  assert.doesNotMatch(html, /25:50|answer_a25d4a91_2|hoping to beat my personal best/);
  const latest = renderSourceBrowser('6a1eabeb', 1);
  assert.match(latest, /25:50/);
  assert.match(latest, /27:12/);
  assert.match(latest, /保留的历史陈述/);
});

test('every public sample keeps explicit source and unobserved-system status', () => {
  for (const sample of data.cases) {
    const html = renderSourceBrowser(sample.id, 1);
    assert.match(html, /人工整理的记忆候选/);
    assert.match(html, /检索与执行/);
    assert.match(html, /未采集/);
    assert.match(html, /评测尚未运行/);
    assert.doesNotMatch(html, /mock-run|mem-sort|MOCK 产物检查通过/);
    for (const [si, ti] of sample.anchors) assert.ok(html.includes(`id="source-turn-${sample.id}-${si}-${ti}"`));
  }
});

test('invalid routes fall back safely and sample search has an honest empty state', () => {
  assert.equal(getSourceView('<invalid>', 'nope').sample.id, 'e47becba');
  assert.equal(getSourceView('6a1eabeb', 'nope').phase, 1);
  const html = renderSourceBrowser('e47becba', 1, '不存在的样本');
  assert.match(html, /没有匹配的样本/);
  assert.doesNotMatch(html, /source-record-title/);
});
