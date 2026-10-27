import test from 'node:test';
import assert from 'node:assert/strict';
import { getMockReuseEvidence, renderMockStory } from '../src/mock-story.js';
import { renderOsworldStory } from '../src/osworld-story.js';

test('injection alone never implies adoption or a verified result', () => {
  for (let step = 0; step < 4; step++) {
    const e = getMockReuseEvidence(step, 'injected');
    assert.equal(e.adopted, false);
    assert.equal(e.checked, false);
    assert.equal(e.injected, step >= 2);
  }
  const html = renderMockStory('reuse', 3, 'injected');
  assert.match(html, /采用与结果均未知/);
  assert.doesNotMatch(html, /方案配图\.png.*sort-folder--right/);
});

test('adoption and checking require their own stage and evidence', () => {
  assert.equal(getMockReuseEvidence(3, 'adopted').checked, false);
  assert.match(renderMockStory('reuse', 3, 'adopted'), /缺少产物检查，结果未知/);
  assert.equal(getMockReuseEvidence(1, 'checked').adopted, false);
  assert.equal(getMockReuseEvidence(2, 'checked').adopted, true);
  assert.equal(getMockReuseEvidence(2, 'checked').checked, false);
  assert.equal(getMockReuseEvidence(3, 'checked').checked, true);
  assert.doesNotMatch(renderMockStory('reuse', 2, 'checked'), /方案配图\.png.*sort-folder--right/);
  assert.match(renderMockStory('reuse', 3, 'checked'), /不是 OSWorld evaluator 结果/);
});

test('rejected candidates have no injection, adoption or check at any stage', () => {
  for (let step = 0; step < 4; step++) {
    const e = getMockReuseEvidence(step, 'blocked');
    assert.equal(e.selected, false);
    assert.equal(e.injected, false);
    assert.equal(e.adopted, false);
    assert.equal(e.checked, false);
  }
  assert.match(renderMockStory('reuse', 3, 'blocked'), /未注入 → 未执行 → 无结果/);
});

test('public view excludes synthetic records; every mock stage has provenance', () => {
  assert.doesNotMatch(renderOsworldStory('reuse'), /mock-run-file-sort-next|mock-check-file-sort/);
  for (const story of ['formation', 'reuse']) for (let step = 0; step < 4; step++) {
    const html = renderMockStory(story, step, 'checked');
    assert.match(html, /MOCK · 人工预设演示/);
    assert.match(html, /没有执行 OSWorld/);
  }
  assert.equal(getMockReuseEvidence('invalid', 'invalid').stage, 0);
  assert.equal(getMockReuseEvidence(999, 'invalid').scenario, 'injected');
});


test('file sorting method carries to a separate batch without claiming an early result', () => {
  assert.match(renderMockStory('formation',1),/报告封面\.png/);
  assert.match(renderMockStory('formation',1),/sort-folder--wrong/);
  assert.match(renderMockStory('formation',2),/sort-folder--right/);
  assert.match(renderMockStory('formation',3),/先看文件类型，再决定放哪里/);
  assert.match(renderMockStory('formation',3),/data-story="reuse"/);
  const start=renderMockStory('reuse',0,'checked');
  assert.match(start,/方案配图\.png/);
  assert.doesNotMatch(start,/sort-folder--right|MOCK 已记录采用/);
  const final=renderMockStory('reuse',3,'checked');
  assert.match(final,/方案配图\.png/);
  assert.match(final,/sort-folder--right/);
  assert.doesNotMatch(final,/Invoice|透视表|mock-case-pivot/);
});
